/**
 * Dashboard Page - Climate Economy Assistant
 * 2025 Modern Design Standards with iOS-Inspired Elements and WCAG Compliance
 * Location: app/dashboard/page.tsx
 */

'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/auth-context';
import { ACTButton } from '@/components/ACTButton';
import { ACTCard } from '@/components/ACTCard';
import { ACTFrameElement } from '@/components/ACTFrameElement';
import { SimpleLayout } from '@/components/SimpleLayout';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { LoadingDashboard } from '@/components/ui/LoadingStates';
import { 
  User, 
  Briefcase, 
  Users, 
  TrendingUp, 
  MessageSquare,
  FileText,
  Settings,
  Bell,
  Calendar,
  Target,
  Zap,
  Globe,
  ArrowRight,
  Plus,
  Search,
  Filter,
  BarChart3,
  Clock,
  CheckCircle2,
  Star,
  Award,
  Activity,
  Bookmark,
  Eye,
  Send,
  Download,
  ChevronRight
} from 'lucide-react';

// Mock component for auth status display
function AuthStatusDisplay() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <div className="mt-8 p-4 bg-spring-green/5 rounded-xl border border-spring-green/20">
      <p className="text-sm text-midnight-forest/70">
        Welcome back! You're logged in as <span className="font-semibold capitalize text-spring-green">{user.email}</span>
      </p>
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  console.log('DashboardContent rendered, user:', user?.email);

  // Real data from API - no more mock data
  const { data: dashboardStats, loading, error } = useDashboardData('job_seeker');
  console.log('Dashboard data:', { loading, error, hasData: !!dashboardStats });

  // Handle loading state
  if (loading) {
    console.log('DashboardContent showing loading state');
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
    console.log('DashboardContent showing error state:', error);
    return (
      <SimpleLayout>
        <div className="min-h-screen bg-gradient-to-br from-sand-gray/30 via-white to-seafoam-blue/20">
          <div className="max-w-7xl mx-auto py-16 px-6">
            <div className="text-center">
              <div className="text-red-600 mb-4">Error loading dashboard data</div>
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
  const currentStats = dashboardStats || {
    applications: 0,
    interviews: 0,
    saved_jobs: 0,
    profile_views: 0,
    response_rate: 0,
    active_searches: 0
  };

  console.log('DashboardContent rendering main content');
  return (
    <SimpleLayout>
      <div className="min-h-screen bg-gradient-to-br from-sand-gray/30 via-white to-seafoam-blue/20">
        
        {/* Enhanced Hero Section with Better Visual Hierarchy */}
        <section className="relative py-16 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-midnight-forest/5 via-transparent to-spring-green/5"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-spring-green/10 to-transparent rounded-full -translate-y-48 translate-x-48"></div>
          
          <div className="relative max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-spring-green to-moss-green rounded-2xl flex items-center justify-center shadow-ios-normal">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl lg:text-5xl font-helvetica font-bold text-midnight-forest leading-tight">
                      Welcome Back!
                    </h1>
                    <p className="text-lg font-inter text-midnight-forest/70">
                      Dashboard • Track your climate economy progress
                    </p>
                  </div>
                </div>
                
                <p className="text-xl font-inter text-midnight-forest/60 mb-8 max-w-2xl leading-relaxed">
                  Your personalized climate economy dashboard. Track progress, discover opportunities, and accelerate your impact in the clean energy transition.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <ACTButton 
                    variant="primary" 
                    size="lg"
                    icon={<ArrowRight className="w-5 h-5" />}
                    iconPosition="right"
                    href="/chat"
                    className="shadow-ios-normal hover:shadow-ios-prominent"
                  >
                    Start AI Chat
                  </ACTButton>
                  <ACTButton 
                    variant="outline" 
                    size="lg"
                    icon={<MessageSquare className="w-5 h-5" />}
                    href="/chat"
                    className="border-spring-green/30 hover:border-spring-green"
                  >
                    AI Assistant
                  </ACTButton>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <ACTFrameElement variant="brackets" className="p-8">
                  <div className="text-center">
                    <div className="text-4xl font-helvetica font-bold text-midnight-forest mb-2">
                      {currentStats.applications}
                    </div>
                    <p className="text-sm font-inter text-midnight-forest/60">
                      Applications Sent
                    </p>
                  </div>
                </ACTFrameElement>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Statistics Grid */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              <ACTCard 
                variant="glass" 
                className="p-6 bg-white/80 backdrop-blur-sm border border-white/40 hover:shadow-ios-normal transition-all duration-300"
                hover={true}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-spring-green/10 rounded-2xl flex items-center justify-center mb-4">
                    <Send className="w-7 h-7 text-spring-green" />
                  </div>
                  <div className="text-3xl font-helvetica font-bold text-midnight-forest mb-1">
                    {currentStats.applications}
                  </div>
                  <div className="text-sm font-inter text-midnight-forest/70 font-medium">
                    Applications Sent
                  </div>
                </div>
              </ACTCard>

              <ACTCard 
                variant="glass" 
                className="p-6 bg-white/80 backdrop-blur-sm border border-white/40 hover:shadow-ios-normal transition-all duration-300"
                hover={true}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-moss-green/10 rounded-2xl flex items-center justify-center mb-4">
                    <Calendar className="w-7 h-7 text-moss-green" />
                  </div>
                  <div className="text-3xl font-helvetica font-bold text-midnight-forest mb-1">
                    {currentStats.interviews}
                  </div>
                  <div className="text-sm font-inter text-midnight-forest/70 font-medium">
                    Interviews Scheduled
                  </div>
                </div>
              </ACTCard>

              <ACTCard 
                variant="glass" 
                className="p-6 bg-white/80 backdrop-blur-sm border border-white/40 hover:shadow-ios-normal transition-all duration-300"
                hover={true}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-seafoam-blue/10 rounded-2xl flex items-center justify-center mb-4">
                    <Bookmark className="w-7 h-7 text-seafoam-blue" />
                  </div>
                  <div className="text-3xl font-helvetica font-bold text-midnight-forest mb-1">
                    {currentStats.saved_jobs}
                  </div>
                  <div className="text-sm font-inter text-midnight-forest/70 font-medium">
                    Saved Jobs
                  </div>
                </div>
              </ACTCard>

              <ACTCard 
                variant="glass" 
                className="p-6 bg-white/80 backdrop-blur-sm border border-white/40 hover:shadow-ios-normal transition-all duration-300"
                hover={true}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <Eye className="w-7 h-7 text-amber-600" />
                  </div>
                  <div className="text-3xl font-helvetica font-bold text-midnight-forest mb-1">
                    {currentStats.profile_views}
                  </div>
                  <div className="text-sm font-inter text-midnight-forest/70 font-medium">
                    Profile Views
                  </div>
                </div>
              </ACTCard>

              <ACTCard 
                variant="glass" 
                className="p-6 bg-white/80 backdrop-blur-sm border border-white/40 hover:shadow-ios-normal transition-all duration-300"
                hover={true}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div className="text-3xl font-helvetica font-bold text-midnight-forest mb-1">
                    {currentStats.response_rate}%
                  </div>
                  <div className="text-sm font-inter text-midnight-forest/70 font-medium">
                    Response Rate
                  </div>
                </div>
              </ACTCard>

              <ACTCard 
                variant="glass" 
                className="p-6 bg-white/80 backdrop-blur-sm border border-white/40 hover:shadow-ios-normal transition-all duration-300"
                hover={true}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-purple-600" />
                  </div>
                  <div className="text-3xl font-helvetica font-bold text-midnight-forest mb-1">
                    {currentStats.active_searches}
                  </div>
                  <div className="text-sm font-inter text-midnight-forest/70 font-medium">
                    Active Searches
                  </div>
                </div>
              </ACTCard>
            </div>
          </div>
        </section>

        <AuthStatusDisplay />
      </div>
    </SimpleLayout>
  );
}

export default function DashboardPage() {
  console.log('DashboardPage rendered');
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
} 