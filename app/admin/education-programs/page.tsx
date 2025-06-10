/**
 * Education Programs Management Page - Climate Economy Assistant
 * Admin page for managing educational programs and resources
 * Location: app/admin/education-programs/page.tsx
 */

import { createClient } from '@/lib/supabase/server'
import { ACTCard, ACTButton, ACTFrameElement } from '@/components/ui'
import { 
  BookOpen, 
  GraduationCap, 
  Users, 
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Eye,
  Edit,
  Plus,
  Award,
  Globe,
  Building
} from 'lucide-react'

interface EducationProgram {
  id: string
  program_name: string
  description: string
  partner_id: string
  program_type: string
  format: string
  duration: string
  cost: string
  start_date: string
  end_date: string
  is_active: boolean
  certification_offered: string
  created_at: string
  partner_profiles: {
    organization_name: string
    verified: boolean
  }
  climate_focus: string[]
  skills_taught: string[]
}

export default async function EducationProgramsPage() {
  const supabase = await createClient()

  // Check admin access
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return <div>Access denied</div>
  }

  // Get education programs
  const { data: programs, error } = await supabase
    .from('education_programs')
    .select(`
      *,
      partner_profiles!inner(organization_name, verified)
    `)
    .order('created_at', { ascending: false })

  // Get program statistics
  const [
    { count: totalPrograms },
    { count: activePrograms },
    { count: certificationPrograms },
    { data: upcomingPrograms }
  ] = await Promise.all([
    supabase
      .from('education_programs')
      .select('*', { count: 'exact', head: true }),
    
    supabase
      .from('education_programs')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true),
    
    supabase
      .from('education_programs')
      .select('*', { count: 'exact', head: true })
      .not('certification_offered', 'is', null),
    
    supabase
      .from('education_programs')
      .select(`
        *,
        partner_profiles!inner(organization_name, verified)
      `)
      .gte('start_date', new Date().toISOString())
      .eq('is_active', true)
      .order('start_date', { ascending: true })
      .limit(5)
  ])

  // Group programs by type
  const programsByType = programs?.reduce((acc, program) => {
    const type = program.program_type || 'Other'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-7xl">
      {/* Header */}
      <ACTFrameElement variant="full" size="xl" className="bg-gradient-to-r from-moss-green/10 to-seafoam-blue/10">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-moss-green/20 rounded-full">
                <BookOpen className="h-8 w-8 text-moss-green" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-midnight-forest">
                  Education Programs
                </h1>
                <p className="text-lg text-base-content/70 mt-2">
                  Manage climate education programs and training resources
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <ACTButton variant="primary" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Add Program
              </ACTButton>
            </div>
          </div>
        </div>
      </ACTFrameElement>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-moss-green/10 rounded-full mx-auto w-fit mb-4">
            <BookOpen className="h-8 w-8 text-moss-green" />
          </div>
          <div className="text-3xl font-bold text-moss-green mb-2">{totalPrograms || 0}</div>
          <div className="text-sm text-base-content/70">Total Programs</div>
        </ACTCard>

        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-success/10 rounded-full mx-auto w-fit mb-4">
            <Users className="h-8 w-8 text-success" />
          </div>
          <div className="text-3xl font-bold text-success mb-2">{activePrograms || 0}</div>
          <div className="text-sm text-base-content/70">Active Programs</div>
        </ACTCard>

        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-accent/10 rounded-full mx-auto w-fit mb-4">
            <Award className="h-8 w-8 text-accent" />
          </div>
          <div className="text-3xl font-bold text-accent mb-2">{certificationPrograms || 0}</div>
          <div className="text-sm text-base-content/70">With Certification</div>
        </ACTCard>

        <ACTCard variant="gradient" className="text-center p-6">
          <div className="p-3 bg-info/10 rounded-full mx-auto w-fit mb-4">
            <Calendar className="h-8 w-8 text-info" />
          </div>
          <div className="text-3xl font-bold text-info mb-2">{upcomingPrograms?.length || 0}</div>
          <div className="text-sm text-base-content/70">Starting Soon</div>
        </ACTCard>
      </div>

      {/* Program Types Overview */}
      <section>
        <ACTFrameElement variant="open" size="md" className="mb-6">
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">
            Program Categories
          </h2>
          <p className="text-base-content/70">
            Distribution of programs by type and focus area
          </p>
        </ACTFrameElement>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(programsByType).map(([type, count]) => (
            <ACTCard key={type} variant="outlined" className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{count as number}</div>
              <div className="text-sm text-base-content/70">{type}</div>
            </ACTCard>
          ))}
        </div>
      </section>

      {/* Upcoming Programs */}
      {upcomingPrograms && upcomingPrograms.length > 0 && (
        <section>
          <ACTFrameElement variant="brackets" size="lg" className="mb-6">
            <h2 className="text-2xl font-bold text-midnight-forest mb-2">
              Starting Soon
            </h2>
            <p className="text-base-content/70">
              Programs with upcoming start dates
            </p>
          </ACTFrameElement>

          <div className="grid gap-4">
            {upcomingPrograms.map((program: EducationProgram) => (
              <ACTCard key={program.id} variant="outlined" className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-moss-green/10 rounded-full">
                        <BookOpen className="h-5 w-5 text-moss-green" />
                      </div>
                      <h3 className="text-xl font-bold text-midnight-forest">
                        {program.program_name}
                      </h3>
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-info/10 text-info text-xs rounded-full">
                          Starts {new Date(program.start_date).toLocaleDateString()}
                        </span>
                        {program.certification_offered && (
                          <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
                            <Award className="h-3 w-3 mr-1 inline" />
                            Certification
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">Provider</p>
                        <p className="font-medium">{program.partner_profiles.organization_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">Format & Duration</p>
                        <p className="font-medium">{program.format} • {program.duration}</p>
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">Cost</p>
                        <p className="font-medium">{program.cost || 'Free'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-6">
                    <ACTButton variant="primary" size="sm" href={`/admin/education-programs/${program.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </ACTButton>
                    <ACTButton variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </ACTButton>
                  </div>
                </div>
              </ACTCard>
            ))}
          </div>
        </section>
      )}

      {/* All Programs */}
      <section>
        <ACTFrameElement variant="brackets" size="lg" className="mb-6">
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">
            All Education Programs ({totalPrograms || 0})
          </h2>
          <p className="text-base-content/70">
            Complete list of educational programs and training opportunities
          </p>
        </ACTFrameElement>

        {programs && programs.length > 0 ? (
          <div className="grid gap-6">
            {programs.map((program: EducationProgram) => (
              <ACTCard key={program.id} variant="outlined" className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-moss-green/10 rounded-full">
                        <GraduationCap className="h-5 w-5 text-moss-green" />
                      </div>
                      <h3 className="text-xl font-bold text-midnight-forest">
                        {program.program_name}
                      </h3>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          program.is_active 
                            ? 'bg-success/10 text-success' 
                            : 'bg-warning/10 text-warning'
                        }`}>
                          {program.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {program.partner_profiles.verified && (
                          <span className="px-2 py-1 bg-info/10 text-info text-xs rounded-full">
                            Verified Provider
                          </span>
                        )}
                        {program.certification_offered && (
                          <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
                            <Award className="h-3 w-3 mr-1 inline" />
                            {program.certification_offered}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">Provider</p>
                        <p className="font-medium">{program.partner_profiles.organization_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">Type & Format</p>
                        <p className="font-medium">{program.program_type} • {program.format}</p>
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">Duration</p>
                        <p className="font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {program.duration}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-base-content/60 mb-1">Cost</p>
                        <p className="font-medium flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {program.cost || 'Free'}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-base-content/60 mb-1">Description</p>
                      <p className="text-sm text-base-content/80">
                        {program.description.substring(0, 200)}
                        {program.description.length > 200 ? '...' : ''}
                      </p>
                    </div>

                    {program.climate_focus && program.climate_focus.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-base-content/60 mb-2">Climate Focus Areas</p>
                        <div className="flex flex-wrap gap-1">
                          {program.climate_focus.slice(0, 5).map((focus, index) => (
                            <span key={index} className="px-2 py-1 bg-moss-green/10 text-moss-green text-xs rounded">
                              {focus}
                            </span>
                          ))}
                          {program.climate_focus.length > 5 && (
                            <span className="px-2 py-1 bg-base-200 text-xs rounded">
                              +{program.climate_focus.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {program.skills_taught && program.skills_taught.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm text-base-content/60 mb-2">Skills Taught</p>
                        <div className="flex flex-wrap gap-1">
                          {program.skills_taught.slice(0, 4).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-seafoam-blue/10 text-seafoam-blue text-xs rounded">
                              {skill}
                            </span>
                          ))}
                          {program.skills_taught.length > 4 && (
                            <span className="px-2 py-1 bg-base-200 text-xs rounded">
                              +{program.skills_taught.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-base-content/60">
                      Created: {new Date(program.created_at).toLocaleDateString()} • 
                      {program.start_date && ` Starts: ${new Date(program.start_date).toLocaleDateString()}`}
                      {program.end_date && ` • Ends: ${new Date(program.end_date).toLocaleDateString()}`}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <ACTButton 
                      variant="primary" 
                      size="sm"
                      href={`/admin/education-programs/${program.id}`}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </ACTButton>
                    <ACTButton variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </ACTButton>
                    <ACTButton variant="ghost" size="sm" href={`/admin/partners/${program.partner_id}`}>
                      <Building className="h-4 w-4 mr-2" />
                      Provider
                    </ACTButton>
                  </div>
                </div>
              </ACTCard>
            ))}
          </div>
        ) : (
          <ACTCard variant="outlined" className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-base-content/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-midnight-forest mb-2">
              No Education Programs Found
            </h3>
            <p className="text-base-content/70 mb-4">
              Start by adding your first educational program
            </p>
            <ACTButton variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add First Program
            </ACTButton>
          </ACTCard>
        )}
      </section>

      {/* Quick Actions */}
      <section className="flex justify-center gap-4">
        <ACTButton variant="primary" size="lg">
          <Plus className="h-5 w-5 mr-2" />
          Add New Program
        </ACTButton>
        <ACTButton variant="secondary" size="lg" href="/admin/partners">
          <Building className="h-5 w-5 mr-2" />
          Manage Providers
        </ACTButton>
        <ACTButton variant="outline" size="lg" href="/admin/dashboard">
          Back to Dashboard
        </ACTButton>
      </section>
    </div>
  )
} 