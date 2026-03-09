import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Set default locale cookie if not present
  const locale = request.cookies.get('locale')?.value
  if (!locale) {
    const response = NextResponse.next()
    response.cookies.set('locale', 'en', {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
    })
    return response
  }

  // Admin paths (except login) - let client-side handle auth
  // No server-side auth check needed since we use Firebase client SDK

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
}
