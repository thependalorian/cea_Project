/**
 * ACT Brand Typography Component
 * Purpose: Implements proper ACT typography with Helvetica titles and Inter body text
 * Location: /components/brand/BrandTypography.tsx
 * 
 * Typography Rules:
 * - Titles/Headers: Helvetica with -20 tracking
 * - Body Text: Inter with 0 tracking for 12pt, -20 for larger
 * - Never use pure black, always use Midnight Forest (#001818)
 * 
 * Brand Compliance: Proper tracking, leading, and color hierarchy
 */

import React from 'react'

interface TypographyProps {
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
  color?: 'midnight-forest' | 'moss-green' | 'spring-green' | 'sand-gray'
}

// Hero Text - For large hero sections
export function HeroText({ 
  children, 
  className = '', 
  as = 'h1',
  color = 'midnight-forest'
}: TypographyProps) {
  const Component = as
  return (
    <Component className={`text-hero-act text-${color} ${className}`}>
      {children}
    </Component>
  )
}

// Title Components - Using Helvetica with proper tracking
export function Title1({ 
  children, 
  className = '', 
  as = 'h1',
  color = 'midnight-forest'
}: TypographyProps) {
  const Component = as
  return (
    <Component className={`text-h1 font-title font-title-medium text-${color} ${className}`}>
      {children}
    </Component>
  )
}

export function Title2({ 
  children, 
  className = '', 
  as = 'h2',
  color = 'midnight-forest'
}: TypographyProps) {
  const Component = as
  return (
    <Component className={`text-h2 font-title font-title-regular text-${color} ${className}`}>
      {children}
    </Component>
  )
}

export function Title3({ 
  children, 
  className = '', 
  as = 'h3',
  color = 'midnight-forest'
}: TypographyProps) {
  const Component = as
  return (
    <Component className={`text-h3 font-title font-title-regular text-${color} ${className}`}>
      {children}
    </Component>
  )
}

export function Title4({ 
  children, 
  className = '', 
  as = 'h4',
  color = 'midnight-forest'
}: TypographyProps) {
  const Component = as
  return (
    <Component className={`text-h4 font-title font-title-regular text-${color} ${className}`}>
      {children}
    </Component>
  )
}

// Body Text Components - Using Inter with proper tracking
export function BodyLarge({ 
  children, 
  className = '', 
  as = 'p',
  color = 'midnight-forest'
}: TypographyProps) {
  const Component = as
  return (
    <Component className={`text-body-large-act text-${color} ${className}`}>
      {children}
    </Component>
  )
}

export function BodyText({ 
  children, 
  className = '', 
  as = 'p',
  color = 'midnight-forest'
}: TypographyProps) {
  const Component = as
  return (
    <Component className={`text-body-act text-${color} ${className}`}>
      {children}
    </Component>
  )
}

export function BodySmall({ 
  children, 
  className = '', 
  as = 'p',
  color = 'midnight-forest'
}: TypographyProps) {
  const Component = as
  return (
    <Component className={`text-body-small font-body font-body-regular text-${color} ${className}`}>
      {children}
    </Component>
  )
}

export function Caption({ 
  children, 
  className = '', 
  as = 'span',
  color = 'midnight-forest'
}: TypographyProps) {
  const Component = as
  return (
    <Component className={`text-caption-act text-${color} ${className}`}>
      {children}
    </Component>
  )
}

// Specialized Typography for Climate Action Content
export function ClimateTitle({ 
  children, 
  className = '', 
  as = 'h2'
}: Omit<TypographyProps, 'color'>) {
  const Component = as
  return (
    <Component className={`text-h2 font-title font-title-medium climate-action-content ${className}`}>
      {children}
    </Component>
  )
}

export function ClimateHighlight({ 
  children, 
  className = '', 
  as = 'span'
}: Omit<TypographyProps, 'color'>) {
  const Component = as
  return (
    <Component className={`climate-action-highlight ${className}`}>
      {children}
    </Component>
  )
}

export function ClimateAccent({ 
  children, 
  className = '', 
  as = 'span'
}: Omit<TypographyProps, 'color'>) {
  const Component = as
  return (
    <Component className={`climate-action-accent ${className}`}>
      {children}
    </Component>
  )
}

// Link Component with ACT brand styling
export function BrandLink({ 
  children, 
  href, 
  className = '',
  external = false,
  ...props 
}: { 
  children: React.ReactNode
  href: string
  className?: string
  external?: boolean
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a 
      href={href}
      className={`text-moss-green hover:text-spring-green transition-colors duration-200 font-body-medium ${className}`}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {children}
    </a>
  )
}

// Quote Component for testimonials and important statements
export function Quote({ 
  children, 
  author, 
  title,
  className = ''
}: { 
  children: React.ReactNode
  author?: string
  title?: string
  className?: string
}) {
  return (
    <blockquote className={`act-frame p-6 bg-seafoam-blue-10 ${className}`}>
      <BodyLarge className="italic mb-4">
        "{children}"
      </BodyLarge>
      {author && (
        <footer className="text-right">
          <BodySmall className="font-body-semibold text-moss-green">
            — {author}
            {title && <span className="font-body-regular text-midnight-forest-70">, {title}</span>}
          </BodySmall>
        </footer>
      )}
    </blockquote>
  )
}

// Mission Statement Component
export function MissionStatement({ 
  children, 
  className = ''
}: { 
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`text-center p-logo-2a ${className}`}>
      <BodyLarge className="climate-action-content max-w-3xl mx-auto">
        {children}
      </BodyLarge>
    </div>
  )
} 