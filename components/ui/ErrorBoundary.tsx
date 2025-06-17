/**
 * Error Boundary Component - Climate Economy Assistant
 * Comprehensive error handling with reporting and recovery
 * Location: components/ui/ErrorBoundary.tsx
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, level = 'component' } = this.props;
    
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({ errorInfo });
    
    // Report error to monitoring service
    this.reportError(error, errorInfo, level);
    
    // Call custom error handler
    onError?.(error, errorInfo);
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo, level: string) => {
    try {
      // In a real app, you'd send this to your error reporting service
      // (e.g., Sentry, LogRocket, Bugsnag)
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        level,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getUserId(), // You'd implement this
        sessionId: this.getSessionId() // You'd implement this
      };

      // For now, just log to console
      console.error('Error Report:', errorReport);
      
      // You could also send to your API
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  private getUserId = (): string | null => {
    // Implement your user ID retrieval logic
    return null;
  };

  private getSessionId = (): string | null => {
    // Implement your session ID retrieval logic
    return sessionStorage.getItem('sessionId');
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: null
      });
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorInfo, errorId } = this.state;
    const bugReport = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Open email client with pre-filled bug report
    const subject = encodeURIComponent(`Bug Report: ${error?.message || 'Unknown Error'}`);
    const body = encodeURIComponent(`
Error ID: ${errorId}
URL: ${window.location.href}
Time: ${new Date().toLocaleString()}

Error Details:
${error?.message || 'Unknown error occurred'}

Stack Trace:
${error?.stack || 'No stack trace available'}

Component Stack:
${errorInfo?.componentStack || 'No component stack available'}

Please describe what you were doing when this error occurred:
[Your description here]
    `);

    window.open(`mailto:support@climateeconomyassistant.com?subject=${subject}&body=${body}`);
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = false, level = 'component' } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Different error UIs based on level
      if (level === 'critical') {
        return this.renderCriticalError();
      }

      if (level === 'page') {
        return this.renderPageError();
      }

      return this.renderComponentError();
    }

    return children;
  }

  private renderCriticalError() {
    const { error } = this.state;
    
    return (
      <div className="min-h-screen bg-error/5 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-6 text-center">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-error" />
          </div>
          
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Critical System Error
          </h1>
          
          <p className="text-gray-600 mb-6">
            We're experiencing a critical system error. Our team has been notified and is working to resolve this issue.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={this.handleReload}
              className="btn btn-primary w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Application
            </button>
            
            <button
              onClick={this.handleReportBug}
              className="btn btn-outline w-full"
            >
              <Bug className="w-4 h-4 mr-2" />
              Report This Issue
            </button>
          </div>
          
          {this.props.showDetails && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                <div className="mb-2">
                  <strong>Error:</strong> {error?.message}
                </div>
                <div>
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap">{error?.stack}</pre>
                </div>
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  private renderPageError() {
    const { error } = this.state;
    const canRetry = this.retryCount < this.maxRetries;
    
    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-warning" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Oops! Something went wrong
          </h2>
          
          <p className="text-gray-600 mb-6">
            We encountered an error while loading this page. This has been reported to our team.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {canRetry && (
              <button
                onClick={this.handleRetry}
                className="btn btn-primary"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again ({this.maxRetries - this.retryCount} left)
              </button>
            )}
            
            <button
              onClick={this.handleGoHome}
              className="btn btn-outline"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </button>
            
            <button
              onClick={this.handleReportBug}
              className="btn btn-ghost"
            >
              <Bug className="w-4 h-4 mr-2" />
              Report Bug
            </button>
          </div>
          
          {this.props.showDetails && (
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                Error Details
              </summary>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm">
                <div className="mb-2">
                  <strong>Error ID:</strong> {this.state.errorId}
                </div>
                <div className="mb-2">
                  <strong>Message:</strong> {error?.message}
                </div>
                <div className="font-mono text-xs text-gray-600 overflow-auto max-h-32">
                  {error?.stack}
                </div>
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  private renderComponentError() {
    const canRetry = this.retryCount < this.maxRetries;
    
    return (
      <div className="border border-error/20 bg-error/5 rounded-lg p-4 m-2">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-error">
              Component Error
            </h3>
            <p className="text-sm text-error/80 mt-1">
              This component failed to load properly.
            </p>
            
            <div className="mt-3 flex space-x-2">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="btn btn-sm btn-outline btn-error"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </button>
              )}
              
              <button
                onClick={this.handleReportBug}
                className="btn btn-sm btn-ghost btn-error"
              >
                <Bug className="w-3 h-3 mr-1" />
                Report
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// ============================================================================
// HOC FOR EASY WRAPPING
// ============================================================================

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// ============================================================================
// HOOK FOR ERROR REPORTING
// ============================================================================

export function useErrorReporting() {
  const reportError = React.useCallback((error: Error, context?: string) => {
    console.error('Manual error report:', error, context);
    
    // You could send this to your error reporting service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    // For now, just log
    console.error('Error Report:', errorReport);
  }, []);

  return { reportError };
} 