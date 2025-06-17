"use client";

import type { ChatMessage } from '@/types/chat'
import FeedbackWidget from '@/components/FeedbackWidget'
import { BadgeAlert, UserCheck, Bot, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import React from 'react'

interface ChatMessageProps {
  message: ChatMessage
  showHeader?: boolean
  onFeedback?: (messageId: string, feedback: { feedback_type: string; details?: string }) => void
  onInterruptAction?: (interruptId: string, action: 'resolve' | 'reject') => void
}

export function ChatMessage({ message, showHeader = true, onFeedback, onInterruptAction }: ChatMessageProps) {
  const isAssistant = message.user.id === 'assistant'
  const isHuman = message.is_human
  const status = message.status
  const specialistType = message.specialist_type
  const interrupt = message.interrupt

  // Interrupt banner
  const renderInterruptBanner = () => {
    if (!interrupt) return null
    return (
      <div className="mb-2 p-2 rounded-lg bg-warning/20 border border-warning flex items-center gap-2 animate-pulse">
        <BadgeAlert className="text-warning" />
        <span className="text-warning font-medium text-sm">
          Conversation paused for human review: <b>{interrupt.type}</b> ({interrupt.status})
        </span>
        {onInterruptAction && interrupt.status === 'pending' && (
          <>
            <button
              className="btn btn-xs btn-success ml-2"
              onClick={() => onInterruptAction(interrupt.id!, 'resolve')}
            >Resolve</button>
            <button
              className="btn btn-xs btn-error ml-1"
              onClick={() => onInterruptAction(interrupt.id!, 'reject')}
            >Reject</button>
          </>
        )}
      </div>
    )
  }

  // Badges for specialist, human/AI, status
  const renderBadges = () => (
    <div className="flex gap-2 mb-1">
      {specialistType && (
        <span className="badge badge-outline badge-info flex items-center gap-1"><ShieldCheck className="w-3 h-3" />{specialistType}</span>
      )}
      {isHuman !== undefined && (
        <span className={cn("badge badge-outline flex items-center gap-1", isHuman ? 'badge-success' : 'badge-primary')}>
          {isHuman ? <UserCheck className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
          {isHuman ? 'Human' : 'AI'}
        </span>
      )}
      {status && (
        <span className="badge badge-outline badge-ghost text-xs">{status}</span>
      )}
    </div>
  )

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[80%] rounded-lg p-4 ${
        isAssistant ? 'bg-secondary' : 'bg-primary text-primary-foreground'
      }`}>
        {renderInterruptBanner()}
        {showHeader && (
          <div className="text-sm font-medium mb-1">
            {message.user.name}
          </div>
        )}
        {renderBadges()}
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.error && (
          <div className="mt-2 text-sm text-destructive">
            An error occurred while processing your message
          </div>
        )}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 text-sm opacity-80">
            <p className="font-medium">Sources:</p>
            <ul className="list-disc list-inside">
              {message.sources.map((source, index) => (
                <li key={index}>{source}</li>
              ))}
            </ul>
          </div>
        )}
        {/* FeedbackWidget below each message */}
        <div className="mt-2">
          <FeedbackWidget
            conversationId={message.metadata?.conversationId || ''}
            messageId={message.id}
            onFeedbackSubmitted={feedback => onFeedback && onFeedback(message.id, feedback)}
          />
        </div>
      </div>
    </div>
  )
}
