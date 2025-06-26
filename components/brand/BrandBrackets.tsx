/**
 * ACT Brand Brackets Component
 * Purpose: Implements the ACT open brackets design element from brand guidelines
 * Location: /components/brand/BrandBrackets.tsx
 * 
 * Usage: Frame photos and content using reverse white space to create brackets
 * Brand Compliance: Adjust thickness based on size, never overlap content
 */

import React from 'react'

interface BrandBracketsProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  color?: 'spring-green' | 'moss-green' | 'midnight-forest' | 'seafoam-blue'
  className?: string
  style?: React.CSSProperties
}

export function BrandBrackets({ 
  children, 
  size = 'md', 
  color = 'spring-green',
  className = '',
  style,
  ...props 
}: BrandBracketsProps) {
  
  // Size configurations for bracket thickness
  const sizeClasses = {
    sm: 'act-brackets-sm',
    md: 'act-brackets',
    lg: 'act-brackets-lg'
  }

  // Color configurations using ACT brand palette
  const colorClasses = {
    'spring-green': 'bracket-spring-green',
    'moss-green': 'bracket-moss-green',
    'midnight-forest': 'bracket-midnight-forest',
    'seafoam-blue': 'bracket-seafoam-blue'
  }

  return (
    <div 
      className={`${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      style={style}
      role="presentation"
      aria-label="Content brackets"
      {...props}
    >
      <div className="act-brackets-content">
        {children}
      </div>
    </div>
  )
}

/**
 * Photo Brackets - Specialized for framing images
 */
export function PhotoBrackets({ 
  children, 
  className = '', 
  ...props 
}: Omit<BrandBracketsProps, 'size'>) {
  return (
    <BrandBrackets 
      size="md"
      className={`image-organic ${className}`}
      {...props}
    >
      {children}
    </BrandBrackets>
  )
}

/**
 * Text Brackets - For highlighting text content
 */
export function TextBrackets({ 
  children, 
  className = '', 
  ...props 
}: BrandBracketsProps) {
  return (
    <BrandBrackets 
      className={`p-6 ${className}`}
      {...props}
    >
      {children}
    </BrandBrackets>
  )
} 