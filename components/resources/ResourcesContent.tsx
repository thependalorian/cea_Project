/**
 * Resources Content Component - Real Supabase Data Integration
 * Purpose: Fetch and display actual resources from Supabase database
 * Location: /components/resources/ResourcesContent.tsx
 */

'use client'

import { useState, useEffect } from 'react'
import createClient from '@/lib/supabase/client'
import { ResourceCard } from './ResourceCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

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
}

type FilterCategory = 'all' | 'knowledge' | 'education' | 'jobs'

export function ResourcesContent() {
  const [knowledgeResources, setKnowledgeResources] = useState<KnowledgeResource[]>([])
  const [educationPrograms, setEducationPrograms] = useState<EducationProgram[]>([])
  const [jobListings, setJobListings] = useState<JobListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all')
  const [searchTerm, setSearchTerm] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      setLoading(true)
      
      // Fetch knowledge resources
      const { data: knowledge, error: knowledgeError } = await supabase
        .from('knowledge_resources')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (knowledgeError) throw knowledgeError

      // Fetch education programs
      const { data: education, error: educationError } = await supabase
        .from('education_programs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (educationError) throw educationError

      // Fetch job listings
      const { data: jobs, error: jobsError } = await supabase
        .from('job_listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (jobsError) throw jobsError

      setKnowledgeResources(knowledge || [])
      setEducationPrograms(education || [])
      setJobListings(jobs || [])
      
    } catch (err) {
      console.error('Error fetching resources:', err)
      setError('Failed to load resources. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const filterResources = () => {
    const searchLower = searchTerm.toLowerCase()
    
    let filteredKnowledge = knowledgeResources
    let filteredEducation = educationPrograms
    let filteredJobs = jobListings

    // Apply search filter
    if (searchTerm) {
      filteredKnowledge = knowledgeResources.filter(resource =>
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        resource.topics.some(topic => topic.toLowerCase().includes(searchLower))
      )

      filteredEducation = educationPrograms.filter(program =>
        program.program_name.toLowerCase().includes(searchLower) ||
        program.description.toLowerCase().includes(searchLower) ||
        program.climate_focus.some(focus => focus.toLowerCase().includes(searchLower)) ||
        program.skills_taught.some(skill => skill.toLowerCase().includes(searchLower))
      )

      filteredJobs = jobListings.filter(job =>
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        job.climate_focus.some(focus => focus.toLowerCase().includes(searchLower)) ||
        job.skills_required.some(skill => skill.toLowerCase().includes(searchLower))
      )
    }

    // Apply category filter
    switch (activeFilter) {
      case 'knowledge':
        return { knowledge: filteredKnowledge, education: [], jobs: [] }
      case 'education':
        return { knowledge: [], education: filteredEducation, jobs: [] }
      case 'jobs':
        return { knowledge: [], education: [], jobs: filteredJobs }
      default:
        return { 
          knowledge: filteredKnowledge, 
          education: filteredEducation, 
          jobs: filteredJobs 
        }
    }
  }

  const { knowledge, education, jobs } = filterResources()
  const totalResults = knowledge.length + education.length + jobs.length

  if (loading) return <LoadingSpinner />

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={fetchResources}
          className="px-4 py-2 bg-[var(--spring-green)] text-white rounded-lg hover:bg-[var(--moss-green)] transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search resources, programs, and jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-[var(--sand-gray)] rounded-lg focus:ring-2 focus:ring-[var(--spring-green)] focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'knowledge', 'education', 'jobs'] as FilterCategory[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeFilter === filter
                  ? 'bg-[var(--spring-green)] text-white'
                  : 'bg-[var(--sand-gray-20)] text-[var(--moss-green)] hover:bg-[var(--spring-green-20)]'
              }`}
            >
              {filter === 'all' ? 'All Resources' : 
               filter === 'knowledge' ? 'Knowledge Base' :
               filter === 'education' ? 'Education Programs' : 'Job Opportunities'}
            </button>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-[var(--moss-green)]">
        Showing {totalResults} {totalResults === 1 ? 'resource' : 'resources'}
        {searchTerm && ` for "${searchTerm}"`}
      </div>

      {/* Knowledge Resources Section */}
      {knowledge.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-[var(--midnight-forest)] mb-6">
            Knowledge Resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {knowledge.map((resource) => (
              <ResourceCard
                key={resource.id}
                title={resource.title}
                description={resource.description}
                category={resource.content_type}
                href={resource.source_url}
                className="h-full"
              />
            ))}
          </div>
        </section>
      )}

      {/* Education Programs Section */}
      {education.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-[var(--midnight-forest)] mb-6">
            Education Programs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {education.map((program) => (
              <ResourceCard
                key={program.id}
                title={program.program_name}
                description={`${program.description} ${program.duration ? `Duration: ${program.duration}` : ''} ${program.cost ? `Cost: ${program.cost}` : ''}`}
                category={program.program_type}
                href={program.application_url}
                className="h-full"
              />
            ))}
          </div>
        </section>
      )}

      {/* Job Listings Section */}
      {jobs.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-[var(--midnight-forest)] mb-6">
            Job Opportunities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <ResourceCard
                key={job.id}
                title={job.title}
                description={`${job.description} ${job.location ? `Location: ${job.location}` : ''} ${job.employment_type ? `Type: ${job.employment_type}` : ''}`}
                category={job.experience_level || 'Job Opening'}
                href={job.application_url}
                className="h-full"
              />
            ))}
          </div>
        </section>
      )}

      {/* No Results Message */}
      {totalResults === 0 && (
        <div className="text-center py-12">
          <div className="text-[var(--moss-green)] mb-4">
            {searchTerm ? 'No resources found matching your search.' : 'No resources available.'}
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-[var(--spring-green)] hover:text-[var(--moss-green)] transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  )
} 