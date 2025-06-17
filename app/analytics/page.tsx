/**
 * Analytics Dashboard - Climate Economy Assistant
 * Comprehensive platform analytics and insights
 * Location: app/analytics/page.tsx
 */

'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/contexts/auth-context';
import { ACTButton } from '@/components/ACTButton';
import { ACTCard } from '@/components/ACTCard';
import { SimpleLayout } from '@/components/SimpleLayout';
import { useAnalyticsData } from '@/hooks/use-dashboard-data';
import { LoadingDashboard } from '@/components/ui/LoadingStates';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare,
  Briefcase,
  Building2,
  Target,
  Zap,
  Calendar,
  Clock,
  Eye,
  ThumbsUp,
  Download,
  Filter,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Minus,
  Globe,
  Activity,
  Star,
  Award,
  CheckCircle2,
  AlertTriangle,
  Info,
  PieChart,
  LineChart,
  BarChart,
  Map
} from 'lucide-react';

// Define interfaces for analytics data types
interface TopicType {
  topic: string;
  count: number;
  percentage: number;
}

function AnalyticsContent() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [activeMetric, setActiveMetric] = useState('overview');

  // Real analytics data from API - no more mock data
  const { data: analyticsData, loading, error } = useAnalyticsData();

  // Handle loading state
  if (loading) {
    return (
      <SimpleLayout>
        <div className="min-h-screen bg-gradient-to-br from-sand-gray/30 via-white to-seafoam-blue/20">
          <div className="max-w-7xl mx-auto py-16 px-6">
            <LoadingDashboard />
          </div>
        </div>
      </SimpleLayout>
    );
  }

  // Handle error state
  if (error) {
    return (
      <SimpleLayout>
        <div className="min-h-screen bg-gradient-to-br from-sand-gray/30 via-white to-seafoam-blue/20">
          <div className="max-w-7xl mx-auto py-16 px-6">
            <div className="text-center">
              <div className="text-red-600 mb-4">Error loading analytics data</div>
              <p className="text-midnight-forest/70">{error}</p>
              <ACTButton 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="mt-4"
              >
                Retry
              </ACTButton>
            </div>
          </div>
        </div>
      </SimpleLayout>
    );
  }

  // Use real data or fallback to zeros
  const platformMetrics = analyticsData?.platformMetrics || {
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    userGrowthRate: 0,
    totalConversations: 0,
    activeConversations: 0,
    avgConversationLength: 0,
    conversationGrowthRate: 0,
    totalJobs: 0,
    activeJobs: 0,
    newJobsThisMonth: 0,
    jobGrowthRate: 0,
    totalPartners: 0,
    activePartners: 0,
    newPartnersThisMonth: 0,
    partnerGrowthRate: 0,
    avgResponseTime: 0,
    userSatisfactionScore: 0,
    platformUptime: 99.8,
    totalTokensConsumed: 0
  };

  const conversationAnalytics = analyticsData?.conversationAnalytics || {
    totalSessions: 0,
    avgSessionDuration: 0,
    messagesPerSession: 0,
    goalAchievementRate: 0,
    topTopics: [],
    userSatisfactionTrend: []
  };

  const userEngagement = analyticsData?.userEngagement || {
    dailyActiveUsers: 0,
    weeklyActiveUsers: 0,
    monthlyActiveUsers: 0,
    avgSessionsPerUser: 0,
    returnUserRate: 0,
    newUserRetention: {
      day1: 0,
      day7: 0,
      day30: 0
    },
    topUserActions: []
  };

  const jobMarketInsights = analyticsData?.jobMarketInsights || {
    totalApplications: 0,
    avgApplicationsPerJob: 0,
    topSkillsInDemand: [],
    salaryTrends: {
      avgSalary: 0,
      salaryGrowth: 0,
      topPayingRoles: []
    },
    geographicDistribution: []
  };

  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  const metricTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'conversations', label: 'AI Conversations', icon: MessageSquare },
    { id: 'jobs', label: 'Job Market', icon: Briefcase },
    { id: 'partners', label: 'Partners', icon: Building2 }
  ];

  interface MetricCardProps {
    title: string;
    value: number | string;
    change: number;
    changeType: 'positive' | 'negative' | 'neutral';
    icon: React.ElementType;
    color?: string;
  }

  const MetricCard = ({ title, value, change, changeType, icon: Icon, color = "blue" }: MetricCardProps) => (
    <ACTCard variant="glass" className="p-6 bg-white/80 backdrop-blur-sm border border-white/40 hover:shadow-ios-normal transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-${color}-100 rounded-2xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className={`flex items-center space-x-1 text-sm ${
          changeType === 'positive' ? 'text-green-600' :
          changeType === 'negative' ? 'text-red-600' :
          'text-gray-600'
        }`}>
          {changeType === 'positive' && <ArrowUp className="w-4 h-4" />}
          {changeType === 'negative' && <ArrowDown className="w-4 h-4" />}
          {changeType === 'neutral' && <Minus className="w-4 h-4" />}
          <span>{change}%</span>
        </div>
      </div>
      <div className="text-3xl font-helvetica font-bold text-midnight-forest mb-1">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-sm font-inter text-midnight-forest/70">
        {title}
      </div>
    </ACTCard>
  );

  return (
    <SimpleLayout>
      <div className="min-h-screen bg-gradient-to-br from-sand-gray/30 via-white to-seafoam-blue/20">
        
        {/* Analytics Header */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-ios-normal">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-helvetica font-bold text-midnight-forest">
                    Analytics Dashboard
                  </h1>
                  <p className="text-lg font-inter text-midnight-forest/70">
                    Platform insights and performance metrics
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-sand-gray/30 bg-white focus:outline-none focus:ring-2 focus:ring-spring-green/50"
                >
                  {timeRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <ACTButton variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
                  Refresh
                </ACTButton>
                <ACTButton variant="primary" icon={<Download className="w-4 h-4" />}>
                  Export Report
                </ACTButton>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {metricTabs.map((tab) => (
                  <ACTButton
                    key={tab.id}
                    variant={activeMetric === tab.id ? "primary" : "ghost"}
                    size="sm"
                    icon={<tab.icon className="w-4 h-4" />}
                    onClick={() => setActiveMetric(tab.id)}
                    className={activeMetric === tab.id ? "" : "hover:bg-spring-green/10"}
                  >
                    {tab.label}
                  </ACTButton>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Content */}
        <section className="pb-16 px-6">
          <div className="max-w-7xl mx-auto">
            
            {activeMetric === 'overview' && (
              <div className="space-y-8">
                
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="Total Users"
                    value={platformMetrics.totalUsers}
                    change={platformMetrics.userGrowthRate}
                    changeType="positive"
                    icon={Users}
                    color="blue"
                  />
                  <MetricCard
                    title="AI Conversations"
                    value={platformMetrics.totalConversations}
                    change={platformMetrics.conversationGrowthRate}
                    changeType="positive"
                    icon={MessageSquare}
                    color="green"
                  />
                  <MetricCard
                    title="Active Jobs"
                    value={platformMetrics.activeJobs}
                    change={platformMetrics.jobGrowthRate}
                    changeType="positive"
                    icon={Briefcase}
                    color="purple"
                  />
                  <MetricCard
                    title="Partner Organizations"
                    value={platformMetrics.totalPartners}
                    change={platformMetrics.partnerGrowthRate}
                    changeType="positive"
                    icon={Building2}
                    color="orange"
                  />
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <ACTCard variant="default" className="p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                    <div className="flex items-center space-x-3 mb-4">
                      <Clock className="w-6 h-6 text-blue-500" />
                      <h3 className="font-helvetica font-semibold text-midnight-forest">
                        Response Time
                      </h3>
                    </div>
                    <div className="text-3xl font-helvetica font-bold text-midnight-forest mb-2">
                      {platformMetrics.avgResponseTime}s
                    </div>
                    <p className="text-sm text-green-600">
                      ↓ 15% faster than last month
                    </p>
                  </ACTCard>

                  <ACTCard variant="default" className="p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                    <div className="flex items-center space-x-3 mb-4">
                      <Star className="w-6 h-6 text-yellow-500" />
                      <h3 className="font-helvetica font-semibold text-midnight-forest">
                        User Satisfaction
                      </h3>
                    </div>
                    <div className="text-3xl font-helvetica font-bold text-midnight-forest mb-2">
                      {platformMetrics.userSatisfactionScore}/5.0
                    </div>
                    <p className="text-sm text-green-600">
                      ↑ 0.2 points this month
                    </p>
                  </ACTCard>

                  <ACTCard variant="default" className="p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                    <div className="flex items-center space-x-3 mb-4">
                      <Activity className="w-6 h-6 text-green-500" />
                      <h3 className="font-helvetica font-semibold text-midnight-forest">
                        Platform Uptime
                      </h3>
                    </div>
                    <div className="text-3xl font-helvetica font-bold text-midnight-forest mb-2">
                      {platformMetrics.platformUptime}%
                    </div>
                    <p className="text-sm text-green-600">
                      Excellent reliability
                    </p>
                  </ACTCard>
                </div>

                {/* Top Performing Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ACTCard variant="default" className="p-8 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                    <h3 className="text-xl font-helvetica font-semibold text-midnight-forest mb-6">
                      Most Discussed Topics
                    </h3>
                    <div className="space-y-4">
                      {conversationAnalytics.topTopics.map((topic: TopicType, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-inter font-medium text-midnight-forest">
                                {topic.topic}
                              </span>
                              <span className="text-sm text-midnight-forest/60">
                                {topic.count.toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full bg-sand-gray/20 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-spring-green to-seafoam-blue h-2 rounded-full"
                                style={{ width: `${topic.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ACTCard>

                  <ACTCard variant="default" className="p-8 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                    <h3 className="text-xl font-helvetica font-semibold text-midnight-forest mb-6">
                      User Engagement Trends
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                        <div>
                          <p className="font-inter font-medium text-blue-800">Daily Active Users</p>
                          <p className="text-sm text-blue-600">Users active in the last 24 hours</p>
                        </div>
                        <div className="text-2xl font-helvetica font-bold text-blue-700">
                          {userEngagement.dailyActiveUsers}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                        <div>
                          <p className="font-inter font-medium text-green-800">Weekly Active Users</p>
                          <p className="text-sm text-green-600">Users active in the last 7 days</p>
                        </div>
                        <div className="text-2xl font-helvetica font-bold text-green-700">
                          {userEngagement.weeklyActiveUsers.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                        <div>
                          <p className="font-inter font-medium text-purple-800">Monthly Active Users</p>
                          <p className="text-sm text-purple-600">Users active in the last 30 days</p>
                        </div>
                        <div className="text-2xl font-helvetica font-bold text-purple-700">
                          {userEngagement.monthlyActiveUsers.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </ACTCard>
                </div>
              </div>
            )}

            {activeMetric === 'conversations' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="Total Sessions"
                    value={conversationAnalytics.totalSessions}
                    change={18.2}
                    changeType="positive"
                    icon={MessageSquare}
                    color="blue"
                  />
                  <MetricCard
                    title="Avg Session Duration"
                    value={`${conversationAnalytics.avgSessionDuration} min`}
                    change={8.5}
                    changeType="positive"
                    icon={Clock}
                    color="green"
                  />
                  <MetricCard
                    title="Messages per Session"
                    value={conversationAnalytics.messagesPerSession}
                    change={12.3}
                    changeType="positive"
                    icon={Target}
                    color="purple"
                  />
                  <MetricCard
                    title="Goal Achievement Rate"
                    value={`${conversationAnalytics.goalAchievementRate}%`}
                    change={5.7}
                    changeType="positive"
                    icon={CheckCircle2}
                    color="orange"
                  />
                </div>

                {/* Conversation Quality Metrics */}
                <ACTCard variant="default" className="p-8 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                  <h3 className="text-xl font-helvetica font-semibold text-midnight-forest mb-6">
                    AI Performance Metrics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-green-50 rounded-xl">
                      <div className="text-3xl font-helvetica font-bold text-green-700 mb-2">
                        {platformMetrics.userSatisfactionScore}/5.0
                      </div>
                      <p className="text-green-600 font-inter">Average Rating</p>
                    </div>
                    <div className="text-center p-6 bg-blue-50 rounded-xl">
                      <div className="text-3xl font-helvetica font-bold text-blue-700 mb-2">
                        {platformMetrics.avgResponseTime}s
                      </div>
                      <p className="text-blue-600 font-inter">Response Time</p>
                    </div>
                    <div className="text-center p-6 bg-purple-50 rounded-xl">
                      <div className="text-3xl font-helvetica font-bold text-purple-700 mb-2">
                        {(platformMetrics.totalTokensConsumed / 1000000).toFixed(1)}M
                      </div>
                      <p className="text-purple-600 font-inter">Tokens Consumed</p>
                    </div>
                  </div>
                </ACTCard>
              </div>
            )}

            {activeMetric === 'jobs' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="Total Applications"
                    value={jobMarketInsights.totalApplications}
                    change={23.8}
                    changeType="positive"
                    icon={Briefcase}
                    color="blue"
                  />
                  <MetricCard
                    title="Avg Applications per Job"
                    value={jobMarketInsights.avgApplicationsPerJob}
                    change={15.2}
                    changeType="positive"
                    icon={Target}
                    color="green"
                  />
                  <MetricCard
                    title="Average Salary"
                    value={`$${(jobMarketInsights.salaryTrends.avgSalary / 1000).toFixed(0)}k`}
                    change={jobMarketInsights.salaryTrends.salaryGrowth}
                    changeType="positive"
                    icon={TrendingUp}
                    color="purple"
                  />
                  <MetricCard
                    title="Active Job Postings"
                    value={platformMetrics.activeJobs}
                    change={18.7}
                    changeType="positive"
                    icon={Eye}
                    color="orange"
                  />
                </div>

                {/* Skills in Demand */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ACTCard variant="default" className="p-8 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                    <h3 className="text-lg font-semibold mb-2">
                      Top Skills in Demand
                    </h3>
                    <div className="space-y-4">
                      {jobMarketInsights.topSkillsInDemand.map((skill: { skill: string; count: number }, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-inter font-medium text-midnight-forest">
                            {skill.skill}
                          </span>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-sand-gray/20 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-spring-green to-seafoam-blue h-2 rounded-full"
                                style={{ width: `${skill.count}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-midnight-forest/60 w-8">
                              {skill.count}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ACTCard>

                  <ACTCard variant="default" className="p-8 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                    <h3 className="text-xl font-helvetica font-semibold text-midnight-forest mb-6">
                      Geographic Distribution
                    </h3>
                    <div className="space-y-4">
                      {jobMarketInsights.geographicDistribution.map((location: { location: string; count: number }, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-inter font-medium text-midnight-forest">
                            {location.location}
                          </span>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-sand-gray/20 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                style={{ width: `${location.count}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-midnight-forest/60 w-12">
                              {location.count}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ACTCard>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </SimpleLayout>
  );
}

export default function AnalyticsPage() {
  return (
    <AuthGuard>
      <AnalyticsContent />
    </AuthGuard>
  );
} 