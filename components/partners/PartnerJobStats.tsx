/**
 * PartnerJobStats Component - Climate Economy Assistant
 * Displays job statistics for partner organizations
 * Location: components/partners/PartnerJobStats.tsx
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Users, FileText, Clock, TrendingUp } from "lucide-react";

interface JobStatistics {
  total: number;
  active: number;
  draft: number;
  expired: number;
  applications: number;
  totalPages: number;
}

interface PartnerJobStatsProps {
  statistics: JobStatistics;
}

export default function PartnerJobStats({ statistics }: PartnerJobStatsProps) {
  const stats = [
    {
      title: "Total Jobs",
      value: statistics.total,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Jobs",
      value: statistics.active,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Draft Jobs",
      value: statistics.draft,
      icon: FileText,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Expired Jobs",
      value: statistics.expired,
      icon: Clock,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Total Applications",
      value: statistics.applications,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.title === "Active Jobs" && statistics.total > 0 && (
                <p className="text-xs text-muted-foreground">
                  {Math.round((statistics.active / statistics.total) * 100)}% of total
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 