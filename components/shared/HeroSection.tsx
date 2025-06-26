/**
 * Hero Section Component - ACT Brand Compliant
 * Purpose: Reusable hero section implementing ACT brand guidelines
 * Location: /components/shared/HeroSection.tsx
 * 
 * Brand Compliance:
 * - Minimum 80vh, maximum 100vh height
 * - Proper typography hierarchy (Helvetica for headlines)
 * - ACT color palette usage
 * - Responsive design with mobile/desktop variants
 * - Proper spacing using ACT unit system
 * - Background image support with blur overlay
 */

'use client'

import { ReactNode } from 'react'

interface HeroSectionProps {
  title?: string
  subtitle?: string
  description?: string
  children?: ReactNode
  backgroundImage?: string
  variant?: 'default' | 'centered' | 'left-aligned'
  size?: 'default' | 'large' | 'compact'
  textColor?: 'dark' | 'light'
  showCTA?: boolean
  ctaPrimaryText?: string
  ctaPrimaryHref?: string
  ctaSecondaryText?: string
  ctaSecondaryHref?: string
  className?: string
}

const HeroSection = ({
  title,
  subtitle,
  description,
  children,
  backgroundImage,
  variant = 'default',
  size = 'default',
  textColor = 'dark',
  showCTA = false,
  ctaPrimaryText = 'Get Started',
  ctaPrimaryHref = '/auth/signup',
  ctaSecondaryText = 'Learn More',
  ctaSecondaryHref = '/about',
  className = ''
}: HeroSectionProps) => {
  const sizeClasses = {
    compact: 'min-h-[60vh] max-h-[80vh]',
    default: 'min-h-[80vh] max-h-[100vh]',
    large: 'min-h-[100vh]'
  }

  const alignmentClasses = {
    'default': 'text-center items-center justify-center',
    'centered': 'text-center items-center justify-center',
    'left-aligned': 'text-left items-center justify-start'
  }

  const textColorClasses = textColor === 'light' ? 'act-hero-text-white' : ''

  return (
    <section 
      className={`act-hero ${sizeClasses[size]} ${alignmentClasses[variant]} ${textColorClasses} ${className}`}
      role="banner"
      aria-label="Hero section"
    >
      {/* Background Image */}
      {backgroundImage && (
        <>
          <div 
            className="act-hero-background bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-hidden="true"
          />
          <div className="act-hero-overlay" aria-hidden="true" />
        </>
      )}

      {/* Hero Content */}
      <div className="act-hero-content animate-on-scroll">
        {/* Subtitle */}
        {subtitle && (
          <p className="act-body-large mb-act-1 opacity-90">
            {subtitle}
          </p>
        )}

        {/* Main Title */}
        {title && (
          <>
            {/* Desktop Title */}
            <h1 className="act-hero-desktop hidden sm:block mb-act-1-5">
              {title}
            </h1>
            {/* Mobile Title */}
            <h1 className="act-hero-mobile block sm:hidden mb-act-1-5">
              {title}
            </h1>
          </>
        )}

        {/* Description */}
        {description && (
          <div className="act-body-large mb-act-2 max-w-3xl mx-auto">
            {description.split('\n').map((paragraph, index) => (
              <p key={index} className={index > 0 ? 'mt-act-1' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
        )}

        {/* Custom Children Content */}
        {children && (
          <div className="mb-act-2">
            {children}
          </div>
        )}

        {/* Call-to-Action Buttons */}
        {showCTA && (
          <div className="flex flex-col sm:flex-row gap-act-1-5 justify-center items-center">
            <a 
              href={ctaPrimaryHref}
              className="act-btn act-btn-primary act-btn-large"
              role="button"
            >
              {ctaPrimaryText}
            </a>
            <a 
              href={ctaSecondaryHref}
              className="act-btn act-btn-secondary act-btn-large"
              role="button"
            >
              {ctaSecondaryText}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}

export default HeroSection 