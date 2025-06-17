"use client";

/**
 * ACT Data Visualization Component - Alliance for Climate Transition
 * Interactive charts and data displays for climate metrics and analytics
 * Location: act-brand-demo/components/ui/ACTDataVisualization.tsx
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ACTButton } from './ACTButton';
import { ACTBadge } from './ACTBadge';
import { ACTFrameElement } from './ACTFrameElement';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Activity,
  Leaf,
  Zap,
  Building2,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

interface DataPoint {
  label: string;
  value: number;
  change?: number;
  date?: Date;
  color?: string;
  category?: string;
}

interface ChartData {
  id: string;
  title: string;
  data: DataPoint[];
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut' | 'progress';
  timeRange?: string;
  unit?: string;
  target?: number;
}

interface ACTDataVisualizationProps {
  chartData?: ChartData[];
  variant?: 'dashboard' | 'analytics' | 'compact' | 'detailed';
  layout?: 'grid' | 'list' | 'masonry';
  showControls?: boolean;
  showFilters?: boolean;
  refreshInterval?: number;
  className?: string;
  dark?: boolean;
}

// Mock data for demonstration
const sampleChartData: ChartData[] = [
  {
    id: 'carbon-emissions',
    title: 'Carbon Emissions Reduction',
    type: 'line',
    timeRange: '6 months',
    unit: 'MT CO2e',
    target: 25,
    data: [
      { label: 'Jan', value: 5.2, change: -2.1 },
      { label: 'Feb', value: 4.8, change: -7.7 },
      { label: 'Mar', value: 4.3, change: -10.4 },
      { label: 'Apr', value: 3.9, change: -9.3 },
      { label: 'May', value: 3.2, change: -17.9 },
      { label: 'Jun', value: 2.8, change: -12.5 }
    ]
  },
  {
    id: 'renewable-energy',
    title: 'Renewable Energy Mix',
    type: 'pie',
    unit: '%',
    data: [
      { label: 'Solar', value: 45, color: '#FFA726' },
      { label: 'Wind', value: 30, color: '#2CF586' },
      { label: 'Hydro', value: 15, color: '#42A5F5' },
      { label: 'Other', value: 10, color: '#AB47BC' }
    ]
  },
  {
    id: 'energy-efficiency',
    title: 'Energy Efficiency Progress',
    type: 'progress',
    unit: 'kWh/sq ft',
    target: 20,
    data: [
      { label: 'Current', value: 18.5, change: 7.5 }
    ]
  },
  {
    id: 'climate-investment',
    title: 'Climate Investment Distribution',
    type: 'bar',
    unit: '$M',
    data: [
      { label: 'Clean Energy', value: 25.3, color: '#2CF586' },
      { label: 'Carbon Capture', value: 18.7, color: '#42A5F5' },
      { label: 'Sustainable Transport', value: 15.2, color: '#FFA726' },
      { label: 'Green Buildings', value: 12.8, color: '#AB47BC' },
      { label: 'Nature Solutions', value: 8.9, color: '#66BB6A' }
    ]
  }
];

export function ACTDataVisualization({
  chartData = sampleChartData,
  variant = 'dashboard',
  layout = 'grid',
  showControls = true,
  showFilters = false,
  refreshInterval,
  className,
  dark = false
}: ACTDataVisualizationProps) {
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('6m');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Auto-refresh logic
  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(() => {
        handleRefresh();
      }, refreshInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Chart renderers
  const renderLineChart = (chart: ChartData) => {
    const maxValue = Math.max(...chart.data.map(d => d.value));
    const points = chart.data.map((point, index) => ({
      x: (index / (chart.data.length - 1)) * 100,
      y: 100 - (point.value / maxValue) * 80
    }));

    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    const areaData = `${pathData} L 100 100 L 0 100 Z`;

    return (
      <div className="relative h-48 p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Area fill */}
          <motion.path
            d={areaData}
            fill="url(#gradient)"
            fillOpacity={0.3}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          />
          
          {/* Line */}
          <motion.path
            d={pathData}
            stroke="#2CF586"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <motion.circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="2"
              fill="#2CF586"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 + 1, duration: 0.3 }}
            />
          ))}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2CF586" />
              <stop offset="100%" stopColor="#2CF586" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Value labels */}
        <div className="absolute bottom-2 left-4 right-4 flex justify-between text-xs text-gray-500">
          {chart.data.map((point, index) => (
            <span key={index}>{point.label}</span>
          ))}
        </div>
      </div>
    );
  };

  const renderBarChart = (chart: ChartData) => {
    const maxValue = Math.max(...chart.data.map(d => d.value));
    
    return (
      <div className="p-4 space-y-3">
        {chart.data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className={dark ? "text-white" : "text-gray-700"}>{item.label}</span>
              <span className={cn("font-medium", dark ? "text-white" : "text-gray-900")}>
                {item.value}{chart.unit}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full"
                style={{ backgroundColor: item.color || '#2CF586' }}
                initial={{ width: 0 }}
                animate={{ width: `${(item.value / maxValue) * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPieChart = (chart: ChartData) => {
    const total = chart.data.reduce((sum, item) => sum + item.value, 0);
    let accumulatedAngle = 0;

    return (
      <div className="flex items-center gap-6 p-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {chart.data.map((item, index) => {
              const percentage = item.value / total;
              const angle = percentage * 360;
              const startAngle = accumulatedAngle;
              const endAngle = accumulatedAngle + angle;
              accumulatedAngle += angle;

              const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const endX = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
              const endY = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 50 50`,
                `L ${startX} ${startY}`,
                `A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                'Z'
              ].join(' ');

              return (
                <motion.path
                  key={index}
                  d={pathData}
                  fill={item.color || '#2CF586'}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              );
            })}
          </svg>
        </div>
        
        <div className="space-y-2">
          {chart.data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || '#2CF586' }}
              />
              <span className={cn("text-sm", dark ? "text-white" : "text-gray-700")}>
                {item.label}: {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProgressChart = (chart: ChartData) => {
    const current = chart.data[0]?.value || 0;
    const target = chart.target || 100;
    const percentage = Math.min((current / target) * 100, 100);
    const isOnTrack = percentage >= 80;

    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className={cn("text-2xl font-bold", dark ? "text-white" : "text-gray-900")}>
              {current}{chart.unit}
            </div>
            <div className={cn("text-sm", dark ? "text-white/60" : "text-gray-500")}>
              Target: {target}{chart.unit}
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            isOnTrack 
              ? "bg-green-100 text-green-700" 
              : "bg-yellow-100 text-yellow-700"
          )}>
            {isOnTrack ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
            {percentage.toFixed(0)}%
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
            <motion.div
              className={cn(
                "h-3 rounded-full",
                isOnTrack ? "bg-green-500" : "bg-yellow-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </div>
          
          {chart.data[0]?.change && (
            <div className="flex items-center gap-1 text-sm">
              {chart.data[0].change > 0 ? (
                <ArrowUp className="w-4 h-4 text-green-500" />
              ) : chart.data[0].change < 0 ? (
                <ArrowDown className="w-4 h-4 text-red-500" />
              ) : (
                <Minus className="w-4 h-4 text-gray-400" />
              )}
              <span className={cn(
                "font-medium",
                chart.data[0].change > 0 ? "text-green-600" : 
                chart.data[0].change < 0 ? "text-red-600" : "text-gray-400"
              )}>
                {Math.abs(chart.data[0].change)}% vs last period
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderChart = (chart: ChartData) => {
    switch (chart.type) {
      case 'line':
      case 'area':
        return renderLineChart(chart);
      case 'bar':
        return renderBarChart(chart);
      case 'pie':
      case 'donut':
        return renderPieChart(chart);
      case 'progress':
        return renderProgressChart(chart);
      default:
        return <div className="p-4 text-center text-gray-500">Chart type not supported</div>;
    }
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'line':
      case 'area':
        return <Activity className="w-4 h-4" />;
      case 'bar':
        return <BarChart3 className="w-4 h-4" />;
      case 'pie':
      case 'donut':
        return <PieChart className="w-4 h-4" />;
      case 'progress':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getLayoutClass = () => {
    switch (layout) {
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      case 'list':
        return 'space-y-6';
      case 'masonry':
        return 'columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 gap-6';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Controls */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className={cn(
              "text-lg font-semibold",
              dark ? "text-white" : "text-gray-900"
            )}>
              Climate Analytics Dashboard
            </h3>
            <ACTBadge variant="outline" size="sm" className="bg-green-50 text-green-700 border-green-200">
              Live Data
            </ACTBadge>
          </div>
          
          <div className="flex items-center gap-2">
            {showFilters && (
              <ACTButton variant="outline" size="sm" icon={<Filter className="w-4 h-4" />}>
                Filter
              </ACTButton>
            )}
            
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={cn(
                "px-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-spring-green",
                dark ? "bg-slate-800 border-slate-600 text-white" : "bg-white border-gray-300"
              )}
            >
              <option value="1w">1 Week</option>
              <option value="1m">1 Month</option>
              <option value="3m">3 Months</option>
              <option value="6m">6 Months</option>
              <option value="1y">1 Year</option>
            </select>
            
            <ACTButton
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              icon={<RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />}
            >
              Refresh
            </ACTButton>
            
            <ACTButton variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
              Export
            </ACTButton>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className={getLayoutClass()}>
        {chartData.map((chart) => (
          <ACTFrameElement
            key={chart.id}
            variant="glass"
            className={cn(
              "overflow-hidden cursor-pointer transition-all duration-300",
              selectedChart === chart.id && "ring-2 ring-spring-green",
              layout === 'masonry' && "break-inside-avoid"
            )}
            onClick={() => setSelectedChart(selectedChart === chart.id ? null : chart.id)}
          >
            <div className="p-4 border-b border-gray-200 dark:border-slate-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-spring-green/20 rounded-lg text-spring-green">
                    {getChartIcon(chart.type)}
                  </div>
                  <div>
                    <h4 className={cn(
                      "font-medium",
                      dark ? "text-white" : "text-gray-900"
                    )}>
                      {chart.title}
                    </h4>
                    {chart.timeRange && (
                      <p className={cn(
                        "text-xs",
                        dark ? "text-white/60" : "text-gray-500"
                      )}>
                        Last {chart.timeRange}
                      </p>
                    )}
                  </div>
                </div>
                
                <ACTBadge variant="outline" size="sm" className="capitalize">
                  {chart.type}
                </ACTBadge>
              </div>
            </div>
            
            <div className="min-h-[200px]">
              {renderChart(chart)}
            </div>
          </ACTFrameElement>
        ))}
      </div>

      {/* Detailed View Modal */}
      <AnimatePresence>
        {selectedChart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedChart(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={cn(
                "max-w-4xl w-full max-h-[90vh] overflow-auto rounded-xl",
                dark ? "bg-slate-800" : "bg-white"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const chart = chartData.find(c => c.id === selectedChart);
                if (!chart) return null;
                
                return (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-spring-green/20 rounded-lg text-spring-green">
                          {getChartIcon(chart.type)}
                        </div>
                        <div>
                          <h2 className={cn(
                            "text-xl font-semibold",
                            dark ? "text-white" : "text-gray-900"
                          )}>
                            {chart.title}
                          </h2>
                          <p className={cn(
                            "text-sm",
                            dark ? "text-white/60" : "text-gray-500"
                          )}>
                            Detailed view • Last {chart.timeRange || '6 months'}
                          </p>
                        </div>
                      </div>
                      
                      <ACTButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedChart(null)}
                      >
                        Close
                      </ACTButton>
                    </div>
                    
                    <div className="min-h-[400px]">
                      {renderChart(chart)}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 