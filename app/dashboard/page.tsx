/**
 * Dashboard Page - Climate Economy Assistant
 * Main landing page for authenticated users with role-based redirection
 * Location: app/dashboard/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navigation, Footer } from "@/components/layout";
import { IOSLayout, IOSSection } from "@/components/layout/IOSLayout";
import { ACTCard, ACTButton } from "@/components/ui";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Check user role and redirect to appropriate dashboard
  
  // Check if user is admin
  const { data: adminProfile, error: adminError } = await supabase
    .from('admin_profiles')
    .select('can_manage_users, can_manage_partners, can_manage_content, can_view_analytics, can_manage_system, profile_completed, full_name')
    .eq('user_id', user.id)
    .single();

  console.log('Admin check:', { adminProfile, adminError, userId: user.id });

  if (adminProfile && adminProfile.profile_completed) {
    console.log('Redirecting to admin dashboard');
    redirect("/admin/dashboard");
  }

  // Check if user is partner  
  const { data: partnerProfile, error: partnerError } = await supabase
    .from('partner_profiles')
    .select('id, profile_completed, organization_name')
    .eq('id', user.id)
    .single();

  console.log('Partner check:', { partnerProfile, partnerError, userId: user.id });

  if (partnerProfile && partnerProfile.profile_completed) {
    console.log('Redirecting to partner dashboard');
    redirect("/partners/dashboard");
  }

  // Check if user is job seeker
  const { data: jobSeekerProfile, error: jobSeekerError } = await supabase
    .from('job_seeker_profiles')
    .select('id, profile_completed, full_name')
    .eq('user_id', user.id)
    .single();

  console.log('Job seeker check:', { jobSeekerProfile, jobSeekerError, userId: user.id });

  if (jobSeekerProfile && jobSeekerProfile.profile_completed) {
    console.log('Redirecting to job seeker dashboard');
    redirect("/job-seekers");
  }

  // If no specific profile found, check basic profiles table for role
  const { data: basicProfile, error: basicProfileError } = await supabase
    .from('profiles')
    .select('role, user_type, first_name, last_name')
    .eq('id', user.id)
    .single();

  console.log('Basic profile check:', { basicProfile, basicProfileError, userId: user.id });

  if (basicProfile) {
    switch (basicProfile.role) {
      case 'admin':
        console.log('Basic profile says admin, redirecting to admin dashboard');
        redirect("/admin/dashboard");
        break;
      case 'partner':
        console.log('Basic profile says partner, redirecting to partner dashboard');
        redirect("/partners/dashboard");
        break;
      case 'job_seeker':
        console.log('Basic profile says job_seeker, redirecting to job seekers');
        redirect("/job-seekers");
        break;
    }
  }

  // Default fallback - show generic dashboard with role selection
  const firstName = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'there';

  return (
    <IOSLayout backgroundColor="gradient" animated>
      <Navigation />
      
      <IOSSection spacing="xl">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-helvetica font-medium text-midnight-forest mb-8">
            Welcome, {firstName}!
          </h1>
          <p className="text-body text-midnight-forest/70 mb-8">
            Welcome to your Climate Economy Assistant dashboard. It looks like your profile setup isn't complete yet.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
            <ACTCard className="p-6 text-center">
              <h3 className="text-xl font-helvetica font-medium text-midnight-forest mb-4">
                Job Seeker
              </h3>
              <p className="text-body text-midnight-forest/70 mb-4">
                Find climate careers and build your sustainable future
              </p>
              <ACTButton variant="primary" className="w-full">
                <a href="/job-seekers" className="block w-full">Get Started</a>
              </ACTButton>
            </ACTCard>
            
            <ACTCard className="p-6 text-center">
              <h3 className="text-xl font-helvetica font-medium text-midnight-forest mb-4">
                Partner Organization
              </h3>
              <p className="text-body text-midnight-forest/70 mb-4">
                Post jobs and connect with climate talent
              </p>
              <ACTButton variant="secondary" className="w-full">
                <a href="/partners" className="block w-full">Join as Partner</a>
              </ACTButton>
            </ACTCard>
            
            <ACTCard className="p-6 text-center">
              <h3 className="text-xl font-helvetica font-medium text-midnight-forest mb-4">
                Administrator
              </h3>
              <p className="text-body text-midnight-forest/70 mb-4">
                Manage the platform and ecosystem
              </p>
              <ACTButton variant="outline" className="w-full">
                <a href="/admin" className="block w-full">Admin Access</a>
              </ACTButton>
            </ACTCard>
          </div>
        </div>
      </IOSSection>
      
      <Footer />
    </IOSLayout>
  );
}

export const metadata = {
  title: "Dashboard - Climate Economy Assistant",
  description: "Your climate career dashboard - find jobs, get guidance, and build your sustainable future",
}; 