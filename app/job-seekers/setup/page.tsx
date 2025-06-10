/**
 * Job Seeker Setup Page - Climate Economy Assistant
 * Setup and profile completion page for job seekers
 * Location: app/job-seekers/setup/page.tsx
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ACTCard, ACTButton, ACTFrameElement } from '@/components/ui'
import { 
  User, 
  CheckCircle, 
  Clock, 
  Mail, 
  Phone, 
  MapPin,
  Briefcase,
  BookOpen,
  Target,
  Star,
  FileText,
  TrendingUp,
  Brain
} from 'lucide-react'

export default async function JobSeekerSetupPage() {
  const supabase = await createClient()
  
  // Get current user and check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get job seeker profile
  const { data: jobSeekerProfile, error: profileError } = await supabase
    .from('job_seeker_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (profileError || !jobSeekerProfile) {
    redirect('/dashboard')  // Redirect if not a job seeker
  }

  // If profile is already completed, redirect to dashboard
  if (jobSeekerProfile.profile_completed) {
    redirect('/job-seekers')
  }

  const setupSteps = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Personal details and contact information',
      icon: User,
      completed: !!(jobSeekerProfile.full_name && jobSeekerProfile.email),
      fields: ['Full Name', 'Email Address', 'Phone Number', 'Location']
    },
    {
      id: 'experience',
      title: 'Experience & Background',
      description: 'Your professional experience and current role',
      icon: Briefcase,
      completed: !!(jobSeekerProfile.current_title && jobSeekerProfile.experience_level),
      fields: ['Current Title', 'Experience Level', 'Work History', 'Industry Background']
    },
    {
      id: 'skills',
      title: 'Skills & Expertise',
      description: 'Technical skills and areas of expertise',
      icon: Target,
      completed: !!(jobSeekerProfile.skills && jobSeekerProfile.skills.length > 0),
      fields: ['Technical Skills', 'Climate Knowledge', 'Certifications', 'Languages']
    },
    {
      id: 'preferences',
      title: 'Career Preferences',
      description: 'Job preferences and career goals',
      icon: TrendingUp,
      completed: !!(jobSeekerProfile.preferred_job_types && jobSeekerProfile.climate_experience_level),
      fields: ['Job Types', 'Climate Focus Areas', 'Salary Range', 'Work Location Preference']
    },
    {
      id: 'resume',
      title: 'Resume Upload',
      description: 'Upload your resume for AI analysis',
      icon: FileText,
      completed: !!(jobSeekerProfile.resume_content),
      fields: ['Resume File', 'AI Skills Analysis', 'Career Match Score', 'Recommendations']
    }
  ]

  const completedSteps = setupSteps.filter(step => step.completed).length
  const totalSteps = setupSteps.length
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Complete Your Profile</h1>
              <p className="text-muted-foreground mt-2">
                Set up your climate career profile to unlock personalized job recommendations
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Profile Progress</div>
              <div className="text-2xl font-bold text-primary">{progressPercentage}%</div>
              <div className="text-sm text-muted-foreground">{completedSteps} of {totalSteps} completed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Progress Bar */}
        <ACTCard variant="outlined" className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Setup Progress</h3>
            <span className="text-sm text-muted-foreground">{completedSteps}/{totalSteps} steps completed</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </ACTCard>

        {/* Setup Steps */}
        <div className="space-y-6">
          {setupSteps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <ACTCard 
                key={step.id}
                variant="outlined" 
                className={`p-6 ${step.completed ? 'border-green-200 bg-green-50/50' : 'hover:shadow-md transition-shadow'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${
                    step.completed 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      <IconComponent className="h-6 w-6" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {step.completed ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                            Completed
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-4">
                      {step.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      {step.fields.map((field, fieldIndex) => (
                        <div key={fieldIndex} className="flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${
                            step.completed ? 'bg-green-500' : 'bg-muted'
                          }`} />
                          <span className={step.completed ? 'text-foreground' : 'text-muted-foreground'}>
                            {field}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <ACTButton 
                        variant={step.completed ? "outline" : "primary"}
                        size="sm"
                        href={`/job-seekers/setup/${step.id}`}
                      >
                        {step.completed ? 'Edit' : 'Complete Step'}
                      </ACTButton>
                      {step.completed && (
                        <ACTButton variant="ghost" size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Completed
                        </ACTButton>
                      )}
                    </div>
                  </div>
                </div>
              </ACTCard>
            )
          })}
        </div>

        {/* Benefits of Completion */}
        <ACTCard variant="gradient" className="p-6 mt-8 text-center">
          <Star className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Unlock Your Climate Career</h3>
          <p className="text-muted-foreground mb-4">
            Complete your profile to access personalized job recommendations and career tools
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <span>AI-powered job matching</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <span>Access to exclusive climate jobs</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Personalized career guidance</span>
            </div>
          </div>
        </ACTCard>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Need help with your profile? 
            <ACTButton variant="ghost" size="sm" href="/support">
              Contact our support team
            </ACTButton>
          </p>
        </div>
      </div>
    </div>
  )
} 