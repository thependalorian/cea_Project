#!/usr/bin/env python3
"""
Comprehensive Climate Economy Assistant Testing Suite - Updated for George Nekwaya
================================================================================

Testing all climate agents with real-world climate economy scenarios using George Nekwaya's
professional profile and realistic climate job seekers data from the actual seed script.

Key Test Cases:
- Agent workflow orchestration with proper state management
- Real climate economy job matching and career guidance
- Resume analysis and skills assessment for climate careers
- Partner integration and resource recommendation
- Error handling and graceful degradation
"""

import asyncio
import json
import os
import sys
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.agents.base import SupervisorAgent, BaseAgent
from core.agents.empathy_agent import EmpathyAgent
from core.agents.environmental import EnvironmentalJusticeSpecialist
from core.agents.international import InternationalAgent
from core.agents.ma_resource_analyst import MAResourceAnalystAgent
from core.agents.veteran import VeteranAgent
from core.config import settings

# GEORGE NEKWAYA'S COMPREHENSIVE TEST DATA FROM SEED SCRIPT
GEORGE_NEKWAYA_TEST_DATA = {
    "user_id": "gnekwaya-test-001",  # Consistent with seed script pattern
    "email": "george.n.p.nekwaya@gmail.com",  # Personal email for job seeker role
    "admin_email": "gnekwaya@joinact.org",  # Admin email for ACT role
    "partner_email": "buffr_inc@buffr.ai",  # Partner email for Buffr Inc.
    "profile": {
        "full_name": "George Nekwaya",
        "location": "Indianapolis, IN",
        "phone": "+1-206-530-8433",
        "linkedin_url": "https://www.linkedin.com/in/george-nekwaya/",
        "personal_website": "https://georgenekwaya.com/",
        "nationality": "Namibian",
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
                "Business Dynamics",
            ],
            "honors": [
                "Hassenfeld Fellow: Gained global business insights through immersive experiences in Israel and India (2023-2024)"
            ],
        },
        {
            "institution": "Namibia University of Science & Technology",
            "location": "Windhoek, Namibia",
            "degree": "Bachelor of Engineering: Civil & Environmental Engineering",
            "graduation_year": 2018,
        },
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
                "Develop strategies to increase diversity and inclusion in the clean energy workforce",
            ],
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
                "Developed infrastructure for instant payment solutions to improve financial accessibility in emerging markets",
            ],
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
                "Led the development of pitch decks tailored for different funding opportunities",
            ],
        },
    ],
    "projects": [
        {
            "title": "Time Series Analysis and Sentiment Impact on AMD Stock Prices (1984–2024)",
            "description": "Analyzed the influence of news and annual report sentiment on AMD stock prices using time series techniques",
            "technologies": ["Python", "Time Series Analysis", "Sentiment Analysis"],
        },
        {
            "title": "Machine Learning Project in Peer-to-Peer Lending",
            "description": "Optimized loan investments in peer-to-peer lending, analyzing over 1.8 million loans",
            "technologies": ["Machine Learning", "Python", "Financial Modeling"],
        },
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
            "Time Series Analysis",
            "LangGraph",
            "Multi-agent Systems",
        ],
        "business": [
            "Strategic Planning",
            "Business Development",
            "Project Management",
            "Workforce Development",
            "Fintech Strategy",
            "Market Research",
            "Partnership Development",
            "Startup Operations",
        ],
    },
    "certifications": [
        "Agentic AI & Generative AI Bootcamp",
        "Open Banking & Platforms Specialization",
        "Rearchitecting the Finance System",
        "Fintech for Africa",
        "Operations Management",
    ],
    "leadership": [
        "Vice President, International Business School Student Association, Brandeis University",
        "Graduate Student Affairs Senator, Brandeis University",
    ],
    "climate_interests": [
        "clean_energy_workforce",
        "ai_climate_solutions",
        "fintech_sustainability",
        "diversity_inclusion",
        "workforce_development",
        "data_analytics",
    ],
    "job_preferences": {
        "desired_roles": [
            "Project Manager",
            "Business Development Manager",
            "Data Analyst",
            "AI/ML Engineer",
            "Fintech Product Manager",
            "Sustainability Consultant",
            "Workforce Development Specialist",
        ],
        "industries": [
            "Climate Tech",
            "Fintech",
            "Clean Energy",
            "AI/Machine Learning",
            "Workforce Development",
            "Data Analytics",
        ],
        "employment_type": ["full_time", "contract", "consulting"],
        "location_preferences": ["Indianapolis, IN", "Massachusetts", "Remote"],
        "salary_expectation": "$75,000 - $120,000",
        "open_to_relocation": True,
    },
    "triple_role_access": {
        "admin": {
            "email": "gnekwaya@joinact.org",
            "admin_level": "super",
            "organization": "Alliance for Climate Transition (ACT)",
            "capabilities": [
                "manage_users",
                "manage_partners",
                "manage_content",
                "view_analytics",
                "manage_system",
                "user_impersonation",
                "audit_access",
                "role_management",
                "platform_configuration",
                "agent_configurator",
                "partner_portal",
                "skills_taxonomy_management",
                "translation_management",
                "ai_model_configuration",
            ],
        },
        "partner": {
            "email": "buffr_inc@buffr.ai",
            "company": "Buffr Inc.",
            "role": "Founder",
            "partnership_level": "founding",
            "website": "https://buffr.ai/",
        },
        "job_seeker": {
            "email": "george.n.p.nekwaya@gmail.com",
            "experience_level": "senior",
            "years_experience": 6,
            "skills_count": 16,
        },
    },
}

# REALISTIC CLIMATE JOB SEEKER TEST SCENARIOS
CLIMATE_JOB_SEEKER_SCENARIOS = [
    {
        "name": "Maria Rodriguez - Transitioning Teacher",
        "user_id": str(uuid.uuid4()),
        "background": "High school science teacher interested in environmental education roles",
        "location": "Springfield, MA",
        "experience_level": "mid_level",
        "climate_interests": [
            "environmental_education",
            "renewable_energy",
            "community_outreach",
        ],
        "target_roles": [
            "Environmental Education Coordinator",
            "Sustainability Program Manager",
        ],
        "challenge": "Limited private sector experience, needs skills bridge training",
    },
    {
        "name": "James Chen - Software Engineer",
        "user_id": str(uuid.uuid4()),
        "background": "Senior software engineer wanting to apply tech skills to climate solutions",
        "location": "Cambridge, MA",
        "experience_level": "senior",
        "climate_interests": [
            "cleantech_software",
            "energy_management",
            "ai_climate_solutions",
        ],
        "target_roles": [
            "Climate Tech Software Engineer",
            "Clean Energy Data Scientist",
        ],
        "challenge": "Lack of domain knowledge in energy/climate sectors",
    },
    {
        "name": "Sarah Johnson - Military Veteran",
        "user_id": str(uuid.uuid4()),
        "background": "Navy veteran with logistics and project management experience",
        "location": "Boston, MA",
        "experience_level": "mid_level",
        "military_background": {
            "branch": "Navy",
            "mos": "Logistics Specialist",
            "years_served": 8,
        },
        "climate_interests": ["wind_energy", "project_management", "operations"],
        "target_roles": [
            "Wind Farm Operations Manager",
            "Clean Energy Project Coordinator",
        ],
        "challenge": "Military to civilian transition in new industry",
    },
]


class ComprehensiveClimateAgentTester:
    """Comprehensive testing framework for climate economy agents with George Nekwaya's data."""

    def __init__(self):
        self.agents = {}
        self.test_results = {}
        self.conversation_id = str(uuid.uuid4())
        self.session_id = str(uuid.uuid4())

    async def initialize_agents(self):
        """Initialize all climate agents with proper configuration."""
        try:
            # Initialize core agents
            self.agents = {
                "supervisor": SupervisorAgent(
                    agent_id="supervisor",
                    name="Pendo",
                    description="Climate Economy Supervisor",
                ),
                "empathy": EmpathyAgent(
                    agent_id="empathy_agent",
                    name="Alex",
                    description="Empathy and Emotional Support Specialist",
                ),
                "environmental_justice": EnvironmentalJusticeSpecialist(
                    agent_id="environmental_justice",
                    name="Miguel",
                    description="Environmental Justice Specialist",
                ),
                "international": InternationalAgent(
                    agent_id="international_agent",
                    name="Liv",
                    description="International Professional Specialist",
                ),
                "ma_resource": MAResourceAnalystAgent(
                    agent_id="ma_resource_analyst",
                    name="Jasmine",
                    description="Massachusetts Resource Analyst",
                ),
                "veteran": VeteranAgent(
                    agent_id="veteran_agent",
                    name="Marcus",
                    description="Veteran Transition Specialist",
                ),
            }

            print("✅ All climate agents initialized successfully")
            return True

        except Exception as e:
            print(f"❌ Agent initialization failed: {e}")
            return False

    async def test_george_nekwaya_comprehensive_scenario(self) -> Dict[str, Any]:
        """Test comprehensive climate career guidance for George Nekwaya."""

        scenario_results = {
            "user": "George Nekwaya",
            "test_type": "comprehensive_climate_career_guidance",
            "tests": {},
            "overall_success": False,
        }

        # Test 1: Resume Analysis and Skills Assessment
        scenario_results["tests"][
            "resume_analysis"
        ] = await self.test_resume_analysis_for_george()

        # Test 2: Climate Career Pathway Mapping
        scenario_results["tests"][
            "career_pathways"
        ] = await self.test_climate_career_pathways()

        # Test 3: Partner Resource Matching
        scenario_results["tests"][
            "partner_matching"
        ] = await self.test_partner_resource_matching()

        # Test 4: Skills Gap Analysis
        scenario_results["tests"]["skills_gap"] = await self.test_skills_gap_analysis()

        # Test 5: Salary and Location Optimization
        scenario_results["tests"][
            "salary_location"
        ] = await self.test_salary_location_optimization()

        # Test 6: AI/ML Climate Tech Specialization
        scenario_results["tests"][
            "ai_climate_specialization"
        ] = await self.test_ai_climate_specialization()

        # Calculate overall success
        successful_tests = sum(
            1
            for test in scenario_results["tests"].values()
            if test.get("success", False)
        )
        total_tests = len(scenario_results["tests"])
        scenario_results["success_rate"] = successful_tests / total_tests
        scenario_results["overall_success"] = scenario_results["success_rate"] >= 0.7

        return scenario_results

    async def test_resume_analysis_for_george(self) -> Dict[str, Any]:
        """Test resume analysis specifically for George Nekwaya's profile."""

        try:
            # Simulate George's resume content
            george_resume_content = f"""
            George Nekwaya - Fintech Founder & Climate Tech Project Manager
            
            Email: {GEORGE_NEKWAYA_TEST_DATA['email']}
            Location: {GEORGE_NEKWAYA_TEST_DATA['profile']['location']}
            LinkedIn: {GEORGE_NEKWAYA_TEST_DATA['profile']['linkedin_url']}
            Website: {GEORGE_NEKWAYA_TEST_DATA['profile']['personal_website']}
            
            PROFESSIONAL SUMMARY:
            Fintech founder and project manager with expertise in AI-powered climate solutions.
            Leading workforce development assessments with MassCEC focusing on clean energy
            sector hiring needs and diversity initiatives. MBA in Data Analytics from Brandeis
            with engineering background from Namibia University of Science & Technology.
            
            CURRENT ROLE:
            Project Manager, DEIJ & Workforce Development
            Alliance for Climate Transition (ACT) | Oct 2024 - Present
            • Leading workforce development assessment with MassCEC
            • Developing strategies for diversity in clean energy workforce
            • Collaborating with educational institutions on clean energy programs
            
            ENTREPRENEURSHIP:
            Founder, Buffr Inc. | Jan 2023 - Present
            • AI-native strategy and technology company for climate tech solutions
            • Building GenAI platforms for climate impact and workforce development
            • Developing modular systems and multi-agent copilots
            
            EDUCATION:
            MBA (STEM), Brandeis International Business School (2024)
            Concentrations: Data Analytics, Strategy & Innovation
            
            B.Sc. Civil & Environmental Engineering
            Namibia University of Science & Technology (2018)
            
            SKILLS:
            Technical: Python, Machine Learning, Data Analytics, LangGraph, Multi-agent Systems
            Business: Strategic Planning, Workforce Development, Climate Tech Strategy
            """

            # Test with MA Resource Analyst (Jasmine)
            jasmine_response = await self.agents["ma_resource"].handle_message(
                message=f"Please analyze this resume for climate career opportunities: {george_resume_content}",
                user_id=GEORGE_NEKWAYA_TEST_DATA["user_id"],
                conversation_id=self.conversation_id,
            )

            # Validate response quality
            analysis_quality = self.validate_resume_analysis(
                jasmine_response, george_resume_content
            )

            return {
                "success": analysis_quality["score"] >= 7.0,
                "agent": "Jasmine (MA Resource Analyst)",
                "response_length": len(jasmine_response.get("response", "")),
                "analysis_quality": analysis_quality,
                "climate_relevance": self.assess_climate_relevance(jasmine_response),
                "actionable_recommendations": self.count_actionable_items(
                    jasmine_response
                ),
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": "Jasmine (MA Resource Analyst)",
            }

    async def test_climate_career_pathways(self) -> Dict[str, Any]:
        """Test climate career pathway recommendations for George."""

        try:
            query = f"""
            Based on George Nekwaya's background (MBA in Data Analytics, Civil Engineering degree,
            current role in workforce development at ACT, founder of AI climate tech company),
            what are the best climate career pathways? He's interested in: {', '.join(GEORGE_NEKWAYA_TEST_DATA['professional_background']['climate_interests'])}
            
            Current location: {GEORGE_NEKWAYA_TEST_DATA['profile']['location']}
            Target salary: {GEORGE_NEKWAYA_TEST_DATA['professional_background']['career_goals']['salary_range']}
            """

            # Test with Environmental Justice Specialist (Miguel)
            miguel_response = await self.agents["environmental_justice"].handle_message(
                message=query,
                user_id=GEORGE_NEKWAYA_TEST_DATA["user_id"],
                conversation_id=self.conversation_id,
            )

            pathway_quality = self.validate_career_pathways(miguel_response)

            return {
                "success": pathway_quality["score"] >= 7.0,
                "agent": "Miguel (Environmental Justice Specialist)",
                "pathways_identified": pathway_quality["pathways_count"],
                "salary_alignment": pathway_quality["salary_alignment"],
                "location_relevance": pathway_quality["location_relevance"],
                "skills_integration": pathway_quality["skills_integration"],
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": "Miguel (Environmental Justice Specialist)",
            }

    async def test_partner_resource_matching(self) -> Dict[str, Any]:
        """Test partner resource matching for George's profile."""

        try:
            query = f"""
            George Nekwaya is looking for climate tech opportunities that leverage his AI/ML 
            background and fintech experience. He has an MBA in Data Analytics and is currently
            working on workforce development with MassCEC. What partner organizations and 
            resources would be most relevant?
            
            Skills: {', '.join(GEORGE_NEKWAYA_TEST_DATA['professional_background']['skills']['technical'][:5])}
            Interests: {', '.join(GEORGE_NEKWAYA_TEST_DATA['professional_background']['climate_interests'])}
            """

            # Test with MA Resource Analyst
            jasmine_response = await self.agents["ma_resource"].handle_message(
                message=query,
                user_id=GEORGE_NEKWAYA_TEST_DATA["user_id"],
                conversation_id=self.conversation_id,
            )

            partner_quality = self.validate_partner_matching(jasmine_response)

            return {
                "success": partner_quality["score"] >= 7.0,
                "agent": "Jasmine (MA Resource Analyst)",
                "partners_mentioned": partner_quality["partners_count"],
                "resource_relevance": partner_quality["resource_relevance"],
                "actionability": partner_quality["actionability"],
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": "Jasmine (MA Resource Analyst)",
            }

    async def test_skills_gap_analysis(self) -> Dict[str, Any]:
        """Test skills gap analysis for George's climate tech ambitions."""

        try:
            query = f"""
            George has strong technical skills in Python, ML, and data analytics, plus an MBA.
            He wants to transition into climate tech product management or AI for climate solutions.
            What skills gaps should he address and what training is recommended?
            
            Current skills: {', '.join(GEORGE_NEKWAYA_TEST_DATA['professional_background']['skills']['technical'])}
            Target roles: {', '.join(GEORGE_NEKWAYA_TEST_DATA['professional_background']['career_goals']['target_roles'][:3])}
            """

            # Test with Supervisor for comprehensive analysis
            supervisor_response = await self.agents["supervisor"].handle_message(
                message=query,
                user_id=GEORGE_NEKWAYA_TEST_DATA["user_id"],
                conversation_id=self.conversation_id,
            )

            skills_analysis = self.validate_skills_gap_analysis(supervisor_response)

            return {
                "success": skills_analysis["score"] >= 7.0,
                "agent": "Pendo (Supervisor)",
                "gaps_identified": skills_analysis["gaps_count"],
                "training_recommendations": skills_analysis["training_count"],
                "timeline_provided": skills_analysis["timeline_provided"],
            }

        except Exception as e:
            return {"success": False, "error": str(e), "agent": "Pendo (Supervisor)"}

    async def test_salary_location_optimization(self) -> Dict[str, Any]:
        """Test salary and location optimization for George."""

        try:
            query = f"""
            George is currently in {GEORGE_NEKWAYA_TEST_DATA['profile']['location']} but open to
            relocation for the right climate tech opportunity. His target salary is 
            {GEORGE_NEKWAYA_TEST_DATA['professional_background']['career_goals']['salary_range']}.
            What locations offer the best climate tech opportunities within his salary range?
            """

            jasmine_response = await self.agents["ma_resource"].handle_message(
                message=query,
                user_id=GEORGE_NEKWAYA_TEST_DATA["user_id"],
                conversation_id=self.conversation_id,
            )

            location_analysis = self.validate_location_salary_analysis(jasmine_response)

            return {
                "success": location_analysis["score"] >= 7.0,
                "agent": "Jasmine (MA Resource Analyst)",
                "locations_suggested": location_analysis["locations_count"],
                "salary_alignment": location_analysis["salary_alignment"],
                "market_insights": location_analysis["market_insights"],
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": "Jasmine (MA Resource Analyst)",
            }

    async def test_ai_climate_specialization(self) -> Dict[str, Any]:
        """Test AI/ML climate tech specialization guidance for George."""

        try:
            query = f"""
            George has strong AI/ML skills and is founder of an AI climate tech company (Buffr Inc.).
            He's interested in scaling AI solutions for climate impact. What specialized roles and
            opportunities should he pursue in the AI for climate space?
            
            Current AI work: Multi-agent systems, LangGraph, GenAI platforms
            Company focus: AI-powered climate solutions and workforce development
            """

            # Test with Environmental Justice specialist for community impact angle
            miguel_response = await self.agents["environmental_justice"].handle_message(
                message=query,
                user_id=GEORGE_NEKWAYA_TEST_DATA["user_id"],
                conversation_id=self.conversation_id,
            )

            ai_specialization = self.validate_ai_climate_specialization(miguel_response)

            return {
                "success": ai_specialization["score"] >= 7.0,
                "agent": "Miguel (Environmental Justice Specialist)",
                "ai_opportunities": ai_specialization["opportunities_count"],
                "community_impact": ai_specialization["community_focus"],
                "scaling_advice": ai_specialization["scaling_guidance"],
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "agent": "Miguel (Environmental Justice Specialist)",
            }

    # Validation helper methods
    def validate_resume_analysis(
        self, response: Dict[str, Any], resume_content: str
    ) -> Dict[str, Any]:
        """Validate the quality of resume analysis."""

        score = 0.0
        max_score = 10.0

        response_text = response.get("response", "").lower()

        # Check for key skills identification (2 points)
        george_skills = ["python", "machine learning", "data analytics", "mba"]
        skills_mentioned = sum(1 for skill in george_skills if skill in response_text)
        score += (skills_mentioned / len(george_skills)) * 2

        # Check for climate relevance identification (2 points)
        climate_keywords = [
            "climate",
            "clean energy",
            "environmental",
            "sustainability",
        ]
        climate_mentions = sum(
            1 for keyword in climate_keywords if keyword in response_text
        )
        score += min(climate_mentions / 2, 2)

        # Check for specific recommendations (3 points)
        rec_keywords = ["recommend", "suggest", "consider", "pursue", "explore"]
        recommendations = sum(1 for keyword in rec_keywords if keyword in response_text)
        score += min(recommendations / 3, 3)

        # Check for Massachusetts focus (2 points)
        ma_keywords = ["massachusetts", "boston", "cambridge", "masscec"]
        ma_mentions = sum(1 for keyword in ma_keywords if keyword in response_text)
        score += min(ma_mentions / 2, 2)

        # Response quality check (1 point)
        if len(response_text) > 200:
            score += 1

        return {
            "score": score,
            "max_score": max_score,
            "skills_identified": skills_mentioned,
            "climate_relevance": climate_mentions,
            "recommendations_count": recommendations,
            "ma_focus": ma_mentions > 0,
        }

    def validate_career_pathways(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate career pathway recommendations."""

        response_text = response.get("response", "").lower()

        # Count pathway mentions
        pathway_keywords = ["pathway", "role", "position", "opportunity", "career"]
        pathways_count = sum(
            1 for keyword in pathway_keywords if keyword in response_text
        )

        # Check salary alignment
        salary_keywords = ["salary", "$", "compensation", "pay"]
        salary_alignment = any(keyword in response_text for keyword in salary_keywords)

        # Location relevance
        location_keywords = ["indianapolis", "massachusetts", "remote", "location"]
        location_relevance = any(
            keyword in response_text for keyword in location_keywords
        )

        # Skills integration
        skills_keywords = ["skills", "experience", "background", "analytics"]
        skills_integration = sum(
            1 for keyword in skills_keywords if keyword in response_text
        )

        score = min(
            10.0,
            (pathways_count * 2)
            + (2 if salary_alignment else 0)
            + (2 if location_relevance else 0)
            + min(skills_integration, 4),
        )

        return {
            "score": score,
            "pathways_count": pathways_count,
            "salary_alignment": salary_alignment,
            "location_relevance": location_relevance,
            "skills_integration": skills_integration,
        }

    def validate_partner_matching(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate partner resource matching quality."""

        response_text = response.get("response", "").lower()

        # Count partner organizations mentioned
        partner_keywords = ["masscec", "partner", "organization", "company", "employer"]
        partners_count = sum(
            1 for keyword in partner_keywords if keyword in response_text
        )

        # Resource relevance
        resource_keywords = ["resource", "program", "training", "certification"]
        resource_relevance = sum(
            1 for keyword in resource_keywords if keyword in response_text
        )

        # Actionability
        action_keywords = ["apply", "contact", "visit", "register", "join"]
        actionability = sum(
            1 for keyword in action_keywords if keyword in response_text
        )

        score = min(
            10.0,
            partners_count * 2 + min(resource_relevance, 3) + min(actionability, 3),
        )

        return {
            "score": score,
            "partners_count": partners_count,
            "resource_relevance": resource_relevance,
            "actionability": actionability,
        }

    def validate_skills_gap_analysis(self, response: Dict[str, Any]) -> Dict[str, Any]:
        """Validate skills gap analysis quality."""

        response_text = response.get("response", "").lower()

        # Gaps identification
        gap_keywords = ["gap", "need", "missing", "develop", "learn"]
        gaps_count = sum(1 for keyword in gap_keywords if keyword in response_text)

        # Training recommendations
        training_keywords = ["training", "course", "certification", "program"]
        training_count = sum(
            1 for keyword in training_keywords if keyword in response_text
        )

        # Timeline provided
        timeline_keywords = ["month", "year", "week", "timeline", "duration"]
        timeline_provided = any(
            keyword in response_text for keyword in timeline_keywords
        )

        score = min(
            10.0, gaps_count * 2 + training_count * 2 + (2 if timeline_provided else 0)
        )

        return {
            "score": score,
            "gaps_count": gaps_count,
            "training_count": training_count,
            "timeline_provided": timeline_provided,
        }

    def validate_location_salary_analysis(
        self, response: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Validate location and salary analysis."""

        response_text = response.get("response", "").lower()

        # Locations suggested
        location_keywords = [
            "boston",
            "cambridge",
            "massachusetts",
            "california",
            "new york",
        ]
        locations_count = sum(
            1 for keyword in location_keywords if keyword in response_text
        )

        # Salary alignment
        salary_keywords = [
            "$75",
            "$80",
            "$90",
            "$100",
            "$120",
            "salary",
            "compensation",
        ]
        salary_alignment = any(keyword in response_text for keyword in salary_keywords)

        # Market insights
        market_keywords = ["market", "industry", "sector", "demand", "growth"]
        market_insights = sum(
            1 for keyword in market_keywords if keyword in response_text
        )

        score = min(
            10.0,
            locations_count * 2
            + (3 if salary_alignment else 0)
            + min(market_insights, 3),
        )

        return {
            "score": score,
            "locations_count": locations_count,
            "salary_alignment": salary_alignment,
            "market_insights": market_insights,
        }

    def validate_ai_climate_specialization(
        self, response: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Validate AI climate specialization guidance."""

        response_text = response.get("response", "").lower()

        # AI opportunities
        ai_keywords = [
            "ai",
            "machine learning",
            "artificial intelligence",
            "ml",
            "algorithm",
        ]
        opportunities_count = sum(
            1 for keyword in ai_keywords if keyword in response_text
        )

        # Community impact focus
        community_keywords = ["community", "impact", "justice", "equity", "access"]
        community_focus = sum(
            1 for keyword in community_keywords if keyword in response_text
        )

        # Scaling guidance
        scaling_keywords = ["scale", "grow", "expand", "develop", "build"]
        scaling_guidance = sum(
            1 for keyword in scaling_keywords if keyword in response_text
        )

        score = min(
            10.0, opportunities_count * 2 + community_focus * 2 + scaling_guidance * 2
        )

        return {
            "score": score,
            "opportunities_count": opportunities_count,
            "community_focus": community_focus,
            "scaling_guidance": scaling_guidance,
        }

    def assess_climate_relevance(self, response: Dict[str, Any]) -> float:
        """Assess how well the response addresses climate career aspects."""

        response_text = response.get("response", "").lower()
        climate_terms = [
            "climate",
            "clean energy",
            "renewable",
            "solar",
            "wind",
            "sustainability",
            "environmental",
            "green",
            "carbon",
            "emissions",
        ]

        relevance_score = sum(1 for term in climate_terms if term in response_text)
        return min(relevance_score / 5, 1.0)  # Normalize to 0-1

    def count_actionable_items(self, response: Dict[str, Any]) -> int:
        """Count actionable recommendations in the response."""

        response_text = response.get("response", "").lower()
        action_patterns = [
            "you should",
            "i recommend",
            "consider",
            "try",
            "apply to",
            "contact",
            "visit",
            "explore",
            "look into",
            "pursue",
        ]

        return sum(1 for pattern in action_patterns if pattern in response_text)


async def main():
    """Main test execution"""
    tester = ComprehensiveClimateAgentTester()
    await tester.run_comprehensive_test()


if __name__ == "__main__":
    asyncio.run(main())
