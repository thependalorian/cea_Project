"use client";

/**
 * Enhanced Error Boundary - Climate Economy Assistant
 * Comprehensive error handling with ACT design system
 * Location: components/error/ErrorBoundary.tsx
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ACTCard, ACTButton } from '@/components/ui';
import { AlertTriangle, RefreshCw, Bug, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showReload?: boolean;
  title?: string;
  description?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class EnhancedErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service
    this.logError(error, errorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private logError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
        url: typeof window !== 'undefined' ? window.location.href : 'SSR',
        errorId: this.state.errorId
      };

      // Send to error logging service (implement as needed)
      console.error('CEA Error Boundary:', errorReport);
      
      // Could send to external service like Sentry, LogRocket, etc.
      // await fetch('/api/error-log', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorId } = this.state;
      const { title, description, showReload = true } = this.props;

      return (
        <div className="min-h-screen bg-gradient-to-br from-seafoam-blue/20 via-white to-sand-gray/30 flex items-center justify-center p-4">
          <ACTCard variant="frosted" className="max-w-2xl w-full text-center p-8">
            {/* Error Icon */}
            <div className="w-16 h-16 bg-ios-red/10 rounded-ios-2xl mx-auto mb-6 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-ios-red" />
            </div>

            {/* Error Title */}
            <h1 className="text-ios-title-1 font-sf-pro font-semibold text-midnight-forest mb-4">
              {title || 'Something went wrong'}
            </h1>

            {/* Error Description */}
            <p className="text-ios-body font-sf-pro text-midnight-forest/70 mb-6">
              {description || 'We encountered an unexpected error while processing your request. Our team has been notified and is working to resolve the issue.'}
            </p>

            {/* Error Details for Development */}
            {process.env.NODE_ENV === 'development' && error && (
              <ACTCard variant="outlined" className="text-left p-4 mb-6 bg-ios-red/5">
                <h3 className="text-ios-headline font-sf-pro font-semibold text-ios-red mb-2 flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Development Error Details
                </h3>
                <div className="text-ios-subheadline font-sf-mono text-midnight-forest/80 overflow-auto">
                  <p className="font-sf-pro font-medium mb-2">Error ID: {errorId}</p>
                  <p className="mb-2">{error.message}</p>
                  {error.stack && (
                    <pre className="text-ios-caption-1 bg-sand-gray/20 p-3 rounded-ios-lg overflow-auto">
                      {error.stack}
                    </pre>
                  )}
                </div>
              </ACTCard>
            )}

            {/* Error ID for User Support */}
            <div className="bg-sand-gray/20 rounded-ios-lg p-3 mb-6">
              <p className="text-ios-caption-1 font-sf-pro text-midnight-forest/70">
                Error ID: <span className="font-sf-mono text-midnight-forest">{errorId}</span>
              </p>
              <p className="text-ios-caption-2 font-sf-pro text-midnight-forest/60 mt-1">
                Please include this ID when contacting support
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ACTButton 
                variant="primary" 
                onClick={this.handleReset}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Try Again
              </ACTButton>
              
              {showReload && (
                <ACTButton 
                  variant="secondary" 
                  onClick={this.handleReload}
                >
                  Reload Page
                </ACTButton>
              )}
              
              <ACTButton 
                variant="outline" 
                onClick={this.handleGoHome}
                icon={<Home className="w-4 h-4" />}
              >
                Go Home
              </ACTButton>
            </div>

            {/* Contact Support */}
            <div className="mt-8 pt-6 border-t border-sand-gray/20">
              <p className="text-ios-subheadline font-sf-pro text-midnight-forest/70 mb-3">
                Need help? Contact our support team
              </p>
              <ACTButton 
                variant="ghost" 
                href="mailto:support@climateeconomy.org?subject=Error%20Report%20-%20ID:%20${errorId}"
                className="text-spring-green"
              >
                Send Error Report
              </ACTButton>
            </div>
          </ACTCard>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simplified Error Boundary for quick use
interface SimpleErrorBoundaryProps {
  children: ReactNode;
  message?: string;
}

export function SimpleErrorBoundary({ children, message }: SimpleErrorBoundaryProps) {
  return (
    <EnhancedErrorBoundary 
      title="Unable to load content"
      description={message || "This section couldn't be loaded right now. Please try refreshing the page."}
      showReload={true}
    >
      {children}
    </EnhancedErrorBoundary>
  );
}

// HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<Props>
) {
  const WrappedComponent = (props: P) => (
    <EnhancedErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </EnhancedErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for error reporting within components
export function useErrorReporting() {
  const reportError = React.useCallback((error: Error, context?: string) => {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    };

    console.error('CEA Error Report:', errorReport);
    
    // Send to logging service
    // fetch('/api/error-log', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // });
  }, []);

  return { reportError };
} 