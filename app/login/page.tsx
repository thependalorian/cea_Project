/**
 * Enhanced Login Page
 * 
 * Complete authentication page with login, signup, and password reset
 * 
 * Location: app/login/page.tsx
 */

'use client';

import { useAuth } from '@/contexts/auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { LoginForm } from '@/components/LoginForm'
import { DashboardRouter } from '@/components/auth/DashboardRouter'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  console.log('LoginPage render - user:', user?.email, 'loading:', loading)

  // If user is authenticated, use DashboardRouter to redirect to appropriate dashboard
  if (!loading && user) {
    console.log('User authenticated, using DashboardRouter for role-based redirect')
    return <DashboardRouter />
  }

  if (loading) {
    console.log('Login page showing loading state')
    return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-seafoam-blue/20 to-spring-green/20">
      <div className="text-center space-y-4">
        <div className="animate-spin w-12 h-12 border-4 border-spring-green border-t-transparent rounded-full mx-auto"></div>
        <h2 className="text-lg font-sf-pro font-semibold text-midnight-forest">
          Loading...
        </h2>
        <p className="text-midnight-forest/70 font-inter">
          Preparing your experience
        </p>
      </div>
    </div>
  }

  console.log('Login page showing login form')
  return <LoginForm />
} 