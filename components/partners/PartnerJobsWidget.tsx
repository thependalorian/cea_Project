/**
 * PartnerJobsWidget Component
 * 
 * Purpose: Displays jobs management widget for partner dashboard
 * Location: /components/partners/PartnerJobsWidget.tsx
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, Plus, Eye } from 'lucide-react'
import Link from 'next/link'

interface PartnerJobsWidgetProps {
  partnerId: string
  metrics: {
    total: number
    active: number
  }
}

export default function PartnerJobsWidget({ partnerId, metrics }: PartnerJobsWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Briefcase className="h-5 w-5" />
          <span>Jobs Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{metrics.active}</div>
            <div className="text-sm text-muted-foreground">Active Jobs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{metrics.total}</div>
            <div className="text-sm text-muted-foreground">Total Jobs</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Link href="/partners/jobs">
            <Button className="w-full" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View All Jobs
            </Button>
          </Link>
          <Link href="/partners/jobs/new">
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
} 