/**
 * Job Seeker Header - Climate Economy Assistant
 * Top navigation bar for job seeker interface with search and quick actions
 * Location: components/job-seekers/JobSeekerHeader.tsx
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
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Briefcase,
  FileText,
  Heart,
  TrendingUp,
  MapPin,
  Zap
} from 'lucide-react'

interface JobSeekerHeaderProps {
  profile: {
    id: string;
    full_name: string | null;
    current_title: string | null;
    experience_level: string | null;
    location: string | null;
    profile_completed: boolean;
    status: string;
    total_applications: number;
    saved_jobs_count: number;
    has_resume: boolean;
    climate_focus_areas: any[];
    desired_roles: any[];
  };
  user: User;
}

export function JobSeekerHeader({ profile, user }: JobSeekerHeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const getExperienceLevelLabel = (level: string | null) => {
    switch (level) {
      case 'entry': return 'Entry Level'
      case 'mid': return 'Mid Level'
      case 'senior': return 'Senior Level'
      case 'executive': return 'Executive'
      default: return 'Climate Job Seeker'
    }
  }

  const getStatusColor = (completed: boolean) => {
    return completed ? 'text-green-600' : 'text-amber-600'
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'JS';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  }

  return (
    <header className="h-16 bg-white border-b border-sand-gray/20 flex items-center justify-between px-6 sticky top-0 z-50">
      {/* Left Section - Logo & User Info */}
      <div className="flex items-center space-x-4">
        <Link href="/job-seekers" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-spring-green to-seafoam-blue rounded-lg flex items-center justify-center">
            <span className="text-white font-helvetica font-bold text-sm">
              {getInitials(profile.full_name)}
            </span>
          </div>
          <div>
            <h1 className="text-lg font-helvetica font-semibold text-midnight-forest">
              {profile.full_name || 'Climate Job Seeker'}
            </h1>
            <p className="text-xs text-midnight-forest/60 font-helvetica">
              {profile.current_title || getExperienceLevelLabel(profile.experience_level)}
              {profile.location && ` • ${profile.location}`}
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
            placeholder="Search jobs, companies, skills..."
            className="w-full pl-10 pr-4 py-2 bg-sand-gray/10 border border-sand-gray/20 rounded-xl text-sm font-helvetica placeholder-midnight-forest/40 focus:outline-none focus:ring-2 focus:ring-spring-green/20 focus:border-spring-green/30 transition-colors"
          />
        </div>
      </div>

      {/* Right Section - Quick Actions & Profile */}
      <div className="flex items-center space-x-4">
        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          <Link
            href="/job-seekers/search"
            className="p-2 rounded-xl hover:bg-sand-gray/10 transition-colors group"
            title="Browse Jobs"
          >
            <Briefcase className="w-5 h-5 text-midnight-forest/60 group-hover:text-spring-green" />
          </Link>
          
          <Link
            href="/job-seekers/saved"
            className="relative p-2 rounded-xl hover:bg-sand-gray/10 transition-colors group"
            title="Saved Jobs"
          >
            <Heart className="w-5 h-5 text-midnight-forest/60 group-hover:text-spring-green" />
            {profile.saved_jobs_count > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-spring-green text-white text-xs rounded-full flex items-center justify-center font-helvetica font-medium">
                {profile.saved_jobs_count > 9 ? '9+' : profile.saved_jobs_count}
              </span>
            )}
          </Link>
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
                  <p className="text-sm font-helvetica text-midnight-forest">New job match found</p>
                  <p className="text-xs text-midnight-forest/60 font-helvetica mt-1">3 new positions match your profile</p>
                </div>
                <div className="p-3 hover:bg-sand-gray/5 rounded-lg cursor-pointer">
                  <p className="text-sm font-helvetica text-midnight-forest">Application update</p>
                  <p className="text-xs text-midnight-forest/60 font-helvetica mt-1">Solar Engineer position at GreenTech moved to interview stage</p>
                </div>
                <div className="p-3 hover:bg-sand-gray/5 rounded-lg cursor-pointer">
                  <p className="text-sm font-helvetica text-midnight-forest">Profile strength improved</p>
                  <p className="text-xs text-midnight-forest/60 font-helvetica mt-1">Complete your skills assessment to reach 90%</p>
                </div>
              </div>
              <div className="p-4 border-t border-sand-gray/20">
                <Link 
                  href="/job-seekers/notifications" 
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
          href="/job-seekers/help"
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
                {getInitials(profile.full_name)}
              </span>
            </div>
            <div className="text-left">
              <p className="text-sm font-helvetica font-medium text-midnight-forest">
                {profile.full_name?.length && profile.full_name.length > 20 
                  ? `${profile.full_name.substring(0, 20)}...` 
                  : (profile.full_name || 'Job Seeker')}
              </p>
              <div className="flex items-center space-x-1">
                {profile.profile_completed ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                )}
                <span className={`text-xs font-helvetica font-medium ${getStatusColor(profile.profile_completed)}`}>
                  {profile.profile_completed ? 'Profile Complete' : 'Setup Required'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-midnight-forest/40" />
          </button>

          {/* Profile Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-lg border border-sand-gray/20 z-50">
              <div className="p-4 border-b border-sand-gray/20">
                <p className="font-helvetica font-medium text-midnight-forest">{profile.full_name || 'Climate Job Seeker'}</p>
                <p className="text-sm text-midnight-forest/60 font-helvetica">{user.email}</p>
                <p className="text-xs text-midnight-forest/40 font-helvetica mt-1">
                  {profile.current_title || getExperienceLevelLabel(profile.experience_level)}
                  {profile.location && ` • ${profile.location}`}
                </p>
              </div>
              
              {/* Activity Summary */}
              <div className="p-4 border-b border-sand-gray/20">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-helvetica font-bold text-midnight-forest">{profile.total_applications}</p>
                    <p className="text-xs text-midnight-forest/60 font-helvetica">Applications</p>
                  </div>
                  <div>
                    <p className="text-lg font-helvetica font-bold text-midnight-forest">{profile.saved_jobs_count}</p>
                    <p className="text-xs text-midnight-forest/60 font-helvetica">Saved</p>
                  </div>
                  <div>
                    <p className="text-lg font-helvetica font-bold text-midnight-forest">
                      {profile.climate_focus_areas?.length || 0}
                    </p>
                    <p className="text-xs text-midnight-forest/60 font-helvetica">Focus Areas</p>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                <Link
                  href="/job-seekers/profile"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sand-gray/5 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-midnight-forest/60" />
                  <span className="text-sm font-helvetica text-midnight-forest">My Profile</span>
                </Link>
                
                <Link
                  href="/job-seekers/resume"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sand-gray/5 transition-colors"
                >
                  <FileText className="w-4 h-4 text-midnight-forest/60" />
                  <span className="text-sm font-helvetica text-midnight-forest">Resume Management</span>
                  {!profile.has_resume && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-helvetica">
                      Upload
                    </span>
                  )}
                </Link>
                
                <Link
                  href="/job-seekers/career-assessment"
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-sand-gray/5 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-midnight-forest/60" />
                  <span className="text-sm font-helvetica text-midnight-forest">Career Assessment</span>
                </Link>
                
                <Link
                  href="/job-seekers/settings"
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

export default JobSeekerHeader 