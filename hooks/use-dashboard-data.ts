/**
 * Dashboard Data Hook - Real API Integration
 * 
 * Following rule #6: Asynchronous data handling for performance
 * Following rule #12: Complete code verification with proper error handling
 * Following rule #15: Include comprehensive error handling
 * 
 * This hook replaces all mock data with real API calls to /api/v1 endpoints.
 * Location: hooks/use-dashboard-data.ts
 */

'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  // Job Seeker Stats
  applications?: number;
  interviews?: number;
  saved_jobs?: number;
  profile_views?: number;
  response_rate?: number;
  active_searches?: number;
  
  // Partner Stats
  job_postings?: number;
  applications_received?: number;
  active_partnerships?: number;
  engagement_rate?: number;
  candidates_reviewed?: number;
  positions_filled?: number;
  
  // Admin Stats
  total_users?: number;
  active_jobs?: number;
  partner_organizations?: number;
  platform_growth?: number;
  monthly_signups?: number;
  success_rate?: number;
  system_health?: number;
  monthly_growth?: number;
  conversation_analytics?: number;
  audit_logs?: number;
  content_flags?: number;
  knowledge_resources?: number;
  pending_approvals?: number;
}

interface UseDashboardDataReturn {
  data: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDashboardData(userType: 'job_seeker' | 'partner' | 'admin'): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/dashboard/${userType}/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': 'v1'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      setData(result.data);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      // Fallback to empty stats instead of mock data
      setData({
        applications: 0,
        interviews: 0,
        saved_jobs: 0,
        profile_views: 0,
        response_rate: 0,
        active_searches: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userType]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardData
  };
}

/**
 * Hook for fetching analytics data
 * Following rule #6: Asynchronous data handling with proper error management
 */
export function useAnalyticsData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/v1/analytics/platform', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store' // Always fetch fresh analytics data
        });

        if (!response.ok) {
          throw new Error(`Analytics API error: ${response.status}`);
        }

        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        console.error('Analytics data fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  return { data, loading, error };
}

// Partner data hook
export function usePartnerData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartnerData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/partners/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': 'v1'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch partner data: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error('Partner data fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartnerData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchPartnerData
  };
} 