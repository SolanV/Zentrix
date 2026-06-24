import { createHash, createHmac, randomUUID } from 'crypto'

type PresignedUrlMethod = 'GET' | 'PUT' | 'DELETE'

interface R2Config {
  accessKeyId: string
  accountId: string
  bucket: string
  endpoint: string
  publicUrl: string | null
  secretAccessKey: string
}

interface PresignedUrlOptions {
  key: string
  method: PresignedUrlMethod
  expiresIn?: number
}

const REGION = 'auto'
const SERVICE = 's3'
const DEFAULT_EXPIRES_IN = 300

function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function getR2Config(): R2Config {
  const accountId = getRequiredEnv('CLOUDFLARE_R2_ACCOUNT_ID')

  return {
    accountId,
    accessKeyId: getRequiredEnv('CLOUDFLARE_R2_ACCESS_KEY_ID'),
    secretAccessKey: getRequiredEnv('CLOUDFLARE_R2_SECRET_ACCESS_KEY'),
    bucket: getRequiredEnv('CLOUDFLARE_R2_BUCKET'),
    endpoint:
      process.env.CLOUDFLARE_R2_ENDPOINT ||
      `https://${accountId}.r2.cloudflarestorage.com`,
    publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL || null,
  }
}

function formatAmzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, '')
}

function formatDateStamp(date: Date) {
  return formatAmzDate(date).slice(0, 8)
}

function hmac(key: Buffer | string, value: string) {
  return createHmac('sha256', key).update(value).digest()
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function encodeRfc3986(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) =>
    `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  )
}

function encodePath(path: string) {
  return path.split('/').map(encodeRfc3986).join('/')
}

function toCanonicalQuery(params: Record<string, string>) {
  return Object.keys(params)
    .sort()
    .map((key) => `${encodeRfc3986(key)}=${encodeRfc3986(params[key])}`)
    .join('&')
}

function getSigningKey(secretAccessKey: string, dateStamp: string) {
  const dateKey = hmac(`AWS4${secretAccessKey}`, dateStamp)
  const regionKey = hmac(dateKey, REGION)
  const serviceKey = hmac(regionKey, SERVICE)

  return hmac(serviceKey, 'aws4_request')
}

export function createStorageKey(filename: string, prefix = 'uploads') {
  const safePrefix = prefix
    .split('/')
    .map((part) => part.trim().replace(/[^a-zA-Z0-9._-]/g, '-'))
    .filter(Boolean)
    .join('/')
  const safeName = filename.trim().replace(/[^a-zA-Z0-9._-]/g, '-')
  const keyParts = [safePrefix || 'uploads', randomUUID(), safeName || 'file']

  return keyParts.join('/')
}

export function getR2PublicUrl(key: string) {
  const { publicUrl } = getR2Config()

  if (!publicUrl) {
    return null
  }

  return `${publicUrl.replace(/\/$/, '')}/${encodePath(key)}`
}

export function createR2PresignedUrl({
  key,
  method,
  expiresIn = DEFAULT_EXPIRES_IN,
}: PresignedUrlOptions) {
  if (!key || key.startsWith('/')) {
    throw new Error('R2 object key must be a relative path')
  }

  const config = getR2Config()
  const now = new Date()
  const amzDate = formatAmzDate(now)
  const dateStamp = formatDateStamp(now)
  const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`
  const signedHeaders = 'host'
  const endpoint = new URL(config.endpoint)
  const canonicalUri = `/${encodeRfc3986(config.bucket)}/${encodePath(key)}`
  const queryParams = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${config.accessKeyId}/${credentialScope}`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': String(expiresIn),
    'X-Amz-SignedHeaders': signedHeaders,
  }
  const canonicalQuery = toCanonicalQuery(queryParams)
  const canonicalHeaders = `host:${endpoint.host}\n`
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD',
  ].join('\n')
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    sha256(canonicalRequest),
  ].join('\n')
  const signingKey = getSigningKey(config.secretAccessKey, dateStamp)
  const signature = createHmac('sha256', signingKey)
    .update(stringToSign)
    .digest('hex')

  return `${endpoint.origin}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`
}
