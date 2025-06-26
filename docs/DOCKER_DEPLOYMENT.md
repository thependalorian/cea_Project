# Docker Deployment Guide 🐳

## Overview

This guide covers Docker deployment for the Climate Economy Assistant using both **traditional Docker** and **LangGraph Platform** deployment options based on 2025 LangGraph best practices.

## 🚀 Quick Start

### Development Environment
```bash
# Clone and setup
git clone <repository>
cd cea_project

# Create environment file
cp .env.example .env
# Edit .env with your actual values

# Run development stack
docker-compose -f docker-compose.dev.yml up --build
```

### Production Environment
```bash
# Run production stack
docker-compose up --build -d
```

## 📁 File Structure

```
cea_project/
├── Dockerfile                 # Frontend (Next.js)
├── backend/Dockerfile         # Backend (FastAPI + LangGraph)
├── docker-compose.yml         # Production stack
├── docker-compose.dev.yml     # Development stack
├── langgraph.json            # LangGraph deployment config
├── .dockerignore             # Docker ignore patterns
└── docs/DOCKER_DEPLOYMENT.md # This file
```

## 🛠 Docker Services

### 1. Frontend (Next.js)
- **Port**: 3000
- **Build**: Multi-stage with standalone output
- **Features**: SSR, hot reloading (dev), optimized builds

### 2. Backend (FastAPI + LangGraph)
- **Port**: 8000
- **Features**: 20 AI agents, streaming responses, semantic routing
- **Dependencies**: Python 3.11, LangGraph 0.3.27+

### 3. Redis
- **Port**: 6379
- **Purpose**: Caching, session management, agent state

## ⚙️ Environment Variables

### Required Variables
```bash
# Supabase Database
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# AI Models
DEEPSEEK_API_KEY=your_deepseek_key
OPENAI_API_KEY=your_openai_key  # Optional

# Redis
REDIS_URL=redis://redis:6379

# LangGraph Platform (Optional)
LANGSMITH_API_KEY=your_langsmith_key
LANGSMITH_TRACING=true
```

### Frontend Specific
```bash
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
NEXT_PUBLIC_APP_URL=http://localhost:3000
BACKEND_URL=http://backend:8000
```

## 🔧 LangGraph Platform Deployment

### Configuration (`langgraph.json`)
Our setup follows LangGraph 2025 best practices:

```json
{
  "dependencies": ["./backend"],
  "graphs": {
    "climate_economy_assistant": "./backend/agents/langgraph/framework.py:app_graph",
    "agent_coordinator": "./backend/agents/agent_coordinator.py:coordinator_graph"
  },
  "env": {
    "SUPABASE_URL": "${SUPABASE_URL}",
    "DEEPSEEK_API_KEY": "${DEEPSEEK_API_KEY}",
    "REDIS_URL": "${REDIS_URL}"
  },
  "python_version": "3.11"
}
```

### LangGraph CLI Commands
```bash
# Install LangGraph CLI
pip install langgraph-cli

# Test configuration
langgraph dev

# Build for deployment
langgraph build -t cea-langgraph

# Deploy to LangGraph Platform
langgraph deploy
```

## 🚢 Deployment Options

### Option 1: Traditional Docker Compose

**Development:**
```bash
docker-compose -f docker-compose.dev.yml up --build
```

**Production:**
```bash
docker-compose up --build -d
```

### Option 2: LangGraph Platform

**Self-Hosted:**
```bash
# Build LangGraph image
langgraph build -t cea-agents

# Run with Docker
docker run -p 8000:8000 --env-file .env cea-agents
```

**Cloud Deployment:**
1. Connect GitHub repository to LangGraph Platform
2. Configure environment variables
3. Deploy via UI or CLI

### Option 3: Kubernetes

**Prerequisites:**
- KEDA installed
- Ingress controller
- Cluster autoscaler

**Deploy:**
```bash
# Use LangGraph Helm chart (Enterprise)
helm repo add langchain https://langchain-ai.github.io/helm/
helm install cea-deployment langchain/langgraph-dataplane
```

## 🔍 Health Checks

### Service Health Endpoints
- **Frontend**: `http://localhost:3000/api/health`
- **Backend**: `http://localhost:8000/health`
- **LangGraph**: `http://localhost:8000/ok`
- **Redis**: `redis-cli ping`

### Docker Health Checks
```bash
# Check all services
docker-compose ps

# View logs
docker-compose logs -f [service_name]

# Test individual service
curl http://localhost:8000/health
```

## 🚨 Troubleshooting

### Common Issues

**1. LangGraph Agent Timeouts**
```bash
# Check agent routing performance
curl -X POST http://localhost:8000/api/agents/pendo/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "user_id": "test", "conversation_id": "test"}'
```

**2. Database Connection Issues**
```bash
# Verify Supabase connection
docker-compose exec backend python -c "
from backend.database.supabase_client import get_supabase_client
client = get_supabase_client()
print('✅ Database connected' if client else '❌ Database failed')
"
```

**3. Redis Connection Issues**
```bash
# Test Redis connectivity
docker-compose exec redis redis-cli ping
```

**4. Build Issues**
```bash
# Clean rebuild
docker-compose down -v
docker system prune -af
docker-compose up --build
```

## 📊 Performance Optimization

### Production Optimizations

**1. Multi-stage Builds**
- Frontend: Node.js → Standalone output
- Backend: Python build → Runtime image

**2. Caching Strategies**
- Docker layer caching
- npm/pip dependency caching
- Redis for application caching

**3. Resource Limits**
```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
```

## 🔒 Security Best Practices

### Container Security
- ✅ Non-root user execution
- ✅ Multi-stage builds
- ✅ Minimal base images
- ✅ Health checks enabled
- ✅ Secret management via environment variables

### Network Security
```yaml
# Isolated network
networks:
  cea-network:
    driver: bridge
    internal: false  # Set to true for production isolation
```

### Environment Security
```bash
# Use secrets management in production
docker secret create supabase_url /path/to/supabase_url.txt
docker secret create deepseek_key /path/to/deepseek_key.txt
```

## 📈 Monitoring & Logging

### Log Management
```bash
# Centralized logging
docker-compose logs -f --tail=100

# Service-specific logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Metrics Collection
- **LangGraph**: Built-in LangSmith integration
- **Application**: Health check endpoints
- **Infrastructure**: Docker stats, Redis metrics

## 🔄 CI/CD Integration

Our GitHub Actions pipeline supports:
- ✅ Multi-service testing
- ✅ Security scanning
- ✅ Docker image building
- ✅ Automated deployment
- ✅ Health check validation

## 📚 Additional Resources

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [FastAPI Docker Guide](https://fastapi.tiangolo.com/deployment/docker/)

---

**Need Help?** Check the troubleshooting section or create an issue in the repository. 