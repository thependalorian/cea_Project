/**
 * Simple Layout Component
 * 
 * A clean, minimal layout for pages that need basic structure
 * without heavy navigation or complex UI elements.
 * 
 * Location: components/SimpleLayout.tsx
 */

'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { ACTButton } from '@/components/ACTButton';
import { LogOut, User, Settings } from 'lucide-react';

interface SimpleLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showAuth?: boolean;
}

export function SimpleLayout({ 
  children, 
  showHeader = true, 
  showAuth = true 
}: SimpleLayoutProps) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const redirectToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-gray/20 via-white to-seafoam-blue/10">
      {showHeader && (
        <header className="bg-white/80 backdrop-blur-sm border-b border-sand-gray/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-spring-green to-moss-green rounded-xl flex items-center justify-center">
                  <div className="w-6 h-6 bg-white rounded-sm"></div>
                </div>
                <div>
                  <h1 className="text-xl font-helvetica font-bold text-midnight-forest">
                    Climate Economy Assistant
                  </h1>
                  <p className="text-xs font-inter text-moss-green">
                    Massachusetts Clean Energy Careers
                  </p>
                </div>
              </div>

              {/* Auth Section */}
              {showAuth && (
                <div className="flex items-center space-x-4">
                  {loading ? (
                    <div className="w-8 h-8 border-2 border-spring-green/30 border-t-spring-green rounded-full animate-spin"></div>
                  ) : user ? (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 bg-spring-green/10 rounded-xl px-3 py-2">
                        <User className="w-4 h-4 text-spring-green" />
                        <span className="text-sm font-inter text-midnight-forest font-medium">
                          {user.email}
                        </span>
                      </div>
                      
                      <ACTButton
                        variant="outline"
                        size="sm"
                        icon={<Settings className="w-4 h-4" />}
                        onClick={redirectToDashboard}
                        className="border-spring-green/30 hover:border-spring-green"
                      >
                        Dashboard
                      </ACTButton>
                      
                      <ACTButton
                        variant="outline"
                        size="sm"
                        icon={<LogOut className="w-4 h-4" />}
                        onClick={handleSignOut}
                        className="border-red-300 hover:border-red-500 text-red-600 hover:text-red-700"
                      >
                        Sign Out
                      </ACTButton>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <ACTButton
                        variant="outline"
                        size="sm"
                        href="/login"
                        className="border-spring-green/30 hover:border-spring-green"
                      >
                        Sign In
                      </ACTButton>
                      <ACTButton
                        variant="primary"
                        size="sm"
                        href="/signup"
                      >
                        Get Started
                      </ACTButton>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-midnight-forest/5 border-t border-sand-gray/20 py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-spring-green to-moss-green rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <div>
                <p className="text-sm font-inter text-midnight-forest font-medium">
                  Climate Economy Assistant
                </p>
                <p className="text-xs font-inter text-moss-green">
                  Powered by Alliance for Climate Transition
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm font-inter text-midnight-forest/60">
              <a href="/about" className="hover:text-spring-green transition-colors">
                About
              </a>
              <a href="/privacy" className="hover:text-spring-green transition-colors">
                Privacy
              </a>
              <a href="/terms" className="hover:text-spring-green transition-colors">
                Terms
              </a>
              <a href="/contact" className="hover:text-spring-green transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SimpleLayout; 