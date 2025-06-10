#!/usr/bin/env python3
"""
Climate Economy Seed Partners Creation Script

Creates seed partner accounts with proper auth.users and profiles records
based on real current data from partner websites (June 2025), including 
AI-optimized PDF ingestion, embeddings creation, and comprehensive resources.
"""

import os
import asyncio
import logging
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple, Optional
from pathlib import Path
from dotenv import load_dotenv
import traceback

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

try:
    from supabase import create_client
    import openai
    from openai import OpenAI
    import pypdf
    from pypdf import PdfReader
    import requests
    import io
    import re
    import hashlib
    import uuid
    from urllib.parse import urlparse, urljoin
except ImportError as e:
    logger.error(f"Missing required dependency: {e}")
    logger.error("Please install with: pip install -r requirements.txt")
    exit(1)

# Initialize clients
try:
    # Get Supabase credentials from environment
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    logger.info(f"Connecting to Supabase: {supabase_url}")
    
    # Try to create client with basic options only
    from supabase.lib.client_options import ClientOptions
    options = ClientOptions()
    supabase = create_client(supabase_url, supabase_key, options)
    
    # Try to get OpenAI API key from environment, or use a placeholder
    openai_api_key = os.environ.get("OPENAI_API_KEY")
    if not openai_api_key:
        logger.warning("OPENAI_API_KEY not found in environment. Some features may not work.")
        # Create a dummy client for testing
        openai_client = None
    else:
        openai_client = OpenAI(api_key=openai_api_key)
        logger.info("OpenAI client initialized successfully")
        
except Exception as e:
    logger.error(f"Failed to initialize clients: {e}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    exit(1)

# PDF Configuration with full file paths
PDFS_DIR = Path("/Users/georgenekwaya/Downloads/projects_genai/climate_economy_ecosystem/temp_repo_clean/pdfs")

# Climate domain knowledge resources (PDFs to be ingested)
CLIMATE_DOMAIN_RESOURCES = [
    {
        "file": PDFS_DIR / "NECEC_2023_Annual_Report.pdf",
        "title": "NECEC 2023 Annual Report",
        "domain": "policy",
        "topics": ["clean_energy_economy", "massachusetts_policy", "energy_transition"],
        "description": "Comprehensive annual report on New England Clean Energy Council activities and clean energy economy growth"
    },
    {
        "file": PDFS_DIR / "Powering_the_Future_A_Massachusetts_Clean_Energy_Workforce_Needs_Assessment_Final.pdf", 
        "title": "Powering the Future: A Massachusetts Clean Energy Workforce Needs Assessment",
        "domain": "workforce",
        "topics": ["clean_energy_jobs", "skills_gap", "workforce_development"],
        "description": "Detailed workforce analysis identifying skill gaps and training needs in Massachusetts clean energy sector"
    }
]

# Real current partner data from June 2025 web searches - MATCHING SETUP.MD EXACTLY
PARTNERS_DATA_2025 = {
    "tps_energy": {
        "name": "TPS Energy",
        "organization_type": "employer",
        "website": "https://tps-energy.com/",
        "description": "Leading solar installation and renewable energy company in Massachusetts, specializing in residential and commercial solar projects with focus on workforce development.",
        "climate_focus": ["solar", "energy_efficiency"],
        "partnership_level": "standard",
        "headquarters_location": "Woburn, MA",
        "organization_size": "medium",
        "employee_count": 150,
        "founded_year": 2010,
        "verified": True,
        "contact_info": {
            "email": "careers@tpsenergy.com",
            "phone": "978-204-0530",
            "address": "Woburn, MA",
            "contact_person": "HR Director"
        },
        "hiring_actively": True,
        "training_programs": ["Solar Installation Certification", "NABCEP Prep"],
        "current_programs": [
            {
                "title": "Solar Installation Technician Training",
                "type": "job_training",
                "description": "Hands-on solar panel installation training with NABCEP certification prep",
                "requirements": ["High school diploma", "Physical fitness", "Willingness to work at heights"],
                "duration": "8 weeks",
                "cost": "Free for qualified candidates",
                "next_cohort": "July 2025"
            }
        ]
    },
    
    "franklin_cummings": {
        "name": "Franklin Cummings Tech",
        "organization_type": "education",
        "website": "https://franklincummings.edu/",
        "description": "Private technical college offering career-focused programs in renewable energy, HVAC, and green building technologies with emphasis on hands-on learning.",
        "climate_focus": ["renewable_energy", "energy_efficiency", "technical_education"],
        "partnership_level": "premium",
        "headquarters_location": "41 Berkeley Street, Boston, MA 02116",
        "organization_size": "medium",
        "employee_count": 200,
        "founded_year": 1965,
        "verified": True,
        "contact_info": {
            "email": "admissions@fctinc.org",
            "phone": "617-423-4630",
            "address": "41 Berkeley Street, Boston, MA 02116",
            "contact_person": "Admissions Director"
        },
        "current_programs": [
            {
                "title": "Renewable Energy Technology Associate Degree",
                "type": "education",
                "description": "Comprehensive 18-month program covering solar, wind, and energy storage systems",
                "accreditation": "NEASC accredited",
                "duration": "18 months",
                "start_dates": ["September 2025", "January 2026"]
            }
        ]
    },
    
    "urban_league_eastern_ma": {
        "name": "Urban League of Eastern Massachusetts",
        "organization_type": "community",
        "website": "https://www.ulem.org/",
        "description": "Community organization providing workforce development and job placement services with focus on equity and diversity in clean energy careers.",
        "climate_focus": ["workforce_development", "equity"],
        "partnership_level": "standard",
        "headquarters_location": "Boston, MA",
        "organization_size": "medium",
        "employee_count": 75,
        "founded_year": 1960,
        "verified": True,
        "contact_info": {
            "email": "info@ulem.org",
            "phone": "617-442-4519",
            "address": "Boston, MA",
            "contact_person": "Workforce Development Director"
        },
        "current_programs": [
            {
                "title": "Clean Energy Career Pathways Program",
                "type": "workforce_development",
                "description": "Comprehensive workforce development program connecting community members to clean energy careers",
                "target_audience": ["ej_communities", "career_changers"],
                "duration": "12 weeks",
                "support_services": ["Career coaching", "Job placement", "Skills training"]
            }
        ]
    },
    
    "headlamp": {
        "name": "Headlamp",
        "organization_type": "community",
        "website": "https://myheadlamp.com/",
        "description": "Career guidance platform and veteran transition accelerator specializing in clean energy careers, with DOD SkillBridge program and innovative talent platform.",
        "climate_focus": ["career_guidance", "workforce_development"],
        "partnership_level": "standard",
        "headquarters_location": "Massachusetts",
        "organization_size": "small",
        "employee_count": 25,
        "founded_year": 2018,
        "verified": True,
        "contact_info": {
            "email": "info@headlamp.io",
            "address": "Massachusetts",
            "contact_person": "Program Director"
        },
        "current_programs": [
            {
                "title": "Clean Energy Career Guidance Program",
                "type": "career_guidance",
                "description": "Personalized career guidance and pathway mapping for clean energy careers",
                "target_audience": ["veterans", "career_changers"],
                "format": "Online platform with coaching support"
            },
            {
                "title": "DOD SkillBridge Program",
                "type": "apprenticeship",
                "description": "DOD SkillBridge renewal approved until May 2027 for veteran transitions to clean energy",
                "duration": "Up to 6 months",
                "target_audience": ["veterans", "military_transitioning"],
                "status": "Active through May 2027",
                "compensation": "Military pay continues during program"
            }
        ]
    },
    
    "african_bridge_network": {
        "name": "African Bridge Network",
        "organization_type": "community",
        "website": "https://africanbn.org/",
        "description": "Supporting immigrant professionals transition to clean energy careers through fellowship programs and workforce development initiatives, celebrating 10th anniversary in 2025.",
        "climate_focus": ["immigrant_professionals", "workforce_integration"],
        "partnership_level": "standard",
        "headquarters_location": "Boston, MA",
        "organization_size": "small",
        "employee_count": 20,
        "founded_year": 2015,
        "verified": True,
        "contact_info": {
            "email": "info@africanbridgenetwork.org",
            "phone": "617-442-7440",
            "address": "Boston, MA",
            "contact_person": "Executive Director"
        },
        "current_programs": [
            {
                "title": "Immigrant Professionals Fellowship for Clean Energy",
                "type": "fellowship",
                "description": "Supporting healthcare and research professionals transitioning to clean energy careers",
                "target_audience": ["immigrant_professionals", "healthcare_workers", "researchers"],
                "focus_areas": ["Career transition", "Professional development", "Clean energy sector orientation"],
                "duration": "6 months",
                "next_orientation": "June 28, 2025 at MassHire Metro North"
            }
        ]
    },
    
    "masshire_career_centers": {
        "name": "MassHire Career Centers",
        "organization_type": "government",
        "website": "https://www.mass.gov/masshire-career-centers",
        "description": "Statewide network of 25+ career centers providing workforce development services including sustainable energy training and JobQuest platform.",
        "climate_focus": ["workforce_development", "job_placement"],
        "partnership_level": "founding",
        "headquarters_location": "Statewide - 25+ locations",
        "organization_size": "large",
        "employee_count": 500,
        "founded_year": 1998,
        "verified": True,
        "contact_info": {
            "email": "masshire@mass.gov",
            "phone": "617-626-5300",
            "address": "Statewide - 25+ locations",
            "contact_person": "State Director"
        },
        "current_programs": [
            {
                "title": "Sustainable Energy Pre-Apprenticeship TRADES Training",
                "type": "pre_apprenticeship",
                "description": "Comprehensive pre-apprenticeship training for sustainable energy careers",
                "duration": "June-August 2025",
                "focus_areas": ["Solar installation", "Energy efficiency", "Green building"],
                "certification": "Industry-recognized credentials",
                "career_pathways": ["Solar installer", "Energy auditor", "Green building technician"]
            },
            {
                "title": "JobQuest Platform Access",
                "type": "job_placement",
                "description": "Digital platform connecting job seekers with clean energy employers",
                "features": ["Job matching", "Skills assessment", "Career coaching"],
                "availability": "All MassHire locations statewide"
            }
        ]
    },
    
    "masscec": {
        "name": "Massachusetts Clean Energy Center",
        "organization_type": "government",
        "website": "https://www.masscec.com/",
        "description": "State agency accelerating clean energy adoption and workforce development, with comprehensive internship and training programs.",
        "climate_focus": ["clean_energy", "workforce_development", "equity", "offshore_wind"],
        "partnership_level": "founding",
        "headquarters_location": "294 Washington St, Boston, MA 02108",
        "organization_size": "large",
        "employee_count": 100,
        "founded_year": 2008,
        "verified": True,
        "contact_info": {
            "email": "info@masscec.com",
            "phone": "617-315-9300",
            "address": "294 Washington St, Boston, MA 02108",
            "contact_person": "Workforce Development Director"
        },
        "current_programs": [
            {
                "title": "Clean Energy Internship Program",
                "type": "internship",
                "description": "Paid internships at 600+ clean energy companies with wage reimbursement for employers",
                "stats": "5,000+ students placed since inception",
                "reimbursement": "$4,320/intern (fall/spring), $8,640/intern (summer)",
                "application_status": "Summer 2025 applications open"
            },
            {
                "title": "MassCEC Equity Program",
                "type": "workforce_development",
                "description": "Targeted workforce development programs for environmental justice communities",
                "target_audience": ["ej_communities", "underrepresented_groups"],
                "focus_areas": ["Clean energy careers", "Skills development", "Job placement"],
                "partnerships": ["Community organizations", "Educational institutions"]
            }
        ]
    }
}

# Update the partner profile data structure to include broader resource columns
# and add a comprehensive partner resources system

# Add new comprehensive partner resources data structure after PARTNERS_DATA_2025
COMPREHENSIVE_PARTNER_RESOURCES_2025 = {
    "tps_energy": {
        "digital_presence": {
            "website": "https://tps-energy.com/",
            "linkedin": "https://www.linkedin.com/company/tps-energy/",
            "careers_page": "https://tps-energy.com/careers/",
            "facebook": "https://www.facebook.com/TPSEnergyMA/",
            "instagram": "@tpsenergy",
            "youtube": "https://www.youtube.com/c/TPSEnergy",
            "blog_url": "https://tps-energy.com/blog/",
            "newsletter_signup": "https://tps-energy.com/newsletter/"
        },
        "resources": [
            {
                "type": "webinar",
                "title": "Solar Installation Best Practices 2025",
                "description": "Monthly webinar series covering latest solar installation techniques and safety protocols",
                "url": "https://tps-energy.com/webinars/",
                "frequency": "monthly",
                "target_audience": ["installers", "technicians", "homeowners"],
                "format": "virtual",
                "cost": "free"
            },
            {
                "type": "event",
                "title": "TPS Energy Solar Showcase",
                "description": "Annual showcase of completed solar projects and new technology demonstrations",
                "url": "https://tps-energy.com/events/showcase/",
                "frequency": "annual",
                "target_audience": ["customers", "partners", "industry"],
                "format": "in_person",
                "location": "Woburn, MA"
            },
            {
                "type": "resource_library",
                "title": "Solar Installation Guides",
                "description": "Comprehensive library of installation guides, safety manuals, and technical specifications",
                "url": "https://tps-energy.com/resources/",
                "content_types": ["pdf_guides", "video_tutorials", "safety_checklists"],
                "access": "public"
            }
        ]
    },
    
    "franklin_cummings": {
        "digital_presence": {
            "website": "https://franklincummings.edu/",
            "linkedin": "https://www.linkedin.com/school/franklin-cummings-tech/",
            "careers_page": "https://franklincummings.edu/work-here/",
            "facebook": "https://www.facebook.com/FranklinCummingsTech/",
            "instagram": "@franklincummingstech",
            "youtube": "https://www.youtube.com/c/FranklinCummingsTech",
            "student_portal": "https://my.franklincummings.edu/",
            "canvas_lms": "https://franklincummings.instructure.com/"
        },
        "resources": [
            {
                "type": "info_session",
                "title": "Renewable Energy Technology Info Sessions",
                "description": "Virtual information sessions about renewable energy programs and career pathways",
                "url": "https://franklincummings.edu/event/renewable-info/",
                "frequency": "monthly",
                "target_audience": ["prospective_students", "career_changers"],
                "format": "virtual",
                "cost": "free"
            },
            {
                "type": "career_event",
                "title": "Renewable Energy Career Day",
                "description": "Annual career day featuring employers, hands-on activities, and program demonstrations",
                "url": "https://franklincummings.edu/event/renewable-energy-career-day/",
                "frequency": "annual",
                "target_audience": ["high_school_students", "prospective_students"],
                "format": "in_person",
                "location": "Boston, MA"
            }
        ]
    },
    
    "masscec": {
        "digital_presence": {
            "website": "https://www.masscec.com/",
            "linkedin": "https://www.linkedin.com/company/masscec/",
            "careers_page": "https://www.masscec.com/about-masscec/careers-masscec",
            "twitter": "@MassCEC",
            "youtube": "https://www.youtube.com/user/MassCEC",
            "blog": "https://www.masscec.com/blog",
            "newsletter": "https://www.masscec.com/newsletter-signup",
            "workforce_portal": "https://masscec.force.com/",
            "events_calendar": "https://www.masscec.com/events"
        },
        "resources": [
            {
                "type": "internship_program",
                "title": "Clean Energy Internship Program",
                "description": "Year-round paid internship program connecting students with clean energy companies",
                "url": "https://www.masscec.com/clean-energy-internships-students",
                "frequency": "ongoing",
                "target_audience": ["college_students", "recent_graduates"],
                "format": "hybrid",
                "compensation": "$18_per_hour"
            },
            {
                "type": "webinar_series",
                "title": "Clean Energy Industry Webinars",
                "description": "Regular webinar series covering industry trends, policy updates, and technology innovations",
                "url": "https://www.masscec.com/webinars",
                "frequency": "bi_weekly",
                "target_audience": ["industry_professionals", "policymakers", "researchers"],
                "format": "virtual",
                "cost": "free"
            }
        ]
    }
}

# Add ADMIN_USERS_DATA_2025 after COMPREHENSIVE_PARTNER_RESOURCES_2025

# NEW: Create admin users data for comprehensive admin capabilities based on 2025 research
ADMIN_USERS_DATA_2025 = {
    "alliance_climate_transition": {
        "name": "Alliance for Climate Transition (ACT)",
        "organization_type": "nonprofit",
        "website": "https://www.joinact.org/",
        "description": "Nonprofit organization focusing on climate action and community-driven initiatives for sustainable economic transition. Acts as system administrator for the Climate Economy Assistant platform.",
        "admin_level": "super",
        "department": "Climate Economy Platform Administration",
        "headquarters_location": "Massachusetts",
        "founded_year": 2020,
        "verified": True,
        "contact_info": {
            "email": "admin@joinact.org",
            "phone": "617-555-0199",
            "address": "Massachusetts",
            "contact_person": "Platform Administrator"
        },
        # 2025 Admin Capabilities based on research
        "permissions": [
            "manage_users", "manage_partners", "manage_content", "view_analytics", 
            "manage_system", "user_impersonation", "audit_access", "role_management",
            "dashboard_analytics", "compliance_reporting", "data_visualization",
            "user_behavior_analytics", "performance_monitoring", "security_oversight",
            "api_management", "integration_management", "backup_restore", 
            "system_configuration", "policy_enforcement", "access_reviews",
            "vulnerability_assessment", "incident_response", "change_management"
        ],
        "admin_capabilities": {
            "user_management": {
                "view_all_profiles": True,
                "edit_user_data": True,
                "reset_passwords": True,
                "manage_user_roles": True,
                "impersonate_users": True,
                "bulk_user_operations": True,
                "user_lifecycle_management": True,
                "access_user_analytics": True
            },
            "partner_management": {
                "approve_partner_applications": True,
                "manage_partnership_levels": True,
                "verify_partner_credentials": True,
                "manage_partner_resources": True,
                "partner_performance_analytics": True,
                "partnership_reporting": True
            },
            "content_management": {
                "manage_knowledge_base": True,
                "approve_resource_publications": True,
                "content_moderation": True,
                "manage_educational_content": True,
                "content_analytics": True,
                "seo_management": True
            },
            "analytics_dashboard": {
                "user_engagement_metrics": True,
                "platform_performance_analytics": True,
                "job_placement_statistics": True,
                "training_completion_rates": True,
                "partner_effectiveness_metrics": True,
                "economic_impact_analysis": True,
                "skills_gap_analysis": True,
                "demographic_reporting": True,
                "real_time_monitoring": True,
                "predictive_analytics": True,
                "custom_report_generation": True,
                "data_export_capabilities": True
            },
            "system_oversight": {
                "security_monitoring": True,
                "audit_trail_access": True,
                "system_health_monitoring": True,
                "api_usage_monitoring": True,
                "error_tracking": True,
                "performance_optimization": True,
                "backup_management": True,
                "disaster_recovery": True
            },
            "compliance_security": {
                "gdpr_compliance_management": True,
                "data_privacy_controls": True,
                "access_control_audits": True,
                "security_incident_response": True,
                "vulnerability_scanning": True,
                "compliance_reporting": True,
                "risk_assessment": True
            }
        },
        "current_programs": [
            {
                "title": "Climate Economy Platform Administration",
                "type": "system_administration",
                "description": "Comprehensive administration of the Climate Economy Assistant platform including user management, partner oversight, and system analytics",
                "target_audience": ["platform_users", "partners", "job_seekers"],
                "focus_areas": ["Platform governance", "User experience optimization", "Data analytics", "Security management"],
                "format": "Digital platform administration with real-time monitoring and support"
            },
            {
                "title": "Community Climate Action Analytics",
                "type": "data_analytics",
                "description": "Advanced analytics and reporting on climate workforce development impact and community engagement metrics",
                "target_audience": ["policy_makers", "researchers", "partners"],
                "focus_areas": ["Impact measurement", "Workforce trends", "Economic analysis", "Policy insights"],
                "format": "Interactive dashboards and comprehensive reporting suite"
            }
        ]
    },
    
    "buffr": {
        "name": "Buffr Inc.",
        "organization_type": "startup",
        "website": "https://buffr.ai/",
        "description": "AI Product Manager & Business Strategist with extensive experience in climate technology, fintech innovation, and global business development. Bridging technical and business domains with unique background in engineering, MBA in Data Analytics, and climate tech entrepreneurship.",
        "admin_level": "super",
        "department": "AI & Business Strategy",
        "headquarters_location": "Massachusetts", "Namibia",
        "education": {
            "mba": "Brandeis International Business School - Data Analytics & Strategy",
            "engineering": "Namibian University of Science and Technology (NUST) - Civil Engineering",
            "exchange": "FH-Aachen, Germany - Project Management Research"
        },
        "verified": True,
        "contact_info": {
            "email": "george@buffr.ai",
            "phone": "206-530-8433",
            "address": "Massachusetts",
            "contact_person": "George Nekwaya",
            "linkedin": "https://www.linkedin.com/in/george-nekwaya/",
            "personal_website": "https://georgenekwaya.com/"
        },
        # 2025 Admin Capabilities - AI & Business Strategy Focus
        "permissions": [
            "manage_users", "manage_partners", "manage_content", "view_analytics", 
            "ai_system_management", "business_intelligence", "strategic_planning",
            "dashboard_analytics", "data_visualization", "user_behavior_analytics", 
            "performance_monitoring", "api_management", "integration_management",
            "product_management", "innovation_oversight", "startup_ecosystem_management",
            "international_expansion", "fintech_integration", "ai_optimization"
        ],
        "admin_capabilities": {
            "ai_product_management": {
                "ai_system_optimization": True,
                "machine_learning_oversight": True,
                "ai_ethics_compliance": True,
                "predictive_analytics_management": True,
                "ai_training_data_management": True,
                "algorithm_performance_monitoring": True,
                "ai_integration_strategy": True,
                "natural_language_processing": True
            },
            "business_strategy": {
                "strategic_planning": True,
                "market_analysis": True,
                "competitive_intelligence": True,
                "business_model_optimization": True,
                "revenue_strategy": True,
                "partnership_development": True,
                "international_expansion": True,
                "startup_ecosystem_management": True
            },
            "data_analytics": {
                "advanced_data_analysis": True,
                "business_intelligence": True,
                "data_visualization": True,
                "statistical_modeling": True,
                "data_pipeline_management": True,
                "real_time_analytics": True,
                "custom_dashboard_creation": True,
                "data_governance": True
            },
            "innovation_management": {
                "product_roadmap_planning": True,
                "innovation_pipeline_management": True,
                "startup_incubation": True,
                "technology_assessment": True,
                "venture_capital_relations": True,
                "accelerator_program_management": True,
                "intellectual_property_strategy": True,
                "emerging_technology_evaluation": True
            },
            "global_operations": {
                "international_market_entry": True,
                "cross_cultural_business_development": True,
                "global_partnership_management": True,
                "emerging_markets_strategy": True,
                "cultural_adaptation_strategies": True,
                "international_compliance": True,
                "global_supply_chain_optimization": True,
                "multi_currency_operations": True
            },
            "fintech_expertise": {
                "financial_technology_integration": True,
                "payment_system_optimization": True,
                "blockchain_strategy": True,
                "digital_banking_solutions": True,
                "financial_inclusion_initiatives": True,
                "regulatory_compliance": True,
                "risk_management": True,
                "financial_analytics": True
            }
        },
        "professional_background": {
            "current_role": "AI Product Manager & Business Strategist",
            "climate_tech_experience": "ACT | The Alliance for Climate Transition",
            "accelerator_programs": ["Brandeis Spark", "MassChallenge Early Stage", "Global Venture Labs"],
            "global_experience": ["Namibia", "United States", "Israel", "India", "Germany", "UAE", "South Africa"],
            "specializations": ["AI/ML", "Climate Technology", "Fintech", "International Business", "Infrastructure Development"],
            "languages": ["English", "German (Exchange Program)"],
            "certifications": ["IRATA Level 1 Working at Heights", "Hassenfeld Fellow"]
        },
        "current_programs": [
            {
                "title": "AI-Powered Climate Economy Platform Development",
                "type": "ai_product_management",
                "description": "Leading the development and optimization of AI systems for the Climate Economy Assistant platform, including machine learning models for job matching, skills translation, and career pathway recommendations",
                "target_audience": ["job_seekers", "partners", "platform_users"],
                "focus_areas": ["AI/ML optimization", "User experience", "Predictive analytics", "Natural language processing"],
                "format": "Continuous AI system development and optimization with real-time performance monitoring"
            },
            {
                "title": "Global Climate Tech Business Strategy",
                "type": "business_strategy",
                "description": "Developing comprehensive business strategies for climate technology adoption and international expansion, leveraging global experience and emerging market insights",
                "target_audience": ["climate_tech_startups", "international_partners", "investors"],
                "focus_areas": ["Market expansion", "Partnership development", "Investment strategy", "Global operations"],
                "format": "Strategic consulting and business development with focus on emerging markets"
            },
            {
                "title": "Climate Fintech Innovation Initiative",
                "type": "fintech_innovation",
                "description": "Bridging climate technology and financial services to create accessible funding solutions for climate career transitions and green business development",
                "target_audience": ["job_seekers", "climate_entrepreneurs", "financial_institutions"],
                "focus_areas": ["Financial inclusion", "Green financing", "Digital payments", "Blockchain applications"],
                "format": "Fintech product development and financial technology integration"
            }
        ]
    }
}

class AIOptimizedChunker:
    """
    Optimized chunking strategy for AI agents focusing on:
    - Semantic coherence for better embeddings
    - Agent-specific context preservation
    - Structured metadata for intelligent retrieval
    """
    
    def __init__(self, max_chunk_size=1500, overlap_size=200):
        self.max_chunk_size = max_chunk_size  # Optimized for AI context windows
        self.overlap_size = overlap_size
        
    def chunk_content(self, content: str, source_metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Create AI-optimized chunks with enhanced metadata."""
        
        # Clean and preprocess content
        content = self._preprocess_content(content)
        
        # Detect content type and structure
        content_type = self._detect_content_type(content)
        
        if content_type == "structured":
            chunks = self._chunk_structured_content(content, source_metadata)
        else:
            chunks = self._chunk_semantic_content(content, source_metadata)
            
        return chunks
    
    def _preprocess_content(self, content: str) -> str:
        """Clean content for better AI processing."""
        # Remove excessive whitespace
        content = re.sub(r'\s+', ' ', content)
        # Fix common PDF artifacts
        content = re.sub(r'([a-z])([A-Z])', r'\1 \2', content)
        # Normalize quotes
        content = re.sub(r'["""]', '"', content)
        content = re.sub(r"[''']", "'", content)
        return content.strip()
    
    def _detect_content_type(self, content: str) -> str:
        """Detect if content is structured (has clear sections) or narrative."""
        section_indicators = [
            r'^\s*(?:Chapter|Section|Part)\s+\d+',
            r'^\s*\d+\.\s+[A-Z]',
            r'^\s*[A-Z][A-Z\s]+:',
            r'##\s+',
            r'###\s+'
        ]
        
        for indicator in section_indicators:
            if re.search(indicator, content, re.MULTILINE):
                return "structured"
        return "narrative"
    
    def _chunk_structured_content(self, content: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Chunk structured content by sections."""
        chunks = []
        
        # Split by common section markers
        sections = re.split(r'(?=^\s*(?:Chapter|Section|Part|\d+\.|##|###))', content, flags=re.MULTILINE)
        
        for i, section in enumerate(sections):
            if not section.strip():
                continue
                
            # Extract section title
            title_match = re.search(r'^([^\n]+)', section.strip())
            section_title = title_match.group(1) if title_match else f"Section {i+1}"
            
            # Create chunks from section
            section_chunks = self._create_semantic_chunks(section, self.max_chunk_size)
            
            for j, chunk_text in enumerate(section_chunks):
                chunks.append({
                    'content': chunk_text,
                    'metadata': {
                        **metadata,
                        'section_title': section_title,
                        'section_index': i,
                        'chunk_index': j,
                        'content_type': 'structured',
                        'chunk_type': 'section'
                    }
                })
        
        return chunks
    
    def _chunk_semantic_content(self, content: str, metadata: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Chunk narrative content semantically."""
        chunks = []
        
        # Split by paragraphs first
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        
        current_chunk = ""
        chunk_index = 0
        
        for paragraph in paragraphs:
            # Check if adding this paragraph would exceed limit
            if len(current_chunk) + len(paragraph) > self.max_chunk_size and current_chunk:
                # Save current chunk
                chunks.append({
                    'content': current_chunk.strip(),
                    'metadata': {
                        **metadata,
                        'chunk_index': chunk_index,
                        'content_type': 'narrative',
                        'chunk_type': 'semantic'
                    }
                })
                
                # Start new chunk with overlap
                overlap_text = self._extract_overlap(current_chunk)
                current_chunk = overlap_text + paragraph
                chunk_index += 1
            else:
                # Add paragraph to current chunk
                current_chunk += "\n\n" + paragraph if current_chunk else paragraph
        
        # Add final chunk
        if current_chunk.strip():
            chunks.append({
                'content': current_chunk.strip(),
                'metadata': {
                    **metadata,
                    'chunk_index': chunk_index,
                    'content_type': 'narrative',
                    'chunk_type': 'semantic'
                }
            })
        
        return chunks
    
    def _create_semantic_chunks(self, text: str, max_size: int) -> List[str]:
        """Create chunks based on semantic boundaries."""
        if len(text) <= max_size:
            return [text]
        
        # Try to split on sentence boundaries
        sentences = re.split(r'(?<=[.!?])\s+', text)
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            if len(current_chunk) + len(sentence) > max_size and current_chunk:
                chunks.append(current_chunk.strip())
                current_chunk = sentence
            else:
                current_chunk += " " + sentence if current_chunk else sentence
        
        if current_chunk.strip():
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def _extract_overlap(self, text: str) -> str:
        """Extract overlap text from end of chunk."""
        if len(text) <= self.overlap_size:
            return text
        
        # Try to find sentence boundary for clean overlap
        overlap_text = text[-self.overlap_size:]
        sentence_start = overlap_text.find('. ')
        if sentence_start > 0:
            return overlap_text[sentence_start + 2:]
        
        return overlap_text

async def process_pdf_resource(pdf_info: Dict[str, Any], chunker: AIOptimizedChunker) -> List[Dict[str, Any]]:
    """Process a PDF resource and return knowledge resources."""
    
    try:
        pdf_path = pdf_info["file"]
        
        # Check if file exists
        if not pdf_path.exists():
            logger.error(f"PDF file not found: {pdf_path}")
            return []
        
        logger.info(f"Processing PDF: {pdf_path}")
        
        # Extract text from PDF
        pdf_reader = PdfReader(str(pdf_path))
        full_text = ""
        
        for page in pdf_reader.pages:
            full_text += page.extract_text() + "\n\n"
        
        if not full_text.strip():
            logger.warning(f"No text extracted from PDF: {pdf_path}")
            return []
        
        # Create source metadata
        source_metadata = {
            "source_type": "pdf",
            "file_path": str(pdf_path),
            "file_name": pdf_path.name,
            "title": pdf_info["title"],
            "domain": pdf_info["domain"],
            "topics": pdf_info["topics"],
            "year": "2025"
        }
        
        # Chunk the content
        chunks = chunker.chunk_content(full_text, source_metadata)
        
        resources = []
        for chunk in chunks:
            # Generate embedding
            embedding = await generate_embedding(chunk["content"])
            
            # Create resource record
            resource_data = {
                "id": str(uuid.uuid4()),
                "title": f"{pdf_info['title']} - Part {chunk['metadata']['chunk_index'] + 1}",
                "description": pdf_info.get("description", chunk["content"][:200] + "..."),
                "content": chunk["content"],
                "content_type": "pdf",
                "source_url": f"file://{pdf_path}",
                "domain": pdf_info["domain"],
                "topics": pdf_info["topics"],
                "tags": pdf_info["topics"] + [pdf_info["domain"], "policy_document", "research", "2025"],
                "categories": [pdf_info["domain"], "pdf", "research"],
                "target_audience": ["policy_makers", "researchers", "workforce_developers"],
                "embedding": embedding,
                "metadata": chunk["metadata"]
            }
            
            resources.append(resource_data)
        
        logger.info(f"Created {len(resources)} resources from {pdf_path}")
        return resources
        
    except Exception as e:
        logger.error(f"Error processing PDF {pdf_info['file']}: {str(e)}")
        return []

async def ingest_pdf_resources() -> Dict[str, int]:
    """Ingest all PDF resources into the knowledge base."""
    
    stats = {"processed": 0, "resources_created": 0, "failed": 0}
    chunker = AIOptimizedChunker()
    
    # Ensure PDFs directory exists
    if not PDFS_DIR.exists():
        logger.warning(f"PDFs directory not found: {PDFS_DIR}")
        logger.info("Creating PDFs directory...")
        PDFS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Log expected PDF locations
        logger.info("Expected PDF files:")
        for pdf_info in CLIMATE_DOMAIN_RESOURCES:
            logger.info(f"  - {pdf_info['file']}")
            logger.info(f"    Title: {pdf_info['title']}")
            logger.info(f"    Domain: {pdf_info['domain']}")
        
        return stats
    
    for pdf_info in CLIMATE_DOMAIN_RESOURCES:
        try:
            resources = await process_pdf_resource(pdf_info, chunker)
            
            if resources:
                # Insert all resources for this PDF
                for resource in resources:
                    try:
                        supabase.table("knowledge_resources").insert(resource).execute()
                        stats["resources_created"] += 1
                    except Exception as e:
                        logger.error(f"Failed to insert resource: {e}")
                        stats["failed"] += 1
                
                stats["processed"] += 1
                logger.info(f"Successfully processed {pdf_info['title']}")
            else:
                stats["failed"] += 1
                logger.error(f"Failed to process {pdf_info['title']}")
                
        except Exception as e:
            logger.error(f"Error processing {pdf_info['title']}: {str(e)}")
            stats["failed"] += 1
    
    return stats

async def generate_embedding(text: str) -> List[float]:
    """Generate embedding for text using OpenAI."""
    try:
        if openai_client is None:
            logger.warning("OpenAI client not available, returning dummy embedding")
            # Return a dummy embedding vector for testing
            return [0.0] * 1536
            
        response = await asyncio.to_thread(
            openai_client.embeddings.create,
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        # Return dummy embedding on error
        return [0.0] * 1536

async def create_job_listing_from_program(partner_id: str, partner_data: Dict, program: Dict) -> Dict[str, Any]:
    """Create a job listing from a program."""
    
    # Determine employment type
    employment_type = program.get("employment_type", "full_time")
    if program["type"] == "apprenticeship":
        employment_type = "apprenticeship"
    elif program["type"] == "job_training":
        employment_type = "training"
    elif "internship" in program.get("title", "").lower():
        employment_type = "internship"
    
    # Extract requirements and responsibilities
    requirements = []
    if "requirements" in program:
        requirements = program["requirements"] if isinstance(program["requirements"], list) else [program["requirements"]]
    elif "eligibility" in program:
        eligibility = program["eligibility"]
        requirements = eligibility if isinstance(eligibility, list) else [eligibility]
    
    # Generate job description
    description = program.get("description", "")
    if "focus_areas" in program:
        description += f"\n\nFocus Areas: {', '.join(program['focus_areas'])}"
    if "duration" in program:
        description += f"\n\nProgram Duration: {program['duration']}"
    if "compensation" in program:
        description += f"\n\nCompensation: {program['compensation']}"
    
    # Use program-specific location or default to partner address
    location = program.get("location", partner_data.get("contact_info", {}).get("address", "Massachusetts"))
    
    # Use program-specific experience level or default
    experience_level = program.get("experience_level", "entry_level")
    
    # Use program-specific salary range
    salary_range = program.get("salary_range", program.get("compensation", program.get("reimbursement", None)))
    
    # Use program-specific climate focus or default to partner's
    climate_focus = program.get("climate_focus", partner_data.get("climate_focus", []))
    
    # Use program-specific skills or focus areas
    skills_required = program.get("skills_required", program.get("focus_areas", []))
    
    job_data = {
        "id": str(uuid.uuid4()),
        "partner_id": partner_id,
        "title": program["title"],
        "description": description,
        "requirements": "\n".join(requirements) if requirements else None,
        "responsibilities": program.get("focus", ""),
        "location": location,
        "employment_type": employment_type,
        "experience_level": experience_level,
        "salary_range": salary_range,
        "climate_focus": climate_focus,
        "skills_required": skills_required,
        "benefits": program.get("support_services", None),
        "application_url": partner_data.get("website"),
        "application_email": partner_data.get("contact_info", {}).get("email"),
        "is_active": True,
        "expires_at": None
    }
    
    return job_data

async def create_education_program_from_program(partner_id: str, partner_data: Dict, program: Dict) -> Dict[str, Any]:
    """Create an education program from a program."""
    
    # Determine program type
    program_type = "certificate"
    if program["type"] == "education":
        if "degree" in program.get("title", "").lower():
            program_type = "degree"
        elif "certificate" in program.get("title", "").lower():
            program_type = "certificate"
    elif program["type"] == "internship":
        program_type = "internship"
    elif program["type"] == "fellowship":
        program_type = "fellowship"
    elif program["type"] == "workforce_development":
        program_type = "workshop"
    elif program["type"] == "pre_apprenticeship":
        program_type = "pre_apprenticeship"
    
    # Determine format
    format_type = "in_person"
    if "online" in program.get("description", "").lower():
        format_type = "online"
    elif "hybrid" in program.get("description", "").lower():
        format_type = "hybrid"
    
    # Extract cost information
    cost = "Contact for pricing"
    if "cost" in program:
        cost = program["cost"]
    elif "free" in program.get("description", "").lower():
        cost = "Free"
    elif "reimbursement" in program:
        cost = f"Employer reimbursement available: {program['reimbursement']}"
    
    # Generate comprehensive description
    description = program.get("description", "")
    if "focus_areas" in program:
        description += f"\n\nFocus Areas: {', '.join(program['focus_areas'])}"
    if "eligibility" in program:
        eligibility = program["eligibility"]
        if isinstance(eligibility, list):
            description += f"\n\nEligible Participants: {', '.join(eligibility)}"
        else:
            description += f"\n\nEligibility: {eligibility}"
    if "support_services" in program:
        services = program["support_services"]
        if isinstance(services, list):
            description += f"\n\nSupport Services: {', '.join(services)}"
        else:
            description += f"\n\nSupport Services: {services}"
    
    edu_data = {
        "id": str(uuid.uuid4()),
        "partner_id": partner_id,
        "program_name": program["title"],
        "description": description,
        "program_type": program_type,
        "duration": program.get("duration"),
        "format": format_type,
        "cost": cost,
        "prerequisites": "\n".join(program.get("requirements", [])) if program.get("requirements") else None,
        "climate_focus": partner_data.get("climate_focus", []),
        "skills_taught": program.get("focus_areas", []),
        "certification_offered": program.get("certification", program.get("accreditation")),
        "application_deadline": None,  # Would need specific dates
        "start_date": None,  # Would need specific dates
        "end_date": None,
        "contact_info": partner_data.get("contact_info", {}),
        "application_url": partner_data.get("website"),
        "is_active": True
    }
    
    return edu_data

def generate_program_content(partner_data: Dict, program: Dict) -> str:
    """Generate comprehensive content for a program."""
    
    content_parts = [
        f"# {partner_data['name']}: {program['title']}",
        f"\n## Organization Overview",
        f"**Organization Type:** {partner_data['organization_type'].title()}",
        f"**Website:** {partner_data['website']}",
        f"**Partnership Level:** {partner_data['partnership_level'].title()}",
        f"**Climate Focus Areas:** {', '.join(partner_data['climate_focus'])}",
        f"\n**Description:** {partner_data['description']}",
    ]
    
    if partner_data.get("contact_info"):
        content_parts.append("\n## Contact Information")
        for key, value in partner_data["contact_info"].items():
            if value:
                content_parts.append(f"**{key.title()}:** {value}")
    
    content_parts.extend([
        f"\n## Program: {program['title']}",
        f"**Program Type:** {program['type'].replace('_', ' ').title()}",
        f"\n**Description:** {program['description']}"
    ])
    
    # Add program-specific details
    for key, value in program.items():
        if key not in ['title', 'type', 'description']:
            if isinstance(value, list):
                content_parts.append(f"**{key.replace('_', ' ').title()}:** {', '.join(map(str, value))}")
            elif isinstance(value, dict):
                content_parts.append(f"\n### {key.replace('_', ' ').title()}")
                for sub_key, sub_value in value.items():
                    content_parts.append(f"**{sub_key.replace('_', ' ').title()}:** {sub_value}")
            else:
                content_parts.append(f"**{key.replace('_', ' ').title()}:** {value}")
    
    return "\n".join(content_parts)

def extract_topics(content: str) -> List[str]:
    """Extract topics from content using keyword analysis."""
    
    topic_keywords = {
        "solar": ["solar", "photovoltaic", "pv", "solar panel", "solar energy"],
        "wind": ["wind", "turbine", "wind energy", "offshore wind"],
        "hvac": ["hvac", "heating", "cooling", "heat pump"],
        "energy_efficiency": ["efficiency", "insulation", "audit", "retrofit"],
        "workforce_development": ["training", "apprenticeship", "career", "job", "workforce"],
        "innovation": ["innovation", "technology", "research", "development"]
    }
    
    content_lower = content.lower()
    topics = []
    
    for topic, keywords in topic_keywords.items():
        if any(keyword in content_lower for keyword in keywords):
            topics.append(topic)
    
    return topics[:5]

def generate_tags(partner_data: Dict, program: Dict) -> List[str]:
    """Generate tags for better searchability."""
    
    tags = [
        partner_data["organization_type"],
        partner_data["partnership_level"],
        program["type"],
        "2025",
        "massachusetts",
        "clean_energy"
    ]
    
    tags.extend(partner_data["climate_focus"])
    
    if "certification" in program.get("description", "").lower():
        tags.append("certification")
    if "free" in str(program).lower():
        tags.append("free")
    if "paid" in str(program).lower():
        tags.append("paid")
    
    return list(set(tags))

async def create_admin_user(admin_id: str, admin_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create an admin user account with comprehensive 2025 admin capabilities."""
    
    try:
        # Generate email and password for admin
        domain = admin_data['website'].replace('https://', '').replace('http://', '').split('/')[0]
        user_email = f"admin@{domain}"
        password = f"ClimateAdmin2025!{admin_id.title()}"
        
        user_id = None
        user_created = False
        
        try:
            # Create new auth user with admin metadata
            user_result = supabase.auth.admin.create_user({
                "email": user_email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {
                    "organization": admin_data["name"],
                    "role": "admin",
                    "admin_level": admin_data["admin_level"],
                    "created_date": "June 2025",
                    "platform_admin": True
                }
            })
            user_id = user_result.user.id
            user_created = True
            logger.info(f"Created new admin user for {admin_data['name']}")
            
        except Exception as auth_error:
            if "already been registered" in str(auth_error):
                logger.info(f"Admin user {user_email} already exists, updating profile...")
                
                # Get existing user by email
                existing_users = supabase.auth.admin.list_users()
                for user in existing_users:
                    if user.email == user_email:
                        user_id = user.id
                        break
                
                if not user_id:
                    # Delete and recreate if needed
                    logger.warning(f"Could not find existing admin user {user_email}, attempting to delete and recreate...")
                    try:
                        all_users = supabase.auth.admin.list_users()
                        for user in all_users:
                            if user.email == user_email:
                                supabase.auth.admin.delete_user(user.id)
                                logger.info(f"Deleted existing admin user {user_email}")
                                break
                        
                        # Recreate
                        user_result = supabase.auth.admin.create_user({
                            "email": user_email,
                            "password": password,
                            "email_confirm": True,
                            "user_metadata": {
                                "organization": admin_data["name"],
                                "role": "admin",
                                "admin_level": admin_data["admin_level"],
                                "created_date": "June 2025",
                                "platform_admin": True
                            }
                        })
                        user_id = user_result.user.id
                        user_created = True
                        logger.info(f"Successfully recreated admin user for {admin_data['name']}")
                        
                    except Exception as delete_error:
                        logger.error(f"Could not delete/recreate admin user: {delete_error}")
                        return {"success": False, "error": f"Could not handle existing admin user: {delete_error}"}
            else:
                raise auth_error
        
        if not user_id:
            return {"success": False, "error": "Could not obtain admin user ID"}
        
        # Create admin profile directly (no base profiles table in new schema)
        admin_profile_data = {
            "id": user_id,
            "full_name": f"Administrator - {admin_data['name']}",
            "email": user_email,
            "phone": admin_data["contact_info"].get("phone"),
            "admin_level": admin_data["admin_level"],
            "department": admin_data["department"],
            "permissions": admin_data["permissions"],
            "can_manage_users": True,
            "can_manage_partners": True,
            "can_manage_content": True,
            "can_view_analytics": True,
            "can_manage_system": True,
            "admin_notes": f"Platform administrator for {admin_data['name']} - Comprehensive system oversight and management capabilities",
            "direct_phone": admin_data["contact_info"].get("phone"),
            "emergency_contact": {
                "organization": admin_data["name"],
                "email": admin_data["contact_info"]["email"],
                "phone": admin_data["contact_info"].get("phone", "")
            }
        }
        
        try:
            # Try to insert admin profile
            supabase.table("admin_profiles").insert(admin_profile_data).execute()
        except Exception as admin_profile_error:
            if "duplicate key value" in str(admin_profile_error) or "already exists" in str(admin_profile_error):
                # Admin profile exists, update it
                logger.info(f"Admin profile exists for {admin_data['name']}, updating...")
                update_data = {k: v for k, v in admin_profile_data.items() if k != 'id'}
                supabase.table("admin_profiles").update(update_data).eq('id', user_id).execute()
            else:
                raise admin_profile_error
        
        # Clean up existing data for this admin
        try:
            supabase.table("knowledge_resources").delete().eq('partner_id', user_id).execute()
        except Exception as delete_error:
            logger.warning(f"Could not delete existing admin records: {delete_error}")
        
        # Create admin knowledge resources and capabilities
        resources_created = 0
        chunker = AIOptimizedChunker()
        
        for program in admin_data.get("current_programs", []):
            # Create comprehensive admin content
            content = generate_admin_program_content(admin_data, program)
            chunks = chunker.chunk_content(content, {
                "admin_id": user_id,
                "admin_name": admin_data["name"],
                "program_title": program["title"],
                "program_type": program["type"],
                "source_type": "admin_program",
                "admin_level": admin_data["admin_level"],
                "year": "2025"
            })
            
            for chunk in chunks:
                # Generate embedding
                embedding = await generate_embedding(chunk["content"])
                
                # Create resource record
                resource_data = {
                    "id": str(uuid.uuid4()),
                    "partner_id": user_id,  # Using partner_id field for consistency
                    "title": f"{admin_data['name']}: {program['title']}",
                    "description": program.get("description", ""),
                    "content": chunk["content"],
                    "content_type": "admin_capability",
                    "source_url": admin_data.get("website"),
                    "domain": "platform_administration",
                    "topics": extract_admin_topics(chunk["content"]),
                    "tags": generate_admin_tags(admin_data, program),
                    "categories": ["admin", "platform_management", program["type"]],
                    "target_audience": program.get("target_audience", ["platform_users"]),
                    "embedding": embedding,
                    "metadata": chunk["metadata"]
                }
                
                try:
                    supabase.table("knowledge_resources").insert(resource_data).execute()
                    resources_created += 1
                except Exception as e:
                    logger.error(f"Failed to create admin knowledge resource: {e}")
        
        action = "Created" if user_created else "Updated"
        return {
            "success": True,
            "user_id": user_id,
            "email": user_email,
            "password": password,
            "resources_created": resources_created,
            "admin_level": admin_data["admin_level"],
            "capabilities": len(admin_data["permissions"]),
            "action": action
        }
        
    except Exception as e:
        logger.error(f"Error creating admin user {admin_id}: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return {"success": False, "error": str(e)}

async def create_partner_with_enhanced_profiles(partner_id: str, partner_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a partner account using the new enhanced partner profiles schema."""
    
    try:
        # Generate email and password
        domain = partner_data['website'].replace('https://', '').replace('http://', '').split('/')[0]
        user_email = f"{partner_id}@{domain}"
        password = f"ClimateJobs2025!{partner_id.title()}"
        
        user_id = None
        user_created = False
        
        try:
            # Create new auth user
            user_result = supabase.auth.admin.create_user({
                "email": user_email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {
                    "organization": partner_data["name"],
                    "role": "partner",
                    "created_date": "June 2025"
                }
            })
            user_id = user_result.user.id
            user_created = True
            logger.info(f"Created new user for {partner_data['name']}")
            
        except Exception as auth_error:
            if "already been registered" in str(auth_error):
                logger.info(f"User {user_email} already exists, updating profile...")
                
                # Get existing user by email
                existing_users = supabase.auth.admin.list_users()
                for user in existing_users:
                    if user.email == user_email:
                        user_id = user.id
                        break
                
                if not user_id:
                    # If we can't find the user, try to delete and recreate
                    logger.warning(f"Could not find existing user {user_email}, attempting to delete and recreate...")
                    try:
                        all_users = supabase.auth.admin.list_users()
                        for user in all_users:
                            if user.email == user_email:
                                supabase.auth.admin.delete_user(user.id)
                                logger.info(f"Deleted existing user {user_email}")
                                break
                        
                        # Now try to create again
                        user_result = supabase.auth.admin.create_user({
                            "email": user_email,
                            "password": password,
                            "email_confirm": True,
                            "user_metadata": {
                                "organization": partner_data["name"],
                                "role": "partner",
                                "created_date": "June 2025"
                            }
                        })
                        user_id = user_result.user.id
                        user_created = True
                        logger.info(f"Successfully recreated user for {partner_data['name']}")
                        
                    except Exception as delete_error:
                        logger.error(f"Could not delete/recreate user: {delete_error}")
                        return {"success": False, "error": f"Could not handle existing user: {delete_error}"}
            else:
                raise auth_error
        
        if not user_id:
            return {"success": False, "error": "Could not obtain user ID"}
        
        # Create enhanced partner profile directly (no base profiles table in new schema)
        partner_profile_data = {
            "id": user_id,
            "full_name": partner_data["contact_info"].get("contact_person", f"Representative - {partner_data['name']}"),
            "email": user_email,
            "phone": partner_data["contact_info"].get("phone"),
            "organization_name": partner_data["name"],
            "organization_type": partner_data["organization_type"],
            "organization_size": partner_data.get("organization_size", "medium"),
            "website": partner_data["website"],
            "headquarters_location": partner_data.get("headquarters_location", partner_data["contact_info"].get("address", "")),
            "contact_info": partner_data["contact_info"],
            "partnership_level": partner_data["partnership_level"],
            "verified": partner_data.get("verified", True),
            "verification_date": datetime.now(timezone.utc).isoformat() if partner_data.get("verified", True) else None,
            "climate_focus": partner_data["climate_focus"],
            "services_offered": [program["type"] for program in partner_data.get("current_programs", [])],
            "industries": partner_data["climate_focus"],
            "description": partner_data["description"],
            "mission_statement": f"Advancing climate economy through {', '.join(partner_data['climate_focus'])}",
            "employee_count": partner_data.get("employee_count"),
            "founded_year": partner_data.get("founded_year"),
            "hiring_actively": partner_data.get("hiring_actively", False),
            "training_programs": partner_data.get("training_programs", []),
            "internship_programs": any("internship" in program.get("type", "") for program in partner_data.get("current_programs", [])),
            # Broader resource columns based on 2025 research
            "linkedin_url": COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("digital_presence", {}).get("linkedin"),
            "careers_page_url": COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("digital_presence", {}).get("careers_page"),
            "facebook_url": COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("digital_presence", {}).get("facebook"),
            "instagram_handle": COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("digital_presence", {}).get("instagram"),
            "youtube_url": COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("digital_presence", {}).get("youtube"),
            "twitter_handle": COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("digital_presence", {}).get("twitter"),
            "blog_url": COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("digital_presence", {}).get("blog"),
            "newsletter_signup_url": COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("digital_presence", {}).get("newsletter"),
            "events_calendar_url": COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("digital_presence", {}).get("events_calendar"),
            "student_portal_url": COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("digital_presence", {}).get("student_portal"),
            "workforce_portal_url": COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("digital_presence", {}).get("workforce_portal"),
            "platform_login_url": COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("digital_presence", {}).get("platform_login"),
            "podcast_url": COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("digital_presence", {}).get("podcast"),
            # Resource capabilities flags
            "offers_webinars": any(r["type"] in ["webinar", "webinar_series"] for r in COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("resources", [])),
            "hosts_events": any(r["type"] in ["event", "career_event", "networking_events", "event_series"] for r in COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("resources", [])),
            "has_resource_library": any(r["type"] in ["resource_library", "resource_center", "resource_portal"] for r in COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("resources", [])),
            "offers_certification": any(r["type"] in ["certification_program", "training_program"] for r in COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("resources", [])),
            "has_podcast": any(r["type"] == "podcast" for r in COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("resources", [])),
            "offers_virtual_tours": any(r["type"] == "virtual_tour" for r in COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("resources", [])),
            "has_mobile_app": any("app" in r.get("platforms", []) for r in COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("resources", [])),
            "offers_mentorship": any(r["type"] == "mentorship_program" for r in COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("resources", [])),
            "has_job_board": any(r["type"] in ["job_platform", "career_platform"] for r in COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("resources", [])),
            "offers_funding": any(r["type"] == "funding_portal" for r in COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("resources", [])),
            "profile_completed": True,
            "last_login": None
        }
        
        try:
            # Try to insert partner profile directly
            supabase.table("partner_profiles").insert(partner_profile_data).execute()
        except Exception as partner_profile_error:
            if "duplicate key value" in str(partner_profile_error) or "already exists" in str(partner_profile_error):
                # Partner profile exists, update it
                logger.info(f"Partner profile exists for {partner_data['name']}, updating...")
                update_data = {k: v for k, v in partner_profile_data.items() if k != 'id'}
                supabase.table("partner_profiles").update(update_data).eq('id', user_id).execute()
            else:
                raise partner_profile_error
        
        # Clean up existing data for this partner
        try:
            supabase.table("knowledge_resources").delete().eq('partner_id', user_id).execute()
            supabase.table("job_listings").delete().eq('partner_id', user_id).execute()  
            supabase.table("education_programs").delete().eq('partner_id', user_id).execute()
            supabase.table("partner_resources").delete().eq('partner_id', user_id).execute()
        except Exception as delete_error:
            logger.warning(f"Could not delete existing records: {delete_error}")
        
        # Create comprehensive partner resources
        partner_resources_created = await create_partner_resources(partner_id, partner_data, user_id)
        
        # Create resources, job listings, and education programs (existing logic continues...)
        resources_created = 0
        job_listings_created = 0
        education_programs_created = 0
        chunker = AIOptimizedChunker()
        
        for program in partner_data.get("current_programs", []):
            program_type = program.get("type", "")
            
            # Create job listings for job-related programs
            if program_type in ["job_training", "apprenticeship", "job_placement"]:
                job_data = await create_job_listing_from_program(user_id, partner_data, program)
                if job_data:
                    try:
                        supabase.table("job_listings").insert(job_data).execute()
                        job_listings_created += 1
                        logger.info(f"Created job listing: {program['title']}")
                    except Exception as e:
                        logger.error(f"Failed to create job listing: {e}")
            
            # Create education programs for education-related programs  
            elif program_type in ["education", "internship", "fellowship", "workforce_development", "pre_apprenticeship", "career_guidance", "community_engagement"]:
                edu_data = await create_education_program_from_program(user_id, partner_data, program)
                if edu_data:
                    try:
                        supabase.table("education_programs").insert(edu_data).execute()
                        education_programs_created += 1
                        logger.info(f"Created education program: {program['title']}")
                    except Exception as e:
                        logger.error(f"Failed to create education program: {e}")
            
            # Always create a knowledge resource for AI search
            content = generate_program_content(partner_data, program)
            chunks = chunker.chunk_content(content, {
                "partner_id": user_id,
                "partner_name": partner_data["name"],
                "program_title": program["title"],
                "program_type": program["type"],
                "source_type": "partner_program",
                "year": "2025"
            })
            
            for chunk in chunks:
                # Generate embedding
                embedding = await generate_embedding(chunk["content"])
                
                # Create resource record
                resource_data = {
                    "id": str(uuid.uuid4()),
                    "partner_id": user_id,
                    "title": f"{partner_data['name']}: {program['title']}",
                    "description": program.get("description", ""),
                    "content": chunk["content"],
                    "content_type": program["type"],
                    "source_url": partner_data.get("website"),
                    "domain": partner_data["climate_focus"][0] if partner_data["climate_focus"] else "general",
                    "topics": extract_topics(chunk["content"]),
                    "tags": generate_tags(partner_data, program),
                    "categories": [partner_data["organization_type"], program["type"]],
                    "target_audience": program.get("target_audience", ["general"]),
                    "embedding": embedding,
                    "metadata": chunk["metadata"]
                }
                
                try:
                    supabase.table("knowledge_resources").insert(resource_data).execute()
                    resources_created += 1
                except Exception as e:
                    logger.error(f"Failed to create knowledge resource: {e}")
        
        action = "Created" if user_created else "Updated"
        return {
            "success": True,
            "user_id": user_id,
            "email": user_email,
            "password": password,
            "resources_created": resources_created,
            "job_listings_created": job_listings_created,
            "education_programs_created": education_programs_created,
            "partner_resources_created": partner_resources_created,
            "action": action
        }
        
    except Exception as e:
        logger.error(f"Error creating partner {partner_id}: {str(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        return {"success": False, "error": str(e)}

def generate_admin_program_content(admin_data: Dict, program: Dict) -> str:
    """Generate comprehensive content for an admin program with 2025 capabilities."""
    
    content_parts = [
        f"# {admin_data['name']}: {program['title']}",
        f"\n## Platform Administration Overview",
        f"**Admin Level:** {admin_data['admin_level'].title()}",
        f"**Department:** {admin_data['department']}",
        f"**Organization Type:** {admin_data['organization_type'].title()}",
        f"**Website:** {admin_data['website']}",
        f"\n**Platform Mission:** {admin_data['description']}",
    ]
    
    # Add comprehensive admin capabilities
    if "admin_capabilities" in admin_data:
        content_parts.append("\n## Administrative Capabilities")
        
        for capability_area, capabilities in admin_data["admin_capabilities"].items():
            content_parts.append(f"\n### {capability_area.replace('_', ' ').title()}")
            for cap_name, cap_enabled in capabilities.items():
                if cap_enabled:
                    content_parts.append(f"✓ **{cap_name.replace('_', ' ').title()}:** Enabled")
    
    # Add permissions list
    if "permissions" in admin_data:
        content_parts.append("\n## System Permissions")
        content_parts.append("**Granted Permissions:**")
        for permission in admin_data["permissions"]:
            content_parts.append(f"• {permission.replace('_', ' ').title()}")
    
    if admin_data.get("contact_info"):
        content_parts.append("\n## Contact Information")
        for key, value in admin_data["contact_info"].items():
            if value:
                content_parts.append(f"**{key.title()}:** {value}")
    
    content_parts.extend([
        f"\n## Admin Program: {program['title']}",
        f"**Program Type:** {program['type'].replace('_', ' ').title()}",
        f"\n**Description:** {program['description']}"
    ])
    
    # Add program-specific details
    for key, value in program.items():
        if key not in ['title', 'type', 'description']:
            if isinstance(value, list):
                content_parts.append(f"**{key.replace('_', ' ').title()}:** {', '.join(map(str, value))}")
            elif isinstance(value, dict):
                content_parts.append(f"\n### {key.replace('_', ' ').title()}")
                for sub_key, sub_value in value.items():
                    content_parts.append(f"**{sub_key.replace('_', ' ').title()}:** {sub_value}")
            else:
                content_parts.append(f"**{key.replace('_', ' ').title()}:** {value}")
    
    return "\n".join(content_parts)

def extract_admin_topics(content: str) -> List[str]:
    """Extract topics from admin content using keyword analysis."""
    
    admin_topic_keywords = {
        "user_management": ["user", "profile", "account", "authentication", "registration"],
        "analytics": ["analytics", "dashboard", "metrics", "reporting", "insights", "data"],
        "security": ["security", "audit", "compliance", "access", "permission", "risk"],
        "platform_administration": ["admin", "platform", "system", "management", "oversight"],
        "content_management": ["content", "resources", "knowledge", "publishing", "moderation"],
        "partner_management": ["partner", "organization", "verification", "collaboration"],
        "workforce_development": ["workforce", "training", "career", "skills", "development"],
        "climate_economy": ["climate", "economy", "clean energy", "sustainability", "transition"]
    }
    
    content_lower = content.lower()
    topics = []
    
    for topic, keywords in admin_topic_keywords.items():
        if any(keyword in content_lower for keyword in keywords):
            topics.append(topic)
    
    return topics[:8]  # Return up to 8 relevant topics

def generate_admin_tags(admin_data: Dict, program: Dict) -> List[str]:
    """Generate tags for admin resources for better searchability."""
    
    tags = [
        admin_data["admin_level"],
        "platform_administration",
        "system_management",
        program["type"],
        "2025",
        "climate_economy",
        "admin_capabilities"
    ]
    
    # Add capability-based tags
    if "admin_capabilities" in admin_data:
        for capability_area in admin_data["admin_capabilities"].keys():
            tags.append(capability_area)
    
    # Add permission-based tags
    if "permissions" in admin_data:
        for permission in admin_data["permissions"][:5]:  # Limit to first 5 permissions
            tags.append(permission)
    
    if "analytics" in program.get("description", "").lower():
        tags.append("analytics")
    if "dashboard" in program.get("description", "").lower():
        tags.append("dashboard")
    if "monitoring" in program.get("description", "").lower():
        tags.append("monitoring")
    
    return list(set(tags))  # Remove duplicates

async def create_partner_resources(partner_id: str, partner_data: Dict[str, Any], user_id: str) -> int:
    """Create comprehensive partner resources from the enhanced resource data."""
    
    resources_created = 0
    
    # Get comprehensive resource data for this partner
    resource_data = COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {})
    
    if not resource_data:
        logger.warning(f"No comprehensive resource data found for partner {partner_id}")
        return 0
    
    # Create digital presence resources
    digital_presence = resource_data.get("digital_presence", {})
    for platform, url in digital_presence.items():
        if url:
            resource_record = {
                "id": str(uuid.uuid4()),
                "partner_id": user_id,
                "resource_type": "digital_presence",
                "platform": platform,
                "title": f"{partner_data['name']} - {platform.replace('_', ' ').title()}",
                "description": f"Official {platform.replace('_', ' ')} presence for {partner_data['name']}",
                "url": url,
                "access_level": "public",
                "status": "active",
                "created_date": datetime.now(timezone.utc).isoformat(),
                "metadata": {
                    "platform_type": platform,
                    "partner_name": partner_data["name"],
                    "organization_type": partner_data.get("organization_type"),
                    "year": "2025"
                }
            }
            
            try:
                supabase.table("partner_resources").insert(resource_record).execute()
                resources_created += 1
            except Exception as e:
                logger.error(f"Failed to create digital presence resource for {platform}: {e}")
    
    # Create detailed resources
    resources = resource_data.get("resources", [])
    for resource in resources:
        # Generate comprehensive content for the resource
        content = generate_resource_content(partner_data, resource)
        
        # Generate embedding for the content
        embedding = await generate_embedding(content)
        
        resource_record = {
            "id": str(uuid.uuid4()),
            "partner_id": user_id,
            "resource_type": resource["type"],
            "title": resource["title"],
            "description": resource["description"],
            "content": content,
            "url": resource.get("url"),
            "frequency": resource.get("frequency"),
            "target_audience": resource.get("target_audience", []),
            "format": resource.get("format"),
            "cost": resource.get("cost"),
            "location": resource.get("location"),
            "duration": resource.get("duration"),
            "access_level": resource.get("access", "public"),
            "status": "active",
            "features": resource.get("features", []),
            "content_types": resource.get("content_types", []),
            "platforms": resource.get("platforms", []),
            "compensation": resource.get("compensation"),
            "certification": resource.get("certification"),
            "next_date": resource.get("next_orientation"),
            "embedding": embedding,
            "created_date": datetime.now(timezone.utc).isoformat(),
            "metadata": {
                "partner_name": partner_data["name"],
                "organization_type": partner_data.get("organization_type"),
                "climate_focus": partner_data.get("climate_focus", []),
                "year": "2025"
            }
        }
        
        try:
            supabase.table("partner_resources").insert(resource_record).execute()
            resources_created += 1
            logger.info(f"Created resource: {resource['title']}")
        except Exception as e:
            logger.error(f"Failed to create resource {resource['title']}: {e}")
    
    return resources_created

def generate_resource_content(partner_data: Dict, resource: Dict) -> str:
    """Generate comprehensive content for a partner resource."""
    
    content_parts = [
        f"# {resource['title']}",
        f"\n## Partner: {partner_data['name']}",
        f"**Organization Type:** {partner_data.get('organization_type', '').title()}",
        f"**Resource Type:** {resource['type'].replace('_', ' ').title()}",
        f"\n**Description:** {resource['description']}"
    ]
    
    # Add resource-specific details
    if resource.get("url"):
        content_parts.append(f"**URL:** {resource['url']}")
    
    if resource.get("frequency"):
        content_parts.append(f"**Frequency:** {resource['frequency'].replace('_', ' ').title()}")
    
    if resource.get("target_audience"):
        audiences = [aud.replace('_', ' ').title() for aud in resource["target_audience"]]
        content_parts.append(f"**Target Audience:** {', '.join(audiences)}")
    
    if resource.get("format"):
        content_parts.append(f"**Format:** {resource['format'].replace('_', ' ').title()}")
    
    if resource.get("cost"):
        content_parts.append(f"**Cost:** {resource['cost'].replace('_', ' ').title()}")
    
    if resource.get("duration"):
        content_parts.append(f"**Duration:** {resource['duration'].replace('_', ' ')}")
    
    if resource.get("location"):
        content_parts.append(f"**Location:** {resource['location']}")
    
    if resource.get("features"):
        features = [feat.replace('_', ' ').title() for feat in resource["features"]]
        content_parts.append(f"**Features:** {', '.join(features)}")
    
    if resource.get("content_types"):
        types = [ct.replace('_', ' ').title() for ct in resource["content_types"]]
        content_parts.append(f"**Content Types:** {', '.join(types)}")
    
    if resource.get("platforms"):
        platforms = [plat.replace('_', ' ').title() for plat in resource["platforms"]]
        content_parts.append(f"**Available Platforms:** {', '.join(platforms)}")
    
    if resource.get("compensation"):
        content_parts.append(f"**Compensation:** {resource['compensation'].replace('_', ' ')}")
    
    if resource.get("certification"):
        content_parts.append(f"**Certification:** {resource['certification'].replace('_', ' ')}")
    
    if resource.get("next_orientation"):
        content_parts.append(f"**Next Orientation:** {resource['next_orientation'].replace('_', ' ')}")
    
    # Add partner context
    content_parts.extend([
        f"\n## About {partner_data['name']}",
        f"{partner_data.get('description', '')}",
        f"\n**Climate Focus Areas:** {', '.join(partner_data.get('climate_focus', []))}"
    ])
    
    if partner_data.get("contact_info"):
        content_parts.append("\n## Contact Information")
        for key, value in partner_data["contact_info"].items():
            if value:
                content_parts.append(f"**{key.replace('_', ' ').title()}:** {value}")
    
    return "\n".join(content_parts)

async def main():
    """Main function to create seed partners and admin users with real current data."""
    
    print("=" * 80)
    print("🌱 CLIMATE ECONOMY ECOSYSTEM - COMPREHENSIVE SETUP")
    print("📅 Current Date: June 2025")
    print("🔄 Using Real Current Partner Data + Enhanced Admin Capabilities")
    print("🤖 AI-Optimized Knowledge Base Ingestion")
    print("📄 PDF Domain Knowledge Integration")
    print("👨‍💼 Advanced Admin User Management (2025 Standards)")
    print("=" * 80)
    
    results = {
        "admin_users_created": 0,
        "partners_created": 0,
        "partner_resources_created": 0,
        "partner_digital_resources_created": 0,
        "pdf_resources_created": 0,
        "admin_credentials": [],
        "partner_credentials": [],
        "errors": []
    }
    
    try:
        # First, ingest PDF domain knowledge resources
        print(f"\n📚 PROCESSING PDF DOMAIN KNOWLEDGE...")
        print(f"📁 PDFs Directory: {PDFS_DIR}")
        
        pdf_stats = await ingest_pdf_resources()
        results["pdf_resources_created"] = pdf_stats["resources_created"]
        
        if pdf_stats["processed"] > 0:
            print(f"   ✅ Processed {pdf_stats['processed']} PDFs")
            print(f"   📊 Created {pdf_stats['resources_created']} knowledge chunks")
        else:
            print(f"   ⚠️ No PDFs processed (files may not exist yet)")
            print(f"   📍 Expected PDF locations:")
            for pdf_info in CLIMATE_DOMAIN_RESOURCES:
                print(f"      - {pdf_info['file']}")
        
        if pdf_stats["failed"] > 0:
            print(f"   ❌ Failed: {pdf_stats['failed']} PDFs")
        
        # Create admin users with 2025 capabilities first
        print(f"\n👨‍💼 CREATING ADMIN USERS WITH 2025 CAPABILITIES...")
        
        for admin_id, admin_data in ADMIN_USERS_DATA_2025.items():
            print(f"\n🔧 Creating admin user: {admin_data['name']}...")
            
            result = await create_admin_user(admin_id, admin_data)
            
            if result["success"]:
                results["admin_users_created"] += 1
                results["admin_credentials"].append({
                    "name": admin_data["name"],
                    "email": result["email"],
                    "password": result["password"],
                    "website": admin_data["website"],
                    "admin_level": result["admin_level"],
                    "capabilities": result["capabilities"],
                    "programs": len(admin_data.get("current_programs", [])),
                    "resources": result["resources_created"]
                })
                print(f"   ✅ {result['action']} successfully with {result['capabilities']} capabilities and {result['resources_created']} resources")
            else:
                results["errors"].append(f"Admin {admin_data['name']}: {result['error']}")
                print(f"   ❌ Failed: {result['error']}")
        
        # Now create partner accounts with enhanced profiles
        print(f"\n🏢 CREATING PARTNER ACCOUNTS WITH ENHANCED PROFILES...")
        
        for partner_id, partner_data in PARTNERS_DATA_2025.items():
            print(f"\n🏢 Creating partner: {partner_data['name']}...")
            
            result = await create_partner_with_enhanced_profiles(partner_id, partner_data)
            
            if result["success"]:
                results["partners_created"] += 1
                results["partner_resources_created"] += result["resources_created"]
                results["partner_digital_resources_created"] += result.get("partner_resources_created", 0)
                results["partner_credentials"].append({
                    "name": partner_data["name"],
                    "email": result["email"],
                    "password": result["password"],
                    "website": partner_data["website"],
                    "type": partner_data["organization_type"],
                    "partnership_level": partner_data["partnership_level"],
                    "programs": len(partner_data.get("current_programs", [])),
                    "resources": result["resources_created"],
                    "job_listings": result.get("job_listings_created", 0),
                    "education_programs": result.get("education_programs_created", 0),
                    "digital_resources": result.get("partner_resources_created", 0),
                    # Resource capabilities
                    "linkedin": bool(COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("digital_presence", {}).get("linkedin")),
                    "careers_page": bool(COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("digital_presence", {}).get("careers_page")),
                    "webinars": any(r["type"] in ["webinar", "webinar_series"] for r in COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("resources", [])),
                    "events": any(r["type"] in ["event", "career_event", "networking_events"] for r in COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("resources", [])),
                    "resource_library": any(r["type"] in ["resource_library", "resource_center"] for r in COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {}).get("resources", []))
                })
                print(f"   ✅ {result['action']} successfully with {result['resources_created']} program resources")
            else:
                results["errors"].append(f"{partner_data['name']}: {result['error']}")
                print(f"   ❌ Failed: {result['error']}")
        
        print("\n" + "=" * 80)
        print("✅ COMPREHENSIVE CLIMATE ECONOMY ECOSYSTEM SETUP COMPLETED!")
        print("=" * 80)
        print(f"👨‍💼 Admin Users Created: {results['admin_users_created']}")
        print(f"🏢 Partners Created: {results['partners_created']}")
        print(f"📊 Partner Program Resources: {results['partner_resources_created']}")
        print(f"🌐 Partner Digital Resources: {results['partner_digital_resources_created']}")
        print(f"📚 PDF Domain Knowledge Resources: {results['pdf_resources_created']}")
        print(f"📖 Total Knowledge Base Resources: {results['partner_resources_created'] + results['pdf_resources_created']}")
        print(f"🔗 Total Digital Resources: {results['partner_digital_resources_created']}")
        print(f"❌ Errors: {len(results['errors'])}")
        
        if results['errors']:
            print("\n🚨 ERRORS:")
            for error in results['errors']:
                print(f"   • {error}")
        
        print("\n" + "=" * 80)
        print("🔐 ADMIN USER LOGIN CREDENTIALS (2025 CAPABILITIES)")
        print("=" * 80)
        
        for cred in results['admin_credentials']:
            print(f"\n👨‍💼 {cred['name']}")
            print(f"   📧 Email: {cred['email']}")
            print(f"   🔑 Password: {cred['password']}")
            print(f"   🌐 Website: {cred['website']}")
            print(f"   🛡️ Admin Level: {cred['admin_level'].title()}")
            print(f"   ⚙️ Capabilities: {cred['capabilities']} permissions")
            print(f"   📋 Programs: {cred['programs']}")
            print(f"   📚 Resources Created: {cred['resources']}")
            print(f"   📊 Analytics Dashboard: ✅ Full Access")
            print(f"   👥 User Management: ✅ Complete Control")
            print(f"   🏢 Partner Oversight: ✅ Full Authority")
            print(f"   🔒 Security Monitoring: ✅ Advanced")
        
        print("\n" + "=" * 80)
        print("🔐 PARTNER LOGIN CREDENTIALS")
        print("=" * 80)
        
        for cred in results['partner_credentials']:
            print(f"\n🏢 {cred['name']}")
            print(f"   📧 Email: {cred['email']}")
            print(f"   🔑 Password: {cred['password']}")
            print(f"   🌐 Website: {cred['website']}")
            print(f"   📋 Type: {cred['type'].title()}")
            print(f"   🤝 Partnership Level: {cred['partnership_level'].title()}")
            print(f"   📊 Programs: {cred['programs']}")
            print(f"   📚 Program Resources: {cred['resources']}")
            print(f"   🌐 Digital Resources: {cred['digital_resources']}")
            if cred.get('job_listings', 0) > 0:
                print(f"   💼 Job Listings: {cred['job_listings']}")
            if cred.get('education_programs', 0) > 0:
                print(f"   🎓 Education Programs: {cred['education_programs']}")
            
            # Show digital capabilities
            capabilities = []
            if cred.get('linkedin'): capabilities.append("LinkedIn")
            if cred.get('careers_page'): capabilities.append("Careers Page")
            if cred.get('webinars'): capabilities.append("Webinars")
            if cred.get('events'): capabilities.append("Events")
            if cred.get('resource_library'): capabilities.append("Resource Library")
            
            if capabilities:
                print(f"   ✨ Digital Capabilities: {', '.join(capabilities)}")
        
        # Add comprehensive resource summary
        print("\n" + "=" * 80)
        print("🌐 COMPREHENSIVE DIGITAL RESOURCE ECOSYSTEM")
        print("=" * 80)
        print("📱 Digital Presence Types:")
        print("   • LinkedIn profiles and company pages")
        print("   • Dedicated careers pages with job listings")
        print("   • Social media presence (Facebook, Instagram, YouTube)")
        print("   • Blogs and newsletter signup forms")
        print("   • Student and workforce portals")
        print("   • Platform login systems and mobile apps")
        
        print("\n📚 Resource Types Available:")
        print("   • Webinars and virtual events")
        print("   • In-person career events and showcases")
        print("   • Resource libraries with guides and tutorials")
        print("   • Certification and training programs")
        print("   • Podcasts and multimedia content")
        print("   • Virtual tours and interactive demos")
        print("   • Mentorship and networking programs")
        print("   • Job boards and career platforms")
        print("   • Funding and grant portals")
        
        print("\n🎯 Target Audiences Served:")
        print("   • College students and recent graduates")
        print("   • Career changers and adult learners")
        print("   • Veterans and military transitioning")
        print("   • Environmental justice communities")
        print("   • Immigrant professionals")
        print("   • High school students")
        print("   • Industry professionals and employers")
        
        print("\n🚀 This comprehensive ecosystem provides multiple pathways for")
        print("   job seekers to discover opportunities, access training, and")
        print("   connect with clean energy employers across Massachusetts!")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    asyncio.run(main()) 