/**
 * Partner Header - Climate Economy Assistant
 * Top navigation bar for partner interface with organization info and actions
 * Location: components/partners/PartnerHeader.tsx
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
  Building2,
  ChevronDown,
  CheckCircle,
  Clock,
  HelpCircle,
  Globe,
  BarChart3,
  Plus
} from 'lucide-react'

interface PartnerHeaderProps {
  profile: {
    id: string;
    organization_name: string;
    organization_type: string;
    verified: boolean;
    status: string;
    total_jobs_posted: number;
    total_programs_created: number;
    total_resources_shared: number;
  };
  user: User;
}

export function PartnerHeader({ profile, user }: PartnerHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const getOrganizationTypeLabel = (type: string) => {
    switch (type) {
      case 'employer': return 'Employer'
      case 'educational_institution': return 'Educational Institution'
      case 'nonprofit': return 'Nonprofit Organization'
      case 'government_agency': return 'Government Agency'
      default: return 'Organization'
    }
  }

  const getStatusColor = (verified: boolean) => {
    return verified ? 'text-green-600' : 'text-amber-600'
  }

  const totalContributions = profile.total_jobs_posted + profile.total_programs_created + profile.total_resources_shared;

  return (
    <header className="h-16 bg-white border-b border-sand-gray/20 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left Section - Logo & Organization */}
      <div className="flex items-center space-x-4">
        <Link href="/partners" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-spring-green to-seafoam-blue rounded-lg flex items-center justify-center">
            <span className="text-white font-helvetica font-bold text-sm">
              {profile.organization_name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-lg font-helvetica font-semibold text-midnight-forest">
              {profile.organization_name}
            </h1>
            <p className="text-xs text-midnight-forest/60 font-helvetica">
              {getOrganizationTypeLabel(profile.organization_type)} • Climate Economy Partner
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
            placeholder="Search jobs, programs, resources..."
            className="w-full pl-10 pr-4 py-2 bg-sand-gray/10 border border-sand-gray/20 rounded-xl text-sm font-helvetica placeholder-midnight-forest/40 focus:outline-none focus:ring-2 focus:ring-spring-green/20 focus:border-spring-green/30 transition-colors"
          />
        </div>
      </div>

      {/* Right Section - Actions & Profile */}
      <div className="flex items-center space-x-4">
        {/* Quick Add Button */}
        <div className="relative">
          <button className="flex items-center space-x-2 px-3 py-2 bg-spring-green text-white rounded-xl text-sm font-helvetica font-medium hover:bg-spring-green/90 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        </div>

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
                  <p className="text-sm font-helvetica text-midnight-forest">Job application received</p>
                  <p className="text-xs text-midnight-forest/60 font-helvetica mt-1">New application for Solar Engineer position</p>
                </div>
                <div className="p-3 hover:bg-sand-gray/5 rounded-lg cursor-pointer">
                  <p className="text-sm font-helvetica text-midnight-forest">Profile verification update</p>
                  <p className="text-xs text-midnight-forest/60 font-helvetica mt-1">Additional documents requested for verification</p>
                </div>
              </div>
              <div className="p-4 border-t border-sand-gray/20">
                <Link 
                  href="/partners/notifications" 
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
          href="/partners/help"
          className="p-2 rounded-xl hover:bg-sand-gray/10 transition-colors"
        >
          <HelpCircle className="w-5 h-5 text-midnight-forest/60" />
        </Link>

        {/* Organization Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-sand-gray/10 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-spring-green to-seafoam-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-helvetica font-bold text-xs">
                {profile.organization_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-helvetica font-medium text-midnight-forest">
                {profile.organization_name.length > 20 
                  ? `${profile.organization_name.substring(0, 20)}...` 
                  : profile.organization_name}
              </p>
              <div className="flex items-center space-x-1">
                {profile.verified ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <Clock className="w-3 h-3 text-amber-600" />
                )}
                <span className={`text-xs font-helvetica font-medium ${getStatusColor(profile.verified)}`}>
                  {profile.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-midnight-forest/40" />
          </button>

          {/* Profile Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-lg border border-sand-gray/20 z-50">
              <div className="p-4 border-b border-sand-gray/20">
                <p className="font-helvetica font-medium text-midnight-forest">{profile.organization_name}</p>
                <p className="text-sm text-midnight-forest/60 font-helvetica">{user.email}</p>
                <p className="text-xs text-midnight-forest/40 font-helvetica mt-1">
                  {getOrganizationTypeLabel(profile.organization_type)} • {totalContributions} contributions
                </p>
              </div>
              
              {/* Stats Summary */}
              <div className="p-4 border-b border-sand-gray/20">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-helvetica font-bold text-midnight-forest">{profile.total_jobs_posted}</p>
                    <p className="text-xs text-midnight-forest/60 font-helvetica">Jobs</p>
                  </div>
                  <div>
                    <p className="text-lg font-helvetica font-bold text-midnight-forest">{profile.total_programs_created}</p>
                    <p className="text-xs text-midnight-forest/60 font-helvetica">Programs</p>
                  </div>
                  <div>
                    <p className="text-lg font-helvetica font-bold text-midnight-forest">{profile.total_resources_shared}</p>
                    <p className="text-xs text-midnight-forest/60 font-helvetica">Resources</p>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <Link
                  href="/partners/profile"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sand-gray/5 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-midnight-forest/60" />
                  <span className="text-sm font-helvetica text-midnight-forest">Organization Profile</span>
                </Link>
                
                <Link
                  href="/partners/analytics"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sand-gray/5 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-midnight-forest/60" />
                  <span className="text-sm font-helvetica text-midnight-forest">Analytics & Insights</span>
                </Link>
                
                <Link
                  href="/partners/settings"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sand-gray/5 transition-colors"
                >
                  <Settings className="w-4 h-4 text-midnight-forest/60" />
                  <span className="text-sm font-helvetica text-midnight-forest">Account Settings</span>
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

export default PartnerHeader 