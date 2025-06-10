/**
 * Hero Component - Alliance for Climate Transition
 * Main hero section following ACT brand guidelines with proper typography and messaging
 * Location: components/layout/hero.tsx
 */

import Link from "next/link";
import { ACTFrameElement, ACTButton } from "@/components/ui";

export function Hero() {
  return (
    <div className="hero min-h-screen act-gradient-hero">
      <div className="hero-content text-center">
        <div className="max-w-6xl">
          {/* ACT Mission Statement - Brand Guidelines */}
          <div className="mb-8">
            <p className="text-sm text-moss-green font-medium tracking-widest uppercase mb-2">
              The Alliance for Climate Transition
            </p>
          </div>

          {/* Main Heading - Using ACT typography system */}
          <ACTFrameElement variant="brackets" size="xl" className="mb-12">
            <h1 className="text-hero font-helvetica font-light text-midnight-forest mb-6">
              Accelerating the
              <span className="block font-medium text-spring-green">
                Climate Economy
              </span>
            </h1>
          </ACTFrameElement>
          
          {/* ACT Mission Statement */}
          <div className="max-w-4xl mx-auto mb-12">
            <p className="text-body-large font-inter text-midnight-forest/80 mb-6">
              Leading the just, equitable and rapid transition to a clean energy future and diverse climate economy.
            </p>
            <p className="text-base font-inter text-midnight-forest/70 max-w-3xl mx-auto">
              Find climate jobs, develop your skills, and access AI-powered career guidance to build your future in the Northeast's growing climate economy.
            </p>
          </div>
          
          {/* ACT Values - Following brand guidelines */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
            <ACTFrameElement variant="open" size="md" className="text-left">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🌱</div>
                <div>
                  <h3 className="text-title font-helvetica font-medium text-midnight-forest mb-2">
                    Equitable Access
                  </h3>
                  <p className="text-body text-midnight-forest/70">
                    All people in the Northeast have access to the clean energy future and equitable climate economy.
                  </p>
                </div>
              </div>
            </ACTFrameElement>

            <ACTFrameElement variant="open" size="md" className="text-left">
              <div className="flex items-start gap-4">
                <div className="text-3xl">⚡</div>
                <div>
                  <h3 className="text-title font-helvetica font-medium text-midnight-forest mb-2">
                    Workforce Development
                  </h3>
                  <p className="text-body text-midnight-forest/70">
                    Empowering a strong, diverse, and inclusive workforce with seamless technology integration.
                  </p>
                </div>
              </div>
            </ACTFrameElement>

            <ACTFrameElement variant="open" size="md" className="text-left">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🤝</div>
                <div>
                  <h3 className="text-title font-helvetica font-medium text-midnight-forest mb-2">
                    Innovation Hub
                  </h3>
                  <p className="text-body text-midnight-forest/70">
                    Connecting communities, empowering innovation, and scaling new climate technologies.
                  </p>
                </div>
              </div>
            </ACTFrameElement>
          </div>
          
          {/* Call to Action Buttons - Using ACT Button component */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <ACTButton 
              variant="primary" 
              size="lg"
              href="/auth/sign-up"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              }
            >
              Join the Climate Economy
            </ACTButton>
            
            <ACTButton 
              variant="outline" 
              size="lg"
              href="/auth/login"
            >
              Sign In
            </ACTButton>
          </div>
        </div>
      </div>
    </div>
  );
}
