/**
 * Homepage - Climate Economy Assistant
 * Modern landing page with enhanced authentication integration
 * Location: app/page.tsx
 */

'use client';

import { useAuth } from '@/contexts/auth-context';
import { ACTButton } from '@/components/ACTButton';
import { ACTCard } from '@/components/ACTCard';
import { ACTFrameElement } from '@/components/ACTFrameElement';
import { SimpleLayout } from '@/components/SimpleLayout';
import { 
  ArrowRight, 
  Users, 
  Building2, 
  Briefcase, 
  BookOpen,
  Target,
  Zap,
  Globe,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Star
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <SimpleLayout>
      <div className="min-h-screen bg-gradient-to-br from-sand-gray/30 via-white to-seafoam-blue/20">
        
        {/* Enhanced Hero Section with Better Visual Hierarchy */}
        <section className="relative py-20 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-midnight-forest/5 via-transparent to-spring-green/5"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-spring-green/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          
          <div className="relative max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start space-x-4 mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-spring-green to-moss-green rounded-3xl flex items-center justify-center shadow-ios-normal">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-left">
                    <h1 className="text-5xl lg:text-6xl font-helvetica font-bold text-midnight-forest leading-tight">
                      Climate Economy
                    </h1>
                    <h2 className="text-4xl lg:text-5xl font-helvetica font-bold text-spring-green leading-tight">
                      Assistant
                    </h2>
                  </div>
                </div>
                
                <p className="text-2xl font-inter text-midnight-forest/70 mb-8 max-w-3xl leading-relaxed">
                  Navigate your career transition to Massachusetts' clean energy economy with AI-powered guidance, 
                  personalized job matching, and comprehensive training resources.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <ACTButton 
                    variant="primary" 
                    size="xl"
                    icon={<ArrowRight className="w-6 h-6" />}
                    iconPosition="right"
                    href={user ? "/dashboard" : "/login"}
                    className="shadow-ios-normal hover:shadow-ios-prominent"
                  >
                    {user ? "Go to Dashboard" : "Get Started"}
                  </ACTButton>
                  <ACTButton 
                    variant="outline" 
                    size="xl"
                    icon={<MessageSquare className="w-6 h-6" />}
                    href="/chat"
                    className="border-spring-green/30 hover:border-spring-green"
                  >
                    Try AI Assistant
                  </ACTButton>
                </div>

                {user && (
                  <div className="bg-spring-green/10 border border-spring-green/20 rounded-2xl p-4 max-w-md mx-auto lg:mx-0">
                    <p className="text-sm font-inter text-midnight-forest">
                      Welcome back! You're logged in as <span className="font-semibold text-spring-green">{user.email}</span>
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex-shrink-0">
                <ACTFrameElement variant="brackets" className="p-8">
                  <div className="text-center space-y-6">
                    <div>
                      <div className="text-5xl font-helvetica font-bold text-midnight-forest mb-2">
                        2,847
                      </div>
                      <p className="text-sm font-inter text-midnight-forest/60">
                        Job Seekers Connected
                      </p>
                    </div>
                    <div>
                      <div className="text-5xl font-helvetica font-bold text-spring-green mb-2">
                        67
                      </div>
                      <p className="text-sm font-inter text-midnight-forest/60">
                        Partner Organizations
                      </p>
                    </div>
                    <div>
                      <div className="text-5xl font-helvetica font-bold text-moss-green mb-2">
                        234
                      </div>
                      <p className="text-sm font-inter text-midnight-forest/60">
                        Active Job Listings
                      </p>
                    </div>
                  </div>
                </ACTFrameElement>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-helvetica font-bold text-midnight-forest mb-6">
                Your Gateway to Clean Energy Careers
              </h2>
              <p className="text-xl font-inter text-midnight-forest/70 max-w-3xl mx-auto leading-relaxed">
                Comprehensive tools and resources designed to accelerate your transition into Massachusetts' 
                thriving clean energy sector.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ACTCard 
                variant="glass" 
                className="p-8 bg-white/80 backdrop-blur-sm border border-white/40 hover:shadow-ios-normal transition-all duration-300"
                hover={true}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-spring-green/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-spring-green" />
                  </div>
                  <h3 className="text-2xl font-helvetica font-bold text-midnight-forest mb-4">
                    For Job Seekers
                  </h3>
                  <p className="text-midnight-forest/70 font-inter leading-relaxed mb-6">
                    Discover personalized career pathways, upload your resume for AI analysis, 
                    and connect with clean energy opportunities.
                  </p>
                  <ACTButton 
                    variant="outline" 
                    size="sm"
                    href="/job-seekers"
                    className="border-spring-green/30 hover:border-spring-green"
                  >
                    Explore Opportunities
                  </ACTButton>
                </div>
              </ACTCard>

              <ACTCard 
                variant="glass" 
                className="p-8 bg-white/80 backdrop-blur-sm border border-white/40 hover:shadow-ios-normal transition-all duration-300"
                hover={true}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-moss-green/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-8 h-8 text-moss-green" />
                  </div>
                  <h3 className="text-2xl font-helvetica font-bold text-midnight-forest mb-4">
                    For Partners
                  </h3>
                  <p className="text-midnight-forest/70 font-inter leading-relaxed mb-6">
                    Post job listings, access qualified candidates, and contribute to 
                    Massachusetts' clean energy workforce development.
                  </p>
                  <ACTButton 
                    variant="outline" 
                    size="sm"
                    href="/partners"
                    className="border-moss-green/30 hover:border-moss-green"
                  >
                    Partner With Us
                  </ACTButton>
                </div>
              </ACTCard>

              <ACTCard 
                variant="glass" 
                className="p-8 bg-white/80 backdrop-blur-sm border border-white/40 hover:shadow-ios-normal transition-all duration-300"
                hover={true}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-seafoam-blue/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-8 h-8 text-seafoam-blue" />
                  </div>
                  <h3 className="text-2xl font-helvetica font-bold text-midnight-forest mb-4">
                    AI-Powered Guidance
                  </h3>
                  <p className="text-midnight-forest/70 font-inter leading-relaxed mb-6">
                    Get personalized career advice, skill assessments, and job recommendations 
                    powered by advanced AI technology.
                  </p>
                  <ACTButton 
                    variant="outline" 
                    size="sm"
                    href="/chat"
                    className="border-seafoam-blue/30 hover:border-seafoam-blue"
                  >
                    Try AI Assistant
                  </ACTButton>
                </div>
              </ACTCard>
            </div>
          </div>
        </section>

        {/* Enhanced Statistics Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-spring-green/5 to-seafoam-blue/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-helvetica font-bold text-midnight-forest mb-6">
                Driving Massachusetts' Clean Energy Future
              </h2>
              <p className="text-xl font-inter text-midnight-forest/70 max-w-3xl mx-auto leading-relaxed">
                Real impact, measurable results, and growing opportunities in the clean energy sector.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl lg:text-6xl font-helvetica font-bold text-spring-green mb-4">
                  89%
                </div>
                <p className="text-lg font-inter text-midnight-forest font-medium mb-2">
                  Job Placement Rate
                </p>
                <p className="text-sm font-inter text-midnight-forest/60">
                  Successful career transitions
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-5xl lg:text-6xl font-helvetica font-bold text-moss-green mb-4">
                  $78K
                </div>
                <p className="text-lg font-inter text-midnight-forest font-medium mb-2">
                  Average Salary
                </p>
                <p className="text-sm font-inter text-midnight-forest/60">
                  Clean energy positions
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-5xl lg:text-6xl font-helvetica font-bold text-seafoam-blue mb-4">
                  156
                </div>
                <p className="text-lg font-inter text-midnight-forest font-medium mb-2">
                  Training Programs
                </p>
                <p className="text-sm font-inter text-midnight-forest/60">
                  Available statewide
                </p>
              </div>
              
              <div className="text-center">
                <div className="text-5xl lg:text-6xl font-helvetica font-bold text-midnight-forest mb-4">
                  24/7
                </div>
                <p className="text-lg font-inter text-midnight-forest font-medium mb-2">
                  AI Support
                </p>
                <p className="text-sm font-inter text-midnight-forest/60">
                  Always available guidance
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <ACTFrameElement variant="brackets" className="p-12">
              <h2 className="text-4xl lg:text-5xl font-helvetica font-bold text-midnight-forest mb-6">
                Ready to Transform Your Career?
              </h2>
              <p className="text-xl font-inter text-midnight-forest/70 mb-8 leading-relaxed">
                Join thousands of professionals building Massachusetts' clean energy future. 
                Start your journey today with personalized AI guidance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ACTButton 
                  variant="primary" 
                  size="xl"
                  icon={<ArrowRight className="w-6 h-6" />}
                  iconPosition="right"
                  href={user ? "/dashboard" : "/login"}
                  className="shadow-ios-normal hover:shadow-ios-prominent"
                >
                  {user ? "Continue Your Journey" : "Start Your Journey"}
                </ACTButton>
                <ACTButton 
                  variant="outline" 
                  size="xl"
                  icon={<MessageSquare className="w-6 h-6" />}
                  href="/chat"
                  className="border-spring-green/30 hover:border-spring-green"
                >
                  Chat with AI Assistant
                </ACTButton>
              </div>
            </ACTFrameElement>
          </div>
        </section>
      </div>
    </SimpleLayout>
  );
}
