"""
Database utilities for Climate Economy Assistant agents

This module provides helper functions for agents to interact with the database
without causing circular import issues.
"""

import logging
from typing import Any, Dict, List, Optional
from adapters.supabase import (
    query_database,
    insert_database_record,
    update_database_record,
)

logger = logging.getLogger("database_utils")


async def query_table(
    table: str,
    select: str = "*",
    filters: Optional[Dict[str, Any]] = None,
    order_by: Optional[str] = None,
    limit: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Query a table in the database (wrapper for query_database)

    Args:
        table: Table name
        select: Select statement
        filters: Column-value filters
        order_by: Column to order by
        limit: Row limit

    Returns:
        Dict with query results
    """
    return await query_database(
        table=table,
        select=select,
        filters=filters,
        order_column=order_by,
        limit=limit or 10,
    )


async def get_database_record(
    table: str, record_id: str, select: str = "*"
) -> Dict[str, Any]:
    """
    Get a specific record from the database by ID

    Args:
        table: Table name
        record_id: Record ID to fetch
        select: Select statement

    Returns:
        Dict with record data or error
    """
    try:
        result = await query_database(
            table=table, select=select, filters={"id": record_id}, limit=1
        )

        if result.get("success") and result.get("data"):
            return {"success": True, "data": result["data"][0], "found": True}
        else:
            return {"success": True, "data": None, "found": False}

    except Exception as e:
        logger.error(f"Error getting database record: {str(e)}")
        return {"success": False, "error": str(e), "data": None}


async def store_database_record(
    table: str, data: Dict[str, Any], record_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Store a record in the database (insert or update)

    Args:
        table: Table name
        data: Record data
        record_id: Optional record ID for updates

    Returns:
        Dict with operation result
    """
    try:
        if record_id:
            # Update existing record
            return await update_database_record(table, record_id, data)
        else:
            # Insert new record
            return await insert_database_record(table, data)

    except Exception as e:
        logger.error(f"Error storing database record: {str(e)}")
        return {"success": False, "error": str(e), "data": None}


# Specialized helper functions for agent use cases


async def get_user_resume_data(user_id: str) -> Optional[Dict[str, Any]]:
    """Get the most recent resume for a user from the resumes table"""
    try:
        result = await query_database(
            table="resumes",
            select="*",
            filters={"user_id": user_id},
            order_column="created_at",
            order_desc=True,
            limit=1,
        )

        if result.get("success") and result.get("data"):
            return result["data"][0]
        return None

    except Exception as e:
        logger.error(f"Error getting user resume: {e}")
        return None


async def get_user_conversations(user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Get recent conversations for a user"""
    try:
        result = await query_database(
            table="conversations",
            select="*",
            filters={"user_id": user_id},
            order_column="last_activity",
            order_desc=True,
            limit=limit,
        )

        if result.get("success"):
            return result.get("data", [])
        return []

    except Exception as e:
        logger.error(f"Error getting user conversations: {e}")
        return []


async def log_conversation_message(
    conversation_id: str,
    message_id: str,
    role: str,
    content: str,
    specialist_type: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> bool:
    """Log a conversation message to the database"""
    try:
        message_data = {
            "id": message_id,
            "conversation_id": conversation_id,
            "role": role,
            "content": content,
            "specialist_type": specialist_type,
            "metadata": metadata or {},
            "created_at": "now()",
            "processed": True,
        }

        result = await insert_database_record("conversation_messages", message_data)
        return result.get("success", False)

    except Exception as e:
        logger.error(f"Error logging conversation message: {e}")
        return False


async def get_partner_organizations(
    climate_focus: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Get partner organizations, optionally filtered by climate focus"""
    try:
        filters = {"verified": True} if not climate_focus else None

        result = await query_database(
            table="partner_profiles",
            select="organization_name, description, climate_focus, website, email, phone",
            filters=filters,
            order_column="organization_name",
            limit=20,
        )

        if result.get("success"):
            partners = result.get("data", [])

            # Filter by climate focus if specified
            if climate_focus:
                filtered_partners = []
                for partner in partners:
                    focus_areas = partner.get("climate_focus", [])
                    if isinstance(focus_areas, list) and any(
                        climate_focus.lower() in area.lower() for area in focus_areas
                    ):
                        filtered_partners.append(partner)
                return filtered_partners

            return partners
        return []

    except Exception as e:
        logger.error(f"Error getting partner organizations: {e}")
        return []


async def get_job_listings_for_skills(
    skills: List[str], limit: int = 10
) -> List[Dict[str, Any]]:
    """Get job listings that match the provided skills"""
    try:
        result = await query_database(
            table="job_listings",
            select="title, description, skills_required, salary_range, location, partner_id, application_url",
            filters={"is_active": True},
            order_column="created_at",
            order_desc=True,
            limit=limit * 2,  # Get more to filter
        )

        if result.get("success"):
            jobs = result.get("data", [])

            # Score jobs based on skill matches
            scored_jobs = []
            for job in jobs:
                required_skills = job.get("skills_required", [])
                if isinstance(required_skills, list):
                    matches = sum(
                        1
                        for skill in skills
                        if any(skill.lower() in req.lower() for req in required_skills)
                    )
                    if matches > 0:
                        job["skill_match_score"] = (
                            matches / len(required_skills) if required_skills else 0
                        )
                        scored_jobs.append(job)

            # Sort by match score and return top results
            scored_jobs.sort(key=lambda x: x.get("skill_match_score", 0), reverse=True)
            return scored_jobs[:limit]

        return []

    except Exception as e:
        logger.error(f"Error getting job listings: {e}")
        return []


async def get_education_programs(
    program_type: Optional[str] = None,
) -> List[Dict[str, Any]]:
    """Get education programs, optionally filtered by type"""
    try:
        filters = {"is_active": True}
        if program_type:
            filters["program_type"] = program_type

        result = await query_database(
            table="education_programs",
            select="program_name, description, partner_id, skills_taught, duration, cost, application_url",
            filters=filters,
            order_column="program_name",
            limit=15,
        )

        if result.get("success"):
            return result.get("data", [])
        return []

    except Exception as e:
        logger.error(f"Error getting education programs: {e}")
        return []


async def translate_mos_code(mos_code: str) -> Optional[Dict[str, Any]]:
    """Translate a military MOS code to civilian equivalents"""
    try:
        result = await query_database(
            table="mos_translation",
            select="mos_title, civilian_equivalents, transferable_skills",
            filters={"mos_code": mos_code.upper()},
            limit=1,
        )

        if result.get("success") and result.get("data"):
            return result["data"][0]
        return None

    except Exception as e:
        logger.error(f"Error translating MOS code: {e}")
        return None


async def get_credential_evaluation(user_id: str) -> Optional[Dict[str, Any]]:
    """Get credential evaluation for international user"""
    try:
        result = await query_database(
            table="credential_evaluation",
            select="credential_type, issuing_country, us_equivalent, evaluation_status",
            filters={"user_id": user_id},
            order_column="updated_at",
            order_desc=True,
            limit=1,
        )

        if result.get("success") and result.get("data"):
            return result["data"][0]
        return None

    except Exception as e:
        logger.error(f"Error getting credential evaluation: {e}")
        return None
