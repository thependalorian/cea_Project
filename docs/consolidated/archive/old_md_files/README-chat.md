# Climate Economy Assistant - Chat System

## Overview

The Climate Economy Assistant chat system provides an interactive chat interface for users to ask questions about climate careers, jobs, and related topics. The system consists of:

1. **Frontend Components**: React components for the chat interface
2. **Shared Context**: React context for managing chat state
3. **API Layer**: Next.js API routes that connect to the Python backend
4. **Python Backend**: LangGraph-powered AI backend for generating responses

## Architecture

```
Frontend (Next.js) <--> API Layer <--> Python Backend (LangGraph)
    |
    v
Supabase (Auth & Storage)
```

### Components

- `ChatContext.tsx`: Manages chat state and message handling
- `chat-window.tsx`: Main chat interface component
- `chat-message.tsx`: Individual message display component
- `api-client.ts`: Client-side API utilities

### API Endpoints

- `/api/v1/interactive-chat`: Main chat endpoint that forwards to Python backend
- `/api/v1/conversations`: Conversation management endpoints
- `/api/v1/conversations/[id]/messages`: Message management endpoints

## Setup

### Environment Variables

Ensure these environment variables are set:

```
# Python Backend
PYTHON_BACKEND_URL=http://localhost:8001

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### Python Backend

The Python backend needs to be running for the chat system to work. Start it with:

```bash
cd python_backend
python main_v1.py
```

## Usage

### Basic Usage

```tsx
import { ChatWindow } from '@/components/chat'

export default function MyPage() {
  return (
    <div className="h-screen">
      <ChatWindow 
        type="general" 
        useEnhancedSearch={true}
      />
    </div>
  )
}
```

### With Resume Context

```tsx
import { ChatWindow } from '@/components/chat'

export default function CareerPage({ resumeData }) {
  return (
    <div className="h-screen">
      <ChatWindow 
        type="job-seeker" 
        resumeData={resumeData}
        useEnhancedSearch={true}
      />
    </div>
  )
}
```

## Features

- **Authentication**: Chat requires user authentication via next-auth
- **Message History**: Chat history is maintained in the context and persisted in Supabase
- **Resume Analysis**: Support for resume-based conversations
- **Enhanced Search**: Option to use enhanced search capabilities
- **Error Handling**: Robust error handling and retry mechanisms
- **Streaming Support**: API supports both streaming and non-streaming responses

## Data Flow

1. User sends a message through the chat interface
2. Message is sent to the `/api/v1/interactive-chat` endpoint
3. Endpoint forwards the request to the Python backend
4. Python backend processes the request using LangGraph
5. Response is returned to the frontend and displayed to the user

## Extending

To add new capabilities:

1. Add new endpoints in the Python backend
2. Create corresponding API routes in Next.js
3. Update the `ChatContext` to handle new message types
4. Add UI components as needed 