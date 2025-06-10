"use client";

/**
 * ACT Frame Element Component - Alliance for Climate Transition
 * Modern 2025 implementation with iOS-inspired glass effects and rounded corners
 * Based on Apple design principles
 * Location: components/ui/ACTFrameElement.tsx
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type FrameVariant = 'full' | 'open' | 'brackets' | 'corner-brackets' | 'double' | 'gradient' | 'glass' | 'frosted';
type FrameSize = 'sm' | 'md' | 'lg' | 'xl';

interface ACTFrameElementProps {
  children: ReactNode;
  variant?: FrameVariant;
  size?: FrameSize;
  className?: string;
  animate?: boolean;
  elevation?: 'flat' | 'raised' | 'floating' | 'elevated';
  hoverEffect?: boolean;
  clickable?: boolean;
  rounded?: boolean;
  onClick?: () => void;
}

export function ACTFrameElement({
  children,
  variant = 'full',
  size = 'md',
  className,
  animate = false,
  elevation = 'flat',
  hoverEffect = false,
  clickable = false,
  rounded = false,
  onClick,
}: ACTFrameElementProps) {
  // Size mapping based on brand guidelines
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Border thickness based on size
  const borderClasses = {
    sm: 'border-2',
    md: 'border-3',
    lg: 'border-4',
    xl: 'border-4',
  };

  // Elevation styles with iOS-inspired shadows
  const elevationClasses = {
    flat: '',
    raised: 'shadow-ios-subtle',
    floating: 'shadow-ios-normal',
    elevated: 'shadow-ios-prominent',
  };

  // Rounded corners
  const roundedClasses = rounded 
    ? 'rounded-ios-xl' 
    : 'rounded-ios-lg';

  // Frame styles based on variant
  const frameStyles = {
    full: `${borderClasses[size]} border-spring-green ${roundedClasses} overflow-hidden`,
    open: `${borderClasses[size]} border-l border-t border-b border-spring-green rounded-l-ios-lg overflow-hidden`,
    brackets: 'relative overflow-hidden',
    'corner-brackets': 'relative overflow-hidden p-0',
    double: `${borderClasses[size]} border-spring-green ${roundedClasses} p-0.5 overflow-hidden`,
    gradient: `${roundedClasses} overflow-hidden p-0.5 bg-gradient-to-br from-spring-green via-seafoam-blue to-moss-green`,
    glass: `${roundedClasses} overflow-hidden bg-white/15 backdrop-blur-ios border border-white/25 shadow-ios-subtle`,
    frosted: `${roundedClasses} overflow-hidden bg-white/75 dark:bg-midnight-forest/75 backdrop-blur-ios border border-white/25 dark:border-white/10 shadow-ios-subtle`
  };

  // Hover effect classes with iOS-inspired animations
  const hoverClasses = hoverEffect 
    ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-ios-normal' 
    : '';
  
  // Clickable effect
  const clickableClasses = clickable 
    ? 'cursor-pointer active:scale-[0.98] transition-transform' 
    : '';

  // Wrapper component with or without animation
  const Wrapper = animate ? motion.div : 'div';
  
  // Animation properties
  const motionProps = animate ? {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <Wrapper
      className={cn(
        frameStyles[variant],
        sizeClasses[size],
        elevationClasses[elevation],
        hoverClasses,
        clickableClasses,
        className
      )}
      onClick={onClick}
      {...motionProps}
    >
      {variant === 'double' && (
        <div className={`${borderClasses[size]} border-white ${roundedClasses} ${sizeClasses[size]} bg-white`}>
          {children}
        </div>
      )}
      
      {variant === 'gradient' && (
        <div className={`${roundedClasses} ${sizeClasses[size]} bg-white`}>
          {children}
        </div>
      )}
      
      {variant === 'glass' && (
        <div className={`${sizeClasses[size]}`}>
          {children}
        </div>
      )}
      
      {variant === 'frosted' && (
        <div className={`${sizeClasses[size]}`}>
          {children}
        </div>
      )}
      
      {variant === 'brackets' && (
        <>
          <div className="act-brackets">
            <div className="corner-tl"></div>
            <div className="corner-tr"></div>
            <div className="corner-bl"></div>
            <div className="corner-br"></div>
            {children}
          </div>
        </>
      )}
      
      {variant === 'corner-brackets' && (
        <div className={`relative ${sizeClasses[size]}`}>
          {/* Modern bracket corners */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-3 border-l-3 border-spring-green rounded-tl-sm"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t-3 border-r-3 border-spring-green rounded-tr-sm"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-3 border-l-3 border-spring-green rounded-bl-sm"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-3 border-r-3 border-spring-green rounded-br-sm"></div>
          {children}
        </div>
      )}
      
      {(variant !== 'brackets' && variant !== 'corner-brackets' && variant !== 'double' && variant !== 'gradient' && variant !== 'glass' && variant !== 'frosted') && children}
    </Wrapper>
  );
}

// CSS animation for frame glow effect
const styles = `
  @keyframes actFrameGlow {
    0%, 100% { 
      box-shadow: 0 0 10px rgba(178, 222, 38, 0.3);
    }
    50% { 
      box-shadow: 0 0 20px rgba(178, 222, 38, 0.5);
    }
  }
  
  .act-frame-glow {
    animation: actFrameGlow 2s ease-in-out infinite;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
} 