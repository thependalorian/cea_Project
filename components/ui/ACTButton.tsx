"use client";

/**
 * ACT Button Component - Alliance for Climate Transition
 * Modern 2025 button implementation following ACT brand guidelines with iOS-inspired design
 * Location: components/ui/ACTButton.tsx
 */

import Link from 'next/link';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ACTButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'minimal' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  href?: string;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  rounded?: boolean;
  roundedStyle?: 'default' | 'full';
}

export const ACTButton = forwardRef<HTMLButtonElement, ACTButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    href, 
    className, 
    icon, 
    iconPosition = 'left',
    loading = false,
    fullWidth = false,
    rounded = true,
    roundedStyle = 'default',
    disabled,
    ...props 
  }, ref) => {
    // Base button styling following ACT brand guidelines with modern touches
    const baseStyles = 'inline-flex items-center justify-center font-helvetica font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-spring-green/50 disabled:opacity-60 disabled:pointer-events-none';
    
    // Modern variant styles based on ACT color palette with iOS-inspired design
    const variantStyles = {
      primary: 'bg-spring-green text-midnight-forest hover:shadow-ios-normal hover:shadow-spring-green/20 active:bg-spring-green/80',
      secondary: 'bg-moss-green text-white hover:shadow-ios-normal hover:shadow-moss-green/20 active:bg-moss-green/80',
      accent: 'bg-seafoam-blue text-midnight-forest hover:shadow-ios-normal hover:shadow-seafoam-blue/20 active:bg-seafoam-blue/80',
      outline: 'border-2 border-spring-green bg-transparent text-midnight-forest hover:bg-spring-green/10 active:bg-spring-green/20 hover:shadow-ios-subtle',
      ghost: 'bg-transparent text-midnight-forest hover:bg-spring-green/10 active:bg-spring-green/20',
      minimal: 'bg-transparent text-midnight-forest hover:underline underline-offset-4 decoration-spring-green decoration-2',
      glass: 'bg-white/15 backdrop-blur-ios-light border border-white/25 text-midnight-forest shadow-ios-subtle hover:bg-white/25 hover:shadow-ios-normal active:bg-white/35',
    };
    
    // Size styles with appropriate padding and text size
    const sizeStyles = {
      sm: 'text-sm px-3 py-1.5 gap-1.5',
      md: 'text-base px-4 py-2 gap-2',
      lg: 'text-lg px-6 py-3 gap-2',
      xl: 'text-xl px-8 py-4 gap-3',
    };

    // Rounded styles with iOS-inspired rounded corners
    let roundedClass = 'rounded-md';
    if (rounded) {
      roundedClass = roundedStyle === 'full' ? 'rounded-ios-full' : 'rounded-ios-button';
    }
    
    const buttonClasses = cn(
      baseStyles,
      variantStyles[variant],
      sizeStyles[size],
      roundedClass,
      fullWidth && 'w-full',
      className
    );

    // Loading state
    const loadingContent = (
      <div className="flex items-center justify-center space-x-1">
        <span className="animate-pulse h-1.5 w-1.5 rounded-full bg-current opacity-75"></span>
        <span className="animate-pulse delay-75 h-1.5 w-1.5 rounded-full bg-current opacity-75"></span>
        <span className="animate-pulse delay-150 h-1.5 w-1.5 rounded-full bg-current opacity-75"></span>
        <span className="sr-only">Loading</span>
      </div>
    );
    
    // Button content with icon positioning
    const buttonContent = loading ? loadingContent : (
      <>
        {icon && iconPosition === 'left' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {icon && iconPosition === 'right' && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </>
    );
    
    // Animation properties
    const motionProps = {
      whileHover: { scale: 1.02 },
      whileTap: { scale: 0.98 },
      transition: { duration: 0.2 }
    };
    
    // Return as link if href is provided
    if (href) {
      return (
        <Link href={href} className={buttonClasses}>
          <motion.div
            {...motionProps}
          >
            {buttonContent}
          </motion.div>
        </Link>
      );
    }
    
    // Return as button otherwise
    return (
      <motion.button 
        ref={ref} 
        className={buttonClasses} 
        disabled={disabled || loading}
        {...motionProps}
        {...props as any}
      >
        {buttonContent}
      </motion.button>
    );
  }
);

ACTButton.displayName = 'ACTButton'; 