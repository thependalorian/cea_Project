/**
 * Simplified Dashboard Page - Climate Economy Assistant
 * Uses only available auth properties to prevent linter errors
 * Location: app/dashboard/simple-page.tsx
 */

'use client';

import { useAuth } from '@/contexts/auth-context';
import { 
  User, 
  Briefcase, 
  Users, 
  TrendingUp, 
  MessageSquare,
  Settings,
  Bell,
  Target,
  Plus,
  CheckCircle2,
  LogOut
} from 'lucide-react';

export default function SimpleDashboard() {
  const { loading: isLoading, user, signOut: logout } = useAuth();
  const isAuthenticated = !!user;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-seafoam-blue to-sand-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-spring-green rounded-2xl animate-pulse mb-4 mx-auto"></div>
          <p className="text-midnight-forest font-inter">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-seafoam-blue to-sand-gray flex items-center justify-center">
        <div className="text-center">
          <p className="text-midnight-forest font-inter">Please log in to access your dashboard.</p>
          <a href="/login" className="mt-4 inline-block bg-spring-green text-midnight-forest px-6 py-3 rounded-xl">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Get user info with safe fallbacks
  const userEmail = user.email || 'User';
  const userName = userEmail.split('@')[0];
  const userType = (user as any).user_type || 'public';
  const userRole = userType.replace('_', ' ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-gray/30 via-white to-seafoam-blue/20">
      
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm border-b border-spring-green/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-spring-green to-moss-green rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-sf-pro font-bold text-midnight-forest">
                  Climate Economy Assistant
                </h1>
                <p className="text-sm text-moss-green font-inter">
                  Welcome back, {userName}!
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-moss-green hover:text-midnight-forest hover:bg-spring-green/10 rounded-xl transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-moss-green hover:text-midnight-forest hover:bg-spring-green/10 rounded-xl transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={logout}
                className="flex items-center space-x-2 px-4 py-2 text-moss-green hover:text-midnight-forest hover:bg-spring-green/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-inter text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-spring-green to-moss-green rounded-2xl flex items-center justify-center shadow-lg">
                    {userType === 'admin' ? <Users className="w-8 h-8 text-white" /> :
                     userType === 'partner' ? <Briefcase className="w-8 h-8 text-white" /> :
                     <User className="w-8 h-8 text-white" />}
                  </div>
                  <div>
                    <h1 className="text-4xl font-sf-pro font-bold text-midnight-forest leading-tight">
                      Welcome Back!
                    </h1>
                    <p className="text-lg text-moss-green font-inter capitalize">
                      {userRole} Dashboard
                    </p>
                  </div>
                </div>
                
                <p className="text-xl font-inter text-midnight-forest/60 mb-8 max-w-2xl leading-relaxed">
                  Your personalized climate economy dashboard. Track progress, discover opportunities, and accelerate your impact in the clean energy transition.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <button className="flex items-center space-x-2 bg-spring-green hover:bg-spring-green/90 text-midnight-forest font-inter font-semibold py-3 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl">
                    <Plus className="w-5 h-5" />
                    <span>
                      {userType === 'job_seeker' ? 'Find Jobs' : 
                       userType === 'partner' ? 'Post Job' : 
                       'Manage Users'}
                    </span>
                  </button>
                  <button className="flex items-center space-x-2 bg-white hover:bg-sage-green/10 text-midnight-forest font-inter font-medium py-3 px-6 rounded-2xl transition-all duration-200 border border-sage-green/30 hover:border-spring-green">
                    <MessageSquare className="w-5 h-5" />
                    <span>AI Assistant</span>
                  </button>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-br from-spring-green/10 to-moss-green/10 rounded-3xl p-8 border border-spring-green/20">
                  <div className="text-center">
                    <div className="text-4xl font-sf-pro font-bold text-midnight-forest mb-2">
                      {userType === 'admin' ? '2,847' : 
                       userType === 'partner' ? '12' : 
                       '8'}
                    </div>
                    <p className="text-sm font-inter text-midnight-forest/60">
                      {userType === 'admin' ? 'Total Users' : 
                       userType === 'partner' ? 'Active Jobs' : 
                       'Saved Jobs'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Info */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-spring-green/5 rounded-2xl p-6 border border-spring-green/20">
            <h3 className="text-lg font-sf-pro font-semibold text-midnight-forest mb-4">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm font-inter">
              <div>
                <span className="text-midnight-forest/70">Email:</span>
                <span className="ml-2 text-midnight-forest font-medium">{userEmail}</span>
              </div>
              <div>
                <span className="text-midnight-forest/70">Role:</span>
                <span className="ml-2 text-midnight-forest font-medium capitalize">
                  {userRole}
                </span>
              </div>
              <div>
                <span className="text-midnight-forest/70">Status:</span>
                <span className="ml-2 text-midnight-forest font-medium flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-spring-green mr-1" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-spring-green/20 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-spring-green" />
                </div>
                <h3 className="text-lg font-sf-pro font-semibold text-midnight-forest">Climate Jobs</h3>
              </div>
              <p className="text-midnight-forest/60 text-sm mb-4">
                Explore opportunities in the growing climate economy
              </p>
              <button className="w-full bg-spring-green/10 hover:bg-spring-green/20 text-midnight-forest font-inter py-2 px-4 rounded-xl transition-colors">
                Browse Jobs
              </button>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-moss-green/20 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-moss-green" />
                </div>
                <h3 className="text-lg font-sf-pro font-semibold text-midnight-forest">AI Assistant</h3>
              </div>
              <p className="text-midnight-forest/60 text-sm mb-4">
                Get personalized career guidance and insights
              </p>
              <button className="w-full bg-moss-green/10 hover:bg-moss-green/20 text-midnight-forest font-inter py-2 px-4 rounded-xl transition-colors">
                Start Chat
              </button>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-seafoam-blue/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-midnight-forest" />
                </div>
                <h3 className="text-lg font-sf-pro font-semibold text-midnight-forest">Analytics</h3>
              </div>
              <p className="text-midnight-forest/60 text-sm mb-4">
                Track your progress and career development
              </p>
              <button className="w-full bg-seafoam-blue/10 hover:bg-seafoam-blue/20 text-midnight-forest font-inter py-2 px-4 rounded-xl transition-colors">
                View Stats
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 