# Multi-stage Dockerfile for Climate Economy Assistant FastAPI BackendV1
# Enhanced for LangGraph Supervisor Workflow + Multi-Agent System
# Optimized for LangGraph/LangChain + Supabase + OpenAI + Redis + Enhanced Intelligence

# Build stage
FROM python:3.11-slim as builder

WORKDIR /app

# Install system dependencies for LangChain, compilation, and GPU support
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better Docker layer caching
COPY backendv1/requirements.txt .

# Install Python dependencies with enhanced caching
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies for production
RUN apt-get update && apt-get install -y \
    curl \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy Python packages from builder stage
COPY --from=builder /root/.local /root/.local

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash --user-group cea

# Copy application code and configuration
COPY backendv1/ .
COPY langgraph.json ./langgraph.json

# Create necessary directories with proper permissions
RUN mkdir -p logs .langgraph_api && \
    chown -R cea:cea /app

# Switch to non-root user
USER cea

# Configure environment for enhanced functionality
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV LANGCHAIN_TRACING_V2=false
ENV LANGCHAIN_PROJECT=climate-economy-assistant-v1

# Configure LangGraph specific settings
ENV LANGGRAPH_CONFIG_PATH=/app/langgraph.json
ENV LANGGRAPH_API_PORT=8123
ENV LANGGRAPH_API_HOST=0.0.0.0

# Health check for container monitoring with enhanced endpoints
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || \
        curl -f http://localhost:8000/ || \
        curl -f http://localhost:8123/health || exit 1

# Expose ports for FastAPI and LangGraph
EXPOSE 8000 8123

# Create entrypoint script for multi-service startup
COPY <<EOF /app/entrypoint.sh
#!/bin/bash
set -e

echo "🚀 Starting Climate Economy Assistant V1 with Supervisor Workflow..."

# Function to start services based on mode
start_service() {
    case "\$1" in
        "supervisor")
            echo "🎯 Starting in Supervisor Workflow mode..."
            # Start LangGraph API server for supervisor workflow
            langgraph serve --host 0.0.0.0 --port 8123 --config ./langgraph.json &
            LANGGRAPH_PID=\$!
            echo "📡 LangGraph API started with PID \$LANGGRAPH_PID"
            
            # Start FastAPI with supervisor integration
            uvicorn webapp:cea_app_v1 --host 0.0.0.0 --port 8000 --workers 1 --access-log
            ;;
        "api"|*)
            echo "🌐 Starting in FastAPI mode..."
            # Start FastAPI backend with enhanced features
            uvicorn webapp:cea_app_v1 --host 0.0.0.0 --port 8000 --workers \${WORKERS:-4} --access-log
            ;;
    esac
}

# Check for startup mode
MODE=\${STARTUP_MODE:-supervisor}
echo "🔧 Startup mode: \$MODE"

# Start the appropriate service
start_service \$MODE
EOF

# Make entrypoint executable
USER root
RUN chmod +x /app/entrypoint.sh
USER cea

# Default entrypoint with supervisor workflow support
ENTRYPOINT ["/app/entrypoint.sh"]

# Default command - can be overridden in compose or run commands
CMD ["supervisor"] 