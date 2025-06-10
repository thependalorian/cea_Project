'use client'

import { User } from '@supabase/supabase-js'
import { ACTButton } from '@/components/ui'
import { LogOut, Bell, Search, Shield, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AdminHeaderProps {
  user: User
  profile: {
    full_name: string
    admin_level: string
    department: string
    permissions: Record<string, unknown>
  }
}

export default function AdminHeader({ user, profile }: AdminHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <header className="bg-base-100 border-b border-base-300 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">CEA Admin Portal</h1>
          </div>
          <div className="hidden md:flex items-center space-x-2 bg-base-200 rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-base-content/60" />
            <input
              type="text"
              placeholder="Search users, partners, jobs..."
              className="bg-transparent border-none outline-none text-sm placeholder:text-base-content/60 w-64"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Admin Actions */}
          <ACTButton variant="secondary" size="sm" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">System Settings</span>
          </ACTButton>

          {/* Notifications */}
          <ACTButton variant="ghost" size="sm" className="p-2">
            <Bell className="h-5 w-5" />
          </ACTButton>

          {/* Admin Info */}
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">
              {profile.full_name}
            </p>
            <p className="text-xs text-base-content/60">
              {profile.admin_level} Admin • {profile.department} • {user.email}
            </p>
          </div>

          {/* Logout */}
          <ACTButton 
            variant="outline" 
            size="sm"
            onClick={handleLogout}
            className="flex items-center space-x-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">Logout</span>
          </ACTButton>
        </div>
      </div>
    </header>
  )
} 