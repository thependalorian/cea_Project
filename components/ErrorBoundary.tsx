/**
 * ErrorBoundary Component
 * 
 * A reusable error boundary component that displays error messages
 * and provides a retry button.
 */

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold text-error">Oops!</h1>
          <p className="py-6">
            {error.message || 'Something went wrong. Please try again.'}
          </p>
          <button
            onClick={reset}
            className="btn btn-primary"
          >
            Try again
          </button>
          {error.digest && (
            <p className="mt-4 text-sm text-base-content/60">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 