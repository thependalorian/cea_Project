'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="max-w-md w-full space-y-8 p-8 bg-base-100 shadow-xl rounded-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-error">
            {error === 'Configuration'
              ? 'There is a problem with the server configuration.'
              : error === 'AccessDenied'
              ? 'Access denied. You may not have permission to access this resource.'
              : error === 'Verification'
              ? 'The verification link may have expired or already been used.'
              : 'An error occurred during authentication.'}
          </p>
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/auth/signin"
            className="btn btn-primary"
          >
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
} 