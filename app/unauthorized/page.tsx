/**
 * Unauthorized Access Page - Climate Economy Assistant
 * Location: app/unauthorized/page.tsx
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ACTButton } from '@/components/ACTButton';
import { ACTCard } from '@/components/ACTCard';
import { SimpleLayout } from '@/components/SimpleLayout';
import { Shield, ArrowLeft, Home, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <SimpleLayout>
      <div className="min-h-screen bg-gradient-to-br from-sand-gray/30 via-white to-seafoam-blue/20 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <ACTCard 
            variant="default" 
            className="p-8 bg-white/90 backdrop-blur-sm border border-white/50 shadow-ios-prominent text-center"
          >
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-red-600" />
            </div>
            
            <h1 className="text-2xl font-helvetica font-bold text-midnight-forest mb-4">
              Access Denied
            </h1>
            
            <p className="text-midnight-forest/70 font-inter mb-8 leading-relaxed">
              You don't have permission to access this page. Please log in with the appropriate credentials or contact support if you believe this is an error.
            </p>
            
            <div className="space-y-4">
              <ACTButton 
                variant="primary" 
                fullWidth
                icon={<LogIn className="w-5 h-5" />}
                href="/login"
                className="shadow-ios-normal"
              >
                Sign In
              </ACTButton>
              
              <ACTButton 
                variant="outline" 
                fullWidth
                icon={<Home className="w-5 h-5" />}
                href="/"
                className="border-spring-green/30 hover:border-spring-green"
              >
                Go Home
              </ACTButton>
              
              <ACTButton 
                variant="ghost" 
                fullWidth
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => router.back()}
                className="text-midnight-forest/60 hover:text-midnight-forest"
              >
                Go Back
              </ACTButton>
            </div>
          </ACTCard>
        </div>
      </div>
    </SimpleLayout>
  );
} 