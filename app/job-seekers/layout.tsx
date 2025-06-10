import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brain, FileText, TrendingUp, BookOpen, User, Shield } from "lucide-react";

export default async function JobSeekersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/auth/login");
  }

  // Check if user is a job seeker using correct user_id field
  const { data: jobSeekerProfile, error: profileError } = await supabase
    .from("job_seeker_profiles")
    .select("id, profile_completed, full_name")
    .eq("user_id", user.id)
    .single();

  // If no job seeker profile found, redirect to general dashboard
  if (profileError || !jobSeekerProfile) {
    console.log('Job seeker profile not found:', profileError, 'User ID:', user.id)
    redirect("/dashboard");
  }

  // If profile is not completed, redirect to setup
  if (!jobSeekerProfile.profile_completed) {
    redirect("/job-seekers/setup");
  }

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Job Seekers specific navigation */}
      <div className="w-full border-b bg-base-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto py-3 px-4">
          <div className="flex gap-6 items-center text-sm justify-between flex-wrap">
            <div className="flex gap-4 items-center flex-wrap">
              <Link
                href="/job-seekers"
                className="btn btn-ghost btn-sm gap-2"
                aria-label="AI Job Search"
              >
                <Brain className="h-4 w-4" />
                <span className="hidden sm:inline">AI Job Search</span>
                <span className="sm:hidden">Jobs</span>
              </Link>
              <Link
                href="/job-seekers/resume"
                className="btn btn-ghost btn-sm gap-2"
                aria-label="Skills Translation"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Skills Translation</span>
                <span className="sm:hidden">Skills</span>
              </Link>
              <Link
                href="/job-seekers/career-pathways"
                className="btn btn-ghost btn-sm gap-2"
                aria-label="Career Pathways"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Career Pathways</span>
                <span className="sm:hidden">Careers</span>
              </Link>
              <Link
                href="/job-seekers/training"
                className="btn btn-ghost btn-sm gap-2"
                aria-label="Training & Upskilling"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Training & Resources</span>
                <span className="sm:hidden">Training</span>
              </Link>
              <Link
                href="/job-seekers/profile"
                className="btn btn-ghost btn-sm gap-2"
                aria-label="Profile Settings"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
                <span className="sm:hidden">Profile</span>
              </Link>
            </div>
            
            {/* User info */}
            <div className="flex items-center gap-2 text-sm">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">
                {jobSeekerProfile.full_name || 'Job Seeker'}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
} 