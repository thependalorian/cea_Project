"""
Audit and Security routes for the Climate Economy Assistant.
Handles audit logs, security audit logs, and workflow sessions.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import structlog

from backend.database.supabase_client import supabase
from backend.api.middleware.auth import verify_token

logger = structlog.get_logger(__name__)
router = APIRouter()


# Audit Logs Management
@router.post("/logs", response_model=Dict[str, Any])
async def create_audit_log(
    log_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create audit log entry.
    - Records user actions and system events
    - Tracks changes to data and system configuration
    - Maintains compliance and security audit trails
    """
    try:
        # Validate required fields
        required_fields = ["action_type", "resource_type"]
        for field in required_fields:
            if not log_data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Set metadata
        log_data["user_id"] = user_id
        log_data["timestamp"] = datetime.utcnow().isoformat()
        log_data["created_at"] = datetime.utcnow().isoformat()
        
        # Insert audit log
        result = supabase.table("audit_logs").insert(log_data).execute()
        
        if result.data:
            logger.info(f"Created audit log {result.data[0]['id']} for user {user_id}")
            return {"success": True, "log": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create audit log")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating audit log: {e}")
        raise HTTPException(status_code=500, detail="Failed to create audit log")


@router.get("/logs", response_model=Dict[str, Any])
async def get_audit_logs(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    action_type: Optional[str] = Query(None),
    resource_type: Optional[str] = Query(None),
    target_user_id: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get audit logs with filtering and pagination.
    - Admin-only access to system audit logs
    - Supports filtering by action type, resource, user, and date range
    - Returns detailed audit trail for compliance and security monitoring
    """
    try:
        # Check if user has permission to view audit logs (admin only)
        admin_result = supabase.table("admin_profiles").select("id, can_manage_system").eq("user_id", user_id).execute()
        
        if not admin_result.data or not admin_result.data[0].get("can_manage_system"):
            raise HTTPException(status_code=403, detail="Not authorized to view audit logs")
        
        query = supabase.table("audit_logs").select("*")
        
        # Apply filters
        if action_type:
            query = query.eq("action_type", action_type)
        if resource_type:
            query = query.eq("resource_type", resource_type)
        if target_user_id:
            query = query.eq("user_id", target_user_id)
        if date_from:
            query = query.gte("timestamp", date_from)
        if date_to:
            query = query.lte("timestamp", date_to)
        
        # Apply pagination and ordering
        result = (
            query
            .order("timestamp", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} audit logs for user {user_id}")
        
        return {
            "success": True,
            "logs": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting audit logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to get audit logs")


@router.get("/logs/{log_id}", response_model=Dict[str, Any])
async def get_audit_log(
    log_id: str,
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get specific audit log entry by ID.
    - Returns detailed audit log information
    - Includes full context and metadata
    - Admin-only access for security and compliance
    """
    try:
        # Check if user has permission to view audit logs (admin only)
        admin_result = supabase.table("admin_profiles").select("id, can_manage_system").eq("user_id", user_id).execute()
        
        if not admin_result.data or not admin_result.data[0].get("can_manage_system"):
            raise HTTPException(status_code=403, detail="Not authorized to view audit logs")
        
        result = supabase.table("audit_logs").select("*").eq("id", log_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Audit log not found")
            
        log_entry = result.data[0]
        
        logger.info(f"Retrieved audit log {log_id} for user {user_id}")
        
        return {"success": True, "log": log_entry}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting audit log {log_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get audit log")


# Security Audit Logs Management
@router.post("/security", response_model=Dict[str, Any])
async def create_security_audit_log(
    log_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create security audit log entry.
    - Records security-related events and alerts
    - Tracks authentication, authorization, and access attempts
    - Maintains security compliance and threat monitoring
    """
    try:
        # Validate required fields
        required_fields = ["event_type", "severity_level"]
        for field in required_fields:
            if not log_data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Set metadata
        log_data["user_id"] = user_id
        log_data["timestamp"] = datetime.utcnow().isoformat()
        log_data["created_at"] = datetime.utcnow().isoformat()
        
        # Insert security audit log
        result = supabase.table("security_audit_logs").insert(log_data).execute()
        
        if result.data:
            logger.info(f"Created security audit log {result.data[0]['id']} for user {user_id}")
            return {"success": True, "log": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create security audit log")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating security audit log: {e}")
        raise HTTPException(status_code=500, detail="Failed to create security audit log")


@router.get("/security", response_model=Dict[str, Any])
async def get_security_audit_logs(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    event_type: Optional[str] = Query(None),
    severity_level: Optional[str] = Query(None),
    ip_address: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get security audit logs with filtering and pagination.
    - Admin-only access to security logs
    - Supports filtering by event type, severity, IP address, and date range
    - Returns security event data for threat analysis and compliance
    """
    try:
        # Check if user has permission to view security audit logs (admin only)
        admin_result = supabase.table("admin_profiles").select("id, can_manage_system").eq("user_id", user_id).execute()
        
        if not admin_result.data or not admin_result.data[0].get("can_manage_system"):
            raise HTTPException(status_code=403, detail="Not authorized to view security audit logs")
        
        query = supabase.table("security_audit_logs").select("*")
        
        # Apply filters
        if event_type:
            query = query.eq("event_type", event_type)
        if severity_level:
            query = query.eq("severity_level", severity_level)
        if ip_address:
            query = query.eq("ip_address", ip_address)
        if date_from:
            query = query.gte("timestamp", date_from)
        if date_to:
            query = query.lte("timestamp", date_to)
        
        # Apply pagination and ordering
        result = (
            query
            .order("timestamp", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} security audit logs for user {user_id}")
        
        return {
            "success": True,
            "logs": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting security audit logs: {e}")
        raise HTTPException(status_code=500, detail="Failed to get security audit logs")


@router.get("/security/alerts", response_model=Dict[str, Any])
async def get_security_alerts(
    limit: int = Query(10, ge=1, le=50),
    severity_level: Optional[str] = Query("high"),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get active security alerts and high-priority events.
    - Returns recent high-severity security events
    - Admin-only access for security monitoring
    - Includes threat indicators and recommended actions
    """
    try:
        # Check if user has permission to view security alerts (admin only)
        admin_result = supabase.table("admin_profiles").select("id, can_manage_system").eq("user_id", user_id).execute()
        
        if not admin_result.data or not admin_result.data[0].get("can_manage_system"):
            raise HTTPException(status_code=403, detail="Not authorized to view security alerts")
        
        # Get recent high-severity events
        recent_time = (datetime.utcnow() - timedelta(hours=24)).isoformat()
        
        query = (
            supabase.table("security_audit_logs")
            .select("*")
            .eq("severity_level", severity_level)
            .gte("timestamp", recent_time)
            .order("timestamp", desc=True)
            .limit(limit)
            .execute()
        )
        
        alerts = query.data if query.data else []
        
        logger.info(f"Retrieved {len(alerts)} security alerts for user {user_id}")
        
        return {
            "success": True,
            "alerts": alerts,
            "alert_count": len(alerts),
            "severity_level": severity_level,
            "time_range": "24 hours"
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting security alerts: {e}")
        raise HTTPException(status_code=500, detail="Failed to get security alerts")


# Workflow Sessions Management
@router.post("/workflows", response_model=Dict[str, Any])
async def create_workflow_session(
    session_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Create workflow session record.
    - Tracks user workflow sessions and agent interactions
    - Records session context and progress state
    - Enables workflow resumption and analytics
    """
    try:
        # Validate required fields
        required_fields = ["workflow_type", "session_status"]
        for field in required_fields:
            if not session_data.get(field):
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        # Set metadata
        session_data["user_id"] = user_id
        session_data["started_at"] = datetime.utcnow().isoformat()
        session_data["created_at"] = datetime.utcnow().isoformat()
        session_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Insert workflow session
        result = supabase.table("workflow_sessions").insert(session_data).execute()
        
        if result.data:
            logger.info(f"Created workflow session {result.data[0]['id']} for user {user_id}")
            return {"success": True, "session": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to create workflow session")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error creating workflow session: {e}")
        raise HTTPException(status_code=500, detail="Failed to create workflow session")


@router.get("/workflows", response_model=Dict[str, Any])
async def get_workflow_sessions(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    workflow_type: Optional[str] = Query(None),
    session_status: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get workflow sessions for current user or all users (if admin).
    - Returns user's workflow session history
    - Supports filtering by workflow type, status, and date
    - Admin access shows all sessions for analytics
    """
    try:
        # Check user permissions
        admin_result = supabase.table("admin_profiles").select("id, can_view_analytics").eq("user_id", user_id).execute()
        is_admin = admin_result.data and admin_result.data[0].get("can_view_analytics")
        
        query = supabase.table("workflow_sessions").select("*")
        
        # Restrict to user's own sessions if not admin
        if not is_admin:
            query = query.eq("user_id", user_id)
        
        # Apply filters
        if workflow_type:
            query = query.eq("workflow_type", workflow_type)
        if session_status:
            query = query.eq("session_status", session_status)
        if date_from:
            query = query.gte("started_at", date_from)
        
        # Apply pagination and ordering
        result = (
            query
            .order("started_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        
        logger.info(f"Retrieved {len(result.data)} workflow sessions for user {user_id}")
        
        return {
            "success": True,
            "sessions": result.data if result.data else [],
            "pagination": {
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting workflow sessions: {e}")
        raise HTTPException(status_code=500, detail="Failed to get workflow sessions")


@router.get("/workflows/{session_id}", response_model=Dict[str, Any])
async def get_workflow_session(
    session_id: str,
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get specific workflow session by ID.
    - Returns complete session details and context
    - Includes session progress and interaction history
    - User can access own sessions, admin can access all
    """
    try:
        result = supabase.table("workflow_sessions").select("*").eq("id", session_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Workflow session not found")
            
        session = result.data[0]
        
        # Check if user owns this session or is admin
        admin_result = supabase.table("admin_profiles").select("id, can_view_analytics").eq("user_id", user_id).execute()
        is_admin = admin_result.data and admin_result.data[0].get("can_view_analytics")
        is_owner = session["user_id"] == user_id
        
        if not is_admin and not is_owner:
            raise HTTPException(status_code=403, detail="Not authorized to view this workflow session")
        
        logger.info(f"Retrieved workflow session {session_id} for user {user_id}")
        
        return {"success": True, "session": session}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting workflow session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to get workflow session")


@router.put("/workflows/{session_id}", response_model=Dict[str, Any])
async def update_workflow_session(
    session_id: str,
    update_data: Dict[str, Any],
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Update workflow session.
    - Updates session status, progress, and context
    - Records session completion and outcomes
    - User can update own sessions only
    """
    try:
        # Check if user owns this session
        session_result = supabase.table("workflow_sessions").select("user_id").eq("id", session_id).execute()
        
        if not session_result.data:
            raise HTTPException(status_code=404, detail="Workflow session not found")
            
        if session_result.data[0]["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this workflow session")
        
        # Set update metadata
        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        # Set ended_at if session is being completed
        if update_data.get("session_status") in ["completed", "cancelled", "failed"]:
            update_data["ended_at"] = datetime.utcnow().isoformat()
        
        # Update workflow session
        result = (
            supabase.table("workflow_sessions")
            .update(update_data)
            .eq("id", session_id)
            .execute()
        )
        
        if result.data:
            logger.info(f"Updated workflow session {session_id} by user {user_id}")
            return {"success": True, "session": result.data[0]}
        else:
            raise HTTPException(status_code=500, detail="Failed to update workflow session")
            
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating workflow session {session_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update workflow session")


# Audit Reports and Analytics
@router.get("/reports/activity-summary", response_model=Dict[str, Any])
async def get_activity_summary_report(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    user_id: str = Depends(verify_token)
) -> Dict[str, Any]:
    """
    Get system activity summary report.
    - Returns aggregated audit and activity metrics
    - Includes user activity, security events, and workflow statistics
    - Admin-only access for system monitoring
    """
    try:
        # Check if user has permission to view reports (admin only)
        admin_result = supabase.table("admin_profiles").select("id, can_manage_system").eq("user_id", user_id).execute()
        
        if not admin_result.data or not admin_result.data[0].get("can_manage_system"):
            raise HTTPException(status_code=403, detail="Not authorized to view activity reports")
        
        # Set default date range if not provided
        if not date_from:
            date_from = (datetime.utcnow() - timedelta(days=7)).isoformat()
        if not date_to:
            date_to = datetime.utcnow().isoformat()
        
        # Get audit logs summary
        audit_query = (
            supabase.table("audit_logs")
            .select("action_type, resource_type")
            .gte("timestamp", date_from)
            .lte("timestamp", date_to)
            .execute()
        )
        
        # Get security logs summary
        security_query = (
            supabase.table("security_audit_logs")
            .select("event_type, severity_level")
            .gte("timestamp", date_from)
            .lte("timestamp", date_to)
            .execute()
        )
        
        # Get workflow sessions summary
        workflow_query = (
            supabase.table("workflow_sessions")
            .select("workflow_type, session_status")
            .gte("started_at", date_from)
            .lte("started_at", date_to)
            .execute()
        )
        
        # Calculate summary metrics
        audit_data = audit_query.data if audit_query.data else []
        security_data = security_query.data if security_query.data else []
        workflow_data = workflow_query.data if workflow_query.data else []
        
        summary = {
            "date_range": {
                "from": date_from,
                "to": date_to
            },
            "metrics": {
                "total_audit_events": len(audit_data),
                "total_security_events": len(security_data),
                "total_workflow_sessions": len(workflow_data),
                "high_severity_security_events": len([s for s in security_data if s.get("severity_level") == "high"]),
                "completed_workflows": len([w for w in workflow_data if w.get("session_status") == "completed"])
            },
            "breakdowns": {
                "audit_by_action": {},
                "security_by_severity": {},
                "workflows_by_type": {}
            }
        }
        
        # Calculate breakdowns
        for log in audit_data:
            action = log.get("action_type", "unknown")
            summary["breakdowns"]["audit_by_action"][action] = summary["breakdowns"]["audit_by_action"].get(action, 0) + 1
        
        for log in security_data:
            severity = log.get("severity_level", "unknown")
            summary["breakdowns"]["security_by_severity"][severity] = summary["breakdowns"]["security_by_severity"].get(severity, 0) + 1
        
        for session in workflow_data:
            workflow_type = session.get("workflow_type", "unknown")
            summary["breakdowns"]["workflows_by_type"][workflow_type] = summary["breakdowns"]["workflows_by_type"].get(workflow_type, 0) + 1
        
        logger.info(f"Generated activity summary report for user {user_id}")
        
        return {"success": True, "summary": summary}
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error generating activity summary report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate activity summary report") 