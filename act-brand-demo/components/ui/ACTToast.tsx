"use client";

/**
 * ACT Toast Component - Alliance for Climate Transition
 * Modern 2025 toast notification implementation with iOS-inspired design
 * Location: components/ui/ACTToast.tsx
 */

import React, { useEffect, useState } from 'react';
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
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  // Handle auto close with progress
  useEffect(() => {
    if (autoClose && duration > 0) {
      // For progress bar animation
      const totalSteps = 100;
      const intervalTime = duration / totalSteps;
      
      const id = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(id);
            setVisible(false);
            return 0;
          }
          return prev - 100 / totalSteps;
        });
      }, intervalTime);
      
      setIntervalId(id);
      
      return () => {
        if (id) clearInterval(id);
      };
    }
  }, [autoClose, duration]);

  // Cleanup when toast hides
  useEffect(() => {
    if (!visible) {
      if (intervalId) clearInterval(intervalId);
      
      // Slight delay to allow exit animation to complete
      const timeout = setTimeout(() => {
        if (onClose) onClose();
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [visible, onClose, intervalId]);

  // Handle manual close
  const handleClose = () => {
    if (intervalId) clearInterval(intervalId);
    setVisible(false);
  };

  // Type-based styling
  const typeStyles = {
    success: {
      bg: 'bg-ios-green/10',
      border: 'border-ios-green/30',
      icon: !icon ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-ios-green">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      ) : icon,
      text: 'text-ios-green-900 dark:text-ios-green-100',
      progress: 'bg-ios-green'
    },
    error: {
      bg: 'bg-ios-red/10',
      border: 'border-ios-red/30',
      icon: !icon ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-ios-red">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
      ) : icon,
      text: 'text-ios-red-900 dark:text-ios-red-100',
      progress: 'bg-ios-red'
    },
    warning: {
      bg: 'bg-ios-yellow/10',
      border: 'border-ios-yellow/30',
      icon: !icon ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-ios-yellow">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      ) : icon,
      text: 'text-ios-yellow-900 dark:text-ios-yellow-100',
      progress: 'bg-ios-yellow'
    },
    info: {
      bg: 'bg-ios-blue/10',
      border: 'border-ios-blue/30',
      icon: !icon ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-ios-blue">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
      ) : icon,
      text: 'text-ios-blue-900 dark:text-ios-blue-100',
      progress: 'bg-ios-blue'
    }
  };

  // Position styles
  const positionStyles = {
    'top': 'top-4 left-1/2 -translate-x-1/2',
    'bottom': 'bottom-4 left-1/2 -translate-x-1/2',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  // Animation variants
  const toastVariants = {
    hidden: {
      opacity: 0,
      y: position.includes('top') ? -20 : 20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.2
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={cn(
            'fixed z-50 max-w-md w-full',
            positionStyles[position],
            className
          )}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={toastVariants}
        >
          <div 
            className={cn(
              'flex items-start overflow-hidden rounded-ios-xl shadow-ios-normal border backdrop-blur-ios',
              typeStyles[type].bg,
              typeStyles[type].border
            )}
          >
            <div className="flex-1 p-4">
              <div className="flex items-start">
                {/* Icon */}
                <div className="flex-shrink-0 mr-3">
                  {typeStyles[type].icon}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  {title && (
                    <h4 className={cn('font-sf-pro-rounded font-medium text-sm mb-1', typeStyles[type].text)}>
                      {title}
                    </h4>
                  )}
                  <div className={cn('font-sf-pro text-sm', typeStyles[type].text, title ? 'opacity-80' : '')}>
                    {message}
                  </div>
                  
                  {/* Action button */}
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
                    'ml-2 p-1 rounded-full hover:bg-black/5 flex-shrink-0',
                    typeStyles[type].text
                  )}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Progress bar */}
            {showProgress && autoClose && (
              <div className="h-1 w-full bg-black/5">
                <div 
                  className={cn('h-full', typeStyles[type].progress)}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Static method to show a toast programmatically
ACTToast.show = (props: ACTToastProps) => {
  // Create container if it doesn't exist
  let container = document.getElementById('act-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'act-toast-container';
    container.className = 'fixed inset-0 z-50 pointer-events-none';
    document.body.appendChild(container);
  }
  
  // Create toast element
  const toastElement = document.createElement('div');
  toastElement.className = 'pointer-events-auto';
  container.appendChild(toastElement);
  
  // Cleanup function
  const cleanup = () => {
    if (container?.contains(toastElement)) {
      container.removeChild(toastElement);
    }
    
    // Remove container if empty
    if (container?.childNodes.length === 0) {
      document.body.removeChild(container);
    }
  };
  
  // Use modern React DOM API
  import('react-dom/client').then(({ createRoot }) => {
    const root = createRoot(toastElement);
    
    root.render(
      <ACTToast
        {...props}
        onClose={() => {
          if (props.onClose) props.onClose();
          root.unmount();
          cleanup();
        }}
      />
    );
  }).catch(err => {
    console.error('Failed to load React DOM client:', err);
  });
  
  // Return cleanup function
  return cleanup;
}; 