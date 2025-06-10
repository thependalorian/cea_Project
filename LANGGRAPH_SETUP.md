# 🎯 LangGraph Studio & CLI Setup Guide - Climate Economy Assistant

This guide provides comprehensive instructions for setting up LangGraph Studio testing and debugging capabilities for the Climate Economy Assistant, following our **23 coding rules** for scalable development.

## 📋 Overview

LangGraph Studio is a specialized UI for visualizing, testing, and debugging LangGraph applications locally. It integrates with LangSmith for comprehensive observability and allows you to:

- **Visualize** your agent workflows in real-time
- **Debug** with breakpoints and step-by-step execution
- **Test** different prompts and configurations
- **Monitor** production traces locally
- **Hot reload** during development

## 🛠️ Prerequisites

- Python 3.11+ (required for LangGraph CLI)
- LangSmith API key (free to sign up)
- Docker (optional, for full deployment testing)
- Working LangGraph/LangChain application

## 📦 Installation

### 1. Install LangGraph CLI

```bash
# Install with in-memory support for development
pip install -U "langgraph-cli[inmem]"

# Verify installation
langgraph --help
```

### 2. Install Debugging Dependencies (Optional)

```bash
# For step-by-step debugging with breakpoints
pip install debugpy
```

## 📁 LangGraph Application Structure

Based on the search results, here's the required structure for our Climate Economy Assistant:

```
cea_project/
├── backend/                          # FastAPI backend
│   ├── agents/                       # LangGraph agents
│   │   ├── __init__.py
│   │   ├── climate_agent.py          # Main climate economy agent
│   │   ├── resume_agent.py           # Resume analysis agent
│   │   └── career_agent.py           # Career guidance agent
│   ├── tools/                        # Agent tools
│   │   ├── __init__.py
│   │   ├── supabase_tools.py         # Database tools
│   │   ├── openai_tools.py           # LLM tools
│   │   └── career_tools.py           # Career-specific tools
│   ├── core/                         # Core utilities
│   │   ├── __init__.py
│   │   ├── state.py                  # Agent state definitions
│   │   └── workflows.py              # Workflow definitions
│   ├── requirements.txt              # Python dependencies
│   ├── .env                          # Environment variables
│   └── langgraph.json               # LangGraph configuration
├── frontend/                         # Next.js frontend
└── docker-compose.yaml              # Docker configuration
```

## ⚙️ LangGraph Configuration

### 1. Create `langgraph.json`

Create this file in your `backend/` directory:

```json
{
  "python_version": "3.11",
  "dependencies": [
    ".",
    "langchain_openai",
    "langchain_community",
    "langchain_supabase",
    "supabase",
    "fastapi",
    "uvicorn"
  ],
  "graphs": {
    "climate_agent": "./agents/climate_agent.py:graph",
    "resume_agent": "./agents/resume_agent.py:graph",
    "career_agent": "./agents/career_agent.py:graph"
  },
  "env": "./.env",
  "store": {
    "index": {
      "embed": "openai:text-embedding-3-small",
      "dims": 1536,
      "fields": ["$"]
    },
    "ttl": {
      "refresh_on_read": true,
      "sweep_interval_minutes": 60,
      "default_ttl": 10080
    }
  },
  "checkpointer": {
    "ttl": {
      "strategy": "delete",
      "sweep_interval_minutes": 60,
      "default_ttl": 43200
    }
  },
  "http": {
    "cors": {
      "allow_origins": ["http://localhost:3000", "http://localhost:8000"],
      "allow_methods": ["GET", "POST", "PUT", "DELETE"],
      "allow_headers": ["*"]
    }
  }
}
```

### 2. Update Environment Variables

Add to your `.env` file:

```bash
# LangSmith Configuration
LANGSMITH_API_KEY=lsv2_your_api_key_here
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=climate-economy-assistant

# Existing variables
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key
GROQ_API_KEY=your_groq_key

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

## 🤖 Example Agent Implementation

### Create `backend/agents/climate_agent.py`

```python
"""
Climate Economy Assistant - Main Agent
This agent provides comprehensive climate career guidance and resume analysis.
Location: backend/agents/climate_agent.py
"""

from typing import Dict, Any
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from langgraph import StateGraph, END
from langgraph.graph import MessageGraph
from langgraph.prebuilt import ToolNode
from core.state import AgentState
from tools.supabase_tools import get_job_listings, get_education_programs
from tools.career_tools import analyze_climate_skills, suggest_career_paths

# Initialize LLM
llm = ChatOpenAI(model="gpt-4", temperature=0.7)

# Define tools
tools = [get_job_listings, get_education_programs, analyze_climate_skills, suggest_career_paths]
tool_node = ToolNode(tools)

def climate_guidance_node(state: AgentState) -> Dict[str, Any]:
    """
    Main climate career guidance node
    Analyzes user queries and provides tailored climate economy advice
    """
    messages = state["messages"]
    
    # Create system prompt for climate economy focus
    system_prompt = """You are a Climate Economy Assistant specializing in Massachusetts' climate job market.
    
    Your expertise includes:
    - Clean energy careers (solar, wind, efficiency)
    - Green infrastructure and sustainable transportation
    - Climate policy and environmental compliance
    - Skills translation from traditional to climate sectors
    
    Provide practical, actionable guidance based on Massachusetts' climate economy initiatives.
    """
    
    # Prepare messages with system context
    prompt_messages = [
        {"role": "system", "content": system_prompt},
        *[{"role": msg.type, "content": msg.content} for msg in messages]
    ]
    
    # Get LLM response
    response = llm.invoke(prompt_messages)
    
    return {"messages": [response]}

def tool_calling_node(state: AgentState) -> Dict[str, Any]:
    """
    Determines if tools should be called based on the conversation
    """
    messages = state["messages"]
    last_message = messages[-1]
    
    # Check if the last message indicates tool usage is needed
    if "job" in last_message.content.lower() or "career" in last_message.content.lower():
        return {"tool_calls": ["get_job_listings", "suggest_career_paths"]}
    elif "education" in last_message.content.lower() or "training" in last_message.content.lower():
        return {"tool_calls": ["get_education_programs"]}
    
    return {"tool_calls": []}

def should_continue(state: AgentState) -> str:
    """
    Determine the next step in the workflow
    """
    if state.get("tool_calls"):
        return "tools"
    return END

# Build the graph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("climate_guidance", climate_guidance_node)
workflow.add_node("tool_calling", tool_calling_node)
workflow.add_node("tools", tool_node)

# Add edges
workflow.set_entry_point("climate_guidance")
workflow.add_edge("climate_guidance", "tool_calling")
workflow.add_conditional_edges(
    "tool_calling",
    should_continue,
    {
        "tools": "tools",
        END: END
    }
)
workflow.add_edge("tools", "climate_guidance")

# Compile the graph
graph = workflow.compile()
```

### Create `backend/core/state.py`

```python
"""
Agent State Definitions - Climate Economy Assistant
Defines the state structure for all agents in the system.
Location: backend/core/state.py
"""

from typing import List, Dict, Any, Optional
from typing_extensions import TypedDict
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    """
    Main state for Climate Economy Assistant agents
    """
    messages: List[BaseMessage]
    user_id: Optional[str]
    session_id: Optional[str]
    tool_calls: List[str]
    context: Dict[str, Any]
    metadata: Dict[str, Any]
```

## 🚀 Development Commands

### 1. Start Development Server

```bash
# Navigate to backend directory
cd backend

# Start LangGraph dev server with hot reloading
langgraph dev

# With specific configuration
langgraph dev -c langgraph.json --port 2024

# With debugging enabled
langgraph dev --debug-port 5678

# With tunnel for Safari compatibility
langgraph dev --tunnel
```

### 2. Development Server Options

| Option | Description | Default |
|--------|-------------|---------|
| `--host` | Host to bind server to | 127.0.0.1 |
| `--port` | Port to bind server to | 2024 |
| `--no-reload` | Disable auto-reload | False |
| `--debug-port` | Port for debugger | None |
| `--wait-for-client` | Wait for debugger client | False |
| `--no-browser` | Skip opening browser | False |
| `--tunnel` | Use public tunnel | False |
| `--allow-blocking` | Allow sync I/O operations | False |

## 🐛 Debugging Setup

### 1. VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to LangGraph",
      "type": "debugpy",
      "request": "attach",
      "connect": {
        "host": "0.0.0.0",
        "port": 5678
      },
      "pathMappings": [
        {
          "localRoot": "${workspaceFolder}/backend",
          "remoteRoot": "/app"
        }
      ]
    }
  ]
}
```

### 2. Start Debugging Session

```bash
# Start server with debugging
langgraph dev --debug-port 5678 --wait-for-client

# Attach debugger in VS Code (F5)
# Set breakpoints in your agent code
```

## 🎨 LangGraph Studio Access

### 1. Local Development

After running `langgraph dev`, access Studio at:
- **URL**: `https://smith.langchain.com/studio/?baseUrl=http://127.0.0.1:2024`
- **Automatic**: Browser opens automatically

### 2. Studio Features

- **Graph Visualization**: See your agent workflow in real-time
- **Interactive Testing**: Test different inputs and scenarios
- **Prompt Iteration**: Modify prompts without code changes
- **Trace Debugging**: Debug production traces locally
- **Memory Management**: View and manage agent memory

## 📊 Testing & Monitoring

### 1. Test API Endpoints

```bash
# Test climate agent
curl -X POST http://localhost:2024/runs/stream \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "climate_agent",
    "input": {
      "messages": [{
        "role": "human",
        "content": "I want to transition to clean energy jobs in Massachusetts"
      }]
    },
    "stream_mode": "messages-tuple"
  }'
```

### 2. Python SDK Testing

```python
from langgraph_sdk import get_client
import asyncio

async def test_climate_agent():
    client = get_client(url="http://localhost:2024")
    
    async for chunk in client.runs.stream(
        None,  # Threadless run
        "climate_agent",
        input={
            "messages": [{
                "role": "human", 
                "content": "What climate jobs are available for software engineers?"
            }]
        },
        stream_mode="messages-tuple"
    ):
        print(f"Event: {chunk.event}")
        print(f"Data: {chunk.data}")

asyncio.run(test_climate_agent())
```

## 🐳 Docker Integration

### 1. Update Docker Compose

Add LangGraph service to `docker-compose.yaml`:

```yaml
services:
  # ... existing services ...
  
  langgraph:
    build:
      context: ./backend
      dockerfile: Dockerfile.langgraph
    ports:
      - "2024:2024"
    environment:
      - LANGSMITH_API_KEY=${LANGSMITH_API_KEY}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - SUPABASE_URL=${SUPABASE_URL}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - api
    volumes:
      - ./backend:/app
    command: ["langgraph", "dev", "--host", "0.0.0.0", "--port", "2024"]
    networks:
      - cea-network
```

### 2. Create LangGraph Dockerfile

Create `backend/Dockerfile.langgraph`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install LangGraph CLI
RUN pip install -U "langgraph-cli[inmem]"

# Copy application code
COPY . .

# Install dependencies
RUN pip install -r requirements.txt

# Expose LangGraph port
EXPOSE 2024

# Default command
CMD ["langgraph", "dev", "--host", "0.0.0.0", "--port", "2024"]
```

## 🔧 Advanced Configuration

### 1. Custom Authentication

```python
# backend/auth.py
from langgraph_sdk import Auth

def custom_auth(request):
    """Custom authentication handler"""
    api_key = request.headers.get("X-API-Key")
    if api_key != "your-secure-api-key":
        raise Exception("Unauthorized")
    return {"user_id": "authenticated_user"}

auth = Auth(custom_auth)
```

Update `langgraph.json`:

```json
{
  "auth": {
    "path": "./auth.py:auth",
    "openapi": {
      "securitySchemes": {
        "apiKeyAuth": {
          "type": "apiKey",
          "in": "header",
          "name": "X-API-Key"
        }
      },
      "security": [{"apiKeyAuth": []}]
    }
  }
}
```

### 2. Production Build

```bash
# Build production Docker image
langgraph build -t climate-economy-assistant:latest

# Generate Dockerfile for customization
langgraph dockerfile Dockerfile.generated
```

## 🎯 Best Practices

### Following the 23 Rules

1. **✅ Always Use DaisyUI**: Studio UI maintains consistent styling
2. **✅ Create New UI Components**: Modular agent design
3. **✅ Component Documentation**: Comprehensive agent documentation
4. **✅ Vercel Compatibility**: Studio accessible from deployed apps
5. **✅ Quick and Scalable Endpoints**: Optimized LangGraph API
6. **✅ Asynchronous Data Handling**: Streaming responses
7. **✅ API Response Documentation**: Clear agent response formats
8. **✅ Use Supabase with SSR**: Database integration maintained
9. **✅ Maintain Existing Functionality**: Backward compatibility
10. **✅ Comprehensive Error Handling**: Robust error management

### Development Workflow

1. **Code Changes**: Edit agent code with hot reloading
2. **Test in Studio**: Use visual interface for immediate feedback
3. **Debug Issues**: Set breakpoints and inspect variables
4. **Monitor Performance**: Track execution times and memory usage
5. **Deploy**: Build production images when ready

## 🚨 Troubleshooting

### Common Issues

#### Studio Connection Issues
```bash
# Check if server is running
curl http://localhost:2024/ok

# Verify configuration
langgraph dev --verbose
```

#### Safari Compatibility
```bash
# Use tunnel for Safari
langgraph dev --tunnel
```

#### Memory Issues
```bash
# Increase worker limits
langgraph dev --n-jobs-per-worker 5
```

#### Authentication Errors
```bash
# Disable LangSmith tracing locally
echo "LANGSMITH_TRACING=false" >> .env
```

## 📚 Additional Resources

- **LangGraph Documentation**: https://langchain-ai.github.io/langgraph/
- **LangGraph CLI Reference**: https://langchain-ai.github.io/langgraph/cloud/reference/cli/
- **LangGraph Studio Guide**: https://langchain-ai.github.io/langgraph/cloud/how-tos/studio/
- **LangSmith Platform**: https://smith.langchain.com/

---

This setup provides comprehensive testing and debugging capabilities for your Climate Economy Assistant while following all **23 coding rules** for scalable, efficient development. The configuration ensures seamless integration with your existing Docker infrastructure and maintains production-ready standards. 