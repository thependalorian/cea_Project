# CopilotKit AG-UI Implementation Guide for Climate Economy Assistant

## Table of Contents
1. [Introduction to Modern AI Chat Interfaces (2025)](#introduction)
2. [What is AG-UI Protocol?](#ag-ui-protocol)
3. [Design Specifications for 2025](#design-specifications)
4. [Implementation Architecture](#implementation-architecture)
5. [Step-by-Step Implementation](#step-by-step-implementation)
6. [Advanced Features](#advanced-features)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Introduction to Modern AI Chat Interfaces (2025) {#introduction}

### Current Industry Trends

Based on 2025 research, modern AI chat interfaces prioritize:
- **Conversational UX**: Natural language interactions over traditional form filling
- **Adaptive Layouts**: Responsive designs with optimal display sizes (400-800px width)
- **Real-time Streaming**: Token-by-token response rendering
- **Multimodal Integration**: Voice, text, and visual elements
- **Contextual Intelligence**: State-aware conversations
- **Human-in-the-loop**: Approval workflows and collaborative editing

### Optimal Display Specifications (2025)

**Desktop Chat Interfaces:**
- **Width**: 400-500px (sidebar) or 800-1200px (full-screen)
- **Height**: Minimum 600px, optimal 700-900px
- **Message Area**: 60-70% of total height
- **Input Area**: 80-120px height
- **Response Time**: <200ms for UI updates, <2s for AI responses

**Mobile Chat Interfaces:**
- **Width**: 100vw (full screen) or 90vw (modal)
- **Height**: 70-90vh for optimal mobile experience
- **Touch Targets**: Minimum 44px for accessibility
- **Safe Areas**: Account for notches and navigation bars

## What is AG-UI Protocol? {#ag-ui-protocol}

AG-UI (Agent-User Interaction Protocol) is CopilotKit's open protocol for standardizing communication between AI agents and frontend interfaces.

### Key Benefits
- **Event-Driven Architecture**: Real-time JSON event streaming
- **Framework Agnostic**: Works with React, Vue, Svelte, etc.
- **State Synchronization**: Bidirectional state sharing
- **Tool Integration**: Seamless agent-tool interactions
- **Human-in-the-loop**: Built-in approval workflows

### Core Event Types
```typescript
// Lifecycle Events
{ "type": "lifecycle", "status": "started" | "completed" | "error" }

// Text Streaming
{ "type": "text-delta", "value": "Hello, I'm your assistant." }

// Tool Execution
{ "type": "tool-call", "tool": "weather", "input": "NYC" }
{ "type": "tool-result", "value": "22°C, Sunny" }

// State Updates
{ "type": "state-update", "diff": { "mode": "editing" } }
```

## Design Specifications for 2025 {#design-specifications}

### Visual Design Language

**Color Palette (ACT Brand Integration):**
```css
:root {
  /* ACT Brand Colors */
  --spring-green: #B2DE26;
  --moss-green: #394816;
  --midnight-forest: #001818;
  --seafoam-blue: #E0FFFF;
  --sand-gray: #EBE9E1;
  
  /* AI Interface Gradients */
  --ai-gradient-primary: linear-gradient(135deg, var(--spring-green), var(--seafoam-blue));
  --ai-gradient-secondary: linear-gradient(90deg, var(--moss-green), var(--midnight-forest));
  
  /* Chat Bubble Variants */
  --user-bubble: var(--spring-green);
  --ai-bubble: rgba(224, 255, 255, 0.1);
  --system-bubble: var(--sand-gray);
}
```

**Typography Classes:**
```css
.chat-typography {
  /* Agent Messages */
  .agent-message {
    font-family: 'Inter', system-ui;
    font-size: 16px;
    line-height: 1.5;
    letter-spacing: 0;
  }
  
  /* User Messages */
  .user-message {
    font-family: 'Helvetica', system-ui;
    font-size: 16px;
    line-height: 1.4;
    letter-spacing: -0.01em;
  }
  
  /* System Messages */
  .system-message {
    font-family: 'Inter', system-ui;
    font-size: 14px;
    line-height: 1.4;
    color: var(--moss-green);
  }
}
```

### Layout Specifications

**Chat Container:**
```css
.chat-container {
  width: min(500px, 100vw - 32px);
  height: min(700px, 90vh);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(57, 72, 22, 0.1);
  box-shadow: 
    0 20px 40px rgba(0, 24, 24, 0.1),
    0 8px 16px rgba(0, 24, 24, 0.05);
}

.chat-messages {
  height: calc(100% - 140px);
  overflow-y: auto;
  scroll-behavior: smooth;
  padding: 20px;
  gap: 16px;
}

.chat-input-area {
  height: 120px;
  padding: 20px;
  border-top: 1px solid var(--sand-gray);
}
```

## Implementation Architecture {#implementation-architecture}

### System Architecture

```
┌─────────────────┐    ┌──────────────┐    ┌─────────────────┐
│   React UI      │◄──►│  AG-UI       │◄──►│  Climate AI     │
│   Components    │    │  Protocol    │    │  Agent System   │
└─────────────────┘    └──────────────┘    └─────────────────┘
        │                      │                     │
        │                      │                     │
   ┌────▼────┐          ┌─────▼─────┐        ┌──────▼──────┐
   │ CopilotKit│          │ Event     │        │ Multi-Agent │
   │ Provider  │          │ Stream    │        │ Orchestrator│
   └─────────┘          └───────────┘        └─────────────┘
```

### Component Hierarchy

```
ClimateEconomyApp/
├── CopilotKit Provider
│   ├── AG-UI Runtime
│   ├── State Management
│   └── Event Handlers
├── Chat Interface
│   ├── MessageList
│   ├── InputArea
│   └── StatusIndicators
├── Agent Integration
│   ├── Pendo (Supervisor)
│   ├── Specialist Agents
│   └── Tool Integrations
└── UI Components
    ├── ACT Brand Components
    ├── Responsive Layouts
    └── Accessibility Features
```

## Step-by-Step Implementation {#step-by-step-implementation}

### Step 1: Project Setup

**Install Dependencies:**
```bash
npm install @copilotkit/react-core @copilotkit/react-ui @copilotkit/runtime
npm install @copilotkit/runtime/nextjs
npm install framer-motion lucide-react
```

**Environment Configuration:**
```env
# .env.local

# OpenAI Configuration (required for LLM operations)
OPENAI_API_KEY=your_openai_api_key

# CopilotKit Configuration  
COPILOT_CLOUD_API_KEY=your_copilot_cloud_key

# Backend Integration (connect to your existing 7-agent system)
LANGGRAPH_API_URL=http://localhost:8123
LANGGRAPH_API_KEY=your_langgraph_api_key

# Your existing backend endpoints
NEXT_PUBLIC_APP_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Database (your existing Supabase setup)
DATABASE_URL=your_supabase_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Agent System Configuration
CLIMATE_SUPERVISOR_ENDPOINT=/api/chat
EMPATHY_WORKFLOW_ENDPOINT=/api/empathy
RESUME_AGENT_ENDPOINT=/api/resume
INTERACTIVE_CHAT_ENDPOINT=/api/interactive

# Production deployment settings
VERCEL_URL=your_vercel_deployment_url
NODE_ENV=development
```

### Step 2: Backend API Route Setup

**Create API Route (`app/api/copilotkit/route.ts`):**
```typescript
import { CopilotRuntime, OpenAIAdapter } from "@copilotkit/runtime";
import { copilotRuntimeHandler } from "@copilotkit/runtime/nextjs";

// Integration with existing 7-agent system
const runtime = new CopilotRuntime({
  agent: {
    name: "climate-economy-supervisor",
    description: "AI supervisor for 7-agent climate economy career guidance system",
  },
  llm: new OpenAIAdapter({
    model: "gpt-4o",
    temperature: 0.1,
  }),
  // Connect to existing LangGraph backend
  serviceUrl: process.env.LANGGRAPH_API_URL || "http://localhost:8123",
  agents: {
    // Map to existing workflow graphs
    supervisor: "climate_supervisor",
    empathy: "empathy_workflow", 
    climate_specialist: "climate_agent",
    resume_specialist: "resume_agent",
    career_guidance: "career_agent",
    interactive_chat: "interactive_chat"
  }
});

export const { GET, POST } = copilotRuntimeHandler(runtime);
```

### Step 3: Provider Setup with Existing Backend Integration

**Layout Integration (`app/layout.tsx`):**
```typescript
import { CopilotKit } from "@copilotkit/react-core";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-inter">
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          agent="climate-economy-supervisor"
          // Connect to your existing 7-agent system
          cloudConfig={{
            apiKey: process.env.COPILOT_CLOUD_API_KEY,
            baseUrl: process.env.LANGGRAPH_API_URL || "http://localhost:8123"
          }}
          showDevConsole={process.env.NODE_ENV === 'development'}
        >
          {children}
        </CopilotKit>
      </body>
    </html>
  );
}
```

### Step 4: Enhanced Chat Interface with 7-Agent Integration

**Create Enhanced Chat Component (`components/chat/ClimateChat.tsx`):**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Shield, // Marcus
  Globe, // Liv
  Leaf, // Miguel
  FileText, // Jasmine
  Heart, // Alex
  Briefcase, // Lauren
  PenTool // Mai
} from 'lucide-react';

interface ClimateChatProps {
  variant?: 'sidebar' | 'modal' | 'fullscreen';
  defaultOpen?: boolean;
  userContext?: {
    userType: 'job_seeker' | 'partner' | 'admin';
    profile?: any;
    preferences?: any;
  };
}

export function ClimateChat({ 
  variant = 'sidebar', 
  defaultOpen = false,
  userContext 
}: ClimateChatProps) {
  const [isVisible, setIsVisible] = useState(defaultOpen);
  const [agentStatus, setAgentStatus] = useState<'idle' | 'thinking' | 'responding'>('idle');
  const [activeAgent, setActiveAgent] = useState<string>('pendo');

  // Provide user context to match existing backend structure
  useCopilotReadable({
    description: "Current user profile and context for 7-agent system",
    value: JSON.stringify({
      userType: userContext?.userType,
      profile: userContext?.profile,
      preferences: userContext?.preferences,
      timestamp: new Date().toISOString(),
      // Match existing ClimateAgentState structure
      user_context: {
        user_type: userContext?.userType,
        background: userContext?.profile?.background,
        goals: userContext?.profile?.goals,
        location: userContext?.profile?.location || 'Massachusetts'
      }
    }),
  });

  // Integration with existing supervisor workflow delegation tools
  useCopilotAction({
    name: "delegate_to_marcus",
    description: "Connect to Marcus for veterans transition support",
    parameters: [
      {
        name: "reason",
        type: "string",
        description: "Reason for delegation to veterans specialist",
      },
    ],
    handler: async ({ reason }) => {
      setActiveAgent('marcus');
      // Call existing backend API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graph_id: 'climate_supervisor',
          input: { 
            message: `Delegate to Marcus: ${reason}`,
            user_context: userContext 
          }
        })
      });
      return await response.json();
    },
  });

  useCopilotAction({
    name: "delegate_to_liv",
    description: "Connect to Liv for international credentials support",
    parameters: [
      {
        name: "reason",
        type: "string",
        description: "Reason for delegation to international specialist",
      },
    ],
    handler: async ({ reason }) => {
      setActiveAgent('liv');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graph_id: 'climate_supervisor',
          input: { 
            message: `Delegate to Liv: ${reason}`,
            user_context: userContext 
          }
        })
      });
      return await response.json();
    },
  });

  useCopilotAction({
    name: "delegate_to_miguel",
    description: "Connect to Miguel for environmental justice support",
    parameters: [
      {
        name: "reason",
        type: "string",
        description: "Reason for delegation to environmental justice specialist",
      },
    ],
    handler: async ({ reason }) => {
      setActiveAgent('miguel');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graph_id: 'climate_supervisor',
          input: { 
            message: `Delegate to Miguel: ${reason}`,
            user_context: userContext 
          }
        })
      });
      return await response.json();
    },
  });

  useCopilotAction({
    name: "delegate_to_jasmine",
    description: "Connect to Jasmine for MA resources and resume analysis",
    parameters: [
      {
        name: "reason",
        type: "string",
        description: "Reason for delegation to MA resources specialist",
      },
    ],
    handler: async ({ reason }) => {
      setActiveAgent('jasmine');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graph_id: 'climate_supervisor',
          input: { 
            message: `Delegate to Jasmine: ${reason}`,
            user_context: userContext 
          }
        })
      });
      return await response.json();
    },
  });

  useCopilotAction({
    name: "delegate_to_alex",
    description: "Connect to Alex for empathy and emotional support",
    parameters: [
      {
        name: "reason",
        type: "string",
        description: "Reason for delegation to empathy specialist",
      },
    ],
    handler: async ({ reason }) => {
      setActiveAgent('alex');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graph_id: 'empathy_workflow',
          input: { 
            message: `Delegate to Alex: ${reason}`,
            user_context: userContext 
          }
        })
      });
      return await response.json();
    },
  });

  useCopilotAction({
    name: "delegate_to_lauren",
    description: "Connect to Lauren for climate career guidance",
    parameters: [
      {
        name: "reason",
        type: "string",
        description: "Reason for delegation to climate career specialist",
      },
    ],
    handler: async ({ reason }) => {
      setActiveAgent('lauren');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graph_id: 'climate_agent',
          input: { 
            message: `Delegate to Lauren: ${reason}`,
            user_context: userContext 
          }
        })
      });
      return await response.json();
    },
  });

  useCopilotAction({
    name: "delegate_to_mai",
    description: "Connect to Mai for resume optimization and career transitions",
    parameters: [
      {
        name: "reason",
        type: "string",
        description: "Reason for delegation to resume specialist",
      },
    ],
    handler: async ({ reason }) => {
      setActiveAgent('mai');
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          graph_id: 'resume_agent',
          input: { 
            message: `Delegate to Mai: ${reason}`,
            user_context: userContext 
          }
        })
      });
      return await response.json();
    },
  });

  // Enhanced instructions matching your existing agent personalities
  const chatInstructions = `
    You are Pendo, the Climate Economy Supervisor for the Massachusetts Climate Economy Assistant platform.
    
    Your role is to coordinate the 7-agent system serving the 38,100 clean energy jobs pipeline by 2030:
    
    AVAILABLE SPECIALISTS:
    
    🎖️ MARCUS (Veterans) - Military transition specialist
    - Use delegate_to_marcus for: Military background, MOS translation, VA resources
    - Personality: Professional, structured, mission-focused
    
    🌍 LIV (International) - Credential evaluation specialist  
    - Use delegate_to_liv for: International credentials, visa support, WES evaluation
    - Personality: Global perspective, patient, detail-oriented
    
    ♻️ MIGUEL (Environmental Justice) - Gateway Cities specialist
    - Use delegate_to_miguel for: EJ communities, frontline support, equity focus
    - Personality: Community-focused, justice-oriented, empowering
    
    🍃 JASMINE (MA Resources) - Massachusetts ecosystem specialist
    - Use delegate_to_jasmine for: Resume analysis, job matching, MassCEC resources
    - Personality: Local expert, practical, resource-focused
    
    ❤️ ALEX (Empathy) - Emotional intelligence specialist
    - Use delegate_to_alex for: Crisis support, emotional needs, therapeutic guidance
    - Personality: Caring, emotionally intelligent, supportive
    
    🌱 LAUREN (Climate Career) - Green economy specialist
    - Use delegate_to_lauren for: Climate careers, environmental justice, green jobs
    - Personality: Energetic, optimistic, data-driven, passionate
    
    📄 MAI (Resume & Transitions) - Career strategy specialist
    - Use delegate_to_mai for: Resume optimization, ATS, career transitions, professional branding
    - Personality: Detail-oriented, strategic, empowering, analytical
    
    ROUTING INTELLIGENCE:
    - Resume/Career Analysis → Jasmine or Mai
    - Military Background → Marcus  
    - International Credentials → Liv
    - Environmental Justice/Community → Miguel
    - Emotional Support → Alex
    - Climate Economy Focus → Lauren
    - Complex Multi-Identity → Coordinate multiple specialists
    
    User profile: ${userContext?.userType || 'general user'}
    
    Use ACT brand voice: professional, empowering, action-oriented, focused on climate economy transformation.
  `;

  const getAgentIcon = (agent: string) => {
    const icons = {
      pendo: MessageCircle,
      marcus: Shield,
      liv: Globe,
      miguel: Leaf,
      jasmine: FileText,
      alex: Heart,
      lauren: Briefcase,
      mai: PenTool
    };
    const Icon = icons[agent] || MessageCircle;
    return <Icon className="w-6 h-6" />;
  };

  return (
    <div className={`climate-chat-container ${variant}`}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.25, 0.46, 0.45, 0.94] 
            }}
            className="chat-wrapper"
          >
            {/* Agent Status Bar */}
            <div className="agent-status-bar">
              <div className="active-agent">
                {getAgentIcon(activeAgent)}
                <span className="agent-name">
                  {activeAgent === 'pendo' ? 'Pendo (Supervisor)' : 
                   activeAgent.charAt(0).toUpperCase() + activeAgent.slice(1)}
                </span>
              </div>
              <div className="system-status">
                <div className={`status-dot ${agentStatus}`}></div>
                <span>{agentStatus}</span>
              </div>
            </div>

            <CopilotChat
              instructions={chatInstructions}
              labels={{
                title: "Climate Economy Assistant (7-Agent System)",
                initial: `Hello! I'm Pendo, your Climate Economy Supervisor. I coordinate our team of 7 specialists to help you navigate climate career opportunities in Massachusetts. 

Available specialists:
• Marcus (Veterans) • Liv (International) • Miguel (Environmental Justice)
• Jasmine (MA Resources) • Alex (Empathy) • Lauren (Climate Careers) • Mai (Resume)

What would you like to explore today?`,
              }}
              className="climate-chat-ui"
              onStatusChange={(status) => setAgentStatus(status)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Enhanced Toggle Button with Agent Indicator */}
      {variant === 'sidebar' && (
        <motion.button
          onClick={() => setIsVisible(!isVisible)}
          className="chat-toggle-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {getAgentIcon(activeAgent)}
          {agentStatus === 'thinking' && (
            <motion.div
              className="status-indicator thinking"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
          <div className="agent-counter">7</div>
        </motion.button>
      )}
    </div>
  );
}
```

### Step 5: Styling Implementation

**Create Chat Styles (`styles/climate-chat.css`):**
```css
/* Climate Chat Container */
.climate-chat-container {
  position: relative;
  z-index: 1000;
}

.climate-chat-container.sidebar {
  position: fixed;
  bottom: 24px;
  right: 24px;
}

.climate-chat-container.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.climate-chat-container.fullscreen {
  position: fixed;
  inset: 0;
  padding: 20px;
}

/* Chat Wrapper */
.chat-wrapper {
  width: min(500px, calc(100vw - 48px));
  height: min(700px, calc(100vh - 48px));
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(57, 72, 22, 0.1);
  box-shadow: 
    0 20px 40px rgba(0, 24, 24, 0.1),
    0 8px 16px rgba(0, 24, 24, 0.05);
  overflow: hidden;
}

/* NEW: Agent Status Bar */
.agent-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: linear-gradient(135deg, var(--spring-green), var(--seafoam-blue));
  border-bottom: 1px solid rgba(57, 72, 22, 0.1);
  backdrop-filter: blur(10px);
}

.active-agent {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--midnight-forest);
  font-family: 'Helvetica', system-ui;
  font-weight: 600;
  font-size: 14px;
}

.agent-name {
  text-transform: capitalize;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', system-ui;
  font-size: 12px;
  color: var(--midnight-forest);
  opacity: 0.8;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.status-dot.idle {
  background-color: var(--moss-green);
}

.status-dot.thinking {
  background-color: #ff9500;
  animation: pulse 1.5s ease-in-out infinite;
}

.status-dot.responding {
  background-color: var(--spring-green);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

/* Chat UI Customization */
.climate-chat-ui {
  height: calc(100% - 60px); /* Account for agent status bar */
  font-family: 'Inter', system-ui;
}

.climate-chat-ui .copilot-message {
  background: rgba(224, 255, 255, 0.1);
  border: 1px solid rgba(57, 72, 22, 0.1);
  border-radius: 12px;
  padding: 16px;
  margin: 8px 0;
  font-size: 16px;
  line-height: 1.5;
}

.climate-chat-ui .user-message {
  background: var(--spring-green);
  color: var(--midnight-forest);
  border-radius: 12px;
  padding: 12px 16px;
  margin: 8px 0;
  font-family: 'Helvetica', system-ui;
  font-weight: 500;
  margin-left: auto;
  max-width: 80%;
}

.climate-chat-ui .input-area {
  border-top: 1px solid var(--sand-gray);
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
}

.climate-chat-ui input[type="text"] {
  border: 2px solid var(--sand-gray);
  border-radius: 12px;
  padding: 12px 16px;
  font-family: 'Inter', system-ui;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.climate-chat-ui input[type="text"]:focus {
  border-color: var(--spring-green);
  outline: none;
  box-shadow: 0 0 0 3px rgba(178, 222, 38, 0.1);
}

/* Enhanced Toggle Button with Agent Counter */
.chat-toggle-btn {
  position: relative;
  width: 56px;
  height: 56px;
  background: var(--spring-green);
  border: none;
  border-radius: 50%;
  color: var(--midnight-forest);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(178, 222, 38, 0.3);
  transition: all 0.2s ease;
}

.chat-toggle-btn:hover {
  box-shadow: 0 12px 28px rgba(178, 222, 38, 0.4);
}

.status-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-indicator.thinking {
  background: #ff9500;
}

/* NEW: Agent Counter Badge */
.agent-counter {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  background: var(--midnight-forest);
  color: var(--spring-green);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  font-family: 'Helvetica', system-ui;
  border: 2px solid white;
}

/* Agent-specific styling for delegation actions */
.agent-delegation {
  background: rgba(57, 72, 22, 0.05);
  border: 1px solid rgba(57, 72, 22, 0.1);
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.delegation-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
}

.delegation-icon.marcus { background: #2563eb; }
.delegation-icon.liv { background: #059669; }
.delegation-icon.miguel { background: #dc2626; }
.delegation-icon.jasmine { background: #7c3aed; }
.delegation-icon.alex { background: #ec4899; }
.delegation-icon.lauren { background: #16a34a; }
.delegation-icon.mai { background: #ea580c; }

.delegation-text {
  flex: 1;
}

.delegation-text h4 {
  margin: 0 0 4px 0;
  font-family: 'Helvetica', system-ui;
  font-weight: 600;
  font-size: 14px;
  color: var(--midnight-forest);
}

.delegation-text p {
  margin: 0;
  font-family: 'Inter', system-ui;
  font-size: 12px;
  color: var(--moss-green);
}

/* Responsive Design */
@media (max-width: 768px) {
  .climate-chat-container.sidebar {
    bottom: 16px;
    right: 16px;
  }
  
  .chat-wrapper {
    width: calc(100vw - 32px);
    height: calc(100vh - 32px);
  }
  
  .chat-toggle-btn {
    width: 48px;
    height: 48px;
  }
  
  .agent-counter {
    width: 16px;
    height: 16px;
    font-size: 9px;
  }
  
  .agent-status-bar {
    padding: 8px 16px;
  }
  
  .active-agent {
    font-size: 12px;
  }
  
  .system-status {
    font-size: 11px;
  }
}

/* AI-specific animations */
@keyframes ai-thinking {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.ai-thinking {
  animation: ai-thinking 1.5s ease-in-out infinite;
}

/* Message streaming effect */
@keyframes text-stream {
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}

.streaming-text {
  animation: text-stream 0.2s ease-out;
}

/* 7-Agent system loading states */
.agent-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(178, 222, 38, 0.1);
  border-radius: 8px;
  margin: 8px 0;
}

.agent-loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--sand-gray);
  border-top: 2px solid var(--spring-green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.agent-loading-text {
  font-family: 'Inter', system-ui;
  font-size: 14px;
  color: var(--moss-green);
}

/* Success states for agent connections */
.agent-connected {
  background: rgba(178, 222, 38, 0.1);
  border: 1px solid rgba(178, 222, 38, 0.3);
  border-radius: 8px;
  padding: 8px 12px;
  margin: 4px 0;
  font-family: 'Inter', system-ui;
  font-size: 12px;
  color: var(--moss-green);
  display: flex;
  align-items: center;
  gap: 6px;
}

.agent-connected::before {
  content: "✓";
  color: var(--spring-green);
  font-weight: bold;
}
```

### Step 6: Integration with Existing Components

**Update Job Seekers Page (`app/job-seekers/page.tsx`):**
```typescript
import { ClimateChat } from '@/components/chat/ClimateChat';
import { useAuth } from '@/hooks/useAuth';

export default function JobSeekersPage() {
  const { user, profile } = useAuth();

  return (
    <div className="job-seekers-page">
      {/* Existing job seekers content */}
      
      {/* Enhanced Chat Integration */}
      <ClimateChat 
        variant="sidebar"
        defaultOpen={false}
        userContext={{
          userType: 'job_seeker',
          profile: profile,
          preferences: user?.preferences,
        }}
      />
    </div>
  );
}
```

### Step 7: Integration with Existing Backend APIs

**Backend API Integration (`lib/agent-api.ts`):**
```typescript
// Integration with your existing 7-agent backend system

interface ChatRequest {
  graph_id: string;
  input: {
    message: string;
    user_context?: any;
    config?: any;
  };
}

interface AgentResponse {
  response: string;
  agent_id: string;
  status: 'success' | 'error';
  metadata?: any;
}

export class ClimateAgentAPI {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = process.env.BACKEND_URL || 'http://localhost:8000';
  }

  // Integration with existing climate_supervisor workflow
  async delegateToSupervisor(message: string, userContext: any): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LANGGRAPH_API_KEY}`
      },
      body: JSON.stringify({
        graph_id: 'climate_supervisor',
        input: {
          message,
          user_context: userContext,
          config: {
            configurable: {
              thread_id: `user_${userContext.userId || 'anonymous'}_${Date.now()}`
            }
          }
        }
      })
    });
    
    return await response.json();
  }

  // Integration with empathy_workflow
  async delegateToEmpathy(message: string, userContext: any): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/api/empathy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LANGGRAPH_API_KEY}`
      },
      body: JSON.stringify({
        graph_id: 'empathy_workflow',
        input: {
          message,
          user_context: userContext
        }
      })
    });
    
    return await response.json();
  }

  // Integration with resume_agent workflow
  async delegateToResume(message: string, userContext: any): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/api/resume`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LANGGRAPH_API_KEY}`
      },
      body: JSON.stringify({
        graph_id: 'resume_agent',
        input: {
          message,
          user_context: userContext
        }
      })
    });
    
    return await response.json();
  }

  // Integration with climate_agent workflow (Lauren)
  async delegateToClimateSpecialist(message: string, userContext: any): Promise<AgentResponse> {
    const response = await fetch(`${this.baseUrl}/api/climate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LANGGRAPH_API_KEY}`
      },
      body: JSON.stringify({
        graph_id: 'climate_agent',
        input: {
          message,
          user_context: userContext
        }
      })
    });
    
    return await response.json();
  }

  // Health check for your 7-agent system
  async getSystemHealth(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.LANGGRAPH_API_KEY}`
      }
    });
    
    return await response.json();
  }

  // Get available agents from your system
  async getAvailableAgents(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/agents`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.LANGGRAPH_API_KEY}`
      }
    });
    
    return await response.json();
  }
}

export const agentAPI = new ClimateAgentAPI();
```

**Database Integration (`lib/user-context.ts`):**
```typescript
// Integration with your existing database schema
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export interface UserContext {
  userId: string;
  userType: 'job_seeker' | 'partner' | 'admin';
  profile: JobSeekerProfile | PartnerProfile | AdminProfile;
  preferences: any;
  conversationHistory: any[];
}

// Match your existing database schema
export interface JobSeekerProfile {
  id: string;
  user_id: string;
  full_name: string;
  location: string;
  desired_position: string;
  experience_level: string;
  skills: string[];
  education: string;
  background_summary: string;
  career_goals: string;
  veteran_status: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartnerProfile {
  id: string;
  user_id: string;
  organization_name: string;
  organization_type: string;
  industry: string;
  size: string;
  location: string;
  contact_person: string;
  partnership_goals: string;
  created_at: string;
  updated_at: string;
}

export interface AdminProfile {
  id: string;
  user_id: string;
  full_name: string;
  role: string;
  department: string;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export async function getUserContext(userId: string): Promise<UserContext | null> {
  try {
    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) return null;

    // Get profile based on user type
    let profile = null;
    if (user.user_type === 'job_seeker') {
      const { data } = await supabase
        .from('job_seeker_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      profile = data;
    } else if (user.user_type === 'partner') {
      const { data } = await supabase
        .from('partner_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      profile = data;
    } else if (user.user_type === 'admin') {
      const { data } = await supabase
        .from('admin_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      profile = data;
    }

    // Get conversation history
    const { data: conversations } = await supabase
      .from('conversation_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      userId,
      userType: user.user_type,
      profile,
      preferences: user.preferences || {},
      conversationHistory: conversations || []
    };
  } catch (error) {
    console.error('Error fetching user context:', error);
    return null;
  }
}

export async function updateConversationLog(
  userId: string, 
  agentId: string, 
  message: string, 
  response: string
) {
  const { error } = await supabase
    .from('conversation_logs')
    .insert({
      user_id: userId,
      agent_id: agentId,
      user_message: message,
      agent_response: response,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error logging conversation:', error);
  }
}
```

**Enhanced Chat Hook with Backend Integration (`hooks/useClimateChat.ts`):**
```typescript
import { useState, useEffect, useCallback } from 'react';
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { agentAPI } from '@/lib/agent-api';
import { getUserContext, updateConversationLog, UserContext } from '@/lib/user-context';

export function useClimateChat(userId?: string) {
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const [activeAgent, setActiveAgent] = useState<string>('pendo');
  const [agentStatus, setAgentStatus] = useState<'idle' | 'thinking' | 'responding'>('idle');
  const [isLoading, setIsLoading] = useState(false);

  // Load user context on mount
  useEffect(() => {
    if (userId) {
      loadUserContext();
    }
  }, [userId]);

  const loadUserContext = async () => {
    setIsLoading(true);
    try {
      const context = await getUserContext(userId!);
      setUserContext(context);
    } catch (error) {
      console.error('Error loading user context:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Provide user context to CopilotKit
  useCopilotReadable({
    description: "Current user profile and context for 7-agent system",
    value: JSON.stringify({
      userContext,
      activeAgent,
      timestamp: new Date().toISOString(),
      systemStatus: {
        agentCount: 7,
        availableAgents: ['pendo', 'marcus', 'liv', 'miguel', 'jasmine', 'alex', 'lauren', 'mai']
      }
    }),
  });

  // Enhanced delegation with backend integration
  const createDelegationAction = useCallback((agentId: string, description: string) => {
    return useCopilotAction({
      name: `delegate_to_${agentId}`,
      description,
      parameters: [
        {
          name: "reason",
          type: "string",
          description: `Reason for delegation to ${agentId}`,
        },
      ],
      handler: async ({ reason }) => {
        setAgentStatus('thinking');
        setActiveAgent(agentId);
        
        try {
          let response;
          
          // Route to appropriate backend endpoint
          switch (agentId) {
            case 'alex':
              response = await agentAPI.delegateToEmpathy(reason, userContext);
              break;
            case 'mai':
              response = await agentAPI.delegateToResume(reason, userContext);
              break;
            case 'lauren':
              response = await agentAPI.delegateToClimateSpecialist(reason, userContext);
              break;
            default:
              response = await agentAPI.delegateToSupervisor(
                `Delegate to ${agentId}: ${reason}`, 
                userContext
              );
          }

          // Log conversation
          if (userContext?.userId) {
            await updateConversationLog(
              userContext.userId,
              agentId,
              reason,
              response.response
            );
          }

          setAgentStatus('responding');
          return response;
        } catch (error) {
          setAgentStatus('idle');
          console.error(`Error delegating to ${agentId}:`, error);
          throw error;
        }
      },
    });
  }, [userContext]);

  return {
    userContext,
    activeAgent,
    agentStatus,
    isLoading,
    setActiveAgent,
    setAgentStatus,
    createDelegationAction
  };
}
```

## Advanced Features {#advanced-features}

### 1. Multi-Agent Orchestration

**Agent Router Component (`components/chat/AgentRouter.tsx`):**
```typescript
import { useState } from 'react';
import { useCopilotAction } from "@copilotkit/react-core";

export function AgentRouter() {
  const [activeAgent, setActiveAgent] = useState<string>('pendo');
  
  useCopilotAction({
    name: "route_to_specialist",
    description: "Route conversation to a specialist agent",
    parameters: [
      {
        name: "agent_id",
        type: "string",
        description: "Specialist agent ID",
      },
      {
        name: "context",
        type: "string", 
        description: "Context for handoff",
      },
    ],
    handler: ({ agent_id, context }) => {
      setActiveAgent(agent_id);
      // Handle agent transition
    },
  });

  return (
    <div className="agent-router">
      {/* Agent status and routing UI */}
    </div>
  );
}
```

### 2. Voice Integration

**Voice Chat Component (`components/chat/VoiceChat.tsx`):**
```typescript
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';

export function VoiceChat() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  return (
    <div className="voice-controls">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`voice-btn ${isListening ? 'listening' : ''}`}
      >
        {isListening ? <MicOff /> : <Mic />}
      </button>
      {isSpeaking && <Volume2 className="speaking-indicator" />}
    </div>
  );
}
```

### 3. Human-in-the-Loop Approvals

**Approval Workflow Component (`components/chat/ApprovalWorkflow.tsx`):**
```typescript
import { useCopilotAction } from "@copilotkit/react-core";
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export function ApprovalWorkflow() {
  useCopilotAction({
    name: "request_approval",
    description: "Request human approval for sensitive actions",
    parameters: [
      {
        name: "action",
        type: "string",
        description: "Action requiring approval",
      },
      {
        name: "details",
        type: "object",
        description: "Action details and context",
      },
    ],
    renderAndWaitForResponse: ({ args, respond }) => (
      <div className="approval-request">
        <div className="approval-header">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <h3>Approval Required</h3>
        </div>
        
        <div className="approval-content">
          <p><strong>Action:</strong> {args.action}</p>
          <pre>{JSON.stringify(args.details, null, 2)}</pre>
        </div>
        
        <div className="approval-actions">
          <button
            onClick={() => respond?.({ approved: true })}
            className="approve-btn"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => respond?.({ approved: false })}
            className="reject-btn"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
        </div>
      </div>
    ),
  });

  return null;
}
```

## Best Practices {#best-practices}

### 1. Performance Optimization

**Lazy Loading:**
```typescript
import { lazy, Suspense } from 'react';

const ClimateChat = lazy(() => import('@/components/chat/ClimateChat'));

export function ChatWrapper() {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ClimateChat />
    </Suspense>
  );
}
```

**Message Virtualization:**
```typescript
import { FixedSizeList as List } from 'react-window';

function MessageList({ messages }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      <Message data={messages[index]} />
    </div>
  );

  return (
    <List
      height={400}
      itemCount={messages.length}
      itemSize={80}
    >
      {Row}
    </List>
  );
}
```

### 2. Accessibility

**ARIA Labels and Keyboard Navigation:**
```typescript
export function AccessibleChat() {
  return (
    <div 
      role="application"
      aria-label="Climate Career Assistant Chat"
      className="chat-container"
    >
      <div 
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        className="messages"
      >
        {/* Messages */}
      </div>
      
      <div role="form" aria-label="Message input">
        <input
          type="text"
          aria-label="Type your message"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              handleSend();
            }
          }}
        />
      </div>
    </div>
  );
}
```

### 3. Error Handling

**Robust Error Boundaries:**
```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ChatErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="chat-error">
      <h3>Chat temporarily unavailable</h3>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  );
}

export function RobustChat() {
  return (
    <ErrorBoundary 
      FallbackComponent={ChatErrorFallback}
      onReset={() => window.location.reload()}
    >
      <ClimateChat />
    </ErrorBoundary>
  );
}
```

### 4. Testing Strategy

**Component Testing:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ClimateChat } from '@/components/chat/ClimateChat';

describe('ClimateChat', () => {
  it('renders chat interface correctly', () => {
    render(<ClimateChat />);
    expect(screen.getByText('Climate Career Assistant')).toBeInTheDocument();
  });

  it('handles user input correctly', async () => {
    render(<ClimateChat />);
    const input = screen.getByLabelText('Type your message');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(screen.getByText('Send'));
    // Assert message appears
  });
});
```

## Troubleshooting {#troubleshooting}

### Common Issues

**1. AG-UI Events Not Received:**
```typescript
// Debug event stream
const debugRuntime = new CopilotRuntime({
  // ... other config
  debug: true,
  onEvent: (event) => {
    console.log('AG-UI Event:', event);
  },
});
```

**2. State Synchronization Issues:**
```typescript
// Ensure proper state cleanup
useEffect(() => {
  return () => {
    // Cleanup AG-UI state
    copilotKit.cleanup();
  };
}, []);
```

**3. Performance Issues:**
```typescript
// Implement message throttling
const useThrottledMessages = (messages, delay = 100) => {
  const [throttledMessages, setThrottledMessages] = useState(messages);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setThrottledMessages(messages);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [messages, delay]);
  
  return throttledMessages;
};
```

### Debug Utilities

**AG-UI Event Inspector:**
```typescript
export function AGUIDebugger() {
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    const handleEvent = (event) => {
      setEvents(prev => [...prev.slice(-50), event]);
    };
    
    // Subscribe to AG-UI events
    return subscribeTo AGUIEvents(handleEvent);
  }, []);
  
  return (
    <div className="debug-panel">
      <h3>AG-UI Events</h3>
      {events.map((event, i) => (
        <div key={i} className="event">
          <strong>{event.type}</strong>
          <pre>{JSON.stringify(event, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}
```

---

## Conclusion

This implementation guide provides a comprehensive foundation for integrating CopilotKit AG-UI into the Climate Economy Assistant platform. The modern 2025 design specifications ensure optimal user experience while the AG-UI protocol provides robust agent-UI communication.

Key benefits of this implementation:
- **Modern UX**: Follows 2025 design trends and user expectations
- **Scalable Architecture**: Supports multi-agent orchestration
- **Brand Consistency**: Integrates with ACT brand guidelines
- **Performance Optimized**: Efficient rendering and state management
- **Accessible**: WCAG compliant interface design
- **Future-Proof**: Built on open standards (AG-UI protocol)

For additional support, refer to the CopilotKit documentation or the AG-UI protocol specifications. 