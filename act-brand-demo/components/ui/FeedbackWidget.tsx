"use client";

/**
 * Feedback Widget Component - Alliance for Climate Transition
 * Modern feedback collection widget with iOS-inspired design
 * Location: act-brand-demo/components/ui/FeedbackWidget.tsx
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const [feedbackState, setFeedbackState] = useState<'positive' | 'negative' | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedbackState(type);
    
    if (type === 'positive') {
      // For positive feedback, submit immediately
      submitFeedback(type);
    } else {
      // For negative feedback, show details form
      setShowDetails(true);
    }
  };

  const submitFeedback = async (type?: string) => {
    const feedbackType = type || feedbackState;
    if (!feedbackType) return;
    
    setIsSubmitting(true);
    
    try {
      const feedback = {
        feedback_type: feedbackType,
        details: details.trim() || undefined
      };
      
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted(feedback);
      }
      
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFeedbackState(null);
        setShowDetails(false);
        setDetails('');
      }, 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelFeedback = () => {
    setFeedbackState(null);
    setShowDetails(false);
    setDetails('');
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn("flex items-center gap-2 text-sm text-ios-green", className)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span className="font-sf-pro">Thank you for your feedback!</span>
      </motion.div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Feedback buttons */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-midnight-forest/60 font-sf-pro">Was this helpful?</span>
        <div className="flex gap-1">
          <button
            onClick={() => handleFeedback('positive')}
            disabled={isSubmitting}
            className={cn(
              "p-1.5 rounded-full transition-all duration-200",
              "hover:bg-ios-green/10 hover:shadow-ios-subtle",
              feedbackState === 'positive' 
                ? "bg-ios-green/20 text-ios-green" 
                : "text-midnight-forest/60 hover:text-ios-green",
              isSubmitting && "opacity-50 cursor-not-allowed"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
            </svg>
          </button>
          <button
            onClick={() => handleFeedback('negative')}
            disabled={isSubmitting}
            className={cn(
              "p-1.5 rounded-full transition-all duration-200",
              "hover:bg-ios-red/10 hover:shadow-ios-subtle",
              feedbackState === 'negative' 
                ? "bg-ios-red/20 text-ios-red" 
                : "text-midnight-forest/60 hover:text-ios-red",
              isSubmitting && "opacity-50 cursor-not-allowed"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Details form for negative feedback */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs text-midnight-forest/70 font-sf-pro mb-1">
                How can we improve? (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Tell us what went wrong or how we can improve..."
                className={cn(
                  "w-full p-2 text-sm rounded-ios-lg resize-none",
                  "bg-sand-gray/20 border border-sand-gray/30",
                  "focus:outline-none focus:ring-1 focus:ring-spring-green",
                  "font-sf-pro text-midnight-forest placeholder:text-midnight-forest/50"
                )}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => submitFeedback()}
                disabled={isSubmitting}
                className={cn(
                  "px-3 py-1.5 text-xs font-sf-pro font-medium rounded-ios-full",
                  "bg-spring-green text-midnight-forest",
                  "hover:shadow-ios-subtle transition-all duration-200",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
              <button
                onClick={cancelFeedback}
                disabled={isSubmitting}
                className={cn(
                  "px-3 py-1.5 text-xs font-sf-pro font-medium rounded-ios-full",
                  "bg-sand-gray/20 text-midnight-forest/70",
                  "hover:bg-sand-gray/30 transition-all duration-200",
                  isSubmitting && "opacity-50 cursor-not-allowed"
                )}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 