/**
 * Auth Error Component
 * Purpose: Display authentication-related errors
 * Location: /components/shared/AuthError.tsx
 */
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AuthErrorProps {
  error?: string
  redirectTo?: string
}

export default function AuthError({ error, redirectTo = '/auth/signin' }: AuthErrorProps) {
  const router = useRouter()

  useEffect(() => {
    // Redirect after 3 seconds if redirectTo is provided
    if (redirectTo) {
      const timeout = setTimeout(() => {
        router.push(redirectTo)
      }, 3000)

      return () => clearTimeout(timeout)
    }
  }, [redirectTo, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="max-w-md w-full p-8 space-y-4 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-error">Authentication Error</h2>
          <p className="mt-2 text-sm text-gray-600">
            {error || 'An error occurred during authentication'}
          </p>
          {redirectTo && (
            <p className="mt-4 text-sm text-gray-500">
              Redirecting you to the sign-in page...
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 