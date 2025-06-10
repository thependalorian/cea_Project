"use client";

/**
 * AI Visualizer Stub - Alliance for Climate Transition
 * Simple stub component for AI data visualization
 * Location: components/chat/AIVisualizer.tsx
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface AIVisualizerProps {
  data?: any;
  type?: 'chart' | 'graph' | 'visualization';
  variant?: 'cea-pulse' | 'cea-wave' | 'cea-minimal' | string;
  size?: 'sm' | 'md' | 'lg' | string;
  isActive?: boolean;
  isProcessing?: boolean;
  color?: string;
  className?: string;
}

export function AIVisualizer({ 
  data, 
  type = 'visualization', 
  variant = 'cea-minimal',
  size = 'md',
  isActive = false,
  isProcessing = false,
  color = 'spring-green',
  className 
}: AIVisualizerProps) {
  return (
    <motion.div
      className={`p-6 bg-gradient-to-br from-spring-green/10 to-moss-green/10 rounded-lg border border-spring-green/20 ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-5 h-5 text-spring-green" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          AI {type.charAt(0).toUpperCase() + type.slice(1)}
        </h3>
      </div>
      <div className="text-center text-gray-600 dark:text-gray-300">
        <p>AI visualization component - ready for implementation</p>
        {data && (
          <div className="mt-4 p-3 bg-white/50 rounded-md">
            <code className="text-xs">Data: {JSON.stringify(data).slice(0, 100)}...</code>
          </div>
        )}
      </div>
    </motion.div>
  );
} 