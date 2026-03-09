import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { path, secret } = await request.json()

    // Simple secret check
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
    }

    revalidatePath(path || '/')
    return NextResponse.json({ revalidated: true })
  } catch {
    return NextResponse.json({ error: 'Error revalidating' }, { status: 500 })
  }
}
