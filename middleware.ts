import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  // Public routes that don't require auth
  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/books') ||
    pathname.startsWith('/cart') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/order/') ||
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/api/auth/')

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/login?callbackUrl=/admin', req.url))
    }
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/unauthorized', req.url))
    }
  }

  // Vendor routes
  if (pathname.startsWith('/vendor')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/login?callbackUrl=/vendor', req.url))
    }
    if (userRole !== 'VENDOR' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/auth/unauthorized', req.url))
    }
  }

  // API routes
  if (pathname.startsWith('/api/admin')) {
    if (!isLoggedIn || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (pathname.startsWith('/api/vendor')) {
    if (!isLoggedIn || (userRole !== 'VENDOR' && userRole !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
