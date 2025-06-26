# Climate Economy Assistant - Backend Structure

This document outlines the consolidated backend structure for the Climate Economy Assistant project.

## Directory Structure

```
backend/
├── agents/
│   ├── base/
│   │   ├── agent_base.py           # Base agent class
│   │   └── semantic_analyzer.py    # Semantic analysis functionality
│   ├── coordinator.py              # Agent coordinator
│   ├── implementations/
│   │   ├── alex.py                 # Alex agent (Climate careers)
│   │   ├── jasmine.py              # Jasmine agent (Environmental justice)
│   │   ├── lauren.py               # Lauren agent (International specialist)
│   │   ├── liv.py                  # Liv agent (Resources specialist) 
│   │   ├── mai.py                  # Mai agent (Crisis support)
│   │   ├── marcus.py               # Marcus agent (Veterans specialist)
│   │   ├── miguel.py               # Miguel agent (Communities specialist)
│   │   └── pendo.py                # Pendo agent (General assistant)
│   ├── langgraph/
│   │   ├── framework.py            # LangGraph integration framework
│   │   └── workflows/              # LangGraph workflows
│   └── utils/
│       └── semantic_router.py      # Semantic routing of messages
├── api/
│   ├── main.py                     # FastAPI main application
│   ├── middleware/
│   │   └── auth.py                 # Authentication middleware
│   └── routes/
│       ├── auth.py                 # Authentication routes
│       ├── conversations.py        # Conversation routes
│       ├── langgraph.py            # LangGraph routes
│       ├── resumes.py              # Resume analysis routes
│       └── users.py                # User routes
├── config/
│   ├── agent_config.py             # Agent configuration
│   └── settings.py                 # Application settings
├── database/
│   ├── migrations/                 # Database migrations
│   ├── redis_adapter.py            # Redis client adapter
│   └── supabase_client.py          # Supabase client
├── models/
│   ├── base.py                     # Base model classes
│   ├── conversation.py             # Conversation models
│   ├── user.py                     # User models
│   ├── agent.py                    # Agent models
│   ├── job.py                      # Job matching models
│   └── resume.py                   # Resume processing models
├── tests/
│   ├── conftest.py                 # Test configuration
│   ├── test_agents.py              # Agent tests
│   ├── test_api_integration.py     # API integration tests
│   ├── test_conversation_streaming.py # Streaming tests
│   ├── test_semantic_routing.py    # Routing tests
│   └── test_tools.py               # Tools tests
├── tools/
│   ├── base_tool.py                # Base tool class
│   ├── job_matching/
│   │   └── match_jobs.py           # Job matching tool
│   ├── resume/
│   │   ├── analyze_resume_for_climate_careers.py  # Resume analysis
│   │   └── process_resume.py       # Resume processing
│   ├── search/
│   │   └── semantic_search.py      # Semantic search tools
│   ├── specialized/
│   │   ├── climate_careers.py      # Climate careers tools
│   │   ├── environmental_justice.py # Environmental justice tools 
│   │   ├── international.py        # International resources tools
│   │   └── veterans.py             # Veterans support tools
│   ├── training/
│   │   └── find_programs.py        # Training program tools
│   └── analytics/
│       └── track_interactions.py   # Analytics tracking tools
└── utils/
    ├── error_handling.py           # Error handling utilities
    ├── helpers.py                  # Helper functions
    ├── logger.py                   # Logging utilities
    ├── memory_manager.py           # Memory management utilities
    └── optimization.py             # Performance optimization utilities
```

## Agent System

The agent system is organized around a coordinator that routes messages to specialized agents:

- **Coordinator**: Routes messages to appropriate agents using semantic analysis
- **Agent Base**: Provides common functionality for all agents
- **Implementations**: Specialized agents for different domains
- **LangGraph Integration**: Enables complex agent workflows and state management

## Tools System

Tools provide agents with specialized capabilities:

- **Base Tool**: Common functionality for all tools
- **Job Matching**: Tools for matching users with climate economy jobs
- **Resume Analysis**: Tools for analyzing resumes and suggesting career paths
- **Search Tools**: Semantic search capabilities
- **Specialized Tools**: Domain-specific tools for veterans, international users, and more
- **Training Tools**: Tools for finding relevant training programs
- **Analytics Tools**: Tools for tracking interactions and user feedback

## API Layer

API endpoints built with FastAPI:

- **Auth**: User authentication and authorization
- **Conversations**: Managing conversations and messages
- **LangGraph**: Endpoints for LangGraph workflows
- **Resumes**: Resume upload and analysis
- **Users**: User profile management

## Database Layer

Database integration:

- **Supabase Client**: PostgreSQL database with Supabase
- **Redis Adapter**: Redis for caching, memory, and real-time analytics

## Configuration

Configuration management:

- **Settings**: Application settings and environment variables
- **Agent Config**: Agent-specific configuration

## Utilities

Helper utilities:

- **Logger**: Centralized logging system
- **Error Handling**: Error handling and reporting
- **Memory Manager**: Management of conversation and agent memory
- **Optimization**: Performance optimization utilities

## Models

Data models:

- **Base**: Base models and shared functionality
- **Conversation**: Conversation and message models
- **User**: User profile models
- **Agent**: Agent state and capability models
- **Job**: Job matching models
- **Resume**: Resume processing models

## Tests

Comprehensive test coverage:

- **Agent Tests**: Testing agent functionality
- **API Integration Tests**: Testing API endpoints
- **Conversation Streaming**: Testing streaming conversation
- **Semantic Routing**: Testing semantic routing
- **Tool Tests**: Testing tool functionality 