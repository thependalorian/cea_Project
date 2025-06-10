'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export type UserRole = 'job_seeker' | 'partner' | 'admin' | null

interface UserProfile {
  role: UserRole
  profile: Record<string, unknown> | null
  user: User | null
}

export function useProtectedNavigation() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    role: null,
    profile: null,
    user: null
  })
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUserRole()
  }, [])

  const checkUserRole = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        setUserProfile({ role: null, profile: null, user: null })
        setLoading(false)
        return
      }

      // Check if user is admin
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (adminProfile) {
        setUserProfile({
          role: 'admin',
          profile: adminProfile,
          user
        })
        setLoading(false)
        return
      }

      // Check if user is partner
      const { data: partnerData } = await supabase
        .from('partner_profiles')
        .select('*')
        .eq('contact_email', user.email)
        .eq('status', 'active')

      if (partnerData && partnerData.length > 0) {
        setUserProfile({
          role: 'partner',
          profile: partnerData[0],
          user
        })
        setLoading(false)
        return
      }

      // Check if user is job seeker
      const { data: jobSeekerData } = await supabase
        .from('job_seeker_profiles')
        .select('*')
        .eq('user_id', user.id)

      if (jobSeekerData && jobSeekerData.length > 0) {
        setUserProfile({
          role: 'job_seeker',
          profile: jobSeekerData[0],
          user
        })
        setLoading(false)
        return
      }

      // No profile found, default to job seeker
      setUserProfile({
        role: 'job_seeker',
        profile: null,
        user
      })
      setLoading(false)

    } catch (error) {
      console.error('Error checking user role:', error)
      setUserProfile({ role: null, profile: null, user: null })
      setLoading(false)
    }
  }

  const redirectToRoleDashboard = () => {
    switch (userProfile.role) {
      case 'admin':
        router.push('/admin/dashboard')
        break
      case 'partner':
        router.push('/partners/dashboard')
        break
      case 'job_seeker':
        router.push('/job-seekers')
        break
      default:
        router.push('/auth/login')
    }
  }

  const requireRole = (allowedRoles: UserRole[]) => {
    if (!userProfile.user) {
      router.push('/auth/login')
      return false
    }

    if (!allowedRoles.includes(userProfile.role)) {
      redirectToRoleDashboard()
      return false
    }

    return true
  }

  const requireAdmin = (minAccessLevel?: 'standard' | 'super' | 'system') => {
    if (!requireRole(['admin'])) return false

    if (minAccessLevel && userProfile.profile?.access_level) {
      const levels = { standard: 1, super: 2, system: 3 }
      const userLevel = levels[userProfile.profile.access_level as keyof typeof levels]
      const requiredLevel = levels[minAccessLevel]

      if (userLevel < requiredLevel) {
        router.push('/admin/dashboard')
        return false
      }
    }

    return true
  }

  const requirePartner = () => {
    return requireRole(['partner'])
  }

  const requireJobSeeker = () => {
    return requireRole(['job_seeker'])
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUserProfile({ role: null, profile: null, user: null })
    router.push('/auth/login')
  }

  return {
    userProfile,
    loading,
    redirectToRoleDashboard,
    requireRole,
    requireAdmin,
    requirePartner,
    requireJobSeeker,
    logout,
    checkUserRole
  }
} 