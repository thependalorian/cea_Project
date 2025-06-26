/**
 * SignIn Page Component - ACT Brand Compliant
 * Purpose: User authentication implementing ACT brand guidelines
 * Location: /app/auth/signin/page.tsx
 * 
 * Brand Compliance:
 * - Uses ACT navigation component
 * - Implements proper typography hierarchy
 * - Follows ACT spacing system (base units)
 * - Uses exact color palette
 * - Responsive design with mobile-first approach
 * - Accessibility compliant
 */

import Navigation from '@/components/shared/Navigation'
import { AuthForm } from '@/components/AuthForm'
import { BrandFrame } from '@/components/brand/BrandFrame'

export default function SignIn() {
  return (
    <div className="min-h-screen w-full bg-white">
      {/* ACT Brand Navigation */}
      <Navigation />
      
      {/* Hero Background Section */}
      <section className="relative min-h-[calc(100vh-96px)] w-full flex items-center justify-center">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(/images/massachusetts-clean-energy.jpg)` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 w-full h-full bg-midnight-forest bg-opacity-60" aria-hidden="true" />
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <BrandFrame size="md" color="spring-green" className="bg-white p-6 sm:p-8">
            <div className="text-center mb-6">
              <h1 className="act-h2 mb-2">
                Welcome Back
              </h1>
              <p className="act-body text-moss-green">
                Sign in to continue your climate career journey
              </p>
            </div>
            
            <AuthForm mode="signin" />
            
            <div className="mt-6 text-center">
              <p className="act-body-small text-moss-green">
                New to ACT?{' '}
                <a 
                  href="/auth/signup" 
                  className="text-spring-green hover:text-spring-green-80 font-medium transition-colors duration-300"
                >
                  Create an account
                </a>
              </p>
            </div>
          </BrandFrame>
          
          {/* Additional Information */}
          <div className="mt-6 text-center">
            <p className="act-body-small text-white opacity-90">
              Join thousands of professionals transitioning to climate careers
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}