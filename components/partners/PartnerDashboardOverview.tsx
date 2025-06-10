/**
 * PartnerDashboardOverview Component
 * 
 * Purpose: Displays overview metrics cards for partner dashboard
 * Location: /components/partners/PartnerDashboardOverview.tsx
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Users, FileText, BookOpen } from 'lucide-react'

interface PartnerDashboardOverviewProps {
  metrics: {
    totalJobs: number
    activeJobs: number
    totalResources: number
    totalEducationPrograms: number
    totalApplications: number
  }
  partner: Record<string, unknown>
}

export default function PartnerDashboardOverview({ metrics, partner }: PartnerDashboardOverviewProps) {
  const overviewCards = [
    {
      title: 'Active Jobs',
      value: metrics.activeJobs,
      total: metrics.totalJobs,
      icon: Briefcase,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Applications',
      value: metrics.totalApplications,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Resources',
      value: metrics.totalResources,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Education Programs',
      value: metrics.totalEducationPrograms,
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {overviewCards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold">{card.value}</p>
                    {card.total && (
                      <p className="text-sm text-muted-foreground">
                        / {card.total}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 