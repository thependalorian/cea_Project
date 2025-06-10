/**
 * About Page - Climate Economy Assistant
 * Learn about our mission and impact
 * Location: app/about/page.tsx
 */

import { Navigation, Footer } from "@/components/layout";
import { IOSLayout, IOSSection } from "@/components/layout/IOSLayout";
import { ACTCard, ACTButton, ACTFrameElement, BottomCTA } from "@/components/ui";
import { 
  Target, 
  Users, 
  Briefcase, 
  TrendingUp,
  MapPin,
  Calendar,
  Award,
  Heart,
  Building2,
  Globe,
  Lightbulb,
  ArrowRight
} from "lucide-react";

export default function AboutPage() {
  return (
    <IOSLayout backgroundColor="gradient" animated>
      <Navigation />
      
      {/* Hero Section */}
      <IOSSection spacing="xl">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <ACTFrameElement variant="full" size="xl" className="bg-gradient-to-r from-seafoam-blue/10 to-spring-green/10 border border-seafoam-blue/20 shadow-ios-normal">
            <div className="text-center p-12">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-seafoam-blue/10 rounded-ios-xl">
                  <Globe className="h-12 w-12 text-seafoam-blue" />
                </div>
              </div>
              
              <h1 className="text-ios-large-title font-sf-pro font-semibold text-midnight-forest mb-6">
                About Climate Economy Assistant
              </h1>
              <p className="text-ios-title-3 font-sf-pro text-midnight-forest/80 max-w-4xl mx-auto mb-8">
                Democratizing access to climate economy careers for those who need it most. 
                We believe the transition to a clean energy economy should create opportunities 
                for everyone, especially communities that have been historically excluded from 
                economic advancement.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <ACTButton variant="primary" size="lg" href="/auth/sign-up" className="font-sf-pro">
                  Join Our Mission
                  <ArrowRight className="h-5 w-5 ml-2" />
                </ACTButton>
                <ACTButton variant="outline" size="lg" href="/contact" className="font-sf-pro">
                  Get Involved
                </ACTButton>
              </div>
            </div>
          </ACTFrameElement>

          {/* Mission Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            <ACTCard variant="glass" className="text-center p-6 shadow-ios-subtle">
              <div className="p-3 bg-spring-green/10 rounded-ios-xl w-fit mx-auto mb-4">
                <Briefcase className="h-6 w-6 text-spring-green" />
              </div>
              <div className="text-ios-title-1 font-sf-pro font-bold text-midnight-forest mb-2">38,000+</div>
              <div className="text-ios-body font-sf-pro text-midnight-forest/70">Climate Jobs by 2030</div>
            </ACTCard>

            <ACTCard variant="glass" className="text-center p-6 shadow-ios-subtle">
              <div className="p-3 bg-moss-green/10 rounded-ios-xl w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-moss-green" />
              </div>
              <div className="text-ios-title-1 font-sf-pro font-bold text-midnight-forest mb-2">108,450</div>
              <div className="text-ios-body font-sf-pro text-midnight-forest/70">Current Clean Energy Workers</div>
            </ACTCard>

            <ACTCard variant="glass" className="text-center p-6 shadow-ios-subtle">
              <div className="p-3 bg-seafoam-blue/10 rounded-ios-xl w-fit mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-seafoam-blue" />
              </div>
              <div className="text-ios-title-1 font-sf-pro font-bold text-midnight-forest mb-2">+80%</div>
              <div className="text-ios-body font-sf-pro text-midnight-forest/70">Growth Since 2010</div>
            </ACTCard>

            <ACTCard variant="glass" className="text-center p-6 shadow-ios-subtle">
              <div className="p-3 bg-sand-gray/10 rounded-ios-xl w-fit mx-auto mb-4">
                <Award className="h-6 w-6 text-sand-gray" />
              </div>
              <div className="text-ios-title-1 font-sf-pro font-bold text-midnight-forest mb-2">$14.9B</div>
              <div className="text-ios-body font-sf-pro text-midnight-forest/70">Industry GSP (2022)</div>
            </ACTCard>
          </div>
        </div>
      </IOSSection>

      {/* Our Communities */}
      <IOSSection spacing="lg">
        <div className="container mx-auto px-4 max-w-6xl">
          <ACTFrameElement variant="open" size="md" className="text-center mb-12">
            <h2 className="text-ios-title-1 font-sf-pro font-semibold text-midnight-forest mb-4">
              Our Communities
            </h2>
            <p className="text-ios-title-3 font-sf-pro text-midnight-forest/70 max-w-3xl mx-auto">
              Empowering diverse communities to access family-sustaining careers in the climate economy
            </p>
          </ACTFrameElement>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ACTCard variant="outlined" className="p-6 text-center shadow-ios-subtle hover:shadow-ios-normal transition-all">
              <div className="text-4xl mb-4">🪖</div>
              <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-3">Veterans</h3>
              <p className="text-ios-body font-sf-pro text-midnight-forest/70">
                Military-to-civilian skills translation and leadership opportunities
              </p>
            </ACTCard>

            <ACTCard variant="outlined" className="p-6 text-center shadow-ios-subtle hover:shadow-ios-normal transition-all">
              <div className="text-4xl mb-4">🏭</div>
              <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-3">Displaced Workers</h3>
              <p className="text-ios-body font-sf-pro text-midnight-forest/70">
                Transitioning from traditional industries to clean energy careers
              </p>
            </ACTCard>

            <ACTCard variant="outlined" className="p-6 text-center shadow-ios-subtle hover:shadow-ios-normal transition-all">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-3">Immigrants</h3>
              <p className="text-ios-body font-sf-pro text-midnight-forest/70">
                Credential evaluation and pathway navigation for newcomers
              </p>
            </ACTCard>

            <ACTCard variant="outlined" className="p-6 text-center shadow-ios-subtle hover:shadow-ios-normal transition-all">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-3">Early Career</h3>
              <p className="text-ios-body font-sf-pro text-midnight-forest/70">
                Students and recent graduates entering the climate workforce
              </p>
            </ACTCard>
          </div>
        </div>
      </IOSSection>

      {/* Our Approach */}
      <IOSSection spacing="lg">
        <div className="container mx-auto px-4 max-w-6xl">
          <ACTFrameElement variant="open" size="md" className="text-center mb-12">
            <h2 className="text-ios-title-1 font-sf-pro font-semibold text-midnight-forest mb-4">
              Our Approach
            </h2>
            <p className="text-ios-title-3 font-sf-pro text-midnight-forest/70 max-w-3xl mx-auto">
              Technology meets humanity to create pathways that honor each person's journey
            </p>
          </ACTFrameElement>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ACTCard variant="outlined" className="p-8 shadow-ios-subtle hover:shadow-ios-normal transition-all">
              <div className="p-4 bg-spring-green/10 rounded-ios-xl w-fit mb-6">
                <Target className="h-8 w-8 text-spring-green" />
              </div>
              <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-4">
                Skills Translation
              </h3>
              <p className="text-ios-body font-sf-pro text-midnight-forest/70">
                Advanced AI-powered analysis that identifies transferable skills and 
                maps them to climate economy opportunities with precision and respect.
              </p>
            </ACTCard>

            <ACTCard variant="outlined" className="p-8 shadow-ios-subtle hover:shadow-ios-normal transition-all">
              <div className="p-4 bg-moss-green/10 rounded-ios-xl w-fit mb-6">
                <Users className="h-8 w-8 text-moss-green" />
              </div>
              <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-4">
                Community Focus
              </h3>
              <p className="text-ios-body font-sf-pro text-midnight-forest/70">
                Tailored guidance for veterans, displaced workers, immigrants, 
                and early-career professionals entering the climate economy with dignity.
              </p>
            </ACTCard>

            <ACTCard variant="outlined" className="p-8 shadow-ios-subtle hover:shadow-ios-normal transition-all">
              <div className="p-4 bg-seafoam-blue/10 rounded-ios-xl w-fit mb-6">
                <Heart className="h-8 w-8 text-seafoam-blue" />
              </div>
              <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-4">
                Human-Centered
              </h3>
              <p className="text-ios-body font-sf-pro text-midnight-forest/70">
                Every interaction is designed to empower users with dignity, 
                respect, and genuine opportunities for economic advancement.
              </p>
            </ACTCard>
          </div>
        </div>
      </IOSSection>

      {/* Massachusetts Focus */}
      <IOSSection spacing="lg">
        <div className="container mx-auto px-4 max-w-6xl">
          <ACTCard variant="outlined" className="p-12 shadow-ios-normal">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="p-6 bg-spring-green/10 rounded-ios-xl">
                <MapPin className="h-12 w-12 text-spring-green" />
              </div>
              <div className="flex-1">
                <h2 className="text-ios-title-1 font-sf-pro font-semibold text-midnight-forest mb-6">
                  Proudly Massachusetts-Based
                </h2>
                <p className="text-ios-body font-sf-pro text-midnight-forest/80 mb-6">
                  Massachusetts leads the nation in clean energy innovation and job creation. 
                  Our platform is built specifically for the Massachusetts climate economy, 
                  with deep partnerships across the Commonwealth.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-spring-green/10 rounded-ios-lg">
                    <h4 className="text-ios-subheadline font-sf-pro font-semibold text-midnight-forest mb-2">
                      Gateway Cities Focus
                    </h4>
                    <p className="text-ios-body font-sf-pro text-midnight-forest/70">
                      Bridging opportunities between Boston's innovation and communities 
                      in Lowell, Lawrence, Worcester, and beyond.
                    </p>
                  </div>
                  <div className="p-4 bg-moss-green/10 rounded-ios-lg">
                    <h4 className="text-ios-subheadline font-sf-pro font-semibold text-midnight-forest mb-2">
                      Regional Partnerships
                    </h4>
                    <p className="text-ios-body font-sf-pro text-midnight-forest/70">
                      Connected with employers, training providers, and workforce 
                      development organizations across Massachusetts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ACTCard>
        </div>
      </IOSSection>

      {/* Our Impact */}
      <IOSSection spacing="lg">
        <div className="container mx-auto px-4 max-w-6xl">
          <ACTFrameElement variant="open" size="md" className="text-center mb-12">
            <h2 className="text-ios-title-1 font-sf-pro font-semibold text-midnight-forest mb-4">
              Measuring Our Impact
            </h2>
            <p className="text-ios-title-3 font-sf-pro text-midnight-forest/70 max-w-3xl mx-auto">
              Transparent reporting on how we're building Massachusetts' climate workforce
            </p>
          </ACTFrameElement>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ACTCard variant="glass" className="p-6 text-center shadow-ios-subtle">
              <div className="p-3 bg-spring-green/10 rounded-ios-xl w-fit mx-auto mb-4">
                <Users className="h-6 w-6 text-spring-green" />
              </div>
              <div className="text-ios-title-1 font-sf-pro font-bold text-midnight-forest mb-2">1,247</div>
              <div className="text-ios-body font-sf-pro text-midnight-forest/70 mb-1">Job Seekers Served</div>
              <div className="text-ios-caption-1 font-sf-pro text-spring-green">This quarter</div>
            </ACTCard>

            <ACTCard variant="glass" className="p-6 text-center shadow-ios-subtle">
              <div className="p-3 bg-moss-green/10 rounded-ios-xl w-fit mx-auto mb-4">
                <Briefcase className="h-6 w-6 text-moss-green" />
              </div>
              <div className="text-ios-title-1 font-sf-pro font-bold text-midnight-forest mb-2">342</div>
              <div className="text-ios-body font-sf-pro text-midnight-forest/70 mb-1">Successful Placements</div>
              <div className="text-ios-caption-1 font-sf-pro text-moss-green">Average $58K salary</div>
            </ACTCard>

            <ACTCard variant="glass" className="p-6 text-center shadow-ios-subtle">
              <div className="p-3 bg-seafoam-blue/10 rounded-ios-xl w-fit mx-auto mb-4">
                <Building2 className="h-6 w-6 text-seafoam-blue" />
              </div>
              <div className="text-ios-title-1 font-sf-pro font-bold text-midnight-forest mb-2">89</div>
              <div className="text-ios-body font-sf-pro text-midnight-forest/70 mb-1">Partner Organizations</div>
              <div className="text-ios-caption-1 font-sf-pro text-seafoam-blue">Across Massachusetts</div>
            </ACTCard>
          </div>
        </div>
      </IOSSection>

      {/* Team Values */}
      <IOSSection spacing="lg">
        <div className="container mx-auto px-4 max-w-6xl">
          <ACTFrameElement variant="full" size="xl" className="bg-gradient-to-r from-midnight-forest to-moss-green text-white p-12 shadow-ios-prominent">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white/10 rounded-ios-xl">
                  <Lightbulb className="h-12 w-12 text-spring-green" />
                </div>
              </div>
              
              <h2 className="text-ios-title-1 font-sf-pro font-semibold text-white mb-6">
                Built by People Who Understand
              </h2>
              <p className="text-ios-body font-sf-pro text-white/80 max-w-3xl mx-auto mb-8">
                Our team includes veterans, immigrants, career changers, and first-generation college graduates. 
                We've walked these paths ourselves, and we're committed to making them easier for others.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-ios-title-3 font-sf-pro font-bold text-spring-green mb-2">Equity</div>
                  <p className="text-ios-body font-sf-pro text-white/70">
                    Everyone deserves access to family-sustaining careers
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-ios-title-3 font-sf-pro font-bold text-spring-green mb-2">Innovation</div>
                  <p className="text-ios-body font-sf-pro text-white/70">
                    Technology should amplify human potential, not replace it
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-ios-title-3 font-sf-pro font-bold text-spring-green mb-2">Impact</div>
                  <p className="text-ios-body font-sf-pro text-white/70">
                    Measurable outcomes that strengthen communities
                  </p>
                </div>
              </div>
            </div>
          </ACTFrameElement>
        </div>
      </IOSSection>

      {/* Bottom CTA */}
      <BottomCTA
        title="Join the Climate Economy Movement"
        subtitle="Whether you're seeking a new career path or looking to partner with us, there's a place for you in building Massachusetts' clean energy future."
        primaryCTA={{
          text: "Start Your Journey",
          href: "/auth/sign-up",
          icon: <ArrowRight className="h-5 w-5" />
        }}
        secondaryCTA={{
          text: "Partner With Us",
          href: "/partners"
        }}
        variant="default"
      />
      
      <Footer />
    </IOSLayout>
  );
}

export const metadata = {
  title: "About - Climate Economy Assistant",
  description: "Learn about our mission to democratize access to climate economy careers",
}; 