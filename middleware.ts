import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin routes - require ADMIN role
  if (pathname.startsWith('/admin')) {
    // TODO: Check auth session and role
    // For now, allow through (will implement with NextAuth)
    return NextResponse.next()
  }

  // Vendor routes - require VENDOR or ADMIN role
  if (pathname.startsWith('/vendor')) {
    // TODO: Check auth session and role
    return NextResponse.next()
  }

  // API routes - handle auth in individual routes
  if (pathname.startsWith('/api/admin')) {
    // TODO: Check API auth and role
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/vendor')) {
    // TODO: Check API auth and role
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/vendor/:path*',
    '/api/admin/:path*',
    '/api/vendor/:path*',
  ],
}
