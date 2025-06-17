/**
 * Database Configuration for ACT Brand Demo
 * Uses environment variables for secure token management
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables. Database features will not work.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database health check function
export async function checkDatabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('partners')
      .select('count', { count: 'exact', head: true });
      
    if (error) {
      console.error('❌ Database connection error:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Database connection successful');
    return { success: true, count: data };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { success: false, error: String(error) };
  }
}

// Export types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      partners: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
      };
    };
  };
}; 

// Simple AnalyticsService for testing database connections
export class AnalyticsService {
  static async testConnection() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });
        
      if (error) {
        return { success: false, error: error.message };
      }
      
      return { success: true, count: data };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  static async getDashboardStats() {
    try {
      // Simple stats for demo purposes
      const [profiles, partners] = await Promise.all([
        supabase.from('profiles').select('count', { count: 'exact', head: true }),
        supabase.from('partner_profiles').select('count', { count: 'exact', head: true })
      ]);

      return {
        totalUsers: profiles.count || 0,
        totalPartners: partners.count || 0,
        totalJobs: 0,
        totalResources: 0,
        recentConversations: []
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      return {
        totalUsers: 0,
        totalPartners: 0,
        totalJobs: 0,
        totalResources: 0,
        recentConversations: []
      };
    }
  }
} 