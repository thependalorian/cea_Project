/**
 * Admin Sidebar - Climate Economy Assistant  
 * Permission-based navigation sidebar for admin interface
 * Location: components/admin/AdminSidebar.tsx
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  CheckCircle,
  FolderOpen,
  Search,
  Activity,
  GraduationCap,
  Settings2,
  Bug,
  MessageSquare,
  HelpCircle
} from 'lucide-react'

interface AdminSidebarProps {
  profile: {
    id: string;
    full_name: string;
    access_level: 'standard' | 'super' | 'system';
    department: string | null;
    status: string;
    can_manage_users: boolean;
    can_manage_partners: boolean;
    can_manage_content: boolean;
    can_view_analytics: boolean;
    can_manage_system: boolean;
  };
}

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname();

  // Permission-based navigation visibility
  const canManageUsers = profile.can_manage_users || profile.can_manage_system;
  const canManagePartners = profile.can_manage_partners || profile.can_manage_system;
  const canManageContent = profile.can_manage_content || profile.can_manage_system;
  const canViewAnalytics = profile.can_view_analytics || profile.can_manage_system;
  const canManageSystem = profile.can_manage_system;

  const navigationSections = [
    {
      title: 'Dashboard',
      items: [
        { 
          href: '/admin',
          icon: LayoutDashboard, 
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
          show: canManageUsers
        },
        { 
          href: '/admin/reviews', 
          icon: MessageSquare, 
          label: 'Reviews & Feedback',
          show: canManageUsers
        },
      ]
    },
    {
      title: 'Partner Management', 
      items: [
        { 
          href: '/admin/partners',
          icon: Building2, 
          label: 'All Partners',
          show: canManagePartners
        },
        { 
          href: '/admin/partner-verification', 
          icon: CheckCircle, 
          label: 'Verification Queue',
          show: canManagePartners
        },
        { 
          href: '/admin/partner-resources', 
          icon: FolderOpen, 
          label: 'Partner Resources',
          show: canManagePartners
        },
      ]
    },
    {
      title: 'Content Management',
      items: [
        { 
          href: '/admin/jobs',
          icon: Briefcase, 
          label: 'Job Listings',
          show: canManageContent
        },
        {
          href: '/admin/job-moderation', 
          icon: Shield, 
          label: 'Job Moderation',
          show: canManageContent
        },
        {
          href: '/admin/education-programs', 
          icon: GraduationCap, 
          label: 'Education Programs',
          show: canManageContent
        },
        {
          href: '/admin/knowledge-resources', 
          icon: BookOpen,
          label: 'Knowledge Resources',
          show: canManageContent
        },
      ]
    },
    {
      title: 'Analytics & Reports',
      items: [
        { 
          href: '/admin/reports', 
          icon: TrendingUp, 
          label: 'Platform Reports',
          show: canViewAnalytics
        },
        { 
          href: '/admin/analytics', 
          icon: BarChart3, 
          label: 'Advanced Analytics',
          show: canViewAnalytics
        },
        { 
          href: '/admin/system-analytics', 
          icon: Activity, 
          label: 'System Analytics',
          show: canManageSystem
        },
      ]
    },
    {
      title: 'System Administration',
      items: [
        { 
          href: '/admin/settings', 
          icon: Settings, 
          label: 'System Settings',
          show: canManageSystem
        },
        { 
          href: '/admin/database',
          icon: Database,
          label: 'Database Tools',
          show: canManageSystem
        },
        {
          href: '/admin/debug', 
          icon: Bug, 
          label: 'Debug Tools',
          show: canManageSystem
        },
      ]
    },
    {
      title: 'Support',
      items: [
        { 
          href: '/admin/help', 
          icon: HelpCircle, 
          label: 'Help & Documentation',
          show: true
        },
      ]
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-sand-gray/20 min-h-screen">
      <div className="p-6">
        {/* Profile Summary */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-spring-green to-seafoam-blue rounded-xl flex items-center justify-center">
              <span className="text-white font-helvetica font-bold text-sm">
                {profile.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-helvetica font-medium text-midnight-forest text-sm">
                {profile.full_name}
              </h3>
              <p className="text-xs text-midnight-forest/60 font-helvetica">
                {profile.department || 'Administrator'}
              </p>
            </div>
          </div>
          
          {/* Access Level Badge */}
          <div className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-xs font-helvetica font-medium",
            profile.access_level === 'system' && "bg-spring-green/10 text-spring-green",
            profile.access_level === 'super' && "bg-seafoam-blue/10 text-seafoam-blue", 
            profile.access_level === 'standard' && "bg-moss-green/10 text-moss-green"
          )}>
            <Shield className="w-3 h-3 mr-1" />
            {profile.access_level === 'system' ? 'System Admin' : 
             profile.access_level === 'super' ? 'Super Admin' : 'Admin'}
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
                          'flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-helvetica font-medium transition-all duration-200 group',
                          isActive
                            ? 'bg-spring-green text-white shadow-md'
                            : 'text-midnight-forest/70 hover:text-midnight-forest hover:bg-sand-gray/30'
                        )}
                      >
                        <Icon className={cn(
                          "w-4 h-4 transition-colors",
                          isActive ? "text-white" : "text-midnight-forest/50 group-hover:text-midnight-forest"
                        )} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 p-4 bg-gradient-to-br from-sand-gray/10 to-spring-green/5 rounded-xl border border-sand-gray/20">
          <h4 className="text-xs font-helvetica font-semibold text-midnight-forest/70 uppercase tracking-wider mb-3">
            Quick Stats
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-midnight-forest/60 font-helvetica">Permission Level</span>
              <span className="text-xs font-helvetica font-medium text-midnight-forest capitalize">
                {profile.access_level}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-midnight-forest/60 font-helvetica">Status</span>
              <span className={cn(
                "text-xs font-helvetica font-medium",
                profile.status === 'active' ? "text-spring-green" : "text-amber-600"
              )}>
                {profile.status === 'active' ? 'Active' : 'Setup Required'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSidebar; 