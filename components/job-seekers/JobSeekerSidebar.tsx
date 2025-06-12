/**
 * Job Seeker Sidebar - Climate Economy Assistant  
 * Navigation sidebar for job seeker interface with profile and career management
 * Location: components/job-seekers/JobSeekerSidebar.tsx
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  User, 
  Briefcase, 
  BookOpen, 
  Settings, 
  FileText,
  Search,
  Heart,
  TrendingUp,
  GraduationCap,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Zap,
  HelpCircle,
  Bell,
  Award
} from 'lucide-react'

interface JobSeekerSidebarProps {
  profile: {
    id: string;
    full_name: string | null;
    current_title: string | null;
    experience_level: string | null;
    location: string | null;
    profile_completed: boolean;
    status: string;
    total_applications: number;
    saved_jobs_count: number;
    has_resume: boolean;
    climate_focus_areas: any[];
    desired_roles: any[];
  };
}

type NavigationItem = {
  href: string;
  icon: any;
  label: string;
  show: boolean;
  count?: number;
  badge?: string;
};

export function JobSeekerSidebar({ profile }: JobSeekerSidebarProps) {
  const pathname = usePathname();

  const navigationSections: { title: string; items: NavigationItem[] }[] = [
    {
      title: 'Dashboard',
      items: [
        { 
          href: '/job-seekers',
          icon: LayoutDashboard, 
          label: 'Overview',
          show: true
        },
      ]
    },
    {
      title: 'Profile & Career',
      items: [
        { 
          href: '/job-seekers/profile',
          icon: User,
          label: 'My Profile',
          show: true,
          badge: profile.profile_completed ? undefined : 'Incomplete'
        },
        { 
          href: '/job-seekers/resume',
          icon: FileText, 
          label: 'Resume Management',
          show: true,
          badge: profile.has_resume ? undefined : 'Upload'
        },
        { 
          href: '/job-seekers/career-assessment',
          icon: TrendingUp,
          label: 'Career Assessment',
          show: true
        },
        { 
          href: '/job-seekers/skills',
          icon: Award, 
          label: 'Skills & Certifications',
          show: true
        },
      ]
    },
    {
      title: 'Job Search',
      items: [
        { 
          href: '/job-seekers/search',
          icon: Search,
          label: 'Browse Jobs',
          show: true
        },
        { 
          href: '/job-seekers/saved',
          icon: Heart,
          label: 'Saved Jobs',
          show: true,
          count: profile.saved_jobs_count
        },
        { 
          href: '/job-seekers/applications',
          icon: Briefcase, 
          label: 'My Applications',
          show: true,
          count: profile.total_applications
        },
        { 
          href: '/job-seekers/recommendations',
          icon: Zap,
          label: 'Job Recommendations',
          show: profile.profile_completed
        },
      ]
    },
    {
      title: 'Learning & Development',
      items: [
        { 
          href: '/job-seekers/education',
          icon: GraduationCap,
          label: 'Education Programs',
          show: true
        },
        { 
          href: '/job-seekers/resources',
          icon: BookOpen, 
          label: 'Career Resources',
          show: true
        },
      ]
    },
    {
      title: 'Account',
      items: [
        { 
          href: '/job-seekers/notifications',
          icon: Bell,
          label: 'Notifications',
          show: true
        },
        { 
          href: '/job-seekers/settings',
          icon: Settings, 
          label: 'Account Settings',
          show: true
        },
      ]
    },
    {
      title: 'Support',
      items: [
        { 
          href: '/job-seekers/help',
          icon: HelpCircle, 
          label: 'Help & Support',
          show: true
        },
      ]
    },
  ];

  const getExperienceLevelColor = (level: string | null) => {
    switch (level) {
      case 'entry': return 'text-spring-green'
      case 'mid': return 'text-seafoam-blue'
      case 'senior': return 'text-moss-green'
      case 'executive': return 'text-midnight-forest'
      default: return 'text-spring-green'
    }
  }

  const getExperienceLevelLabel = (level: string | null) => {
    switch (level) {
      case 'entry': return 'Entry Level'
      case 'mid': return 'Mid Level'
      case 'senior': return 'Senior Level'
      case 'executive': return 'Executive'
      default: return 'Career Explorer'
    }
  }

  const getProfileCompletionScore = () => {
    let score = 0;
    if (profile.full_name) score += 20;
    if (profile.current_title) score += 20;
    if (profile.location) score += 15;
    if (profile.has_resume) score += 25;
    if (profile.climate_focus_areas?.length > 0) score += 10;
    if (profile.desired_roles?.length > 0) score += 10;
    return score;
  }

  const completionScore = getProfileCompletionScore();

  return (
    <div className="w-64 bg-white border-r border-sand-gray/20 min-h-screen">
      <div className="p-6">
        {/* Profile Summary */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-spring-green to-seafoam-blue rounded-xl flex items-center justify-center">
              {profile.full_name ? (
                <span className="text-white font-helvetica font-bold text-sm">
                  {profile.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-helvetica font-medium text-midnight-forest text-sm">
                {profile.full_name || 'Climate Job Seeker'}
              </h3>
              <p className="text-xs text-midnight-forest/60 font-helvetica">
                {profile.current_title || getExperienceLevelLabel(profile.experience_level)}
              </p>
            </div>
          </div>
          
          {/* Location and Status */}
          <div className="space-y-2 mb-4">
            {profile.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3 text-midnight-forest/40" />
                <span className="text-xs text-midnight-forest/60 font-helvetica">
                  {profile.location}
                </span>
              </div>
            )}
            
            {/* Profile Status Badge */}
            <div className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-helvetica font-medium",
              profile.profile_completed 
                ? "bg-green-100 text-green-800" 
                : "bg-amber-100 text-amber-800"
            )}>
              {profile.profile_completed ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Profile Complete
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Setup Required
                </>
              )}
            </div>
          </div>

          {/* Profile Completion Progress */}
          <div className="p-3 bg-gradient-to-br from-sand-gray/10 to-spring-green/5 rounded-xl border border-sand-gray/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-helvetica font-medium text-midnight-forest/70">
                Profile Strength
              </span>
              <span className="text-xs font-helvetica font-bold text-midnight-forest">
                {completionScore}%
              </span>
            </div>
            <div className="w-full bg-sand-gray/20 rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-spring-green to-seafoam-blue h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionScore}%` }}
              ></div>
            </div>
            <p className="text-xs text-midnight-forest/60 font-helvetica">
              {completionScore < 80 ? 'Complete your profile to unlock more opportunities' : 'Great profile! Ready for job matching'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-6">
          {navigationSections.map((section) => {
            const visibleItems = section.items.filter(item => item.show);
            if (visibleItems.length === 0) return null;
            
            return (
              <div key={section.title}>
                <h4 className="text-xs font-helvetica font-semibold text-midnight-forest/70 uppercase tracking-wider mb-3">
                  {section.title}
                </h4>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-helvetica font-medium transition-all duration-200 group',
                          isActive
                            ? 'bg-spring-green text-white shadow-md'
                            : 'text-midnight-forest/70 hover:text-midnight-forest hover:bg-sand-gray/30'
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={cn(
                            "w-4 h-4 transition-colors",
                            isActive ? "text-white" : "text-midnight-forest/50 group-hover:text-midnight-forest"
                          )} />
                          <span>{item.label}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Count badge */}
                          {item.count && item.count > 0 && (
                            <span className={cn(
                              "px-2 py-0.5 text-xs rounded-full font-helvetica font-medium",
                              isActive 
                                ? "bg-white/20 text-white" 
                                : "bg-spring-green/10 text-spring-green"
                            )}>
                              {item.count}
                            </span>
                          )}
                          
                          {/* Status badge */}
                          {item.badge && (
                            <span className={cn(
                              "px-2 py-0.5 text-xs rounded-full font-helvetica font-medium",
                              isActive 
                                ? "bg-white/20 text-white" 
                                : item.badge === 'Incomplete' || item.badge === 'Upload'
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-spring-green/10 text-spring-green"
                            )}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Activity Stats */}
        <div className="mt-8 p-4 bg-gradient-to-br from-spring-green/5 to-seafoam-blue/5 rounded-xl border border-sand-gray/20">
          <h4 className="text-xs font-helvetica font-semibold text-midnight-forest/70 uppercase tracking-wider mb-3">
            Your Activity
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-midnight-forest/60 font-helvetica">Applications</span>
              <span className="text-xs font-helvetica font-medium text-midnight-forest">
                {profile.total_applications}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-midnight-forest/60 font-helvetica">Saved Jobs</span>
              <span className="text-xs font-helvetica font-medium text-midnight-forest">
                {profile.saved_jobs_count}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-midnight-forest/60 font-helvetica">Climate Focus</span>
              <span className="text-xs font-helvetica font-medium text-midnight-forest">
                {profile.climate_focus_areas?.length || 0} areas
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobSeekerSidebar; 