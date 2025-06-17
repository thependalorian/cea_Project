/**
 * Loading States Components - Climate Economy Assistant
 * Comprehensive loading indicators, skeletons, and empty states
 * Location: components/ui/LoadingStates.tsx
 */

'use client';

import React from 'react';
import { Loader2, Search, FileText, Users, Building, BookOpen, Zap } from 'lucide-react';

// ============================================================================
// BASIC LOADING COMPONENTS
// ============================================================================

// Basic Loading Spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

// Loading Dots Animation
export function LoadingDots({ className = '' }: { className?: string }) {
  return (
    <div className={`flex space-x-1 ${className}`}>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );
}

// Pulse Animation
export function LoadingPulse({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
}

// ============================================================================
// PROGRESS INDICATORS
// ============================================================================

// Progress Bar
interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ progress, className = '', showPercentage = false }: ProgressBarProps) {
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
      {showPercentage && (
        <div className="text-sm text-gray-600 mt-1 text-center">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}

export function CircularProgress({ 
  progress, 
  size = 'md',
  className = '',
  color = 'primary'
}: { 
  progress: number; 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: 'primary' | 'success' | 'warning' | 'error';
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const strokeClasses = {
    primary: 'stroke-primary',
    success: 'stroke-success',
    warning: 'stroke-warning',
    error: 'stroke-error'
  };

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx="25"
          cy="25"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-300 ${strokeClasses[color]}`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

// ============================================================================
// SKELETON SCREENS
// ============================================================================

// Skeleton Components
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="flex space-x-2 mb-4">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-6 bg-gray-200 rounded-full w-14"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonJobCard() {
  return <SkeletonCard className="hover:shadow-lg transition-shadow" />;
}

export function SkeletonResourceCard() {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="animate-pulse">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
        </div>
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonPartnerCard() {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="flex space-x-2">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i}>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: cols }).map((_, colIndex) => (
                  <td key={colIndex}>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================================
// PAGE-SPECIFIC LOADING STATES
// ============================================================================

// Page-specific Loading States
export function LoadingDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 border">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div>
                    <div className="h-6 bg-gray-200 rounded w-64 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
                <div className="flex space-x-6 mt-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl p-6 border">
            <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingJobsList() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <SkeletonJobCard key={i} />
      ))}
    </div>
  );
}

export function LoadingResourcesList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <SkeletonResourceCard key={i} />
      ))}
    </div>
  );
}

export function LoadingPartnersList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <SkeletonPartnerCard key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// CONTEXTUAL LOADING STATES
// ============================================================================

export function LoadingSearch() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-3">
          <Search className="w-6 h-6 text-gray-400 animate-pulse" />
          <span className="text-gray-600">Searching...</span>
          <LoadingDots className="text-gray-400" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

export function LoadingAnalytics() {
  return (
    <LoadingMessage 
      message="Analyzing data..." 
      icon={<Zap className="w-6 h-6 text-yellow-500 animate-pulse" />}
    />
  );
}

export function LoadingChat() {
  return (
    <div className="flex items-center space-x-2 p-4">
      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
        <Zap className="w-4 h-4 text-primary animate-pulse" />
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-600">AI Assistant is thinking...</div>
        <LoadingDots className="mt-1" />
      </div>
    </div>
  );
}

// ============================================================================
// EMPTY STATES (Related to Loading)
// ============================================================================

// Contextual Loading Messages
interface LoadingMessageProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

export function LoadingMessage({ message, icon, className = '' }: LoadingMessageProps) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="flex items-center space-x-3">
        {icon || <LoadingSpinner size="md" />}
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  );
}

// Specific loading messages
export function LoadingJobs() {
  return (
    <LoadingMessage 
      message="Finding climate opportunities..." 
      icon={<FileText className="w-6 h-6 text-blue-500 animate-pulse" />}
    />
  );
}

export function LoadingPartners() {
  return (
    <LoadingMessage 
      message="Loading climate organizations..." 
      icon={<Building className="w-6 h-6 text-green-500 animate-pulse" />}
    />
  );
}

export function LoadingResources() {
  return (
    <LoadingMessage 
      message="Gathering knowledge resources..." 
      icon={<BookOpen className="w-6 h-6 text-purple-500 animate-pulse" />}
    />
  );
}

// Empty States
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action && action}
    </div>
  );
}

// Specific empty states
export function EmptyJobs() {
  return (
    <EmptyState
      title="No jobs found"
      description="We couldn't find any climate jobs matching your criteria. Try adjusting your search or filters."
      icon={<FileText className="w-16 h-16 text-gray-400 mx-auto" />}
    />
  );
}

export function EmptyResources() {
  return (
    <EmptyState
      title="No resources available"
      description="There are no knowledge resources available at the moment. Check back soon for updates."
      icon={<BookOpen className="w-16 h-16 text-gray-400 mx-auto" />}
    />
  );
}

export function EmptyPartners() {
  return (
    <EmptyState
      title="No partners found"
      description="We couldn't find any climate organizations matching your search. Try different keywords."
      icon={<Building className="w-16 h-16 text-gray-400 mx-auto" />}
    />
  );
}

// Loading Overlay
interface LoadingOverlayProps {
  show: boolean;
  message?: string;
  className?: string;
}

export function LoadingOverlay({ show, message = 'Loading...', className = '' }: LoadingOverlayProps) {
  if (!show) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
        <LoadingSpinner size="lg" />
        <span className="text-gray-700 font-medium">{message}</span>
      </div>
    </div>
  );
} 