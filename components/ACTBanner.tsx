"use client";

/**
 * ACT Banner Component - Alliance for Climate Transition
 * Modern 2025 banner implementation with iOS-inspired design
 * Location: act-brand-demo/components/ui/ACTBanner.tsx
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ACTBannerProps {
  title?: string;
  message: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error' | 'neutral';
  appearance?: 'default' | 'glass' | 'frosted' | 'minimal' | 'bordered';
  position?: 'top' | 'bottom';
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: React.ReactNode;
  actionText?: string;
  onActionClick?: () => void;
  className?: string;
  dark?: boolean;
  compact?: boolean;
  animated?: boolean;
  sticky?: boolean;
  showTime?: number; // Auto-dismiss time in ms (0 = never)
}

export function ACTBanner({
  title,
  message,
  icon,
  variant = 'info',
  appearance = 'default',
  position = 'top',
  dismissible = true,
  onDismiss,
  action,
  actionText,
  onActionClick,
  className,
  dark = false,
  compact = false,
  animated = true,
  sticky = false,
  showTime = 0,
}: ACTBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  // Handle dismiss
  const handleDismiss = React.useCallback(() => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
  }, [onDismiss]);
  
  // Auto-dismiss functionality
  React.useEffect(() => {
    if (showTime > 0 && isVisible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, showTime);
      
      return () => clearTimeout(timer);
    }
  }, [showTime, isVisible, handleDismiss]);
  
  // Variant styles (background, text, icon colors)
  const variantStyles = {
    info: {
      background: dark ? 'bg-ios-blue/20' : 'bg-ios-blue/10',
      border: 'border-ios-blue/30',
      text: 'text-ios-blue-900 dark:text-ios-blue-100',
      icon: 'text-ios-blue',
    },
    success: {
      background: dark ? 'bg-ios-green/20' : 'bg-ios-green/10',
      border: 'border-ios-green/30',
      text: 'text-ios-green-900 dark:text-ios-green-100',
      icon: 'text-ios-green',
    },
    warning: {
      background: dark ? 'bg-ios-yellow/20' : 'bg-ios-yellow/10',
      border: 'border-ios-yellow/30',
      text: 'text-ios-yellow-900 dark:text-ios-yellow-100',
      icon: 'text-ios-yellow',
    },
    error: {
      background: dark ? 'bg-ios-red/20' : 'bg-ios-red/10',
      border: 'border-ios-red/30',
      text: 'text-ios-red-900 dark:text-ios-red-100',
      icon: 'text-ios-red',
    },
    neutral: {
      background: dark ? 'bg-white/10' : 'bg-sand-gray/10',
      border: 'border-sand-gray/30',
      text: 'text-midnight-forest dark:text-white',
      icon: 'text-midnight-forest/70 dark:text-white/70',
    },
  };
  
  // Appearance styles
  const appearanceStyles = {
    default: '',
    glass: 'backdrop-blur-ios',
    frosted: 'backdrop-blur-ios-heavy',
    minimal: 'bg-transparent backdrop-blur-none',
    bordered: 'border-2',
  };
  
  // Position styles
  const positionStyles = {
    top: sticky ? 'sticky top-0 z-50' : '',
    bottom: sticky ? 'sticky bottom-0 z-50' : '',
  };
  
  // Animation variants
  const bannerVariants = {
    initial: position === 'top' 
      ? { opacity: 0, y: -50 } 
      : { opacity: 0, y: 50 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    },
    exit: position === 'top' 
      ? { opacity: 0, y: -50 } 
      : { opacity: 0, y: 50 },
  };
  
  // Default icons based on variant
  const getDefaultIcon = () => {
    switch (variant) {
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        );
    }
  };
  
  // Ensure we have an icon
  const bannerIcon = icon || getDefaultIcon();
  
  // If not visible and animated, render nothing
  if (!isVisible) return null;
  
  const Banner = animated ? motion.div : 'div';
  const animationProps = animated ? {
    initial: "initial",
    animate: "animate",
    exit: "exit",
    variants: bannerVariants
  } : {};
  
  const bannerContent = (
    <Banner
      className={cn(
        'w-full rounded-ios-xl overflow-hidden',
        appearanceStyles[appearance],
        variantStyles[variant].background,
        appearance === 'bordered' ? variantStyles[variant].border : '',
        compact ? 'p-3' : 'p-4',
        positionStyles[position],
        className
      )}
      {...animationProps}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0",
          variantStyles[variant].icon
        )}>
          {bannerIcon}
        </div>
        
        {/* Content */}
        <div className="flex-grow">
          {title && (
            <h4 className={cn(
              "font-sf-pro-rounded font-medium",
              compact ? "text-sm" : "text-base",
              variantStyles[variant].text
            )}>
              {title}
            </h4>
          )}
          <div className={cn(
            "font-sf-pro",
            compact ? "text-xs" : "text-sm",
            !title ? variantStyles[variant].text : `${variantStyles[variant].text} opacity-80`
          )}>
            {message}
          </div>
        </div>
        
        {/* Action */}
        {(actionText || action) && (
          <div className="flex-shrink-0 ml-2">
            {action || (
              <button
                onClick={onActionClick}
                className={cn(
                  "px-3 py-1.5 rounded-ios-full font-sf-pro font-medium text-sm",
                  "bg-white/20 hover:bg-white/30",
                  "transition-colors duration-200",
                  variantStyles[variant].text
                )}
              >
                {actionText}
              </button>
            )}
          </div>
        )}
        
        {/* Dismiss button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className={cn(
              "flex-shrink-0 ml-2 p-1 rounded-full",
              "hover:bg-white/20 transition-colors duration-200",
              variantStyles[variant].text
            )}
            aria-label="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>
    </Banner>
  );
  
  return animated ? (
    <AnimatePresence>{isVisible && bannerContent}</AnimatePresence>
  ) : (
    bannerContent
  );
} 