import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ACTCard, ACTButton, ACTFrameElement } from '@/components/ui'
import { 
  Briefcase, 
  Users, 
  BookOpen, 
  TrendingUp, 
  Plus, 
  Eye, 
  Calendar,
  Target,
  Award,
  Building,
  Shield
} from 'lucide-react'

export default async function PartnerDashboard() {
  const supabase = await createClient()
  
  // Get current user and check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get partner profile using correct user ID field
  const { data: partnerProfile, error: partnerError } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('id', user.id)  // Changed from eq('id', user?.id) to ensure proper authentication
    .single()

  if (partnerError || !partnerProfile) {
    console.log('Partner profile error:', partnerError, 'User ID:', user.id)
    redirect('/dashboard')  // Redirect if not a partner
  }

  if (!partnerProfile.profile_completed) {
    redirect('/partners/setup')  // Redirect to setup if profile incomplete
  }

  // Get partner-specific metrics using correct field references
  const [
    { count: totalJobs },
    { count: activeJobs },
    { count: totalEducationPrograms },
    { data: jobListings }
  ] = await Promise.all([
    supabase.from('job_listings').select('*', { count: 'exact', head: true }).eq('partner_id', partnerProfile.id),
    supabase.from('job_listings').select('*', { count: 'exact', head: true }).eq('partner_id', partnerProfile.id).eq('is_active', true),
    supabase.from('education_programs').select('*', { count: 'exact', head: true }).eq('partner_id', partnerProfile.id),
    supabase.from('job_listings').select('*').eq('partner_id', partnerProfile.id).order('created_at', { ascending: false }).limit(5)
  ])

  // Get recent job listings with better error handling
  const { data: recentJobListings, error: jobsError } = await supabase
    .from('job_listings')
    .select('*')
    .eq('partner_id', partnerProfile.id)
    .order('created_at', { ascending: false })
    .limit(5)

  if (jobsError) {
    console.error('Error fetching recent job listings:', jobsError)
  }

  const dashboardData = {
    metrics: {
      totalJobs: totalJobs || 0,
      activeJobs: activeJobs || 0,
      totalEducationPrograms: totalEducationPrograms || 0,
      profileCompletion: partnerProfile?.profile_completed ? 100 : 60
    },
    recentJobListings: recentJobListings || []
  }

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-6xl">
      {/* Header Section */}
      <ACTFrameElement variant="full" size="xl" className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="p-8">
      <div className="flex items-center justify-between">
        <div>
              <h1 className="text-4xl font-bold text-midnight-forest">
                {partnerProfile?.organization_name || 'Partner'} Dashboard
              </h1>
              <p className="text-lg text-base-content/70 mt-2">
                {partnerProfile?.organization_type} • {partnerProfile?.partnership_level} Partner
                {partnerProfile?.verified && ' • ✓ Verified'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-base-content/60">
                Member since {new Date(partnerProfile?.created_at || '').toLocaleDateString()}
              </div>
              <div className="text-sm font-medium text-success">
                {partnerProfile?.verified ? 'Verified Partner' : 'Pending Verification'}
              </div>
            </div>
          </div>
        </div>
      </ACTFrameElement>

      {/* Metrics Overview */}
      <section>
        <ACTFrameElement variant="open" size="md" className="text-center mb-6">
          <h2 className="text-3xl font-bold text-midnight-forest mb-2">
            Partnership Overview
          </h2>
          <p className="text-lg text-base-content/70">
            Your impact in the climate economy ecosystem
          </p>
        </ACTFrameElement>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ACTCard variant="gradient" className="text-center p-6">
            <div className="p-3 bg-primary/10 rounded-full mx-auto w-fit mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-2">{dashboardData.metrics.totalJobs}</div>
            <div className="text-sm text-base-content/70 mb-1">Total Job Postings</div>
            <div className="text-xs text-green-600">{dashboardData.metrics.activeJobs} active</div>
          </ACTCard>

          <ACTCard variant="gradient" className="text-center p-6">
            <div className="p-3 bg-secondary/10 rounded-full mx-auto w-fit mb-4">
              <BookOpen className="h-8 w-8 text-secondary" />
            </div>
            <div className="text-3xl font-bold text-secondary mb-2">{dashboardData.metrics.totalEducationPrograms}</div>
            <div className="text-sm text-base-content/70 mb-1">Education Programs</div>
            <div className="text-xs text-blue-600">Training opportunities</div>
          </ACTCard>

          <ACTCard variant="gradient" className="text-center p-6">
            <div className="p-3 bg-accent/10 rounded-full mx-auto w-fit mb-4">
              <Target className="h-8 w-8 text-accent" />
            </div>
            <div className="text-3xl font-bold text-accent mb-2">{dashboardData.metrics.profileCompletion}%</div>
            <div className="text-sm text-base-content/70 mb-1">Profile Complete</div>
            <div className="text-xs text-orange-600">Boost visibility</div>
          </ACTCard>

          <ACTCard variant="gradient" className="text-center p-6">
            <div className="p-3 bg-moss-green/10 rounded-full mx-auto w-fit mb-4">
              <Award className="h-8 w-8 text-moss-green" />
            </div>
            <div className="text-3xl font-bold text-moss-green mb-2">{partnerProfile?.partnership_level}</div>
            <div className="text-sm text-base-content/70 mb-1">Partnership Level</div>
            <div className="text-xs text-green-600">Expand benefits</div>
          </ACTCard>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <ACTFrameElement variant="open" size="md" className="text-center mb-6">
          <h2 className="text-3xl font-bold text-midnight-forest mb-2">
            Quick Actions
          </h2>
          <p className="text-lg text-base-content/70">
            Manage your partnership and opportunities
          </p>
        </ACTFrameElement>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ACTCard variant="outlined" className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary">Job Management</h3>
            </div>
            <p className="text-base-content/70 mb-4">
              Post new jobs and manage existing listings to attract climate talent
            </p>
            <div className="space-y-2">
              <ACTButton variant="primary" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Post New Job
              </ACTButton>
              <ACTButton variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View All Jobs
              </ACTButton>
            </div>
          </ACTCard>

          <ACTCard variant="outlined" className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-secondary/10 rounded-full">
                <BookOpen className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-secondary">Education Programs</h3>
            </div>
            <p className="text-base-content/70 mb-4">
              Create and manage training programs for climate workforce development
            </p>
            <div className="space-y-2">
              <ACTButton variant="secondary" size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Program
              </ACTButton>
              <ACTButton variant="outline" size="sm" className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Manage Programs
              </ACTButton>
            </div>
          </ACTCard>

          <ACTCard variant="outlined" className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-accent/10 rounded-full">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-accent">Talent Pipeline</h3>
            </div>
            <p className="text-base-content/70 mb-4">
              Access job seekers and build your climate workforce pipeline
            </p>
            <div className="space-y-2">
              <ACTButton variant="accent" size="sm" className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Browse Candidates
              </ACTButton>
              <ACTButton variant="outline" size="sm" className="w-full">
                <TrendingUp className="h-4 w-4 mr-2" />
                View Analytics
              </ACTButton>
            </div>
          </ACTCard>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <ACTFrameElement variant="brackets" size="lg" className="text-center mb-6">
          <h2 className="text-3xl font-bold text-midnight-forest mb-2">
            Recent Job Postings
          </h2>
          <p className="text-lg text-base-content/70">
            Your latest opportunities in the climate economy
          </p>
        </ACTFrameElement>

        {dashboardData.recentJobListings.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {dashboardData.recentJobListings.map((job: any) => (
              <ACTCard key={job.id} variant="outlined" className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-midnight-forest">{job.title}</h3>
                    <p className="text-base-content/70">
                      {job.location} • {job.employment_type} • {job.experience_level}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {job.climate_focus?.slice(0, 3).map((focus: string, index: number) => (
                        <span key={index} className="badge badge-primary badge-sm">
                          {focus}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`badge ${job.is_active ? 'badge-success' : 'badge-warning'}`}>
                      {job.is_active ? 'Active' : 'Draft'}
                    </div>
                    <p className="text-xs text-base-content/60 mt-1">
                      {new Date(job.created_at).toLocaleDateString()}
                    </p>
      </div>
      </div>
              </ACTCard>
            ))}
      </div>
        ) : (
          <ACTCard variant="outlined" className="text-center p-8">
            <Building className="h-12 w-12 text-base-content/40 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-midnight-forest mb-2">No Job Postings Yet</h3>
            <p className="text-base-content/70 mb-4">
              Start building your climate workforce by posting your first job opportunity
            </p>
            <ACTButton variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Job
            </ACTButton>
          </ACTCard>
        )}
      </section>

      {/* CTA Section */}
      <section className="flex justify-center gap-4">
        <ACTButton variant="primary" size="lg" href="/partners/jobs">
          Manage Jobs
          <Briefcase className="h-5 w-5 ml-2" />
        </ACTButton>
        <ACTButton variant="secondary" size="lg" href="/partners/profile">
          Edit Profile
          <Building className="h-5 w-5 ml-2" />
        </ACTButton>
      </section>
    </div>
  )
} 