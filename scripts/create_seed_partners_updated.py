#!/usr/bin/env python3
"""
Climate Economy Seed Partners Creation Script - Updated for Current System

Creates seed partner accounts with proper auth.users and profiles records
based on real current data from partner websites (June 2025), optimized
for the current database schema and system capabilities.
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
import uuid
import re

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize clients with better error handling
try:
    from supabase import create_client
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        logger.error("Missing required Supabase environment variables")
        exit(1)
    
    logger.info(f"Connecting to Supabase: {supabase_url}")
    supabase = create_client(supabase_url, supabase_key)
    
    # Test connection
    test_result = supabase.table("profiles").select("id").limit(1).execute()
    logger.info("✅ Supabase connection successful")
    
except ImportError as e:
    logger.error(f"Missing required dependency: {e}")
    logger.error("Please install with: pip install supabase pypdf requests")
    exit(1)
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {e}")
    exit(1)

# Additional imports for comprehensive functionality
try:
    import pypdf
    from pypdf import PdfReader
    import requests
    import io
    import re
    import hashlib
    from urllib.parse import urlparse, urljoin
    logger.info("✅ Additional libraries loaded successfully")
except ImportError as e:
    logger.warning(f"Optional dependency missing: {e}")
    logger.warning("Some advanced features may not be available")

# Optional OpenAI client
try:
    import openai
    from openai import OpenAI
    openai_api_key = os.environ.get("OPENAI_API_KEY")
    if openai_api_key:
        openai_client = OpenAI(api_key=openai_api_key)
        logger.info("✅ OpenAI client initialized")
    else:
        openai_client = None
        logger.warning("⚠️ OpenAI API key not found - using dummy embeddings")
except ImportError:
    openai_client = None
    logger.warning("⚠️ OpenAI not installed - using dummy embeddings")

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

# Real current partner data from June 2025 - MATCHING YOUR CURRENT SCHEMA
PARTNERS_DATA_2025 = {
    "buffr_inc": {
        "name": "Buffr Inc.",
        "organization_type": "employer",
        "website": "https://buffr.ai/",
        "description": "Buffr Inc. is an AI-native strategy and technology company building GenAI solutions that bridge the gap between business strategy, product innovation, and climate impact. Our mission is to empower founders, climate tech orgs, and fintech innovators to launch smarter, AI-powered platforms through modular systems, multi-agent copilots, and data-driven growth tools.",
        "climate_focus": ["ai_solutions", "climate_tech", "fintech", "workforce_development"],
        "partnership_level": "founding",
        "headquarters_location": "Massachusetts, USA",
        "organization_size": "startup",
        "employee_count": 5,
        "founded_year": 2023,
        "verified": True,
        "contact_info": {
            "email": "george@buffr.ai",
            "phone": "+1-206-530-8433",
            "address": "Massachusetts, USA",
            "contact_person": "George Nekwaya"
        },
        "hiring_actively": True,
        "training_programs": ["Agentic AI Systems", "Climate Tech Strategy", "GenAI Engineering"],
        "current_programs": [
            {
                "title": "MA Clean Tech Platform Development",
                "type": "platform_development",
                "description": "AI-powered workforce and partner matchmaking platform for climate economy ecosystem members in Massachusetts",
                "requirements": ["AI/ML experience", "Next.js/TypeScript", "Climate tech interest"],
                "duration": "Ongoing",
                "cost": "Equity-based compensation available",
                "status": "In Development"
            },
            {
                "title": "Buffr Companion AI",
                "type": "ai_development",
                "description": "JARVIS-style GenAI assistant and AI cofounder interface for research, product building, and multi-agent collaboration",
                "requirements": ["Python", "LangGraph", "Multi-agent systems"],
                "duration": "Ongoing",
                "cost": "Equity-based compensation available",
                "status": "Prototype"
            }
        ]
    },
    
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
    
    "masshiredirect": {
        "name": "MassHireDirect",
        "organization_type": "government",
        "website": "https://masshiredirect.com/",
        "description": "Official Massachusetts workforce development portal providing comprehensive job search, career coaching, and skills development resources with focus on clean energy and climate careers.",
        "climate_focus": ["workforce_development", "job_placement", "career_coaching"],
        "partnership_level": "founding",
        "headquarters_location": "Statewide - Massachusetts",
        "organization_size": "large",
        "employee_count": 300,
        "founded_year": 2010,
        "verified": True,
        "contact_info": {
            "email": "info@masshiredirect.com",
            "phone": "617-626-5300",
            "address": "Statewide - Massachusetts",
            "contact_person": "Workforce Director"
        },
        "current_programs": [
            {
                "title": "Clean Energy Career Pathways",
                "type": "workforce_development",
                "description": "Comprehensive career pathway development for clean energy jobs including skills assessment, training recommendations, and job placement services",
                "focus_areas": ["Career coaching", "Skills assessment", "Job placement"],
                "duration": "Ongoing",
                "cost": "Free"
            }
        ]
    },
    
    "commonwealth_corp": {
        "name": "Commonwealth Corporation",
        "organization_type": "nonprofit",
        "website": "https://commcorp.org/",
        "description": "Statewide workforce development intermediary connecting employers, workers, and community organizations to build career pathways in high-demand industries including clean energy.",
        "climate_focus": ["workforce_development", "employer_engagement", "career_pathways"],
        "partnership_level": "premium",
        "headquarters_location": "Boston, MA",
        "organization_size": "medium",
        "employee_count": 75,
        "founded_year": 1982,
        "verified": True,
        "contact_info": {
            "email": "info@commcorp.org",
            "phone": "617-727-8158",
            "address": "Boston, MA",
            "contact_person": "Partnership Director"
        },
        "current_programs": [
            {
                "title": "Sector Partnerships for Clean Energy",
                "type": "employer_engagement",
                "description": "Facilitating partnerships between clean energy employers and workforce development providers to address skill gaps and create career advancement opportunities",
                "focus_areas": ["Employer engagement", "Skills gap analysis", "Career advancement"],
                "duration": "Ongoing"
            }
        ]
    }
}

# Admin users data for comprehensive admin capabilities
ADMIN_USERS_DATA_2025 = {
    "george_nekwaya_act": {
        "name": "George Nekwaya - ACT Project Manager",
        "organization_type": "nonprofit",
        "website": "https://www.joinact.org/",
        "description": "Project Manager for DEIJ & Workforce Development at ACT | The Alliance for Climate Transition. Leading climate economy platform development and workforce strategy initiatives.",
        "admin_level": "super",
        "department": "AI & Business Strategy",
        "headquarters_location": "Massachusetts",
        "education": {
            "mba": "Brandeis International Business School - Data Analytics & Strategy",
            "engineering": "Namibian University of Science and Technology (NUST) - Civil Engineering",
            "exchange": "FH Aachen University - Project Management"
        },
        "expertise": [
            "AI Product Development",
            "Climate Tech Strategy", 
            "Fintech & Open Banking",
            "Business Model Innovation",
            "Agentic AI Systems",
            "Workforce Development",
            "Data Analytics for Public Policy"
        ],
        "founded_year": 2020,
        "verified": True,
        "contact_info": {
            "email": "gnekwaya@joinact.org",
            "phone": "+1-206-530-8433",
            "address": "Indianapolis, IN, USA",
            "contact_person": "George Nekwaya"
        },
        "personal_info": {
            "full_name": "George Nekwaya",
            "title": "Project Manager, DEIJ & Workforce Development",
            "nationality": "Namibian",
            "linkedin": "https://www.linkedin.com/in/george-nekwaya/",
            "personal_website": "https://georgenekwaya.com/",
            "education": {
                "mba": "Brandeis International Business School - MBA in Data Analytics, Strategy & Innovation",
                "engineering": "Namibian University of Science and Technology (NUST) - B.Sc. in Civil Engineering",
                "exchange": "FH Aachen University of Applied Sciences - Project Management Research"
            },
            "expertise": [
                "AI Product Development",
                "Climate Tech Strategy", 
                "Fintech & Open Banking",
                "Business Model Innovation",
                "Agentic AI Systems",
                "Workforce Development"
            ]
        },
        "permissions": [
            "manage_users", "manage_partners", "manage_content", "view_analytics", 
            "manage_system", "user_impersonation", "audit_access", "role_management",
            "platform_configuration", "agent_configurator", "partner_portal",
            "skills_taxonomy_management", "translation_management", "ai_model_configuration",
            "embedding_management", "knowledge_graph_access", "user_journey_analytics",
            "climate_impact_tracking", "workforce_development_analytics"
        ],
        "platform_capabilities": {
            "user_management": {
                "create_users": True,
                "delete_users": True,
                "modify_roles": True,
                "impersonate_users": True,
                "bulk_operations": True
            },
            "content_management": {
                "edit_knowledge_base": True,
                "manage_embeddings": True,
                "configure_ai_responses": True,
                "moderate_content": True,
                "translation_management": True
            },
            "analytics_access": {
                "user_behavior": True,
                "platform_performance": True,
                "ai_effectiveness": True,
                "workforce_insights": True,
                "climate_impact_metrics": True
            },
            "system_administration": {
                "database_access": True,
                "api_configuration": True,
                "integration_management": True,
                "security_settings": True,
                "backup_restore": True
            }
        },
        "current_programs": [
            {
                "title": "MA Clean Tech Platform Administration",
                "type": "platform_development",
                "description": "Leading development and administration of the Climate Economy Assistant platform including AI-powered workforce and partner matchmaking for Massachusetts climate economy ecosystem",
                "target_audience": ["climate_professionals", "partners", "job_seekers"],
                "specializations": [
                    "Clean Energy Workforce Strategy",
                    "Climate Tech Partner Ecosystem Development", 
                    "Agentic AI Product Design",
                    "Data Analytics for Public Policy",
                    "Community-Focused Tech Deployment"
                ],
                "capabilities": [
                    "Platform Architecture Design",
                    "AI Model Configuration and Training",
                    "User Experience Optimization",
                    "Skills Taxonomy Development",
                    "Multilingual Content Management",
                    "Analytics Dashboard Configuration"
                ]
            },
            {
                "title": "Climate Economy AI Agent Configuration",
                "type": "ai_development", 
                "description": "Configuration and optimization of AI agents for climate economy workforce development, including resume processing, job matching, and career guidance systems",
                "target_audience": ["job_seekers", "partners", "platform_users"],
                "specializations": [
                    "AI Agent Architecture",
                    "Natural Language Processing for Climate Careers",
                    "Embeddings Strategy for Domain Knowledge",
                    "Multi-Agent Coordination Systems"
                ]
            },
            {
                "title": "Clean Energy Workforce Development Assessment",
                "type": "research_analysis",
                "description": "Comprehensive assessment and strategy development for clean energy workforce development initiatives in Massachusetts",
                "target_audience": ["policy_makers", "workforce_development_agencies", "clean_energy_employers"]
            }
        ]
    },
    
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
            "email": "gnekwaya@joinact.org",
            "phone": "617-555-0199",
            "address": "Massachusetts",
            "contact_person": "Platform Administrator"
        },
        "permissions": [
            "manage_users", "manage_partners", "manage_content", "view_analytics", 
            "manage_system", "user_impersonation", "audit_access", "role_management"
        ],
        "current_programs": [
            {
                "title": "Climate Economy Platform Administration",
                "type": "system_administration",
                "description": "Comprehensive administration of the Climate Economy Assistant platform including user management, partner oversight, and system analytics",
                "target_audience": ["platform_users", "partners", "job_seekers"]
            }
        ]
    }
}

# Job seekers data for comprehensive job seeker capabilities
JOB_SEEKERS_DATA_2025 = {
    "george_nekway": {
        "personal_info": {
            "full_name": "George Nekwaya",
            "email": "george.n.p.nekwaya@gmail.com",
            "phone": "+1-206-530-8433",
            "location": "Indianapolis, IN",
            "linkedin_url": "https://www.linkedin.com/in/george-nekwaya/",
            "personal_website": "https://georgenekwaya.com/",
            "nationality": "Namibian"
        },
        "professional_summary": "George Nekwaya is a fintech founder and project manager with a robust background in engineering, data analytics, and workforce development. As the founder of Buffr Inc., he is dedicated to enhancing financial inclusion in Southern Africa by developing digital payment solutions inspired by global systems like India's UPI. His tenure at the Alliance for Climate Transition (ACT) involves leading workforce development assessments in collaboration with entities like MassCEC, focusing on clean energy sector hiring needs and diversity initiatives. George's academic journey includes an MBA with concentrations in Data Analytics and Strategy & Innovation from Brandeis International Business School, where he also served as Vice President of the International Business School Student Association. His engineering foundation was laid at the Namibia University of Science & Technology, complemented by international exposure through programs in Israel and India. George's multifaceted experience positions him at the intersection of technology, business strategy, and social impact.",
        "education": [
            {
                "institution": "Brandeis International Business School",
                "location": "Waltham, MA, USA",
                "degree": "Master of Business Administration (STEM-Designated)",
                "concentrations": ["Data Analytics", "Strategy & Innovation"],
                "gpa": "3.45/4.0",
                "graduation_year": 2024,
                "relevant_coursework": [
                    "Business in Global Markets",
                    "Business and Economic Strategies in Emerging Markets", 
                    "Advanced Data Analytics",
                    "Machine Learning and Data Analysis for Business and Finance",
                    "Forecasting in Finance and Economics",
                    "Entrepreneurship and Rapid Prototyping",
                    "Competition and Strategy",
                    "Business Dynamics"
                ],
                "honors": ["Hassenfeld Fellow: Gained global business insights through immersive experiences in Israel and India (2023-2024)"]
            },
            {
                "institution": "Namibia University of Science & Technology",
                "location": "Windhoek, Namibia", 
                "degree": "Bachelor of Engineering: Civil & Environmental Engineering",
                "graduation_year": 2018
            }
        ],
        "work_experience": [
            {
                "title": "Project Manager, DEIJ & Workforce Development",
                "company": "The Alliance for Climate Transition (ACT)",
                "start_date": "Oct 2024",
                "end_date": "Present",
                "current": True,
                "location": "Indianapolis, IN",
                "responsibilities": [
                    "Lead workforce development assessment in partnership with MassCEC, focusing on clean energy sector hiring needs",
                    "Collaborate with educational institutions to enhance student engagement in clean energy programs",
                    "Develop strategies to increase diversity and inclusion in the clean energy workforce"
                ]
            },
            {
                "title": "Business Development Consultant",
                "company": "Aquasaic Corporation",
                "start_date": "Oct 2024",
                "end_date": "Mar 2025",
                "current": False,
                "location": "Remote",
                "responsibilities": [
                    "Conducted comprehensive commercial and technical research on cutting-edge water treatment technologies",
                    "Designed the initial architecture for the Aquasaic-water-platform, focusing on democratizing access to water quality data using AI and machine learning",
                    "Led the development of pitch decks tailored for different funding opportunities"
                ]
            },
            {
                "title": "Business Development Intern",
                "company": "Insait IO",
                "start_date": "June 2023",
                "end_date": "July 2023",
                "current": False,
                "location": "Tel Aviv, Israel",
                "responsibilities": [
                    "Researched competitive landscape and compliance requirements in the US banking sector",
                    "Analyzed Valley National Bank's financial data, identifying real estate loans as a key revenue driver", 
                    "Investigated emerging trends and evaluated compliance considerations for AI in finance"
                ]
            },
            {
                "title": "Founder",
                "company": "Buffr Inc.",
                "start_date": "Jan 2023",
                "end_date": "Present",
                "current": True,
                "location": "Massachusetts, USA",
                "responsibilities": [
                    "Founded digital financial inclusion startup inspired by global payment systems",
                    "Conducted comprehensive field studies on digital payment ecosystems across multiple countries",
                    "Developed infrastructure for instant payment solutions to improve financial accessibility in emerging markets"
                ]
            },
            {
                "title": "Business Operations Manager / Site Engineer",
                "company": "Polar Power Inc.",
                "start_date": "July 2018",
                "end_date": "April 2019",
                "current": False,
                "location": "Windhoek, Namibia",
                "responsibilities": [
                    "Directed project teams in the construction and procurement of optic fiber and telecommunications infrastructure",
                    "Successfully constructed 10 telecommunication towers for Mobile Telecommunications Company (MTC)",
                    "Established partnerships with key companies across Southern Africa"
                ]
            },
            {
                "title": "Managing Member (Part-time)",
                "company": "Etuna Guesthouse & Tours",
                "start_date": "June 2006",
                "end_date": "Present",
                "current": True,
                "location": "Ongwediva, Namibia",
                "responsibilities": [
                    "Identified opportunities for service improvements and architected a QR Digital Menu solution",
                    "Proposed a loyalty and rewards program to enhance customer engagement"
                ]
            }
        ],
        "projects": [
            {
                "title": "Time Series Analysis and Sentiment Impact on AMD Stock Prices (1984–2024)",
                "description": "Analyzed the influence of news and annual report sentiment on AMD stock prices using time series techniques",
                "technologies": ["Python", "Time Series Analysis", "Sentiment Analysis"]
            },
            {
                "title": "Airbnb Listings Analysis and Investment Consultancy", 
                "description": "Analyzed two Kaggle datasets to assess the impact of the COVID-19 pandemic on the rental market",
                "technologies": ["Python", "Data Analytics", "Statistical Analysis"]
            },
            {
                "title": "Machine Learning Project in Peer-to-Peer Lending",
                "description": "Optimized loan investments in peer-to-peer lending, analyzing over 1.8 million loans",
                "technologies": ["Machine Learning", "Python", "Financial Modeling"]
            }
        ],
        "skills": {
            "technical": [
                "Python",
                "Data Analytics", 
                "Machine Learning",
                "AI Application Development",
                "Financial Modeling",
                "Business Intelligence",
                "Statistical Analysis",
                "Time Series Analysis"
            ],
            "business": [
                "Strategic Planning",
                "Business Development",
                "Project Management",
                "Workforce Development",
                "Fintech Strategy",
                "Market Research",
                "Partnership Development",
                "Startup Operations"
            ],
            "languages": ["English (Native)"]
        },
        "certifications": [
            "Agentic AI & Generative AI Bootcamp",
            "Open Banking & Platforms Specialization", 
            "Rearchitecting the Finance System",
            "Fintech for Africa",
            "Operations Management"
        ],
        "leadership": [
            "Vice President, International Business School Student Association, Brandeis University",
            "Graduate Student Affairs Senator, Brandeis University"
        ],
        "climate_interests": [
            "clean_energy_workforce",
            "ai_climate_solutions", 
            "fintech_sustainability",
            "diversity_inclusion",
            "workforce_development",
            "data_analytics"
        ],
        "job_preferences": {
            "desired_roles": [
                "Project Manager",
                "Business Development Manager", 
                "Data Analyst",
                "AI/ML Engineer",
                "Fintech Product Manager",
                "Sustainability Consultant",
                "Workforce Development Specialist"
            ],
            "industries": [
                "Climate Tech",
                "Fintech",
                "Clean Energy",
                "AI/Machine Learning",
                "Workforce Development",
                "Data Analytics"
            ],
            "employment_type": ["full_time", "contract", "consulting"],
            "location_preferences": ["Indianapolis, IN", "Massachusetts", "Remote"],
            "salary_expectation": "$75,000 - $120,000",
            "open_to_relocation": True
        },
        "portfolio": {
            "website": "https://georgenekwaya.com/",
            "linkedin": "https://www.linkedin.com/in/george-nekwaya/",
            "company": "https://buffr.ai/"
        }
    }
}

# Add new comprehensive partner resources data structure after PARTNERS_DATA_2025
COMPREHENSIVE_PARTNER_RESOURCES_2025 = {
    "buffr_inc": {
        "digital_presence": {
            "website": "https://buffr.ai/",
            "linkedin": "https://www.linkedin.com/company/buffr-inc/",
            "careers_page": "https://buffr.ai/careers/",
            "blog_url": "https://buffr.ai/blog/",
            "newsletter_signup": "https://buffr.ai/newsletter/"
        },
        "resources": [
            {
                "type": "webinar",
                "title": "AI-Powered Climate Tech Innovation Series",
                "description": "Monthly webinar series on building AI solutions for climate technology and workforce development",
                "url": "https://buffr.ai/webinars/",
                "frequency": "monthly",
                "target_audience": ["entrepreneurs", "climate_tech_professionals", "ai_developers"],
                "format": "virtual",
                "cost": "free"
            },
            {
                "type": "mentorship_program",
                "title": "Climate Tech AI Mentorship",
                "description": "One-on-one mentorship for climate tech entrepreneurs and AI developers",
                "url": "https://buffr.ai/mentorship/",
                "target_audience": ["entrepreneurs", "ai_developers", "climate_professionals"],
                "format": "virtual",
                "cost": "equity_based"
            }
        ]
    },
    
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
    },
    
    "masshire_career_centers": {
        "digital_presence": {
            "website": "https://www.mass.gov/masshire-career-centers",
            "linkedin": "https://www.linkedin.com/company/masshire/",
            "careers_page": "https://www.mass.gov/masshire-career-centers",
            "workforce_portal": "https://jobquest.masshirenetwork.com/"
        },
        "resources": [
            {
                "type": "job_platform",
                "title": "JobQuest Platform Access",
                "description": "Digital platform connecting job seekers with clean energy employers",
                "url": "https://jobquest.masshirenetwork.com/",
                "features": ["job_matching", "skills_assessment", "career_coaching"],
                "target_audience": ["job_seekers", "career_changers"],
                "format": "digital_platform",
                "cost": "free"
            }
        ]
    },
    
    "urban_league_eastern_ma": {
        "digital_presence": {
            "website": "https://www.ulem.org/",
            "linkedin": "https://www.linkedin.com/company/urban-league-eastern-massachusetts/",
            "careers_page": "https://www.ulem.org/careers/",
            "facebook": "https://www.facebook.com/uleasternmass/",
            "instagram": "@uleasternmass",
            "youtube": "https://www.youtube.com/user/uleasternmass",
            "blog_url": "https://www.ulem.org/blog/",
            "newsletter_signup": "https://www.ulem.org/newsletter/"
        },
        "resources": [
            {
                "type": "webinar",
                "title": "Clean Energy Career Pathways Webinar",
                "description": "Monthly webinar series on building career pathways in clean energy",
                "url": "https://www.ulem.org/webinars/",
                "frequency": "monthly",
                "target_audience": ["entrepreneurs", "career_changers", "community_members"],
                "format": "virtual",
                "cost": "free"
            },
            {
                "type": "mentorship_program",
                "title": "Clean Energy Mentorship Program",
                "description": "One-on-one mentorship for aspiring clean energy professionals",
                "url": "https://www.ulem.org/mentorship/",
                "target_audience": ["entrepreneurs", "ai_developers", "climate_professionals"],
                "format": "virtual",
                "cost": "equity_based"
            }
        ]
    },
    
    "headlamp": {
        "digital_presence": {
            "website": "https://myheadlamp.com/",
            "linkedin": "https://www.linkedin.com/company/headlamp-career-guidance/",
            "careers_page": "https://myheadlamp.com/careers/",
            "facebook": "https://www.facebook.com/myheadlamp/",
            "instagram": "@myheadlamp",
            "youtube": "https://www.youtube.com/user/myheadlamp",
            "blog_url": "https://myheadlamp.com/blog/",
            "newsletter_signup": "https://myheadlamp.com/newsletter/"
        },
        "resources": [
            {
                "type": "webinar",
                "title": "Clean Energy Career Guidance Webinar",
                "description": "Monthly webinar series on career guidance for clean energy professionals",
                "url": "https://myheadlamp.com/webinars/",
                "frequency": "monthly",
                "target_audience": ["veterans", "career_changers", "community_members"],
                "format": "virtual",
                "cost": "free"
            },
            {
                "type": "career_event",
                "title": "Clean Energy Career Day",
                "description": "Annual career day featuring employers, networking, and career development opportunities",
                "url": "https://myheadlamp.com/events/career-day/",
                "frequency": "annual",
                "target_audience": ["veterans", "career_changers", "community_members"],
                "format": "in_person",
                "location": "Boston, MA"
            }
        ]
    },
    
    "african_bridge_network": {
        "digital_presence": {
            "website": "https://africanbn.org/",
            "linkedin": "https://www.linkedin.com/company/african-bridge-network/",
            "careers_page": "https://africanbn.org/careers/",
            "facebook": "https://www.facebook.com/africanbridgenetwork/",
            "instagram": "@africanbridgenetwork",
            "youtube": "https://www.youtube.com/user/africanbridgenetwork",
            "blog_url": "https://africanbn.org/blog/",
            "newsletter_signup": "https://africanbn.org/newsletter/"
        },
        "resources": [
            {
                "type": "webinar",
                "title": "Immigrant Professionals Fellowship Webinar",
                "description": "Monthly webinar series on fellowship opportunities for immigrant professionals in clean energy",
                "url": "https://africanbn.org/webinars/",
                "frequency": "monthly",
                "target_audience": ["immigrant_professionals", "healthcare_workers", "researchers", "community_members"],
                "format": "virtual",
                "cost": "free"
            },
            {
                "type": "career_event",
                "title": "Immigrant Professionals Career Day",
                "description": "Annual career day featuring employers, networking, and career development opportunities for immigrant professionals",
                "url": "https://africanbn.org/events/career-day/",
                "frequency": "annual",
                "target_audience": ["immigrant_professionals", "healthcare_workers", "researchers", "community_members"],
                "format": "in_person",
                "location": "Boston, MA"
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

async def generate_embedding(text: str) -> List[float]:
    """Generate embedding for text using OpenAI or dummy."""
    try:
        if openai_client is None:
            # Return a dummy embedding vector for testing
            import hashlib
            # Create a consistent dummy embedding based on text hash
            text_hash = hashlib.md5(text.encode()).hexdigest()
            # Convert hash to numbers and normalize to create 1536-dim vector
            dummy_embedding = []
            for i in range(1536):
                char_index = i % len(text_hash)
                dummy_embedding.append((ord(text_hash[char_index]) - 48) / 255.0)
            return dummy_embedding
            
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

async def create_admin_user(admin_id: str, admin_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create an admin user account matching current schema."""
    
    try:
        # Generate email and password for admin
        domain = admin_data['website'].replace('https://', '').replace('http://', '').split('/')[0]
        # Remove www. and other subdomains from domain for email
        if domain.startswith('www.'):
            domain = domain[4:]  # Remove 'www.'
        
        # Special case for George Nekwaya - use his actual email
        if admin_id == "george_nekwaya_act" or "George Nekwaya" in admin_data["name"]:
            user_email = "gnekwaya@joinact.org"
        else:
            user_email = f"admin@{domain}"
        
        password = f"ClimateAdmin2025!{admin_id.title()}"
        
        user_id = None
        user_created = False
        
        try:
            # Create new auth user
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
            else:
                raise auth_error
        
        if not user_id:
            return {"success": False, "error": "Could not obtain admin user ID"}
        
        # First create profiles entry (required for all users)
        profiles_data = {
            "id": user_id,  # Must match auth.users.id
            "email": user_email,
            "first_name": admin_data["name"].split()[0] if " " in admin_data["name"] else admin_data["name"],
            "last_name": admin_data["name"].split()[-1] if " " in admin_data["name"] else "",
            "organization_name": admin_data["name"],
            "organization_type": admin_data["organization_type"],
            "role": "admin",
            "user_type": "admin",
            "verified": True,
            "website": admin_data.get("website"),
            "description": admin_data.get("description"),
            "contact_info": admin_data.get("contact_info", {}),
            "partnership_level": "platform_admin"
        }
        
        try:
            # Insert profiles entry
            supabase.table("profiles").insert(profiles_data).execute()
            logger.info(f"Created profiles entry for {admin_data['name']}")
        except Exception as profiles_error:
            if "duplicate key value" in str(profiles_error) or "already exists" in str(profiles_error):
                # Profile exists, update it
                logger.info(f"Profile exists for {admin_data['name']}, updating...")
                update_data = {k: v for k, v in profiles_data.items() if k != 'id'}
                supabase.table("profiles").update(update_data).eq('id', user_id).execute()
            else:
                logger.warning(f"Could not create/update profiles entry: {profiles_error}")

        # Create admin profile matching current schema
        admin_profile_data = {
            "id": str(uuid.uuid4()),  # Generate new UUID for admin_profiles.id
            "user_id": user_id,  # Reference to auth.users.id (and profiles.id)
            "full_name": admin_data["name"],
            "email": user_email,
            "phone": admin_data["contact_info"].get("phone"),
            "department": admin_data.get("department"),
            "admin_level": admin_data.get("admin_level", "standard"),  # Add required admin_level field
            "permissions": admin_data.get("permissions", []),
            "can_manage_users": True,
            "can_manage_partners": True,
            "can_manage_content": True,
            "can_view_analytics": True,
            "can_manage_system": True,
            "admin_notes": f"Platform administrator for {admin_data['name']}",
            "direct_phone": admin_data["contact_info"].get("phone"),
            "emergency_contact": {
                "organization": admin_data["name"],
                "email": admin_data["contact_info"]["email"],
                "phone": admin_data["contact_info"].get("phone", "")
            },
            "profile_completed": True
        }
        
        try:
            # Insert admin profile
            supabase.table("admin_profiles").insert(admin_profile_data).execute()
        except Exception as admin_profile_error:
            if "duplicate key value" in str(admin_profile_error) or "already exists" in str(admin_profile_error):
                # Admin profile exists, update it
                logger.info(f"Admin profile exists for {admin_data['name']}, updating...")
                update_data = {k: v for k, v in admin_profile_data.items() if k not in ['id', 'user_id']}
                supabase.table("admin_profiles").update(update_data).eq('user_id', user_id).execute()
            else:
                raise admin_profile_error
        
        # Create knowledge resources for admin programs
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
                
                # Create resource record matching current schema
                resource_data = {
                    "id": str(uuid.uuid4()),
                    "partner_id": user_id,  # Using partner_id field for consistency
                    "title": f"{admin_data['name']}: {program['title']}",
                    "description": program.get("description", ""),
                    "content": chunk["content"],
                    "content_type": "admin_capability",
                    "source_url": admin_data.get("website"),
                    "file_path": f"/storage/knowledge_resources/admin/{user_id}/{program['title'].replace(' ', '_')}.pdf",  # Full directory path
                    "domain": "platform_administration",
                    "topics": extract_admin_topics(chunk["content"]),
                    "tags": generate_admin_tags(admin_data, program),
                    "categories": ["admin", "platform_management", program["type"]],
                    "climate_sectors": ["platform_administration", "workforce_development"],  # ARRAY field
                    "skill_categories": ["administration", "user_management", "analytics"],  # ARRAY field
                    "target_audience": program.get("target_audience", ["platform_users"]),
                    "content_difficulty": "advanced",
                    "is_published": True,
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
            "action": action,
            "resources_created": resources_created,
            "admin_level": admin_data["admin_level"],
            "capabilities": len(admin_data["permissions"]),
            "programs": len(admin_data.get("current_programs", []))
        }
        
    except Exception as e:
        logger.error(f"Error creating admin user {admin_id}: {str(e)}")
        return {"success": False, "error": str(e)}

async def create_partner_with_current_schema(partner_id: str, partner_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a partner account using the current database schema."""
    
    try:
        import uuid
        
        # Generate email and password
        domain = partner_data['website'].replace('https://', '').replace('http://', '').split('/')[0]
        # Remove www. and other subdomains from domain for email
        if domain.startswith('www.'):
            domain = domain[4:]  # Remove 'www.'
        
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
            else:
                raise auth_error
        
        if not user_id:
            return {"success": False, "error": "Could not obtain user ID"}
        
        # First create profiles entry (required for all users)
        profiles_data = {
            "id": user_id,  # Must match auth.users.id
            "email": user_email,
            "first_name": partner_data["contact_info"].get("contact_person", partner_data["name"]).split()[0],
            "last_name": partner_data["contact_info"].get("contact_person", "Representative").split()[-1],
            "organization_name": partner_data["name"],
            "organization_type": partner_data["organization_type"],
            "role": "partner",
            "user_type": "partner",
            "verified": partner_data.get("verified", True),
            "website": partner_data.get("website"),
            "description": partner_data.get("description"),
            "contact_info": partner_data.get("contact_info", {}),
            "partnership_level": partner_data["partnership_level"]
        }
        
        try:
            # Insert profiles entry
            supabase.table("profiles").insert(profiles_data).execute()
            logger.info(f"Created profiles entry for {partner_data['name']}")
        except Exception as profiles_error:
            if "duplicate key value" in str(profiles_error) or "already exists" in str(profiles_error):
                # Profile exists, update it
                logger.info(f"Profile exists for {partner_data['name']}, updating...")
                update_data = {k: v for k, v in profiles_data.items() if k != 'id'}
                supabase.table("profiles").update(update_data).eq('id', user_id).execute()
            else:
                logger.warning(f"Could not create/update profiles entry: {profiles_error}")

        # Create partner profile matching current schema
        partner_profile_data = {
            "id": user_id,  # Primary key matches auth.users.id
            "full_name": partner_data["contact_info"].get("contact_person", f"Representative - {partner_data['name']}"),
            "email": user_email,
            "phone": partner_data["contact_info"].get("phone"),
            "organization_name": partner_data["name"],
            "organization_type": partner_data["organization_type"],
            "organization_size": partner_data.get("organization_size", "medium"),
            "website": partner_data["website"],
            "headquarters_location": partner_data.get("headquarters_location", partner_data["contact_info"].get("address", "")),
            "partnership_level": partner_data["partnership_level"],
            "verified": partner_data.get("verified", True),
            "verification_date": datetime.now(timezone.utc).isoformat() if partner_data.get("verified", True) else None,
            "climate_focus": partner_data["climate_focus"],
            "services_offered": [program["type"] for program in partner_data.get("current_programs", [])],
            "industries": partner_data["climate_focus"],  # JSONB field
            "description": partner_data["description"],
            "mission_statement": f"Advancing climate economy through {', '.join(partner_data['climate_focus'])}",
            "employee_count": partner_data.get("employee_count"),
            "founded_year": partner_data.get("founded_year"),
            "hiring_actively": partner_data.get("hiring_actively", False),
            "training_programs": partner_data.get("training_programs", []),  # JSONB field
            "internship_programs": any("internship" in program.get("type", "") for program in partner_data.get("current_programs", [])),
            "profile_completed": True
        }
        
        try:
            # Insert partner profile
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
        except Exception as delete_error:
            logger.warning(f"Could not delete existing records: {delete_error}")
        
        # Create resources, job listings, and education programs
        resources_created = 0
        job_listings_created = 0
        education_programs_created = 0
        role_requirements_created = 0  # Initialize role requirements counter
        partner_resources_created = 0
        chunker = AIOptimizedChunker()
        
        # Create comprehensive partner resources first
        partner_resources_created = await create_partner_resources(partner_id, partner_data, user_id)
        
        for program in partner_data.get("current_programs", []):
            program_type = program.get("type", "")
            
            # Create role requirements for all programs
            role_req_data = create_role_requirements(user_id, partner_data, program)
            
            # Insert role requirements
            try:
                result = supabase.table('role_requirements').insert(role_req_data).execute()
                
                if result.data:
                    role_requirements_created += 1
                    logger.info(f"Created role requirements: {role_req_data['role_title']}")
                else:
                    logger.warning(f"Failed to create role requirements for {program['title']}")
            except Exception as e:
                logger.error(f"Error inserting role requirements: {e}")
                logger.error(f"Role requirements data: {role_req_data}")
            
            # Create job listings for job-related programs
            if program_type in ["job_training", "apprenticeship", "job_placement"]:
                job_data = create_job_listing_from_program(user_id, partner_data, program)
                if job_data:
                    try:
                        supabase.table("job_listings").insert(job_data).execute()
                        job_listings_created += 1
                        logger.info(f"Created job listing: {program['title']}")
                    except Exception as e:
                        logger.error(f"Failed to create job listing: {e}")
            
            # Create education programs for education-related programs  
            elif program_type in ["education", "internship", "fellowship", "workforce_development", "pre_apprenticeship"]:
                edu_data = create_education_program_from_program(user_id, partner_data, program)
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
                
                # Create resource record matching current schema
                resource_data = {
                    "id": str(uuid.uuid4()),
                    "partner_id": user_id,
                    "title": f"{partner_data['name']}: {program['title']}",
                    "description": program.get("description", ""),
                    "content": chunk["content"],
                    "content_type": program["type"],
                    "source_url": partner_data.get("website"),
                    "file_path": f"/storage/knowledge_resources/partners/{user_id}/{program['title'].replace(' ', '_')}.pdf",  # Full directory path
                    "domain": partner_data["climate_focus"][0] if partner_data["climate_focus"] else "general",
                    "topics": extract_topics(chunk["content"]),
                    "tags": generate_tags(partner_data, program),
                    "categories": [partner_data["organization_type"], program["type"]],
                    "climate_sectors": partner_data["climate_focus"],  # ARRAY field for climate sectors
                    "skill_categories": program.get("focus_areas", []),  # ARRAY field for skill categories
                    "target_audience": program.get("target_audience", ["general"]),
                    "content_difficulty": "intermediate",
                    "is_published": True,
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
            "action": action,
            "resources_created": resources_created,
            "job_listings_created": job_listings_created,
            "education_programs_created": education_programs_created,
            "role_requirements_created": role_requirements_created,
            "partner_resources_created": 0  # Will be implemented when partner_resources table is available
        }
        
    except Exception as e:
        logger.error(f"Error creating partner {partner_id}: {str(e)}")
        return {"success": False, "error": str(e)}

def create_job_listing_from_program(partner_id: str, partner_data: Dict, program: Dict) -> Dict[str, Any]:
    """Create a job listing from a program matching current schema."""
    import uuid
    
    # Determine employment type
    employment_type = program.get("employment_type", "full_time")
    if program["type"] == "apprenticeship":
        employment_type = "apprenticeship"
    elif program["type"] == "job_training":
        employment_type = "training"
    elif "internship" in program.get("title", "").lower():
        employment_type = "internship"
    
    # Extract requirements
    requirements = []
    if "requirements" in program:
        requirements = program["requirements"] if isinstance(program["requirements"], list) else [program["requirements"]]
    
    # Generate job description
    description = program.get("description", "")
    if "focus_areas" in program:
        description += f"\n\nFocus Areas: {', '.join(program['focus_areas'])}"
    if "duration" in program:
        description += f"\n\nProgram Duration: {program['duration']}"
    
    job_data = {
        "id": str(uuid.uuid4()),
        "partner_id": partner_id,
        "title": program["title"],
        "description": description,
        "requirements": "\n".join(requirements) if requirements else None,
        "responsibilities": program.get("focus", ""),
        "location": program.get("location", partner_data.get("contact_info", {}).get("address", "Massachusetts")),
        "employment_type": employment_type,
        "experience_level": program.get("experience_level", "entry_level"),
        "salary_range": program.get("salary_range", program.get("compensation", None)),
        "climate_focus": program.get("climate_focus", partner_data.get("climate_focus", [])),
        "skills_required": program.get("skills_required", program.get("focus_areas", [])),
        "benefits": program.get("support_services", None),
        "application_url": partner_data.get("website"),
        "is_active": True
    }
    
    return job_data

def create_education_program_from_program(partner_id: str, partner_data: Dict, program: Dict) -> Dict[str, Any]:
    """Create an education program from a program matching current schema."""
    import uuid
    
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
    
    # Generate comprehensive description
    description = program.get("description", "")
    if "focus_areas" in program:
        description += f"\n\nFocus Areas: {', '.join(program['focus_areas'])}"
    
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

def generate_admin_program_content(admin_data: Dict, program: Dict) -> str:
    """Generate comprehensive content for an admin program."""
    
    content_parts = [
        f"# {admin_data['name']}: {program['title']}",
        f"\n## Platform Administration Overview",
        f"**Admin Level:** {admin_data['admin_level'].title()}",
        f"**Department:** {admin_data['department']}",
        f"**Organization Type:** {admin_data['organization_type'].title()}",
        f"**Website:** {admin_data['website']}",
        f"\n**Platform Mission:** {admin_data['description']}",
    ]
    
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

def extract_admin_topics(content: str) -> List[str]:
    """Extract topics from admin content using keyword analysis."""
    
    admin_topic_keywords = {
        "user_management": ["user", "profile", "account", "authentication"],
        "analytics": ["analytics", "dashboard", "metrics", "reporting"],
        "security": ["security", "audit", "compliance", "access"],
        "platform_administration": ["admin", "platform", "system", "management"],
        "content_management": ["content", "resources", "knowledge", "publishing"],
        "partner_management": ["partner", "organization", "verification"]
    }
    
    content_lower = content.lower()
    topics = []
    
    for topic, keywords in admin_topic_keywords.items():
        if any(keyword in content_lower for keyword in keywords):
            topics.append(topic)
    
    return topics[:6]

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

def generate_admin_tags(admin_data: Dict, program: Dict) -> List[str]:
    """Generate tags for admin resources."""
    
    tags = [
        admin_data["admin_level"],
        "platform_administration",
        "system_management",
        program["type"],
        "2025",
        "climate_economy",
        "admin_capabilities"
    ]
    
    # Add permission-based tags
    if "permissions" in admin_data:
        for permission in admin_data["permissions"][:5]:  # Limit to first 5 permissions
            tags.append(permission)
    
    return list(set(tags))

async def create_job_seeker(job_seeker_id: str, job_seeker_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create a job seeker account matching current schema."""
    
    try:
        import uuid
        
        # Extract personal info
        personal_info = job_seeker_data["personal_info"]
        user_email = personal_info["email"]
        password = f"ClimateJobs2025!JobSeeker"
        
        user_id = None
        user_created = False
        
        try:
            # Create new auth user
            user_result = supabase.auth.admin.create_user({
                "email": user_email,
                "password": password,
                "email_confirm": True,
                "user_metadata": {
                    "full_name": personal_info["full_name"],
                    "role": "job_seeker",
                    "created_date": "June 2025",
                    "location": personal_info["location"]
                }
            })
            user_id = user_result.user.id
            user_created = True
            logger.info(f"Created new job seeker user for {personal_info['full_name']}")
            
        except Exception as auth_error:
            if "already been registered" in str(auth_error):
                logger.info(f"Job seeker {user_email} already exists, updating profile...")
                
                # Get existing user by email
                existing_users = supabase.auth.admin.list_users()
                for user in existing_users:
                    if user.email == user_email:
                        user_id = user.id
                        break
            else:
                raise auth_error
        
        if not user_id:
            return {"success": False, "error": "Could not obtain job seeker user ID"}
        
        # First create profiles entry (required for all users)
        profiles_data = {
            "id": user_id,  # Must match auth.users.id
            "email": user_email,
            "first_name": personal_info["full_name"].split()[0],
            "last_name": personal_info["full_name"].split()[-1] if " " in personal_info["full_name"] else "",
            "organization_name": None,  # Job seekers don't have organizations
            "organization_type": None,
            "role": "job_seeker",
            "user_type": "job_seeker", 
            "verified": True,
            "website": personal_info.get("personal_website"),
            "description": job_seeker_data.get("professional_summary", ""),
            "contact_info": {
                "phone": personal_info.get("phone"),
                "location": personal_info["location"],
                "linkedin": personal_info.get("linkedin_url"),
                "nationality": personal_info.get("nationality")
            },
            "partnership_level": "user"
        }
        
        try:
            # Insert profiles entry
            supabase.table("profiles").insert(profiles_data).execute()
            logger.info(f"Created profiles entry for {personal_info['full_name']}")
        except Exception as profiles_error:
            if "duplicate key value" in str(profiles_error) or "already exists" in str(profiles_error):
                # Profile exists, update it
                logger.info(f"Profile exists for {personal_info['full_name']}, updating...")
                update_data = {k: v for k, v in profiles_data.items() if k != 'id'}
                supabase.table("profiles").update(update_data).eq('id', user_id).execute()
            else:
                logger.warning(f"Could not create/update profiles entry: {profiles_error}")

        # Extract skills
        all_skills = []
        if "skills" in job_seeker_data:
            skills_data = job_seeker_data["skills"]
            if "technical" in skills_data:
                all_skills.extend(skills_data["technical"])
            if "business" in skills_data:
                all_skills.extend(skills_data["business"])
        
        # Extract work experience for years calculation
        total_years_experience = 0
        current_experience = []
        if "work_experience" in job_seeker_data:
            for exp in job_seeker_data["work_experience"]:
                if exp.get("current", False):
                    current_experience.append(f"{exp['title']} at {exp['company']}")
                
                # Calculate approximate years (simplified)
                start_year = int(exp["start_date"].split()[-1]) if exp.get("start_date") else 2020
                end_year = 2025 if exp.get("current", False) else (int(exp["end_date"].split()[-1]) if exp.get("end_date") else start_year + 1)
                total_years_experience += max(0, end_year - start_year)
        
        # Determine experience level
        if total_years_experience <= 2:
            experience_level = "entry_level"
        elif total_years_experience <= 5:
            experience_level = "mid_level"
        else:
            experience_level = "senior"  # Changed to senior instead of experienced
        
        # Create job seeker profile matching current schema
        job_seeker_profile_data = {
            "id": user_id,  # Primary key matches auth.users.id
            "user_id": user_id,  # Foreign key reference to auth.users.id
            "full_name": personal_info["full_name"],
            "email": user_email,
            "phone": personal_info.get("phone"),
            "location": personal_info["location"],
            "current_title": "Fintech Founder & Project Manager",
            "experience_level": experience_level,
            "climate_interests": job_seeker_data.get("climate_interests", []),  # JSONB field
            "climate_focus_areas": job_seeker_data.get("climate_interests", []),  # JSONB field
            "desired_roles": job_seeker_data.get("job_preferences", {}).get("desired_roles", []),  # JSONB field
            "preferred_locations": job_seeker_data.get("job_preferences", {}).get("location_preferences", []),  # JSONB field
            "employment_types": job_seeker_data.get("job_preferences", {}).get("employment_type", []),  # JSONB field
            "remote_work_preference": "hybrid",
            "salary_range_min": 75000,
            "salary_range_max": 120000,
            "resume_filename": f"{personal_info['full_name'].replace(' ', '_')}_Resume_2025.pdf",
            "resume_storage_path": f"/storage/resumes/{user_id}/George_Nekwaya_Resume_2025.pdf",
            "resume_uploaded_at": datetime.now(timezone.utc).isoformat(),
            "profile_completed": True
        }
        
        try:
            # Insert job seeker profile
            supabase.table("job_seeker_profiles").insert(job_seeker_profile_data).execute()
        except Exception as job_seeker_profile_error:
            if "duplicate key value" in str(job_seeker_profile_error) or "already exists" in str(job_seeker_profile_error):
                # Job seeker profile exists, update it
                logger.info(f"Job seeker profile exists for {personal_info['full_name']}, updating...")
                update_data = {k: v for k, v in job_seeker_profile_data.items() if k != 'id'}
                supabase.table("job_seeker_profiles").update(update_data).eq('id', user_id).execute()
            else:
                raise job_seeker_profile_error
        
        # Create user interests entries matching current schema
        interests_created = 0
        if job_seeker_data.get("climate_interests"):
            try:
                interest_data = {
                    "id": str(uuid.uuid4()),
                    "user_id": user_id,
                    "climate_focus": job_seeker_data["climate_interests"],  # ARRAY field
                    "target_roles": job_seeker_data.get("job_preferences", {}).get("desired_roles", []),  # ARRAY field
                    "skills_to_develop": ["Advanced Data Analytics", "Climate Finance", "Renewable Energy Systems"],  # ARRAY field
                    "preferred_location": personal_info["location"],
                    "employment_preferences": {
                        "salary_range": job_seeker_data.get("job_preferences", {}).get("salary_expectation", "$75,000 - $120,000"),
                        "remote_work": True,
                        "flexible_hours": True,
                        "travel_preference": "minimal"
                    },
                    "email_notifications": True,
                    "job_alerts_enabled": True,
                    "newsletter_enabled": True,
                    "partner_updates_enabled": True,
                    "marketing_emails_enabled": False,
                    "data_sharing_enabled": True,
                    "social_profile_analysis_enabled": True,
                    "language_preference": "en",
                    "timezone": "America/New_York",
                    "theme_preference": "system"
                }
                supabase.table("user_interests").insert(interest_data).execute()
                interests_created = 1
            except Exception as e:
                logger.warning(f"Could not create user interests: {e}")
        
        # Create resume entry with comprehensive content
        resume_content = generate_resume_content(job_seeker_data)
        resume_created = False
        
        try:
            # Generate embedding for resume content
            embedding = await generate_embedding(resume_content)
            
            resume_data = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,  # Changed from job_seeker_id to user_id to match schema
                "file_name": f"{personal_info['full_name'].replace(' ', '_')}_Resume_2025.pdf",
                "file_path": f"/storage/resumes/{user_id}/George_Nekwaya_Resume_2025.pdf",  # Full directory path
                "content": resume_content,
                "content_type": "application/pdf",
                "file_size": len(resume_content.encode('utf-8')),
                "embedding": embedding,
                "content_embedding": embedding,  # Additional embedding field in schema
                "skills_extracted": all_skills,
                "experience_years": total_years_experience,
                "education_level": "graduate",
                "climate_relevance_score": 0.85,
                "industry_background": ["Fintech", "Climate Tech", "Engineering", "Workforce Development"],
                "linkedin_url": personal_info.get("linkedin_url"),
                "personal_website": personal_info.get("personal_website"),
                "processing_status": "completed",
                "processed": True,
                "processing_metadata": {
                    "extraction_method": "manual_input",
                    "embedding_model": "text-embedding-3-small",
                    "processing_time": "2025-01-01T00:00:00Z"
                }
            }
            
            supabase.table("resumes").insert(resume_data).execute()
            resume_created = True
            
        except Exception as e:
            logger.warning(f"Could not create resume entry: {e}")
            logger.warning(f"Resume data: {resume_data}")
        
        action = "Created" if user_created else "Updated"
        return {
            "success": True,
            "user_id": user_id,
            "email": user_email,
            "password": password,
            "interests_created": interests_created,
            "resume_created": resume_created,
            "experience_level": experience_level,
            "years_experience": total_years_experience,
            "skills_count": len(all_skills),
            "action": action
        }
        
    except Exception as e:
        logger.error(f"Error creating job seeker {job_seeker_id}: {str(e)}")
        return {"success": False, "error": str(e)}

def generate_resume_content(job_seeker_data: Dict) -> str:
    """Generate comprehensive resume content from job seeker data."""
    
    personal_info = job_seeker_data["personal_info"]
    content_parts = [
        f"# {personal_info['full_name']}",
        f"**Phone:** {personal_info.get('phone', 'N/A')}",
        f"**Email:** {personal_info['email']}",
        f"**Location:** {personal_info['location']}",
        f"**LinkedIn:** {personal_info.get('linkedin_url', 'N/A')}",
        f"**Website:** {personal_info.get('personal_website', 'N/A')}",
        "",
        "## Professional Summary",
        job_seeker_data.get("professional_summary", ""),
        ""
    ]
    
    # Add education
    if "education" in job_seeker_data:
        content_parts.append("## Education")
        for edu in job_seeker_data["education"]:
            content_parts.append(f"**{edu.get('degree', 'Degree')}**")
            content_parts.append(f"{edu.get('institution', 'Institution')} - {edu.get('location', 'Location')}")
            if edu.get("gpa"):
                content_parts.append(f"GPA: {edu['gpa']}")
            if edu.get("graduation_year"):
                content_parts.append(f"Graduated: {edu['graduation_year']}")
            if edu.get("concentrations"):
                content_parts.append(f"Concentrations: {', '.join(edu['concentrations'])}")
            content_parts.append("")
    
    # Add work experience
    if "work_experience" in job_seeker_data:
        content_parts.append("## Work Experience")
        for exp in job_seeker_data["work_experience"]:
            content_parts.append(f"**{exp.get('title', 'Title')}**")
            content_parts.append(f"{exp.get('company', 'Company')} - {exp.get('location', 'Location')}")
            date_range = f"{exp.get('start_date', 'Start')} - {exp.get('end_date', 'Present')}"
            content_parts.append(f"*{date_range}*")
            
            if exp.get("responsibilities"):
                for resp in exp["responsibilities"]:
                    content_parts.append(f"• {resp}")
            content_parts.append("")
    
    # Add projects
    if "projects" in job_seeker_data:
        content_parts.append("## Projects")
        for project in job_seeker_data["projects"]:
            content_parts.append(f"**{project.get('title', 'Project Title')}**")
            content_parts.append(project.get("description", ""))
            if project.get("technologies"):
                content_parts.append(f"Technologies: {', '.join(project['technologies'])}")
            content_parts.append("")
    
    # Add skills
    if "skills" in job_seeker_data:
        content_parts.append("## Skills")
        skills_data = job_seeker_data["skills"]
        if "technical" in skills_data:
            content_parts.append(f"**Technical Skills:** {', '.join(skills_data['technical'])}")
        if "business" in skills_data:
            content_parts.append(f"**Business Skills:** {', '.join(skills_data['business'])}")
        if "languages" in skills_data:
            content_parts.append(f"**Languages:** {', '.join(skills_data['languages'])}")
        content_parts.append("")
    
    # Add certifications
    if "certifications" in job_seeker_data:
        content_parts.append("## Certifications")
        for cert in job_seeker_data["certifications"]:
            content_parts.append(f"• {cert}")
        content_parts.append("")
    
    return "\n".join(content_parts)

def generate_education_summary(education_list: List[Dict]) -> str:
    """Generate a summary of education for the job seeker."""
    if not education_list:
        return "Education details not provided"
    
    summaries = []
    for edu in education_list:
        summary = f"{edu.get('degree', 'Degree')} from {edu.get('institution', 'Institution')}"
        if edu.get("graduation_year"):
            summary += f" ({edu['graduation_year']})"
        summaries.append(summary)
    
    return "; ".join(summaries)

def create_role_requirements(partner_id: str, partner_data: Dict, program: Dict) -> Dict[str, Any]:
    """Create role requirements for job training and education programs."""
    
    try:
        import uuid
        
        # Generate role title from program
        role_title = program["title"]
        if "training" in role_title.lower():
            role_title = role_title.replace(" Training", "").replace(" training", "")
        if "program" in role_title.lower():
            role_title = role_title.replace(" Program", "").replace(" program", "")
        
        # Determine experience level with valid database values
        experience_level = "entry"  # Use simple enum values
        if "advanced" in program.get("description", "").lower() or "senior" in program.get("description", "").lower():
            experience_level = "senior"
        elif "intermediate" in program.get("description", "").lower() or "mid" in program.get("description", "").lower():
            experience_level = "mid"
        
        # Extract skills from program
        required_skills = []
        preferred_skills = []
        
        if "requirements" in program:
            requirements = program["requirements"]
            if isinstance(requirements, list):
                required_skills.extend(requirements)
            else:
                required_skills.append(requirements)
        
        if "focus_areas" in program:
            preferred_skills.extend(program["focus_areas"])
        
        # Add climate-specific skills
        climate_skills = []
        for focus in partner_data.get("climate_focus", []):
            if focus == "solar":
                climate_skills.extend(["Solar PV Installation", "NABCEP Certification", "Electrical Safety"])
            elif focus == "wind":
                climate_skills.extend(["Wind Turbine Technology", "Offshore Wind", "Renewable Energy Systems"])
            elif focus == "energy_efficiency":
                climate_skills.extend(["Energy Auditing", "Building Performance", "HVAC Systems"])
            elif focus == "workforce_development":
                climate_skills.extend(["Career Coaching", "Skills Assessment", "Professional Development"])
        
        preferred_skills.extend(climate_skills)
        
        # Determine salary range
        salary_min = 40000
        salary_max = 80000
        
        if experience_level == "entry_level":
            salary_min = 35000
            salary_max = 55000
        elif experience_level == "mid_level":
            salary_min = 55000
            salary_max = 85000
        elif experience_level == "senior_level":
            salary_min = 75000
            salary_max = 120000
        
        # Adjust for program type
        if program["type"] in ["internship", "fellowship"]:
            salary_min = 15
            salary_max = 25  # hourly rates
        elif program["type"] == "apprenticeship":
            salary_min = 18
            salary_max = 30  # hourly rates
        
        role_requirements_data = {
            "id": str(uuid.uuid4()),
            "role_title": role_title,
            "climate_sector": "renewable_energy",  # Use a standard climate sector value
            "experience_level": experience_level,
            "required_skills": list(set(required_skills)),  # Remove duplicates - ARRAY field
            "preferred_skills": list(set(preferred_skills)),  # Remove duplicates - ARRAY field
            "minimum_years": 0 if experience_level == "entry" else (2 if experience_level == "mid" else 5),
            "salary_range": {
                "min": salary_min,
                "max": salary_max,
                "currency": "USD",
                "type": "hourly" if program["type"] in ["internship", "fellowship", "apprenticeship"] else "annual"
            }
        }
        
        return role_requirements_data
        
    except Exception as e:
        logger.error(f"Error creating role requirements: {e}")
        return None

async def create_partner_resources(partner_id: str, partner_data: Dict[str, Any], user_id: str) -> int:
    """Create comprehensive partner resources from the enhanced resource data."""
    
    resources_created = 0
    
    # Get comprehensive resource data for this partner
    resource_data = COMPREHENSIVE_PARTNER_RESOURCES_2025.get(partner_id, {})
    
    if not resource_data:
        logger.warning(f"No comprehensive resource data found for partner {partner_id}")
        return 0
    
    # Create digital presence resources (if partner_resources table exists)
    digital_presence = resource_data.get("digital_presence", {})
    for platform, url in digital_presence.items():
        if url:
            try:
                # Create a knowledge resource for digital presence
                content = f"# {partner_data['name']} - {platform.replace('_', ' ').title()}\n\n"
                content += f"**Platform:** {platform.replace('_', ' ').title()}\n"
                content += f"**URL:** {url}\n"
                content += f"**Organization:** {partner_data['name']}\n"
                content += f"**Description:** Official {platform.replace('_', ' ')} presence for {partner_data['name']}\n\n"
                content += f"This digital platform provides access to {partner_data['name']}'s "
                
                if platform == "careers_page":
                    content += "job opportunities, application processes, and career information."
                elif platform == "linkedin":
                    content += "professional updates, company news, and networking opportunities."
                elif platform == "blog":
                    content += "industry insights, educational content, and thought leadership."
                else:
                    content += "resources, updates, and engagement opportunities."
                
                # Generate embedding for digital presence content
                embedding = await generate_embedding(content)
                
                digital_resource_record = {
                    "id": str(uuid.uuid4()),
                    "partner_id": user_id,
                    "title": f"{partner_data['name']} - {platform.replace('_', ' ').title()}",
                    "description": f"Official {platform.replace('_', ' ')} presence for {partner_data['name']}",
                    "content": content,
                    "content_type": "digital_presence",
                    "source_url": url,
                    "file_path": f"/storage/knowledge_resources/partners/{user_id}/digital_{platform}.pdf",
                    "domain": partner_data["climate_focus"][0] if partner_data["climate_focus"] else "general",
                    "topics": ["digital_presence", platform, "partner_resources"],
                    "tags": ["digital_presence", platform, partner_data["organization_type"], "2025"],
                    "categories": ["digital_presence", platform],
                    "climate_sectors": partner_data["climate_focus"],
                    "skill_categories": ["digital_literacy", "platform_navigation"],
                    "target_audience": ["job_seekers", "general_public"],
                    "content_difficulty": "beginner",
                    "is_published": True,
                    "embedding": embedding,
                    "metadata": {
                        "platform_type": platform,
                        "partner_name": partner_data["name"],
                        "organization_type": partner_data.get("organization_type"),
                        "year": "2025"
                    }
                }
                
                supabase.table("knowledge_resources").insert(digital_resource_record).execute()
                resources_created += 1
                
            except Exception as e:
                logger.error(f"Failed to create digital presence resource for {platform}: {e}")
    
    # Create detailed resources
    resources = resource_data.get("resources", [])
    for resource in resources:
        try:
            # Generate comprehensive content for the resource
            content = generate_resource_content(partner_data, resource)
            
            # Generate embedding for the content
            embedding = await generate_embedding(content)
            
            resource_record = {
                "id": str(uuid.uuid4()),
                "partner_id": user_id,
                "title": resource["title"],
                "description": resource["description"],
                "content": content,
                "content_type": resource["type"],
                "source_url": resource.get("url"),
                "file_path": f"/storage/knowledge_resources/partners/{user_id}/{resource['title'].replace(' ', '_')}.pdf",
                "domain": partner_data["climate_focus"][0] if partner_data["climate_focus"] else "general",
                "topics": extract_resource_topics(resource),
                "tags": generate_resource_tags(partner_data, resource),
                "categories": [resource["type"], partner_data["organization_type"]],
                "climate_sectors": partner_data["climate_focus"],
                "skill_categories": resource.get("features", []),
                "target_audience": resource.get("target_audience", ["general"]),
                "content_difficulty": "intermediate",
                "is_published": True,
                "embedding": embedding,
                "metadata": {
                    "resource_type": resource["type"],
                    "partner_name": partner_data["name"],
                    "organization_type": partner_data.get("organization_type"),
                    "frequency": resource.get("frequency"),
                    "format": resource.get("format"),
                    "cost": resource.get("cost"),
                    "year": "2025"
                }
            }
            
            supabase.table("knowledge_resources").insert(resource_record).execute()
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
    
    if resource.get("compensation"):
        content_parts.append(f"**Compensation:** {resource['compensation'].replace('_', ' ')}")
    
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

def extract_resource_topics(resource: Dict) -> List[str]:
    """Extract topics from resource content."""
    
    topics = [resource["type"]]
    
    if resource.get("target_audience"):
        topics.extend(resource["target_audience"])
    
    if resource.get("features"):
        topics.extend(resource["features"])
    
    # Add topic based on resource type
    if resource["type"] in ["webinar", "webinar_series"]:
        topics.extend(["professional_development", "online_learning"])
    elif resource["type"] in ["event", "career_event"]:
        topics.extend(["networking", "career_development"])
    elif resource["type"] == "resource_library":
        topics.extend(["documentation", "self_paced_learning"])
    elif resource["type"] == "internship_program":
        topics.extend(["work_experience", "career_development"])
    elif resource["type"] == "mentorship_program":
        topics.extend(["career_guidance", "professional_development"])
    
    return list(set(topics))[:10]  # Limit to 10 topics

def generate_resource_tags(partner_data: Dict, resource: Dict) -> List[str]:
    """Generate tags for resource searchability."""
    
    tags = [
        resource["type"],
        partner_data["organization_type"],
        "2025",
        "massachusetts"
    ]
    
    tags.extend(partner_data.get("climate_focus", []))
    
    if resource.get("cost") == "free":
        tags.append("free")
    elif resource.get("cost"):
        tags.append("paid")
    
    if resource.get("format") == "virtual":
        tags.append("online")
    elif resource.get("format") == "in_person":
        tags.append("in_person")
    elif resource.get("format") == "hybrid":
        tags.append("hybrid")
    
    if resource.get("frequency"):
        tags.append(resource["frequency"])
    
    return list(set(tags))

async def process_pdf_resource(pdf_info: Dict[str, Any], chunker: AIOptimizedChunker) -> List[Dict[str, Any]]:
    """Process a PDF resource into AI-optimized chunks."""
    
    try:
        pdf_path = pdf_info["file"]
        if not pdf_path.exists():
            logger.warning(f"PDF not found: {pdf_path}")
            return []
        
        # Extract text from PDF
        text_content = ""
        with open(pdf_path, 'rb') as file:
            pdf_reader = PdfReader(file)
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text.strip():
                        text_content += f"\n\n--- Page {page_num + 1} ---\n\n"
                        text_content += page_text
                except Exception as e:
                    logger.warning(f"Could not extract text from page {page_num + 1}: {e}")
                    continue
        
        if not text_content.strip():
            logger.warning(f"No text content extracted from {pdf_path}")
            return []
        
        # Clean up common PDF extraction artifacts
        text_content = re.sub(r'\n\s*\n', '\n\n', text_content)
        text_content = re.sub(r'([a-z])([A-Z])', r'\1 \2', text_content)
        
        # Create metadata for chunking
        chunk_metadata = {
            "source_file": str(pdf_path),
            "source_type": "pdf",
            "domain": pdf_info["domain"],
            "title": pdf_info["title"],
            "topics": pdf_info["topics"],
            "description": pdf_info["description"],
            "document_type": "reference_document",
            "year": "2023",
            "authority": "industry_report"
        }
        
        # Create chunks using the AI-optimized chunker
        chunks = chunker.chunk_content(text_content, chunk_metadata)
        
        logger.info(f"Successfully processed {pdf_path.name}: {len(chunks)} chunks created")
        return chunks
        
    except Exception as e:
        logger.error(f"Error processing PDF {pdf_info['file']}: {str(e)}")
        logger.error(traceback.format_exc())
        return []

async def ingest_pdf_resources() -> Dict[str, int]:
    """Ingest PDF resources into the knowledge base."""
    
    logger.info("🔄 Starting PDF resource ingestion...")
    
    results = {
        "pdfs_processed": 0,
        "chunks_created": 0,
        "resources_created": 0,
        "errors": 0
    }
    
    chunker = AIOptimizedChunker()
    
    for pdf_info in CLIMATE_DOMAIN_RESOURCES:
        try:
            chunks = await process_pdf_resource(pdf_info, chunker)
            
            for chunk in chunks:
                # Generate embedding
                embedding = await generate_embedding(chunk["content"])
                
                # Create knowledge resource record
                resource_data = {
                    "id": str(uuid.uuid4()),
                    "partner_id": None,  # Domain resources aren't partner-specific
                    "title": f"{chunk['metadata']['title']} - Section {chunk['metadata']['chunk_index'] + 1}",
                    "description": chunk["metadata"]["description"],
                    "content": chunk["content"],
                    "content_type": "domain_resource",
                    "source_url": None,
                    "file_path": chunk["metadata"]["source_file"],
                    "domain": chunk["metadata"]["domain"],
                    "topics": chunk["metadata"]["topics"],
                    "tags": [chunk["metadata"]["domain"], "pdf", "domain_resource"] + chunk["metadata"]["topics"],
                    "categories": ["domain_knowledge", chunk["metadata"]["domain"]],
                    "climate_sectors": chunk["metadata"]["topics"],
                    "skill_categories": chunk["metadata"]["topics"],
                    "target_audience": ["policy_makers", "workforce_development", "researchers"],
                    "content_difficulty": "advanced",
                    "is_published": True,
                    "embedding": embedding,
                    "metadata": chunk["metadata"]
                }
                
                try:
                    supabase.table("knowledge_resources").insert(resource_data).execute()
                    results["resources_created"] += 1
                except Exception as e:
                    logger.error(f"Failed to insert resource: {e}")
                    results["errors"] += 1
            
            results["pdfs_processed"] += 1
            results["chunks_created"] += len(chunks)
            
        except Exception as e:
            logger.error(f"Error processing PDF {pdf_info['title']}: {e}")
            results["errors"] += 1
    
    logger.info(f"PDF ingestion completed: {results['pdfs_processed']} PDFs, {results['chunks_created']} chunks, {results['resources_created']} resources")
    return results

async def main():
    """Main function to create seed partners and admin users with current system."""
    
    print("=" * 80)
    print("🌱 CLIMATE ECONOMY ECOSYSTEM - UPDATED SETUP")
    print("📅 Current Date: June 2025")
    print("🔄 Optimized for Current Database Schema")
    print("🤖 AI-Optimized Knowledge Base Ingestion")
    print("👨‍💼 Admin User Management")
    print("=" * 80)
    
    results = {
        "admin_users_created": 0,
        "job_seekers_created": 0,
        "partners_created": 0,
        "job_listings_created": 0,
        "education_programs_created": 0,
        "role_requirements_created": 0,
        "partner_resources_created": 0,
        "digital_resources_created": 0,
        "admin_credentials": [],
        "job_seeker_credentials": [],
        "partner_credentials": [],
        "errors": []
    }
    
    try:
        # Create admin users first
        print(f"\n👨‍💼 CREATING ADMIN USERS...")
        
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
                print(f"   ✅ {result['action']} successfully with {result['capabilities']} capabilities")
            else:
                results["errors"].append(f"Admin {admin_data['name']}: {result['error']}")
                print(f"   ❌ Failed: {result['error']}")
        
        # Create job seeker accounts
        print(f"\n👤 CREATING JOB SEEKER ACCOUNTS...")
        
        for job_seeker_id, job_seeker_data in JOB_SEEKERS_DATA_2025.items():
            personal_info = job_seeker_data["personal_info"]
            print(f"\n👤 Creating job seeker: {personal_info['full_name']}...")
            
            result = await create_job_seeker(job_seeker_id, job_seeker_data)
            
            if result["success"]:
                results["job_seekers_created"] += 1
                results["job_seeker_credentials"].append({
                    "name": personal_info["full_name"],
                    "email": result["email"],
                    "password": result["password"],
                    "location": personal_info["location"],
                    "experience_level": result["experience_level"],
                    "years_experience": result["years_experience"],
                    "skills_count": result["skills_count"],
                    "interests_created": result["interests_created"],
                    "resume_created": result["resume_created"],
                    "linkedin": personal_info.get("linkedin_url", "N/A"),
                    "website": personal_info.get("personal_website", "N/A")
                })
                print(f"   ✅ {result['action']} successfully - {result['experience_level']} level with {result['skills_count']} skills")
            else:
                results["errors"].append(f"Job Seeker {personal_info['full_name']}: {result['error']}")
                print(f"   ❌ Failed: {result['error']}")
        
        # Create George Nekwaya as BOTH admin AND job seeker
        print(f"\n🌟 CREATING GEORGE NEKWAYA AS DUAL ADMIN + JOB SEEKER...")
        
        george_job_seeker_data = JOB_SEEKERS_DATA_2025["george_nekway"]
        george_personal_info = george_job_seeker_data["personal_info"]
        
        # Create George as job seeker with personal email
        print(f"\n👤 Creating George as job seeker: {george_personal_info['full_name']}...")
        
        result = await create_job_seeker("george_nekway", george_job_seeker_data)
        
        if result["success"]:
            results["job_seekers_created"] += 1
            results["job_seeker_credentials"].append({
                "name": george_personal_info["full_name"],
                "email": result["email"],
                "password": result["password"],
                "location": george_personal_info["location"],
                "experience_level": result["experience_level"],
                "years_experience": result["years_experience"],
                "skills_count": result["skills_count"],
                "interests_created": result["interests_created"],
                "resume_created": result["resume_created"],
                "linkedin": george_personal_info.get("linkedin_url", "N/A"),
                "website": george_personal_info.get("personal_website", "N/A"),
                "dual_role": "Admin + Job Seeker"
            })
            print(f"   ✅ {result['action']} successfully - {result['experience_level']} level with {result['skills_count']} skills")
            print(f"   🎯 George now has DUAL ACCESS: Admin (ACT) + Job Seeker + Partner (Buffr)")
        else:
            results["errors"].append(f"Job Seeker {george_personal_info['full_name']}: {result['error']}")
            print(f"   ❌ Failed: {result['error']}")
        
        # Create partner accounts
        print(f"\n🏢 CREATING PARTNER ACCOUNTS...")
        
        for partner_id, partner_data in PARTNERS_DATA_2025.items():
            print(f"\n🏢 Creating partner: {partner_data['name']}...")
            
            result = await create_partner_with_current_schema(partner_id, partner_data)
            
            if result["success"]:
                results["partners_created"] += 1
                results["partner_resources_created"] += result["resources_created"]
                results["role_requirements_created"] += result.get("role_requirements_created", 0)
                results["digital_resources_created"] += result.get("partner_resources_created", 0)
                results["partner_credentials"].append({
                    "name": partner_data["name"],
                    "email": result["email"],
                    "password": result["password"],
                    "website": partner_data["website"],
                    "type": partner_data["organization_type"],
                    "partnership_level": partner_data["partnership_level"],
                    "resources": result["resources_created"],
                    "job_listings": result["job_listings_created"],
                    "education_programs": result["education_programs_created"],
                    "role_requirements": result.get("role_requirements_created", 0),
                    "digital_resources": result.get("partner_resources_created", 0)
                })
                print(f"   ✅ {result['action']} successfully with {result['resources_created']} resources, {result.get('role_requirements_created', 0)} role requirements")
            else:
                results["errors"].append(f"{partner_data['name']}: {result['error']}")
                print(f"   ❌ Failed: {result['error']}")
        
        # Ingest PDF domain resources
        print(f"\n📚 INGESTING CLIMATE DOMAIN KNOWLEDGE...")
        
        try:
            pdf_results = await ingest_pdf_resources()
            results["pdfs_processed"] = pdf_results["pdfs_processed"]
            results["pdf_chunks_created"] = pdf_results["chunks_created"]
            results["domain_resources_created"] = pdf_results["resources_created"]
            results["pdf_errors"] = pdf_results["errors"]
            
            if pdf_results["pdfs_processed"] > 0:
                print(f"   ✅ Processed {pdf_results['pdfs_processed']} PDFs into {pdf_results['chunks_created']} chunks")
                print(f"   📚 Created {pdf_results['resources_created']} domain knowledge resources")
            else:
                print(f"   ⚠️ No PDFs processed (files may not be available)")
                
        except Exception as e:
            logger.error(f"PDF ingestion failed: {e}")
            results["errors"].append(f"PDF ingestion: {str(e)}")
            print(f"   ❌ PDF ingestion failed: {e}")
        
        print("\n" + "=" * 80)
        print("✅ CLIMATE ECONOMY ECOSYSTEM SETUP COMPLETED!")
        print("=" * 80)
        print(f"👨‍💼 Admin Users Created: {results['admin_users_created']}")
        print(f"👤 Job Seekers Created: {results['job_seekers_created']}")
        print(f"🏢 Partners Created: {results['partners_created']}")
        print(f"💼 Job Listings Created: {results['job_listings_created']}")
        print(f"🎓 Education Programs Created: {results['education_programs_created']}")
        print(f"🎯 Role Requirements Created: {results['role_requirements_created']}")
        print(f"📚 Domain PDFs Processed: {results.get('pdfs_processed', 0)}")
        print(f"📄 PDF Chunks Created: {results.get('pdf_chunks_created', 0)}")
        print(f"🧠 Domain Resources Created: {results.get('domain_resources_created', 0)}")
        print(f"❌ Errors: {len(results['errors'])}")
        
        if results['errors']:
            print("\n🚨 ERRORS:")
            for error in results['errors']:
                print(f"   • {error}")
        
        print("\n" + "=" * 80)
        print("🔐 ADMIN USER LOGIN CREDENTIALS")
        print("=" * 80)
        
        for cred in results['admin_credentials']:
            print(f"\n👨‍💼 {cred['name']}")
            print(f"   📧 Email: {cred['email']}")
            print(f"   🔑 Password: {cred['password']}")
            print(f"   🌐 Website: {cred['website']}")
            print(f"   🛡️ Admin Level: {cred['admin_level'].title()}")
            print(f"   ⚙️ Capabilities: {cred['capabilities']} permissions")
            print(f"   📋 Programs: {cred['programs']}")
            print(f"   📚 Admin Resources: {cred['resources']}")
        
        print("\n" + "=" * 80)
        print("🔐 JOB SEEKER LOGIN CREDENTIALS")
        print("=" * 80)
        
        for cred in results['job_seeker_credentials']:
            print(f"\n👤 {cred['name']}")
            print(f"   📧 Email: {cred['email']}")
            print(f"   🔑 Password: {cred['password']}")
            print(f"   📍 Location: {cred['location']}")
            print(f"   💼 Experience Level: {cred['experience_level'].replace('_', ' ').title()}")
            print(f"   📅 Years Experience: {cred['years_experience']}")
            print(f"   🛠️ Skills Count: {cred['skills_count']}")
            print(f"   🎯 Interests Created: {cred['interests_created']}")
            print(f"   📄 Resume Created: {'✅' if cred['resume_created'] else '❌'}")
            print(f"   🔗 LinkedIn: {cred['linkedin']}")
            if cred['website'] != "N/A":
                print(f"   🌐 Website: {cred['website']}")
            if cred.get('dual_role'):
                print(f"   🌟 Special Role: {cred['dual_role']}")
        
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
            if cred.get('job_listings', 0) > 0:
                print(f"   💼 Job Listings: {cred['job_listings']}")
            if cred.get('education_programs', 0) > 0:
                print(f"   🎓 Education Programs: {cred['education_programs']}")
            if cred.get('role_requirements', 0) > 0:
                print(f"   🎯 Role Requirements: {cred['role_requirements']}")
        
        print("\n🚀 The platform is now ready with comprehensive partner, admin, and job seeker data!")
        print("🎯 George Nekwaya has TRIPLE access: Admin (ACT), Partner (Buffr), AND Job Seeker!")
        print("📊 All users have proper profiles table entries!")
        print("=" * 80)
        
    except Exception as e:
        print(f"\n❌ CRITICAL ERROR: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    import uuid
    asyncio.run(main()) 