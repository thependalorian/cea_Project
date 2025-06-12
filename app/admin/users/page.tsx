/**
 * Admin Users Management - Climate Economy Assistant
 * Comprehensive user management interface for administrators
 * Location: app/admin/users/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { 
  Users, 
  UserPlus, 
  Filter, 
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Shield,
  Calendar,
  MapPin,
  Briefcase
} from "lucide-react";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  
  // Check authentication and admin access
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirectTo=/admin/users");

  // Check admin permissions
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('id, can_manage_users, can_manage_system')
    .eq('user_id', user.id)
    .single();

  if (!adminProfile || (!adminProfile.can_manage_users && !adminProfile.can_manage_system)) {
    redirect('/admin?error=insufficient_permissions');
  }

  // Fetch user statistics
  const [
    jobSeekerStatsResult,
    adminStatsResult,
    recentUsersResult
  ] = await Promise.allSettled([
    supabase.from('job_seeker_profiles').select('id', { count: 'exact', head: true }),
    supabase.from('admin_profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('job_seeker_profiles')
      .select(`
        id, user_id, full_name, email, phone, current_location,
        experience_level, preferred_job_type, created_at, updated_at,
        is_profile_public
      `)
      .order('created_at', { ascending: false })
      .limit(10)
  ]);

  const jobSeekerCount = jobSeekerStatsResult.status === 'fulfilled' ? 
    (jobSeekerStatsResult.value.count || 0) : 0;
  const adminCount = adminStatsResult.status === 'fulfilled' ? 
    (adminStatsResult.value.count || 0) : 0;
  const recentUsers = recentUsersResult.status === 'fulfilled' ? 
    (recentUsersResult.value.data || []) : [];

  const totalUsers = jobSeekerCount + adminCount;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-helvetica font-bold text-midnight-forest">
            User Management
          </h1>
          <p className="text-midnight-forest/70 font-helvetica mt-1">
            Manage and monitor platform users across all account types
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-sand-gray/10 border border-sand-gray/20 rounded-xl text-sm font-helvetica font-medium text-midnight-forest hover:bg-sand-gray/20 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Users</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-spring-green text-white rounded-xl text-sm font-helvetica font-medium hover:bg-spring-green/90 transition-colors">
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-spring-green/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-spring-green" />
            </div>
            <div>
              <p className="text-2xl font-helvetica font-bold text-midnight-forest">
                {totalUsers.toLocaleString()}
              </p>
              <p className="text-sm text-midnight-forest/60 font-helvetica">Total Users</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-seafoam-blue/10 rounded-xl flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-seafoam-blue" />
            </div>
            <div>
              <p className="text-2xl font-helvetica font-bold text-midnight-forest">
                {jobSeekerCount.toLocaleString()}
              </p>
              <p className="text-sm text-midnight-forest/60 font-helvetica">Job Seekers</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-moss-green/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-moss-green" />
            </div>
            <div>
              <p className="text-2xl font-helvetica font-bold text-midnight-forest">
                {adminCount.toLocaleString()}
              </p>
              <p className="text-sm text-midnight-forest/60 font-helvetica">Administrators</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-helvetica font-bold text-midnight-forest">
                {recentUsers.length}
              </p>
              <p className="text-sm text-midnight-forest/60 font-helvetica">New This Week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 border border-sand-gray/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-midnight-forest/40" />
              <input
                type="text"
                placeholder="Search users by name, email, or location..."
                className="pl-10 pr-4 py-2 w-80 bg-sand-gray/10 border border-sand-gray/20 rounded-xl text-sm font-helvetica placeholder-midnight-forest/40 focus:outline-none focus:ring-2 focus:ring-spring-green/20 focus:border-spring-green/30 transition-colors"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-sand-gray/10 border border-sand-gray/20 rounded-xl text-sm font-helvetica font-medium text-midnight-forest hover:bg-sand-gray/20 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
          <div className="text-sm text-midnight-forest/60 font-helvetica">
            Showing {recentUsers.length} of {totalUsers} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-sand-gray/20 overflow-hidden">
        <div className="p-6 border-b border-sand-gray/20">
          <h3 className="text-lg font-helvetica font-semibold text-midnight-forest">
            Recent Users
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sand-gray/5">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-helvetica font-semibold text-midnight-forest/70">
                  User
                </th>
                <th className="text-left py-4 px-6 text-sm font-helvetica font-semibold text-midnight-forest/70">
                  Location
                </th>
                <th className="text-left py-4 px-6 text-sm font-helvetica font-semibold text-midnight-forest/70">
                  Experience
                </th>
                <th className="text-left py-4 px-6 text-sm font-helvetica font-semibold text-midnight-forest/70">
                  Job Type
                </th>
                <th className="text-left py-4 px-6 text-sm font-helvetica font-semibold text-midnight-forest/70">
                  Joined
                </th>
                <th className="text-left py-4 px-6 text-sm font-helvetica font-semibold text-midnight-forest/70">
                  Status
                </th>
                <th className="text-right py-4 px-6 text-sm font-helvetica font-semibold text-midnight-forest/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user) => (
                <tr key={user.id} className="border-t border-sand-gray/10 hover:bg-sand-gray/5 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-spring-green to-seafoam-blue rounded-xl flex items-center justify-center">
                        <span className="text-white font-helvetica font-bold text-sm">
                          {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-helvetica font-medium text-midnight-forest">
                          {user.full_name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-midnight-forest/60 font-helvetica">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-midnight-forest/40" />
                      <span className="text-sm font-helvetica text-midnight-forest">
                        {user.current_location || 'Not specified'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-helvetica font-medium bg-spring-green/10 text-spring-green">
                      {user.experience_level || 'Not specified'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-helvetica text-midnight-forest">
                      {user.preferred_job_type || 'Any'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-helvetica text-midnight-forest/60">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-helvetica font-medium ${
                      user.is_profile_public 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.is_profile_public ? 'Active' : 'Private'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 rounded-lg hover:bg-sand-gray/10 transition-colors">
                        <Eye className="w-4 h-4 text-midnight-forest/60" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-sand-gray/10 transition-colors">
                        <Edit className="w-4 h-4 text-midnight-forest/60" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-sand-gray/10 transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-midnight-forest/60" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-midnight-forest/20 mx-auto mb-4" />
            <p className="text-midnight-forest/60 font-helvetica">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  title: "User Management - Climate Economy Assistant Admin",
  description: "Manage and monitor platform users",
}; 