# Climate Economy Assistant - Enhanced Docker Setup

## Overview

This enhanced Docker setup provides a comprehensive containerized environment for the Climate Economy Assistant with integrated supervisor workflow, multi-agent system, and enhanced intelligence framework.

## Architecture

### Core Services

1. **Enhanced FastAPI Backend** (`api`)
   - Main API service with supervisor workflow integration
   - Ports: 8000 (FastAPI)
   - Features: Multi-agent routing, enhanced intelligence, comprehensive tool integration

2. **Supervisor Workflow Service** (`supervisor`)
   - Dedicated supervisor workflow with LangGraph integration
   - Ports: 8000 (FastAPI), 8123 (LangGraph API)
   - Features: Advanced routing, specialist coordination, human-in-the-loop

3. **Enhanced Frontend** (`frontend`)
   - Next.js 14 application with supervisor integration
   - Port: 3000
   - Features: Real-time chat, supervisor workflow UI, enhanced intelligence interface

4. **Redis Cache** (`redis`)
   - Enhanced caching for multi-agent conversations
   - Port: 6379
   - Features: Conversation persistence, tool result caching, session management

### Optional Services

5. **Local LLM** (`ollama`/`ollama-gpu`)
   - CPU/GPU-optimized local language models
   - Port: 11434
   - Features: Privacy-focused inference, cost optimization

6. **Monitoring Stack** (`prometheus`, `grafana`)
   - Performance monitoring and observability
   - Ports: 9090 (Prometheus), 3001 (Grafana)

## Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 8GB+ RAM recommended
- For GPU support: NVIDIA Docker runtime

### Environment Setup

1. **Copy environment template:**
```bash
cp .env.example .env
```

2. **Configure required variables:**
```bash
# Required
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_key

# Optional
GROQ_API_KEY=your_groq_key
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

### Deployment Profiles

#### 1. Development with Supervisor Workflow
```bash
# Start development environment with supervisor
docker compose --profile supervisor up -d

# Access services:
# - Frontend: http://localhost:3000
# - API: http://localhost:8000
# - LangGraph API: http://localhost:8123
# - API Docs: http://localhost:8000/docs
```

#### 2. Standard Development
```bash
# Start standard development environment
docker compose --profile dev up -d

# Access services:
# - Frontend: http://localhost:3000
# - API: http://localhost:8000
# - Redis: localhost:6379
```

#### 3. Production Deployment
```bash
# Start production environment
docker compose --profile prod up -d

# With monitoring:
docker compose --profile prod --profile monitoring up -d
```

#### 4. GPU-Enhanced Setup
```bash
# Start GPU-optimized supervisor workflow
docker compose --profile supervisor-gpu up -d

# Requires NVIDIA Docker runtime
```

## Service Configuration

### Supervisor Workflow Entrypoints

The enhanced Dockerfile supports multiple entrypoints:

1. **Supervisor Mode** (Default):
```bash
# Starts both FastAPI and LangGraph API
docker run -e STARTUP_MODE=supervisor cea-backend:latest
```

2. **API Mode**:
```bash
# Starts only FastAPI
docker run -e STARTUP_MODE=api cea-backend:latest
```

### Environment Variables

#### Core Configuration
```bash
# Application
ENVIRONMENT=development|production
LOG_LEVEL=DEBUG|INFO|WARNING|ERROR
STARTUP_MODE=supervisor|api

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key

# AI/ML
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o
GROQ_API_KEY=gsk_...
USE_LOCAL_LLM=false|true

# Caching
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379
```

#### Supervisor Workflow Specific
```bash
# LangGraph Configuration
LANGGRAPH_CONFIG_PATH=/app/langgraph.json
LANGGRAPH_API_PORT=8123
LANGGRAPH_API_HOST=0.0.0.0

# Enhanced Intelligence
LANGCHAIN_TRACING_V2=false|true
LANGCHAIN_PROJECT=climate-economy-assistant
```

#### Frontend Configuration
```bash
# API Integration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPERVISOR_API_URL=http://localhost:8000
NEXT_PUBLIC_LANGGRAPH_API_URL=http://localhost:8123

# Feature Flags
NEXT_PUBLIC_ENABLE_SUPERVISOR=true
NEXT_PUBLIC_ENHANCED_INTELLIGENCE=true
NEXT_PUBLIC_DEFAULT_CHAT_MODE=supervisor
```

## Development Workflow

### Hot Reloading

The development setup includes hot reloading for both frontend and backend:

```bash
# Start with file watching
docker compose --profile dev up

# Backend changes trigger automatic rebuilds
# Frontend changes sync automatically
```

### Debugging

#### Backend Debugging
```bash
# View backend logs
docker compose logs -f api

# View supervisor workflow logs
docker compose logs -f supervisor

# Access backend container
docker compose exec api bash
```

#### Frontend Debugging
```bash
# View frontend logs
docker compose logs -f frontend

# Access frontend container
docker compose exec frontend sh
```

### Testing

#### API Testing
```bash
# Health check
curl http://localhost:8000/health

# Supervisor chat test
curl -X POST http://localhost:8000/api/v1/supervisor-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "I need help with climate career transition"}'
```

#### LangGraph API Testing
```bash
# Check available graphs
curl http://localhost:8123/graphs

# Test supervisor workflow
curl -X POST http://localhost:8123/graphs/climate_supervisor/invoke \
  -H "Content-Type: application/json" \
  -d '{"input": {"messages": [{"role": "human", "content": "Hello"}]}}'
```

## Monitoring and Observability

### Health Checks

All services include comprehensive health checks:

- **API**: `GET /health`
- **Frontend**: `GET /api/health`
- **Redis**: `redis-cli ping`
- **Ollama**: `GET /api/tags`

### Monitoring Stack

When using the monitoring profile:

```bash
docker compose --profile monitoring up -d
```

Access:
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

### Log Aggregation

Logs are centralized and can be accessed via:

```bash
# All services
docker compose logs

# Specific service
docker compose logs api

# Follow logs
docker compose logs -f supervisor
```

## Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :8000

# Use different ports
API_PORT=8001 docker compose up
```

#### 2. Memory Issues
```bash
# Increase Docker memory limit
# Docker Desktop: Settings > Resources > Memory

# Monitor memory usage
docker stats
```

#### 3. GPU Support
```bash
# Verify NVIDIA Docker runtime
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi

# Check GPU availability in container
docker compose exec supervisor-gpu nvidia-smi
```

#### 4. Database Connection
```bash
# Test Supabase connection
docker compose exec api python -c "
from adapters.supabase import get_supabase_client
client = get_supabase_client()
print('Connected!' if client else 'Failed!')
"
```

### Performance Optimization

#### 1. Resource Allocation
```bash
# Adjust worker count
API_WORKERS=2 docker compose up

# Optimize Redis memory
REDIS_MAXMEMORY=2gb docker compose up
```

#### 2. Caching Strategy
```bash
# Enable Redis persistence
# Already configured in docker-compose.yaml

# Monitor cache hit rates
docker compose exec redis redis-cli info stats
```

## Security Considerations

### Production Deployment

1. **Environment Variables**: Use Docker secrets or external secret management
2. **Network Security**: Configure proper firewall rules
3. **SSL/TLS**: Use reverse proxy with SSL termination
4. **Authentication**: Implement proper JWT validation
5. **Rate Limiting**: Configure API rate limits

### Example Production Setup

```bash
# Use production profile with secrets
docker compose --profile prod up -d

# Behind reverse proxy (nginx/traefik)
# With SSL certificates
# With proper firewall configuration
```

## Advanced Configuration

### Custom LangGraph Configuration

Edit `backend/langgraph.json` to customize workflows:

```json
{
  "graphs": {
    "climate_supervisor": "./api/workflows/climate_supervisor_workflow.py:climate_supervisor_graph",
    "custom_workflow": "./api/workflows/custom_workflow.py:custom_graph"
  }
}
```

### Multi-Environment Setup

```bash
# Development
docker compose -f docker-compose.yaml --profile dev up

# Staging
docker compose -f docker-compose.staging.yaml --profile prod up

# Production
docker compose -f docker-compose.prod.yaml --profile prod up
```

## Support and Documentation

- **API Documentation**: http://localhost:8000/docs
- **LangGraph Studio**: Available with `dev-studio` profile
- **Health Endpoints**: `/health` on all services
- **Metrics**: Prometheus metrics at `/metrics`

For additional support, refer to the main project documentation or create an issue in the repository. 