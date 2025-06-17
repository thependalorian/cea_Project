"""
Tools for credential evaluation in the Climate Economy Assistant.

This module provides functionality for evaluating international credentials
and determining their equivalency in the US system.
"""

import json
from typing import Any, Dict, Optional
from langchain_core.tools import tool
from adapters.supabase import get_supabase_client
from backendv1.utils.logger import setup_logger

logger = setup_logger("credentials_tools")


@tool
async def evaluate_credentials(
    credential_type: str, credential_name: str, issuing_country: Optional[str] = None
) -> str:
    """
    Evaluate international credentials and provide equivalency information.

    Args:
        credential_type: Type of credential (degree, certificate, etc.)
        credential_name: Name of the credential
        issuing_country: Country that issued the credential

    Returns:
        str: Evaluation results as a formatted string
    """
    try:
        supabase = get_supabase_client()

        # Query credential_evaluation table for similar credentials
        query = supabase.table("credential_evaluation").select("*")

        if issuing_country:
            query = query.eq("issuing_country", issuing_country.upper()[:3])  # ISO 3-letter code

        if credential_type:
            query = query.ilike("credential_type", f"%{credential_type}%")

        response = query.limit(5).execute()

        if response.data and len(response.data) > 0:
            # Found existing evaluations
            evaluations = response.data

            # Format the database results
            formatted_results = []
            for eval_record in evaluations:
                formatted_results.append(
                    f"""
**Credential Type**: {eval_record.get('credential_type', 'Unknown')}
**Issuing Country**: {eval_record.get('issuing_country', 'Unknown')}
**US Equivalent**: {eval_record.get('us_equivalent', 'Evaluation pending')}
**Status**: {eval_record.get('evaluation_status', 'Pending')}
**Last Updated**: {eval_record.get('updated_at', 'Unknown')}
"""
                )

            country_info = f" from {issuing_country}" if issuing_country else ""

            return f"""
# **Credential Evaluation Results**

Based on our database of credential evaluations for {credential_name}{country_info}:

## **Similar Evaluations Found:**
{chr(10).join(formatted_results)}

## **Recommended Next Steps:**
• **Formal Evaluation**: Submit to World Education Services (WES) or Educational Credential Evaluators (ECE)
• **Professional Licensing**: Check Massachusetts licensing requirements for your field
• **Additional Certifications**: Consider US-specific certifications to strengthen your profile
• **Portfolio Development**: Document your international experience and projects

## **Resources:**
• **WES**: www.wes.org (Most widely recognized)
• **ECE**: www.ece.org (Detailed evaluations)
• **MA Professional Licensure**: www.mass.gov/professional-licensure
• **Climate Career Guidance**: Contact our career specialists for field-specific advice

**Note**: This information is based on similar credential evaluations in our database. For official evaluation, use a NACES-approved service.
"""
        else:
            # No existing evaluations found - provide general guidance
            country_info = f" from {issuing_country}" if issuing_country else ""

            return f"""
# **Credential Evaluation Guidance**

For your {credential_name}{country_info}:

## **Evaluation Process:**
• **Step 1**: Choose a NACES-approved evaluation service
• **Step 2**: Submit official transcripts and documents
• **Step 3**: Pay evaluation fees ($150-$400 typically)
• **Step 4**: Wait for processing (2-8 weeks)
• **Step 5**: Receive official evaluation report

## **Recommended Services:**
• **World Education Services (WES)**: Most widely recognized by employers
• **Educational Credential Evaluators (ECE)**: Detailed course-by-course evaluations
• **International Education Research Foundation (IERF)**: Comprehensive service

## **Climate Career Considerations:**
• **Engineering Fields**: May require PE license in Massachusetts
• **Environmental Science**: Graduate degrees often preferred
• **Business/Policy**: MBA or policy degrees highly valued
• **Technical Fields**: Consider additional US certifications

## **Massachusetts Resources:**
• **MA Department of Professional Licensure**: State licensing requirements
• **MassCEC**: Clean energy career pathways
• **ACT Alliance**: Climate career guidance and support

**Contact our international career specialists for personalized guidance on your credential evaluation strategy.**
"""

    except Exception as e:
        logger.error(f"Error evaluating credentials: {e}")
        return f"""
# **Credential Evaluation Service**

We're currently experiencing technical difficulties accessing our credential database.

## **Direct Resources:**
• **World Education Services (WES)**: www.wes.org
• **Educational Credential Evaluators (ECE)**: www.ece.org
• **MA Professional Licensure**: www.mass.gov/professional-licensure

## **General Guidance:**
For {credential_name} credentials, most employers in Massachusetts accept evaluations from NACES-approved services. The process typically takes 2-8 weeks and costs $150-$400.

**Please contact our support team for personalized assistance: info@act-alliance.org**
"""


@tool
async def search_credential_database(
    credential_type: Optional[str] = None,
    issuing_country: Optional[str] = None,
    us_equivalent: Optional[str] = None,
) -> str:
    """
    Search the credential evaluation database for specific criteria.

    Args:
        credential_type: Type of credential to search for
        issuing_country: Country that issued the credential
        us_equivalent: US equivalent degree/certification

    Returns:
        str: Search results as a formatted string
    """
    try:
        supabase = get_supabase_client()

        query = supabase.table("credential_evaluation").select("*")

        if credential_type:
            query = query.ilike("credential_type", f"%{credential_type}%")
        if issuing_country:
            query = query.eq("issuing_country", issuing_country.upper()[:3])
        if us_equivalent:
            query = query.ilike("us_equivalent", f"%{us_equivalent}%")

        response = query.limit(10).execute()

        if response.data and len(response.data) > 0:
            results = []
            for record in response.data:
                results.append(
                    f"""
**Credential**: {record.get('credential_type', 'Unknown')}
**Country**: {record.get('issuing_country', 'Unknown')}
**US Equivalent**: {record.get('us_equivalent', 'Evaluation pending')}
**Status**: {record.get('evaluation_status', 'Pending')}
"""
                )

            return f"""
# **Credential Database Search Results**

Found {len(response.data)} matching credential evaluations:

{chr(10).join(results)}

**Note**: These are examples from our database. For official evaluation, use a NACES-approved service.
"""
        else:
            return """
# **Credential Database Search**

No matching credential evaluations found in our database.

## **Recommended Action:**
Submit your credentials to a NACES-approved evaluation service:
• **World Education Services (WES)**: www.wes.org
• **Educational Credential Evaluators (ECE)**: www.ece.org

**Contact our international career specialists for personalized guidance.**
"""

    except Exception as e:
        logger.error(f"Error searching credential database: {e}")
        return "Unable to search credential database at this time. Please contact support for assistance."


async def evaluate_credentials(credentials: str):
    return {"recognition": "partial", "equivalency": "bachelor_degree"}


async def get_credential_pathways(field: str):
    return [{"pathway": "certification", "duration": "6 months"}]
