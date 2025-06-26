/**
 * Admin Dashboard Page Component - ACT Brand Compliant
 * Purpose: Main dashboard for admin users implementing ACT brand guidelines
 * Location: /app/dashboard/admin/page.tsx
 * 
 * Brand Compliance:
 * - Uses full-width layout structure
 * - Implements proper typography hierarchy
 * - Follows ACT spacing system (base units)
 * - Uses exact color palette
 * - Responsive design with mobile-first approach
 * - Accessibility compliant
 */

import Navigation from '@/components/shared/Navigation'

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* ACT Brand Navigation */}
      <Navigation />
      
      {/* Page Header */}
      <section className="act-section bg-sand-gray-10">
        <div className="w-full py-8 px-6">
          <div className="text-center animate-on-scroll">
            <h1 className="act-h1 mb-act-1">Admin Dashboard</h1>
            <p className="act-body-large text-moss-green">
              Manage users, content, partners, and view system analytics
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="act-section">
        <div className="w-full py-8 px-6">
          <div className="act-card">
            <h2 className="act-h3 mb-act-1">Administrative Tools</h2>
            <p className="act-body text-moss-green">
              Welcome, admin! Here you can manage users, content, partners, and view analytics.
            </p>
            
            {/* Admin Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <div className="act-card hover:shadow-lg transition-shadow">
                <h3 className="act-h4 mb-2">User Management</h3>
                <p className="act-body-small">Manage user accounts and permissions</p>
              </div>
              
              <div className="act-card hover:shadow-lg transition-shadow">
                <h3 className="act-h4 mb-2">Content Management</h3>
                <p className="act-body-small">Update content and resources</p>
              </div>
              
              <div className="act-card hover:shadow-lg transition-shadow">
                <h3 className="act-h4 mb-2">Analytics</h3>
                <p className="act-body-small">View system performance metrics</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
   