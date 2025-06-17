#!/usr/bin/env python3
"""
Advanced Features Test Suite - Climate Economy Assistant

This script comprehensively tests all advanced AI capabilities:
- Workflows and agent orchestration
- Tool calls and function execution
- Domain knowledge and expertise
- Intelligence and reasoning
- Empathy and emotional intelligence
- Human-in-the-loop interactions

Usage:
    python scripts/test_advanced_features.py
"""

import os
import sys
import json
import requests
import time
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Load environment variables
load_dotenv()

# Configuration
FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:8000"
SUPABASE_URL = os.getenv('SUPABASE_URL') or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_SERVICE_ROLE_KEY')

# Test accounts
TEST_ACCOUNTS = [
    {
        "name": "Admin Account",
        "email": "gnekwaya@joinact.org",
        "password": "ClimateAdmin2025!George_Nekwaya_Act",
        "role": "admin"
    }
]

class AdvancedTestResults:
    def __init__(self):
        self.results = {}
        self.test_sessions = {}
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
        self.start_time = datetime.now()
    
    def add_result(self, category, test_name, success, details=None, metrics=None):
        self.total_tests += 1
        if success:
            self.passed_tests += 1
        else:
            self.failed_tests += 1
        
        if category not in self.results:
            self.results[category] = {}
        
        self.results[category][test_name] = {
            "success": success,
            "details": details,
            "metrics": metrics or {},
            "timestamp": datetime.now().isoformat()
        }
    
    def print_category_summary(self, category):
        if category in self.results:
            cat_results = self.results[category]
            passed = sum(1 for r in cat_results.values() if r["success"])
            total = len(cat_results)
            print(f"   📊 {category}: {passed}/{total} passed ({(passed/total)*100:.1f}%)")
            
            for test_name, result in cat_results.items():
                status = "✅" if result["success"] else "❌"
                print(f"      {status} {test_name}")
                if result["metrics"]:
                    for metric, value in result["metrics"].items():
                        print(f"         {metric}: {value}")

def log_test(message, level="INFO"):
    """Log test messages with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

def get_auth_token():
    """Get authentication token for testing"""
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        account = TEST_ACCOUNTS[0]
        response = supabase.auth.sign_in_with_password({
            "email": account["email"],
            "password": account["password"]
        })
        
        if response.user and response.session:
            return response.session.access_token
        return None
    except Exception as e:
        log_test(f"Failed to get auth token: {e}")
        return None

def test_workflow_orchestration(token, results):
    """Test workflow orchestration and agent coordination"""
    log_test("🔄 Testing Workflow Orchestration")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test 1: Career Planning Workflow
    workflow_test = {
        "message": "I'm a recent environmental science graduate interested in transitioning to renewable energy careers. I have experience with research but need help understanding the job market and developing a career plan.",
        "conversation_id": f"workflow_test_{int(time.time())}",
        "context": {
            "user_journey_stage": "career_exploration",
            "background": "environmental_science",
            "experience_level": "entry_level",
            "interests": ["renewable_energy", "research", "sustainability"]
        }
    }
    
    try:
        start_time = time.time()
        response = requests.post(f"{FRONTEND_URL}/api/v1/supervisor-chat", 
                               headers=headers, json=workflow_test, timeout=60)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            
            # Analyze workflow indicators
            workflow_metrics = {
                "response_time": f"{response_time:.2f}s",
                "specialist_assigned": data.get("specialist", "unknown"),
                "workflow_state": data.get("workflow_state", "unknown"),
                "tools_used": len(data.get("tools_used", [])),
                "has_next_actions": bool(data.get("next_actions")),
                "response_length": len(data.get("content", "")),
                "intelligence_level": data.get("intelligence_level", "unknown")
            }
            
            # Check for workflow indicators
            content = data.get("content", "").lower()
            workflow_indicators = [
                "career" in content,
                "renewable energy" in content or "clean energy" in content,
                "experience" in content or "background" in content,
                len(data.get("next_actions", [])) > 0,
                data.get("specialist") is not None
            ]
            
            success = response.status_code == 200 and sum(workflow_indicators) >= 3
            results.add_result("Workflow Orchestration", "Career Planning Workflow", 
                             success, data.get("content", "")[:200] + "...", workflow_metrics)
            
        else:
            results.add_result("Workflow Orchestration", "Career Planning Workflow", 
                             False, f"HTTP {response.status_code}: {response.text}")
            
    except Exception as e:
        results.add_result("Workflow Orchestration", "Career Planning Workflow", 
                         False, f"Error: {str(e)}")
    
    # Test 2: Multi-step Workflow with Dependencies
    multistep_test = {
        "message": "I need help with: 1) Analyzing my current skills, 2) Finding climate jobs in Boston, 3) Creating a tailored resume, and 4) Preparing for interviews. Can you guide me through this step by step?",
        "conversation_id": f"multistep_test_{int(time.time())}",
        "context": {
            "workflow_type": "comprehensive_career_support",
            "location": "Boston, MA",
            "multi_step_request": True
        }
    }
    
    try:
        start_time = time.time()
        response = requests.post(f"{FRONTEND_URL}/api/v1/supervisor-chat", 
                               headers=headers, json=multistep_test, timeout=60)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            
            # Check for multi-step planning
            content = data.get("content", "").lower()
            planning_indicators = [
                "step" in content or "first" in content or "next" in content,
                "skills" in content and "analyze" in content,
                "resume" in content,
                "interview" in content,
                "boston" in content,
                len(data.get("next_actions", [])) > 0
            ]
            
            multistep_metrics = {
                "response_time": f"{response_time:.2f}s",
                "planning_indicators": sum(planning_indicators),
                "has_structured_plan": "1." in content or "step 1" in content,
                "mentions_location": "boston" in content,
                "comprehensive_scope": len(content) > 500
            }
            
            success = sum(planning_indicators) >= 4
            results.add_result("Workflow Orchestration", "Multi-step Planning", 
                             success, data.get("content", "")[:200] + "...", multistep_metrics)
            
        else:
            results.add_result("Workflow Orchestration", "Multi-step Planning", 
                             False, f"HTTP {response.status_code}")
            
    except Exception as e:
        results.add_result("Workflow Orchestration", "Multi-step Planning", 
                         False, f"Error: {str(e)}")

def test_agent_specialization(token, results):
    """Test agent specialization and domain expertise"""
    log_test("🤖 Testing Agent Specialization")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test different specialist areas
    specialist_tests = [
        {
            "name": "Career Coach Specialist",
            "message": "I'm feeling overwhelmed about my career transition into climate tech. I have imposter syndrome and don't know where to start. Can you help me build confidence and create a realistic plan?",
            "expected_specialist": ["career", "coach"],
            "emotional_support": True
        },
        {
            "name": "Technical Skills Specialist", 
            "message": "I need to learn Python for data analysis in environmental consulting. What specific libraries should I focus on? Can you recommend a learning path for climate data analysis?",
            "expected_specialist": ["technical", "skills"],
            "technical_depth": True
        },
        {
            "name": "Job Search Specialist",
            "message": "I'm looking for remote sustainability analyst positions at Fortune 500 companies. How do I identify the right opportunities and tailor my applications?",
            "expected_specialist": ["job", "search"],
            "strategic_guidance": True
        },
        {
            "name": "Industry Knowledge Specialist",
            "message": "What are the key differences between working at a renewable energy startup versus an established utility company? What career paths are available in each?",
            "expected_specialist": ["industry", "knowledge"],
            "domain_expertise": True
        }
    ]
    
    for test in specialist_tests:
        try:
            test_request = {
                "message": test["message"],
                "conversation_id": f"specialist_test_{int(time.time())}_{test['name'].replace(' ', '_').lower()}",
                "context": {"specialist_test": True}
            }
            
            start_time = time.time()
            response = requests.post(f"{FRONTEND_URL}/api/v1/supervisor-chat", 
                                   headers=headers, json=test_request, timeout=45)
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                content = data.get("content", "").lower()
                specialist = data.get("specialist", "").lower()
                
                # Check specialist assignment
                specialist_match = any(exp in specialist for exp in test["expected_specialist"])
                
                # Check response quality indicators
                quality_indicators = []
                
                if test.get("emotional_support"):
                    quality_indicators.extend([
                        "understand" in content or "feel" in content,
                        "confidence" in content or "overwhelm" in content,
                        "step" in content or "start" in content
                    ])
                
                if test.get("technical_depth"):
                    quality_indicators.extend([
                        "python" in content,
                        "data" in content,
                        "library" in content or "pandas" in content or "numpy" in content
                    ])
                
                if test.get("strategic_guidance"):
                    quality_indicators.extend([
                        "remote" in content,
                        "application" in content or "tailor" in content,
                        "fortune" in content or "company" in content
                    ])
                
                if test.get("domain_expertise"):
                    quality_indicators.extend([
                        "startup" in content and "utility" in content,
                        "difference" in content or "compare" in content,
                        "career path" in content or "opportunity" in content
                    ])
                
                specialist_metrics = {
                    "response_time": f"{response_time:.2f}s",
                    "specialist_assigned": data.get("specialist", "none"),
                    "specialist_match": specialist_match,
                    "quality_score": f"{sum(quality_indicators)}/{len(quality_indicators)}",
                    "response_length": len(content),
                    "tools_used": len(data.get("tools_used", []))
                }
                
                success = specialist_match and sum(quality_indicators) >= len(quality_indicators) * 0.6
                results.add_result("Agent Specialization", test["name"], 
                                 success, data.get("content", "")[:150] + "...", specialist_metrics)
                
            else:
                results.add_result("Agent Specialization", test["name"], 
                                 False, f"HTTP {response.status_code}")
                
        except Exception as e:
            results.add_result("Agent Specialization", test["name"], 
                             False, f"Error: {str(e)}")

def test_tool_calls_and_functions(token, results):
    """Test tool calling and function execution capabilities"""
    log_test("🔧 Testing Tool Calls and Functions")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test 1: Job Search Tool Integration
    job_search_test = {
        "message": "Find renewable energy engineering jobs in California that require 2-5 years of experience and offer remote work options.",
        "conversation_id": f"tool_test_jobs_{int(time.time())}",
        "context": {
            "tool_test": "job_search",
            "location": "California",
            "experience": "2-5 years",
            "remote": True
        }
    }
    
    try:
        response = requests.post(f"{FRONTEND_URL}/api/v1/career-search", 
                               headers=headers, json=job_search_test, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check for tool usage indicators
            has_jobs = bool(data.get("jobs") or data.get("results"))
            has_metadata = bool(data.get("search_metadata") or data.get("total_results"))
            
            tool_metrics = {
                "found_jobs": has_jobs,
                "has_metadata": has_metadata,
                "response_structure": "jobs" in str(data) or "results" in str(data)
            }
            
            success = response.status_code == 200 and (has_jobs or has_metadata)
            results.add_result("Tool Calls", "Job Search Integration", 
                             success, str(data)[:200] + "...", tool_metrics)
        else:
            results.add_result("Tool Calls", "Job Search Integration", 
                             False, f"HTTP {response.status_code}")
    except Exception as e:
        results.add_result("Tool Calls", "Job Search Integration", 
                         False, f"Error: {str(e)}")
    
    # Test 2: Resume Analysis Tool
    resume_analysis_test = {
        "message": "Please analyze my resume for climate tech positions",
        "conversation_id": f"tool_test_resume_{int(time.time())}",
        "context": {
            "tool_test": "resume_analysis",
            "resume_text": "John Doe - Environmental Engineer with 3 years experience in renewable energy projects, solar panel installation, and sustainability consulting. Skills: Python, GIS, project management, LEED certification."
        }
    }
    
    try:
        response = requests.post(f"{FRONTEND_URL}/api/v1/resume-analysis", 
                               headers=headers, json=resume_analysis_test, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check for analysis components
            has_analysis = bool(data.get("analysis") or data.get("feedback"))
            has_suggestions = bool(data.get("suggestions") or data.get("recommendations"))
            
            analysis_metrics = {
                "has_analysis": has_analysis,
                "has_suggestions": has_suggestions,
                "response_length": len(str(data))
            }
            
            success = response.status_code == 200 and has_analysis
            results.add_result("Tool Calls", "Resume Analysis", 
                             success, str(data)[:200] + "...", analysis_metrics)
        else:
            results.add_result("Tool Calls", "Resume Analysis", 
                             False, f"HTTP {response.status_code}")
    except Exception as e:
        results.add_result("Tool Calls", "Resume Analysis", 
                         False, f"Error: {str(e)}")

def test_domain_knowledge(token, results):
    """Test climate and sustainability domain knowledge"""
    log_test("🌍 Testing Domain Knowledge")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    domain_tests = [
        {
            "name": "Climate Science Knowledge",
            "message": "Explain the relationship between carbon markets and renewable energy certificates (RECs). How do these mechanisms drive investment in clean energy?",
            "keywords": ["carbon", "rec", "renewable energy certificate", "market", "clean energy", "investment"],
            "depth_required": True
        },
        {
            "name": "Policy and Regulation",
            "message": "What are the key differences between the EU Green Deal and the US Inflation Reduction Act in terms of climate job creation?",
            "keywords": ["eu green deal", "inflation reduction act", "policy", "regulation", "jobs"],
            "comparative_analysis": True
        },
        {
            "name": "Technology Trends",
            "message": "What emerging technologies in energy storage are creating new career opportunities, and what skills are employers looking for?",
            "keywords": ["energy storage", "battery", "technology", "career", "skills", "emerging"],
            "future_focused": True
        },
        {
            "name": "Industry Sectors",
            "message": "Compare career paths in corporate sustainability versus environmental consulting. What are the pros and cons of each sector?",
            "keywords": ["corporate sustainability", "environmental consulting", "career path", "sector"],
            "sector_knowledge": True
        }
    ]
    
    for test in domain_tests:
        try:
            test_request = {
                "message": test["message"],
                "conversation_id": f"domain_test_{int(time.time())}_{test['name'].replace(' ', '_').lower()}",
                "context": {"domain_test": test["name"]}
            }
            
            response = requests.post(f"{FRONTEND_URL}/api/v1/interactive-chat", 
                                   headers=headers, json=test_request, timeout=45)
            
            if response.status_code == 200:
                data = response.json()
                content = data.get("content", "").lower()
                
                # Check for keyword coverage
                keyword_matches = sum(1 for keyword in test["keywords"] if keyword.lower() in content)
                keyword_coverage = keyword_matches / len(test["keywords"])
                
                # Check for depth and quality indicators
                quality_indicators = [
                    len(content) > 300,  # Substantial response
                    "example" in content or "for instance" in content,  # Concrete examples
                    content.count(".") > 5,  # Multiple points
                ]
                
                if test.get("depth_required"):
                    quality_indicators.extend([
                        "mechanism" in content or "how" in content,
                        "because" in content or "due to" in content
                    ])
                
                if test.get("comparative_analysis"):
                    quality_indicators.extend([
                        "difference" in content or "compare" in content,
                        "whereas" in content or "while" in content
                    ])
                
                domain_metrics = {
                    "keyword_coverage": f"{keyword_coverage:.1%}",
                    "response_length": len(content),
                    "quality_indicators": f"{sum(quality_indicators)}/{len(quality_indicators)}",
                    "has_examples": "example" in content,
                    "technical_depth": keyword_coverage > 0.6
                }
                
                success = keyword_coverage >= 0.5 and sum(quality_indicators) >= len(quality_indicators) * 0.6
                results.add_result("Domain Knowledge", test["name"], 
                                 success, content[:200] + "...", domain_metrics)
                
            else:
                results.add_result("Domain Knowledge", test["name"], 
                                 False, f"HTTP {response.status_code}")
                
        except Exception as e:
            results.add_result("Domain Knowledge", test["name"], 
                             False, f"Error: {str(e)}")

def test_intelligence_and_reasoning(token, results):
    """Test intelligence, reasoning, and problem-solving capabilities"""
    log_test("🧠 Testing Intelligence and Reasoning")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    reasoning_tests = [
        {
            "name": "Complex Problem Solving",
            "message": "I'm a petroleum engineer who wants to transition to renewable energy, but I'm concerned about salary reduction and skill transferability. I have a mortgage and two kids. How would you approach this transition strategically?",
            "reasoning_types": ["strategic", "risk_analysis", "financial_planning"],
            "complexity_high": True
        },
        {
            "name": "Ethical Reasoning",
            "message": "A company offers me a high-paying job in their 'green' division, but I discover they're also expanding fossil fuel operations. How should I evaluate this opportunity from both career and ethical perspectives?",
            "reasoning_types": ["ethical", "decision_making", "value_alignment"],
            "ethical_dimension": True
        },
        {
            "name": "Systems Thinking",
            "message": "How does the growth of electric vehicles create ripple effects across different climate career sectors - from manufacturing to grid management to policy?",
            "reasoning_types": ["systems", "interconnected", "secondary_effects"],
            "systems_perspective": True
        },
        {
            "name": "Adaptive Problem Solving",
            "message": "Climate policies keep changing, and what seemed like a stable career path in carbon trading might become obsolete. How can I build a climate career that's resilient to policy shifts?",
            "reasoning_types": ["adaptive", "uncertainty", "resilience"],
            "future_planning": True
        }
    ]
    
    for test in reasoning_tests:
        try:
            test_request = {
                "message": test["message"],
                "conversation_id": f"reasoning_test_{int(time.time())}_{test['name'].replace(' ', '_').lower()}",
                "context": {"reasoning_test": test["name"]}
            }
            
            response = requests.post(f"{FRONTEND_URL}/api/v1/interactive-chat", 
                                   headers=headers, json=test_request, timeout=45)
            
            if response.status_code == 200:
                data = response.json()
                content = data.get("content", "").lower()
                
                # Check for reasoning indicators
                reasoning_indicators = [
                    "consider" in content or "think about" in content,
                    "first" in content or "step" in content,
                    "however" in content or "but" in content or "although" in content,
                    "because" in content or "since" in content,
                    "therefore" in content or "as a result" in content,
                    "option" in content or "approach" in content,
                    "risk" in content or "challenge" in content,
                    "strategy" in content or "plan" in content
                ]
                
                # Check for specific reasoning types
                reasoning_quality = []
                if "strategic" in test["reasoning_types"]:
                    reasoning_quality.append("strategy" in content or "plan" in content)
                if "ethical" in test["reasoning_types"]:
                    reasoning_quality.append("value" in content or "ethical" in content or "principle" in content)
                if "systems" in test["reasoning_types"]:
                    reasoning_quality.append("connect" in content or "affect" in content or "impact" in content)
                
                intelligence_metrics = {
                    "reasoning_indicators": f"{sum(reasoning_indicators)}/{len(reasoning_indicators)}",
                    "reasoning_quality": f"{sum(reasoning_quality)}/{len(reasoning_quality)}",
                    "response_depth": len(content),
                    "structured_thinking": "first" in content or "1." in content,
                    "considers_tradeoffs": "however" in content or "trade-off" in content
                }
                
                success = (sum(reasoning_indicators) >= 4 and 
                          sum(reasoning_quality) >= len(reasoning_quality) * 0.6 and
                          len(content) > 200)
                
                results.add_result("Intelligence & Reasoning", test["name"], 
                                 success, content[:200] + "...", intelligence_metrics)
                
            else:
                results.add_result("Intelligence & Reasoning", test["name"], 
                                 False, f"HTTP {response.status_code}")
                
        except Exception as e:
            results.add_result("Intelligence & Reasoning", test["name"], 
                             False, f"Error: {str(e)}")

def test_empathy_and_emotional_intelligence(token, results):
    """Test empathy and emotional intelligence in responses"""
    log_test("❤️ Testing Empathy and Emotional Intelligence")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    empathy_tests = [
        {
            "name": "Career Anxiety Support",
            "message": "I'm 45 years old and feel like it's too late to make a meaningful impact on climate change. I'm scared about changing careers at my age but I feel guilty staying in my current job that doesn't align with my values.",
            "emotional_elements": ["age_anxiety", "fear", "guilt", "meaning", "values"],
            "support_needed": True
        },
        {
            "name": "Imposter Syndrome",
            "message": "I just got hired at a major renewable energy company, but I feel like I don't belong. Everyone seems so much more knowledgeable than me. I'm worried they'll realize I'm not qualified.",
            "emotional_elements": ["imposter_syndrome", "inadequacy", "worry", "belonging"],
            "confidence_building": True
        },
        {
            "name": "Financial Stress",
            "message": "I want to work for a climate nonprofit but the pay cut would be significant. I'm supporting my aging parents and worried about taking care of my family while doing meaningful work.",
            "emotional_elements": ["financial_stress", "family_responsibility", "sacrifice", "meaning"],
            "practical_empathy": True
        },
        {
            "name": "Overwhelming Climate Anxiety",
            "message": "Sometimes I feel so overwhelmed by climate change that I don't know if anything I do matters. It's affecting my motivation to pursue climate careers because it all feels hopeless.",
            "emotional_elements": ["overwhelm", "hopelessness", "climate_anxiety", "motivation"],
            "hope_building": True
        }
    ]
    
    for test in empathy_tests:
        try:
            test_request = {
                "message": test["message"],
                "conversation_id": f"empathy_test_{int(time.time())}_{test['name'].replace(' ', '_').lower()}",
                "context": {"empathy_test": test["name"], "emotional_support_needed": True}
            }
            
            response = requests.post(f"{FRONTEND_URL}/api/v1/interactive-chat", 
                                   headers=headers, json=test_request, timeout=45)
            
            if response.status_code == 200:
                data = response.json()
                content = data.get("content", "").lower()
                
                # Check for empathy indicators
                empathy_indicators = [
                    "understand" in content or "hear" in content,
                    "feel" in content or "feeling" in content,
                    "normal" in content or "common" in content,
                    "not alone" in content or "many people" in content,
                    "valid" in content or "legitimate" in content,
                    "support" in content or "help" in content
                ]
                
                # Check for emotional acknowledgment
                emotional_acknowledgment = []
                for element in test["emotional_elements"]:
                    if element == "age_anxiety" and ("age" in content or "late" in content):
                        emotional_acknowledgment.append(True)
                    elif element == "fear" and ("fear" in content or "scared" in content):
                        emotional_acknowledgment.append(True)
                    elif element == "guilt" and ("guilt" in content):
                        emotional_acknowledgment.append(True)
                    elif element == "imposter_syndrome" and ("imposter" in content or "belong" in content):
                        emotional_acknowledgment.append(True)
                    elif element == "financial_stress" and ("financial" in content or "money" in content or "pay" in content):
                        emotional_acknowledgment.append(True)
                    elif element == "overwhelm" and ("overwhelm" in content):
                        emotional_acknowledgment.append(True)
                    else:
                        emotional_acknowledgment.append(False)
                
                # Check for constructive guidance
                constructive_elements = [
                    "step" in content or "start" in content,
                    "can" in content or "able" in content,
                    "strength" in content or "experience" in content,
                    "opportunity" in content or "possibility" in content
                ]
                
                empathy_metrics = {
                    "empathy_indicators": f"{sum(empathy_indicators)}/{len(empathy_indicators)}",
                    "emotional_acknowledgment": f"{sum(emotional_acknowledgment)}/{len(emotional_acknowledgment)}",
                    "constructive_elements": f"{sum(constructive_elements)}/{len(constructive_elements)}",
                    "response_warmth": "understand" in content or "hear" in content,
                    "offers_hope": "can" in content or "possible" in content
                }
                
                success = (sum(empathy_indicators) >= 3 and 
                          sum(emotional_acknowledgment) >= len(emotional_acknowledgment) * 0.5 and
                          sum(constructive_elements) >= 2)
                
                results.add_result("Empathy & Emotional Intelligence", test["name"], 
                                 success, content[:200] + "...", empathy_metrics)
                
            else:
                results.add_result("Empathy & Emotional Intelligence", test["name"], 
                                 False, f"HTTP {response.status_code}")
                
        except Exception as e:
            results.add_result("Empathy & Emotional Intelligence", test["name"], 
                             False, f"Error: {str(e)}")

def test_human_in_the_loop(token, results):
    """Test human-in-the-loop functionality and user steering"""
    log_test("🤝 Testing Human-in-the-Loop Interactions")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test 1: User Preference Learning
    preference_test = {
        "message": "I'm interested in climate careers but I prefer remote work, need good work-life balance, and want to avoid high-stress environments. Can you tailor your suggestions to my preferences?",
        "conversation_id": f"hitl_preferences_{int(time.time())}",
        "context": {
            "user_preferences": {
                "work_style": "remote",
                "work_life_balance": "high_priority",
                "stress_tolerance": "low"
            },
            "personalization_test": True
        }
    }
    
    try:
        response = requests.post(f"{FRONTEND_URL}/api/v1/supervisor-chat", 
                               headers=headers, json=preference_test, timeout=45)
        
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", "").lower()
            
            # Check for preference acknowledgment
            preference_indicators = [
                "remote" in content,
                "work-life balance" in content or "balance" in content,
                "stress" in content or "high-pressure" in content,
                "preference" in content or "tailor" in content
            ]
            
            personalization_metrics = {
                "acknowledges_preferences": f"{sum(preference_indicators)}/{len(preference_indicators)}",
                "mentions_remote": "remote" in content,
                "addresses_balance": "balance" in content,
                "considers_stress": "stress" in content,
                "personalized_response": len(preference_indicators) >= 3
            }
            
            success = sum(preference_indicators) >= 3
            results.add_result("Human-in-the-Loop", "User Preference Learning", 
                             success, content[:200] + "...", personalization_metrics)
            
        else:
            results.add_result("Human-in-the-Loop", "User Preference Learning", 
                             False, f"HTTP {response.status_code}")
    except Exception as e:
        results.add_result("Human-in-the-Loop", "User Preference Learning", 
                         False, f"Error: {str(e)}")
    
    # Test 2: Clarification and Refinement
    clarification_test = {
        "message": "Actually, I want to modify my previous request. I'm open to some travel but still prefer mostly remote. Also, I'm specifically interested in corporate sustainability roles, not nonprofits.",
        "conversation_id": preference_test["conversation_id"],  # Same conversation
        "context": {
            "refinement_request": True,
            "modification": {
                "travel": "some_ok",
                "sector_preference": "corporate",
                "exclude": "nonprofits"
            }
        }
    }
    
    try:
        response = requests.post(f"{FRONTEND_URL}/api/v1/supervisor-chat", 
                               headers=headers, json=clarification_test, timeout=45)
        
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", "").lower()
            
            # Check for refinement handling
            refinement_indicators = [
                "modify" in content or "update" in content or "change" in content,
                "corporate" in content,
                "sustainability" in content,
                "travel" in content or "some travel" in content,
                "nonprofit" in content  # Should acknowledge what to exclude
            ]
            
            refinement_metrics = {
                "handles_modification": "modify" in content or "update" in content,
                "corporate_focus": "corporate" in content,
                "acknowledges_travel": "travel" in content,
                "excludes_nonprofits": "nonprofit" in content,
                "adaptive_response": sum(refinement_indicators) >= 3
            }
            
            success = sum(refinement_indicators) >= 3
            results.add_result("Human-in-the-Loop", "Preference Refinement", 
                             success, content[:200] + "...", refinement_metrics)
            
        else:
            results.add_result("Human-in-the-Loop", "Preference Refinement", 
                             False, f"HTTP {response.status_code}")
    except Exception as e:
        results.add_result("Human-in-the-Loop", "Preference Refinement", 
                         False, f"Error: {str(e)}")
    
    # Test 3: Decision Point Interaction
    decision_test = {
        "message": "I'm torn between two career paths: 1) ESG analyst at a consulting firm, or 2) sustainability manager at a tech company. Can you help me think through this decision?",
        "conversation_id": f"hitl_decision_{int(time.time())}",
        "context": {
            "decision_support": True,
            "options": ["esg_analyst", "sustainability_manager"],
            "needs_guidance": True
        }
    }
    
    try:
        response = requests.post(f"{FRONTEND_URL}/api/v1/supervisor-chat", 
                               headers=headers, json=decision_test, timeout=45)
        
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", "").lower()
            
            # Check for decision support approach
            decision_indicators = [
                "esg" in content and "analyst" in content,
                "sustainability" in content and "manager" in content,
                "consulting" in content and "tech" in content,
                "question" in content or "consider" in content,
                "help you think" in content or "explore" in content,
                "pros and cons" in content or "advantage" in content
            ]
            
            decision_metrics = {
                "acknowledges_both_options": ("esg" in content) and ("sustainability" in content),
                "explores_tradeoffs": "pros" in content or "advantage" in content,
                "asks_clarifying_questions": "?" in data.get("content", ""),
                "structured_approach": "consider" in content or "think" in content,
                "decision_support_quality": sum(decision_indicators)
            }
            
            success = sum(decision_indicators) >= 4
            results.add_result("Human-in-the-Loop", "Decision Support", 
                             success, content[:200] + "...", decision_metrics)
            
        else:
            results.add_result("Human-in-the-Loop", "Decision Support", 
                             False, f"HTTP {response.status_code}")
    except Exception as e:
        results.add_result("Human-in-the-Loop", "Decision Support", 
                         False, f"Error: {str(e)}")

def run_comprehensive_advanced_tests():
    """Run all advanced feature tests"""
    log_test("🚀 Starting Comprehensive Advanced Features Test Suite")
    print("=" * 80)
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🎯 Testing: Workflows, Agents, Tools, Knowledge, Intelligence, Empathy, HITL")
    print("=" * 80)
    
    # Get authentication token
    token = get_auth_token()
    if not token:
        log_test("❌ Failed to get authentication token. Cannot run tests.")
        return
    
    log_test(f"✅ Authentication successful")
    
    # Initialize results
    results = AdvancedTestResults()
    
    # Run all test categories
    test_workflow_orchestration(token, results)
    print()
    test_agent_specialization(token, results)
    print()
    test_tool_calls_and_functions(token, results)
    print()
    test_domain_knowledge(token, results)
    print()
    test_intelligence_and_reasoning(token, results)
    print()
    test_empathy_and_emotional_intelligence(token, results)
    print()
    test_human_in_the_loop(token, results)
    
    # Generate comprehensive summary
    print(f"\n📊 COMPREHENSIVE ADVANCED FEATURES TEST RESULTS")
    print("=" * 80)
    
    total_time = (datetime.now() - results.start_time).total_seconds()
    
    print(f"🎯 Overall Results:")
    print(f"   Total Tests: {results.total_tests}")
    print(f"   ✅ Passed: {results.passed_tests}")
    print(f"   ❌ Failed: {results.failed_tests}")
    print(f"   Success Rate: {(results.passed_tests/results.total_tests)*100:.1f}%")
    print(f"   Total Time: {total_time:.1f} seconds")
    
    print(f"\n🧪 Category Breakdown:")
    for category in results.results.keys():
        results.print_category_summary(category)
    
    # Advanced insights
    print(f"\n🎯 Advanced Capabilities Assessment:")
    
    # Calculate category scores
    category_scores = {}
    for category, tests in results.results.items():
        passed = sum(1 for r in tests.values() if r["success"])
        total = len(tests)
        category_scores[category] = (passed / total) * 100
    
    for category, score in category_scores.items():
        if score >= 80:
            grade = "🟢 Excellent"
        elif score >= 60:
            grade = "🟡 Good"
        elif score >= 40:
            grade = "🟠 Needs Improvement"
        else:
            grade = "🔴 Requires Attention"
        print(f"   {category}: {score:.1f}% {grade}")
    
    # Save detailed results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = f"advanced_features_test_results_{timestamp}.json"
    
    with open(results_file, 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_tests": results.total_tests,
                "passed": results.passed_tests,
                "failed": results.failed_tests,
                "success_rate": (results.passed_tests/results.total_tests)*100,
                "total_time_seconds": total_time
            },
            "category_scores": category_scores,
            "detailed_results": results.results,
            "test_account": TEST_ACCOUNTS[0]["email"]
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: {results_file}")
    
    # Final assessment
    overall_score = (results.passed_tests/results.total_tests)*100
    if overall_score >= 75:
        print(f"\n🎉 EXCELLENT: System demonstrates strong advanced AI capabilities!")
    elif overall_score >= 60:
        print(f"\n👍 GOOD: System shows solid performance with room for improvement.")
    elif overall_score >= 40:
        print(f"\n⚠️ MODERATE: System has basic functionality but needs enhancement.")
    else:
        print(f"\n🔧 NEEDS WORK: System requires significant improvements in AI capabilities.")
    
    print(f"\n✅ Advanced features testing completed!")

if __name__ == "__main__":
    run_comprehensive_advanced_tests() 