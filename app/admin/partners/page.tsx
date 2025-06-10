/**
 * Partners Management Page - Climate Economy Assistant
 * Admin interface for managing partner organizations and relationships
 * Location: app/admin/partners/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PartnersTable } from "@/components/admin/PartnersTable";
import { ACTButton, ACTCard } from "@/components/ui";
import { Plus, Building, Shield, TrendingUp, Calendar, Users, CheckCircle } from "lucide-react";

export default async function AdminPartnersPage() {
  const supabase = await createClient();

  // Check authentication and admin access
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // Verify admin access (partner management or system privileges required)
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('can_manage_partners, can_manage_system, can_manage_users, full_name')
    .eq('user_id', user.id)
    .single();

  if (!adminProfile || (!adminProfile.can_manage_partners && !adminProfile.can_manage_system)) {
    return (
      <div className="container mx-auto py-8">
        <ACTCard variant="outlined" className="p-8 text-center">
          <Shield className="h-16 w-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">Access Denied</h2>
          <p className="text-base-content/70">
            You need partner management privileges to access partner management.
          </p>
        </ACTCard>
      </div>
    )
  }

  try {
    // Fetch all partner profiles with related data
    const { data: partners, error: partnersError } = await supabase
      .from('partner_profiles')
      .select(`
        *,
        profiles!user_id(
          first_name,
          last_name,
          email,
          created_at
        )
      `)
      .order('created_at', { ascending: false });

    if (partnersError) {
      console.error('Error fetching partners:', partnersError);
    }

    // Get partner statistics
    const totalPartners = partners?.length || 0;
    const verifiedPartners = partners?.filter(partner => partner.verified).length || 0;
    const partnersThisMonth = partners?.filter(partner => {
      const createdDate = new Date(partner.created_at);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      return createdDate >= thisMonth;
    }).length || 0;

    // Get active partners (those with recent activity)
    const activePartners = partners?.filter(partner => 
      partner.last_login && 
      new Date(partner.last_login) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length || 0;

    // Get partnership level distribution
    const partnershipLevels = partners?.reduce((acc: any, partner) => {
      const level = partner.partnership_level || 'standard';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get organization type distribution
    const organizationTypes = partners?.reduce((acc: any, partner) => {
      const type = partner.organization_type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get verification status
    const verificationRate = totalPartners > 0 ? (verifiedPartners / totalPartners) * 100 : 0;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-helvetica font-medium text-midnight-forest">
              Partners Management
            </h1>
            <p className="text-body text-midnight-forest/70 mt-2">
              Manage partner organizations, verify accounts, and monitor relationships
            </p>
          </div>
          <ACTButton variant="primary" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Partner
          </ACTButton>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Total Partners</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {totalPartners}
                </p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Verified Partners</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {verifiedPartners}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {verificationRate.toFixed(1)}% verified
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Added This Month</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {partnersThisMonth}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-midnight-forest/60">Active Partners</p>
                <p className="text-2xl font-helvetica font-medium text-midnight-forest">
                  {activePartners}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Last 30 days
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Partner Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Partnership Levels */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              Partnership Levels
            </h3>
            <div className="space-y-3">
              {Object.entries(partnershipLevels).map(([level, count]) => {
                const percentage = totalPartners > 0 ? ((count as number) / totalPartners) * 100 : 0;
                return (
                  <div key={level} className="flex items-center justify-between">
                    <span className="text-sm text-midnight-forest/70 capitalize">{level}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded">
                        <div 
                          className="h-2 bg-blue-500 rounded"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-midnight-forest w-8">
                        {count as number}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Organization Types */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
              Organization Types
            </h3>
            <div className="space-y-3">
              {Object.entries(organizationTypes).map(([type, count]) => {
                const percentage = totalPartners > 0 ? ((count as number) / totalPartners) * 100 : 0;
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-midnight-forest/70">{type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded">
                        <div 
                          className="h-2 bg-green-500 rounded"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-midnight-forest w-8">
                        {count as number}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-helvetica font-medium text-midnight-forest mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ACTButton variant="outline" className="flex items-center justify-center gap-2 h-12">
              <Plus className="h-4 w-4" />
              Add Partner
            </ACTButton>
            <ACTButton variant="outline" className="flex items-center justify-center gap-2 h-12">
              <Shield className="h-4 w-4" />
              Verify Partners
            </ACTButton>
            <ACTButton variant="outline" className="flex items-center justify-center gap-2 h-12">
              <Users className="h-4 w-4" />
              Bulk Actions
            </ACTButton>
            <ACTButton variant="outline" className="flex items-center justify-center gap-2 h-12">
              <TrendingUp className="h-4 w-4" />
              View Analytics
            </ACTButton>
          </div>
        </div>

        {/* Partners Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-helvetica font-medium text-midnight-forest">
              All Partner Organizations
            </h2>
            <p className="text-body text-midnight-forest/70 mt-1">
              Manage partner accounts, verification status, and relationship details
            </p>
          </div>
          
          <PartnersTable partners={partners || []} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error in admin partners page:', error);
    
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-red-800 mb-2">Error Loading Partners</h2>
          <p className="text-red-600">
            There was an error loading the partners data. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }
} 