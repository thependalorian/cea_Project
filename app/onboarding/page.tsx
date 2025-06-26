/**
 * Onboarding Page Component - ACT Brand Compliant
 * Purpose: Allow users (especially Google signups) to select their user type if not set
 * Location: /app/onboarding/page.tsx
 * 
 * Brand Compliance:
 * - Uses MainLayout for consistent navigation and structure
 * - Implements proper typography hierarchy
 * - Follows ACT spacing system (base units)
 * - Uses exact color palette
 * - Responsive design with mobile-first approach
 * - Accessibility compliant
 */

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/providers/AuthProvider'
import createClient from '@/lib/supabase/client'
import Navigation from '@/components/shared/Navigation'
import MainLayout from '@/components/layout/MainLayout'

const USER_TYPES = [
  { value: 'job_seeker', label: 'Job Seeker' },
  { value: 'partner', label: 'Partner' },
]

export default function OnboardingPage() {
  const [userType, setUserType] = useState('job_seeker')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useSupabaseAuth()
  const supabase = createClient()

  useEffect(() => {
    async function checkProfile() {
      if (!user) {
        router.push('/auth/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()
      if (profile?.user_type) {
        // Already set, redirect to dashboard
        if (profile.user_type === 'admin') router.push('/dashboard/admin')
        else if (profile.user_type === 'partner') router.push('/dashboard/partner')
        else router.push('/dashboard')
      }
    }
    checkProfile()
  }, [router, supabase, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    if (!user) {
      setError('User not found')
      setLoading(false)
      return
    }
    
    // Update user_type in profiles
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ user_type: userType })
      .eq('id', user.id)
    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }
    
    // Ensure specialized profile row exists
    let specializedTable = null
    if (userType === 'job_seeker') specializedTable = 'job_seeker_profiles'
    if (userType === 'partner') specializedTable = 'partner_profiles'
    if (specializedTable) {
      // Check if row exists
      const { data: existing } = await supabase
        .from(specializedTable)
        .select('id')
        .eq('user_id', user.id)
        .single()
      if (!existing) {
        // Insert new row with available info
        const { error: insertError } = await supabase
          .from(specializedTable)
          .insert({
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || '',
            organization_name: userType === 'partner' ? user.user_metadata?.organization_name || '' : undefined,
          })
        if (insertError) {
          setError(insertError.message)
          setLoading(false)
          return
        }
      }
    }
    // Redirect to correct dashboard
    if (userType === 'admin') router.push('/dashboard/admin')
    else if (userType === 'partner') router.push('/dashboard/partner')
    else router.push('/dashboard')
  }

  return (
    <MainLayout
      pageTitle="Welcome to ACT"
      pageSubtitle="Let's set up your climate career profile to get started"
      pageType="simple"
    >
      {/* ACT Brand Navigation */}
      <Navigation />
      
      {/* Page Header */}
      <section className="act-section bg-sand-gray-10">
        <div className="act-content">
          <div className="text-center animate-on-scroll">
            <h1 className="act-h1 mb-act-1">Welcome to ACT</h1>
            <p className="act-body-large text-moss-green max-w-2xl mx-auto">
              Let's set up your climate career profile to get started
            </p>
          </div>
        </div>
      </section>

      {/* Onboarding Form Section */}
      <section className="act-section">
        <div className="act-content">
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              <form onSubmit={handleSubmit} className="act-card p-act-2 space-y-act-1-5">
                <div className="text-center mb-act-2">
                  <h2 className="act-h3 mb-act-0-5">What best describes you?</h2>
                  <p className="act-body text-moss-green">
                    This helps us personalize your climate career experience
                  </p>
                </div>
                
                <div className="space-y-act-1">
                  {USER_TYPES.map(type => (
                    <label key={type.value} className="flex items-center p-act-1 border border-sand-gray rounded-act-sm hover:border-spring-green transition-colors cursor-pointer">
                      <input
                        type="radio"
                        name="userType"
                        value={type.value}
                        checked={userType === type.value}
                        onChange={e => setUserType(e.target.value)}
                        className="radio radio-primary mr-act-1"
                      />
                      <span className="act-body font-medium">{type.label}</span>
                    </label>
                  ))}
                </div>

                {error && (
                  <div className="act-alert act-alert-error">
                    <span className="act-body-small">{error}</span>
                  </div>
                )}

                <button 
                  className="act-btn act-btn-primary w-full" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Setting up your profile...' : 'Continue to Dashboard'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}
