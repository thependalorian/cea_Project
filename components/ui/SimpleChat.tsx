/**
 * Simple Chat Button - Testing Component
 * Location: components/ui/SimpleChat.tsx
 */

'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';

export function SimpleChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Simple Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg flex items-center justify-center"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}

      {/* Simple Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-white border border-gray-300 rounded-lg shadow-xl p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Chat</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Chat window is open! The component is working.
          </div>
        </div>
      )}
    </>
  );
} 