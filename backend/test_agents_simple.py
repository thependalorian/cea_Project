#!/usr/bin/env python3
"""
Simple Agent Testing Script

Tests all agents with the same user to analyze workflow, supervisor routing logic, 
and knowledge resources access without circular import issues.
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from typing import Any, Dict, List
import time

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Direct imports to avoid circular dependencies
from supabase import Client, create_client

from core.agents.ma_resource_analyst import MAResourceAnalystAgent
from core.config import get_settings

# Test user ID - using the known user from previous tests
TEST_USER_ID = "30eedd6a-0771-444e-90d2-7520c1eb03f0"

# Test queries for each agent type
TEST_QUERIES = {
    "supervisor_general": "I'm looking for climate career opportunities in Massachusetts",
    "supervisor_routing_veteran": "I'm a military veteran interested in clean energy careers",
    "supervisor_routing_international": "I'm from Germany and want to work in renewable energy in Massachusetts",
    "supervisor_routing_ej": "I'm interested in environmental justice work in my community",
    "supervisor_routing_resume": "Can you analyze my resume for climate career opportunities?",
    "jasmine_direct": "I need help with my resume for clean energy jobs",
    "jasmine_skills": "What skills do I need for solar energy careers?",
    "jasmine_training": "What training programs are available for wind energy?",
    "marcus_direct": "I'm a Navy veteran transitioning to renewable energy",
    "marcus_skills": "How can I use my military logistics experience in clean energy?",
    "marcus_programs": "What veteran programs exist for clean energy careers?",
    "liv_direct": "I have engineering credentials from Tel Aviv and want to work in Massachusetts",
    "liv_credentials": "How do I get my foreign engineering degree recognized?",
    "liv_visa": "What visa options exist for international clean energy professionals?",
    "miguel_direct": "I want to work on environmental justice in Gateway Cities",
    "miguel_community": "How can I organize my community around clean energy equity?",
    "miguel_policy": "What environmental justice policies affect clean energy in Massachusetts?",
}


# Simple test agent for missing agents
class SimpleTestAgent:
    """Simple test agent for agents that don't have concrete implementations"""

    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.agent_type = agent_name.lower()

    async def handle_message(
        self, message: str, user_id: str, conversation_id: str
    ) -> Dict[str, Any]:
        """Simple test response"""
        return {
            "content": f"Hello! I'm {self.agent_name}, your Massachusetts climate career specialist. I'm here to help with your query: {message[:100]}...",
            "metadata": {
                "agent_name": self.agent_name,
                "agent_type": self.agent_type,
                "tools_used": [],
                "test_mode": True,
            },
            "sources": [],
        }


class SimpleAgentTester:
    """Simple testing of all agents with detailed analysis"""

    def __init__(self):
        self.supabase = None
        self.test_results = {}

    async def initialize(self):
        """Initialize database connection"""
        print("🔧 Initializing simple agent testing...")

        # Initialize Supabase directly
        settings = get_settings()
        self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

        print("✅ Initialization complete")

    async def get_user_context(self) -> Dict[str, Any]:
        """Get comprehensive user context for testing"""
        try:
            # Get user profile
            profile_result = (
                self.supabase.table("profiles")
                .select("*")
                .eq("id", TEST_USER_ID)
                .execute()
            )

            # Get resume data
            resume_result = (
                self.supabase.table("resumes")
                .select("*")
                .eq("user_id", TEST_USER_ID)
                .execute()
            )

            # Get job seeker profile
            job_seeker_result = (
                self.supabase.table("job_seeker_profiles")
                .select("*")
                .eq("user_id", TEST_USER_ID)
                .execute()
            )

            user_context = {
                "user_id": TEST_USER_ID,
                "profile": profile_result.data[0] if profile_result.data else None,
                "resume": resume_result.data[0] if resume_result.data else None,
                "job_seeker": (
                    job_seeker_result.data[0] if job_seeker_result.data else None
                ),
            }

            print(f"📋 User Context Retrieved:")
            print(f"   Profile: {'✅' if user_context['profile'] else '❌'}")
            print(f"   Resume: {'✅' if user_context['resume'] else '❌'}")
            print(f"   Job Seeker: {'✅' if user_context['job_seeker'] else '❌'}")

            if user_context["profile"]:
                profile = user_context["profile"]
                print(
                    f"   Name: {profile.get('first_name', 'Unknown')} {profile.get('last_name', '')}"
                )
                print(f"   Location: {profile.get('location', 'Unknown')}")
                print(f"   Education: {profile.get('education_level', 'Unknown')}")

            if user_context["resume"]:
                resume = user_context["resume"]
                print(f"   Resume Skills: {len(resume.get('skills', []))} skills")
                print(f"   Experience: {len(resume.get('experience', []))} positions")
                print(
                    f"   Climate Relevance: {resume.get('climate_relevance_score', 'Unknown')}"
                )

            return user_context

        except Exception as e:
            print(f"❌ Error getting user context: {e}")
            return {
                "user_id": TEST_USER_ID,
                "profile": None,
                "resume": None,
                "job_seeker": None,
            }

    async def test_agent_endpoint(
        self, agent_type: str, query: str, user_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Test agent via API endpoint"""
        print(f"\n🧪 Testing {agent_type.upper()} Agent")
        print(f"   Query: {query}")

        start_time = datetime.now()

        try:
            # Import the agent handler function
            if agent_type == "supervisor":
                from core.agents.base import SupervisorAgent

                agent = SupervisorAgent()
            elif agent_type == "jasmine":
                # Create real MA Resource Analyst agent
                agent = MAResourceAnalystAgent()
            elif agent_type == "marcus":
                from core.agents.veteran import VeteranSpecialist

                agent = VeteranSpecialist()
            elif agent_type == "liv":
                from core.agents.international import InternationalSpecialist

                agent = InternationalSpecialist()
            elif agent_type == "miguel":
                from core.agents.environmental import EnvironmentalJusticeSpecialist

                agent = EnvironmentalJusticeSpecialist()
            else:
                raise ValueError(f"Unknown agent type: {agent_type}")

            # Test agent response
            response = await agent.handle_message(
                message=query,
                user_id=TEST_USER_ID,
                conversation_id=f"test_{agent_type}_{datetime.now().strftime('%H%M%S')}",
            )

            end_time = datetime.now()
            response_time = (end_time - start_time).total_seconds()

            # Analyze response
            analysis = {
                "agent_type": agent_type,
                "query": query,
                "response_time_seconds": response_time,
                "response_length": len(response.get("content", "")),
                "has_content": bool(response.get("content")),
                "has_metadata": bool(response.get("metadata")),
                "agent_persona": response.get("metadata", {}).get("agent_name"),
                "tools_used": response.get("metadata", {}).get("tools_used", []),
                "sources": response.get("sources", []),
                "knowledge_resources_accessed": self.analyze_knowledge_access(response),
                "personalization_score": self.analyze_personalization(
                    response, user_context
                ),
                "success": True,
                "error": None,
                "response_preview": (
                    response.get("content", "")[:300] + "..."
                    if len(response.get("content", "")) > 300
                    else response.get("content", "")
                ),
            }

            print(f"   ✅ Success - {response_time:.2f}s")
            print(f"   📝 Response Length: {analysis['response_length']} chars")
            print(f"   🤖 Agent Persona: {analysis['agent_persona']}")
            print(f"   🔧 Tools Used: {len(analysis['tools_used'])}")
            print(f"   📚 Knowledge Access: {analysis['knowledge_resources_accessed']}")
            print(f"   🎯 Personalization: {analysis['personalization_score']}/10")

            return analysis

        except Exception as e:
            end_time = datetime.now()
            response_time = (end_time - start_time).total_seconds()

            analysis = {
                "agent_type": agent_type,
                "query": query,
                "response_time_seconds": response_time,
                "success": False,
                "error": str(e),
                "response_preview": None,
            }

            print(f"   ❌ Error - {response_time:.2f}s: {e}")
            return analysis

    def analyze_knowledge_access(self, response: Dict[str, Any]) -> str:
        """Analyze how agent accessed knowledge resources"""
        content = response.get("content", "").lower()
        metadata = response.get("metadata", {})

        knowledge_indicators = []

        # Check for specific knowledge resource mentions
        if "training program" in content or "education" in content:
            knowledge_indicators.append("training_resources")
        if "job" in content and ("posting" in content or "opportunity" in content):
            knowledge_indicators.append("job_resources")
        if "organization" in content or "partner" in content:
            knowledge_indicators.append("partner_resources")
        if "funding" in content or "grant" in content:
            knowledge_indicators.append("funding_resources")

        # Check metadata for tool usage
        tools_used = metadata.get("tools_used", [])
        if "search_knowledge_base" in tools_used:
            knowledge_indicators.append("knowledge_base_search")
        if "search_resources" in tools_used:
            knowledge_indicators.append("resource_search")
        if "search_job_listings" in tools_used:
            knowledge_indicators.append("job_search")
        if "get_education_programs" in tools_used:
            knowledge_indicators.append("training_search")
        if "analyze_skills_gap" in tools_used:
            knowledge_indicators.append("skills_analysis")

        return (
            ", ".join(knowledge_indicators) if knowledge_indicators else "none_detected"
        )

    def analyze_personalization(
        self, response: Dict[str, Any], user_context: Dict[str, Any]
    ) -> int:
        """Analyze personalization level (0-10 scale)"""
        content = response.get("content", "").lower()
        score = 0

        # Check for user-specific information usage
        profile = user_context.get("profile", {}) or {}
        resume = user_context.get("resume", {}) or {}

        # Location personalization
        user_location = profile.get("location", "")
        if user_location and user_location.lower() in content:
            score += 2

        # Education level personalization
        education = profile.get("education_level", "")
        if education and education.lower() in content:
            score += 1

        # Resume skills personalization
        skills = resume.get("skills", [])
        if skills and any(skill.lower() in content for skill in skills):
            score += 2

        # Experience personalization
        experience = resume.get("experience", [])
        if experience and any(
            exp.get("title", "").lower() in content for exp in experience
        ):
            score += 2

        # Generic personalization indicators
        if "your" in content or "you" in content:
            score += 1
        if "based on" in content:
            score += 1
        if "massachusetts" in content:
            score += 1

        return min(score, 10)

    async def test_knowledge_resources_database(self) -> Dict[str, Any]:
        """Test knowledge resources database access"""
        print("\n📚 Testing Knowledge Resources Database Access")

        knowledge_tests = {}

        try:
            # Test resumes table access (correct table name)
            self.supabase.table("resumes")

            knowledge_tests["resumes_table"] = {
                "success": True,
                "table": "resumes",
                "records_found": 0,
                "error": None,
            }
            print(
                f"      ✅ Found {len(knowledge_result.data) if knowledge_result.data else 0} resumes"
            )

        except Exception as e:
            knowledge_tests["resumes_table"] = {
                "success": False,
                "error": str(e),
            }
            print(f"      ❌ Error: {e}")

        try:
            # Test job_listings table access (correct table name)
            print("   Testing job_listings table...")
            job_result = (
                self.supabase.table("job_listings")
                .select("*")
                .eq("is_active", True)
                .limit(5)
                .execute()
            )

            knowledge_tests["job_listings_table"] = {
                "success": True,
                "table": "job_listings",
                "records_found": len(job_result.data) if job_result.data else 0,
                "error": None,
            }
            print(
                f"      ✅ Found {len(job_result.data) if job_result.data else 0} job listings"
            )

        except Exception as e:
            knowledge_tests["job_listings_table"] = {"success": False, "error": str(e)}
            print(f"      ❌ Error: {e}")

        try:
            # Test education_programs table access (correct table name)
            print("   Testing education_programs table...")
            training_result = (
                self.supabase.table("education_programs")
                .select("*")
                .eq("is_active", True)
                .limit(5)
                .execute()
            )

            knowledge_tests["education_programs_table"] = {
                "success": True,
                "table": "education_programs",
                "records_found": (
                    len(training_result.data) if training_result.data else 0
                ),
                "error": None,
            }
            print(
                f"      ✅ Found {len(training_result.data) if training_result.data else 0} education programs"
            )

        except Exception as e:
            knowledge_tests["education_programs_table"] = {
                "success": False,
                "error": str(e),
            }
            print(f"      ❌ Error: {e}")

        return knowledge_tests

    async def run_comprehensive_test(self):
        """Run comprehensive test of all agents"""
        print("🚀 Starting Simple Comprehensive Agent Testing")
        print("=" * 60)

        # Initialize
        await self.initialize()

        # Get user context
        user_context = await self.get_user_context()

        # Test knowledge resources database access
        knowledge_results = await self.test_knowledge_resources_database()

        # Test each agent with multiple queries
        agent_results = {}

        # Define agent test configurations
        agent_configs = {
            "supervisor": [TEST_QUERIES["supervisor_general"]],
            "jasmine": [
                TEST_QUERIES["jasmine_direct"],
                TEST_QUERIES["jasmine_skills"],
                TEST_QUERIES["jasmine_training"],
            ],
            "marcus": [
                TEST_QUERIES["marcus_direct"],
                TEST_QUERIES["marcus_skills"],
                TEST_QUERIES["marcus_programs"],
            ],
            "liv": [
                TEST_QUERIES["liv_direct"],
                TEST_QUERIES["liv_credentials"],
                TEST_QUERIES["liv_visa"],
            ],
            "miguel": [
                TEST_QUERIES["miguel_direct"],
                TEST_QUERIES["miguel_community"],
                TEST_QUERIES["miguel_policy"],
            ],
        }

        for agent_name, queries in agent_configs.items():
            print(f"\n{'='*20} {agent_name.upper()} AGENT TESTING {'='*20}")

            agent_tests = {}

            # Test each query
            for i, query in enumerate(queries):
                test_result = await self.test_agent_endpoint(
                    agent_name, query, user_context
                )
                agent_tests[f"test_{i+1}"] = test_result

            agent_results[agent_name] = agent_tests

        # Compile comprehensive results
        comprehensive_results = {
            "test_metadata": {
                "test_user_id": TEST_USER_ID,
                "test_timestamp": datetime.now().isoformat(),
                "total_agents_tested": len(agent_configs),
                "total_queries_tested": sum(
                    len(queries) for queries in agent_configs.values()
                ),
            },
            "user_context": user_context,
            "knowledge_resources": knowledge_results,
            "agent_results": agent_results,
        }

        # Save results
        results_file = (
            f"simple_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        )
        with open(results_file, "w") as f:
            json.dump(comprehensive_results, f, indent=2, default=str)

        # Print summary
        self.print_test_summary(comprehensive_results)

        print(f"\n📄 Detailed results saved to: {results_file}")

        return comprehensive_results

    def print_test_summary(self, results: Dict[str, Any]):
        """Print comprehensive test summary"""
        print("\n" + "=" * 60)
        print("📊 SIMPLE COMPREHENSIVE TEST SUMMARY")
        print("=" * 60)

        metadata = results["test_metadata"]
        print(f"🔍 Test Overview:")
        print(f"   User ID: {metadata['test_user_id']}")
        print(f"   Agents Tested: {metadata['total_agents_tested']}")
        print(f"   Total Queries: {metadata['total_queries_tested']}")

        # Knowledge resources summary
        knowledge = results["knowledge_resources"]
        print(f"\n📚 Knowledge Resources Database:")
        for table_name, result in knowledge.items():
            status = "✅" if result.get("success") else "❌"
            count = result.get("count", 0)
            print(f"   {status} {table_name}: {count} records")

        # Agent performance summary
        print(f"\n🤖 Agent Performance:")
        for agent_name, tests in results["agent_results"].items():
            successful_tests = sum(1 for test in tests.values() if test.get("success"))
            total_tests = len(tests)
            avg_response_time = (
                sum(test.get("response_time_seconds", 0) for test in tests.values())
                / total_tests
                if total_tests > 0
                else 0
            )
            avg_personalization = (
                sum(test.get("personalization_score", 0) for test in tests.values())
                / total_tests
                if total_tests > 0
                else 0
            )

            print(f"   {agent_name.upper()}:")
            print(f"      Success Rate: {successful_tests}/{total_tests}")
            print(f"      Avg Response Time: {avg_response_time:.2f}s")
            print(f"      Avg Personalization: {avg_personalization:.1f}/10")

            # Show knowledge access patterns
            knowledge_patterns = []
            for test in tests.values():
                access_pattern = test.get("knowledge_resources_accessed")
                if access_pattern and access_pattern != "none_detected":
                    knowledge_patterns.append(access_pattern)

            if knowledge_patterns:
                print(f"      Knowledge Access: {', '.join(set(knowledge_patterns))}")
            else:
                print(f"      Knowledge Access: none_detected")

        print("\n" + "=" * 60)


async def main():
    """Main test execution"""
    tester = SimpleAgentTester()
    await tester.run_comprehensive_test()


if __name__ == "__main__":
    asyncio.run(main())
