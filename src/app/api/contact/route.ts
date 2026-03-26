import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function getAdminDb() {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  }
  return getFirestore()
}

export async function POST(request: NextRequest) {
  try {
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
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
    }

    // Save to Firestore — visible in admin CMS
    try {
      const adminDb = getAdminDb()
      await adminDb.collection('contact_submissions').add(submission)
    } catch (dbError) {
      // If admin SDK not configured (no service account), log and continue
      console.error('Firestore save failed (service account not configured):', dbError)
      console.log('Contact submission received:', submission)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
