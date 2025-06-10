/**
 * Job Moderation Page - Climate Economy Assistant
 * Admin page for moderating and reviewing job listings
 * Location: app/admin/job-moderation/page.tsx
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ACTCard, ACTButton, ACTFrameElement } from '@/components/ui'
import { 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  AlertTriangle,
  Flag,
  MapPin,
  DollarSign,
  Calendar,
  Shield
} from 'lucide-react'

interface JobListing {
  id: string
  title: string
  description: string
  location: string
  employment_type: string
  experience_level: string
  salary_range: string
  is_active: boolean
  created_at: string
  expires_at: string
  partner_id: string
  partner_profiles: {
    organization_name: string
    verified: boolean
  }
  climate_focus: string[]
  skills_required: string[]
}

export default async function JobModerationPage() {
  const supabase = await createClient()

  // Check authentication and admin access
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login");
  }

  // Verify admin access (content management or system privileges required)
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('can_manage_content, can_manage_system, full_name')
    .eq('user_id', user.id)
    .single();

  if (!adminProfile || (!adminProfile.can_manage_content && !adminProfile.can_manage_system)) {
    return (
      <div className="container mx-auto py-8">
        <ACTCard variant="outlined" className="p-8 text-center">
          <Shield className="h-16 w-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">Access Denied</h2>
          <p className="text-base-content/70">
            You need content management privileges to access job moderation functionality.
          </p>
        </ACTCard>
      </div>
    )
  }

  // Get jobs pending review (new jobs from last 7 days or flagged jobs)
  const { data: pendingJobs, error } = await supabase
    .from('job_listings')
    .select(`
      *,
      partner_profiles!inner(organization_name, verified)
    `)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false })

  // Get recently reviewed jobs
  const { data: recentlyReviewed } = await supabase
    .from('job_listings')
    .select(`
      *,
      partner_profiles!inner(organization_name, verified)
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get flagged jobs (this would require a content_flags table)
  const { data: flaggedJobs } = await supabase
    .from('content_flags')
    .select(`
      *,
      job_listings!inner(
        *,
        partner_profiles!inner(organization_name, verified)
      )
    `)
    .eq('content_type', 'job_listing')
    .eq('admin_reviewed', false)
    .order('created_at', { ascending: false })

  const { count: totalPending } = await supabase
    .from('job_listings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const { count: totalActive } = await supabase
    .from('job_listings')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: totalFlagged } = await supabase
    .from('content_flags')
    .select('*', { count: 'exact', head: true })
    .eq('content_type', 'job_listing')
    .eq('admin_reviewed', false)

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl">
      {/* Header */}
      <ACTFrameElement variant="full" size="xl" className="bg-gradient-to-r from-accent/10 to-warning/10">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/20 rounded-full">
                <Briefcase className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-midnight-forest">
                  Job Moderation
                </h1>
                <p className="text-lg text-base-content/70 mt-2">
                  Review and moderate job listings for quality and compliance
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-base-content/60">
                {totalPending || 0} pending • {totalFlagged || 0} flagged
              </div>
            </div>
          </div>
        </div>
      </ACTFrameElement>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-warning/10 rounded-full mx-auto w-fit mb-4">
            <Clock className="h-8 w-8 text-warning" />
          </div>
          <div className="text-3xl font-bold text-warning mb-2">{totalPending || 0}</div>
          <div className="text-sm text-base-content/70">Pending Review</div>
        </ACTCard>

        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-error/10 rounded-full mx-auto w-fit mb-4">
            <Flag className="h-8 w-8 text-error" />
          </div>
          <div className="text-3xl font-bold text-error mb-2">{totalFlagged || 0}</div>
          <div className="text-sm text-base-content/70">Flagged Jobs</div>
        </ACTCard>

        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-success/10 rounded-full mx-auto w-fit mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <div className="text-3xl font-bold text-success mb-2">{totalActive || 0}</div>
          <div className="text-sm text-base-content/70">Active Jobs</div>
        </ACTCard>

        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-info/10 rounded-full mx-auto w-fit mb-4">
            <Briefcase className="h-8 w-8 text-info" />
          </div>
          <div className="text-3xl font-bold text-info mb-2">{((totalPending || 0) + (totalActive || 0))}</div>
          <div className="text-sm text-base-content/70">Total Jobs</div>
        </ACTCard>
      </div>

      {/* Flagged Jobs - High Priority */}
      {flaggedJobs && flaggedJobs.length > 0 && (
        <section>
          <ACTFrameElement variant="brackets" size="lg" className="mb-6">
            <h2 className="text-2xl font-bold text-error mb-2">
              Flagged Jobs - Urgent Review ({flaggedJobs.length})
            </h2>
            <p className="text-base-content/70">
              Jobs flagged by users or system requiring immediate attention
            </p>
          </ACTFrameElement>

          <div className="grid gap-6">
            {flaggedJobs.map((flag: any) => {
              const job = flag.job_listings
              return (
                <ACTCard key={flag.id} variant="outlined" className="p-6 border-error/20">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-error/10 rounded-full">
                      <Flag className="h-5 w-5 text-error" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-midnight-forest">{job.title}</h3>
                        <span className="px-2 py-1 bg-error/10 text-error text-xs rounded-full">
                          FLAGGED: {flag.flag_reason}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-base-content/60" />
                          <span className="text-sm">{job.partner_profiles.organization_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-base-content/60" />
                          <span className="text-sm">{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-base-content/60" />
                          <span className="text-sm">{job.salary_range || 'Not specified'}</span>
                        </div>
                      </div>
                      <p className="text-sm text-base-content/80 mb-4">
                        {job.description.substring(0, 200)}...
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <ACTButton variant="primary" size="sm" href={`/admin/jobs/${job.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </ACTButton>
                      <ACTButton variant="outline" size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </ACTButton>
                      <ACTButton variant="ghost" size="sm" className="text-error">
                        <XCircle className="h-4 w-4 mr-2" />
                        Remove
                      </ACTButton>
                    </div>
                  </div>
                </ACTCard>
              )
            })}
          </div>
        </section>
      )}

      {/* Pending Jobs */}
      <section>
        <ACTFrameElement variant="brackets" size="lg" className="mb-6">
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">
            Recent Job Listings ({totalPending || 0})
          </h2>
          <p className="text-base-content/70">
            New job listings from the past 7 days requiring review
          </p>
        </ACTFrameElement>

        {pendingJobs && pendingJobs.length > 0 ? (
          <div className="grid gap-6">
            {pendingJobs.map((job: JobListing) => (
              <ACTCard key={job.id} variant="outlined" className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-accent/10 rounded-full">
                        <Briefcase className="h-5 w-5 text-accent" />
                      </div>
                      <h3 className="text-xl font-bold text-midnight-forest">
                        {job.title}
                      </h3>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          job.is_active 
                            ? 'bg-success/10 text-success' 
                            : 'bg-warning/10 text-warning'
                        }`}>
                          {job.is_active ? 'Active' : 'Pending'}
                        </span>
                        {job.partner_profiles.verified && (
                          <span className="px-2 py-1 bg-info/10 text-info text-xs rounded-full">
                            Verified Partner
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">Organization</p>
                        <p className="font-medium">{job.partner_profiles.organization_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">Location & Type</p>
                        <p className="font-medium">{job.location} • {job.employment_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">Experience Level</p>
                        <p className="font-medium">{job.experience_level}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-base-content/60 mb-1">Description</p>
                      <p className="text-sm text-base-content/80">
                        {job.description.substring(0, 300)}
                        {job.description.length > 300 ? '...' : ''}
                      </p>
                    </div>

                    {job.climate_focus && job.climate_focus.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-base-content/60 mb-2">Climate Focus Areas</p>
                        <div className="flex flex-wrap gap-1">
                          {job.climate_focus.slice(0, 5).map((focus, index) => (
                            <span key={index} className="px-2 py-1 bg-moss-green/10 text-moss-green text-xs rounded">
                              {focus}
                            </span>
                          ))}
                          {job.climate_focus.length > 5 && (
                            <span className="px-2 py-1 bg-base-200 text-xs rounded">
                              +{job.climate_focus.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-base-content/60">
                      Posted: {new Date(job.created_at).toLocaleDateString()} • 
                      Expires: {new Date(job.expires_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <ACTButton 
                      variant="primary" 
                      size="sm"
                      href={`/admin/jobs/${job.id}`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </ACTButton>
                    <ACTButton variant="outline" size="sm">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </ACTButton>
                    <ACTButton variant="ghost" size="sm" className="text-warning">
                      <Flag className="h-4 w-4 mr-2" />
                      Flag
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
              No Jobs Pending Review
            </h3>
            <p className="text-base-content/70">
              All recent job listings have been reviewed. Excellent work!
            </p>
          </ACTCard>
        )}
      </section>

      {/* Quick Actions */}
      <section className="flex justify-center gap-4">
        <ACTButton variant="primary" size="lg" href="/admin/jobs">
          <Briefcase className="h-5 w-5 mr-2" />
          All Jobs
        </ACTButton>
        <ACTButton variant="secondary" size="lg" href="/admin/partners">
          View Partners
        </ACTButton>
        <ACTButton variant="outline" size="lg" href="/admin/dashboard">
          Back to Dashboard
        </ACTButton>
      </section>
    </div>
  )
} 