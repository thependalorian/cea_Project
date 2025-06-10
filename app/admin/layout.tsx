import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/login')
  }
  
  // Check admin role with all required fields
  const { data: adminProfile } = await supabase
    .from('admin_profiles')
    .select('full_name, department, permissions, profile_completed, can_manage_users, can_manage_partners, can_manage_content, can_view_analytics, can_manage_system')
    .eq('user_id', user.id)
    .single()
  
  if (!adminProfile || !adminProfile.profile_completed) {
    redirect('/protected')
  }

  // Determine access level based on permissions
  let access_level: 'standard' | 'super' | 'system' = 'standard';
  if (adminProfile.can_manage_system) {
    access_level = 'system';
  } else if (adminProfile.can_manage_users && adminProfile.can_manage_partners) {
    access_level = 'super';
  }

  // Create profile objects for different components
  const headerProfile = {
    full_name: adminProfile.full_name,
    admin_level: access_level, // Computed from permissions
    department: adminProfile.department,
    permissions: adminProfile.permissions
  }

  const sidebarProfile = {
    access_level: access_level,
    department: adminProfile.department,
    status: 'active'
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} profile={headerProfile} />
      <div className="flex">
        <AdminSidebar profile={sidebarProfile} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 