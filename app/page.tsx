import { ArrowRight, Brain, BookOpen, MessageSquare, GraduationCap } from 'lucide-react'
import { Navigation, Footer } from "@/components/layout";
import { IOSLayout, IOSSection, IOSGrid, IOSContainer } from "@/components/layout/IOSLayout";

export default function HomePage() {
  return (
    <IOSLayout backgroundColor="gradient" animated>
      <Navigation />
      
      {/* Hero Section */}
      <IOSSection 
        variant="glass" 
        spacing="xl" 
        headerAlignment="center"
        className="relative overflow-hidden"
      >
        <div className="text-center">
          <h1 className="text-ios-large-title font-sf-pro font-semibold text-midnight-forest mb-6 animate-ios-fade-in">
            Find Your Climate Career
          </h1>
          <p className="text-ios-body font-sf-pro text-midnight-forest/80 mb-8 max-w-3xl mx-auto">
            Massachusetts&apos;s most advanced AI-powered platform connecting passionate 
            professionals with meaningful climate jobs. Join 108,450+ workers building 
            the clean energy future.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="btn-ios-primary flex items-center gap-2">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </button>
            <button className="btn-ios-secondary">
              Browse Climate Jobs
            </button>
            </div>
            
          <IOSGrid columns={3} gap="lg" className="mt-12">
            <IOSContainer variant="glass" padding="lg" className="text-center">
              <div className="text-ios-title-2 font-sf-pro font-semibold text-spring-green mb-2">108,450+</div>
              <div className="text-ios-footnote font-sf-pro text-midnight-forest/70">Climate Workers</div>
            </IOSContainer>
            <IOSContainer variant="glass" padding="lg" className="text-center">
              <div className="text-ios-title-2 font-sf-pro font-semibold text-moss-green mb-2">7,315</div>
              <div className="text-ios-footnote font-sf-pro text-midnight-forest/70">Climate Companies</div>
            </IOSContainer>
            <IOSContainer variant="glass" padding="lg" className="text-center">
              <div className="text-ios-title-2 font-sf-pro font-semibold text-midnight-forest mb-2">$14.9B</div>
              <div className="text-ios-footnote font-sf-pro text-midnight-forest/70">Industry Value</div>
            </IOSContainer>
          </IOSGrid>
              </div>
      </IOSSection>

      {/* Massachusetts Climate Economy Stats Section */}
      <IOSSection 
        title="Massachusetts Climate Economy Impact"
        subtitle="Join 108,450+ clean energy workers in the state's thriving climate economy"
        variant="card"
        spacing="lg"
        headerAlignment="center"
      >
        <IOSGrid columns={4} gap="lg">
          <IOSContainer variant="frosted" padding="lg" className="text-center">
            <div className="text-ios-title-2 font-sf-pro font-semibold text-spring-green mb-2">108,450+</div>
            <div className="text-ios-footnote font-sf-pro text-midnight-forest/70 mb-1">Clean Energy Workers</div>
            <div className="text-ios-caption-2 font-sf-pro text-ios-green">+80% growth since 2010</div>
          </IOSContainer>
          <IOSContainer variant="frosted" padding="lg" className="text-center">
            <div className="text-ios-title-2 font-sf-pro font-semibold text-moss-green mb-2">7,315</div>
            <div className="text-ios-footnote font-sf-pro text-midnight-forest/70 mb-1">Clean Energy Businesses</div>
            <div className="text-ios-caption-2 font-sf-pro text-ios-green">58% are small businesses</div>
          </IOSContainer>
          <IOSContainer variant="frosted" padding="lg" className="text-center">
            <div className="text-ios-title-2 font-sf-pro font-semibold text-midnight-forest mb-2">$14.9B</div>
            <div className="text-ios-footnote font-sf-pro text-midnight-forest/70 mb-1">Industry GSP (2022)</div>
            <div className="text-ios-caption-2 font-sf-pro text-ios-green">+63% growth since 2012</div>
          </IOSContainer>
          <IOSContainer variant="frosted" padding="lg" className="text-center">
            <div className="text-ios-title-2 font-sf-pro font-semibold text-ios-orange mb-2">38,000+</div>
            <div className="text-ios-footnote font-sf-pro text-midnight-forest/70 mb-1">Jobs Needed by 2030</div>
            <div className="text-ios-caption-2 font-sf-pro text-ios-orange">37% workforce growth</div>
          </IOSContainer>
        </IOSGrid>
      </IOSSection>
      
      {/* Climate Economy Features Section */}
      <IOSSection 
        title="Building the Climate Economy Workforce"
        subtitle="ACT's platform connects climate professionals with opportunities across the Northeast's growing clean energy sector"
        spacing="xl"
        headerAlignment="center"
      >
        <IOSGrid columns={4} gap="xl">
          <IOSContainer variant="glass" padding="lg" className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="p-4 bg-spring-green/10 rounded-ios-xl mx-auto w-fit mb-6">
              <Brain className="h-12 w-12 text-spring-green" />
              </div>
            <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-4">
              AI-Powered Job Matching
            </h3>
            <p className="text-ios-subheadline font-sf-pro text-midnight-forest/70 mb-6">
              Our advanced AI analyzes your skills and experience to connect you with the most relevant climate opportunities
            </p>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-spring-green rounded-ios-full"></div>
                <span className="text-ios-caption-1 font-sf-pro">Skills-based matching</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-spring-green rounded-ios-full"></div>
                <span className="text-ios-caption-1 font-sf-pro">Climate relevance scoring</span>
              </div>
            </div>
          </IOSContainer>
          
          <IOSContainer variant="glass" padding="lg" className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="p-4 bg-moss-green/10 rounded-ios-xl mx-auto w-fit mb-6">
              <BookOpen className="h-12 w-12 text-moss-green" />
            </div>
            <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-4">
                    Skills Translation
                  </h3>
            <p className="text-ios-subheadline font-sf-pro text-midnight-forest/70 mb-6">
                    Discover how your existing skills apply to the diverse climate economy and clean energy transition
                  </p>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-moss-green rounded-ios-full"></div>
                <span className="text-ios-caption-1 font-sf-pro">Resume analysis</span>
                    </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-moss-green rounded-ios-full"></div>
                <span className="text-ios-caption-1 font-sf-pro">Gap analysis recommendations</span>
                    </div>
                  </div>
          </IOSContainer>
          
          <IOSContainer variant="glass" padding="lg" className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="p-4 bg-seafoam-blue/30 rounded-ios-xl mx-auto w-fit mb-6">
              <GraduationCap className="h-12 w-12 text-midnight-forest" />
                  </div>
            <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-4">
                    Climate Education
                  </h3>
            <p className="text-ios-subheadline font-sf-pro text-midnight-forest/70 mb-6">
                    Access curated resources on clean energy technologies, climate policy, and sustainable practices
                  </p>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-seafoam-blue rounded-ios-full"></div>
                <span className="text-ios-caption-1 font-sf-pro">Training program recommendations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-seafoam-blue rounded-ios-full"></div>
                <span className="text-ios-caption-1 font-sf-pro">Industry-specific certifications</span>
              </div>
            </div>
          </IOSContainer>
          
          <IOSContainer variant="glass" padding="lg" className="text-center group hover:scale-105 transition-transform duration-300">
            <div className="p-4 bg-ios-blue/10 rounded-ios-xl mx-auto w-fit mb-6">
              <MessageSquare className="h-12 w-12 text-ios-blue" />
            </div>
            <h3 className="text-ios-title-3 font-sf-pro font-semibold text-midnight-forest mb-4">
              AI Career Coach
                  </h3>
            <p className="text-ios-subheadline font-sf-pro text-midnight-forest/70 mb-6">
              Get personalized career guidance and strategic advice from our AI-powered career coaching system
            </p>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-ios-blue rounded-ios-full"></div>
                <span className="text-ios-caption-1 font-sf-pro">Personalized career paths</span>
                </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-ios-blue rounded-ios-full"></div>
                <span className="text-ios-caption-1 font-sf-pro">Interview preparation</span>
                </div>
            </div>
          </IOSContainer>
        </IOSGrid>
      </IOSSection>

      {/* Call to Action Section */}
      <IOSSection 
        variant="glass"
        spacing="xl"
        headerAlignment="center"
        className="text-center"
      >
        <h2 className="text-ios-title-1 font-sf-pro font-semibold text-midnight-forest mb-6">
          Ready to Start Your Climate Career?
              </h2>
        <p className="text-ios-body font-sf-pro text-midnight-forest/70 mb-8 max-w-2xl mx-auto">
          Join thousands of professionals who have found meaningful work in the climate economy through our platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="btn-ios-primary flex items-center gap-2">
            Get Started Today
            <ArrowRight className="h-5 w-5" />
          </button>
          <button className="btn-ios-secondary">
            Learn More
          </button>
        </div>
      </IOSSection>
      
      <Footer />
    </IOSLayout>
  );
}
