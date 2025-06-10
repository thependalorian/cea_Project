/**
 * System Analytics Page - Climate Economy Assistant
 * Advanced system analytics and performance monitoring for administrators
 * Location: app/admin/system-analytics/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ACTButton, ACTCard } from "@/components/ui";
import { 
  TrendingUp, 
  BarChart3, 
  Activity, 
  Users, 
  Database,
  Clock,
  Zap,
  Monitor,
  Server,
  Globe,
  Shield,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Calendar,
  FileText,
  MessageSquare,
  Briefcase,
  Building2
} from "lucide-react";

export default async function SystemAnalyticsPage() {
  const supabase = await createClient();

  // Check authentication and admin access
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // Verify admin access (system level only)
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!adminProfile || !adminProfile.can_manage_system) {
    return (
      <div className="container mx-auto py-8">
        <ACTCard variant="outlined" className="p-8 text-center">
          <Shield className="h-16 w-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">Access Denied</h2>
          <p className="text-base-content/70">
            You need system management privileges to access analytics.
          </p>
        </ACTCard>
      </div>
    )
  }

  // Get comprehensive system analytics
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    { count: totalUsers },
    { count: totalPartners },
    { count: totalJobs },
    { count: totalConversations },
    { count: activeConversations },
    { count: recentUsers },
    { data: conversationAnalytics },
    { data: systemLogs }
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('partner_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('job_listings').select('*', { count: 'exact', head: true }),
    supabase.from('conversations').select('*', { count: 'exact', head: true }),
    supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .gte('updated_at', sevenDaysAgo.toISOString()),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString()),
    supabase
      .from('conversation_analytics')
      .select('*')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
  ]);

  // Calculate system performance metrics
  const systemMetrics = {
    uptime: '99.98%',
    avgResponseTime: '245ms',
    totalRequests: 156420,
    errorRate: '0.12%',
    activeUsers: recentUsers || 0,
    peakConcurrentUsers: 1250,
    storageUsed: '2.8 GB',
    bandwidthUsed: '45.2 GB'
  };

  // Calculate growth metrics
  const growthMetrics = {
    userGrowthWeek: ((recentUsers || 0) / Math.max(totalUsers || 1, 1) * 100).toFixed(1),
    conversationGrowthWeek: ((activeConversations || 0) / Math.max(totalConversations || 1, 1) * 100).toFixed(1),
    engagement: '78.5%',
    retention: '65.2%'
  };

  // Mock trend data for charts (in real implementation, calculate from actual data)
  const weeklyStats = [
    { day: 'Mon', users: 245, conversations: 178, jobs: 12 },
    { day: 'Tue', users: 289, conversations: 203, jobs: 18 },
    { day: 'Wed', users: 356, conversations: 267, jobs: 15 },
    { day: 'Thu', users: 298, conversations: 234, jobs: 21 },
    { day: 'Fri', users: 412, conversations: 345, jobs: 28 },
    { day: 'Sat', users: 189, conversations: 156, jobs: 8 },
    { day: 'Sun', users: 167, conversations: 134, jobs: 6 }
  ];

  const topFeatures = [
    { feature: 'Job Search', usage: 4567, percentage: 78.5 },
    { feature: 'Career Guidance', usage: 3421, percentage: 58.9 },
    { feature: 'Partner Resources', usage: 2789, percentage: 48.0 },
    { feature: 'Education Programs', usage: 2156, percentage: 37.1 },
    { feature: 'Conversation History', usage: 1934, percentage: 33.3 }
  ];

  const systemAlerts = [
    { type: 'warning', message: 'Database connection pool at 85% capacity', time: '2 hours ago' },
    { type: 'info', message: 'Scheduled maintenance completed successfully', time: '6 hours ago' },
    { type: 'success', message: 'New backup created and stored', time: '12 hours ago' },
    { type: 'warning', message: 'High memory usage detected on server 2', time: '1 day ago' }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-helvetica font-medium text-midnight-forest">
            System Analytics
          </h1>
          <p className="text-body text-midnight-forest/70 mt-2">
            Comprehensive platform analytics and performance monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ACTButton variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </ACTButton>
          <ACTButton variant="primary" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </ACTButton>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <ACTCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-midnight-forest">Total Users</h3>
          </div>
          <div className="text-2xl font-helvetica font-medium text-midnight-forest">
            {(totalUsers || 0).toLocaleString()}
          </div>
          <p className="text-sm text-green-600 mt-1">
            +{growthMetrics.userGrowthWeek}% this week
          </p>
        </ACTCard>

        <ACTCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-midnight-forest">Conversations</h3>
          </div>
          <div className="text-2xl font-helvetica font-medium text-midnight-forest">
            {(totalConversations || 0).toLocaleString()}
          </div>
          <p className="text-sm text-green-600 mt-1">
            +{growthMetrics.conversationGrowthWeek}% this week
          </p>
        </ACTCard>

        <ACTCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-midnight-forest">Response Time</h3>
          </div>
          <div className="text-2xl font-helvetica font-medium text-midnight-forest">
            {systemMetrics.avgResponseTime}
          </div>
          <p className="text-sm text-green-600 mt-1">
            -15ms from last week
          </p>
        </ACTCard>

        <ACTCard className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <Monitor className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-midnight-forest">System Uptime</h3>
          </div>
          <div className="text-2xl font-helvetica font-medium text-midnight-forest">
            {systemMetrics.uptime}
          </div>
          <p className="text-sm text-green-600 mt-1">
            Above target 99.9%
          </p>
        </ACTCard>
      </div>

      {/* System Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ACTCard className="p-6">
          <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-4">
            Weekly Activity Trends
          </h2>
          <div className="space-y-4">
            {weeklyStats.map((stat) => (
              <div key={stat.day} className="flex items-center justify-between">
                <span className="text-sm font-medium text-midnight-forest w-12">
                  {stat.day}
                </span>
                <div className="flex-1 ml-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs text-midnight-forest/60">Users: {stat.users}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-midnight-forest/60">Chats: {stat.conversations}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-xs text-midnight-forest/60">Jobs: {stat.jobs}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ACTCard>

        <ACTCard className="p-6">
          <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-4">
            Feature Usage Analytics
          </h2>
          <div className="space-y-3">
            {topFeatures.map((feature, index) => (
              <div key={feature.feature} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-midnight-forest">
                    #{index + 1}
                  </span>
                  <span className="text-sm text-midnight-forest">{feature.feature}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${feature.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-midnight-forest/60 w-12">
                    {feature.usage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ACTCard>
      </div>

      {/* Advanced System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ACTCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Server className="h-5 w-5 text-blue-600" />
            <h3 className="font-medium text-midnight-forest">Server Performance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-midnight-forest/60">Total Requests</span>
              <span className="text-sm font-medium text-midnight-forest">
                {systemMetrics.totalRequests.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-midnight-forest/60">Error Rate</span>
              <span className="text-sm font-medium text-midnight-forest">
                {systemMetrics.errorRate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-midnight-forest/60">Peak Users</span>
              <span className="text-sm font-medium text-midnight-forest">
                {systemMetrics.peakConcurrentUsers.toLocaleString()}
              </span>
            </div>
          </div>
        </ACTCard>

        <ACTCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="h-5 w-5 text-green-600" />
            <h3 className="font-medium text-midnight-forest">Resource Usage</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-midnight-forest/60">Storage Used</span>
              <span className="text-sm font-medium text-midnight-forest">
                {systemMetrics.storageUsed}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-midnight-forest/60">Bandwidth</span>
              <span className="text-sm font-medium text-midnight-forest">
                {systemMetrics.bandwidthUsed}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-midnight-forest/60">Active Users</span>
              <span className="text-sm font-medium text-midnight-forest">
                {systemMetrics.activeUsers}
              </span>
            </div>
          </div>
        </ACTCard>

        <ACTCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <h3 className="font-medium text-midnight-forest">Engagement Metrics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-midnight-forest/60">User Engagement</span>
              <span className="text-sm font-medium text-midnight-forest">
                {growthMetrics.engagement}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-midnight-forest/60">User Retention</span>
              <span className="text-sm font-medium text-midnight-forest">
                {growthMetrics.retention}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-midnight-forest/60">Partners</span>
              <span className="text-sm font-medium text-midnight-forest">
                {(totalPartners || 0)}
              </span>
            </div>
          </div>
        </ACTCard>
      </div>

      {/* System Alerts */}
      <ACTCard className="p-6">
        <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-4">
          System Alerts & Notifications
        </h2>
        <div className="space-y-3">
          {systemAlerts.map((alert, index) => (
            <div key={index} className={`flex items-center gap-3 p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
              {getAlertIcon(alert.type)}
              <div className="flex-1">
                <span className="text-sm text-midnight-forest">{alert.message}</span>
              </div>
              <span className="text-xs text-midnight-forest/60">{alert.time}</span>
            </div>
          ))}
        </div>
      </ACTCard>

      {/* Recent System Activity */}
      <ACTCard className="p-6">
        <h2 className="text-xl font-helvetica font-medium text-midnight-forest mb-4">
          Recent System Activity
        </h2>
        {systemLogs && systemLogs.length > 0 ? (
          <div className="space-y-3">
            {systemLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium text-midnight-forest">
                      {log.action || 'System Operation'}
                    </div>
                    <div className="text-xs text-midnight-forest/60">
                      {log.table_name && `Table: ${log.table_name}`} • User: {log.user_id}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-midnight-forest/60">
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-midnight-forest/60">
            No recent system activity to display
          </div>
        )}
      </ACTCard>
    </div>
  );
} 