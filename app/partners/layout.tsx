/**
 * Partners Layout - Climate Economy Assistant
 * Professional partner interface with sidebar navigation and resource management
 * Location: app/partners/layout.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PartnerSidebar } from "@/components/partners/PartnerSidebar";
import { PartnerHeader } from "@/components/partners/PartnerHeader";

interface PartnerProfile {
  id: string;
  user_id: string;
  organization_name: string;
  organization_type: string;
  contact_email: string | null;
  contact_phone: string | null;
  website_url: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
  total_jobs_posted: number;
  total_programs_created: number;
  total_resources_shared: number;
}

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/auth/login?redirectTo=/partners");
  }

  // Check partner access and get partner profile
  const { data: partnerProfile, error: partnerError } = await supabase
    .from('partner_profiles')
    .select(`
      id, user_id, organization_name, organization_type,
      contact_email, contact_phone, website_url, verified,
      created_at, updated_at
    `)
    .eq('user_id', user.id)
    .single();

  if (partnerError || !partnerProfile) {
    redirect("/partners/setup");
  }

  // Get resource counts for the partner
  const [jobsResult, programsResult, resourcesResult] = await Promise.allSettled([
    supabase
      .from('job_listings')
      .select('id', { count: 'exact', head: true })
      .eq('partner_id', user.id),
    supabase
      .from('education_programs')
      .select('id', { count: 'exact', head: true })
      .eq('partner_id', user.id),
    supabase
      .from('knowledge_resources')
      .select('id', { count: 'exact', head: true })
      .eq('partner_id', user.id)
  ]);

  const totalJobs = jobsResult.status === 'fulfilled' ? (jobsResult.value.count || 0) : 0;
  const totalPrograms = programsResult.status === 'fulfilled' ? (programsResult.value.count || 0) : 0;
  const totalResources = resourcesResult.status === 'fulfilled' ? (resourcesResult.value.count || 0) : 0;

  const profile = {
    ...partnerProfile,
    total_jobs_posted: totalJobs,
    total_programs_created: totalPrograms,
    total_resources_shared: totalResources,
    status: partnerProfile.verified ? 'verified' : 'pending_verification'
  };

  return (
    <div className="min-h-screen bg-sand-gray/5">
      {/* Partner Header */}
      <PartnerHeader profile={profile} user={user} />
      
      <div className="flex">
        {/* Partner Sidebar */}
        <PartnerSidebar profile={profile} />
        
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