/**
 * Resources Page Component - ACT Brand Compliant
 * Purpose: Climate career resources implementing ACT brand guidelines with real Supabase data
 * Location: /app/resources/page.tsx
 */

import { Suspense } from 'react'
import Navigation from '@/components/shared/Navigation'
import { ResourcesContent } from '@/components/resources/ResourcesContent'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

export const metadata = {
  title: 'Resources - Alliance for Climate Transition',
  description: 'Explore climate career resources, training programs, and job opportunities in Massachusetts clean energy economy',
}

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ACT Brand Navigation */}
      <Navigation />
      
      {/* Resources Content - Full Width */}
      <div 
        className="w-full py-8 px-6"
        style={{
          width: '100%',
          maxWidth: 'none',
          minWidth: '100vw',
          overflowX: 'hidden'
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[var(--midnight-forest)] mb-4">
              Climate Career Resources
            </h1>
            <p className="text-lg text-[var(--moss-green)] max-w-3xl">
              Discover comprehensive resources to advance your career in the clean energy economy. 
              From training programs to job opportunities, find everything you need to succeed in climate action.
            </p>
          </div>
          
          <Suspense fallback={<LoadingSpinner />}>
            <ResourcesContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
} 