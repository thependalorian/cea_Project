/**
 * Authentication Guard Component - Climate Economy Assistant
 * Protects routes with role-based access control and loading states
 * Location: components/auth/AuthGuard.tsx
 */

'use client';

import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { UserType } from '@/types/user';
import { ACTCard } from '@/components/ui/ACTCard';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  allowedRoles?: UserType[];
  fallback?: ReactNode;
  redirectTo?: string;
  showLoadingState?: boolean;
}

/**
 * AuthGuard - Protects components based on authentication and roles
 */
export function AuthGuard({
  children,
  requireAuth = true,
  allowedRoles = [],
  fallback,
  redirectTo,
  showLoadingState = true,
}: AuthGuardProps) {
  const { 
    isAuthenticated, 
    loading, 
    user, 
    profile,
    hasPermission
  } = useAuth();

  // Handle loading state
  if (loading && showLoadingState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-seafoam-blue/20 to-spring-green/20 p-4">
        <div className="max-w-md w-full">
          <ACTCard variant="glass" className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-spring-green border-t-transparent mx-auto mb-6"></div>
            <h2 className="text-act-title font-helvetica font-medium text-midnight-forest mb-2">
              Authenticating...
            </h2>
            <p className="text-act-body font-inter text-midnight-forest/70">
              Please wait while we verify your credentials
            </p>
          </ACTCard>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !loading) {
    if (!isAuthenticated) {
      // Redirect to login automatically
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-seafoam-blue/5 to-moss-green/5">
          <ACTCard variant="outlined" className="p-8 text-center border-spring-green/20">
            <div className="mb-4">
              🔒
            </div>
            <h3 className="text-ios-headline font-sf-pro font-medium text-midnight-forest mb-2">
              Authentication Required
            </h3>
            <p className="text-ios-subheadline font-sf-pro text-midnight-forest/70">
              Redirecting to login...
            </p>
          </ACTCard>
        </div>
      );
    }
  }

  // Check role-based access
  if (allowedRoles.length > 0 && isAuthenticated && !loading) {
    if (!hasPermission(allowedRoles)) {
      // Redirect based on role
      if (typeof window !== 'undefined') {
        const userType = profile?.user_type;
        switch (userType) {
          case 'job_seeker':
            window.location.href = '/job-seekers';
            break;
          case 'partner':
            window.location.href = '/partners';
            break;
          case 'admin':
            window.location.href = '/admin';
            break;
          default:
            window.location.href = '/dashboard';
        }
      }
      return fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-seafoam-blue/5 to-moss-green/5">
          <ACTCard variant="outlined" className="p-8 text-center border-ios-red/20">
            <div className="mb-4">
              ⚠️
            </div>
            <h3 className="text-ios-headline font-sf-pro font-medium text-midnight-forest mb-2">
              Access Denied
            </h3>
            <p className="text-ios-subheadline font-sf-pro text-midnight-forest/70 mb-4">
              You don't have permission to access this area.
            </p>
            <div className="text-ios-caption-1 font-sf-pro text-midnight-forest/60">
              Required roles: {allowedRoles.join(', ')}
              <br />
              Your role: {profile?.user_type || 'Unknown'}
            </div>
          </ACTCard>
        </div>
      );
    }
  }

  // Render protected content
  return <>{children}</>;
}

/**
 * JobSeekerGuard - Specific guard for job seeker routes
 */
export function JobSeekerGuard({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode; 
}) {
  return (
    <AuthGuard 
      requireAuth={true} 
      allowedRoles={['job_seeker']} 
      fallback={fallback}
    >
      {children}
    </AuthGuard>
  );
}

/**
 * PartnerGuard - Specific guard for partner routes
 */
export function PartnerGuard({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode; 
}) {
  return (
    <AuthGuard 
      requireAuth={true} 
      allowedRoles={['partner']} 
      fallback={fallback}
    >
      {children}
    </AuthGuard>
  );
}

/**
 * AdminGuard - Specific guard for admin routes
 */
export function AdminGuard({ 
  children, 
  fallback 
}: { 
  children: ReactNode; 
  fallback?: ReactNode; 
}) {
  return (
    <AuthGuard 
      requireAuth={true} 
      allowedRoles={['admin']} 
      fallback={fallback}
    >
      {children}
    </AuthGuard>
  );
}

/**
 * MultiRoleGuard - Guard for routes accessible by multiple roles
 */
export function MultiRoleGuard({ 
  children, 
  allowedRoles,
  fallback 
}: { 
  children: ReactNode; 
  allowedRoles: UserType[];
  fallback?: ReactNode; 
}) {
  return (
    <AuthGuard 
      requireAuth={true} 
      allowedRoles={allowedRoles} 
      fallback={fallback}
    >
      {children}
    </AuthGuard>
  );
}

/**
 * GuestGuard - For routes that should only be accessible to non-authenticated users
 */
export function GuestGuard({ 
  children, 
  redirectAuthenticated = true 
}: { 
  children: ReactNode;
  redirectAuthenticated?: boolean;
}) {
  const { isAuthenticated, loading, profile } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated && redirectAuthenticated) {
      if (typeof window !== 'undefined') {
        const userType = profile?.user_type;
        switch (userType) {
          case 'job_seeker':
            window.location.href = '/job-seekers';
            break;
          case 'partner':
            window.location.href = '/partners';
            break;
          case 'admin':
            window.location.href = '/admin';
            break;
          default:
            window.location.href = '/dashboard';
        }
      }
    }
  }, [loading, isAuthenticated, redirectAuthenticated, profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-seafoam-blue/5 to-moss-green/5">
        <ACTCard variant="glass" className="p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="w-8 h-8 animate-spin text-spring-green" />
          </div>
          <h3 className="text-ios-headline font-sf-pro font-medium text-midnight-forest mb-2">
            Loading...
          </h3>
        </ACTCard>
      </div>
    );
  }

  if (isAuthenticated && redirectAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-seafoam-blue/5 to-moss-green/5">
        <ACTCard variant="glass" className="p-8 text-center">
          <div className="mb-4">
            ↗️
          </div>
          <h3 className="text-ios-headline font-sf-pro font-medium text-midnight-forest mb-2">
            Already Authenticated
          </h3>
          <p className="text-ios-subheadline font-sf-pro text-midnight-forest/70">
            Redirecting to your dashboard...
          </p>
        </ACTCard>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * ConditionalGuard - Shows different content based on auth status
 */
export function ConditionalGuard({
  authenticatedContent,
  guestContent,
  loadingContent,
}: {
  authenticatedContent: ReactNode;
  guestContent: ReactNode;
  loadingContent?: ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return loadingContent || (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-spring-green" />
      </div>
    );
  }

  return <>{isAuthenticated ? authenticatedContent : guestContent}</>;
} 