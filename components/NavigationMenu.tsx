/**
 * Navigation menu component - Fixed for client-side usage
 * Purpose: Main navigation with proper client component directive
 * Location: /components/NavigationMenu.tsx
 */
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ACTLogo } from '@/components/brand/ACTLogo'

export function NavigationMenu() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <nav className="bg-white border-b border-sand-gray sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3">
              <ACTLogo variant="horizontal" size="md" />
              <div className="hidden md:block">
                <span className="text-body font-body-medium text-moss-green">
                  Climate Economy Assistant
                </span>
              </div>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/dashboard" 
              className={`text-body transition-colors ${
                isActive('/dashboard') 
                  ? 'text-spring-green font-body-medium' 
                  : 'text-midnight-forest hover:text-spring-green'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/chat" 
              className={`text-body transition-colors ${
                isActive('/chat') 
                  ? 'text-spring-green font-body-medium' 
                  : 'text-midnight-forest hover:text-spring-green'
              }`}
            >
              Chat
            </Link>
            <Link 
              href="/resources" 
              className={`text-body transition-colors ${
                isActive('/resources') 
                  ? 'text-spring-green font-body-medium' 
                  : 'text-midnight-forest hover:text-spring-green'
              }`}
            >
              Resources
            </Link>
            <Link 
              href="/profile" 
              className={`text-body transition-colors ${
                isActive('/profile') 
                  ? 'text-spring-green font-body-medium' 
                  : 'text-midnight-forest hover:text-spring-green'
              }`}
            >
              Profile
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-midnight-forest hover:text-spring-green">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
} 