/**
 * Streaming Chat Interface Component
 * Modern 2025 real-time chat interface with streaming capabilities
 * Location: components/chat/StreamingChatInterface.tsx
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Square, 
  Loader2, 
  AlertCircle,
  FileText,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_ENDPOINTS } from '@/lib/config/constants';
import { IOSContainer } from '@/components/layout/IOSLayout';
import { StreamingMessage } from './StreamingMessage';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingResume, setIsProcessingResume] = useState(false);
  const [resumeProcessingStatus, setResumeProcessingStatus] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const supabase = createClient();

  // Get authenticated user
  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Auth error:', error);
          setError('Please log in to use the chat feature');
        } else {
          setUser(user);
        }
      } catch (err) {
        console.error('Failed to get user:', err);
        setError('Authentication failed. Please refresh and try again.');
      } finally {
        setAuthLoading(false);
      }
    };

    getUser();
  }, []);

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
  }, [sessionId, welcomeMessage]);

  // Define handleSendMessage function at component level
  const handleSendMessage = async (text: string = inputText) => {
    if ((!text.trim() && attachedFiles.length === 0) || isProcessing || isStreaming) return;

    // Check if user is authenticated
    if (!user) {
      setError('Please log in to send messages');
      return;
    }

    const messageText = text.trim();
    setInputText('');
    setError('');
    setIsProcessing(true);
    onStatusChange('processing');

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageText || `📎 ${attachedFiles.map(f => f.name).join(', ')}`,
      role: 'user',
      timestamp: new Date(),
      attachments: attachedFiles.length > 0 ? attachedFiles.map(file => ({
        name: file.name,
        type: file.type,
        size: formatFileSize(file.size)
      })) : undefined
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Prepare context
      const context = {
        session_id: sessionId,
        user: {
          id: user.id,
          email: user.email
        },
        attachments: attachedFiles.length > 0 ? attachedFiles.map(f => ({
          name: f.name,
          type: f.type
        })) : undefined
      };

      // Send request to API
      console.log('Sending request to API:', {
        query: messageText,
        session_id: sessionId,
        user_id: user.id, // Use actual user ID
        context,
        stream: true
      });

      const response = await fetch('/api/v1/interactive-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: messageText,
          session_id: sessionId,
          user_id: user.id, // Use actual user ID instead of null
          context,
          stream: false // Changed to false since backend returns JSON
        }),
        credentials: 'include', // Include cookies for authentication
        signal: abortControllerRef.current?.signal
      });

      console.log('API Response status:', response.status);
      console.log('API Response content-type:', response.headers.get('content-type'));

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please log in to continue chatting');
        }
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      // Check if response is streaming or JSON
      const contentType = response.headers.get('content-type');
      
      if (contentType?.includes('application/json')) {
        // Handle JSON response directly
        const data = await response.json();
        console.log('JSON response received:', data);
        
        // Check if response has the expected structure
        if (!data.content && !data.message) {
          console.warn('Response missing content/message field:', data);
        }
        
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          content: data.content || data.message || "I'm having trouble generating a response right now.",
          role: 'assistant',
          timestamp: new Date(),
          sources: data.sources || [],
          sessionId: sessionId || undefined
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      } else if (contentType?.includes('text/event-stream') && response.body) {
        // Handle streaming response
        setIsStreaming(true);
        onStatusChange('streaming');
        const reader = response.body.getReader();
        await handleStreamingResponse(reader);
      } else {
        throw new Error('Unexpected response format');
      }

      // Update session
      if (sessionId) {
        onSessionUpdate(sessionId, messageText.slice(0, 50) + '...', 'Updated chat');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: error instanceof Error ? error.message : 'Failed to send message',
        role: 'system',
        timestamp: new Date(),
        error: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
      setIsStreaming(false);
      onStatusChange('ready');
      setAttachedFiles([]);
    }
  };

  // Quick action handler
  useEffect(() => {
    const handleQuickAction = (event: CustomEvent) => {
      if (event.detail?.action === 'send_message' && event.detail?.message) {
        handleSendMessage(event.detail.message);
      }
    };

    window.addEventListener('quickActionSelected', handleQuickAction as EventListener);
    return () => {
      window.removeEventListener('quickActionSelected', handleQuickAction as EventListener);
    };
  }, [sessionId, onStatusChange, onSessionUpdate]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // Enhanced file handling with resume detection
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check if this is a resume file (PDF, DOC, DOCX)
    const resumeTypes = [
      'application/pdf',
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    const isResumeFile = resumeTypes.includes(file.type);
    
    if (isResumeFile) {
      // Handle as resume upload
      await handleResumeUpload(file);
    } else {
      // Handle as regular file attachment
      setAttachedFiles(prev => [...prev, file]);
      
      // Add system message about file attachment
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: `📎 File attached: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, systemMessage]);
    }
    
    // Reset file input
    event.target.value = '';
  };

  // Resume upload handler
  const handleResumeUpload = async (file: File) => {
    try {
      setIsProcessingResume(true);
      setResumeProcessingStatus('Uploading resume...');
      
      // Add processing message to chat
      const processingMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'system',
        content: '🔄 Processing your resume... This may take a moment.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, processingMessage]);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('originalName', file.name);

      // Upload to our API
      const uploadResponse = await fetch('/api/v1/resumes', {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload resume');
      }

      const uploadResult = await uploadResponse.json();
      console.log('Resume upload result:', uploadResult);

      setResumeProcessingStatus('Analyzing resume content...');
      
      // Get the resume ID from the correct structure
      // API returns either { data: { id: ... } } or { resume: { id: ... } }
      const resumeId = uploadResult.data?.id || uploadResult.resume?.id || uploadResult.id;
      
      if (resumeId) {
        // Process resume via API
        const processResponse = await fetch('/api/v1/process-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            resume_id: resumeId,
            file_name: file.name
          })
        });

        if (!processResponse.ok) {
          console.warn('Resume processing failed, but upload succeeded');
        }
      } else {
        console.warn('Could not find resume ID in response, skipping processing');
      }

      // Add success message with AI analysis
      const aiAnalysisMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `✅ Resume "${file.name}" uploaded and analyzed successfully!

🔍 **Analysis in progress...** Let me provide you with personalized climate career guidance based on your background.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev.slice(0, -1), aiAnalysisMessage]); // Replace processing message
      
      // Now get AI analysis of the uploaded resume
      try {
        const analysisResponse = await fetch('/api/v1/interactive-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `I just uploaded my resume "${file.name}". Please analyze my background and provide personalized climate career recommendations, including: 1) My skills and experience summary, 2) Climate career opportunities that match my profile, 3) Skills gap analysis for climate roles, 4) Specific next steps for my transition. Use the detailed analysis from my resume processing.`,
            context: {
              resume_uploaded: true,
              file_name: file.name,
              timestamp: new Date().toISOString(),
              request_type: 'resume_analysis'
            }
          })
        });

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json();
          
          if (analysisData.content) {
            // Update the message with the AI analysis
            const finalAnalysisMessage: ChatMessage = {
              id: aiAnalysisMessage.id,
              role: 'assistant',
              content: analysisData.content,
              timestamp: new Date(),
              sources: analysisData.sources || []
            };
            
            setMessages(prev => 
              prev.map(msg => 
                msg.id === aiAnalysisMessage.id ? finalAnalysisMessage : msg
              )
            );
          } else {
            // Fallback if no content in response
            setMessages(prev => 
              prev.map(msg => 
                msg.id === aiAnalysisMessage.id 
                  ? { 
                      ...msg, 
                      content: `✅ Resume "${file.name}" uploaded successfully! I can now provide personalized climate career guidance. Please ask me about specific aspects like "What climate roles match my background?" or "What skills should I develop for renewable energy careers?"`
                    }
                  : msg
              )
            );
          }
        } else {
          // Fallback message if AI analysis fails
          setMessages(prev => 
            prev.map(msg => 
              msg.id === aiAnalysisMessage.id 
                ? { 
                    ...msg, 
                    content: `✅ Resume "${file.name}" uploaded successfully! I can now provide personalized climate career guidance based on your background and experience.

**What I can help you with:**
- Climate career opportunities matching your skills
- Industry transition strategies  
- Skills gap analysis for climate roles
- Networking and professional development advice

Feel free to ask me anything about climate careers!`
                  }
                : msg
            )
          );
        }
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
        // Keep the initial success message if AI analysis fails
      }

    } catch (error) {
      console.error('Resume upload error:', error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'system',
        content: `❌ Failed to upload resume: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev.slice(0, -1), errorMessage]); // Replace processing message
    } finally {
      setIsProcessingResume(false);
      setResumeProcessingStatus('');
    }
  };

  // Remove attached file
  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Handle streaming response - Enhanced to handle different response formats
  const handleStreamingResponse = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
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
  };

  // Stop streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      onStatusChange('ready');
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Voice input (placeholder for future implementation)
  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Voice recognition implementation would go here
  };

  // Add feedback functionality to leverage the rich database structure
  const handleMessageFeedback = async (messageId: string, feedbackType: 'helpful' | 'not_helpful' | 'correction' | 'flag', rating?: number, comment?: string) => {
    try {
      const response = await fetch('/api/v1/conversations/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: sessionId,
          message_id: messageId,
          feedback_type: feedbackType,
          rating,
          comment
        })
      });

      if (response.ok) {
        console.log('Feedback submitted successfully');
        // Optionally show a toast notification
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // Track conversation analytics
  const trackConversationMetrics = async (metrics: any) => {
    try {
      await fetch('/api/v1/conversations/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: sessionId,
          metrics,
          user_id: null // Will be set by API if authenticated
        })
      });
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Authentication Loading */}
      {authLoading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-midnight-forest/60">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-ios-body">Loading chat...</span>
          </div>
        </div>
      )}

      {/* Not Authenticated */}
      {!authLoading && !user && (
        <div className="flex-1 flex items-center justify-center">
          <IOSContainer variant="glass" padding="xl" className="max-w-md text-center">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-spring-green/60" />
              <div>
                <h3 className="text-ios-title-3 text-midnight-forest mb-2">
                  Authentication Required
                </h3>
                <p className="text-ios-body text-midnight-forest/70 mb-4">
                  Please log in to use the Climate Economy Assistant chat feature.
                </p>
                <button
                  onClick={() => window.location.href = '/auth/login'}
                  className="bg-spring-green text-white px-6 py-2 rounded-ios-lg hover:bg-spring-green/90 transition-colors"
                >
                  Log In
                </button>
              </div>
            </div>
          </IOSContainer>
        </div>
      )}

      {/* Authenticated Chat Interface */}
      {!authLoading && user && (
        <>
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <IOSContainer variant="glass" padding="md" className="border border-ios-red/20">
                <div className="flex items-center gap-2 text-ios-red">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-ios-caption-1">{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="ml-auto text-ios-red/60 hover:text-ios-red"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </IOSContainer>
            </motion.div>
          )}

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            <AnimatePresence>
              {messages.map((message) => (
                <StreamingMessage
                  key={message.id}
                  message={message}
                  isStreaming={message.isStreaming || false}
                />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Container */}
          <IOSContainer variant="glass" padding="lg" className="mt-4">
            {/* Attached Files */}
            {attachedFiles.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-seafoam-blue/10 rounded-ios-lg px-3 py-2"
                  >
                    <FileText className="h-4 w-4 text-seafoam-blue" />
                    <span className="text-ios-caption-1 text-midnight-forest">
                      {file.name} ({formatFileSize(file.size)})
                    </span>
                    <button
                      onClick={() => removeAttachedFile(index)}
                      className="text-ios-red/60 hover:text-ios-red"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Row */}
            <div className="flex items-end gap-3">
              {/* File Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing || isStreaming}
                className="flex-shrink-0 p-2 text-midnight-forest/60 hover:text-midnight-forest hover:bg-midnight-forest/5 rounded-ios-lg transition-colors disabled:opacity-50"
                title="Upload resume (PDF, DOC, DOCX) or other files"
              >
                <Paperclip className="h-5 w-5" />
              </button>

              {/* Text Input */}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={attachedFiles.length > 0 
                    ? `Message with ${attachedFiles.length} file(s)...` 
                    : "Ask me anything about climate careers, or upload your resume for personalized advice..."
                  }
                  disabled={isProcessing || isStreaming}
                  className="w-full resize-none bg-white/50 border border-midnight-forest/10 rounded-ios-xl px-4 py-3 text-ios-body text-midnight-forest placeholder-midnight-forest/50 focus:outline-none focus:ring-2 focus:ring-spring-green/20 focus:border-spring-green/30 disabled:opacity-50 max-h-[120px]"
                  rows={1}
                />
              </div>

              {/* Voice Input Button */}
              <button
                onClick={handleVoiceInput}
                disabled={isProcessing || isStreaming}
                className={cn(
                  "flex-shrink-0 p-2 rounded-ios-lg transition-colors disabled:opacity-50",
                  isListening 
                    ? "text-ios-red bg-ios-red/10" 
                    : "text-midnight-forest/60 hover:text-midnight-forest hover:bg-midnight-forest/5"
                )}
                title={isListening ? "Stop voice input" : "Start voice input"}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>

              {/* Send/Stop Button */}
              {isStreaming ? (
                <button
                  onClick={handleStopStreaming}
                  className="flex-shrink-0 p-2 text-ios-red hover:bg-ios-red/10 rounded-ios-lg transition-colors"
                  title="Stop response"
                >
                  <Square className="h-5 w-5" />
                </button>
              ) : (
                <button
                  onClick={() => handleSendMessage()}
                  disabled={(!inputText.trim() && attachedFiles.length === 0) || isProcessing}
                  className="flex-shrink-0 p-2 bg-spring-green text-white hover:bg-spring-green/90 rounded-ios-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={isProcessing ? "Processing..." : "Send message"}
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </IOSContainer>
        </>
      )}
    </div>
  );
}; 