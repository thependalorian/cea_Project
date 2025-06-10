/**
 * Analytics Dashboard Page - Climate Economy Assistant
 * Admin interface for viewing platform analytics and insights
 * Location: app/admin/analytics/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { AnalyticsCharts } from "@/components/admin/AnalyticsCharts";
import { ACTButton } from "@/components/ui";
import { Download, BarChart3, Users, Briefcase, MessageSquare, TrendingUp, Calendar } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  try {
    // Fetch comprehensive analytics data
    const [
      { data: conversationAnalytics },
      { data: userStats },
      { data: jobStats },
      { data: partnerStats },
      { data: recentConversations }
    ] = await Promise.all([
      supabase
        .from('conversation_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      
      supabase
        .from('profiles')
        .select('role, created_at'),
      
      supabase
        .from('job_listings')
        .select('created_at, is_active, employment_type, location'),
      
      supabase
        .from('partner_profiles')
        .select('created_at, verified, partnership_level'),
      
      supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    // Calculate key metrics
    const totalConversations = conversationAnalytics?.length || 0;
    const totalUsers = userStats?.length || 0;
    const totalJobs = jobStats?.length || 0;
    const totalPartners = partnerStats?.length || 0;

    // Calculate this month's growth
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    const conversationsThisMonth = conversationAnalytics?.filter(c => 
      new Date(c.created_at) >= thisMonth
    ).length || 0;
    
    const usersThisMonth = userStats?.filter(u => 
      new Date(u.created_at) >= thisMonth
    ).length || 0;
    
    const jobsThisMonth = jobStats?.filter(j => 
      new Date(j.created_at) >= thisMonth
    ).length || 0;

    // Calculate engagement metrics
    const avgSessionDuration = conversationAnalytics?.reduce((acc, conv) => 
      acc + (conv.session_duration_seconds || 0), 0
    ) / (conversationAnalytics?.length || 1);

    const avgMessagesPerConversation = conversationAnalytics?.reduce((acc, conv) => 
      acc + (conv.messages_sent + conv.messages_received), 0
    ) / (conversationAnalytics?.length || 1);

    // User satisfaction
    const satisfactionScores = conversationAnalytics?.filter(c => c.user_satisfaction_score)
      .map(c => c.user_satisfaction_score) || [];
    const avgSatisfaction = satisfactionScores.length > 0 
      ? satisfactionScores.reduce((a, b) => a + b, 0) / satisfactionScores.length 
      : 0;

    // Partnership level distribution
    const partnershipDistribution = partnerStats?.reduce((acc: any, partner) => {
      const level = partner.partnership_level || 'standard';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {}) || {};

    // Employment type distribution
    const employmentDistribution = jobStats?.reduce((acc: any, job) => {
      const type = job.employment_type || 'not-specified';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) || {};

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-helvetica font-medium text-midnight-forest">
              Analytics Dashboard
            </h1>
            <p className="text-body text-midnight-forest/70 mt-2">
              Platform insights, user engagement, and performance metrics
            </p>
          </div>
          <ACTButton variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </ACTButton>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Total Conversations</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {totalConversations.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{conversationsThisMonth} this month
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Total Users</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {totalUsers.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{usersThisMonth} this month
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Active Jobs</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {jobStats?.filter(j => j.is_active).length || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  +{jobsThisMonth} posted this month
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Partner Organizations</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {totalPartners}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {partnerStats?.filter(p => p.verified).length || 0} verified
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              Average Session Duration
            </h3>
            <div className="text-center">
              <p className="text-3xl font-helvetica font-medium text-midnight-forest">
                {Math.round(avgSessionDuration / 60)}m
              </p>
              <p className="text-sm text-midnight-forest/60 mt-1">
                {Math.round(avgSessionDuration)}s average
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              Messages Per Conversation
            </h3>
            <div className="text-center">
              <p className="text-3xl font-helvetica font-medium text-midnight-forest">
                {Math.round(avgMessagesPerConversation)}
              </p>
              <p className="text-sm text-midnight-forest/60 mt-1">
                Average exchanges
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              User Satisfaction
            </h3>
            <div className="text-center">
              <p className="text-3xl font-helvetica font-medium text-midnight-forest">
                {avgSatisfaction.toFixed(1)}/10
              </p>
              <p className="text-sm text-midnight-forest/60 mt-1">
                Based on {satisfactionScores.length} ratings
              </p>
            </div>
          </div>
        </div>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              Partnership Levels
            </h3>
            <div className="space-y-3">
              {Object.entries(partnershipDistribution).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-sm text-midnight-forest/70 capitalize">{level}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded">
                      <div 
                        className="h-2 bg-blue-500 rounded"
                        style={{ 
                          width: `${((count as number) / totalPartners) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-midnight-forest w-8">
                      {count as number}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              Job Types
            </h3>
            <div className="space-y-3">
              {Object.entries(employmentDistribution).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-midnight-forest/70 capitalize">
                    {type.replace('-', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded">
                      <div 
                        className="h-2 bg-green-500 rounded"
                        style={{ 
                          width: `${((count as number) / totalJobs) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-midnight-forest w-8">
                      {count as number}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
              Recent Conversations
            </h2>
            <p className="text-body text-midnight-forest/70 mt-1">
              Latest user interactions and conversation outcomes
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Messages
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Started
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentConversations?.slice(0, 5).map((conversation) => (
                  <tr key={conversation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {conversation.title || 'Untitled Conversation'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {conversation.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        conversation.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {conversation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {conversation.message_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(conversation.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in admin analytics page:', error);
    
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Analytics</h2>
          <p className="text-red-600">
            There was an error loading the analytics data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
}

export const metadata = {
  title: "Analytics Dashboard - Admin",
  description: "Platform analytics and insights for the Climate Economy Assistant",
}; 