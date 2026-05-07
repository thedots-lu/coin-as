import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Layered with robots.ts: any AI crawler that ignores robots.txt but
// honours the noai / noimageai meta directives still gets a clear
// machine-readable opt-out via this response header.
function applyAiOptOutHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Robots-Tag', 'noai, noimageai')
  return response
}

export function proxy(request: NextRequest) {
  // Set default locale cookie if not present
  const locale = request.cookies.get('locale')?.value
  if (!locale) {
    const response = NextResponse.next()
    response.cookies.set('locale', 'en', {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
    })
    return applyAiOptOutHeaders(response)
  }

  // Admin paths (except login) - let client-side handle auth
  // No server-side auth check needed since we use Firebase client SDK

  return applyAiOptOutHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
}
