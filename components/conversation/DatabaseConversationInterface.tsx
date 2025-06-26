/**
 * Database-integrated conversation interface component
 * Purpose: Provide a complete conversation UI connected to Supabase
 * Location: /components/conversation/DatabaseConversationInterface.tsx
 */
import { useState, useEffect, useRef } from 'react'
import { useConversationMessages, type SimpleConversation } from '@/hooks/useDatabase'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { AgentStatusCard } from './AgentStatusCard'
import { WelcomeMessage } from './WelcomeMessage'
import { BrandFrame } from '../brand/BrandFrame'

interface DatabaseConversationInterfaceProps {
  conversationId: string
  userId: string
  conversation: SimpleConversation
}

export function DatabaseConversationInterface({ 
  conversationId, 
  userId,
  conversation
}: DatabaseConversationInterfaceProps) {
  const { messages, loading, error, addMessage } = useConversationMessages(conversationId)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || sending) return
    
    setSending(true)
    try {
      // Add user message
      const userMessage = await addMessage({
        role: 'human',
        content
      })
      
      // Trigger API to process the message and get AI response
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: content,
          userId
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI')
      }
      
      // Refresh messages to get the AI response
      // Note: In a production app, you might want to implement streaming or
      // directly add the AI response to the messages state
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  // Get the current agent based on the conversation
  const getCurrentAgent = () => {
    return 'marcus' // Default agent since current_agent is not in schema
  }

  const currentAgent = getCurrentAgent()

  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 p-4">
          <div className="animate-pulse h-24 bg-[var(--sand-gray-20)] rounded-lg mb-4" />
          <div className="animate-pulse h-12 bg-[var(--sand-gray-20)] rounded-lg w-3/4 mb-4" />
          <div className="animate-pulse h-12 bg-[var(--sand-gray-20)] rounded-lg w-1/2" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 p-4">
          <BrandFrame size="md" color="moss-green">
            <div className="text-center p-6">
              <h3 className="text-h3 font-title-medium text-[var(--midnight-forest)] mb-2">
                Error Loading Conversation
              </h3>
              <p className="text-body text-[var(--moss-green)]">
                {error}
              </p>
              <button 
                className="mt-4 px-4 py-2 bg-[var(--spring-green)] text-[var(--midnight-forest)] rounded-lg"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </BrandFrame>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Agent status card */}
      {currentAgent && (
        <div className="p-4 border-b border-[var(--sand-gray)]">
          <AgentStatusCard agent={currentAgent} />
        </div>
      )}
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <WelcomeMessage conversationType="general" />
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={{
                  id: message.id,
                  content: message.content,
                  role: (message.role as 'human' | 'assistant' | 'system'),
                  timestamp: new Date(message.created_at),
                  agent: 'marcus'
                }}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-[var(--sand-gray)]">
        <MessageInput 
          onSendMessage={handleSendMessage}
          disabled={sending}
          loading={sending}
        />
      </div>
    </div>
  )
} 