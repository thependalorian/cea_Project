/**
 * Profile Page Component - ACT Brand Compliant
 * Purpose: User profile management implementing ACT brand guidelines
 * Location: /app/profile/page.tsx
 * 
 * Brand Compliance:
 * - Uses ACT navigation component
 * - Implements proper typography hierarchy
 * - Follows ACT spacing system (base units)
 * - Uses exact color palette
 * - Responsive design with mobile-first approach
 * - Accessibility compliant
 */

import dynamic from 'next/dynamic'
import Navigation from '@/components/shared/Navigation'
import { BrandFrame } from '@/components/brand/BrandFrame'
import createClient from '@/lib/supabase/server'
import { JobSeekerProfileForm } from '@/components/profile/JobSeekerProfileForm'

const AdminProfileForm = dynamic(() => import('@/components/profile/AdminProfileForm').then(mod => ({ default: mod.AdminProfileForm })), { ssr: false })
const PartnerProfileForm = dynamic(() => import('@/components/profile/PartnerProfileForm').then(mod => ({ default: mod.PartnerProfileForm })), { ssr: false })

export const metadata = {
  title: 'Profile - Alliance for Climate Transition',
  description: 'Manage your climate career profile, preferences, and goals',
}

// SSR function to get user type
async function getUserType() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { userType: null, userId: null }
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()
  return { userType: profile?.user_type || 'job_seeker', userId: user.id }
}

export default async function ProfilePage() {
  const { userType, userId } = await getUserType()
  
  return (
    <div className="min-h-screen bg-white">
      {/* ACT Brand Navigation */}
      <Navigation />
      
      {/* Page Header */}
      <section className="act-section bg-sand-gray-10">
        <div className="act-content">
          <div className="text-center animate-on-scroll">
            <h1 className="act-h1 mb-act-1">
              Your Profile
            </h1>
            <p className="act-body-large text-moss-green max-w-2xl mx-auto">
              Manage your climate career profile, set your preferences, and track your progress 
              in the clean energy transition.
            </p>
          </div>
        </div>
      </section>

      {/* Profile Form Section */}
      <section className="act-section">
        <div className="act-content">
          <div className="max-w-4xl mx-auto animate-on-scroll">
            <BrandFrame size="lg" color="seafoam-blue" className="p-act-2">
              {/* Profile Type Header */}
              <div className="mb-act-2">
                <div className="flex items-center gap-act-1 mb-act-1">
                  <div className="w-3 h-3 bg-spring-green rounded-full" aria-hidden="true" />
                  <span className="act-caption text-moss-green uppercase tracking-wider">
                    {userType === 'admin' ? 'Administrator Profile' : 
                     userType === 'partner' ? 'Partner Organization Profile' : 
                     'Job Seeker Profile'}
                  </span>
                </div>
                <h2 className="act-h3">
                  {userType === 'admin' ? 'Platform Administration Settings' : 
                   userType === 'partner' ? 'Organization Information & Services' : 
                   'Career Goals & Experience'}
                </h2>
              </div>

              {/* Render the correct form based on user type */}
              <div className="bg-white rounded-act p-act-2 border border-sand-gray">
                {userType === 'admin' && <AdminProfileForm />}
                {userType === 'partner' && <PartnerProfileForm />}
                {(!userType || userType === 'user') && <JobSeekerProfileForm userId={userId || ''} />}
              </div>
            </BrandFrame>
          </div>
        </div>
      </section>

      {/* Profile Tips Section */}
      {(!userType || userType === 'job_seeker') && (
        <section className="act-section bg-gradient-seafoam">
          <div className="act-content">
            <div className="max-w-4xl mx-auto animate-on-scroll">
              <h2 className="act-h2 mb-act-2 text-center">
                Profile Tips for Better Matches
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-act-2">
                <div className="act-card">
                  <h3 className="act-h4 mb-act-1 flex items-center gap-act-0.5">
                    <span className="text-spring-green">✓</span>
                    Complete Your Experience
                  </h3>
                  <p className="act-body-small text-moss-green">
                    Include all relevant work experience, even if it's not directly climate-related. 
                    Our AI can identify transferable skills.
                  </p>
                </div>
                <div className="act-card">
                  <h3 className="act-h4 mb-act-1 flex items-center gap-act-0.5">
                    <span className="text-spring-green">✓</span>
                    Set Clear Goals
                  </h3>
                  <p className="act-body-small text-moss-green">
                    Be specific about your ideal role, industry focus, and geographic preferences 
                    for more targeted recommendations.
                  </p>
                </div>
                <div className="act-card">
                  <h3 className="act-h4 mb-act-1 flex items-center gap-act-0.5">
                    <span className="text-spring-green">✓</span>
                    Update Regularly
                  </h3>
                  <p className="act-body-small text-moss-green">
                    Keep your profile current as your skills and goals evolve. This helps our 
                    AI provide increasingly relevant guidance.
                  </p>
                </div>
                <div className="act-card">
                  <h3 className="act-h4 mb-act-1 flex items-center gap-act-0.5">
                    <span className="text-spring-green">✓</span>
                    Enable Notifications
                  </h3>
                  <p className="act-body-small text-moss-green">
                    Stay informed about new opportunities, training programs, and resources 
                    that match your profile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="act-section">
        <div className="act-content">
          <div className="text-center mb-act-2 animate-on-scroll">
            <h2 className="act-h2 mb-act-1">
              What's Next?
            </h2>
            <p className="act-body text-moss-green">
              Take advantage of these features to accelerate your climate career journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-act-2 animate-on-scroll">
            <div className="act-card text-center hover:shadow-act-card-hover transition-all duration-300">
              <div className="text-4xl mb-act-1" aria-hidden="true">🤖</div>
              <h3 className="act-h4 mb-act-1">Chat with Assistants</h3>
              <p className="act-body-small text-moss-green mb-act-1">
                Get personalized guidance from our specialized AI career assistants.
              </p>
              <a href="/chat" className="act-btn act-btn-primary act-btn-small">
                Start Chat
              </a>
            </div>
            
            <div className="act-card text-center hover:shadow-act-card-hover transition-all duration-300">
              <div className="text-4xl mb-act-1" aria-hidden="true">📄</div>
              <h3 className="act-h4 mb-act-1">Upload Resume</h3>
              <p className="act-body-small text-moss-green mb-act-1">
                Get AI-powered analysis and suggestions for your resume.
              </p>
              <a href="/dashboard/resume" className="act-btn act-btn-secondary act-btn-small">
                Upload Resume
              </a>
            </div>
            
            <div className="act-card text-center hover:shadow-act-card-hover transition-all duration-300">
              <div className="text-4xl mb-act-1" aria-hidden="true">📚</div>
              <h3 className="act-h4 mb-act-1">Explore Resources</h3>
              <p className="act-body-small text-moss-green mb-act-1">
                Browse training programs and funding opportunities.
              </p>
              <a href="/resources" className="act-btn act-btn-secondary act-btn-small">
                View Resources
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 