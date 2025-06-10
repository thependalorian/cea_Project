'use client'

import { createClient } from '@/lib/supabase/client'
import { useCallback, useEffect, useState } from 'react'
import type { ChatMessage, Feedback, Interrupt } from '@/types/chat'

interface UseRealtimeChatProps {
  roomName: string
  username: string
}

const EVENT_MESSAGE_TYPE = 'message'
const EVENT_FEEDBACK_TYPE = 'feedback'
const EVENT_INTERRUPT_TYPE = 'interrupt'

export function useRealtimeChat({ roomName, username }: UseRealtimeChatProps) {
  const supabase = createClient()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const newChannel = supabase.channel(roomName)

    newChannel
      .on('broadcast', { event: EVENT_MESSAGE_TYPE }, (payload) => {
        setMessages((current) => [...current, payload.payload as ChatMessage])
      })
      .on('broadcast', { event: EVENT_FEEDBACK_TYPE }, (payload) => {
        // Optionally update feedback for a message
        const feedback = payload.payload as Feedback
        setMessages((current) =>
          current.map((msg) =>
            msg.id === feedback.messageId
              ? { ...msg, feedback: [...(msg.feedback || []), feedback] }
              : msg
          )
        )
      })
      .on('broadcast', { event: EVENT_INTERRUPT_TYPE }, (payload) => {
        // Optionally update interrupt for a message
        const interrupt = payload.payload as Interrupt
        setMessages((current) =>
          current.map((msg) =>
            msg.id === interrupt.conversationId
              ? { ...msg, interrupt }
              : msg
          )
        )
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        }
      })

    setChannel(newChannel)

    return () => {
      supabase.removeChannel(newChannel)
    }
  }, [roomName, username, supabase])

  const sendMessage = useCallback(
    async (content: string, options: Partial<ChatMessage> = {}) => {
      if (!channel || !isConnected) return

      const message: ChatMessage = {
        id: crypto.randomUUID(),
        content,
        user: {
          id: options.is_human ? 'human' : 'user',
          name: username,
        },
        createdAt: new Date().toISOString(),
        specialist_type: options.specialist_type,
        is_human: options.is_human ?? true,
        status: options.status ?? 'completed',
        metadata: options.metadata,
        feedback: [],
        interrupt: undefined,
      }

      // Update local state immediately for the sender
      setMessages((current) => [...current, message])

      await channel.send({
        type: 'broadcast',
        event: EVENT_MESSAGE_TYPE,
        payload: message,
      })
    },
    [channel, isConnected, username]
  )

  const sendFeedback = useCallback(
    async (feedback: Feedback) => {
      if (!channel || !isConnected) return
      await channel.send({
        type: 'broadcast',
        event: EVENT_FEEDBACK_TYPE,
        payload: feedback,
      })
    },
    [channel, isConnected]
  )

  const createInterrupt = useCallback(
    async (interrupt: Interrupt) => {
      if (!channel || !isConnected) return
      await channel.send({
        type: 'broadcast',
        event: EVENT_INTERRUPT_TYPE,
        payload: interrupt,
      })
    },
    [channel, isConnected]
  )

  return { messages, sendMessage, sendFeedback, createInterrupt, isConnected }
}
