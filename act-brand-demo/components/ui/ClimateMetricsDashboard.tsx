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
  BarChart2,
  AlertTriangle,
  CheckCircle,
  AlertCircle
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
  const [currentTimeRange, setCurrentTimeRange] = useState(timeRange);
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
                onChange={(e) => setCurrentTimeRange(e.target.value as any)}
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

        {/* Charts - Full Width and Maximized */}
        <div className="space-y-8">
          {/* Emissions Chart - Full Width */}
          {activeTab === 'emissions' && (
            <>
              {/* Main Emissions Chart - Maximized */}
              <div className={cn("p-8 rounded-ios-xl shadow-ios-subtle", themeStyles.card)}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-ios-large-title font-sf-pro font-bold">Greenhouse Gas Emissions</h3>
                    <p className="text-ios-body font-sf-pro opacity-70 mt-2">Monthly emissions by type (Mt CO₂ equivalent)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-spring-green">
                      <div className="w-3 h-3 bg-spring-green rounded-full animate-pulse"></div>
                      <span className="text-ios-subheadline font-sf-pro font-medium">Live Data</span>
                    </div>
                  </div>
                </div>
                
                {/* Maximized Chart */}
                <ResponsiveContainer width="100%" height={500}>
                  <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={variant === 'dark' ? '#394816' : '#EBE9E1'} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      className="text-ios-body font-sf-pro"
                      tick={{ fontSize: 14 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      className="text-ios-body font-sf-pro"
                      tick={{ fontSize: 14 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: variant === 'dark' ? '#001818' : '#ffffff',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                        fontFamily: 'SF Pro Text, system-ui, sans-serif',
                        fontSize: '14px',
                        padding: '12px'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        fontSize: '14px', 
                        fontFamily: 'SF Pro Text, system-ui, sans-serif',
                        paddingTop: '20px'
                      }}
                    />
                    <Area type="monotone" dataKey="carbon" stackId="1" stroke="#B2DE26" fill="#B2DE26" fillOpacity={0.8} strokeWidth={2} />
                    <Area type="monotone" dataKey="methane" stackId="1" stroke="#394816" fill="#394816" fillOpacity={0.8} strokeWidth={2} />
                    <Area type="monotone" dataKey="nitrous" stackId="1" stroke="#E0FFFF" fill="#E0FFFF" fillOpacity={0.8} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* Secondary Widget - Regional Climate Alerts */}
              <div className={cn("p-6 rounded-ios-xl shadow-ios-subtle", themeStyles.card)}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-ios-title-3 font-sf-pro font-semibold">Regional Climate Alerts</h3>
                  <div className="flex items-center gap-2 text-spring-green">
                    <div className="w-2 h-2 bg-spring-green rounded-full animate-pulse"></div>
                    <span className="text-ios-caption-1 font-sf-pro">Live</span>
                  </div>
                </div>
                <p className="text-ios-caption-1 font-sf-pro opacity-70 mb-6">Real-time emissions monitoring by region</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      region: "North America",
                      status: "warning",
                      message: "CO₂ levels 15% above target",
                      value: "4.2 Gt",
                      color: "text-orange-400",
                      bgColor: "bg-orange-400/10",
                      icon: <AlertTriangle className="w-4 h-4 text-orange-400" />
                    },
                    {
                      region: "Europe",
                      status: "good",
                      message: "Emissions reduced by 8%",
                      value: "2.8 Gt",
                      color: "text-spring-green",
                      bgColor: "bg-spring-green/10",
                      icon: <CheckCircle className="w-4 h-4 text-spring-green" />
                    },
                    {
                      region: "Asia Pacific",
                      status: "critical",
                      message: "Critical threshold exceeded",
                      value: "6.1 Gt",
                      color: "text-red-400",
                      bgColor: "bg-red-400/10",
                      icon: <AlertCircle className="w-4 h-4 text-red-400" />
                    },
                    {
                      region: "Africa",
                      status: "improving",
                      message: "Renewable adoption +12%",
                      value: "1.4 Gt",
                      color: "text-seafoam-blue",
                      bgColor: "bg-seafoam-blue/10",
                      icon: <ArrowUp className="w-4 h-4 text-seafoam-blue" />
                    }
                  ].map((alert, i) => (
                    <div key={i} className={cn("p-4 rounded-lg", alert.bgColor)}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {alert.icon}
                          <span className="text-ios-subheadline font-sf-pro font-medium">{alert.region}</span>
                        </div>
                        <span className={cn("text-ios-caption-1 font-sf-pro font-bold", alert.color)}>
                          {alert.value}
                        </span>
                      </div>
                      <p className="text-ios-caption-1 font-sf-pro opacity-80">{alert.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Temperature Chart - Full Width */}
          {activeTab === 'temperature' && (
            <>
              {/* Main Temperature Chart - Maximized */}
              <div className={cn("p-8 rounded-ios-xl shadow-ios-subtle", themeStyles.card)}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-ios-large-title font-sf-pro font-bold">Global Temperature Anomalies</h3>
                    <p className="text-ios-body font-sf-pro opacity-70 mt-2">Temperature deviation from 1900-2000 average (°C)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-red-400">
                      <Thermometer className="w-4 h-4" />
                      <span className="text-ios-subheadline font-sf-pro font-medium">Critical Levels</span>
                    </div>
                  </div>
                </div>
                
                {/* Maximized Chart */}
                <ResponsiveContainer width="100%" height={500}>
                  <LineChart data={tempData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={variant === 'dark' ? '#394816' : '#EBE9E1'} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      className="text-ios-body font-sf-pro"
                      tick={{ fontSize: 14 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      className="text-ios-body font-sf-pro"
                      tick={{ fontSize: 14 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: variant === 'dark' ? '#001818' : '#ffffff',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                        fontFamily: 'SF Pro Text, system-ui, sans-serif',
                        fontSize: '14px',
                        padding: '12px'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        fontSize: '14px', 
                        fontFamily: 'SF Pro Text, system-ui, sans-serif',
                        paddingTop: '20px'
                      }}
                    />
                    <Line type="monotone" dataKey="global" stroke="#B2DE26" strokeWidth={4} dot={{ fill: '#B2DE26', strokeWidth: 2, r: 5 }} />
                    <Line type="monotone" dataKey="land" stroke="#394816" strokeWidth={3} dot={{ fill: '#394816', strokeWidth: 2, r: 4 }} />
                    <Line type="monotone" dataKey="ocean" stroke="#E0FFFF" strokeWidth={3} dot={{ fill: '#E0FFFF', strokeWidth: 2, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Secondary Widget - Climate Impact Summary */}
              <div className={cn("p-6 rounded-ios-xl shadow-ios-subtle", themeStyles.card)}>
                <h3 className="text-ios-title-3 font-sf-pro font-semibold mb-6">Climate Impact Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-red-400/10 rounded-lg border border-red-400/20">
                    <div className="flex items-center gap-3 mb-4">
                      <Thermometer className="w-6 h-6 text-red-400" />
                      <span className="text-ios-headline font-sf-pro font-semibold">Temperature Rise</span>
                    </div>
                    <p className="text-3xl font-bold text-red-400 mb-2">+1.18°C</p>
                    <p className="text-ios-body opacity-80">Above pre-industrial levels</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-400/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Cloud className="w-4 h-4 text-orange-400" />
                        <span className="text-ios-subheadline font-medium">Sea Level Rise</span>
                      </div>
                      <p className="text-xl font-bold text-orange-400">+23cm</p>
                      <p className="text-ios-caption-1 opacity-70">Since 1880</p>
                    </div>
                    
                    <div className="p-4 bg-blue-400/10 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Wind className="w-4 h-4 text-blue-400" />
                        <span className="text-ios-subheadline font-medium">Ice Loss</span>
                      </div>
                      <p className="text-xl font-bold text-blue-400">-428Gt</p>
                      <p className="text-ios-caption-1 opacity-70">Annual average</p>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-spring-green/10 rounded-lg border border-spring-green/20">
                    <h4 className="text-ios-headline font-sf-pro font-semibold mb-4">2030 Target Progress</h4>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-ios-subheadline">Limit to +1.5°C</span>
                      <span className="text-ios-subheadline font-bold">78% achieved</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3">
                      <div className="bg-spring-green h-3 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Energy Chart - Full Width */}
          {activeTab === 'energy' && (
            <>
              {/* Main Energy Chart - Maximized */}
              <div className={cn("p-8 rounded-ios-xl shadow-ios-subtle", themeStyles.card)}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-ios-large-title font-sf-pro font-bold">Renewable Energy Sources</h3>
                    <p className="text-ios-body font-sf-pro opacity-70 mt-2">Global renewable energy distribution and capacity (%)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-spring-green">
                      <Zap className="w-4 h-4" />
                      <span className="text-ios-subheadline font-sf-pro font-medium">35% Renewable</span>
                    </div>
                  </div>
                </div>
                
                {/* Maximized Chart */}
                <ResponsiveContainer width="100%" height={500}>
                  <PieChart>
                    <Pie
                      data={renewableData}
                      cx="50%"
                      cy="50%"
                      outerRadius={180}
                      innerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={false}
                      fontSize={14}
                    >
                      {renewableData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: variant === 'dark' ? '#001818' : '#ffffff',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                        fontFamily: 'SF Pro Text, system-ui, sans-serif',
                        fontSize: '14px',
                        padding: '12px'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        fontSize: '14px', 
                        fontFamily: 'SF Pro Text, system-ui, sans-serif',
                        paddingTop: '20px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Secondary Widget - Energy Grid Status */}
              <div className={cn("p-6 rounded-ios-xl shadow-ios-subtle", themeStyles.card)}>
                <h3 className="text-ios-title-3 font-sf-pro font-semibold mb-6">Energy Grid Status</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-spring-green/10 rounded-lg border border-spring-green/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Zap className="w-6 h-6 text-spring-green" />
                        <span className="text-ios-headline font-sf-pro font-semibold">Grid Load</span>
                      </div>
                      <p className="text-3xl font-bold text-spring-green mb-2">87%</p>
                      <p className="text-ios-body opacity-70">Optimal operating range</p>
                    </div>
                    
                    <div className="p-6 bg-seafoam-blue/10 rounded-lg border border-seafoam-blue/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Leaf className="w-6 h-6 text-seafoam-blue" />
                        <span className="text-ios-headline font-sf-pro font-semibold">Storage</span>
                      </div>
                      <p className="text-3xl font-bold text-seafoam-blue mb-2">12.4 TWh</p>
                      <p className="text-ios-body opacity-70">Available capacity</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-ios-headline font-sf-pro font-semibold mb-4">Regional Performance</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { region: "North Grid", efficiency: 94, status: "Excellent", color: "text-spring-green" },
                        { region: "Central Grid", efficiency: 87, status: "Good", color: "text-seafoam-blue" },
                        { region: "South Grid", efficiency: 76, status: "Fair", color: "text-orange-400" },
                        { region: "West Grid", efficiency: 91, status: "Very Good", color: "text-moss-green" }
                      ].map((grid, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div>
                            <span className="text-ios-subheadline font-sf-pro font-medium">{grid.region}</span>
                            <p className={cn("text-ios-caption-1", grid.color)}>{grid.status}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-ios-title-3 font-bold">{grid.efficiency}%</span>
                            <div className="w-20 bg-white/20 rounded-full h-2 mt-1">
                              <div 
                                className="bg-spring-green h-2 rounded-full" 
                                style={{ width: `${grid.efficiency}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
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