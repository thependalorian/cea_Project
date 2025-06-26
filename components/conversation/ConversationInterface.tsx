/**
 * Brand-aligned conversation interface
 * Purpose: Main chat interface following ACT design system with real backend integration
 * Location: /components/conversation/ConversationInterface.tsx
 */
import { useState, useEffect, useRef } from 'react'
import { BrandFrame } from '@/components/brand/BrandFrame'
import { BrandBrackets } from '@/components/brand/BrandBrackets'
import { AgentStatusCard } from './AgentStatusCard'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { WelcomeMessage } from './WelcomeMessage'
import { AgentAvatar } from './AgentAvatar'
import { useConversationMessages } from '@/hooks/useDatabase'

interface ConversationInterfaceProps {
  userId: string
  conversationId: string
  currentAgent: string
  initialContext?: Record<string, any>
}

export function ConversationInterface({ 
  userId, 
  conversationId, 
  currentAgent,
  initialContext 
}: ConversationInterfaceProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [streamingResponse, setStreamingResponse] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, loading, error, addMessage } = useConversationMessages(conversationId)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingResponse])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return
    
    setIsLoading(true)
    
    try {
      // Add user message to database
      await addMessage({
        role: 'human',
        content: content.trim()
      })

      // Call the agent API to get response
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: content.trim(),
          userId,
          agentId: currentAgent,
          context: initialContext
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get agent response')
      }

      // Check if response supports streaming
      const reader = response.body?.getReader()
      const isStream = response.headers.get('content-type')?.includes('text/plain')

      if (reader && isStream) {
        // Handle streaming response
        setStreamingResponse('')
        let accumulatedText = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = new TextDecoder().decode(value)
            accumulatedText += chunk
            setStreamingResponse(accumulatedText)
          }

          // After streaming completes, the message should already be in the database
          // Force refresh messages to show the complete response
          setStreamingResponse(null)
        } catch (streamError) {
          console.error('Streaming error:', streamError)
          setStreamingResponse(null)
        }
      } else {
        // Handle non-streaming response
        const data = await response.json()
        // Message should already be added to database by the API
      }

    } catch (error) {
      console.error('Error sending message:', error)
      
      // Add error message to UI
      await addMessage({
        role: 'assistant',
        content: `I apologize, but I encountered an error processing your message: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto h-full flex flex-col">
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
      <div className="max-w-4xl mx-auto h-full flex flex-col">
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
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Header with Agent Status */}
      <div className="mb-6">
        <BrandFrame size="sm" color="spring-green">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-h2 font-title-medium text-[var(--midnight-forest)]">
                Climate Career Guidance
              </h2>
              <p className="text-body text-[var(--moss-green)] mt-1">
                Get personalized support from our specialist team
              </p>
            </div>
            {currentAgent && (
              <AgentStatusCard agent={currentAgent} />
            )}
          </div>
        </BrandFrame>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6">
        {messages.length === 0 && (
          <WelcomeMessage conversationType="general" />
        )}
        
        {messages.map((msg, index) => (
          <MessageBubble 
            key={msg.id} 
            message={{
              id: msg.id,
              content: msg.content,
              role: (msg.role as 'human' | 'assistant' | 'system'),
              timestamp: new Date(msg.created_at),
              agent: currentAgent
            }}
            isLast={index === messages.length - 1}
          />
        ))}
        
        {streamingResponse !== null && (
          <div className="flex justify-start">
            <div className="max-w-3xl">
              <BrandBrackets size="sm">
                <div className="bg-white border border-[var(--sand-gray)] rounded-2xl rounded-bl-md px-6 py-4">
                  {currentAgent && (
                    <div className="flex items-center mb-3">
                      <AgentAvatar agent={currentAgent} size="sm" />
                      <div className="ml-3">
                        <div className="text-body-small font-body-medium text-[var(--midnight-forest)]">
                          {getAgentName(currentAgent)}
                        </div>
                        <div className="text-caption text-[var(--moss-green)]">
                          {getAgentRole(currentAgent)}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="prose prose-sm max-w-none">
                    <p>{streamingResponse}<span className="streaming-text">|</span></p>
                  </div>
                </div>
              </BrandBrackets>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[var(--sand-gray)] pt-6">
        <MessageInput 
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          loading={isLoading}
        />
      </div>
    </div>
  )
}

// Helper functions
function getAgentName(agent: string): string {
  const agentNames = {
    marcus: 'Marcus',
    liv: 'Liv',
    miguel: 'Miguel',
    alex: 'Alex',
    lauren: 'Lauren',
    mai: 'Mai',
    jasmine: 'Jasmine',
    pendo: 'Pendo',
    james: 'James',
    sarah: 'Sarah',
    david: 'David',
    maria: 'Maria',
    andre: 'Andre',
    carmen: 'Carmen',
    mei: 'Mei',
    raj: 'Raj',
    sofia: 'Sofia',
    michael: 'Michael',
    elena: 'Elena',
    thomas: 'Thomas'
  }
  return agentNames[agent as keyof typeof agentNames] || agent
}

function getAgentRole(agent: string): string {
  const agentRoles = {
    marcus: 'Veterans Transition Specialist',
    liv: 'International Climate Lead',
    miguel: 'Environmental Justice Advocate',
    alex: 'Green Finance Expert', 
    lauren: 'Clean Energy Specialist',
    mai: 'Mental Health & Wellness',
    jasmine: 'Sustainability Specialist',
    pendo: 'Climate Navigator',
    james: 'Military Skills Translator',
    sarah: 'Veterans Career Coach',
    david: 'Veterans Benefits Specialist',
    maria: 'Community Engagement',
    andre: 'Environmental Health Specialist',
    carmen: 'Cultural Liaison',
    mei: 'Asia-Pacific Specialist',
    raj: 'South Asia/Middle East Specialist',
    sofia: 'Europe/Africa Specialist',
    michael: 'Crisis Intervention',
    elena: 'Career Counseling',
    thomas: 'Data & Analytics'
  }
  return agentRoles[agent as keyof typeof agentRoles] || 'Climate Career Specialist'
} 