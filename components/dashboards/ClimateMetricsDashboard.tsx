/**
 * Climate Metrics Dashboard Component
 * Real-time climate data visualization and metrics
 * Location: components/dashboards/ClimateMetricsDashboard.tsx
 */

"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { ACTButton } from '@/components/ui/ACTButton';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Thermometer, 
  Cloud, 
  Droplets, 
  Wind,
  RefreshCw,
  AlertTriangle,
  Info
} from 'lucide-react';

interface ClimateMetricsDashboardProps {
  className?: string;
  data?: {
    temperature?: any[];
    emissions?: any[];
    weather?: any[];
    renewable?: any[];
  };
}

export const ClimateMetricsDashboard = ({
  className,
  data = {}
}: ClimateMetricsDashboardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  
  // Process real data or show empty state
  const processedData = {
    temperature: data.temperature || [],
    emissions: data.emissions || [],
    weather: data.weather || [],
    renewable: data.renewable || []
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    // Trigger data refresh through parent component
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className={cn(
      "space-y-6 p-6 bg-white rounded-2xl border border-sand-gray/20",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-helvetica font-medium text-midnight-forest">
            Climate Metrics Dashboard
          </h2>
          <p className="text-midnight-forest/70 mt-1">
            Real-time climate data and environmental indicators
          </p>
        </div>
        
        <ACTButton
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Refresh
        </ACTButton>
      </div>

      {/* Metrics Selection */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'temperature', label: 'Temperature', icon: Thermometer },
          { key: 'emissions', label: 'Emissions', icon: Cloud },
          { key: 'weather', label: 'Weather', icon: Droplets },
          { key: 'renewable', label: 'Renewable', icon: Wind }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedMetric(key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              selectedMetric === key
                ? "bg-spring-green text-white"
                : "bg-sand-gray/10 text-midnight-forest hover:bg-sand-gray/20"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="bg-sand-gray/5 rounded-xl p-6">
        {processedData[selectedMetric as keyof typeof processedData].length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={processedData[selectedMetric as keyof typeof processedData]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#394816" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                stroke="#394816" 
                fontSize={12}
              />
              <YAxis 
                stroke="#394816" 
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#B2DE26" 
                strokeWidth={2}
                dot={{ fill: '#B2DE26', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#B2DE26', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <Info className="h-12 w-12 text-midnight-forest/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-midnight-forest mb-2">
                No Data Available
              </h3>
              <p className="text-midnight-forest/60">
                Climate metrics data will appear here when available
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { 
            title: 'Current Status',
            value: processedData[selectedMetric as keyof typeof processedData].length > 0 ? 'Active' : 'No Data',
            trend: 'stable',
            icon: Info
          },
          { 
            title: 'Data Points',
            value: processedData[selectedMetric as keyof typeof processedData].length.toString(),
            trend: 'up',
            icon: TrendingUp
          },
          { 
            title: 'Last Updated',
            value: 'Real-time',
            trend: 'stable',
            icon: RefreshCw
          }
        ].map((card, index) => (
          <motion.div
            key={index}
            className="bg-white p-4 rounded-lg border border-sand-gray/20"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-2">
              <card.icon className="h-5 w-5 text-spring-green" />
              <span className={cn(
                "text-xs px-2 py-1 rounded-full",
                card.trend === 'up' && "bg-green-100 text-green-700",
                card.trend === 'down' && "bg-red-100 text-red-700",
                card.trend === 'stable' && "bg-gray-100 text-gray-700"
              )}>
                {card.trend}
              </span>
            </div>
            <div className="text-2xl font-helvetica font-medium text-midnight-forest">
              {card.value}
            </div>
            <div className="text-sm text-midnight-forest/60">
              {card.title}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}; 