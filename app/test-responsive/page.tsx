/**
 * Test Responsive Design Page - 2025 Standards
 * Purpose: Showcase modern responsive design improvements
 * Location: /app/test-responsive/page.tsx
 */

import Navigation from '@/components/shared/Navigation'
import ResponsiveShowcase from '@/components/shared/ResponsiveShowcase'

export const metadata = {
  title: 'Responsive Design Test - Alliance for Climate Transition',
  description: 'Testing 2025 responsive design standards across all device types',
}

export default function TestResponsivePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="w-full">
        <ResponsiveShowcase 
          title="CEA 2025 Responsive Design System"
          showDeviceInfo={true}
        />
      </main>
    </div>
  )
} 