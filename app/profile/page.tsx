/**
 * Profile Page - Climate Economy Assistant
 * User profile management page
 * Location: app/profile/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navigation, Footer } from "@/components/layout";
import { IOSLayout, IOSSection } from "@/components/layout/IOSLayout";
import { ACTCard } from "@/components/ui";
import { ResumeUploadSection } from "@/components/profile/ResumeUploadSection";
import { CareerPreferencesSection } from "@/components/profile/CareerPreferencesSection";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect("/auth/login?redirect=/profile");
  }

  // Get user profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get job seeker profile if exists
  const { data: jobSeekerProfile } = await supabase
    .from('job_seeker_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <IOSLayout backgroundColor="gradient" animated>
      <Navigation />
      
      <IOSSection spacing="xl">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-helvetica font-medium text-midnight-forest mb-4">
                Your Profile
              </h1>
              <p className="text-body text-midnight-forest/70">
                Manage your account information and career preferences.
              </p>
            </div>

            {/* Profile Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Account Info */}
              <ACTCard
                variant="outlined"
                title="Account Information"
                className="h-fit"
              >
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-midnight-forest/70">Email</label>
                    <div className="text-midnight-forest font-medium">{user.email}</div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-midnight-forest/70">Member Since</label>
                    <div className="text-midnight-forest font-medium">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-midnight-forest/70">Account Status</label>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-spring-green rounded-full"></div>
                      <span className="text-midnight-forest font-medium">Active</span>
                    </div>
                  </div>

                  {profile?.role && (
                    <div>
                      <label className="text-sm font-medium text-midnight-forest/70">Account Type</label>
                      <div className="text-midnight-forest font-medium capitalize">{profile.role}</div>
                    </div>
                  )}
                </div>
              </ACTCard>

              {/* Quick Actions */}
              <ACTCard
                variant="outlined"
                title="Quick Actions"
                className="h-fit"
              >
                <div className="space-y-3">
                  <a 
                    href="/assistant" 
                    className="block w-full p-3 bg-spring-green/5 rounded-lg hover:bg-spring-green/10 transition-colors"
                  >
                    <div className="font-medium text-midnight-forest">AI Career Assistant</div>
                    <div className="text-sm text-midnight-forest/70">Get personalized career guidance</div>
                  </a>
                  
                  <a 
                    href="/job-seekers" 
                    className="block w-full p-3 bg-seafoam-blue/5 rounded-lg hover:bg-seafoam-blue/10 transition-colors"
                  >
                    <div className="font-medium text-midnight-forest">Browse Jobs</div>
                    <div className="text-sm text-midnight-forest/70">Find climate career opportunities</div>
                  </a>

                  <a 
                    href="/dashboard" 
                    className="block w-full p-3 bg-moss-green/5 rounded-lg hover:bg-moss-green/10 transition-colors"
                  >
                    <div className="font-medium text-midnight-forest">Dashboard</div>
                    <div className="text-sm text-midnight-forest/70">View your activity and progress</div>
                  </a>
                </div>
              </ACTCard>
            </div>

            {/* Resume Upload Section */}
            <div className="mb-8">
              <ResumeUploadSection 
                userId={user.id} 
                hasExistingResume={!!jobSeekerProfile?.resume_content}
                currentResumeData={jobSeekerProfile}
              />
            </div>

            {/* Career Preferences Section */}
            <div className="mb-8">
              <CareerPreferencesSection 
                userId={user.id}
                currentPreferences={jobSeekerProfile}
              />
            </div>
          </div>
        </div>
      </IOSSection>
      
      <Footer />
    </IOSLayout>
  );
}

export const metadata = {
  title: "Profile - Climate Economy Assistant",
  description: "Manage your account and career preferences",
}; 