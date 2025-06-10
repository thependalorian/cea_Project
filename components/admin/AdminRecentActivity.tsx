'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Clock, User, Building2, Briefcase } from 'lucide-react'

interface AdminRecentActivityProps {
  activities: Record<string, unknown>[]
  adminProfile: {
    access_level: string
  }
}

export default function AdminRecentActivity({ activities, adminProfile }: AdminRecentActivityProps) {
  // Placeholder activities if none provided
  const placeholderActivities = [
    {
      action_type: 'user_registration',
      action_details: { user_name: 'Sarah Chen' },
      created_at: new Date().toISOString(),
      admin_profiles: { first_name: 'System', last_name: 'Auto' }
    },
    {
      action_type: 'partner_approval',
      action_details: { partner_name: 'CleanTech Solutions' },
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      admin_profiles: { first_name: 'John', last_name: 'Doe' }
    },
    {
      action_type: 'job_posting',
      action_details: { job_title: 'Solar Engineer' },
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      admin_profiles: { first_name: 'System', last_name: 'Auto' }
    }
  ]

  const displayActivities = activities.length > 0 ? activities : placeholderActivities

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case 'user_registration':
        return <User className="h-4 w-4 text-blue-500" />
      case 'partner_approval':
        return <Building2 className="h-4 w-4 text-green-500" />
      case 'job_posting':
        return <Briefcase className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActivityDescription = (activity: any) => {
    const details = activity.action_details as any;
    switch (activity.action_type) {
      case 'user_registration':
        return `New user registered: ${details?.user_name || 'Unknown'}`
      case 'partner_approval':
        return `Partner approved: ${details?.partner_name || 'Unknown'}`
      case 'job_posting':
        return `New job posted: ${details?.job_title || 'Unknown'}`
      case 'content_update':
        return `Content updated: ${details?.content_title || 'Unknown'}`
      case 'system_maintenance':
        return `System maintenance: ${details?.maintenance_type || 'Unknown'}`
      default:
        return activity.action_type || 'Unknown activity'
    }
  }

  const formatTime = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return time.toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayActivities.map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="mt-0.5">
                {getActivityIcon(activity.action_type as string)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {getActivityDescription(activity)}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    by {(activity.admin_profiles as any)?.first_name} {(activity.admin_profiles as any)?.last_name}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(activity.created_at as string)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {displayActivities.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Showing activities accessible to {adminProfile.access_level} level
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 