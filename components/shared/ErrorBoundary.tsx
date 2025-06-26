/**
 * Error Boundary Component
 * Purpose: Catch and handle React errors gracefully
 * Location: /components/shared/ErrorBoundary.tsx
 */
'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { BrandFrame } from '@/components/brand/BrandFrame'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo)
    
    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.logError(error, errorInfo)
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  private handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI with ACT branding
      return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
          <div className="max-w-md w-full">
            <BrandFrame size="md" color="spring-green">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h1 className="text-h2 font-title-medium text-[var(--midnight-forest)]">
                    Oops! Something went wrong
                  </h1>
                  <p className="text-body text-[var(--moss-green)]">
                    We're sorry, but something unexpected happened. Our team has been notified.
                  </p>
                </div>

                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-left">
                    <p className="text-body-small font-body-medium text-error mb-2">
                      Development Error Details:
                    </p>
                    <code className="text-caption text-error break-all">
                      {this.state.error.message}
                    </code>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={this.handleRetry}
                    className="btn btn-primary flex-1"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={this.handleReload}
                    className="btn btn-outline btn-primary flex-1"
                  >
                    Reload Page
                  </button>
                </div>

                <div className="text-center">
                  <a
                    href="/dashboard"
                    className="link link-primary text-body-small"
                  >
                    Return to Dashboard
                  </a>
                </div>
              </div>
            </BrandFrame>
          </div>
        </div>
      )
    }

    return this.props.children
  }

  // Log error for debugging and monitoring
  logError(error: Error, errorInfo?: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    // Send to error monitoring service in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Simple error reporting - can be enhanced with monitoring service  
      try {
        fetch('/api/error-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: error.message,
            stack: error.stack,
            componentStack: errorInfo?.componentStack,
            timestamp: new Date().toISOString()
          })
        }).catch(console.error)
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError)
      }
    }
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback} onError={onError}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

// Hook for error handling in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    console.error('Manual error report:', error, errorInfo)
    
    if (process.env.NODE_ENV === 'production') {
      // Simple error logging for production
      try {
        fetch('/api/error-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: error.message,
            stack: error.stack,
            extra: errorInfo,
            timestamp: new Date().toISOString()
          })
        }).catch(console.error)
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError)
      }
    }
  }
} 