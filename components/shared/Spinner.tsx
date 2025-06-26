/**
 * Spinner Component
 * Purpose: Display a loading spinner with different sizes
 * Location: /components/shared/Spinner.tsx
 */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export function Spinner({ size = 'md', color = 'text-primary' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 ${color} ${sizeClasses[size]}`}
      ></div>
    </div>
  )
} 