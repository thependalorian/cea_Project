/**
 * Reports Page - Climate Economy Assistant
 * Admin page for generating and downloading platform reports
 * Location: app/admin/reports/page.tsx
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ACTCard, ACTButton, ACTFrameElement } from '@/components/ui'
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  Building,
  Briefcase,
  BookOpen,
  TrendingUp,
  BarChart3,
  Activity,
  Clock,
  Eye,
  Shield
} from 'lucide-react'

export default async function ReportsPage() {
  const supabase = await createClient()

  // Check authentication and admin access
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/auth/login");
  }

  // Verify admin access (analytics viewing or system privileges required)
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('can_view_analytics, can_manage_system, full_name')
    .eq('user_id', user.id)
    .single();

  if (!adminProfile || (!adminProfile.can_view_analytics && !adminProfile.can_manage_system)) {
    return (
      <div className="container mx-auto py-8">
        <ACTCard variant="outlined" className="p-8 text-center">
          <Shield className="h-16 w-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">Access Denied</h2>
          <p className="text-base-content/70">
            You need analytics viewing privileges to access reports functionality.
          </p>
        </ACTCard>
      </div>
    )
  }

  // Get basic metrics for report summaries
  const [
    { count: totalUsers },
    { count: totalPartners },
    { count: totalJobs },
    { count: totalResources }
  ] = await Promise.all([
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('partner_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('job_listings').select('*', { count: 'exact', head: true }),
    supabase.from('knowledge_resources').select('*', { count: 'exact', head: true })
  ])

  const reportTypes = [
    {
      id: 'user-activity',
      title: 'User Activity Report',
      description: 'Detailed analysis of user engagement, registrations, and platform usage',
      icon: Users,
      color: 'primary',
      metrics: { total: totalUsers || 0, label: 'Total Users' },
      timeOptions: ['7d', '30d', '90d', 'custom'],
      formats: ['PDF', 'CSV', 'Excel']
    },
    {
      id: 'partner-performance',
      title: 'Partner Performance Report',
      description: 'Partner verification status, job postings, and engagement metrics',
      icon: Building,
      color: 'secondary',
      metrics: { total: totalPartners || 0, label: 'Total Partners' },
      timeOptions: ['30d', '90d', '6m', 'custom'],
      formats: ['PDF', 'CSV', 'Excel']
    },
    {
      id: 'job-analytics',
      title: 'Job Market Analytics',
      description: 'Job listing performance, application rates, and market trends',
      icon: Briefcase,
      color: 'accent',
      metrics: { total: totalJobs || 0, label: 'Total Jobs' },
      timeOptions: ['30d', '90d', '6m', 'custom'],
      formats: ['PDF', 'CSV', 'Excel']
    },
    {
      id: 'content-usage',
      title: 'Content Usage Report',
      description: 'Resource access patterns, popular content, and educational metrics',
      icon: BookOpen,
      color: 'moss-green',
      metrics: { total: totalResources || 0, label: 'Total Resources' },
      timeOptions: ['30d', '90d', '6m', 'custom'],
      formats: ['PDF', 'CSV']
    },
    {
      id: 'system-health',
      title: 'System Health Report',
      description: 'Platform performance, error rates, and technical metrics',
      icon: Activity,
      color: 'info',
      metrics: { total: '98.5%', label: 'Uptime' },
      timeOptions: ['7d', '30d', '90d'],
      formats: ['PDF', 'JSON']
    },
    {
      id: 'financial-summary',
      title: 'Financial Summary',
      description: 'Revenue metrics, partnership values, and cost analysis',
      icon: TrendingUp,
      color: 'success',
      metrics: { total: 'Coming Soon', label: 'Revenue' },
      timeOptions: ['30d', '90d', '6m', '1y'],
      formats: ['PDF', 'Excel'],
      disabled: true
    }
  ]

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl">
      {/* Header */}
      <ACTFrameElement variant="full" size="xl" className="bg-gradient-to-r from-accent/10 to-primary/10">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/20 rounded-full">
                <FileText className="h-8 w-8 text-accent" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-midnight-forest">
                  Reports & Analytics
                </h1>
                <p className="text-lg text-base-content/70 mt-2">
                  Generate comprehensive reports and export platform data
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-base-content/60">
                {new Date().toLocaleDateString()}
              </div>
              <div className="text-sm font-medium text-accent">
                Data Export Center
              </div>
            </div>
          </div>
        </div>
      </ACTFrameElement>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-primary/10 rounded-full mx-auto w-fit mb-4">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary mb-1">{totalUsers || 0}</div>
          <div className="text-sm text-base-content/70">Active Users</div>
        </ACTCard>

        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-secondary/10 rounded-full mx-auto w-fit mb-4">
            <Building className="h-6 w-6 text-secondary" />
          </div>
          <div className="text-2xl font-bold text-secondary mb-1">{totalPartners || 0}</div>
          <div className="text-sm text-base-content/70">Partners</div>
        </ACTCard>

        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-accent/10 rounded-full mx-auto w-fit mb-4">
            <Briefcase className="h-6 w-6 text-accent" />
          </div>
          <div className="text-2xl font-bold text-accent mb-1">{totalJobs || 0}</div>
          <div className="text-sm text-base-content/70">Job Listings</div>
        </ACTCard>

        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-moss-green/10 rounded-full mx-auto w-fit mb-4">
            <BookOpen className="h-6 w-6 text-moss-green" />
          </div>
          <div className="text-2xl font-bold text-moss-green mb-1">{totalResources || 0}</div>
          <div className="text-sm text-base-content/70">Resources</div>
        </ACTCard>
      </div>

      {/* Report Types */}
      <section>
        <ACTFrameElement variant="brackets" size="lg" className="mb-6">
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">
            Available Reports
          </h2>
          <p className="text-base-content/70">
            Generate detailed reports for different aspects of the platform
          </p>
        </ACTFrameElement>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {reportTypes.map((report) => {
            const IconComponent = report.icon
            return (
              <ACTCard 
                key={report.id} 
                variant="outlined" 
                className={`p-6 ${report.disabled ? 'opacity-50' : 'hover:shadow-lg transition-all'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 bg-${report.color}/10 rounded-full`}>
                    <IconComponent className={`h-6 w-6 text-${report.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-midnight-forest">
                        {report.title}
                      </h3>
                      {report.disabled && (
                        <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    
                    <p className="text-base-content/70 mb-4">
                      {report.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">Current Metric</p>
                        <p className="font-bold text-lg">{report.metrics.total}</p>
                        <p className="text-xs text-base-content/60">{report.metrics.label}</p>
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">Export Formats</p>
                        <div className="flex flex-wrap gap-1">
                          {report.formats.map((format) => (
                            <span 
                              key={format}
                              className="px-2 py-1 bg-base-200 text-xs rounded"
                            >
                              {format}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <ACTButton 
                        variant={report.color as any} 
                        size="sm" 
                        className="flex-1"
                        disabled={report.disabled}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Generate Report
                      </ACTButton>
                      <ACTButton 
                        variant="outline" 
                        size="sm"
                        disabled={report.disabled}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </ACTButton>
                    </div>
                  </div>
                </div>
              </ACTCard>
            )
          })}
        </div>
      </section>

      {/* Recent Reports */}
      <section>
        <ACTFrameElement variant="open" size="md" className="mb-6">
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">
            Recent Reports
          </h2>
          <p className="text-base-content/70">
            Previously generated reports and exports
          </p>
        </ACTFrameElement>

        <ACTCard variant="outlined" className="p-6">
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-midnight-forest mb-2">
              No Recent Reports
            </h3>
            <p className="text-base-content/70 mb-4">
              Generate your first report to see the history here
            </p>
            <ACTButton variant="primary" href="#reports">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </ACTButton>
          </div>
        </ACTCard>
      </section>

      {/* Quick Actions */}
      <section className="flex justify-center gap-4">
        <ACTButton variant="primary" size="lg" href="/admin/system-analytics">
          <BarChart3 className="h-5 w-5 mr-2" />
          View Analytics
        </ACTButton>
        <ACTButton variant="secondary" size="lg" href="/admin/export-logs">
          <Download className="h-5 w-5 mr-2" />
          Export Logs
        </ACTButton>
        <ACTButton variant="outline" size="lg" href="/admin/dashboard">
          Back to Dashboard
        </ACTButton>
      </section>
    </div>
  )
} 