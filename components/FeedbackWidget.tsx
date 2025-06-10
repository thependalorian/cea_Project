/**
 * FeedbackWidget Component - Alliance for Climate Transition
 * Collects user feedback on AI responses with iOS-inspired design
 * Location: components/FeedbackWidget.tsx
 */

'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThumbsUp, ThumbsDown, Send, X } from 'lucide-react';

interface FeedbackWidgetProps {
  conversationId: string;
  messageId: string;
  onFeedbackSubmitted?: (feedback: { feedback_type: string; details?: string }) => void;
  className?: string;
}

export default function FeedbackWidget({
  conversationId,
  messageId,
  onFeedbackSubmitted,
  className
}: FeedbackWidgetProps) {
  const [feedbackState, setFeedbackState] = useState<'none' | 'positive' | 'negative'>('none');
  const [detailedFeedback, setDetailedFeedback] = useState('');
  const [showDetailInput, setShowDetailInput] = useState(false);
  
  const handleFeedback = (type: 'positive' | 'negative') => {
    if (feedbackState === type) {
      // Toggle off if already selected
      setFeedbackState('none');
      setShowDetailInput(false);
    } else {
      setFeedbackState(type);
      
      // For negative feedback, automatically show detail input
      if (type === 'negative') {
        setShowDetailInput(true);
      } else {
        // For positive feedback, just submit right away
        submitFeedback(type);
      }
    }
  };
  
  const submitFeedback = (type: string = feedbackState) => {
    if (onFeedbackSubmitted && type !== 'none') {
      const feedback = {
        feedback_type: type,
        ...(detailedFeedback ? { details: detailedFeedback } : {})
      };
      
      onFeedbackSubmitted(feedback);
      
      // Reset state
      setFeedbackState('none');
      setDetailedFeedback('');
      setShowDetailInput(false);
    }
  };
  
  const cancelFeedback = () => {
    setFeedbackState('none');
    setDetailedFeedback('');
    setShowDetailInput(false);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Main feedback buttons */}
      {!showDetailInput && (
        <>
          <button
            onClick={() => handleFeedback('positive')}
            className={cn(
              'p-1.5 rounded-full transition-all',
              feedbackState === 'positive' 
                ? 'bg-ios-green/20 text-ios-green'
                : 'text-midnight-forest/50 hover:bg-ios-green/10 hover:text-ios-green'
            )}
            aria-label="Positive feedback"
          >
            <ThumbsUp size={16} />
          </button>
          
          <button
            onClick={() => handleFeedback('negative')}
            className={cn(
              'p-1.5 rounded-full transition-all',
              feedbackState === 'negative'
                ? 'bg-ios-red/20 text-ios-red'
                : 'text-midnight-forest/50 hover:bg-ios-red/10 hover:text-ios-red'
            )}
            aria-label="Negative feedback"
          >
            <ThumbsDown size={16} />
          </button>
          
          {feedbackState === 'negative' && (
            <span className="text-xs text-midnight-forest/60 font-sf-pro animate-fadeIn">
              What could be improved?
            </span>
          )}
        </>
      )}
      
      {/* Detailed feedback input */}
      {showDetailInput && (
        <div className="flex-1 flex items-center gap-2 animate-fadeIn">
          <input
            type="text"
            value={detailedFeedback}
            onChange={(e) => setDetailedFeedback(e.target.value)}
            placeholder="What could be improved? (optional)"
            className="flex-1 text-sm px-3 py-1.5 rounded-ios-full bg-sand-gray/10 border border-sand-gray/30 focus:outline-none focus:ring-1 focus:ring-spring-green transition-all font-sf-pro text-midnight-forest"
            autoFocus
          />
          
          <button
            onClick={() => submitFeedback()}
            className="p-1.5 rounded-full bg-spring-green text-midnight-forest hover:bg-spring-green/90 transition-all"
            aria-label="Submit feedback"
          >
            <Send size={14} />
          </button>
          
          <button
            onClick={cancelFeedback}
            className="p-1.5 rounded-full text-midnight-forest/50 hover:bg-sand-gray/20 transition-all"
            aria-label="Cancel"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
} 