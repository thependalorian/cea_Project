/**
 * Resources API Endpoint
 * Purpose: Serve real resources data from Supabase with proper formatting
 * Location: /app/api/resources/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'
import createClient from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import { cookies } from 'next/headers'

interface KnowledgeResource {
  id: string
  title: string
  description: string
  content_type: string
  source_url?: string
  tags: string[]
  categories: string[]
  domain?: string
  topics: string[]
  target_audience: string[]
  created_at: string
}

interface EducationProgram {
  id: string
  program_name: string
  description: string
  program_type: string
  duration?: string
  format?: string
  cost?: string
  climate_focus: string[]
  skills_taught: string[]
  application_url?: string
  created_at: string
}

interface JobListing {
  id: string
  title: string
  description: string
  location?: string
  employment_type?: string
  experience_level?: string
  climate_focus: string[]
  skills_required: string[]
  application_url?: string
  application_email?: string
  created_at: string
}

interface ResourcesResponse {
  knowledgeResources: KnowledgeResource[]
  educationPrograms: EducationProgram[]
  jobListings: JobListing[]
  totalCount: number
  success: boolean
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const supabase = await createClient()

    // Parallel fetch for better performance
    const [knowledgeResult, educationResult, jobsResult] = await Promise.all([
      // Fetch knowledge resources
      supabase
        .from('knowledge_resources')
        .select(`
          id,
          title,
          description,
          content_type,
          source_url,
          tags,
          categories,
          domain,
          topics,
          target_audience,
          created_at
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(category === 'knowledge' ? limit : (category ? 0 : Math.floor(limit / 3))),

      // Fetch education programs
      supabase
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
          application_url,
          created_at
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(category === 'education' ? limit : (category ? 0 : Math.floor(limit / 3))),

      // Fetch job listings
      supabase
        .from('job_listings')
        .select(`
          id,
          title,
          description,
          location,
          employment_type,
          experience_level,
          climate_focus,
          skills_required,
          application_url,
          application_email,
          created_at
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(category === 'jobs' ? limit : (category ? 0 : Math.floor(limit / 3)))
    ])

    // Check for errors
    if (knowledgeResult.error) {
      throw new Error(`Knowledge resources error: ${knowledgeResult.error.message}`)
    }
    if (educationResult.error) {
      throw new Error(`Education programs error: ${educationResult.error.message}`)
    }
    if (jobsResult.error) {
      throw new Error(`Job listings error: ${jobsResult.error.message}`)
    }

    let knowledgeResources = knowledgeResult.data as KnowledgeResource[] || []
    let educationPrograms = educationResult.data as EducationProgram[] || []
    let jobListings = jobsResult.data as JobListing[] || []

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase()
      
      knowledgeResources = knowledgeResources.filter((resource: KnowledgeResource) =>
        resource.title?.toLowerCase().includes(searchLower) ||
        resource.description?.toLowerCase().includes(searchLower) ||
        resource.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
        resource.topics?.some((topic: string) => topic.toLowerCase().includes(searchLower))
      )

      educationPrograms = educationPrograms.filter((program: EducationProgram) =>
        program.program_name?.toLowerCase().includes(searchLower) ||
        program.description?.toLowerCase().includes(searchLower) ||
        program.climate_focus?.some((focus: string) => focus.toLowerCase().includes(searchLower)) ||
        program.skills_taught?.some((skill: string) => skill.toLowerCase().includes(searchLower))
      )

      jobListings = jobListings.filter((job: JobListing) =>
        job.title?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower) ||
        job.location?.toLowerCase().includes(searchLower) ||
        job.climate_focus?.some((focus: string) => focus.toLowerCase().includes(searchLower)) ||
        job.skills_required?.some((skill: string) => skill.toLowerCase().includes(searchLower))
      )
    }

    const totalCount = knowledgeResources.length + educationPrograms.length + jobListings.length

    const response: ResourcesResponse = {
      knowledgeResources,
      educationPrograms,
      jobListings,
      totalCount,
      success: true
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })

  } catch (error) {
    console.error('Resources API error:', error)
    
    const errorResponse: ResourcesResponse = {
      knowledgeResources: [],
      educationPrograms: [],
      jobListings: [],
      totalCount: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch resources'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Health check endpoint
export async function HEAD() {
  return new Response(null, { status: 200 })
} 