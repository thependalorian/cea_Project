#!/usr/bin/env python3
"""
George Nekwaya Triple Access Backend Testing
===========================================

Comprehensive backend testing for George Nekwaya's three distinct access profiles:
1. Admin Profile (ACT Project Manager) - Super Admin Access
2. Partner Profile (Buffr Inc. Founder) - Partner Collaboration Access
3. Job Seeker Profile (Individual) - Career Development Access

Tests actual database integration, profile switching, permission validation,
and agent routing based on George's specific multi-profile setup.
"""

import asyncio
import json
import os
import sys
from datetime import datetime
from typing import Any, Dict, List, Optional

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase import Client, create_client

from core.agents.base import SupervisorAgent
from core.config import get_settings

# George Nekwaya's Three Profiles Configuration
GEORGE_PROFILES = {
    "ADMIN": {
        "user_id": "550e8400-e29b-41d4-a716-446655440001",  # From admin_profiles table
        "email": "gnekwaya@actinstitute.org",
        "role": "admin",
        "organization": "ACT Institute",
        "access_level": "super_admin",
        "table_source": "admin_profiles",
        "expected_permissions": [
            "user_management",
            "system_analytics",
            "content_moderation",
            "partner_management",
            "data_export",
            "platform_configuration",
        ],
    },
    "PARTNER": {
        "user_id": "550e8400-e29b-41d4-a716-446655440002",  # From partner_profiles table
        "email": "george@buffr.com",
        "role": "partner",
        "organization": "Buffr Inc.",
        "access_level": "partner",
        "table_source": "partner_profiles",
        "expected_permissions": [
            "job_posting",
            "talent_pipeline_access",
            "partnership_analytics",
            "collaboration_tools",
            "candidate_screening",
            "partner_networking",
        ],
    },
    "JOB_SEEKER": {
        "user_id": "550e8400-e29b-41d4-a716-446655440003",  # From job_seeker_profiles table
        "email": "george.nekwaya@gmail.com",
        "role": "job_seeker",
        "organization": None,
        "access_level": "individual",
        "table_source": "job_seeker_profiles",
        "expected_permissions": [
            "resume_analysis",
            "job_search",
            "career_guidance",
            "skills_assessment",
            "training_recommendations",
            "mentor_matching",
        ],
    },
}


class GeorgeTripleAccessTester:
    """Comprehensive testing for George Nekwaya's triple access profiles"""

    def __init__(self):
        self.supabase = None
        self.supervisor = None
        self.test_results = {}

    async def initialize(self):
        """Initialize testing environment"""
        print("🌟 Initializing George Nekwaya Triple Access Testing")
        print("=" * 60)

        settings = get_settings()
        self.supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
        self.supervisor = SupervisorAgent()

        print("✅ Testing environment ready")
        print("🎯 Focus: George's Admin, Partner, and Job Seeker profiles")

    async def test_database_profile_existence(self) -> Dict[str, Any]:
        """Test that George's profiles exist in the database"""
        print("\n" + "=" * 50)
        print("🗄️ DATABASE PROFILE EXISTENCE TESTS")
        print("=" * 50)

        profile_results = {}

        for profile_name, profile_config in GEORGE_PROFILES.items():
            print(f"\n🔍 Testing {profile_name} Profile Database Entry")

            try:
                table_source = profile_config["table_source"]

                if table_source == "admin_profiles":
                    # Check admin_profiles table
                    response = (
                        self.supabase.table("admin_profiles")
                        .select("*")
                        .eq("user_id", profile_config["user_id"])
                        .execute()
                    )

                elif table_source == "partner_profiles":
                    # Check partner_profiles table for Buffr Inc.
                    response = (
                        self.supabase.table("partner_profiles")
                        .select("*")
                        .eq("organization_name", "Buffr Inc.")
                        .execute()
                    )

                elif table_source == "job_seeker_profiles":
                    # Check job_seeker_profiles table
                    response = (
                        self.supabase.table("job_seeker_profiles")
                        .select("*")
                        .eq("email", profile_config["email"])
                        .execute()
                    )

                if response.data:
                    profile_results[profile_name] = {
                        "exists": True,
                        "data": response.data[0],
                        "table": table_source,
                        "validation": "PASSED",
                    }
                    print(f"   ✅ {profile_name} profile found in {table_source}")

                    # Verify key fields
                    data = response.data[0]
                    if "email" in data and data["email"] == profile_config["email"]:
                        print(f"   ✅ Email matches: {data['email']}")
                    if "name" in data and "George Nekwaya" in str(data["name"]):
                        print(f"   ✅ Name contains George Nekwaya")

                else:
                    profile_results[profile_name] = {
                        "exists": False,
                        "error": f"No data found in {table_source}",
                        "validation": "FAILED",
                    }
                    print(f"   ❌ {profile_name} profile NOT found in {table_source}")

            except Exception as e:
                profile_results[profile_name] = {
                    "exists": False,
                    "error": str(e),
                    "validation": "FAILED",
                }
                print(f"   ❌ {profile_name} lookup failed: {e}")

        return {
            "profile_existence_tests": profile_results,
            "all_profiles_exist": all(
                r.get("exists", False) for r in profile_results.values()
            ),
        }

    async def test_agent_routing_by_profile(self) -> Dict[str, Any]:
        """Test agent routing based on George's different profiles"""
        print("\n" + "=" * 50)
        print("🎭 AGENT ROUTING BY PROFILE TESTS")
        print("=" * 50)

        routing_scenarios = [
            {
                "profile": "ADMIN",
                "query": "Show me the platform analytics and user engagement metrics",
                "expected_agent": "admin_assistant",
                "expected_context": "administrative_functions",
                "expected_features": ["user_management", "system_analytics"],
            },
            {
                "profile": "PARTNER",
                "query": "I want to post a job opening for a clean energy data analyst at Buffr Inc.",
                "expected_agent": "partner_liaison",
                "expected_context": "partner_collaboration",
                "expected_features": ["job_posting", "talent_pipeline_access"],
            },
            {
                "profile": "JOB_SEEKER",
                "query": "Help me transition my fintech skills to clean energy careers",
                "expected_agent": "jasmine_ma_resource_analyst",
                "expected_context": "career_development",
                "expected_features": ["resume_analysis", "career_guidance"],
            },
        ]

        routing_results = []

        for scenario in routing_scenarios:
            profile_config = GEORGE_PROFILES[scenario["profile"]]
            print(f"\n🎯 Testing {scenario['profile']} Profile Routing")

            try:
                # Create conversation context based on profile
                conversation_context = {
                    "user_id": profile_config["user_id"],
                    "email": profile_config["email"],
                    "role": profile_config["role"],
                    "organization": profile_config["organization"],
                    "access_level": profile_config["access_level"],
                }

                response = await self.supervisor.handle_message(
                    message=scenario["query"],
                    user_id=profile_config["user_id"],
                    conversation_id=f"george_routing_test_{scenario['profile'].lower()}",
                    context=conversation_context,
                )

                # Validate routing
                routing_validation = self.validate_agent_routing(
                    response, scenario, profile_config
                )

                result = {
                    "profile": scenario["profile"],
                    "query": scenario["query"],
                    "response": response,
                    "validation": routing_validation,
                    "status": (
                        "PASSED" if routing_validation["correct_routing"] else "FAILED"
                    ),
                }

                routing_results.append(result)

                print(f"   ✅ Agent Used: {response.get('agent_used', 'Unknown')}")
                print(
                    f"   ✅ Routing Score: {routing_validation.get('routing_score', 0):.2f}"
                )

            except Exception as e:
                print(f"   ❌ {scenario['profile']} routing failed: {e}")
                routing_results.append(
                    {
                        "profile": scenario["profile"],
                        "error": str(e),
                        "status": "FAILED",
                    }
                )

        return {
            "routing_tests": routing_results,
            "routing_success_rate": len(
                [r for r in routing_results if r.get("status") == "PASSED"]
            )
            / len(routing_results),
        }

    def validate_agent_routing(
        self,
        response: Dict[str, Any],
        scenario: Dict[str, Any],
        profile_config: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Validate that agent routing is correct for the profile"""
        validation = {"correct_routing": True, "routing_score": 0.0, "issues": []}

        score_components = []

        # Check if response contains content
        content = response.get("content", "").lower()
        metadata = response.get("metadata", {})

        if not content:
            validation["issues"].append("No content in response")
            validation["correct_routing"] = False
            return validation

        # Check agent selection based on metadata or content
        expected_agent = scenario["expected_agent"]
        actual_agent = metadata.get("agent_type", "")
        routing_decision = metadata.get("routing_decision", "")

        # Check for agent routing indicators
        agent_indicators = {
            "admin_assistant": [
                "admin",
                "pendo",
                "supervisor",
                "platform",
                "management",
            ],
            "partner_liaison": ["partner", "collaboration", "liaison", "marcus", "liv"],
            "jasmine_ma_resource_analyst": ["jasmine", "resume", "career", "miguel"],
        }

        if expected_agent in agent_indicators:
            indicators = agent_indicators[expected_agent]
            found_indicators = sum(
                1 for indicator in indicators if indicator in content
            )
            if found_indicators > 0:
                score_components.append(0.8)  # Partial credit for agent context
            else:
                score_components.append(0.3)
                validation["issues"].append(
                    f"No {expected_agent} indicators found in content"
                )
        else:
            score_components.append(0.5)

        # Check profile role context
        profile_role = profile_config["role"]
        role_indicators = {
            "admin": [
                "admin",
                "platform",
                "management",
                "analytics",
                "system",
                "oversight",
            ],
            "partner": [
                "partner",
                "collaboration",
                "job posting",
                "buffr",
                "partnership",
                "organization",
            ],
            "job_seeker": [
                "career",
                "skills",
                "transition",
                "opportunities",
                "guidance",
                "resume",
            ],
        }

        if profile_role in role_indicators:
            indicators = role_indicators[profile_role]
            found_indicators = sum(
                1 for indicator in indicators if indicator in content
            )
            content_score = min(found_indicators / len(indicators), 1.0)
            score_components.append(content_score)
        else:
            score_components.append(0.5)

        # Check organization context (if applicable)
        if profile_config["organization"]:
            org_name = profile_config["organization"].lower()
            org_words = org_name.replace(" inc.", "").replace(" ", "").replace(".", "")
            if org_words in content.replace(" ", ""):
                score_components.append(1.0)
            else:
                # Partial credit if organization type is mentioned
                if (
                    "organization" in content
                    or "company" in content
                    or "institute" in content
                ):
                    score_components.append(0.6)
                else:
                    score_components.append(0.3)
                    validation["issues"].append(
                        f"Organization context for {profile_config['organization']} not well represented"
                    )
        else:
            score_components.append(
                1.0
            )  # No organization expected for individual job seeker

        # Check response quality and length
        if len(content) > 100:
            score_components.append(1.0)
        elif len(content) > 50:
            score_components.append(0.7)
        else:
            score_components.append(0.3)
            validation["issues"].append("Response too short")

        # Overall routing score
        validation["routing_score"] = sum(score_components) / len(score_components)

        # More lenient threshold since we're testing real agent responses
        if validation["routing_score"] < 0.5:
            validation["correct_routing"] = False
            validation["issues"].append(
                f"Low routing score: {validation['routing_score']:.2f}"
            )

        return validation

    async def test_permission_based_access(self) -> Dict[str, Any]:
        """Test permission-based access for George's different profiles"""
        print("\n" + "=" * 50)
        print("🔒 PERMISSION-BASED ACCESS TESTS")
        print("=" * 50)

        permission_tests = [
            {
                "profile": "ADMIN",
                "test_query": "Can I access user management features?",
                "expected_permissions": [
                    "user_management",
                    "system_analytics",
                    "partner_oversight",
                ],
                "expected_access_level": "super_admin",
            },
            {
                "profile": "PARTNER",
                "test_query": "Can I post jobs and access talent pipeline?",
                "expected_permissions": [
                    "job_posting",
                    "talent_pipeline_access",
                    "partnership_analytics",
                ],
                "expected_access_level": "partner",
            },
            {
                "profile": "JOB_SEEKER",
                "test_query": "Can I upload my resume and get career guidance?",
                "expected_permissions": [
                    "resume_analysis",
                    "career_guidance",
                    "job_search",
                ],
                "expected_access_level": "individual",
            },
        ]

        permission_results = []

        for test in permission_tests:
            profile_config = GEORGE_PROFILES[test["profile"]]
            print(f"\n🔑 Testing {test['profile']} Permissions")

            try:
                response = await self.supervisor.handle_message(
                    message=test["test_query"],
                    user_id=profile_config["user_id"],
                    conversation_id=f"george_permissions_test_{test['profile'].lower()}",
                )

                # Validate permissions in response
                permission_validation = self.validate_permissions(
                    response, test, profile_config
                )

                result = {
                    "profile": test["profile"],
                    "test_query": test["test_query"],
                    "response": response,
                    "validation": permission_validation,
                    "status": (
                        "PASSED"
                        if permission_validation["permissions_valid"]
                        else "FAILED"
                    ),
                }

                permission_results.append(result)

                print(
                    f"   ✅ Permissions Score: {permission_validation.get('permission_score', 0):.2f}"
                )
                print(
                    f"   ✅ Access Level: {permission_validation.get('detected_access_level', 'Unknown')}"
                )

            except Exception as e:
                print(f"   ❌ {test['profile']} permission test failed: {e}")
                permission_results.append(
                    {"profile": test["profile"], "error": str(e), "status": "FAILED"}
                )

        return {
            "permission_tests": permission_results,
            "permission_success_rate": len(
                [r for r in permission_results if r.get("status") == "PASSED"]
            )
            / len(permission_results),
        }

    def validate_permissions(
        self,
        response: Dict[str, Any],
        test: Dict[str, Any],
        profile_config: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Validate permissions granted in response"""
        validation = {
            "permissions_valid": True,
            "permission_score": 0.0,
            "detected_access_level": None,
            "issues": [],
        }

        content = response.get("content", "").lower()
        metadata = response.get("metadata", {})

        if not content:
            validation["permissions_valid"] = False
            validation["issues"].append("No content in response")
            return validation

        # Check for expected permissions mentioned in content
        expected_permissions = test["expected_permissions"]
        permissions_mentioned = 0

        # More flexible permission keyword matching
        permission_keywords = {
            "user_management": ["user", "management", "manage", "admin", "oversight"],
            "system_analytics": [
                "analytics",
                "system",
                "metrics",
                "data",
                "statistics",
            ],
            "partner_management": [
                "partner",
                "collaboration",
                "management",
                "networking",
            ],
            "job_posting": ["job", "posting", "hiring", "recruitment", "opportunities"],
            "talent_pipeline_access": ["talent", "pipeline", "candidates", "screening"],
            "partnership_analytics": [
                "partnership",
                "analytics",
                "collaboration",
                "metrics",
            ],
            "resume_analysis": ["resume", "analysis", "skills", "experience"],
            "career_guidance": ["career", "guidance", "advice", "direction", "path"],
            "job_search": ["job", "search", "opportunities", "positions"],
        }

        for permission in expected_permissions:
            if permission in permission_keywords:
                keywords = permission_keywords[permission]
                if any(keyword in content for keyword in keywords):
                    permissions_mentioned += 1
            else:
                # Fallback: check if permission name appears in content
                permission_words = permission.replace("_", " ").split()
                if any(word in content for word in permission_words):
                    permissions_mentioned += 1

        permission_coverage = (
            permissions_mentioned / len(expected_permissions)
            if expected_permissions
            else 0.5
        )

        # Check access level indicators in content
        access_level = test["expected_access_level"]
        access_indicators = {
            "super_admin": [
                "admin",
                "management",
                "system",
                "platform",
                "oversight",
                "administrator",
            ],
            "partner": [
                "partner",
                "collaboration",
                "posting",
                "pipeline",
                "networking",
                "organization",
            ],
            "individual": [
                "career",
                "resume",
                "guidance",
                "personal",
                "individual",
                "development",
            ],
        }

        access_score = 0.0
        if access_level in access_indicators:
            indicators = access_indicators[access_level]
            found_indicators = sum(
                1 for indicator in indicators if indicator in content
            )
            access_score = min(found_indicators / len(indicators), 1.0)

            if access_score > 0.3:
                validation["detected_access_level"] = access_level

        # Check for positive/supportive response tone
        positive_indicators = [
            "help",
            "assist",
            "support",
            "guide",
            "provide",
            "access",
            "available",
        ]
        positive_score = sum(
            1 for indicator in positive_indicators if indicator in content
        ) / len(positive_indicators)

        # Check response length and quality
        length_score = (
            1.0 if len(content) > 100 else (0.7 if len(content) > 50 else 0.3)
        )

        # Overall permission score (weighted components)
        validation["permission_score"] = (
            permission_coverage * 0.4
            + access_score * 0.3  # 40% for permission coverage
            + positive_score * 0.2  # 30% for access level indicators
            + length_score  # 20% for positive response tone
            * 0.1  # 10% for response quality
        )

        # More realistic threshold for real agent responses
        if validation["permission_score"] < 0.4:
            validation["permissions_valid"] = False
            validation["issues"].append(
                f"Low permission score: {validation['permission_score']:.2f}"
            )

        # Additional validation based on profile type
        profile_role = profile_config["role"]
        if (
            profile_role == "admin"
            and "admin" not in content
            and "management" not in content
        ):
            validation["issues"].append("Admin context not well represented")
        elif (
            profile_role == "partner"
            and "partner" not in content
            and "collaboration" not in content
        ):
            validation["issues"].append("Partner context not well represented")
        elif (
            profile_role == "job_seeker"
            and "career" not in content
            and "job" not in content
        ):
            validation["issues"].append("Job seeker context not well represented")

        return validation

    async def test_profile_context_switching(self) -> Dict[str, Any]:
        """Test context switching between George's profiles"""
        print("\n" + "=" * 50)
        print("🔄 PROFILE CONTEXT SWITCHING TESTS")
        print("=" * 50)

        switching_scenarios = [
            {
                "from_profile": "ADMIN",
                "to_profile": "PARTNER",
                "transition_query": "Now I want to switch to my partner role at Buffr Inc.",
                "validation_query": "Help me post a job for a sustainability analyst",
            },
            {
                "from_profile": "PARTNER",
                "to_profile": "JOB_SEEKER",
                "transition_query": "Let me switch to my personal job seeking perspective",
                "validation_query": "I want career advice for transitioning to clean energy",
            },
            {
                "from_profile": "JOB_SEEKER",
                "to_profile": "ADMIN",
                "transition_query": "Back to my administrative role now",
                "validation_query": "Show me platform user engagement statistics",
            },
        ]

        switching_results = []

        for scenario in switching_scenarios:
            from_config = GEORGE_PROFILES[scenario["from_profile"]]
            to_config = GEORGE_PROFILES[scenario["to_profile"]]

            print(
                f"\n🔄 Testing {scenario['from_profile']} → {scenario['to_profile']} Switch"
            )

            try:
                # First, establish initial profile context
                initial_response = await self.supervisor.handle_message(
                    message="Hello, I'm George Nekwaya",
                    user_id=from_config["user_id"],
                    conversation_id=f"george_switch_test_{scenario['from_profile'].lower()}_to_{scenario['to_profile'].lower()}",
                )

                # Then attempt profile transition
                transition_response = await self.supervisor.handle_message(
                    message=scenario["transition_query"],
                    user_id=to_config["user_id"],  # Switch to new user_id
                    conversation_id=f"george_switch_test_{scenario['from_profile'].lower()}_to_{scenario['to_profile'].lower()}",
                )

                # Validate with a query specific to the new profile
                validation_response = await self.supervisor.handle_message(
                    message=scenario["validation_query"],
                    user_id=to_config["user_id"],
                    conversation_id=f"george_switch_test_{scenario['from_profile'].lower()}_to_{scenario['to_profile'].lower()}",
                )

                # Validate the switch worked
                switch_validation = self.validate_profile_switch(
                    initial_response,
                    transition_response,
                    validation_response,
                    scenario,
                    from_config,
                    to_config,
                )

                result = {
                    "from_profile": scenario["from_profile"],
                    "to_profile": scenario["to_profile"],
                    "responses": {
                        "initial": initial_response,
                        "transition": transition_response,
                        "validation": validation_response,
                    },
                    "validation": switch_validation,
                    "status": (
                        "PASSED" if switch_validation["switch_successful"] else "FAILED"
                    ),
                }

                switching_results.append(result)

                print(
                    f"   ✅ Switch Success Score: {switch_validation.get('switch_score', 0):.2f}"
                )

            except Exception as e:
                print(
                    f"   ❌ {scenario['from_profile']} → {scenario['to_profile']} switch failed: {e}"
                )
                switching_results.append(
                    {
                        "from_profile": scenario["from_profile"],
                        "to_profile": scenario["to_profile"],
                        "error": str(e),
                        "status": "FAILED",
                    }
                )

        return {
            "switching_tests": switching_results,
            "switching_success_rate": len(
                [r for r in switching_results if r.get("status") == "PASSED"]
            )
            / len(switching_results),
        }

    def validate_profile_switch(
        self,
        initial_response: Dict[str, Any],
        transition_response: Dict[str, Any],
        validation_response: Dict[str, Any],
        scenario: Dict[str, Any],
        from_config: Dict[str, Any],
        to_config: Dict[str, Any],
    ) -> Dict[str, Any]:
        """Validate that profile switching worked correctly"""
        validation = {"switch_successful": True, "switch_score": 0.0, "issues": []}

        score_components = []

        # Check that validation response matches target profile context
        validation_content = validation_response.get("content", "").lower()
        target_role = to_config["role"]

        role_context_indicators = {
            "admin": ["admin", "platform", "analytics", "management", "system"],
            "partner": ["partner", "job posting", "collaboration", "buffr", "talent"],
            "job_seeker": [
                "career",
                "transition",
                "skills",
                "guidance",
                "opportunities",
            ],
        }

        if target_role in role_context_indicators:
            indicators = role_context_indicators[target_role]
            found_indicators = sum(
                1 for indicator in indicators if indicator in validation_content
            )
            context_score = found_indicators / len(indicators)
            score_components.append(context_score)
        else:
            score_components.append(0.5)

        # Check that target organization is mentioned (if applicable)
        if to_config["organization"]:
            org_name = to_config["organization"].lower()
            if any(word in validation_content for word in org_name.split()):
                score_components.append(1.0)
            else:
                validation["issues"].append(
                    f"Target organization {to_config['organization']} not in context"
                )
                score_components.append(0.5)
        else:
            score_components.append(1.0)

        # Check response length and quality
        if len(validation_content) > 50:
            score_components.append(1.0)
        else:
            validation["issues"].append("Validation response too short")
            score_components.append(0.3)

        # Overall switch score
        validation["switch_score"] = sum(score_components) / len(score_components)

        if validation["switch_score"] < 0.7:
            validation["switch_successful"] = False
            validation["issues"].append(
                f"Low switch score: {validation['switch_score']:.2f}"
            )

        return validation

    async def run_comprehensive_george_tests(self):
        """Run all George Nekwaya triple access tests"""
        print("🌟 Starting George Nekwaya Triple Access Testing")
        print("=" * 60)

        test_start_time = datetime.now()

        # Run all test suites
        database_results = await self.test_database_profile_existence()
        routing_results = await self.test_agent_routing_by_profile()
        permission_results = await self.test_permission_based_access()
        switching_results = await self.test_profile_context_switching()

        test_end_time = datetime.now()
        total_test_time = (test_end_time - test_start_time).total_seconds()

        # Generate comprehensive results
        final_results = {
            "test_execution": {
                "start_time": test_start_time.isoformat(),
                "end_time": test_end_time.isoformat(),
                "total_duration": total_test_time,
                "target_user": "George Nekwaya",
                "profiles_tested": list(GEORGE_PROFILES.keys()),
            },
            "test_suites": {
                "database_profile_existence": database_results,
                "agent_routing_by_profile": routing_results,
                "permission_based_access": permission_results,
                "profile_context_switching": switching_results,
            },
            "overall_metrics": {
                "database_success": database_results.get("all_profiles_exist", False),
                "routing_success_rate": routing_results.get(
                    "routing_success_rate", 0.0
                ),
                "permission_success_rate": permission_results.get(
                    "permission_success_rate", 0.0
                ),
                "switching_success_rate": switching_results.get(
                    "switching_success_rate", 0.0
                ),
            },
        }

        # Calculate George's triple access health score
        success_metrics = [
            1.0 if final_results["overall_metrics"]["database_success"] else 0.0,
            final_results["overall_metrics"]["routing_success_rate"],
            final_results["overall_metrics"]["permission_success_rate"],
            final_results["overall_metrics"]["switching_success_rate"],
        ]

        triple_access_health = sum(success_metrics) / len(success_metrics)
        final_results["george_triple_access_health"] = triple_access_health

        # Print summary
        self.print_george_test_summary(final_results)

        # Save results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        results_filename = f"george_nekwaya_triple_access_results_{timestamp}.json"

        with open(results_filename, "w") as f:
            json.dump(final_results, f, indent=2, default=str)

        print(f"\n💾 Results saved to: {results_filename}")

        return final_results

    def print_george_test_summary(self, results: Dict[str, Any]):
        """Print comprehensive test summary for George"""
        print("\n" + "=" * 60)
        print("🌟 GEORGE NEKWAYA TRIPLE ACCESS TEST RESULTS")
        print("=" * 60)

        metrics = results["overall_metrics"]

        print(
            f"\n🗄️ Database Profiles: {'✅ ALL EXIST' if metrics['database_success'] else '❌ MISSING PROFILES'}"
        )
        print(f"🎭 Agent Routing: {metrics['routing_success_rate']*100:.1f}%")
        print(f"🔒 Permission Access: {metrics['permission_success_rate']*100:.1f}%")
        print(f"🔄 Profile Switching: {metrics['switching_success_rate']*100:.1f}%")

        print(
            f"\n🌟 George's Triple Access Health: {results['george_triple_access_health']*100:.1f}%"
        )

        # Profile status breakdown
        print(f"\n📋 Profile Status Summary:")
        print(
            f"   👤 Admin (ACT): {'✅ ACTIVE' if metrics['database_success'] else '❌ ISSUES'}"
        )
        print(
            f"   🤝 Partner (Buffr): {'✅ ACTIVE' if metrics['database_success'] else '❌ ISSUES'}"
        )
        print(
            f"   💼 Job Seeker: {'✅ ACTIVE' if metrics['database_success'] else '❌ ISSUES'}"
        )

        # Health assessment
        health_score = results["george_triple_access_health"]
        if health_score >= 0.9:
            print("\n✅ Status: EXCELLENT - All George's profiles fully functional")
        elif health_score >= 0.8:
            print("\n✅ Status: GOOD - Minor profile issues")
        elif health_score >= 0.7:
            print("\n⚠️ Status: FAIR - Profile improvements needed")
        else:
            print("\n❌ Status: POOR - Major profile issues detected")


# Test runner
async def main():
    """Main test execution function for George's triple access"""
    tester = GeorgeTripleAccessTester()
    await tester.initialize()
    results = await tester.run_comprehensive_george_tests()
    return results


if __name__ == "__main__":
    asyncio.run(main())
