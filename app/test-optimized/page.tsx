/**
 * 🚀 Optimized Framework Test Page
 * Test page for the high-performance LangGraph Functional API framework
 */

import { Metadata } from 'next';
import OptimizedChatInterface from '@/components/chat/OptimizedChatInterface';

export const metadata: Metadata = {
  title: 'Optimized Framework Test | Climate Economy Assistant',
  description: 'Test the high-performance optimized framework with sub-second responses',
};

export default function TestOptimizedPage() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            🚀 Optimized Framework Testing
          </h1>
          <p className="text-lg text-base-content/70 max-w-2xl mx-auto">
            Test the high-performance LangGraph Functional API framework designed for 
            sub-second responses with advanced caching and streaming capabilities.
          </p>
          
          <div className="flex justify-center gap-4 mt-6">
            <div className="badge badge-success badge-lg">⚡ Sub-second responses</div>
            <div className="badge badge-info badge-lg">🎯 Smart caching</div>
            <div className="badge badge-primary badge-lg">📊 Real-time metrics</div>
          </div>
        </div>
        
        <OptimizedChatInterface />
        
        <div className="mt-8 text-center">
          <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
            <div className="card-body">
              <h3 className="card-title justify-center mb-4">🎯 Performance Targets</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-success">&lt;50ms</div>
                  <div className="text-sm opacity-70">Routing Time</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-info">&lt;1000ms</div>
                  <div className="text-sm opacity-70">Total Response</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-warning">&gt;80%</div>
                  <div className="text-sm opacity-70">Cache Hit Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}