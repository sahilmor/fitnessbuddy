import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If there's no session and the user is trying to access a protected route
  if (!session && isProtectedRoute(request.nextUrl.pathname)) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If there's a session and the user is trying to access auth routes
  if (session && isAuthRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return res
}

function isProtectedRoute(pathname: string) {
  const protectedRoutes = [
    '/dashboard',
    '/workouts',
    '/tracking',
    '/community',
    '/profile',
    '/onboarding',
  ]
  return protectedRoutes.some(route => pathname.startsWith(route))
}

function isAuthRoute(pathname: string) {
  const authRoutes = ['/login', '/register']
  return authRoutes.includes(pathname)
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/workouts/:path*',
    '/tracking/:path*',
    '/community/:path*',
    '/profile/:path*',
    '/onboarding/:path*',
    '/login',
    '/register',
  ],
} 