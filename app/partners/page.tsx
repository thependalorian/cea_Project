/**
 * Partners Page - Climate Economy Assistant
 * Partner organization dashboard and collaboration hub
 * Location: app/partners/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navigation, Footer } from "@/components/layout";
import { IOSLayout, IOSSection } from "@/components/layout/IOSLayout";
import { ACTCard, ACTButton, ACTFrameElement, BottomCTA } from "@/components/ui";
import { 
  ArrowRight, 
  Award,
  Briefcase,
  Building2,
  CheckCircle,
  Heart,
  Star,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';

export default async function PartnersPage() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Check partner role
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "partner") {
    redirect("/dashboard");
  }

  // Get partner stats (mock data for now)
  const partnerStats = {
    jobsPosted: 24,
    candidatesMatched: 156,
    successfulHires: 43,
    programsActive: 8
  };

  return (
    <IOSLayout backgroundColor="gradient" animated>
      <Navigation />
      
      {/* Hero Section */}
      <IOSSection spacing="xl">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <ACTFrameElement variant="full" size="xl" className="bg-gradient-to-r from-moss-green/10 to-seafoam-blue/10 border border-moss-green/20 shadow-ios-normal">
            <div className="text-center p-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-moss-green/10 rounded-ios-xl">
                  <Building2 className="h-12 w-12 text-moss-green" />
                </div>
              </div>
              
              <h1 className="text-ios-large-title font-sf-pro font-semibold text-midnight-forest mb-4">
                Partner with ACT
              </h1>
              <p className="text-ios-title-3 font-sf-pro text-midnight-forest/80 mb-8 max-w-3xl mx-auto">
                Empower the climate workforce together. Connect with skilled professionals, 
                shape training programs, and build the clean energy economy across Massachusetts.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ACTButton variant="primary" size="lg" href="/partners/apply" className="font-sf-pro">
                  Become a Partner
                  <ArrowRight className="h-5 w-5 ml-2" />
                </ACTButton>
                <ACTButton variant="outline" size="lg" href="/partners/programs" className="font-sf-pro">
                  View Programs
                </ACTButton>
              </div>
            </div>
          </ACTFrameElement>

          {/* Partner Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            <ACTCard variant="glass" className="text-center p-6 shadow-ios-subtle">
              <div className="p-3 bg-moss-green/10 rounded-ios-xl w-fit mx-auto mb-4">
                <Briefcase className="h-6 w-6 text-moss-green" />
              </div>
              <div className="text-ios-title-1 font-sf-pro font-bold text-midnight-forest mb-2">
                {partnerStats.jobsPosted}
              </div>
              <div className="text-ios-body font-sf-pro text-midnight-forest/70">Jobs Posted</div>
            </ACTCard>

            <ACTCard variant="glass" className="text-center p-6 shadow-ios-subtle">
              <div className="p-3 bg-seafoam-blue/10 rounded-ios-xl w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-seafoam-blue" />
              </div>
              <div className="text-ios-title-1 font-sf-pro font-bold text-midnight-forest mb-2">
                {partnerStats.candidatesMatched}
              </div>
              <div className="text-ios-body font-sf-pro text-midnight-forest/70">Candidates Matched</div>
            </ACTCard>

            <ACTCard variant="glass" className="text-center p-6 shadow-ios-subtle">
              <div className="p-3 bg-spring-green/10 rounded-ios-xl w-fit mx-auto mb-4">
                <Award className="h-6 w-6 text-spring-green" />
              </div>
              <div className="text-ios-title-1 font-sf-pro font-bold text-midnight-forest mb-2">
                {partnerStats.successfulHires}
              </div>
              <div className="text-ios-body font-sf-pro text-midnight-forest/70">Successful Hires</div>
            </ACTCard>

            <ACTCard variant="glass" className="text-center p-6 shadow-ios-subtle">
              <div className="p-3 bg-sand-gray/10 rounded-ios-xl w-fit mx-auto mb-4">
                <Target className="h-6 w-6 text-sand-gray" />
              </div>
              <div className="text-ios-title-1 font-sf-pro font-bold text-midnight-forest mb-2">
                {partnerStats.programsActive}
              </div>
              <div className="text-ios-body font-sf-pro text-midnight-forest/70">Active Programs</div>
            </ACTCard>
          </div>
        </div>
      </IOSSection>

      {/* Partnership Benefits */}
      <IOSSection spacing="lg">
        <div className="container mx-auto px-4 max-w-6xl">
          <ACTFrameElement variant="open" size="md" className="text-center mb-12">
            <h2 className="text-ios-title-1 font-sf-pro font-semibold text-midnight-forest mb-4">
              Why Partner with ACT?
            </h2>
            <p className="text-ios-title-3 font-sf-pro text-midnight-forest/70 max-w-3xl mx-auto">
              Join leading organizations building Massachusetts' clean energy workforce
            </p>
          </ACTFrameElement>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ACTCard variant="outlined" className="p-8 shadow-ios-subtle hover:shadow-ios-normal transition-all">
              <div className="p-4 bg-spring-green/10 rounded-ios-xl w-fit mb-6">
                <Users className="h-8 w-8 text-spring-green" />
              </div>
              <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-4">
                Access Skilled Talent
              </h3>
              <p className="text-ios-body font-sf-pro text-midnight-forest/70 mb-6">
                Connect with pre-screened candidates whose skills have been validated and translated 
                to climate economy roles through our AI-powered matching system.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-spring-green" />
                  <span className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">Skills verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-spring-green" />
                  <span className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">Career coaching support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-spring-green" />
                  <span className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">Diverse candidate pool</span>
                </div>
              </div>
            </ACTCard>

            <ACTCard variant="outlined" className="p-8 shadow-ios-subtle hover:shadow-ios-normal transition-all">
              <div className="p-4 bg-moss-green/10 rounded-ios-xl w-fit mb-6">
                <TrendingUp className="h-8 w-8 text-moss-green" />
              </div>
              <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-4">
                Shape Training Programs
              </h3>
              <p className="text-ios-body font-sf-pro text-midnight-forest/70 mb-6">
                Collaborate on curriculum development, provide mentorship opportunities, 
                and ensure training aligns with real industry needs and job requirements.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-moss-green" />
                  <span className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">Curriculum input</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-moss-green" />
                  <span className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">Mentorship programs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-moss-green" />
                  <span className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">Industry-aligned skills</span>
                </div>
              </div>
            </ACTCard>

            <ACTCard variant="outlined" className="p-8 shadow-ios-subtle hover:shadow-ios-normal transition-all">
              <div className="p-4 bg-seafoam-blue/10 rounded-ios-xl w-fit mb-6">
                <Heart className="h-8 w-8 text-seafoam-blue" />
              </div>
              <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-4">
                Build Community Impact
              </h3>
              <p className="text-ios-body font-sf-pro text-midnight-forest/70 mb-6">
                Make a measurable difference in Massachusetts communities by creating 
                pathways to family-sustaining careers in the growing climate economy.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-seafoam-blue" />
                  <span className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">Economic mobility</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-seafoam-blue" />
                  <span className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">Community partnerships</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-seafoam-blue" />
                  <span className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">Measurable outcomes</span>
                </div>
              </div>
            </ACTCard>
          </div>
        </div>
      </IOSSection>

      {/* Partner Testimonials */}
      <IOSSection spacing="lg">
        <div className="container mx-auto px-4 max-w-6xl">
          <ACTFrameElement variant="open" size="md" className="text-center mb-12">
            <h2 className="text-ios-title-1 font-sf-pro font-semibold text-midnight-forest mb-4">
              What Our Partners Say
            </h2>
            <p className="text-ios-title-3 font-sf-pro text-midnight-forest/70">
              Hear from organizations already building the climate workforce
            </p>
          </ACTFrameElement>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ACTCard variant="glass" className="p-8 shadow-ios-normal">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-spring-green/10 rounded-ios-xl flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-spring-green" />
                </div>
                <div>
                  <h4 className="text-ios-subheadline font-sf-pro font-semibold text-midnight-forest">
                    Boston Clean Energy Consortium
                  </h4>
                  <p className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">
                    Solar Installation & Maintenance
                  </p>
                </div>
              </div>
              <blockquote className="text-ios-body font-sf-pro text-midnight-forest/80 mb-4">
                "ACT has transformed how we find and hire qualified solar technicians. The skills 
                translation feature helped us discover great candidates from construction and 
                electrical backgrounds we might have overlooked."
              </blockquote>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-spring-green text-spring-green" />
                ))}
              </div>
            </ACTCard>

            <ACTCard variant="glass" className="p-8 shadow-ios-normal">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-seafoam-blue/10 rounded-ios-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-seafoam-blue" />
                </div>
                <div>
                  <h4 className="text-ios-subheadline font-sf-pro font-semibold text-midnight-forest">
                    Massachusetts Clean Energy Center
                  </h4>
                  <p className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">
                    State Energy Agency
                  </p>
                </div>
              </div>
              <blockquote className="text-ios-body font-sf-pro text-midnight-forest/80 mb-4">
                "The partnership with ACT has amplified our workforce development initiatives. 
                Their platform connects our training programs directly with career opportunities, 
                creating a seamless pathway for job seekers."
              </blockquote>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-seafoam-blue text-seafoam-blue" />
                ))}
              </div>
            </ACTCard>
          </div>
        </div>
      </IOSSection>

      {/* Partnership Tiers */}
      <IOSSection spacing="lg">
        <div className="container mx-auto px-4 max-w-6xl">
          <ACTFrameElement variant="open" size="md" className="text-center mb-12">
            <h2 className="text-ios-title-1 font-sf-pro font-semibold text-midnight-forest mb-4">
              Partnership Levels
            </h2>
            <p className="text-ios-title-3 font-sf-pro text-midnight-forest/70">
              Choose the partnership level that fits your organization's goals
            </p>
          </ACTFrameElement>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Community Partner */}
            <ACTCard variant="outlined" className="p-8 text-center shadow-ios-subtle hover:shadow-ios-normal transition-all">
              <div className="p-4 bg-moss-green/10 rounded-ios-xl w-fit mx-auto mb-6">
                <Heart className="h-8 w-8 text-moss-green" />
              </div>
              <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-2">
                Community Partner
              </h3>
              <p className="text-ios-body font-sf-pro text-midnight-forest/70 mb-6">
                Perfect for local organizations and nonprofits
              </p>
              <div className="text-left space-y-3 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-moss-green" />
                  <span className="text-ios-caption-1 font-sf-pro">Job posting access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-moss-green" />
                  <span className="text-ios-caption-1 font-sf-pro">Candidate matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-moss-green" />
                  <span className="text-ios-caption-1 font-sf-pro">Basic analytics</span>
                </div>
              </div>
              <ACTButton variant="outline" size="md" className="w-full font-sf-pro">
                Learn More
              </ACTButton>
            </ACTCard>

            {/* Industry Partner */}
            <ACTCard variant="outlined" className="p-8 text-center shadow-ios-normal border-spring-green/40 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-spring-green text-midnight-forest px-4 py-1 rounded-ios-full text-ios-caption-1 font-sf-pro font-medium">
                  Most Popular
                </span>
              </div>
              <div className="p-4 bg-spring-green/10 rounded-ios-xl w-fit mx-auto mb-6">
                <Building2 className="h-8 w-8 text-spring-green" />
              </div>
              <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-2">
                Industry Partner
              </h3>
              <p className="text-ios-body font-sf-pro text-midnight-forest/70 mb-6">
                Ideal for employers and training providers
              </p>
              <div className="text-left space-y-3 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-spring-green" />
                  <span className="text-ios-caption-1 font-sf-pro">Everything in Community</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-spring-green" />
                  <span className="text-ios-caption-1 font-sf-pro">Priority candidate access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-spring-green" />
                  <span className="text-ios-caption-1 font-sf-pro">Custom training programs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-spring-green" />
                  <span className="text-ios-caption-1 font-sf-pro">Dedicated support</span>
                </div>
              </div>
              <ACTButton variant="primary" size="md" className="w-full font-sf-pro">
                Get Started
              </ACTButton>
            </ACTCard>

            {/* Strategic Partner */}
            <ACTCard variant="outlined" className="p-8 text-center shadow-ios-subtle hover:shadow-ios-normal transition-all">
              <div className="p-4 bg-seafoam-blue/10 rounded-ios-xl w-fit mx-auto mb-6">
                <Award className="h-8 w-8 text-seafoam-blue" />
              </div>
              <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-2">
                Strategic Partner
              </h3>
              <p className="text-ios-body font-sf-pro text-midnight-forest/70 mb-6">
                For large organizations shaping policy
              </p>
              <div className="text-left space-y-3 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-seafoam-blue" />
                  <span className="text-ios-caption-1 font-sf-pro">Everything in Industry</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-seafoam-blue" />
                  <span className="text-ios-caption-1 font-sf-pro">Policy collaboration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-seafoam-blue" />
                  <span className="text-ios-caption-1 font-sf-pro">Research partnerships</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-seafoam-blue" />
                  <span className="text-ios-caption-1 font-sf-pro">Executive access</span>
                </div>
              </div>
              <ACTButton variant="outline" size="md" className="w-full font-sf-pro">
                Contact Us
              </ACTButton>
            </ACTCard>
          </div>
        </div>
      </IOSSection>

      {/* Bottom CTA */}
      <BottomCTA
        title="Ready to Partner with ACT?"
        subtitle="Build the climate workforce together and create lasting impact in Massachusetts communities."
        primaryCTA={{
          text: "Start Partnership",
          href: "/partners/apply",
          icon: <Building2 className="h-5 w-5" />
        }}
        secondaryCTA={{
          text: "Schedule Call",
          href: "/contact"
        }}
        variant="gradient"
      />
      
      <Footer />
    </IOSLayout>
  );
} 