import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export type UserRole = 'user' | 'partner' | 'admin';

const roleBasedRoutes = {
  user: '/protected/job-seekers',
  partner: '/protected/partners',
  admin: '/protected/admin'
};

export function useRoleNavigation() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        router.push('/auth/login');
        return;
      }

      // Get user role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      const userRole = profile?.role as UserRole || 'user';
      
      // Navigate to appropriate route based on role
      router.push(roleBasedRoutes[userRole]);
    };

    checkUserRole();
  }, [router]);

  const navigateByRole = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
    if (sessionError || !session) {
      router.push('/auth/login');
      return;
    }

    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const userRole = profile?.role as UserRole || 'user';
    
    // Navigate to appropriate route based on role
    router.push(roleBasedRoutes[userRole]);
  };

  return { navigateByRole };
} 