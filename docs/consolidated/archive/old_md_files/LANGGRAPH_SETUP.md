# 🎯 LangGraph Studio & CLI Setup Guide - Climate Economy Assistant V1

This guide provides comprehensive instructions for setting up LangGraph Studio testing and debugging capabilities for the Climate Economy Assistant V1, following our **23 coding rules** for scalable development.

## 📋 Overview

LangGraph Studio is a specialized UI for visualizing, testing, and debugging LangGraph applications locally. It integrates with LangSmith for comprehensive observability and allows you to:

- **Visualize** your AI agent workflows in real-time
- **Debug** with breakpoints and step-by-step execution
- **Test** different prompts and configurations
- **Monitor** production traces locally
- **Hot reload** during development
- **Enhanced Auth Integration** with memory management

## 🛠️ Prerequisites

- Python 3.11+ (required for LangGraph CLI)
- LangSmith API key (free to sign up)
- Docker (for full deployment testing)
- Working BackendV1 with LangGraph/LangChain application
- Enhanced Auth Workflow configured

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

## 📁 BackendV1 Application Structure

Based on the current implementation, here's the structure for our Climate Economy Assistant V1:

```
cea_project/
├── backendv1/                        # Enhanced FastAPI backend
│   ├── main.py                       # FastAPI entry point
│   ├── webapp.py                     # LangGraph webapp integration
│   ├── langgraph.json                # LangGraph configuration
│   ├── requirements.txt              # Python dependencies
│   ├── agents/                       # AI agents
│   │   ├── __init__.py
│   │   ├── pendo_agent.py            # Supervisor agent
│   │   ├── marcus_agent.py           # Career guidance agent
│   │   ├── liv_agent.py              # Job search agent
│   │   ├── mai_agent.py              # Skills assessment agent
│   │   ├── lauren_agent.py           # Partner relations agent
│   │   ├── miguel_agent.py           # Education programs agent
│   │   ├── jasmine_agent.py          # Climate knowledge agent
│   │   └── alex_agent.py             # Empathy & crisis support agent
│   ├── workflows/                    # LangGraph workflows
│   │   ├── __init__.py
│   │   ├── climate_supervisor.py     # Main supervisor workflow
│   │   ├── pendo_supervisor.py       # Pendo supervisor workflow
│   │   ├── empathy_workflow.py       # Alex empathy workflow
│   │   ├── resume_workflow.py        # Resume analysis workflow
│   │   └── career_workflow.py        # Career guidance workflow
│   ├── auth/                         # Enhanced authentication
│   │   ├── __init__.py
│   │   └── auth_workflow.py          # Enhanced auth with memory
│   ├── adapters/                     # Database adapters
│   │   ├── __init__.py
│   │   ├── supabase_adapter.py       # Supabase integration
│   │   ├── database_adapter.py       # Database utilities
│   │   └── auth_adapter.py           # Auth adapter
│   ├── chat/                         # Interactive chat
│   │   ├── __init__.py
│   │   └── interactive_chat.py       # Chat workflow
│   ├── models/                       # Data models
│   │   ├── __init__.py
│   │   └── agent_models.py           # Agent response models
│   ├── config/                       # Configuration
│   │   ├── __init__.py
│   │   └── settings.py               # Application settings
│   └── utils/                        # Utilities
│       ├── __init__.py
│       ├── logger.py                 # Logging utilities
│       └── database_utils.py         # Database utilities
├── langgraph.json                    # Root LangGraph configuration
├── vercel.json                       # Vercel deployment config
├── docker-compose.yaml               # Docker configuration
└── .env                              # Environment variables
```

## ⚙️ LangGraph Configuration

### 1. Root `langgraph.json`

The root configuration file:

```json
{
  "python_version": "3.11",
  "dependencies": [
    "./backendv1"
  ],
  "graphs": {
    "climate_supervisor": "./backendv1/workflows/climate_supervisor.py:climate_supervisor_graph",
    "pendo_supervisor": "./backendv1/workflows/pendo_supervisor.py:pendo_supervisor_graph",
    "empathy_workflow": "./backendv1/workflows/empathy_workflow.py:empathy_graph",
    "job_workflow": "./backendv1/workflows/job_workflow.py:job_recommendation_graph",
    "interactive_chat": "./backendv1/chat/interactive_chat.py:chat_graph"
  },
  "env": "./backend/.env",
  "http": {
    "host": "0.0.0.0",
    "port": 8123
  },
  "webapp": "./backendv1/webapp.py:cea_app_v1"
}
```

### 2. BackendV1 `langgraph.json`

The BackendV1 specific configuration:

```json
{
  "name": "climate-economy-assistant",
  "version": "1.0.0", 
  "description": "Climate Economy Assistant Backend powered by LangGraph",
  "python_version": "3.11",
  "dependencies": [
    ".",
    "langgraph>=0.4.8",
    "langchain_openai",
    "langchain_community", 
    "langchain_core",
    "fastapi>=0.100.0",
    "pydantic>=2.0.0",
    "httpx>=0.25.0",
    "redis>=5.0.0",
    "aiofiles>=0.8.0",
    "sse-starlette<2.2.0"
  ],
  "graphs": {
    "climate_supervisor": "./workflows/climate_supervisor.py:climate_supervisor_graph",
    "empathy_workflow": "./workflows/empathy_workflow.py:graph",
    "resume_workflow": "./workflows/resume_workflow.py:graph",
    "career_workflow": "./workflows/career_workflow.py:graph",
    "interactive_chat": "./chat/interactive_chat.py:graph"
  },
  "env": ".env"
}
```

### 3. Update Environment Variables

Add to your `.env` file:

```bash
# LangSmith Configuration
LANGSMITH_API_KEY=lsv2_your_api_key_here
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=climate-economy-assistant-v1

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
SUPABASE_ANON_KEY=your_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o

# Groq Configuration (Optional)
GROQ_API_KEY=your_groq_key

# Anthropic Configuration (Optional)
ANTHROPIC_API_KEY=your_anthropic_key

# Tavily Search (Optional)
TAVILY_API_KEY=your_tavily_key

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_jwt_secret_256_bit
ENCRYPTION_KEY=your_encryption_key_256_bit

# LangGraph Configuration
LANGGRAPH_CONFIG_PATH=/app/langgraph.json
LANGGRAPH_API_HOST=0.0.0.0
LANGGRAPH_API_PORT=8123
```

## 🤖 Enhanced Agent Implementation

### Climate Supervisor Agent

```python
"""
Climate Economy Assistant - Enhanced Supervisor Agent
This agent orchestrates all climate career guidance with enhanced auth integration.
Location: backendv1/workflows/climate_supervisor.py
"""

from typing import Dict, Any, List
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_openai import ChatOpenAI
from langgraph import StateGraph, END
from langgraph.graph import MessageGraph
from langgraph.prebuilt import ToolNode
from backendv1.models.agent_models import AgentState
from backendv1.adapters.supabase_adapter import SupabaseAdapter
from backendv1.auth.auth_workflow import AuthWorkflow

# Initialize enhanced components
llm = ChatOpenAI(model="gpt-4o", temperature=0.7)
supabase_adapter = SupabaseAdapter()
auth_workflow = AuthWorkflow()

def climate_supervisor_node(state: AgentState) -> Dict[str, Any]:
    """
    Enhanced climate supervisor with auth context integration
    """
    messages = state["messages"]
    user_id = state.get("user_id")
    
    # Get enhanced user context if available
    user_context = ""
    if user_id:
        try:
            context_result = await auth_workflow.get_session_context_for_ai(
                user_id, "climate_career_guidance"
            )
            if context_result.get("success"):
                user_context = context_result["formatted_context"]
        except Exception as e:
            logger.warning(f"Could not retrieve user context: {e}")
    
    # Enhanced system prompt with user context
    system_prompt = f"""You are Pendo, the Climate Economy Assistant Supervisor specializing in Massachusetts' climate job market.

    Your expertise includes:
    - Clean energy careers (solar, wind, efficiency)
    - Green infrastructure and sustainable transportation
    - Climate policy and environmental compliance
    - Skills translation from traditional to climate sectors
    - Enhanced user context integration

    {user_context}

    Provide practical, actionable guidance based on Massachusetts' climate economy initiatives and the user's specific context.
    """
    
    # Prepare messages with enhanced context
    prompt_messages = [
        {"role": "system", "content": system_prompt},
        *[{"role": msg.type, "content": msg.content} for msg in messages]
    ]
    
    # Get LLM response
    response = llm.invoke(prompt_messages)
    
    # Store interaction in memory if user_id available
    if user_id:
        try:
            await auth_workflow.memory_manager.store_user_context(
                user_id, {
                    "interaction_type": "climate_guidance",
                    "query": messages[-1].content if messages else "",
                    "response_summary": response.content[:200] + "..." if len(response.content) > 200 else response.content,
                    "timestamp": datetime.now().isoformat()
                }
            )
        except Exception as e:
            logger.warning(f"Could not store interaction: {e}")
    
    return {"messages": [response]}

# Build the enhanced graph
workflow = StateGraph(AgentState)
workflow.add_node("climate_supervisor", climate_supervisor_node)
workflow.set_entry_point("climate_supervisor")
workflow.add_edge("climate_supervisor", END)

# Compile the graph
climate_supervisor_graph = workflow.compile()
```

### Enhanced State Definition

```python
"""
Enhanced Agent State Definitions - Climate Economy Assistant V1
Defines the state structure for all agents with auth integration.
Location: backendv1/models/agent_models.py
"""

from typing import List, Dict, Any, Optional
from typing_extensions import TypedDict
from langchain_core.messages import BaseMessage

class AgentState(TypedDict):
    """
    Enhanced state for Climate Economy Assistant V1 agents
    """
    messages: List[BaseMessage]
    user_id: Optional[str]
    session_id: Optional[str]
    user_type: Optional[str]  # job_seeker, partner, admin
    user_context: Dict[str, Any]
    tool_calls: List[str]
    context: Dict[str, Any]
    metadata: Dict[str, Any]
    auth_enhanced: bool
    memory_enabled: bool
```

## 🚀 Development Commands V1

### 1. Start Development Server

```bash
# Navigate to project root
cd cea_project

# Start LangGraph dev server with BackendV1
langgraph dev --config langgraph.json

# With specific port
langgraph dev --port 8123

# With debugging enabled
langgraph dev --debug-port 5678

# With tunnel for external access
langgraph dev --tunnel
```

### 2. Docker Development

```bash
# Start with supervisor workflow
docker compose --profile supervisor up -d

# View logs
docker compose logs -f supervisor

# Access LangGraph Studio
open http://localhost:8123
```

### 3. Development Server Options

| Option | Description | Default |
|--------|-------------|---------|
| `--host` | Host to bind server to | 0.0.0.0 |
| `--port` | Port to bind server to | 8123 |
| `--config` | LangGraph config file | langgraph.json |
| `--no-reload` | Disable auto-reload | False |
| `--debug-port` | Port for debugger | None |
| `--wait-for-client` | Wait for debugger client | False |
| `--no-browser` | Skip opening browser | False |
| `--tunnel` | Use public tunnel | False |

## 🐛 Debugging Setup V1

### 1. VS Code Debugging

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Attach to LangGraph V1",
      "type": "debugpy",
      "request": "attach",
      "connect": {
        "host": "0.0.0.0",
        "port": 5678
      },
      "pathMappings": [
        {
          "localRoot": "${workspaceFolder}/backendv1",
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

# Or with Docker
docker compose --profile supervisor up -d
docker compose exec supervisor langgraph dev --debug-port 5678

# Attach debugger in VS Code (F5)
# Set breakpoints in your agent code
```

## 🎨 LangGraph Studio Access V1

### 1. Local Development

After running `langgraph dev`, access Studio at:
- **URL**: `http://localhost:8123`
- **Automatic**: Browser opens automatically

### 2. Docker Access

```bash
# Start supervisor mode
docker compose --profile supervisor up -d

# Access Studio
open http://localhost:8123

# Or with port forwarding
docker compose exec supervisor langgraph dev --tunnel
```

### 3. Studio Features V1

- **Enhanced Graph Visualization**: See AI agent workflows with auth context
- **Interactive Testing**: Test with real user contexts
- **Prompt Iteration**: Modify prompts with user-specific data
- **Trace Debugging**: Debug production traces with enhanced auth
- **Memory Management**: View and manage user context and memory

## 📊 Testing & Monitoring V1

### 1. Test Enhanced API Endpoints

```bash
# Test climate supervisor with auth context
curl -X POST http://localhost:8123/runs/stream \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "climate_supervisor",
    "input": {
      "messages": [{
        "role": "human",
        "content": "I want to transition to clean energy jobs in Massachusetts"
      }],
      "user_id": "test-user-id",
      "user_type": "job_seeker"
    },
    "stream_mode": "messages-tuple"
  }'

# Test enhanced auth workflow
curl -X POST http://localhost:8000/api/v1/auth/enhance-session \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-id",
    "email": "test@example.com",
    "access_token": "test-token"
  }'
```

### 2. Python SDK Testing V1

```python
from langgraph_sdk import get_client
import asyncio

async def test_enhanced_climate_agent():
    client = get_client(url="http://localhost:8123")
    
    async for chunk in client.runs.stream(
        None,  # Threadless run
        "climate_supervisor",
        input={
            "messages": [{
                "role": "human", 
                "content": "What climate jobs are available for software engineers?"
            }],
            "user_id": "test-user-123",
            "user_type": "job_seeker",
            "auth_enhanced": True
        },
        stream_mode="messages-tuple"
    ):
        print(f"Event: {chunk.event}")
        print(f"Data: {chunk.data}")

asyncio.run(test_enhanced_climate_agent())
```

## 🐳 Docker Integration V1

### 1. Enhanced Docker Compose

The current `docker-compose.yaml` includes:

```yaml
services:
  supervisor:
    build: 
      context: .
      dockerfile: Dockerfile
    profiles: ["supervisor", "dev-supervisor"]
    ports:
      - "${API_PORT:-8000}:8000"
      - "${LANGGRAPH_PORT:-8123}:8123"
    environment:
      - STARTUP_MODE=supervisor
      - LANGGRAPH_CONFIG_PATH=/app/langgraph.json
      - LANGGRAPH_API_PORT=8123
      - LANGGRAPH_API_HOST=0.0.0.0
    command: ["supervisor"]
```

### 2. Enhanced Dockerfile

The current `Dockerfile` includes:

```dockerfile
# Enhanced entrypoint for supervisor mode
COPY <<EOF /app/entrypoint.sh
#!/bin/bash
case "\$1" in
    "supervisor")
        echo "🎯 Starting in Supervisor Workflow mode..."
        langgraph serve --host 0.0.0.0 --port 8123 --config ./langgraph.json &
        uvicorn webapp:cea_app_v1 --host 0.0.0.0 --port 8000 --workers 1
        ;;
    *)
        uvicorn webapp:cea_app_v1 --host 0.0.0.0 --port 8000 --workers 4
        ;;
esac
EOF
```

## 🔧 Advanced Configuration V1

### 1. Enhanced Authentication Integration

```python
# backendv1/auth/langgraph_auth.py
from langgraph_sdk import Auth
from backendv1.auth.auth_workflow import AuthWorkflow

auth_workflow = AuthWorkflow()

async def enhanced_auth(request):
    """Enhanced authentication with user context"""
    api_key = request.headers.get("X-API-Key")
    user_token = request.headers.get("Authorization")
    
    if not api_key and not user_token:
        raise Exception("Unauthorized")
    
    # Enhanced session validation
    if user_token:
        user_data = await auth_workflow.validate_session_token(user_token)
        if user_data:
            return {
                "user_id": user_data["user_id"],
                "user_type": user_data["user_type"],
                "auth_enhanced": True
            }
    
    return {"user_id": "anonymous", "auth_enhanced": False}

auth = Auth(enhanced_auth)
```

### 2. Production Build V1

```bash
# Build production Docker image with LangGraph
docker compose build supervisor

# Or use LangGraph CLI
langgraph build -t climate-economy-assistant-v1:latest

# Generate enhanced Dockerfile
langgraph dockerfile Dockerfile.langgraph
```

## 🎯 Best Practices V1

### Following the 23 Rules

1. **✅ Always Use DaisyUI**: Studio UI maintains consistent styling
2. **✅ Create New UI Components**: Modular AI agent design
3. **✅ Component Documentation**: Comprehensive agent documentation
4. **✅ Vercel Compatibility**: Studio accessible from deployed apps
5. **✅ Quick and Scalable Endpoints**: Optimized LangGraph API
6. **✅ Asynchronous Data Handling**: Streaming AI responses
7. **✅ API Response Documentation**: Clear agent response formats
8. **✅ Use Supabase with SSR**: Enhanced database integration
9. **✅ Maintain Existing Functionality**: Backward compatibility
10. **✅ Comprehensive Error Handling**: Robust AI error management

### Development Workflow V1

1. **Code Changes**: Edit BackendV1 agent code with hot reloading
2. **Test in Studio**: Use visual interface for immediate feedback
3. **Debug Issues**: Set breakpoints and inspect AI agent variables
4. **Monitor Performance**: Track execution times and memory usage
5. **Enhanced Auth Testing**: Test with real user contexts
6. **Deploy**: Build production images when ready

## 🚨 Troubleshooting V1

### Common Issues

#### Studio Connection Issues
```bash
# Check if server is running
curl http://localhost:8123/health

# Verify BackendV1 configuration
cat backendv1/langgraph.json

# Check Docker logs
docker compose logs supervisor
```

#### Enhanced Auth Issues
```bash
# Test auth workflow
python -c "
from backendv1.auth.auth_workflow import AuthWorkflow
auth = AuthWorkflow()
print('Auth workflow initialized:', auth is not None)
"

# Check database connection
docker compose exec supervisor python -c "
from backendv1.adapters.supabase_adapter import SupabaseAdapter
adapter = SupabaseAdapter()
print('Database connected:', adapter.test_connection())
"
```

#### Memory Issues with AI Agents
```bash
# Check Redis connection
docker compose exec redis redis-cli ping

# Monitor memory usage
docker stats supervisor

# Check AI agent memory
docker compose exec supervisor python -c "
import psutil
print(f'Memory usage: {psutil.virtual_memory().percent}%')
"
```

## 📚 Additional Resources V1

- **BackendV1 Documentation**: `backendv1/README.md`
- **Enhanced Auth Guide**: `ENHANCED_AUTH_WORKFLOW_SUMMARY.md`
- **Database Documentation**: `DATABASE_CONSOLIDATED_CURRENT_STATE.md`
- **Docker Deployment**: `DOCKER_DEPLOYMENT.md`
- **LangGraph Documentation**: https://langchain-ai.github.io/langgraph/
- **LangGraph CLI Reference**: https://langchain-ai.github.io/langgraph/cloud/reference/cli/
- **LangGraph Studio Guide**: https://langchain-ai.github.io/langgraph/cloud/how-tos/studio/

---

This enhanced setup provides comprehensive testing and debugging capabilities for your Climate Economy Assistant V1 with AI agent orchestration, enhanced authentication, and memory management while following all **23 coding rules** for scalable, efficient development. The configuration ensures seamless integration with your existing Docker infrastructure and maintains production-ready standards. 