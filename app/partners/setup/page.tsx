/**
 * Partner Setup Page - Climate Economy Assistant
 * Resource-focused setup and profile completion for various partner organization types
 * Location: app/partners/setup/page.tsx
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MainLayout } from "@/components/layout/MainLayout";
import { ModernHero } from "@/components/layout/ModernHero";
import { ContentSection } from "@/components/layout/ContentSection";
import { 
  Settings, 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  Users, 
  Building2, 
  Award,
  CheckCircle
} from "lucide-react";

export default async function PartnerSetupPage() {
  const supabase = await createClient()
  
  // Get current user and check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get partner profile to understand current setup status
  const { data: partnerProfile } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('id', user?.id)
    .single();

  const orgName = partnerProfile?.organization_name || user.user_metadata?.organization_name || 'Partner Organization'
  const orgType = partnerProfile?.organization_type || 'employer'
  const setupCompleted = partnerProfile?.profile_completed || false

  // Determine setup steps based on organization type
  const getSetupSteps = () => {
    const steps = [
      {
        id: 1,
        title: "Organization Profile",
        description: "Complete your organization's profile, contact details, and partnership capabilities.",
        icon: <Settings className="w-6 h-6" />,
        color: "spring-green",
        completed: setupCompleted
      },
      {
        id: 2,
        title: "Job Opportunities",
        description: "Create your first climate job listing to attract qualified candidates.",
        icon: <Briefcase className="w-6 h-6" />,
        color: "seafoam-blue",
        completed: false
      },
      {
        id: 3,
        title: "Education Programs",
        description: "Set up your first training program or certification offering.",
        icon: <GraduationCap className="w-6 h-6" />,
        color: "moss-green",
        completed: false
      },
      {
        id: 4,
        title: "Knowledge Resources",
        description: "Share your first valuable resource, guide, or research with the community.",
        icon: <BookOpen className="w-6 h-6" />,
        color: "midnight-forest",
        completed: false
      }
    ];

    return steps;
  };

  const setupSteps = getSetupSteps();

  return (
    <MainLayout showBottomCTA={false}>
      {/* Modern Hero Section */}
      <ModernHero 
        title={
          <span>
            Welcome to Climate Economy Assistant, <span className="text-spring-green">{orgName}</span>!
          </span>
        }
        subtitle={`Complete your ${orgType} partner setup to start contributing resources and connecting with Massachusetts' climate economy ecosystem.`}
        imageSrc="/images/partner-onboarding-illustration.svg"
        imagePosition="left"
        variant="gradient"
        fullHeight={false}
        primaryCTA={{
          text: "Go to Dashboard",
          href: "/partners"
        }}
        secondaryCTA={{
          text: "Complete Setup",
          href: "#setup-steps"
        }}
        highlightedStats={[
          { value: setupCompleted ? "✓" : "○", label: "Profile Status" },
          { value: orgType.replace('_', ' '), label: "Partner Type" },
          { value: "24/7", label: "AI Support" }
        ]}
      />

      {/* Setup Steps Section */}
      <section id="setup-steps" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-helvetica font-medium text-midnight-forest mb-4">
                Complete Your Partner Setup
              </h2>
              <p className="text-lg text-midnight-forest/70 max-w-2xl mx-auto">
                Simple steps to start contributing to Massachusetts' climate economy ecosystem as a {orgType.replace('_', ' ')}.
              </p>
            </div>

            {/* Dynamic Setup Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {setupSteps.map((step) => (
                <div key={step.id} className="bg-white rounded-2xl shadow-lg border border-sand-gray/20 p-8 text-center hover:shadow-xl transition-all duration-300 hover:scale-105 relative">
                  {step.completed && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle className="w-6 h-6 text-spring-green" />
                    </div>
                  )}
                  
                  <div className={`w-16 h-16 bg-gradient-to-br from-${step.color}/10 to-${step.color}/5 rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <div className={`w-8 h-8 bg-${step.color}/20 rounded-full flex items-center justify-center`}>
                      <span className={`text-${step.color} font-helvetica font-bold`}>{step.id}</span>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    {step.icon}
                  </div>
                  
                  <h3 className="text-xl font-helvetica font-medium text-midnight-forest mb-3">{step.title}</h3>
                  <p className="text-midnight-forest/70 mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {step.id === 4 && (
                    <p className="text-xs text-midnight-forest/50 mb-4">
                      *Requires admin review before publishing
                    </p>
                  )}
                  
                  <button className={`text-${step.color} hover:text-${step.color}/80 font-helvetica font-medium transition-colors`}>
                    {step.completed ? 'Review & Edit →' : 'Get Started →'}
                  </button>
                </div>
              ))}
            </div>

            {/* Partner Type Information */}
            <div className="bg-gradient-to-br from-sand-gray/5 to-spring-green/5 rounded-2xl p-8 border border-sand-gray/20">
              <h3 className="text-xl font-helvetica font-medium text-midnight-forest mb-6">
                Your Partner Type: {orgType.replace('_', ' ').split(' ').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-spring-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Building2 className="w-6 h-6 text-spring-green" />
                  </div>
                  <h4 className="font-helvetica font-medium text-midnight-forest mb-2">Organization Profile</h4>
                  <p className="text-sm text-midnight-forest/70">Showcase your mission and climate focus areas</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-seafoam-blue/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-seafoam-blue" />
                  </div>
                  <h4 className="font-helvetica font-medium text-midnight-forest mb-2">Resource Management</h4>
                  <p className="text-sm text-midnight-forest/70">Create and manage your climate economy contributions</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-moss-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-moss-green" />
                  </div>
                  <h4 className="font-helvetica font-medium text-midnight-forest mb-2">Community Impact</h4>
                  <p className="text-sm text-midnight-forest/70">Contribute to Massachusetts' clean energy transition</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <ContentSection
        title="Your Role in the Climate Economy"
        subtitle="Contribute resources and expertise to accelerate Massachusetts' clean energy transition"
        content="As a partner organization, you play a crucial role in building the climate economy ecosystem. Whether you're an employer posting jobs, an educator offering training, or a researcher sharing knowledge, your contributions help create pathways for professionals entering the climate economy."
        imageSrc="/images/partner-benefits-dashboard.jpg"
        imageAlt="Partner benefits and resource management dashboard"
        imagePosition="right"
        variant="feature"
        features={[
          {
            icon: <Briefcase className="h-5 w-5 text-spring-green" />,
            title: "Post Climate Opportunities",
            description: "Share job openings and internships in the climate sector to attract passionate professionals."
          },
          {
            icon: <GraduationCap className="h-5 w-5 text-spring-green" />,
            title: "Offer Training & Education",
            description: "Provide certifications, workshops, and educational programs to build climate skills."
          },
          {
            icon: <BookOpen className="h-5 w-5 text-spring-green" />,
            title: "Share Knowledge Resources",
            description: "Contribute research, guides, and insights that undergo admin review before publication."
          }
        ]}
      />

      {/* Getting Started */}
      <section className="py-16 bg-sand-gray/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-lg border border-sand-gray/20 p-8 md:p-12">
              <h3 className="text-2xl font-helvetica font-medium text-midnight-forest mb-6">
                Ready to Make an Impact?
              </h3>
              <p className="text-midnight-forest/70 leading-relaxed mb-8 max-w-2xl mx-auto">
                Complete your {orgType.replace('_', ' ')} setup and start contributing to Massachusetts' climate economy ecosystem today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/partners"
                  className="bg-spring-green hover:bg-spring-green/90 text-white px-8 py-4 rounded-xl font-helvetica font-medium transition-colors shadow-lg"
                >
                  {setupCompleted ? 'Go to Dashboard' : 'Continue Setup'}
                </Link>
                {!setupCompleted && (
                  <button className="border-2 border-spring-green text-spring-green hover:bg-spring-green hover:text-white px-8 py-4 rounded-xl font-helvetica font-medium transition-colors shadow-lg bg-white">
                    Complete Profile
                  </button>
                )}
              </div>
              
              <div className="mt-8 pt-8 border-t border-sand-gray/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-midnight-forest/60">
                  <div>
                    <strong>Profile Status:</strong> {setupCompleted ? 'Complete' : 'In Progress'}
                  </div>
                  <div>
                    <strong>Partner Type:</strong> {orgType.replace('_', ' ')}
                  </div>
                  <div>
                    <strong>Verification:</strong> {partnerProfile?.verified ? 'Verified' : 'Pending'}
                  </div>
                </div>
                
                <p className="text-sm text-midnight-forest/60 font-helvetica mt-4">
                  Need help? <Link href="/contact" className="text-spring-green hover:text-spring-green/80 transition-colors">Contact our support team</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
} 