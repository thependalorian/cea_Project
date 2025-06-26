'use client'

/**
 * Authentication Form Component
 * Purpose: Handle user sign in and sign up with Supabase
 * Location: /components/AuthForm.tsx
 */
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import createClient from '@/lib/supabase/client'
import { useAuth, useSupabaseAuth } from '@/providers/AuthProvider'

interface AuthFormProps {
  mode: 'signin' | 'signup'
}

const USER_TYPES = [
  { value: 'job_seeker', label: 'Job Seeker' },
  { value: 'partner', label: 'Partner' },
]

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const { signIn, signUp, user, isLoading: authLoading } = useAuth()
  const { session } = useSupabaseAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [userType, setUserType] = useState('job_seeker')
  const supabase = createClient()

  // Redirect already authenticated users (but only after loading is complete)
  useEffect(() => {
    if (!authLoading && user && mode === 'signin') {
      // Only redirect on signin mode and after confirming user exists
      router.push('/dashboard')
    }
  }, [user, authLoading, router, mode])

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="max-w-md w-full space-y-8 p-8 bg-base-100 shadow-xl rounded-lg">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const { error } = await signUp(email, password, { user_type: userType })
        if (error) throw error
        setError('Please check your email for verification link')
        setLoading(false)
        return
      }

      router.push('/dashboard')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/onboarding')}`,
        },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      setError('There was an error logging in with Google. Please try again.')
      console.error('Error logging in with Google:', error)
      setLoading(false)
    }
  }

  const isDisabled = loading

  return (
    <div className="max-w-md w-full space-y-8 p-8 bg-base-100 shadow-xl rounded-lg">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold">
          {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
        </h2>
      </div>

      <button
        onClick={handleGoogleSignIn}
        disabled={isDisabled}
        className="w-full btn btn-primary gap-2"
      >
        {loading ? (
          <span className="loading loading-spinner loading-sm"></span>
        ) : (
          <GoogleIcon />
        )}
        {isDisabled ? 'Loading...' : 'Continue with Google'}
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-base-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-base-100 text-base-content">
            Or continue with email
          </span>
        </div>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleEmailAuth}>
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <label htmlFor="email-address" className="sr-only">
              Email address
            </label>
            <input
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Email address"
              disabled={isDisabled}
            />
          </div>
          <div className="mt-4">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Password"
              disabled={isDisabled}
            />
          </div>
          {mode === 'signup' && (
            <div className="mt-4">
              <label htmlFor="user-type" className="block text-sm font-medium mb-1">
                I am a
              </label>
              <select
                id="user-type"
                name="user-type"
                value={userType}
                onChange={e => setUserType(e.target.value)}
                className="select select-bordered w-full"
                required
              >
                {USER_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && (
          <div className={`text-sm text-center ${error.includes('check your email') ? 'text-success' : 'text-error'}`}>
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={isDisabled}
            className="w-full btn btn-primary"
          >
            {isDisabled ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </div>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm">
          {mode === 'signin' ? (
            <>
              Don't have an account?{' '}
              <Link href="/auth/signup" className="text-primary hover:text-primary-focus">
                Sign up
              </Link>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <Link href="/auth/signin" className="text-primary hover:text-primary-focus">
                Sign in
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

// Google Icon Component
const GoogleIcon = () => (
  <svg
    aria-hidden="true"
    focusable="false"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="size-5"
  >
    <path
      fill="#fbc02d"
      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
    />
    <path
      fill="#e53935"
      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
    />
    <path
      fill="#4caf50"
      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
    />
    <path
      fill="#1565c0"
      d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
    />
  </svg>
)