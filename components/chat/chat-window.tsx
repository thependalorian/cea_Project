"use client";

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, BadgeAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChat } from '@/hooks/use-chat'
import { ChatMessage } from './chat-message'
import { useAuth } from '@/contexts/auth-context'
import type { ChatMessage as ChatMessageType } from '@/types/chat'

interface ChatWindowProps {
  type?: string
  resumeData?: Record<string, unknown>
  useEnhancedSearch?: boolean
}

interface ChatContext {
  type?: string
  resume?: Record<string, unknown>
  enhanced_search?: boolean
}

export function ChatWindow({ type, resumeData, useEnhancedSearch }: ChatWindowProps) {
  const { user, loading } = useAuth()
  const { messages, isLoading, error, sendMessage, sendFeedback, createInterrupt } = useChat()
  const [input, setInput] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [showInterruptBanner, setShowInterruptBanner] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !user) return

    const context: ChatContext = {
      type,
      resume: resumeData,
      enhanced_search: useEnhancedSearch
    }

    await sendMessage(input, context)
    setInput('')
  }

  // Feedback handler
  const handleFeedback = async (messageId: string, feedback: { feedback_type: string; details?: string }) => {
    if (!user) return
    await sendFeedback({
      messageId,
      userId: user.id,
      feedbackType: feedback.feedback_type === 'positive' ? 'thumbs_up' : 'thumbs_down',
      ...(feedback.details ? { correction: feedback.details } : {})
    })
    setToast({ message: 'Feedback submitted. Thank you!', type: 'success' })
    setTimeout(() => setToast(null), 3000)
  }

  // Interrupt action handler
  const handleInterruptAction = async (interruptId: string, action: 'resolve' | 'reject') => {
    await createInterrupt({
      id: interruptId,
      conversationId: messages[0]?.metadata?.conversationId || '',
      type: action === 'resolve' ? 'resolved' : 'rejected',
      status: action === 'resolve' ? 'resolved' : 'rejected',
    })
    setToast({ message: action === 'resolve' ? 'Interrupt resolved.' : 'Interrupt rejected.', type: 'info' })
    setTimeout(() => setToast(null), 3000)
  }

  // Find the most recent pending interrupt in the conversation
  const pendingInterrupt = messages
    .map(m => m.interrupt)
    .filter(i => i && i.status === 'pending')
    .pop();

  if (loading) {
    return (
      <div className="container-ios h-full flex items-center justify-center">
        <div className="text-center spacing-ios-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-spring-green to-moss-green rounded-ios-xl mx-auto mb-4 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h3 className="text-ios-headline text-midnight-forest mb-2">Loading...</h3>
          <p className="text-ios-subheadline text-midnight-forest/70">
            Connecting to your account
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container-ios h-full flex items-center justify-center">
        <div className="text-center spacing-ios-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-spring-green to-moss-green rounded-ios-xl mx-auto mb-4 flex items-center justify-center">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-ios-headline text-midnight-forest mb-2">Sign In Required</h3>
          <p className="text-ios-subheadline text-midnight-forest/70">
            Please sign in to use the chat feature
          </p>
          <div className="mt-4">
            <a 
              href="/auth/login" 
              className="btn-ios-primary inline-flex items-center px-6 py-3 rounded-ios-full"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col h-full card-ios-glass overflow-hidden"
    >
      {/* Global Interrupt Banner */}
      {pendingInterrupt && showInterruptBanner && (
        <div className="alert alert-warning flex items-center gap-2 z-10 rounded-none border-0 shadow-lg animate-fadeIn">
          <BadgeAlert className="text-warning" />
          <span className="text-warning font-medium text-sm">
            Conversation paused for human review: <b>{pendingInterrupt.type}</b> ({pendingInterrupt.status})
          </span>
          <button
            className="btn btn-xs btn-circle btn-ghost ml-auto"
            onClick={() => setShowInterruptBanner(false)}
            aria-label="Close"
          >✕</button>
        </div>
      )}
      {/* Toast Notification */}
      {toast && (
        <div className={cn(
          'toast toast-end z-50 fixed bottom-4 right-4',
          toast.type === 'success' && 'bg-success text-white',
          toast.type === 'error' && 'bg-error text-white',
          toast.type === 'info' && 'bg-info text-white'
        )}>
          <div className="rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
            {toast.message}
          </div>
        </div>
      )}
      {/* Header */}
      <div className="p-4 border-b border-white/20 bg-white/10 backdrop-blur-ios">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-spring-green to-moss-green rounded-ios-full flex items-center justify-center shadow-ios-subtle">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-ios-headline text-midnight-forest">AI Assistant</h3>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-ios-green rounded-full animate-pulse"></div>
              <span className="text-ios-caption-1 text-midnight-forest/70">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-white/5">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center spacing-ios-lg max-w-sm">
              <div className="animate-ios-fade-in">
                <div className="w-20 h-20 bg-gradient-to-br from-seafoam-blue/30 to-spring-green/20 rounded-ios-2xl mx-auto mb-6 flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-spring-green" />
                </div>
                <h4 className="text-ios-title-3 text-midnight-forest mb-3">
                  Welcome to AI Assistant
                </h4>
                <p className="text-ios-subheadline text-midnight-forest/70">
                  Start a conversation by typing a message below. I'm here to help with climate career guidance and job searches.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <motion.div layout className="space-y-4">
            {messages.map((message: ChatMessageType, index: number) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ChatMessage 
                  message={message}
                  showHeader={true}
                  onFeedback={handleFeedback}
                  onInterruptAction={handleInterruptAction}
                />
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-4 bg-white/10 rounded-ios-xl backdrop-blur-ios"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-spring-green to-moss-green rounded-ios-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-spring-green rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-spring-green rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-spring-green rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-ios-caption-1 text-midnight-forest/70 ml-2">AI is thinking...</span>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/20 bg-white/10 backdrop-blur-ios">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-ios-xl text-midnight-forest placeholder-midnight-forest/50 focus:outline-none focus:ring-2 focus:ring-spring-green focus:border-transparent backdrop-blur-ios"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-gradient-to-r from-spring-green to-moss-green text-white rounded-ios-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-ios-subtle transition-all duration-200"
          >
            Send
          </button>
        </form>
        {error && (
          <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-ios-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
} 