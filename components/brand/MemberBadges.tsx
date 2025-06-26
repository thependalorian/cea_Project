/**
 * ACT Member Badges Component
 * Purpose: Implements the three ACT membership levels with proper brand compliance
 * Location: /components/brand/MemberBadges.tsx
 * 
 * Membership Levels:
 * - Silver: "This company supports the equitable and rapid transition..."
 * - Gold: "This company is committed to driving the equitable and rapid transition..."  
 * - Platinum: "This company excels at driving the equitable and rapid transition..."
 * 
 * Brand Compliance: Available in vertical and horizontal orientations
 */

import React from 'react'

interface MemberBadgeProps {
  level: 'silver' | 'gold' | 'platinum'
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  companyName?: string
  className?: string
}

const membershipMessages = {
  silver: "This company supports the equitable and rapid transition to a clean energy future and diverse climate economy.",
  gold: "This company is committed to driving the equitable and rapid transition to a clean energy future and diverse climate economy.",
  platinum: "This company excels at driving the equitable and rapid transition to a clean energy future and diverse climate economy."
}

const membershipTitles = {
  silver: "ACT Silver Member",
  gold: "ACT Gold Member", 
  platinum: "ACT Platinum Member"
}

export function MemberBadge({ 
  level, 
  orientation = 'horizontal',
  size = 'md',
  showText = true,
  companyName,
  className = ''
}: MemberBadgeProps) {
  
  // Size configurations
  const sizeClasses = {
    sm: 'text-sm px-3 py-2',
    md: 'text-base px-4 py-3', 
    lg: 'text-lg px-6 py-4'
  }

  // Level-specific styling
  const levelClasses = {
    silver: 'member-badge-silver',
    gold: 'member-badge-gold',
    platinum: 'member-badge-platinum'
  }

  // Orientation styling
  const orientationClasses = {
    horizontal: 'member-badge-horizontal',
    vertical: 'member-badge-vertical'
  }

  return (
    <div className={`
      member-badge 
      ${levelClasses[level]} 
      ${orientationClasses[orientation]}
      ${sizeClasses[size]}
      ${className}
    `}>
      {/* Badge Icon/Level Indicator */}
      <div className="flex items-center gap-2">
        <div className={`
          w-4 h-4 rounded-full
          ${level === 'silver' ? 'bg-silver' : ''}
          ${level === 'gold' ? 'bg-spring-green' : ''}
          ${level === 'platinum' ? 'bg-spring-green ring-2 ring-midnight-forest' : ''}
        `} />
        <span className="font-body-semibold">
          {membershipTitles[level]}
        </span>
      </div>

      {/* Company Name */}
      {companyName && (
        <div className={`
          font-body-bold
          ${orientation === 'vertical' ? 'mt-2' : 'ml-4'}
        `}>
          {companyName}
        </div>
      )}

      {/* Membership Description */}
      {showText && (
        <div className={`
          text-caption font-body-regular
          ${orientation === 'vertical' ? 'mt-2 text-center' : 'ml-4 max-w-md'}
        `}>
          {membershipMessages[level]}
        </div>
      )}
    </div>
  )
}

/**
 * Company Badge - For displaying a company's membership status
 */
export function CompanyBadge({ 
  companyName,
  level,
  className = '',
  ...props 
}: Omit<MemberBadgeProps, 'companyName'> & { companyName: string }) {
  return (
    <MemberBadge 
      level={level}
      companyName={companyName}
      showText={false}
      className={`inline-flex ${className}`}
      {...props}
    />
  )
}

/**
 * Certification Badge - Full badge with description text
 */
export function CertificationBadge({ 
  level,
  companyName,
  className = '',
  ...props 
}: Omit<MemberBadgeProps, 'showText'>) {
  return (
    <MemberBadge 
      level={level}
      companyName={companyName}
      showText={true}
      orientation="vertical"
      className={`max-w-sm p-6 ${className}`}
      {...props}
    />
  )
}

/**
 * Mini Badge - Compact version for small spaces
 */
export function MiniBadge({ 
  level,
  className = '',
  ...props 
}: Omit<MemberBadgeProps, 'showText' | 'orientation' | 'size'>) {
  return (
    <MemberBadge 
      level={level}
      size="sm"
      showText={false}
      orientation="horizontal"
      className={`inline-flex ${className}`}
      {...props}
    />
  )
}

/**
 * Badge Grid - For displaying multiple membership levels
 */
export function BadgeGrid({ 
  className = '',
  showDescriptions = true 
}: { 
  className?: string
  showDescriptions?: boolean 
}) {
  const levels: Array<'silver' | 'gold' | 'platinum'> = ['silver', 'gold', 'platinum']
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {levels.map((level) => (
        <MemberBadge
          key={level}
          level={level}
          orientation="vertical"
          size="md"
          showText={showDescriptions}
          className="text-center"
        />
      ))}
    </div>
  )
} 