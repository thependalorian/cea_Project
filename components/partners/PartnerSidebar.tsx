/**
 * Partner Sidebar - Climate Economy Assistant  
 * Navigation sidebar for partner interface with resource management
 * Location: components/partners/PartnerSidebar.tsx
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Briefcase, 
  GraduationCap, 
  BookOpen, 
  Settings, 
  Building2,
  FileText,
  BarChart3,
  Users,
  CheckCircle,
  Clock,
  Globe,
  Phone,
  Mail,
  HelpCircle,
  Plus
} from 'lucide-react'

interface PartnerSidebarProps {
  profile: {
    id: string;
    organization_name: string;
    organization_type: string;
    verified: boolean;
    status: string;
    total_jobs_posted: number;
    total_programs_created: number;
    total_resources_shared: number;
  };
}

type NavigationItem = {
  href: string;
  icon: any;
  label: string;
  show: boolean;
  count?: number;
};

export function PartnerSidebar({ profile }: PartnerSidebarProps) {
  const pathname = usePathname();

  const navigationSections: { title: string; items: NavigationItem[] }[] = [
    {
      title: 'Dashboard',
      items: [
        { 
          href: '/partners',
          icon: LayoutDashboard, 
          label: 'Overview',
          show: true
        },
      ]
    },
    {
      title: 'Resource Management',
      items: [
        { 
          href: '/partners/jobs',
          icon: Briefcase,
          label: 'Job Listings',
          show: true,
          count: profile.total_jobs_posted
        },
        { 
          href: '/partners/education',
          icon: GraduationCap, 
          label: 'Education Programs',
          show: true,
          count: profile.total_programs_created
        },
        { 
          href: '/partners/knowledge',
          icon: BookOpen, 
          label: 'Knowledge Resources',
          show: true,
          count: profile.total_resources_shared
        },
      ]
    },
    {
      title: 'Analytics & Insights',
      items: [
        { 
          href: '/partners/analytics',
          icon: BarChart3,
          label: 'Performance Analytics',
          show: profile.verified
        },
        { 
          href: '/partners/applications',
          icon: Users, 
          label: 'Job Applications',
          show: profile.verified
        },
      ]
    },
    {
      title: 'Organization',
      items: [
        { 
          href: '/partners/profile',
          icon: Building2,
          label: 'Organization Profile',
          show: true
        },
        { 
          href: '/partners/settings',
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
          href: '/partners/help',
          icon: HelpCircle, 
          label: 'Help & Documentation',
          show: true
        },
      ]
    },
  ];

  const getOrganizationTypeColor = (type: string) => {
    switch (type) {
      case 'employer': return 'text-spring-green'
      case 'educational_institution': return 'text-seafoam-blue'
      case 'nonprofit': return 'text-moss-green'
      case 'government_agency': return 'text-midnight-forest'
      default: return 'text-spring-green'
    }
  }

  const getOrganizationTypeLabel = (type: string) => {
    switch (type) {
      case 'employer': return 'Employer'
      case 'educational_institution': return 'Educational Institution'
      case 'nonprofit': return 'Nonprofit Organization'
      case 'government_agency': return 'Government Agency'
      default: return 'Organization'
    }
  }

  return (
    <div className="w-64 bg-white border-r border-sand-gray/20 min-h-screen">
      <div className="p-6">
        {/* Organization Summary */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-spring-green to-seafoam-blue rounded-xl flex items-center justify-center">
              <span className="text-white font-helvetica font-bold text-sm">
                {profile.organization_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-helvetica font-medium text-midnight-forest text-sm">
                {profile.organization_name}
              </h3>
              <p className="text-xs text-midnight-forest/60 font-helvetica">
                {getOrganizationTypeLabel(profile.organization_type)}
              </p>
            </div>
          </div>
          
          {/* Verification Status Badge */}
          <div className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-xs font-helvetica font-medium",
            profile.verified 
              ? "bg-green-100 text-green-800" 
              : "bg-amber-100 text-amber-800"
          )}>
            {profile.verified ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified Partner
              </>
            ) : (
              <>
                <Clock className="w-3 h-3 mr-1" />
                Pending Verification
              </>
            )}
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
                        
                        {/* Show count badge if available */}
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
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="mt-8 p-4 bg-gradient-to-br from-sand-gray/10 to-spring-green/5 rounded-xl border border-sand-gray/20">
          <h4 className="text-xs font-helvetica font-semibold text-midnight-forest/70 uppercase tracking-wider mb-3">
            Quick Actions
          </h4>
          <div className="space-y-2">
            <Link
              href="/partners/jobs/new"
              className="flex items-center space-x-2 text-xs text-midnight-forest/70 hover:text-spring-green transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span className="font-helvetica">Post New Job</span>
            </Link>
            <Link
              href="/partners/education/new"
              className="flex items-center space-x-2 text-xs text-midnight-forest/70 hover:text-spring-green transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span className="font-helvetica">Add Program</span>
            </Link>
            <Link
              href="/partners/knowledge/new"
              className="flex items-center space-x-2 text-xs text-midnight-forest/70 hover:text-spring-green transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span className="font-helvetica">Share Resource</span>
            </Link>
          </div>
        </div>

        {/* Resource Stats */}
        <div className="mt-6 p-4 bg-gradient-to-br from-spring-green/5 to-seafoam-blue/5 rounded-xl border border-sand-gray/20">
          <h4 className="text-xs font-helvetica font-semibold text-midnight-forest/70 uppercase tracking-wider mb-3">
            Your Contributions
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-midnight-forest/60 font-helvetica">Jobs Posted</span>
              <span className="text-xs font-helvetica font-medium text-midnight-forest">
                {profile.total_jobs_posted}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-midnight-forest/60 font-helvetica">Programs Created</span>
              <span className="text-xs font-helvetica font-medium text-midnight-forest">
                {profile.total_programs_created}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-midnight-forest/60 font-helvetica">Resources Shared</span>
              <span className="text-xs font-helvetica font-medium text-midnight-forest">
                {profile.total_resources_shared}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PartnerSidebar; 