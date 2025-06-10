# Climate Economy Assistant Backend

This directory contains the reorganized backend code for the Climate Economy Assistant project, featuring a sophisticated **multi-agent supervisor system** that addresses the **39% information gap crisis** affecting clean energy workers in Massachusetts.

## 🎯 Mission

Connect users to the **38,100 clean energy jobs pipeline by 2030** through intelligent agent coordination and comprehensive career guidance.

## 🏗️ Architecture Overview

### Multi-Agent Supervisor System

The system features **5 specialized workflows** orchestrated through LangGraph:

1. **🎯 Climate Supervisor** - Intelligent routing and multi-agent coordination
2. **🌍 Climate Agent** - Core climate career guidance  
3. **📄 Resume Agent** - Resume processing and analysis
4. **🚀 Career Agent** - Career pathway planning
5. **💬 Interactive Chat** - Real-time chat interface

## Directory Structure

```
backend/
├── api/                    # API layer
│   ├── endpoints/          # Route handlers (grouped by domain)
│   │   ├── chat.py         # Chat endpoints
│   │   ├── resume.py       # Resume processing endpoints
│   │   └── more endpoints to come...
│   ├── workflows/          # LangGraph Workflows
│   │   ├── climate_supervisor_workflow.py  # 🆕 Supervisor System
│   │   ├── climate_workflow.py
│   │   ├── resume_workflow.py
│   │   └── career_workflow.py
│   ├── chat/               # Interactive chat workflows
│   │   └── interactive_chat.py
│   └── dependencies.py     # Shared API dependencies
├── core/                   # Domain logic
│   ├── agents/             # Agent implementations
│   │   ├── base.py         # Base agent class & supervisor
│   │   ├── ma_resource.py  # Jasmine - MA Resource Analyst
│   │   ├── veteran.py      # Marcus - Veterans Specialist
│   │   ├── international.py # Liv - International Specialist
│   │   ├── environmental.py # Miguel - Environmental Justice
│   │   └── langgraph_agents.py # LangGraph integrations
│   ├── workflows/          # Legacy workflow components
│   ├── prompts/            # Prompt templates
│   ├── config.py           # Configuration settings
│   ├── models.py           # Data models
│   └── analytics.py        # Analytics tracking
├── tools/                  # Tool implementations
│   ├── resume.py           # Resume analysis tools
│   ├── search.py           # Resource search tools
│   ├── jobs.py             # Job matching tools
│   ├── web.py              # Web search tools
│   ├── credentials.py      # Credential evaluation
│   ├── skills.py           # Skills translation
│   ├── communities.py      # Community resources
│   ├── training.py         # Training recommendations
│   ├── analytics.py        # Analytics tools
│   └── matching.py         # Matching algorithms
├── adapters/               # External services
│   ├── supabase.py         # Database integration
│   ├── models.py           # LLM model adapters
│   ├── openai.py           # OpenAI integration
│   └── storage.py          # File storage
├── webapp.py               # FastAPI application
├── main.py                 # Application entry point
└── langgraph.json          # LangGraph configuration
```

## 🚀 Quick Start

### Running LangGraph Studio (Recommended)

```bash
# Start LangGraph development server with tunnel
langgraph dev --tunnel

# Access via tunnel URL (provided in output)
# Example: https://your-tunnel.trycloudflare.com
```

### Running Traditional FastAPI

```bash
cd backend
python -m uvicorn main:app --reload
```

## 🌟 Climate Supervisor Workflow

### Overview

The **Climate Supervisor Workflow** is our flagship multi-agent system that intelligently routes users to specialized agents based on their profiles and needs.

### Agents

#### 🎯 Pendo - Enhanced Supervisor Agent
- **Role**: Lead Program Manager and intelligent routing coordinator
- **Capabilities**: Smart routing, multi-identity recognition, task delegation
- **Focus**: Barrier analysis and removal strategies

#### 👩‍💼 Jasmine - MA Resource Analyst  
- **Expertise**: Resume analysis, job matching, career pathway optimization
- **Tools**: Resume processing, skills extraction, job matching, training recommendations
- **Mission**: Connect users to 38,100 clean energy jobs through data-driven analysis

#### 🎖️ Marcus - Veterans Specialist
- **Expertise**: Military skill translation, veteran-specific support
- **Tools**: MOS translation, veteran resources, military experience valorization
- **Mission**: Help veterans transition to Massachusetts clean energy careers

#### 🌍 Liv - International Specialist
- **Expertise**: Credential evaluation, visa pathways, international professional integration
- **Tools**: Credential evaluation, visa guidance, professional licensing assistance
- **Mission**: Support international professionals in Massachusetts climate economy

#### 🌱 Miguel - Environmental Justice Specialist
- **Expertise**: Environmental justice advocacy, community organizing, Gateway Cities focus
- **Tools**: EJ community connections, Gateway Cities mapping, multilingual resources
- **Mission**: Ensure equitable access to clean energy careers in underserved communities

### Gateway Cities Focus

**Target Geographic Areas**:
- **Brockton**: Environmental justice initiatives
- **Fall River/New Bedford**: Maritime renewable transition  
- **Lowell/Lawrence**: Manufacturing to clean energy pivot

**Target Demographics**:
- **47% women** in clean energy workforce
- **50% Black respondents** facing information gaps
- **72% Hispanic/Latino** with geographic barriers

## 📊 LangGraph Configuration

### Available Workflows

```json
{
  "graphs": {
    "climate_supervisor": "Multi-agent supervisor system",
    "climate_agent": "Core climate career guidance",
    "resume_agent": "Resume processing and analysis", 
    "career_agent": "Career pathway planning",
    "interactive_chat": "Real-time chat interface"
  }
}
```

### Accessing Workflows

**LangGraph Studio UI**:
- Navigate to tunnel URL + `/studio`
- Select desired workflow
- Test with sample inputs

**API Endpoints**:
```bash
# List all assistants
curl -X POST "http://localhost:2024/assistants/search" \
  -H "Content-Type: application/json" -d '{}'

# Create thread for climate_supervisor
curl -X POST "http://localhost:2024/threads" \
  -H "Content-Type: application/json" \
  -d '{"assistant_id": "climate_supervisor"}'
```

## 🔧 Environment Variables

The application requires the following environment variables:

```bash
# Core API Keys
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_key

# Optional Services
TAVILY_API_KEY=your_tavily_api_key
GROQ_API_KEY=your_groq_api_key

# Application Settings
ENVIRONMENT=development
LOG_LEVEL=INFO
```

## 🛠️ Development

### Adding New Specialists

1. **Create Agent Handler**:
   ```python
   async def new_specialist_handler(state: ClimateAgentState) -> ClimateAgentState:
       # Implementation
   ```

2. **Define Tool Collection**:
   ```python
   NEW_SPECIALIST_TOOLS = [tool1, tool2, tool3]
   ```

3. **Add Handoff Tools**:
   ```python
   assign_to_new_specialist = create_handoff_tool(
       agent_name="new_specialist",
       specialist_name="New Specialist",
       description="Transfer to new specialist for specific expertise"
   )
   ```

4. **Update Workflow Graph**:
   ```python
   workflow.add_node("new_specialist", new_specialist_handler)
   ```

### Testing Workflows

```bash
# Test workflow import
python -c "from api.workflows.climate_supervisor_workflow import climate_supervisor_graph; print('✅ Success')"

# Run comprehensive tests
python -m pytest tests/ -v

# Test specific agent
python test_agents_simple.py
```

## 📈 Analytics & Monitoring

### Specialist Interaction Tracking

```python
await log_specialist_interaction(
    specialist_type="jasmine",
    user_id=user_id,
    conversation_id=conversation_id,
    query=user_message,
    tools_used=tools_used,
    confidence=confidence_score
)
```

### Conversation Analytics

- **User journey mapping** across specialists
- **Tool usage patterns** and effectiveness  
- **Barrier identification** and resolution tracking
- **Success metrics** for job placements

## 🔍 Troubleshooting

### Common Issues

1. **Circular Import Errors**:
   ```bash
   # Symptom: ImportError during workflow loading
   # Solution: Check import order in __init__.py files
   ```

2. **LangGraph Studio Not Loading Workflows**:
   ```bash
   # Check workflow syntax
   python -c "from api.workflows.climate_supervisor_workflow import climate_supervisor_graph"
   
   # Restart LangGraph
   pkill -f langgraph && langgraph dev --tunnel
   ```

3. **Agent Creation Failures**:
   ```bash
   # Check environment variables
   echo $OPENAI_API_KEY
   
   # Verify LangGraph version
   pip show langgraph
   ```

### Debug Commands

```bash
# Check LangGraph status
curl http://localhost:2024/docs

# List loaded assistants  
curl -X POST "http://localhost:2024/assistants/search" \
  -H "Content-Type: application/json" -d '{}'

# Test Supabase connection
python -c "from adapters.supabase import get_supabase_client; print('✅ Connected')"
```

## 📚 Documentation

### Comprehensive Guides

- **[Climate Supervisor Workflow Documentation](./CLIMATE_SUPERVISOR_WORKFLOW_DOCUMENTATION.md)** - Complete technical documentation
- **[Agent Implementation Guide](./core/agents/README.md)** - How to create and modify agents
- **[Tools Integration Guide](./tools/README.md)** - Adding and configuring tools
- **[API Reference](./api/README.md)** - Endpoint documentation

### Quick References

- **[LangGraph Configuration](./langgraph.json)** - Workflow definitions
- **[Environment Setup](./.env.example)** - Required environment variables
- **[Database Schema](./models.py)** - Data models and relationships

## 🌟 Features

### Core Capabilities

- **🤖 Multi-Agent System**: Specialized agents for different user backgrounds and needs
- **🔀 Intelligent Routing**: Smart assignment based on user profiles and barriers
- **🔧 LangGraph Integration**: Advanced orchestration using LangGraph supervisor pattern
- **🗄️ Supabase Integration**: Secure storage and retrieval of user data
- **📄 Resume Analysis**: NLP-based resume analysis for career recommendations
- **🔍 Web Search**: Tavily-powered web search for up-to-date climate economy information
- **👥 Human-in-the-Loop**: Support for human expert intervention in complex cases
- **📊 Analytics Tracking**: Comprehensive monitoring and success metrics

### Advanced Features

- **🎯 Task Delegation**: Specific task assignment with detailed instructions
- **🔄 Multi-Specialist Coordination**: Complex scenarios requiring multiple agents
- **🏙️ Gateway Cities Focus**: Targeted support for underserved communities
- **📈 Barrier Analysis**: Systematic identification and removal of career obstacles
- **🔒 Fallback Protection**: Graceful degradation when services unavailable

## 🚀 Deployment

### Production Considerations

- **Rate limiting** on tool calls
- **Authentication** for sensitive operations  
- **Monitoring** and analytics integration
- **Scaling** for high-volume usage
- **Security** for user data protection

### Environment Setup

```bash
# Production environment variables
ENVIRONMENT=production
OPENAI_API_KEY=prod_key
SUPABASE_URL=prod_url
SUPABASE_SERVICE_ROLE_KEY=prod_key
```

## 🤝 Contributing

When adding new features:

1. **Create appropriate modules** in the relevant directories
2. **Update `__init__.py` files** to expose necessary components  
3. **Add comprehensive tests** for new functionality
4. **Update documentation** including this README
5. **Follow the 23 coding rules** specified in the system prompt
6. **Test with LangGraph Studio** before submitting

## 📄 License

This project is part of the Massachusetts Climate Economy Assistant initiative, focused on addressing workforce development challenges in the clean energy sector.

---

## 🎯 Success Metrics

**Addressing the 39% Information Gap**:
- ✅ **Intelligent routing** based on user profiles
- ✅ **Comprehensive tool integration** using all existing capabilities
- ✅ **Scalable architecture** with fallback protection  
- ✅ **Analytics integration** for continuous improvement
- ✅ **Gateway Cities focus** for underserved communities
- ✅ **Multi-agent coordination** for complex user scenarios

**Connecting to 38,100 Job Pipeline**:
- 🎯 Resume analysis and skills matching
- 🎯 Real-time job search and recommendations
- 🎯 Training program identification and enrollment
- 🎯 Barrier removal and pathway optimization
- 🎯 Community-specific resource connection 