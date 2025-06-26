/**
 * Login Page Component - ACT Brand Compliant
 * Purpose: User authentication implementing ACT brand guidelines
 * Location: /app/auth/login/page.tsx
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

export default function LoginPage() {
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
        <div className="relative z-10 w-full max-w-md mx-auto px-6">
          <BrandFrame className="bg-white bg-opacity-95 backdrop-blur-sm">
            <div className="text-center mb-act-2">
              <h1 className="act-h2 text-midnight-forest mb-act-1">
                Welcome Back
              </h1>
              <p className="act-body text-moss-green">
                Sign in to continue your climate career journey
              </p>
            </div>
            
            <AuthForm mode="signin" />
          </BrandFrame>
        </div>
      </section>
    </div>
  )
} 