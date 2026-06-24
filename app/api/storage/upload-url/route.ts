import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createR2PresignedUrl,
  createStorageKey,
  getR2PublicUrl,
} from '@/lib/storage/r2'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const filename = typeof body.filename === 'string' ? body.filename : 'file'
    const contentType =
      typeof body.contentType === 'string'
        ? body.contentType
        : 'application/octet-stream'
    const folder = typeof body.folder === 'string' ? body.folder : 'uploads'
    const key = createStorageKey(filename, `${user.id}/${folder}`)
    const expiresIn = 300

    return NextResponse.json({
      key,
      uploadUrl: createR2PresignedUrl({ key, method: 'PUT', expiresIn }),
      publicUrl: getR2PublicUrl(key),
      expiresIn,
      headers: {
        'Content-Type': contentType,
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to create upload URL'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
