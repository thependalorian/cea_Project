/**
 * Root Layout Component - ACT Brand Compliant
 * Purpose: Main layout wrapper implementing ACT brand guidelines
 * Location: /app/layout.tsx
 * 
 * Brand Compliance:
 * - Uses Midnight Forest instead of black
 * - Implements ACT typography system
 * - Follows ACT spacing guidelines
 */
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from '@/providers/AuthProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Alliance for Climate Transition - Climate Economy Assistant',
  description: 'Leading the just, equitable and rapid transition to a clean energy future and diverse climate economy. Connect with climate professionals, access resources, and accelerate your career in the green economy.',
  keywords: [
    'climate transition',
    'clean energy careers',
    'climate economy',
    'green jobs',
    'sustainability careers',
    'climate professionals',
    'environmental justice',
    'renewable energy',
    'climate action'
  ],
  authors: [{ name: 'Alliance for Climate Transition' }],
  creator: 'Alliance for Climate Transition',
  publisher: 'Alliance for Climate Transition',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cea.georgenekwaya.com',
    siteName: 'Alliance for Climate Transition',
    title: 'Alliance for Climate Transition - Climate Economy Assistant',
    description: 'Leading the just, equitable and rapid transition to a clean energy future and diverse climate economy.',
    images: [
      {
        url: '/images/act-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Alliance for Climate Transition - Climate Economy Assistant',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alliance for Climate Transition - Climate Economy Assistant',
    description: 'Leading the just, equitable and rapid transition to a clean energy future and diverse climate economy.',
    creator: '@ACTClimate',
    images: ['/images/act-twitter-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://cea.georgenekwaya.com',
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`} data-theme="act-climate">
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          as="style"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          />
        </noscript>
        
        {/* Preload Helvetica with fallback */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Helvetica+Neue:wght@100;300;400;500;700;900&display=fallback"
          as="style"
        />
        
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Critical CSS - ACT Brand Variables */}
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --act-midnight-forest: #001818;
              --act-spring-green: #B2DE26;
              --act-moss-green: #394816;
              --act-sand-gray: #EBE9E1;
              --act-seafoam-blue: #E0FFFF;
              --act-white: #FFFFFF;
              --act-unit: 24px;
              --act-nav-height: 96px;
              --act-content-max: 1200px;
              --act-font-title: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
              --act-font-body: 'Inter', system-ui, -apple-system, 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', sans-serif;
            }
            
            body {
              font-family: var(--act-font-body);
              color: var(--act-midnight-forest);
              background-color: var(--act-white);
              margin: 0;
              padding: 0;
              line-height: 1.5;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              width: 100%;
              min-height: 100vh;
              overflow-x: hidden;
            }
            
            html {
              width: 100%;
              height: 100%;
            }
            
            #__next {
              width: 100%;
              min-height: 100vh;
            }
            
            .act-loading {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: var(--act-white);
            }
          `
        }} />
      </head>
      <body className="w-full min-h-screen act-body font-body text-midnight-forest bg-white antialiased">
        {/* Skip to main content for accessibility */}
        <a 
          href="#main-content" 
          className="skip-link fixed -top-10 left-2 z-50 bg-spring-green text-midnight-forest px-2 py-1 rounded text-sm font-medium transition-all duration-300 focus:top-2"
        >
          Skip to main content
        </a>

        {/* Main Application Wrapper */}
        <div className="w-full min-h-screen flex flex-col bg-white">
          {/* Navigation will be handled by individual pages or a shared component */}
          
          {/* Main Content */}
          <main 
            id="main-content" 
            className="w-full flex-1 focus:outline-none" 
            tabIndex={-1}
            role="main"
            aria-label="Main content"
          >
            <AuthProvider>
              {children}
            </AuthProvider>
          </main>

          {/* Global Footer - ACT Brand Compliant */}
          <footer className="act-footer" role="contentinfo" aria-label="Site footer">
            <div className="act-footer-content">
              <div className="act-footer-section">
                <div className="act-nav-logo mb-act-1">
                  {/* ACT Logo - White version for dark footer */}
                  <svg 
                    width="120" 
                    height="40" 
                    viewBox="0 0 120 40" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    aria-label="Alliance for Climate Transition logo"
                  >
                    <rect width="120" height="40" fill="white" fillOpacity="0.1" />
                    <text x="10" y="25" fill="white" fontSize="16" fontFamily="var(--act-font-title)" fontWeight="500">
                      ACT
                    </text>
                  </svg>
                </div>
                <p className="act-body-small text-seafoam-blue mb-act-1">
                  Leading the just, equitable and rapid transition to a clean energy future and diverse climate economy.
                </p>
                <div className="act-footer-contact">
                  <p>info@act-climate.org</p>
                  <p>(555) 123-4567</p>
                </div>
              </div>

              <div className="act-footer-section">
                <h4>Resources</h4>
                <nav aria-label="Footer resources navigation">
                  <ul className="space-y-2">
                    <li><a href="/resources" className="act-footer-link">Career Resources</a></li>
                    <li><a href="/resources/training" className="act-footer-link">Training Programs</a></li>
                    <li><a href="/resources/funding" className="act-footer-link">Funding Opportunities</a></li>
                    <li><a href="/resources/partners" className="act-footer-link">Partner Network</a></li>
                  </ul>
                </nav>
              </div>

              <div className="act-footer-section">
                <h4>Community</h4>
                <nav aria-label="Footer community navigation">
                  <ul className="space-y-2">
                    <li><a href="/chat" className="act-footer-link">Climate Assistants</a></li>
                    <li><a href="/dashboard/conversations" className="act-footer-link">Conversations</a></li>
                    <li><a href="/profile" className="act-footer-link">Member Profile</a></li>
                    <li><a href="/dashboard/analytics" className="act-footer-link">Impact Analytics</a></li>
                  </ul>
                </nav>
              </div>

              <div className="act-footer-section">
                <h4>Organization</h4>
                <nav aria-label="Footer organization navigation">
                  <ul className="space-y-2">
                    <li><a href="/about" className="act-footer-link">About ACT</a></li>
                    <li><a href="/mission" className="act-footer-link">Our Mission</a></li>
                    <li><a href="/team" className="act-footer-link">Leadership Team</a></li>
                    <li><a href="/contact" className="act-footer-link">Contact Us</a></li>
                  </ul>
                </nav>
                
                {/* Social Media Links */}
                <div className="flex gap-act-1 mt-act-1" role="group" aria-label="Social media links">
                  <a 
                    href="https://linkedin.com/company/buffr.ai" 
                    className="text-spring-green hover:text-white transition-colors duration-300"
                    aria-label="Follow ACT on LinkedIn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://twitter.com/ACTClimate" 
                    className="text-spring-green hover:text-white transition-colors duration-300"
                    aria-label="Follow ACT on Twitter"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Legal Links */}
            <div className="act-footer-legal">
              <nav aria-label="Legal navigation" className="flex flex-wrap justify-center gap-6 mb-2">
                <a href="/privacy" className="text-moss-green hover:text-spring-green transition-colors duration-300">
                  Privacy Policy
                </a>
                <a href="/terms" className="text-moss-green hover:text-spring-green transition-colors duration-300">
                  Terms of Service
                </a>
                <a href="/accessibility" className="text-moss-green hover:text-spring-green transition-colors duration-300">
                  Accessibility
                </a>
                <a href="/cookies" className="text-moss-green hover:text-spring-green transition-colors duration-300">
                  Cookie Policy
                </a>
              </nav>
              <p className="text-center">
                © {new Date().getFullYear()} Alliance for Climate Transition. All rights reserved.
              </p>
            </div>
          </footer>
        </div>

        {/* Performance and Analytics Scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Critical performance optimizations
              (function() {
                // Remove no-js class if JavaScript is enabled
                document.documentElement.classList.remove('no-js');
                document.documentElement.classList.add('js');

                // Set up intersection observer for animations
                if ('IntersectionObserver' in window) {
                  const animateOnScroll = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                      if (entry.isIntersecting) {
                        entry.target.classList.add('act-animate-fade-in');
                      }
                    });
                  });

                  // Observe elements with animation classes
                  document.addEventListener('DOMContentLoaded', () => {
                    document.querySelectorAll('.animate-on-scroll').forEach(el => {
                      animateOnScroll.observe(el);
                    });
                  });
                }

                // Error tracking for production
                window.addEventListener('error', function(e) {
                  console.error('Application error:', e.error);
                });

                window.addEventListener('unhandledrejection', function(e) {
                  console.error('Unhandled promise rejection:', e.reason);
                });
              })();
            `
          }}
        />
      </body>
    </html>
  )
}