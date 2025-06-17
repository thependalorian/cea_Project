#!/usr/bin/env python3
"""
Production Validation Script for Climate Economy Assistant
Comprehensive pre-deployment validation and security checks
"""

import os
import sys
import json
import subprocess
import re
from datetime import datetime
from pathlib import Path

class ProductionValidator:
    """Comprehensive production readiness validator"""
    
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.validation_results = []
        self.critical_issues = []
        self.warnings = []
        
    def run_all_validations(self):
        """Run all production validation checks"""
        
        print("🔐 **PRODUCTION VALIDATION SUITE**")
        print("=" * 50)
        print(f"🕐 Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"📁 Project Root: {self.project_root}")
        print()
        
        # Run all validation checks
        checks = [
            ("Mock Data Elimination", self._check_mock_data),
            ("Frontend Security (No Direct DB)", self._check_frontend_security),
            ("Agent File Integrity", self._check_agent_files),
            ("Database Integration", self._check_database_integration),
            ("API Endpoint Security", self._check_api_security),
            ("Environment Configuration", self._check_environment),
            ("LangGraph Agent Orchestration", self._check_langgraph_setup),
            ("Authentication & Authorization", self._check_auth_setup),
            ("Production Dependencies", self._check_dependencies)
        ]
        
        passed_checks = 0
        total_checks = len(checks)
        
        for i, (check_name, check_function) in enumerate(checks, 1):
            print(f"🔍 {i}/{total_checks}: {check_name}")
            print("-" * 40)
            
            try:
                result = check_function()
                if result:
                    print("✅ PASSED\n")
                    passed_checks += 1
                else:
                    print("❌ FAILED\n")
            except Exception as e:
                print(f"❌ ERROR: {str(e)}\n")
                self.critical_issues.append(f"{check_name}: {str(e)}")
        
        # Generate final report
        self._generate_final_report(passed_checks, total_checks)
        
        return passed_checks == total_checks and len(self.critical_issues) == 0
    
    def _check_mock_data(self):
        """Check for any remaining mock data in the codebase"""
        
        mock_patterns = [
            r"generate_mock_",
            r"mock_data",
            r"MOCK_",
            r"fake_data",
            r"dummy_data",
            r"test_data.*=.*\[",
            r"sample_data"
        ]
        
        search_paths = [
            "app/",
            "components/",
            "lib/",
            "hooks/",
            "backend/",
            "scripts/"
        ]
        
        mock_files = []
        
        for path in search_paths:
            full_path = self.project_root / path
            if full_path.exists():
                for file_path in full_path.rglob("*.py"):
                    if self._file_contains_patterns(file_path, mock_patterns):
                        mock_files.append(str(file_path.relative_to(self.project_root)))
                
                for file_path in full_path.rglob("*.ts"):
                    if self._file_contains_patterns(file_path, mock_patterns):
                        mock_files.append(str(file_path.relative_to(self.project_root)))
                
                for file_path in full_path.rglob("*.tsx"):
                    if self._file_contains_patterns(file_path, mock_patterns):
                        mock_files.append(str(file_path.relative_to(self.project_root)))
        
        if mock_files:
            print(f"❌ Found mock data in {len(mock_files)} files:")
            for file in mock_files[:5]:  # Show first 5
                print(f"   • {file}")
            if len(mock_files) > 5:
                print(f"   • ... and {len(mock_files) - 5} more")
            self.critical_issues.append(f"Mock data found in {len(mock_files)} files")
            return False
        
        print("✅ No mock data patterns detected")
        return True
    
    def _check_frontend_security(self):
        """Check that frontend doesn't have direct database access"""
        
        # Patterns that are dangerous in CLIENT components only
        client_dangerous_patterns = [
            r"createClient\(\).*from.*supabase/client",
            r"supabase\.from\(",
            r"\.select\(\)",
            r"\.insert\(\)",
            r"\.update\(\)",
            r"\.delete\(\)"
        ]
        
        # Server components are allowed to use server-side Supabase
        server_safe_patterns = [
            r"createClient.*from.*supabase/server",
            r"cookies\(\)",
            r"export default async function"
        ]
        
        violations = []
        
        # Check components/ directory (should be client-side only)
        components_path = self.project_root / "components"
        if components_path.exists():
            for file_path in components_path.rglob("*.tsx"):
                content = file_path.read_text()
                
                # Skip if it's using useAuth context (secure pattern)
                if "useAuth()" in content:
                    continue
                    
                if self._file_contains_patterns(file_path, client_dangerous_patterns):
                    violations.append(str(file_path.relative_to(self.project_root)))
        
        # Check hooks/ directory (should be client-side only, but realtime is OK)
        hooks_path = self.project_root / "hooks"
        if hooks_path.exists():
            for file_path in hooks_path.rglob("*.tsx"):
                content = file_path.read_text()
                
                # Skip realtime hooks (they use channels, not direct DB)
                if "realtime" in str(file_path).lower() or "channel" in content:
                    continue
                    
                # Skip if it's using useAuth context (secure pattern)
                if "useAuth()" in content:
                    continue
                    
                if self._file_contains_patterns(file_path, client_dangerous_patterns):
                    violations.append(str(file_path.relative_to(self.project_root)))
        
        # Check app/ directory - distinguish between client and server components
        app_path = self.project_root / "app"
        if app_path.exists():
            for file_path in app_path.rglob("*.tsx"):
                # Skip API routes
                if "api/" in str(file_path):
                    continue
                    
                content = file_path.read_text()
                
                # If it's a server component (has async function + cookies), it's OK
                is_server_component = any(re.search(pattern, content) for pattern in server_safe_patterns)
                
                if not is_server_component:
                    # It's a client component, check for violations
                    if "useAuth()" not in content and self._file_contains_patterns(file_path, client_dangerous_patterns):
                        violations.append(str(file_path.relative_to(self.project_root)))
        
        if violations:
            print(f"❌ Direct database access found in {len(violations)} frontend files:")
            for file in violations[:3]:
                print(f"   • {file}")
            if len(violations) > 3:
                print(f"   • ... and {len(violations) - 3} more")
            self.critical_issues.append(f"Frontend database leaks in {len(violations)} files")
            return False
        
        print("✅ No direct database access in frontend")
        return True
    
    def _check_agent_files(self):
        """Check that all required agent files exist and are properly structured"""
        
        required_agents = [
            "backend/core/agents/climate_agent.py",
            "backend/core/agents/empathy_agent.py", 
            "backend/core/agents/resume.py",
            "backend/core/agents/veteran.py",
            "backend/core/agents/langgraph_agents.py"
        ]
        
        missing_agents = []
        malformed_agents = []
        
        for agent_path in required_agents:
            full_path = self.project_root / agent_path
            
            if not full_path.exists():
                missing_agents.append(agent_path)
                continue
            
            # Check if agent file has required structure
            try:
                content = full_path.read_text()
                
                # Check for required components
                required_components = ["class", "async def process", "__init__"]
                
                if not all(component in content for component in required_components):
                    malformed_agents.append(agent_path)
                    
            except Exception as e:
                malformed_agents.append(f"{agent_path} (Error: {str(e)})")
        
        if missing_agents or malformed_agents:
            if missing_agents:
                print(f"❌ Missing agent files: {missing_agents}")
            if malformed_agents:
                print(f"❌ Malformed agent files: {malformed_agents}")
            return False
        
        print("✅ All required agent files present and properly structured")
        return True
    
    def _check_database_integration(self):
        """Check database integration and API endpoints"""
        
        api_endpoints = [
            "app/api/v1/dashboard/admin/stats/route.ts",
            "app/api/v1/dashboard/job_seeker/stats/route.ts", 
            "app/api/v1/dashboard/partner/stats/route.ts"
        ]
        
        missing_endpoints = []
        
        for endpoint in api_endpoints:
            full_path = self.project_root / endpoint
            if not full_path.exists():
                missing_endpoints.append(endpoint)
        
        if missing_endpoints:
            print(f"❌ Missing API endpoints: {missing_endpoints}")
            return False
        
        # Check for proper database queries in endpoints
        for endpoint in api_endpoints:
            full_path = self.project_root / endpoint
            try:
                content = full_path.read_text()
                if "supabase" not in content or "from(" not in content:
                    print(f"❌ {endpoint} doesn't appear to use database queries")
                    return False
            except Exception as e:
                print(f"❌ Error reading {endpoint}: {str(e)}")
                return False
        
        print("✅ Database integration endpoints properly configured")
        return True
    
    def _check_api_security(self):
        """Check API endpoint security measures"""
        
        security_patterns = [
            r"auth.*required",
            r"jwt",
            r"authorization",
            r"bearer",
            r"role.*check"
        ]
        
        api_path = self.project_root / "app/api"
        if not api_path.exists():
            print("❌ API directory not found")
            return False
        
        secured_endpoints = 0
        total_endpoints = 0
        
        for route_file in api_path.rglob("route.ts"):
            total_endpoints += 1
            
            try:
                content = route_file.read_text().lower()
                if any(re.search(pattern, content) for pattern in security_patterns):
                    secured_endpoints += 1
            except Exception:
                continue
        
        if total_endpoints == 0:
            print("❌ No API endpoints found")
            return False
        
        security_ratio = secured_endpoints / total_endpoints
        
        if security_ratio < 0.8:  # At least 80% should have security
            print(f"❌ Only {secured_endpoints}/{total_endpoints} endpoints have security measures")
            return False
        
        print(f"✅ {secured_endpoints}/{total_endpoints} endpoints have security measures")
        return True
    
    def _check_environment(self):
        """Check environment configuration"""
        
        env_file = self.project_root / ".env"
        env_local = self.project_root / ".env.local"
        
        if not env_file.exists() and not env_local.exists():
            print("❌ No environment file found (.env or .env.local)")
            return False
        
        # Check for required environment variables
        required_vars = [
            "NEXT_PUBLIC_SUPABASE_URL",
            "NEXT_PUBLIC_SUPABASE_ANON_KEY",
            "SUPABASE_SERVICE_ROLE_KEY"
        ]
        
        env_content = ""
        if env_file.exists():
            env_content += env_file.read_text()
        if env_local.exists():
            env_content += env_local.read_text()
        
        missing_vars = []
        for var in required_vars:
            if var not in env_content:
                missing_vars.append(var)
        
        if missing_vars:
            print(f"❌ Missing environment variables: {missing_vars}")
            return False
        
        print("✅ Environment configuration complete")
        return True
    
    def _check_langgraph_setup(self):
        """Check LangGraph agent orchestration setup"""
        
        langgraph_file = self.project_root / "backend/core/agents/langgraph_agents.py"
        
        if not langgraph_file.exists():
            print("❌ LangGraph orchestration file missing")
            return False
        
        try:
            content = langgraph_file.read_text()
            
            required_components = [
                "LangGraphOrchestrator",
                "SupervisorAgent", 
                "StateGraph",
                "process_conversation"
            ]
            
            missing_components = []
            for component in required_components:
                if component not in content:
                    missing_components.append(component)
            
            if missing_components:
                print(f"❌ Missing LangGraph components: {missing_components}")
                return False
            
            print("✅ LangGraph orchestration properly configured")
            return True
            
        except Exception as e:
            print(f"❌ Error checking LangGraph setup: {str(e)}")
            return False
    
    def _check_auth_setup(self):
        """Check authentication and authorization setup"""
        
        auth_files = [
            "lib/supabase/server.ts",
            "lib/auth-utils.ts",
            "middleware.ts"
        ]
        
        missing_files = []
        for file in auth_files:
            if not (self.project_root / file).exists():
                missing_files.append(file)
        
        if missing_files:
            print(f"❌ Missing auth files: {missing_files}")
            return False
        
        print("✅ Authentication setup complete")
        return True
    
    def _check_dependencies(self):
        """Check production dependencies"""
        
        package_json = self.project_root / "package.json"
        
        if not package_json.exists():
            print("❌ package.json not found")
            return False
        
        try:
            with open(package_json) as f:
                package_data = json.load(f)
            
            required_deps = [
                "@supabase/supabase-js",
                "@supabase/ssr", 
                "next",
                "react",
                "tailwindcss",
                "daisyui"
            ]
            
            dependencies = {**package_data.get("dependencies", {}), **package_data.get("devDependencies", {})}
            
            missing_deps = []
            for dep in required_deps:
                if dep not in dependencies:
                    missing_deps.append(dep)
            
            if missing_deps:
                print(f"❌ Missing dependencies: {missing_deps}")
                return False
            
            print("✅ All required dependencies present")
            return True
            
        except Exception as e:
            print(f"❌ Error checking dependencies: {str(e)}")
            return False
    
    def _file_contains_patterns(self, file_path, patterns):
        """Check if file contains any of the given patterns"""
        
        try:
            content = file_path.read_text().lower()
            return any(re.search(pattern.lower(), content) for pattern in patterns)
        except Exception:
            return False
    
    def _generate_final_report(self, passed_checks, total_checks):
        """Generate final validation report"""
        
        print("=" * 50)
        print("📊 **PRODUCTION VALIDATION RESULTS**")
        print("=" * 50)
        
        score = (passed_checks / total_checks) * 100
        print(f"🎯 Overall Score: {passed_checks}/{total_checks} ({score:.1f}%)")
        
        if score == 100:
            print("🚀 **STATUS: PRODUCTION READY**")
            print("✅ All systems validated - safe to deploy!")
        elif score >= 90:
            print("⚠️ **STATUS: MINOR ISSUES**")
            print("🔧 Address minor issues before deployment")
        elif score >= 75:
            print("⚠️ **STATUS: MODERATE ISSUES**") 
            print("🛠️ Significant fixes needed before deployment")
        else:
            print("❌ **STATUS: CRITICAL ISSUES**")
            print("🚨 DO NOT DEPLOY - Major fixes required")
        
        if self.critical_issues:
            print(f"\n🚨 Critical Issues ({len(self.critical_issues)}):")
            for issue in self.critical_issues:
                print(f"   • {issue}")
        
        if self.warnings:
            print(f"\n⚠️ Warnings ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"   • {warning}")
        
        print(f"\n🕐 Completed: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

def main():
    """Main validation execution"""
    
    validator = ProductionValidator()
    success = validator.run_all_validations()
    
    if success:
        print("\n🎉 **VALIDATION PASSED - READY FOR DEPLOYMENT!**")
        sys.exit(0)
    else:
        print("\n⚠️ **VALIDATION FAILED - REVIEW ISSUES BEFORE DEPLOYMENT**")
        sys.exit(1)

if __name__ == "__main__":
    main() 