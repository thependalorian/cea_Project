/**
 * ACT Brand Arrows Component
 * Purpose: Implements the ACT open arrows design element from brand guidelines
 * Location: /components/brand/BrandArrows.tsx
 * 
 * Usage: Add movement to layouts, can mask images within arrow shape
 * Brand Compliance: Use 2-3 arrows per layout maximum, avoid rotating back to right angles
 */

import React from 'react'

interface BrandArrowProps {
  direction?: 'right' | 'left' | 'down' | 'up'
  size?: 'sm' | 'md' | 'lg'
  color?: 'spring-green' | 'moss-green' | 'midnight-forest' | 'seafoam-blue'
  children?: React.ReactNode
  className?: string
  onClick?: () => void
}

export function BrandArrow({ 
  direction = 'right', 
  size = 'md',
  color = 'spring-green',
  children,
  className = '',
  onClick,
  ...props 
}: BrandArrowProps) {
  
  // Size configurations for arrow scale
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  // Direction classes
  const directionClasses = {
    right: 'act-arrow-right',
    left: 'act-arrow-left',
    down: 'act-arrow-down',
    up: 'act-arrow-up'
  }

  // Color configurations
  const colorClasses = {
    'spring-green': 'text-spring-green',
    'moss-green': 'text-moss-green',
    'midnight-forest': 'text-midnight-forest',
    'seafoam-blue': 'text-seafoam-blue'
  }

  const isClickable = Boolean(onClick)
  const Component = isClickable ? 'button' : 'div'

  return (
    <Component
      className={`
        ${directionClasses[direction]} 
        ${sizeClasses[size]} 
        ${colorClasses[color]}
        ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity focus-act' : ''}
        ${className}
      `}
      onClick={onClick}
      role={isClickable ? 'button' : 'presentation'}
      aria-label={isClickable ? `Arrow ${direction}` : undefined}
      {...props}
    >
      {children}
    </Component>
  )
}

/**
 * Navigation Arrow - For interactive navigation
 */
export function NavigationArrow({ 
  direction = 'right',
  onClick,
  children = 'Continue',
  className = '',
  ...props 
}: Omit<BrandArrowProps, 'children'> & { children?: string }) {
  return (
    <BrandArrow 
      direction={direction}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 font-body-medium ${className}`}
      {...props}
    >
      {children}
    </BrandArrow>
  )
}

/**
 * Content Arrow - For emphasizing flow or direction in content
 */
export function ContentArrow({ 
  direction = 'right',
  className = '',
  ...props 
}: Omit<BrandArrowProps, 'children'>) {
  return (
    <BrandArrow 
      direction={direction}
      className={`inline-block ${className}`}
      {...props}
    />
  )
}

/**
 * Section Arrow - For separating content sections with directional flow
 */
export function SectionArrow({ 
  direction = 'down',
  size = 'lg',
  className = '',
  ...props 
}: Omit<BrandArrowProps, 'children'>) {
  return (
    <div className={`flex justify-center py-logo-a ${className}`}>
      <BrandArrow 
        direction={direction}
        size={size}
        {...props}
      />
    </div>
  )
}

/**
 * Image Arrow - For arrows that can mask or overlay images
 */
export function ImageArrow({ 
  direction = 'right',
  image,
  alt = '',
  className = '',
  ...props 
}: BrandArrowProps & { image: string; alt?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img 
        src={image} 
        alt={alt}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <BrandArrow 
          direction={direction}
          size="lg"
          color="spring-green"
          className="drop-shadow-lg"
          {...props}
        />
      </div>
    </div>
  )
} 