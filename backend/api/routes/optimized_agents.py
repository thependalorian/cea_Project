"""
🚀 Optimized Agents Backend Routes
FastAPI routes for high-performance agent processing using the optimized framework.

Performance targets:
- Routing: <50ms
- Total response: <1000ms
- Cache hit rate: >80%
"""

import asyncio
import json
import logging
import time
from datetime import datetime
from typing import Dict, Any, Optional

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

# Import optimized framework
from backend.agents.langgraph.functional_framework import (
    process_message_optimized,
    stream_message_optimized,
    get_optimization_status,
    OptimizedResponse
)
from backend.api.middleware.auth import get_current_user
from backend.api.middleware.rate_limit import rate_limit_check
from backend.utils.logger import get_logger

# Initialize router and logger
router = APIRouter(prefix="/api/agents/optimized", tags=["optimized-agents"])
logger = get_logger(__name__)

# Request/Response models
class OptimizedRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000, description="User message to process")
    user_id: str = Field(..., description="User ID")
    conversation_id: str = Field(..., description="Conversation ID")
    stream: bool = Field(default=False, description="Enable streaming response")

class OptimizedStatusResponse(BaseModel):
    framework: str
    version: str
    features: Dict[str, bool]
    performance_targets: Dict[str, str]
    agent_teams: Dict[str, str]
    total_agents: int
    model_provider: str
    timestamp: str
    status: str = "operational"

class PerformanceMetrics(BaseModel):
    routing_time_ms: float
    processing_time_ms: float
    cache_hit: bool
    under_threshold: bool
    framework: str = "optimized"

# Performance thresholds
ROUTING_THRESHOLD_MS = 50
TOTAL_THRESHOLD_MS = 1000

@router.post("/", response_model=Dict[str, Any])
async def process_message_optimized_endpoint(
    request: OptimizedRequest,
    current_user: Dict = Depends(get_current_user),
    rate_limit: Dict = Depends(rate_limit_check)
):
    """
    Process message using optimized framework for sub-second performance
    """
    start_time = time.perf_counter()
    
    try:
        # Log request
        logger.info(f"🚀 Optimized processing request from user {request.user_id}")
        
        # Process with optimized framework
        result: OptimizedResponse = await process_message_optimized(
            message=request.message,
            user_id=request.user_id,
            conversation_id=request.conversation_id
        )
        
        # Calculate total processing time
        total_time = (time.perf_counter() - start_time) * 1000
        
        # Performance monitoring
        performance_alert = total_time > TOTAL_THRESHOLD_MS
        routing_alert = result.metadata.get("routing_time_ms", 0) > ROUTING_THRESHOLD_MS
        
        if performance_alert or routing_alert:
            logger.warning(f"⚠️ Performance threshold exceeded: "
                         f"total={total_time:.1f}ms, "
                         f"routing={result.metadata.get('routing_time_ms', 0):.1f}ms")
        
        # Prepare response
        response_data = {
            "content": result.content,
            "agent": result.agent,
            "team": result.team,
            "confidence": result.confidence,
            "processing_time_ms": result.processing_time_ms,
            "total_api_time_ms": total_time,
            "metadata": result.metadata,
            "performance_metrics": {
                "under_threshold": not performance_alert,
                "routing_fast": not routing_alert,
                "cache_effectiveness": result.metadata.get("cache_hit", False),
                "framework": "optimized"
            },
            "success": True,
            "timestamp": datetime.now().isoformat()
        }
        
        logger.info(f"✅ Optimized response completed: {result.agent} "
                   f"({total_time:.1f}ms total, {result.processing_time_ms:.1f}ms processing)")
        
        return response_data
        
    except Exception as e:
        total_time = (time.perf_counter() - start_time) * 1000
        logger.error(f"❌ Optimized processing error: {e}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Optimized processing failed",
                "message": str(e),
                "processing_time_ms": total_time,
                "framework": "optimized",
                "success": False,
                "timestamp": datetime.now().isoformat()
            }
        )

@router.post("/stream")
async def stream_message_optimized_endpoint(
    request: OptimizedRequest,
    current_user: Dict = Depends(get_current_user),
    rate_limit: Dict = Depends(rate_limit_check)
):
    """
    Stream message processing with real-time updates using optimized framework
    """
    async def generate_stream():
        """Generate Server-Sent Events stream"""
        try:
            logger.info(f"🚀 Starting optimized stream for user {request.user_id}")
            
            async for chunk in stream_message_optimized(
                message=request.message,
                user_id=request.user_id,
                conversation_id=request.conversation_id
            ):
                # Format as Server-Sent Event
                chunk_data = {
                    **chunk,
                    "timestamp": datetime.now().isoformat(),
                    "framework": "optimized"
                }
                
                sse_data = f"data: {json.dumps(chunk_data)}\n\n"
                yield sse_data.encode('utf-8')
                
                # Small delay to ensure proper streaming
                await asyncio.sleep(0.01)
                
                # End stream on completion or error
                if chunk.get("type") in ["complete", "error"]:
                    break
            
            logger.info("✅ Optimized stream completed successfully")
            
        except Exception as e:
            logger.error(f"❌ Optimized streaming error: {e}")
            
            # Send error event
            error_data = {
                "type": "error",
                "data": {
                    "error": str(e),
                    "framework": "optimized",
                    "timestamp": datetime.now().isoformat()
                }
            }
            
            yield f"data: {json.dumps(error_data)}\n\n".encode('utf-8')
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    )

@router.get("/status", response_model=OptimizedStatusResponse)
async def get_optimization_status_endpoint():
    """
    Get optimization framework status and performance metrics
    """
    try:
        status = get_optimization_status()
        
        return OptimizedStatusResponse(
            **status,
            timestamp=datetime.now().isoformat(),
            status="operational"
        )
        
    except Exception as e:
        logger.error(f"❌ Status check error: {e}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to get optimization status",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )

@router.get("/health")
async def health_check():
    """
    Health check endpoint for monitoring
    """
    try:
        # Quick performance test
        start_time = time.perf_counter()
        
        # Test Redis cache (if available)
        cache_status = "unknown"
        try:
            from backend.database.redis_client import redis_client
            if redis_client:
                await redis_client.ping()
                cache_status = "healthy"
        except Exception:
            cache_status = "unavailable"
        
        # Test optimization framework
        status = get_optimization_status()
        
        health_check_time = (time.perf_counter() - start_time) * 1000
        
        return {
            "status": "healthy",
            "framework": "optimized",
            "version": status.get("version", "1.0"),
            "cache_status": cache_status,
            "health_check_time_ms": health_check_time,
            "performance_targets": {
                "routing_threshold_ms": ROUTING_THRESHOLD_MS,
                "total_threshold_ms": TOTAL_THRESHOLD_MS
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Health check failed: {e}")
        
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@router.get("/metrics")
async def get_performance_metrics():
    """
    Get detailed performance metrics for monitoring
    """
    try:
        # Get framework status
        status = get_optimization_status()
        
        # Get cache statistics (if available)
        cache_stats = {}
        try:
            from backend.database.redis_client import redis_client
            if redis_client:
                info = await redis_client.info()
                cache_stats = {
                    "keyspace_hits": info.get("keyspace_hits", 0),
                    "keyspace_misses": info.get("keyspace_misses", 0),
                    "connected_clients": info.get("connected_clients", 0),
                    "used_memory": info.get("used_memory_human", "0B")
                }
        except Exception:
            cache_stats = {"status": "unavailable"}
        
        return {
            "framework_status": status,
            "cache_statistics": cache_stats,
            "performance_thresholds": {
                "routing_ms": ROUTING_THRESHOLD_MS,
                "total_ms": TOTAL_THRESHOLD_MS
            },
            "monitoring": {
                "alerts_enabled": True,
                "performance_tracking": True,
                "cache_monitoring": True
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"❌ Metrics error: {e}")
        
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Failed to get performance metrics",
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
        )

# Export router
__all__ = ["router"] 