"use client";

/**
 * ErrorBoundary Component - Alliance for Climate Transition
 * Enhanced error boundary with hydration error handling and debugging
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
  name?: string; // For debugging specific components
}

function isHydrationError(error: Error): boolean {
  return (
    error.message.includes('Text content does not match') ||
    error.message.includes('Hydration failed') ||
    error.message.includes('server-rendered HTML') ||
    error.name === 'ChunkLoadError'
  );
}

function DefaultFallback({ error, resetErrorBoundary }: FallbackProps) {
  const isHydration = isHydrationError(error);
  
  const handleRefresh = () => {
    // Clear potential cached states that might cause hydration issues
    if (typeof window !== 'undefined') {
      // Clear timestamp-related localStorage items
      Object.keys(localStorage).forEach(key => {
        if (key.includes('timestamp') || key.includes('time')) {
          localStorage.removeItem(key);
        }
      });
      window.location.reload();
    }
  };

  const handleReset = () => {
    resetErrorBoundary();
  };

  return (
    <div className="p-6 bg-gradient-to-br from-ios-red/5 to-ios-red/10 rounded-ios-lg border border-ios-red/20 shadow-ios-subtle max-w-md mx-auto">
      <div className="text-center mb-4">
        <div className="w-12 h-12 bg-ios-red/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-red-600 font-helvetica font-medium text-lg">
          {isHydration ? 'Page Loading Issue' : 'Something went wrong'}
        </h3>
      </div>
      
      <div className="space-y-3 mb-6">
        {isHydration ? (
          <div className="text-sm text-red-600/80 font-inter space-y-2">
            <p>We detected a hydration mismatch, likely due to time-dependent content.</p>
            <div className="bg-red-50 border border-red-200 rounded-ios-md p-3 text-xs">
              <strong>Technical:</strong> Server and client rendered different content
            </div>
          </div>
        ) : (
          <div className="text-sm text-red-600/80 font-inter">
            <p>An unexpected error occurred in the application.</p>
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-red-500 hover:text-red-700">
                Show error details
              </summary>
              <pre className="mt-2 text-xs bg-red-50 p-2 rounded border overflow-auto max-h-32">
                {error.message}
              </pre>
            </details>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-2 bg-white/50 text-red-600 border border-red-300 rounded-ios-full text-sm font-helvetica transition-all hover:bg-white/70 active:scale-95"
        >
          Try Again
        </button>
        <button
          onClick={handleRefresh}
          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-ios-full text-sm font-helvetica transition-all hover:bg-red-600 active:scale-95"
        >
          Refresh Page
        </button>
      </div>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 text-xs text-red-500/60 font-mono">
          Error ID: {Date.now()}
        </div>
      )}
    </div>
  );
}

// Enhanced error logging
function logError(error: Error, errorInfo: React.ErrorInfo, componentName?: string) {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    component: componentName,
    isHydration: isHydrationError(error),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
    url: typeof window !== 'undefined' ? window.location.href : 'SSR'
  };

  console.group('🚨 Error Boundary Caught Error');
  console.error('Error:', error);
  console.error('Error Info:', errorInfo);
  console.error('Details:', errorDetails);
  console.groupEnd();

  // In production, you might want to send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry, LogRocket, etc.
    // sendToErrorReporting(errorDetails);
  }
}

export function ErrorBoundary({
  children,
  fallback,
  className,
  onReset,
  name = 'Unknown Component'
}: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      fallbackRender={fallback 
        ? () => fallback as React.ReactElement 
        : (props) => <DefaultFallback {...props} />
      }
      onError={(error, errorInfo) => logError(error, errorInfo, name)}
      onReset={onReset}
    >
      <div className={cn(className)}>
        {children}
      </div>
    </ReactErrorBoundary>
  );
}

// Specialized Error Boundary for Chat Components
export function ChatErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary 
      name="ClimateChat"
      fallback={
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-yellow-800 font-medium mb-2">Chat Temporarily Unavailable</h4>
          <p className="text-yellow-700 text-sm mb-3">
            Our climate career chat is experiencing issues. This might be due to:
          </p>
          <ul className="text-yellow-700 text-xs space-y-1 mb-4">
            <li>• Backend server connection issues</li>
            <li>• Authentication requirements</li>
            <li>• Temporary server maintenance</li>
          </ul>
          <button 
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
          >
            Reload Chat
          </button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
} 