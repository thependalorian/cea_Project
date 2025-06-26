'use client'

import { useState } from 'react'
import Link from 'next/link'
import createClient from '@/lib/supabase/client'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (resetError) {
        throw resetError
      }
      
      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center mb-4">Reset Password</h2>
          
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}

          {isSubmitted ? (
            <div className="text-center py-4">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-success mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Check your email</h3>
              <p className="mb-4">
                We've sent password reset instructions to {email}
              </p>
              <Link href="/auth/signin" className="btn btn-primary w-full">
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="mb-4">
                Enter the email address associated with your account and we'll send you a link to reset your password.
              </p>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  className="input input-bordered"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="card-actions justify-end mt-6">
                <button 
                  type="submit" 
                  className={`btn btn-primary w-full ${loading ? 'loading' : ''}`}
                  disabled={loading}
                >
                  Send Reset Link
                </button>
              </div>

              <div className="text-center mt-4 text-sm">
                <Link href="/auth/signin" className="link link-primary">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
} 