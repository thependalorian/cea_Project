#!/usr/bin/env python3
"""
Consolidate Test Files - Climate Economy Assistant

This script analyzes all existing test files and creates a consolidated
test suite for the working George accounts.

Usage:
    python scripts/consolidate_tests.py
"""

import os
import sys
import json
import requests
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

# Working accounts from our analysis
WORKING_ACCOUNTS = [
    {
        "name": "Admin Account",
        "email": "gnekwaya@joinact.org",
        "password": "ClimateAdmin2025!George_Nekwaya_Act",
        "role": "admin",
        "user_id": "e338dfe3-1ee8-43ad-a5ed-afcb3d8b16e0",
        "expected_features": ["admin_dashboard", "user_management", "all_climate_agents"]
    },
    {
        "name": "Partner Account", 
        "email": "george@buffr.ai",
        "password": "ClimateJobs2025!Buffr_Inc",
        "role": "partner",
        "user_id": "e599e7a9-9a0b-41a3-9884-478a9c200822",
        "expected_features": ["partner_dashboard", "climate_agents", "business_tools"]
    }
]

class TestResults:
    def __init__(self):
        self.results = {}
        self.total_tests = 0
        self.passed_tests = 0
        self.failed_tests = 0
    
    def add_result(self, test_name, success, details=None):
        self.total_tests += 1
        if success:
            self.passed_tests += 1
        else:
            self.failed_tests += 1
        
        self.results[test_name] = {
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
    
    def print_summary(self):
        print(f"\n📊 TEST SUMMARY")
        print("=" * 50)
        print(f"Total Tests: {self.total_tests}")
        print(f"✅ Passed: {self.passed_tests}")
        print(f"❌ Failed: {self.failed_tests}")
        print(f"Success Rate: {(self.passed_tests/self.total_tests)*100:.1f}%")

def log_test(message, level="INFO"):
    """Log test messages with timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

def test_system_health():
    """Test basic system health endpoints"""
    log_test("🏥 Testing System Health")
    results = TestResults()
    
    # Test frontend health
    try:
        response = requests.get(f"{FRONTEND_URL}/api/v1/health", timeout=10)
        success = response.status_code == 200
        results.add_result("frontend_health", success, f"Status: {response.status_code}")
        log_test(f"   Frontend Health: {'✅' if success else '❌'} ({response.status_code})")
    except Exception as e:
        results.add_result("frontend_health", False, str(e))
        log_test(f"   Frontend Health: ❌ ({str(e)})")
    
    # Test backend health
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        success = response.status_code == 200
        results.add_result("backend_health", success, f"Status: {response.status_code}")
        log_test(f"   Backend Health: {'✅' if success else '❌'} ({response.status_code})")
    except Exception as e:
        results.add_result("backend_health", False, str(e))
        log_test(f"   Backend Health: ❌ ({str(e)})")
    
    return results

def test_authentication(account):
    """Test authentication for a specific account"""
    log_test(f"🔐 Testing Authentication: {account['name']}")
    results = TestResults()
    
    # Test login
    try:
        if SUPABASE_URL and SUPABASE_SERVICE_KEY:
            supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
            response = supabase.auth.sign_in_with_password({
                "email": account["email"],
                "password": account["password"]
            })
            
            if response.user:
                access_token = response.session.access_token if response.session else None
                results.add_result(f"login_{account['role']}", True, {
                    "user_id": response.user.id,
                    "email": response.user.email,
                    "token_length": len(access_token) if access_token else 0
                })
                log_test(f"   ✅ Login successful for {account['email']}")
                
                # Sign out immediately
                supabase.auth.sign_out()
                
                return results, access_token
            else:
                results.add_result(f"login_{account['role']}", False, "No user returned")
                log_test(f"   ❌ Login failed for {account['email']}: No user returned")
        else:
            results.add_result(f"login_{account['role']}", False, "Missing Supabase credentials")
            log_test(f"   ❌ Missing Supabase credentials")
            
    except Exception as e:
        results.add_result(f"login_{account['role']}", False, str(e))
        log_test(f"   ❌ Login failed for {account['email']}: {str(e)}")
    
    return results, None

def test_api_endpoints_with_auth(account, token):
    """Test protected API endpoints with authentication token"""
    log_test(f"🔌 Testing API Endpoints: {account['name']}")
    results = TestResults()
    
    if not token:
        log_test("   ⚠️ No token available, skipping API tests")
        return results
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test auth status
    try:
        response = requests.get(f"{FRONTEND_URL}/api/v1/auth/status", headers=headers, timeout=10)
        success = response.status_code == 200
        results.add_result(f"auth_status_{account['role']}", success, response.json() if success else response.text)
        log_test(f"   Auth Status: {'✅' if success else '❌'} ({response.status_code})")
    except Exception as e:
        results.add_result(f"auth_status_{account['role']}", False, str(e))
        log_test(f"   Auth Status: ❌ ({str(e)})")
    
    # Test interactive chat
    try:
        chat_data = {
            "message": "Hello, I'm interested in renewable energy careers in Massachusetts",
            "conversation_id": f"test-{account['user_id']}-{int(datetime.now().timestamp())}"
        }
        response = requests.post(f"{FRONTEND_URL}/api/v1/interactive-chat", 
                               headers=headers, json=chat_data, timeout=30)
        success = response.status_code == 200
        results.add_result(f"interactive_chat_{account['role']}", success, 
                         response.json() if success else response.text)
        log_test(f"   Interactive Chat: {'✅' if success else '❌'} ({response.status_code})")
        
        if success:
            response_data = response.json()
            log_test(f"      Response: {response_data.get('response', 'No response')[:100]}...")
            
    except Exception as e:
        results.add_result(f"interactive_chat_{account['role']}", False, str(e))
        log_test(f"   Interactive Chat: ❌ ({str(e)})")
    
    # Test career search
    try:
        search_data = {
            "query": "renewable energy jobs Massachusetts",
            "location": "Massachusetts, USA",
            "job_type": "full-time"
        }
        response = requests.post(f"{FRONTEND_URL}/api/v1/career-search", 
                               headers=headers, json=search_data, timeout=20)
        success = response.status_code == 200
        results.add_result(f"career_search_{account['role']}", success, 
                         response.json() if success else response.text)
        log_test(f"   Career Search: {'✅' if success else '❌'} ({response.status_code})")
    except Exception as e:
        results.add_result(f"career_search_{account['role']}", False, str(e))
        log_test(f"   Career Search: ❌ ({str(e)})")
    
    # Test workflow status
    try:
        response = requests.get(f"{FRONTEND_URL}/api/v1/workflow-status", headers=headers, timeout=10)
        success = response.status_code == 200
        results.add_result(f"workflow_status_{account['role']}", success, 
                         response.json() if success else response.text)
        log_test(f"   Workflow Status: {'✅' if success else '❌'} ({response.status_code})")
    except Exception as e:
        results.add_result(f"workflow_status_{account['role']}", False, str(e))
        log_test(f"   Workflow Status: ❌ ({str(e)})")
    
    return results

def test_backend_endpoints():
    """Test backend-specific endpoints"""
    log_test("🖥️ Testing Backend Endpoints")
    results = TestResults()
    
    # Test backend health
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        success = response.status_code == 200
        results.add_result("backend_health_detailed", success, response.json() if success else response.text)
        log_test(f"   Backend Health: {'✅' if success else '❌'} ({response.status_code})")
    except Exception as e:
        results.add_result("backend_health_detailed", False, str(e))
        log_test(f"   Backend Health: ❌ ({str(e)})")
    
    # Test OpenAPI docs
    try:
        response = requests.get(f"{BACKEND_URL}/docs", timeout=10)
        success = response.status_code == 200
        results.add_result("backend_docs", success, f"Status: {response.status_code}")
        log_test(f"   Backend Docs: {'✅' if success else '❌'} ({response.status_code})")
    except Exception as e:
        results.add_result("backend_docs", False, str(e))
        log_test(f"   Backend Docs: ❌ ({str(e)})")
    
    return results

def clean_up_old_test_files():
    """Identify and list old test files for cleanup"""
    log_test("🧹 Analyzing Test Files for Cleanup")
    
    old_test_files = [
        "./test_auth_integration.py",
        "./test_jwt_validation.py", 
        "./test_authenticated_profile.py",
        "./test_full_integration.py",
        "./test_direct_auth.py",
        "./test_api.py",
        "./comprehensive-ai-test.js",
        "./test-backend.js",
        "./comprehensive-ai-test-report-2025-06-10T11-09-20-026Z.json",
        "./api_test_results_20250611_104357.json"
    ]
    
    existing_files = []
    for file_path in old_test_files:
        if os.path.exists(file_path):
            existing_files.append(file_path)
    
    log_test(f"   Found {len(existing_files)} old test files:")
    for file_path in existing_files:
        file_size = os.path.getsize(file_path) / 1024  # KB
        log_test(f"      • {file_path} ({file_size:.1f} KB)")
    
    return existing_files

def run_comprehensive_tests():
    """Run all consolidated tests"""
    log_test("🚀 Starting Comprehensive Test Suite")
    print("=" * 70)
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 Frontend: {FRONTEND_URL}")
    print(f"🖥️ Backend: {BACKEND_URL}")
    print("=" * 70)
    
    all_results = []
    
    # Test system health
    health_results = test_system_health()
    all_results.append(health_results)
    
    # Test backend endpoints
    backend_results = test_backend_endpoints()
    all_results.append(backend_results)
    
    # Test each working account
    for account in WORKING_ACCOUNTS:
        print(f"\n🧪 Testing Account: {account['name']}")
        print("-" * 50)
        
        # Test authentication
        auth_results, token = test_authentication(account)
        all_results.append(auth_results)
        
        # Test API endpoints with auth
        if token:
            api_results = test_api_endpoints_with_auth(account, token)
            all_results.append(api_results)
        else:
            log_test(f"   ⚠️ Skipping API tests for {account['name']} (no token)")
    
    # Cleanup analysis
    print(f"\n🧹 Test File Cleanup Analysis")
    print("-" * 50)
    old_files = clean_up_old_test_files()
    
    # Generate comprehensive summary
    print(f"\n📊 COMPREHENSIVE TEST RESULTS")
    print("=" * 70)
    
    total_tests = sum(r.total_tests for r in all_results)
    total_passed = sum(r.passed_tests for r in all_results)
    total_failed = sum(r.failed_tests for r in all_results)
    
    print(f"🎯 Overall Results:")
    print(f"   Total Tests: {total_tests}")
    print(f"   ✅ Passed: {total_passed}")
    print(f"   ❌ Failed: {total_failed}")
    print(f"   Success Rate: {(total_passed/total_tests)*100:.1f}%")
    
    print(f"\n🧪 Test Categories:")
    for i, result in enumerate(all_results):
        category = ["System Health", "Backend", "Admin Auth", "Admin APIs", "Partner Auth", "Partner APIs"][i] if i < 6 else f"Test {i+1}"
        print(f"   {category}: {result.passed_tests}/{result.total_tests} passed")
    
    print(f"\n🔗 Access URLs:")
    print(f"   Frontend: {FRONTEND_URL}")
    print(f"   Backend API: {BACKEND_URL}/docs")
    
    print(f"\n🔑 Working Credentials:")
    for account in WORKING_ACCOUNTS:
        print(f"   {account['role'].title()}: {account['email']}")
    
    print(f"\n🧹 Cleanup Recommendations:")
    if old_files:
        print(f"   Consider removing {len(old_files)} old test files:")
        for file_path in old_files[:5]:  # Show first 5
            print(f"      rm {file_path}")
        if len(old_files) > 5:
            print(f"      ... and {len(old_files) - 5} more")
    else:
        print("   ✅ No old test files found")
    
    print(f"\n✅ Comprehensive testing completed!")
    
    # Save results to file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = f"test_results_consolidated_{timestamp}.json"
    
    with open(results_file, 'w') as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "total_tests": total_tests,
                "passed": total_passed,
                "failed": total_failed,
                "success_rate": (total_passed/total_tests)*100
            },
            "accounts_tested": WORKING_ACCOUNTS,
            "detailed_results": [r.results for r in all_results],
            "old_files_found": old_files
        }, f, indent=2)
    
    log_test(f"📄 Detailed results saved to: {results_file}")

if __name__ == "__main__":
    run_comprehensive_tests() 