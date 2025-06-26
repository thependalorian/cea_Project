/**
 * Database hooks for interacting with Supabase
 * Purpose: Provide type-safe database operations
 * Location: /hooks/useDatabase.ts
 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// Simplified types that match actual database schema
export interface SimpleConversation {
  id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
}

export interface SimpleMessage {
  id: string
  conversation_id: string
  content: string
  role: string
  created_at: string
}

// Conversations Hook
export function useConversations(userId: string) {
  const [conversations, setConversations] = useState<SimpleConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('conversations')
        .select('id, user_id, title, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setConversations(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const createConversation = useCallback(async (data: { title?: string }) => {
    try {
      const conversationId = crypto.randomUUID()
      const now = new Date().toISOString()
      
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          id: conversationId,
          user_id: userId,
          title: data.title || 'New Conversation',
          description: null,
          conversation_type: 'general',
          status: 'active',
          message_count: 0,
          total_tokens_used: 0,
          session_metadata: {},
          last_activity: now,
          thread_id: null,
          initial_query: null,
          ended_at: null,
          created_at: now,
          updated_at: now
        })
        .select('id, user_id, title, created_at, updated_at')
        .single()

      if (error) throw error
      setConversations(prev => [newConversation, ...prev])
      return newConversation
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create conversation')
      return null
    }
  }, [userId])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  return {
    conversations,
    loading,
    error,
    createConversation,
    refetch: fetchConversations
  }
}

// Messages Hook
export function useConversationMessages(conversationId: string) {
  const [messages, setMessages] = useState<SimpleMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('conversation_messages')
        .select('id, conversation_id, content, role, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  const addMessage = useCallback(async (message: { content: string; role: string }) => {
    try {
      const messageId = crypto.randomUUID()
      const now = new Date().toISOString()
      
      const { data: newMessage, error } = await supabase
        .from('conversation_messages')
        .insert({
          id: messageId,
          conversation_id: conversationId,
          content: message.content,
          role: message.role,
          content_type: 'text',
          metadata: {},
          processed: false,
          created_at: now
        })
        .select('id, conversation_id, content, role, created_at')
        .single()

      if (error) throw error
      setMessages(prev => [...prev, newMessage])
      return newMessage
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add message')
      return null
    }
  }, [conversationId])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  return {
    messages,
    loading,
    error,
    addMessage,
    refetch: fetchMessages
  }
} 