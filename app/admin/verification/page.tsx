/**
 * User & Content Verification Page - Climate Economy Assistant  
 * Admin interface for verifying user accounts, partners, and moderating content
 * Location: app/admin/verification/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { VerificationTabs } from "@/components/admin/VerificationTabs";
import { ACTButton } from "@/components/ui";
import { Shield, CheckCircle, Clock, AlertTriangle, Users, Building2, Flag } from "lucide-react";

export default async function AdminVerificationPage() {
  const supabase = await createClient();

  try {
    // Fetch data for verification tasks
    const [
      { data: contentFlags },
      { data: unverifiedPartners },
      { data: pendingProfiles },
      { data: recentVerifications }
    ] = await Promise.all([
      // Get flagged content that needs admin review
      supabase
        .from('content_flags')
        .select(`
          *,
          profiles!flagged_by(first_name, last_name, email)
        `)
        .eq('admin_reviewed', false)
        .order('created_at', { ascending: false }),

      // Get unverified partner profiles
      supabase
        .from('partner_profiles')
        .select('*')
        .eq('verified', false)
        .eq('profile_completed', true)
        .order('created_at', { ascending: false }),

      // Get job seeker profiles that might need verification
      supabase
        .from('job_seeker_profiles')
        .select(`
          *,
          profiles!user_id(first_name, last_name, email, verified)
        `)
        .eq('profile_completed', true)
        .order('created_at', { ascending: false })
        .limit(20),

      // Get recently verified items for audit trail
      supabase
        .from('audit_logs')
        .select('*')
        .in('table_name', ['partner_profiles', 'profiles', 'content_flags'])
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    // Calculate statistics
    const totalFlags = contentFlags?.length || 0;
    const highPriorityFlags = contentFlags?.filter(flag => 
      flag.flag_reason === 'inappropriate' || flag.flag_reason === 'spam'
    ).length || 0;

    const pendingPartners = unverifiedPartners?.length || 0;
    const unverifiedUsers = pendingProfiles?.filter(profile => 
      !profile.profiles?.verified
    ).length || 0;

    const verificationData = {
      contentFlags: contentFlags || [],
      unverifiedPartners: unverifiedPartners || [],
      pendingProfiles: pendingProfiles || [],
      recentVerifications: recentVerifications || []
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-helvetica font-medium text-midnight-forest">
              Verification & Moderation Center
            </h1>
            <p className="text-body text-midnight-forest/70 mt-2">
              Review and verify user accounts, partner organizations, and moderate content
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ACTButton variant="outline" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Verification Settings
            </ACTButton>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Content Flags</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {totalFlags}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {highPriorityFlags} high priority
                </p>
              </div>
              <Flag className="h-8 w-8 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Pending Partners</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {pendingPartners}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Unverified Users</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {unverifiedUsers}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Recent Actions</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {recentVerifications?.length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Priority Alerts */}
        {(totalFlags > 5 || pendingPartners > 10) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Attention Required</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {totalFlags > 5 && `${totalFlags} content flags need review. `}
                  {pendingPartners > 10 && `${pendingPartners} partner applications are waiting for verification.`}
                </p>
              </div>
              <div className="ml-auto">
                <ACTButton variant="outline" size="sm">
                  Review Now
                </ACTButton>
              </div>
            </div>
          </div>
        )}

        {/* Verification Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <VerificationTabs data={verificationData} />
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
              Recent Verification Activity
            </h2>
            <p className="text-body text-midnight-forest/70 mt-1">
              Latest verification actions and system changes
            </p>
          </div>
          
          <div className="p-6">
            {recentVerifications && recentVerifications.length > 0 ? (
              <div className="space-y-4">
                {recentVerifications.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {log.table_name === 'partner_profiles' && 'Partner Verification'}
                          {log.table_name === 'profiles' && 'User Account Update'}
                          {log.table_name === 'content_flags' && 'Content Moderation'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Record ID: {log.record_id?.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {new Date(log.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
                <p className="text-gray-500">
                  No verification activities have been recorded recently.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in admin verification page:', error);
    
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Verification Data</h2>
          <p className="text-red-600">
            There was an error loading the verification data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
}

export const metadata = {
  title: "Verification & Moderation - Admin Dashboard",
  description: "Verify user accounts, partners, and moderate content in the Climate Economy Assistant platform",
}; 