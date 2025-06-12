/**
 * AI Assistant Interface Component
 * Modern 2025 chat interface for the Climate Economy Assistant (CEA)
 * Follows ACT brand guidelines with an iOS-inspired holographic design
 * Location: components/chat/AIAssistantInterface.tsx
 */

"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIAssistantChatBubble } from './AIAssistantChatBubble';
import { ACTButton } from '@/components/ui/ACTButton';
import { cn } from '@/lib/utils';
import { Paperclip, X, Send, Mic, MinusCircle, MaximizeIcon } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/config/constants';
import Image from 'next/image';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  sources?: { title: string; url?: string }[];
  actionItems?: { text: string; action: () => void }[];
  contextAwareness?: string;
  isError?: boolean;
  attachments?: { name: string; type: string; url?: string; size?: string }[];
}

interface AIAssistantInterfaceProps {
  initialMessages?: Message[];
  assistantName?: string;
  assistantAvatar?: string | null;
  userAvatar?: string;
  className?: string;
  onSendMessage?: (message: string, attachments?: File[]) => Promise<unknown>;
  suggestions?: string[];
  welcomeMessage?: string;
  placeholderText?: string;
  isMobileView?: boolean;
  theme?: 'light' | 'dark' | 'glass';
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const AIAssistantInterface = ({
  initialMessages = [],
  assistantName = "Climate Economy Assistant",
  assistantAvatar = null,
  userAvatar,
  className,
  onSendMessage,
  suggestions = [
    "Tell me about climate careers",
    "What skills do I need for renewable energy?",
    "Show me green job opportunities",
    "How can I transition to a climate role?"
  ],
  welcomeMessage = "Hello! I'm your Climate Economy Assistant. How can I help with your climate career journey today?",
  placeholderText = "Ask me anything about climate careers...",
  isMobileView = false,
  theme = 'glass',
  isMinimized = false,
  onToggleMinimize
}: AIAssistantInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle sending a message
  const handleSendMessage = useCallback(async (text: string = inputText) => {
    if ((!text.trim() && attachedFiles.length === 0) || isProcessing) return;
    
    // Create attachment data for display
    const attachmentData = attachedFiles.map(file => ({
      name: file.name,
      type: file.type,
      size: formatFileSize(file.size)
    }));
    
    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: text,
      sender: 'user',
      timestamp: new Date(),
      attachments: attachmentData.length > 0 ? attachmentData : undefined
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);
    setShowSuggestions(false);
    
    try {
      let response: any;
      
      if (onSendMessage) {
        // Use custom handler if provided
        response = await onSendMessage(text, attachedFiles);
      } else {
        // Use v1 API endpoint instead of mock response
        const apiResponse = await fetch(API_ENDPOINTS.V1_INTERACTIVE_CHAT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: text,
            context: {
              has_attachments: attachedFiles.length > 0,
              attachment_types: attachedFiles.map(f => f.type),
              ui_context: 'assistant_interface',
              timestamp: new Date().toISOString()
            }
          })
        });
        
        if (!apiResponse.ok) {
          throw new Error(`API Error: ${apiResponse.status} ${apiResponse.statusText}`);
        }
        
        const apiData = await apiResponse.json();
        
        response = {
          text: apiData.content || "I understand your question. Let me help you with that.",
          sources: apiData.sources || [],
          actionItems: [], // Can be enhanced based on API response
          contextAwareness: `Session: ${apiData.session_id}`,
          sessionId: apiData.session_id,
          workflowState: apiData.workflow_state
        };
        
        // Add file-specific responses
        if (attachedFiles.length > 0) {
          const fileNames = attachedFiles.map(f => f.name).join(", ");
          const originalText = response.text || "Let me analyze these files for you.";
          response = {
            ...response,
            text: `I've received your files (${fileNames}). ${originalText}`
          };
        }
      }
      
      // Create assistant response message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        text: response.text || "I understand your question. Let me help you with that.",
        sender: 'assistant',
        timestamp: new Date(),
        sources: response.sources,
        actionItems: response.actionItems,
        contextAwareness: response.contextAwareness
      };
      
      // Add assistant message to chat
      setMessages(prev => [...prev, assistantMessage]);
      
      // Clear attached files after successful send
      setAttachedFiles([]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: `Sorry, I encountered an error processing your message. Please try again. ${error instanceof Error ? error.message : 'Unknown error'}`,
        sender: 'assistant',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [inputText, attachedFiles, isProcessing, onSendMessage]);
  
  // Initialize with welcome message and suggestions
  useEffect(() => {
    if (initialMessages.length === 0 && welcomeMessage) {
      setMessages([
        {
          id: 'welcome',
          text: welcomeMessage,
          sender: 'assistant',
          timestamp: new Date(),
          actionItems: suggestions.map(suggestion => ({
            text: suggestion,
            action: () => handleSendMessage(suggestion)
          }))
        }
      ]);
    }
  }, [initialMessages.length, welcomeMessage, suggestions, handleSendMessage]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [inputText]);
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  // Handle file removal
  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Handle voice input
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser.');
      return;
    }
    
    setIsListening(!isListening);
    
    if (!isListening) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    }
  };
  
  // Handle key press (submit on Enter, unless Shift is pressed)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Theme-based styles
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          container: "bg-midnight-forest text-white",
          header: "bg-midnight-forest/90 border-moss-green/30",
          chatWindow: "bg-midnight-forest/50",
          inputArea: "bg-midnight-forest/70 border-moss-green/30"
        };
      case 'glass':
        return {
          container: "bg-white/10 backdrop-blur-ios text-midnight-forest border border-white/25",
          header: "bg-white/20 backdrop-blur-ios border-white/20",
          chatWindow: "bg-transparent",
          inputArea: "bg-white/20 backdrop-blur-ios border-white/20"
        };
      case 'light':
      default:
        return {
          container: "bg-white text-midnight-forest border border-sand-gray/20",
          header: "bg-white border-sand-gray/20",
          chatWindow: "bg-sand-gray/5",
          inputArea: "bg-white border-sand-gray/20"
        };
    }
  };
  
  const themeStyles = getThemeStyles();
  
  // Minimized version (floating bubble)
  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <button
          onClick={onToggleMinimize}
          className="w-14 h-14 rounded-ios-full bg-spring-green text-midnight-forest shadow-ios-normal flex items-center justify-center hover:scale-105 transition-transform"
        >
          <span className="text-2xl">💬</span>
        </button>
      </motion.div>
    );
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex flex-col rounded-ios-xl shadow-ios-normal overflow-hidden",
        themeStyles.container,
        isMobileView ? "w-full h-full" : "w-full max-w-2xl h-[600px]",
        className
      )}
    >
      {/* Header */}
      <div className={cn("p-4 border-b flex items-center justify-between", themeStyles.header)}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-ios-full overflow-hidden bg-seafoam-blue border-2 border-spring-green flex items-center justify-center">
            {assistantAvatar ? (
              <Image 
                src={assistantAvatar} 
                alt={assistantName} 
                width={32}
                height={32}
                className="object-cover"
              />
            ) : (
              <span className="text-sm">🤖</span>
            )}
          </div>
          <div>
            <h3 className="font-sf-pro-rounded font-medium text-sm">{assistantName}</h3>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-ios-green rounded-full animate-pulse"></span>
              <span className="text-xs opacity-70">Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-1">
          {onToggleMinimize && (
            <button 
              onClick={onToggleMinimize}
              className="w-8 h-8 rounded-ios-full flex items-center justify-center hover:bg-midnight-forest/10 transition-colors"
            >
              <svg width="14" height="2" viewBox="0 0 14 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="14" height="2" rx="1" fill="currentColor" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Chat Messages Window */}
      <div className={cn(
        "flex-1 overflow-y-auto p-4 space-y-3",
        themeStyles.chatWindow
      )}>
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AIAssistantChatBubble
                message={message.text}
                isTyping={message.sender === 'assistant' && isProcessing}
                isProcessing={message.sender === 'assistant' && isProcessing}
                timestamp={message.timestamp}
                sources={message.sources}
                avatar={message.sender === 'assistant' ? assistantAvatar || undefined : userAvatar}
                isSender={message.sender === 'user'}
                actionItems={message.actionItems}
                contextAwareness={message.contextAwareness}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Processing indicator */}
        {isProcessing && messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 ml-10"
          >
            <div className="flex items-center">
              <span className="w-2 h-2 bg-spring-green rounded-full animate-pulse"></span>
              <span className="w-2 h-2 bg-spring-green rounded-full animate-pulse delay-150 mx-1"></span>
              <span className="w-2 h-2 bg-spring-green rounded-full animate-pulse delay-300"></span>
            </div>
            <span className="text-xs opacity-70">Processing</span>
          </motion.div>
        )}
        
        {/* Anchor for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Attached Files Preview */}
      {attachedFiles.length > 0 && (
        <div className="px-4 py-2 border-t border-sand-gray/10">
          <div className="text-xs font-medium mb-2">Attached Files:</div>
          <div className="space-y-2">
            {attachedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-sand-gray/10 p-2 rounded-lg">
                <div className="flex items-center space-x-2 truncate">
                  <Paperclip className="w-3 h-3 opacity-70" />
                  <span className="text-xs truncate">{file.name}</span>
                  <span className="text-xs opacity-50">{formatFileSize(file.size)}</span>
                </div>
                <button 
                  onClick={() => handleRemoveFile(index)}
                  className="p-1 hover:bg-sand-gray/20 rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && messages.length === 1 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 border-t border-sand-gray/10"
          >
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(suggestion)}
                  className="text-xs px-3 py-1.5 rounded-ios-full bg-spring-green/20 text-midnight-forest hover:bg-spring-green/30 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Input Area */}
      <div className={cn("p-3 border-t", themeStyles.inputArea)}>
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholderText}
              className={cn(
                "w-full rounded-xl p-3 pr-10 bg-transparent border border-sand-gray/20 placeholder:text-midnight-forest/50",
                theme === 'dark' && "bg-midnight-forest/50 border-moss-green/30"
              )}
              rows={1}
              disabled={isProcessing}
            />
            
            {/* Document upload button */}
            <button
              onClick={triggerFileInput}
              className="absolute right-3 bottom-3 p-1.5 hover:bg-sand-gray/30 rounded-full transition-colors"
              disabled={isProcessing}
            >
              <Paperclip className="w-4 h-4 opacity-70" />
            </button>
            
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.txt,.xlsx,.csv"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleVoiceInput()}
              className={cn(
                "p-2 rounded-full transition-colors",
                isListening ? "bg-spring-green text-midnight-forest" : "bg-sand-gray/10 hover:bg-sand-gray/20"
              )}
              disabled={isProcessing}
            >
              <Mic className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => handleSendMessage()}
              className={cn(
                "p-2 rounded-full transition-colors",
                inputText.trim() || attachedFiles.length > 0
                  ? "bg-spring-green text-midnight-forest"
                  : "bg-sand-gray/10 text-white/50"
              )}
              disabled={(!inputText.trim() && attachedFiles.length === 0) || isProcessing}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 