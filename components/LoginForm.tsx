'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Eye, EyeOff, User, Briefcase, Shield } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('Login attempt with email:', email)
    const { error } = await signIn(email, password)
    
    if (error) {
      console.error('Login error:', error)
      setError(error.message)
      setLoading(false)
    } else {
      console.log('Login successful, waiting for redirect')
      // Let the auth context handle the redirect
      // The useEffect in layout will handle navigation
    }
  }

  const handleDemoLogin = async (demoType: 'jobseeker' | 'partner' | 'admin') => {
    setLoading(true)
    setError('')
    console.log(`Demo login attempt for: ${demoType}`)

    let demoEmail = ''
    let demoPassword = ''

    switch (demoType) {
      case 'jobseeker':
        demoEmail = 'george.n.p.nekwaya@gmail.com'
        demoPassword = 'ClimateJobs2025!JobSeeker'
        break
      case 'partner':
        demoEmail = 'buffr_inc@buffr.ai'
        demoPassword = 'ClimateJobs2025!Buffr_Inc'
        break
      case 'admin':
        demoEmail = 'gnekwaya@joinact.org'
        demoPassword = 'ClimateAdmin2025!George_Nekwaya_Act'
        break
    }

    console.log(`Attempting demo login with email: ${demoEmail}`)
    const { error } = await signIn(demoEmail, demoPassword)
    
    if (error) {
      console.error('Demo login error:', error)
      setError(`Demo login failed: ${error.message}`)
      setLoading(false)
    } else {
      console.log('Demo login successful, DashboardRouter will handle redirect')
      // DashboardRouter will handle the role-based redirect automatically
      // No need for manual navigation
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-seafoam-blue via-sage-green to-sand-gray flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-spring-green rounded-2xl mb-4 shadow-lg">
            <div className="w-8 h-8 bg-midnight-forest rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-spring-green rounded-sm"></div>
            </div>
          </div>
          <h1 className="text-3xl font-sf-pro font-bold text-midnight-forest mb-2">
            Welcome Back
          </h1>
          <p className="text-moss-green font-inter text-lg">
            Sign in to your Climate Economy Assistant account
          </p>
        </div>

        {/* Main Login Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-inter">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-inter font-medium text-midnight-forest">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-white border border-sage-green/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-spring-green focus:border-transparent transition-all duration-200 text-midnight-forest font-inter placeholder-moss-green/60"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-inter font-medium text-midnight-forest">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-white border border-sage-green/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-spring-green focus:border-transparent transition-all duration-200 text-midnight-forest font-inter placeholder-moss-green/60 pr-12"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-moss-green hover:text-midnight-forest transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-spring-green hover:bg-spring-green/90 text-midnight-forest font-inter font-semibold py-4 px-6 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo Accounts */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
          <h3 className="text-lg font-sf-pro font-semibold text-midnight-forest mb-4 text-center">
            Try Demo Accounts
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => handleDemoLogin('jobseeker')}
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-seafoam-blue to-sage-green hover:from-seafoam-blue/90 hover:to-sage-green/90 text-white font-inter font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <User size={18} />
              <span>Job Seeker Demo</span>
            </button>
            
            <button
              onClick={() => handleDemoLogin('partner')}
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-moss-green to-sage-green hover:from-moss-green/90 hover:to-sage-green/90 text-white font-inter font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Briefcase size={18} />
              <span>Partner Demo</span>
            </button>
            
            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-midnight-forest to-moss-green hover:from-midnight-forest/90 hover:to-moss-green/90 text-white font-inter font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <Shield size={18} />
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm font-inter text-moss-green/80">
            Don't have an account?{' '}
            <a href="/signup" className="text-midnight-forest font-semibold hover:text-spring-green transition-colors">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 