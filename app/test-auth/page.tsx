/**
 * Authentication Test Page
 * Debug page to test authentication flow and role-based redirects
 * Location: app/test-auth/page.tsx
 */

'use client';

import { useAuth } from '@/contexts/auth-context';
import { useAuth as useAuthHook } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

export default function TestAuthPage() {
  const contextAuth = useAuth();
  const hookAuth = useAuthHook();
  const [roleCheckResult, setRoleCheckResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testRoleCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/profile/check-role', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      setRoleCheckResult(result);
    } catch (error) {
      console.error('Role check error:', error);
      setRoleCheckResult({ error: error instanceof Error ? error.message : String(error) });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (contextAuth.user) {
      testRoleCheck();
    }
  }, [contextAuth.user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-seafoam-blue/20 to-spring-green/20 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-midnight-forest mb-8">
          Authentication Debug Page
        </h1>

        {/* Context Auth State */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Context Auth State</h2>
          <div className="space-y-2 text-sm">
            <div><strong>User:</strong> {contextAuth.user ? contextAuth.user.email : 'Not logged in'}</div>
            <div><strong>Loading:</strong> {contextAuth.loading.toString()}</div>
            <div><strong>Session:</strong> {contextAuth.session ? 'Active' : 'None'}</div>
          </div>
        </div>

        {/* Hook Auth State */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Hook Auth State</h2>
          <div className="space-y-2 text-sm">
            <div><strong>User:</strong> {hookAuth.user ? hookAuth.user.email : 'Not logged in'}</div>
            <div><strong>Profile:</strong> {hookAuth.profile ? JSON.stringify(hookAuth.profile, null, 2) : 'None'}</div>
            <div><strong>Loading:</strong> {hookAuth.loading.toString()}</div>
            <div><strong>Initializing:</strong> {hookAuth.initializing.toString()}</div>
            <div><strong>Is Authenticated:</strong> {hookAuth.isAuthenticated.toString()}</div>
          </div>
        </div>

        {/* Role Check Result */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Role Check API Result</h2>
          <button 
            onClick={testRoleCheck}
            disabled={loading}
            className="mb-4 bg-spring-green hover:bg-spring-green/90 text-midnight-forest font-semibold py-2 px-4 rounded"
          >
            {loading ? 'Checking...' : 'Test Role Check'}
          </button>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {roleCheckResult ? JSON.stringify(roleCheckResult, null, 2) : 'No result yet'}
          </pre>
        </div>

        {/* Demo Login Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Demo Login Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => contextAuth.signIn('george.n.p.nekwaya@gmail.com', 'ClimateJobs2025!JobSeeker')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
            >
              Job Seeker Demo
            </button>
            <button
              onClick={() => contextAuth.signIn('buffr_inc@buffr.ai', 'ClimateJobs2025!Buffr_Inc')}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded"
            >
              Partner Demo
            </button>
            <button
              onClick={() => contextAuth.signIn('gnekwaya@joinact.org', 'ClimateAdmin2025!George_Nekwaya_Act')}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
            >
              Admin Demo
            </button>
          </div>
        </div>

        {/* Navigation Test */}
        {contextAuth.user && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4">Navigation Test</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/job-seekers"
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded text-center block"
              >
                Go to Job Seekers
              </a>
              <a
                href="/partners"
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded text-center block"
              >
                Go to Partners
              </a>
              <a
                href="/admin"
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded text-center block"
              >
                Go to Admin
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 