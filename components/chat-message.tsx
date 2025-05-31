"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils'
import { ChatMessage } from '@/types/chat'
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage
  isOwnMessage: boolean
  showHeader: boolean
}

export const ChatMessageItem = ({ message, isOwnMessage, showHeader }: ChatMessageItemProps) => {
  const [showSources, setShowSources] = useState(false);
  const hasSources = message.sources && message.sources.length > 0;

  return (
    <div className={`flex mt-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={cn('max-w-[75%] w-fit flex flex-col gap-1', {
          'items-end': isOwnMessage,
        })}
      >
        {showHeader && (
          <div
            className={cn('flex items-center gap-2 text-xs px-3', {
              'justify-end flex-row-reverse': isOwnMessage,
            })}
          >
            <span className={'font-medium'}>{message.user.name}</span>
            <span className="text-foreground/50 text-xs">
              {new Date(message.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </span>
          </div>
        )}
        <div
          className={cn(
            'py-2 px-3 rounded-xl text-sm w-fit',
            isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
          )}
        >
          {message.content}
          
          {/* Sources toggle button */}
          {!isOwnMessage && hasSources && (
            <div className="mt-2 pt-2 border-t border-primary-foreground/10 flex justify-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSources(!showSources)}
                className="text-xs text-primary-foreground/70 hover:text-primary-foreground py-0 h-auto"
              >
                {showSources ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    Hide resume sources
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    Show resume sources ({message.sources?.length})
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
        
        {/* Sources display */}
        {!isOwnMessage && hasSources && showSources && (
          <div className="mt-1 text-xs bg-muted/50 rounded-lg p-2 border border-muted-foreground/10">
            <div className="font-medium mb-1 flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              Resume Sources
            </div>
            <div className="space-y-2">
              {message.sources?.map((source, index) => (
                <div key={index} className="p-2 bg-background/50 rounded border border-muted-foreground/20">
                  <div className="text-muted-foreground mb-1">
                    Source {index + 1} 
                    {source.metadata.page !== undefined && ` | Page ${source.metadata.page + 1}`}
                    {source.metadata.similarity !== undefined && ` | Relevance: ${(source.metadata.similarity * 100).toFixed(0)}%`}
                  </div>
                  <div className="text-foreground">{source.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
