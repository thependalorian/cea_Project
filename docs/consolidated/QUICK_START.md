# 🚀 Quick Start Guide - Climate Economy Assistant V1

## Prerequisites ✅

- Docker Desktop installed and running
- 8GB+ RAM available
- 15GB+ disk space

## 1. Start Docker Desktop

Make sure Docker Desktop is running:
```bash
# Check if Docker is running
docker ps
```

## 2. Run Deployment Verification

Execute the comprehensive verification script:
```bash
./scripts/verify-deployment.sh
```

This script will:
- ✅ Verify Docker is running
- ✅ Validate configuration files
- ✅ Build all containers
- ✅ Start services
- ✅ Run health checks
- ✅ Test all endpoints

## 3. Manual Build (Alternative)

If you prefer manual control:

```bash
# Build containers
docker compose build --no-cache api supervisor

# Start development environment
docker compose --profile dev up -d

# Start supervisor mode (AI agents)
docker compose --profile supervisor up -d

# View logs
docker compose logs -f
```

## 4. Access Services

Once running, access:

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **API Health**: http://localhost:8000/api/v1/health
- **LangGraph Studio**: http://localhost:8123
- **Redis**: localhost:6379

## 5. Test Enhanced Auth

```bash
curl -X POST http://localhost:8000/api/v1/auth/enhance-session \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-id",
    "email": "test@example.com",
    "access_token": "test-token"
  }'
```

## 6. Test AI Agents

```bash
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
```

## Troubleshooting 🔧

### Docker Issues
```bash
# Restart Docker Desktop
# Check Docker status
docker system info

# Clean up if needed
docker system prune -a
```

### Service Issues
```bash
# View logs
docker compose logs -f api
docker compose logs -f supervisor

# Restart services
docker compose restart

# Rebuild if needed
docker compose build --no-cache
```

### Environment Issues
```bash
# Check environment variables
cat .env

# Validate configuration
docker compose config
```

## Development Commands 💻

```bash
# Stop all services
docker compose down

# Start specific profile
docker compose --profile dev up -d
docker compose --profile supervisor up -d

# Scale services
docker compose up -d --scale api=2

# Update containers
docker compose pull
docker compose build --no-cache
```

## Next Steps 📚

1. **Frontend Development**: Edit files in `/app` directory
2. **Backend Development**: Edit files in `/backendv1` directory  
3. **AI Agent Development**: Edit workflows in `/backendv1/workflows`
4. **Database Changes**: Use Supabase dashboard or migrations
5. **Deployment**: Use Vercel for frontend, Docker for backend

---

**Ready to develop!** 🎉 The Climate Economy Assistant V1 is now running with enhanced AI capabilities, authentication, and memory management. 