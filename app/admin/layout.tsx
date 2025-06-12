/**
 * Admin Layout - Climate Economy Assistant
 * Professional admin interface with sidebar navigation and permission-based access
 * Location: app/admin/layout.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

interface AdminProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  department: string | null;
  can_manage_users: boolean;
  can_manage_partners: boolean;
  can_manage_content: boolean;
  can_view_analytics: boolean;
  can_manage_system: boolean;
  profile_completed: boolean;
  last_login: string | null;
  total_admin_actions: number;
  created_at: string;
  updated_at: string;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/auth/login?redirectTo=/admin");
  }

  // Check admin access and get admin profile
  const { data: adminProfile, error: adminError } = await supabase
    .from('admin_profiles')
    .select(`
      id, user_id, full_name, email, department,
      can_manage_users, can_manage_partners, can_manage_content,
      can_view_analytics, can_manage_system, profile_completed,
      last_login, total_admin_actions, created_at, updated_at
    `)
    .eq('user_id', user.id)
    .single();

  if (adminError || !adminProfile) {
    redirect("/auth/login?error=admin_access_required");
  }

  // Determine access level based on permissions
  let access_level: 'standard' | 'super' | 'system' = 'standard';
  if (adminProfile.can_manage_system) {
    access_level = 'system';
  } else if (adminProfile.can_manage_users && adminProfile.can_manage_partners) {
    access_level = 'super';
  }

  // Update last login
  await supabase
    .from('admin_profiles')
    .update({ last_login: new Date().toISOString() })
    .eq('user_id', user.id);

  const profile = {
    ...adminProfile,
    access_level,
    status: adminProfile.profile_completed ? 'active' : 'setup_required'
  };

  return (
    <div className="min-h-screen bg-sand-gray/5">
      {/* Admin Header */}
      <AdminHeader profile={profile} user={user} />
      
      <div className="flex">
        {/* Admin Sidebar */}
        <AdminSidebar profile={profile} />
        
        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 