import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function JobSeekersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/auth/login");
  }

  // Get user role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const userRole = profile?.role || "user";

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Job Seekers specific navigation */}
      <div className="w-full border-b bg-base-200/50">
        <div className="max-w-5xl mx-auto py-2 px-4">
          <div className="flex gap-4 items-center text-sm">
            <Link 
              href="/protected/job-seekers" 
              className="btn btn-ghost btn-sm"
            >
              Job Search
            </Link>
            <Link 
              href="/protected/job-seekers/resume" 
              className="btn btn-ghost btn-sm"
            >
              Skills Translation
            </Link>
            <Link 
              href="/protected/job-seekers/resume-search" 
              className="btn btn-ghost btn-sm"
            >
              Career Pathways
            </Link>
            <Link 
              href="/protected/job-seekers/interviews" 
              className="btn btn-ghost btn-sm"
            >
              Upskill Yourself
            </Link>
            {userRole === "premium" && (
              <Link 
                href="/protected/job-seekers/premium" 
                className="btn btn-ghost btn-sm"
              >
                Premium Tools
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1">
        {children}
      </div>
    </div>
  );
} 