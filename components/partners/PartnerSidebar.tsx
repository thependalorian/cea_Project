'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Briefcase, 
  BookOpen, 
  FileText, 
  Users, 
  BarChart3, 
  Settings, 
  Building2,
  Globe,
  Calendar,
  MessageSquare
} from 'lucide-react'

interface PartnerSidebarProps {
  partner: {
    id: string
    organization_name: string
    organization_type: string
    climate_focus: string[]
    status: string
    verified: boolean
    partnership_level: string
  }
}

export default function PartnerSidebar({ partner }: PartnerSidebarProps) {
  const pathname = usePathname()

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/partners/dashboard',
      icon: LayoutDashboard,
      description: 'Overview and metrics'
    },
    {
      title: 'Jobs Management',
      href: '/partners/jobs',
      icon: Briefcase,
      description: 'Post and manage job listings'
    },
    {
      title: 'Education Programs',
      href: '/partners/education',
      icon: BookOpen,
      description: 'Manage education offerings'
    },
    {
      title: 'Resources',
      href: '/partners/resources',
      icon: FileText,
      description: 'Share partner resources'
    },
    {
      title: 'Candidates',
      href: '/partners/candidates',
      icon: Users,
      description: 'View interested candidates'
    },
    {
      title: 'Analytics',
      href: '/partners/analytics',
      icon: BarChart3,
      description: 'Performance insights'
    },
    {
      title: 'Events',
      href: '/partners/events',
      icon: Calendar,
      description: 'Manage events and workshops'
    },
    {
      title: 'Messages',
      href: '/partners/messages',
      icon: MessageSquare,
      description: 'Communication center'
    },
    {
      title: 'Profile',
      href: '/partners/profile',
      icon: Building2,
      description: 'Organization settings'
    },
    {
      title: 'Settings',
      href: '/partners/settings',
      icon: Settings,
      description: 'Account preferences'
    }
  ]

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold">Partner Portal</h2>
          <p className="text-sm text-muted-foreground">
            {partner.organization_name}
          </p>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="h-5 w-5" />
                <div className="flex-1">
                  <div className="font-medium">{item.title}</div>
                  <div className={cn(
                    "text-xs opacity-0 group-hover:opacity-100 transition-opacity",
                    isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                  )}>
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Organization Info */}
        <div className="mt-8 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Organization Type
              </p>
              <p className="text-sm font-semibold capitalize">
                {partner.organization_type}
              </p>
            </div>
          </div>
          
          {/* Verification Status */}
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </p>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  partner.verified 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {partner.verified ? '✓ Verified' : 'Pending'}
                </span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded capitalize">
                  {partner.partnership_level}
                </span>
              </div>
            </div>
          </div>
          
          {partner.climate_focus && partner.climate_focus.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">
                Focus Areas
              </p>
              <div className="flex flex-wrap gap-1">
                {partner.climate_focus.slice(0, 3).map((area, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                  >
                    {area}
                  </span>
                ))}
                {partner.climate_focus.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{partner.climate_focus.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 