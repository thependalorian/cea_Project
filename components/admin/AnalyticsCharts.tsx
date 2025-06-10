/**
 * Analytics Charts Component - Climate Economy Assistant
 * Interactive charts and visualizations for admin analytics dashboard
 * Location: components/admin/AnalyticsCharts.tsx
 */

'use client'

import { useState } from 'react';
import { BarChart3, TrendingUp, Users, MessageSquare, Calendar, Filter } from 'lucide-react';
import { ACTButton } from '@/components/ui';

interface AnalyticsData {
  conversations: any[];
  users: any[];
  jobs: any[];
  partners: any[];
}

interface AnalyticsChartsProps {
  data: AnalyticsData;
}

export function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedChart, setSelectedChart] = useState('conversations');

  // Process data for charts
  const processDataForChart = (timeRange: string) => {
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    // Generate daily data points
    const days = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      days.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        conversations: Math.floor(Math.random() * 100) + 20, // Mock data
        users: Math.floor(Math.random() * 50) + 10,
        jobs: Math.floor(Math.random() * 20) + 5,
        partners: Math.floor(Math.random() * 10) + 2
      });
    }
    return days;
  };

  const chartData = processDataForChart(selectedTimeRange);
  const maxValue = Math.max(...chartData.map(d => d[selectedChart as keyof typeof d] as number));

  const getChartColor = (type: string) => {
    switch (type) {
      case 'conversations': return 'bg-blue-500';
      case 'users': return 'bg-purple-500';
      case 'jobs': return 'bg-green-500';
      case 'partners': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'conversations': return <MessageSquare className="h-4 w-4" />;
      case 'users': return <Users className="h-4 w-4" />;
      case 'jobs': return <BarChart3 className="h-4 w-4" />;
      case 'partners': return <TrendingUp className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Chart Type:</span>
          <div className="flex items-center gap-1">
            {['conversations', 'users', 'jobs', 'partners'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedChart(type)}
                className={`px-3 py-1 text-sm rounded-lg flex items-center gap-1 ${
                  selectedChart === type
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getChartIcon(type)}
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="mb-6">
          <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-2">
            {selectedChart.charAt(0).toUpperCase() + selectedChart.slice(1)} Trend
          </h3>
          <p className="text-sm text-midnight-forest/70">
            Daily {selectedChart} activity over the selected time period
          </p>
        </div>

        {/* Chart Area */}
        <div className="relative h-80">
          <div className="absolute inset-0 flex items-end justify-between gap-1 px-2">
            {chartData.map((day, index) => {
              const value = day[selectedChart as keyof typeof day] as number;
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <div 
                    className={`w-full ${getChartColor(selectedChart)} rounded-t transition-all duration-300 hover:opacity-80 relative group`}
                    style={{ height: `${height}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {value} {selectedChart}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-center">
                    {day.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
            <span>{maxValue}</span>
            <span>{Math.round(maxValue * 0.75)}</span>
            <span>{Math.round(maxValue * 0.5)}</span>
            <span>{Math.round(maxValue * 0.25)}</span>
            <span>0</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {['conversations', 'users', 'jobs', 'partners'].map((type) => {
          const totalValue = chartData.reduce((sum, day) => sum + (day[type as keyof typeof day] as number), 0);
          const avgValue = Math.round(totalValue / chartData.length);
          const recentValue = chartData[chartData.length - 1]?.[type as keyof typeof chartData[0]] as number || 0;
          const previousValue = chartData[chartData.length - 2]?.[type as keyof typeof chartData[0]] as number || 0;
          const trend = recentValue > previousValue ? 'up' : 'down';
          const trendPercentage = previousValue > 0 ? Math.abs(((recentValue - previousValue) / previousValue) * 100) : 0;

          return (
            <div key={type} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${
                  type === 'conversations' ? 'bg-blue-100' :
                  type === 'users' ? 'bg-purple-100' :
                  type === 'jobs' ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {getChartIcon(type)}
                </div>
                <div className={`text-xs px-2 py-1 rounded-full ${
                  trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {trend === 'up' ? '↑' : '↓'} {trendPercentage.toFixed(1)}%
                </div>
              </div>
              
              <div className="mb-1">
                <div className="text-xl font-helvetica font-medium text-midnight-forest">
                  {totalValue.toLocaleString()}
                </div>
                <div className="text-sm text-midnight-forest/60 capitalize">
                  Total {type}
                </div>
              </div>
              
              <div className="text-xs text-midnight-forest/60">
                Avg: {avgValue}/day
              </div>
            </div>
          );
        })}
      </div>

      {/* Engagement Metrics */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
          Engagement Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-helvetica font-medium text-midnight-forest mb-1">
              2.3x
            </div>
            <div className="text-sm text-midnight-forest/60">
              Average messages per conversation
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-helvetica font-medium text-midnight-forest mb-1">
              4.2m
            </div>
            <div className="text-sm text-midnight-forest/60">
              Average session duration
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-helvetica font-medium text-midnight-forest mb-1">
              87%
            </div>
            <div className="text-sm text-midnight-forest/60">
              User satisfaction rate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 