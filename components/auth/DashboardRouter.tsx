/**
 * Dashboard Router Component
 * Automatically redirects users to their appropriate dashboard based on user type
 * Location: components/auth/DashboardRouter.tsx
 */

'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function DashboardRouter() {
  const { profile, loading, isAuthenticated, initializing } = useAuth()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Don't redirect if still loading or initializing
    if (loading || initializing) {
      console.log('DashboardRouter waiting for auth state', { loading, initializing })
      return
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      console.log('DashboardRouter: User not authenticated, redirecting to login')
      router.push('/auth/login')
      return
    }

    // If authenticated but no profile, wait for profile to load
    if (!profile) {
      console.log('DashboardRouter: Waiting for profile to load')
      return
    }

    console.log('DashboardRouter: Starting role-based redirect', { profile })
    setRedirecting(true)

    // ✅ SECURE: Use API endpoint instead of direct database access
    const checkUserRoleAndRedirect = async () => {
      if (!profile?.id) {
        console.error('DashboardRouter: No profile ID available')
        setError('Profile not found')
        return
      }

      try {
        // Use secure API endpoint for role checking
        const response = await fetch('/api/v1/profile/check-role', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const { role, profile_data } = await response.json();
          console.log('DashboardRouter: Role check result:', { role, profile_data, userId: profile.id });
          
          // Redirect based on role - prioritize setup pages if profile is incomplete
          switch (role) {
            case 'admin':
              console.log('DashboardRouter: Redirecting to admin dashboard')
              // Admin profiles are typically complete upon creation
              router.push('/admin');
              break;
            case 'partner':
              console.log('DashboardRouter: Redirecting to partner dashboard/setup')
              // Check if profile is complete, redirect to setup if not
              if (profile_data && !profile_data.profile_completed) {
                router.push('/partners/setup');
              } else {
                router.push('/partners');
              }
              break;
            case 'job_seeker':
            default:
              console.log('DashboardRouter: Redirecting to job seeker dashboard/setup')
              // Check if profile is complete, redirect to setup if not
              if (profile_data && !profile_data.profile_completed) {
                router.push('/job-seekers/setup');
              } else {
                router.push('/job-seekers');
              }
              break;
          }
        } else {
          console.error('DashboardRouter: Role check failed:', response.status, response.statusText);
          // Default fallback to job seeker setup (safer than main dashboard)
          console.log('DashboardRouter: Falling back to job seeker setup')
          router.push('/job-seekers/setup');
        }
        
      } catch (error) {
        console.error('DashboardRouter: Error checking user role:', error);
        setError('Failed to determine user role')
        // Default fallback to job seeker setup (safer than main dashboard)
        console.log('DashboardRouter: Error fallback to job seeker setup')
        router.push('/job-seekers/setup');
      }
    };

    checkUserRoleAndRedirect();
  }, [profile, loading, isAuthenticated, initializing, router])

  // Show loading state while determining where to redirect
  if (loading || initializing || redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-seafoam-blue/20 to-spring-green/20">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-spring-green border-t-transparent rounded-full mx-auto"></div>
          <h2 className="text-xl font-sf-pro font-semibold text-midnight-forest">
            {redirecting ? 'Redirecting to your dashboard...' : 'Loading your dashboard...'}
          </h2>
          <p className="text-ios-body font-inter text-midnight-forest/70">
            Please wait while we prepare your personalized experience
          </p>
          {profile && (
            <p className="text-sm text-midnight-forest/50 font-inter">
              Welcome back, {profile.full_name || profile.email}
            </p>
          )}
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-seafoam-blue/20 to-spring-green/20">
        <div className="text-center space-y-4 max-w-md mx-auto p-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <div className="w-6 h-6 bg-red-500 rounded-full"></div>
          </div>
          <h2 className="text-xl font-sf-pro font-semibold text-midnight-forest">
            Something went wrong
          </h2>
          <p className="text-ios-body font-inter text-midnight-forest/70">
            {error}
          </p>
          <button 
            onClick={() => router.push('/job-seekers/setup')}
            className="bg-spring-green hover:bg-spring-green/90 text-midnight-forest font-inter font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            Continue to Setup
          </button>
        </div>
      </div>
    )
  }

  return null
} 