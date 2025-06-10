"use client";

/**
 * ACT Card Component - Alliance for Climate Transition
 * Modern 2025 card component with iOS-inspired design
 * Location: components/ui/ACTCard.tsx
 */

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'glass' | 'frosted' | 'outlined' | 'elevated' | 'minimal' | 'gradient';
type CardSize = 'sm' | 'md' | 'lg' | 'xl';

interface ACTCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  size?: CardSize;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
  hoverable?: boolean;
  clickable?: boolean;
  loading?: boolean;
  disabled?: boolean;
  title?: string;
  description?: string;
}

export const ACTCard = forwardRef<HTMLDivElement, ACTCardProps>(({
  variant = 'default',
  size = 'md',
  header,
  footer,
  children,
  className,
  animated = true,
  hoverable = false,
  clickable = false,
  loading = false,
  disabled = false,
  title,
  description,
  ...props
}, ref) => {
  // Variant styles
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 shadow-lg',
    frosted: 'bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl',
    outlined: 'bg-transparent border-2 border-gray-200 dark:border-gray-700',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700',
    minimal: 'bg-transparent',
    gradient: 'bg-gradient-to-br from-spring-green/10 to-moss-green/10 border border-spring-green/20 shadow-sm',
  };

  // Size styles
  const sizeStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  // Interactive styles
  const interactiveStyles = cn(
    hoverable && 'hover:shadow-md transition-shadow duration-200',
    clickable && 'cursor-pointer hover:scale-[1.02] transition-transform duration-200',
    disabled && 'opacity-50 cursor-not-allowed',
  );

  // Animation props
  const motionProps = animated ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};

  const cardClassName = cn(
    'rounded-lg overflow-hidden',
    variantStyles[variant],
    sizeStyles[size],
    interactiveStyles,
    loading && 'animate-pulse',
    className
  );

  // Filter out animation-related props that conflict with motion
  const { 
    onAnimationStart, 
    onAnimationEnd, 
    onAnimationIteration,
    onTransitionEnd,
    onDragStart,
    onDragEnd,
    onDrag,
    onDragEnter,
    onDragExit,
    onDragLeave,
    onDragOver,
    onDrop,
    ...filteredProps 
  } = props;

  const cardContent = (
    <>
      {header && (
        <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
          {header}
        </div>
      )}
      
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="flex-1">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
          </div>
        ) : (
          children
        )}
      </div>
      
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </>
  );

  if (animated) {
    return (
      <motion.div
        ref={ref}
        className={cardClassName}
        {...motionProps}
        {...filteredProps}
      >
        {cardContent}
      </motion.div>
    );
  }

  return (
    <div
      ref={ref}
      className={cardClassName}
      {...props}
    >
      {cardContent}
    </div>
  );
});

ACTCard.displayName = 'ACTCard'; 