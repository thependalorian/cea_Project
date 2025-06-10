"use client";

/**
 * ACT Chat Window Component - Alliance for Climate Transition
 * Modern 2025 chat interface with iOS-inspired design
 * Location: components/ui/ACTChatWindow.tsx
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Image from 'next/image';

// Define message types
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  avatar?: string;
  attachments?: Attachment[];
}

interface Attachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  name: string;
  size?: number;
  previewUrl?: string;
}

interface ACTChatWindowProps {
  messages: Message[];
  onSendMessage: (message: string, attachments?: File[]) => void;
  isTyping?: boolean;
  variant?: 'default' | 'glass' | 'frosted' | 'minimal';
  userAvatar?: string;
  botAvatar?: string;
  title?: React.ReactNode;
  subtitle?: string;
  headerActions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  inputClassName?: string;
  dark?: boolean;
  compact?: boolean;
  showTimestamps?: boolean;
  showAvatars?: boolean;
  allowAttachments?: boolean;
  placeholder?: string;
}

export function ACTChatWindow({
  messages = [],
  onSendMessage,
  isTyping = false,
  variant = 'default',
  userAvatar,
  botAvatar,
  title = 'Chat',
  subtitle,
  headerActions,
  className,
  contentClassName,
  inputClassName,
  dark = false,
  compact = false,
  showTimestamps = true,
  showAvatars = true,
  allowAttachments = true,
  placeholder = 'Type a message...',
}: ACTChatWindowProps) {
  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle sending messages
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim() || attachments.length > 0) {
      onSendMessage(messageText, attachments.length > 0 ? attachments : undefined);
      setMessageText('');
      setAttachments([]);
    }
  };
  
  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...filesArray]);
    }
  };
  
  // Handle removing an attachment
  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Base styles
  const baseStyles = "flex flex-col h-full overflow-hidden rounded-ios-xl";
  
  // Variant styles with iOS-inspired design
  const variantStyles = {
    default: 'bg-white border border-sand-gray/20 shadow-ios-subtle',
    glass: 'bg-white/15 backdrop-blur-ios border border-white/25 shadow-ios-normal',
    frosted: 'bg-white/75 dark:bg-midnight-forest/75 backdrop-blur-ios border border-white/15 dark:border-white/10 shadow-ios-normal',
    minimal: 'bg-transparent border border-sand-gray/10',
  };
  
  // Text color based on dark mode
  const textColorClass = dark || variant === 'frosted' 
    ? 'text-white' 
    : 'text-midnight-forest';
  
  // Secondary text color
  const secondaryTextColorClass = dark || variant === 'frosted'
    ? 'text-white/70'
    : 'text-midnight-forest/70';
  
  // Combined chat window styles
  const chatWindowStyles = cn(
    baseStyles,
    variantStyles[variant],
    className
  );
  
  // Message animation variants
  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };
  
  // Typing indicator animation
  const typingVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 }
  };
  
  return (
    <div className={chatWindowStyles}>
      {/* Chat header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b",
        variant === 'glass' || variant === 'frosted' ? 'border-white/15' : 'border-sand-gray/15',
        compact ? 'py-2' : 'py-4'
      )}>
        <div className="flex items-center">
          {botAvatar && showAvatars && (
            <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
              <Image 
                src={botAvatar} 
                alt="Bot Avatar" 
                width={32} 
                height={32} 
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h3 className={cn(
              "font-sf-pro-rounded font-medium",
              textColorClass,
              compact ? 'text-sm' : 'text-base'
            )}>
              {title}
            </h3>
            {subtitle && (
              <p className={cn(
                "text-xs font-sf-pro",
                secondaryTextColorClass
              )}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Header actions (buttons, etc.) */}
        {headerActions && (
          <div className="flex items-center gap-2">
            {headerActions}
          </div>
        )}
      </div>
      
      {/* Messages container */}
      <div className={cn(
        "flex-1 overflow-y-auto p-4 space-y-4",
        contentClassName
      )}>
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              variants={messageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "flex",
                message.sender === 'user' ? 'justify-end' : 'justify-start',
                message.sender === 'system' ? 'justify-center' : ''
              )}
            >
              {/* Avatar for bot/system messages */}
              {message.sender !== 'user' && showAvatars && (
                <div className="flex-shrink-0 mr-2">
                  {message.avatar || botAvatar ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image 
                        src={message.avatar || botAvatar || ''} 
                        alt="Avatar" 
                        width={32} 
                        height={32} 
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-spring-green flex items-center justify-center text-midnight-forest font-sf-pro-rounded text-sm">
                      A
                    </div>
                  )}
                </div>
              )}
              
              {/* Message bubble */}
              <div className={cn(
                "max-w-[75%]",
                message.sender === 'system' ? 'max-w-full text-center' : ''
              )}>
                {/* System message */}
                {message.sender === 'system' && (
                  <div className={cn(
                    "inline-block py-1 px-3 rounded-ios-full text-xs",
                    "bg-sand-gray/30 dark:bg-midnight-forest/20",
                    secondaryTextColorClass
                  )}>
                    {message.content}
                  </div>
                )}
                
                {/* User message */}
                {message.sender === 'user' && (
                  <div className="flex flex-col items-end">
                    <div className={cn(
                      "p-3 rounded-ios-xl rounded-tr-sm",
                      "bg-spring-green text-midnight-forest"
                    )}>
                      {message.content}
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment, attachmentIndex) => (
                            <AttachmentPreview key={attachment.id || `attachment-${attachmentIndex}`} attachment={attachment} />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Timestamp and status */}
                    {showTimestamps && (
                      <div className="flex items-center mt-1 text-xs text-midnight-forest/50">
                        <span>{formatTime(message.timestamp)}</span>
                        {message.status && (
                          <MessageStatus status={message.status} />
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Bot message */}
                {message.sender === 'bot' && (
                  <div className="flex flex-col">
                    <div className={cn(
                      "p-3 rounded-ios-xl rounded-tl-sm",
                      dark || variant === 'frosted' 
                        ? "bg-white/20 backdrop-blur-ios-light text-white" 
                        : "bg-sand-gray/20 text-midnight-forest"
                    )}>
                      {message.content}
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment, attachmentIndex) => (
                            <AttachmentPreview key={attachment.id || `attachment-${attachmentIndex}`} attachment={attachment} />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Timestamp */}
                    {showTimestamps && (
                      <div className="mt-1 text-xs text-midnight-forest/50 dark:text-white/50">
                        {formatTime(message.timestamp)}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Avatar for user messages */}
              {message.sender === 'user' && showAvatars && (
                <div className="flex-shrink-0 ml-2">
                  {message.avatar || userAvatar ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image 
                        src={message.avatar || userAvatar || ''} 
                        alt="User Avatar" 
                        width={32} 
                        height={32} 
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-moss-green flex items-center justify-center text-white font-sf-pro-rounded text-sm">
                      U
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
          
          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                variants={typingVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex justify-start"
              >
                <div className={cn(
                  "p-3 rounded-ios-xl rounded-tl-sm inline-block",
                  dark || variant === 'frosted' 
                    ? "bg-white/20 backdrop-blur-ios-light" 
                    : "bg-sand-gray/20"
                )}>
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-spring-green rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="h-2 w-2 bg-spring-green rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="h-2 w-2 bg-spring-green rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* For auto-scrolling to bottom */}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </div>
      
      {/* Selected attachments preview */}
      {attachments.length > 0 && (
        <div className={cn(
          "p-3 border-t",
          variant === 'glass' || variant === 'frosted' ? 'border-white/15' : 'border-sand-gray/15'
        )}>
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div 
                key={index} 
                className={cn(
                  "relative group px-3 py-2 rounded-ios-lg text-xs flex items-center gap-2",
                  "bg-sand-gray/20 dark:bg-white/10",
                  textColorClass
                )}
              >
                <span className="truncate max-w-[100px]">{file.name}</span>
                <button 
                  onClick={() => handleRemoveAttachment(index)}
                  className="w-4 h-4 rounded-full bg-spring-green text-midnight-forest flex items-center justify-center opacity-70 hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Input area */}
      <form 
        onSubmit={handleSendMessage}
        className={cn(
          "p-3 border-t flex items-end gap-2",
          variant === 'glass' || variant === 'frosted' ? 'border-white/15' : 'border-sand-gray/15',
          inputClassName
        )}
      >
        {/* Attachment button */}
        {allowAttachments && (
          <>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "p-2 rounded-full flex-shrink-0",
                dark || variant === 'frosted'
                  ? "text-white/70 hover:text-white hover:bg-white/10"
                  : "text-midnight-forest/70 hover:text-midnight-forest hover:bg-spring-green/20",
                "transition-colors"
              )}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
            />
          </>
        )}
        
        {/* Text input */}
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "flex-1 resize-none rounded-ios-xl p-3 max-h-32",
            "bg-sand-gray/20 dark:bg-white/10 backdrop-blur-ios-light",
            "border border-sand-gray/20 dark:border-white/10",
            "focus:outline-none focus:ring-1 focus:ring-spring-green",
            textColorClass,
            "font-sf-pro text-sm",
            "transition-all duration-200"
          )}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
        />
        
        {/* Send button */}
        <button
          type="submit"
          disabled={!messageText.trim() && attachments.length === 0}
          className={cn(
            "p-3 rounded-full flex-shrink-0",
            "bg-spring-green text-midnight-forest",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-all duration-200 hover:shadow-ios-subtle"
          )}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
}

// Helper component for attachment previews
function AttachmentPreview({ attachment }: { attachment: Attachment }) {
  // Show different previews based on attachment type
  switch(attachment.type) {
    case 'image':
      return (
        <div className="relative rounded-ios-lg overflow-hidden">
          <Image 
            src={attachment.previewUrl || attachment.url} 
            alt={attachment.name}
            width={200}
            height={150}
            className="object-cover max-h-40 w-auto"
          />
        </div>
      );
    default:
      return (
        <a 
          href={attachment.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block p-2 rounded-ios-lg bg-white/10 text-xs flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span className="truncate">{attachment.name}</span>
          {attachment.size && (
            <span className="text-white/50">
              {(attachment.size / 1024).toFixed(0)} KB
            </span>
          )}
        </a>
      );
  }
}

// Helper component for message status indicators
function MessageStatus({ status }: { status: string }) {
  let icon;
  let statusColor = 'text-midnight-forest/50';
  
  switch(status) {
    case 'sending':
      icon = <span className="ml-1">•</span>;
      break;
    case 'sent':
      icon = (
        <svg className="ml-1 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      );
      break;
    case 'delivered':
      icon = (
        <svg className="ml-1 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      );
      statusColor = 'text-spring-green/70';
      break;
    case 'read':
      icon = (
        <svg className="ml-1 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
      );
      statusColor = 'text-ios-blue';
      break;
    case 'error':
      icon = (
        <svg className="ml-1 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      );
      statusColor = 'text-ios-red';
      break;
    default:
      icon = null;
  }
  
  return <span className={statusColor}>{icon}</span>;
} 