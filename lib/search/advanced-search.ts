/**
 * Advanced Search Engine - Climate Economy Assistant
 * Full-text search, embeddings, and intelligent filtering
 * Location: lib/search/advanced-search.ts
 */

import { supabase } from '@/lib/supabase/client';

// ============================================================================
// SEARCH INTERFACES
// ============================================================================

export interface SearchFilters {
  content_types?: string[];
  categories?: string[];
  climate_sectors?: string[];
  difficulty_levels?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  organization_types?: string[];
  partnership_levels?: string[];
  employment_types?: string[];
  experience_levels?: string[];
  locations?: string[];
  salary_range?: {
    min: number;
    max: number;
  };
  remote_friendly?: boolean;
  verified_only?: boolean;
}

export interface SearchResult {
  id: string;
  type: 'job' | 'resource' | 'partner' | 'program';
  title: string;
  description: string;
  relevance_score: number;
  highlights: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total_count: number;
  search_time_ms: number;
  suggestions: string[];
  facets: Record<string, Array<{ value: string; count: number }>>;
  query_expansion: string[];
}

// ============================================================================
// SEARCH ENGINE CLASS
// ============================================================================

export class AdvancedSearchEngine {
  private static instance: AdvancedSearchEngine;
  private searchHistory: string[] = [];
  private popularQueries: Map<string, number> = new Map();

  static getInstance(): AdvancedSearchEngine {
    if (!AdvancedSearchEngine.instance) {
      AdvancedSearchEngine.instance = new AdvancedSearchEngine();
    }
    return AdvancedSearchEngine.instance;
  }

  // ============================================================================
  // UNIFIED SEARCH
  // ============================================================================

  async search(
    query: string,
    filters: SearchFilters = {},
    options: {
      limit?: number;
      offset?: number;
      include_facets?: boolean;
      boost_recent?: boolean;
    } = {}
  ): Promise<SearchResponse> {
    const startTime = Date.now();
    
    try {
      // Track search query
      this.trackQuery(query);
      
      // Expand query with synonyms and related terms
      const expandedQuery = await this.expandQuery(query);
      
      // Perform parallel searches across all content types
      const [jobResults, resourceResults, partnerResults, programResults] = await Promise.all([
        this.searchJobs(query, filters, options),
        this.searchResources(query, filters, options),
        this.searchPartners(query, filters, options),
        this.searchPrograms(query, filters, options)
      ]);

      // Combine and rank results
      const allResults = [
        ...jobResults.map(r => ({ ...r, type: 'job' as const })),
        ...resourceResults.map(r => ({ ...r, type: 'resource' as const })),
        ...partnerResults.map(r => ({ ...r, type: 'partner' as const })),
        ...programResults.map(r => ({ ...r, type: 'program' as const }))
      ];

      // Apply intelligent ranking
      const rankedResults = this.rankResults(allResults, query, filters);
      
      // Apply pagination
      const limit = options.limit || 20;
      const offset = options.offset || 0;
      const paginatedResults = rankedResults.slice(offset, offset + limit);

      // Generate facets if requested
      const facets = options.include_facets ? await this.generateFacets(allResults) : {};
      
      // Generate search suggestions
      const suggestions = await this.generateSuggestions(query);

      const searchTime = Date.now() - startTime;

      return {
        results: paginatedResults,
        total_count: allResults.length,
        search_time_ms: searchTime,
        suggestions,
        facets,
        query_expansion: expandedQuery
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  // ============================================================================
  // CONTENT-SPECIFIC SEARCH METHODS
  // ============================================================================

  private async searchJobs(
    query: string, 
    filters: SearchFilters, 
    options: any
  ): Promise<SearchResult[]> {
    let dbQuery = supabase
      .from('job_listings')
      .select(`
        id,
        title,
        description,
        requirements,
        responsibilities,
        climate_focus,
        location,
        employment_type,
        experience_level,
        salary_range,
        created_at,
        updated_at,
        partner_profiles!inner(
          organization_name,
          organization_type,
          verified
        )
      `)
      .eq('is_active', true);

    // Apply text search
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,requirements.ilike.%${query}%`);
    }

    // Apply filters
    if (filters.employment_types?.length) {
      dbQuery = dbQuery.in('employment_type', filters.employment_types);
    }
    
    if (filters.experience_levels?.length) {
      dbQuery = dbQuery.in('experience_level', filters.experience_levels);
    }
    
    if (filters.climate_sectors?.length) {
      dbQuery = dbQuery.overlaps('climate_focus', filters.climate_sectors);
    }
    
    if (filters.locations?.length) {
      const locationFilter = filters.locations.map(loc => `location.ilike.%${loc}%`).join(',');
      dbQuery = dbQuery.or(locationFilter);
    }

    if (filters.verified_only) {
      dbQuery = dbQuery.eq('partner_profiles.verified', true);
    }

    const { data, error } = await dbQuery.limit(100);
    
    if (error) throw error;

    return (data || []).map(job => ({
      id: job.id,
      type: 'job' as const,
      title: job.title,
      description: job.description,
      relevance_score: this.calculateRelevanceScore(query, job.title + ' ' + job.description),
      highlights: this.extractHighlights(query, [job.title, job.description, job.requirements]),
      metadata: {
        organization_name: (job.partner_profiles as any)?.organization_name || (Array.isArray(job.partner_profiles) ? job.partner_profiles[0]?.organization_name : undefined),
        location: job.location,
        employment_type: job.employment_type,
        experience_level: job.experience_level,
        climate_focus: job.climate_focus,
        salary_range: job.salary_range
      },
      created_at: job.created_at,
      updated_at: job.updated_at
    }));
  }

  private async searchResources(
    query: string, 
    filters: SearchFilters, 
    options: any
  ): Promise<SearchResult[]> {
    let dbQuery = supabase
      .from('knowledge_resources')
      .select(`
        id,
        title,
        description,
        content,
        content_type,
        categories,
        climate_sectors,
        content_difficulty,
        created_at,
        updated_at,
        partner_profiles(organization_name, verified)
      `)
      .eq('is_published', true);

    // Apply text search
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`);
    }

    // Apply filters
    if (filters.content_types?.length) {
      dbQuery = dbQuery.in('content_type', filters.content_types);
    }
    
    if (filters.categories?.length) {
      dbQuery = dbQuery.overlaps('categories', filters.categories);
    }
    
    if (filters.climate_sectors?.length) {
      dbQuery = dbQuery.overlaps('climate_sectors', filters.climate_sectors);
    }
    
    if (filters.difficulty_levels?.length) {
      dbQuery = dbQuery.in('content_difficulty', filters.difficulty_levels);
    }

    const { data, error } = await dbQuery.limit(100);
    
    if (error) throw error;

    return (data || []).map(resource => ({
      id: resource.id,
      type: 'resource' as const,
      title: resource.title,
      description: resource.description || '',
      relevance_score: this.calculateRelevanceScore(query, resource.title + ' ' + (resource.description || '') + ' ' + (resource.content || '')),
      highlights: this.extractHighlights(query, [resource.title, resource.description, resource.content]),
      metadata: {
        content_type: resource.content_type,
        categories: resource.categories,
        climate_sectors: resource.climate_sectors,
        content_difficulty: resource.content_difficulty,
        organization_name: (resource.partner_profiles as any)?.organization_name || (Array.isArray(resource.partner_profiles) ? resource.partner_profiles[0]?.organization_name : undefined)
      },
      created_at: resource.created_at,
      updated_at: resource.updated_at
    }));
  }

  private async searchPartners(
    query: string, 
    filters: SearchFilters, 
    options: any
  ): Promise<SearchResult[]> {
    let dbQuery = supabase
      .from('partner_profiles')
      .select('*')
      .eq('verified', true);

    // Apply text search
    if (query) {
      dbQuery = dbQuery.or(`organization_name.ilike.%${query}%,description.ilike.%${query}%,mission_statement.ilike.%${query}%`);
    }

    // Apply filters
    if (filters.organization_types?.length) {
      dbQuery = dbQuery.in('organization_type', filters.organization_types);
    }
    
    if (filters.partnership_levels?.length) {
      dbQuery = dbQuery.in('partnership_level', filters.partnership_levels);
    }
    
    if (filters.climate_sectors?.length) {
      dbQuery = dbQuery.overlaps('climate_focus', filters.climate_sectors);
    }

    const { data, error } = await dbQuery.limit(50);
    
    if (error) throw error;

    return (data || []).map(partner => ({
      id: partner.id,
      type: 'partner' as const,
      title: partner.organization_name,
      description: partner.description || '',
      relevance_score: this.calculateRelevanceScore(query, partner.organization_name + ' ' + (partner.description || '')),
      highlights: this.extractHighlights(query, [partner.organization_name, partner.description, partner.mission_statement]),
      metadata: {
        organization_type: partner.organization_type,
        partnership_level: partner.partnership_level,
        climate_focus: partner.climate_focus,
        hiring_actively: partner.hiring_actively,
        offers_certification: partner.offers_certification,
        offers_mentorship: partner.offers_mentorship,
        headquarters_location: partner.headquarters_location
      },
      created_at: partner.created_at,
      updated_at: partner.updated_at
    }));
  }

  private async searchPrograms(
    query: string, 
    filters: SearchFilters, 
    options: any
  ): Promise<SearchResult[]> {
    let dbQuery = supabase
      .from('education_programs')
      .select(`
        id,
        program_name,
        description,
        program_type,
        climate_focus,
        format,
        duration,
        cost,
        certification_offered,
        created_at,
        updated_at,
        partner_profiles!inner(organization_name, verified)
      `)
      .eq('is_active', true);

    // Apply text search
    if (query) {
      dbQuery = dbQuery.or(`program_name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    // Apply filters
    if (filters.climate_sectors?.length) {
      dbQuery = dbQuery.overlaps('climate_focus', filters.climate_sectors);
    }

    const { data, error } = await dbQuery.limit(50);
    
    if (error) throw error;

    return (data || []).map(program => ({
      id: program.id,
      type: 'program' as const,
      title: program.program_name,
      description: program.description || '',
      relevance_score: this.calculateRelevanceScore(query, program.program_name + ' ' + (program.description || '')),
      highlights: this.extractHighlights(query, [program.program_name, program.description]),
      metadata: {
        program_type: program.program_type,
        climate_focus: program.climate_focus,
        format: program.format,
        duration: program.duration,
        cost: program.cost,
        certification_offered: program.certification_offered,
        organization_name: (program.partner_profiles as any)?.organization_name || (Array.isArray(program.partner_profiles) ? program.partner_profiles[0]?.organization_name : undefined)
      },
      created_at: program.created_at,
      updated_at: program.updated_at
    }));
  }

  // ============================================================================
  // RANKING AND RELEVANCE
  // ============================================================================

  private rankResults(results: SearchResult[], query: string, filters: SearchFilters): SearchResult[] {
    return results.sort((a, b) => {
      // Base relevance score
      let scoreA = a.relevance_score;
      let scoreB = b.relevance_score;

      // Boost verified organizations
      if (a.metadata.verified) scoreA += 0.1;
      if (b.metadata.verified) scoreB += 0.1;

      // Boost recent content
      const daysDiffA = (Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const daysDiffB = (Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiffA < 30) scoreA += 0.05;
      if (daysDiffB < 30) scoreB += 0.05;

      // Boost jobs and programs over resources and partners
      if (a.type === 'job' || a.type === 'program') scoreA += 0.02;
      if (b.type === 'job' || b.type === 'program') scoreB += 0.02;

      return scoreB - scoreA;
    });
  }

  private calculateRelevanceScore(query: string, content: string): number {
    if (!query || !content) return 0;

    const queryTerms = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();
    
    let score = 0;
    let totalTerms = queryTerms.length;

    queryTerms.forEach(term => {
      if (contentLower.includes(term)) {
        // Exact match bonus
        score += 1;
        
        // Position bonus (earlier matches score higher)
        const position = contentLower.indexOf(term);
        const positionBonus = Math.max(0, 1 - (position / contentLower.length));
        score += positionBonus * 0.5;
        
        // Frequency bonus
        const matches = (contentLower.match(new RegExp(term, 'g')) || []).length;
        score += Math.min(matches - 1, 3) * 0.1;
      }
    });

    return score / totalTerms;
  }

  private extractHighlights(query: string, texts: (string | null)[]): string[] {
    if (!query) return [];

    const queryTerms = query.toLowerCase().split(/\s+/);
    const highlights: string[] = [];

    texts.forEach(text => {
      if (!text) return;
      
      queryTerms.forEach(term => {
        const regex = new RegExp(`(.{0,50})(${term})(.{0,50})`, 'gi');
        const matches = text.match(regex);
        
        if (matches) {
          matches.slice(0, 2).forEach(match => {
            const highlighted = match.replace(
              new RegExp(`(${term})`, 'gi'),
              '<mark>$1</mark>'
            );
            highlights.push(`...${highlighted}...`);
          });
        }
      });
    });

    return highlights.slice(0, 3); // Limit to 3 highlights
  }

  // ============================================================================
  // QUERY EXPANSION AND SUGGESTIONS
  // ============================================================================

  private async expandQuery(query: string): Promise<string[]> {
    // Climate-specific synonyms and expansions
    const climateTerms: Record<string, string[]> = {
      'renewable': ['clean energy', 'sustainable energy', 'green energy'],
      'sustainability': ['sustainable development', 'ESG', 'environmental'],
      'carbon': ['emissions', 'footprint', 'neutral', 'offset'],
      'climate': ['environmental', 'green', 'sustainable'],
      'energy': ['power', 'electricity', 'renewable'],
      'green': ['sustainable', 'eco-friendly', 'environmental'],
      'solar': ['photovoltaic', 'PV', 'renewable energy'],
      'wind': ['renewable energy', 'turbine'],
      'electric': ['EV', 'battery', 'clean transport']
    };

    const expansions: string[] = [query];
    const queryTerms = query.toLowerCase().split(/\s+/);

    queryTerms.forEach(term => {
      if (climateTerms[term]) {
        expansions.push(...climateTerms[term]);
      }
    });

    return [...new Set(expansions)];
  }

  private async generateSuggestions(query: string): Promise<string[]> {
    const suggestions: string[] = [];
    
    // Get popular queries that start with the current query
    const popularSuggestions = Array.from(this.popularQueries.entries())
      .filter(([q]) => q.toLowerCase().startsWith(query.toLowerCase()) && q !== query)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([q]) => q);

    suggestions.push(...popularSuggestions);

    // Add climate-specific suggestions
    const climateSuggestions = [
      'renewable energy jobs',
      'sustainability careers',
      'climate tech startups',
      'green finance roles',
      'environmental consulting',
      'carbon management',
      'clean energy projects',
      'ESG reporting'
    ].filter(s => s.toLowerCase().includes(query.toLowerCase()) && s !== query);

    suggestions.push(...climateSuggestions.slice(0, 5 - suggestions.length));

    return suggestions;
  }

  // ============================================================================
  // FACETS GENERATION
  // ============================================================================

  private async generateFacets(results: SearchResult[]): Promise<Record<string, Array<{ value: string; count: number }>>> {
    const facets: Record<string, Map<string, number>> = {
      content_type: new Map(),
      organization_type: new Map(),
      employment_type: new Map(),
      experience_level: new Map(),
      climate_focus: new Map(),
      partnership_level: new Map()
    };

    results.forEach(result => {
      // Content type facet
      if (result.type) {
        facets.content_type.set(result.type, (facets.content_type.get(result.type) || 0) + 1);
      }

      // Organization type facet
      if (result.metadata.organization_type) {
        const orgType = result.metadata.organization_type;
        facets.organization_type.set(orgType, (facets.organization_type.get(orgType) || 0) + 1);
      }

      // Employment type facet
      if (result.metadata.employment_type) {
        const empType = result.metadata.employment_type;
        facets.employment_type.set(empType, (facets.employment_type.get(empType) || 0) + 1);
      }

      // Experience level facet
      if (result.metadata.experience_level) {
        const expLevel = result.metadata.experience_level;
        facets.experience_level.set(expLevel, (facets.experience_level.get(expLevel) || 0) + 1);
      }

      // Climate focus facet
      if (result.metadata.climate_focus && Array.isArray(result.metadata.climate_focus)) {
        result.metadata.climate_focus.forEach((focus: string) => {
          facets.climate_focus.set(focus, (facets.climate_focus.get(focus) || 0) + 1);
        });
      }

      // Partnership level facet
      if (result.metadata.partnership_level) {
        const partLevel = result.metadata.partnership_level;
        facets.partnership_level.set(partLevel, (facets.partnership_level.get(partLevel) || 0) + 1);
      }
    });

    // Convert maps to arrays and sort by count
    const facetResults: Record<string, Array<{ value: string; count: number }>> = {};
    
    Object.entries(facets).forEach(([key, valueMap]) => {
      facetResults[key] = Array.from(valueMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 per facet
    });

    return facetResults;
  }

  // ============================================================================
  // ANALYTICS AND TRACKING
  // ============================================================================

  private trackQuery(query: string): void {
    if (!query) return;
    
    // Add to search history
    this.searchHistory.unshift(query);
    this.searchHistory = this.searchHistory.slice(0, 100); // Keep last 100 searches
    
    // Track popular queries
    const count = this.popularQueries.get(query) || 0;
    this.popularQueries.set(query, count + 1);
  }

  getSearchHistory(): string[] {
    return [...this.searchHistory];
  }

  getPopularQueries(limit = 10): Array<{ query: string; count: number }> {
    return Array.from(this.popularQueries.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  clearSearchHistory(): void {
    this.searchHistory = [];
    this.popularQueries.clear();
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const searchEngine = AdvancedSearchEngine.getInstance(); 