import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PartnerJobsTable from '@/components/partners/PartnerJobsTable'
import PartnerJobsFilters from '@/components/partners/PartnerJobsFilters'
import PartnerJobStats from '@/components/partners/PartnerJobStats'
import { Button } from '@/components/ui/button'
import { Plus, Download, BarChart3, Shield } from 'lucide-react'
import Link from 'next/link'

interface SearchParams {
  search?: string
  status?: string
  employment_type?: string
  page?: string
}

export default async function PartnerJobsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createClient()
  
  // Get current user and check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get partner profile using correct user ID field
  const { data: partner, error: partnerError } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('id', user.id)  // Changed from email-based lookup to user ID
    .single()

  if (partnerError || !partner) {
    console.log('Partner not found:', partnerError, 'User ID:', user.id)
    redirect('/dashboard')  // Redirect if not a partner
  }

  if (!partner.profile_completed) {
    redirect('/partners/setup')  // Redirect to setup if profile incomplete
  }

  // Build jobs query for this partner
  let query = supabase
    .from('job_listings')
    .select(`
      *,
      user_interests (
        id,
        created_at,
        job_seekers (
          first_name,
          last_name,
          email,
          climate_experience_level
        )
      )
    `)
    .eq('partner_id', partner.id)

  // Apply filters
  if (searchParams.search) {
    query = query.or(`title.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%,location.ilike.%${searchParams.search}%`)
  }

  if (searchParams.status) {
    query = query.eq('status', searchParams.status)
  }

  if (searchParams.employment_type) {
    query = query.eq('employment_type', searchParams.employment_type)
  }

  // Pagination
  const page = parseInt(searchParams.page || '1')
  const limit = 10
  const offset = (page - 1) * limit

  const { data: jobs, error, count } = await query
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('Failed to fetch jobs')
  }

  // Get job statistics
  const [
    { count: totalJobs },
    { count: activeJobs },
    { count: draftJobs },
    { count: expiredJobs },
    { count: totalApplications }
  ] = await Promise.all([
    supabase.from('job_listings').select('*', { count: 'exact', head: true }).eq('partner_id', partner.id),
    supabase.from('job_listings').select('*', { count: 'exact', head: true }).eq('partner_id', partner.id).eq('is_active', true),
    supabase.from('job_listings').select('*', { count: 'exact', head: true }).eq('partner_id', partner.id).eq('is_active', false),
    supabase.from('job_listings').select('*', { count: 'exact', head: true }).eq('partner_id', partner.id).lt('expires_at', new Date().toISOString()),
    supabase.from('user_interests')
      .select('*', { count: 'exact', head: true })
      .in('resource_id', 
        (await supabase.from('job_listings').select('id').eq('partner_id', partner.id)).data?.map((j: any) => j.id) || []
      )
  ])

  const statistics = {
    total: totalJobs || 0,
    active: activeJobs || 0,
    draft: draftJobs || 0,
    expired: expiredJobs || 0,
    applications: totalApplications || 0,
    totalPages: Math.ceil((count || 0) / limit)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Partner Job Listings</h1>
          <p className="text-muted-foreground">
            Manage your climate economy job listings in our curated ecosystem
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/partners/jobs/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New Listing
            </Button>
          </Link>
        </div>
      </div>

      {/* Ecosystem Notice */}
      <div className="bg-spring-green/5 border border-spring-green/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-spring-green/10 rounded-full">
            <svg className="h-4 w-4 text-spring-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-midnight-forest mb-1">
              Partner Ecosystem Application Flow
            </h3>
            <p className="text-sm text-midnight-forest/80">
              Applications are processed on your external websites. Our platform tracks candidate interest 
              and connects qualified matches (80%+ alignment) directly to your hiring team.
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <PartnerJobStats statistics={statistics} />
      {/* Filters */}
      <PartnerJobsFilters searchParams={searchParams} />
      {/* Jobs Table */}
      <PartnerJobsTable 
        jobs={jobs || []}
        currentPage={page}
        totalPages={statistics.totalPages}
        partnerId={partner.id}
      />
      {/* Empty State */}
      {(!jobs || jobs.length === 0) && (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No listings posted yet</h3>
          <p className="text-muted-foreground mb-4">
            Start connecting with climate talent by adding your first job listing to our curated ecosystem.
          </p>
          <Link href="/partners/jobs/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Listing
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
} 