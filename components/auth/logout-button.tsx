"use client";

import { ACTButton } from "@/components/ACTButton";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Logout Button Component
 * Following rule #16: Secure endpoints with proper authentication
 * Following rule #2: Create modular UI components
 * 
 * Location: /components/auth/logout-button.tsx
 */

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      
      // Use API route instead of direct Supabase client
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Redirect to login page
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect on error to ensure user is logged out
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ACTButton
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
      icon={<LogOut className="w-4 h-4" />}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      {isLoading ? 'Logging out...' : 'Logout'}
    </ACTButton>
  );
}
