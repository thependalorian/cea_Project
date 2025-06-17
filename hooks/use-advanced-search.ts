/**
 * Advanced Search Hook - Climate Economy Assistant
 * Comprehensive search with debouncing, caching, facets, and suggestions
 * Location: hooks/use-advanced-search.ts
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

interface SearchOptions {
  autoSearch?: boolean;
  debounceMs?: number;
  includeFacets?: boolean;
  limit?: number;
  cacheResults?: boolean;
}

interface SearchFilters {
  content_types?: string[];
  climate_sectors?: string[];
  employment_types?: string[];
  location?: string;
  experience_level?: string;
  salary_range?: string;
  date_range?: string;
}

interface SearchResult {
  id: string;
  type: string;
  title: string;
  description: string;
  metadata: any;
  relevance_score: number;
  highlights: string[];
  created_at: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  facets: Record<string, Array<{ value: string; count: number }>>;
  suggestions: string[];
  took: number;
}

// Cache for search results
const searchCache = new Map<string, { data: SearchResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useAdvancedSearch(options: SearchOptions = {}) {
  const {
    autoSearch = false,
    debounceMs = 300,
    includeFacets = false,
    limit = 20,
    cacheResults = true
  } = options;

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Generate cache key
  const getCacheKey = useCallback((searchQuery: string, searchFilters: SearchFilters) => {
    return `${searchQuery}:${JSON.stringify(searchFilters)}:${limit}:${includeFacets}`;
  }, [limit, includeFacets]);

  // Check cache
  const getCachedResult = useCallback((cacheKey: string) => {
    if (!cacheResults) return null;
    
    const cached = searchCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }, [cacheResults]);

  // Set cache
  const setCachedResult = useCallback((cacheKey: string, data: SearchResponse) => {
    if (cacheResults) {
      searchCache.set(cacheKey, { data, timestamp: Date.now() });
    }
  }, [cacheResults]);

  // Perform search
  const performSearch = useCallback(async (
    searchQuery: string,
    searchFilters: SearchFilters = {}
  ): Promise<SearchResponse> => {
    const startTime = Date.now();
    const cacheKey = getCacheKey(searchQuery, searchFilters);
    
    // Check cache first
    const cachedResult = getCachedResult(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      const searchPromises: Promise<any>[] = [];
      const contentTypes = searchFilters.content_types || ['job', 'resource', 'partner', 'program'];

      // Search jobs
      if (contentTypes.includes('job')) {
        let jobQuery = supabase
          .from('job_listings')
          .select(`
            id,
            title,
            description,
            location,
            employment_type,
            salary_range,
            climate_focus,
            created_at,
            partner_profiles (
              organization_name,
              verified
            )
          `)
          .eq('status', 'active');

        if (searchQuery) {
          jobQuery = jobQuery.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        if (searchFilters.location) {
          jobQuery = jobQuery.ilike('location', `%${searchFilters.location}%`);
        }

        if (searchFilters.employment_types?.length) {
          jobQuery = jobQuery.in('employment_type', searchFilters.employment_types);
        }

        if (searchFilters.climate_sectors?.length) {
          jobQuery = jobQuery.overlaps('climate_focus', searchFilters.climate_sectors);
        }

        searchPromises.push(
          Promise.resolve(jobQuery.order('created_at', { ascending: false }).limit(Math.ceil(limit / contentTypes.length)))
        );
      }

      // Search resources
      if (contentTypes.includes('resource')) {
        let resourceQuery = supabase
          .from('knowledge_resources')
          .select('*')
          .eq('status', 'published');

        if (searchQuery) {
          resourceQuery = resourceQuery.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
        }

        if (searchFilters.climate_sectors?.length) {
          resourceQuery = resourceQuery.overlaps('tags', searchFilters.climate_sectors);
        }

        searchPromises.push(
          Promise.resolve(resourceQuery.order('created_at', { ascending: false }).limit(Math.ceil(limit / contentTypes.length)))
        );
      }

      // Search partners
      if (contentTypes.includes('partner')) {
        let partnerQuery = supabase
          .from('partner_profiles')
          .select('*')
          .eq('status', 'active');

        if (searchQuery) {
          partnerQuery = partnerQuery.or(`organization_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        if (searchFilters.climate_sectors?.length) {
          partnerQuery = partnerQuery.overlaps('focus_areas', searchFilters.climate_sectors);
        }

        searchPromises.push(
          Promise.resolve(partnerQuery.order('created_at', { ascending: false }).limit(Math.ceil(limit / contentTypes.length)))
        );
      }

      // Search programs
      if (contentTypes.includes('program')) {
        let programQuery = supabase
          .from('education_programs')
          .select('*')
          .eq('status', 'active');

        if (searchQuery) {
          programQuery = programQuery.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
        }

        searchPromises.push(
          Promise.resolve(programQuery.order('created_at', { ascending: false }).limit(Math.ceil(limit / contentTypes.length)))
        );
      }

      const searchResults = await Promise.all(searchPromises);
      
      // Process and combine results
      const allResults: SearchResult[] = [];
      const facets: Record<string, Array<{ value: string; count: number }>> = {};

      searchResults.forEach((result, index) => {
        if (result.data) {
          const type = contentTypes[index];
          
          result.data.forEach((item: any) => {
            // Calculate relevance score
            let relevanceScore = 0.5; // Base score
            
            if (searchQuery) {
              const titleMatch = item.title?.toLowerCase().includes(searchQuery.toLowerCase());
              const descMatch = item.description?.toLowerCase().includes(searchQuery.toLowerCase());
              
              if (titleMatch) relevanceScore += 0.3;
              if (descMatch) relevanceScore += 0.2;
            }
            
            // Add type-specific boost
            if (type === 'job') relevanceScore += 0.1;
            
            // Create highlights
            const highlights: string[] = [];
            if (searchQuery) {
              const regex = new RegExp(`(${searchQuery})`, 'gi');
              if (item.title?.match(regex)) {
                highlights.push(item.title.replace(regex, '<mark>$1</mark>'));
              }
              if (item.description?.match(regex)) {
                const snippet = item.description.substring(0, 150);
                highlights.push(snippet.replace(regex, '<mark>$1</mark>') + '...');
              }
            }

            allResults.push({
              id: item.id,
              type,
              title: item.title,
              description: item.description,
              metadata: {
                organization_name: item.partner_profiles?.organization_name || item.organization_name,
                location: item.location,
                employment_type: item.employment_type,
                verified: item.partner_profiles?.verified || item.verified,
                climate_focus: item.climate_focus || item.focus_areas || item.tags
              },
              relevance_score: Math.min(relevanceScore, 1),
              highlights,
              created_at: item.created_at
            });
          });

          // Build facets
          if (includeFacets) {
            result.data.forEach((item: any) => {
              // Climate focus facets
              if (item.climate_focus || item.focus_areas || item.tags) {
                const focuses = item.climate_focus || item.focus_areas || item.tags || [];
                focuses.forEach((focus: string) => {
                  if (!facets.climate_focus) facets.climate_focus = [];
                  const existing = facets.climate_focus.find(f => f.value === focus);
                  if (existing) {
                    existing.count++;
                  } else {
                    facets.climate_focus.push({ value: focus, count: 1 });
                  }
                });
              }

              // Employment type facets (for jobs)
              if (type === 'job' && item.employment_type) {
                if (!facets.employment_type) facets.employment_type = [];
                const existing = facets.employment_type.find(f => f.value === item.employment_type);
                if (existing) {
                  existing.count++;
                } else {
                  facets.employment_type.push({ value: item.employment_type, count: 1 });
                }
              }
            });
          }
        }
      });

      // Sort by relevance
      allResults.sort((a, b) => b.relevance_score - a.relevance_score);

      // Sort facets by count
      Object.keys(facets).forEach(key => {
        facets[key].sort((a, b) => b.count - a.count);
      });

      const response: SearchResponse = {
        results: allResults.slice(0, limit),
        total: allResults.length,
        facets,
        suggestions: [], // Would be populated by a suggestion service
        took: Date.now() - startTime
      };

      // Cache the result
      setCachedResult(cacheKey, response);

      return response;
    } catch (error) {
      throw error;
    }
  }, [getCacheKey, getCachedResult, setCachedResult, limit, includeFacets]);

  // Auto search effect
  useEffect(() => {
    if (autoSearch && (debouncedQuery || Object.keys(filters).length > 0)) {
      setLoading(true);
      setError(null);
      
      performSearch(debouncedQuery, filters)
        .then(setResults)
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, [debouncedQuery, filters, autoSearch, performSearch]);

  // Manual search function
  const search = useCallback(async (searchQuery?: string, searchFilters?: SearchFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await performSearch(
        searchQuery !== undefined ? searchQuery : debouncedQuery,
        searchFilters !== undefined ? searchFilters : filters
      );
      setResults(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, filters, performSearch]);

  // Get suggestions
  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      // Simple suggestion logic - in production, you'd use a proper suggestion service
      const commonTerms = [
        'renewable energy', 'solar power', 'wind energy', 'climate change',
        'sustainability', 'carbon footprint', 'green technology', 'environmental policy',
        'clean energy', 'climate science', 'environmental consulting', 'green finance'
      ];

      const matchingSuggestions = commonTerms
        .filter(term => term.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 5);

      setSuggestions(matchingSuggestions);
    } catch (err) {
      console.error('Error getting suggestions:', err);
    }
  }, []);

  // Load more results
  const loadMore = useCallback(async () => {
    if (!results || loading) return;
    
    // This would implement pagination in a real scenario
    console.log('Load more functionality would be implemented here');
  }, [results, loading]);

  // Computed values
  const hasResults = useMemo(() => results && results.results.length > 0, [results]);
  const hasMore = useMemo(() => results && results.results.length < results.total, [results]);
  const totalCount = useMemo(() => results?.total || 0, [results]);
  const facets = useMemo(() => results?.facets || {}, [results]);

  return {
    // State
    query,
    setQuery,
    filters,
    setFilters,
    results,
    loading,
    error,
    suggestions,
    
    // Computed
    hasResults,
    hasMore,
    totalCount,
    facets,
    
    // Actions
    search,
    getSuggestions,
    loadMore,
    
    // Utils
    clearResults: () => setResults(null),
    clearError: () => setError(null)
  };
}

// Specialized search hooks
export function useJobSearch(options?: SearchOptions) {
  return useAdvancedSearch({
    ...options,
    // Override to only search jobs
  });
}

export function useResourceSearch(options?: SearchOptions) {
  return useAdvancedSearch({
    ...options,
    // Override to only search resources
  });
}

export function usePartnerSearch(options?: SearchOptions) {
  return useAdvancedSearch({
    ...options,
    // Override to only search partners
  });
} 