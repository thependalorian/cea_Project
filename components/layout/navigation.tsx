"use client";

/**
 * iOS-Inspired Navigation Component - Climate Economy Assistant
 * Modern navigation bar with glass morphism and iOS design principles
 * Location: components/layout/Navigation.tsx
 */

import Link from "next/link";
import { ThemeSwitcher } from "./theme-switcher";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export function Navigation() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    // In a real app, you'd get the user from your auth context
    // For now, we'll just show the signed-out state
    setUser(null);
  }, []);

  return (
    <motion.nav 
      className="nav-ios sticky top-0 z-50"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-ios text-midnight-forest hover:bg-gray-100 transition-colors duration-150">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Logo/Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-150"
          >
            <div className="flex items-center gap-3">
              {/* iOS-style app icon */}
              <div className="w-10 h-10 bg-gradient-to-br from-spring-green to-moss-green rounded-ios-lg flex items-center justify-center shadow-ios-subtle">
                <span className="text-white font-helvetica font-semibold text-sm">CEA</span>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-ios-headline text-midnight-forest leading-tight">
                  Climate Economy
                </span>
                <span className="text-ios-caption-1 text-moss-green leading-tight">
                  Assistant
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user && (
              <>
                <NavItem href="/job-seekers">Job Seekers</NavItem>
                <NavItem href="/assistant">AI Assistant</NavItem>
              </>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            
            {user ? (
              <UserMenu user={user} />
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  href="/auth/login"
                  className="text-ios-body font-medium text-midnight-forest hover:bg-gray-100 rounded-ios px-4 py-2 transition-all duration-150"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/sign-up"
                  className="btn-ios-primary text-ios-body"
                >
                  Join CEA
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

// iOS-style navigation item component
function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="nav-ios-item px-4 py-2 rounded-ios transition-all duration-150 hover:bg-gray-100"
    >
      {children}
    </Link>
  );
}

// iOS-style user menu component
function UserMenu({ user }: { user: Record<string, unknown> | null }) {
  const userEmail = user?.email as string;
  
  return (
    <div className="relative group">
      {/* User avatar button */}
      <button className="flex items-center gap-2 p-2 rounded-ios-full hover:bg-gray-100 transition-all duration-150">
        <div className="w-8 h-8 bg-gradient-to-br from-spring-green to-moss-green rounded-ios-full flex items-center justify-center text-white text-ios-footnote font-semibold shadow-ios-subtle">
          {userEmail?.charAt(0).toUpperCase() || 'U'}
        </div>
        <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      <div className="absolute right-0 top-full mt-2 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
        <div className="container-ios shadow-ios-prominent border border-gray-200">
          <div className="py-2">
            <div className="px-4 py-2 border-b border-gray-200">
              <p className="text-ios-footnote text-gray-600">Signed in as</p>
              <p className="text-ios-subheadline font-medium text-midnight-forest truncate">
                {userEmail || 'Unknown User'}
              </p>
            </div>
            
            <div className="py-1">
              <MenuLink href="/dashboard">Dashboard</MenuLink>
              <MenuLink href="/profile">Profile</MenuLink>
              <MenuLink href="/settings">Settings</MenuLink>
              <MenuLink href="/assistant">AI Assistant</MenuLink>
            </div>
            
            <div className="border-t border-gray-200 pt-1">
              <form action="/auth/signout" method="post">
                <button 
                  type="submit" 
                  className="w-full text-left px-4 py-2 text-ios-subheadline text-ios-red hover:bg-gray-50 transition-colors duration-150"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Menu link component
function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 text-ios-subheadline text-midnight-forest hover:bg-gray-50 transition-colors duration-150"
    >
      {children}
    </Link>
  );
} 