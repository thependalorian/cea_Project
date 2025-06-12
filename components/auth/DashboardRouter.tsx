/**
 * Dashboard Router Component
 * Automatically redirects users to their appropriate dashboard based on user type
 * Location: components/auth/DashboardRouter.tsx
 */

'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function DashboardRouter() {
  const { profile, loading, isAuthenticated, initializing } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect if still loading or initializing
    if (loading || initializing) return

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    // If authenticated but no profile, wait for profile to load
    if (!profile) return

    // ✅ ENHANCED: Better role detection with fallback handling
    const checkUserRole = async () => {
      if (!profile?.id) return null;

      try {
        // Check admin profile (uses user_id)
        const { data: adminProfile, error: adminError } = await createClient()
          .from('admin_profiles')
          .select('id, profile_completed')
          .eq('user_id', profile.id)
          .single();

        console.log('Admin check:', { adminProfile, adminError, userId: profile.id });
        
        if (adminProfile && !adminError) {
          return 'admin';
        }

        // Check partner profile (uses id directly)
        const { data: partnerProfile, error: partnerError } = await createClient()
          .from('partner_profiles')
          .select('id, profile_completed')
          .eq('id', profile.id)  // ✅ Partners use 'id' directly
          .single();

        console.log('Partner check:', { partnerProfile, partnerError, userId: profile.id });
        
        if (partnerProfile && !partnerError) {
          return 'partner';
        }

        // Check job seeker profile (uses user_id)
        const { data: jobSeekerProfile, error: jobSeekerError } = await createClient()
          .from('job_seeker_profiles')
          .select('id, profile_completed')
          .eq('user_id', profile.id)
          .single();

        console.log('Job seeker check:', { jobSeekerProfile, jobSeekerError, userId: profile.id });
        
        if (jobSeekerProfile && !jobSeekerError) {
          return 'job_seeker';
        }

        // Check basic profile for fallback user type
        const { data: basicProfile, error: basicProfileError } = await createClient()
          .from('profiles')
          .select('user_type')
          .eq('id', profile.id)
          .single();

        console.log('Basic profile check:', { basicProfile, basicProfileError, userId: profile.id });
        
        if (basicProfile && !basicProfileError && basicProfile.user_type) {
          return basicProfile.user_type;
        }

        // ✅ DEFAULT: If no specific role found, assume job_seeker
        console.log('No specific role found, defaulting to job_seeker');
        return 'job_seeker';
        
      } catch (error) {
        console.error('Error checking user role:', error);
        return 'job_seeker'; // Default fallback
      }
    };

    const userRole = async () => {
      const role = await checkUserRole();
      if (role) {
        switch (role) {
          case 'admin':
            router.push('/admin');
            break;
          case 'partner':
            router.push('/partners/setup'); // Always go to setup first to ensure profile exists
            break;
          case 'job_seeker':
          default:
            router.push('/job-seekers/setup'); // Always go to setup first to ensure profile exists
        }
      }
    };

    userRole();
  }, [profile, loading, isAuthenticated, initializing, router])

  // Show loading state while determining where to redirect
  if (loading || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-seafoam-blue/20 to-spring-green/20">
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-spring-green border-t-transparent rounded-full mx-auto"></div>
          <h2 className="text-ios-title-2 font-sf-pro font-semibold text-midnight-forest">
            Loading your dashboard...
          </h2>
          <p className="text-ios-body font-sf-pro text-midnight-forest/70">
            Please wait while we prepare your personalized experience
          </p>
        </div>
      </div>
    )
  }

  return null
} 