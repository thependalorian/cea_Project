#!/usr/bin/env python3
"""
Complete George Nekwaya Testing Suite
====================================

This script provides a complete 100% fix workflow:
1. Creates George's profiles in the database
2. Runs comprehensive triple access tests
3. Validates all functionality
4. Provides detailed health assessment

Ensures 100% alignment with the actual Supabase schema.
"""

import asyncio
import os
import sys

# Add backend to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from create_george_profiles import create_george_profiles
from test_george_nekwaya_triple_access import GeorgeTripleAccessTester


async def run_complete_george_tests():
    """Run the complete George Nekwaya testing workflow"""
    print("🚀 Starting Complete George Nekwaya Testing Suite")
    print("=" * 60)

    # Step 1: Create profiles
    print("\n📝 STEP 1: Creating George's Database Profiles")
    print("-" * 40)
    create_george_profiles()

    # Step 2: Run comprehensive tests
    print("\n🧪 STEP 2: Running Comprehensive Triple Access Tests")
    print("-" * 40)
    tester = GeorgeTripleAccessTester()
    await tester.initialize()
    results = await tester.run_comprehensive_george_tests()

    # Step 3: Final assessment
    print("\n📊 STEP 3: Final Assessment")
    print("-" * 40)

    health_score = results["george_triple_access_health"]

    print(f"🌟 George's Triple Access Health: {health_score*100:.1f}%")

    if health_score >= 0.85:
        print("✅ STATUS: EXCELLENT - All systems operational")
        print("🎯 George's triple access is fully functional!")
    elif health_score >= 0.70:
        print("✅ STATUS: GOOD - Minor improvements available")
        print("🔧 Some optimizations possible but core functionality works")
    elif health_score >= 0.50:
        print("⚠️ STATUS: FAIR - Needs improvement")
        print("🛠️ Several issues need addressing")
    else:
        print("❌ STATUS: POOR - Major issues detected")
        print("🚨 Significant fixes required")

    # Detailed breakdown
    metrics = results["overall_metrics"]
    print(f"\n📋 Detailed Breakdown:")
    print(f"   Database Profiles: {'✅' if metrics['database_success'] else '❌'}")
    print(f"   Agent Routing: {metrics['routing_success_rate']*100:.1f}%")
    print(f"   Permissions: {metrics['permission_success_rate']*100:.1f}%")
    print(f"   Profile Switching: {metrics['switching_success_rate']*100:.1f}%")

    return results


if __name__ == "__main__":
    asyncio.run(run_complete_george_tests())
