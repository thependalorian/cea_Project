/**
 * Admin Profile Form Component
 * Purpose: Profile form specifically for admin users
 * Location: /components/profile/AdminProfileForm.tsx
 */
'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/providers/AuthProvider'
import createClient from '@/lib/supabase/client'

interface AdminProfileFormProps {
  onComplete?: () => void
}

export function AdminProfileForm({ onComplete }: AdminProfileFormProps) {
  const { user } = useSupabaseAuth()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    department: '',
    access_level: 'standard',
    phone: '',
    bio: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || ''
      }))
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Update main profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          bio: formData.bio,
          profile_completed: true
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Update or insert admin-specific profile
      const { error: adminError } = await supabase
        .from('admin_profiles')
        .upsert({
          user_id: user.id,
          email: formData.email,
          full_name: formData.full_name,
          department: formData.department,
          access_level: formData.access_level,
          phone: formData.phone,
          bio: formData.bio
        })

      if (adminError) throw adminError

      onComplete?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Complete Your Admin Profile</h2>
        <p className="text-gray-600">Set up your administrator account</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Full Name *</span>
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            className="input input-bordered"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Email *</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="input input-bordered"
            required
            disabled
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Department</span>
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className="input input-bordered"
            placeholder="e.g., IT, Operations, Management"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Access Level</span>
          </label>
          <select
            name="access_level"
            value={formData.access_level}
            onChange={handleInputChange}
            className="select select-bordered"
          >
            <option value="standard">Standard Admin</option>
            <option value="super">Super Admin</option>
            <option value="read_only">Read Only</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Phone</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="input input-bordered"
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Bio</span>
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          className="textarea textarea-bordered h-24"
          placeholder="Brief description of your role and responsibilities..."
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          className={`btn btn-primary flex-1 ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Complete Profile'}
        </button>
      </div>
    </form>
  )
} 