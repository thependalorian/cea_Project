# 🐳 Docker Deployment Guide - Climate Economy Assistant

## Overview

This guide provides comprehensive instructions for deploying the Climate Economy Assistant using Docker, following our **23 coding rules** for scalable, efficient development. The setup includes Next.js 14.0.4, FastAPI backend, Redis cache, and optional monitoring.

## 📋 Prerequisites

- Docker Engine 20.10+ 
- Docker Compose v2.0+
- 4GB+ RAM available
- 10GB+ disk space

## 🚀 Quick Start

### Development Environment

```bash
# 1. Clone and navigate to project
cd cea_project

# 2. Run the automated setup script
./scripts/docker-dev-setup.sh

# Or manually:
docker compose --profile dev up -d
```

### Production Environment

```bash
# 1. Setup production configuration
docker compose -f docker-compose.yaml -f docker-compose.prod.yaml --profile prod up -d

# Or use the setup script
./scripts/docker-dev-setup.sh prod
```

## 🏗️ Architecture

### Services Overview

| Service | Port | Description | Health Check |
|---------|------|-------------|--------------|
| **frontend** | 3000 | Next.js 14.0.4 React app | `GET /api/health` |
| **api** | 8000 | FastAPI Python backend | `GET /api/v1/health` |
| **redis** | 6379 | Cache & session storage | Redis PING |
| **ollama** | 11434 | Local LLM (optional) | Container status |
| **prometheus** | 9090 | Metrics collection | Container status |
| **grafana** | 3001 | Monitoring dashboard | Container status |

### Docker Profiles

- **`dev`**: Development with hot reloading
- **`prod`**: Production optimized
- **`gpu`**: GPU-enabled for local LLM
- **`monitoring`**: Observability stack

## 📁 Project Structure

```
cea_project/
├── Dockerfile                    # Backend container
├── Dockerfile.frontend          # Frontend container  
├── docker-compose.yaml          # Main compose config
├── docker-compose.prod.yaml     # Production overrides
├── .dockerignore                # Build optimization
├── scripts/
│   └── docker-dev-setup.sh      # Automated setup
└── data/                        # Persistent volumes
    ├── redis/
    ├── prometheus/
    └── grafana/
```

## ⚙️ Configuration

### Environment Variables

Create `.env` file with required variables:

```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key

# Groq Configuration (Optional)
GROQ_API_KEY=your_groq_key

# Redis Configuration
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Application
ENVIRONMENT=development
LOG_LEVEL=INFO
NODE_ENV=development
```

### Service Configuration

#### Frontend (Next.js 14.0.4)
- **Port**: 3000
- **Build**: Multi-stage with standalone output
- **Features**: TypeScript, TailwindCSS, DaisyUI
- **Health Check**: `/api/health`

#### Backend (FastAPI)
- **Port**: 8000
- **Runtime**: Python 3.11
- **Features**: LangGraph, Supabase, Redis
- **Health Check**: `/api/v1/health`

#### Redis Cache
- **Port**: 6379
- **Memory**: 512MB (dev) / 1GB (prod)
- **Persistence**: AOF enabled
- **Policy**: allkeys-lru

## 🔧 Development Commands

### Using Setup Script

```bash
# Interactive menu
./scripts/docker-dev-setup.sh

# Direct commands
./scripts/docker-dev-setup.sh start     # Start development
./scripts/docker-dev-setup.sh stop      # Stop services
./scripts/docker-dev-setup.sh logs      # View logs
./scripts/docker-dev-setup.sh prod      # Start production
./scripts/docker-dev-setup.sh clean     # Cleanup all
```

### Manual Docker Compose

```bash
# Development
docker compose --profile dev up -d
docker compose --profile dev down

# Production
docker compose -f docker-compose.yaml -f docker-compose.prod.yaml --profile prod up -d

# GPU-enabled
docker compose --profile gpu up -d

# With monitoring
docker compose --profile dev --profile monitoring up -d

# View logs
docker compose logs -f [service_name]

# Rebuild specific service
docker compose build frontend
```

## 🏭 Production Deployment

### Performance Optimizations

1. **Multi-stage builds** for minimal image sizes
2. **Standalone Next.js output** for efficient containers
3. **Non-root users** for security
4. **Resource limits** for stability
5. **Health checks** for reliability

### Security Features

- Non-root container users
- Minimal base images (Alpine Linux)
- Security scanning enabled
- Environment variable isolation
- Network segmentation

### Monitoring Stack

```bash
# Start with monitoring
docker compose --profile prod --profile monitoring up -d

# Access dashboards
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
```

## 🔍 Troubleshooting

### Common Issues

#### Frontend Build Failures
```bash
# Clear build cache
docker compose build --no-cache frontend

# Check standalone build
docker run --rm frontend ls -la .next/
```

#### Backend API Not Starting
```bash
# Check logs
docker compose logs api

# Test health endpoint
curl http://localhost:8000/api/v1/health

# Check environment
docker compose exec api env | grep SUPABASE
```

#### Redis Connection Issues
```bash
# Test Redis connection
docker compose exec redis redis-cli ping

# Check network connectivity
docker compose exec api ping redis
```

### Debug Commands

```bash
# Enter container shell
docker compose exec frontend sh
docker compose exec api bash

# Check container status
docker compose ps

# View resource usage
docker stats

# Network inspection
docker network ls
docker network inspect cea-network
```

## 📊 Monitoring & Observability

### Health Checks

All services include health checks:

```bash
# Check all service health
docker compose ps

# Manual health check
curl http://localhost:3000/api/health    # Frontend
curl http://localhost:8000/api/v1/health # Backend
```

### Metrics Collection

- **Prometheus**: Metrics scraping
- **Grafana**: Visualization dashboards
- **Docker**: Built-in container metrics

### Log Management

```bash
# Centralized logging
docker compose logs -f

# Service-specific logs
docker compose logs frontend
docker compose logs api
docker compose logs redis

# Log rotation (production)
# Configured via logging drivers in docker-compose.prod.yaml
```

## 🚀 Deployment Strategies

### Local Development
- Hot reloading enabled
- Volume mounts for rapid iteration
- Debug logging
- All development tools available

### Staging/Production
- Optimized builds
- Resource constraints
- Production logging levels
- Health monitoring
- Persistent volumes

### Vercel Integration
The frontend is optimized for Vercel deployment:
- Standalone output configured
- Environment variables properly set
- API routes compatible

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build & Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build and test
        run: |
          docker compose --profile dev build
          docker compose --profile dev up -d
          # Add your tests here
          docker compose down
      
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: |
          docker compose -f docker-compose.yaml -f docker-compose.prod.yaml --profile prod up -d
```

## 📝 Best Practices

### Following the 23 Rules

1. **✅ Always Use DaisyUI**: Included in frontend build
2. **✅ Create New UI Components**: Modular structure maintained
3. **✅ Component Documentation**: Comments preserved in builds
4. **✅ Vercel Compatibility**: Standalone output configured
5. **✅ Quick and Scalable Endpoints**: Optimized FastAPI configuration
6. **✅ Asynchronous Data Handling**: Redis cache integration
7. **✅ API Response Documentation**: Health checks implemented
8. **✅ Use Supabase with SSR**: Environment properly configured
9. **✅ Maintain Existing Functionality**: Graceful deployments
10. **✅ Comprehensive Error Handling**: Health checks and logging

### Resource Management

- **Development**: Generous resource allocation
- **Production**: Optimized limits and reservations
- **Monitoring**: Resource usage tracking

### Security

- Non-root users in all containers
- Environment variable isolation
- Network segmentation
- Regular security updates

## 🎯 Next Steps

1. **Configure environment variables** for your deployment
2. **Run the setup script** for automated configuration
3. **Test all services** using health check endpoints
4. **Configure monitoring** for production deployments
5. **Setup CI/CD pipeline** for automated deployments

## 📞 Support

For issues related to Docker deployment:

1. Check the troubleshooting section above
2. Review service logs: `docker compose logs [service]`
3. Verify environment configuration
4. Test health endpoints
5. Check network connectivity between services

---

This Docker configuration follows all **23 coding rules** and provides a scalable, efficient foundation for the Climate Economy Assistant platform. The setup is optimized for both development productivity and production reliability. 