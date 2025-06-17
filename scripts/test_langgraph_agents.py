#!/usr/bin/env python3
"""
LangGraph Agent Routing Test Script
Tests the agent orchestration and routing logic for Climate Economy Assistant
"""

import sys
import os
import asyncio
from datetime import datetime

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

try:
    from core.agents.langgraph_agents import LangGraphOrchestrator, AgentType
    from core.agents.climate_agent import ClimateAgent
    from core.agents.empathy_agent import EmpathyAgent
    from core.agents.resume import ResumeAgent
    from core.agents.veteran import VeteranAgent
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("Make sure you're running from the project root and backend dependencies are installed")
    sys.exit(1)

class LangGraphTester:
    """Test suite for LangGraph agent routing and orchestration"""
    
    def __init__(self):
        self.orchestrator = LangGraphOrchestrator()
        self.test_results = []
        
    async def run_all_tests(self):
        """Run comprehensive agent routing tests"""
        
        print("🧠 **LANGGRAPH AGENT ROUTING TEST SUITE**")
        print("=" * 50)
        
        # Test cases for each agent
        test_cases = [
            # Climate Agent (Lauren) Tests
            {
                "message": "I want to transition to a climate career in renewable energy",
                "expected_agent": AgentType.CLIMATE_SPECIALIST,
                "test_name": "Climate Career Transition"
            },
            {
                "message": "Tell me about solar jobs in Massachusetts",
                "expected_agent": AgentType.CLIMATE_SPECIALIST,
                "test_name": "Solar Jobs Query"
            },
            {
                "message": "What green jobs are available for someone with my background?",
                "expected_agent": AgentType.CLIMATE_SPECIALIST,
                "test_name": "Green Jobs Background Match"
            },
            
            # Resume Agent (Mai) Tests
            {
                "message": "Can you help me optimize my resume for climate jobs?",
                "expected_agent": AgentType.RESUME_SPECIALIST,
                "test_name": "Resume Optimization"
            },
            {
                "message": "I need help with my cover letter for a sustainability position",
                "expected_agent": AgentType.RESUME_SPECIALIST,
                "test_name": "Cover Letter Assistance"
            },
            {
                "message": "How do I prepare for an interview at a clean energy company?",
                "expected_agent": AgentType.RESUME_SPECIALIST,
                "test_name": "Interview Preparation"
            },
            
            # Empathy Agent (Alex) Tests
            {
                "message": "I'm feeling really discouraged about my job search",
                "expected_agent": AgentType.EMPATHY_SPECIALIST,
                "test_name": "Emotional Support - Discouragement"
            },
            {
                "message": "I'm anxious about making a career change at my age",
                "expected_agent": AgentType.EMPATHY_SPECIALIST,
                "test_name": "Emotional Support - Anxiety"
            },
            {
                "message": "I don't feel confident enough for these climate jobs",
                "expected_agent": AgentType.EMPATHY_SPECIALIST,
                "test_name": "Emotional Support - Confidence"
            },
            
            # Veteran Agent (Marcus) Tests
            {
                "message": "I'm a veteran looking for climate jobs that use my military skills",
                "expected_agent": AgentType.VETERAN_SPECIALIST,
                "test_name": "Veteran Climate Transition"
            },
            {
                "message": "How can I use my GI Bill for renewable energy training?",
                "expected_agent": AgentType.VETERAN_SPECIALIST,
                "test_name": "VA Benefits for Climate Training"
            },
            {
                "message": "I served in the Army and want to work in environmental careers",
                "expected_agent": AgentType.VETERAN_SPECIALIST,
                "test_name": "Military to Environmental Career"
            },
            
            # Massachusetts Resources Agent (Jasmine) Tests
            {
                "message": "What climate resources are available in Massachusetts?",
                "expected_agent": AgentType.MA_RESOURCES,
                "test_name": "MA Climate Resources"
            },
            {
                "message": "Tell me about Boston area clean energy programs",
                "expected_agent": AgentType.MA_RESOURCES,
                "test_name": "Boston Clean Energy Programs"
            },
            
            # Environmental Justice Agent (Miguel) Tests
            {
                "message": "I'm interested in environmental justice careers",
                "expected_agent": AgentType.ENVIRONMENTAL_JUSTICE,
                "test_name": "Environmental Justice Careers"
            },
            {
                "message": "How can I help frontline communities with climate issues?",
                "expected_agent": AgentType.ENVIRONMENTAL_JUSTICE,
                "test_name": "Frontline Community Support"
            },
            
            # International Agent (Liv) Tests
            {
                "message": "I'm an international student looking for climate jobs with visa sponsorship",
                "expected_agent": AgentType.INTERNATIONAL_SPECIALIST,
                "test_name": "International Student Climate Jobs"
            },
            {
                "message": "How do I get my foreign credentials recognized for environmental work?",
                "expected_agent": AgentType.INTERNATIONAL_SPECIALIST,
                "test_name": "Foreign Credential Recognition"
            }
        ]
        
        # Run routing tests
        print("\n🔀 **TESTING AGENT ROUTING LOGIC**")
        print("-" * 40)
        
        passed_tests = 0
        total_tests = len(test_cases)
        
        for i, test_case in enumerate(test_cases, 1):
            result = await self._test_routing(test_case, i)
            if result:
                passed_tests += 1
        
        # Test orchestrator functionality
        print("\n🎭 **TESTING ORCHESTRATOR FUNCTIONALITY**")
        print("-" * 40)
        
        orchestrator_tests = await self._test_orchestrator()
        
        # Final results
        print("\n" + "=" * 50)
        print("📊 **FINAL TEST RESULTS**")
        print("=" * 50)
        
        routing_score = (passed_tests / total_tests) * 100
        print(f"🔀 Agent Routing: {passed_tests}/{total_tests} ({routing_score:.1f}%)")
        
        if orchestrator_tests:
            print("🎭 Orchestrator: ✅ PASSED")
        else:
            print("🎭 Orchestrator: ❌ FAILED")
        
        overall_score = (routing_score + (100 if orchestrator_tests else 0)) / 2
        print(f"\n🎯 **OVERALL SCORE: {overall_score:.1f}%**")
        
        if overall_score >= 90:
            print("🚀 **STATUS: READY FOR PRODUCTION**")
            return True
        elif overall_score >= 75:
            print("⚠️ **STATUS: NEEDS MINOR FIXES**")
            return False
        else:
            print("❌ **STATUS: MAJOR ISSUES - DO NOT DEPLOY**")
            return False
    
    async def _test_routing(self, test_case, test_number):
        """Test individual routing case"""
        
        try:
            # Test the supervisor routing logic
            routed_agent = self.orchestrator.supervisor.route_conversation(
                test_case["message"]
            )
            
            expected = test_case["expected_agent"]
            passed = routed_agent == expected
            
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"{test_number:2d}. {test_case['test_name']}: {status}")
            
            if not passed:
                print(f"    Expected: {expected}")
                print(f"    Got: {routed_agent}")
                print(f"    Message: '{test_case['message']}'")
            
            return passed
            
        except Exception as e:
            print(f"{test_number:2d}. {test_case['test_name']}: ❌ ERROR - {str(e)}")
            return False
    
    async def _test_orchestrator(self):
        """Test the full orchestrator functionality"""
        
        try:
            # Test a complete conversation flow
            test_message = "I'm a veteran interested in solar energy careers"
            user_id = "test_user_123"
            conversation_id = "test_conv_456"
            
            result = await self.orchestrator.process_conversation(
                message=test_message,
                user_id=user_id,
                conversation_id=conversation_id,
                context={"test": True}
            )
            
            # Validate response structure
            required_fields = ["content", "specialist", "confidence", "routing_decision"]
            
            for field in required_fields:
                if field not in result:
                    print(f"❌ Missing field: {field}")
                    return False
            
            # Validate content quality
            if len(result["content"]) < 50:
                print("❌ Response too short")
                return False
            
            if result["confidence"] < 0.5:
                print(f"❌ Low confidence: {result['confidence']}")
                return False
            
            print("✅ Full conversation flow working")
            print(f"✅ Routed to: {result['specialist']}")
            print(f"✅ Confidence: {result['confidence']:.2f}")
            print(f"✅ Response length: {len(result['content'])} chars")
            
            return True
            
        except Exception as e:
            print(f"❌ Orchestrator test failed: {str(e)}")
            return False

async def main():
    """Main test execution"""
    
    print(f"🕐 Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tester = LangGraphTester()
    success = await tester.run_all_tests()
    
    print(f"\n🕐 Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    if success:
        print("\n🎉 **ALL SYSTEMS GO - READY FOR DEPLOYMENT!**")
        sys.exit(0)
    else:
        print("\n⚠️ **ISSUES DETECTED - REVIEW BEFORE DEPLOYMENT**")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 