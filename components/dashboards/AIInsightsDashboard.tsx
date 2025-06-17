/**
 * AI Insights Dashboard Component
 * Modern AI-powered climate insights with predictive analytics
 * Location: components/dashboards/AIInsightsDashboard.tsx
 */

"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ACTButton } from '@/components/ui/ACTButton';
import { AIVisualizer } from '@/components/chat/AIVisualizer';
import { cn } from '@/lib/utils';
import { 
  ArrowUpRight, 
  BrainCircuit, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  MessageCircle, 
  AlertTriangle,
  Clock,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Search,
  Send
} from 'lucide-react';

interface AIInsightsDashboardProps {
  className?: string;
  variant?: 'cea-pulse' | 'cea-wave' | 'cea-minimal';
  theme?: 'light' | 'dark' | 'glass';
  showVisualizer?: boolean;
}

// Real prediction data structure
const getPredictionData = (realData?: any[]) => {
  if (!realData || realData.length === 0) {
    // Return empty state if no real data
    return [];
  }
  
  // Process real data into chart format
  return realData.map(item => ({
    month: item.month || 'Unknown',
    predicted: item.predicted || 0,
    actual: item.actual || null,
    lower: item.lower_bound || 0,
    upper: item.upper_bound || 0
  }));
};

// Real insights data structure
const getInsights = (realInsights?: any[]) => {
  if (!realInsights || realInsights.length === 0) {
    return [];
  }
  
  return realInsights.map(insight => ({
    id: insight.id,
    title: insight.title || 'Untitled Insight',
    content: insight.content || 'No content available',
    category: insight.category || 'analysis',
    confidence: insight.confidence || 0,
    timestamp: new Date(insight.created_at || Date.now()),
    source: insight.source || 'AI Analysis'
  }));
};

// Real conversations data structure
const getConversations = (realConversations?: any[]) => {
  if (!realConversations || realConversations.length === 0) {
    return [];
  }
  
  return realConversations.map(conv => ({
    id: conv.id,
    question: conv.question || 'No question',
    answer: conv.answer || 'No answer available',
    timestamp: new Date(conv.created_at || Date.now())
  }));
};

export const AIInsightsDashboard = ({
  className,
  variant = 'cea-pulse',
  theme = 'dark',
  showVisualizer = true
}: AIInsightsDashboardProps) => {
  const [predictionData, setPredictionData] = useState(getPredictionData());
  const [insights, setInsights] = useState(getInsights());
  const [conversations, setConversations] = useState(getConversations());
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeInsight, setActiveInsight] = useState<number | null>(1);
  const [newQuestion, setNewQuestion] = useState('');
  
  // Get appropriate color based on variant
  const getVariantColor = () => {
    switch (variant) {
      case 'cea-pulse':
        return '#B2DE26'; // spring-green
      case 'cea-wave':
        return '#E0FFFF'; // light cyan
      case 'cea-minimal':
        return '#394816'; // dark moss
      default:
        return '#B2DE26';
    }
  };
  
  // Get appropriate theme styles
  const getThemeStyles = () => {
    switch (theme) {
      case 'dark':
        return {
          container: "bg-midnight-forest text-white border border-midnight-forest/50",
          header: "bg-midnight-forest/80 border-moss-green/30",
          card: "bg-midnight-forest/70 border-moss-green/20",
          cardHeader: "border-moss-green/30",
          input: "bg-midnight-forest/50 border-moss-green/30",
          insight: {
            normal: "bg-midnight-forest/40 hover:bg-midnight-forest/60",
            active: "bg-spring-green/20 border-spring-green"
          }
        };
      case 'glass':
        return {
          container: "bg-white/10 backdrop-blur-ios text-midnight-forest border border-white/25",
          header: "bg-white/20 backdrop-blur-ios border-white/20",
          card: "bg-white/20 backdrop-blur-ios border-white/20",
          cardHeader: "border-white/20",
          input: "bg-white/20 backdrop-blur-ios border-white/20",
          insight: {
            normal: "bg-white/10 hover:bg-white/20 border-white/10",
            active: "bg-spring-green/20 border-spring-green"
          }
        };
      case 'light':
      default:
        return {
          container: "bg-white text-midnight-forest border border-sand-gray/10",
          header: "bg-white border-sand-gray/10",
          card: "bg-white border-sand-gray/10",
          cardHeader: "border-sand-gray/10",
          input: "bg-sand-gray/5 border-sand-gray/10",
          insight: {
            normal: "bg-sand-gray/5 hover:bg-sand-gray/10 border-sand-gray/10",
            active: "bg-spring-green/10 border-spring-green"
          }
        };
    }
  };
  
  const themeStyles = getThemeStyles();
  const variantColor = getVariantColor();
  
  // Handle asking a new question
  const handleAskQuestion = () => {
    if (!newQuestion.trim() || isProcessing) return;
    
    setIsProcessing(true);
    
    // Add the user question immediately
    const newConversation = {
      id: conversations.length + 1,
      question: newQuestion,
      answer: "",
      timestamp: new Date()
    };
    
    setConversations([newConversation, ...conversations]);
    
    // Simulate AI processing
    setTimeout(() => {
      // Update with the answer
      setConversations(prev => 
        prev.map(conv => 
          conv.id === newConversation.id 
            ? { 
                ...conv, 
                answer: "Based on recent climate models, " + newQuestion.toLowerCase() + " is likely to be influenced by multiple factors including increased atmospheric CO₂ concentrations, changing ocean circulation patterns, and feedback loops in the climate system. Our analysis suggests a 72% probability of acceleration in these trends over the next decade if current emission pathways continue." 
              } 
            : conv
        )
      );
      
      setIsProcessing(false);
      setNewQuestion('');
    }, 3000);
  };
  
  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };
  
  // Get icon for insight category
  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'prediction':
        return <TrendingUp className="w-5 h-5" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5" />;
      case 'analysis':
        return <BarChart3 className="w-5 h-5" />;
      case 'sentiment':
        return <MessageCircle className="w-5 h-5" />;
      default:
        return <BrainCircuit className="w-5 h-5" />;
    }
  };
  
  return (
    <div className={cn(
      "rounded-xl shadow-ios-normal overflow-hidden",
      themeStyles.container,
      className
    )}>
      {/* Dashboard Header */}
      <div className={cn(
        "p-4 sm:p-6 border-b flex items-center justify-between",
        themeStyles.header
      )}>
        <div className="flex items-center gap-3">
          {showVisualizer && (
            <div className="hidden md:block">
              <AIVisualizer 
                variant={variant} 
                size="sm" 
                isActive={true} 
                isProcessing={isProcessing}
                color={variantColor}
              />
            </div>
          )}
          
          <div>
            <h2 className="text-xl sm:text-2xl font-medium font-helvetica flex items-center gap-2">
              <BrainCircuit className="w-6 h-6" style={{ color: variantColor }} />
              AI Climate Insights
            </h2>
            <p className="text-sm opacity-70 mt-1">Advanced predictive analytics and natural language climate intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-spring-green/20 text-spring-green">
            <Clock className="w-3 h-3 inline mr-1" />
            Last updated: {formatTimestamp(new Date(Date.now() - 1000 * 60 * 10))}
          </span>
          
          <ACTButton
            size="sm"
            variant="outline"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => setIsProcessing(!isProcessing)}
            className={isProcessing ? "animate-spin" : ""}
          >
            {isProcessing ? "Processing..." : "Refresh"}
          </ACTButton>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 sm:p-6">
        {/* Left Column - Insights List */}
        <div className="lg:col-span-1">
          <div className={cn(
            "rounded-xl border shadow-ios-subtle h-full overflow-hidden",
            themeStyles.card
          )}>
            <div className={cn(
              "p-4 border-b flex items-center justify-between",
              themeStyles.cardHeader
            )}>
              <h3 className="font-medium">AI Generated Insights</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-spring-green/20 text-spring-green">
                4 new
              </span>
            </div>
            
            <div className="p-3 space-y-3 max-h-[500px] overflow-y-auto">
              {insights.map(insight => (
                <div 
                  key={insight.id}
                  className={cn(
                    "p-3 rounded-lg border transition-colors cursor-pointer",
                    activeInsight === insight.id 
                      ? themeStyles.insight.active
                      : themeStyles.insight.normal
                  )}
                  onClick={() => setActiveInsight(insight.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-white/10 flex-shrink-0">
                      {getInsightIcon(insight.category)}
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                          {insight.confidence}% confidence
                        </span>
                        <span className="text-xs opacity-70">{formatTimestamp(insight.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Middle Column - Main Insight and Chart */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Current Insight Detail */}
            {activeInsight && (
              <div className={cn(
                "rounded-xl border shadow-ios-subtle",
                themeStyles.card
              )}>
                <div className={cn(
                  "p-4 border-b flex items-center justify-between",
                  themeStyles.cardHeader
                )}>
                  <h3 className="font-medium flex items-center gap-2">
                    {getInsightIcon(insights.find(i => i.id === activeInsight)?.category || 'analysis')}
                    {insights.find(i => i.id === activeInsight)?.title}
                  </h3>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs opacity-70">
                      Source: {insights.find(i => i.id === activeInsight)?.source}
                    </span>
                    <div className="flex items-center gap-1">
                      <button className="p-1 rounded-full hover:bg-white/10">
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button className="p-1 rounded-full hover:bg-white/10">
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                      <button className="p-1 rounded-full hover:bg-white/10">
                        <HelpCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <p className="mb-4">
                    {insights.find(i => i.id === activeInsight)?.content}
                  </p>
                  
                  {activeInsight === 1 && (
                    <div className="h-[300px] mt-6">
                      <h4 className="text-sm font-medium mb-2">Global Temperature Anomaly Prediction</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={predictionData}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={variantColor} stopOpacity={0.2}/>
                              <stop offset="95%" stopColor={variantColor} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#ffffff30" : "#00000010"} />
                          <XAxis dataKey="month" />
                          <YAxis domain={[1, 1.4]} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: theme === 'dark' ? '#1E293B' : 'white',
                              borderColor: theme === 'dark' ? '#334155' : '#E2E8F0',
                              borderRadius: '8px',
                              color: theme === 'dark' ? 'white' : 'black'
                            }}
                            formatter={(value) => [
                              typeof value === 'number' ? value.toFixed(2) + '°C' : 'N/A', 
                              'Temperature'
                            ]}
                          />
                          <Legend />
                          <Area 
                            type="monotone" 
                            dataKey="upper" 
                            stroke="transparent" 
                            fill="url(#splitColor)" 
                            name="Prediction Range" 
                          />
                          <Area 
                            type="monotone" 
                            dataKey="lower" 
                            stroke="transparent" 
                            fill="transparent"
                            name="Prediction Range" 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="predicted" 
                            stroke={variantColor} 
                            strokeWidth={2} 
                            dot={false}
                            strokeDasharray="5 5"
                            name="AI Prediction" 
                          />
                          <Line 
                            type="monotone" 
                            dataKey="actual" 
                            stroke="#FF4949" 
                            strokeWidth={3} 
                            name="Actual Temperature" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
                
                <div className={cn(
                  "p-3 border-t flex items-center justify-between text-xs",
                  themeStyles.cardHeader
                )}>
                  <div className="opacity-70">
                    Analysis performed {formatTimestamp(insights.find(i => i.id === activeInsight)?.timestamp || new Date())}
                  </div>
                  <div>
                    <button className="underline hover:text-spring-green">
                      View full analysis report
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* AI Conversation Interface */}
            <div className={cn(
              "rounded-xl border shadow-ios-subtle",
              themeStyles.card
            )}>
              <div className={cn(
                "p-4 border-b",
                themeStyles.cardHeader
              )}>
                <h3 className="font-medium flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" style={{ color: variantColor }} />
                  Ask AI Assistant
                </h3>
              </div>
              
              <div className="p-4">
                <div className="flex gap-2 mb-6">
                  <div className={cn(
                    "flex-1 rounded-lg border px-3 py-2",
                    themeStyles.input
                  )}>
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={e => setNewQuestion(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAskQuestion()}
                      placeholder="Ask about climate trends, impacts, or adaptation strategies..."
                      className="w-full bg-transparent border-none outline-none placeholder:opacity-50"
                      disabled={isProcessing}
                    />
                  </div>
                  <ACTButton
                    variant="primary"
                    size="sm"
                    icon={<Send className="w-4 h-4" />}
                    onClick={handleAskQuestion}
                    disabled={!newQuestion.trim() || isProcessing}
                  >
                    Ask
                  </ACTButton>
                </div>
                
                {/* Recent Conversations */}
                <div className="space-y-4 max-h-[280px] overflow-y-auto">
                  {conversations.map((conv, index) => (
                    <div key={conv.id} className={cn(
                      "p-3 rounded-lg border",
                      themeStyles.insight.normal
                    )}>
                      <div className="flex items-start gap-2">
                        <div className="p-1.5 rounded-full bg-spring-green/20 text-spring-green flex-shrink-0">
                          <Search className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{conv.question}</p>
                          <div className="text-xs opacity-70 mt-0.5">{formatTimestamp(conv.timestamp)}</div>
                        </div>
                      </div>
                      
                      {(conv.answer || index === 0 && isProcessing) && (
                        <div className="mt-2 ml-7">
                          {index === 0 && isProcessing ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-pulse">
                                <div className="flex gap-1">
                                  <div className="w-2 h-2 bg-spring-green/60 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-spring-green/60 rounded-full animate-bounce delay-75"></div>
                                  <div className="w-2 h-2 bg-spring-green/60 rounded-full animate-bounce delay-150"></div>
                                </div>
                              </div>
                              <span className="text-sm opacity-70">AI is analyzing climate data...</span>
                            </div>
                          ) : (
                            <p className="text-sm">{conv.answer}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-4 sm:px-6 py-3 border-t border-sand-gray/10 text-xs opacity-70 flex justify-between items-center">
        <div>AI Climate System v4.2.1 | Powered by Climate Economy Assistant</div>
        <div className="flex items-center gap-2">
          <span>Model: GPT-Climate 2025</span>
          <span>•</span>
          <span>Confidence threshold: 75%</span>
        </div>
      </div>
    </div>
  );
}; 