/**
 * Profile Layout Component
 * Purpose: Wrap profile pages with authentication protection
 * Location: /app/profile/layout.tsx
 */
import ProtectedRoute from '@/components/ProtectedRoute'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>
} 