/**
 * Admin Users Management Page - Climate Economy Assistant
 * Comprehensive user management for system administrators
 * Location: app/admin/users/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ACTCard, ACTButton } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search,
  Filter,
  Download,
  Plus,
  Mail,
  Phone,
  Calendar,
  Shield,
  Briefcase,
  Building,
  MoreHorizontal,
  UserCheck,
  UserX,
  Eye
} from "lucide-react";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  
  // Check authentication and admin access
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // Verify admin access (user management or system privileges required)
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('can_manage_users, can_manage_system, can_manage_partners, can_view_analytics, full_name')
    .eq('user_id', user.id)
    .single();

  if (!adminProfile || (!adminProfile.can_manage_users && !adminProfile.can_manage_system)) {
    return (
      <div className="container mx-auto py-8">
        <ACTCard variant="outlined" className="p-8 text-center">
          <Shield className="h-16 w-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-midnight-forest mb-2">Access Denied</h2>
          <p className="text-base-content/70">
            You need user management privileges to access user management functionality.
          </p>
        </ACTCard>
      </div>
    )
  }

  // Get all user profiles with related data
  const { data: profiles } = await supabase
    .from('profiles')
    .select(`
      *,
      admin_profiles (
        id,
        can_manage_users,
        can_manage_partners,
        can_manage_system,
        can_view_analytics,
        department,
        total_admin_actions,
        last_admin_action
      ),
      job_seeker_profiles (
        id,
        full_name,
        current_title,
        experience_level,
        profile_completed,
        last_login
      ),
      partner_profiles (
        id,
        organization_name,
        organization_type,
        partnership_level,
        verified,
        last_login
      )
    `)
    .order('created_at', { ascending: false });

  // Get user activity summary
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select('user_id, created_at, table_name')
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  // Calculate statistics
  const totalUsers = profiles?.length || 0;
  const adminUsers = profiles?.filter(p => p.admin_profiles).length || 0;
  const partnerUsers = profiles?.filter(p => p.partner_profiles).length || 0;
  const jobSeekerUsers = profiles?.filter(p => p.job_seeker_profiles).length || 0;
  const activeUsers = auditLogs?.reduce((acc, log) => {
    acc.add(log.user_id);
    return acc;
  }, new Set()).size || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage all users across the Climate Economy Assistant platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <ACTCard variant="outlined" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
          </div>
        </ACTCard>

        <ACTCard variant="outlined" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <div className="text-sm text-muted-foreground">Active (30d)</div>
            </div>
          </div>
        </ACTCard>

        <ACTCard variant="outlined" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{adminUsers}</div>
              <div className="text-sm text-muted-foreground">Admins</div>
            </div>
          </div>
        </ACTCard>

        <ACTCard variant="outlined" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{partnerUsers}</div>
              <div className="text-sm text-muted-foreground">Partners</div>
            </div>
          </div>
        </ACTCard>

        <ACTCard variant="outlined" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Briefcase className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{jobSeekerUsers}</div>
              <div className="text-sm text-muted-foreground">Job Seekers</div>
            </div>
          </div>
        </ACTCard>
      </div>

      {/* Search and Filters */}
      <ACTCard variant="outlined" className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or organization..."
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            All Users
          </Button>
          <Button variant="outline">
            Admins
          </Button>
          <Button variant="outline">
            Partners
          </Button>
          <Button variant="outline">
            Job Seekers
          </Button>
        </div>
      </ACTCard>

      {/* Users List */}
      <div className="space-y-4">
        {profiles?.map((profile) => {
          const adminData = profile.admin_profiles;
          const partnerData = profile.partner_profiles;
          const jobSeekerData = profile.job_seeker_profiles;
          
          // Determine user type and specific data
          let userType = 'User';
          let specificData = null;
          let userBadgeVariant: "default" | "secondary" | "outline" = "secondary";
          
          if (adminData) {
            userType = 'Admin';
            specificData = adminData;
            userBadgeVariant = "default";
          } else if (partnerData) {
            userType = 'Partner';
            specificData = partnerData;
            userBadgeVariant = "outline";
          } else if (jobSeekerData) {
            userType = 'Job Seeker';
            specificData = jobSeekerData;
            userBadgeVariant = "secondary";
          }

          return (
            <ACTCard key={profile.id} variant="outlined" className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-spring-green to-moss-green rounded-full flex items-center justify-center text-white font-semibold">
                    {(profile.first_name?.charAt(0) || profile.email?.charAt(0) || 'U').toUpperCase()}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {profile.first_name && profile.last_name 
                          ? `${profile.first_name} ${profile.last_name}`
                          : jobSeekerData?.full_name
                          || partnerData?.organization_name
                          || profile.email?.split('@')[0]
                          || 'Unknown User'
                        }
                      </h3>
                      <Badge variant={userBadgeVariant}>
                        {userType}
                      </Badge>
                      {profile.verified && (
                        <Badge variant="outline">
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                      {profile.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{profile.email}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                      </div>

                      {/* Type-specific info */}
                      {adminData && (
                        <>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            <span>
                              {adminData.department || 'No Department'} • 
                              {adminData.total_admin_actions || 0} actions
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Last active: {adminData.last_admin_action 
                                ? new Date(adminData.last_admin_action).toLocaleDateString()
                                : 'Never'
                              }
                            </span>
                          </div>
                        </>
                      )}

                      {partnerData && (
                        <>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>{partnerData.organization_type || 'Unknown'} • {partnerData.partnership_level}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Last login: {partnerData.last_login 
                                ? new Date(partnerData.last_login).toLocaleDateString()
                                : 'Never'
                              }
                            </span>
                          </div>
                        </>
                      )}

                      {jobSeekerData && (
                        <>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            <span>
                              {jobSeekerData.current_title || 'No Title'} • 
                              {jobSeekerData.experience_level || 'Unknown Level'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Last login: {jobSeekerData.last_login 
                                ? new Date(jobSeekerData.last_login).toLocaleDateString()
                                : 'Never'
                              }
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Permissions for Admins */}
                    {adminData && (
                      <div className="mt-3">
                        <div className="text-sm text-muted-foreground mb-2">Permissions:</div>
                        <div className="flex flex-wrap gap-1">
                          {adminData.can_manage_users && (
                            <Badge variant="outline" className="text-xs">Manage Users</Badge>
                          )}
                          {adminData.can_manage_partners && (
                            <Badge variant="outline" className="text-xs">Manage Partners</Badge>
                          )}
                          {adminData.can_manage_system && (
                            <Badge variant="outline" className="text-xs">System Admin</Badge>
                          )}
                          {adminData.can_view_analytics && (
                            <Badge variant="outline" className="text-xs">View Analytics</Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </ACTCard>
          );
        })}
      </div>
    </div>
  );
}

export const metadata = {
  title: "User Management - Admin Dashboard",
  description: "Manage all users across the Climate Economy Assistant platform",
}; 