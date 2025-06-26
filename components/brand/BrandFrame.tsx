/**
 * ACT Brand Frame Component
 * Purpose: Implements the signature ACT open frame design element from brand guidelines
 * Location: /components/brand/BrandFrame.tsx
 * 
 * Usage: Frame content to focus attention, never exceed 2/3 page width
 * Brand Compliance: Uses Spring Green (#B2DE26) with proper thickness scaling
 */

import React from 'react'

interface BrandFrameProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'spring-green' | 'moss-green' | 'midnight-forest' | 'seafoam-blue'
  focus?: boolean
  className?: string
  style?: React.CSSProperties
}

export function BrandFrame({ 
  children, 
  size = 'md', 
  color = 'spring-green',
  focus = false,
  className = '',
  style,
  ...props 
}: BrandFrameProps) {
  
  // Size configurations following ACT guidelines
  const sizeClasses = {
    sm: 'act-frame-sm p-4 border-2', // Small: 2px border, 1rem padding
    md: 'p-6 border-4',              // Medium: 4px border, 1.5rem padding
    lg: 'act-frame-lg p-8 border-8', // Large: 8px border, 2rem padding
    xl: 'p-12 border-8'              // Extra Large: 8px border, 3rem padding
  }

  // Color configurations using ACT brand palette
  const colorClasses = {
    'spring-green': 'border-spring-green',     // Primary accent color
    'moss-green': 'border-moss-green',         // Secondary color
    'midnight-forest': 'border-midnight-forest', // Primary dark
    'seafoam-blue': 'border-seafoam-blue'      // Accent light
  }

  // Focus state for interactive frames
  const focusClass = focus ? 'act-frame-focus' : ''

  // Combine all classes
  const frameClasses = [
    'act-frame',
    sizeClasses[size],
    colorClasses[color],
    focusClass,
    className
  ].filter(Boolean).join(' ')

  return (
    <div 
      className={frameClasses}
      style={style}
      role="presentation"
      aria-label="Content frame"
      {...props}
    >
      {children}
    </div>
  )
}

// Specialized frame variants for common use cases

/**
 * Hero Frame - For hero sections with minimal copy
 */
export function HeroFrame({ children, className = '', ...props }: Omit<BrandFrameProps, 'size'>) {
  return (
    <BrandFrame 
      size="xl" 
      className={`max-w-4xl mx-auto text-center ${className}`}
      {...props}
    >
      {children}
    </BrandFrame>
  )
}

/**
 * Content Frame - For regular content sections
 */
export function ContentFrame({ children, className = '', ...props }: Omit<BrandFrameProps, 'size'>) {
  return (
    <BrandFrame 
      size="md" 
      className={`max-w-frame ${className}`}
      {...props}
    >
      {children}
    </BrandFrame>
  )
}

/**
 * Card Frame - For card-like content with background
 */
export function CardFrame({ children, className = '', ...props }: BrandFrameProps) {
  return (
    <BrandFrame 
      className={`bg-white shadow-lg ${className}`}
      {...props}
    >
      {children}
    </BrandFrame>
  )
}

/**
 * Focus Frame - For highlighting important content
 */
export function FocusFrame({ children, className = '', ...props }: Omit<BrandFrameProps, 'focus'>) {
  return (
    <BrandFrame 
      focus={true}
      className={`bg-white shadow-xl ${className}`}
      {...props}
    >
      {children}
    </BrandFrame>
  )
} 