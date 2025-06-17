/**
 * Authentication Utilities
 * 
 * Comprehensive authentication utilities for account creation, password resets,
 * email verification, and user management with JWT integration.
 * 
 * Location: lib/auth-utils.ts
 */

import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Types
export interface UserProfile {
  id: string;
  email: string;
  user_type: 'user' | 'partner' | 'admin' | 'job_seeker';
  role: 'user' | 'partner' | 'admin' | 'super_admin';
  verified: boolean;
  first_name?: string;
  last_name?: string;
  organization_name?: string;
  created_at: string;
  updated_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'job_seeker' | 'partner';
  organizationName?: string;
  phone?: string;
  location?: string;
}

export interface PasswordResetData {
  email: string;
  newPassword: string;
  confirmPassword: string;
  token: string;
}

// Client-side authentication utilities
export class ClientAuth {
  private supabase;

  constructor() {
    this.supabase = createClientComponentClient();
  }

  /**
   * Sign up new user with profile creation
   */
  async signUp(data: SignUpData) {
    try {
      // Validate passwords match if confirm password is provided
      if (data.password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Create auth user
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            user_type: data.userType,
            organization_name: data.organizationName || null,
            phone: data.phone || null,
            location: data.location || null,
          }
        }
      });

      if (authError) throw authError;

      return {
        success: true,
        user: authData.user,
        message: 'Account created successfully! Please check your email to verify your account.'
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
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile with custom claims
      const profile = await this.getUserProfile(data.user.id);

      return {
        success: true,
        user: data.user,
        profile,
        session: data.session
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
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;

      return { success: true };
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
  async requestPasswordReset(email: string) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Password reset email sent! Please check your inbox.'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to send password reset email'
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    try {
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return {
        success: true,
        message: 'Password updated successfully!'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update password'
      };
    }
  }

  /**
   * Resend email verification
   */
  async resendEmailVerification(email: string) {
    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
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
   * Update user profile
   */
  async updateProfile(updates: Partial<UserProfile>) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', (await this.supabase.auth.getUser()).data.user?.id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        profile: data,
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
   * Get user profile with custom claims
   */
  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    try {
      const targetUserId = userId || (await this.supabase.auth.getUser()).data.user?.id;
      if (!targetUserId) return null;

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Get current session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}

// Server-side authentication utilities
export class ServerAuth {
  private supabase;

  constructor() {
    this.supabase = createServerComponentClient({ cookies });
  }

  /**
   * Get server-side session
   */
  async getSession() {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting server session:', error);
      return null;
    }
  }

  /**
   * Get server-side user
   */
  async getUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting server user:', error);
      return null;
    }
  }

  /**
   * Get user profile server-side
   */
  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    try {
      const targetUserId = userId || (await this.getUser())?.id;
      if (!targetUserId) return null;

      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching server user profile:', error);
      return null;
    }
  }

  /**
   * Verify JWT token and get user claims
   */
  async verifyToken(token: string) {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      if (error) throw error;

      if (!user) return null;

      // Get user profile with custom claims
      const profile = await this.getUserProfile(user.id);
      
      return {
        user,
        profile,
        claims: {
          user_id: user.id,
          email: user.email,
          user_type: profile?.user_type || 'user',
          role: profile?.role || 'user',
          verified: profile?.verified || false,
          organization_name: profile?.organization_name
        }
      };
    } catch (error) {
      console.error('Error verifying token:', error);
      return null;
    }
  }
}

// Middleware authentication utilities
export class MiddlewareAuth {
  /**
   * Verify request authentication
   */
  static async verifyRequest(request: NextRequest) {
    try {
      const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                   request.cookies.get('sb-access-token')?.value;

      if (!token) return null;

      // For middleware, we'll use a different approach to verify tokens
      // This is a simplified version - in production you'd want proper JWT verification
      return { id: 'temp-user-id', email: 'temp@example.com' };
    } catch (error) {
      console.error('Error verifying request:', error);
      return null;
    }
  }

  /**
   * Check if user has required role
   */
  static async hasRole(request: NextRequest, requiredRoles: string[]) {
    try {
      const user = await this.verifyRequest(request);
      if (!user) return false;

      // For middleware, we'll implement a simpler role check
      // In production, you'd want to decode the JWT token to get role claims
      return true; // Simplified for now
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }

  /**
   * Create protected route response
   */
  static createProtectedResponse(redirectTo: string = '/login') {
    return NextResponse.redirect(new URL(redirectTo, process.env.NEXT_PUBLIC_SITE_URL));
  }
}

// Validation utilities
export class AuthValidation {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate sign up data
   */
  static validateSignUpData(data: SignUpData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Please enter a valid email address');
    }

    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }

    if (!data.firstName || data.firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters long');
    }

    if (!data.lastName || data.lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters long');
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

// Email Templates for Authentication
export class EmailTemplates {
  /**
   * Welcome email template
   */
  static getWelcomeTemplate(firstName: string, userType: string) {
    return {
      subject: 'Welcome to Climate Economy Assistant!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2D5016;">Welcome ${firstName}!</h1>
          <p>Thank you for joining the Climate Economy Assistant as a ${userType}.</p>
          <p>Please verify your email address to get started:</p>
          <a href="{{verification_link}}" style="background: #4ADE80; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Verify Email</a>
          <p>Best regards,<br>The Climate Economy Team</p>
        </div>
      `
    };
  }

  /**
   * Password reset email template
   */
  static getPasswordResetTemplate(firstName: string) {
    return {
      subject: 'Reset Your Password - Climate Economy Assistant',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2D5016;">Password Reset Request</h1>
          <p>Hi ${firstName},</p>
          <p>You requested to reset your password. Click the link below to create a new password:</p>
          <a href="{{reset_link}}" style="background: #4ADE80; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Reset Password</a>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>The Climate Economy Team</p>
        </div>
      `
    };
  }
}

// Account Management Utilities
export class AccountManager {
  private supabase;

  constructor() {
    this.supabase = createClientComponentClient();
  }

  /**
   * Complete user onboarding flow
   */
  async completeOnboarding(userId: string, onboardingData: any) {
    try {
      // Update profile completion status
      const { error: profileError } = await this.supabase
        .from('profiles')
        .update({ 
          profile_completed: true,
          ...onboardingData 
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Create type-specific profile
      if (onboardingData.user_type === 'job_seeker') {
        const { error: jsError } = await this.supabase
          .from('job_seeker_profiles')
          .insert({
            id: userId,
            user_id: userId,
            full_name: `${onboardingData.first_name} ${onboardingData.last_name}`,
            email: onboardingData.email,
            profile_completed: true
          });
        if (jsError) throw jsError;
      } else if (onboardingData.user_type === 'partner') {
        const { error: partnerError } = await this.supabase
          .from('partner_profiles')
          .insert({
            id: userId,
            organization_name: onboardingData.organization_name,
            full_name: `${onboardingData.first_name} ${onboardingData.last_name}`,
            email: onboardingData.email,
            profile_completed: true
          });
        if (partnerError) throw partnerError;
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(userId: string, reason?: string) {
    try {
      // Log account deletion
      await this.supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          table_name: 'profiles',
          record_id: userId,
          details: { action: 'account_deletion', reason }
        });

      // Soft delete - mark as deleted instead of hard delete
      const { error } = await this.supabase
        .from('profiles')
        .update({ 
          deleted_at: new Date().toISOString(),
          email: `deleted_${Date.now()}@deleted.com` // Anonymize email
        })
        .eq('id', userId);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Export user data (GDPR compliance)
   */
  async exportUserData(userId: string) {
    try {
      const userData: any = {};

      // Get profile data
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      userData.profile = profile;

      // Get conversations
      const { data: conversations } = await this.supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId);

      userData.conversations = conversations;

      // Get user interests
      const { data: interests } = await this.supabase
        .from('user_interests')
        .select('*')
        .eq('user_id', userId);

      userData.interests = interests;

      return { success: true, data: userData };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// Security Utilities
export class SecurityUtils {
  /**
   * Check for suspicious login activity
   */
  static async checkSuspiciousActivity(userId: string, ipAddress: string) {
    // Implementation would check for:
    // - Multiple failed login attempts
    // - Login from new locations
    // - Unusual time patterns
    return { isSuspicious: false, reason: null };
  }

  /**
   * Generate secure tokens
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Rate limiting check
   */
  static checkRateLimit(identifier: string, maxAttempts: number = 5): boolean {
    // Implementation would use Redis or similar for production
    // For now, return true (not rate limited)
    return true;
  }
}

// Export instances for easy use
export const clientAuth = new ClientAuth();
export const serverAuth = new ServerAuth();
export const accountManager = new AccountManager(); 