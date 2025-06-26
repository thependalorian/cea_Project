import { AnalyticsDashboard } from '@/components/AnalyticsDashboard'

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics</h1>
      </div>

      <AnalyticsDashboard />
    </div>
  )
} 