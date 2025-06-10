#!/usr/bin/env python3
"""
Tool Call Chain Testing Suite
============================

Comprehensive testing of tool call workflows including:
- Tool selection intelligence
- Chain execution verification
- Result integration quality
- Error handling in tool chains
- Performance optimization
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from typing import Any, Dict, List
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.agents.base import SupervisorAgent
from core.tools.job_matcher import JobMatcher
from core.tools.resume_processor import ResumeProcessor
from core.tools.skills_translator import SkillsTranslator
from core.tools.vector_search import VectorSearchTool

TEST_USER_ID = "30eedd6a-0771-444e-90d2-7520c1eb03f0"


class TestToolCallChains:
    """Test suite for tool call chain verification"""

    @pytest.fixture(autouse=True)
    async def setup(self):
        """Setup test environment"""
        self.supervisor = SupervisorAgent()

    async def test_resume_processing_chain(self):
        """Test complete resume processing tool chain"""
        print("\n🔧 Testing Resume Processing Chain")

        # Mock resume file upload scenario
        with patch("core.tools.resume_processor.ResumeProcessor") as mock_processor:
            # Mock resume parsing results
            mock_processor.return_value.parse_resume.return_value = {
                "sections": {
                    "contact_info": {
                        "name": "John Doe",
                        "email": "john.doe@email.com",
                        "phone": "555-0123",
                    },
                    "experience": [
                        {
                            "title": "Software Engineer",
                            "company": "TechCorp",
                            "duration": "2020-2024",
                            "description": "Developed cloud infrastructure and automated deployment pipelines",
                        }
                    ],
                    "education": [
                        {
                            "degree": "BS Computer Science",
                            "school": "MIT",
                            "year": "2020",
                        }
                    ],
                    "skills": ["Python", "AWS", "Docker", "Kubernetes", "CI/CD"],
                },
                "confidence_score": 0.94,
                "parsing_time": 1.2,
            }

            with patch(
                "core.tools.skills_translator.SkillsTranslator"
            ) as mock_translator:
                # Mock skills translation
                mock_translator.return_value.translate_to_climate.return_value = {
                    "technical_translations": {
                        "Python": {
                            "climate_skill": "Clean energy data analysis and modeling",
                            "relevance_score": 0.89,
                            "example_applications": [
                                "Solar farm performance analytics",
                                "Grid optimization algorithms",
                            ],
                        },
                        "AWS": {
                            "climate_skill": "Renewable energy cloud infrastructure",
                            "relevance_score": 0.85,
                            "example_applications": [
                                "Wind farm monitoring systems",
                                "Smart grid data platforms",
                            ],
                        },
                    },
                    "overall_climate_readiness": 0.87,
                }

                with patch("core.tools.job_matcher.JobMatcher") as mock_matcher:
                    # Mock job matching results
                    mock_matcher.return_value.find_matches.return_value = {
                        "matches": [
                            {
                                "job_id": "job_001",
                                "title": "Clean Energy Data Analyst",
                                "company": "Sunrun",
                                "location": "Boston, MA",
                                "relevance_score": 0.92,
                                "matching_skills": [
                                    "Python",
                                    "Data Analysis",
                                    "Cloud Infrastructure",
                                ],
                                "salary_range": "$75,000 - $95,000",
                            },
                            {
                                "job_id": "job_002",
                                "title": "Renewable Energy Software Engineer",
                                "company": "Nexamp",
                                "location": "Cambridge, MA",
                                "relevance_score": 0.88,
                                "matching_skills": ["Python", "AWS", "System Design"],
                                "salary_range": "$85,000 - $110,000",
                            },
                        ],
                        "total_matches": 12,
                        "geographic_matches": 8,
                    }

                    # Execute the tool chain
                    response = await self.supervisor.handle_message(
                        message="Please analyze my uploaded resume for climate career opportunities",
                        user_id=TEST_USER_ID,
                        conversation_id="resume_chain_test",
                    )

                    # Verify tool chain execution
                    assert "content" in response
                    content = response["content"]

                    # Verify resume parsing occurred
                    assert (
                        "software engineer" in content.lower()
                        or "python" in content.lower()
                    )

                    # Verify skills translation
                    assert (
                        "clean energy" in content.lower()
                        or "renewable energy" in content.lower()
                    )

                    # Verify job matching
                    assert "sunrun" in content.lower() or "nexamp" in content.lower()
                    assert "$" in content  # Salary information included

                    # Verify tool metadata
                    metadata = response.get("metadata", {})
                    if "tools_called" in metadata:
                        tools = str(metadata["tools_called"]).lower()
                        assert "resume" in tools
                        assert "skills" in tools or "translator" in tools
                        assert "job" in tools or "matcher" in tools

    async def test_vector_search_chain(self):
        """Test vector search and knowledge retrieval chain"""
        print("\n🔍 Testing Vector Search Chain")

        with patch("core.tools.vector_search.VectorSearchTool") as mock_vector:
            # Mock vector search results
            mock_vector.return_value.search.return_value = {
                "query_embedding": [0.1, 0.2, 0.3, 0.4, 0.5],  # Simplified
                "results": [
                    {
                        "content": "Massachusetts Clean Energy Center offers solar installer training programs with job placement assistance. The 6-week program covers safety, electrical fundamentals, and hands-on installation experience.",
                        "source": "MassCEC Training Programs",
                        "relevance_score": 0.94,
                        "metadata": {
                            "program_type": "certification",
                            "duration": "6 weeks",
                            "cost": "$2,500 (scholarships available)",
                        },
                    },
                    {
                        "content": "NABCEP (North American Board of Certified Energy Practitioners) certification is the gold standard for solar professionals. Entry-level certification requires 58 hours of education and hands-on experience.",
                        "source": "NABCEP Certification Guide",
                        "relevance_score": 0.91,
                        "metadata": {
                            "certification_type": "professional",
                            "requirements": "58 hours education + experience",
                        },
                    },
                ],
                "search_time": 0.3,
            }

            # Execute vector search query
            response = await self.supervisor.handle_message(
                message="What solar training programs are available in Massachusetts?",
                user_id=TEST_USER_ID,
                conversation_id="vector_search_test",
            )

            content = response["content"]

            # Verify search results integration
            assert (
                "massachusetts clean energy center" in content.lower()
                or "masscec" in content.lower()
            )
            assert "nabcep" in content.lower() or "certification" in content.lower()
            assert "6 week" in content.lower() or "58 hours" in content.lower()

            # Verify structured information
            assert "$" in content or "cost" in content.lower()  # Cost information
            assert "week" in content.lower() or "hours" in content.lower()  # Duration

    async def test_career_pathway_analysis_chain(self):
        """Test career pathway analysis tool chain"""
        print("\n🛤️ Testing Career Pathway Analysis Chain")

        with patch("core.tools.career_analyzer.CareerPathwayAnalyzer") as mock_analyzer:
            # Mock career pathway analysis
            mock_analyzer.return_value.analyze_pathways.return_value = {
                "current_profile": {
                    "background": "Military logistics coordinator",
                    "experience_years": 8,
                    "transferable_skills": [
                        "project management",
                        "supply chain",
                        "team leadership",
                    ],
                    "climate_readiness_score": 0.73,
                },
                "recommended_pathways": [
                    {
                        "pathway_id": "renewable_ops",
                        "title": "Renewable Energy Operations",
                        "transition_difficulty": "Medium",
                        "timeline": "6-12 months",
                        "steps": [
                            {
                                "phase": "Education",
                                "action": "Complete Clean Energy Fundamentals course",
                                "duration": "2 months",
                                "cost": "$1,500",
                            },
                            {
                                "phase": "Certification",
                                "action": "Obtain OSHA 30 safety certification",
                                "duration": "1 month",
                                "cost": "$300",
                            },
                            {
                                "phase": "Application",
                                "action": "Apply to wind farm operations roles",
                                "duration": "3-6 months",
                                "expected_salary": "$55,000-$70,000",
                            },
                        ],
                        "success_probability": 0.78,
                    }
                ],
                "skill_gaps": [
                    {
                        "gap": "Clean energy technology knowledge",
                        "importance": "High",
                        "remediation": "Complete renewable energy fundamentals course",
                    }
                ],
            }

            response = await self.supervisor.handle_message(
                message="I'm a military logistics coordinator. What's my pathway into renewable energy?",
                user_id=TEST_USER_ID,
                conversation_id="pathway_analysis_test",
            )

            content = response["content"]

            # Verify pathway analysis integration
            assert "renewable energy operations" in content.lower()
            assert "6-12 months" in content or "timeline" in content.lower()
            assert "clean energy fundamentals" in content.lower()
            assert "$" in content  # Cost/salary information included

            # Verify structured guidance
            assert "step" in content.lower() or "phase" in content.lower()
            assert "certification" in content.lower() or "osha" in content.lower()

    async def test_tool_error_handling(self):
        """Test error handling in tool call chains"""
        print("\n🚨 Testing Tool Error Handling")

        # Test resume processing failure
        with patch("core.tools.resume_processor.ResumeProcessor") as mock_processor:
            # Simulate tool failure
            mock_processor.side_effect = Exception(
                "Resume parsing service temporarily unavailable"
            )

            response = await self.supervisor.handle_message(
                message="Please analyze my resume",
                user_id=TEST_USER_ID,
                conversation_id="tool_error_test",
            )

            # Verify graceful error handling
            assert "content" in response
            content = response["content"].lower()

            # Should acknowledge the issue without exposing technical details
            error_indicators = [
                "temporarily unavailable",
                "try again",
                "alternative",
                "different approach",
                "manual review",
            ]
            assert any(indicator in content for indicator in error_indicators)

            # Should not expose raw error messages
            assert "exception" not in content
            assert "traceback" not in content

    async def test_tool_performance_optimization(self):
        """Test tool call performance and optimization"""
        print("\n⚡ Testing Tool Performance")

        performance_scenarios = [
            {
                "name": "Quick Skills Lookup",
                "query": "What skills are needed for solar installer jobs?",
                "expected_max_time": 3.0,
                "expected_tools": ["job_search", "skills_analyzer"],
            },
            {
                "name": "Complex Career Analysis",
                "query": "Analyze my military background for clean energy career transition",
                "expected_max_time": 8.0,
                "expected_tools": [
                    "career_analyzer",
                    "skills_translator",
                    "job_matcher",
                ],
            },
        ]

        for scenario in performance_scenarios:
            start_time = datetime.now()

            response = await self.supervisor.handle_message(
                message=scenario["query"],
                user_id=TEST_USER_ID,
                conversation_id=f"perf_test_{scenario['name'].replace(' ', '_').lower()}",
            )

            end_time = datetime.now()
            response_time = (end_time - start_time).total_seconds()

            # Performance assertions
            assert (
                response_time < scenario["expected_max_time"]
            ), f"{scenario['name']} took {response_time:.2f}s, expected < {scenario['expected_max_time']}s"

            # Quality not sacrificed for speed
            assert (
                len(response["content"]) > 100
            ), f"{scenario['name']} response too short: {len(response['content'])} chars"

            print(f"   ✅ {scenario['name']}: {response_time:.2f}s")

    async def test_tool_result_integration_quality(self):
        """Test quality of tool result integration into responses"""
        print("\n🎯 Testing Tool Result Integration Quality")

        with patch("core.tools.job_matcher.JobMatcher") as mock_matcher:
            # Mock detailed job matching results
            mock_matcher.return_value.find_matches.return_value = {
                "matches": [
                    {
                        "job_id": "job_solar_001",
                        "title": "Solar Project Coordinator",
                        "company": "Sunpower",
                        "location": "Framingham, MA",
                        "relevance_score": 0.91,
                        "matching_skills": [
                            "Project Management",
                            "Site Assessment",
                            "Stakeholder Communication",
                        ],
                        "salary_range": "$65,000 - $80,000",
                        "job_description": "Coordinate residential solar installations from initial site assessment through project completion.",
                        "requirements": [
                            "3+ years project management",
                            "Strong communication skills",
                            "Valid driver's license",
                        ],
                        "benefits": [
                            "Health insurance",
                            "401k matching",
                            "Professional development fund",
                        ],
                    }
                ],
                "search_metadata": {
                    "total_jobs_searched": 245,
                    "location_matches": 23,
                    "skill_matches": 87,
                    "salary_matches": 156,
                },
            }

            response = await self.supervisor.handle_message(
                message="Find me project management jobs in the solar industry",
                user_id=TEST_USER_ID,
                conversation_id="integration_quality_test",
            )

            content = response["content"]

            # Verify comprehensive integration
            assert "solar project coordinator" in content.lower()
            assert "sunpower" in content.lower()
            assert "framingham" in content.lower()
            assert "$65,000" in content or "65k" in content.lower()

            # Verify natural language integration (not just data dump)
            sentences = content.split(".")
            avg_sentence_length = sum(len(s.split()) for s in sentences) / len(
                sentences
            )
            assert (
                avg_sentence_length > 8
            ), "Response should use natural, flowing language"

            # Verify actionable information
            action_words = ["apply", "contact", "visit", "submit", "consider"]
            assert any(word in content.lower() for word in action_words)

    async def test_multi_tool_coordination(self):
        """Test coordination between multiple tools in complex queries"""
        print("\n🤝 Testing Multi-Tool Coordination")

        complex_query = """
        I'm a former Navy nuclear technician who wants to transition to renewable energy. 
        I need to understand what jobs are available, what additional training I need, 
        and what the salary prospects look like in Massachusetts.
        """

        with patch(
            "core.tools.skills_translator.SkillsTranslator"
        ) as mock_translator, patch(
            "core.tools.job_matcher.JobMatcher"
        ) as mock_matcher, patch(
            "core.tools.training_finder.TrainingFinder"
        ) as mock_training:
            # Mock coordinated tool responses
            mock_translator.return_value.translate_military_skills.return_value = {
                "nuclear_technician": {
                    "transferable_skills": [
                        "Systems monitoring",
                        "Safety protocols",
                        "Technical troubleshooting",
                    ],
                    "climate_applications": [
                        "Grid operations",
                        "Power plant maintenance",
                        "Energy storage systems",
                    ],
                }
            }

            mock_matcher.return_value.find_matches.return_value = {
                "matches": [
                    {
                        "title": "Wind Turbine Technician",
                        "salary_range": "$52,000 - $68,000",
                        "skill_match": 0.84,
                    },
                    {
                        "title": "Solar Operations Specialist",
                        "salary_range": "$58,000 - $75,000",
                        "skill_match": 0.79,
                    },
                ]
            }

            mock_training.return_value.find_programs.return_value = {
                "programs": [
                    {
                        "name": "Wind Turbine Technology Certificate",
                        "provider": "Massachusetts Maritime Academy",
                        "duration": "6 months",
                        "cost": "GI Bill eligible",
                    }
                ]
            }

            response = await self.supervisor.handle_message(
                message=complex_query,
                user_id=TEST_USER_ID,
                conversation_id="multi_tool_test",
            )

            content = response["content"]

            # Verify all aspects addressed
            assert (
                "wind turbine" in content.lower()
                or "solar operations" in content.lower()
            )  # Job options
            assert "$" in content  # Salary information
            assert (
                "certificate" in content.lower() or "training" in content.lower()
            )  # Education
            assert (
                "gi bill" in content.lower() or "veteran" in content.lower()
            )  # Military context

            # Verify coordinated, not fragmented response
            assert (
                len(content.split("\n\n")) <= 4
            ), "Response should be cohesive, not fragmented"


# Test runner
async def run_tool_chain_tests():
    """Run all tool chain tests"""
    print("🔧 Starting Tool Call Chain Tests")
    print("=" * 50)

    test_suite = TestToolCallChains()
    await test_suite.setup()

    test_methods = [
        "test_resume_processing_chain",
        "test_vector_search_chain",
        "test_career_pathway_analysis_chain",
        "test_tool_error_handling",
        "test_tool_performance_optimization",
        "test_tool_result_integration_quality",
        "test_multi_tool_coordination",
    ]

    results = {}

    for test_method in test_methods:
        try:
            start_time = datetime.now()
            await getattr(test_suite, test_method)()
            end_time = datetime.now()

            duration = (end_time - start_time).total_seconds()
            results[test_method] = {"status": "PASSED", "duration": duration}
            print(f"✅ {test_method} PASSED ({duration:.2f}s)")

        except Exception as e:
            results[test_method] = {"status": "FAILED", "error": str(e)}
            print(f"❌ {test_method} FAILED: {e}")

    # Summary
    passed = sum(1 for r in results.values() if r["status"] == "PASSED")
    total = len(results)

    print(f"\n📊 Tool Chain Test Results: {passed}/{total} passed")
    return results


if __name__ == "__main__":
    asyncio.run(run_tool_chain_tests())
