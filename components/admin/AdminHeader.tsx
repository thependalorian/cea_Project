/**
 * Admin Header - Climate Economy Assistant
 * Top navigation bar for admin interface with user info and actions
 * Location: components/admin/AdminHeader.tsx
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { 
  Bell, 
  Search, 
  Settings, 
  LogOut, 
  User as UserIcon,
  ChevronDown,
  Shield,
  Activity,
  HelpCircle
} from 'lucide-react'

interface AdminHeaderProps {
  profile: {
    id: string;
    full_name: string;
    access_level: 'standard' | 'super' | 'system';
    department: string | null;
    email: string | null;
    total_admin_actions: number;
  };
  user: User;
}

export function AdminHeader({ profile, user }: AdminHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const formatName = (name: string) => {
    const parts = name.split(' ')
    return parts.length > 1 ? `${parts[0]} ${parts[1]?.charAt(0)?.toUpperCase()}.` : name
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'system': return 'text-spring-green'
      case 'super': return 'text-seafoam-blue'
      default: return 'text-moss-green'
    }
  }

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'system': return <Shield className="w-3 h-3" />
      case 'super': return <Activity className="w-3 h-3" />
      default: return <UserIcon className="w-3 h-3" />
    }
  }

  return (
    <header className="h-16 bg-white border-b border-sand-gray/20 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left Section - Logo & Title */}
      <div className="flex items-center space-x-4">
        <Link href="/admin" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-spring-green to-seafoam-blue rounded-lg flex items-center justify-center">
            <span className="text-white font-helvetica font-bold text-sm">CEA</span>
          </div>
          <div>
            <h1 className="text-lg font-helvetica font-semibold text-midnight-forest">
              Admin Dashboard
            </h1>
            <p className="text-xs text-midnight-forest/60 font-helvetica">
              Climate Economy Assistant
            </p>
          </div>
        </Link>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-midnight-forest/40" />
          <input
            type="text"
            placeholder="Search users, partners, jobs..."
            className="w-full pl-10 pr-4 py-2 bg-sand-gray/10 border border-sand-gray/20 rounded-xl text-sm font-helvetica placeholder-midnight-forest/40 focus:outline-none focus:ring-2 focus:ring-spring-green/20 focus:border-spring-green/30 transition-colors"
          />
        </div>
      </div>

      {/* Right Section - Actions & Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-sand-gray/10 transition-colors"
          >
            <Bell className="w-5 h-5 text-midnight-forest/60" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-spring-green rounded-full"></span>
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-lg border border-sand-gray/20 z-50">
              <div className="p-4 border-b border-sand-gray/20">
                <h3 className="font-helvetica font-medium text-midnight-forest">Notifications</h3>
              </div>
              <div className="p-2">
                <div className="p-3 hover:bg-sand-gray/5 rounded-lg cursor-pointer">
                  <p className="text-sm font-helvetica text-midnight-forest">New partner application</p>
                  <p className="text-xs text-midnight-forest/60 font-helvetica mt-1">CleanTech Solutions submitted application</p>
                </div>
                <div className="p-3 hover:bg-sand-gray/5 rounded-lg cursor-pointer">
                  <p className="text-sm font-helvetica text-midnight-forest">Job requires approval</p>
                  <p className="text-xs text-midnight-forest/60 font-helvetica mt-1">Solar Engineer position pending review</p>
                </div>
              </div>
              <div className="p-4 border-t border-sand-gray/20">
                <Link 
                  href="/admin/notifications" 
                  className="text-sm text-spring-green hover:text-spring-green/80 font-helvetica transition-colors"
                >
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <Link
          href="/admin/help"
          className="p-2 rounded-xl hover:bg-sand-gray/10 transition-colors"
        >
          <HelpCircle className="w-5 h-5 text-midnight-forest/60" />
        </Link>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-sand-gray/10 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-spring-green to-seafoam-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-helvetica font-bold text-xs">
                {profile.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-helvetica font-medium text-midnight-forest">
                {formatName(profile.full_name)}
              </p>
              <div className="flex items-center space-x-1">
                {getAccessLevelIcon(profile.access_level)}
                <span className={`text-xs font-helvetica font-medium ${getAccessLevelColor(profile.access_level)}`}>
                  {profile.access_level === 'system' ? 'System Admin' : 
                   profile.access_level === 'super' ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-midnight-forest/40" />
          </button>

          {/* Profile Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-lg border border-sand-gray/20 z-50">
              <div className="p-4 border-b border-sand-gray/20">
                <p className="font-helvetica font-medium text-midnight-forest">{profile.full_name}</p>
                <p className="text-sm text-midnight-forest/60 font-helvetica">{profile.email}</p>
                <p className="text-xs text-midnight-forest/40 font-helvetica mt-1">
                  {profile.department || 'Administrator'} • {profile.total_admin_actions} actions
                </p>
              </div>
              
              <div className="p-2">
                <Link
                  href="/admin/profile"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sand-gray/5 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-midnight-forest/60" />
                  <span className="text-sm font-helvetica text-midnight-forest">Profile Settings</span>
                </Link>
                
                <Link
                  href="/admin/settings"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sand-gray/5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-midnight-forest/60" />
                  <span className="text-sm font-helvetica text-midnight-forest">Admin Settings</span>
                </Link>
              </div>
              
              <div className="p-2 border-t border-sand-gray/20">
                <form action="/auth/signout" method="post">
                  <button
                    type="submit"
                    className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-helvetica">Sign Out</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default AdminHeader 