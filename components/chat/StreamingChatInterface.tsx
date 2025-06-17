/**
 * Streaming Chat Interface Component
 * Advanced streaming chat interface with file uploads and real-time messaging
 * Location: components/chat/StreamingChatInterface.tsx
 */

"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  X, 
  FileText, 
  Image as ImageIcon, 
  Download,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Copy,
  Share2,
  MoreHorizontal,
  Loader2,
  StopCircle,
  Sparkles,
  Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isStreaming?: boolean;
  sources?: Array<{ title: string; url?: string; type?: string }>;
  attachments?: Array<{ name: string; type: string; size: string }>;
  sessionId?: string;
  error?: boolean;
}

interface AttachedFile {
  file: File;
  name: string;
  type: string;
  size: string;
}

interface StreamingChatInterfaceProps {
  sessionId: string | null;
  onStatusChange: (status: 'ready' | 'processing' | 'streaming') => void;
  onSessionUpdate: (sessionId: string, title: string, preview: string) => void;
  welcomeMessage?: string;
  className?: string;
}

export const StreamingChatInterface = ({
  sessionId,
  onStatusChange,
  onSessionUpdate,
  welcomeMessage = "Hello! I'm your Climate Economy Assistant. How can I help you today?",
  className
}: StreamingChatInterfaceProps) => {
  const { user } = useAuth(); // Use secure auth context instead of direct Supabase
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize welcome message
  useEffect(() => {
    if (sessionId && messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: `welcome-${sessionId}`,
        content: welcomeMessage,
        role: 'assistant',
        timestamp: new Date(),
        sessionId
      };
      setMessages([welcomeMsg]);
    }
  }, [sessionId, welcomeMessage, messages.length]);

  // Handle streaming response
  const handleStreamingResponse = useCallback(async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    const decoder = new TextDecoder();
    let buffer = '';
    let hasReceivedContent = false;
    const currentMessageId = `assistant-${Date.now()}`;
    
    // Add initial streaming message
    const streamingMessage: ChatMessage = {
      id: currentMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isStreaming: true,
      sessionId: sessionId || undefined
    };
    
    setMessages(prev => [...prev, streamingMessage]);

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Try to parse as complete JSON first (non-streaming response)
        try {
          const completeResponse = JSON.parse(buffer);
          if (completeResponse.content && completeResponse.role === 'assistant') {
            hasReceivedContent = true;
            setMessages(prev => 
              prev.map(msg => 
                msg.id === currentMessageId 
                  ? { 
                      ...msg, 
                      content: completeResponse.content,
                      isStreaming: false,
                      sources: completeResponse.sources || []
                    }
                  : msg
              )
            );
            return; // Complete response received
          }
        } catch {
          // Not a complete JSON, continue with streaming logic
        }

        // Handle streaming format
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              // Handle different line formats
              let data;
              if (line.startsWith('data: ')) {
                const jsonStr = line.replace('data: ', '');
                if (jsonStr === '[DONE]') {
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === currentMessageId 
                        ? { ...msg, isStreaming: false }
                        : msg
                    )
                  );
                  return;
                }
                data = JSON.parse(jsonStr);
              } else if (line.startsWith('{')) {
                data = JSON.parse(line);
              } else {
                // Handle plain text streaming
                hasReceivedContent = true;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === currentMessageId 
                      ? { ...msg, content: msg.content + line + ' ' }
                      : msg
                  )
                );
                continue;
              }
              
              // Handle structured data responses
              if (data.type === 'chunk' && data.content) {
                hasReceivedContent = true;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === currentMessageId 
                      ? { ...msg, content: msg.content + data.content }
                      : msg
                  )
                );
              } else if (data.type === 'complete') {
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === currentMessageId 
                      ? { ...msg, isStreaming: false }
                      : msg
                  )
                );
                return;
              } else if (data.content && typeof data.content === 'string') {
                hasReceivedContent = true;
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === currentMessageId 
                      ? { 
                          ...msg, 
                          content: data.content, 
                          isStreaming: false,
                          sources: data.sources || []
                        }
                      : msg
                  )
                );
                return;
              }
            } catch (parseError) {
              console.warn('Failed to parse streaming line:', line, parseError);
            }
          }
        }
      }

      // If we reach here and haven't received content, show fallback
      if (!hasReceivedContent) {
        const fallbackContent = "I apologize, but I'm having trouble generating a response right now. This might be due to:\n\n" +
          "• Backend configuration issues\n" +
          "• Missing API keys for the AI service\n" +
          "• Temporary service interruption\n\n" +
          "Please try asking your question again, or contact support if the issue persists.";
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === currentMessageId 
              ? { ...msg, content: fallbackContent, isStreaming: false, error: true }
              : msg
          )
        );
      }

    } catch (error) {
      console.error('Streaming error:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === currentMessageId 
            ? { 
                ...msg, 
                content: 'Sorry, there was an error processing your request. Please try again.', 
                isStreaming: false, 
                error: true 
              }
            : msg
        )
      );
    }
  }, [sessionId]);

  // Send message function
  const sendMessage = async () => {
    if (!input.trim() && attachedFiles.length === 0) return;
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
      attachments: attachedFiles.map(f => ({ name: f.name, type: f.type, size: f.size })),
      sessionId: sessionId || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]);
    setIsLoading(true);
    onStatusChange('processing');

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const formData = new FormData();
      formData.append('message', input.trim());
      formData.append('sessionId', sessionId || '');
      formData.append('userId', user.id);
      
      // Add files to form data
      attachedFiles.forEach((attachedFile, index) => {
        formData.append(`file_${index}`, attachedFile.file);
      });

      const response = await fetch('/api/v1/chat/streaming', {
        method: 'POST',
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      onStatusChange('streaming');
      const reader = response.body.getReader();
      await handleStreamingResponse(reader);

      // Update session if needed
      if (sessionId && userMessage.content) {
        const preview = userMessage.content.substring(0, 100) + (userMessage.content.length > 100 ? '...' : '');
        onSessionUpdate(sessionId, preview, preview);
      }

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }
      
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: 'Sorry, there was an error sending your message. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
        error: true,
        sessionId: sessionId || undefined
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      onStatusChange('ready');
      abortControllerRef.current = null;
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle quick actions from other components
  useEffect(() => {
    const handleQuickAction = (event: CustomEvent) => {
      const { action, data } = event.detail;
      
      switch (action) {
        case 'send_message':
          setInput(data.message || '');
          if (data.autoSend) {
            setTimeout(() => sendMessage(), 100);
          }
          break;
        case 'attach_resume':
          if (data.file) {
            const attachedFile: AttachedFile = {
              file: data.file,
              name: data.file.name,
              type: data.file.type,
              size: formatFileSize(data.file.size)
            };
            setAttachedFiles(prev => [...prev, attachedFile]);
          }
          break;
      }
    };

    window.addEventListener('quickAction', handleQuickAction as EventListener);
    return () => window.removeEventListener('quickAction', handleQuickAction as EventListener);
  }, []);

  // File handling
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }

      // Handle resume files specially
      if (file.type === 'application/pdf' || file.name.toLowerCase().includes('resume') || file.name.toLowerCase().includes('cv')) {
        await handleResumeUpload(file);
      } else {
        const attachedFile: AttachedFile = {
          file,
          name: file.name,
          type: file.type,
          size: formatFileSize(file.size)
        };
        setAttachedFiles(prev => [...prev, attachedFile]);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResumeUpload = async (file: File) => {
    if (!user) return;

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/v1/resume/secure-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload resume');
      }

      const result = await response.json();
      
      // Add success message
      const successMessage: ChatMessage = {
        id: `resume-success-${Date.now()}`,
        content: `✅ Resume "${file.name}" uploaded successfully! I can now provide personalized career advice based on your background.`,
        role: 'assistant',
        timestamp: new Date(),
        sessionId: sessionId || undefined
      };
      setMessages(prev => [...prev, successMessage]);

      // Trigger resume analysis
      setInput("Please analyze my resume and provide career recommendations.");
      setTimeout(() => sendMessage(), 1000);

    } catch (error) {
      console.error('Resume upload error:', error);
      const errorMessage: ChatMessage = {
        id: `resume-error-${Date.now()}`,
        content: `❌ Failed to upload resume "${file.name}". Please try again or contact support.`,
        role: 'assistant',
        timestamp: new Date(),
        error: true,
        sessionId: sessionId || undefined
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      onStatusChange('ready');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice input implementation would go here
  };

  const handleMessageFeedback = async (messageId: string, feedbackType: 'helpful' | 'not_helpful' | 'correction' | 'flag', rating?: number, comment?: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/v1/chat/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId,
          userId: user.id,
          feedbackType,
          rating,
          comment,
          sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      // Show success feedback
      console.log('Feedback submitted successfully');
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const trackConversationMetrics = async (metrics: any) => {
    if (!user || !sessionId) return;

    try {
      await fetch('/api/v1/analytics/conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId: user.id,
          metrics,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Error tracking metrics:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8">
          <Brain className="w-16 h-16 mx-auto mb-4 text-spring-green" />
          <h3 className="text-xl font-semibold text-midnight-forest mb-2">Sign In Required</h3>
          <p className="text-midnight-forest/70 mb-4">
            Please sign in to start chatting with your Climate Economy Assistant.
          </p>
          <a 
            href="/auth/login" 
            className="inline-flex items-center px-6 py-3 bg-spring-green text-white rounded-lg hover:bg-spring-green/90 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full bg-gradient-to-br from-white to-seafoam-blue/10", className)}>
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                "flex gap-3 max-w-4xl",
                message.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.role === 'user' 
                  ? "bg-spring-green text-white" 
                  : "bg-gradient-to-br from-seafoam-blue to-spring-green text-white"
              )}>
                {message.role === 'user' ? (
                  <span className="text-xs font-semibold">U</span>
                ) : (
                  <Brain className="w-4 h-4" />
                )}
              </div>

              {/* Message Content */}
              <div className={cn(
                "flex-1 p-4 rounded-2xl shadow-sm",
                message.role === 'user'
                  ? "bg-spring-green text-white"
                  : message.error
                  ? "bg-red-50 border border-red-200"
                  : "bg-white border border-gray-200"
              )}>
                {/* Message Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-xs font-medium",
                    message.role === 'user' ? "text-white/80" : "text-gray-500"
                  )}>
                    {message.role === 'user' ? 'You' : 'Climate Assistant'}
                    {message.isStreaming && (
                      <span className="ml-2 inline-flex items-center">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span className="ml-1">Thinking...</span>
                      </span>
                    )}
                  </span>
                  <span className={cn(
                    "text-xs",
                    message.role === 'user' ? "text-white/60" : "text-gray-400"
                  )}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message Text */}
                <div className={cn(
                  "prose prose-sm max-w-none",
                  message.role === 'user' ? "prose-invert" : "",
                  message.error ? "text-red-700" : ""
                )}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.attachments.map((attachment, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{attachment.name}</span>
                        <span className="text-xs text-gray-500">({attachment.size})</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-500 mb-2">Sources:</p>
                    <div className="space-y-1">
                      {message.sources.map((source, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-spring-green" />
                          <a 
                            href={source.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-spring-green hover:underline"
                          >
                            {source.title}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Actions */}
                {message.role === 'assistant' && !message.isStreaming && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2">
                    <button
                      onClick={() => handleMessageFeedback(message.id, 'helpful')}
                      className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                      title="Helpful"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMessageFeedback(message.id, 'not_helpful')}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Not helpful"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(message.content)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-500">({file.size})</span>
                <button
                  onClick={() => removeAttachedFile(index)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Form */}
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about climate careers, upload your resume, or get personalized advice..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-spring-green focus:border-transparent"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={isLoading}
            />
            
            {/* File Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-spring-green transition-colors"
              disabled={isLoading}
            >
              <Paperclip className="w-5 h-5" />
            </button>
          </div>

          {/* Voice Input Button */}
          <button
            onClick={handleVoiceInput}
            className={cn(
              "p-3 rounded-xl transition-colors",
              isListening 
                ? "bg-red-500 text-white" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            disabled={isLoading}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send/Stop Button */}
          {isLoading ? (
            <button
              onClick={handleStopStreaming}
              className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <StopCircle className="w-5 h-5" />
              Stop
            </button>
          ) : (
            <button
              onClick={sendMessage}
              disabled={!input.trim() && attachedFiles.length === 0}
              className="p-3 bg-spring-green text-white rounded-xl hover:bg-spring-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}; 