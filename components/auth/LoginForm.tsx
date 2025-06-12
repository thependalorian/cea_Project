/**
 * Login Form Component - Climate Economy Assistant
 * Handles user authentication with role-based redirects
 * Location: components/auth/LoginForm.tsx
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ACTCard, ACTButton, useACTToast } from '@/components/ui';
import { Eye, EyeOff, Mail, Lock, LogIn, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SignInData } from '@/types/user';

interface LoginFormProps {
  className?: string;
  onSuccess?: () => void;
  redirectTo?: string;
  showSignUpLink?: boolean;
}

export function LoginForm({ 
  className, 
  onSuccess, 
  redirectTo,
  showSignUpLink = true 
}: LoginFormProps) {
  const router = useRouter();
  const { signIn, profile } = useAuth();
  const { addToast } = useACTToast();

  // Form state
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle role-based redirect
  const handleRoleBasedRedirect = () => {
    if (!profile) {
      router.push('/dashboard');
      return;
    }

    switch (profile.user_type) {
      case 'job_seeker':
        router.push('/job-seekers');
        break;
      case 'partner':
        router.push('/partners');
        break;
      case 'admin':
        router.push('/admin');
        break;
      default:
        router.push('/dashboard');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // Use the API endpoint for login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        addToast({
          type: 'error',
          message: result.message || 'Failed to sign in',
        });
        return;
      }

      addToast({
        type: 'success',
        message: 'Successfully signed in!',
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else if (redirectTo) {
        // Use full page redirect to ensure cookies are sent to server
        window.location.href = redirectTo;
      } else {
        // Use the redirect URL from the API response with full page redirect
        const redirectUrl = result.data?.redirect_url || '/dashboard';
        
        // Role-based redirects with full page navigation
        switch (result.data?.user_type) {
          case 'job_seeker':
            window.location.href = '/job-seekers';
            break;
          case 'partner':
            window.location.href = '/partners';
            break;
          case 'admin':
            window.location.href = '/admin';
            break;
          default:
            window.location.href = redirectUrl;
        }
      }

    } catch (error) {
      console.error('Login error:', error);
      addToast({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      addToast({
        type: 'error',
        message: 'Please enter your email address',
      });
      return;
    }

    try {
      setResetLoading(true);
      
      // This would call the auth client's reset password method
      // const { error } = await resetPassword(resetEmail);
      
      addToast({
        type: 'success',
        message: 'Password reset email sent! Please check your inbox.',
      });
      
      setShowForgotPassword(false);
      setResetEmail('');

    } catch (error) {
      console.error('Password reset error:', error);
      addToast({
        type: 'error',
        message: 'Failed to send reset email. Please try again.',
      });
    } finally {
      setResetLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof SignInData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Render forgot password form
  if (showForgotPassword) {
    return (
      <ACTCard variant="default" className={cn("p-8 w-full max-w-md", className)}>
        <div className="text-center mb-8">
          <h2 className="text-act-title font-helvetica font-medium text-midnight-forest mb-2">
            Reset Your Password
          </h2>
          <p className="text-act-body font-inter text-midnight-forest/70">
            Enter your email address and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div>
            <label className="block text-act-small font-helvetica font-medium text-midnight-forest mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-midnight-forest/50" />
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="input-act pl-10"
                placeholder="Enter your email address"
                disabled={resetLoading}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <ACTButton
              type="button"
              onClick={() => setShowForgotPassword(false)}
              variant="outline"
              className="flex-1"
              disabled={resetLoading}
              icon={<ArrowLeft className="mr-2 h-4 w-4" />}
            >
              Back
            </ACTButton>
            
            <ACTButton
              type="submit"
              variant="primary"
              className="flex-1"
              loading={resetLoading}
              disabled={resetLoading}
            >
              {resetLoading ? 'Sending...' : 'Send Reset Link'}
            </ACTButton>
          </div>
        </form>
      </ACTCard>
    );
  }

  // Render main login form
  return (
    <ACTCard variant="default" className={cn("p-8 w-full max-w-md", className)}>
      <div className="text-center mb-8">
        <h2 className="text-act-title font-helvetica font-medium text-midnight-forest mb-2">
          Welcome Back
        </h2>
        <p className="text-act-body font-inter text-midnight-forest/70">
          Sign in to your climate career account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label className="block text-act-small font-helvetica font-medium text-midnight-forest mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-midnight-forest/50" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="input-act pl-10"
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>
          {errors.email && (
            <p className="text-act-small text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-act-small font-helvetica font-medium text-midnight-forest mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-midnight-forest/50" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="input-act pl-10 pr-12"
              placeholder="Enter your password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-midnight-forest/60 hover:text-midnight-forest"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-act-small text-red-500 mt-1">{errors.password}</p>
          )}
        </div>

        {/* Forgot Password Link */}
        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-act-small text-spring-green hover:text-spring-green/80 font-helvetica transition-colors"
          >
            Forgot your password?
          </button>
        </div>

        {/* Submit Button */}
        <ACTButton
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
          disabled={loading}
          icon={<LogIn className="ml-2 h-5 w-5" />}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </ACTButton>
      </form>

      {/* Demo Accounts */}
      <div className="mt-8 pt-6 border-t border-sand-gray/20">
        <p className="text-act-body font-inter text-midnight-forest/60 text-center mb-4">
          Demo Accounts (Development)
        </p>
        <div className="grid grid-cols-3 gap-2">
          <ACTButton
            variant="ghost"
            size="sm"
            onClick={() => {
              setFormData({
                email: 'jobseeker@cea.georgenekwaya.com',
                password: 'Demo123!',
              });
            }}
            className="text-xs"
          >
            Job Seeker
          </ACTButton>
          <ACTButton
            variant="ghost"
            size="sm"
            onClick={() => {
              setFormData({
                email: 'partner@cea.georgenekwaya.com',
                password: 'Demo123!',
              });
            }}
            className="text-xs"
          >
            Partner
          </ACTButton>
          <ACTButton
            variant="ghost"
            size="sm"
            onClick={() => {
              setFormData({
                email: 'admin@cea.georgenekwaya.com',
                password: 'Demo123!',
              });
            }}
            className="text-xs"
          >
            Admin
          </ACTButton>
        </div>
      </div>

      {/* Sign Up Link */}
      {showSignUpLink && (
        <div className="text-center mt-6 pt-4 border-t border-sand-gray/20">
          <p className="text-act-body font-inter text-midnight-forest/70">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/auth/sign-up')}
              className="font-medium text-spring-green hover:text-spring-green/80 transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      )}

      {/* Social Login Options (Future Enhancement) */}
      <div className="mt-6 pt-4 border-t border-sand-gray/20">
        <p className="text-act-body font-inter text-midnight-forest/60 text-center mb-4">
          Or continue with
        </p>
        <div className="grid grid-cols-2 gap-3">
          <ACTButton
            variant="outline"
            size="sm"
            className="w-full"
            disabled={true}
            onClick={() => {
              addToast({
                type: 'info',
                message: 'Social login coming soon!',
              });
            }}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </ACTButton>
          <ACTButton
            variant="outline"
            size="sm"
            className="w-full"
            disabled={true}
            onClick={() => {
              addToast({
                type: 'info',
                message: 'LinkedIn login coming soon!',
              });
            }}
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </ACTButton>
        </div>
      </div>
    </ACTCard>
  );
} 