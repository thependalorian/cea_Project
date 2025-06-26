/**
 * Verify Email Page Component
 * Purpose: Show verification instructions after signup
 * Location: /app/auth/verify-email/page.tsx
 */
import Link from 'next/link'

export const metadata = {
  title: 'Verify Email - Climate Economy Assistant',
  description: 'Verify your email to complete registration',
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl justify-center mb-2">Check Your Email</h1>
          
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">✉️</div>
            <p className="mb-2">We've sent you a verification email.</p>
            <p className="text-sm text-base-content/70">
              Please check your inbox and click the verification link to complete your registration.
            </p>
          </div>
          
          <div className="bg-base-200 p-4 rounded-lg mb-6">
            <h2 className="font-medium mb-2">Didn't receive an email?</h2>
            <ul className="text-sm space-y-2">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Allow a few minutes for the email to arrive</li>
            </ul>
          </div>
          
          <div className="card-actions justify-center flex-col">
            <Link href="/auth/signin" className="btn btn-primary w-full">
              Return to Sign In
            </Link>
            <button className="btn btn-outline w-full">
              Resend Verification Email
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 