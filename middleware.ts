import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/session'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  if (!session) return NextResponse.next()

  // Refresh the cookie on every request to reset the idle timer
  const response = NextResponse.next()
  response.cookies.set('session', '1', SESSION_COOKIE)
  return response
}

export const config = {
  matcher: ['/home/:path*'],
}
