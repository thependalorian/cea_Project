#!/bin/bash

# 🚀 Climate Economy Assistant V1 - Deployment Verification Script
# This script verifies all components of the CEA V1 deployment
# Following the 23 coding rules for comprehensive testing

set -e

echo "🎯 Climate Economy Assistant V1 - Deployment Verification"
echo "========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if Docker is running
echo -e "\n${BLUE}🐳 Checking Docker Status...${NC}"
if docker ps > /dev/null 2>&1; then
    print_status 0 "Docker daemon is running"
else
    print_status 1 "Docker daemon is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

# Check Docker Compose version
echo -e "\n${BLUE}📦 Checking Docker Compose...${NC}"
COMPOSE_VERSION=$(docker compose version --short 2>/dev/null || echo "not found")
if [ "$COMPOSE_VERSION" != "not found" ]; then
    print_status 0 "Docker Compose version: $COMPOSE_VERSION"
else
    print_status 1 "Docker Compose not found"
    exit 1
fi

# Validate Docker Compose configuration
echo -e "\n${BLUE}🔧 Validating Docker Compose Configuration...${NC}"
if docker compose config --quiet 2>/dev/null; then
    print_status 0 "Docker Compose configuration is valid"
else
    print_status 1 "Docker Compose configuration has errors"
    echo "Running docker compose config to show errors:"
    docker compose config
    exit 1
fi

# Check environment file
echo -e "\n${BLUE}🌍 Checking Environment Configuration...${NC}"
if [ -f ".env" ]; then
    print_status 0 ".env file exists"
    
    # Check critical environment variables
    source .env 2>/dev/null || true
    
    if [ -n "$SUPABASE_URL" ]; then
        print_status 0 "SUPABASE_URL is configured"
    else
        print_status 1 "SUPABASE_URL is missing"
    fi
    
    if [ -n "$OPENAI_API_KEY" ]; then
        print_status 0 "OPENAI_API_KEY is configured"
    else
        print_status 1 "OPENAI_API_KEY is missing"
    fi
    
    if [ -n "$JWT_SECRET" ]; then
        print_status 0 "JWT_SECRET is configured"
    else
        print_status 1 "JWT_SECRET is missing"
    fi
else
    print_status 1 ".env file not found"
    print_info "Copy .env.example to .env and configure your variables"
fi

# Check BackendV1 structure
echo -e "\n${BLUE}🏗️  Checking BackendV1 Structure...${NC}"
if [ -d "backendv1" ]; then
    print_status 0 "backendv1 directory exists"
    
    # Check key files
    files_to_check=(
        "backendv1/main.py"
        "backendv1/webapp.py"
        "backendv1/langgraph.json"
        "backendv1/requirements.txt"
        "backendv1/workflows/climate_supervisor.py"
        "backendv1/chat/interactive_chat.py"
    )
    
    for file in "${files_to_check[@]}"; do
        if [ -f "$file" ]; then
            print_status 0 "$file exists"
        else
            print_status 1 "$file is missing"
        fi
    done
else
    print_status 1 "backendv1 directory not found"
fi

# Check LangGraph configuration
echo -e "\n${BLUE}📊 Checking LangGraph Configuration...${NC}"
if [ -f "langgraph.json" ]; then
    print_status 0 "Root langgraph.json exists"
else
    print_status 1 "Root langgraph.json is missing"
fi

if [ -f "backendv1/langgraph.json" ]; then
    print_status 0 "BackendV1 langgraph.json exists"
else
    print_status 1 "BackendV1 langgraph.json is missing"
fi

# Build containers
echo -e "\n${BLUE}🔨 Building Docker Containers...${NC}"
print_info "This may take several minutes..."

if docker compose build --no-cache api supervisor 2>&1 | tee /tmp/docker_build.log; then
    print_status 0 "Docker containers built successfully"
else
    print_status 1 "Docker container build failed"
    echo "Build log:"
    cat /tmp/docker_build.log
    exit 1
fi

# Start services in development mode
echo -e "\n${BLUE}🚀 Starting Development Services...${NC}"
print_info "Starting services in background..."

if docker compose --profile dev up -d 2>&1; then
    print_status 0 "Development services started"
    sleep 10  # Wait for services to initialize
else
    print_status 1 "Failed to start development services"
    exit 1
fi

# Health checks
echo -e "\n${BLUE}🏥 Running Health Checks...${NC}"

# Check if containers are running
RUNNING_CONTAINERS=$(docker compose ps --services --filter "status=running")
if echo "$RUNNING_CONTAINERS" | grep -q "api"; then
    print_status 0 "API container is running"
else
    print_status 1 "API container is not running"
fi

if echo "$RUNNING_CONTAINERS" | grep -q "redis"; then
    print_status 0 "Redis container is running"
else
    print_status 1 "Redis container is not running"
fi

# Wait for services to be ready
print_info "Waiting for services to be ready..."
sleep 15

# Test API health endpoint
echo -e "\n${BLUE}🔍 Testing API Endpoints...${NC}"
if curl -f -s http://localhost:8000/api/v1/health > /dev/null 2>&1; then
    print_status 0 "API health endpoint is responding"
else
    print_status 1 "API health endpoint is not responding"
    print_info "Checking API logs..."
    docker compose logs api | tail -20
fi

# Test Redis connection
if docker compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    print_status 0 "Redis is responding to ping"
else
    print_status 1 "Redis is not responding"
fi

# Start supervisor mode for LangGraph testing
echo -e "\n${BLUE}🤖 Testing LangGraph Supervisor Mode...${NC}"
print_info "Starting supervisor mode..."

if docker compose --profile supervisor up -d 2>&1; then
    print_status 0 "Supervisor mode started"
    sleep 15  # Wait for LangGraph to initialize
    
    # Test LangGraph health
    if curl -f -s http://localhost:8123/health > /dev/null 2>&1; then
        print_status 0 "LangGraph API is responding"
    else
        print_status 1 "LangGraph API is not responding"
        print_info "Checking supervisor logs..."
        docker compose logs supervisor | tail -20
    fi
else
    print_status 1 "Failed to start supervisor mode"
fi

# Test enhanced auth workflow
echo -e "\n${BLUE}🔐 Testing Enhanced Auth Workflow...${NC}"
AUTH_TEST_RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/auth/enhance-session \
    -H "Content-Type: application/json" \
    -d '{
        "user_id": "test-user-id",
        "email": "test@example.com",
        "access_token": "test-token"
    }' 2>/dev/null || echo "failed")

if [ "$AUTH_TEST_RESPONSE" != "failed" ]; then
    print_status 0 "Enhanced auth endpoint is responding"
else
    print_status 1 "Enhanced auth endpoint test failed"
fi

# Display service URLs
echo -e "\n${BLUE}🌐 Service URLs:${NC}"
echo "Frontend: http://localhost:3000"
echo "API: http://localhost:8000"
echo "API Health: http://localhost:8000/api/v1/health"
echo "LangGraph Studio: http://localhost:8123"
echo "Redis: localhost:6379"

# Display logs command
echo -e "\n${BLUE}📋 Useful Commands:${NC}"
echo "View all logs: docker compose logs -f"
echo "View API logs: docker compose logs -f api"
echo "View supervisor logs: docker compose logs -f supervisor"
echo "Stop services: docker compose down"
echo "Restart services: docker compose restart"

# Final status
echo -e "\n${GREEN}🎉 Deployment Verification Complete!${NC}"
echo "=========================================="

# Check if all critical services are running
CRITICAL_SERVICES=("api" "redis")
ALL_RUNNING=true

for service in "${CRITICAL_SERVICES[@]}"; do
    if ! docker compose ps --services --filter "status=running" | grep -q "$service"; then
        ALL_RUNNING=false
        break
    fi
done

if [ "$ALL_RUNNING" = true ]; then
    echo -e "${GREEN}✅ All critical services are running successfully!${NC}"
    echo -e "${GREEN}✅ Climate Economy Assistant V1 is ready for development!${NC}"
else
    echo -e "${YELLOW}⚠️  Some services may need attention. Check the logs above.${NC}"
fi

echo -e "\n${BLUE}📚 Next Steps:${NC}"
echo "1. Open http://localhost:3000 for the frontend"
echo "2. Open http://localhost:8123 for LangGraph Studio"
echo "3. Test the enhanced auth workflow"
echo "4. Start developing with hot reloading enabled"

exit 0 