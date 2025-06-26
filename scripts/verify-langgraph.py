#!/usr/bin/env python3
"""
LangGraph Deployment Verification Script
Verifies that graphs are properly compiled and configuration is valid.
"""

import os
import sys
import json
import logging
from pathlib import Path

# Add backend to Python path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def verify_langgraph_config():
    """Verify langgraph.json configuration"""
    config_path = Path(__file__).parent.parent / "langgraph.json"
    
    if not config_path.exists():
        logger.error("❌ langgraph.json not found")
        return False
    
    try:
        with open(config_path) as f:
            config = json.load(f)
        
        required_keys = ["dependencies", "graphs", "env"]
        for key in required_keys:
            if key not in config:
                logger.error(f"❌ Missing required key '{key}' in langgraph.json")
                return False
        
        logger.info("✅ langgraph.json configuration is valid")
        logger.info(f"📊 Found {len(config['graphs'])} graphs configured:")
        for name, path in config['graphs'].items():
            logger.info(f"  - {name}: {path}")
        
        return True
        
    except json.JSONDecodeError as e:
        logger.error(f"❌ Invalid JSON in langgraph.json: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Error reading langgraph.json: {e}")
        return False

def verify_compiled_graphs():
    """Verify that graphs are properly compiled"""
    try:
        # Test main application graph
        logger.info("🔍 Verifying main application graph...")
        from agents.langgraph.framework import app_graph
        
        if app_graph is None:
            logger.error("❌ app_graph is None")
            return False
        
        if not hasattr(app_graph, 'invoke'):
            logger.error("❌ app_graph is not compiled (missing invoke method)")
            return False
        
        logger.info("✅ Main application graph is properly compiled")
        
        # Test coordinator graph
        logger.info("🔍 Verifying coordinator graph...")
        from agents.agent_coordinator import coordinator_graph
        
        if coordinator_graph is None:
            logger.error("❌ coordinator_graph is None")
            return False
        
        if not hasattr(coordinator_graph, 'invoke'):
            logger.error("❌ coordinator_graph is not compiled (missing invoke method)")
            return False
        
        logger.info("✅ Coordinator graph is properly compiled")
        return True
        
    except ImportError as e:
        logger.error(f"❌ Import error: {e}")
        return False
    except Exception as e:
        logger.error(f"❌ Error verifying graphs: {e}")
        return False

def verify_dependencies():
    """Verify required dependencies are available"""
    required_packages = [
        "langgraph",
        "langchain_core",
        "langsmith",
        "fastapi",
        "uvicorn"
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            logger.info(f"✅ {package} is available")
        except ImportError:
            missing_packages.append(package)
            logger.error(f"❌ {package} is missing")
    
    if missing_packages:
        logger.error(f"❌ Missing packages: {', '.join(missing_packages)}")
        logger.info("Install with: pip install " + " ".join(missing_packages))
        return False
    
    return True

def verify_environment():
    """Verify environment variables"""
    required_env_vars = [
        "SUPABASE_URL",
        "SUPABASE_ANON_KEY", 
        "DEEPSEEK_API_KEY"
    ]
    
    missing_vars = []
    
    for var in required_env_vars:
        if not os.getenv(var):
            missing_vars.append(var)
            logger.error(f"❌ Missing environment variable: {var}")
        else:
            logger.info(f"✅ {var} is set")
    
    if missing_vars:
        logger.error(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        return False
    
    return True

def main():
    """Main verification function"""
    logger.info("🚀 Starting LangGraph deployment verification...")
    
    checks = [
        ("Configuration", verify_langgraph_config),
        ("Dependencies", verify_dependencies), 
        ("Environment", verify_environment),
        ("Compiled Graphs", verify_compiled_graphs)
    ]
    
    passed = 0
    total = len(checks)
    
    for name, check_func in checks:
        logger.info(f"\n📋 Checking {name}...")
        if check_func():
            passed += 1
        else:
            logger.error(f"❌ {name} check failed")
    
    logger.info(f"\n📊 Verification Results: {passed}/{total} checks passed")
    
    if passed == total:
        logger.info("🎉 All checks passed! Ready for LangGraph deployment.")
        logger.info("\n🚀 Next steps:")
        logger.info("1. langgraph dev  # Test locally")
        logger.info("2. langgraph build -t cea-agents  # Build image")
        logger.info("3. langgraph deploy  # Deploy to platform")
        return True
    else:
        logger.error("❌ Some checks failed. Please fix issues before deployment.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 