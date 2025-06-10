'use client'

import { User } from '@supabase/supabase-js'
import { ACTButton } from '@/components/ui'
import { LogOut, Bell, Search, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface PartnerHeaderProps {
  user: User
  partner: {
    organization_name: string
    organization_type: string
    climate_focus?: string[]
    verified: boolean
    partnership_level: string
  }
}

export default function PartnerHeader({ user, partner }: PartnerHeaderProps) {
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
          <h1 className="text-xl font-bold text-primary">CEA Partner Portal</h1>
          <div className="hidden md:flex items-center space-x-2 bg-base-200 rounded-lg px-3 py-2">
            <Search className="h-4 w-4 text-base-content/60" />
            <input
              type="text"
              placeholder="Search candidates, jobs..."
              className="bg-transparent border-none outline-none text-sm placeholder:text-base-content/60 w-64"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <ACTButton variant="primary" size="sm" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Post Job</span>
          </ACTButton>

          {/* Notifications */}
          <ACTButton variant="ghost" size="sm" className="p-2">
            <Bell className="h-5 w-5" />
          </ACTButton>

          {/* Partner Info */}
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium">
              {partner.organization_name}
            </p>
            <p className="text-xs text-base-content/60">
              {partner.organization_type} • {partner.verified ? 'Verified' : 'Pending'} • {user.email}
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