#!/usr/bin/env python3
"""
Exceptional Agent Testing Suite
===============================

Advanced testing framework to evaluate agent intelligence, reasoning, decision-making,
supervisor routing logic, MA climate ecosystem understanding, EJ challenges awareness,
tool selection intelligence, and response quality.

This suite goes beyond basic functionality to test:
- Cognitive reasoning patterns
- Contextual decision-making
- Domain expertise depth
- Tool selection intelligence
- Response quality and relevance
- Supervisor routing sophistication
- MA climate ecosystem knowledge
- Environmental justice understanding
"""

import asyncio
import json
import os
import re
import sys
from datetime import datetime
from typing import Any, Dict, List, Optional

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase import Client, create_client

from core.agents.base import SupervisorAgent
from core.agents.environmental import EnvironmentalJusticeSpecialist
from core.agents.international import InternationalSpecialist
from core.agents.ma_resource_analyst import MAResourceAnalystAgent
from core.agents.veteran import VeteranSpecialist
from core.config import get_settings

# Test user ID
TEST_USER_ID = "30eedd6a-0771-444e-90d2-7520c1eb03f0"


class ExceptionalAgentTester:
    """
    Exceptional testing framework for deep agent intelligence evaluation
    """

    def __init__(self):
        self.supabase = None
        self.test_results = {}
        self.reasoning_patterns = {}
        self.decision_quality_scores = {}

    async def initialize(self):
        """Initialize testing environment"""
        print("🧠 Initializing Exceptional Agent Intelligence Testing...")
        print("=" * 80)

        # Use our fixed Supabase adapter instead of direct create_client
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

        print("✅ Advanced testing environment ready")
        print("🎯 Focus: Cognitive reasoning, decision-making, domain expertise")

    async def test_supervisor_routing_intelligence(self) -> Dict[str, Any]:
        """
        Test supervisor's routing intelligence with complex, ambiguous scenarios
        """
        print("\n" + "=" * 60)
        print("🧭 SUPERVISOR ROUTING INTELLIGENCE ANALYSIS")
        print("=" * 60)

        supervisor = SupervisorAgent()
        routing_tests = []

        # Complex routing scenarios that test reasoning depth
        complex_scenarios = [
            {
                "query": "I'm a former Navy nuclear engineer who immigrated from Germany 5 years ago. I want to work on offshore wind projects in environmental justice communities while helping other veterans transition to clean energy careers.",
                "expected_complexity": "multi_specialist",
                "reasoning_test": "Should recognize multiple overlapping identities and route appropriately",
            },
            {
                "query": "My community in Chelsea has high asthma rates from pollution. I have a business degree and want to start a solar company that prioritizes hiring local residents. How do I navigate the regulatory environment?",
                "expected_complexity": "environmental_justice_primary",
                "reasoning_test": "Should prioritize EJ focus while recognizing business/regulatory needs",
            },
            {
                "query": "I'm transitioning from fossil fuel industry (oil rig supervisor) to renewable energy. I feel guilty about my past work and want to make amends through climate action.",
                "expected_complexity": "psychological_awareness",
                "reasoning_test": "Should recognize emotional/psychological aspects of career transition",
            },
            {
                "query": "My daughter is studying environmental science at UMass Lowell. I'm a single mother working two jobs in Fall River. I want to get into clean energy but need flexible training that pays during the program.",
                "expected_complexity": "socioeconomic_barriers",
                "reasoning_test": "Should recognize financial constraints and geographic/family considerations",
            },
            {
                "query": "I have PTSD from military service and find it hard to work in traditional office environments. Are there outdoor clean energy jobs that would be good for veterans with mental health challenges?",
                "expected_complexity": "accessibility_awareness",
                "reasoning_test": "Should recognize disability accommodation needs within veteran context",
            },
        ]

        for scenario in complex_scenarios:
            print(f"\n🧪 Testing Complex Scenario:")
            print(f"   Query: {scenario['query'][:100]}...")

            start_time = datetime.now()

            try:
                response = await supervisor.handle_message(
                    message=scenario["query"],
                    user_id=TEST_USER_ID,
                    conversation_id=f"routing_test_{datetime.now().strftime('%H%M%S')}",
                )

                end_time = datetime.now()
                response_time = (end_time - start_time).total_seconds()

                # Analyze routing intelligence
                routing_analysis = self.analyze_routing_intelligence(response, scenario)

                test_result = {
                    "scenario": scenario,
                    "response": response,
                    "response_time": response_time,
                    "routing_analysis": routing_analysis,
                    "intelligence_score": routing_analysis["intelligence_score"],
                }

                routing_tests.append(test_result)

                print(f"   ✅ Completed - {response_time:.2f}s")
                print(
                    f"   🧠 Intelligence Score: {routing_analysis['intelligence_score']}/10"
                )
                print(f"   🎯 Routing Decision: {routing_analysis['routing_decision']}")
                print(
                    f"   💭 Reasoning Quality: {routing_analysis['reasoning_quality']}"
                )

            except Exception as e:
                print(f"   ❌ Error: {e}")
                routing_tests.append(
                    {"scenario": scenario, "error": str(e), "intelligence_score": 0}
                )

        # Calculate overall routing intelligence
        avg_intelligence = sum(
            test.get("intelligence_score", 0) for test in routing_tests
        ) / len(routing_tests)

        return {
            "routing_tests": routing_tests,
            "overall_intelligence_score": avg_intelligence,
            "complexity_handling": self.assess_complexity_handling(routing_tests),
        }

    def analyze_routing_intelligence(
        self, response: Dict[str, Any], scenario: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze the intelligence and sophistication of routing decisions
        """
        content = response.get("content", "").lower()
        metadata = response.get("metadata", {})

        intelligence_indicators = {
            "multi_identity_recognition": 0,
            "contextual_awareness": 0,
            "emotional_intelligence": 0,
            "barrier_recognition": 0,
            "solution_orientation": 0,
            "specialist_matching": 0,
        }

        # Multi-identity recognition
        identity_keywords = [
            "veteran",
            "international",
            "immigrant",
            "community",
            "environmental justice",
            "ej",
        ]
        identity_count = sum(1 for keyword in identity_keywords if keyword in content)
        intelligence_indicators["multi_identity_recognition"] = min(
            identity_count * 2, 10
        )

        # Contextual awareness
        context_indicators = [
            "gateway cities",
            "massachusetts",
            "barriers",
            "challenges",
            "support",
            "wraparound",
        ]
        context_score = sum(
            2 for indicator in context_indicators if indicator in content
        )
        intelligence_indicators["contextual_awareness"] = min(context_score, 10)

        # Emotional intelligence
        emotional_keywords = [
            "understand",
            "feel",
            "experience",
            "transition",
            "support",
            "guidance",
        ]
        emotional_score = sum(
            1.5 for keyword in emotional_keywords if keyword in content
        )
        intelligence_indicators["emotional_intelligence"] = min(emotional_score, 10)

        # Barrier recognition
        barrier_keywords = [
            "financial",
            "transportation",
            "childcare",
            "language",
            "credential",
            "accessibility",
        ]
        barrier_score = sum(2 for barrier in barrier_keywords if barrier in content)
        intelligence_indicators["barrier_recognition"] = min(barrier_score, 10)

        # Solution orientation
        solution_indicators = [
            "pathway",
            "program",
            "training",
            "opportunity",
            "connect",
            "next steps",
        ]
        solution_score = sum(
            1.5 for indicator in solution_indicators if indicator in content
        )
        intelligence_indicators["solution_orientation"] = min(solution_score, 10)

        # Specialist matching appropriateness
        routing_decision = "general"
        if "marcus" in content or "veteran" in content:
            routing_decision = "veteran_specialist"
        elif "liv" in content or "international" in content:
            routing_decision = "international_specialist"
        elif "miguel" in content or "environmental justice" in content:
            routing_decision = "environmental_justice_specialist"
        elif "jasmine" in content or "resume" in content:
            routing_decision = "jasmine_ma_resource_analyst"

        # Calculate overall intelligence score
        overall_score = sum(intelligence_indicators.values()) / len(
            intelligence_indicators
        )

        return {
            "intelligence_score": round(overall_score, 1),
            "routing_decision": routing_decision,
            "reasoning_quality": (
                "high"
                if overall_score >= 7
                else "medium" if overall_score >= 4 else "low"
            ),
            "intelligence_breakdown": intelligence_indicators,
            "demonstrates_understanding": overall_score >= 6,
        }

    async def test_ma_climate_ecosystem_knowledge(self) -> Dict[str, Any]:
        """
        Test deep understanding of Massachusetts climate ecosystem
        """
        print("\n" + "=" * 60)
        print("🌍 MA CLIMATE ECOSYSTEM KNOWLEDGE DEPTH TEST")
        print("=" * 60)

        ecosystem_tests = []

        # Test all agents with MA-specific climate ecosystem questions
        agents = {
            "supervisor": SupervisorAgent(),
            "jasmine": MAResourceAnalystAgent(),
            "marcus": VeteranSpecialist(),
            "liv": InternationalSpecialist(),
            "miguel": EnvironmentalJusticeSpecialist(),
        }

        ecosystem_questions = [
            {
                "question": "How does the Green Communities Act impact clean energy job creation in Gateway Cities specifically?",
                "knowledge_areas": ["policy", "gateway_cities", "job_creation"],
                "depth_level": "advanced",
            },
            {
                "question": "What role does the Massachusetts Clean Energy Center play in workforce development for offshore wind in New Bedford?",
                "knowledge_areas": [
                    "institutions",
                    "offshore_wind",
                    "workforce_development",
                ],
                "depth_level": "expert",
            },
            {
                "question": "How do environmental justice requirements in the 2021 Climate Act affect clean energy project siting in Chelsea and Roxbury?",
                "knowledge_areas": [
                    "environmental_justice",
                    "policy",
                    "community_impact",
                ],
                "depth_level": "expert",
            },
            {
                "question": "What are the specific challenges and opportunities for clean energy careers in the three Gateway Cities?",
                "knowledge_areas": [
                    "gateway_cities",
                    "local_economy",
                    "career_pathways",
                ],
                "depth_level": "intermediate",
            },
        ]

        for agent_name, agent in agents.items():
            print(f"\n🧪 Testing {agent_name.upper()} - MA Climate Ecosystem Knowledge")

            agent_results = []

            for question_data in ecosystem_questions:
                question = question_data["question"]
                print(f"   📋 {question[:80]}...")

                try:
                    response = await agent.handle_message(
                        message=question,
                        user_id=TEST_USER_ID,
                        conversation_id=f"ecosystem_test_{agent_name}_{datetime.now().strftime('%H%M%S')}",
                    )

                    knowledge_analysis = self.analyze_ecosystem_knowledge(
                        response, question_data
                    )

                    agent_results.append(
                        {
                            "question": question_data,
                            "response": response,
                            "knowledge_analysis": knowledge_analysis,
                        }
                    )

                    print(
                        f"      🧠 Knowledge Depth: {knowledge_analysis['depth_score']}/10"
                    )
                    print(
                        f"      🎯 Accuracy: {knowledge_analysis['accuracy_score']}/10"
                    )
                    print(
                        f"      📚 Specificity: {knowledge_analysis['specificity_score']}/10"
                    )

                except Exception as e:
                    print(f"      ❌ Error: {e}")
                    agent_results.append(
                        {
                            "question": question_data,
                            "error": str(e),
                            "knowledge_analysis": {
                                "depth_score": 0,
                                "accuracy_score": 0,
                                "specificity_score": 0,
                            },
                        }
                    )

            ecosystem_tests.append(
                {
                    "agent": agent_name,
                    "results": agent_results,
                    "overall_knowledge_score": self.calculate_knowledge_score(
                        agent_results
                    ),
                }
            )

        return {
            "ecosystem_tests": ecosystem_tests,
            "knowledge_rankings": self.rank_ecosystem_knowledge(ecosystem_tests),
        }

    def analyze_ecosystem_knowledge(
        self, response: Dict[str, Any], question_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze depth and accuracy of MA climate ecosystem knowledge
        """
        content = response.get("content", "").lower()

        # Knowledge depth indicators
        depth_indicators = {
            "policy": [
                "green communities act",
                "climate act",
                "2021",
                "environmental justice",
                "net zero",
                "gwsa",
            ],
            "institutions": [
                "mass clean energy center",
                "masscec",
                "mass cec",
                "doer",
                "eea",
                "masshire",
            ],
            "gateway_cities": [
                "brockton",
                "fall river",
                "new bedford",
                "lowell",
                "lawrence",
            ],
            "offshore_wind": [
                "vineyard wind",
                "commonwealth wind",
                "southcoast wind",
                "jones act",
                "port",
            ],
            "environmental_justice": [
                "ej communities",
                "frontline",
                "overburdened",
                "cumulative impact",
                "equity",
            ],
            "workforce_development": [
                "apprenticeship",
                "ibew",
                "training",
                "certification",
                "pathway",
            ],
        }

        # Calculate depth score
        depth_score = 0
        for area, keywords in depth_indicators.items():
            if area in question_data["knowledge_areas"]:
                area_score = sum(2 for keyword in keywords if keyword in content)
                depth_score += min(area_score, 10)

        depth_score = min(depth_score / len(question_data["knowledge_areas"]), 10)

        # Accuracy indicators (specific facts and figures)
        accuracy_indicators = [
            "38,100",
            "2030",
            "gateway cities",
            "massachusetts",
            "clean energy center",
            "environmental justice",
            "offshore wind",
            "commonwealth",
            "new bedford",
        ]

        accuracy_score = sum(
            1.5 for indicator in accuracy_indicators if indicator in content
        )
        accuracy_score = min(accuracy_score, 10)

        # Specificity score (detailed, actionable information)
        specificity_indicators = [
            "contact",
            "phone",
            "website",
            "address",
            "program name",
            "deadline",
            "requirement",
            "eligibility",
            "application",
            "next step",
        ]

        specificity_score = sum(
            1 for indicator in specificity_indicators if indicator in content
        )
        specificity_score = min(specificity_score, 10)

        return {
            "depth_score": round(depth_score, 1),
            "accuracy_score": round(accuracy_score, 1),
            "specificity_score": round(specificity_score, 1),
            "overall_knowledge": round(
                (depth_score + accuracy_score + specificity_score) / 3, 1
            ),
        }

    async def test_environmental_justice_understanding(self) -> Dict[str, Any]:
        """
        Test deep understanding of environmental justice challenges and solutions
        """
        print("\n" + "=" * 60)
        print("⚖️ ENVIRONMENTAL JUSTICE UNDERSTANDING DEPTH TEST")
        print("=" * 60)

        ej_specialist = EnvironmentalJusticeSpecialist()

        # Complex EJ scenarios that test understanding depth
        ej_scenarios = [
            {
                "scenario": "A Latina single mother in Chelsea works two jobs and has a child with asthma. She wants to get into clean energy but needs training that provides income during the program and addresses transportation barriers.",
                "complexity_areas": [
                    "intersectionality",
                    "economic_barriers",
                    "health_impacts",
                    "accessibility",
                ],
                "expected_understanding": "Should recognize multiple intersecting barriers and provide comprehensive solutions",
            },
            {
                "scenario": "The Roxbury community is concerned about a proposed solar farm that might lead to gentrification and displacement. How can clean energy development benefit the community without causing harm?",
                "complexity_areas": [
                    "gentrification",
                    "community_benefits",
                    "anti_displacement",
                    "participatory_planning",
                ],
                "expected_understanding": "Should understand gentrification risks and community-controlled development",
            },
            {
                "scenario": "A community organizer in Lawrence wants to ensure that offshore wind jobs go to local residents, not just suburban commuters. What strategies can ensure local hiring and prevent economic colonialism?",
                "complexity_areas": [
                    "local_hiring",
                    "economic_justice",
                    "community_ownership",
                    "anti_colonialism",
                ],
                "expected_understanding": "Should recognize economic colonialism patterns and community ownership solutions",
            },
        ]

        ej_results = []

        for scenario_data in ej_scenarios:
            print(f"\n🧪 Testing EJ Scenario:")
            print(f"   Scenario: {scenario_data['scenario'][:100]}...")

            try:
                response = await ej_specialist.handle_message(
                    message=scenario_data["scenario"],
                    user_id=TEST_USER_ID,
                    conversation_id=f"ej_test_{datetime.now().strftime('%H%M%S')}",
                )

                ej_analysis = self.analyze_ej_understanding(response, scenario_data)

                ej_results.append(
                    {
                        "scenario": scenario_data,
                        "response": response,
                        "ej_analysis": ej_analysis,
                    }
                )

                print(
                    f"   ⚖️ EJ Understanding: {ej_analysis['ej_understanding_score']}/10"
                )
                print(
                    f"   🤝 Intersectionality: {ej_analysis['intersectionality_score']}/10"
                )
                print(
                    f"   💡 Solution Quality: {ej_analysis['solution_quality_score']}/10"
                )

            except Exception as e:
                print(f"   ❌ Error: {e}")
                ej_results.append(
                    {
                        "scenario": scenario_data,
                        "error": str(e),
                        "ej_analysis": {"ej_understanding_score": 0},
                    }
                )

        return {
            "ej_results": ej_results,
            "overall_ej_competency": self.calculate_ej_competency(ej_results),
        }

    def analyze_ej_understanding(
        self, response: Dict[str, Any], scenario_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze depth of environmental justice understanding
        """
        content = response.get("content", "").lower()

        # EJ understanding indicators
        ej_concepts = [
            "intersectionality",
            "systemic",
            "structural",
            "cumulative impact",
            "frontline",
            "community-led",
            "participatory",
            "anti-displacement",
            "gentrification",
            "economic justice",
            "community ownership",
            "local hiring",
            "benefits agreement",
        ]

        ej_understanding_score = sum(1 for concept in ej_concepts if concept in content)
        ej_understanding_score = min(ej_understanding_score * 0.8, 10)

        # Intersectionality recognition
        intersectional_indicators = [
            "race",
            "class",
            "gender",
            "immigration",
            "language",
            "disability",
            "multiple barriers",
            "overlapping",
            "compound",
            "intersecting",
        ]

        intersectionality_score = sum(
            1.5 for indicator in intersectional_indicators if indicator in content
        )
        intersectionality_score = min(intersectionality_score, 10)

        # Solution quality (community-centered, systemic)
        solution_quality_indicators = [
            "community control",
            "resident ownership",
            "local hiring",
            "benefits agreement",
            "anti-displacement",
            "wraparound services",
            "holistic",
            "systemic change",
        ]

        solution_quality_score = sum(
            1.2 for indicator in solution_quality_indicators if indicator in content
        )
        solution_quality_score = min(solution_quality_score, 10)

        return {
            "ej_understanding_score": round(ej_understanding_score, 1),
            "intersectionality_score": round(intersectionality_score, 1),
            "solution_quality_score": round(solution_quality_score, 1),
            "demonstrates_ej_competency": ej_understanding_score >= 6
            and intersectionality_score >= 5,
        }

    async def test_tool_selection_intelligence(self) -> Dict[str, Any]:
        """
        Test intelligent tool selection and reasoning
        """
        print("\n" + "=" * 60)
        print("🔧 TOOL SELECTION INTELLIGENCE TEST")
        print("=" * 60)

        # Test scenarios that require intelligent tool selection
        tool_scenarios = [
            {
                "query": "I need to understand what clean energy jobs are available for someone with my background",
                "optimal_tools": [
                    "resume_analysis",
                    "skills_gap_analysis",
                    "job_matching",
                ],
                "reasoning": "Should analyze user background first, then match to opportunities",
            },
            {
                "query": "What training programs exist for offshore wind technicians in Massachusetts?",
                "optimal_tools": [
                    "training_search",
                    "geographic_filtering",
                    "industry_specific",
                ],
                "reasoning": "Should search training programs with geographic and industry filters",
            },
            {
                "query": "How can I translate my military logistics experience to clean energy project management?",
                "optimal_tools": [
                    "skill_translation",
                    "career_pathway_mapping",
                    "veteran_programs",
                ],
                "reasoning": "Should translate skills first, then map career pathways",
            },
        ]

        agents = {
            "jasmine": MAResourceAnalystAgent(),
            "marcus": VeteranSpecialist(),
            "liv": InternationalSpecialist(),
            "miguel": EnvironmentalJusticeSpecialist(),
        }

        tool_intelligence_results = []

        for agent_name, agent in agents.items():
            print(f"\n🧪 Testing {agent_name.upper()} - Tool Selection Intelligence")

            agent_tool_results = []

            for scenario in tool_scenarios:
                print(f"   📋 {scenario['query'][:60]}...")

                try:
                    response = await agent.handle_message(
                        message=scenario["query"],
                        user_id=TEST_USER_ID,
                        conversation_id=f"tool_test_{agent_name}_{datetime.now().strftime('%H%M%S')}",
                    )

                    tool_analysis = self.analyze_tool_intelligence(response, scenario)

                    agent_tool_results.append(
                        {
                            "scenario": scenario,
                            "response": response,
                            "tool_analysis": tool_analysis,
                        }
                    )

                    print(
                        f"      🔧 Tool Selection: {tool_analysis['tool_selection_score']}/10"
                    )
                    print(f"      🧠 Reasoning: {tool_analysis['reasoning_quality']}")
                    print(f"      📊 Tools Used: {len(tool_analysis['tools_used'])}")

                except Exception as e:
                    print(f"      ❌ Error: {e}")

            tool_intelligence_results.append(
                {
                    "agent": agent_name,
                    "tool_results": agent_tool_results,
                    "tool_intelligence_score": self.calculate_tool_intelligence_score(
                        agent_tool_results
                    ),
                }
            )

        return {
            "tool_intelligence_results": tool_intelligence_results,
            "tool_selection_rankings": self.rank_tool_intelligence(
                tool_intelligence_results
            ),
        }

    def analyze_tool_intelligence(
        self, response: Dict[str, Any], scenario: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze intelligence of tool selection and usage
        """
        metadata = response.get("metadata", {})
        tools_used = metadata.get("tools_used", [])
        content = response.get("content", "")

        # Tool selection appropriateness
        optimal_tools = scenario.get("optimal_tools", [])
        tool_overlap = len(set(tools_used) & set(optimal_tools))
        tool_selection_score = (tool_overlap / max(len(optimal_tools), 1)) * 10

        # Reasoning quality indicators
        reasoning_indicators = [
            "analysis",
            "assessment",
            "evaluation",
            "based on",
            "considering",
            "taking into account",
            "given your",
            "specific to",
            "tailored",
        ]

        reasoning_score = sum(
            1
            for indicator in reasoning_indicators
            if indicator.lower() in content.lower()
        )
        reasoning_quality = (
            "high"
            if reasoning_score >= 4
            else "medium" if reasoning_score >= 2 else "low"
        )

        return {
            "tool_selection_score": round(tool_selection_score, 1),
            "tools_used": tools_used,
            "reasoning_quality": reasoning_quality,
            "demonstrates_intelligence": tool_selection_score >= 6
            and reasoning_score >= 3,
        }

    async def test_response_quality_and_depth(self) -> Dict[str, Any]:
        """
        Test overall response quality, depth, and usefulness
        """
        print("\n" + "=" * 60)
        print("📊 RESPONSE QUALITY & DEPTH ANALYSIS")
        print("=" * 60)

        # Quality test scenarios
        quality_scenarios = [
            {
                "query": "I'm overwhelmed by all the clean energy career options. Can you help me create a clear, step-by-step plan?",
                "quality_criteria": [
                    "clarity",
                    "actionability",
                    "step_by_step",
                    "personalization",
                    "encouragement",
                ],
            },
            {
                "query": "What are the real barriers to getting clean energy jobs in Gateway Cities, and how can they be overcome?",
                "quality_criteria": [
                    "honesty",
                    "barrier_recognition",
                    "solutions",
                    "specificity",
                    "realism",
                ],
            },
            {
                "query": "I want to make sure my clean energy career contributes to environmental justice. What should I know?",
                "quality_criteria": [
                    "ej_awareness",
                    "ethical_guidance",
                    "community_focus",
                    "systemic_thinking",
                    "actionable_steps",
                ],
            },
        ]

        agents = {
            "supervisor": SupervisorAgent(),
            "jasmine": MAResourceAnalystAgent(),
            "marcus": VeteranSpecialist(),
            "liv": InternationalSpecialist(),
            "miguel": EnvironmentalJusticeSpecialist(),
        }

        quality_results = []

        for agent_name, agent in agents.items():
            print(f"\n🧪 Testing {agent_name.upper()} - Response Quality")

            agent_quality_results = []

            for scenario in quality_scenarios:
                print(f"   📋 {scenario['query'][:60]}...")

                try:
                    response = await agent.handle_message(
                        message=scenario["query"],
                        user_id=TEST_USER_ID,
                        conversation_id=f"quality_test_{agent_name}_{datetime.now().strftime('%H%M%S')}",
                    )

                    quality_analysis = self.analyze_response_quality(response, scenario)

                    agent_quality_results.append(
                        {
                            "scenario": scenario,
                            "response": response,
                            "quality_analysis": quality_analysis,
                        }
                    )

                    print(
                        f"      📊 Overall Quality: {quality_analysis['overall_quality_score']}/10"
                    )
                    print(
                        f"      🎯 Usefulness: {quality_analysis['usefulness_score']}/10"
                    )
                    print(f"      💡 Depth: {quality_analysis['depth_score']}/10")

                except Exception as e:
                    print(f"      ❌ Error: {e}")

            quality_results.append(
                {
                    "agent": agent_name,
                    "quality_results": agent_quality_results,
                    "overall_quality_score": self.calculate_overall_quality_score(
                        agent_quality_results
                    ),
                }
            )

        return {
            "quality_results": quality_results,
            "quality_rankings": self.rank_response_quality(quality_results),
        }

    def analyze_response_quality(
        self, response: Dict[str, Any], scenario: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Analyze overall response quality and usefulness
        """
        content = response.get("content", "")

        # Quality indicators
        quality_indicators = {
            "clarity": [
                "clear",
                "step",
                "first",
                "next",
                "then",
                "specific",
                "exactly",
            ],
            "actionability": [
                "contact",
                "apply",
                "enroll",
                "visit",
                "call",
                "email",
                "website",
            ],
            "personalization": [
                "your",
                "you",
                "based on",
                "given",
                "specific to",
                "tailored",
            ],
            "depth": [
                "because",
                "due to",
                "research shows",
                "studies indicate",
                "evidence",
            ],
            "encouragement": [
                "can",
                "will",
                "able",
                "possible",
                "opportunity",
                "potential",
                "success",
            ],
        }

        quality_scores = {}
        for criterion, keywords in quality_indicators.items():
            score = sum(
                0.5 for keyword in keywords if keyword.lower() in content.lower()
            )
            quality_scores[criterion] = min(score, 10)

        # Calculate specific criteria scores
        criteria_scores = {}
        for criterion in scenario["quality_criteria"]:
            if criterion in quality_scores:
                criteria_scores[criterion] = quality_scores[criterion]
            else:
                # Handle special criteria
                if criterion == "ej_awareness":
                    ej_keywords = [
                        "environmental justice",
                        "community",
                        "equity",
                        "frontline",
                        "overburdened",
                    ]
                    criteria_scores[criterion] = min(
                        sum(2 for kw in ej_keywords if kw in content.lower()), 10
                    )
                elif criterion == "barrier_recognition":
                    barrier_keywords = [
                        "barrier",
                        "challenge",
                        "difficulty",
                        "obstacle",
                        "constraint",
                    ]
                    criteria_scores[criterion] = min(
                        sum(2 for kw in barrier_keywords if kw in content.lower()), 10
                    )
                else:
                    criteria_scores[criterion] = 5  # Default score

        # Overall scores
        overall_quality_score = sum(criteria_scores.values()) / len(criteria_scores)
        usefulness_score = (
            quality_scores.get("actionability", 0) + quality_scores.get("clarity", 0)
        ) / 2
        depth_score = quality_scores.get("depth", 0)

        return {
            "overall_quality_score": round(overall_quality_score, 1),
            "usefulness_score": round(usefulness_score, 1),
            "depth_score": round(depth_score, 1),
            "criteria_scores": criteria_scores,
            "demonstrates_excellence": overall_quality_score >= 7,
        }

    # Helper methods for calculations and rankings
    def assess_complexity_handling(self, routing_tests: List[Dict]) -> str:
        """Assess how well the supervisor handles complex scenarios"""
        high_scores = sum(
            1 for test in routing_tests if test.get("intelligence_score", 0) >= 7
        )
        if high_scores >= len(routing_tests) * 0.8:
            return "excellent"
        elif high_scores >= len(routing_tests) * 0.6:
            return "good"
        else:
            return "needs_improvement"

    def calculate_knowledge_score(self, agent_results: List[Dict]) -> float:
        """Calculate overall knowledge score for an agent"""
        scores = []
        for result in agent_results:
            analysis = result.get("knowledge_analysis", {})
            if "overall_knowledge" in analysis:
                scores.append(analysis["overall_knowledge"])
        return sum(scores) / len(scores) if scores else 0

    def rank_ecosystem_knowledge(self, ecosystem_tests: List[Dict]) -> List[Dict]:
        """Rank agents by ecosystem knowledge"""
        rankings = []
        for test in ecosystem_tests:
            rankings.append(
                {"agent": test["agent"], "score": test["overall_knowledge_score"]}
            )
        return sorted(rankings, key=lambda x: x["score"], reverse=True)

    def calculate_ej_competency(self, ej_results: List[Dict]) -> Dict[str, Any]:
        """Calculate overall EJ competency"""
        scores = []
        for result in ej_results:
            analysis = result.get("ej_analysis", {})
            if "ej_understanding_score" in analysis:
                scores.append(analysis["ej_understanding_score"])

        avg_score = sum(scores) / len(scores) if scores else 0
        competency_level = (
            "expert"
            if avg_score >= 8
            else "proficient" if avg_score >= 6 else "developing"
        )

        return {
            "average_score": round(avg_score, 1),
            "competency_level": competency_level,
            "demonstrates_expertise": avg_score >= 7,
        }

    def calculate_tool_intelligence_score(
        self, agent_tool_results: List[Dict]
    ) -> float:
        """Calculate tool intelligence score for an agent"""
        scores = []
        for result in agent_tool_results:
            analysis = result.get("tool_analysis", {})
            if "tool_selection_score" in analysis:
                scores.append(analysis["tool_selection_score"])
        return sum(scores) / len(scores) if scores else 0

    def rank_tool_intelligence(
        self, tool_intelligence_results: List[Dict]
    ) -> List[Dict]:
        """Rank agents by tool intelligence"""
        rankings = []
        for result in tool_intelligence_results:
            rankings.append(
                {"agent": result["agent"], "score": result["tool_intelligence_score"]}
            )
        return sorted(rankings, key=lambda x: x["score"], reverse=True)

    def calculate_overall_quality_score(
        self, agent_quality_results: List[Dict]
    ) -> float:
        """Calculate overall quality score for an agent"""
        scores = []
        for result in agent_quality_results:
            analysis = result.get("quality_analysis", {})
            if "overall_quality_score" in analysis:
                scores.append(analysis["overall_quality_score"])
        return sum(scores) / len(scores) if scores else 0

    def rank_response_quality(self, quality_results: List[Dict]) -> List[Dict]:
        """Rank agents by response quality"""
        rankings = []
        for result in quality_results:
            rankings.append(
                {"agent": result["agent"], "score": result["overall_quality_score"]}
            )
        return sorted(rankings, key=lambda x: x["score"], reverse=True)

    async def run_exceptional_testing_suite(self):
        """
        Run the complete exceptional testing suite
        """
        print("🚀 EXCEPTIONAL AGENT INTELLIGENCE TESTING SUITE")
        print("=" * 80)
        print(
            "🎯 Testing: Reasoning, Decision-Making, Domain Expertise, Tool Intelligence"
        )
        print(
            "📊 Focus: Supervisor Routing, MA Climate Ecosystem, EJ Understanding, Response Quality"
        )
        print("=" * 80)

        # Initialize
        await self.initialize()

        # Run all test suites
        results = {}

        # 1. Supervisor Routing Intelligence
        results["supervisor_routing"] = (
            await self.test_supervisor_routing_intelligence()
        )

        # 2. MA Climate Ecosystem Knowledge
        results["ecosystem_knowledge"] = (
            await self.test_ma_climate_ecosystem_knowledge()
        )

        # 3. Environmental Justice Understanding
        results["ej_understanding"] = (
            await self.test_environmental_justice_understanding()
        )

        # 4. Tool Selection Intelligence
        results["tool_intelligence"] = await self.test_tool_selection_intelligence()

        # 5. Response Quality and Depth
        results["response_quality"] = await self.test_response_quality_and_depth()

        # Generate comprehensive analysis
        comprehensive_analysis = self.generate_comprehensive_analysis(results)

        # Save results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        results_file = f"exceptional_test_results_{timestamp}.json"

        with open(results_file, "w") as f:
            json.dump(
                {
                    "test_metadata": {
                        "timestamp": datetime.now().isoformat(),
                        "test_type": "exceptional_intelligence_suite",
                        "user_id": TEST_USER_ID,
                    },
                    "results": results,
                    "comprehensive_analysis": comprehensive_analysis,
                },
                f,
                indent=2,
                default=str,
            )

        # Print final summary
        self.print_exceptional_summary(results, comprehensive_analysis)

        print(f"\n📄 Detailed exceptional test results saved to: {results_file}")

        return results

    def generate_comprehensive_analysis(
        self, results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive analysis across all test dimensions
        """
        analysis = {
            "overall_intelligence_ranking": [],
            "strengths_by_agent": {},
            "areas_for_improvement": {},
            "exceptional_capabilities": [],
            "system_recommendations": [],
        }

        # Aggregate scores by agent
        agent_scores = {}

        # Supervisor routing
        supervisor_score = results["supervisor_routing"]["overall_intelligence_score"]
        agent_scores["supervisor"] = {"routing_intelligence": supervisor_score}

        # Ecosystem knowledge
        for test in results["ecosystem_knowledge"]["ecosystem_tests"]:
            agent = test["agent"]
            if agent not in agent_scores:
                agent_scores[agent] = {}
            agent_scores[agent]["ecosystem_knowledge"] = test["overall_knowledge_score"]

        # Tool intelligence
        for test in results["tool_intelligence"]["tool_intelligence_results"]:
            agent = test["agent"]
            if agent not in agent_scores:
                agent_scores[agent] = {}
            agent_scores[agent]["tool_intelligence"] = test["tool_intelligence_score"]

        # Response quality
        for test in results["response_quality"]["quality_results"]:
            agent = test["agent"]
            if agent not in agent_scores:
                agent_scores[agent] = {}
            agent_scores[agent]["response_quality"] = test["overall_quality_score"]

        # Calculate overall scores and rankings
        for agent, scores in agent_scores.items():
            overall_score = sum(scores.values()) / len(scores)
            analysis["overall_intelligence_ranking"].append(
                {
                    "agent": agent,
                    "overall_score": round(overall_score, 1),
                    "dimension_scores": scores,
                }
            )

        # Sort by overall score
        analysis["overall_intelligence_ranking"].sort(
            key=lambda x: x["overall_score"], reverse=True
        )

        # Identify exceptional capabilities
        for agent_data in analysis["overall_intelligence_ranking"]:
            if agent_data["overall_score"] >= 8:
                analysis["exceptional_capabilities"].append(
                    f"{agent_data['agent']} demonstrates exceptional intelligence (score: {agent_data['overall_score']})"
                )

        # EJ competency
        ej_competency = results["ej_understanding"]["overall_ej_competency"]
        if ej_competency["demonstrates_expertise"]:
            analysis["exceptional_capabilities"].append(
                f"Miguel demonstrates expert-level environmental justice competency ({ej_competency['competency_level']})"
            )

        return analysis

    def print_exceptional_summary(
        self, results: Dict[str, Any], analysis: Dict[str, Any]
    ):
        """
        Print comprehensive summary of exceptional testing results
        """
        print("\n" + "=" * 80)
        print("🏆 EXCEPTIONAL AGENT INTELLIGENCE SUMMARY")
        print("=" * 80)

        # Overall Intelligence Rankings
        print("\n🧠 OVERALL INTELLIGENCE RANKINGS:")
        for i, agent_data in enumerate(analysis["overall_intelligence_ranking"], 1):
            agent = agent_data["agent"].upper()
            score = agent_data["overall_score"]
            print(f"   {i}. {agent}: {score}/10")

            # Show dimension breakdown
            for dimension, dim_score in agent_data["dimension_scores"].items():
                print(
                    f"      • {dimension.replace('_', ' ').title()}: {dim_score:.1f}/10"
                )

        # Supervisor Routing Intelligence
        print(f"\n🧭 SUPERVISOR ROUTING INTELLIGENCE:")
        routing_score = results["supervisor_routing"]["overall_intelligence_score"]
        complexity_handling = results["supervisor_routing"]["complexity_handling"]
        print(f"   Intelligence Score: {routing_score:.1f}/10")
        print(f"   Complexity Handling: {complexity_handling.upper()}")

        # MA Climate Ecosystem Knowledge
        print(f"\n🌍 MA CLIMATE ECOSYSTEM KNOWLEDGE RANKINGS:")
        for i, ranking in enumerate(
            results["ecosystem_knowledge"]["knowledge_rankings"], 1
        ):
            print(f"   {i}. {ranking['agent'].upper()}: {ranking['score']:.1f}/10")

        # Environmental Justice Competency
        print(f"\n⚖️ ENVIRONMENTAL JUSTICE COMPETENCY:")
        ej_comp = results["ej_understanding"]["overall_ej_competency"]
        print(f"   Miguel's EJ Score: {ej_comp['average_score']}/10")
        print(f"   Competency Level: {ej_comp['competency_level'].upper()}")
        print(
            f"   Expert Demonstration: {'✅' if ej_comp['demonstrates_expertise'] else '❌'}"
        )

        # Tool Intelligence Rankings
        print(f"\n🔧 TOOL SELECTION INTELLIGENCE RANKINGS:")
        for i, ranking in enumerate(
            results["tool_intelligence"]["tool_selection_rankings"], 1
        ):
            print(f"   {i}. {ranking['agent'].upper()}: {ranking['score']:.1f}/10")

        # Response Quality Rankings
        print(f"\n📊 RESPONSE QUALITY RANKINGS:")
        for i, ranking in enumerate(results["response_quality"]["quality_rankings"], 1):
            print(f"   {i}. {ranking['agent'].upper()}: {ranking['score']:.1f}/10")

        # Exceptional Capabilities
        if analysis["exceptional_capabilities"]:
            print(f"\n🌟 EXCEPTIONAL CAPABILITIES IDENTIFIED:")
            for capability in analysis["exceptional_capabilities"]:
                print(f"   ✨ {capability}")

        print("\n" + "=" * 80)


async def main():
    """Main execution function"""
    tester = ExceptionalAgentTester()
    await tester.run_exceptional_testing_suite()


if __name__ == "__main__":
    asyncio.run(main())
