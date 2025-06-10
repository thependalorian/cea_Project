# LangGraph Configuration Guide

## Overview

The Climate Economy Assistant uses **LangGraph** for orchestrating multi-agent workflows. This document provides comprehensive configuration details and usage instructions.

## Configuration File: `langgraph.json`

```json
{
  "python_version": "3.11",
  "dependencies": [
    "./backend"
  ],
  "graphs": {
    "climate_supervisor": "./backend/api/workflows/climate_supervisor_workflow.py:climate_supervisor_graph",
    "climate_agent": "./backend/api/workflows/climate_workflow.py:climate_graph",
    "resume_agent": "./backend/api/workflows/resume_workflow.py:resume_graph", 
    "career_agent": "./backend/api/workflows/career_workflow.py:career_graph",
    "interactive_chat": "./backend/api/chat/interactive_chat.py:chat_graph"
  },
  "env": "./backend/.env",
  "http": {
    "app": "./backend/webapp.py:app"
  }
}
```

## Available Workflows

### 1. 🎯 Climate Supervisor (`climate_supervisor`)

**Purpose**: Multi-agent supervisor system for intelligent routing and coordination

**Key Features**:
- **Pendo Supervisor**: Intelligent routing coordinator
- **4 Specialist Agents**: Jasmine, Marcus, Liv, Miguel
- **Smart Handoffs**: Full conversation transfer and task delegation
- **Enhanced State Management**: Complex user profile tracking

**Use Cases**:
- Complex multi-identity user scenarios
- Barrier analysis and removal
- Gateway Cities focus
- Multi-specialist coordination

**Entry Point**: `./backend/api/workflows/climate_supervisor_workflow.py:climate_supervisor_graph`

### 2. 🌍 Climate Agent (`climate_agent`)

**Purpose**: Core climate career guidance and general inquiries

**Key Features**:
- General climate economy information
- Basic career guidance
- Resource recommendations
- Educational pathway suggestions

**Use Cases**:
- General climate career questions
- Industry overview requests
- Basic resource discovery
- Entry-level guidance

**Entry Point**: `./backend/api/workflows/climate_workflow.py:climate_graph`

### 3. 📄 Resume Agent (`resume_agent`)

**Purpose**: Resume processing, analysis, and optimization

**Key Features**:
- Resume parsing and analysis
- Skills extraction
- Climate career relevance assessment
- Improvement recommendations

**Use Cases**:
- Resume upload and analysis
- Skills gap identification
- Career transition planning
- Resume optimization for climate jobs

**Entry Point**: `./backend/api/workflows/resume_workflow.py:resume_graph`

### 4. 🚀 Career Agent (`career_agent`)

**Purpose**: Career pathway planning and progression

**Key Features**:
- Career progression mapping
- Training program recommendations
- Certification guidance
- Long-term career planning

**Use Cases**:
- Career advancement planning
- Skills development roadmaps
- Training program selection
- Professional development guidance

**Entry Point**: `./backend/api/workflows/career_workflow.py:career_graph`

### 5. 💬 Interactive Chat (`interactive_chat`)

**Purpose**: Real-time chat interface for immediate assistance

**Key Features**:
- Real-time conversation handling
- Quick responses
- Basic query resolution
- Escalation to specialized workflows

**Use Cases**:
- Immediate questions
- Quick information lookup
- Initial user engagement
- Workflow routing decisions

**Entry Point**: `./backend/api/chat/interactive_chat.py:chat_graph`

## Development Commands

### Starting LangGraph Studio

```bash
# Start with tunnel (recommended for development)
langgraph dev --tunnel

# Start locally only
langgraph dev

# Start with specific port
langgraph dev --port 8080

# Start with custom host
langgraph dev --host 0.0.0.0 --port 2024
```

### Accessing LangGraph Studio

**Local Access**:
- URL: `http://localhost:2024`
- Studio UI: `http://localhost:2024/studio`
- API Docs: `http://localhost:2024/docs`

**Tunnel Access** (when using `--tunnel`):
- Tunnel URL provided in startup output
- Example: `https://your-tunnel.trycloudflare.com`
- Studio UI: `https://your-tunnel.trycloudflare.com/studio`

## API Usage

### List Available Assistants

```bash
curl -X POST "http://localhost:2024/assistants/search" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response Example**:
```json
[
  {
    "assistant_id": "climate_supervisor",
    "name": "climate_supervisor",
    "graph_id": "climate_supervisor"
  },
  {
    "assistant_id": "climate_agent", 
    "name": "climate_agent",
    "graph_id": "climate_agent"
  }
]
```

### Create Conversation Thread

```bash
curl -X POST "http://localhost:2024/threads" \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "climate_supervisor",
    "metadata": {
      "user_id": "user_123",
      "session_type": "career_guidance"
    }
  }'
```

### Send Message to Thread

```bash
curl -X POST "http://localhost:2024/threads/{thread_id}/runs" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "messages": [
        {
          "role": "user",
          "content": "I am a military veteran interested in clean energy careers"
        }
      ]
    }
  }'
```

## Environment Configuration

### Required Environment Variables

```bash
# Core API Keys
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url  
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key

# Optional Services
TAVILY_API_KEY=your_tavily_api_key
GROQ_API_KEY=your_groq_api_key

# LangGraph Settings
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=climate-economy-assistant
```

### Environment File Location

The configuration points to `./backend/.env` for environment variables. Ensure this file exists and contains all required variables.

## Workflow Selection Guide

### When to Use Each Workflow

#### Use `climate_supervisor` when:
- User has complex background (military + international + EJ interests)
- Multiple specialists needed for comprehensive guidance
- Barrier analysis and removal required
- Gateway Cities focus needed
- Advanced coordination required

#### Use `climate_agent` when:
- General climate economy questions
- Basic career exploration
- Industry overview needed
- Simple resource requests

#### Use `resume_agent` when:
- User uploads resume for analysis
- Skills assessment needed
- Career transition planning
- Resume optimization required

#### Use `career_agent` when:
- Long-term career planning
- Training program selection
- Professional development guidance
- Career advancement planning

#### Use `interactive_chat` when:
- Quick questions
- Initial user engagement
- Real-time assistance needed
- Workflow routing decisions

## Monitoring and Debugging

### Health Check

```bash
curl http://localhost:2024/health
```

### View Workflow Graph

```bash
curl "http://localhost:2024/assistants/{assistant_id}/graph"
```

### Check Workflow Schema

```bash
curl "http://localhost:2024/assistants/{assistant_id}/schemas"
```

### Debug Workflow Execution

```bash
# Enable debug logging
export LOG_LEVEL=DEBUG

# Start with verbose output
langgraph dev --tunnel --verbose
```

## Troubleshooting

### Common Issues

1. **Workflow Not Loading**:
   ```bash
   # Check syntax
   python -c "from api.workflows.climate_supervisor_workflow import climate_supervisor_graph"
   
   # Verify imports
   python -c "import api.workflows.climate_supervisor_workflow"
   ```

2. **Circular Import Errors**:
   ```bash
   # Check import order
   python -c "import sys; print(sys.modules.keys())"
   
   # Test individual modules
   python -c "from core.agents.ma_resource import MAResourceAnalystAgent"
   ```

3. **Environment Variable Issues**:
   ```bash
   # Check environment file
   cat backend/.env
   
   # Verify variables loaded
   python -c "import os; print(os.environ.get('OPENAI_API_KEY', 'NOT_SET'))"
   ```

4. **Port Conflicts**:
   ```bash
   # Kill existing processes
   pkill -f langgraph
   
   # Use different port
   langgraph dev --port 8080
   ```

### Debug Commands

```bash
# Test all workflows
for workflow in climate_supervisor climate_agent resume_agent career_agent interactive_chat; do
  echo "Testing $workflow..."
  python -c "from api.workflows.${workflow}_workflow import ${workflow}_graph; print('✅ $workflow OK')"
done

# Check LangGraph version
pip show langgraph

# Verify dependencies
pip check

# Test Supabase connection
python -c "from adapters.supabase import get_supabase_client; print('✅ Supabase OK')"
```

## Performance Optimization

### Workflow Performance Tips

1. **Lazy Loading**: Agents are created on-demand
2. **Tool Caching**: Frequently used tools are cached
3. **State Optimization**: Minimal state passing between nodes
4. **Async Processing**: All operations are asynchronous

### Scaling Considerations

- **Rate Limiting**: Implement rate limiting for production
- **Connection Pooling**: Use connection pools for database access
- **Caching**: Implement Redis caching for frequent queries
- **Load Balancing**: Use multiple instances for high traffic

## Integration with External Systems

### LangSmith Integration

```bash
# Enable tracing
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY=your_langsmith_key
export LANGCHAIN_PROJECT=climate-economy-assistant
```

### Supabase Integration

All workflows integrate with Supabase for:
- User profile storage
- Conversation history
- Analytics tracking
- Resource management

### OpenAI Integration

All workflows use OpenAI for:
- Language model inference
- Tool calling
- Response generation
- Reasoning capabilities

## Security Considerations

### API Security

- **Authentication**: Implement proper authentication for production
- **Rate Limiting**: Prevent abuse with rate limiting
- **Input Validation**: Validate all user inputs
- **Error Handling**: Don't expose sensitive information in errors

### Data Security

- **Environment Variables**: Never commit API keys to version control
- **Database Security**: Use proper database permissions
- **Encryption**: Encrypt sensitive data at rest and in transit
- **Audit Logging**: Log all significant operations

## Future Enhancements

### Planned Features

1. **Advanced Routing**: ML-based workflow selection
2. **Parallel Processing**: Multi-agent parallel execution
3. **Custom Workflows**: User-defined workflow creation
4. **Real-time Analytics**: Live performance monitoring
5. **A/B Testing**: Workflow performance comparison

### Extension Points

- **New Workflows**: Add domain-specific workflows
- **Custom Agents**: Create specialized agents
- **Tool Integration**: Add external service integrations
- **UI Customization**: Custom LangGraph Studio themes

---

This configuration guide provides comprehensive information for developing, deploying, and maintaining the Climate Economy Assistant LangGraph workflows. 