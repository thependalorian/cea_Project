/**
 * Climate Economy Assistant Page - Main AI Assistant Interface
 * Modern 2025 design with streaming chat functionality and comprehensive features
 * Location: app/assistant/page.tsx
 */

"use client";

import { useState, useEffect } from 'react';
import { Navigation, Footer } from "@/components/layout";
import { IOSLayout, IOSSection } from "@/components/layout/IOSLayout";
import { StreamingChatInterface, ChatSidebar, AssistantHeader, QuickActions } from "@/components/chat";
import { 
  Brain, 
  FileText, 
  TrendingUp, 
  BookOpen,
  Sparkles
} from 'lucide-react';

interface AssistantSession {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
}

export default function AssistantPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<AssistantSession[]>([]);
  const [assistantStatus, setAssistantStatus] = useState<'ready' | 'processing' | 'streaming'>('ready');

  // Initialize assistant session
  useEffect(() => {
    const initializeSession = () => {
      const newSessionId = `session-${Date.now()}`;
      setCurrentSessionId(newSessionId);
      
      // Add welcome session to history
      const welcomeSession: AssistantSession = {
        id: newSessionId,
        title: "New Climate Career Conversation",
        preview: "Welcome to your Climate Economy Assistant",
        timestamp: new Date(),
        messageCount: 1
      };
      
      setSessions([welcomeSession]);
    };

    initializeSession();
  }, []);

  // Handle new session creation
  const handleNewSession = () => {
    const newSessionId = `session-${Date.now()}`;
    setCurrentSessionId(newSessionId);
    
    const newSession: AssistantSession = {
      id: newSessionId,
      title: "New Conversation",
      preview: "Start a new conversation...",
      timestamp: new Date(),
      messageCount: 0
    };
    
    setSessions(prev => [newSession, ...prev]);
  };

  // Handle session selection
  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  // Handle session updates
  const handleSessionUpdate = (sessionId: string, title: string, preview: string) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { 
              ...session, 
              title, 
              preview, 
              messageCount: session.messageCount + 1,
              timestamp: new Date()
            }
          : session
      )
    );
  };

  // Quick action handlers
  const quickActions = [
    {
      icon: Brain,
      label: "Career Analysis",
      description: "Analyze your skills for climate careers",
      prompt: "Can you analyze my background and suggest climate career paths that match my skills and experience?",
      color: "spring-green"
    },
    {
      icon: FileText,
      label: "Resume Review",
      description: "Get feedback on your resume",
      prompt: "Please review my resume and provide specific recommendations for climate industry roles.",
      color: "moss-green"
    },
    {
      icon: TrendingUp,
      label: "Industry Insights",
      description: "Latest climate job market trends",
      prompt: "What are the current trends and growth opportunities in the climate economy, especially in Massachusetts?",
      color: "seafoam-blue"
    },
    {
      icon: BookOpen,
      label: "Skills Translation",
      description: "Map your skills to climate roles",
      prompt: "Help me understand how my current skills and experience translate to opportunities in the climate economy.",
      color: "midnight-forest"
    }
  ];

  return (
    <IOSLayout backgroundColor="gradient" animated className="min-h-screen">
      <Navigation />
      
      {/* Assistant Header */}
      <AssistantHeader 
        status={assistantStatus}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1 relative">
        {/* Chat Sidebar */}
        <ChatSidebar
          isOpen={isSidebarOpen}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={handleSelectSession}
          onNewSession={handleNewSession}
        />

        {/* Main Chat Interface */}
        <div className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'ml-80' : 'ml-0'
        }`}>
          <IOSSection spacing="lg" className="h-full flex flex-col">
            
            {/* Hero Section: Welcome + Quick Actions */}
            {/*
              Hero Section (Welcome + Quick Actions)
              - Purpose: Compact, visually distinct hero area at the top of the assistant page.
              - Contains: Welcome icon, title, subtitle, and horizontally centered quick actions row.
              - Location: app/assistant/page.tsx (can be modularized later if needed)
              - Styling: Minimal vertical space, DaisyUI, maximizes chat area below.
            */}
            {currentSessionId && sessions.find(s => s.id === currentSessionId)?.messageCount === 1 && (
              <div className="w-full flex flex-col items-center justify-center mb-2 pt-2 pb-2">
                <div className="flex flex-col items-center justify-center mb-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-spring-green/10 rounded-ios-xl mb-2">
                    <Sparkles className="h-6 w-6 text-spring-green" />
                  </div>
                  <h2 className="text-ios-title-2 text-midnight-forest mb-1">
                    Welcome to Your Climate Career Assistant
                  </h2>
                  <p className="text-ios-body text-midnight-forest/70 max-w-2xl mx-auto text-sm">
                    I&apos;m here to help you navigate the climate economy, discover career opportunities, and connect with meaningful work that makes a difference.
                  </p>
                </div>
                <QuickActions 
                  actions={quickActions}
                  layout="row"
                  size="sm"
                  className="flex-nowrap overflow-x-auto gap-2 px-0 justify-center"
                  onActionSelect={(prompt: string) => {
                    // This will be handled by the StreamingChatInterface
                    const event = new CustomEvent('quickActionSelected', { 
                      detail: { prompt } 
                    });
                    window.dispatchEvent(event);
                  }}
                />
              </div>
            )}

            {/* Streaming Chat Interface */}
            <div className="flex-1 min-h-0">
              <StreamingChatInterface
                sessionId={currentSessionId}
                onStatusChange={setAssistantStatus}
                onSessionUpdate={handleSessionUpdate}
                welcomeMessage="🌱 Welcome to your Climate Economy Assistant! I'm here to provide personalized career guidance in the growing clean energy sector. Whether you're looking to transition careers, explore new opportunities, or advance in climate-focused roles, I can help you navigate this exciting field. What would you like to explore today?"
                className="h-full"
              />
            </div>
          </IOSSection>
        </div>
      </div>

      <Footer />
    </IOSLayout>
  );
} 