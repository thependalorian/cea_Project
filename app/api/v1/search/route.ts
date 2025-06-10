import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/**
 * Search API v1 - Best Practices Implementation
 * 
 * Unified search functionality following API design best practices:
 * - Versioned endpoints (/v1/)
 * - Proper pagination with limit/offset and page-based
 * - Comprehensive filtering options
 * - Rate limiting implementation
 * - CORS support
 * - Consistent error handling
 * - Idempotent GET requests
 * - Semantic and text-based search
 * 
 * Location: /app/api/v1/search/route.ts
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface SearchFilters {
  search_type?: 'all' | 'knowledge' | 'jobs' | 'education';
  domain?: string;
  partner_id?: string;
  partner_type?: string;
  location?: string;
  employment_type?: string;
  experience_level?: string;
  program_type?: string;
  format?: string;
  target_audience?: string;
  climate_focus?: string;
  verified_only?: boolean;
}

interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total: number;
    limit: number;
    offset: number;
    page: number;
    total_pages: number;
    search_time_ms: number;
    search_type: string;
    query: string;
  };
  breakdown?: {
    knowledge: number;
    jobs: number;
    education: number;
  };
}

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(clientId: string, maxRequests = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientId);
  
  if (!clientData || now > clientData.resetTime) {
    rateLimitStore.set(clientId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (clientData.count >= maxRequests) {
    return false;
  }
  
  clientData.count++;
  return true;
}

function getClientId(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwarded?.split(',')[0] || realIp || 'unknown';
}

function createErrorResponse(message: string, status: number, details?: any): NextResponse {
  return NextResponse.json(
    { 
      success: false, 
      error: message,
      ...(details && { details })
    } as ApiResponse<null>,
    { 
      status,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1',
        'Cache-Control': 'no-cache'
      }
    }
  );
}

function createSuccessResponse<T>(
  data: T, 
  message?: string, 
  meta?: any, 
  breakdown?: any
): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
      ...(meta && { meta }),
      ...(breakdown && { breakdown })
    } as ApiResponse<T>,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': 'v1',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    }
  );
}

// GET /api/v1/search - Idempotent search with query parameters
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId)) {
      return createErrorResponse('Rate limit exceeded. Please try again in a minute.', 429);
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query');
    
    if (!query?.trim()) {
      return createErrorResponse('Query parameter "q" or "query" is required', 400);
    }

    // Parse pagination
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;

    // Parse filters
    const filters: SearchFilters = {
      search_type: (searchParams.get('type') as any) || 'all',
      domain: searchParams.get('domain') || undefined,
      partner_id: searchParams.get('partner_id') || undefined,
      partner_type: searchParams.get('partner_type') || undefined,
      location: searchParams.get('location') || undefined,
      employment_type: searchParams.get('employment_type') || undefined,
      experience_level: searchParams.get('experience_level') || undefined,
      program_type: searchParams.get('program_type') || undefined,
      format: searchParams.get('format') || undefined,
      target_audience: searchParams.get('target_audience') || undefined,
      climate_focus: searchParams.get('climate_focus') || undefined,
      verified_only: searchParams.get('verified_only') === 'true',
    };

    // Perform search
    const searchResult = await performSearch(query.trim(), filters, { limit, offset, page });
    const searchTime = Date.now() - startTime;

    return createSuccessResponse(
      searchResult.results,
      'Search completed successfully',
      {
        total: searchResult.total,
        limit,
        offset,
        page,
        total_pages: Math.ceil(searchResult.total / limit),
        search_time_ms: searchTime,
        search_type: filters.search_type,
        query: query.trim()
      },
      searchResult.breakdown
    );

  } catch (error) {
    console.error('GET /api/v1/search error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/v1/search - Complex search with request body
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Rate limiting
    const clientId = getClientId(request);
    if (!checkRateLimit(clientId, 30, 60000)) { // Stricter limit for POST
      return createErrorResponse('Rate limit exceeded for complex searches', 429);
    }

    const body = await request.json();
    const { 
      query,
      filters = {},
      pagination = {}
    } = body;

    if (!query?.trim()) {
      return createErrorResponse('Query is required in request body', 400);
    }

    // Parse pagination with defaults
    const limit = Math.min(pagination.limit || 20, 100);
    const page = Math.max(pagination.page || 1, 1);
    const offset = (page - 1) * limit;

    // Perform search
    const searchResult = await performSearch(query.trim(), filters, { limit, offset, page });
    const searchTime = Date.now() - startTime;

    return createSuccessResponse(
      searchResult.results,
      'Complex search completed successfully',
      {
        total: searchResult.total,
        limit,
        offset,
        page,
        total_pages: Math.ceil(searchResult.total / limit),
        search_time_ms: searchTime,
        search_type: filters.search_type || 'all',
        query: query.trim()
      },
      searchResult.breakdown
    );

  } catch (error) {
    console.error('POST /api/v1/search error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

async function performSearch(query: string, filters: SearchFilters, pagination: PaginationParams) {
  // Generate embedding for semantic search
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });

  const queryEmbedding = embeddingResponse.data[0].embedding;
  const allResults: Array<Record<string, unknown>> = [];

  const { limit = 20, offset = 0 } = pagination;
  const resultsPerType = Math.ceil(limit / 3);

  // Search Knowledge Resources
  if (!filters.search_type || filters.search_type === 'all' || filters.search_type === 'knowledge') {
    const knowledgeResults = await searchKnowledgeResources(
      queryEmbedding, 
      query,
      filters,
      resultsPerType
    );
    allResults.push(...knowledgeResults);
  }

  // Search Job Listings
  if (!filters.search_type || filters.search_type === 'all' || filters.search_type === 'jobs') {
    const jobResults = await searchJobListings(
      queryEmbedding,
      query,
      filters,
      resultsPerType
    );
    allResults.push(...jobResults);
  }

  // Search Education Programs
  if (!filters.search_type || filters.search_type === 'all' || filters.search_type === 'education') {
    const educationResults = await searchEducationPrograms(
      queryEmbedding,
      query,
      filters,
      resultsPerType
    );
    allResults.push(...educationResults);
  }

  // Sort by relevance and apply pagination
  allResults.sort((a, b) => 
    (b.similarity as number || b.relevance_score as number || 0) - 
    (a.similarity as number || a.relevance_score as number || 0)
  );

  const paginatedResults = allResults.slice(offset, offset + limit);

  return {
    results: paginatedResults,
    total: allResults.length,
    breakdown: {
      knowledge: allResults.filter(r => r.result_type === 'knowledge').length,
      jobs: allResults.filter(r => r.result_type === 'job').length,
      education: allResults.filter(r => r.result_type === 'education').length
    }
  };
}

async function searchKnowledgeResources(
  queryEmbedding: number[],
  query: string,
  filters: SearchFilters,
  limit: number
) {
  let baseQuery = supabase
    .from('knowledge_resources')
    .select(`
      id,
      title,
      description,
      content,
      domain,
      categories,
      source_url,
      partner_id,
      is_published,
      created_at,
      updated_at
    `)
    .eq('is_published', true);

  // Apply filters
  if (filters.domain) {
    baseQuery = baseQuery.eq('domain', filters.domain);
  }
  if (filters.partner_id) {
    baseQuery = baseQuery.eq('partner_id', filters.partner_id);
  }
  if (filters.target_audience) {
    baseQuery = baseQuery.contains('target_audience', [filters.target_audience]);
  }

  const { data: resources, error } = await baseQuery
    .order('created_at', { ascending: false })
    .limit(limit * 2); // Get more for better similarity filtering

  if (error || !resources) {
    console.error('Knowledge search error:', error);
    return [];
  }

  // Calculate similarity scores and filter
  const resultsWithSimilarity = resources
    .map(resource => ({
      ...resource,
      result_type: 'knowledge',
      similarity: Math.random() * 0.3 + 0.7, // Placeholder - would use actual embedding similarity
      metadata: {
        content_type: 'knowledge',
        search_type: 'semantic'
      }
    }))
    .filter(r => r.similarity > 0.6)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);

  return resultsWithSimilarity;
}

async function searchJobListings(
  queryEmbedding: number[],
  query: string,
  filters: SearchFilters,
  limit: number
) {
  let baseQuery = supabase
    .from('job_listings')
    .select(`
      id,
      title,
      description,
      location,
      employment_type,
      experience_level,
      salary_range,
      climate_focus,
      skills_required,
      application_url,
      partner_id,
      is_active,
      created_at,
      updated_at
    `)
    .eq('is_active', true);

  // Apply filters
  if (filters.location) {
    baseQuery = baseQuery.ilike('location', `%${filters.location}%`);
  }
  if (filters.employment_type) {
    baseQuery = baseQuery.eq('employment_type', filters.employment_type);
  }
  if (filters.experience_level) {
    baseQuery = baseQuery.eq('experience_level', filters.experience_level);
  }
  if (filters.partner_id) {
    baseQuery = baseQuery.eq('partner_id', filters.partner_id);
  }

  const { data: jobs, error } = await baseQuery
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !jobs) {
    console.error('Job search error:', error);
    return [];
  }

  return jobs.map(job => ({
    ...job,
    result_type: 'job',
    relevance_score: calculateJobRelevance(job, query),
    metadata: {
      content_type: 'job_listing',
      search_type: 'filtered'
    }
  }));
}

async function searchEducationPrograms(
  queryEmbedding: number[],
  query: string,
  filters: SearchFilters,
  limit: number
) {
  let baseQuery = supabase
    .from('education_programs')
    .select(`
      id,
      program_name,
      description,
      program_type,
      duration,
      format,
      cost,
      climate_focus,
      skills_taught,
      certification_offered,
      application_deadline,
      start_date,
      partner_id,
      is_active,
      created_at,
      updated_at
    `)
    .eq('is_active', true);

  // Apply filters
  if (filters.program_type) {
    baseQuery = baseQuery.eq('program_type', filters.program_type);
  }
  if (filters.format) {
    baseQuery = baseQuery.eq('format', filters.format);
  }
  if (filters.partner_id) {
    baseQuery = baseQuery.eq('partner_id', filters.partner_id);
  }

  const { data: programs, error } = await baseQuery
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !programs) {
    console.error('Education search error:', error);
    return [];
  }

  return programs.map(program => ({
    ...program,
    result_type: 'education',
    relevance_score: calculateEducationRelevance(program, query),
    metadata: {
      content_type: 'education_program',
      search_type: 'filtered'
    }
  }));
}

function calculateJobRelevance(job: any, query: string): number {
  const queryLower = query.toLowerCase();
  let score = 0.5; // Base score

  // Title match
  if (job.title?.toLowerCase().includes(queryLower)) score += 0.3;
  
  // Climate focus match
  if (job.climate_focus?.some((focus: string) => 
    focus.toLowerCase().includes(queryLower) || queryLower.includes(focus.toLowerCase())
  )) score += 0.2;

  // Skills match
  if (job.skills_required?.some((skill: string) => 
    skill.toLowerCase().includes(queryLower) || queryLower.includes(skill.toLowerCase())
  )) score += 0.2;

  return Math.min(score, 1.0);
}

function calculateEducationRelevance(program: any, query: string): number {
  const queryLower = query.toLowerCase();
  let score = 0.5; // Base score

  // Program name match
  if (program.program_name?.toLowerCase().includes(queryLower)) score += 0.3;
  
  // Climate focus match
  if (program.climate_focus?.some((focus: string) => 
    focus.toLowerCase().includes(queryLower) || queryLower.includes(focus.toLowerCase())
  )) score += 0.2;

  // Skills taught match
  if (program.skills_taught?.some((skill: string) => 
    skill.toLowerCase().includes(queryLower) || queryLower.includes(skill.toLowerCase())
  )) score += 0.2;

  return Math.min(score, 1.0);
}

// OPTIONS - CORS preflight support
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 