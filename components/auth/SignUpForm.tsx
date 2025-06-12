/**
 * Enhanced Sign Up Form Component
 * Multi-role sign up with user type selection and role-specific fields
 * Location: components/auth/SignUpForm.tsx
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ACTCard, ACTButton, useACTToast } from '@/components/ui';
import { Eye, EyeOff, User, Building, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserType, SignUpData } from '@/types/user';

interface SignUpFormProps {
  className?: string;
  onSuccess?: () => void;
  defaultUserType?: UserType;
  redirectTo?: string;
}

const USER_TYPE_OPTIONS = [
  {
    value: 'job_seeker' as UserType,
    label: 'Job Seeker',
    description: 'Looking for climate economy opportunities',
    icon: User,
    color: 'text-spring-green',
    bgColor: 'bg-spring-green/10',
  },
  {
    value: 'partner' as UserType,
    label: 'Partner Organization',
    description: 'Hiring for climate economy roles',
    icon: Building,
    color: 'text-moss-green',
    bgColor: 'bg-moss-green/10',
  },
  {
    value: 'admin' as UserType,
    label: 'Administrator',
    description: 'Platform administration access',
    icon: Shield,
    color: 'text-seafoam-blue',
    bgColor: 'bg-seafoam-blue/10',
  },
];

export function SignUpForm({ className, onSuccess, defaultUserType = 'job_seeker', redirectTo }: SignUpFormProps) {
  const router = useRouter();
  const { signUp, error: authError } = useAuth();
  const { addToast } = useACTToast();

  // Form state
  const [formData, setFormData] = useState<SignUpData>({
    email: '',
    password: '',
    user_type: defaultUserType,
    full_name: '',
    organization_name: '',
    phone: '',
    location: '',
    company_size: '',
    industry: '',
    website_url: '',
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'type' | 'details' | 'confirmation'>('type');

  // Validation rules
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Role-specific validation
    switch (formData.user_type) {
      case 'job_seeker':
        if (!formData.full_name) newErrors.full_name = 'Full name is required';
        break;

      case 'partner':
        if (!formData.organization_name) newErrors.organization_name = 'Organization name is required';
        break;

      case 'admin':
        if (!formData.full_name) newErrors.full_name = 'Full name is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      // ✅ Use the existing signUp function that already creates profiles
      const { data, error } = await signUp(formData);

      if (error) {
        addToast({
          type: 'error',
          message: error.message || 'Failed to create account',
        });
        return;
      }

      // Show success message
      addToast({
        type: 'success',
        message: 'Account created successfully! Please check your email to verify your account.',
      });

      setStep('confirmation');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default redirect after a delay
        setTimeout(() => {
          if (redirectTo) {
            router.push(redirectTo);
          } else {
            // Redirect based on user type
            switch (formData.user_type) {
              case 'job_seeker':
                router.push('/job-seekers/setup');
                break;
              case 'partner':
                router.push('/partners/setup');
                break;
              case 'admin':
                router.push('/admin');
                break;
              default:
                router.push('/dashboard');
            }
          }
        }, 3000);
      }

    } catch (error) {
      console.error('Signup error:', error);
      addToast({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof SignUpData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Render user type selection
  if (step === 'type') {
    return (
      <ACTCard variant="glass" className={cn("p-8 w-full max-w-md", className)}>
        <div className="text-center mb-8">
          <h2 className="text-act-title font-helvetica font-medium text-midnight-forest mb-2">
            Join the Climate Economy
          </h2>
          <p className="text-act-body font-inter text-midnight-forest/70">
            Choose your account type to get started
          </p>
        </div>

        <div className="space-y-4">
          {USER_TYPE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = formData.user_type === option.value;
            
            return (
              <button
                key={option.value}
                onClick={() => handleInputChange('user_type', option.value)}
                className={cn(
                  "w-full p-4 rounded-ios-xl border-2 transition-all text-left",
                  isSelected
                    ? "border-spring-green bg-spring-green/5 shadow-ios-subtle"
                    : "border-sand-gray/20 hover:border-spring-green/30"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-ios-lg flex items-center justify-center", option.bgColor)}>
                    <Icon className={cn("w-6 h-6", option.color)} />
                  </div>
                  <div className="flex-1">
                    <h3 className={cn("text-act-body font-helvetica font-medium", 
                      isSelected ? "text-spring-green" : "text-midnight-forest"
                    )}>
                      {option.label}
                    </h3>
                    <p className="text-act-small font-inter text-midnight-forest/60">
                      {option.description}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-spring-green flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <ACTButton
          onClick={() => setStep('details')}
          className="w-full mt-8"
          variant="primary"
          size="lg"
          icon={<ArrowRight className="ml-2 h-5 w-5" />}
        >
          Continue
        </ACTButton>
      </ACTCard>
    );
  }

  // Render confirmation step
  if (step === 'confirmation') {
    return (
      <ACTCard variant="default" className={cn("p-8 w-full max-w-md text-center", className)}>
        <div className="w-16 h-16 bg-spring-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-spring-green" />
        </div>
        
        <h2 className="text-act-title font-helvetica font-medium text-midnight-forest mb-2">
          Welcome to Climate Economy!
        </h2>
        
        <p className="text-act-body font-inter text-midnight-forest/70 mb-6">
          Your account has been created successfully. Please check your email to verify your account.
        </p>
        
        <div className="text-act-small font-inter text-midnight-forest/60">
          Redirecting you to your dashboard...
        </div>
      </ACTCard>
    );
  }

  // Render details form
  const selectedOption = USER_TYPE_OPTIONS.find(opt => opt.value === formData.user_type)!;

  return (
    <ACTCard variant="default" className={cn("p-8 w-full max-w-md", className)}>
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className={cn("w-12 h-12 rounded-ios-lg flex items-center justify-center", selectedOption.bgColor)}>
            <selectedOption.icon className={cn("w-6 h-6", selectedOption.color)} />
          </div>
          <div>
            <h2 className="text-act-title font-helvetica font-medium text-midnight-forest">
              {selectedOption.label}
            </h2>
            <p className="text-act-small font-inter text-midnight-forest/60">
              Complete your profile
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role-specific fields */}
        {formData.user_type === 'job_seeker' && (
          <div>
            <label className="block text-act-small font-helvetica font-medium text-midnight-forest mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className="input-act"
              placeholder="Enter your full name"
            />
            {errors.full_name && (
              <p className="text-act-small text-red-500 mt-1">{errors.full_name}</p>
            )}
          </div>
        )}

        {formData.user_type === 'partner' && (
          <div>
            <label className="block text-act-small font-helvetica font-medium text-midnight-forest mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              value={formData.organization_name}
              onChange={(e) => handleInputChange('organization_name', e.target.value)}
              className="input-act"
              placeholder="Enter your organization name"
            />
            {errors.organization_name && (
              <p className="text-act-small text-red-500 mt-1">{errors.organization_name}</p>
            )}
          </div>
        )}

        {formData.user_type === 'admin' && (
          <div>
            <label className="block text-act-small font-helvetica font-medium text-midnight-forest mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className="input-act"
              placeholder="Enter your full name"
            />
            {errors.full_name && (
              <p className="text-act-small text-red-500 mt-1">{errors.full_name}</p>
            )}
          </div>
        )}

        {/* Email field */}
        <div>
          <label className="block text-act-small font-helvetica font-medium text-midnight-forest mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="input-act"
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="text-act-small text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password field */}
        <div>
          <label className="block text-act-small font-helvetica font-medium text-midnight-forest mb-2">
            Password *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="input-act pr-12"
              placeholder="Create a secure password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-midnight-forest/60 hover:text-midnight-forest"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-act-small text-red-500 mt-1">{errors.password}</p>
          )}
          <p className="text-act-small text-midnight-forest/60 mt-1">
            Must be at least 8 characters with uppercase, lowercase, and number
          </p>
        </div>

        {/* Form actions */}
        <div className="flex gap-3 pt-4">
          <ACTButton
            type="button"
            onClick={() => setStep('type')}
            variant="outline"
            className="flex-1"
          >
            Back
          </ACTButton>
          
          <ACTButton
            type="submit"
            variant="primary"
            className="flex-1"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </ACTButton>
        </div>

        {/* Auth error display */}
        {authError && (
          <div className="text-center text-act-small text-red-500 bg-red-50 p-3 rounded-ios-lg">
            {String(authError)}
          </div>
        )}
      </form>
    </ACTCard>
  );
} 