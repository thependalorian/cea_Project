'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, Activity } from 'lucide-react'

interface AdminAnalyticsWidgetProps {
  adminProfile: {
    access_level: string
    department: string
  }
}

export default function AdminAnalyticsWidget({ adminProfile }: AdminAnalyticsWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Platform Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">2,450</div>
              <div className="text-xs text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">+18%</div>
              <div className="text-xs text-muted-foreground">Growth Rate</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Job Applications</span>
              <span className="font-medium">85%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{width: '85%'}}></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Partner Engagement</span>
              <span className="font-medium">72%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '72%'}}></div>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground text-center pt-2">
            Analytics for {adminProfile.department} department
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 