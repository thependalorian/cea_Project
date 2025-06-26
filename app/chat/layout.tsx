/**
 * Chat Layout Component - ACT Brand Compliant
 * Purpose: Wrap chat pages with authentication protection and ACT brand styling
 * Location: /app/chat/layout.tsx
 * 
 * Brand Compliance:
 * - Ensures consistent ACT brand experience
 * - Provides proper authentication protection
 * - Implements error boundaries with ACT styling
 * - Maintains accessibility standards
 */

import ProtectedRoute from '@/components/ProtectedRoute'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

export default function ChatLayout({
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