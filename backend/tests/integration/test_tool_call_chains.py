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

# George Nekwaya's details for testing
TEST_USER_ID = "gnekwaya-test-user-001"
TEST_USER_NAME = "George Nekwaya"
TEST_USER_EMAIL = "gnekwaya@joinact.org"
TEST_USER_PHONE = "+1-857-123-4567"


class TestToolCallChains:
    """Test suite for tool call chain verification"""

    @pytest.fixture(autouse=True)
    async def setup(self):
        """Setup test environment"""
        self.supervisor = SupervisorAgent()

    async def test_resume_processing_chain(self):
        """Test complete resume processing tool chain"""
        print("\n🔧 Testing Resume Processing Chain")

        # Mock resume file upload scenario using George's profile
        with patch("core.tools.resume_processor.ResumeProcessor") as # Test data should use real database fixtures,
                    "education": [
                        {
                            "degree": "BS Engineering & Computer Science",
                            "school": "Massachusetts Institute of Technology",
                            "year": "2020",
                        }
                    ],
                    "skills": [
                        "Python",
                        "AI/ML",
                        "Climate Tech",
                        "Fintech",
                        "Project Management",
                        "Strategic Planning",
                    ],
                },
                "confidence_score": 0.96,
                "parsing_time": 1.1,
            }

            with patch(
                "core.tools.skills_translator.SkillsTranslator"
            ) as # Test data should use real database fixtures,
                        },
                        "AI/ML": {
                            "climate_skill": "Climate tech artificial intelligence applications",
                            "relevance_score": 0.95,
                            "example_applications": [
                                "Climate risk assessment algorithms",
                                "Renewable energy optimization systems",
                            ],
                        },
                        "Climate Tech": {
                            "climate_skill": "Climate technology strategy and implementation",
                            "relevance_score": 0.98,
                            "example_applications": [
                                "Climate economy transition platforms",
                                "Green finance technology solutions",
                            ],
                        },
                    },
                    "overall_climate_readiness": 0.95,
                }

                with patch("core.tools.job_matcher.JobMatcher") as # Test data should use real database fixtures,
                                "salary_range": "$120,000 - $180,000",
                            },
                            {
                                "job_id": "job_002",
                                "title": "Climate Fintech Product Manager",
                                "company": "Nexamp",
                                "location": "Cambridge, MA",
                                "relevance_score": 0.93,
                                "matching_skills": [
                                    "Fintech",
                                    "Python",
                                    "Strategic Planning",
                                ],
                                "salary_range": "$110,000 - $160,000",
                            },
                        ],
                        "total_matches": 18,
                        "geographic_matches": 14,
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

                    # Verify resume parsing occurred with George's data
                    assert (
                        "buffr" in content.lower()
                        or "climate tech" in content.lower()
                        or "fintech" in content.lower()
                    )

                    # Verify skills translation
                    assert "climate" in content.lower() and (
                        "ai" in content.lower()
                        or "artificial intelligence" in content.lower()
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

        with patch("core.tools.vector_search.VectorSearchTool") as # Test data should use real database fixtures,  # Simplified
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

        with patch("core.tools.career_analyzer.CareerPathwayAnalyzer") as # Test data should use real database fixtures,
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
        with patch("core.tools.resume_processor.ResumeProcessor") as # Test data should use real database fixtures.lower()

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

        with patch("core.tools.job_matcher.JobMatcher") as # Test data should use real database fixtures,
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

        with (
            patch("core.tools.skills_translator.SkillsTranslator") as # Test data should use real database fixtures,
                    "climate_applications": [
                        "Grid operations",
                        "Power plant maintenance",
                        "Energy storage systems",
                    ],
                }
            }

            # Test data should use real database fixtures
            }

            # Test data should use real database fixtures
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
