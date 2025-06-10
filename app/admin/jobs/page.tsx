/**
 * Jobs Management Page - Climate Economy Assistant
 * Admin interface for managing job listings across all partners
 * Location: app/admin/jobs/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { JobsTable } from "@/components/admin/JobsTable";
import { ACTCard, ACTButton } from "@/components/ui";
import { Plus, Briefcase, MapPin, Calendar, TrendingUp, Shield } from "lucide-react";

export default async function AdminJobsPage() {
  const supabase = await createClient();

  // Check authentication and admin access
  const { data: { user } } = await supabase.auth.getUser();
  
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
            You need content management privileges to access job management functionality.
          </p>
        </ACTCard>
      </div>
    )
  }

  try {
    // Fetch all job listings with partner information
    const { data: jobs, error: jobsError } = await supabase
      .from('job_listings')
      .select(`
        *,
        partner_profiles!inner(
          organization_name,
          verified,
          partnership_level
        )
      `)
      .order('created_at', { ascending: false });

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
    }

    // Get job statistics
    const totalJobs = jobs?.length || 0;
    const activeJobs = jobs?.filter(job => job.is_active).length || 0;
    const jobsThisMonth = jobs?.filter(job => {
      const createdDate = new Date(job.created_at);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      return createdDate >= thisMonth;
    }).length || 0;

    // Get expired jobs
    const expiredJobs = jobs?.filter(job => {
      if (!job.expires_at) return false;
      return new Date(job.expires_at) < new Date();
    }).length || 0;

    // Get employment type breakdown
    const employmentTypes = jobs?.reduce((acc: any, job) => {
      const type = job.employment_type || 'Not specified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get location distribution
    const locations = jobs?.reduce((acc: any, job) => {
      const location = job.location || 'Remote/Not specified';
      acc[location] = (acc[location] || 0) + 1;
      return acc;
    }, {}) || {};

    const topLocations = Object.entries(locations)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-helvetica font-medium text-midnight-forest">
              Jobs Management
            </h1>
            <p className="text-body text-midnight-forest/70 mt-2">
              Oversee job listings, monitor posting trends, and manage employment opportunities
            </p>
          </div>
          <ACTButton variant="primary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Job Listing
          </ACTButton>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Total Jobs</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {totalJobs}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Active Listings</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {activeJobs}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Posted This Month</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {jobsThisMonth}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Expired</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {expiredJobs}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-red-500" />
            </div>
          </div>
        </div>

        {/* Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employment Types */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              Employment Types
            </h3>
            <div className="space-y-3">
              {Object.entries(employmentTypes).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-midnight-forest/70">{type}</span>
                  <span className="text-sm font-medium text-midnight-forest">{count as number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Locations */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              Top Locations
            </h3>
            <div className="space-y-3">
              {topLocations.map(([location, count]) => (
                <div key={location} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-midnight-forest/70">{location}</span>
                  </div>
                  <span className="text-sm font-medium text-midnight-forest">{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
              All Job Listings
            </h2>
            <p className="text-body text-midnight-forest/70 mt-1">
              Review and manage job postings from all partner organizations
            </p>
          </div>
          
          <JobsTable jobs={jobs || []} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in admin jobs page:', error);
    
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Jobs</h2>
          <p className="text-red-600">
            There was an error loading the jobs data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
}

export const metadata = {
  title: "Jobs Management - Admin Dashboard", 
  description: "Manage job listings and employment opportunities in the Climate Economy Assistant platform",
}; 