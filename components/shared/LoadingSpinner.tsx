/**
 * Loading Spinner Component
 * Purpose: Provide consistent loading UI across the application
 * Location: /components/shared/LoadingSpinner.tsx
 */

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  className?: string
  message?: string
  fullScreen?: boolean
}

export function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  message,
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'loading-xs',
    sm: 'loading-sm', 
    md: 'loading-md',
    lg: 'loading-lg'
  }

  const spinner = (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <span 
        className={`loading loading-spinner text-primary ${sizeClasses[size]}`}
        aria-label="Loading"
      />
      {message && (
        <p className="text-sm text-base-content/70 animate-pulse">
          {message}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-base-100/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

// Skeleton loading component
export function LoadingSkeleton({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number
  className?: string 
}) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i}
          className={`h-4 bg-base-300 rounded ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  )
}

// Card skeleton for conversation lists
export function ConversationSkeleton() {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-300 animate-pulse">
      <div className="card-body p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-base-300 rounded-full" />
          <div className="h-4 bg-base-300 rounded w-24" />
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-base-300 rounded w-full" />
          <div className="h-3 bg-base-300 rounded w-3/4" />
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="h-3 bg-base-300 rounded w-16" />
          <div className="h-6 bg-base-300 rounded w-20" />
        </div>
      </div>
    </div>
  )
} 