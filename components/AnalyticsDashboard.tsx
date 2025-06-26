'use client'

import { useState } from 'react'

interface Metric {
  label: string
  value: number
  change: number
  trend: 'up' | 'down' | 'neutral'
}

const metrics: Metric[] = [
  {
    label: 'Total Conversations',
    value: 0,
    change: 0,
    trend: 'neutral'
  },
  {
    label: 'Active Users',
    value: 0,
    change: 0,
    trend: 'neutral'
  },
  {
    label: 'Resumes Analyzed',
    value: 0,
    change: 0,
    trend: 'neutral'
  },
  {
    label: 'Job Matches',
    value: 0,
    change: 0,
    trend: 'neutral'
  }
]

export function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('week')

  return (
    <div className="space-y-6">
      {/* Timeframe selector */}
      <div className="flex justify-end">
        <div className="btn-group">
          <button 
            className={`btn btn-sm ${timeframe === 'day' ? 'btn-active' : ''}`}
            onClick={() => setTimeframe('day')}
          >
            Day
          </button>
          <button 
            className={`btn btn-sm ${timeframe === 'week' ? 'btn-active' : ''}`}
            onClick={() => setTimeframe('week')}
          >
            Week
          </button>
          <button 
            className={`btn btn-sm ${timeframe === 'month' ? 'btn-active' : ''}`}
            onClick={() => setTimeframe('month')}
          >
            Month
          </button>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-base">{metric.label}</h2>
              <p className="text-4xl font-bold">{metric.value}</p>
              <div className={`flex items-center gap-1 text-sm ${
                metric.trend === 'up' ? 'text-success' :
                metric.trend === 'down' ? 'text-error' :
                'text-base-content/60'
              }`}>
                {metric.trend === 'up' && '↑'}
                {metric.trend === 'down' && '↓'}
                {metric.trend === 'neutral' && '→'}
                {metric.change}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Conversations by Agent</h2>
            <div className="h-64 flex items-center justify-center text-base-content/60">
              Chart coming soon
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">User Activity</h2>
            <div className="h-64 flex items-center justify-center text-base-content/60">
              Chart coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 