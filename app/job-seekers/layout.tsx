/**
 * Job Seekers Layout - Climate Economy Assistant
 * Professional job seeker interface with sidebar navigation and profile management
 * Location: app/job-seekers/layout.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { JobSeekerSidebar } from "@/components/job-seekers/JobSeekerSidebar";
import { JobSeekerHeader } from "@/components/job-seekers/JobSeekerHeader";

interface JobSeekerProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  current_title: string | null;
  experience_level: string | null;
  location: string | null;
  profile_completed: boolean;
  climate_focus_areas: any[];
  desired_roles: any[];
  employment_types: any[];
  preferred_locations: any[];
  salary_range_min: number | null;
  salary_range_max: number | null;
  remote_work_preference: string | null;
  resume_uploaded_at: string | null;
  created_at: string;
  updated_at: string;
}

export default async function JobSeekersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/auth/login?redirectTo=/job-seekers");
  }

  // Check job seeker access and get job seeker profile
  const { data: jobSeekerProfile, error: profileError } = await supabase
    .from('job_seeker_profiles')
    .select(`
      id, user_id, full_name, email, phone, current_title,
      experience_level, location, profile_completed,
      climate_focus_areas, desired_roles, employment_types,
      preferred_locations, salary_range_min, salary_range_max,
      remote_work_preference, resume_uploaded_at,
      created_at, updated_at
    `)
    .eq('user_id', user.id)
    .single();

  if (profileError || !jobSeekerProfile) {
    redirect("/job-seekers/setup");
  }

  // Get application and activity counts
  const [applicationsResult, savedJobsResult, interestsResult] = await Promise.allSettled([
    supabase
      .from('job_applications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('saved_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('user_interests')
      .select('*')
      .eq('user_id', user.id)
      .single()
  ]);

  const totalApplications = applicationsResult.status === 'fulfilled' ? 
    (applicationsResult.value.count || 0) : 0;
  const savedJobsCount = savedJobsResult.status === 'fulfilled' ? 
    (savedJobsResult.value.count || 0) : 0;
  const userInterests = interestsResult.status === 'fulfilled' ? 
    interestsResult.value.data : null;

  const profile = {
    ...jobSeekerProfile,
    total_applications: totalApplications,
    saved_jobs_count: savedJobsCount,
    has_resume: !!jobSeekerProfile.resume_uploaded_at,
    status: jobSeekerProfile.profile_completed ? 'active' : 'setup_required',
    notification_preferences: userInterests || {}
  };

  return (
    <div className="min-h-screen bg-sand-gray/5">
      {/* Job Seeker Header */}
      <JobSeekerHeader profile={profile} user={user} />
      
      <div className="flex">
        {/* Job Seeker Sidebar */}
        <JobSeekerSidebar profile={profile} />
        
        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 