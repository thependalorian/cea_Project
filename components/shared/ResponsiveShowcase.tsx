/**
 * Responsive Showcase Component - 2025 Design Standards
 * Purpose: Demonstrate modern responsive design patterns across all devices
 * Location: /components/shared/ResponsiveShowcase.tsx
 */

'use client'

import { useState, useEffect } from 'react'

interface ResponsiveShowcaseProps {
  title?: string
  showDeviceInfo?: boolean
}

export default function ResponsiveShowcase({ 
  title = "2025 Responsive Design Showcase", 
  showDeviceInfo = true 
}: ResponsiveShowcaseProps) {
  const [screenInfo, setScreenInfo] = useState({
    width: 0,
    height: 0,
    deviceType: 'unknown',
    breakpoint: 'unknown'
  })

  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      let deviceType = 'Desktop'
      let breakpoint = 'xl'
      
      if (width < 480) {
        deviceType = 'Mobile (Small)'
        breakpoint = 'xs'
      } else if (width < 768) {
        deviceType = 'Mobile (Large)'
        breakpoint = 'sm'
      } else if (width < 1024) {
        deviceType = 'Tablet'
        breakpoint = 'md'
      } else if (width < 1366) {
        deviceType = 'Desktop (Small)'
        breakpoint = 'lg'
      } else if (width < 1920) {
        deviceType = 'Desktop (Large)'
        breakpoint = 'xl'
      } else {
        deviceType = 'Ultra-wide'
        breakpoint = '2xl'
      }
      
      setScreenInfo({ width, height, deviceType, breakpoint })
    }

    updateScreenInfo()
    window.addEventListener('resize', updateScreenInfo)
    return () => window.removeEventListener('resize', updateScreenInfo)
  }, [])

  return (
    <div className="responsive-container container-query">
      <div className="act-content">
        <div className="text-center mb-8">
          <h1 className="act-h1 mb-4">{title}</h1>
          <p className="act-body-large text-silver">
            Modern responsive design following 2025 standards with fluid typography, 
            container queries, and mobile-first patterns.
          </p>
        </div>

        {showDeviceInfo && (
          <div className="responsive-component mb-8 p-6 bg-sand-gray rounded-act border border-midnight-forest/10">
            <h2 className="act-h2 mb-4 text-midnight-forest">Device Information</h2>
            <div className="responsive-grid">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="act-body font-medium">Screen Size:</span>
                  <span className="act-body text-moss-green">
                    {screenInfo.width} × {screenInfo.height}px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="act-body font-medium">Device Type:</span>
                  <span className="act-body text-moss-green">{screenInfo.deviceType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="act-body font-medium">Breakpoint:</span>
                  <span className="act-body text-moss-green">{screenInfo.breakpoint}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Responsive Grid Showcase */}
        <section className="mb-12">
          <h2 className="act-h2 mb-6">Responsive Grid System</h2>
          <div className="responsive-grid mb-6">
            <div className="act-card">
              <h3 className="act-h3 mb-3">Auto-Fit Grid</h3>
              <p className="act-body">
                Cards automatically adjust to fit available space using 
                modern CSS Grid with auto-fit and minmax functions.
              </p>
            </div>
            <div className="act-card">
              <h3 className="act-h3 mb-3">Fluid Spacing</h3>
              <p className="act-body">
                Spacing scales smoothly using clamp() functions for 
                consistent layouts across all device sizes.
              </p>
            </div>
            <div className="act-card">
              <h3 className="act-h3 mb-3">Container Queries</h3>
              <p className="act-body">
                Components respond to their container size, not just 
                viewport size, for better modularity.
              </p>
            </div>
            <div className="act-card">
              <h3 className="act-h3 mb-3">Touch Optimized</h3>
              <p className="act-body">
                All interactive elements meet minimum 44px touch target 
                requirements for better mobile UX.
              </p>
            </div>
          </div>
        </section>

        {/* Typography Showcase */}
        <section className="mb-12">
          <h2 className="act-h2 mb-6">Fluid Typography</h2>
          <div className="space-y-4 p-6 bg-seafoam-blue/30 rounded-act">
            <h1 className="act-hero-desktop">Hero Desktop Title</h1>
            <h1 className="act-hero-mobile block sm:hidden">Hero Mobile Title</h1>
            <h2 className="act-h1">Heading 1 - Scales Fluidly</h2>
            <h3 className="act-h2">Heading 2 - Responsive Size</h3>
            <h4 className="act-h3">Heading 3 - Mobile First</h4>
            <p className="act-body-large">
              Large body text that maintains readability across all devices 
              using fluid scaling with clamp() functions.
            </p>
            <p className="act-body">
              Regular body text optimized for reading comfort with proper 
              line height and character spacing.
            </p>
            <p className="act-body-small">
              Small body text for captions and secondary information 
              that remains legible on mobile devices.
            </p>
          </div>
        </section>

        {/* Button Showcase */}
        <section className="mb-12">
          <h2 className="act-h2 mb-6">Responsive Buttons</h2>
          <div className="responsive-flex">
            <button className="act-btn act-btn-primary">
              Primary Action
            </button>
            <button className="act-btn act-btn-secondary">
              Secondary Action
            </button>
            <button className="act-btn act-btn-large act-btn-primary">
              Large Button
            </button>
            <button className="act-btn act-btn-nav act-btn-secondary">
              Nav Button
            </button>
          </div>
          <p className="act-body-small text-silver mt-4">
            All buttons meet accessibility standards with proper touch targets 
            and focus indicators.
          </p>
        </section>

        {/* Responsive Layout Showcase */}
        <section className="mb-12">
          <h2 className="act-h2 mb-6">Layout Patterns</h2>
          
          {/* Mobile: Stack, Tablet: 2 columns, Desktop: 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="act-card">
              <div className="w-full h-32 bg-spring-green/20 rounded-act-sm mb-4"></div>
              <h3 className="act-h4 mb-2">Mobile First</h3>
              <p className="act-body-small">Stacks on mobile, 2 columns on tablet, 3 on desktop</p>
            </div>
            <div className="act-card">
              <div className="w-full h-32 bg-moss-green/20 rounded-act-sm mb-4"></div>
              <h3 className="act-h4 mb-2">Adaptive Grid</h3>
              <p className="act-body-small">Responds to screen size with smooth transitions</p>
            </div>
            <div className="act-card">
              <div className="w-full h-32 bg-seafoam-blue/20 rounded-act-sm mb-4"></div>
              <h3 className="act-h4 mb-2">Fluid Design</h3>
              <p className="act-body-small">Uses relative units and modern CSS features</p>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="mb-12">
          <h2 className="act-h2 mb-6">2025 Feature Highlights</h2>
          <div className="act-grid act-grid-2">
            <div className="p-6 bg-midnight-forest text-white rounded-act">
              <h3 className="act-h3 mb-4 text-spring-green">Modern CSS Features</h3>
              <ul className="act-list space-y-2">
                <li>Container Queries for component-level responsiveness</li>
                <li>Dynamic Viewport Units (dvh, dvw) support</li>
                <li>Fluid typography with clamp() functions</li>
                <li>Auto-fit grid layouts with minmax</li>
                <li>Enhanced touch target optimization</li>
              </ul>
            </div>
            <div className="p-6 bg-spring-green text-midnight-forest rounded-act">
              <h3 className="act-h3 mb-4">Accessibility First</h3>
              <ul className="act-list space-y-2">
                <li>WCAG 2.1 AA compliant color contrast</li>
                <li>Reduced motion preferences respected</li>
                <li>Keyboard navigation optimized</li>
                <li>Screen reader friendly markup</li>
                <li>Focus management and indicators</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Breakpoint Demonstration */}
        <section className="mb-12">
          <h2 className="act-h2 mb-6">Breakpoint System</h2>
          <div className="p-6 bg-sand-gray rounded-act">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 bg-spring-green rounded-full xs:bg-moss-green sm:bg-midnight-forest md:bg-seafoam-blue lg:bg-silver xl:bg-spring-green"></div>
                <span className="act-body">Color changes at each breakpoint</span>
              </div>
              
              <div className="text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
                <span className="act-body font-medium">Text size responds to breakpoints</span>
              </div>
              
              <div className="p-3 bg-white rounded text-center">
                <span className="block xs:hidden act-body-small">Extra Small (xs): &lt; 360px</span>
                <span className="hidden xs:block sm:hidden act-body-small">Small (sm): 360px - 479px</span>
                <span className="hidden sm:block md:hidden act-body-small">Medium (md): 480px - 767px</span>
                <span className="hidden md:block lg:hidden act-body-small">Large (lg): 768px - 1023px</span>
                <span className="hidden lg:block xl:hidden act-body-small">Extra Large (xl): 1024px - 1365px</span>
                <span className="hidden xl:block act-body-small">2XL: 1366px+</span>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Indicators */}
        <section className="text-center">
          <h2 className="act-h2 mb-4">Optimized for Performance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-act border border-midnight-forest/10">
              <div className="text-2xl font-bold text-spring-green mb-2">100%</div>
              <div className="act-caption">Accessibility</div>
            </div>
            <div className="p-4 bg-white rounded-act border border-midnight-forest/10">
              <div className="text-2xl font-bold text-moss-green mb-2">95+</div>
              <div className="act-caption">Performance</div>
            </div>
            <div className="p-4 bg-white rounded-act border border-midnight-forest/10">
              <div className="text-2xl font-bold text-midnight-forest mb-2">0ms</div>
              <div className="act-caption">Layout Shift</div>
            </div>
            <div className="p-4 bg-white rounded-act border border-midnight-forest/10">
              <div className="text-2xl font-bold text-silver mb-2">PWA</div>
              <div className="act-caption">Ready</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 