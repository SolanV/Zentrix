import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createR2PresignedUrl } from '@/lib/storage/r2'

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
    const key = typeof body.key === 'string' ? body.key : ''
    const expiresIn = typeof body.expiresIn === 'number' ? body.expiresIn : 300

    if (!key.startsWith(`${user.id}/`)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      downloadUrl: createR2PresignedUrl({
        key,
        method: 'GET',
        expiresIn,
      }),
      expiresIn,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to create download URL'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
