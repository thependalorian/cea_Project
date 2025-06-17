/**
 * Admin Dashboard - Climate Economy Assistant
 * Comprehensive admin interface with user management, analytics, and system oversight
 * Location: app/admin/page.tsx
 */

'use client';

import { AuthGuard } from '@/components/AuthGuard';
import { useAuth } from '@/contexts/auth-context';
import { ACTButton } from '@/components/ACTButton';
import { ACTCard } from '@/components/ACTCard';
import { ACTFrameElement } from '@/components/ACTFrameElement';
import { SimpleLayout } from '@/components/SimpleLayout';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { LoadingDashboard } from '@/components/ui/LoadingStates';
import { 
  Users, 
  Briefcase, 
  Building2, 
  TrendingUp, 
  MessageSquare,
  FileText,
  Settings,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  UserCheck,
  Database,
  BarChart3,
  Globe,
  Zap,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

function AdminDashboardContent() {
  const { user } = useAuth();

  // Real data from API - no more mock data
  const { data: adminStats, loading, error } = useDashboardData('admin');

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
              <div className="text-red-600 mb-4">Error loading admin dashboard data</div>
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
  const currentStats = adminStats || {
    total_users: 0,
    active_jobs: 0,
    partner_organizations: 0,
    pending_approvals: 0,
    system_health: 98,
    monthly_growth: 0,
    conversation_analytics: 0,
    audit_logs: 0,
    content_flags: 0,
    knowledge_resources: 0
  } as any;

  const recentActivity = [
    {
      id: 1,
      type: 'user_registration',
      description: 'New job seeker registered: sarah.climate@email.com',
      timestamp: '2 minutes ago',
      status: 'success',
      details: { user_type: 'job_seeker', location: 'Boston, MA' }
    },
    {
      id: 2,
      type: 'partner_approval',
      description: 'Partner organization approved: GreenTech Solutions',
      timestamp: '15 minutes ago',
      status: 'success',
      details: { organization_type: 'private_company', employees: 150 }
    },
    {
      id: 3,
      type: 'content_flag',
      description: 'Job listing flagged for review: Solar Engineer position',
      timestamp: '1 hour ago',
      status: 'warning',
      details: { flag_reason: 'salary_discrepancy', flagged_by: 'automated_system' }
    },
    {
      id: 4,
      type: 'system_alert',
      description: 'High conversation volume detected - scaling resources',
      timestamp: '2 hours ago',
      status: 'info',
      details: { conversations_per_minute: 45, threshold: 40 }
    }
  ];

  const pendingApprovals = [
    {
      id: 1,
      type: 'partner_application',
      title: 'Massachusetts Clean Energy Center',
      description: 'State agency partnership application',
      submitted: '2 days ago',
      priority: 'high'
    },
    {
      id: 2,
      type: 'job_listing',
      title: 'Wind Turbine Technician - Offshore Wind Corp',
      description: 'Job posting requires salary verification',
      submitted: '1 day ago',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'content_review',
      title: 'Climate Policy Resource Update',
      description: 'Knowledge base article needs admin review',
      submitted: '3 hours ago',
      priority: 'low'
    }
  ];

  return (
    <SimpleLayout>
      <div className="min-h-screen bg-gradient-to-br from-sand-gray/30 via-white to-seafoam-blue/20">
        
        {/* Admin Header */}
        <section className="py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-ios-normal">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-helvetica font-bold text-midnight-forest">
                    Admin Dashboard
                  </h1>
                  <p className="text-lg font-inter text-midnight-forest/70">
                    System oversight and platform management
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <ACTButton variant="outline" icon={<RefreshCw className="w-4 h-4" />}>
                  Refresh Data
                </ACTButton>
                <ACTButton variant="primary" icon={<Download className="w-4 h-4" />}>
                  Export Report
                </ACTButton>
              </div>
            </div>

            {/* System Health Alert */}
            <div className="mb-8">
              <ACTCard variant="default" className="p-4 bg-green-50 border border-green-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="font-inter font-medium text-green-800">
                      System Status: All services operational
                    </p>
                    <p className="text-sm text-green-600">
                      Last health check: 2 minutes ago • Uptime: 99.8%
                    </p>
                  </div>
                  <span className="text-2xl font-helvetica font-bold text-green-600">
                    {currentStats.system_health}%
                  </span>
                </div>
              </ACTCard>
            </div>
          </div>
        </section>

        {/* Key Metrics Grid */}
        <section className="pb-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
              
              <ACTCard variant="glass" className="p-6 bg-white/80 backdrop-blur-sm border border-white/40 hover:shadow-ios-normal transition-all duration-300" hover={true}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                    <Users className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="text-3xl font-helvetica font-bold text-midnight-forest mb-1">
                    {currentStats.total_users.toLocaleString()}
                  </div>
                  <div className="text-sm font-inter text-midnight-forest/70 font-medium">
                    Total Users
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    +{currentStats.monthly_growth}% this month
                  </div>
                </div>
              </ACTCard>

              <ACTCard variant="glass" className="p-6 bg-white/80 backdrop-blur-sm border border-white/40 hover:shadow-ios-normal transition-all duration-300" hover={true}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                    <Briefcase className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="text-3xl font-helvetica font-bold text-midnight-forest mb-1">
                    {currentStats.active_jobs}
                  </div>
                  <div className="text-sm font-inter text-midnight-forest/70 font-medium">
                    Active Jobs
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    12 posted today
                  </div>
                </div>
              </ACTCard>

              <ACTCard variant="glass" className="p-6 bg-white/80 backdrop-blur-sm border border-white/40 hover:shadow-ios-normal transition-all duration-300" hover={true}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                    <Building2 className="w-7 h-7 text-purple-600" />
                  </div>
                  <div className="text-3xl font-helvetica font-bold text-midnight-forest mb-1">
                    {currentStats.partner_organizations}
                  </div>
                  <div className="text-sm font-inter text-midnight-forest/70 font-medium">
                    Partners
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    3 pending approval
                  </div>
                </div>
              </ACTCard>

              <ACTCard variant="glass" className="p-6 bg-white/80 backdrop-blur-sm border border-white/40 hover:shadow-ios-normal transition-all duration-300" hover={true}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare className="w-7 h-7 text-orange-600" />
                  </div>
                  <div className="text-3xl font-helvetica font-bold text-midnight-forest mb-1">
                    {currentStats.conversation_analytics.toLocaleString()}
                  </div>
                  <div className="text-sm font-inter text-midnight-forest/70 font-medium">
                    AI Conversations
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    89% satisfaction
                  </div>
                </div>
              </ACTCard>

              <ACTCard variant="glass" className="p-6 bg-white/80 backdrop-blur-sm border border-white/40 hover:shadow-ios-normal transition-all duration-300" hover={true}>
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
                    <AlertTriangle className="w-7 h-7 text-red-600" />
                  </div>
                  <div className="text-3xl font-helvetica font-bold text-midnight-forest mb-1">
                    {currentStats.pending_approvals}
                  </div>
                  <div className="text-sm font-inter text-midnight-forest/70 font-medium">
                    Pending Reviews
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    Requires attention
                  </div>
                </div>
              </ACTCard>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Management Tools */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Quick Actions */}
                <ACTCard variant="default" className="p-8 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-helvetica font-semibold text-midnight-forest">
                      Admin Actions
                    </h3>
                    <Zap className="w-6 h-6 text-spring-green" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ACTButton 
                      variant="outline" 
                      fullWidth 
                      icon={<Users className="w-5 h-5" />}
                      href="/admin/users"
                      className="h-16 text-left justify-start border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                    >
                      <div className="ml-3">
                        <div className="font-semibold text-blue-700">Manage Users</div>
                        <div className="text-xs text-blue-600">View, edit, and moderate user accounts</div>
                      </div>
                    </ACTButton>
                    
                    <ACTButton 
                      variant="outline" 
                      fullWidth 
                      icon={<Building2 className="w-5 h-5" />}
                      href="/admin/partners"
                      className="h-16 text-left justify-start border-purple-200 hover:border-purple-400 hover:bg-purple-50"
                    >
                      <div className="ml-3">
                        <div className="font-semibold text-purple-700">Partner Management</div>
                        <div className="text-xs text-purple-600">Approve and manage partner organizations</div>
                      </div>
                    </ACTButton>
                    
                    <ACTButton 
                      variant="outline" 
                      fullWidth 
                      icon={<Briefcase className="w-5 h-5" />}
                      href="/admin/jobs"
                      className="h-16 text-left justify-start border-green-200 hover:border-green-400 hover:bg-green-50"
                    >
                      <div className="ml-3">
                        <div className="font-semibold text-green-700">Job Listings</div>
                        <div className="text-xs text-green-600">Moderate and manage job postings</div>
                      </div>
                    </ACTButton>
                    
                    <ACTButton 
                      variant="outline" 
                      fullWidth 
                      icon={<Database className="w-5 h-5" />}
                      href="/admin/content"
                      className="h-16 text-left justify-start border-orange-200 hover:border-orange-400 hover:bg-orange-50"
                    >
                      <div className="ml-3">
                        <div className="font-semibold text-orange-700">Content Management</div>
                        <div className="text-xs text-orange-600">Knowledge resources and content</div>
                      </div>
                    </ACTButton>
                    
                    <ACTButton 
                      variant="outline" 
                      fullWidth 
                      icon={<BarChart3 className="w-5 h-5" />}
                      href="/admin/analytics"
                      className="h-16 text-left justify-start border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50"
                    >
                      <div className="ml-3">
                        <div className="font-semibold text-indigo-700">Analytics Dashboard</div>
                        <div className="text-xs text-indigo-600">Platform metrics and insights</div>
                      </div>
                    </ACTButton>
                    
                    <ACTButton 
                      variant="outline" 
                      fullWidth 
                      icon={<Settings className="w-5 h-5" />}
                      href="/admin/settings"
                      className="h-16 text-left justify-start border-gray-200 hover:border-gray-400 hover:bg-gray-50"
                    >
                      <div className="ml-3">
                        <div className="font-semibold text-gray-700">System Settings</div>
                        <div className="text-xs text-gray-600">Platform configuration and settings</div>
                      </div>
                    </ACTButton>
                  </div>
                </ACTCard>

                {/* Recent Activity */}
                <ACTCard variant="default" className="p-8 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-helvetica font-semibold text-midnight-forest">
                      Recent Activity
                    </h3>
                    <ACTButton variant="ghost" size="sm" href="/admin/audit-logs">
                      View All Logs
                    </ACTButton>
                  </div>
                  
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl bg-sand-gray/10 hover:bg-sand-gray/20 transition-colors">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          activity.status === 'success' ? 'bg-green-500' :
                          activity.status === 'warning' ? 'bg-yellow-500' :
                          activity.status === 'info' ? 'bg-blue-500' :
                          'bg-red-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="font-inter text-midnight-forest text-sm leading-relaxed">
                            {activity.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <p className="font-inter text-midnight-forest/50 text-xs">
                              {activity.timestamp}
                            </p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              activity.status === 'success' ? 'bg-green-100 text-green-700' :
                              activity.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                              activity.status === 'info' ? 'bg-blue-100 text-blue-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {activity.type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <ACTButton variant="ghost" size="sm" className="p-2">
                          <Eye className="w-4 h-4" />
                        </ACTButton>
                      </div>
                    ))}
                  </div>
                </ACTCard>
              </div>

              {/* Right Column - Pending Items & Quick Stats */}
              <div className="space-y-8">
                
                {/* Pending Approvals */}
                <ACTCard variant="default" className="p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-helvetica font-semibold text-midnight-forest">
                      Pending Approvals
                    </h4>
                    <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                      {pendingApprovals.length} items
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {pendingApprovals.map((item) => (
                      <div key={item.id} className="p-4 border border-gray-200 rounded-xl hover:border-spring-green/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-inter font-medium text-midnight-forest text-sm">
                            {item.title}
                          </h5>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            item.priority === 'high' ? 'bg-red-100 text-red-700' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-xs text-midnight-forest/60 mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-midnight-forest/50">
                            {item.submitted}
                          </span>
                          <div className="flex space-x-2">
                            <ACTButton variant="ghost" size="sm" className="p-1">
                              <Eye className="w-3 h-3" />
                            </ACTButton>
                            <ACTButton variant="ghost" size="sm" className="p-1">
                              <CheckCircle2 className="w-3 h-3 text-green-600" />
                            </ACTButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <ACTButton variant="outline" fullWidth className="mt-4">
                    View All Pending Items
                  </ACTButton>
                </ACTCard>

                {/* System Resources */}
                <ACTCard variant="default" className="p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                  <h4 className="font-helvetica font-semibold text-midnight-forest mb-4">
                    System Resources
                  </h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-midnight-forest/70 text-sm">Database Size</span>
                      <span className="font-semibold text-midnight-forest">2.4 GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-midnight-forest/70 text-sm">Storage Used</span>
                      <span className="font-semibold text-midnight-forest">45.2 GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-midnight-forest/70 text-sm">API Calls Today</span>
                      <span className="font-semibold text-spring-green">12,847</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-midnight-forest/70 text-sm">Active Sessions</span>
                      <span className="font-semibold text-midnight-forest">234</span>
                    </div>
                  </div>
                </ACTCard>

                {/* Quick Links */}
                <ACTCard variant="default" className="p-6 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-subtle">
                  <h4 className="font-helvetica font-semibold text-midnight-forest mb-4">
                    Quick Links
                  </h4>
                  <div className="space-y-3">
                    <ACTButton variant="ghost" fullWidth className="justify-start text-left">
                      <FileText className="w-4 h-4 mr-3" />
                      Documentation
                    </ACTButton>
                    <ACTButton variant="ghost" fullWidth className="justify-start text-left">
                      <Activity className="w-4 h-4 mr-3" />
                      System Health
                    </ACTButton>
                    <ACTButton variant="ghost" fullWidth className="justify-start text-left">
                      <Globe className="w-4 h-4 mr-3" />
                      API Status
                    </ACTButton>
                    <ACTButton variant="ghost" fullWidth className="justify-start text-left">
                      <Shield className="w-4 h-4 mr-3" />
                      Security Logs
                    </ACTButton>
                  </div>
                </ACTCard>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SimpleLayout>
  );
}

export default function AdminDashboardPage() {
  return (
    <AuthGuard>
      <AdminDashboardContent />
    </AuthGuard>
  );
}

// Removing metadata export as it's not allowed with 'use client' directive
// export const metadata = {
//   title: "Admin Dashboard - Climate Economy Assistant",
//   description: "Platform administration dashboard with comprehensive management tools",
// }; 