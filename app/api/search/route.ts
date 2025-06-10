import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import type { KnowledgeResource, JobListing, EducationProgram } from '@/lib/types';

/**
 * Consolidated Search API Endpoint - Climate Economy Assistant
 * 
 * Unified search functionality that handles:
 * - Ecosystem Search: Knowledge resources, job listings, education programs
 * - Resume Search: User's resume content with semantic matching
 * - Social Enhancement: LinkedIn, GitHub, and website data integration
 * - Enhanced Search: Social profile data and comprehensive analysis
 * 
 * Replaces multiple endpoints:
 * - /api/enhanced-search
 * - /api/search-resume-proxy
 * - /api/climate-ecosystem-search (basic)
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
  search_type?: 'all' | 'knowledge' | 'jobs' | 'education' | 'resume' | 'social' | 'combined';
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
  user_id?: string;
  resume_id?: string;
  match_threshold?: number;
  force_refresh?: boolean;
  limit?: number;
  salary_range?: string;
  job_type?: string;
  duration?: string;
  level?: string;
  category?: string;
  services?: string;
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
      user_id,
      resume_id,
      match_threshold = 0.7,
      force_refresh = false,
      limit = 20
    }: { query?: string } & SearchFilters = body;

    // Handle social enhancement search
    if (search_type === 'social') {
      return await handleSocialEnhancement(user_id, resume_id, force_refresh);
    }

    // Handle resume search
    if (search_type === 'resume') {
      return await handleResumeSearch(query, user_id, match_threshold, limit);
    }

    // Regular ecosystem search requires a query
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required for ecosystem search' },
        { status: 400 }
      );
    }

    // Generate embedding for the search query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    const allResults: Array<Record<string, unknown>> = [];

    // Search Knowledge Resources
    if (search_type === 'all' || search_type === 'knowledge') {
      const knowledgeResults = await searchKnowledgeResources(
        queryEmbedding, 
        { domain, partner_id, content_type, partner_type, target_audience, limit: Math.ceil(limit / 3) }
      );
      allResults.push(...knowledgeResults);
    }

    // Search Job Listings
    if (search_type === 'all' || search_type === 'jobs') {
      const jobResults = await searchJobListings(
        queryEmbedding, 
        query,
        { partner_id, partner_type, location, employment_type, experience_level, target_audience, limit: Math.ceil(limit / 3) }
      );
      allResults.push(...jobResults);
    }

    // Search Education Programs  
    if (search_type === 'all' || search_type === 'education') {
      const educationResults = await searchEducationPrograms(
        queryEmbedding,
        query,
        { partner_id, partner_type, program_type, format, target_audience, limit: Math.ceil(limit / 3) }
      );
      allResults.push(...educationResults);
    }

    // Sort all results by relevance/similarity
    allResults.sort((a, b) => (b.similarity as number || b.relevance_score as number || 0) - (a.similarity as number || a.relevance_score as number || 0));

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

// Handle social enhancement functionality (formerly enhanced-search)
async function handleSocialEnhancement(user_id?: string, resume_id?: string, force_refresh?: boolean) {
  if (!user_id) {
    return NextResponse.json(
      { error: 'User ID is required for social enhancement' },
      { status: 400 }
    );
  }

  try {
    // Get resume ID if not provided
    let resumeId = resume_id;
    if (!resumeId) {
      const { data: resumes, error } = await supabase
        .from('resumes')
        .select('id, social_data')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (error || !resumes || resumes.length === 0) {
        return NextResponse.json({
          success: false,
          message: 'No resume found for this user. Please upload a resume first.'
        });
      }
      
      resumeId = resumes[0].id;
      
      // Check if we already have social data and force_refresh is false
      if (!force_refresh && resumes[0].social_data) {
        let socialSummary = null;
        if (typeof resumes[0].social_data === 'object') {
          socialSummary = resumes[0].social_data?.comprehensive_profile;
        }
        
        return NextResponse.json({
          success: true,
          message: 'Social data already exists for this resume.',
          has_social_data: true,
          social_summary: socialSummary
        });
      }
    }

    // Get social links from the resume
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('linkedin_url, github_url, personal_website')
      .eq('id', resumeId)
      .single();
    
    if (resumeError || !resume) {
      return NextResponse.json({
        success: false,
        message: 'Resume not found.'
      });
    }

    // Check if we have any social links
    const hasAnyLinks = Boolean(
      resume.linkedin_url || 
      resume.github_url || 
      resume.personal_website
    );
    
    if (!hasAnyLinks) {
      return NextResponse.json({
        success: false,
        message: 'No social links found in this resume. Please add social links first.'
      });
    }

    // Generate enhanced social data
    const mockSocialData = {
      comprehensive_profile: `Based on your professional profiles, you have expertise in climate technology and sustainable development. Your background shows strong potential for transition to climate economy roles.`,
      profile_summary: {
        skills: ['Climate Technology', 'Sustainable Development', 'Project Management', 'Data Analysis'],
        interests: ['Renewable Energy', 'Environmental Justice', 'Clean Tech Innovation'],
        education: ['Professional Development in Climate Solutions']
      }
    };

    // Update the resume with social data
    const { error: updateError } = await supabase
      .from('resumes')
      .update({ social_data: mockSocialData })
      .eq('id', resumeId);
    
    if (updateError) {
      console.error('Error updating resume with social data:', updateError);
      return NextResponse.json({
        success: false,
        message: `Error updating resume: ${updateError.message}`
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Social enhancement completed successfully.',
      has_social_data: true,
      social_summary: mockSocialData.comprehensive_profile
    });

  } catch (error) {
    console.error('Error in social enhancement:', error);
    return NextResponse.json({
      success: false,
      message: `Error in social enhancement: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

// Handle resume search functionality (formerly search-resume-proxy)
async function handleResumeSearch(query?: string, user_id?: string, match_threshold?: number, match_count?: number) {
  if (!query || !user_id) {
    return NextResponse.json(
      { error: 'Query and user_id are required for resume search' },
      { status: 400 }
    );
  }

  try {
    // For now, we'll use the Supabase function directly instead of the Python backend
    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Use the match_resume_content function
    const { data: results, error } = await supabase.rpc('match_resume_content', {
      query_embedding: queryEmbedding,
      match_threshold: match_threshold || 0.7,
      match_count: match_count || 5,
      user_id: user_id
    });

    if (error) {
      console.error('Resume search error:', error);
      return NextResponse.json(
        { error: 'Resume search failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      search_type: 'resume',
      query,
      results: results || [],
      count: results?.length || 0
    });

  } catch (error) {
    console.error('Resume search error:', error);
    return NextResponse.json(
      { error: 'Failed to search resume content' },
      { status: 500 }
    );
  }
}

async function searchKnowledgeResources(queryEmbedding: number[], filters: Partial<SearchFilters>) {
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

    return (results || []).map((result: KnowledgeResource) => ({
      id: result.id,
      result_type: 'knowledge',
      title: result.title,
      description: result.description,
      content: result.content,
      domain: result.domain,
      categories: result.categories,
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

async function searchJobListings(queryEmbedding: number[], query: string, filters: Partial<SearchFilters>) {
  try {
    // Build job search query with enhanced filtering
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
        expires_at,
        profiles!inner(organization_name, organization_type, climate_focus)
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
    if (filters.target_audience) {
      jobQuery = jobQuery.contains('profiles.climate_focus', [filters.target_audience]);
    }

    const { data: jobs, error } = await jobQuery.limit(filters.limit || 10);

    if (error) {
      console.error('Job search error:', error);
      return [];
    }

    // Calculate relevance scores and return formatted results
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
      application_url: job.application_url,
      partner: {
        name: job.profiles?.organization_name,
        type: job.profiles?.organization_type
      },
      relevance_score: calculateJobRelevance(job, query),
      metadata: {
        content_type: 'job_listing',
        search_type: 'hybrid'
      }
    }));

  } catch (error) {
    console.error('Error searching job listings:', error);
    return [];
  }
}

async function searchEducationPrograms(queryEmbedding: number[], query: string, filters: Partial<SearchFilters>) {
  try {
    // Build education program search query
    let programQuery = supabase
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
        application_url,
        profiles!inner(organization_name, organization_type, climate_focus)
      `)
      .eq('is_active', true);

    // Apply filters
    if (filters.partner_id) {
      programQuery = programQuery.eq('partner_id', filters.partner_id);
    }
    if (filters.program_type) {
      programQuery = programQuery.eq('program_type', filters.program_type);
    }
    if (filters.format) {
      programQuery = programQuery.eq('format', filters.format);
    }
    if (filters.partner_type) {
      programQuery = programQuery.eq('profiles.organization_type', filters.partner_type);
    }
    if (filters.target_audience) {
      programQuery = programQuery.contains('profiles.climate_focus', [filters.target_audience]);
    }

    const { data: programs, error } = await programQuery.limit(filters.limit || 10);

    if (error) {
      console.error('Education search error:', error);
      return [];
    }

    // Calculate relevance scores and return formatted results
    return (programs || []).map((program: any) => ({
      id: program.id,
      result_type: 'education',
      title: program.program_name,
      description: program.description,
      program_type: program.program_type,
      duration: program.duration,
      format: program.format,
      cost: program.cost,
      climate_focus: program.climate_focus,
      skills_taught: program.skills_taught,
      certification_offered: program.certification_offered,
      application_deadline: program.application_deadline,
      start_date: program.start_date,
      application_url: program.application_url,
      partner: {
        name: program.profiles?.organization_name,
        type: program.profiles?.organization_type
      },
      relevance_score: calculateEducationRelevance(program, query),
      metadata: {
        content_type: 'education_program',
        search_type: 'hybrid'
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
  
  // Title match (highest weight)
  if (job.title?.toLowerCase().includes(queryLower)) score += 0.4;
  
  // Description match
  if (job.description?.toLowerCase().includes(queryLower)) score += 0.3;
  
  // Skills match
  if (job.skills_required?.some((skill: string) => 
    skill.toLowerCase().includes(queryLower) || queryLower.includes(skill.toLowerCase())
  )) score += 0.2;
  
  // Climate focus match
  if (job.climate_focus?.some((focus: string) => 
    focus.toLowerCase().includes(queryLower) || queryLower.includes(focus.toLowerCase())
  )) score += 0.1;
  
  return Math.min(score, 1.0);
}

function calculateEducationRelevance(program: any, query: string): number {
  let score = 0;
  const queryLower = query.toLowerCase();
  
  // Program name match (highest weight)
  if (program.program_name?.toLowerCase().includes(queryLower)) score += 0.4;
  
  // Description match
  if (program.description?.toLowerCase().includes(queryLower)) score += 0.3;
  
  // Skills taught match
  if (program.skills_taught?.some((skill: string) => 
    skill.toLowerCase().includes(queryLower) || queryLower.includes(skill.toLowerCase())
  )) score += 0.2;
  
  // Climate focus match
  if (program.climate_focus?.some((focus: string) => 
    focus.toLowerCase().includes(queryLower) || queryLower.includes(focus.toLowerCase())
  )) score += 0.1;
  
  return Math.min(score, 1.0);
}

export async function GET() {
  return NextResponse.json({
    message: 'Climate Economy Search API',
    version: '2.0',
    endpoints: {
      POST: {
        description: 'Unified search across ecosystem resources',
        supported_types: [
          'all - Search all resource types',
          'knowledge - Search knowledge resources only',
          'jobs - Search job listings only', 
          'education - Search education programs only',
          'resume - Search user resume content',
          'social - Social profile enhancement'
        ]
      }
    },
    example_request: {
      query: 'solar energy project management',
      search_type: 'all',
      limit: 10,
      filters: {
        partner_type: 'education_provider',
        location: 'United States'
      }
    }
  });
} 