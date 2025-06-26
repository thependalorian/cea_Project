/**
 * Home Page Component - ACT Brand Compliant
 * Purpose: Landing page implementing complete ACT brand guidelines
 * Location: /app/page.tsx
 * 
 * Brand Compliance:
 * - Uses ACT navigation component
 * - Implements proper typography hierarchy
 * - Follows ACT spacing system (base units)
 * - Uses exact color palette
 * - Responsive design with mobile-first approach
 * - Accessibility compliant
 */

import Link from 'next/link'
import Navigation from '@/components/shared/Navigation'
import { BrandFrame } from '@/components/brand/BrandFrame'
import { BadgeGrid } from '@/components/brand/MemberBadges'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* ACT Brand Navigation */}
      <Navigation />
      
      {/* Hero Section - ACT Brand Compliant */}
      <section className="act-hero relative" role="banner" aria-label="Hero section">
        {/* Background Image with Overlay */}
        <div 
          className="act-hero-background bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(/images/massachusetts-clean-energy.jpg)` }}
          aria-hidden="true"
        />
        <div className="act-hero-overlay" aria-hidden="true" />

        {/* Hero Content */}
        <div className="act-hero-content act-hero-text-white animate-on-scroll">
          <p className="act-body-large mb-act-1 opacity-90">
            Alliance for Climate Transition
          </p>
          
          {/* Desktop Title */}
          <h1 className="act-hero-desktop hidden sm:block mb-act-1-5">
            Your Guide to Climate Economy Careers
          </h1>
          {/* Mobile Title */}
          <h1 className="act-hero-mobile block sm:hidden mb-act-1-5">
            Your Guide to Climate Economy Careers
          </h1>
          
          <div className="act-body-large mb-act-2 max-w-3xl mx-auto">
            <p>
              Connect with personalized AI specialists to navigate the clean energy transition,
              find opportunities, and build a meaningful career in Massachusetts' growing climate economy.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-act-1-5 justify-center items-center">
            <Link 
              href="/auth/signup"
              className="act-btn act-btn-primary act-btn-large"
              role="button"
            >
              Get Started
            </Link>
            <Link 
              href="/about"
              className="act-btn act-btn-secondary act-btn-large"
              role="button"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - ACT Brand Layout */}
      <section className="act-section bg-sand-gray-10" aria-label="How we can help">
        <div className="act-content">
          <div className="text-center mb-act-4 animate-on-scroll">
            <h2 className="act-h1 mb-act-1">
              How We Can Help
            </h2>
            <p className="act-body-large text-moss-green max-w-2xl mx-auto">
              Our AI-powered platform connects you with specialized guidance for your unique journey
              into the Massachusetts climate economy.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-act-2 animate-on-scroll">
            <FeatureCard
              title="Career Guidance"
              description="Get matched with climate jobs that fit your background and goals through personalized conversations with our AI specialists."
              icon="🎯"
            />
            <FeatureCard
              title="Resume Analysis"
              description="Upload your resume for AI-powered analysis that identifies transferable skills and suggests climate economy opportunities."
              icon="📄"
            />
            <FeatureCard
              title="Veterans Support"
              description="Military veterans receive specialized guidance to translate skills and access VA resources for climate careers."
              icon="🎖️"
            />
            <FeatureCard
              title="Environmental Justice"
              description="Connect with opportunities in environmental justice and community-focused climate work across Massachusetts."
              icon="⚖️"
            />
            <FeatureCard
              title="Training Programs"
              description="Discover training programs, certifications, and educational pathways into the clean energy sector."
              icon="🎓"
            />
            <FeatureCard
              title="Local Resources"
              description="Access Massachusetts-specific funding, networking opportunities, and support services for your climate career."
              icon="🏛️"
            />
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="act-section" aria-label="Our mission">
        <div className="act-content text-center animate-on-scroll">
          <BrandFrame size="lg" color="spring-green" className="max-w-4xl mx-auto">
            <blockquote className="act-mission-statement act-h2 italic text-center">
              Leading the just, equitable and rapid transition to a clean energy future and diverse climate economy.
            </blockquote>
            <cite className="act-body text-moss-green mt-act-1 block">
              — Alliance for Climate Transition Mission
            </cite>
          </BrandFrame>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="act-section bg-gradient-seafoam" aria-label="Impact statistics">
        <div className="act-content animate-on-scroll">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-act-2">
            <div className="text-center">
              <div className="act-h1 text-spring-green mb-act-0.5">500+</div>
              <div className="act-h4 mb-act-0.5">Career Transitions</div>
              <div className="act-body-small text-moss-green">Professionals successfully transitioned to climate careers</div>
            </div>
            <div className="text-center">
              <div className="act-h1 text-spring-green mb-act-0.5">50+</div>
              <div className="act-h4 mb-act-0.5">Partner Organizations</div>
              <div className="act-body-small text-moss-green">Clean energy companies and training providers</div>
            </div>
            <div className="text-center">
              <div className="act-h1 text-spring-green mb-act-0.5">95%</div>
              <div className="act-h4 mb-act-0.5">Satisfaction Rate</div>
              <div className="act-body-small text-moss-green">Users report valuable career guidance and support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Member Badges Section */}
      <section className="act-section" aria-label="Membership levels">
        <div className="act-content text-center animate-on-scroll">
          <h2 className="act-h2 mb-act-2">Join Our Community</h2>
          <BadgeGrid showDescriptions={false} className="max-w-4xl mx-auto" />
          <p className="act-body text-moss-green mt-act-2 max-w-2xl mx-auto">
            Choose your membership level and join organizations leading the transition to a clean energy economy.
          </p>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="act-bottom-cta" aria-label="Call to action">
        <div className="act-bottom-cta-content animate-on-scroll">
          <h2 className="act-h1 mb-act-1">
            Ready to Start Your Climate Career Journey?
          </h2>
          <p className="act-body-large mb-act-2">
            Create your free account today and get personalized guidance from our AI specialists.
            We'll help you navigate the transition to a meaningful career in the climate economy.
          </p>
          <Link 
            href="/auth/signup"
            className="act-btn act-btn-primary act-btn-large"
            role="button"
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  )
}

interface FeatureCardProps {
  title: string
  description: string
  icon: string
}

function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="act-card hover:shadow-act-card-hover transition-all duration-300">
      <div className="text-center">
        <div className="text-4xl mb-act-1" aria-hidden="true">
          {icon}
        </div>
        <h3 className="act-h4 mb-act-1">
          {title}
        </h3>
        <p className="act-body text-moss-green">
          {description}
        </p>
      </div>
    </div>
  )
} 