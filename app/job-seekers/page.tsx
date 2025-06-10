/**
 * Job Seekers Page - Climate Economy Assistant
 * Job seeker dashboard and profile management
 * Location: app/job-seekers/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navigation, Footer } from "@/components/layout";
import { IOSLayout, IOSSection } from "@/components/layout/IOSLayout";
import { ChatWindow } from "@/components/chat/chat-window";
import { ResumeUpload } from "@/components/resume/resume-upload";
import { JobSearchPanel } from "@/components/career/job-search-panel";
import { SkillsTranslator } from "@/components/career/skills-translator";
import { CareerPathways } from "@/components/career/career-pathways";
import { ACTCard, ACTButton, ACTFrameElement, BottomCTA } from "@/components/ui";
import { Brain, FileText, Search, TrendingUp, ArrowRight, Star, Target, Users, Briefcase } from "lucide-react";

export default async function JobSeekersPage() {
  const supabase = await createClient();

  // Get current user and check authentication
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Get job seeker profile using correct user_id field
  const { data: profile, error: profileError } = await supabase
    .from('job_seeker_profiles')
    .select('*')
    .eq('user_id', user.id)  // Changed from eq('id', user?.id) to proper user_id field
    .single();

  if (profileError || !profile) {
    console.log('Job seeker profile error:', profileError, 'User ID:', user.id)
    redirect("/dashboard");  // Redirect if not a job seeker
  }

  if (!profile.profile_completed) {
    redirect("/job-seekers/setup");  // Redirect to setup if profile incomplete
  }

  // Get user interests/job applications using correct field references
  const { data: userInterests, error: interestsError } = await supabase
    .from('user_interests')
    .select(`
      id,
      created_at,
      resource_type,
      job_listings (
        id,
        title,
        company_name,
        location,
        employment_type,
        created_at
      )
    `)
    .eq('user_id', user.id)
    .eq('resource_type', 'job_listing')
    .order('created_at', { ascending: false })
    .limit(5);

  if (interestsError) {
    console.error('Error fetching user interests:', interestsError)
  }

  const userName = profile?.full_name || user?.email?.split('@')[0] || 'Climate Professional';
  const profileCompletion = profile?.profile_completed || false;
  const recentJobs = userInterests || [];

  return (
    <IOSLayout backgroundColor="gradient" animated>
      <Navigation />
      
      <IOSSection spacing="xl">
        <div className="container py-8 space-y-12 max-w-6xl">
          {/* Hero Section with ACT Components */}
          <ACTFrameElement variant="full" size="xl" className="bg-gradient-to-r from-spring-green/10 to-seafoam-blue/10 border border-spring-green/20 shadow-ios-normal">
            <div className="text-center p-8">
              <h1 className="text-ios-large-title font-sf-pro font-semibold text-midnight-forest mb-4">
                Welcome, {userName}
              </h1>
              <p className="text-ios-title-3 font-sf-pro text-midnight-forest/80 mb-6">
                Your personalized guide to clean energy careers in Massachusetts
              </p>
              
              {/* Stats using ACT Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <ACTCard variant="outlined" className="text-center p-4 shadow-ios-subtle">
                  <div className="text-ios-title-1 font-sf-pro font-bold text-spring-green mb-1">89%</div>
                  <div className="text-ios-body font-sf-pro text-midnight-forest/70">Job Match Score</div>
                  <div className="text-ios-caption-1 font-sf-pro text-spring-green">Based on your skills</div>
                </ACTCard>
                
                <ACTCard variant="outlined" className="text-center p-4 shadow-ios-subtle">
                  <div className="text-ios-title-1 font-sf-pro font-bold text-seafoam-blue mb-1">452</div>
                  <div className="text-ios-body font-sf-pro text-midnight-forest/70">Climate Jobs</div>
                  <div className="text-ios-caption-1 font-sf-pro text-seafoam-blue">Available in MA</div>
                </ACTCard>
                
                <ACTCard variant="outlined" className="text-center p-4 shadow-ios-subtle">
                  <div className="text-ios-title-1 font-sf-pro font-bold text-moss-green mb-1">{profileCompletion ? '100%' : '45%'}</div>
                  <div className="text-ios-body font-sf-pro text-midnight-forest/70">Profile Complete</div>
                  <div className="text-ios-caption-1 font-sf-pro text-moss-green">Boost your visibility</div>
                </ACTCard>
              </div>
            </div>
          </ACTFrameElement>

          {/* Primary Tools Section */}
          <section className="space-y-6">
            <ACTFrameElement variant="open" size="md" className="text-center">
              <h2 className="text-ios-title-1 font-sf-pro font-semibold text-midnight-forest mb-2">
                Your Career Tools
              </h2>
              <p className="text-ios-title-3 font-sf-pro text-midnight-forest/70">
                Access all the resources you need for your clean energy career journey
              </p>
            </ACTFrameElement>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Career Assistant Chat */}
              <ACTCard 
                variant="gradient" 
                className="border border-spring-green/20 hover:border-spring-green/30 transition-all p-6 shadow-ios-normal hover:shadow-ios-prominent"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-spring-green/10 rounded-ios-xl">
                    <Brain className="h-6 w-6 text-spring-green" />
                  </div>
                  <h3 className="text-ios-title-3 font-sf-pro font-semibold text-spring-green">
                    AI Career Assistant
                  </h3>
                </div>
                <p className="text-ios-body font-sf-pro text-midnight-forest/70 mb-4">
                  Get personalized guidance for your clean energy career path
                </p>
                <div className="h-[400px] rounded-ios-lg overflow-hidden border border-sand-gray/30 mb-4 shadow-ios-subtle">
                  <ChatWindow />
                </div>
                <ACTButton variant="outline" size="sm" className="w-full font-sf-pro">
                  View Conversation History
                  <ArrowRight className="h-4 w-4 ml-2" />
                </ACTButton>
              </ACTCard>

              {/* Resume Management */}
              <ACTCard 
                variant="gradient" 
                className="border border-seafoam-blue/20 hover:border-seafoam-blue/30 transition-all p-6 shadow-ios-normal hover:shadow-ios-prominent"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-seafoam-blue/10 rounded-ios-xl">
                    <FileText className="h-6 w-6 text-seafoam-blue" />
                  </div>
                  <h3 className="text-ios-title-3 font-sf-pro font-semibold text-seafoam-blue">
                    Resume & Skills Analysis
                  </h3>
                </div>
                <p className="text-ios-body font-sf-pro text-midnight-forest/70 mb-4">
                  Upload and analyze your resume to discover climate career matches
                </p>
                <ACTFrameElement variant="open" size="sm" className="bg-sand-gray/50 p-4 mb-4 rounded-ios-lg">
                  <ResumeUpload />
                </ACTFrameElement>
                
                {recentJobs && recentJobs.length > 0 ? (
                  <ACTFrameElement variant="full" size="sm" className="bg-spring-green/10 text-spring-green p-3 mb-4 rounded-ios-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span className="text-ios-body font-sf-pro">Resume uploaded and analyzed! Your skills match 78% of clean energy jobs.</span>
                    </div>
                  </ACTFrameElement>
                ) : (
                  <ACTFrameElement variant="full" size="sm" className="bg-moss-green/10 text-moss-green p-3 mb-4 rounded-ios-lg">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span className="text-ios-body font-sf-pro">Upload your resume for personalized career recommendations</span>
                    </div>
                  </ACTFrameElement>
                )}
                
                <ACTButton variant="secondary" size="sm" className="w-full font-sf-pro">
                  View Skills Report
                  <Target className="h-4 w-4 ml-2" />
                </ACTButton>
              </ACTCard>
            </div>
          </section>

          {/* Secondary Tools Section */}
          <section className="space-y-6">
            <ACTFrameElement variant="open" size="md" className="text-center">
              <h2 className="text-ios-title-1 font-sf-pro font-semibold text-midnight-forest mb-2">
                Explore Opportunities
              </h2>
              <p className="text-ios-title-3 font-sf-pro text-midnight-forest/70">
                Discover jobs, translate your skills, and explore career pathways
              </p>
            </ACTFrameElement>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Job Search */}
              <ACTCard variant="outlined" className="p-6 shadow-ios-subtle hover:shadow-ios-normal transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-moss-green/10 rounded-ios-xl">
                    <Search className="h-6 w-6 text-moss-green" />
                  </div>
                  <h3 className="text-ios-title-3 font-sf-pro font-semibold text-moss-green">
                    Job Search
                  </h3>
                </div>
                <p className="text-ios-body font-sf-pro text-midnight-forest/70 mb-4">
                  Search and filter climate economy jobs matching your skills and interests
                </p>
                <div className="mb-4">
                  <JobSearchPanel />
                </div>
                <ACTButton variant="outline" size="sm" className="w-full font-sf-pro">
                  View All Jobs
                  <Search className="h-4 w-4 ml-2" />
                </ACTButton>
              </ACTCard>

              {/* Skills Translator */}
              <ACTCard variant="outlined" className="p-6 shadow-ios-subtle hover:shadow-ios-normal transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-seafoam-blue/10 rounded-ios-xl">
                    <Target className="h-6 w-6 text-seafoam-blue" />
                  </div>
                  <h3 className="text-ios-title-3 font-sf-pro font-semibold text-seafoam-blue">
                    Skills Translator
                  </h3>
                </div>
                <p className="text-ios-body font-sf-pro text-midnight-forest/70 mb-4">
                  Translate your existing skills to climate economy opportunities
                </p>
                <div className="mb-4">
                  <SkillsTranslator />
                </div>
                <ACTButton variant="outline" size="sm" className="w-full font-sf-pro">
                  Start Translation
                  <TrendingUp className="h-4 w-4 ml-2" />
                </ACTButton>
              </ACTCard>

              {/* Career Pathways */}
              <ACTCard variant="outlined" className="p-6 shadow-ios-subtle hover:shadow-ios-normal transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-spring-green/10 rounded-ios-xl">
                    <TrendingUp className="h-6 w-6 text-spring-green" />
                  </div>
                  <h3 className="text-ios-title-3 font-sf-pro font-semibold text-spring-green">
                    Career Pathways
                  </h3>
                </div>
                <p className="text-ios-body font-sf-pro text-midnight-forest/70 mb-4">
                  Explore structured pathways into different climate economy sectors
                </p>
                <div className="mb-4">
                  <CareerPathways />
                </div>
                <ACTButton variant="outline" size="sm" className="w-full font-sf-pro">
                  Explore Pathways
                  <Users className="h-4 w-4 ml-2" />
                </ACTButton>
              </ACTCard>
            </div>
          </section>

          {/* Recent Activity */}
          {recentJobs && recentJobs.length > 0 && (
            <section className="space-y-6">
              <ACTFrameElement variant="open" size="md" className="text-center">
                <h2 className="text-ios-title-1 font-sf-pro font-semibold text-midnight-forest mb-2">
                  Your Recent Activity
                </h2>
                <p className="text-ios-title-3 font-sf-pro text-midnight-forest/70">
                  Jobs you've shown interest in and recent interactions
                </p>
              </ACTFrameElement>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentJobs.slice(0, 3).map((interest: any, index: number) => (
                  <ACTCard key={index} variant="outlined" className="p-4 shadow-ios-subtle">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-spring-green/10 rounded-ios-button">
                        <Briefcase className="h-4 w-4 text-spring-green" />
                      </div>
                      <div>
                        <h4 className="text-ios-subheadline font-sf-pro font-medium text-midnight-forest">
                          {interest.job_listings?.title || 'Job Opportunity'}
                        </h4>
                        <p className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">
                          {interest.job_listings?.company_name || 'Climate Company'}
                        </p>
                      </div>
                    </div>
                    <p className="text-ios-caption-1 font-sf-pro text-midnight-forest/60 mb-3">
                      {interest.job_listings?.location || 'Massachusetts'} • {interest.job_listings?.employment_type || 'Full-time'}
                    </p>
                    <ACTButton variant="ghost" size="sm" className="w-full font-sf-pro">
                      View Details
                    </ACTButton>
                  </ACTCard>
                ))}
              </div>
            </section>
          )}
        </div>
      </IOSSection>

      {/* Bottom CTA */}
      <BottomCTA
        title="Accelerate Your Climate Career"
        subtitle="Get personalized guidance, skill translation, and job matching powered by AI."
        primaryCTA={{
          text: "Upgrade to Premium",
          href: "/pricing",
          icon: <Star className="h-5 w-5" />
        }}
        secondaryCTA={{
          text: "Explore Features",
          href: "/features"
        }}
        variant="gradient"
      />
      
      <Footer />
    </IOSLayout>
  );
} 