/**
 * Simple Chat Button Component
 * A basic floating chat button that always works
 * Location: components/ui/ChatButton.tsx
 */

'use client';

import { useState } from 'react';

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-[9999] w-80 h-96 bg-white border-2 border-gray-300 rounded-lg shadow-2xl">
        <div className="p-4 bg-gray-100 border-b flex justify-between items-center">
          <h3 className="font-bold text-gray-800">Chat with Pendo</h3>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-600 hover:text-gray-800 text-xl font-bold"
          >
            ×
          </button>
        </div>
        <div className="p-4 h-full">
          <div className="mb-4 p-3 bg-gray-100 rounded-lg">
            <p className="text-sm">Hi! I'm Pendo, your Climate Economy Supervisor. How can I help you today?</p>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <input 
              type="text" 
              placeholder="Type your message..."
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 w-16 h-16 rounded-full text-white shadow-2xl hover:shadow-xl transition-all duration-300 flex items-center justify-center pulse-animation"
      style={{ 
        backgroundColor: '#B2DE26',
        border: '3px solid #ffffff',
        cursor: 'pointer',
        zIndex: 99999,
        position: 'fixed',
        animation: 'pulse 2s infinite'
      }}
      title="Chat with Pendo - Click to open"
    >
      <svg 
        width="28" 
        height="28" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
      </svg>
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(178, 222, 38, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(178, 222, 38, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(178, 222, 38, 0);
          }
        }
      `}</style>
    </button>
  );
} 