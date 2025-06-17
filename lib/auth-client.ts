/**
 * Client-Side Authentication Utilities
 * 
 * This file contains authentication utilities that can be used in client components.
 * It does NOT import any server-side modules like next/headers.
 * 
 * Location: lib/auth-client.ts
 */

'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Types
export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'job_seeker' | 'partner' | 'admin';
  organizationName?: string;
  phone?: string;
  location?: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
  message?: string;
  user?: any;
}

// Client Authentication Class
export class ClientAuth {
  private supabase;

  constructor() {
    this.supabase = createClientComponentClient();
  }

  /**
   * Sign up a new user
   */
  async signUp(userData: SignUpData): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            user_type: userData.userType,
            organization_name: userData.organizationName || '',
            phone: userData.phone || '',
            location: userData.location || ''
          }
        }
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Account created successfully! Please check your email to verify your account.',
        user: data.user
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create account'
      };
    }
  }

  /**
   * Sign in user
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Signed in successfully!',
        user: data.user
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to sign in'
      };
    }
  }

  /**
   * Sign out user
   */
  async signOut(): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;

      return {
        success: true,
        message: 'Signed out successfully!'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to sign out'
      };
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Password reset email sent! Please check your inbox.'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send reset email'
      };
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(email: string): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Verification email sent! Please check your inbox.'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send verification email'
      };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error: any) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: any): Promise<AuthResult> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        data: updates
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Profile updated successfully!'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update profile'
      };
    }
  }

  /**
   * Demo login for George Nekwaya's various profiles
   */
  async demoLogin(profileType: 'admin' | 'jobseeker' | 'partner'): Promise<AuthResult> {
    const credentials = {
      admin: {
        email: 'gnekwaya@joinact.org',
        password: 'ClimateAdmin2025!George_Nekwaya_Act'
      },
      jobseeker: {
        email: 'george.n.p.nekwaya@gmail.com',
        password: 'ClimateJobs2025!JobSeeker'
      },
      partner: {
        email: 'buffr_inc@buffr.ai',
        password: 'ClimateJobs2025!Buffr_Inc'
      }
    };

    const creds = credentials[profileType];
    return this.signIn(creds.email, creds.password);
  }
}

// Validation utilities
export class AuthValidation {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isStrongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  }

  static validateSignUpData(data: SignUpData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Valid email is required');
    }

    if (!data.password || !this.isStrongPassword(data.password)) {
      errors.push('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
    }

    if (!data.firstName || data.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
    }

    if (!data.lastName || data.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    if (data.userType === 'partner' && (!data.organizationName || data.organizationName.trim().length < 2)) {
      errors.push('Organization name is required for partner accounts');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export instance for easy use
export const clientAuth = new ClientAuth(); 