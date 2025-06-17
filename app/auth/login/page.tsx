/**
 * Auth Login Page - Climate Economy Assistant
 * Redirects to main login page
 * Location: app/auth/login/page.tsx
 */

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log('Auth login page loaded, redirecting to main login');
    const redirect = searchParams.get('redirect');
    const redirectParam = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
    router.replace(`/login${redirectParam}`);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-spring-green mx-auto mb-4"></div>
        <p className="text-moss-green">Redirecting to login page...</p>
      </div>
    </div>
  );
} 