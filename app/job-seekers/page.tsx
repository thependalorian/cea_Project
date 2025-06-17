/**
 * Job Seekers Dashboard - Climate Economy Assistant
 * Enhanced AI-driven career assistant dashboard with advanced features
 * Location: app/job-seekers/page.tsx
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { 
  MessageCircle,
  Zap,
  Target,
  Award,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Brain,
  Sparkles,
  Users,
  BookOpen,
  ArrowRight,
  FileText,
  Heart,
  MapPin,
  Clock,
  Search,
  Bell
} from "lucide-react";
import { ClimateChat } from "@/components/chat/ClimateChat";
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { LoadingDashboard, LoadingSpinner } from '@/components/ui/LoadingStates';
import { AdvancedSearchInterface } from '@/components/search/AdvancedSearchInterface';
import { useJobSeekerProfile, useJobs, useJobStats, useRealtimeJobs } from '@/hooks/use-supabase-data';
import { useMobileOptimization } from '@/hooks/use-mobile-optimization';

function JobSeekersDashboardContent() {
  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Data hooks with real-time updates
  const { data: jobSeekerProfile, loading: profileLoading, error: profileError } = useJobSeekerProfile();
  const { data: jobStats } = useJobStats();
  const { jobs: realtimeJobs, loading: jobsLoading } = useRealtimeJobs();
  
  // Mobile optimization
  const { screenSize, responsiveClasses } = useMobileOptimization();

  // Calculate AI engagement metrics
  const totalInteractions = 5; // This would come from conversation analytics
  const avgConfidenceScore = 0.85;
  const highQualityMatches = realtimeJobs.filter(job => job.match_score && job.match_score > 80).length;

  // Calculate profile readiness for AI matching
  const getAIReadinessScore = () => {
    if (!jobSeekerProfile) return 0;
    
    let score = 0;
    if (jobSeekerProfile.full_name) score += 10;
    if (jobSeekerProfile.current_title) score += 15;
    if (jobSeekerProfile.location) score += 10;
    if (jobSeekerProfile.resume_uploaded_at) score += 30;
    if (jobSeekerProfile.climate_focus_areas?.length > 0) score += 15;
    if (jobSeekerProfile.desired_roles?.length > 0) score += 10;
    if (jobSeekerProfile.experience_level) score += 10;
    return score;
  };

  const aiReadinessScore = getAIReadinessScore();

  // Handle job selection
  const handleJobClick = (job: any) => {
    if (screenSize.isMobile) {
      window.location.href = `/jobs/${job.id}`;
    } else {
      // Open in modal or side panel
      console.log('Selected job:', job);
    }
  };

  if (profileLoading) {
    return <LoadingDashboard />;
  }

  return (
    <ErrorBoundary level="page">
      <div className={`space-y-6 ${responsiveClasses.container}`}>
        {/* AI-Powered Welcome Header */}
        <div className="bg-gradient-to-r from-spring-green/10 via-seafoam-blue/10 to-moss-green/10 rounded-2xl p-6 border border-sand-gray/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-spring-green/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-spring-green to-seafoam-blue rounded-xl flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-helvetica font-bold text-midnight-forest">
                      Welcome back, {jobSeekerProfile?.full_name || user?.email?.split('@')[0] || 'Climate Professional'}!
                    </h1>
                    <p className="text-midnight-forest/70 font-helvetica">
                      Your AI-powered climate career assistant is ready to help
                    </p>
                  </div>
                </div>
                
                <div className={`flex items-center ${screenSize.isMobile ? 'flex-col space-y-2' : 'space-x-6'} mt-4`}>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-spring-green" />
                    <span className="text-sm font-helvetica font-medium text-midnight-forest">
                      {totalInteractions} AI Interactions
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-seafoam-blue" />
                    <span className="text-sm font-helvetica font-medium text-midnight-forest">
                      {highQualityMatches} High-Quality Matches
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-moss-green" />
                    <span className="text-sm font-helvetica font-medium text-midnight-forest">
                      {jobStats?.active || 0} Active Jobs
                    </span>
                  </div>
                  {jobSeekerProfile?.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-midnight-forest/40" />
                      <span className="text-sm font-helvetica text-midnight-forest/60">
                        {jobSeekerProfile.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="btn btn-ghost btn-circle"
                  >
                    <Bell className="w-5 h-5" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                      <div className="p-4">
                        <h3 className="font-semibold mb-3">Recent Updates</h3>
                        <div className="space-y-2 text-sm">
                          <div className="p-2 bg-blue-50 rounded">
                            <div className="font-medium">New Job Matches</div>
                            <div className="text-gray-600">{highQualityMatches} new positions match your profile</div>
                          </div>
                          <div className="p-2 bg-green-50 rounded">
                            <div className="font-medium">Profile Enhancement</div>
                            <div className="text-gray-600">Complete your profile for better AI matching</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Readiness Score */}
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-spring-green mb-2">
                    <Zap className="w-5 h-5" />
                    <span className="font-helvetica font-medium">AI Readiness</span>
                  </div>
                  <p className="text-3xl font-helvetica font-bold text-midnight-forest">
                    {aiReadinessScore}%
                  </p>
                  <p className="text-sm text-midnight-forest/60 font-helvetica">
                    {aiReadinessScore >= 80 ? 'Optimized!' : 'Enhance profile'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-midnight-forest">Quick Actions</h2>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="btn btn-primary btn-sm"
          >
            <Search className="w-4 h-4 mr-2" />
            {showSearch ? 'Hide Search' : 'Advanced Search'}
          </button>
        </div>

        {/* Advanced Search Interface */}
        {showSearch && (
          <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
            <AdvancedSearchInterface
              placeholder="Search climate jobs, companies, or skills..."
              contentTypes={['job']}
              onResultClick={handleJobClick}
              showFilters={true}
            />
          </div>
        )}

        {/* AI Readiness Enhancement */}
        {aiReadinessScore < 100 && (
          <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-helvetica font-semibold text-midnight-forest">
                  Enhance Your AI Experience
                </h3>
                <p className="text-sm text-midnight-forest/60 font-helvetica">
                  Complete your profile to unlock advanced AI recommendations and direct connections
                </p>
              </div>
            </div>
            
            <div className="w-full bg-sand-gray/20 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-spring-green to-seafoam-blue h-3 rounded-full transition-all duration-300"
                style={{ width: `${aiReadinessScore}%` }}
              ></div>
            </div>
            
            <div className={`grid grid-cols-1 ${screenSize.isDesktop ? 'md:grid-cols-2 lg:grid-cols-3' : ''} gap-4`}>
              {!jobSeekerProfile?.resume_uploaded_at && (
                <div className="flex items-center space-x-3 p-4 border border-spring-green/20 rounded-xl bg-spring-green/5">
                  <FileText className="w-6 h-6 text-spring-green" />
                  <div>
                    <p className="font-helvetica font-medium text-midnight-forest">Upload Resume</p>
                    <p className="text-sm text-midnight-forest/60 font-helvetica">+30% AI matching accuracy</p>
                  </div>
                </div>
              )}
              
              {(!jobSeekerProfile?.climate_focus_areas || jobSeekerProfile.climate_focus_areas.length === 0) && (
                <div className="flex items-center space-x-3 p-4 border border-seafoam-blue/20 rounded-xl bg-seafoam-blue/5">
                  <Target className="w-6 h-6 text-seafoam-blue" />
                  <div>
                    <p className="font-helvetica font-medium text-midnight-forest">Set Climate Focus</p>
                    <p className="text-sm text-midnight-forest/60 font-helvetica">+15% relevant opportunities</p>
                  </div>
                </div>
              )}
              
              {(!jobSeekerProfile?.desired_roles || jobSeekerProfile.desired_roles.length === 0) && (
                <div className="flex items-center space-x-3 p-4 border border-moss-green/20 rounded-xl bg-moss-green/5">
                  <Award className="w-6 h-6 text-moss-green" />
                  <div>
                    <p className="font-helvetica font-medium text-midnight-forest">Define Career Goals</p>
                    <p className="text-sm text-midnight-forest/60 font-helvetica">+10% targeted matches</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Real-time Job Recommendations */}
        <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-spring-green to-seafoam-blue rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-helvetica font-semibold text-midnight-forest">
                  AI-Powered Job Recommendations
                </h3>
                <div className="flex items-center space-x-2 text-sm text-midnight-forest/60">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Live updates • {realtimeJobs.length} opportunities</span>
                </div>
              </div>
            </div>
            
            {jobsLoading && <LoadingSpinner size="sm" />}
          </div>

          {realtimeJobs.length > 0 ? (
            <div className={`grid grid-cols-1 ${screenSize.isDesktop ? 'lg:grid-cols-2' : ''} gap-4`}>
              {realtimeJobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  className="border border-sand-gray/20 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleJobClick(job)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-helvetica font-semibold text-midnight-forest line-clamp-1">
                        {job.title}
                      </h4>
                      <p className="text-sm text-midnight-forest/60 font-helvetica">
                        {job.partner_profiles?.organization_name || 'Climate Company'}
                      </p>
                    </div>
                    {job.match_score && (
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        {job.match_score}% match
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-midnight-forest/70 mb-3 line-clamp-2">
                    {job.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-midnight-forest/50">
                    <span>{job.location || 'Remote'}</span>
                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-midnight-forest/60">No job recommendations available yet.</p>
              <p className="text-sm text-midnight-forest/40">Complete your profile to get personalized matches.</p>
            </div>
          )}
          
          {realtimeJobs.length > 4 && (
            <div className="text-center mt-6">
              <button 
                className="btn btn-outline"
                onClick={() => setShowSearch(true)}
              >
                View All {realtimeJobs.length} Opportunities
              </button>
            </div>
          )}
        </div>

        {/* Climate Chat Integration */}
        <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-moss-green to-spring-green rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-helvetica font-semibold text-midnight-forest">
                AI Career Assistant
              </h3>
              <p className="text-sm text-midnight-forest/60 font-helvetica">
                Get personalized career guidance and job search support
              </p>
            </div>
          </div>
          
          <ClimateChat />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default function JobSeekersDashboard() {
  return (
    <AuthGuard allowedRoles={['job_seeker'] as any[]}>
      <JobSeekersDashboardContent />
    </AuthGuard>
  );
} 