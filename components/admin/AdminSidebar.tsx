'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Briefcase, 
  BookOpen, 
  FileText, 
  BarChart3, 
  Settings, 
  Shield, 
  Database,
  UserCheck,
  TrendingUp,
  Globe,
  Star,
  Bug,
  MessageSquare,
  CheckCircle,
  FolderOpen,
  Search,
  Activity,
  GraduationCap,
  Settings2
} from 'lucide-react'

interface AdminSidebarProps {
  profile: {
    access_level: 'standard' | 'super' | 'system';
    department: string | null;
    status: string;
  };
}

export default function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Determine available navigation items based on access level
  const shouldShowAdvancedFeatures = profile.access_level === 'super' || profile.access_level === 'system';
  const shouldShowSystemFeatures = profile.access_level === 'system';

  const navigationSections = [
    {
      title: 'Dashboard',
      items: [
        { 
      href: '/admin/dashboard',
          icon: BarChart3, 
          label: 'Overview',
          show: true
        },
      ]
    },
    {
      title: 'User Management',
      items: [
        { 
      href: '/admin/users',
      icon: Users,
          label: 'All Users',
          show: true 
        },
        { 
          href: '/admin/reviews', 
          icon: MessageSquare, 
          label: 'Reviews & Feedback',
          show: true 
        },
      ]
    },
    {
      title: 'Partner Management', 
      items: [
        { 
      href: '/admin/partners',
          icon: Briefcase, 
          label: 'All Partners',
          show: true
        },
        { 
          href: '/admin/partner-verification', 
          icon: CheckCircle, 
          label: 'Verification Queue',
          show: shouldShowAdvancedFeatures
        },
        { 
          href: '/admin/partner-resources', 
          icon: FolderOpen, 
          label: 'Partner Resources',
          show: shouldShowAdvancedFeatures
        },
      ]
    },
    {
      title: 'Content Management',
      items: [
        { 
      href: '/admin/jobs',
          icon: Search, 
          label: 'Job Listings',
          show: true
    },
    {
          href: '/admin/job-moderation', 
          icon: Shield, 
          label: 'Job Moderation',
          show: shouldShowAdvancedFeatures
    },
    {
          href: '/admin/admin-resources', 
      icon: FileText,
          label: 'Admin Resources',
          show: shouldShowAdvancedFeatures
        },
      ]
    },
    {
      title: 'Analytics & Reports',
      items: [
        { 
          href: '/admin/reports', 
          icon: TrendingUp, 
          label: 'Reports',
          show: true
        },
        { 
          href: '/admin/system-analytics', 
          icon: Activity, 
          label: 'System Analytics',
          show: shouldShowSystemFeatures
        },
      ]
    },
    {
      title: 'Education',
      items: [
        { 
          href: '/admin/education-programs', 
          icon: GraduationCap, 
          label: 'Programs',
          show: true
    },
    {
          href: '/admin/education-settings', 
          icon: Settings2, 
          label: 'Education Settings',
          show: shouldShowAdvancedFeatures
        },
      ]
    },
    {
      title: 'System',
      items: [
        { 
          href: '/admin/settings', 
          icon: Settings, 
          label: 'System Settings',
          show: shouldShowSystemFeatures
        },
        { 
      href: '/admin/database',
      icon: Database,
          label: 'Database Tools',
          show: shouldShowSystemFeatures
    },
    {
          href: '/admin/debug', 
          icon: Bug, 
          label: 'Debug Tools',
          show: shouldShowSystemFeatures
        },
      ]
    },
  ];

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen">
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-lg font-semibold">Admin Panel</h2>
          <p className="text-sm text-muted-foreground capitalize">
            {profile.access_level} • {profile.department}
          </p>
        </div>

        <nav className="space-y-2">
          {navigationSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold mb-2">{section.title}</h3>
              {section.items.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
                if (item.show) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
              </Link>
            );
                }
          })}
            </div>
          ))}
        </nav>

        {/* Access Level Indicator */}
        <div className="mt-8 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Access Level
              </p>
              <p className="text-sm font-semibold capitalize">
                {profile.access_level}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 