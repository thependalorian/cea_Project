/**
 * Modern Chat Interface Component - 2025 Design Standards
 * Purpose: Advanced chat interface with streaming, file upload, and modern UX patterns
 * Location: /components/chat/ModernChatInterface.tsx
 */

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSupabaseAuth } from '@/providers/AuthProvider'

interface ModernChatInterfaceProps {
  conversationId?: string
  agentId: string
  onNewConversation?: (conversationId: string) => void
  className?: string
}

interface Message {
  id?: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
  isStreaming?: boolean
  files?: UploadedFile[]
  metadata?: {
    agentName?: string
    responseTime?: number
    suggestions?: string[]
  }
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadProgress?: number
}

export function ModernChatInterface({ 
  conversationId, 
  agentId, 
  onNewConversation,
  className = ''
}: ModernChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState(conversationId)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const { user } = useSupabaseAuth()

  // Auto-scroll to bottom with smooth animation
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Load existing conversation or initialize
  useEffect(() => {
    if (currentConversationId) {
      loadMessages()
    } else {
      initializeChat()
    }
  }, [currentConversationId, agentId])

  const getAgentName = (id: string): string => {
    const agentNames: Record<string, string> = {
      'marcus': 'Marcus',
      'lauren': 'Lauren', 
      'alex': 'Alex',
      'maya': 'Maya',
      'jasmine': 'Jasmine',
      'pendo': 'Pendo'
    }
    return agentNames[id] || 'Assistant'
  }

  const initializeChat = () => {
    setMessages([{
      role: 'assistant',
      content: `Hello! I'm ${getAgentName(agentId)}, your climate career assistant. I can help you with job searches, career transitions, training programs, and more. Feel free to upload your resume or ask me any questions about climate careers in Massachusetts.`,
      timestamp: new Date().toISOString(),
      metadata: {
        agentName: getAgentName(agentId),
        suggestions: [
          "Upload my resume for analysis",
          "Find climate jobs near me",
          "What training programs are available?",
          "Help me transition to clean energy"
        ]
      }
    }])
  }

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
          timestamp: msg.created_at,
          files: msg.files || [],
          metadata: msg.metadata || {}
        })))
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  // Handle drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(Array.from(e.dataTransfer.files))
    }
  }, [])

  // Production file upload with real resume processing
  const handleFileUpload = async (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadProgress: 0
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Process each file with real API calls
    for (const file of files) {
      const uploadFile = newFiles.find(f => f.name === file.name)
      if (!uploadFile) continue

      try {
        const formData = new FormData()
        formData.append('file', file)

        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, uploadProgress: 10 }
              : f
          )
        )

        // Real resume upload API call
        const response = await fetch('/api/resumes/upload', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Upload failed: ${response.status}`)
        }

        const result = await response.json()

        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { 
                  ...f, 
                  uploadProgress: 100,
                  url: `/api/resumes/${result.file_id}`,
                  metadata: {
                    chunks_processed: result.chunks_processed,
                    preview: result.preview
                  }
                }
              : f
          )
        )

        // Add system message about successful upload
        const systemMessage: Message = {
          role: 'assistant',
          content: `Resume "${file.name}" uploaded and processed successfully. I analyzed ${result.chunks_processed} sections of your resume and can now provide personalized career guidance.`,
          timestamp: new Date().toISOString(),
          metadata: {
            agentName: getAgentName(agentId),
            suggestions: [
              "Analyze my resume for climate jobs",
              "What skills should I develop?",
              "Find jobs matching my background",
              "Review my experience for climate careers"
            ]
          }
        }
        setMessages(prev => [...prev, systemMessage])

      } catch (error) {
        console.error('File upload error:', error)
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, uploadProgress: -1 }
              : f
          )
        )

        const errorMessage: Message = {
          role: 'assistant',
          content: `Failed to process "${file.name}": ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString(),
          metadata: { agentName: getAgentName(agentId) }
        }
        setMessages(prev => [...prev, errorMessage])
      }
    }
  }

  // Enhanced streaming message handler
  const sendMessage = async () => {
    if (!input.trim() && uploadedFiles.length === 0) return
    if (isLoading || !user) return

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
      files: uploadedFiles.filter(f => f.uploadProgress === 100)
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setIsStreaming(true)

    // Create streaming message placeholder
    const streamingMessageId = Date.now().toString()
    const streamingMessage: Message = {
      id: streamingMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
      metadata: {
        agentName: getAgentName(agentId),
        responseTime: 0
      }
    }
    setMessages(prev => [...prev, streamingMessage])

    // Create abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      // Call streaming API
      const response = await fetch(`/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationId: currentConversationId,
          files: userMessage.files || [],
          stream: true
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const textDecoder = new TextDecoder()
      let accumulatedContent = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = textDecoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6) // Remove 'data: '
                if (jsonStr.trim() === '') continue

                const data = JSON.parse(jsonStr)

                if (data.type === 'content') {
                  accumulatedContent = data.data.accumulated || accumulatedContent + data.data.content
                  
                  // Update streaming message
                  setMessages(prev => prev.map(msg => 
                    msg.id === streamingMessageId ? {
                      ...msg,
                      content: accumulatedContent,
                      isStreaming: true
                    } : msg
                  ))
                } else if (data.type === 'complete') {
                  // Finalize message
                  setMessages(prev => prev.map(msg => 
                    msg.id === streamingMessageId ? {
                      ...msg,
                      content: data.data.totalContent || accumulatedContent,
                      isStreaming: false,
                      metadata: {
                        ...msg.metadata,
                        responseTime: data.data.processingTime,
                        suggestions: [
                          "Tell me more about this",
                          "What are the next steps?",
                          "Find similar opportunities"
                        ]
                      }
                    } : msg
                  ))

                  // Update conversation ID if provided
                  if (data.data.conversationId && data.data.conversationId !== currentConversationId) {
                    setCurrentConversationId(data.data.conversationId)
                    onNewConversation?.(data.data.conversationId)
                  }
                } else if (data.type === 'error') {
                  throw new Error(data.data.error || 'Streaming error')
                }
              } catch (parseError) {
                console.warn('Failed to parse streaming chunk:', parseError)
              }
            }
          }
        }
      }

      setUploadedFiles([])

    } catch (error: any) {
      if (error.name === 'AbortError') return
      
      console.error('Error sending message:', error)
      
      // Update streaming message with error
      setMessages(prev => prev.map(msg => 
        msg.id === streamingMessageId ? {
          ...msg,
          content: 'I apologize, but I encountered a connection error. Please try again in a moment.',
          isStreaming: false,
          metadata: { 
            agentName: getAgentName(agentId),
            suggestions: ["Try again", "Refresh the page"]
          }
        } : msg
      ))
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      abortControllerRef.current = null
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setIsStreaming(false)
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-sand-gray">
        <div className="text-center">
          <div className="w-16 h-16 bg-sand-gray-10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-moss-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="act-body text-moss-green">Please sign in to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`flex flex-col h-full bg-white overflow-hidden transition-all duration-300 ${
        dragActive ? 'bg-seafoam-blue-10' : ''
      } ${className}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {dragActive && (
        <div className="absolute inset-0 bg-seafoam-blue bg-opacity-90 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-dashed border-spring-green rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-spring-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-midnight-forest mb-2">Drop files here</p>
            <p className="text-moss-green">Upload resumes, documents, or images</p>
          </div>
        </div>
      )}

      {/* Messages Area - Maximum Space */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl transition-all duration-300 ${
                message.role === 'user'
                  ? 'bg-spring-green text-midnight-forest ml-4'
                  : 'bg-sand-gray-10 text-midnight-forest mr-4'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-spring-green rounded-full flex items-center justify-center text-xs font-bold text-midnight-forest">
                    {getAgentName(agentId).charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-moss-green">
                    {message.metadata?.agentName || getAgentName(agentId)}
                  </span>
                </div>
              )}
              
              <p className="whitespace-pre-wrap leading-relaxed">
                {message.content}
                {message.isStreaming && (
                  <span className="inline-block w-2 h-5 bg-spring-green ml-1 animate-pulse"></span>
                )}
              </p>
              
              {message.files && message.files.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.files.map(file => (
                    <div key={file.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-sand-gray">
                      <svg className="w-4 h-4 text-moss-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm text-midnight-forest">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.metadata.suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1 bg-white border border-sand-gray rounded-full text-sm text-moss-green hover:bg-sand-gray-10 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* File Upload Preview */}
      {uploadedFiles.length > 0 && (
        <div className="px-4 py-2 border-t border-sand-gray bg-sand-gray-10">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map(file => (
              <div key={file.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-sand-gray">
                <svg className="w-4 h-4 text-moss-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm text-midnight-forest">{file.name}</span>
                {file.uploadProgress !== undefined && file.uploadProgress < 100 && (
                  <div className="w-16 bg-sand-gray rounded-full h-1">
                    <div 
                      className="bg-spring-green h-1 rounded-full transition-all duration-300"
                      style={{ width: `${file.uploadProgress}%` }}
                    />
                  </div>
                )}
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-moss-green hover:text-red-500 transition-colors"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-sand-gray p-4 bg-white">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or drag files here..."
              className="w-full p-3 border border-sand-gray rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-spring-green focus:border-transparent"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={isLoading}
            />
          </div>
          
          <label className="cursor-pointer p-3 bg-sand-gray-10 hover:bg-sand-gray text-moss-green rounded-xl transition-colors">
            <input
              type="file"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(Array.from(e.target.files))}
            />
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </label>
          
          <button
            onClick={sendMessage}
            disabled={(!input.trim() && uploadedFiles.length === 0) || isLoading}
            className="px-6 py-3 bg-spring-green text-midnight-forest font-semibold rounded-xl hover:bg-moss-green hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-midnight-forest border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 