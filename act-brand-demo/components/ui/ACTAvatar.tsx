"use client";

/**
 * ACT Avatar Component - Alliance for Climate Transition
 * Modern 2025 avatar/profile picture component with iOS-inspired design
 * Location: act-brand-demo/components/ui/ACTAvatar.tsx
 */

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarStatus = 'online' | 'away' | 'busy' | 'offline' | 'none';
type AvatarVariant = 'circle' | 'rounded' | 'square' | 'squircle';

interface ACTAvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  variant?: AvatarVariant;
  bordered?: boolean;
  borderColor?: string;
  className?: string;
  statusClassName?: string;
  onClick?: () => void;
  interactive?: boolean;
  initials?: string;
  statusPosition?: 'top-right' | 'bottom-right' | 'bottom-left' | 'top-left';
  animated?: boolean;
  badge?: React.ReactNode;
  monogram?: boolean;
}

export function ACTAvatar({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  status = 'none',
  variant = 'circle',
  bordered = false,
  borderColor,
  className,
  statusClassName,
  onClick,
  interactive = false,
  initials,
  statusPosition = 'bottom-right',
  animated = true,
  badge,
  monogram = false,
}: ACTAvatarProps) {
  // Size mapping (in pixels)
  const sizeMap: Record<AvatarSize, number> = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80,
  };
  
  // Calculate actual size
  const pixelSize = sizeMap[size];
  
  // Status color mapping
  const statusColorMap: Record<AvatarStatus, string> = {
    online: 'bg-ios-green',
    away: 'bg-ios-yellow',
    busy: 'bg-ios-red',
    offline: 'bg-ios-gray-400',
    none: 'hidden',
  };
  
  // Variant mapping
  const variantMap: Record<AvatarVariant, string> = {
    circle: 'rounded-full',
    rounded: 'rounded-ios-lg',
    square: 'rounded-none',
    squircle: 'rounded-[20%]',
  };
  
  // Status position mapping
  const statusPositionMap: Record<string, string> = {
    'top-right': '-top-1 -right-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1',
    'top-left': '-top-1 -left-1',
  };
  
  // Border styles
  const borderStyles = bordered 
    ? borderColor 
      ? `border-2 border-${borderColor}` 
      : 'border-2 border-white dark:border-midnight-forest shadow-ios-subtle'
    : '';
  
  // Get user initials from name or use provided initials
  const getUserInitials = () => {
    if (initials) return initials;
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Background color for monogram avatars
  const getMonogramBackground = () => {
    if (!name && !initials) return 'bg-spring-green';
    
    // Create a simple hash from the name or initials to pick a consistent color
    const string = (name || initials || '').toLowerCase();
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // List of iOS-inspired colors for monograms
    const colors = [
      'bg-spring-green',
      'bg-ios-blue',
      'bg-ios-purple',
      'bg-ios-orange',
      'bg-ios-teal',
      'bg-ios-indigo',
      'bg-ios-pink',
    ];
    
    // Get a color based on the hash
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  // Interactive hover effects
  const interactiveClasses = interactive 
    ? 'cursor-pointer transition-transform hover:scale-105 active:scale-95' 
    : '';
  
  // Status animation
  const pulseAnimation = animated && status === 'online' 
    ? 'animate-pulse' 
    : '';
  
  // Calculate font size for initials based on avatar size
  const getInitialsFontSize = () => {
    const sizes = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-2xl',
    };
    
    return sizes[size];
  };
  
  // Animation props for framer-motion
  const motionProps = animated ? {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
  } : {};
  
  const Wrapper = animated ? motion.div : 'div';
  
  return (
    <Wrapper
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden',
        variantMap[variant],
        borderStyles,
        interactiveClasses,
        className
      )}
      style={{ 
        width: pixelSize, 
        height: pixelSize,
      }}
      onClick={onClick}
      {...motionProps}
    >
      {/* Image avatar */}
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={pixelSize}
          height={pixelSize}
          className="object-cover w-full h-full"
        />
      ) : monogram ? (
        /* Monogram avatar */
        <div 
          className={cn(
            'flex items-center justify-center w-full h-full font-sf-pro-rounded font-medium text-white',
            getMonogramBackground(),
            getInitialsFontSize()
          )}
        >
          {getUserInitials()}
        </div>
      ) : (
        /* Fallback icon avatar */
        <div className={cn(
          'flex items-center justify-center w-full h-full bg-sand-gray/30 dark:bg-midnight-forest/30',
          'text-midnight-forest/70 dark:text-white/70',
          getInitialsFontSize()
        )}>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-1/2 h-1/2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      )}
      
      {/* Status indicator */}
      {status !== 'none' && (
        <span
          className={cn(
            'absolute rounded-full border-2 border-white dark:border-midnight-forest',
            statusColorMap[status],
            statusPositionMap[statusPosition],
            pulseAnimation,
            size === 'xs' ? 'w-2 h-2' : 'w-3 h-3',
            statusClassName
          )}
        />
      )}
      
      {/* Badge */}
      {badge && (
        <div className="absolute -top-2 -right-2">
          {badge}
        </div>
      )}
    </Wrapper>
  );
} 