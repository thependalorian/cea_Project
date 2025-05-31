import React from 'react';
import RLSPolicyManager from '@/components/RLSPolicyManager';

export default function RLSPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Database Security Configuration
      </h1>
      
      <div className="max-w-3xl mx-auto">
        <RLSPolicyManager />
        
        <div className="mt-10 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-2">About Row Level Security</h2>
          <p className="mb-4">
            Row Level Security (RLS) policies restrict which rows of data a user can access in your database tables.
            This ensures each user can only access their own data, providing proper security for your application.
          </p>
          
          <h3 className="text-lg font-medium mt-6 mb-2">What this page does:</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Applies RLS policies to the <code>resumes</code> table</li>
            <li>Restricts users to only accessing their own records</li>
            <li>Configures storage policies to restrict access to uploaded files</li>
          </ul>
          
          <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Proper database security is critical. This page is a simple helper for development.
              For production, ensure all tables have appropriate RLS policies configured in your Supabase dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 