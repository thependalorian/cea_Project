'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, User, Briefcase, Building } from 'lucide-react';

interface SignUpFormProps {
  defaultUserType?: 'job_seeker' | 'partner';
}

export const SignUpForm = ({ defaultUserType = 'job_seeker' }: SignUpFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    userType: defaultUserType,
    organizationName: '',
    phone: '',
    location: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.userType === 'partner' && !formData.organizationName) {
      setError('Organization name is required for partner accounts');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          user_type: formData.userType,
          first_name: formData.firstName,
          last_name: formData.lastName,
          organization_name: formData.organizationName,
          phone: formData.phone,
          location: formData.location
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create account');
      }

      setSuccess(true);
      
      // Redirect to login after showing success message
      setTimeout(() => {
        router.push('/auth/login?message=Account created successfully! Please check your email to verify your account.');
      }, 3000);

    } catch (error: any) {
      setError(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-spring-green/20 rounded-full flex items-center justify-center mx-auto">
          <User className="w-8 h-8 text-spring-green" />
        </div>
        <h3 className="text-xl font-helvetica font-medium text-midnight-forest">
          Account Created Successfully!
        </h3>
        <p className="text-midnight-forest/70">
          Please check your email to verify your account. You'll be redirected to the login page shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* User Type Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-inter font-medium text-midnight-forest">
          Account Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, userType: 'job_seeker' }))}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              formData.userType === 'job_seeker'
                ? 'border-spring-green bg-spring-green/10 text-midnight-forest'
                : 'border-sage-green/30 bg-white text-moss-green hover:border-spring-green/50'
            }`}
          >
            <User className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Job Seeker</div>
          </button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({ ...prev, userType: 'partner' }))}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              formData.userType === 'partner'
                ? 'border-spring-green bg-spring-green/10 text-midnight-forest'
                : 'border-sage-green/30 bg-white text-moss-green hover:border-spring-green/50'
            }`}
          >
            <Building className="w-6 h-6 mx-auto mb-2" />
            <div className="text-sm font-medium">Partner/Employer</div>
          </button>
        </div>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="firstName" className="block text-sm font-inter font-medium text-midnight-forest">
            First Name *
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white border border-sage-green/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-spring-green focus:border-transparent transition-all duration-200 text-midnight-forest font-inter placeholder-moss-green/60"
            placeholder="First name"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="lastName" className="block text-sm font-inter font-medium text-midnight-forest">
            Last Name *
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white border border-sage-green/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-spring-green focus:border-transparent transition-all duration-200 text-midnight-forest font-inter placeholder-moss-green/60"
            placeholder="Last name"
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-inter font-medium text-midnight-forest">
          Email Address *
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-4 py-3 bg-white border border-sage-green/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-spring-green focus:border-transparent transition-all duration-200 text-midnight-forest font-inter placeholder-moss-green/60"
          placeholder="your.email@example.com"
          required
        />
      </div>

      {/* Organization Name (for partners) */}
      {formData.userType === 'partner' && (
        <div className="space-y-2">
          <label htmlFor="organizationName" className="block text-sm font-inter font-medium text-midnight-forest">
            Organization Name *
          </label>
          <input
            id="organizationName"
            name="organizationName"
            type="text"
            value={formData.organizationName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white border border-sage-green/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-spring-green focus:border-transparent transition-all duration-200 text-midnight-forest font-inter placeholder-moss-green/60"
            placeholder="Your organization name"
            required
          />
        </div>
      )}

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-inter font-medium text-midnight-forest">
          Password *
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white border border-sage-green/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-spring-green focus:border-transparent transition-all duration-200 text-midnight-forest font-inter placeholder-moss-green/60 pr-12"
            placeholder="Create a secure password"
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

      {/* Confirm Password */}
      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-inter font-medium text-midnight-forest">
          Confirm Password *
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white border border-sage-green/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-spring-green focus:border-transparent transition-all duration-200 text-midnight-forest font-inter placeholder-moss-green/60 pr-12"
            placeholder="Confirm your password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-moss-green hover:text-midnight-forest transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Optional Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-inter font-medium text-midnight-forest">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white border border-sage-green/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-spring-green focus:border-transparent transition-all duration-200 text-midnight-forest font-inter placeholder-moss-green/60"
            placeholder="(555) 123-4567"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-inter font-medium text-midnight-forest">
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-white border border-sage-green/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-spring-green focus:border-transparent transition-all duration-200 text-midnight-forest font-inter placeholder-moss-green/60"
            placeholder="Boston, MA"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-spring-green hover:bg-spring-green/90 text-midnight-forest font-inter font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating Account...' : 'Create Account'}
      </button>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-sm font-inter text-moss-green/80">
          Already have an account?{' '}
          <a href="/auth/login" className="text-midnight-forest font-semibold hover:text-spring-green transition-colors">
            Sign in here
          </a>
        </p>
      </div>
    </form>
  );
};

export default SignUpForm;
