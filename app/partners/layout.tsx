import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PartnerSidebar from '@/components/partners/PartnerSidebar'
import PartnerHeader from '@/components/partners/PartnerHeader'

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }
  
  // Check if user is a partner using correct user_id field
  const { data: partnerProfile, error: partnerError } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('id', user.id)  // Changed from email to id field
    .single()
  
  if (partnerError || !partnerProfile) {
    console.log('Partner profile error:', partnerError, 'User ID:', user.id)
    redirect('/dashboard')  // Redirect to general dashboard if not a partner
  }

  // Check if partner profile is active and completed
  if (partnerProfile.status !== 'active') {
    redirect('/partners/setup')  // Redirect to setup if profile not active
  }

  return (
    <div className="min-h-screen bg-background">
      <PartnerHeader user={user} partner={partnerProfile} />
      <div className="flex">
        <PartnerSidebar partner={partnerProfile} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 