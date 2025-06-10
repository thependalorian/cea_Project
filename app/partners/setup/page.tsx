/**
 * Partner Setup Page - Climate Economy Assistant
 * Setup and profile completion page for partner organizations
 * Location: app/partners/setup/page.tsx
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ACTCard, ACTButton, ACTFrameElement } from '@/components/ui'
import { 
  Building, 
  CheckCircle, 
  Clock, 
  Mail, 
  Phone, 
  Globe, 
  MapPin,
  Users,
  Briefcase,
  BookOpen,
  Shield,
  Star,
  Target
} from 'lucide-react'

export default async function PartnerSetupPage() {
  const supabase = await createClient()
  
  // Get current user and check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get partner profile
  const { data: partnerProfile, error: partnerError } = await supabase
    .from('partner_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (partnerError || !partnerProfile) {
    redirect('/dashboard')  // Redirect if not a partner
  }

  // If profile is already completed and verified, redirect to dashboard
  if (partnerProfile.profile_completed && partnerProfile.verified) {
    redirect('/partners/dashboard')
  }

  const setupSteps = [
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Organization details and contact information',
      icon: Building,
      completed: !!(partnerProfile.organization_name && partnerProfile.organization_type),
      fields: ['Organization Name', 'Organization Type', 'Contact Email', 'Phone Number']
    },
    {
      id: 'location',
      title: 'Location & Reach',
      description: 'Geographic presence and operational areas',
      icon: MapPin,
      completed: !!(partnerProfile.headquarters_location && partnerProfile.operating_regions),
      fields: ['Headquarters Location', 'Operating Regions', 'Remote Work Policy']
    },
    {
      id: 'climate-focus',
      title: 'Climate Focus Areas',
      description: 'Your organization\'s climate and sustainability priorities',
      icon: Target,
      completed: !!(partnerProfile.climate_focus && partnerProfile.climate_focus.length > 0),
      fields: ['Primary Focus Areas', 'Secondary Areas', 'Impact Goals']
    },
    {
      id: 'offerings',
      title: 'Job & Education Offerings',
      description: 'Types of opportunities you provide',
      icon: Briefcase,
      completed: !!(partnerProfile.job_types_offered || partnerProfile.education_programs_offered),
      fields: ['Job Types', 'Education Programs', 'Partnership Benefits']
    },
    {
      id: 'verification',
      title: 'Verification',
      description: 'Submit for admin review and verification',
      icon: Shield,
      completed: partnerProfile.verification_submitted,
      fields: ['Legal Documentation', 'Climate Credentials', 'Partnership Agreement']
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
              <h1 className="text-3xl font-bold text-foreground">Partner Setup</h1>
              <p className="text-muted-foreground mt-2">
                Complete your partner profile to start posting jobs and education programs
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Setup Progress</div>
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
                        href={`/partners/setup/${step.id}`}
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
          <h3 className="text-xl font-bold mb-2">Complete Your Setup</h3>
          <p className="text-muted-foreground mb-4">
            Unlock the full potential of our climate economy platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <span>Post unlimited job listings</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Create education programs</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Access qualified candidates</span>
            </div>
          </div>
        </ACTCard>

        {/* Support */}
        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Need help with setup? 
            <ACTButton variant="ghost" size="sm" href="/partners/support">
              Contact our partner support team
            </ACTButton>
          </p>
        </div>
      </div>
    </div>
  )
} 