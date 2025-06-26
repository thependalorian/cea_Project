/**
 * Dashboard Layout Component - ACT Brand Compliant
 * Purpose: Wrap dashboard pages with authentication protection and ACT brand styling
 * Location: /app/dashboard/layout.tsx
 * 
 * Brand Compliance:
 * - Uses ACT navigation component
 * - Implements proper error boundaries
 * - Follows ACT layout structure
 * - Maintains accessibility standards
 * - Provides consistent brand experience
 */

import ProtectedRoute from '@/components/ProtectedRoute'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen bg-white">
          {children}
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  )
} 