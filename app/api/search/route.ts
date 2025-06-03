import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/**
 * Enhanced Search API Endpoint - Climate Economy Ecosystem
 * 
 * Provides comprehensive semantic search across:
 * - Knowledge Resources (PDF content, partner programs)
 * - Job Listings (actual job postings)
 * - Education Programs (training, certification, degree programs)
 * 
 * Supports filtering by domain, partner, content type, and target audience.
 * Updated June 2025 for complete ecosystem with properly categorized data.
 * 
 * Location: /app/api/search/route.ts
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
  content_type?: string;
  partner_type?: string;
  location?: string;
  employment_type?: string;
  experience_level?: string;
  program_type?: string;
  format?: string;
  target_audience?: string;
  limit?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      query, 
      search_type = 'all',
      domain, 
      partner_id, 
      content_type, 
      partner_type,
      location,
      employment_type,
      experience_level,
      program_type,
      format,
      target_audience, 
      limit = 20 
    }: { query: string } & SearchFilters = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Generate embedding for the search query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    let allResults: any[] = [];

    // Search Knowledge Resources
    if (search_type === 'all' || search_type === 'knowledge') {
      const knowledgeResults = await searchKnowledgeResources(
        queryEmbedding, 
        { domain, partner_id, content_type, partner_type, limit: Math.ceil(limit / 3) }
      );
      allResults.push(...knowledgeResults);
    }

    // Search Job Listings
    if (search_type === 'all' || search_type === 'jobs') {
      const jobResults = await searchJobListings(
        queryEmbedding, 
        query,
        { partner_id, partner_type, location, employment_type, experience_level, limit: Math.ceil(limit / 3) }
      );
      allResults.push(...jobResults);
    }

    // Search Education Programs  
    if (search_type === 'all' || search_type === 'education') {
      const educationResults = await searchEducationPrograms(
        queryEmbedding,
        query, 
        { partner_id, partner_type, program_type, format, limit: Math.ceil(limit / 3) }
      );
      allResults.push(...educationResults);
    }

    // Sort all results by relevance/similarity
    allResults.sort((a, b) => (b.similarity || b.relevance_score || 0) - (a.similarity || a.relevance_score || 0));

    // Limit final results
    const finalResults = allResults.slice(0, limit);

    return NextResponse.json({
      success: true,
      query,
      search_type,
      results: finalResults,
      count: finalResults.length,
      breakdown: {
        knowledge: finalResults.filter(r => r.result_type === 'knowledge').length,
        jobs: finalResults.filter(r => r.result_type === 'job').length,
        education: finalResults.filter(r => r.result_type === 'education').length
      },
      filters: {
        search_type,
        domain,
        partner_id,
        content_type,
        partner_type,
        location,
        employment_type,
        experience_level,
        program_type,
        format,
        target_audience
      }
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function searchKnowledgeResources(queryEmbedding: number[], filters: any) {
  try {
    // Use the existing match_knowledge_resources function
    const { data: results, error } = await supabase.rpc('match_knowledge_resources', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: filters.limit || 10,
      filter_domain: filters.domain || null,
      filter_categories: null
    });

    if (error) {
      console.error('Knowledge search error:', error);
      return [];
    }

    return (results || []).map((result: any) => ({
      id: result.resource_id,
      result_type: 'knowledge',
      title: result.title,
      description: result.description,
      content: result.content,
      similarity: result.similarity,
      domain: result.domain,
      categories: result.categories,
      partner: {
        name: result.partner_name
      },
      sourceUrl: result.source_url,
      metadata: {
        content_type: 'knowledge_resource',
        search_type: 'semantic'
      }
    }));

  } catch (error) {
    console.error('Error searching knowledge resources:', error);
    return [];
  }
}

async function searchJobListings(queryEmbedding: number[], query: string, filters: any) {
  try {
    // Build job search query
    let jobQuery = supabase
      .from('job_listings')
      .select(`
        id,
        title,
        description,
        requirements,
        responsibilities,
        location,
        employment_type,
        experience_level,
        salary_range,
        climate_focus,
        skills_required,
        benefits,
        application_url,
        application_email,
        created_at,
        partner_id,
        profiles!inner(
          organization_name,
          organization_type,
          website
        )
      `)
      .eq('is_active', true);

    // Apply filters
    if (filters.partner_id) {
      jobQuery = jobQuery.eq('partner_id', filters.partner_id);
    }
    if (filters.location) {
      jobQuery = jobQuery.ilike('location', `%${filters.location}%`);
    }
    if (filters.employment_type) {
      jobQuery = jobQuery.eq('employment_type', filters.employment_type);
    }
    if (filters.experience_level) {
      jobQuery = jobQuery.eq('experience_level', filters.experience_level);
    }
    if (filters.partner_type) {
      jobQuery = jobQuery.eq('profiles.organization_type', filters.partner_type);
    }

    // Text search in title and description
    jobQuery = jobQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);

    const { data: jobs, error } = await jobQuery.limit(filters.limit || 10);

    if (error) {
      console.error('Job search error:', error);
      return [];
    }

    return (jobs || []).map((job: any) => ({
      id: job.id,
      result_type: 'job',
      title: job.title,
      description: job.description,
      location: job.location,
      employment_type: job.employment_type,
      experience_level: job.experience_level,
      salary_range: job.salary_range,
      climate_focus: job.climate_focus,
      skills_required: job.skills_required,
      benefits: job.benefits,
      application_url: job.application_url,
      application_email: job.application_email,
      partner: {
        id: job.partner_id,
        name: job.profiles?.organization_name,
        type: job.profiles?.organization_type,
        website: job.profiles?.website
      },
      relevance_score: calculateJobRelevance(job, query),
      metadata: {
        content_type: 'job_listing',
        search_type: 'text_match'
      }
    }));

  } catch (error) {
    console.error('Error searching job listings:', error);
    return [];
  }
}

async function searchEducationPrograms(queryEmbedding: number[], query: string, filters: any) {
  try {
    // Build education search query
    let eduQuery = supabase
      .from('education_programs')
      .select(`
        id,
        program_name,
        description,
        program_type,
        duration,
        format,
        cost,
        prerequisites,
        climate_focus,
        skills_taught,
        certification_offered,
        application_deadline,
        start_date,
        end_date,
        contact_info,
        application_url,
        created_at,
        partner_id,
        profiles!inner(
          organization_name,
          organization_type,
          website
        )
      `)
      .eq('is_active', true);

    // Apply filters
    if (filters.partner_id) {
      eduQuery = eduQuery.eq('partner_id', filters.partner_id);
    }
    if (filters.program_type) {
      eduQuery = eduQuery.eq('program_type', filters.program_type);
    }
    if (filters.format) {
      eduQuery = eduQuery.eq('format', filters.format);
    }
    if (filters.partner_type) {
      eduQuery = eduQuery.eq('profiles.organization_type', filters.partner_type);
    }

    // Text search in program name and description
    eduQuery = eduQuery.or(`program_name.ilike.%${query}%,description.ilike.%${query}%`);

    const { data: programs, error } = await eduQuery.limit(filters.limit || 10);

    if (error) {
      console.error('Education search error:', error);
      return [];
    }

    return (programs || []).map((program: any) => ({
      id: program.id,
      result_type: 'education',
      title: program.program_name,
      description: program.description,
      program_type: program.program_type,
      duration: program.duration,
      format: program.format,
      cost: program.cost,
      prerequisites: program.prerequisites,
      climate_focus: program.climate_focus,
      skills_taught: program.skills_taught,
      certification_offered: program.certification_offered,
      application_deadline: program.application_deadline,
      start_date: program.start_date,
      end_date: program.end_date,
      contact_info: program.contact_info,
      application_url: program.application_url,
      partner: {
        id: program.partner_id,
        name: program.profiles?.organization_name,
        type: program.profiles?.organization_type,
        website: program.profiles?.website
      },
      relevance_score: calculateEducationRelevance(program, query),
      metadata: {
        content_type: 'education_program',
        search_type: 'text_match'
      }
    }));

  } catch (error) {
    console.error('Error searching education programs:', error);
    return [];
  }
}

function calculateJobRelevance(job: any, query: string): number {
  let score = 0;
  const queryLower = query.toLowerCase();
  
  // Title match
  if (job.title?.toLowerCase().includes(queryLower)) score += 0.8;
  
  // Description match
  if (job.description?.toLowerCase().includes(queryLower)) score += 0.6;
  
  // Skills match
  if (job.skills_required?.some((skill: string) => 
    skill.toLowerCase().includes(queryLower) || 
    queryLower.includes(skill.toLowerCase())
  )) score += 0.7;
  
  // Climate focus match
  if (job.climate_focus?.some((focus: string) => 
    focus.toLowerCase().includes(queryLower) || 
    queryLower.includes(focus.toLowerCase())
  )) score += 0.5;
  
  return Math.min(score, 1.0);
}

function calculateEducationRelevance(program: any, query: string): number {
  let score = 0;
  const queryLower = query.toLowerCase();
  
  // Program name match
  if (program.program_name?.toLowerCase().includes(queryLower)) score += 0.8;
  
  // Description match
  if (program.description?.toLowerCase().includes(queryLower)) score += 0.6;
  
  // Skills taught match
  if (program.skills_taught?.some((skill: string) => 
    skill.toLowerCase().includes(queryLower) || 
    queryLower.includes(skill.toLowerCase())
  )) score += 0.7;
  
  // Climate focus match
  if (program.climate_focus?.some((focus: string) => 
    focus.toLowerCase().includes(queryLower) || 
    queryLower.includes(focus.toLowerCase())
  )) score += 0.5;
  
  return Math.min(score, 1.0);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Handle GET request by converting to POST format
    const body = {
      query,
      search_type: searchParams.get('search_type') || 'all',
      domain: searchParams.get('domain'),
      partner_id: searchParams.get('partner_id'),
      content_type: searchParams.get('content_type'),
      partner_type: searchParams.get('partner_type'),
      location: searchParams.get('location'),
      employment_type: searchParams.get('employment_type'),
      experience_level: searchParams.get('experience_level'),
      program_type: searchParams.get('program_type'),
      format: searchParams.get('format'),
      target_audience: searchParams.get('target_audience'),
      limit: parseInt(searchParams.get('limit') || '20')
    };

    // Reuse POST logic
    const mockRequest = {
      json: async () => body
    } as NextRequest;

    return POST(mockRequest);

  } catch (error) {
    console.error('Search GET API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 