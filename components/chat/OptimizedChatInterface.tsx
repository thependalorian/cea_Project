/**
 * 🚀 Optimized Chat Interface
 * React component for testing the high-performance optimized framework
 * 
 * Features:
 * - Real-time performance monitoring
 * - Side-by-side comparison with original framework
 * - Streaming response with metrics
 * - Cache hit rate tracking
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface OptimizedResponse {
  content: string;
  agent: string;
  team: string;
  confidence: number;
  processing_time_ms: number;
  total_api_time_ms?: number;
  metadata: {
    routing_time_ms: number;
    cache_hit: boolean;
    optimized_framework: boolean;
    model_provider: string;
  };
  performance_metrics: {
    under_threshold: boolean;
    routing_fast: boolean;
    cache_effectiveness: boolean;
  };
  success: boolean;
  timestamp: string;
}

interface StreamChunk {
  type: string;
  data: any;
  timestamp: string;
  framework: string;
}

interface PerformanceStats {
  total_requests: number;
  avg_response_time: number;
  cache_hit_rate: number;
  under_threshold_rate: number;
  fastest_response: number;
  slowest_response: number;
}

export default function OptimizedChatInterface() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<OptimizedResponse[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [currentAgent, setCurrentAgent] = useState('');
  const [currentTeam, setCurrentTeam] = useState('');
  const [routingInfo, setRoutingInfo] = useState<any>(null);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats>({
    total_requests: 0,
    avg_response_time: 0,
    cache_hit_rate: 0,
    under_threshold_rate: 0,
    fastest_response: Infinity,
    slowest_response: 0
  });
  const [optimizationStatus, setOptimizationStatus] = useState<any>(null);
  const [useStreaming, setUseStreaming] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch optimization status on load
  useEffect(() => {
    fetchOptimizationStatus();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [responses, streamingContent]);

  const fetchOptimizationStatus = async () => {
    try {
      const response = await fetch('/api/agents/optimized', {
        method: 'GET',
      });
      
      if (response.ok) {
        const status = await response.json();
        setOptimizationStatus(status);
      }
    } catch (error) {
      console.warn('Failed to fetch optimization status:', error);
    }
  };

  const updatePerformanceStats = (response: OptimizedResponse) => {
    setPerformanceStats(prev => {
      const newTotal = prev.total_requests + 1;
      const responseTime = response.total_api_time_ms || response.processing_time_ms;
      const newAvgTime = (prev.avg_response_time * prev.total_requests + responseTime) / newTotal;
      const cacheHits = responses.filter(r => r.metadata.cache_hit).length + (response.metadata.cache_hit ? 1 : 0);
      const underThreshold = responses.filter(r => r.performance_metrics.under_threshold).length + (response.performance_metrics.under_threshold ? 1 : 0);
      
      return {
        total_requests: newTotal,
        avg_response_time: newAvgTime,
        cache_hit_rate: (cacheHits / newTotal) * 100,
        under_threshold_rate: (underThreshold / newTotal) * 100,
        fastest_response: Math.min(prev.fastest_response, responseTime),
        slowest_response: Math.max(prev.slowest_response, responseTime)
      };
    });
  };

  const sendOptimizedMessage = async () => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    setStreamingContent('');
    setCurrentAgent('');
    setCurrentTeam('');
    setRoutingInfo(null);
    
    const userMessage = message;
    setMessage('');

    try {
      if (useStreaming) {
        await handleStreamingResponse(userMessage);
      } else {
        await handleStandardResponse(userMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStandardResponse = async (userMessage: string) => {
    const response = await fetch('/api/agents/optimized', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        conversation_id: `test_${Date.now()}`,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: OptimizedResponse = await response.json();
    setResponses(prev => [...prev, result]);
    updatePerformanceStats(result);
    
    toast.success(`Response from ${result.agent} (${result.processing_time_ms.toFixed(1)}ms)`, {
      icon: result.performance_metrics.under_threshold ? '⚡' : '⚠️'
    });
  };

  const handleStreamingResponse = async (userMessage: string) => {
    const response = await fetch('/api/agents/optimized', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        conversation_id: `test_stream_${Date.now()}`,
        stream: true
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.trim().startsWith('data: ')) {
              try {
                const jsonStr = line.slice(6);
                const data: StreamChunk = JSON.parse(jsonStr);
                
                handleStreamChunk(data);
              } catch (parseError) {
                console.warn('Failed to parse chunk:', parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
  };

  const handleStreamChunk = (chunk: StreamChunk) => {
    switch (chunk.type) {
      case 'framework_start':
        setStreamingContent('🚀 Starting optimized processing...');
        break;
        
      case 'routing_complete':
        setCurrentAgent(chunk.data.agent);
        setCurrentTeam(chunk.data.team);
        setRoutingInfo(chunk.data);
        setStreamingContent(prev => prev + `\n\n🎯 Routed to ${chunk.data.agent} (${chunk.data.team}) - ${chunk.data.routing_time_ms.toFixed(1)}ms`);
        break;
        
      case 'start':
        setStreamingContent(prev => prev + `\n\n💬 ${chunk.data.agent} is responding...`);
        break;
        
      case 'content':
        setStreamingContent(prev => prev + chunk.data.chunk);
        break;
        
      case 'complete':
        const finalResponse: OptimizedResponse = {
          content: chunk.data.total_content,
          agent: chunk.data.agent,
          team: chunk.data.team,
          confidence: routingInfo?.confidence || 0.8,
          processing_time_ms: chunk.data.processing_time_ms,
          metadata: {
            routing_time_ms: routingInfo?.routing_time_ms || 0,
            cache_hit: routingInfo?.cache_hit || false,
            optimized_framework: true,
            model_provider: 'deepseek'
          },
          performance_metrics: {
            under_threshold: chunk.data.processing_time_ms < 1000,
            routing_fast: (routingInfo?.routing_time_ms || 0) < 50,
            cache_effectiveness: routingInfo?.cache_hit || false
          },
          success: true,
          timestamp: chunk.data.timestamp
        };
        
        setResponses(prev => [...prev, finalResponse]);
        updatePerformanceStats(finalResponse);
        setStreamingContent('');
        
        toast.success(`✅ Streaming complete: ${finalResponse.agent} (${finalResponse.processing_time_ms.toFixed(1)}ms)`, {
          icon: finalResponse.performance_metrics.under_threshold ? '⚡' : '⚠️'
        });
        break;
        
      case 'error':
        setStreamingContent(prev => prev + `\n\n❌ Error: ${chunk.data.error}`);
        toast.error('Stream error occurred');
        break;
    }
  };

  const testMessages = [
    "I'm a veteran looking for clean energy jobs",
    "What solar programs are available in disadvantaged communities?",
    "Tell me about international climate policies",
    "I need help with renewable energy career guidance",
    "What training programs exist for environmental justice work?"
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chat Interface */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">
                🚀 Optimized Framework Testing
                <div className="badge badge-success">v1.0</div>
              </h2>
              
              {/* Performance Dashboard */}
              <div className="stats stats-vertical lg:stats-horizontal shadow mb-6">
                <div className="stat">
                  <div className="stat-title">Avg Response Time</div>
                  <div className="stat-value text-sm">
                    {performanceStats.avg_response_time.toFixed(1)}ms
                  </div>
                  <div className="stat-desc">
                    {performanceStats.under_threshold_rate.toFixed(1)}% under 1s
                  </div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Cache Hit Rate</div>
                  <div className="stat-value text-sm">
                    {performanceStats.cache_hit_rate.toFixed(1)}%
                  </div>
                  <div className="stat-desc">
                    {performanceStats.total_requests} total requests
                  </div>
                </div>
                
                <div className="stat">
                  <div className="stat-title">Best/Worst</div>
                  <div className="stat-value text-sm">
                    {performanceStats.fastest_response === Infinity ? '-' : performanceStats.fastest_response.toFixed(1)}ms
                  </div>
                  <div className="stat-desc">
                    {performanceStats.slowest_response.toFixed(1)}ms worst
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto bg-base-200 rounded-lg p-4 mb-4">
                {responses.map((response, index) => (
                  <div key={index} className="mb-4">
                    <div className="chat chat-end">
                      <div className="chat-bubble chat-bubble-primary">
                        Test message {index + 1}
                      </div>
                    </div>
                    
                    <div className="chat chat-start">
                      <div className="chat-header">
                        <span className="font-bold">{response.agent}</span>
                        <span className="badge badge-sm ml-2">{response.team}</span>
                        <span className={`badge badge-sm ml-2 ${response.performance_metrics.under_threshold ? 'badge-success' : 'badge-warning'}`}>
                          {response.processing_time_ms.toFixed(1)}ms
                        </span>
                        {response.metadata.cache_hit && (
                          <span className="badge badge-sm badge-info ml-2">🎯 Cache Hit</span>
                        )}
                      </div>
                      <div className="chat-bubble max-w-lg">
                        {response.content}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Streaming Content */}
                {streamingContent && (
                  <div className="chat chat-start">
                    <div className="chat-header">
                      <span className="loading loading-dots loading-sm"></span>
                      {currentAgent && (
                        <>
                          <span className="font-bold ml-2">{currentAgent}</span>
                          <span className="badge badge-sm ml-2">{currentTeam}</span>
                        </>
                      )}
                    </div>
                    <div className="chat-bubble max-w-lg">
                      <pre className="whitespace-pre-wrap text-sm">{streamingContent}</pre>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Test optimized framework..."
                  className="input input-bordered flex-1"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendOptimizedMessage()}
                  disabled={isLoading}
                />
                <button
                  className="btn btn-primary"
                  onClick={sendOptimizedMessage}
                  disabled={isLoading || !message.trim()}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    '🚀 Send'
                  )}
                </button>
              </div>

              {/* Controls */}
              <div className="flex gap-2 mt-4">
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text mr-2">Streaming</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={useStreaming}
                      onChange={(e) => setUseStreaming(e.target.checked)}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Quick Tests */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">⚡ Quick Tests</h3>
              <div className="space-y-2">
                {testMessages.map((testMsg, index) => (
                  <button
                    key={index}
                    className="btn btn-sm btn-outline w-full text-left justify-start"
                    onClick={() => setMessage(testMsg)}
                    disabled={isLoading}
                  >
                    {testMsg.slice(0, 30)}...
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* System Status */}
          {optimizationStatus && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-lg">📊 System Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Framework:</span>
                    <span className="badge badge-success">{optimizationStatus.framework}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span>{optimizationStatus.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agents:</span>
                    <span>{optimizationStatus.total_agents}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Provider:</span>
                    <span className="badge">{optimizationStatus.model_provider}</span>
                  </div>
                </div>
                
                <div className="divider">Features</div>
                <div className="space-y-1">
                  {Object.entries(optimizationStatus.features || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span>{key.replace(/_/g, ' ')}:</span>
                      <span className={`badge badge-sm ${value ? 'badge-success' : 'badge-error'}`}>
                        {value ? '✓' : '✗'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Performance Targets */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg">🎯 Performance Targets</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Routing:</span>
                  <span className="badge badge-info">&lt;50ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Response:</span>
                  <span className="badge badge-info">&lt;1000ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache Hit Rate:</span>
                  <span className="badge badge-info">&gt;80%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 