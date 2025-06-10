"use client";

/**
 * ACT Banner Component - Alliance for Climate Transition
 * Modern 2025 banner/announcement component with iOS-inspired design
 * Location: components/ui/ACTBanner.tsx
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type BannerVariant = 'info' | 'success' | 'warning' | 'error' | 'announcement';
type BannerSize = 'sm' | 'md' | 'lg';
type BannerPosition = 'top' | 'bottom' | 'inline';

interface ACTBannerProps {
  children?: React.ReactNode;
  title?: string;
  message?: string;
  variant?: BannerVariant;
  size?: BannerSize;
  position?: BannerPosition;
  appearance?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
  actionButton?: React.ReactNode;
  actionText?: string;
  onActionClick?: () => void;
  persistent?: boolean;
  animate?: boolean;
}

export function ACTBanner({
  children,
  title,
  message,
  variant = 'info',
  size = 'md',
  position = 'inline',
  appearance,
  dismissible = true,
  onDismiss,
  icon,
  showIcon = true,
  className,
  actionButton,
  actionText,
  onActionClick,
  persistent = false,
  animate = true,
}: ACTBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    if (!persistent) {
      setIsVisible(false);
      onDismiss?.();
    }
  };

  // Variant styles
  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300',
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300',
    announcement: 'bg-spring-green/10 border-spring-green/30 text-spring-green dark:bg-spring-green/5 dark:border-spring-green/20',
  };

  // Size styles
  const sizeStyles = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  // Position styles
  const positionStyles = {
    top: 'fixed top-0 left-0 right-0 z-50',
    bottom: 'fixed bottom-0 left-0 right-0 z-50',
    inline: 'relative',
  };

  // Default icons for variants
  const getDefaultIcon = () => {
    const iconMap = {
      info: <Info className="w-5 h-5" />,
      success: <CheckCircle className="w-5 h-5" />,
      warning: <AlertTriangle className="w-5 h-5" />,
      error: <AlertCircle className="w-5 h-5" />,
      announcement: <Info className="w-5 h-5" />,
    };
    return iconMap[variant];
  };

  // Animation variants
  const slideVariants = {
    initial: position === 'top' 
      ? { y: -100, opacity: 0 }
      : position === 'bottom'
        ? { y: 100, opacity: 0 }
        : { opacity: 0, y: -20 },
    animate: { y: 0, opacity: 1 },
    exit: position === 'top'
      ? { y: -100, opacity: 0 }
      : position === 'bottom'
        ? { y: 100, opacity: 0 }
        : { opacity: 0, y: -20 },
  };

  const motionProps = animate ? {
    initial: "initial",
    animate: "animate",
    exit: "exit",
    variants: slideVariants,
    transition: { duration: 0.3, ease: "easeInOut" }
  } : {};

  if (!isVisible) return null;

  const banner = (
    <motion.div
      className={cn(
        'border rounded-lg flex items-center justify-between gap-3',
        variantStyles[variant],
        sizeStyles[size],
        positionStyles[position],
        className
      )}
      {...motionProps}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {showIcon && (
          <div className="flex-shrink-0">
            {icon || getDefaultIcon()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-semibold mb-1">{title}</div>
          )}
          {message && (
            <div className={title ? "text-sm opacity-90" : ""}>{message}</div>
          )}
          {children}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {(actionButton || actionText) && (
          <div className="flex-shrink-0">
            {actionButton || (actionText && (
              <button
                onClick={onActionClick}
                className="px-3 py-1 text-sm font-medium rounded-md bg-current/10 hover:bg-current/20 transition-colors"
              >
                {actionText}
              </button>
            ))}
          </div>
        )}
        
        {dismissible && !persistent && (
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );

  if (animate) {
    return (
      <AnimatePresence mode="wait">
        {isVisible && banner}
      </AnimatePresence>
    );
  }

  return banner;
} 