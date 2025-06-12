import { useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { 
  Profile, 
  JobSeekerProfile, 
  PartnerProfile, 
  AdminProfile, 
  UserType, 
  SignUpData, 
  SignInData,
  UserPreferences 
} from '@/types/user'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [jobSeekerProfile, setJobSeekerProfile] = useState<JobSeekerProfile | null>(null)
  const [partnerProfile, setPartnerProfile] = useState<PartnerProfile | null>(null)
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch user profile and determine user type
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      // Check admin_profiles first
      const { data: adminData, error: adminError } = await supabase
        .from('admin_profiles')
        .select('*, user_type')
        .eq('user_id', userId)
        .single()

      if (adminData && !adminError) {
        const profile = {
          id: userId,
          user_type: 'admin' as UserType,
          role: adminData.department || 'Administrator',
          full_name: adminData.full_name,
          email: adminData.email || '',
          verified: true,
          partnership_level: 'admin',
          contact_info: {
            phone: adminData.phone,
            direct_phone: adminData.direct_phone,
            department: adminData.department
          },
          profile_completed: adminData.profile_completed,
          created_at: adminData.created_at,
          updated_at: adminData.updated_at
        }
        setProfile(profile)
        setAdminProfile(adminData)
        return profile
      }

      // Check partner_profiles
      const { data: partnerData, error: partnerError } = await supabase
        .from('partner_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (partnerData && !partnerError) {
        const profile = {
          id: userId,
          user_type: 'partner' as UserType,
          role: 'Partner Organization',
          full_name: partnerData.full_name || partnerData.organization_name,
          organization_name: partnerData.organization_name,
          organization_type: partnerData.organization_type,
          website: partnerData.website,
          description: partnerData.description,
          email: partnerData.email || '',
          verified: partnerData.verified,
          partnership_level: partnerData.partnership_level || 'standard',
          contact_info: {
            phone: partnerData.phone,
            website: partnerData.website,
            organization_type: partnerData.organization_type
          },
          profile_completed: partnerData.profile_completed,
          created_at: partnerData.created_at,
          updated_at: partnerData.updated_at
        }
        setProfile(profile)
        setPartnerProfile(partnerData)
        return profile
      }

      // Default to job_seeker
      const { data: jobSeekerData, error: jobSeekerError } = await supabase
        .from('job_seeker_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (jobSeekerData && !jobSeekerError) {
        const profile = {
          id: userId,
          user_type: 'job_seeker' as UserType,
          role: jobSeekerData.current_title || 'Job Seeker',
          full_name: jobSeekerData.full_name,
          email: jobSeekerData.email || '',
          verified: true,
          partnership_level: 'user',
          contact_info: {
            phone: jobSeekerData.phone,
            location: jobSeekerData.location,
            current_title: jobSeekerData.current_title
          },
          profile_completed: jobSeekerData.profile_completed,
          created_at: jobSeekerData.created_at,
          updated_at: jobSeekerData.updated_at
        }
        setProfile(profile)
        setJobSeekerProfile(jobSeekerData)
        return profile
      }

      console.error('No profile found for user:', userId)
      return null
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  }, [supabase])

  // Fetch user preferences
  const fetchUserPreferences = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Error fetching user preferences:', error)
        return null
      }
      
      setUserPreferences(data)
      return data
    } catch (error) {
      console.error('Error fetching user preferences:', error)
      return null
    }
  }, [supabase])

  // Load all user data based on detected user type
  const loadUserData = useCallback(async (userId: string) => {
    setLoading(true)
    try {
      // Fetch profile and determine user type
      const profileData = await fetchProfile(userId)
      
      if (profileData) {
        // Fetch user preferences
        await fetchUserPreferences(userId)
      }

      return profileData
    } catch (error) {
      console.error('Error loading user data:', error)
      setError('Failed to load user data')
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchProfile, fetchUserPreferences])

  // Initialize authentication state
  useEffect(() => {
    let mounted = true

    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setError('Failed to get session')
          return
        }

        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          
          if (session?.user) {
            // Load user data and determine type from database
            await loadUserData(session.user.id)
          } else {
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Error in getSession:', error)
        if (mounted) {
          setError('Failed to initialize session')
          setLoading(false)
        }
      } finally {
        if (mounted) {
          setInitializing(false)
        }
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          // Clear all user data on logout
          setProfile(null)
          setJobSeekerProfile(null)
          setPartnerProfile(null)
          setAdminProfile(null)
          setUserPreferences(null)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth, loadUserData])

  // Sign up function
  const signUp = async (signUpData: SignUpData) => {
    try {
      setError(null)
      setLoading(true)

      const { email, password, user_type, ...additionalData } = signUpData

      // ✅ Only create auth user with metadata - no database profile creation
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type,
            full_name: additionalData.full_name,
            organization_name: additionalData.organization_name,
            phone: additionalData.phone,
            location: additionalData.location,
            company_size: additionalData.company_size,
            industry: additionalData.industry,
            website_url: additionalData.website_url
          }
        }
      })

      if (error) {
        setError(error.message)
        return { data: null, error }
      }

      // ✅ No database writes - just return the auth user
      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  // Sign in function
  const signIn = async (signInData: SignInData) => {
    try {
      setError(null)
      setLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.email,
        password: signInData.password
      })

      if (error) {
        setError(error.message)
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setError(errorMessage)
      return { data: null, error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        setError(error.message)
        return { error }
      }

      // Clear all state
      setUser(null)
      setSession(null)
      setProfile(null)
      setJobSeekerProfile(null)
      setPartnerProfile(null)
      setAdminProfile(null)
      setUserPreferences(null)
      
      return { error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    }
  }

  // Permission checking functions
  const hasPermission = (requiredType: UserType | UserType[]) => {
    if (!profile) return false
    
    const types = Array.isArray(requiredType) ? requiredType : [requiredType]
    return types.includes(profile.user_type as UserType)
  }

  const hasAdminPermission = (permission: keyof AdminProfile) => {
    if (!adminProfile || profile?.user_type !== 'admin') return false
    return adminProfile[permission] === true
  }

  // Utility functions
  const refreshUserData = async () => {
    if (user && profile) {
      await loadUserData(user.id)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return { error: 'Not authenticated' }

    try {
      let data, error

      // Update the appropriate profile table based on user type
      switch (profile.user_type) {
        case 'admin':
          ({ data, error } = await supabase
            .from('admin_profiles')
            .update(updates)
            .eq('user_id', user.id)
            .select()
            .single())
          break
        case 'partner':
          ({ data, error } = await supabase
            .from('partner_profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single())
          break
        case 'job_seeker':
        default:
          ({ data, error } = await supabase
            .from('job_seeker_profiles')
            .update(updates)
            .eq('user_id', user.id)
            .select()
            .single())
          break
      }

      if (error) return { error: error.message }

      // Update local state
      await loadUserData(user.id)
      return { data, error: null }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed'
      return { error: errorMessage }
    }
  }

  // Get user's access token for API calls
  const getAccessToken = async () => {
    if (!session) return null
    return session.access_token
  }

  return {
    // Auth state
    user,
    session,
    profile,
    jobSeekerProfile,
    partnerProfile,
    adminProfile,
    userPreferences,
    loading,
    initializing,
    error,
    
    // Auth methods
    signUp,
    signIn,
    signOut,
    
    // Utility methods
    hasPermission,
    hasAdminPermission,
    refreshUserData,
    updateProfile,
    getAccessToken,
    
    // Convenience flags
    isAuthenticated: !!user,
    isJobSeeker: profile?.user_type === 'job_seeker',
    isPartner: profile?.user_type === 'partner',
    isAdmin: profile?.user_type === 'admin',
    isVerified: profile?.verified === true,
    isProfileComplete: profile?.user_type === 'job_seeker' 
      ? jobSeekerProfile?.profile_completed === true
      : profile?.user_type === 'partner'
      ? partnerProfile?.profile_completed === true
      : profile?.user_type === 'admin'
      ? adminProfile?.profile_completed === true
      : false
  }
} 