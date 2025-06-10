'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Building2, Briefcase, FileText, BookOpen, TrendingUp, Activity } from 'lucide-react'

interface AdminDashboardOverviewProps {
  metrics: {
    totalUsers: number
    totalPartners: number
    totalJobs: number
    totalResources: number
    totalEducationPrograms: number
  }
}

export default function AdminDashboardOverview({ metrics }: AdminDashboardOverviewProps) {
  const cards = [
    {
      title: 'Total Users',
      value: metrics.totalUsers.toLocaleString(),
      icon: Users,
      description: 'Registered job seekers',
      trend: '+12.5% from last month',
      trendUp: true
    },
    {
      title: 'Active Partners',
      value: metrics.totalPartners.toLocaleString(),
      icon: Building2,
      description: 'Climate organizations',
      trend: '+3.2% from last month',
      trendUp: true
    },
    {
      title: 'Job Listings',
      value: metrics.totalJobs.toLocaleString(),
      icon: Briefcase,
      description: 'Active positions',
      trend: '+18.1% from last month',
      trendUp: true
    },
    {
      title: 'Knowledge Resources',
      value: metrics.totalResources.toLocaleString(),
      icon: FileText,
      description: 'Learning materials',
      trend: '+7.4% from last month',
      trendUp: true
    },
    {
      title: 'Education Programs',
      value: metrics.totalEducationPrograms.toLocaleString(),
      icon: BookOpen,
      description: 'Training opportunities',
      trend: '+5.8% from last month',
      trendUp: true
    },
    {
      title: 'Platform Activity',
      value: '94.2%',
      icon: Activity,
      description: 'System uptime',
      trend: '+0.3% from last month',
      trendUp: true
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
              <div className="flex items-center mt-2 text-xs">
                <TrendingUp className={`h-3 w-3 mr-1 ${card.trendUp ? 'text-green-500' : 'text-red-500'}`} />
                <span className={card.trendUp ? 'text-green-500' : 'text-red-500'}>
                  {card.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
} 