# BackendV1 Documentation

This directory contains documentation specific to the BackendV1 implementation of the Climate Economy Assistant project.

## Overview

BackendV1 is the current production backend implementation that uses:

- **LangGraph 2025**: For agent workflows and orchestration
- **FastAPI**: For API endpoints and request handling
- **Supabase**: For database and authentication
- **7 Specialist Agents**: Pendo, Lauren, Mai, Marcus, Miguel, Liv, Jasmine, and Alex

## Key Components

- **Climate Supervisor Workflow**: The main orchestration workflow that routes user queries to appropriate specialist agents
- **Human-in-the-Loop System**: Allows for human intervention and steering in AI workflows
- **Role-Based Authentication**: Comprehensive authentication system with multiple user roles
- **Empathy Routing**: Intelligent routing based on user needs and emotional context

## Migration from Legacy Backend

BackendV1 represents a significant improvement over the legacy backend implementation, with:

- Improved state management
- Better error handling
- More efficient agent routing
- Enhanced security features
- Comprehensive logging and analytics

## Documentation Index

- [BACKENDV1_MIGRATION_COMPLETE.md](../migration/BACKENDV1_MIGRATION_COMPLETE.md) - Documentation of completed BackendV1 migration
- [BACKEND_VS_BACKENDV1_MIGRATION_ANALYSIS.md](../migration/BACKEND_VS_BACKENDV1_MIGRATION_ANALYSIS.md) - Analysis of Backend vs BackendV1 migration
- [LANGGRAPH_2025_IMPLEMENTATION.md](../workflows/LANGGRAPH_2025_IMPLEMENTATION.md) - Implementation of LangGraph 2025
- [LANGGRAPH_WORKFLOWS_V1.md](../workflows/LANGGRAPH_WORKFLOWS_V1.md) - V1 of LangGraph workflows
- [SUPERVISOR_INTEGRATION.md](../workflows/SUPERVISOR_INTEGRATION.md) - Integration of supervisor
- [PYDANTIC_MODELS_CRITICAL_DIFFERENCES.md](../architecture/PYDANTIC_MODELS_CRITICAL_DIFFERENCES.md) - Critical differences in Pydantic models

## Setup and Deployment

For setup and deployment instructions specific to BackendV1, please refer to:

- [ENVIRONMENT_SETUP.md](../deployment/ENVIRONMENT_SETUP.md) - Environment setup documentation
- [DOCKER_DEPLOYMENT.md](../deployment/DOCKER_DEPLOYMENT.md) - Docker deployment documentation
- [verify-deployment.sh](../deployment/verify-deployment.sh) - Script for verifying deployment
