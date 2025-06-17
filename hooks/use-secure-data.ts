/**
 * Secure Data Fetching Hook
 * Replaces direct Supabase client usage with API calls for production security
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { createClient } from '@/lib/supabase/client';

interface UseSecureDataOptions {
  endpoint: string;
  dependencies?: any[];
  enabled?: boolean;
}

interface SecureDataResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Secure data fetching hook that uses API endpoints instead of direct database access
 */
export function useSecureData<T = any>(
  options: UseSecureDataOptions
): SecureDataResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth();
  const supabase = createClient();

  const fetchData = async () => {
    if (!options.enabled && options.enabled !== undefined) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(options.endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Secure data fetch error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [options.endpoint, ...(options.dependencies || [])]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * Hook for secure data mutations (POST, PUT, DELETE)
 */
export function useSecureMutation<TData = any, TVariables = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, session } = useAuth();

  const mutate = async (
    endpoint: string,
    variables?: TVariables,
    method: 'POST' | 'PUT' | 'DELETE' = 'POST'
  ): Promise<TData | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
        },
        body: variables ? JSON.stringify(variables) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Secure mutation error:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    mutate,
    loading,
    error,
  };
}

/**
 * Hook for dashboard data - replaces direct Supabase queries
 */
export function useDashboardData(userRole: 'admin' | 'job_seeker' | 'partner') {
  return useSecureData({
    endpoint: `/api/v1/dashboard/${userRole}/stats`,
    dependencies: [userRole],
  });
}

/**
 * Hook for profile data - secure API access
 */
export function useProfileData(profileType: string) {
  return useSecureData({
    endpoint: `/api/v1/profile/${profileType}`,
    dependencies: [profileType],
  });
}

/**
 * Hook for resume data - secure API access
 */
export function useResumeData() {
  return useSecureData({
    endpoint: '/api/v1/resume/data',
  });
}

/**
 * Hook for chat data - secure API access
 */
export function useChatData(conversationId?: string) {
  return useSecureData({
    endpoint: conversationId ? `/api/v1/chat/${conversationId}` : '/api/v1/chat',
    dependencies: [conversationId],
    enabled: !!conversationId,
  });
}

/**
 * Hook for skills translation - secure API access
 */
export function useSkillsTranslation() {
  const { mutate, loading, error } = useSecureMutation();

  const translateSkills = async (skills: string[]) => {
    return await mutate('/api/v1/skills/translate', { skills });
  };

  return {
    translateSkills,
    loading,
    error,
  };
} 