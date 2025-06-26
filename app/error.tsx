'use client'

import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen">
      <ErrorBoundary error={error} reset={reset} />
    </div>
  )
} 