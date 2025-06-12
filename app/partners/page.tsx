/**
 * Partners Dashboard - Climate Economy Assistant
 * Comprehensive partner dashboard with resource management and analytics
 * Location: app/partners/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  Settings, 
  Plus,
  TrendingUp,
  Users,
  BarChart3,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Eye
} from "lucide-react";

export default async function PartnersDashboard() {
  const supabase = await createClient();
  
  // Get current user and verify partner access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  // Get partner profile
  const { data: partnerProfile } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!partnerProfile) throw new Error('Partner profile not found');

  // Get resource counts and recent data
  const [
    jobsResult,
    programsResult,
    resourcesResult,
    recentJobsResult,
    applicationsResult
  ] = await Promise.allSettled([
    supabase
      .from('job_listings')
      .select('id, title, created_at, is_active, application_count')
      .eq('partner_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('education_programs')
      .select('id, title, created_at, is_active, participant_count')
      .eq('partner_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('knowledge_resources')
      .select('id, title, created_at, is_published, view_count')
      .eq('partner_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('job_listings')
      .select('id, title, created_at, application_count')
      .eq('partner_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('job_applications')
      .select('id, created_at, status, job_listing_id')
      .in('job_listing_id', [])
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  const jobs = jobsResult.status === 'fulfilled' ? (jobsResult.value.data || []) : [];
  const programs = programsResult.status === 'fulfilled' ? (programsResult.value.data || []) : [];
  const resources = resourcesResult.status === 'fulfilled' ? (resourcesResult.value.data || []) : [];
  const recentJobs = recentJobsResult.status === 'fulfilled' ? (recentJobsResult.value.data || []) : [];

  const activeJobs = jobs.filter(job => job.is_active).length;
  const activePrograms = programs.filter(program => program.is_active).length;
  const publishedResources = resources.filter(resource => resource.is_published).length;
  const totalApplications = jobs.reduce((sum, job) => sum + (job.application_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-spring-green/10 to-seafoam-blue/10 rounded-2xl p-6 border border-sand-gray/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-helvetica font-bold text-midnight-forest mb-2">
              Welcome back, {partnerProfile.organization_name}!
            </h1>
            <p className="text-midnight-forest/70 font-helvetica">
              Manage your climate economy resources and track your impact on Massachusetts' clean energy transition.
            </p>
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-2">
                {partnerProfile.verified ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-helvetica font-medium text-green-600">Verified Partner</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-helvetica font-medium text-amber-600">Pending Verification</span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-helvetica text-midnight-forest/60 capitalize">
                  {partnerProfile.organization_type?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 text-spring-green">
              <TrendingUp className="w-5 h-5" />
              <span className="font-helvetica font-medium">Growing Impact</span>
            </div>
            <p className="text-sm text-midnight-forest/60 font-helvetica mt-1">
              {activeJobs + activePrograms + publishedResources} active resources
            </p>
          </div>
        </div>
      </div>

      {/* Resource Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-spring-green/10 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-spring-green" />
            </div>
            <div>
              <p className="text-2xl font-helvetica font-bold text-midnight-forest">
                {activeJobs}
              </p>
              <p className="text-sm text-midnight-forest/60 font-helvetica">Active Jobs</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-midnight-forest/40 font-helvetica">
              {totalApplications} applications
            </span>
            <span className="text-xs text-spring-green font-helvetica font-medium">
              +{jobs.length - activeJobs} drafts
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-seafoam-blue/10 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-seafoam-blue" />
            </div>
            <div>
              <p className="text-2xl font-helvetica font-bold text-midnight-forest">
                {activePrograms}
              </p>
              <p className="text-sm text-midnight-forest/60 font-helvetica">Education Programs</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-midnight-forest/40 font-helvetica">
              {programs.reduce((sum, p) => sum + (p.participant_count || 0), 0)} participants
            </span>
            <span className="text-xs text-seafoam-blue font-helvetica font-medium">
              +{programs.length - activePrograms} drafts
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-moss-green/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-moss-green" />
            </div>
            <div>
              <p className="text-2xl font-helvetica font-bold text-midnight-forest">
                {publishedResources}
              </p>
              <p className="text-sm text-midnight-forest/60 font-helvetica">Knowledge Resources</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-midnight-forest/40 font-helvetica">
              {resources.reduce((sum, r) => sum + (r.view_count || 0), 0)} views
            </span>
            <span className="text-xs text-moss-green font-helvetica font-medium">
              +{resources.length - publishedResources} pending
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-midnight-forest/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-midnight-forest" />
            </div>
            <div>
              <p className="text-2xl font-helvetica font-bold text-midnight-forest">
                {totalApplications}
              </p>
              <p className="text-sm text-midnight-forest/60 font-helvetica">Total Applications</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-midnight-forest/40 font-helvetica">
              This month
            </span>
            <span className="text-xs text-midnight-forest font-helvetica font-medium">
              +12% vs last month
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
        <h3 className="text-lg font-helvetica font-semibold text-midnight-forest mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 border border-sand-gray/20 rounded-xl hover:bg-spring-green/5 hover:border-spring-green/30 transition-all duration-200">
            <div className="w-10 h-10 bg-spring-green/10 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-spring-green" />
            </div>
            <div className="text-left">
              <p className="font-helvetica font-medium text-midnight-forest">Post New Job</p>
              <p className="text-sm text-midnight-forest/60 font-helvetica">Add a climate job opportunity</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 border border-sand-gray/20 rounded-xl hover:bg-seafoam-blue/5 hover:border-seafoam-blue/30 transition-all duration-200">
            <div className="w-10 h-10 bg-seafoam-blue/10 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-seafoam-blue" />
            </div>
            <div className="text-left">
              <p className="font-helvetica font-medium text-midnight-forest">Create Program</p>
              <p className="text-sm text-midnight-forest/60 font-helvetica">Add education or training program</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 border border-sand-gray/20 rounded-xl hover:bg-moss-green/5 hover:border-moss-green/30 transition-all duration-200">
            <div className="w-10 h-10 bg-moss-green/10 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-moss-green" />
            </div>
            <div className="text-left">
              <p className="font-helvetica font-medium text-midnight-forest">Share Resource</p>
              <p className="text-sm text-midnight-forest/60 font-helvetica">Contribute knowledge content</p>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Job Listings */}
        <div className="bg-white rounded-2xl border border-sand-gray/20 overflow-hidden">
          <div className="p-6 border-b border-sand-gray/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-helvetica font-semibold text-midnight-forest">
                Recent Job Listings
              </h3>
              <span className="text-sm text-midnight-forest/60 font-helvetica">
                {recentJobs.length} active
              </span>
            </div>
          </div>
          
          <div className="divide-y divide-sand-gray/10">
            {recentJobs.slice(0, 5).map((job) => (
              <div key={job.id} className="p-6 hover:bg-sand-gray/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-helvetica font-medium text-midnight-forest mb-1">
                      {job.title}
                    </h4>
                    <p className="text-sm text-midnight-forest/60 font-helvetica">
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-helvetica font-medium text-midnight-forest">
                      {job.application_count || 0} applications
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Eye className="w-3 h-3 text-midnight-forest/40" />
                      <span className="text-xs text-midnight-forest/40 font-helvetica">View details</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recentJobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-midnight-forest/20 mx-auto mb-4" />
              <p className="text-midnight-forest/60 font-helvetica">No job listings yet</p>
              <p className="text-sm text-midnight-forest/40 font-helvetica mt-1">
                Start by posting your first climate job opportunity
              </p>
            </div>
          )}
        </div>

        {/* Performance Analytics Preview */}
        <div className="bg-white rounded-2xl border border-sand-gray/20 overflow-hidden">
          <div className="p-6 border-b border-sand-gray/20">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-helvetica font-semibold text-midnight-forest">
                Performance Overview
              </h3>
              <BarChart3 className="w-5 h-5 text-midnight-forest/40" />
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-helvetica text-midnight-forest/70">Profile Views</span>
                <span className="text-sm font-helvetica font-medium text-midnight-forest">142 this month</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-helvetica text-midnight-forest/70">Application Rate</span>
                <span className="text-sm font-helvetica font-medium text-midnight-forest">8.3% avg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-helvetica text-midnight-forest/70">Resource Engagement</span>
                <span className="text-sm font-helvetica font-medium text-midnight-forest">65% completion</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-helvetica text-midnight-forest/70">Partner Score</span>
                <span className="text-sm font-helvetica font-medium text-spring-green">Excellent</span>
              </div>
            </div>
            
            {partnerProfile.verified && (
              <div className="mt-6 p-4 bg-spring-green/5 rounded-xl border border-spring-green/20">
                <p className="text-sm font-helvetica font-medium text-spring-green mb-1">
                  Verified Partner Benefits
                </p>
                <p className="text-xs text-midnight-forest/60 font-helvetica">
                  Access to advanced analytics, priority listing placement, and direct candidate messaging.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Partner Dashboard - Climate Economy Assistant",
  description: "Resource management dashboard for climate economy partners",
}; 