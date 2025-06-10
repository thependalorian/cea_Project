"use client";

/**
 * Error Boundary Component - Alliance for Climate Transition
 * Modern error boundary with user-friendly fallback UI
 * Location: act-brand-demo/components/ui/ErrorBoundary.tsx
 */

import React, { ReactNode } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  onReset?: () => void;
}

interface FallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function DefaultFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 bg-ios-red/10 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ios-red">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h3 className="text-lg font-sf-pro-rounded font-semibold text-midnight-forest mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-midnight-forest/70 mb-4">
          We encountered an unexpected error. Please try again.
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-spring-green text-midnight-forest rounded-ios-button font-sf-pro font-medium hover:shadow-ios-subtle transition-all duration-200"
        >
          Try again
        </button>
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-midnight-forest/50 cursor-pointer">Error details</summary>
            <pre className="mt-2 text-xs text-ios-red bg-ios-red/5 p-2 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
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
      FallbackComponent={fallback ? () => fallback : DefaultFallback}
      onReset={onReset}
    >
      <div className={className}>
        {children}
      </div>
    </ReactErrorBoundary>
  );
} 