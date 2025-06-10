"use client";

/**
 * ACT Frame Element Component - Alliance for Climate Transition
 * Modern iOS-inspired frame element for content presentation
 * Location: components/ui/ACTFrameElement.tsx
 */

import React, { forwardRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ACTFrameElementProps {
  // Content
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  
  // Visual variants
  variant?: 'default' | 'glass' | 'frosted' | 'minimal' | 'elevated' | 'gradient' | 'full' | 'open' | 'clean' | 'bordered' | 'brackets' | 'shadow' | 'outline';
  theme?: 'light' | 'dark' | 'auto';
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  
  // Sizing
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  height?: 'auto' | 'screen' | 'min' | 'max' | string;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '3:2' | 'auto';
  
  // Layout
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  direction?: 'row' | 'col';
  alignment?: 'start' | 'center' | 'end' | 'stretch';
  justification?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  
  // Interactions
  hoverable?: boolean;
  clickable?: boolean;
  animated?: boolean;
  loading?: boolean;
  disabled?: boolean;
  
  // Event handlers
  onClick?: () => void;
  onHover?: (isHovered: boolean) => void;
  
  // Style customization
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footerClassName?: string;
  
  // Accessibility
  role?: string;
  'aria-label'?: string;
  tabIndex?: number;
}

export const ACTFrameElement = forwardRef<HTMLDivElement, ACTFrameElementProps>(({
  children,
  title,
  subtitle,
  headerContent,
  footerContent,
  
  variant = 'default',
  theme = 'auto',
  borderStyle = 'solid',
  
  size = 'md',
  height = 'auto',
  aspectRatio = 'auto',
  
  padding = 'md',
  gap = 'md',
  direction = 'col',
  alignment = 'start',
  justification = 'start',
  
  hoverable = false,
  clickable = false,
  animated = true,
  loading = false,
  disabled = false,
  
  onClick,
  onHover,
  
  className,
  contentClassName,
  headerClassName,
  footerClassName,
  
  role,
  'aria-label': ariaLabel,
  tabIndex,
  
  ...props
}, ref) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Size mapping
  const sizeMap = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'w-full'
  };
  
  // Height mapping
  const heightMap = {
    auto: 'h-auto',
    screen: 'h-screen',
    min: 'min-h-fit',
    max: 'max-h-full'
  };
  
  // Aspect ratio mapping
  const aspectRatioMap = {
    '1:1': 'aspect-square',
    '4:3': 'aspect-[4/3]',
    '16:9': 'aspect-video',
    '3:2': 'aspect-[3/2]',
    auto: ''
  };
  
  // Padding mapping
  const paddingMap = {
    none: 'p-0',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };
  
  // Gap mapping
  const gapMap = {
    none: 'gap-0',
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };
  
  // Direction mapping
  const directionMap = {
    row: 'flex-row',
    col: 'flex-col'
  };
  
  // Alignment mapping
  const alignmentMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };
  
  // Justification mapping
  const justificationMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };
  
  // Border style mapping
  const borderStyleMap = {
    solid: 'border-solid',
    dashed: 'border-dashed',
    dotted: 'border-dotted',
    none: 'border-none'
  };
  
  // Variant styles
  const variantStyles = {
    default: 'bg-white border border-sand-gray/20 shadow-ios-subtle',
    glass: 'bg-white/15 backdrop-blur-ios border border-white/25 shadow-ios-normal',
    frosted: 'bg-white/75 dark:bg-midnight-forest/75 backdrop-blur-ios border border-white/15 dark:border-white/10 shadow-ios-normal',
    minimal: 'bg-transparent border border-sand-gray/10',
    elevated: 'bg-white border border-sand-gray/20 shadow-ios-elevated',
    gradient: 'bg-gradient-to-br from-spring-green/10 to-moss-green/10 border border-spring-green/20 shadow-ios-subtle',
    full: 'bg-white border border-sand-gray/20 shadow-ios-subtle',
    open: 'bg-white border border-sand-gray/20 shadow-ios-subtle',
    clean: 'bg-transparent border border-sand-gray/10',
    bordered: 'bg-transparent border border-sand-gray/10',
    brackets: 'bg-transparent border border-sand-gray/10',
    shadow: 'bg-transparent border border-sand-gray/10',
    outline: 'bg-transparent border border-sand-gray/10'
  };
  
  // Theme-specific text colors
  const themeTextColors = {
    light: 'text-midnight-forest',
    dark: 'text-white',
    auto: 'text-midnight-forest dark:text-white'
  };
  
  // Component wrapper styles
  const wrapperStyles = cn(
    'relative rounded-ios-xl overflow-hidden transition-all duration-200',
    
    // Size
    size !== 'full' ? sizeMap[size] : 'w-full',
    
    // Height
    typeof height === 'string' && heightMap[height as keyof typeof heightMap] 
      ? heightMap[height as keyof typeof heightMap]
      : height === 'auto' ? 'h-auto' : `h-[${height}]`,
    
    // Aspect ratio
    aspectRatio !== 'auto' ? aspectRatioMap[aspectRatio] : '',
    
    // Variant
    variantStyles[variant],
    
    // Border style
    borderStyleMap[borderStyle],
    
    // Theme
    themeTextColors[theme],
    
    // Interactions
    clickable && 'cursor-pointer',
    hoverable && 'hover:shadow-ios-normal hover:-translate-y-1',
    disabled && 'opacity-50 cursor-not-allowed',
    
    className
  );
  
  // Content container styles
  const contentStyles = cn(
    'flex',
    directionMap[direction],
    paddingMap[padding],
    gapMap[gap],
    alignmentMap[alignment],
    justificationMap[justification],
    'h-full',
    contentClassName
  );
  
  // Header styles
  const headerStyles = cn(
    'flex items-center justify-between border-b border-sand-gray/10 dark:border-white/10 px-4 py-3',
    headerClassName
  );
  
  // Footer styles
  const footerStyles = cn(
    'flex items-center justify-between border-t border-sand-gray/10 dark:border-white/10 px-4 py-3',
    footerClassName
  );
  
  // Handle mouse events
  const handleMouseEnter = () => {
    if (hoverable || onHover) {
      setIsHovered(true);
      onHover?.(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (hoverable || onHover) {
      setIsHovered(false);
      onHover?.(false);
    }
  };
  
  const handleClick = () => {
    if (clickable && onClick && !disabled) {
      onClick();
    }
  };
  
  // Animation variants
  const animationVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };
  
  // Choose motion component based on animation prop
  const MotionComponent = animated ? motion.div : 'div';
  const motionProps = animated ? {
    initial: "initial",
    animate: "animate",
    exit: "exit",
    variants: animationVariants,
    transition: { duration: 0.3, ease: "easeOut" }
  } : {};
  
  return (
    <MotionComponent
      ref={ref}
      role={role}
      aria-label={ariaLabel}
      tabIndex={clickable ? (tabIndex ?? 0) : tabIndex}
      className={wrapperStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onKeyDown={(e: any) => {
        if (clickable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
      {...motionProps}
      {...props}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 dark:bg-midnight-forest/70 backdrop-blur-ios-light flex items-center justify-center z-10">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-spring-green border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm text-midnight-forest dark:text-white">Loading...</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      {(title || subtitle || headerContent) && (
        <div className={headerStyles}>
          <div>
            {title && (
              <h3 className="font-sf-pro-rounded font-medium text-base">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="font-sf-pro text-sm opacity-70 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerContent && (
            <div className="flex items-center gap-2">
              {headerContent}
            </div>
          )}
        </div>
      )}
      
      {/* Main content */}
      <div className={contentStyles}>
        {children}
      </div>
      
      {/* Footer */}
      {footerContent && (
        <div className={footerStyles}>
          {footerContent}
        </div>
      )}
      
      {/* Hover indicator */}
      {hoverable && isHovered && (
        <div className="absolute inset-0 bg-spring-green/5 pointer-events-none transition-opacity duration-200" />
      )}
    </MotionComponent>
  );
});

ACTFrameElement.displayName = 'ACTFrameElement';

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