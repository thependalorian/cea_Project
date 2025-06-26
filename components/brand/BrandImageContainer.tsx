/**
 * Image container following ACT photography guidelines
 * Purpose: Display images with proper brand treatment and blur effects
 * Location: /components/brand/BrandImageContainer.tsx
 */
import Image from 'next/image'
import { BrandBrackets } from './BrandBrackets'

interface BrandImageContainerProps {
  src: string
  alt: string
  category: 'landscape' | 'energy' | 'lifestyle' | 'northeast' | 'satellite'
  overlay?: boolean
  blurBackground?: boolean
  children?: React.ReactNode
  className?: string
}

export function BrandImageContainer({ 
  src, 
  alt, 
  category, 
  overlay = false,
  blurBackground = false,
  children,
  className = '' 
}: BrandImageContainerProps) {
  return (
    <div className={`relative overflow-hidden rounded-lg ${className}`}>
      {/* For now, use a div with background image since we don't have actual images */}
      <div 
        className={`w-full h-full ${blurBackground ? 'filter blur-sm' : ''}`}
        style={{
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '200px' // Minimum height for placeholder
        }}
        aria-label={alt}
      />
      
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--midnight-forest-80)] to-transparent" />
      )}
      
      {children && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {children}
        </div>
      )}
      
      {/* Brand frame overlay for energy/landscape images */}
      {(category === 'energy' || category === 'landscape') && (
        <BrandBrackets size="md" className="absolute inset-4">
          <div></div>
        </BrandBrackets>
      )}
    </div>
  )
} 