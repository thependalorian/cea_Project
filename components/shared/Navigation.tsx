/**
 * Navigation Component - ACT Brand Compliant
 * Purpose: Global navigation implementing ACT brand guidelines
 * Location: /components/shared/Navigation.tsx
 * 
 * Brand Compliance:
 * - Fixed height at 4x base units (96px)
 * - White background with Sand Gray border
 * - Proper logo placement and clear space
 * - Spring Green for active/hover states
 * - Inter Medium 16px for navigation links
 * - Sticky behavior with shadow on scroll
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ACTLogo } from '../brand/ACTLogo'

interface NavigationProps {
  className?: string
}

const Navigation = ({ className = '' }: NavigationProps) => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Handle scroll effect for navigation shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Navigation links with proper ACT structure
  const navigationLinks = [
    { href: '/chat', label: 'Climate Assistants' },
    { href: '/resources', label: 'Resources' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/profile', label: 'Profile' },
  ]

  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav 
      className={`act-nav ${isScrolled ? 'scrolled' : ''} ${className}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="act-nav-container">
        {/* Logo Section */}
        <div className="act-nav-logo">
          <Link 
            href="/" 
            className="block focus:outline-none focus:ring-2 focus:ring-spring-green focus:ring-offset-2 rounded-sm"
            aria-label="Alliance for Climate Transition - Home"
          >
            <ACTLogo variant="horizontal" size="md" />
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="act-nav-links hidden md:flex">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`act-nav-link act-nav-text ${
                isActiveLink(link.href) ? 'active' : ''
              }`}
              aria-current={isActiveLink(link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}

          {/* CTA Button */}
          <Link 
            href="/auth/signin"
            className="act-btn act-btn-nav ml-act-1"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden act-btn-secondary p-2 rounded-act-sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {isMobileMenuOpen ? (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
              />
            ) : (
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`md:hidden bg-sand-gray-10 border-t border-sand-gray transition-all duration-300 ${
          isMobileMenuOpen 
            ? 'max-h-screen opacity-100 act-animate-slide-down' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="px-act-2 py-act-1 space-y-act-0.5">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`block act-nav-text py-act-0.5 px-act-1 rounded-act-sm transition-colors duration-300 ${
                isActiveLink(link.href)
                  ? 'text-spring-green bg-spring-green-10'
                  : 'text-midnight-forest hover:text-spring-green hover:bg-spring-green-5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-current={isActiveLink(link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Mobile CTA */}
          <div className="pt-act-1 border-t border-sand-gray">
            <Link 
              href="/auth/signin"
              className="act-btn act-btn-primary w-full justify-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation 