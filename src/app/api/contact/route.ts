import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase/admin'

// Simple in-memory rate limit: 5 requests per IP per hour (per lambda instance)
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    const now = Date.now()
    // Opportunistic cleanup of expired entries
    for (const [key, entry] of rateLimitMap) {
      if (entry.resetAt < now) rateLimitMap.delete(key)
    }
    const existing = rateLimitMap.get(ip)
    if (existing && existing.resetAt > now) {
      if (existing.count >= RATE_LIMIT_MAX) {
        const retryAfter = Math.ceil((existing.resetAt - now) / 1000)
        return NextResponse.json(
          { error: 'Too many requests' },
          { status: 429, headers: { 'Retry-After': String(retryAfter) } }
        )
      }
      existing.count += 1
    } else {
      rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    }

    const body = await request.json()
    const { subject, company, name, phone, email, country, message, gdprConsent } = body

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const submission = {
      subject: subject ?? '',
      company: company ?? '',
      name,
      phone: phone ?? '',
      email,
      country: country ?? '',
      message,
      gdprConsent: !!gdprConsent,
      status: 'new',
      createdAt: new Date().toISOString(),
      ip,
    }

    // Save to Firestore — visible in admin CMS
    try {
      const adminDb = getAdminDb()
      await adminDb.collection('contact_submissions').add(submission)
    } catch (dbError) {
      // If admin SDK not configured (no service account), log and continue
      console.error('Firestore save failed (service account not configured):', dbError)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
