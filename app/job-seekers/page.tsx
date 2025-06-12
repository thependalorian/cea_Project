/**
 * Job Seekers Dashboard - Climate Economy Assistant
 * AI-driven career assistant dashboard with integrated chat interface
 * Location: app/job-seekers/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
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
  Clock
} from "lucide-react";
import { ClimateChat } from "@/components/chat/ClimateChat";
import { redirect } from "next/navigation";

export default async function JobSeekersDashboard() {
  const supabase = await createClient();
  
  // Get current user and verify job seeker access
  const { data: { user } } = await supabase.auth.getUser();
  
  // If no user, redirect to login instead of throwing error
  if (!user) {
    redirect('/auth/login');
  }

  // Get job seeker profile - FIXED: job_seeker_profiles.id = auth.users.id
  const { data: jobSeekerProfile } = await supabase
    .from('job_seeker_profiles')
    .select('*')
    .eq('id', user.id)  // ✅ FIXED: Use 'id' not 'user_id'
    .single();

  // If no job seeker profile, redirect to login (user might be partner/admin)
  if (!jobSeekerProfile) {
    redirect('/auth/login');
  }

  // Get AI interaction stats and recent activity
  const [
    conversationStatsResult,
    recentRecommendationsResult,
    directConnectionsResult,
    userInterestsResult
  ] = await Promise.allSettled([
    supabase
      .from('conversation_analytics')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('ai_recommendations')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'job_match')
      .gte('match_score', 0.7)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('direct_connections')
      .select('*')
      .eq('user_id', user.id)
      .gte('match_threshold', 0.8)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('user_interests')
      .select('*')
      .eq('user_id', user.id)
      .single()
  ]);

  const conversationStats = conversationStatsResult.status === 'fulfilled' ? 
    (conversationStatsResult.value.data || []) : [];
  const recentRecommendations = recentRecommendationsResult.status === 'fulfilled' ? 
    (recentRecommendationsResult.value.data || []) : [];
  const directConnections = directConnectionsResult.status === 'fulfilled' ? 
    (directConnectionsResult.value.data || []) : [];
  const userInterests = userInterestsResult.status === 'fulfilled' ? 
    userInterestsResult.value.data : null;

  // Calculate AI engagement metrics
  const totalInteractions = conversationStats.reduce((sum, stat) => 
    sum + (stat.messages_sent || 0), 0);
  const avgConfidenceScore = conversationStats.length > 0 ? 
    conversationStats.reduce((sum, stat) => sum + (stat.session_metadata?.confidence_score || 0), 0) / conversationStats.length : 0;
  const highQualityMatches = recentRecommendations.filter(rec => rec.match_score >= 0.8).length;

  // Calculate profile readiness for AI matching
  const getAIReadinessScore = () => {
    let score = 0;
    if (jobSeekerProfile.full_name) score += 10;
    if (jobSeekerProfile.current_title) score += 15;
    if (jobSeekerProfile.location) score += 10;
    if (jobSeekerProfile.resume_uploaded_at) score += 30; // Higher weight for resume
    if (jobSeekerProfile.climate_focus_areas?.length > 0) score += 15;
    if (jobSeekerProfile.desired_roles?.length > 0) score += 10;
    if (jobSeekerProfile.experience_level) score += 10;
    return score;
  };

  const aiReadinessScore = getAIReadinessScore();

  return (
    <div className="space-y-6">
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
                    Welcome back, {jobSeekerProfile.full_name || 'Climate Professional'}!
                  </h1>
                  <p className="text-midnight-forest/70 font-helvetica">
                    Your AI-powered climate career assistant is ready to help
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 mt-4">
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
                    {directConnections.length} Direct Connections
                  </span>
                </div>
                {jobSeekerProfile.location && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-midnight-forest/40" />
                    <span className="text-sm font-helvetica text-midnight-forest/60">
                      {jobSeekerProfile.location}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2 text-spring-green mb-2">
                <Zap className="w-5 h-5" />
                <span className="font-helvetica font-medium">AI Readiness</span>
              </div>
              <p className="text-3xl font-helvetica font-bold text-midnight-forest">
                {aiReadinessScore}%
              </p>
              <p className="text-sm text-midnight-forest/60 font-helvetica">
                {aiReadinessScore >= 80 ? 'Optimized for AI matching!' : 'Enhance for better results'}
              </p>
            </div>
          </div>
        </div>
      </div>

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {!jobSeekerProfile.resume_uploaded_at && (
              <div className="flex items-center space-x-3 p-4 border border-spring-green/20 rounded-xl bg-spring-green/5">
                <FileText className="w-6 h-6 text-spring-green" />
                <div>
                  <p className="text-sm font-helvetica font-medium text-midnight-forest">
                    Upload Resume in Chat
                  </p>
                  <p className="text-xs text-midnight-forest/60 font-helvetica">
                    +30 points • Drag & drop in chat interface
                  </p>
                </div>
              </div>
            )}
            
            {!jobSeekerProfile.climate_focus_areas?.length && (
              <div className="flex items-center space-x-3 p-4 border border-seafoam-blue/20 rounded-xl bg-seafoam-blue/5">
                <Target className="w-6 h-6 text-seafoam-blue" />
                <div>
                  <p className="text-sm font-helvetica font-medium text-midnight-forest">
                    Define Climate Focus
                  </p>
                  <p className="text-xs text-midnight-forest/60 font-helvetica">
                    +15 points • Tell AI your interests
                  </p>
                </div>
              </div>
            )}
            
            {!jobSeekerProfile.desired_roles?.length && (
              <div className="flex items-center space-x-3 p-4 border border-moss-green/20 rounded-xl bg-moss-green/5">
                <Award className="w-6 h-6 text-moss-green" />
                <div>
                  <p className="text-sm font-helvetica font-medium text-midnight-forest">
                    Share Career Goals
                  </p>
                  <p className="text-xs text-midnight-forest/60 font-helvetica">
                    +10 points • Chat about your aspirations
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Insights Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-spring-green/10 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-spring-green" />
            </div>
            <div>
              <p className="text-2xl font-helvetica font-bold text-midnight-forest">
                {totalInteractions}
              </p>
              <p className="text-sm text-midnight-forest/60 font-helvetica">AI Conversations</p>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs text-spring-green font-helvetica font-medium">
              {conversationStats.length} active sessions
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-seafoam-blue/10 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-seafoam-blue" />
            </div>
            <div>
              <p className="text-2xl font-helvetica font-bold text-midnight-forest">
                {recentRecommendations.length}
              </p>
              <p className="text-sm text-midnight-forest/60 font-helvetica">AI Recommendations</p>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs text-seafoam-blue font-helvetica font-medium">
              {highQualityMatches} high-quality matches
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-moss-green/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-moss-green" />
            </div>
            <div>
              <p className="text-2xl font-helvetica font-bold text-midnight-forest">
                {directConnections.length}
              </p>
              <p className="text-sm text-midnight-forest/60 font-helvetica">Direct Connections</p>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs text-moss-green font-helvetica font-medium">
              80%+ match threshold
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-helvetica font-bold text-midnight-forest">
                {jobSeekerProfile.climate_focus_areas?.length || 0}
              </p>
              <p className="text-sm text-midnight-forest/60 font-helvetica">Focus Areas</p>
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs text-amber-600 font-helvetica font-medium">
              Climate specializations
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* AI Chat Interface - Primary Feature (Maximized) */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-sand-gray/20 overflow-hidden">
            <div className="p-6 border-b border-sand-gray/20 bg-gradient-to-r from-spring-green/5 to-seafoam-blue/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-spring-green to-seafoam-blue rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-helvetica font-semibold text-midnight-forest">
                      Climate Career Assistant
                    </h3>
                    <p className="text-sm text-midnight-forest/60 font-helvetica">
                      Upload resume, get recommendations, find direct connections
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-spring-green rounded-full animate-pulse"></div>
                  <span className="text-xs font-helvetica font-medium text-spring-green">AI Active</span>
                </div>
              </div>
            </div>
            
            {/* Maximized Chat Component - ChatGPT/Claude Style */}
            <div className="h-[700px] min-h-[600px]">
              <ClimateChat 
                variant="embedded"
                defaultOpen={true}
                userContext={{
                  userType: 'job_seeker',
                  profile: jobSeekerProfile,
                  preferences: userInterests,
                }}
              />
            </div>
          </div>
        </div>

        {/* AI Insights & Quick Actions - Condensed Sidebar */}
        <div className="space-y-6">
          {/* Recent AI Recommendations */}
          <div className="bg-white rounded-2xl border border-sand-gray/20 overflow-hidden">
            <div className="p-4 border-b border-sand-gray/20">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-helvetica font-semibold text-midnight-forest">
                  AI Recommendations
                </h3>
                <Sparkles className="w-4 h-4 text-spring-green" />
              </div>
            </div>
            
            <div className="divide-y divide-sand-gray/10 max-h-64 overflow-y-auto">
              {recentRecommendations.slice(0, 3).map((recommendation, index) => (
                <div key={recommendation.id || index} className="p-3 hover:bg-sand-gray/5 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-helvetica font-medium text-midnight-forest mb-1 text-sm">
                        {recommendation.title || 'Climate Opportunity'}
                      </h4>
                      <p className="text-xs text-midnight-forest/60 font-helvetica mb-2">
                        {recommendation.organization || 'Partner Organization'}
                      </p>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs bg-spring-green/10 text-spring-green px-2 py-1 rounded-full font-helvetica">
                          {Math.round((recommendation.match_score || 0.7) * 100)}% Match
                        </span>
                        {recommendation.match_score >= 0.8 && (
                          <span className="text-xs bg-moss-green/10 text-moss-green px-1 py-1 rounded-full font-helvetica">
                            Direct Connect
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-midnight-forest/40 mt-1" />
                  </div>
                </div>
              ))}
              
              {recentRecommendations.length === 0 && (
                <div className="p-4 text-center">
                  <MessageCircle className="w-8 h-8 text-midnight-forest/20 mx-auto mb-2" />
                  <p className="text-xs text-midnight-forest/60 font-helvetica">
                    Start chatting to get AI recommendations
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl border border-sand-gray/20 p-4">
            <h3 className="text-base font-helvetica font-semibold text-midnight-forest mb-3">
              Your Progress
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-midnight-forest/60 font-helvetica">AI Conversations</span>
                <span className="text-sm font-helvetica font-medium text-midnight-forest">{totalInteractions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-midnight-forest/60 font-helvetica">Recommendations</span>
                <span className="text-sm font-helvetica font-medium text-midnight-forest">{recentRecommendations.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-midnight-forest/60 font-helvetica">Direct Connections</span>
                <span className="text-sm font-helvetica font-medium text-midnight-forest">{directConnections.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-midnight-forest/60 font-helvetica">Focus Areas</span>
                <span className="text-sm font-helvetica font-medium text-midnight-forest">{jobSeekerProfile.climate_focus_areas?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-sand-gray/20 p-4">
            <h3 className="text-base font-helvetica font-semibold text-midnight-forest mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full text-left p-2 rounded-lg hover:bg-spring-green/5 transition-colors">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-spring-green" />
                  <span className="text-sm font-helvetica text-midnight-forest">Upload Resume</span>
                </div>
              </button>
              <button className="w-full text-left p-2 rounded-lg hover:bg-seafoam-blue/5 transition-colors">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-seafoam-blue" />
                  <span className="text-sm font-helvetica text-midnight-forest">Set Career Goals</span>
                </div>
              </button>
              <button className="w-full text-left p-2 rounded-lg hover:bg-moss-green/5 transition-colors">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-moss-green" />
                  <span className="text-sm font-helvetica text-midnight-forest">Find Connections</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI-Powered Quick Actions */}
      <div className="bg-gradient-to-r from-midnight-forest/5 to-spring-green/5 rounded-2xl p-6 border border-sand-gray/20">
        <div className="text-center">
          <h3 className="text-xl font-helvetica font-semibold text-midnight-forest mb-2">
            Ready to accelerate your climate career?
          </h3>
          <p className="text-midnight-forest/60 font-helvetica mb-6">
            Our AI eliminates endless job browsing. Get personalized recommendations, direct connections, and career guidance.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-xl border border-sand-gray/20">
              <FileText className="w-4 h-4 text-spring-green" />
              <span className="text-sm font-helvetica font-medium text-midnight-forest">
                Upload Resume in Chat
              </span>
            </div>
            
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-xl border border-sand-gray/20">
              <Target className="w-4 h-4 text-seafoam-blue" />
              <span className="text-sm font-helvetica font-medium text-midnight-forest">
                Get AI Recommendations
              </span>
            </div>
            
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-xl border border-sand-gray/20">
              <Users className="w-4 h-4 text-moss-green" />
              <span className="text-sm font-helvetica font-medium text-midnight-forest">
                Direct HR Connections
              </span>
            </div>
            
            <div className="flex items-center space-x-2 px-4 py-2 bg-white/80 rounded-xl border border-sand-gray/20">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-helvetica font-medium text-midnight-forest">
                Upskilling Guidance
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Job Seeker Dashboard - Climate Economy Assistant",
  description: "Your personalized climate career dashboard in Massachusetts",
}; 