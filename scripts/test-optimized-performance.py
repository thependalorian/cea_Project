#!/usr/bin/env python3
"""
🚀 Optimized Framework Performance Test
Comprehensive performance testing script to compare old vs optimized frameworks.

Usage:
    python scripts/test-optimized-performance.py
"""

import asyncio
import aiohttp
import time
import json
import statistics
from datetime import datetime
from typing import List, Dict, Any
import argparse
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

class PerformanceTester:
    """Performance testing for optimized vs original framework"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.test_messages = [
            "I'm a veteran looking for clean energy jobs",
            "What solar programs are available in disadvantaged communities?", 
            "Tell me about international climate policies",
            "I need help with renewable energy career guidance",
            "What training programs exist for environmental justice work?",
            "How can I transition from military to clean energy sector?",
            "Are there apprenticeships for solar installation?",
            "What grants exist for disadvantaged community energy projects?",
            "Tell me about the Paris Climate Agreement implementation",
            "I want to become a wind turbine technician"
        ]
        
    async def test_original_framework(self, session: aiohttp.ClientSession, message: str) -> Dict[str, Any]:
        """Test original agent framework"""
        start_time = time.perf_counter()
        
        try:
            async with session.post(
                f"{self.base_url}/api/v1/agents", 
                json={
                    "message": message,
                    "conversation_id": f"test_orig_{int(time.time())}",
                    "user_id": "test_user"
                }
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    total_time = (time.perf_counter() - start_time) * 1000
                    
                    return {
                        "success": True,
                        "response_time_ms": total_time,
                        "agent": result.get("agent", "unknown"),
                        "framework": "original",
                        "error": None
                    }
                else:
                    return {
                        "success": False,
                        "response_time_ms": (time.perf_counter() - start_time) * 1000,
                        "error": f"HTTP {response.status}",
                        "framework": "original"
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "response_time_ms": (time.perf_counter() - start_time) * 1000,
                "error": str(e),
                "framework": "original"
            }
    
    async def test_optimized_framework(self, session: aiohttp.ClientSession, message: str) -> Dict[str, Any]:
        """Test optimized agent framework"""
        start_time = time.perf_counter()
        
        try:
            async with session.post(
                f"{self.base_url}/api/agents/optimized",
                json={
                    "message": message,
                    "conversation_id": f"test_opt_{int(time.time())}",
                    "user_id": "test_user",
                    "stream": False
                }
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    total_time = (time.perf_counter() - start_time) * 1000
                    
                    return {
                        "success": True,
                        "response_time_ms": total_time,
                        "agent": result.get("agent", "unknown"),
                        "routing_time_ms": result.get("metadata", {}).get("routing_time_ms", 0),
                        "cache_hit": result.get("metadata", {}).get("cache_hit", False),
                        "under_threshold": result.get("performance_metrics", {}).get("under_threshold", False),
                        "framework": "optimized",
                        "error": None
                    }
                else:
                    return {
                        "success": False,
                        "response_time_ms": (time.perf_counter() - start_time) * 1000,
                        "error": f"HTTP {response.status}",
                        "framework": "optimized"
                    }
                    
        except Exception as e:
            return {
                "success": False,
                "response_time_ms": (time.perf_counter() - start_time) * 1000,
                "error": str(e),
                "framework": "optimized"
            }
    
    async def run_performance_test(self, num_tests: int = 10, concurrent: int = 3) -> Dict[str, Any]:
        """Run comprehensive performance test"""
        print(f"🚀 Starting performance test with {num_tests} requests ({concurrent} concurrent)")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test connectivity first
        async with aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30)) as session:
            try:
                async with session.get(f"{self.base_url}/health") as response:
                    if response.status != 200:
                        print(f"❌ Backend health check failed: {response.status}")
                        return {"error": "Backend not available"}
            except Exception as e:
                print(f"❌ Cannot connect to backend: {e}")
                return {"error": f"Connection failed: {e}"}
            
            # Run tests
            original_results = []
            optimized_results = []
            
            # Test Original Framework
            print("\n📊 Testing Original Framework...")
            for i in range(num_tests):
                message = self.test_messages[i % len(self.test_messages)]
                print(f"  Test {i+1}/{num_tests}: {message[:50]}...")
                
                result = await self.test_original_framework(session, message)
                original_results.append(result)
                
                if result["success"]:
                    print(f"    ✅ {result['response_time_ms']:.1f}ms - {result['agent']}")
                else:
                    print(f"    ❌ FAILED: {result['error']}")
                
                # Brief pause between requests
                await asyncio.sleep(0.5)
            
            # Test Optimized Framework  
            print("\n⚡ Testing Optimized Framework...")
            for i in range(num_tests):
                message = self.test_messages[i % len(self.test_messages)]
                print(f"  Test {i+1}/{num_tests}: {message[:50]}...")
                
                result = await self.test_optimized_framework(session, message)
                optimized_results.append(result)
                
                if result["success"]:
                    cache_indicator = "🎯" if result.get("cache_hit") else "💾"
                    threshold_indicator = "⚡" if result.get("under_threshold") else "⚠️"
                    print(f"    ✅ {result['response_time_ms']:.1f}ms - {result['agent']} {cache_indicator} {threshold_indicator}")
                else:
                    print(f"    ❌ FAILED: {result['error']}")
                
                # Brief pause between requests
                await asyncio.sleep(0.5)
        
        # Analyze results
        return self.analyze_results(original_results, optimized_results)
    
    def analyze_results(self, original_results: List[Dict], optimized_results: List[Dict]) -> Dict[str, Any]:
        """Analyze and compare performance results"""
        
        # Filter successful results
        orig_success = [r for r in original_results if r["success"]]
        opt_success = [r for r in optimized_results if r["success"]]
        
        if not orig_success or not opt_success:
            return {
                "error": "Insufficient successful results for analysis",
                "original_success_rate": len(orig_success) / len(original_results),
                "optimized_success_rate": len(opt_success) / len(optimized_results)
            }
        
        # Calculate statistics
        orig_times = [r["response_time_ms"] for r in orig_success]
        opt_times = [r["response_time_ms"] for r in opt_success]
        
        # Optimized-specific metrics
        cache_hits = sum(1 for r in opt_success if r.get("cache_hit", False))
        under_threshold = sum(1 for r in opt_success if r.get("under_threshold", False))
        routing_times = [r.get("routing_time_ms", 0) for r in opt_success]
        
        analysis = {
            "test_summary": {
                "total_tests": len(original_results),
                "original_success_rate": len(orig_success) / len(original_results),
                "optimized_success_rate": len(opt_success) / len(optimized_results)
            },
            "original_framework": {
                "avg_response_time_ms": statistics.mean(orig_times),
                "median_response_time_ms": statistics.median(orig_times),
                "min_response_time_ms": min(orig_times),
                "max_response_time_ms": max(orig_times),
                "std_dev_ms": statistics.stdev(orig_times) if len(orig_times) > 1 else 0
            },
            "optimized_framework": {
                "avg_response_time_ms": statistics.mean(opt_times),
                "median_response_time_ms": statistics.median(opt_times),
                "min_response_time_ms": min(opt_times),
                "max_response_time_ms": max(opt_times),
                "std_dev_ms": statistics.stdev(opt_times) if len(opt_times) > 1 else 0,
                "avg_routing_time_ms": statistics.mean(routing_times),
                "cache_hit_rate": (cache_hits / len(opt_success)) * 100,
                "under_threshold_rate": (under_threshold / len(opt_success)) * 100
            },
            "performance_improvement": {
                "speed_improvement_percent": ((statistics.mean(orig_times) - statistics.mean(opt_times)) / statistics.mean(orig_times)) * 100,
                "consistency_improvement": (statistics.stdev(orig_times) - statistics.stdev(opt_times)) if len(orig_times) > 1 and len(opt_times) > 1 else 0,
                "meets_targets": {
                    "routing_under_50ms": statistics.mean(routing_times) < 50,
                    "response_under_1000ms": statistics.mean(opt_times) < 1000,
                    "cache_hit_over_80pct": (cache_hits / len(opt_success)) * 100 > 80
                }
            }
        }
        
        return analysis
    
    def print_analysis(self, analysis: Dict[str, Any]):
        """Print formatted analysis results"""
        if "error" in analysis:
            print(f"\n❌ Analysis Error: {analysis['error']}")
            return
        
        print("\n" + "=" * 60)
        print("📊 PERFORMANCE ANALYSIS RESULTS")
        print("=" * 60)
        
        # Test Summary
        summary = analysis["test_summary"]
        print(f"\n📋 Test Summary:")
        print(f"   Total Tests: {summary['total_tests']}")
        print(f"   Original Success Rate: {summary['original_success_rate']:.1%}")
        print(f"   Optimized Success Rate: {summary['optimized_success_rate']:.1%}")
        
        # Framework Comparison
        orig = analysis["original_framework"]
        opt = analysis["optimized_framework"]
        
        print(f"\n⏱️  Response Time Comparison:")
        print(f"   Original Framework:")
        print(f"     • Average: {orig['avg_response_time_ms']:.1f}ms")
        print(f"     • Median:  {orig['median_response_time_ms']:.1f}ms")
        print(f"     • Range:   {orig['min_response_time_ms']:.1f}ms - {orig['max_response_time_ms']:.1f}ms")
        
        print(f"\n   Optimized Framework:")
        print(f"     • Average: {opt['avg_response_time_ms']:.1f}ms")
        print(f"     • Median:  {opt['median_response_time_ms']:.1f}ms")
        print(f"     • Range:   {opt['min_response_time_ms']:.1f}ms - {opt['max_response_time_ms']:.1f}ms")
        print(f"     • Routing: {opt['avg_routing_time_ms']:.1f}ms average")
        
        # Optimized Metrics
        print(f"\n⚡ Optimized Framework Metrics:")
        print(f"   • Cache Hit Rate: {opt['cache_hit_rate']:.1f}%")
        print(f"   • Under 1s Threshold: {opt['under_threshold_rate']:.1f}%")
        
        # Performance Improvement
        improvement = analysis["performance_improvement"]
        print(f"\n🚀 Performance Improvement:")
        print(f"   • Speed Improvement: {improvement['speed_improvement_percent']:.1f}%")
        
        # Target Achievement
        targets = improvement["meets_targets"]
        print(f"\n🎯 Target Achievement:")
        print(f"   • Routing < 50ms: {'✅ PASS' if targets['routing_under_50ms'] else '❌ FAIL'}")
        print(f"   • Response < 1000ms: {'✅ PASS' if targets['response_under_1000ms'] else '❌ FAIL'}")
        print(f"   • Cache Hit > 80%: {'✅ PASS' if targets['cache_hit_over_80pct'] else '❌ FAIL'}")
        
        # Overall Assessment
        all_targets_met = all(targets.values())
        speed_improvement = improvement['speed_improvement_percent'] > 0
        
        print(f"\n🏆 Overall Assessment:")
        if all_targets_met and speed_improvement:
            print("   ✅ EXCELLENT - All targets met with significant performance improvement!")
        elif speed_improvement:
            print("   ✅ GOOD - Performance improved, some targets may need refinement")
        else:
            print("   ⚠️  NEEDS WORK - Performance optimization requires attention")

async def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Test optimized framework performance")
    parser.add_argument("--tests", type=int, default=10, help="Number of tests to run")
    parser.add_argument("--concurrent", type=int, default=3, help="Concurrent requests")
    parser.add_argument("--url", default="http://localhost:8000", help="Backend URL")
    
    args = parser.parse_args()
    
    tester = PerformanceTester(args.url)
    
    print("🚀 Optimized Framework Performance Test")
    print(f"⚙️  Configuration: {args.tests} tests, {args.concurrent} concurrent")
    print(f"🌐 Backend URL: {args.url}")
    
    analysis = await tester.run_performance_test(args.tests, args.concurrent)
    tester.print_analysis(analysis)
    
    # Save results to file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"performance_test_results_{timestamp}.json"
    
    with open(filename, 'w') as f:
        json.dump(analysis, f, indent=2)
    
    print(f"\n💾 Results saved to: {filename}")

if __name__ == "__main__":
    asyncio.run(main()) 