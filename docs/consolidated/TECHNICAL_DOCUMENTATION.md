# Climate Economy Assistant - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [AI Agent System](#ai-agent-system)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Authentication](#authentication)
8. [Deployment Guide](#deployment-guide)
9. [Environment Setup](#environment-setup)
10. [Security Considerations](#security-considerations)

## Architecture Overview

The Climate Economy Assistant V1 is built using a modern, scalable architecture designed for performance, security, and maintainability with integrated AI agent workflows powered by LangGraph 2025 and BackendV1.

### System Components

```
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│   Next.js 14 UI   │      │  Backend API/SSR  │      │  Database/Storage │
│                   │◄────►│                   │◄────►│                   │
│  React + TypeScript│      │  Next.js API Routes│      │     Supabase      │
└───────────────────┘      └───────────────────┘      └───────────────────┘
          ▲                          ▲                          ▲
          │                          │                          │
          ▼                          ▼                          ▼
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│   CDN/Storage     │      │  LangGraph API    │      │  External APIs    │
│                   │      │                   │      │                   │
│  Vercel/Supabase  │      │  AI Agent System  │      │  OpenAI, etc.     │
└───────────────────┘      └───────────────────┘      └───────────────────┘
```

## Frontend Architecture

The frontend is built with Next.js 14 using the App Router architecture, with React and TypeScript for type safety.

### Key Frontend Components

- **App Router**: Server-side rendering with React Server Components
- **Authentication**: Supabase Auth with JWT tokens
- **UI Components**: DaisyUI and Tailwind CSS for styling
- **State Management**: React Context API and custom hooks

## Backend Architecture

The backend consists of Next.js API routes and a separate BackendV1 system with LangGraph for AI agent orchestration.

### Next.js API Routes

API routes are organized in the `/app/api/` directory with the following structure:

- `/api/v1/` - Main API version 1 endpoints
- `/api/auth/` - Authentication endpoints
- `/api/admin/` - Admin-only endpoints

### BackendV1 System

The BackendV1 system is a Python-based backend that handles AI agent workflows and complex business logic.

## AI Agent System

The Climate Economy Assistant uses a 7-agent ecosystem powered by LangGraph for orchestration.

### Agent Network

- **Pendo (Supervisor)**: Orchestrates the agent network
- **Marcus (Veterans)**: Specializes in veteran career transitions
- **Liv (International)**: Handles international job seekers
- **Miguel (Environmental Justice)**: Focuses on environmental justice
- **Jasmine (MA Resources)**: Massachusetts-specific resources
- **Alex (Empathy)**: Provides emotional intelligence
- **Lauren (Climate Careers)**: Climate career expert
- **Mai (Resume Expert)**: Resume analysis and optimization

### LangGraph Configuration

```json
{
  "python_version": "3.11",
  "dependencies": ["./backendv1"],
  "graphs": {
    "climate_supervisor": "./backendv1/workflows/climate_supervisor.py:climate_supervisor_graph",
    "pendo_supervisor": "./backendv1/workflows/pendo_supervisor.py:pendo_supervisor_graph",
    "empathy_agent": "./backendv1/workflows/empathy_workflow.py:empathy_graph",
    "resume_agent": "./backendv1/workflows/resume_workflow.py:resume_graph",
    "career_agent": "./backendv1/workflows/career_workflow.py:career_graph",
    "interactive_chat": "./backendv1/chat/interactive_chat.py:chat_graph"
  },
  "env": "./.env",
  "http": {
    "host": "0.0.0.0",
    "port": 8123
  },
  "webapp": "./backendv1/webapp.py:cea_app_v1",
  "agent_count": 7,
  "specialists": [
    "Pendo (Supervisor)", "Marcus (Veterans)", "Liv (International)", 
    "Miguel (Environmental Justice)", "Jasmine (MA Resources)", 
    "Alex (Empathy)", "Lauren (Climate Careers)", "Mai (Resume Expert)"
  ]
}
```

## Database Schema

The application uses Supabase for database storage with the following key tables:

- `profiles`: User profiles
- `job_seeker_profiles`: Job seeker specific information
- `partner_profiles`: Partner organization information
- `resumes`: Resume data and metadata
- `resume_chunks`: Vectorized resume chunks for AI analysis
- `conversations`: Chat conversations
- `conversation_messages`: Individual messages in conversations

## API Reference

The Climate Economy Assistant API provides comprehensive access to climate job data, user management, and AI-powered matching services.

### Key API Endpoints

- `/api/v1/auth/*`: Authentication endpoints
- `/api/v1/profile/*`: User profile management
- `/api/v1/resume/*`: Resume upload and analysis
- `/api/v1/chat/*`: AI chat functionality
- `/api/v1/jobs/*`: Job listings and search

## Authentication

Authentication is handled by Supabase Auth with JWT tokens. Server components use server-side Supabase client with cookies for authentication.

### Authentication Flow

1. User signs in via email/password or OAuth
2. Supabase Auth issues JWT token
3. Token is stored in cookies for server-side requests
4. Server components use `createClient()` without parameters
5. Client components use `createClientComponentClient()`

## Deployment Guide

### Vercel Deployment

1. Connect repository to Vercel
2. Configure environment variables
3. Deploy Next.js application

### LangGraph Server Deployment

```bash
# Install LangGraph CLI
pip install langgraph

# Start LangGraph server
langgraph dev --port 2025 --tunnel

# For production deployment
langgraph deploy
```

## Environment Setup

### Required Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Keys
OPENAI_API_KEY=your-openai-api-key

# LangGraph Configuration
LANGGRAPH_API_KEY=your-langgraph-api-key
LANGGRAPH_BASE_URL=your-langgraph-url

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Climate Economy Assistant"
```

### Python Dependencies

```bash
# Core scientific computing stack
pip install scipy scikit-learn numpy

# Data validation and API
pip install "pydantic[email]"

# LLM and agent orchestration
pip install langgraph langchain openai

# Database and storage
pip install supabase redis
```

## Security Considerations

- Server components use proper cookie handling for authentication
- API endpoints are secured with authentication checks
- Database access is protected with Row Level Security (RLS)
- Environment variables are properly managed
- TypeScript is used for type safety

### Security Best Practices

1. Always use server-side `createClient()` without parameters
2. Never expose sensitive API keys to the client
3. Validate user permissions for all API endpoints
4. Use Row Level Security policies for database access
5. Implement proper error handling in API routes
