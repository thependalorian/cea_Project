"use client";

/**
 * ErrorBoundary Component - Alliance for Climate Transition
 * A styled wrapper around react-error-boundary package with iOS-inspired design
 * Location: components/ErrorBoundary.tsx
 */

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { cn } from '@/lib/utils';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  onReset?: () => void;
}

function DefaultFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="p-4 bg-ios-red/10 rounded-ios-lg border border-ios-red/20 shadow-ios-subtle">
      <h3 className="text-ios-red font-sf-pro-rounded font-medium">Something went wrong</h3>
      <p className="text-sm text-ios-red/80 mb-4 font-sf-pro">
        {error.message || 'An unexpected error occurred'}
      </p>
      <button 
        className="px-4 py-2 bg-white/30 text-ios-red border border-ios-red/30 rounded-ios-full text-sm font-sf-pro-rounded transition-all hover:bg-white/50 active:scale-95"
        onClick={resetErrorBoundary}
      >
        Try Again
      </button>
    </div>
  );
}

export function ErrorBoundary({
  children,
  fallback,
  className,
  onReset
}: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      fallbackRender={fallback 
        ? () => fallback as React.ReactElement 
        : (props) => <DefaultFallback {...props} />
      }
      onReset={onReset}
    >
      <div className={cn(className)}>
        {children}
      </div>
    </ReactErrorBoundary>
  );
} 