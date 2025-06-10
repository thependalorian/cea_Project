/**
 * Climate Metrics Dashboard Component
 * Modern analytics dashboard for climate data visualization
 * Location: components/dashboards/ClimateMetricsDashboard.tsx
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { ACTButton } from '@/components/ui/ACTButton';
import { cn } from '@/lib/utils';
import { 
  ArrowUp, 
  ArrowDown, 
  Calendar, 
  Filter, 
  DownloadCloud, 
  RefreshCw,
  Zap,
  Leaf,
  Thermometer,
  Wind,
  Cloud,
  BarChart2
} from 'lucide-react';

interface ClimateMetricsDashboardProps {
  className?: string;
  timeRange?: 'day' | 'week' | 'month' | 'year';
  showFilters?: boolean;
  isLoading?: boolean;
  variant?: 'light' | 'dark' | 'glass';
}

// Sample climate data
const getEmissionsData = () => [
  { name: 'Jan', carbon: 4000, methane: 2400, nitrous: 1200 },
  { name: 'Feb', carbon: 3800, methane: 2210, nitrous: 1190 },
  { name: 'Mar', carbon: 4200, methane: 2290, nitrous: 1300 },
  { name: 'Apr', carbon: 3900, methane: 2000, nitrous: 1228 },
  { name: 'May', carbon: 3600, methane: 1900, nitrous: 1100 },
  { name: 'Jun', carbon: 3700, methane: 2100, nitrous: 1150 },
  { name: 'Jul', carbon: 4100, methane: 2400, nitrous: 1278 },
  { name: 'Aug', carbon: 4500, methane: 2700, nitrous: 1420 },
  { name: 'Sep', carbon: 4300, methane: 2600, nitrous: 1370 },
  { name: 'Oct', carbon: 4200, methane: 2500, nitrous: 1310 },
  { name: 'Nov', carbon: 4100, methane: 2400, nitrous: 1270 },
  { name: 'Dec', carbon: 4000, methane: 2300, nitrous: 1220 },
];

const getTemperatureData = () => [
  { name: '2010', global: 0.72, land: 1.06, ocean: 0.54 },
  { name: '2011', global: 0.61, land: 0.96, ocean: 0.45 },
  { name: '2012', global: 0.65, land: 1.09, ocean: 0.48 },
  { name: '2013', global: 0.68, land: 1.05, ocean: 0.52 },
  { name: '2014', global: 0.75, land: 1.08, ocean: 0.57 },
  { name: '2015', global: 0.90, land: 1.31, ocean: 0.72 },
  { name: '2016', global: 1.02, land: 1.45, ocean: 0.81 },
  { name: '2017', global: 0.92, land: 1.31, ocean: 0.75 },
  { name: '2018', global: 0.85, land: 1.19, ocean: 0.67 },
  { name: '2019', global: 0.98, land: 1.42, ocean: 0.78 },
  { name: '2020', global: 1.02, land: 1.52, ocean: 0.80 },
  { name: '2021', global: 0.85, land: 1.29, ocean: 0.65 },
  { name: '2022', global: 0.89, land: 1.35, ocean: 0.69 },
  { name: '2023', global: 1.15, land: 1.67, ocean: 0.93 },
  { name: '2024', global: 1.18, land: 1.71, ocean: 0.96 },
];

const getRenewableData = () => [
  { name: 'Solar', value: 35 },
  { name: 'Wind', value: 30 },
  { name: 'Hydro', value: 15 },
  { name: 'Biomass', value: 10 },
  { name: 'Geothermal', value: 10 },
];

const COLORS = ['#B2DE26', '#3ECF8E', '#42C2FF', '#FF8A48', '#9747FF'];

export const ClimateMetricsDashboard = ({
  className,
  timeRange = 'year',
  showFilters = true,
  isLoading = false,
  variant = 'light'
}: ClimateMetricsDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'emissions' | 'temperature' | 'energy'>('emissions');
  const [currentTimeRange, setTimeRange] = useState(timeRange);
  const [chartData, setChartData] = useState(getEmissionsData());
  const [tempData, setTempData] = useState(getTemperatureData());
  const [renewableData, setRenewableData] = useState(getRenewableData());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Key metrics
  const metrics = {
    carbonFootprint: {
      value: '28.6',
      unit: 'Gt CO₂',
      change: -2.3,
      period: 'vs last year'
    },
    globalTemp: {
      value: '1.18',
      unit: '°C',
      change: 0.03,
      period: 'vs last year'
    },
    renewableShare: {
      value: '35',
      unit: '%',
      change: 5.2,
      period: 'vs last year'
    },
    emissionsTarget: {
      value: '74',
      unit: '%',
      change: 8.5,
      period: 'to 2030 goal'
    }
  };
  
  // Refresh data simulation
  const refreshData = () => {
    setIsRefreshing(true);
    
    // Simulate data refresh
    setTimeout(() => {
      setChartData(getEmissionsData().map(item => ({
        ...item,
        carbon: item.carbon * (0.95 + Math.random() * 0.1),
        methane: item.methane * (0.95 + Math.random() * 0.1),
        nitrous: item.nitrous * (0.95 + Math.random() * 0.1),
      })));
      
      setTempData(getTemperatureData().map(item => ({
        ...item,
        global: item.global * (0.98 + Math.random() * 0.04),
        land: item.land * (0.98 + Math.random() * 0.04),
        ocean: item.ocean * (0.98 + Math.random() * 0.04),
      })));
      
      setRenewableData(getRenewableData().map(item => ({
        ...item,
        value: item.value * (0.95 + Math.random() * 0.1),
      })));
      
      setIsRefreshing(false);
    }, 1200);
  };
  
  // Get theme styles
  const getThemeStyles = () => {
    switch (variant) {
      case 'dark':
        return {
          container: "bg-midnight-forest text-white border border-midnight-forest/50",
          header: "bg-midnight-forest/80 border-moss-green/30",
          card: "bg-midnight-forest/60 border-moss-green/20",
          tabButton: {
            active: "bg-spring-green text-midnight-forest",
            inactive: "bg-midnight-forest/40 text-white hover:bg-midnight-forest/60"
          }
        };
      case 'glass':
        return {
          container: "bg-white/10 backdrop-blur-ios text-midnight-forest border border-white/25",
          header: "bg-white/20 backdrop-blur-ios border-white/20",
          card: "bg-white/20 backdrop-blur-ios border-white/20",
          tabButton: {
            active: "bg-spring-green text-midnight-forest",
            inactive: "bg-white/20 text-midnight-forest hover:bg-white/30"
          }
        };
      case 'light':
      default:
        return {
          container: "bg-white text-midnight-forest border border-sand-gray/10",
          header: "bg-white border-sand-gray/10",
          card: "bg-white border-sand-gray/10",
          tabButton: {
            active: "bg-spring-green text-midnight-forest",
            inactive: "bg-sand-gray/10 text-midnight-forest hover:bg-sand-gray/20"
          }
        };
    }
  };
  
  const themeStyles = getThemeStyles();
  
  return (
    <div className={cn("w-full", className)}>
      <div className={cn("rounded-ios-xl shadow-ios-subtle p-6", themeStyles.container)}>
        {/* Header */}
        <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between mb-6 p-4 rounded-ios-lg", themeStyles.header)}>
          <div>
            <h2 className="text-ios-title-2 md:text-ios-title-1 font-sf-pro font-semibold">Climate Metrics Dashboard</h2>
            <p className="text-ios-body font-sf-pro opacity-70 mt-1">
              Real-time climate data and predictive analytics
            </p>
          </div>
          
          {showFilters && (
            <div className="flex items-center gap-3 mt-4 sm:mt-0">
              <select 
                value={currentTimeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="appearance-none pl-3 pr-8 py-2 rounded-ios-lg text-ios-subheadline font-sf-pro bg-white/10 border border-white/20 focus:outline-none focus:ring-1 focus:ring-spring-green"
              >
                <option value="day">Last 24 Hours</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
              </select>
              
              <ACTButton 
                variant="ghost" 
                size="sm"
                onClick={refreshData}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
                Refresh
              </ACTButton>
            </div>
          )}
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard 
            title="Carbon Footprint" 
            value={metrics.carbonFootprint.value}
            unit={metrics.carbonFootprint.unit}
            change={metrics.carbonFootprint.change}
            period={metrics.carbonFootprint.period}
            icon={<Cloud className="w-5 h-5" />}
            themeStyles={themeStyles}
            valueDirection="down"
          />
          <MetricCard 
            title="Global Temperature" 
            value={metrics.globalTemp.value}
            unit={metrics.globalTemp.unit}
            change={metrics.globalTemp.change}
            period={metrics.globalTemp.period}
            icon={<Thermometer className="w-5 h-5" />}
            themeStyles={themeStyles}
            valueDirection="up"
          />
          <MetricCard 
            title="Renewable Share" 
            value={metrics.renewableShare.value}
            unit={metrics.renewableShare.unit}
            change={metrics.renewableShare.change}
            period={metrics.renewableShare.period}
            icon={<Zap className="w-5 h-5" />}
            themeStyles={themeStyles}
            valueDirection="up"
          />
          <MetricCard 
            title="Emissions Target" 
            value={metrics.emissionsTarget.value}
            unit={metrics.emissionsTarget.unit}
            change={metrics.emissionsTarget.change}
            period={metrics.emissionsTarget.period}
            icon={<BarChart2 className="w-5 h-5" />}
            themeStyles={themeStyles}
            valueDirection="up"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('emissions')}
            className={cn(
              "px-4 py-2 rounded-ios-lg text-ios-subheadline font-sf-pro font-medium transition-colors",
              activeTab === 'emissions' ? themeStyles.tabButton.active : themeStyles.tabButton.inactive
            )}
          >
            <BarChart2 className="w-4 h-4 mr-2 inline" />
            Emissions
          </button>
          <button
            onClick={() => setActiveTab('temperature')}
            className={cn(
              "px-4 py-2 rounded-ios-lg text-ios-subheadline font-sf-pro font-medium transition-colors",
              activeTab === 'temperature' ? themeStyles.tabButton.active : themeStyles.tabButton.inactive
            )}
          >
            <Thermometer className="w-4 h-4 mr-2 inline" />
            Temperature
          </button>
          <button
            onClick={() => setActiveTab('energy')}
            className={cn(
              "px-4 py-2 rounded-ios-lg text-ios-subheadline font-sf-pro font-medium transition-colors",
              activeTab === 'energy' ? themeStyles.tabButton.active : themeStyles.tabButton.inactive
            )}
          >
            <Zap className="w-4 h-4 mr-2 inline" />
            Energy
          </button>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emissions Chart */}
          {activeTab === 'emissions' && (
            <div className={cn("p-6 rounded-ios-xl shadow-ios-subtle", themeStyles.card)}>
              <h3 className="text-ios-headline font-sf-pro font-medium">Greenhouse Gas Emissions</h3>
              <p className="text-ios-caption-1 font-sf-pro opacity-70 mb-4">Monthly emissions by type (Mt CO₂ equivalent)</p>
              
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={variant === 'dark' ? '#394816' : '#EBE9E1'} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    className="text-ios-caption-1 font-sf-pro"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    className="text-ios-caption-1 font-sf-pro"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: variant === 'dark' ? '#001818' : '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      fontFamily: 'SF Pro Text, system-ui, sans-serif'
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="carbon" stackId="1" stroke="#B2DE26" fill="#B2DE26" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="methane" stackId="1" stroke="#394816" fill="#394816" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="nitrous" stackId="1" stroke="#E0FFFF" fill="#E0FFFF" fillOpacity={0.8} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Temperature Chart */}
          {activeTab === 'temperature' && (
            <div className={cn("p-6 rounded-ios-xl shadow-ios-subtle", themeStyles.card)}>
              <h3 className="text-ios-headline font-sf-pro font-medium">Global Temperature Anomalies</h3>
              <p className="text-ios-caption-1 font-sf-pro opacity-70 mb-4">Temperature deviation from 1900-2000 average (°C)</p>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={tempData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={variant === 'dark' ? '#394816' : '#EBE9E1'} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    className="text-ios-caption-1 font-sf-pro"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    className="text-ios-caption-1 font-sf-pro"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: variant === 'dark' ? '#001818' : '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      fontFamily: 'SF Pro Text, system-ui, sans-serif'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="global" stroke="#B2DE26" strokeWidth={3} dot={{ fill: '#B2DE26', strokeWidth: 2, r: 4 }} />
                  <Line type="monotone" dataKey="land" stroke="#394816" strokeWidth={2} dot={{ fill: '#394816', strokeWidth: 2, r: 3 }} />
                  <Line type="monotone" dataKey="ocean" stroke="#E0FFFF" strokeWidth={2} dot={{ fill: '#E0FFFF', strokeWidth: 2, r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Energy Chart */}
          {activeTab === 'energy' && (
            <div className={cn("p-6 rounded-ios-xl shadow-ios-subtle", themeStyles.card)}>
              <h3 className="text-ios-headline font-sf-pro font-medium">Renewable Energy Sources</h3>
              <p className="text-ios-caption-1 font-sf-pro opacity-70 mb-4">Global renewable energy mix (%)</p>
              
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={renewableData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {renewableData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: variant === 'dark' ? '#001818' : '#ffffff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      fontFamily: 'SF Pro Text, system-ui, sans-serif'
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  change: number;
  period: string;
  icon: React.ReactNode;
  themeStyles: any;
  valueDirection?: 'up' | 'down';
}

const MetricCard = ({ 
  title, 
  value, 
  unit, 
  change, 
  period, 
  icon,
  themeStyles,
  valueDirection = 'down'
}: MetricCardProps) => {
  const isPositive = valueDirection === 'up' ? change > 0 : change < 0;
  const changeColor = isPositive ? 'text-ios-green' : 'text-ios-red';
  const changeIcon = isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;

  return (
    <div className={cn("p-4 rounded-ios-xl shadow-ios-subtle", themeStyles.card)}>
      <div className="flex items-center justify-between mb-3">
        <div className="text-spring-green">{icon}</div>
        <div className={cn("flex items-center gap-1 text-ios-caption-1 font-sf-pro", changeColor)}>
          {changeIcon}
          <span>{Math.abs(change)}%</span>
        </div>
      </div>
      
      <div>
        <div className="flex items-baseline gap-1 mb-1">
          <span className="text-ios-title-2 font-sf-pro font-bold">{value}</span>
          <span className="text-ios-caption-1 font-sf-pro opacity-70">{unit}</span>
        </div>
        <div className="text-ios-caption-1 font-sf-pro opacity-70">{title}</div>
        <div className="text-ios-caption-2 font-sf-pro opacity-50">{period}</div>
      </div>
    </div>
  );
}; 