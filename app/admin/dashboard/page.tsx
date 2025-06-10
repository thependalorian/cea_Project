import { createClient } from '@/lib/supabase/server'
import { ACTCard, ACTButton, ACTFrameElement } from '@/components/ui'
import { 
  Shield, 
  Users, 
  Building, 
  Briefcase, 
  BookOpen, 
  TrendingUp, 
  Settings, 
  AlertCircle,
  BarChart3,
  Database,
  UserCheck,
  Activity
} from 'lucide-react'

// Type definitions for dashboard data
interface JobSeeker {
  id: string
  full_name?: string
  location?: string
  experience_level?: string
  created_at: string
}

interface Partner {
  id: string
  organization_name: string
  organization_type: string
  verified: boolean
  created_at: string
}

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get dashboard metrics using v1 schema
  const [
    { count: totalJobSeekers },
    { count: totalPartners },
    { count: totalJobs },
    { count: totalEducationPrograms },
    { data: recentJobSeekers },
    { data: recentPartners }
  ] = await Promise.all([
    supabase.from('job_seeker_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('partner_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('job_listings').select('*', { count: 'exact', head: true }),
    supabase.from('education_programs').select('*', { count: 'exact', head: true }),
    supabase.from('job_seeker_profiles').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('partner_profiles').select('*').order('created_at', { ascending: false }).limit(5)
  ])

  // Calculate some additional metrics
  const { count: verifiedPartners } = await supabase
    .from('partner_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('verified', true)

  const { count: activeJobs } = await supabase
    .from('job_listings')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const dashboardData = {
    metrics: {
      totalJobSeekers: totalJobSeekers || 0,
      totalPartners: totalPartners || 0,
      verifiedPartners: verifiedPartners || 0,
      totalJobs: totalJobs || 0,
      activeJobs: activeJobs || 0,
      totalEducationPrograms: totalEducationPrograms || 0,
      systemHealth: 98.5 // Mock system health percentage
    },
    recentJobSeekers: recentJobSeekers || [],
    recentPartners: recentPartners || []
  }

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl">
      {/* Header Section */}
      <ACTFrameElement variant="full" size="xl" className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="p-8">
      <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-midnight-forest">
                  System Administration
                </h1>
                <p className="text-lg text-base-content/70 mt-2">
                  Climate Economy Assistant • System Overview & Management
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-base-content/60">
                System Admin • {user?.email}
              </div>
              <div className="text-sm font-medium text-success">
                System Status: Online
              </div>
            </div>
          </div>
        </div>
      </ACTFrameElement>

      {/* System Metrics Overview */}
      <section>
        <ACTFrameElement variant="open" size="md" className="text-center mb-6">
          <h2 className="text-3xl font-bold text-midnight-forest mb-2">
            Platform Overview
          </h2>
          <p className="text-lg text-base-content/70">
            Real-time metrics for the Climate Economy Assistant platform
          </p>
        </ACTFrameElement>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ACTCard variant="gradient" className="text-center p-6">
            <div className="p-3 bg-primary/10 rounded-full mx-auto w-fit mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="text-3xl font-bold text-primary mb-2">{dashboardData.metrics.totalJobSeekers}</div>
            <div className="text-sm text-base-content/70 mb-1">Job Seekers</div>
            <div className="text-xs text-green-600">Registered users</div>
          </ACTCard>

          <ACTCard variant="gradient" className="text-center p-6">
            <div className="p-3 bg-secondary/10 rounded-full mx-auto w-fit mb-4">
              <Building className="h-8 w-8 text-secondary" />
      </div>
            <div className="text-3xl font-bold text-secondary mb-2">{dashboardData.metrics.totalPartners}</div>
            <div className="text-sm text-base-content/70 mb-1">Partners</div>
            <div className="text-xs text-blue-600">{dashboardData.metrics.verifiedPartners} verified</div>
          </ACTCard>

          <ACTCard variant="gradient" className="text-center p-6">
            <div className="p-3 bg-accent/10 rounded-full mx-auto w-fit mb-4">
              <Briefcase className="h-8 w-8 text-accent" />
            </div>
            <div className="text-3xl font-bold text-accent mb-2">{dashboardData.metrics.totalJobs}</div>
            <div className="text-sm text-base-content/70 mb-1">Job Listings</div>
            <div className="text-xs text-orange-600">{dashboardData.metrics.activeJobs} active</div>
          </ACTCard>

          <ACTCard variant="gradient" className="text-center p-6">
            <div className="p-3 bg-moss-green/10 rounded-full mx-auto w-fit mb-4">
              <Activity className="h-8 w-8 text-moss-green" />
            </div>
            <div className="text-3xl font-bold text-moss-green mb-2">{dashboardData.metrics.systemHealth}%</div>
            <div className="text-sm text-base-content/70 mb-1">System Health</div>
            <div className="text-xs text-green-600">All systems operational</div>
          </ACTCard>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <ACTFrameElement variant="open" size="md" className="text-center mb-6">
          <h2 className="text-3xl font-bold text-midnight-forest mb-2">
            Administration Tools
          </h2>
          <p className="text-lg text-base-content/70">
            Manage users, partners, and system settings
          </p>
        </ACTFrameElement>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ACTCard variant="outlined" className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-primary">User Management</h3>
            </div>
            <p className="text-base-content/70 mb-4">
              Manage job seekers, view profiles, and moderate user activity
            </p>
            <div className="space-y-2">
              <ACTButton variant="primary" size="sm" className="w-full" href="/admin/users">
                <Users className="h-4 w-4 mr-2" />
                View All Users
              </ACTButton>
              <ACTButton variant="outline" size="sm" className="w-full" href="/admin/reviews">
                <UserCheck className="h-4 w-4 mr-2" />
                Moderation Queue
              </ACTButton>
            </div>
          </ACTCard>

          <ACTCard variant="outlined" className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-secondary/10 rounded-full">
                <Building className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-bold text-secondary">Partner Management</h3>
            </div>
            <p className="text-base-content/70 mb-4">
              Verify partners, manage relationships, and oversee job postings
            </p>
            <div className="space-y-2">
              <ACTButton variant="secondary" size="sm" className="w-full" href="/admin/partners">
                <Building className="h-4 w-4 mr-2" />
                View All Partners
              </ACTButton>
              <ACTButton variant="outline" size="sm" className="w-full" href="/admin/partner-verification">
                <UserCheck className="h-4 w-4 mr-2" />
                Verification Queue
              </ACTButton>
            </div>
          </ACTCard>

          <ACTCard variant="outlined" className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-accent/10 rounded-full">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold text-accent">Analytics & Reports</h3>
            </div>
            <p className="text-base-content/70 mb-4">
              View platform analytics, generate reports, and track metrics
            </p>
            <div className="space-y-2">
              <ACTButton variant="accent" size="sm" className="w-full" href="/admin/system-analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                View Analytics
              </ACTButton>
              <ACTButton variant="outline" size="sm" className="w-full" href="/admin/reports">
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Report
              </ACTButton>
            </div>
          </ACTCard>

          <ACTCard variant="outlined" className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-moss-green/10 rounded-full">
                <Briefcase className="h-6 w-6 text-moss-green" />
              </div>
              <h3 className="text-xl font-bold text-moss-green">Job Listings</h3>
            </div>
            <p className="text-base-content/70 mb-4">
              Moderate job postings, manage listings, and oversee applications
            </p>
            <div className="space-y-2">
              <ACTButton variant="primary" size="sm" className="w-full" href="/admin/jobs">
                <Briefcase className="h-4 w-4 mr-2" />
                Manage Jobs
              </ACTButton>
              <ACTButton variant="outline" size="sm" className="w-full" href="/admin/job-moderation">
                <AlertCircle className="h-4 w-4 mr-2" />
                Review Queue
              </ACTButton>
            </div>
          </ACTCard>

          <ACTCard variant="outlined" className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-seafoam-blue/10 rounded-full">
                <BookOpen className="h-6 w-6 text-moss-green" />
              </div>
              <h3 className="text-xl font-bold text-moss-green">Education Programs</h3>
            </div>
            <p className="text-base-content/70 mb-4">
              Oversee training programs and educational resources
            </p>
            <div className="space-y-2">
              <ACTButton variant="secondary" size="sm" className="w-full" href="/admin/education-programs">
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Programs
              </ACTButton>
              <ACTButton variant="outline" size="sm" className="w-full" href="/admin/education-settings">
                <Settings className="h-4 w-4 mr-2" />
                Program Settings
              </ACTButton>
            </div>
          </ACTCard>

          <ACTCard variant="outlined" className="p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-sand-gray/10 rounded-full">
                <Database className="h-6 w-6 text-sand-gray" />
              </div>
              <h3 className="text-xl font-bold text-sand-gray">System Settings</h3>
            </div>
            <p className="text-base-content/70 mb-4">
              Configure system settings, manage API keys, and database tools
            </p>
            <div className="space-y-2">
              <ACTButton variant="ghost" size="sm" className="w-full" href="/admin/settings">
                <Settings className="h-4 w-4 mr-2" />
                System Config
              </ACTButton>
              <ACTButton variant="outline" size="sm" className="w-full" href="/admin/database">
                <Database className="h-4 w-4 mr-2" />
                Database Tools
              </ACTButton>
            </div>
          </ACTCard>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <ACTFrameElement variant="brackets" size="lg" className="text-center mb-6">
          <h2 className="text-3xl font-bold text-midnight-forest mb-2">
            Recent Platform Activity
          </h2>
          <p className="text-lg text-base-content/70">
            Latest users and partners joining the platform
          </p>
        </ACTFrameElement>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Job Seekers */}
          <ACTCard variant="outlined" className="p-6">
            <h3 className="text-xl font-bold text-midnight-forest mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Recent Job Seekers
            </h3>
            {dashboardData.recentJobSeekers.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentJobSeekers.map((jobSeeker: JobSeeker) => (
                  <div key={jobSeeker.id} className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                    <div>
                      <p className="font-medium">{jobSeeker.full_name || 'Anonymous User'}</p>
                      <p className="text-sm text-base-content/60">
                        {jobSeeker.location || 'Location not set'} • {jobSeeker.experience_level || 'Entry level'}
                      </p>
                    </div>
                    <div className="text-xs text-base-content/60">
                      {new Date(jobSeeker.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/60 text-center py-8">No recent job seekers</p>
            )}
          </ACTCard>

          {/* Recent Partners */}
          <ACTCard variant="outlined" className="p-6">
            <h3 className="text-xl font-bold text-midnight-forest mb-4 flex items-center gap-2">
              <Building className="h-5 w-5 text-secondary" />
              Recent Partners
            </h3>
            {dashboardData.recentPartners.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.recentPartners.map((partner: Partner) => (
                  <div key={partner.id} className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
                    <div>
                      <p className="font-medium">{partner.organization_name}</p>
                      <p className="text-sm text-base-content/60">
                        {partner.organization_type} • {partner.verified ? 'Verified' : 'Pending verification'}
                      </p>
                    </div>
                    <div className="text-xs text-base-content/60">
                      {new Date(partner.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-base-content/60 text-center py-8">No recent partners</p>
            )}
          </ACTCard>
        </div>
      </section>

      {/* System Status & Quick Links */}
      <section className="flex justify-center gap-4">
        <ACTButton variant="primary" size="lg" href="/admin/users">
          Manage Users
          <Users className="h-5 w-5 ml-2" />
        </ACTButton>
        <ACTButton variant="secondary" size="lg" href="/admin/partners">
          Manage Partners
          <Building className="h-5 w-5 ml-2" />
        </ACTButton>
        <ACTButton variant="outline" size="lg" href="/admin/settings">
          System Settings
          <Settings className="h-5 w-5 ml-2" />
        </ACTButton>
      </section>
    </div>
  )
} 