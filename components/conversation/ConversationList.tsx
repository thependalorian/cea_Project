/**
 * Conversation List Component - Production Ready
 * Purpose: Display and manage conversation list without schema conflicts
 * Location: /components/conversation/ConversationList.tsx
 */
'use client'

import { useState } from 'react'
import { BrandFrame } from '@/components/brand/BrandFrame'
import { useConversations, type SimpleConversation } from '@/hooks/useDatabase'

interface ConversationListProps {
  userId: string
  onSelectConversation: (conversation: SimpleConversation) => void
  selectedId?: string
}

export function ConversationList({ userId, onSelectConversation, selectedId }: ConversationListProps) {
  const { conversations, loading, error, createConversation } = useConversations(userId)
  const [creating, setCreating] = useState(false)

  const handleNewConversation = async () => {
    setCreating(true)
    try {
      const newConversation = await createConversation({
        title: 'New Conversation'
      })
      if (newConversation) {
        onSelectConversation(newConversation)
      }
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse h-20 bg-[var(--sand-gray-20)] rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-body text-[var(--moss-green)]">
          Failed to load conversations: {error}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleNewConversation}
        disabled={creating}
        className="w-full p-4 bg-[var(--spring-green)] text-[var(--midnight-forest)] 
                   rounded-lg font-body-semibold hover:bg-[var(--spring-green-90)] 
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center"
      >
        {creating ? (
          <span className="inline-block w-4 h-4 border-2 border-[var(--midnight-forest)] border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        {creating ? 'Creating...' : 'New Conversation'}
      </button>

      <BrandFrame size="sm" color="moss-green">
        <div className="space-y-3">
          <h3 className="text-h3 font-title-medium text-[var(--midnight-forest)]">
            Recent Conversations
          </h3>
          
          {conversations.length === 0 ? (
            <p className="text-body text-[var(--moss-green)] text-center py-8">
              No conversations yet. Start your first conversation above.
            </p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full p-3 rounded-lg text-left transition-colors border
                    ${selectedId === conversation.id 
                      ? 'bg-[var(--spring-green-20)] border-[var(--spring-green)]' 
                      : 'bg-white border-[var(--sand-gray)] hover:bg-[var(--sand-gray-10)]'
                    }`}
                >
                  <h4 className="text-body font-body-semibold text-[var(--midnight-forest)] mb-1">
                    {conversation.title || 'Untitled Conversation'}
                  </h4>
                  <p className="text-body-small text-[var(--moss-green)]">
                    {new Date(conversation.updated_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </BrandFrame>
    </div>
  )
} 