/**
 * Job Seeker Setup Page - Climate Economy Assistant
 * Setup and profile completion page for job seekers
 * Location: app/job-seekers/setup/page.tsx
 */

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function JobSeekerSetupPage() {
  const supabase = await createClient()
  
  // Get current user and check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Job Seeker'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Career Setup</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {userName}</span>
              <form action="/auth/signout" method="post" className="inline">
                <button type="submit" className="text-sm text-red-600 hover:text-red-800">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Your Climate Career Journey, {userName}!
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Complete your profile setup to unlock personalized climate career opportunities.
          </p>
        </div>

        {/* Setup Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Step 1 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 font-bold text-lg">1</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
            <p className="text-gray-600 mb-4">
              Add your skills, experience, and climate interests to get better job matches.
            </p>
            <button className="text-green-600 hover:text-green-800 font-medium">
              Build Profile →
            </button>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold text-lg">2</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Assess Your Skills</h3>
            <p className="text-gray-600 mb-4">
              Use our AI to translate your existing skills to climate career opportunities.
            </p>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Start Assessment →
            </button>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-purple-600 font-bold text-lg">3</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore Opportunities</h3>
            <p className="text-gray-600 mb-4">
              Browse climate jobs, training programs, and career pathways tailored for you.
            </p>
            <button className="text-purple-600 hover:text-purple-800 font-medium">
              Browse Jobs →
            </button>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            Why Start Your Climate Career with CEA?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI-Powered Job Matching</h3>
                <p className="text-gray-600">Get personalized job recommendations based on your unique profile.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Skills Translation</h3>
                <p className="text-gray-600">Discover how your existing skills apply to climate and clean energy roles.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Career Pathway Guidance</h3>
                <p className="text-gray-600">Get step-by-step guidance on transitioning to a climate career.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Training & Education</h3>
                <p className="text-gray-600">Access curated learning resources to develop climate-relevant skills.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Climate Economy Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">The Growing Climate Economy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">2.3M+</div>
              <div className="text-sm text-gray-600">Clean Energy Jobs</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600">15%</div>
              <div className="text-sm text-gray-600">Annual Growth Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600">$1.8T</div>
              <div className="text-sm text-gray-600">Market Value</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/job-seekers"
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors text-center"
            >
              Go to Dashboard
            </Link>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Start Profile Setup
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Questions? <Link href="/contact" className="text-blue-600 hover:text-blue-800">Contact our career support team</Link>
          </p>
        </div>
      </div>
    </div>
  )
} 