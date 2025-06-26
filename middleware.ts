/**
 * Supabase Middleware
 * Purpose: Handle Supabase auth session updates
 * Location: /middleware.ts
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

// Helper function to check if route is public
function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/auth/signin',
    '/auth/signup',
    '/auth/verify-email',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/callback',
    '/api/auth/callback',
    '/_next',
    '/static',
    '/images',
    '/favicon.ico',
  ]

  return publicRoutes.some(route => pathname.startsWith(route))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require auth
     * - auth routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth|auth/signin|auth/signup|auth/verify-email|auth/forgot-password|auth/reset-password).*)',
  ],
}