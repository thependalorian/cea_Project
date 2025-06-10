"use client";

/**
 * ACT Toast Component - Alliance for Climate Transition
 * Modern 2025 toast notification implementation with iOS-inspired design
 * Location: components/ui/ACTToast.tsx
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ACTToastProps {
  message: React.ReactNode;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onClose?: () => void;
  icon?: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
  className?: string;
  autoClose?: boolean;
  showProgress?: boolean;
}

export function ACTToast({
  message,
  type = 'info',
  duration = 3000,
  position = 'top-right',
  onClose,
  icon,
  title,
  action,
  className,
  autoClose = true,
  showProgress = true,
}: ACTToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (autoClose && duration > 0) {
      const startTime = Date.now();
      
      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration - elapsed);
        const progressValue = (remaining / duration) * 100;
        setProgress(progressValue);
        
        if (remaining <= 0) {
          clearInterval(progressInterval);
          handleClose();
        }
      }, 16); // ~60fps updates
      
      return () => clearInterval(progressInterval);
    }
  }, [duration, autoClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for exit animation
  };

  // Position mapping for toast placement
  const positionStyles = {
    'top': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  // Type-specific styles with iOS-inspired colors
  const typeStyles = {
    success: {
      bg: 'bg-ios-green/90 backdrop-blur-ios',
      border: 'border-ios-green/20',
      text: 'text-white',
      icon: 'text-white',
    },
    error: {
      bg: 'bg-ios-red/90 backdrop-blur-ios',
      border: 'border-ios-red/20',
      text: 'text-white',
      icon: 'text-white',
    },
    warning: {
      bg: 'bg-ios-yellow/90 backdrop-blur-ios',
      border: 'border-ios-yellow/20',
      text: 'text-midnight-forest',
      icon: 'text-midnight-forest',
    },
    info: {
      bg: 'bg-ios-blue/90 backdrop-blur-ios',
      border: 'border-ios-blue/20',
      text: 'text-white',
      icon: 'text-white',
    },
  };

  // Default icons for each type
  const getDefaultIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
    }
  };

  // Animation variants based on position
  const getAnimationVariants = () => {
    const isTop = position.includes('top');
    const isLeft = position.includes('left');
    const isRight = position.includes('right');
    
    let x = 0;
    let y = 0;
    
    if (isTop) y = -100;
    else y = 100;
    
    if (isLeft) x = -100;
    else if (isRight) x = 100;
    
    return {
      initial: { 
        opacity: 0, 
        x: position.includes('left') || position.includes('right') ? x : 0,
        y: isTop ? -100 : 100,
        scale: 0.8
      },
      animate: { 
        opacity: 1, 
        x: 0, 
        y: 0, 
        scale: 1,
        transition: {
          type: 'spring',
          damping: 20,
          stiffness: 300
        }
      },
      exit: { 
        opacity: 0, 
        x: position.includes('left') || position.includes('right') ? x : 0,
        y: isTop ? -100 : 100,
        scale: 0.8,
        transition: {
          duration: 0.2
        }
      }
    };
  };

  const currentStyles = typeStyles[type];
  const toastIcon = icon || getDefaultIcon();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'fixed z-50 max-w-sm w-full',
            positionStyles[position]
          )}
          variants={getAnimationVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div
            className={cn(
              'relative overflow-hidden rounded-ios-xl border shadow-ios-prominent',
              currentStyles.bg,
              currentStyles.border,
              'backdrop-blur-ios',
              className
            )}
          >
            {/* Progress bar */}
            {showProgress && autoClose && (
              <div className="absolute top-0 left-0 h-1 bg-white/20 w-full">
                <motion.div
                  className="h-full bg-white/60"
                  initial={{ width: '100%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>
            )}
            
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className={cn('flex-shrink-0 mt-0.5', currentStyles.icon)}>
                  {toastIcon}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  {title && (
                    <h4 className={cn(
                      'font-sf-pro-rounded font-medium text-sm mb-1',
                      currentStyles.text
                    )}>
                      {title}
                    </h4>
                  )}
                  <div className={cn(
                    'text-sm font-sf-pro',
                    currentStyles.text,
                    title ? 'opacity-90' : ''
                  )}>
                    {message}
                  </div>
                  
                  {/* Action */}
                  {action && (
                    <div className="mt-2">
                      {action}
                    </div>
                  )}
                </div>
                
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className={cn(
                    'flex-shrink-0 p-1 rounded-full transition-colors',
                    'hover:bg-white/20 active:bg-white/30',
                    currentStyles.icon
                  )}
                  aria-label="Close notification"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Toast container component for managing multiple toasts
export interface ToastContainerProps {
  toasts: (ACTToastProps & { id: string })[];
  position?: ACTToastProps['position'];
  className?: string;
}

export function ACTToastContainer({ 
  toasts, 
  position = 'top-right',
  className 
}: ToastContainerProps) {
  // Position mapping for container placement
  const containerPositionStyles = {
    'top': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom': 'bottom-4 left-1/2 transform -translate-x-1/2',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div className={cn(
      'fixed z-50 pointer-events-none',
      containerPositionStyles[position],
      className
    )}>
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast, index) => (
            <motion.div
              key={toast.id}
              className="pointer-events-auto"
              initial={{ opacity: 0, y: position.includes('top') ? -50 : 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: position.includes('top') ? -50 : 50 }}
              transition={{ 
                delay: index * 0.1,
                type: 'spring',
                damping: 20,
                stiffness: 300
              }}
            >
              <ACTToast
                {...toast}
                position={position}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Hook for programmatic toast usage
export function useACTToast() {
  const [toasts, setToasts] = useState<(ACTToastProps & { id: string })[]>([]);

  const addToast = (toast: ACTToastProps) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove if autoClose is enabled
    if (toast.autoClose !== false) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 3000);
    }
    
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
  };
} 