/**
 * Admin Debug Page - Climate Economy Assistant
 * Debug admin authentication and profile data
 * Location: app/admin/debug/page.tsx
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminDebugPage() {
  const supabase = await createClient();

  // Check authentication
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Get user data from different tables
  const [
    { data: adminProfile, error: adminError },
    { data: basicProfile, error: profileError },
    { data: partnerProfile, error: partnerError },
    { data: jobSeekerProfile, error: jobSeekerError }
  ] = await Promise.all([
    supabase
      .from('admin_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('partner_profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
    supabase
      .from('job_seeker_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
  ]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Admin Debug Information</h1>
        
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Auth User Data</h2>
            <pre className="bg-muted p-4 rounded text-sm overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          {/* Admin Profile */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Admin Profile</h2>
            {adminError ? (
              <div className="text-red-500">
                <p><strong>Error:</strong> {adminError.message}</p>
                <p><strong>Code:</strong> {adminError.code}</p>
              </div>
            ) : adminProfile ? (
              <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                {JSON.stringify(adminProfile, null, 2)}
              </pre>
            ) : (
              <p className="text-yellow-600">No admin profile found</p>
            )}
          </div>

          {/* Basic Profile */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Basic Profile</h2>
            {profileError ? (
              <div className="text-red-500">
                <p><strong>Error:</strong> {profileError.message}</p>
                <p><strong>Code:</strong> {profileError.code}</p>
              </div>
            ) : basicProfile ? (
              <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                {JSON.stringify(basicProfile, null, 2)}
              </pre>
            ) : (
              <p className="text-yellow-600">No basic profile found</p>
            )}
          </div>

          {/* Partner Profile */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Partner Profile</h2>
            {partnerError ? (
              <div className="text-red-500">
                <p><strong>Error:</strong> {partnerError.message}</p>
                <p><strong>Code:</strong> {partnerError.code}</p>
              </div>
            ) : partnerProfile ? (
              <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                {JSON.stringify(partnerProfile, null, 2)}
              </pre>
            ) : (
              <p className="text-yellow-600">No partner profile found</p>
            )}
          </div>

          {/* Job Seeker Profile */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Job Seeker Profile</h2>
            {jobSeekerError ? (
              <div className="text-red-500">
                <p><strong>Error:</strong> {jobSeekerError.message}</p>
                <p><strong>Code:</strong> {jobSeekerError.code}</p>
              </div>
            ) : jobSeekerProfile ? (
              <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                {JSON.stringify(jobSeekerProfile, null, 2)}
              </pre>
            ) : (
              <p className="text-yellow-600">No job seeker profile found</p>
            )}
          </div>

          {/* Debugging Steps */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">Debugging Steps</h2>
            <ol className="list-decimal list-inside space-y-2 text-blue-700">
              <li>Check if user has admin_profiles entry with <code>profile_completed: true</code></li>
              <li>Check if user has basic profiles entry with <code>role: "admin"</code></li>
              <li>Verify user ID matches between auth.users and profile tables</li>
              <li>Check if seed script ran successfully</li>
              <li>Try accessing <code>/admin/dashboard</code> directly</li>
            </ol>
          </div>

          {/* Quick Actions */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-x-4">
              <a 
                href="/dashboard"
                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
              >
                Go to Dashboard
              </a>
              <a 
                href="/admin/dashboard"
                className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Try Admin Dashboard
              </a>
              <a 
                href="/admin"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Admin Page
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 