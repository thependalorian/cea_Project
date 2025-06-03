import EnhancedChat from '@/components/enhanced-chat';

/**
 * Enhanced Chat Page - Climate Economy Assistant
 * 
 * Showcases the improved chat interface with:
 * - Structured responses (no markdown formatting)
 * - Source citations and URLs
 * - Actionable items with direct links
 * - Contextual follow-up questions
 * - Intelligent suggestions
 * 
 * Location: /app/enhanced-chat/page.tsx
 */

export default function EnhancedChatPage() {
  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto">
        <EnhancedChat />
      </div>
    </div>
  );
} 