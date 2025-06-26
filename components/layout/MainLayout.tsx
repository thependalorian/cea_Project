/**
 * Main Layout Component - ACT Brand Compliant
 * Purpose: Consistent layout structure with Navigation, optional Hero, and proper spacing
 * Location: /components/layout/MainLayout.tsx
 * 
 * Brand Compliance:
 * - Uses ACT navigation component
 * - Optional hero section with proper branding
 * - Implements proper typography hierarchy
 * - Follows ACT spacing system (base units)
 * - Uses exact color palette
 * - Responsive design with mobile-first approach
 * - Footer is handled by root layout
 */

import Navigation from '@/components/shared/Navigation'
import { BrandFrame } from '@/components/brand/BrandFrame'

interface MainLayoutProps {
  children: React.ReactNode
  showNavigation?: boolean
  heroSection?: {
    title: string
    subtitle?: string
    backgroundImage?: string
    showCTA?: boolean
    ctaText?: string
    ctaHref?: string
  }
  pageTitle?: string
  pageSubtitle?: string
  pageType?: 'default' | 'auth' | 'dashboard' | 'simple'
  containerClass?: string
  className?: string
}

export function MainLayout({
  children,
  showNavigation = true,
  heroSection,
  pageTitle,
  pageSubtitle,
  pageType = 'default',
  containerClass = 'act-content',
  className = ''
}: MainLayoutProps) {
  
  // Different layouts for different page types
  const getPageWrapper = () => {
    switch (pageType) {
      case 'auth':
        return 'min-h-screen w-full bg-white'
      case 'simple':
        return 'min-h-screen bg-white'
      case 'dashboard':
        return 'min-h-screen bg-white'
      default:
        return 'min-h-screen bg-white'
    }
  }

  return (
    <div className={`${getPageWrapper()} ${className}`}>
      {/* ACT Brand Navigation */}
      {showNavigation && <Navigation />}
      
      {/* Hero Section - Optional */}
      {heroSection && (
        <section className="act-hero relative" role="banner" aria-label="Hero section">
          {/* Background Image with Overlay */}
          {heroSection.backgroundImage && (
            <>
              <div 
                className="act-hero-background bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${heroSection.backgroundImage})` }}
                aria-hidden="true"
              />
              <div className="act-hero-overlay" aria-hidden="true" />
            </>
          )}

          {/* Hero Content */}
          <div className="act-hero-content act-hero-text-white animate-on-scroll">
            <p className="act-body-large mb-act-1 opacity-90">
              Alliance for Climate Transition
            </p>
            
            {/* Desktop Title */}
            <h1 className="act-hero-desktop hidden sm:block mb-act-1-5">
              {heroSection.title}
            </h1>
            {/* Mobile Title */}
            <h1 className="act-hero-mobile block sm:hidden mb-act-1-5">
              {heroSection.title}
            </h1>
            
            {heroSection.subtitle && (
              <div className="act-body-large mb-act-2 max-w-3xl mx-auto">
                <p>{heroSection.subtitle}</p>
              </div>
            )}

            {/* CTA Button */}
            {heroSection.showCTA && heroSection.ctaText && heroSection.ctaHref && (
              <div className="flex justify-center">
                <a 
                  href={heroSection.ctaHref}
                  className="act-btn act-btn-primary act-btn-large"
                  role="button"
                >
                  {heroSection.ctaText}
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Page Header - Alternative to Hero */}
      {!heroSection && (pageTitle || pageSubtitle) && (
        <section className="act-section bg-sand-gray-10">
          <div className={containerClass}>
            <div className="text-center animate-on-scroll">
              {pageTitle && (
                <h1 className="act-h1 mb-act-1">
                  {pageTitle}
                </h1>
              )}
              {pageSubtitle && (
                <p className="act-body-large text-moss-green max-w-2xl mx-auto">
                  {pageSubtitle}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main 
        id="main-content" 
        className="w-full flex-1 focus:outline-none" 
        tabIndex={-1}
        role="main"
        aria-label="Main content"
      >
        {children}
      </main>
    </div>
  )
}

export default MainLayout 