/**
 * Chat Hook
 * Provides chat functionality for the chat window component
 * Location: hooks/use-chat.ts
 */

'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import type { ChatMessage, Feedback, Interrupt } from '@/types/chat'

interface ChatContext {
  type?: string
  resume?: Record<string, unknown>
  enhanced_search?: boolean
}

export function useChat() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (content: string, context?: ChatContext) => {
      if (!user) return

      setIsLoading(true)
      setError(null)

      try {
        // Create user message
        const userMessage: ChatMessage = {
          id: crypto.randomUUID(),
          content,
          user: {
            id: user.id,
            name: user.email || 'User',
          },
          createdAt: new Date().toISOString(),
          is_human: true,
          status: 'completed',
          metadata: context,
          feedback: [],
        }

        setMessages(prev => [...prev, userMessage])

        // Send to API
        const response = await fetch('/api/v1/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            context,
            user_id: user.id,
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        // Create AI response message
        const aiMessage: ChatMessage = {
          id: crypto.randomUUID(),
          content: data.response || 'Sorry, I encountered an error processing your request.',
          user: {
            id: 'ai',
            name: 'AI Assistant',
          },
          createdAt: new Date().toISOString(),
          specialist_type: data.specialist_type,
          is_human: false,
          status: 'completed',
          metadata: data.metadata,
          feedback: [],
        }

        setMessages(prev => [...prev, aiMessage])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        
        // Add error message
        const errorMessage: ChatMessage = {
          id: crypto.randomUUID(),
          content: 'Sorry, I encountered an error. Please try again.',
          user: {
            id: 'ai',
            name: 'AI Assistant',
          },
          createdAt: new Date().toISOString(),
          is_human: false,
          status: 'error',
          feedback: [],
        }

        setMessages(prev => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
      }
    },
    [user]
  )

  const sendFeedback = useCallback(
    async (feedback: Feedback) => {
      try {
        await fetch('/api/v1/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(feedback),
        })

        // Update local message with feedback
        setMessages(prev =>
          prev.map(msg =>
            msg.id === feedback.messageId
              ? { ...msg, feedback: [...(msg.feedback || []), feedback] }
              : msg
          )
        )
      } catch (err) {
        console.error('Failed to send feedback:', err)
      }
    },
    []
  )

  const createInterrupt = useCallback(
    async (interrupt: Interrupt) => {
      try {
        await fetch('/api/v1/interrupt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(interrupt),
        })

        // Update local message with interrupt
        setMessages(prev =>
          prev.map(msg =>
            msg.metadata?.conversationId === interrupt.conversationId
              ? { ...msg, interrupt }
              : msg
          )
        )
      } catch (err) {
        console.error('Failed to create interrupt:', err)
      }
    },
    []
  )

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    sendFeedback,
    createInterrupt,
  }
} 