/**
 * Welcome message with brand guidelines
 * Purpose: Initial greeting following ACT's mission and values
 * Location: /components/conversation/WelcomeMessage.tsx
 */
import { BrandFrame } from '@/components/brand/BrandFrame'

interface WelcomeMessageProps {
  conversationType?: 'general' | 'resume_analysis' | 'job_search' | 'crisis_support'
}

export function WelcomeMessage({ conversationType = 'general' }: WelcomeMessageProps) {
  return (
    <div className="text-center py-12">
      <BrandFrame size="md" color="spring-green" className="max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-h1 font-title-medium text-[var(--midnight-forest)] mb-4">
              Welcome to Your Climate Career Journey
            </h2>
            <p className="text-body-large text-[var(--moss-green)] leading-relaxed">
              I'm here to help you navigate the clean energy transition with personalized 
              guidance from our team of specialists. Whether you're a veteran, international 
              professional, community organizer, or anyone seeking climate career opportunities, 
              we'll connect you with the right resources and support.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mt-8">
            <WelcomeCard
              title="Career Guidance"
              description="Get matched with climate jobs that fit your background and goals"
              icon="briefcase"
            />
            <WelcomeCard
              title="Resume Analysis"
              description="Optimize your resume for climate economy opportunities"
              icon="document"
            />
            <WelcomeCard
              title="Skills Translation"
              description="Translate military, international, or community experience"
              icon="translate"
            />
            <WelcomeCard
              title="Training & Resources"
              description="Find funding, programs, and pathways in Massachusetts"
              icon="academic-cap"
            />
          </div>
          
          <div className="pt-6">
            <p className="text-body-small text-[var(--moss-green)]">
              Start by telling me about your background, career goals, or any specific 
              questions you have about climate careers.
            </p>
          </div>
        </div>
      </BrandFrame>
    </div>
  )
}

// Welcome Card Component
interface WelcomeCardProps {
  title: string
  description: string
  icon: string
}

function WelcomeCard({ title, description, icon }: WelcomeCardProps) {
  return (
    <div className="bg-[var(--sand-gray)] rounded-lg p-4 hover:bg-[var(--spring-green-10)] transition-colors">
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 text-[var(--moss-green)] mt-1">
          {/* Icon placeholder */}
          <div className="w-8 h-8 bg-current rounded-full opacity-30"></div>
        </div>
        <div>
          <h3 className="text-body font-body-semibold text-[var(--midnight-forest)] mb-1">
            {title}
          </h3>
          <p className="text-body-small text-[var(--moss-green)]">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
} 