/**
 * Supabase Data Hooks - Climate Economy Assistant
 * React hooks for data fetching and real-time updates
 * Location: hooks/use-supabase-data.ts
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  userProfileQueries, 
  jobQueries, 
  partnerQueries, 
  resourceQueries, 
  conversationQueries,
  adminQueries,
  resumeQueries,
  educationQueries,
  realtimeSubscriptions,
  utilityQueries
} from '@/lib/api/supabase-queries';
import { useAuth } from '@/contexts/auth-context';

// ============================================================================
// GENERIC DATA FETCHING HOOK
// ============================================================================

interface UseDataOptions<T> {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

function useData<T>(
  queryFn: () => Promise<T>,
  dependencies: any[] = [],
  options: UseDataOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
      options.onSuccess?.(result);
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchData();
    }

    // Set up refetch interval if specified
    if (options.refetchInterval && options.enabled !== false) {
      intervalRef.current = setInterval(fetchData, options.refetchInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, options.enabled, options.refetchInterval]);

  const refetch = useCallback(() => {
    if (options.enabled !== false) {
      fetchData();
    }
  }, [fetchData, options.enabled]);

  return { data, loading, error, refetch };
}

// ============================================================================
// USER PROFILE HOOKS
// ============================================================================

export function useJobSeekerProfile() {
  const { user } = useAuth();
  
  return useData(
    () => userProfileQueries.getJobSeekerProfile(user?.id || ''),
    [user?.id],
    { enabled: !!user?.id }
  );
}

export function usePartnerProfile() {
  const { user } = useAuth();
  
  return useData(
    () => userProfileQueries.getPartnerProfile(user?.id || ''),
    [user?.id],
    { enabled: !!user?.id }
  );
}

export function useAdminProfile() {
  const { user } = useAuth();
  
  return useData(
    () => userProfileQueries.getAdminProfile(user?.id || ''),
    [user?.id],
    { enabled: !!user?.id }
  );
}

export function useUserInterests() {
  const { user } = useAuth();
  
  return useData(
    () => userProfileQueries.getUserInterests(user?.id || ''),
    [user?.id],
    { enabled: !!user?.id }
  );
}

// ============================================================================
// JOB LISTINGS HOOKS
// ============================================================================

export function useJobs(filters?: any) {
  return useData(
    () => jobQueries.getActiveJobs(filters),
    [JSON.stringify(filters)]
  );
}

export function useJob(jobId: string) {
  return useData(
    () => jobQueries.getJobById(jobId),
    [jobId],
    { enabled: !!jobId }
  );
}

export function useJobSearch(searchTerm: string, filters?: any) {
  return useData(
    () => jobQueries.searchJobs(searchTerm, filters),
    [searchTerm, JSON.stringify(filters)],
    { enabled: !!searchTerm }
  );
}

export function useJobStats() {
  return useData(
    () => jobQueries.getJobStats(),
    [],
    { refetchInterval: 60000 } // Refetch every minute
  );
}

// ============================================================================
// PARTNER HOOKS
// ============================================================================

export function usePartners(filters?: any) {
  return useData(
    () => partnerQueries.getVerifiedPartners(filters),
    [JSON.stringify(filters)]
  );
}

export function usePartnerStats() {
  return useData(
    () => partnerQueries.getPartnerStats(),
    [],
    { refetchInterval: 300000 } // Refetch every 5 minutes
  );
}

// ============================================================================
// KNOWLEDGE RESOURCES HOOKS
// ============================================================================

export function useResources(filters?: any) {
  return useData(
    () => resourceQueries.getPublishedResources(filters),
    [JSON.stringify(filters)]
  );
}

export function useResourceSearch(searchTerm: string) {
  return useData(
    () => resourceQueries.searchResources(searchTerm),
    [searchTerm],
    { enabled: !!searchTerm }
  );
}

export function useResourceCategories() {
  return useData(
    () => resourceQueries.getResourceCategories(),
    []
  );
}

// ============================================================================
// CONVERSATION HOOKS
// ============================================================================

export function useConversations() {
  const { user } = useAuth();
  
  return useData(
    () => conversationQueries.getUserConversations(user?.id || ''),
    [user?.id],
    { enabled: !!user?.id }
  );
}

export function useConversationMessages(conversationId: string) {
  return useData(
    () => conversationQueries.getConversationMessages(conversationId),
    [conversationId],
    { enabled: !!conversationId }
  );
}

export function useConversationAnalytics(timeRange = '30d') {
  return useData(
    () => conversationQueries.getConversationAnalytics(timeRange),
    [timeRange]
  );
}

// ============================================================================
// ADMIN HOOKS
// ============================================================================

export function usePlatformStats() {
  return useData(
    () => adminQueries.getPlatformStats(),
    [],
    { refetchInterval: 30000 } // Refetch every 30 seconds
  );
}

export function useAuditLogs(limit = 50) {
  return useData(
    () => adminQueries.getRecentAuditLogs(limit),
    [limit],
    { refetchInterval: 10000 } // Refetch every 10 seconds
  );
}

export function useContentFlags(reviewed = false) {
  return useData(
    () => adminQueries.getContentFlags(reviewed),
    [reviewed]
  );
}

export function usePendingApprovals() {
  return useData(
    () => adminQueries.getPendingApprovals(),
    [],
    { refetchInterval: 60000 } // Refetch every minute
  );
}

// ============================================================================
// RESUME HOOKS
// ============================================================================

export function useUserResume() {
  const { user } = useAuth();
  
  return useData(
    () => resumeQueries.getUserResume(user?.id || ''),
    [user?.id],
    { enabled: !!user?.id }
  );
}

export function useResumeChunks(resumeId: string) {
  return useData(
    () => resumeQueries.getResumeChunks(resumeId),
    [resumeId],
    { enabled: !!resumeId }
  );
}

// ============================================================================
// EDUCATION HOOKS
// ============================================================================

export function useEducationPrograms(filters?: any) {
  return useData(
    () => educationQueries.getActivePrograms(filters),
    [JSON.stringify(filters)]
  );
}

// ============================================================================
// REAL-TIME HOOKS
// ============================================================================

export function useRealtimeConversation(conversationId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) return;

    // Initial fetch
    conversationQueries.getConversationMessages(conversationId)
      .then(data => {
        setMessages(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching messages:', err);
        setLoading(false);
      });

    // Subscribe to real-time updates
    const subscription = realtimeSubscriptions.subscribeToConversation(
      conversationId,
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(msg => 
            msg.id === payload.new.id ? payload.new : msg
          ));
        } else if (payload.eventType === 'DELETE') {
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  return { messages, loading };
}

export function useRealtimeJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    jobQueries.getActiveJobs()
      .then(data => {
        setJobs(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching jobs:', err);
        setLoading(false);
      });

    // Subscribe to real-time updates
    const subscription = realtimeSubscriptions.subscribeToJobs((payload) => {
      if (payload.eventType === 'INSERT' && payload.new.is_active) {
        setJobs(prev => [payload.new, ...prev]);
      } else if (payload.eventType === 'UPDATE') {
        setJobs(prev => prev.map(job => 
          job.id === payload.new.id ? payload.new : job
        ).filter(job => job.is_active)); // Remove inactive jobs
      } else if (payload.eventType === 'DELETE') {
        setJobs(prev => prev.filter(job => job.id !== payload.old.id));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { jobs, loading };
}

export function useRealtimeAdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const subscription = realtimeSubscriptions.subscribeToAdminNotifications((payload) => {
      setNotifications(prev => [payload.new, ...prev.slice(0, 49)]); // Keep last 50
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { notifications };
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const updateJobSeekerProfile = useCallback(async (updates: any) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await userProfileQueries.updateJobSeekerProfile(user.id, updates);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const updatePartnerProfile = useCallback(async (updates: any) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await userProfileQueries.updatePartnerProfile(user.id, updates);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const updateUserInterests = useCallback(async (interests: any) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await userProfileQueries.updateUserInterests(user.id, interests);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  return {
    updateJobSeekerProfile,
    updatePartnerProfile,
    updateUserInterests,
    loading,
    error
  };
}

export function useUploadResume() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  const uploadResume = useCallback(async (file: File) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const result = await resumeQueries.uploadResume(user.id, file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      throw error;
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [user?.id]);

  return { uploadResume, loading, error, progress };
}

export function useTrackResourceView() {
  const { user } = useAuth();

  const trackView = useCallback(async (resourceId: string) => {
    try {
      await resourceQueries.trackResourceView(resourceId, user?.id);
    } catch (err) {
      console.error('Error tracking resource view:', err);
    }
  }, [user?.id]);

  return { trackView };
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export function useHealthCheck() {
  return useData(
    () => utilityQueries.healthCheck(),
    [],
    { refetchInterval: 30000 }
  );
}

export function useUserType() {
  const { user } = useAuth();
  
  return useData(
    () => utilityQueries.getUserType(user?.id || ''),
    [user?.id],
    { enabled: !!user?.id }
  );
} 