'use client';

import { createContext, useContext, useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import type { ChatMessage, ChatUser, ChatResponse, ChatContext as ChatContextType, Feedback, Interrupt } from '@/types/chat'

// Extended context type
type ChatProviderContextType = {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  sendMessage: (content: string, context?: ChatContextType, options?: Partial<ChatMessage>) => Promise<void>
  sendFeedback: (feedback: Feedback) => Promise<void>
  createInterrupt: (interrupt: Interrupt) => Promise<void>
  clearMessages: () => void
}

const ChatContext = createContext<ChatProviderContextType | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Send a chat message (with HITL fields)
  const sendMessage = useCallback(async (
    content: string,
    context: ChatContextType = {},
    options: Partial<ChatMessage> = {}
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content,
        createdAt: new Date().toISOString(),
        user: {
          id: options.is_human ? 'human' : 'user',
          name: options.is_human ? 'Human' : 'You',
        },
        specialist_type: options.specialist_type,
        is_human: options.is_human ?? true,
        status: options.status ?? 'completed',
        metadata: options.metadata,
      }
      setMessages(prev => [...prev, userMessage])

      // Get assistant response
      const response = await apiClient.interactiveChat({
        query: content,
        user_id: options.user?.id,
        conversation_id: options.metadata?.conversation_id,
        is_human: options.is_human ?? true,
        specialist_type: options.specialist_type,
        status: options.status ?? 'completed',
        metadata: options.metadata,
        context,
      })

      // Check if response is a ReadableStream (streaming mode)
      if (response instanceof ReadableStream) {
        // For now, we don't handle streaming in this context
        // You might want to implement streaming handling here
        throw new Error('Streaming responses are not supported in this chat context')
      }

      // Create assistant message from response
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        createdAt: new Date().toISOString(),
        user: {
          id: 'assistant',
          name: 'Climate Economy Assistant',
        },
        sources: response.sources,
        specialist_type: response.specialist_type,
        is_human: response.is_human,
        status: response.status as any,
        metadata: response.metadata,
        feedback: response.feedback,
        interrupt: response.interrupt,
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Chat error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: err instanceof Error ? err.message : 'An error occurred. Please try again.',
        createdAt: new Date().toISOString(),
        user: {
          id: 'system',
          name: 'System',
        },
        error: true,
        status: 'error',
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Send feedback for a message
  const sendFeedback = useCallback(async (feedback: Feedback) => {
    try {
      await apiClient.sendFeedback(feedback)
      // Optionally update local message feedback state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send feedback')
    }
  }, [])

  // Create a conversation interrupt
  const createInterrupt = useCallback(async (interrupt: Interrupt) => {
    try {
      await apiClient.createInterrupt(interrupt)
      // Optionally update local state for interrupts
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create interrupt')
    }
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return (
    <ChatContext.Provider value={{
      messages,
      isLoading,
      error,
      sendMessage,
      sendFeedback,
      createInterrupt,
      clearMessages,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
} 