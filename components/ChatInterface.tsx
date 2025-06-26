/**
 * Chat Interface Component
 * Purpose: Main chat interface for conversations with agents
 * Location: /components/ChatInterface.tsx
 */
'use client'

import { useState, useRef, useEffect } from 'react'
import { useSupabaseAuth } from '@/providers/AuthProvider'
import createClient from '@/lib/supabase/client'

interface ChatInterfaceProps {
  conversationId?: string
  agentId: string
  onNewConversation?: (conversationId: string) => void
}

interface Message {
  id?: string
  role: 'user' | 'assistant'
  content: string
  timestamp?: string
}

export function ChatInterface({ conversationId, agentId, onNewConversation }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState(conversationId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useSupabaseAuth()
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load existing messages if conversationId is provided
  useEffect(() => {
    if (currentConversationId) {
      loadMessages()
    }
  }, [currentConversationId])

  const loadMessages = async () => {
    if (!currentConversationId) return

    try {
      const response = await fetch(`/api/conversations/${currentConversationId}/messages`)
      if (response.ok) {
        const messagesData = await response.json()
        setMessages(messagesData.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.created_at
        })))
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !user) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Create conversation if this is the first message
      if (!currentConversationId) {
        const convResponse = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
            agent_id: agentId
          })
        })

        if (convResponse.ok) {
          const conversation = await convResponse.json()
          setCurrentConversationId(conversation.id)
          onNewConversation?.(conversation.id)
        }
      }

      // Send user message to backend
      if (currentConversationId) {
        await fetch(`/api/conversations/${currentConversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'user',
            content: userMessage.content,
            agent_id: agentId
          })
        })
      }

      // Get agent response
      const response = await fetch(`/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          context: {
            conversation_id: currentConversationId,
            user_id: user.id
          }
        })
      })

      if (response.ok) {
        const agentResponse = await response.json()
        const assistantMessage: Message = {
          role: 'assistant',
          content: agentResponse.response || agentResponse.message || 'I apologize, but I encountered an error processing your request.',
          timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, assistantMessage])

        // Save assistant message to database
        if (currentConversationId) {
          await fetch(`/api/conversations/${currentConversationId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: 'assistant',
              content: assistantMessage.content,
              agent_id: agentId
            })
          })
        }
      } else {
        throw new Error('Failed to get agent response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please sign in to start chatting.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Start a conversation with your agent!</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.timestamp && (
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="btn btn-primary px-6"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}