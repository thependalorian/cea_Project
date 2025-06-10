"use client";

/**
 * iOS-Inspired Layout Component - Climate Economy Assistant
 * Provides consistent iOS-style layout structure across all pages
 * Location: components/layout/IOSLayout.tsx
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface IOSLayoutProps {
  children: React.ReactNode;
  variant?: 'page' | 'modal' | 'sheet' | 'card';
  className?: string;
  showNavigation?: boolean;
  showFooter?: boolean;
  backgroundColor?: 'default' | 'glass' | 'gradient' | 'solid';
  spacing?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centerContent?: boolean;
  animated?: boolean;
}

export function IOSLayout({
  children,
  variant = 'page',
  className,
  showNavigation = true,
  showFooter = true,
  backgroundColor = 'default',
  spacing = 'lg',
  maxWidth = 'xl',
  centerContent = false,
  animated = true,
}: IOSLayoutProps) {
  
  // Background variants
  const backgroundVariants = {
    default: 'bg-gradient-to-b from-gray-100 to-white',
    glass: 'bg-white/95 backdrop-blur-ios',
    gradient: 'bg-gradient-to-br from-spring-green/10 via-seafoam-blue/5 to-moss-green/10',
    solid: 'bg-white',
  };
  
  // Spacing variants
  const spacingVariants = {
    none: '',
    sm: 'spacing-ios-sm',
    md: 'spacing-ios-md',
    lg: 'spacing-ios-lg',
    xl: 'spacing-ios-xl',
  };
  
  // Max width variants
  const maxWidthVariants = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    '2xl': 'max-w-8xl',
    full: 'max-w-full',
  };
  
  // Layout variants
  const layoutVariants = {
    page: 'min-h-screen',
    modal: 'rounded-ios-2xl shadow-ios-elevated',
    sheet: 'rounded-t-ios-2xl',
    card: 'rounded-ios-xl shadow-ios-normal',
  };
  
  // Animation variants
  const animationVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94], // iOS-style easing
      }
    },
  };
  
  const containerClasses = cn(
    layoutVariants[variant],
    backgroundVariants[backgroundColor],
    spacingVariants[spacing],
    centerContent && 'flex flex-col items-center justify-center',
    className
  );
  
  const contentClasses = cn(
    'w-full mx-auto',
    maxWidthVariants[maxWidth],
    variant === 'page' && 'px-4 sm:px-6 lg:px-8'
  );
  
  const LayoutContent = () => (
    <div className={containerClasses}>
      <div className={contentClasses}>
        {children}
      </div>
    </div>
  );
  
  if (animated) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={animationVariants}
        className={containerClasses}
      >
        <div className={contentClasses}>
          {children}
        </div>
      </motion.div>
    );
  }
  
  return <LayoutContent />;
}

// iOS-inspired section component
interface IOSSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: 'default' | 'card' | 'inset' | 'glass';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  headerAlignment?: 'left' | 'center' | 'right';
}

export function IOSSection({
  children,
  title,
  subtitle,
  className,
  variant = 'default',
  spacing = 'lg',
  headerAlignment = 'left',
}: IOSSectionProps) {
  
  const sectionVariants = {
    default: '',
    card: 'container-ios',
    inset: 'container-ios-inset',
    glass: 'card-ios-glass spacing-ios-lg',
  };
  
  const spacingClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-20',
  };
  
  const alignmentClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };
  
  return (
    <section className={cn(spacingClasses[spacing], sectionVariants[variant], className)}>
      {(title || subtitle) && (
        <div className={cn('mb-8', alignmentClasses[headerAlignment])}>
          {title && (
            <h2 className="text-ios-title-1 text-midnight-forest mb-3">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-ios-body text-midnight-forest/70 max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

// iOS-inspired grid component
interface IOSGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  responsive?: boolean;
}

export function IOSGrid({
  children,
  columns = 3,
  gap = 'lg',
  className,
  responsive = true,
}: IOSGridProps) {
  
  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  };
  
  const columnClasses = responsive 
    ? {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
        6: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
      }
    : {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        6: 'grid-cols-6',
      };
  
  return (
    <div className={cn('grid', columnClasses[columns], gapClasses[gap], className)}>
      {children}
    </div>
  );
}

// iOS-inspired container component
interface IOSContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'frosted' | 'inset' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  rounded?: boolean;
  shadow?: boolean;
}

export function IOSContainer({
  children,
  variant = 'default',
  padding = 'lg',
  className,
  rounded = true,
  shadow = true,
}: IOSContainerProps) {
  
  const variantClasses = {
    default: 'bg-white border border-gray-200',
    glass: 'bg-white/15 backdrop-blur-ios border border-white/25',
    frosted: 'bg-white/75 backdrop-blur-ios-heavy border border-white/30',
    inset: 'bg-gray-100 border-0',
    elevated: 'bg-white border border-gray-200',
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };
  
  const shadowClasses = {
    default: shadow ? 'shadow-ios-subtle' : '',
    glass: shadow ? 'shadow-ios-subtle' : '',
    frosted: shadow ? 'shadow-ios-normal' : '',
    inset: '',
    elevated: shadow ? 'shadow-ios-prominent' : '',
  };
  
  return (
    <div className={cn(
      variantClasses[variant],
      paddingClasses[padding],
      shadowClasses[variant],
      rounded && 'rounded-ios-xl',
      'transition-all duration-300',
      className
    )}>
      {children}
    </div>
  );
} 