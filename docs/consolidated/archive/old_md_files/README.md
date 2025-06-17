# Climate Economy Assistant (CEA) V1

A comprehensive platform connecting job seekers with climate economy opportunities, featuring **AI-powered matching**, **LangGraph workflows**, **7-agent ecosystem**, and **human-in-the-loop** collaborative decision making.

## 🌐 **Live Application**
- **Production URL**: https://cea.georgenekwaya.com
- **Development URL**: http://localhost:3000
- **LangGraph API**: http://localhost:8123 (Development)
- **FastAPI Backend**: http://localhost:8000 (Development)

## 🏗️ **Architecture Overview V1**

### **Technology Stack**
- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS, DaisyUI
- **Backend V1**: FastAPI + LangGraph 2025 + Supabase + Redis
- **AI Orchestration**: LangGraph Supervisor Workflows with 7 Specialist Agents
- **Database**: Supabase (PostgreSQL with 28 tables)
- **Deployment**: Vercel (Frontend) + Docker (Backend)
- **AI Integration**: OpenAI GPT-4, Groq, Anthropic Claude

### **BackendV1 Architecture**
```
🎯 Climate Supervisor Workflow (LangGraph)
├── 🤖 7 Specialist Agents (Pendo, Lauren, Mai, Marcus, Miguel, Liv, Jasmine, Alex)
├── 🧠 Human-in-the-Loop System
├── 🔄 Empathy Routing & Quality Assessment
├── 📊 Conversation Analytics & Memory System
└── 🔐 Role-Based Authentication & Authorization
```

### **Database Schema (28 Tables)**
- **38,100+ Clean Energy Jobs** in Massachusetts
- **7 AI Agents** with specialized knowledge domains
- **Human-in-the-Loop** interrupt and approval workflows
- **Conversation Analytics** with journey stage progression

## 🚀 **Getting Started with BackendV1**

### **Prerequisites**
- Python 3.11+
- Node.js 18+ and npm
- Docker & Docker Compose
- Supabase account and project
- OpenAI API key
- Redis instance (local or cloud)

### **Quick Start with LangGraph**

1. **Clone and Setup**
```bash
git clone <repository-url>
cd cea_project

# Install Python dependencies
pip install -e ./backendv1

# Install Node.js dependencies
npm install
```

2. **Environment Configuration**
Create `.env` file in the root:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# AI API Keys
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key

# LangSmith (Optional)
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=climate-economy-assistant-v1
```

3. **Start with Docker Compose**
```bash
# Start all services (Frontend + BackendV1 + Redis)
docker-compose up -d

# Or start individual services
docker-compose up frontend backendv1 redis
```

4. **Start with LangGraph Dev Server**
```bash
# Start LangGraph development server
langgraph dev

# In another terminal, start the frontend
npm run dev
```

### **LangGraph Development Workflow**

#### **Start LangGraph Dev Server**
```bash
# Start with hot reloading and debugging
langgraph dev --host 0.0.0.0 --port 8123

# Start with tunnel for external access
langgraph dev --tunnel
```

#### **Available LangGraph Endpoints**
- **Climate Supervisor**: `/climate_supervisor` - Main orchestration workflow
- **Pendo Supervisor**: `/pendo_supervisor` - Specialized career guidance
- **Empathy Agent**: `/empathy_agent` - Emotional intelligence routing
- **Resume Agent**: `/resume_agent` - Resume analysis and optimization
- **Career Agent**: `/career_agent` - Career pathway recommendations
- **Interactive Chat**: `/interactive_chat` - Real-time conversation handling

#### **Test LangGraph Workflows**
```bash
# Test climate supervisor workflow
curl -X POST http://localhost:8123/climate_supervisor/invoke \
  -H "Content-Type: application/json" \
  -d '{"input": {"user_query": "I want to transition to clean energy", "user_id": "test-user"}}'

# Test with streaming
curl -X POST http://localhost:8123/climate_supervisor/stream \
  -H "Content-Type: application/json" \
  -d '{"input": {"user_query": "Help me find solar jobs", "user_id": "test-user"}}'
```

## 🤖 **AI Agent Ecosystem**

### **7 Specialist Agents**
1. **Pendo** - Career transition specialist and workflow orchestrator
2. **Lauren** - Job search and application optimization expert
3. **Mai** - Skills assessment and development coordinator
4. **Marcus** - Industry insights and market analysis specialist
5. **Miguel** - Education and training pathway advisor
6. **Liv** - Networking and professional development coach
7. **Jasmine** - Interview preparation and career coaching expert
8. **Alex** - Technical skills and certification guidance specialist

### **Human-in-the-Loop Features**
- **Interrupt Workflows** - Human review for complex decisions
- **Approval Gates** - Quality control for AI recommendations
- **Escalation Paths** - Route complex cases to human experts
- **Feedback Integration** - Continuous learning from human input

### **Journey Stage Progression**
```
Discovery → Strategy → Action Planning → Implementation
     ↓         ↓            ↓              ↓
  Exploration  Planning   Execution    Monitoring
```

## 🔐 **Authentication System V1**

### **Enhanced Security Features**
- **JWT Token Authentication** with refresh tokens
- **Role-Based Access Control** (Admin, Partner, Job Seeker, Public)
- **Permission-Based Authorization** with fine-grained controls
- **Rate Limiting** and API protection
- **Audit Logging** for all user actions

### **User Roles & Permissions**
```typescript
// Role hierarchy
UserRole {
  ADMIN = "admin"           // Full system access
  PARTNER = "partner"       // Organization management
  JOB_SEEKER = "job_seeker" // Profile and job search
  PUBLIC = "public"         // Limited read access
}

// Permission system
Permission {
  MANAGE_USERS, MANAGE_CONTENT, MANAGE_PARTNERS,
  MANAGE_SYSTEM, VIEW_ANALYTICS, CREATE_JOBS,
  EDIT_JOBS, DELETE_JOBS, UPLOAD_RESUME, etc.
}
```

## 📊 **Database Schema V1**

### **Core Tables (28 Total)**
- **User Management**: `profiles`, `admin_profiles`, `partner_profiles`, `job_seeker_profiles`
- **Job System**: `job_listings`, `partner_match_results`, `role_requirements`
- **AI & Analytics**: `conversation_analytics`, `conversation_messages`, `conversation_interrupts`
- **Content**: `knowledge_resources`, `education_programs`, `skills_mapping`
- **Security**: `audit_logs`, `content_flags`, `admin_permissions`

### **AI-Specific Tables**
- **`conversation_interrupts`** - Human-in-the-loop workflow management
- **`conversation_analytics`** - AI performance and user journey tracking
- **`workflow_sessions`** - LangGraph state persistence
- **`message_feedback`** - AI response quality improvement

## 🐳 **Docker Deployment**

### **Multi-Service Architecture**
```yaml
# docker-compose.yaml
services:
  frontend:          # Next.js application
  backendv1:         # FastAPI + LangGraph
  redis:             # Session and cache storage
  nginx:             # Reverse proxy and load balancer
```

### **Production Deployment**
```bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Scale backend services
docker-compose up --scale backendv1=3

# Monitor services
docker-compose logs -f backendv1
```

## 🔧 **Development Guidelines V1**

### **BackendV1 Development**
```bash
# Install in development mode
pip install -e ./backendv1

# Run tests
python -m pytest backendv1/tests/

# Type checking
mypy backendv1/

# Code formatting
black backendv1/
isort backendv1/
```

### **LangGraph Workflow Development**
```python
# Example workflow structure
from langgraph import StateGraph
from backendv1.agents import ClimateAgent

def create_workflow():
    workflow = StateGraph(AgentState)
    workflow.add_node("supervisor", supervisor_node)
    workflow.add_node("specialist", specialist_node)
    workflow.add_conditional_edges("supervisor", route_to_specialist)
    return workflow.compile()
```

### **Testing AI Workflows**
```bash
# Test individual agents
python -m backendv1.tests.test_agents

# Test workflows
python -m backendv1.tests.test_workflows

# Integration tests
python -m backendv1.tests.test_integration
```

## 📈 **Platform Statistics V1**
- **38,100+ Jobs** in Massachusetts clean energy sector
- **28 Database Tables** with comprehensive relationships
- **7 AI Specialist Agents** providing domain expertise
- **4 User Roles** with granular permissions
- **100% TypeScript** frontend with Python backend
- **LangGraph 2025** compatibility with interrupt() functionality
- **Human-in-the-Loop** collaborative decision making

## 🌱 **Climate Focus Areas**
- **Solar Energy** - Installation, maintenance, sales, engineering
- **Wind Power** - Turbine technology, offshore development
- **Energy Efficiency** - Building retrofits, smart systems
- **Electric Vehicles** - Manufacturing, charging infrastructure
- **Grid Modernization** - Smart grid, energy storage
- **Green Building** - Sustainable construction, LEED certification
- **Environmental Services** - Remediation, consulting, compliance

## 🚀 **Next Steps**
1. **Scale AI Agents** - Add more specialized agents for niche domains
2. **Enhanced Analytics** - Real-time dashboard with AI insights
3. **Mobile Applications** - Native iOS/Android apps
4. **API Marketplace** - Third-party integrations and partnerships
5. **Multi-State Expansion** - Extend beyond Massachusetts

## 📚 **Documentation**
- [BackendV1 API Documentation](./docs/api-v1.md)
- [LangGraph Workflow Guide](./docs/langgraph-workflows.md)
- [AI Agent Development](./docs/agent-development.md)
- [Human-in-the-Loop Setup](./docs/human-in-loop.md)
- [Deployment Guide](./docs/deployment-v1.md)

---

**Climate Economy Assistant V1** - Powered by LangGraph, FastAPI, and Next.js
*Connecting talent with climate opportunities through AI-powered workflows*