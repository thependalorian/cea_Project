/**
 * LoadingSpinner Component
 * 
 * A reusable loading spinner component using DaisyUI's loading component.
 * Can be customized with different sizes and colors.
 */

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'accent'
}

export function LoadingSpinner({ 
  size = 'lg',
  color = 'primary'
}: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <span 
        className={`loading loading-spinner loading-${size} text-${color}`}
      />
    </div>
  )
} 