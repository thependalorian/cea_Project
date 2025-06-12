/**
 * ClimateAdvisoryChat Component
 * Purpose: Provides climate advisory chat functionality for users
 * Location: /components/ClimateAdvisoryChat.tsx
 * Following Rule #3: Component documentation and Rule #1: Always use DaisyUI
 */

'use client';

import { useState } from 'react';

interface ClimateAdvisoryChatProps {
  className?: string;
}

export function ClimateAdvisoryChat({ className = '' }: ClimateAdvisoryChatProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`climate-advisory-chat ${className}`}>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-circle btn-primary fixed bottom-4 right-4 z-50 shadow-lg"
        aria-label="Open Climate Advisory Chat"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.418 8-9.899 8a9.863 9.863 0 01-4.126-.9L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.418-8 9.899-8s9.899 3.582 9.899 8z"
          />
        </svg>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 w-80 h-96 bg-base-100 rounded-lg shadow-xl border border-base-300 z-40">
          <div className="flex items-center justify-between p-4 border-b border-base-300">
            <h3 className="font-semibold text-base-content">Climate Advisory</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          
          <div className="p-4 h-64 overflow-y-auto">
            <div className="text-center text-base-content/70">
              <p className="mb-2">Climate Advisory Chat</p>
              <p className="text-sm">Coming soon...</p>
            </div>
          </div>
          
          <div className="p-4 border-t border-base-300">
            <input
              type="text"
              placeholder="Ask about climate careers..."
              className="input input-bordered w-full"
              disabled
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ClimateAdvisoryChat; 