"use client";

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { apiClient } from '@/lib/api-client'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  MessageCircle, 
  BadgeAlert, 
  Brain, 
  Users, 
  Workflow,
  CheckCircle,
  Clock,
  AlertCircle,
  Bot
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

interface SupervisorChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: string
  specialist?: string
  tools_used?: string[]
  next_actions?: string[]
  workflow_state?: string
  quality_metrics?: {
    overall_quality: number
    intelligence_level: string
  }
  metadata?: Record<string, unknown>
}

interface SupervisorChatWindowProps {
  onToggleMode?: () => void
}

export function SupervisorChatWindow({ onToggleMode }: SupervisorChatWindowProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<SupervisorChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string>()
  const [workflowStatus, setWorkflowStatus] = useState<{
    state: string
    specialist: string
    intelligence_level: string
    handoff_count: number
  }>({
    state: 'ready',
    specialist: 'Pendo Supervisor',
    intelligence_level: 'developing',
    handoff_count: 0
  })
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || !user || isLoading) return

    const userMessage: SupervisorChatMessage = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.supervisorChat({
        message: input.trim(),
        conversation_id: conversationId,
        context: {
          enhanced_intelligence: true,
          robust_framework: true
        },
        metadata: {
          frontend_source: 'supervisor_chat_window',
          user_id: user.id
        }
      }) as any

      // Update conversation ID if not set
      if (!conversationId && response.conversation_id) {
        setConversationId(response.conversation_id)
      }

      // Update workflow status
      setWorkflowStatus({
        state: response.workflow_state || 'completed',
        specialist: response.specialist || 'Pendo Supervisor',
        intelligence_level: response.intelligence_level || 'developing',
        handoff_count: response.metadata?.specialist_handoffs?.length || 0
      })

      const assistantMessage: SupervisorChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.content,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        specialist: response.specialist,
        tools_used: response.tools_used,
        next_actions: response.next_actions,
        workflow_state: response.workflow_state,
        quality_metrics: response.quality_metrics,
        metadata: response.metadata
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      console.error('Supervisor chat error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
      
      const errorMessage: SupervisorChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${err instanceof Error ? err.message : 'An error occurred. Please try again.'}`,
        role: 'assistant',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const getWorkflowIcon = () => {
    switch (workflowStatus.state) {
      case 'active': return <Clock className="w-4 h-4 text-yellow-500 animate-pulse" />
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending_human': return <AlertCircle className="w-4 h-4 text-orange-500" />
      default: return <Brain className="w-4 h-4 text-blue-500" />
    }
  }

  const getIntelligenceColor = (level: string) => {
    switch (level) {
      case 'exceptional': return 'text-purple-600 bg-purple-100'
      case 'advanced': return 'text-blue-600 bg-blue-100'
      case 'proficient': return 'text-green-600 bg-green-100'
      case 'developing': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spring-green mx-auto mb-4"></div>
          <h3 className="text-act-body text-midnight-forest mb-2">Initializing Supervisor...</h3>
          <p className="text-act-small text-midnight-forest/70">
            Please wait while we connect you to your climate career supervisor.
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container-ios h-full flex items-center justify-center">
        <div className="text-center spacing-ios-lg">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-ios-xl mx-auto mb-4 flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-act-body text-midnight-forest mb-2">Sign In Required</h3>
          <p className="text-act-small text-midnight-forest/70">
            Please sign in to access your climate career supervisor.
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
      {/* Enhanced Header with Workflow Status */}
      <div className="p-4 border-b border-white/20 bg-gradient-to-r from-purple-500/10 to-blue-600/10 backdrop-blur-ios">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-ios-full flex items-center justify-center shadow-ios-subtle">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-ios-headline text-midnight-forest flex items-center gap-2">
                AI Supervisor
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  getIntelligenceColor(workflowStatus.intelligence_level)
                )}>
                  {workflowStatus.intelligence_level}
                </span>
              </h3>
              <div className="flex items-center gap-2">
                {getWorkflowIcon()}
                <span className="text-ios-caption-1 text-midnight-forest/70">
                  {workflowStatus.specialist} • {workflowStatus.state}
                </span>
              </div>
            </div>
          </div>
          
          {onToggleMode && (
            <button
              onClick={onToggleMode}
              className="btn btn-sm btn-ghost text-midnight-forest/70 hover:text-midnight-forest"
            >
              <Bot className="w-4 h-4 mr-2" />
              Switch to Basic
            </button>
          )}
        </div>

        {/* Workflow Status Bar */}
        <div className="mt-3 p-2 bg-white/10 rounded-ios-lg">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>Handoffs: {workflowStatus.handoff_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Workflow className="w-3 h-3" />
                <span>State: {workflowStatus.state}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-purple-500/5">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center spacing-ios-lg max-w-sm">
              <div className="animate-ios-fade-in">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500/30 to-blue-600/20 rounded-ios-2xl mx-auto mb-6 flex items-center justify-center">
                  <Brain className="w-10 h-10 text-purple-600" />
                </div>
                <h4 className="text-ios-title-3 text-midnight-forest mb-3">
                  Enhanced AI Supervisor
                </h4>
                <p className="text-ios-subheadline text-midnight-forest/70">
                  Ask me anything about climate careers! I use advanced multi-agent workflows with intelligent routing and enhanced reasoning.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    "max-w-[80%] p-4 rounded-ios-2xl shadow-ios-subtle",
                    message.role === 'user' 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white ml-12' 
                      : 'bg-white/80 backdrop-blur-ios text-midnight-forest mr-12'
                  )}>
                    <div className="prose prose-sm max-w-none">
                      {message.content}
                    </div>
                    
                    {message.role === 'assistant' && (
                      <div className="mt-3 pt-3 border-t border-gray-200/50">
                        {message.specialist && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                            <Users className="w-3 h-3" />
                            Specialist: {message.specialist}
                          </div>
                        )}
                        
                        {message.quality_metrics && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                            <Brain className="w-3 h-3" />
                            Quality: {message.quality_metrics.overall_quality?.toFixed(1)}/10
                          </div>
                        )}
                        
                        {message.tools_used && message.tools_used.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Tools: {message.tools_used.slice(0, 3).join(', ')}
                            {message.tools_used.length > 3 && ` +${message.tools_used.length - 3} more`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-100 border border-red-200 rounded-ios-lg">
          <div className="flex items-center gap-2 text-red-800 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/20 bg-white/10 backdrop-blur-ios">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about climate careers with enhanced AI..."
            className="flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-ios-full placeholder-midnight-forest/60 text-midnight-forest focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={cn(
              "p-3 rounded-ios-full transition-all duration-200",
              isLoading || !input.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:shadow-lg transform hover:scale-105 active:scale-95"
            )}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
} 