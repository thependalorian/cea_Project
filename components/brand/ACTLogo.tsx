/**
 * ACT Logo component with proper brand guidelines
 * Purpose: Consistent logo usage across the application
 * Location: /components/brand/ACTLogo.tsx
 */

interface ACTLogoProps {
  variant?: 'primary' | 'horizontal' | 'mark' | 'wordmark'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  theme?: 'light' | 'dark'
  className?: string
}

export function ACTLogo({ 
  variant = 'primary', 
  size = 'md', 
  theme = 'light',
  className = '' 
}: ACTLogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-auto',
    md: 'h-12 w-auto',
    lg: 'h-16 w-auto',
    xl: 'h-24 w-auto'
  }

  // For now, using text-based logo until SVG assets are available
  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center`}>
      <div className="border-2 border-spring-green p-2 rounded">
        <span className="font-title font-title-medium text-midnight-forest text-lg">
          ACT
        </span>
      </div>
    </div>
  )
} 