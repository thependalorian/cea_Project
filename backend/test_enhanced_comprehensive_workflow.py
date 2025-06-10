#!/usr/bin/env python3
"""
Enhanced Comprehensive Workflow Testing
======================================

Full-stack integration testing that validates:
- Frontend → Backend message routing
- Tool call chains and execution
- Agent workflow completeness  
- Response quality and persona consistency
- Skills translation accuracy
- Job matching and recommendation quality
- Performance metrics and benchmarking
"""

import asyncio
import json
import os
import sys
import time
from datetime import datetime
from typing import Any, Dict, List, Optional
from unittest.mock import AsyncMock, MagicMock, patch

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase import Client, create_client

from core.agents.base import SupervisorAgent
from core.agents.environmental import EnvironmentalJusticeSpecialist
from core.agents.international import InternationalSpecialist
from core.agents.ma_resource_analyst import MAResourceAnalystAgent
from core.agents.veteran import VeteranSpecialist
from core.config import get_settings

# Test constants
TEST_USER_ID = "30eedd6a-0771-444e-90d2-7520c1eb03f0"
FRONTEND_MESSAGE_FORMATS = {
    "chat_interface": {
        "query": "",
        "user_id": TEST_USER_ID,
        "context": {"source": "chat_interface", "timestamp": ""},
        "stream": False,
    },
    "resume_upload": {
        "query": "",
        "user_id": TEST_USER_ID,
        "context": {"source": "resume_upload", "has_file": True},
        "stream": False,
    },
    "job_search": {
        "query": "",
        "user_id": TEST_USER_ID,
        "context": {"source": "job_search", "location": "Massachusetts"},
        "stream": False,
    },
}


class EnhancedWorkflowTester:
    """Comprehensive workflow testing for full-stack integration"""

    def __init__(self):
        self.supabase = None
        self.supervisor = None
        self.test_results = {}
        self.performance_metrics = {}

    async def initialize(self):
        """Initialize testing environment"""
        print("🚀 Initializing Enhanced Comprehensive Workflow Testing")
        print("=" * 70)

        settings = get_settings()
        self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        self.supervisor = SupervisorAgent()

        print("✅ Testing environment ready")
        print("🎯 Focus: Full-stack integration, tool workflows, quality metrics")

    async def test_frontend_backend_message_routing(self) -> Dict[str, Any]:
        """Test message routing from frontend through backend agent system"""
        print("\n" + "=" * 60)
        print("🔄 FRONTEND → BACKEND MESSAGE ROUTING TESTS")
        print("=" * 60)

        routing_scenarios = [
            {
                "name": "Chat Interface General Query",
                "message_format": "chat_interface",
                "query": "I want to transition to clean energy careers",
                "expected_agent": "jasmine_ma_resource_analyst",
                "expected_tools": ["user_profile_lookup", "career_guidance"],
            },
            {
                "name": "Resume Upload Analysis",
                "message_format": "resume_upload",
                "query": "Please analyze my uploaded resume for climate opportunities",
                "expected_agent": "jasmine_ma_resource_analyst",
                "expected_tools": ["resume_parser", "skills_extractor", "job_matcher"],
            },
            {
                "name": "Veteran Career Transition",
                "message_format": "chat_interface",
                "query": "I'm a former Marine looking for renewable energy jobs",
                "expected_agent": "marcus_veteran_specialist",
                "expected_tools": ["military_skills_translator", "veteran_job_matcher"],
            },
            {
                "name": "International Professional",
                "message_format": "chat_interface",
                "query": "I moved from India and want to work in solar energy",
                "expected_agent": "liv_international_specialist",
                "expected_tools": ["credential_mapper", "cultural_bridge_builder"],
            },
        ]

        routing_results = []

        for scenario in routing_scenarios:
            print(f"\n🧪 Testing: {scenario['name']}")

            # Prepare frontend message format
            message_data = FRONTEND_MESSAGE_FORMATS[scenario["message_format"]].copy()
            message_data["query"] = scenario["query"]
            message_data["context"]["timestamp"] = datetime.now().isoformat()

            start_time = time.time()

            try:
                # Simulate frontend → backend API call
                response = await self.supervisor.handle_message(
                    message=message_data["query"],
                    user_id=message_data["user_id"],
                    conversation_id=f"route_test_{scenario['name'].replace(' ', '_').lower()}",
                )

                end_time = time.time()
                response_time = end_time - start_time

                # Validate response structure
                routing_validation = self.validate_routing_response(response, scenario)

                result = {
                    "scenario": scenario["name"],
                    "frontend_format": message_data,
                    "response": response,
                    "response_time": response_time,
                    "validation": routing_validation,
                    "status": "PASSED" if routing_validation["valid"] else "FAILED",
                }

                routing_results.append(result)

                print(f"   ✅ {scenario['name']}: {response_time:.2f}s")
                print(
                    f"   🎯 Agent: {routing_validation.get('agent_detected', 'Unknown')}"
                )
                print(f"   🛠️  Tools: {routing_validation.get('tools_count', 0)} called")

            except Exception as e:
                print(f"   ❌ {scenario['name']} FAILED: {e}")
                routing_results.append(
                    {"scenario": scenario["name"], "error": str(e), "status": "FAILED"}
                )

        return {
            "routing_tests": routing_results,
            "overall_success_rate": len(
                [r for r in routing_results if r.get("status") == "PASSED"]
            )
            / len(routing_results),
        }

    def validate_routing_response(
        self, response: Dict[str, Any], scenario: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Validate that response meets frontend expectations"""
        validation = {
            "valid": True,
            "issues": [],
            "agent_detected": None,
            "tools_count": 0,
        }

        # Check required response fields
        required_fields = ["content", "metadata"]
        for field in required_fields:
            if field not in response:
                validation["valid"] = False
                validation["issues"].append(f"Missing required field: {field}")

        # Check content quality
        if "content" in response:
            content = response["content"]
            if len(content) < 50:
                validation["valid"] = False
                validation["issues"].append("Response content too short")

            if not any(
                word in content.lower()
                for word in ["climate", "clean energy", "renewable"]
            ):
                validation["valid"] = False
                validation["issues"].append("Response lacks climate/energy context")

        # Check metadata structure
        if "metadata" in response:
            metadata = response["metadata"]

            # Agent detection
            if "agent_used" in metadata:
                validation["agent_detected"] = metadata["agent_used"]
            elif "routing_decision" in metadata:
                validation["agent_detected"] = metadata["routing_decision"]

            # Tool usage
            if "tools_called" in metadata:
                validation["tools_count"] = len(metadata["tools_called"])

        return validation

    async def test_tool_call_workflows(self) -> Dict[str, Any]:
        """Test complete tool call workflows and verification"""
        print("\n" + "=" * 60)
        print("🛠️ TOOL CALL WORKFLOW TESTS")
        print("=" * 60)

        tool_workflows = [
            {
                "name": "Resume Processing Workflow",
                "query": "Analyze my resume for renewable energy career opportunities",
                "expected_tools": ["resume_parser", "skills_extractor", "job_matcher"],
                "validation_checks": [
                    "parsed_sections",
                    "extracted_skills",
                    "job_matches",
                ],
            },
            {
                "name": "Skills Translation Workflow",
                "query": "How do my marketing skills translate to clean energy work?",
                "expected_tools": ["skills_translator", "career_pathway_mapper"],
                "validation_checks": [
                    "skill_mappings",
                    "career_paths",
                    "relevance_scores",
                ],
            },
            {
                "name": "Job Search Workflow",
                "query": "Find me solar installer jobs in Massachusetts",
                "expected_tools": [
                    "job_search",
                    "geographic_filter",
                    "salary_analyzer",
                ],
                "validation_checks": [
                    "job_listings",
                    "location_filtering",
                    "salary_ranges",
                ],
            },
            {
                "name": "Training Program Workflow",
                "query": "What training programs are available for wind energy careers?",
                "expected_tools": [
                    "vector_search",
                    "training_finder",
                    "certification_mapper",
                ],
                "validation_checks": [
                    "program_listings",
                    "certification_info",
                    "duration_costs",
                ],
            },
        ]

        workflow_results = []

        for workflow in tool_workflows:
            print(f"\n🔧 Testing: {workflow['name']}")

            start_time = time.time()

            try:
                response = await self.supervisor.handle_message(
                    message=workflow["query"],
                    user_id=TEST_USER_ID,
                    conversation_id=f"tool_test_{workflow['name'].replace(' ', '_').lower()}",
                )

                end_time = time.time()
                execution_time = end_time - start_time

                # Validate tool workflow execution
                workflow_validation = self.validate_tool_workflow(response, workflow)

                result = {
                    "workflow": workflow["name"],
                    "query": workflow["query"],
                    "response": response,
                    "execution_time": execution_time,
                    "validation": workflow_validation,
                    "status": "PASSED" if workflow_validation["valid"] else "FAILED",
                }

                workflow_results.append(result)

                print(f"   ✅ {workflow['name']}: {execution_time:.2f}s")
                print(
                    f"   🔍 Tools Executed: {workflow_validation.get('tools_executed', 0)}"
                )
                print(
                    f"   📊 Validation Score: {workflow_validation.get('validation_score', 0):.2f}"
                )

            except Exception as e:
                print(f"   ❌ {workflow['name']} FAILED: {e}")
                workflow_results.append(
                    {"workflow": workflow["name"], "error": str(e), "status": "FAILED"}
                )

        return {
            "workflow_tests": workflow_results,
            "average_execution_time": sum(
                r.get("execution_time", 0) for r in workflow_results
            )
            / len(workflow_results),
            "tool_success_rate": len(
                [r for r in workflow_results if r.get("status") == "PASSED"]
            )
            / len(workflow_results),
        }

    def validate_tool_workflow(
        self, response: Dict[str, Any], workflow: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Validate tool workflow execution and results"""
        validation = {
            "valid": True,
            "issues": [],
            "tools_executed": 0,
            "validation_score": 0.0,
        }

        score_components = []

        # Check tool execution
        metadata = response.get("metadata", {})
        if "tools_called" in metadata:
            tools_called = metadata["tools_called"]
            validation["tools_executed"] = len(tools_called)

            # Check if expected tools were called
            expected_tools = workflow["expected_tools"]
            tools_found = sum(
                1
                for tool in expected_tools
                if any(tool in str(called).lower() for called in tools_called)
            )
            tool_score = tools_found / len(expected_tools)
            score_components.append(tool_score)
        else:
            validation["issues"].append("No tools_called metadata found")
            score_components.append(0.0)

        # Check content quality
        content = response.get("content", "")
        if len(content) > 100:
            content_score = min(len(content) / 500, 1.0)  # Max score at 500+ chars
            score_components.append(content_score)
        else:
            validation["issues"].append("Response content insufficient")
            score_components.append(0.0)

        # Check validation criteria
        validation_checks = workflow["validation_checks"]
        checks_passed = 0

        for check in validation_checks:
            if check == "parsed_sections" and "sections" in str(response).lower():
                checks_passed += 1
            elif check == "extracted_skills" and "skills" in str(response).lower():
                checks_passed += 1
            elif check == "job_matches" and (
                "job" in str(response).lower() or "position" in str(response).lower()
            ):
                checks_passed += 1
            elif check == "salary_ranges" and "$" in str(response):
                checks_passed += 1
            # Add more validation criteria as needed

        validation_score = checks_passed / len(validation_checks)
        score_components.append(validation_score)

        # Calculate overall validation score
        validation["validation_score"] = sum(score_components) / len(score_components)

        if validation["validation_score"] < 0.7:
            validation["valid"] = False
            validation["issues"].append(
                f"Low validation score: {validation['validation_score']:.2f}"
            )

        return validation

    async def test_persona_consistency_and_quality(self) -> Dict[str, Any]:
        """Test agent persona consistency and response quality"""
        print("\n" + "=" * 60)
        print("🎭 PERSONA CONSISTENCY & QUALITY TESTS")
        print("=" * 60)

        persona_tests = [
            {
                "agent": "jasmine_ma_resource_analyst",
                "test_queries": [
                    "I'm nervous about changing careers to clean energy",
                    "What if I don't have the right qualifications?",
                    "Can you help me identify my strengths?",
                ],
                "expected_traits": [
                    "encouraging",
                    "professional",
                    "supportive",
                    "specific",
                ],
                "persona_metrics": [
                    "tone_consistency",
                    "encouraging_language",
                    "expertise_demonstration",
                ],
            },
            {
                "agent": "marcus_veteran_specialist",
                "test_queries": [
                    "I'm transitioning from military to renewable energy",
                    "How do I translate my combat experience?",
                    "What opportunities exist for veterans?",
                ],
                "expected_traits": [
                    "brotherhood",
                    "respect",
                    "understanding",
                    "practical",
                ],
                "persona_metrics": [
                    "military_connection",
                    "peer_relatability",
                    "service_recognition",
                ],
            },
            {
                "agent": "liv_international_specialist",
                "test_queries": [
                    "I'm new to the US and want to work in clean energy",
                    "How do I navigate credential recognition?",
                    "What cultural challenges should I expect?",
                ],
                "expected_traits": [
                    "empathetic",
                    "inclusive",
                    "culturally_aware",
                    "supportive",
                ],
                "persona_metrics": [
                    "cultural_sensitivity",
                    "empathy_demonstration",
                    "inclusion_focus",
                ],
            },
        ]

        persona_results = []

        for test in persona_tests:
            print(f"\n🎭 Testing: {test['agent']}")

            agent_responses = []

            for query in test["test_queries"]:
                try:
                    response = await self.supervisor.handle_message(
                        message=query,
                        user_id=TEST_USER_ID,
                        conversation_id=f"persona_test_{test['agent']}_{len(agent_responses)}",
                    )

                    agent_responses.append(response)

                except Exception as e:
                    print(f"   ❌ Query failed: {e}")
                    continue

            # Analyze persona consistency
            persona_analysis = self.analyze_persona_consistency(agent_responses, test)

            result = {
                "agent": test["agent"],
                "responses": agent_responses,
                "analysis": persona_analysis,
                "consistency_score": persona_analysis.get("consistency_score", 0.0),
                "status": (
                    "PASSED" if persona_analysis.get("consistent", False) else "FAILED"
                ),
            }

            persona_results.append(result)

            print(
                f"   ✅ Consistency Score: {persona_analysis.get('consistency_score', 0.0):.2f}"
            )
            print(
                f"   🎯 Traits Found: {len(persona_analysis.get('traits_found', []))}/{len(test['expected_traits'])}"
            )

        return {
            "persona_tests": persona_results,
            "overall_consistency": sum(
                r.get("consistency_score", 0) for r in persona_results
            )
            / len(persona_results),
            "persona_success_rate": len(
                [r for r in persona_results if r.get("status") == "PASSED"]
            )
            / len(persona_results),
        }

    def analyze_persona_consistency(
        self, responses: List[Dict[str, Any]], test_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze persona consistency across multiple responses"""
        analysis = {
            "consistent": True,
            "consistency_score": 0.0,
            "traits_found": [],
            "issues": [],
        }

        if not responses:
            analysis["consistent"] = False
            analysis["issues"].append("No responses to analyze")
            return analysis

        # Combine all response content for analysis
        all_content = " ".join([r.get("content", "") for r in responses]).lower()

        # Check for expected traits
        expected_traits = test_config["expected_traits"]
        traits_found = []

        trait_indicators = {
            "encouraging": ["you can", "confident", "believe", "capable", "strength"],
            "professional": ["experience", "qualifications", "industry", "career"],
            "supportive": ["help", "support", "guide", "assist", "together"],
            "specific": ["specific", "example", "particular", "detailed"],
            "brotherhood": ["brother", "fellow", "understand", "been there"],
            "respect": ["service", "honor", "respect", "appreciate"],
            "understanding": ["know", "understand", "experience", "relate"],
            "practical": ["step", "action", "approach", "method", "way"],
            "empathetic": ["understand", "feel", "experience", "recognize"],
            "inclusive": ["welcome", "belong", "diverse", "inclusive"],
            "culturally_aware": ["culture", "background", "international", "global"],
        }

        for trait in expected_traits:
            if trait in trait_indicators:
                indicators = trait_indicators[trait]
                if any(indicator in all_content for indicator in indicators):
                    traits_found.append(trait)

        analysis["traits_found"] = traits_found

        # Calculate consistency score
        trait_score = len(traits_found) / len(expected_traits)

        # Check response length consistency (should be substantial)
        avg_length = sum(len(r.get("content", "")) for r in responses) / len(responses)
        length_score = min(avg_length / 200, 1.0)  # Target 200+ chars

        # Check for persona-breaking elements
        persona_breaks = 0
        for response in responses:
            content = response.get("content", "").lower()
            # Check for overly formal language when should be casual, etc.
            if "furthermore" in content or "additionally" in content:
                persona_breaks += 1

        persona_consistency = 1.0 - (persona_breaks / len(responses))

        # Overall consistency score
        analysis["consistency_score"] = (
            trait_score + length_score + persona_consistency
        ) / 3

        if analysis["consistency_score"] < 0.7:
            analysis["consistent"] = False
            analysis["issues"].append(
                f"Low consistency score: {analysis['consistency_score']:.2f}"
            )

        return analysis

    async def test_skills_translation_accuracy(self) -> Dict[str, Any]:
        """Test accuracy and quality of skills translation"""
        print("\n" + "=" * 60)
        print("🎯 SKILLS TRANSLATION ACCURACY TESTS")
        print("=" * 60)

        translation_test_cases = [
            {
                "background": "Software Engineering",
                "input_skills": [
                    "Python programming",
                    "Database management",
                    "API development",
                ],
                "query": "How do my software engineering skills apply to clean energy?",
                "expected_translations": [
                    "clean energy data analysis",
                    "grid optimization",
                    "energy management systems",
                ],
                "context": "Technical skills translation",
            },
            {
                "background": "Teaching",
                "input_skills": [
                    "Curriculum development",
                    "Classroom management",
                    "Student assessment",
                ],
                "query": "Can my teaching experience help in environmental education?",
                "expected_translations": [
                    "environmental education",
                    "outreach coordination",
                    "program development",
                ],
                "context": "Education to climate education transition",
            },
            {
                "background": "Military Logistics",
                "input_skills": [
                    "Supply chain coordination",
                    "Team leadership",
                    "Safety protocols",
                ],
                "query": "How does military logistics experience help in renewable energy?",
                "expected_translations": [
                    "renewable energy operations",
                    "project coordination",
                    "safety management",
                ],
                "context": "Military to civilian transition",
            },
            {
                "background": "Restaurant Management",
                "input_skills": [
                    "Staff coordination",
                    "Customer service",
                    "Inventory management",
                ],
                "query": "Can restaurant management skills work in the clean energy sector?",
                "expected_translations": [
                    "team coordination",
                    "client relations",
                    "resource management",
                ],
                "context": "Service industry to clean energy",
            },
        ]

        translation_results = []

        for test_case in translation_test_cases:
            print(f"\n🔄 Testing: {test_case['context']}")

            try:
                response = await self.supervisor.handle_message(
                    message=test_case["query"],
                    user_id=TEST_USER_ID,
                    conversation_id=f"skills_test_{test_case['background'].replace(' ', '_').lower()}",
                )

                # Analyze translation quality
                translation_analysis = self.analyze_skills_translation(
                    response, test_case
                )

                result = {
                    "test_case": test_case,
                    "response": response,
                    "analysis": translation_analysis,
                    "accuracy_score": translation_analysis.get("accuracy_score", 0.0),
                    "status": (
                        "PASSED"
                        if translation_analysis.get("accurate", False)
                        else "FAILED"
                    ),
                }

                translation_results.append(result)

                print(
                    f"   ✅ Accuracy Score: {translation_analysis.get('accuracy_score', 0.0):.2f}"
                )
                print(
                    f"   🎯 Translations Found: {len(translation_analysis.get('translations_found', []))}"
                )

            except Exception as e:
                print(f"   ❌ {test_case['context']} FAILED: {e}")
                translation_results.append(
                    {"test_case": test_case, "error": str(e), "status": "FAILED"}
                )

        return {
            "translation_tests": translation_results,
            "average_accuracy": sum(
                r.get("accuracy_score", 0) for r in translation_results
            )
            / len(translation_results),
            "translation_success_rate": len(
                [r for r in translation_results if r.get("status") == "PASSED"]
            )
            / len(translation_results),
        }

    def analyze_skills_translation(
        self, response: Dict[str, Any], test_case: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze quality and accuracy of skills translation"""
        analysis = {
            "accurate": True,
            "accuracy_score": 0.0,
            "translations_found": [],
            "issues": [],
        }

        content = response.get("content", "").lower()

        # Check for expected translations
        expected_translations = test_case["expected_translations"]
        translations_found = []

        for expected in expected_translations:
            # Check for exact match or close variations
            if expected.lower() in content:
                translations_found.append(expected)
            else:
                # Check for keyword matches
                keywords = expected.lower().split()
                if all(keyword in content for keyword in keywords):
                    translations_found.append(expected)

        analysis["translations_found"] = translations_found

        # Check for input skills mention
        input_skills = test_case["input_skills"]
        input_skills_mentioned = sum(
            1 for skill in input_skills if skill.lower() in content
        )

        # Check for positive framing
        positive_indicators = [
            "translate",
            "transfer",
            "valuable",
            "relevant",
            "apply",
            "useful",
        ]
        positive_framing = any(
            indicator in content for indicator in positive_indicators
        )

        # Calculate accuracy score
        translation_coverage = len(translations_found) / len(expected_translations)
        input_recognition = input_skills_mentioned / len(input_skills)
        positive_score = 1.0 if positive_framing else 0.0

        # Check for specific examples
        example_indicators = ["example", "such as", "like", "including", "for instance"]
        has_examples = any(indicator in content for indicator in example_indicators)
        example_score = 1.0 if has_examples else 0.5

        # Overall accuracy score
        analysis["accuracy_score"] = (
            translation_coverage + input_recognition + positive_score + example_score
        ) / 4

        if analysis["accuracy_score"] < 0.6:
            analysis["accurate"] = False
            analysis["issues"].append(
                f"Low accuracy score: {analysis['accuracy_score']:.2f}"
            )

        if len(translations_found) == 0:
            analysis["accurate"] = False
            analysis["issues"].append("No expected translations found")

        return analysis

    async def test_job_recommendation_quality(self) -> Dict[str, Any]:
        """Test quality and relevance of job recommendations"""
        print("\n" + "=" * 60)
        print("💼 JOB RECOMMENDATION QUALITY TESTS")
        print("=" * 60)

        job_test_scenarios = [
            {
                "background": "Project Manager with 5 years experience",
                "location": "Massachusetts",
                "query": "Find me project management jobs in renewable energy",
                "expected_elements": [
                    "job titles",
                    "companies",
                    "salary ranges",
                    "locations",
                    "requirements",
                ],
                "quality_criteria": [
                    "relevance",
                    "specificity",
                    "actionability",
                    "completeness",
                ],
            },
            {
                "background": "Recent engineering graduate",
                "location": "Boston area",
                "query": "What entry-level clean energy jobs are available for new engineers?",
                "expected_elements": [
                    "entry-level positions",
                    "training opportunities",
                    "career growth",
                ],
                "quality_criteria": [
                    "entry-level focus",
                    "development opportunities",
                    "realistic expectations",
                ],
            },
            {
                "background": "Career changer from finance",
                "location": "Western Massachusetts",
                "query": "How can I transition from finance to sustainable investing?",
                "expected_elements": [
                    "transition pathways",
                    "relevant positions",
                    "skill transferability",
                ],
                "quality_criteria": [
                    "transition guidance",
                    "skill acknowledgment",
                    "pathway clarity",
                ],
            },
        ]

        job_recommendation_results = []

        for scenario in job_test_scenarios:
            print(f"\n💼 Testing: {scenario['background']}")

            try:
                response = await self.supervisor.handle_message(
                    message=scenario["query"],
                    user_id=TEST_USER_ID,
                    conversation_id=f"job_test_{scenario['background'].replace(' ', '_').lower()}",
                )

                # Analyze job recommendation quality
                quality_analysis = self.analyze_job_recommendation_quality(
                    response, scenario
                )

                result = {
                    "scenario": scenario,
                    "response": response,
                    "analysis": quality_analysis,
                    "quality_score": quality_analysis.get("quality_score", 0.0),
                    "status": (
                        "PASSED"
                        if quality_analysis.get("high_quality", False)
                        else "FAILED"
                    ),
                }

                job_recommendation_results.append(result)

                print(
                    f"   ✅ Quality Score: {quality_analysis.get('quality_score', 0.0):.2f}"
                )
                print(
                    f"   🎯 Elements Found: {len(quality_analysis.get('elements_found', []))}"
                )

            except Exception as e:
                print(f"   ❌ {scenario['background']} FAILED: {e}")
                job_recommendation_results.append(
                    {"scenario": scenario, "error": str(e), "status": "FAILED"}
                )

        return {
            "job_recommendation_tests": job_recommendation_results,
            "average_quality": sum(
                r.get("quality_score", 0) for r in job_recommendation_results
            )
            / len(job_recommendation_results),
            "recommendation_success_rate": len(
                [r for r in job_recommendation_results if r.get("status") == "PASSED"]
            )
            / len(job_recommendation_results),
        }

    def analyze_job_recommendation_quality(
        self, response: Dict[str, Any], scenario: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze quality of job recommendations"""
        analysis = {
            "high_quality": True,
            "quality_score": 0.0,
            "elements_found": [],
            "issues": [],
        }

        content = response.get("content", "").lower()

        # Check for expected elements
        expected_elements = scenario["expected_elements"]
        elements_found = []

        element_indicators = {
            "job titles": [
                "manager",
                "coordinator",
                "analyst",
                "specialist",
                "engineer",
            ],
            "companies": [
                "company",
                "organization",
                "employer",
                "sunrun",
                "tesla",
                "nexamp",
            ],
            "salary ranges": ["$", "salary", "compensation", "k", "000"],
            "locations": [
                "massachusetts",
                "boston",
                "cambridge",
                "springfield",
                "lowell",
            ],
            "requirements": ["requirement", "qualification", "experience", "degree"],
            "entry-level positions": [
                "entry",
                "junior",
                "associate",
                "trainee",
                "recent graduate",
            ],
            "training opportunities": [
                "training",
                "certification",
                "program",
                "course",
            ],
            "career growth": ["growth", "advancement", "promotion", "senior", "lead"],
            "transition pathways": ["pathway", "transition", "step", "move", "change"],
            "skill transferability": [
                "transfer",
                "translate",
                "relevant",
                "applicable",
            ],
        }

        for element in expected_elements:
            if element in element_indicators:
                indicators = element_indicators[element]
                if any(indicator in content for indicator in indicators):
                    elements_found.append(element)

        analysis["elements_found"] = elements_found

        # Quality criteria scoring
        quality_criteria = scenario["quality_criteria"]
        criteria_met = 0

        for criterion in quality_criteria:
            if criterion == "relevance" and any(
                word in content
                for word in ["clean energy", "renewable", "climate", "solar", "wind"]
            ):
                criteria_met += 1
            elif criterion == "specificity" and (
                len(content) > 300
                and ("specific" in content or "particular" in content)
            ):
                criteria_met += 1
            elif criterion == "actionability" and any(
                word in content for word in ["apply", "contact", "visit", "next step"]
            ):
                criteria_met += 1
            elif criterion == "completeness" and len(content) > 200:
                criteria_met += 1
            # Add more criteria as needed

        # Calculate quality score
        element_coverage = len(elements_found) / len(expected_elements)
        criteria_score = criteria_met / len(quality_criteria)

        # Check for Massachusetts-specific content
        ma_relevance = (
            1.0
            if any(
                location in content
                for location in ["massachusetts", "boston", "cambridge"]
            )
            else 0.5
        )

        # Overall quality score
        analysis["quality_score"] = (
            element_coverage + criteria_score + ma_relevance
        ) / 3

        if analysis["quality_score"] < 0.7:
            analysis["high_quality"] = False
            analysis["issues"].append(
                f"Low quality score: {analysis['quality_score']:.2f}"
            )

        return analysis

    async def run_comprehensive_workflow_tests(self):
        """Run all comprehensive workflow tests"""
        print("🧪 Starting Enhanced Comprehensive Workflow Testing")
        print("=" * 70)

        test_start_time = time.time()

        # Run all test suites
        routing_results = await self.test_frontend_backend_message_routing()
        tool_results = await self.test_tool_call_workflows()
        persona_results = await self.test_persona_consistency_and_quality()
        skills_results = await self.test_skills_translation_accuracy()
        job_results = await self.test_job_recommendation_quality()

        test_end_time = time.time()
        total_test_time = test_end_time - test_start_time

        # Generate comprehensive report
        final_results = {
            "test_execution": {
                "start_time": test_start_time,
                "end_time": test_end_time,
                "total_duration": total_test_time,
                "timestamp": datetime.now().isoformat(),
            },
            "test_suites": {
                "frontend_backend_routing": routing_results,
                "tool_call_workflows": tool_results,
                "persona_consistency": persona_results,
                "skills_translation": skills_results,
                "job_recommendations": job_results,
            },
            "overall_metrics": {
                "routing_success_rate": routing_results.get(
                    "overall_success_rate", 0.0
                ),
                "tool_success_rate": tool_results.get("tool_success_rate", 0.0),
                "persona_success_rate": persona_results.get(
                    "persona_success_rate", 0.0
                ),
                "translation_success_rate": skills_results.get(
                    "translation_success_rate", 0.0
                ),
                "recommendation_success_rate": job_results.get(
                    "recommendation_success_rate", 0.0
                ),
            },
        }

        # Calculate overall system health score
        success_rates = [
            final_results["overall_metrics"]["routing_success_rate"],
            final_results["overall_metrics"]["tool_success_rate"],
            final_results["overall_metrics"]["persona_success_rate"],
            final_results["overall_metrics"]["translation_success_rate"],
            final_results["overall_metrics"]["recommendation_success_rate"],
        ]

        overall_system_health = sum(success_rates) / len(success_rates)
        final_results["system_health_score"] = overall_system_health

        # Print comprehensive summary
        self.print_comprehensive_summary(final_results)

        # Save results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        results_filename = f"enhanced_workflow_test_results_{timestamp}.json"

        with open(results_filename, "w") as f:
            json.dump(final_results, f, indent=2, default=str)

        print(f"\n💾 Results saved to: {results_filename}")

        return final_results

    def print_comprehensive_summary(self, results: Dict[str, Any]):
        """Print comprehensive test summary"""
        print("\n" + "=" * 70)
        print("📊 ENHANCED COMPREHENSIVE WORKFLOW TEST RESULTS")
        print("=" * 70)

        metrics = results["overall_metrics"]

        print(
            f"\n🔄 Frontend ↔ Backend Routing: {metrics['routing_success_rate']*100:.1f}%"
        )
        print(f"🛠️ Tool Call Workflows: {metrics['tool_success_rate']*100:.1f}%")
        print(f"🎭 Persona Consistency: {metrics['persona_success_rate']*100:.1f}%")
        print(f"🎯 Skills Translation: {metrics['translation_success_rate']*100:.1f}%")
        print(
            f"💼 Job Recommendations: {metrics['recommendation_success_rate']*100:.1f}%"
        )

        print(f"\n🏥 Overall System Health: {results['system_health_score']*100:.1f}%")

        # Performance metrics
        execution = results["test_execution"]
        print(f"⏱️ Total Test Duration: {execution['total_duration']:.2f} seconds")

        # Health assessment
        health_score = results["system_health_score"]
        if health_score >= 0.9:
            print("✅ System Status: EXCELLENT - Ready for production")
        elif health_score >= 0.8:
            print("✅ System Status: GOOD - Minor improvements needed")
        elif health_score >= 0.7:
            print("⚠️ System Status: FAIR - Significant improvements needed")
        else:
            print("❌ System Status: POOR - Major issues require immediate attention")


# Test runner
async def main():
    """Main test execution function"""
    tester = EnhancedWorkflowTester()
    await tester.initialize()
    results = await tester.run_comprehensive_workflow_tests()
    return results


if __name__ == "__main__":
    asyncio.run(main())
