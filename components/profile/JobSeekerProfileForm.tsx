/**
 * Job Seeker Profile Form Component - Simplified
 * Purpose: Profile form for job seekers  
 * Location: /components/profile/JobSeekerProfileForm.tsx
 */
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface JobSeekerProfileFormProps {
  userId: string
}

export function JobSeekerProfileForm({ userId }: JobSeekerProfileFormProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    location: '',
    phone: '',
    website: '',
    linkedin_url: '',
    experience_level: 'entry',
    current_job_title: '',
    desired_job_title: '',
    skills: '',
    interests: '',
    education: ''
  })

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setSaving(true)
    setError(null)
    
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          description: formData.bio,
          website: formData.website,
          contact_info: {
            location: formData.location,
            phone: formData.phone,
            linkedin_url: formData.linkedin_url
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (updateError) throw updateError
      
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Profile update error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
        <p className="text-gray-600">Help us match you with climate career opportunities</p>
      </div>

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
          <span className="label-text">Bio</span>
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          className="textarea textarea-bordered h-24"
          placeholder="Tell us about yourself and your climate interests..."
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full"
      >
        Save Profile
      </button>
    </form>
  )
} 