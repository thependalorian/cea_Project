/**
 * Partner Verification Page - Climate Economy Assistant
 * Admin page for managing partner verification queue
 * Location: app/admin/partner-verification/page.tsx
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ACTCard, ACTButton, ACTFrameElement } from '@/components/ui'
import { 
  Building, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  AlertTriangle,
  Filter,
  Search,
  Shield
} from 'lucide-react'

interface PendingPartner {
  id: string
  organization_name: string
  organization_type: string
  email: string
  full_name: string
  created_at: string
  verified: boolean
  verification_date: string | null
  website: string | null
  description: string | null
  employee_count: number | null
}

export default async function PartnerVerificationPage() {
  const supabase = await createClient()

  // Check authentication and admin access
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login");
  }

  // Verify admin access (partner management or system privileges required)
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('can_manage_partners, can_manage_system, can_manage_users, full_name')
    .eq('user_id', user.id)
    .single();

  if (!adminProfile || (!adminProfile.can_manage_partners && !adminProfile.can_manage_system)) {
    return (
      <div className="container mx-auto py-8">
        <ACTCard variant="outlined" className="p-8 text-center">
          <Shield className="h-16 w-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">Access Denied</h2>
          <p className="text-base-content/70">
            You need partner management privileges to access partner verification.
          </p>
        </ACTCard>
      </div>
    )
  }

  // Get pending partners
  const { data: pendingPartners, error } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('verified', false)
    .order('created_at', { ascending: false })

  // Get recently verified partners
  const { data: recentlyVerified } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('verified', true)
    .not('verification_date', 'is', null)
    .order('verification_date', { ascending: false })
    .limit(5)

  const { count: totalPending } = await supabase
    .from('partner_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('verified', false)

  const { count: totalVerified } = await supabase
    .from('partner_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('verified', true)

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl">
      {/* Header */}
      <ACTFrameElement variant="full" size="xl" className="bg-gradient-to-r from-secondary/10 to-accent/10">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-secondary/20 rounded-full">
                <Building className="h-8 w-8 text-secondary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-midnight-forest">
                  Partner Verification
                </h1>
                <p className="text-lg text-base-content/70 mt-2">
                  Review and verify partner organizations
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-base-content/60">
                {totalPending || 0} pending • {totalVerified || 0} verified
              </div>
            </div>
          </div>
        </div>
      </ACTFrameElement>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-warning/10 rounded-full mx-auto w-fit mb-4">
            <Clock className="h-8 w-8 text-warning" />
          </div>
          <div className="text-3xl font-bold text-warning mb-2">{totalPending || 0}</div>
          <div className="text-sm text-base-content/70">Pending Verification</div>
        </ACTCard>

        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-success/10 rounded-full mx-auto w-fit mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <div className="text-3xl font-bold text-success mb-2">{totalVerified || 0}</div>
          <div className="text-sm text-base-content/70">Verified Partners</div>
        </ACTCard>

        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-info/10 rounded-full mx-auto w-fit mb-4">
            <Building className="h-8 w-8 text-info" />
          </div>
          <div className="text-3xl font-bold text-info mb-2">{(totalPending || 0) + (totalVerified || 0)}</div>
          <div className="text-sm text-base-content/70">Total Partners</div>
        </ACTCard>
      </div>

      {/* Pending Partners */}
      <section>
        <ACTFrameElement variant="brackets" size="lg" className="mb-6">
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">
            Pending Verification ({totalPending || 0})
          </h2>
          <p className="text-base-content/70">
            Partners waiting for administrative review and verification
          </p>
        </ACTFrameElement>

        {pendingPartners && pendingPartners.length > 0 ? (
          <div className="grid gap-6">
            {pendingPartners.map((partner: PendingPartner) => (
              <ACTCard key={partner.id} variant="outlined" className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-secondary/10 rounded-full">
                        <Building className="h-5 w-5 text-secondary" />
                      </div>
                      <h3 className="text-xl font-bold text-midnight-forest">
                        {partner.organization_name}
                      </h3>
                      <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">
                        Pending
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">Contact Person</p>
                        <p className="font-medium">{partner.full_name || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">Organization Type</p>
                        <p className="font-medium">{partner.organization_type || 'Not specified'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">Email</p>
                        <p className="font-medium">{partner.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">Website</p>
                        <p className="font-medium">{partner.website || 'Not provided'}</p>
                      </div>
                    </div>

                    {partner.description && (
                      <div className="mb-4">
                        <p className="text-sm text-base-content/60 mb-1">Description</p>
                        <p className="text-sm text-base-content/80">
                          {partner.description.substring(0, 200)}
                          {partner.description.length > 200 ? '...' : ''}
                        </p>
                      </div>
                    )}

                    <div className="text-xs text-base-content/60">
                      Applied: {new Date(partner.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <ACTButton 
                      variant="primary" 
                      size="sm"
                      href={`/admin/partners/${partner.id}`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </ACTButton>
                    <ACTButton variant="outline" size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </ACTButton>
                    <ACTButton variant="ghost" size="sm" className="text-error">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </ACTButton>
                  </div>
                </div>
              </ACTCard>
            ))}
          </div>
        ) : (
          <ACTCard variant="outlined" className="p-12 text-center">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h3 className="text-xl font-bold text-midnight-forest mb-2">
              No Pending Verifications
            </h3>
            <p className="text-base-content/70">
              All partner applications have been processed. Great work!
            </p>
          </ACTCard>
        )}
      </section>

      {/* Recently Verified */}
      {recentlyVerified && recentlyVerified.length > 0 && (
        <section>
          <ACTFrameElement variant="open" size="md" className="mb-6">
            <h2 className="text-2xl font-bold text-midnight-forest mb-2">
              Recently Verified
            </h2>
            <p className="text-base-content/70">
              Partners verified in the last 30 days
            </p>
          </ACTFrameElement>

          <div className="grid gap-4">
            {recentlyVerified.map((partner: PendingPartner) => (
              <ACTCard key={partner.id} variant="outlined" className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/10 rounded-full">
                      <CheckCircle className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <h4 className="font-bold text-midnight-forest">
                        {partner.organization_name}
                      </h4>
                      <p className="text-sm text-base-content/60">
                        {partner.organization_type} • Verified {new Date(partner.verification_date!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ACTButton 
                    variant="outline" 
                    size="sm"
                    href={`/admin/partners/${partner.id}`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </ACTButton>
                </div>
              </ACTCard>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="flex justify-center gap-4">
        <ACTButton variant="primary" size="lg" href="/admin/partners">
          <Building className="h-5 w-5 mr-2" />
          All Partners
        </ACTButton>
        <ACTButton variant="outline" size="lg" href="/admin/dashboard">
          Back to Dashboard
        </ACTButton>
      </section>
    </div>
  )
} 