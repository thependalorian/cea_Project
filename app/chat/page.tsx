/**
 * Chat Page Component - Maximized Clean Interface
 * Purpose: Full-width chat interface with maximum space allocation
 * Location: /app/chat/page.tsx
 */

import { ModernChatInterface } from '@/components/chat/ModernChatInterface'
import Navigation from '@/components/shared/Navigation'

export const metadata = {
  title: 'Climate Career Assistant - Alliance for Climate Transition',
  description: 'Connect with our specialized AI assistant for personalized climate career guidance',
}

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ACT Brand Navigation */}
      <Navigation />
      
      {/* MAXIMIZED CHAT INTERFACE - FULL SPACE */}
      <main className="h-[calc(100vh-80px)] p-4">
        <div className="h-full max-w-6xl mx-auto">
          <ModernChatInterface agentId="pendo" />
        </div>
      </main>
    </div>
  )
}