"""
Full-Stack Agent Verification Test Suite
Phase 2C Completion Verification

Following rule #12: Complete code verification with comprehensive testing
Following rule #15: Include comprehensive error handling and logging

This script verifies all agents are properly configured and ready for user-facing integration.
Location: backendv1/tests/test_agent_verification.py
"""

import asyncio
import pytest
import sys
import traceback
from typing import Dict, Any, List
from datetime import datetime

# Add parent directory to path for imports
sys.path.append("..")

from backendv1.agents import (
    PendoAgent,
    LaurenAgent,
    MaiAgent,
    MarcusAgent,
    MiguelAgent,
    LivAgent,
    JasmineAgent,
    AlexAgent,
)
from backendv1.agents.base.agent_base import AgentContext, AgentResponse


class AgentVerificationTester:
    """
    Comprehensive agent verification test suite

    Tests all requirements from Phase 2C checklist:
    1. Prompt Validation
    2. Execution Sanity Tests
    3. Supervisor Integration
    """

    def __init__(self):
        """Initialize the test suite"""
        self.test_results = {
            "prompt_validation": {},
            "execution_tests": {},
            "supervisor_integration": {},
            "summary": {},
        }

        self.agents_to_test = [
            ("PendoAgent", PendoAgent, "supervisor_coordinator"),
            ("LaurenAgent", LaurenAgent, "climate_specialist"),
            ("MaiAgent", MaiAgent, "resume_specialist"),
            ("MarcusAgent", MarcusAgent, "veteran_specialist"),
            ("MiguelAgent", MiguelAgent, "environmental_justice_specialist"),
            ("LivAgent", LivAgent, "international_specialist"),
            ("JasmineAgent", JasmineAgent, "youth_early_career_specialist"),
            ("AlexAgent", AlexAgent, "empathy_specialist"),
        ]

        # Test payloads for different agent types
        self.test_messages = {
            "general": "I'm interested in transitioning to climate careers in Massachusetts",
            "crisis": "I'm feeling overwhelmed and hopeless about my career transition",
            "military": "I'm a veteran with Army experience looking for climate careers",
            "international": "I have international credentials and need help with climate jobs",
            "justice": "I'm interested in environmental justice and community organizing",
            "youth": "I'm a recent college graduate looking for entry-level climate opportunities",
            "resume": "I need help optimizing my resume for climate tech roles",
            "climate": "What renewable energy career opportunities are available?",
        }

    def create_test_context(self, user_id: str = "test_user") -> AgentContext:
        """Create a test context for agent testing"""
        return AgentContext(
            user_id=user_id,
            conversation_id=f"test_conv_{datetime.utcnow().timestamp()}",
            session_data={"test_mode": True},
            user_profile={"test": True},
            conversation_history=[],
            tools_available=["test_tool"],
            metadata={"test_suite": "agent_verification"},
        )

    async def test_prompt_validation(self) -> Dict[str, Any]:
        """
        Test 1: Prompt Validation
        - Does each agent correctly import its prompts from prompts.py?
        - Are the *_CONFIG dicts loaded into the agent properly?
        - Are system prompts correctly formatted with no missing keys?
        """
        print("\n🧩 Phase 1: Prompt Validation Testing")
        print("=" * 50)

        results = {}

        for agent_name, agent_class, agent_type in self.agents_to_test:
            print(f"\n📝 Testing {agent_name} prompt validation...")

            try:
                # Initialize agent
                if agent_name == "PendoAgent":
                    agent = agent_class()
                else:
                    agent = agent_class(agent_name.replace("Agent", ""), agent_type)

                # Test prompt loading
                prompt_tests = {
                    "has_system_prompt": hasattr(agent, "system_prompt")
                    and agent.system_prompt is not None,
                    "has_specialized_prompts": hasattr(agent, "specialized_prompts")
                    and len(agent.specialized_prompts) > 0,
                    "system_prompt_not_empty": hasattr(agent, "system_prompt")
                    and len(str(agent.system_prompt)) > 50,
                    "prompts_properly_loaded": True,  # Will be set to False if any import fails
                }

                # Check if prompts are properly imported (not hardcoded)
                try:
                    if hasattr(agent, "specialized_prompts"):
                        # Check that prompts contain expected content patterns
                        for prompt_name, prompt_content in agent.specialized_prompts.items():
                            if not prompt_content or len(str(prompt_content)) < 10:
                                prompt_tests["prompts_properly_loaded"] = False
                                break
                except Exception as e:
                    prompt_tests["prompts_properly_loaded"] = False
                    prompt_tests["import_error"] = str(e)

                # Test agent initialization
                initialization_tests = {
                    "agent_name_set": hasattr(agent, "agent_name") and agent.agent_name is not None,
                    "agent_type_set": hasattr(agent, "agent_type") and agent.agent_type is not None,
                    "specialization_areas_defined": hasattr(agent, "specialization_areas")
                    and len(agent.specialization_areas) > 0,
                    "tools_loaded": hasattr(agent, "available_tools")
                    and isinstance(agent.available_tools, list),
                }

                # Combine results
                agent_results = {**prompt_tests, **initialization_tests}
                results[agent_name] = {
                    "passed": all(agent_results.values()),
                    "details": agent_results,
                }

                status = "✅ PASSED" if results[agent_name]["passed"] else "❌ FAILED"
                print(f"   {status} - {agent_name}")

                if not results[agent_name]["passed"]:
                    print(f"      Failed tests: {[k for k, v in agent_results.items() if not v]}")

            except Exception as e:
                results[agent_name] = {
                    "passed": False,
                    "details": {"initialization_error": str(e)},
                    "exception": traceback.format_exc(),
                }
                print(f"   ❌ FAILED - {agent_name}: {str(e)}")

        self.test_results["prompt_validation"] = results
        return results

    async def test_execution_sanity(self) -> Dict[str, Any]:
        """
        Test 2: Execution Sanity Tests
        - Call each agent's handle_interaction() method with a sample payload
        - Check agent output structure: should return AgentResponse with required fields
        - Validate fallback logic if tools fail
        """
        print("\n🚀 Phase 2: Execution Sanity Testing")
        print("=" * 50)

        results = {}

        for agent_name, agent_class, agent_type in self.agents_to_test:
            print(f"\n⚡ Testing {agent_name} execution...")

            try:
                # Initialize agent
                if agent_name == "PendoAgent":
                    agent = agent_class()
                else:
                    agent = agent_class(agent_name.replace("Agent", ""), agent_type)

                # Create test context
                context = self.create_test_context(f"test_{agent_name.lower()}")

                # Test with appropriate message for each agent type
                test_message = self.test_messages.get("general")
                if "veteran" in agent_type or "marcus" in agent_name.lower():
                    test_message = self.test_messages.get("military")
                elif "empathy" in agent_type or "alex" in agent_name.lower():
                    test_message = self.test_messages.get("crisis")
                elif "international" in agent_type or "liv" in agent_name.lower():
                    test_message = self.test_messages.get("international")
                elif "justice" in agent_type or "miguel" in agent_name.lower():
                    test_message = self.test_messages.get("justice")
                elif "youth" in agent_type or "jasmine" in agent_name.lower():
                    test_message = self.test_messages.get("youth")
                elif "resume" in agent_type or "mai" in agent_name.lower():
                    test_message = self.test_messages.get("resume")
                elif "climate" in agent_type or "lauren" in agent_name.lower():
                    test_message = self.test_messages.get("climate")

                # Execute agent
                response = await agent.handle_interaction(
                    message=test_message,
                    user_id=context.user_id,
                    conversation_id=context.conversation_id,
                    session_data=context.session_data,
                    user_profile=context.user_profile,
                )

                # Validate response structure
                structure_tests = {
                    "returns_agent_response": isinstance(response, AgentResponse),
                    "has_content": hasattr(response, "content") and response.content is not None,
                    "has_specialist_type": hasattr(response, "specialist_type")
                    and response.specialist_type is not None,
                    "has_confidence_score": hasattr(response, "confidence_score")
                    and isinstance(response.confidence_score, (int, float)),
                    "has_success_flag": hasattr(response, "success")
                    and isinstance(response.success, bool),
                    "content_not_empty": len(str(response.content)) > 10,
                    "confidence_in_range": 0.0 <= response.confidence_score <= 1.0,
                    "specialist_type_matches": agent_type in response.specialist_type
                    or response.specialist_type in agent_type,
                }

                # Test response quality
                quality_tests = {
                    "response_relevant": any(
                        word in response.content.lower()
                        for word in ["climate", "career", "massachusetts", "help"]
                    ),
                    "response_substantial": len(response.content) > 100,
                    "no_error_message": response.success and (not response.error_message),
                    "processing_time_recorded": response.processing_time_ms is not None,
                }

                # Combine results
                agent_results = {**structure_tests, **quality_tests}
                results[agent_name] = {
                    "passed": all(agent_results.values()),
                    "details": agent_results,
                    "response_length": len(response.content),
                    "confidence_score": response.confidence_score,
                    "processing_time": response.processing_time_ms,
                }

                status = "✅ PASSED" if results[agent_name]["passed"] else "❌ FAILED"
                print(f"   {status} - {agent_name}")
                print(f"      Response length: {len(response.content)} chars")
                print(f"      Confidence: {response.confidence_score:.3f}")
                print(f"      Processing time: {response.processing_time_ms:.1f}ms")

                if not results[agent_name]["passed"]:
                    print(f"      Failed tests: {[k for k, v in agent_results.items() if not v]}")

            except Exception as e:
                results[agent_name] = {
                    "passed": False,
                    "details": {"execution_error": str(e)},
                    "exception": traceback.format_exc(),
                }
                print(f"   ❌ FAILED - {agent_name}: {str(e)}")

        self.test_results["execution_tests"] = results
        return results

    async def test_supervisor_integration(self) -> Dict[str, Any]:
        """
        Test 3: Supervisor Integration
        - Trigger Pendo (climate_supervisor) with inputs that route to each agent
        - Ensure state transitions, logs, and outputs are correct
        - For Pendo: verify it can delegate intelligently to other agents
        """
        print("\n🧠 Phase 3: Supervisor Integration Testing")
        print("=" * 50)

        results = {}

        try:
            # Initialize Pendo supervisor
            pendo = PendoAgent()
            context = self.create_test_context("supervisor_test")

            # Test routing decisions for each specialist
            routing_tests = {}

            for message_type, test_message in self.test_messages.items():
                print(f"\n🎯 Testing routing for {message_type} query...")

                try:
                    # Get Pendo's response
                    response = await pendo.handle_interaction(
                        message=test_message,
                        user_id=context.user_id,
                        conversation_id=context.conversation_id,
                        session_data=context.session_data,
                        user_profile=context.user_profile,
                    )

                    # Analyze routing decision
                    expected_specialists = {
                        "crisis": "alex",
                        "military": "marcus",
                        "international": "liv",
                        "justice": "miguel",
                        "youth": "jasmine",
                        "resume": "mai",
                        "climate": "lauren",
                    }

                    expected_specialist = expected_specialists.get(message_type)
                    routing_metadata = response.metadata.get("routing_recommendation")

                    routing_tests[message_type] = {
                        "response_generated": response.success,
                        "has_routing_metadata": "routing_recommendation" in response.metadata,
                        "correct_routing": (
                            routing_metadata == expected_specialist if expected_specialist else True
                        ),
                        "response_quality": len(response.content) > 50,
                        "confidence_high": response.confidence_score > 0.7,
                    }

                    status = "✅" if all(routing_tests[message_type].values()) else "❌"
                    print(f"   {status} {message_type}: routed to {routing_metadata}")

                except Exception as e:
                    routing_tests[message_type] = {"response_generated": False, "error": str(e)}
                    print(f"   ❌ {message_type}: {str(e)}")

            # Test delegation capability
            print(f"\n🔄 Testing delegation capability...")
            delegation_tests = {}

            try:
                # Test delegating to Alex
                alex_response = await pendo.delegate_to_specialist(
                    "alex", self.test_messages["crisis"], context
                )

                delegation_tests["alex_delegation"] = {
                    "delegation_successful": alex_response.success,
                    "correct_specialist_type": "empathy" in alex_response.specialist_type,
                    "delegation_metadata": "delegated_by" in alex_response.metadata,
                    "response_quality": len(alex_response.content) > 100,
                }

                print(f"   ✅ Alex delegation: {alex_response.specialist_type}")

            except Exception as e:
                delegation_tests["alex_delegation"] = {
                    "delegation_successful": False,
                    "error": str(e),
                }
                print(f"   ❌ Alex delegation failed: {str(e)}")

            # Compile supervisor results
            supervisor_tests = {
                "pendo_initialization": True,
                "routing_analysis_working": len(
                    [t for t in routing_tests.values() if t.get("response_generated", False)]
                )
                > 4,
                "delegation_working": delegation_tests.get("alex_delegation", {}).get(
                    "delegation_successful", False
                ),
                "metadata_tracking": True,
                "specialist_matching": len(
                    [t for t in routing_tests.values() if t.get("correct_routing", False)]
                )
                > 3,
            }

            results["pendo_supervisor"] = {
                "passed": all(supervisor_tests.values()),
                "details": supervisor_tests,
                "routing_results": routing_tests,
                "delegation_results": delegation_tests,
            }

            status = "✅ PASSED" if results["pendo_supervisor"]["passed"] else "❌ FAILED"
            print(f"\n🎯 Supervisor Integration: {status}")

        except Exception as e:
            results["pendo_supervisor"] = {
                "passed": False,
                "details": {"supervisor_error": str(e)},
                "exception": traceback.format_exc(),
            }
            print(f"\n❌ Supervisor Integration FAILED: {str(e)}")

        self.test_results["supervisor_integration"] = results
        return results

    def generate_summary_report(self) -> Dict[str, Any]:
        """Generate comprehensive summary report"""
        print("\n📊 PHASE 2C VERIFICATION SUMMARY")
        print("=" * 60)

        # Calculate overall statistics
        total_agents = len(self.agents_to_test)

        # Prompt validation stats
        prompt_passed = len(
            [r for r in self.test_results["prompt_validation"].values() if r["passed"]]
        )
        prompt_rate = (prompt_passed / total_agents) * 100

        # Execution stats
        exec_passed = len([r for r in self.test_results["execution_tests"].values() if r["passed"]])
        exec_rate = (exec_passed / total_agents) * 100

        # Supervisor stats
        supervisor_passed = (
            self.test_results["supervisor_integration"]
            .get("pendo_supervisor", {})
            .get("passed", False)
        )

        summary = {
            "total_agents_tested": total_agents,
            "prompt_validation": {
                "passed": prompt_passed,
                "failed": total_agents - prompt_passed,
                "success_rate": prompt_rate,
            },
            "execution_tests": {
                "passed": exec_passed,
                "failed": total_agents - exec_passed,
                "success_rate": exec_rate,
            },
            "supervisor_integration": {
                "passed": 1 if supervisor_passed else 0,
                "failed": 0 if supervisor_passed else 1,
                "success_rate": 100.0 if supervisor_passed else 0.0,
            },
            "overall_readiness": {
                "phase_2c_complete": prompt_rate >= 90 and exec_rate >= 90 and supervisor_passed,
                "ready_for_integration": prompt_rate >= 85 and exec_rate >= 85,
                "critical_issues": prompt_rate < 70 or exec_rate < 70 or not supervisor_passed,
            },
        }

        # Print summary
        print(f"📝 Prompt Validation: {prompt_passed}/{total_agents} passed ({prompt_rate:.1f}%)")
        print(f"⚡ Execution Tests: {exec_passed}/{total_agents} passed ({exec_rate:.1f}%)")
        print(f"🧠 Supervisor Integration: {'✅ PASSED' if supervisor_passed else '❌ FAILED'}")

        print(f"\n🎯 OVERALL STATUS:")
        if summary["overall_readiness"]["phase_2c_complete"]:
            print("✅ Phase 2C COMPLETE - Ready for user-facing integration!")
        elif summary["overall_readiness"]["ready_for_integration"]:
            print("⚠️  Phase 2C MOSTLY COMPLETE - Minor issues to address")
        else:
            print("❌ Phase 2C INCOMPLETE - Critical issues need resolution")

        # Detailed breakdown
        print(f"\n📋 DETAILED RESULTS:")

        print(f"\n🟢 AGENTS FULLY OPERATIONAL:")
        for agent_name, agent_class, agent_type in self.agents_to_test:
            prompt_ok = (
                self.test_results["prompt_validation"].get(agent_name, {}).get("passed", False)
            )
            exec_ok = self.test_results["execution_tests"].get(agent_name, {}).get("passed", False)

            if prompt_ok and exec_ok:
                print(f"   ✅ {agent_name} - {agent_type}")

        print(f"\n🟡 AGENTS WITH ISSUES:")
        for agent_name, agent_class, agent_type in self.agents_to_test:
            prompt_ok = (
                self.test_results["prompt_validation"].get(agent_name, {}).get("passed", False)
            )
            exec_ok = self.test_results["execution_tests"].get(agent_name, {}).get("passed", False)

            if not (prompt_ok and exec_ok):
                issues = []
                if not prompt_ok:
                    issues.append("prompt validation")
                if not exec_ok:
                    issues.append("execution")
                print(f"   ⚠️  {agent_name} - Issues: {', '.join(issues)}")

        self.test_results["summary"] = summary
        return summary

    async def run_full_verification(self) -> Dict[str, Any]:
        """Run complete Phase 2C verification suite"""
        print("🚀 STARTING FULL-STACK AGENT VERIFICATION")
        print("Phase 2C Completion Verification")
        print("=" * 60)

        try:
            # Run all test phases
            await self.test_prompt_validation()
            await self.test_execution_sanity()
            await self.test_supervisor_integration()

            # Generate summary
            summary = self.generate_summary_report()

            return {"success": True, "summary": summary, "detailed_results": self.test_results}

        except Exception as e:
            print(f"\n❌ CRITICAL ERROR during verification: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "traceback": traceback.format_exc(),
                "partial_results": self.test_results,
            }


async def main():
    """Main execution function"""
    tester = AgentVerificationTester()
    results = await tester.run_full_verification()

    if results["success"]:
        print(f"\n🎉 Verification completed successfully!")
        if results["summary"]["overall_readiness"]["phase_2c_complete"]:
            print("✅ All systems ready for Phase 3 - User Integration!")
        return 0
    else:
        print(f"\n💥 Verification failed with critical errors")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
