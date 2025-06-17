#!/usr/bin/env python3
"""
Test Enhanced Auth Workflow with Memory & Context Injection

This script tests the updated authentication workflow that includes:
- Memory management for user context
- Context injection for AI agent enhancement
- Session state management with user-specific data
- Adaptive AI agent configuration based on user profile

Updated to test already-authenticated users instead of login credentials.

Location: scripts/test_enhanced_auth_workflow.py
"""

import asyncio
import json
import sys
import os
from datetime import datetime
import uuid

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backendv1.workflows.auth_workflow import AuthWorkflow
from backendv1.utils.logger import setup_logger

logger = setup_logger("test_enhanced_auth")

# Test user data (using REAL users from CLIMATE_ECONOMY_SETUP_GUIDE.md)
TEST_USERS = [
    {
        "user_id": None,  # Will be fetched from database
        "email": "gnekwaya@joinact.org",
        "user_type": "admin",
        "access_token": "# Test data should use real database fixtures
        }
    
    async def fetch_real_user_ids(self):
        """Fetch real user IDs from database for the test users"""
        logger.info("🔍 Fetching real user IDs from database...")
        
        for user in TEST_USERS:
            try:
                # Query the profiles table to get the actual user_id using supabase
                result = await self.auth_workflow.supabase.query(
                    table="profiles",
                    filters={"email": user["email"]},
                    select="id, email, user_type"
                )
                
                if result.get("success") and result.get("data") and len(result["data"]) > 0:
                    user["user_id"] = result["data"][0]["id"]
                    logger.info(f"✅ Found user: {user['email']} -> ID: {user['user_id']}")
                else:
                    logger.warning(f"⚠️  User not found in database: {user['email']}")
                    user["user_id"] = str(uuid.uuid4())  # Fallback to mock ID
                    
            except Exception as e:
                logger.error(f"❌ Error fetching user ID for {user['email']}: {e}")
                user["user_id"] = str(uuid.uuid4())  # Fallback to mock ID
    
    async def run_all_tests(self):
        """Run all enhanced authentication tests"""
        logger.info("🧪 Starting Enhanced Auth Workflow Tests")
        logger.info("=" * 60)
        
        # First, fetch real user IDs from database
        await self.fetch_real_user_ids()
        
        for user in TEST_USERS:
            await self.test_session_enhancement(user)
        
        await self.test_memory_management()
        await self.test_context_injection()
        await self.test_ai_context_retrieval()
        await self.test_workflow_session_creation()
        
        self.print_summary()
        return self.test_results
    
    async def test_session_enhancement(self, user_data):
        """Test session enhancement for already-authenticated users"""
        test_name = f"Session Enhancement - {user_data['description']}"
        logger.info(f"\n🔐 Testing: {test_name}")
        
        try:
            # Test session enhancement with context injection
            enhancement_result = await self.auth_workflow.enhance_authenticated_user_session(user_data)
            
            success = True
            details = {}
            
            # Verify session enhancement
            if not enhancement_result.get("enhanced"):
                success = False
                details["enhancement_error"] = enhancement_result.get("error", "Unknown error")
            else:
                details["user_id"] = enhancement_result.get("user_id")
                details["user_type"] = enhancement_result.get("user_type")
                details["has_enhanced_token"] = bool(enhancement_result.get("enhanced_token"))
                details["has_profile"] = bool(enhancement_result.get("profile"))
                
                # Verify context injection
                injected_context = enhancement_result.get("injected_context", {})
                details["context_injected"] = bool(injected_context)
                details["context_keys"] = list(injected_context.keys())
                
                # Verify AI enhancements
                ai_enhancements = enhancement_result.get("ai_enhancements", {})
                details["ai_enhancements"] = ai_enhancements
                details["memory_enabled"] = ai_enhancements.get("memory_enabled", False)
                details["context_aware"] = ai_enhancements.get("context_aware", False)
                details["personalized"] = ai_enhancements.get("personalized", False)
                
                # Verify session capabilities
                session_capabilities = enhancement_result.get("session_capabilities", {})
                details["session_capabilities"] = session_capabilities
                details["context_injection_enabled"] = session_capabilities.get("context_injection", False)
                details["memory_retrieval_enabled"] = session_capabilities.get("memory_retrieval", False)
            
            self.record_test_result(test_name, success, details)
            
            if success:
                logger.info(f"✅ {test_name} - PASSED")
                logger.info(f"   User Type: {details.get('user_type')}")
                logger.info(f"   Context Injected: {details.get('context_injected')}")
                logger.info(f"   AI Enhancements: {details.get('ai_enhancements')}")
                logger.info(f"   Session Capabilities: {details.get('session_capabilities')}")
            else:
                logger.error(f"❌ {test_name} - FAILED")
                logger.error(f"   Details: {details}")
            
            return enhancement_result if success else None
            
        except Exception as e:
            logger.error(f"❌ {test_name} - ERROR: {e}")
            self.record_test_result(test_name, False, {"error": str(e)})
            return None
    
    async def test_memory_management(self):
        """Test memory management capabilities"""
        test_name = "Memory Management"
        logger.info(f"\n🧠 Testing: {test_name}")
        
        try:
            # Use a real user ID from our test users
            test_user_id = TEST_USERS[0]["user_id"]  # Use George's admin account
            test_context = {
                "career_goals": ["renewable energy", "sustainability"],
                "climate_interests": ["solar power", "wind energy"],
                "experience_level": "intermediate",
                "preferred_locations": ["Massachusetts", "California"],
                "skills": ["project management", "data analysis"]
            }
            
            # Test storing context
            memory_stored = await self.auth_workflow.memory_manager.extract_and_store_user_context(
                test_user_id, test_context
            )
            
            # Test retrieving context
            retrieved_context = await self.auth_workflow.memory_manager.get_relevant_user_context(
                test_user_id, "career guidance"
            )
            
            # Test formatting for AI
            formatted_context = await self.auth_workflow.memory_manager.format_context_for_ai_prompt(
                retrieved_context
            )
            
            success = memory_stored and retrieved_context.get("context_count", 0) >= 0
            details = {
                "memory_stored": memory_stored,
                "context_count": retrieved_context.get("context_count", 0),
                "formatted_length": len(formatted_context),
                "formatted_preview": formatted_context[:200] + "..." if len(formatted_context) > 200 else formatted_context
            }
            
            self.record_test_result(test_name, success, details)
            
            if success:
                logger.info(f"✅ {test_name} - PASSED")
                logger.info(f"   Memory Stored: {details['memory_stored']}")
                logger.info(f"   Context Count: {details['context_count']}")
                logger.info(f"   Formatted Length: {details['formatted_length']}")
            else:
                logger.error(f"❌ {test_name} - FAILED")
                logger.error(f"   Details: {details}")
            
        except Exception as e:
            logger.error(f"❌ {test_name} - ERROR: {e}")
            self.record_test_result(test_name, False, {"error": str(e)})
    
    async def test_context_injection(self):
        """Test context injection capabilities"""
        test_name = "Context Injection"
        logger.info(f"\n💉 Testing: {test_name}")
        
        try:
            # Test context injection for different user types using real user IDs
            test_cases = [
                {
                    "user_type": "job_seeker",
                    "user_id": TEST_USERS[1]["user_id"],  # George's job seeker account
                    "profile_data": {
                        "user_type": "job_seeker",
                        "specific_profile": {
                            "experience_level": "entry",
                            "desired_roles": ["sustainability analyst"],
                            "climate_focus_areas": ["renewable energy"],
                            "preferred_locations": ["Boston"],
                            "remote_work_preference": "hybrid"
                        }
                    }
                },
                {
                    "user_type": "partner",
                    "user_id": TEST_USERS[2]["user_id"],  # Buffr Inc. partner account
                    "profile_data": {
                        "user_type": "partner",
                        "specific_profile": {
                            "organization_type": "nonprofit",
                            "climate_focus": ["clean energy"],
                            "hiring_actively": True,
                            "verified": True
                        }
                    }
                }
            ]
            
            success_count = 0
            total_tests = len(test_cases)
            
            for i, test_case in enumerate(test_cases):
                test_user_id = test_case["user_id"]
                
                injected_context = await self.auth_workflow.context_injector.inject_user_profile_context(
                    test_user_id, test_case["user_type"], test_case["profile_data"]
                )
                
                if injected_context and not injected_context.get("error"):
                    success_count += 1
                    logger.info(f"   ✅ {test_case['user_type']} context injection successful")
                else:
                    logger.error(f"   ❌ {test_case['user_type']} context injection failed: {injected_context.get('error', 'Unknown error')}")
            
            success = success_count == total_tests
            details = {
                "successful_injections": success_count,
                "total_tests": total_tests,
                "success_rate": f"{(success_count/total_tests)*100:.1f}%"
            }
            
            self.record_test_result(test_name, success, details)
            
            if success:
                logger.info(f"✅ {test_name} - PASSED")
                logger.info(f"   Success Rate: {details['success_rate']}")
            else:
                logger.error(f"❌ {test_name} - FAILED")
                logger.error(f"   Success Rate: {details['success_rate']}")
            
        except Exception as e:
            logger.error(f"❌ {test_name} - ERROR: {e}")
            self.record_test_result(test_name, False, {"error": str(e)})
    
    async def test_workflow_session_creation(self):
        """Test enhanced workflow session creation"""
        test_name = "Workflow Session Creation"
        logger.info(f"\n🔧 Testing: {test_name}")
        
        try:
            # Test creating enhanced session using real user ID
            test_user_id = TEST_USERS[1]["user_id"]  # George's job seeker account
            test_session_id = str(uuid.uuid4())
            test_context = {
                "user_type": "job_seeker",
                "ai_context": {"personalization_level": "high"},
                "session_enhancements": {"memory_enabled": True}
            }
            
            session_created = await self.auth_workflow._create_enhanced_workflow_session(
                test_user_id, test_session_id, "job_seeker", test_context
            )
            
            success = session_created
            details = {
                "session_created": session_created,
                "user_id": test_user_id,
                "session_id": test_session_id
            }
            
            self.record_test_result(test_name, success, details)
            
            if success:
                logger.info(f"✅ {test_name} - PASSED")
                logger.info(f"   Session Created: {session_created}")
            else:
                logger.error(f"❌ {test_name} - FAILED")
                logger.error(f"   Session Created: {session_created}")
            
        except Exception as e:
            logger.error(f"❌ {test_name} - ERROR: {e}")
            self.record_test_result(test_name, False, {"error": str(e)})
    
    async def test_ai_context_retrieval(self):
        """Test AI context retrieval for agents"""
        test_name = "AI Context Retrieval"
        logger.info(f"\n🤖 Testing: {test_name}")
        
        try:
            # Test getting session context for AI using real user ID
            test_user_id = TEST_USERS[0]["user_id"]  # George's admin account
            
            ai_context = await self.auth_workflow.get_session_context_for_ai(
                test_user_id, "career guidance conversation"
            )
            
            success = ai_context.get("ready_for_ai", False)
            details = {
                "ready_for_ai": ai_context.get("ready_for_ai", False),
                "has_context": bool(ai_context.get("user_context", {})),
                "context_keys": list(ai_context.get("user_context", {}).keys()),
                "ai_enhancements": ai_context.get("ai_enhancements", {})
            }
            
            self.record_test_result(test_name, success, details)
            
            if success:
                logger.info(f"✅ {test_name} - PASSED")
                logger.info(f"   Ready for AI: {details['ready_for_ai']}")
                logger.info(f"   Has Context: {details['has_context']}")
            else:
                logger.error(f"❌ {test_name} - FAILED")
                logger.error(f"   Details: {details}")
            
        except Exception as e:
            logger.error(f"❌ {test_name} - ERROR: {e}")
            self.record_test_result(test_name, False, {"error": str(e)})
    
    def record_test_result(self, test_name, success, details):
        """Record test result"""
        self.test_results["tests_run"] += 1
        if success:
            self.test_results["tests_passed"] += 1
        else:
            self.test_results["tests_failed"] += 1
        
        self.test_results["detailed_results"].append({
            "test_name": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
    
    def print_summary(self):
        """Print test summary"""
        logger.info("\n" + "=" * 60)
        logger.info("🧪 ENHANCED AUTH WORKFLOW TEST SUMMARY")
        logger.info("=" * 60)
        
        total = self.test_results["tests_run"]
        passed = self.test_results["tests_passed"]
        failed = self.test_results["tests_failed"]
        success_rate = (passed / total * 100) if total > 0 else 0
        
        logger.info(f"Total Tests: {total}")
        logger.info(f"Passed: {passed}")
        logger.info(f"Failed: {failed}")
        logger.info(f"Success Rate: {success_rate:.1f}%")
        
        if failed > 0:
            logger.info("\n❌ Failed Tests:")
            for result in self.test_results["detailed_results"]:
                if not result["success"]:
                    logger.info(f"   - {result['test_name']}")
        
        logger.info("\n🎯 Enhanced Features Tested:")
        logger.info("   ✓ Session enhancement for authenticated users")
        logger.info("   ✓ Memory management for user context")
        logger.info("   ✓ Context injection for AI agents")
        logger.info("   ✓ Enhanced workflow session creation")
        logger.info("   ✓ AI-ready context retrieval")
        
        # Save results to file
        with open("enhanced_auth_test_results.json", "w") as f:
            json.dump(self.test_results, f, indent=2)
        
        logger.info(f"\n📄 Detailed results saved to: enhanced_auth_test_results.json")

async def main():
    """Main test function"""
    tester = EnhancedAuthTester()
    results = await tester.run_all_tests()
    
    # Return appropriate exit code
    if results["tests_failed"] == 0:
        logger.info("\n🎉 All tests passed! Enhanced auth workflow is working correctly.")
        return 0
    else:
        logger.error(f"\n💥 {results['tests_failed']} test(s) failed. Check the logs above.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code) 