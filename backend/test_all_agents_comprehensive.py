#!/usr/bin/env python3
"""
Comprehensive Agent Testing Script

Tests all agents (Pendo, Jasmine, Marcus, Liv, Miguel) with the same user
to analyze workflow, supervisor routing logic, and knowledge resources access.
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from typing import Any, Dict, List

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from adapters.supabase import get_cached_supabase_client
from core.agents.base import (
    EnvironmentalJusticeSpecialistAgent,
    InternationalSpecialistAgent,
    MAResourceAnalystAgent,
    SupervisorAgent,
    VeteranSpecialistAgent,
)

# Test user ID - using the known user from previous tests
TEST_USER_ID = "30eedd6a-0771-444e-90d2-7520c1eb03f0"
TEST_CONVERSATION_ID = f"test_comprehensive_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

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


class ComprehensiveAgentTester:
    """Comprehensive testing of all agents with detailed analysis"""

    def __init__(self):
        self.supabase = None
        self.test_results = {}
        self.agents = {}

    async def initialize(self):
        """Initialize database connection and agents"""
        print("🔧 Initializing comprehensive agent testing...")

        # Use our fixed Supabase adapter instead of direct get_supabase_client
        try:
            from adapters.supabase import get_cached_supabase_client

            self.supabase = get_cached_supabase_client()
            if self.supabase:
                print("✅ Supabase connection established")
            else:
                print("⚠️  Supabase connection failed, proceeding without database")
        except Exception as e:
            print(f"⚠️  Supabase connection error: {e}")
            print("Proceeding without database connection...")
            self.supabase = None

        # Initialize all agents
        self.agents = {
            "pendo": SupervisorAgent(),
            "jasmine": MAResourceAnalystAgent(),
            "marcus": VeteranSpecialistAgent(),
            "liv": InternationalSpecialistAgent(),
            "miguel": EnvironmentalJusticeSpecialistAgent(),
        }

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
                self.supabase.table("resume_data")
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

            return user_context

        except Exception as e:
            print(f"❌ Error getting user context: {e}")
            return {
                "user_id": TEST_USER_ID,
                "profile": None,
                "resume": None,
                "job_seeker": None,
            }

    async def test_agent(
        self, agent_name: str, agent: Any, query: str, user_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Test individual agent with comprehensive analysis"""
        print(f"\n🧪 Testing {agent_name.upper()} Agent")
        print(f"   Query: {query}")

        start_time = datetime.now()

        try:
            # Test agent response
            response = await agent.handle_message(
                message=query,
                user_id=TEST_USER_ID,
                conversation_id=TEST_CONVERSATION_ID,
            )

            end_time = datetime.now()
            response_time = (end_time - start_time).total_seconds()

            # Analyze response
            analysis = {
                "agent_name": agent_name,
                "query": query,
                "response_time_seconds": response_time,
                "response_length": len(response.get("content", "")),
                "has_content": bool(response.get("content")),
                "has_metadata": bool(response.get("metadata")),
                "agent_type": response.get("metadata", {}).get("agent_type"),
                "agent_persona": response.get("metadata", {}).get("agent_name"),
                "tools_used": response.get("metadata", {}).get("tools_used", []),
                "sources": response.get("sources", []),
                "knowledge_resources_accessed": self.analyze_knowledge_access(response),
                "personalization_score": self.analyze_personalization(
                    response, user_context
                ),
                "success": True,
                "error": None,
                "full_response": response,
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
                "agent_name": agent_name,
                "query": query,
                "response_time_seconds": response_time,
                "success": False,
                "error": str(e),
                "full_response": None,
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

    async def test_supervisor_routing(
        self, user_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Test supervisor routing logic with different query types"""
        print("\n🎯 Testing Supervisor Routing Logic")

        supervisor = self.agents["pendo"]
        routing_tests = {}

        routing_queries = {
            "veteran": TEST_QUERIES["supervisor_routing_veteran"],
            "international": TEST_QUERIES["supervisor_routing_international"],
            "environmental_justice": TEST_QUERIES["supervisor_routing_ej"],
            "resume": TEST_QUERIES["supervisor_routing_resume"],
            "general": TEST_QUERIES["supervisor_general"],
        }

        for query_type, query in routing_queries.items():
            print(f"   Testing {query_type} routing...")

            try:
                response = await supervisor.handle_message(
                    message=query,
                    user_id=TEST_USER_ID,
                    conversation_id=f"{TEST_CONVERSATION_ID}_{query_type}",
                )

                routing_decision = response.get("metadata", {}).get("routing_decision")
                specialist_assigned = response.get("metadata", {}).get(
                    "specialist_assigned"
                )

                routing_tests[query_type] = {
                    "query": query,
                    "routing_decision": routing_decision,
                    "specialist_assigned": specialist_assigned,
                    "response_content": response.get("content", "")[:200] + "...",
                    "success": True,
                }

                print(
                    f"      ✅ Routed to: {specialist_assigned or 'General guidance'}"
                )

            except Exception as e:
                routing_tests[query_type] = {
                    "query": query,
                    "success": False,
                    "error": str(e),
                }
                print(f"      ❌ Error: {e}")

        return routing_tests

    async def test_knowledge_resources_access(self) -> Dict[str, Any]:
        """Test knowledge resources access across all agents"""
        print("\n📚 Testing Knowledge Resources Access")

        knowledge_tests = {}

        # Test each agent's knowledge access
        for agent_name, agent in self.agents.items():
            if hasattr(agent, "search_knowledge_resources") or hasattr(
                agent, "access_knowledge_base"
            ):
                print(f"   Testing {agent_name} knowledge access...")

                try:
                    # Test knowledge search capability
                    if hasattr(agent, "search_knowledge_resources"):
                        result = await agent.search_knowledge_resources(
                            "renewable energy training"
                        )
                        knowledge_tests[f"{agent_name}_search"] = {
                            "method": "search_knowledge_resources",
                            "success": True,
                            "result_length": len(str(result)),
                        }

                    # Test knowledge base access
                    if hasattr(agent, "access_knowledge_base"):
                        result = await agent.access_knowledge_base("climate_policy")
                        knowledge_tests[f"{agent_name}_access"] = {
                            "method": "access_knowledge_base",
                            "success": True,
                            "result_length": len(str(result)),
                        }

                except Exception as e:
                    knowledge_tests[f"{agent_name}_error"] = {
                        "success": False,
                        "error": str(e),
                    }

        return knowledge_tests

    async def run_comprehensive_test(self):
        """Run comprehensive test of all agents"""
        print("🚀 Starting Comprehensive Agent Testing")
        print("=" * 60)

        # Initialize
        await self.initialize()

        # Get user context
        user_context = await self.get_user_context()

        # Test supervisor routing
        routing_results = await self.test_supervisor_routing(user_context)

        # Test knowledge resources access
        knowledge_results = await self.test_knowledge_resources_access()

        # Test each agent with multiple queries
        agent_results = {}

        for agent_name, agent in self.agents.items():
            print(f"\n{'='*20} {agent_name.upper()} AGENT TESTING {'='*20}")

            agent_tests = {}

            # Get relevant queries for this agent
            relevant_queries = []
            if agent_name == "pendo":
                relevant_queries = [TEST_QUERIES["supervisor_general"]]
            elif agent_name == "jasmine":
                relevant_queries = [
                    TEST_QUERIES["jasmine_direct"],
                    TEST_QUERIES["jasmine_skills"],
                    TEST_QUERIES["jasmine_training"],
                ]
            elif agent_name == "marcus":
                relevant_queries = [
                    TEST_QUERIES["marcus_direct"],
                    TEST_QUERIES["marcus_skills"],
                    TEST_QUERIES["marcus_programs"],
                ]
            elif agent_name == "liv":
                relevant_queries = [
                    TEST_QUERIES["liv_direct"],
                    TEST_QUERIES["liv_credentials"],
                    TEST_QUERIES["liv_visa"],
                ]
            elif agent_name == "miguel":
                relevant_queries = [
                    TEST_QUERIES["miguel_direct"],
                    TEST_QUERIES["miguel_community"],
                    TEST_QUERIES["miguel_policy"],
                ]

            # Test each query
            for i, query in enumerate(relevant_queries):
                test_result = await self.test_agent(
                    agent_name, agent, query, user_context
                )
                agent_tests[f"test_{i+1}"] = test_result

            agent_results[agent_name] = agent_tests

        # Compile comprehensive results
        comprehensive_results = {
            "test_metadata": {
                "test_user_id": TEST_USER_ID,
                "test_conversation_id": TEST_CONVERSATION_ID,
                "test_timestamp": datetime.now().isoformat(),
                "total_agents_tested": len(self.agents),
                "total_queries_tested": sum(
                    len(tests) for tests in agent_results.values()
                ),
            },
            "user_context": user_context,
            "supervisor_routing": routing_results,
            "knowledge_resources": knowledge_results,
            "agent_results": agent_results,
        }

        # Save results
        results_file = f"comprehensive_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(results_file, "w") as f:
            json.dump(comprehensive_results, f, indent=2, default=str)

        # Print summary
        self.print_test_summary(comprehensive_results)

        print(f"\n📄 Detailed results saved to: {results_file}")

        return comprehensive_results

    def print_test_summary(self, results: Dict[str, Any]):
        """Print comprehensive test summary"""
        print("\n" + "=" * 60)
        print("📊 COMPREHENSIVE TEST SUMMARY")
        print("=" * 60)

        metadata = results["test_metadata"]
        print(f"🔍 Test Overview:")
        print(f"   User ID: {metadata['test_user_id']}")
        print(f"   Agents Tested: {metadata['total_agents_tested']}")
        print(f"   Total Queries: {metadata['total_queries_tested']}")

        # Supervisor routing summary
        routing = results["supervisor_routing"]
        print(f"\n🎯 Supervisor Routing:")
        for query_type, result in routing.items():
            status = "✅" if result.get("success") else "❌"
            specialist = result.get("specialist_assigned", "None")
            print(f"   {status} {query_type}: → {specialist}")

        # Agent performance summary
        print(f"\n🤖 Agent Performance:")
        for agent_name, tests in results["agent_results"].items():
            successful_tests = sum(1 for test in tests.values() if test.get("success"))
            total_tests = len(tests)
            avg_response_time = (
                sum(test.get("response_time_seconds", 0) for test in tests.values())
                / total_tests
            )
            avg_personalization = (
                sum(test.get("personalization_score", 0) for test in tests.values())
                / total_tests
            )

            print(f"   {agent_name.upper()}:")
            print(f"      Success Rate: {successful_tests}/{total_tests}")
            print(f"      Avg Response Time: {avg_response_time:.2f}s")
            print(f"      Avg Personalization: {avg_personalization:.1f}/10")

        # Knowledge resources summary
        knowledge = results["knowledge_resources"]
        print(f"\n📚 Knowledge Resources Access:")
        successful_access = sum(1 for test in knowledge.values() if test.get("success"))
        total_access_tests = len(knowledge)
        print(f"   Success Rate: {successful_access}/{total_access_tests}")

        print("\n" + "=" * 60)


async def main():
    """Main test execution"""
    tester = ComprehensiveAgentTester()
    await tester.run_comprehensive_test()


if __name__ == "__main__":
    asyncio.run(main())
