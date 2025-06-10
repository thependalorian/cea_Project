/**
 * PartnerAnalytics Component
 * 
 * Purpose: Displays analytics and recent applications for partner dashboard
 * Location: /components/partners/PartnerAnalytics.tsx
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface Application {
  id: string
  created_at: string
  job_seekers?: {
    full_name?: string
  }
  jobs?: {
    title?: string
  }
}

interface PartnerAnalyticsProps {
  recentApplications: Application[]
  totalApplications: number
}

export default function PartnerAnalytics({ recentApplications, totalApplications }: PartnerAnalyticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Recent Applications</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalApplications}</div>
          <div className="text-sm text-muted-foreground">Total Applications</div>
        </div>
        
        {recentApplications.length > 0 ? (
          <div className="space-y-2">
            {recentApplications.slice(0, 3).map((application, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="font-medium text-sm">
                    {application.job_seekers?.full_name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {application.jobs?.title} • {new Date(application.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
            {recentApplications.length > 3 && (
              <p className="text-xs text-muted-foreground text-center">
                +{recentApplications.length - 3} more applications
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No applications yet</p>
            <p className="text-xs">Applications will appear here</p>
          </div>
        )}
        
        <div className="space-y-2">
          <Link href="/partners/candidates">
            <Button className="w-full" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              View All Candidates
            </Button>
          </Link>
          <Link href="/partners/analytics">
            <Button className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 