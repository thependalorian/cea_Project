'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  UserPlus, 
  Building2, 
  Briefcase, 
  FileText, 
  Shield, 
  Database,
  BarChart3,
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

interface AdminQuickActionsProps {
  accessLevel: 'standard' | 'super' | 'system'
}

export default function AdminQuickActions({ accessLevel }: AdminQuickActionsProps) {
  const actions = [
    // Standard Admin Actions
    {
      title: 'Add Partner',
      description: 'Register new climate organization',
      icon: Building2,
      href: '/admin/partners/new',
      accessLevel: ['standard', 'super', 'system'],
      urgent: false
    },
    {
      title: 'Approve Jobs',
      description: 'Review pending job listings',
      icon: Briefcase,
      href: '/admin/jobs?status=pending',
      accessLevel: ['standard', 'super', 'system'],
      urgent: true
    },
    {
      title: 'Moderate Content',
      description: 'Review flagged resources',
      icon: FileText,
      href: '/admin/resources?status=flagged',
      accessLevel: ['standard', 'super', 'system'],
      urgent: true
    },
    
    // Super Admin Actions
    {
      title: 'User Management',
      description: 'Manage user accounts',
      icon: UserPlus,
      href: '/admin/users',
      accessLevel: ['super', 'system'],
      urgent: false
    },
    {
      title: 'Admin Resources',
      description: 'Manage admin-only content',
      icon: Shield,
      href: '/admin/admin-resources',
      accessLevel: ['super', 'system'],
      urgent: false
    },
    {
      title: 'System Analytics',
      description: 'View platform analytics',
      icon: BarChart3,
      href: '/admin/analytics',
      accessLevel: ['super', 'system'],
      urgent: false
    },
    
    // System Admin Actions
    {
      title: 'Database Management',
      description: 'Manage database operations',
      icon: Database,
      href: '/admin/database',
      accessLevel: ['system'],
      urgent: false
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings',
      icon: Settings,
      href: '/admin/settings',
      accessLevel: ['system'],
      urgent: false
    }
  ]

  const filteredActions = actions.filter(action => 
    action.accessLevel.includes(accessLevel)
  )

  const urgentActions = filteredActions.filter(action => action.urgent)
  const regularActions = filteredActions.filter(action => !action.urgent)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Urgent Actions */}
        {urgentActions.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-500">Requires Attention</span>
            </div>
            <div className="space-y-2">
              {urgentActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link key={index} href={action.href}>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start h-auto p-3 border-orange-200 hover:border-orange-300"
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {action.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Actions */}
        {regularActions.length > 0 && (
          <div>
            {urgentActions.length > 0 && (
              <>
                <div className="flex items-center space-x-2 mb-2 mt-4">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-muted-foreground">General Actions</span>
                </div>
              </>
            )}
            <div className="space-y-2">
              {regularActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <Link key={index} href={action.href}>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start h-auto p-3"
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="text-left">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {action.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Access Level Indicator */}
        <div className="pt-4 border-t">
          <div className="text-xs text-muted-foreground text-center">
            Showing actions for <span className="font-semibold capitalize">{accessLevel}</span> access level
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 