# 🐳 Docker Deployment Guide - Climate Economy Assistant V1

## Overview

This guide provides comprehensive instructions for deploying the Climate Economy Assistant V1 using Docker, following our **23 coding rules** for scalable, efficient development. The setup includes Next.js 14.0.4, BackendV1 with LangGraph, Enhanced Auth Workflow, Redis cache, and AI agent orchestration.

## 📋 Prerequisites

- Docker Engine 20.10+ 
- Docker Compose v2.0+
- 8GB+ RAM available (for AI agents)
- 15GB+ disk space
- NVIDIA GPU (optional, for local LLM)

## 🚀 Quick Start

### Development Environment

```bash
# 1. Clone and navigate to project
cd cea_project

# 2. Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# 3. Start development environment
docker compose --profile dev up -d

# 4. View logs
docker compose logs -f
```

### Production Environment

```bash
# 1. Setup production configuration
docker compose -f docker-compose.yaml -f docker-compose.prod.yaml --profile prod up -d

# 2. Start with monitoring
docker compose --profile prod --profile monitoring up -d
```

### LangGraph Supervisor Mode

```bash
# Start with AI supervisor workflow
docker compose --profile supervisor up -d

# Access LangGraph Studio
# URL: http://localhost:8123
```

## 🏗️ Architecture V1

### Services Overview

| Service | Port | Description | Health Check |
|---------|------|-------------|--------------|
| **frontend** | 3000 | Next.js 14.0.4 React app | `GET /api/health` |
| **api** | 8000 | BackendV1 FastAPI with LangGraph | `GET /api/v1/health` |
| **supervisor** | 8000, 8123 | AI Supervisor Workflow | `GET /health` |
| **redis** | 6379 | Cache & session storage | Redis PING |
| **ollama** | 11434 | Local LLM (optional) | Container status |
| **prometheus** | 9090 | Metrics collection | Container status |
| **grafana** | 3001 | Monitoring dashboard | Container status |

### Docker Profiles

- **`dev`**: Development with hot reloading
- **`prod`**: Production optimized
- **`supervisor`**: AI Supervisor Workflow mode
- **`gpu`**: GPU-enabled for local LLM
- **`monitoring`**: Observability stack

## 📁 Project Structure V1

```
cea_project/
├── Dockerfile                    # BackendV1 container
├── Dockerfile.frontend          # Frontend container  
├── docker-compose.yaml          # Main compose config
├── docker-compose.prod.yaml     # Production overrides
├── .dockerignore                # Build optimization
├── langgraph.json               # Root LangGraph config
├── vercel.json                  # Vercel deployment config
├── backendv1/                   # Enhanced backend
│   ├── main.py                  # FastAPI entry point
│   ├── webapp.py                # LangGraph webapp
│   ├── langgraph.json           # BackendV1 LangGraph config
│   ├── requirements.txt         # Python dependencies
│   ├── workflows/               # AI workflows
│   ├── agents/                  # AI agents
│   ├── auth/                    # Enhanced auth system
│   ├── adapters/                # Database adapters
│   └── config/                  # Configuration
├── scripts/
│   └── docker-dev-setup.sh      # Automated setup
└── data/                        # Persistent volumes
    ├── redis/
    ├── prometheus/
    └── grafana/
```

## ⚙️ Configuration V1

### Environment Variables

Create `.env` file with required variables:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o

# Groq Configuration (Optional)
GROQ_API_KEY=your_groq_key

# Anthropic Configuration (Optional)
ANTHROPIC_API_KEY=your_anthropic_key

# LangSmith Configuration (Optional)
LANGCHAIN_API_KEY=your_langsmith_key
LANGCHAIN_TRACING_V2=true
LANGCHAIN_PROJECT=climate-economy-assistant

# Tavily Search (Optional)
TAVILY_API_KEY=your_tavily_key

# Redis Configuration
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379

# Security
JWT_SECRET=your_jwt_secret_256_bit
ENCRYPTION_KEY=your_encryption_key_256_bit

# Application
ENVIRONMENT=development
LOG_LEVEL=INFO
NODE_ENV=development
API_PORT=8000
LANGGRAPH_PORT=8123

# LangGraph Configuration
LANGGRAPH_CONFIG_PATH=/app/langgraph.json
LANGGRAPH_API_HOST=0.0.0.0
LANGGRAPH_API_PORT=8123
```

### Service Configuration V1

#### BackendV1 (FastAPI + LangGraph)
- **Port**: 8000 (API), 8123 (LangGraph)
- **Runtime**: Python 3.11
- **Features**: Enhanced Auth, AI Agents, Memory Management
- **Health Check**: `/api/v1/health`

#### AI Agents Available
- **Pendo** - Supervisor Agent
- **Marcus** - Career Guidance Specialist
- **Liv** - Job Search Specialist  
- **Mai** - Skills Assessment Specialist
- **Lauren** - Partner Relations Specialist
- **Miguel** - Education Programs Specialist
- **Jasmine** - Climate Knowledge Specialist
- **Alex** - Empathy & Crisis Support Specialist

#### Enhanced Authentication System
- **Session Enhancement** - Context injection for AI agents
- **Memory Management** - Persistent user context
- **User Types** - Job seekers, partners, admins
- **Database Integration** - 26 comprehensive tables

## 🔧 Development Commands V1

### Using Setup Script

```bash
# Interactive menu
./scripts/docker-dev-setup.sh

# Direct commands
./scripts/docker-dev-setup.sh start     # Start development
./scripts/docker-dev-setup.sh supervisor # Start supervisor mode
./scripts/docker-dev-setup.sh stop      # Stop services
./scripts/docker-dev-setup.sh logs      # View logs
./scripts/docker-dev-setup.sh prod      # Start production
./scripts/docker-dev-setup.sh clean     # Cleanup all
```

### Manual Docker Compose V1

```bash
# Development with BackendV1
docker compose --profile dev up -d

# AI Supervisor Workflow
docker compose --profile supervisor up -d

# Production
docker compose -f docker-compose.yaml -f docker-compose.prod.yaml --profile prod up -d

# GPU-enabled with local LLM
docker compose --profile gpu up -d

# With monitoring
docker compose --profile dev --profile monitoring up -d

# View specific service logs
docker compose logs -f api
docker compose logs -f supervisor

# Rebuild BackendV1
docker compose build api supervisor
```

### LangGraph Studio Access

```bash
# Start supervisor mode
docker compose --profile supervisor up -d

# Access LangGraph Studio
open http://localhost:8123

# Or with tunnel for external access
docker compose exec supervisor langgraph dev --tunnel
```

## 🏭 Production Deployment V1

### Performance Optimizations

1. **Multi-stage builds** for minimal image sizes
2. **BackendV1 architecture** with modular AI agents
3. **Enhanced auth workflow** with memory management
4. **Non-root users** for security
5. **Resource limits** for stability
6. **Health checks** for reliability
7. **LangGraph optimization** for AI workflows

### Security Features V1

- Non-root container users
- Minimal base images (Python 3.11-slim)
- Enhanced authentication system
- Environment variable isolation
- Network segmentation
- Database security with RLS
- JWT token validation

### AI Agent Orchestration

```bash
# Start with full AI capabilities
docker compose --profile supervisor --profile monitoring up -d

# Access services
# FastAPI: http://localhost:8000
# LangGraph Studio: http://localhost:8123
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
```

## 🔍 Troubleshooting V1

### Common Issues

#### BackendV1 Build Failures
```bash
# Check build logs
docker compose build api --no-cache

# Verify requirements
docker compose exec api pip list

# Check Python path
docker compose exec api python -c "import sys; print(sys.path)"
```

#### LangGraph Connection Issues
```bash
# Check LangGraph service
docker compose logs supervisor

# Verify configuration
docker compose exec supervisor cat /app/langgraph.json

# Test LangGraph API
curl http://localhost:8123/health
```

#### Enhanced Auth Issues
```bash
# Check database connection
docker compose exec api python -c "
from backendv1.adapters.supabase_adapter import SupabaseAdapter
adapter = SupabaseAdapter()
print('Database connected:', adapter.test_connection())
"

# Verify user profiles
docker compose logs api | grep "Enhanced Auth"
```

#### Memory Issues
```bash
# Check Redis connection
docker compose exec redis redis-cli ping

# Monitor memory usage
docker stats

# Check AI agent memory
docker compose exec supervisor python -c "
import psutil
print(f'Memory usage: {psutil.virtual_memory().percent}%')
"
```

### Performance Monitoring

```bash
# Monitor all services
docker compose --profile monitoring up -d

# Check service health
curl http://localhost:8000/api/v1/health
curl http://localhost:8123/health

# View metrics
open http://localhost:9090  # Prometheus
open http://localhost:3001  # Grafana
```

## 🚀 Deployment Verification

### Health Checks V1

```bash
# Frontend health
curl http://localhost:3000/api/health

# BackendV1 API health
curl http://localhost:8000/api/v1/health

# LangGraph health
curl http://localhost:8123/health

# Redis health
docker compose exec redis redis-cli ping

# Database health
curl -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
     "$SUPABASE_URL/rest/v1/profiles?select=count"
```

### AI Agent Testing

```bash
# Test climate supervisor
curl -X POST http://localhost:8123/runs/stream \
  -H "Content-Type: application/json" \
  -d '{
    "assistant_id": "climate_supervisor",
    "input": {
      "messages": [{
        "role": "human",
        "content": "I want to transition to clean energy jobs"
      }]
    }
  }'

# Test enhanced auth
curl -X POST http://localhost:8000/api/v1/auth/enhance-session \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-id",
    "email": "test@example.com",
    "access_token": "test-token"
  }'
```

## 📊 Monitoring & Observability

### Metrics Collection

- **Application Metrics**: FastAPI + LangGraph performance
- **AI Agent Metrics**: Response times, success rates
- **Database Metrics**: Query performance, connection pools
- **Memory Metrics**: User context, conversation history
- **Security Metrics**: Authentication attempts, session management

### Log Aggregation

```bash
# View all logs
docker compose logs -f

# Filter by service
docker compose logs -f api supervisor

# Search logs
docker compose logs api | grep "Enhanced Auth"
docker compose logs supervisor | grep "Climate Agent"
```

## 🎯 Best Practices V1

### Following the 23 Rules

1. **✅ Always Use DaisyUI**: Frontend maintains consistent styling
2. **✅ Create New UI Components**: Modular AI agent architecture
3. **✅ Component Documentation**: Comprehensive agent documentation
4. **✅ Vercel Compatibility**: Optimized for Vercel deployment
5. **✅ Quick and Scalable Endpoints**: LangGraph API optimization
6. **✅ Asynchronous Data Handling**: Streaming AI responses
7. **✅ API Response Documentation**: Clear agent response formats
8. **✅ Use Supabase with SSR**: Enhanced database integration
9. **✅ Maintain Existing Functionality**: Backward compatibility
10. **✅ Comprehensive Error Handling**: Robust AI error management

### Development Workflow V1

1. **Code Changes**: Edit BackendV1 code with hot reloading
2. **Test AI Agents**: Use LangGraph Studio for immediate feedback
3. **Debug Issues**: Enhanced logging and monitoring
4. **Monitor Performance**: Track AI agent execution times
5. **Deploy**: Build production images when ready

## 🔄 Continuous Integration

### GitHub Actions Integration

```yaml
# .github/workflows/docker-build.yml
name: Docker Build and Test
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build BackendV1
        run: docker compose build api supervisor
      - name: Test Health Checks
        run: |
          docker compose --profile dev up -d
          sleep 30
          curl -f http://localhost:8000/api/v1/health
          curl -f http://localhost:8123/health
```

## 📚 Additional Resources V1

- **BackendV1 Documentation**: `backendv1/README.md`
- **Enhanced Auth Guide**: `ENHANCED_AUTH_WORKFLOW_SUMMARY.md`
- **Database Documentation**: `DATABASE_CONSOLIDATED_CURRENT_STATE.md`
- **LangGraph Documentation**: https://langchain-ai.github.io/langgraph/
- **Climate Economy Setup**: `scripts/CLIMATE_ECONOMY_SETUP_GUIDE.md`

---

This deployment guide provides comprehensive instructions for deploying the Climate Economy Assistant V1 with enhanced AI capabilities, following all **23 coding rules** for scalable, efficient development. The configuration ensures seamless integration with LangGraph, enhanced authentication, and production-ready AI agent orchestration. 