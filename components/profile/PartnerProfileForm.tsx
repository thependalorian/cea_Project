/**
 * Partner Profile Form Component
 * Purpose: Profile form specifically for partner users
 * Location: /components/profile/PartnerProfileForm.tsx
 */
'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/providers/AuthProvider'
import createClient from '@/lib/supabase/client'

interface PartnerProfileFormProps {
  onComplete?: () => void
}

export function PartnerProfileForm({ onComplete }: PartnerProfileFormProps) {
  const { user } = useSupabaseAuth()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    organization_name: '',
    organization_type: '',
    position: '',
    website: '',
    phone: '',
    bio: '',
    industry: '',
    location: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || '',
        organization_name: user.user_metadata?.organization_name || ''
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
          website: formData.website,
          location: formData.location,
          profile_completed: true
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // Update or insert partner-specific profile
      const { error: partnerError } = await supabase
        .from('partner_profiles')
        .upsert({
          user_id: user.id,
          email: formData.email,
          full_name: formData.full_name,
          organization_name: formData.organization_name,
          organization_type: formData.organization_type,
          position: formData.position,
          website: formData.website,
          phone: formData.phone,
          bio: formData.bio,
          industry: formData.industry,
          location: formData.location
        })

      if (partnerError) throw partnerError

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
        <h2 className="text-2xl font-bold text-gray-900">Complete Your Partner Profile</h2>
        <p className="text-gray-600">Tell us about your organization</p>
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
            <span className="label-text">Organization Name *</span>
          </label>
          <input
            type="text"
            name="organization_name"
            value={formData.organization_name}
            onChange={handleInputChange}
            className="input input-bordered"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Organization Type</span>
          </label>
          <select
            name="organization_type"
            value={formData.organization_type}
            onChange={handleInputChange}
            className="select select-bordered"
          >
            <option value="">Select type...</option>
            <option value="employer">Employer</option>
            <option value="recruiter">Recruiter</option>
            <option value="training_provider">Training Provider</option>
            <option value="government">Government Agency</option>
            <option value="nonprofit">Non-profit</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Your Position</span>
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            className="input input-bordered"
            placeholder="e.g., HR Manager, Recruiter"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Industry</span>
          </label>
          <input
            type="text"
            name="industry"
            value={formData.industry}
            onChange={handleInputChange}
            className="input input-bordered"
            placeholder="e.g., Clean Energy, Transportation"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Website</span>
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="input input-bordered"
            placeholder="https://..."
          />
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

        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">Location</span>
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="input input-bordered"
            placeholder="City, State"
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Organization Description</span>
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          className="textarea textarea-bordered h-24"
          placeholder="Brief description of your organization and what you do..."
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