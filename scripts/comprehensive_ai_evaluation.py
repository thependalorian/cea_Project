#!/usr/bin/env python3
"""Comprehensive AI Evaluation - Test All Advanced Features"""

import requests
import json
import time

def test_scenario(message, scenario_name, expected_capabilities):
    """Test a specific AI scenario"""
    print(f"\n🧪 Testing: {scenario_name}")
    
    url = 'http://localhost:3000/api/v1/interactive-chat'
    data = {
        'message': message,
        'conversation_id': f'test_{scenario_name.lower().replace(" ", "_")}_{int(time.time())}'
    }
    
    try:
        start_time = time.time()
        response = requests.post(url, json=data, timeout=45)
        response_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            if result.get('data') and result['data'].get('response'):
                content = result['data']['response']
                content_lower = content.lower()
                
                print(f"📄 Response ({len(content)} chars, {response_time:.1f}s):")
                print(f"   {content[:200]}...")
                
                # Evaluate capabilities
                detected = {}
                for capability, keywords in expected_capabilities.items():
                    detected[capability] = any(keyword in content_lower for keyword in keywords)
                
                print(f"\n📊 Capabilities Analysis:")
                passed = 0
                for capability, result in detected.items():
                    status = "✅" if result else "❌"
                    print(f"   {status} {capability}")
                    if result:
                        passed += 1
                
                score = (passed / len(detected)) * 100
                print(f"Score: {passed}/{len(detected)} ({score:.1f}%)")
                
                return score, content, detected
            else:
                print("❌ No response content")
                return 0, "", {}
        else:
            print(f"❌ HTTP {response.status_code}: {response.text}")
            return 0, "", {}
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return 0, "", {}

def run_comprehensive_evaluation():
    """Run comprehensive AI evaluation across multiple scenarios"""
    print("🚀 Comprehensive AI Evaluation - Climate Economy Assistant")
    print("=" * 70)
    
    scenarios = [
        {
            "name": "Domain Knowledge Test",
            "message": "Explain the difference between carbon credits and renewable energy certificates (RECs), and how these market mechanisms drive clean energy investment.",
            "capabilities": {
                "Technical Knowledge": ["carbon", "rec", "renewable energy certificate", "market", "mechanism"],
                "Financial Understanding": ["investment", "credit", "price", "trading", "revenue"],
                "Clear Explanation": ["difference", "between", "explain", "how", "why"],
                "Industry Insight": ["clean energy", "policy", "regulation", "compliance"]
            }
        },
        {
            "name": "Complex Problem Solving",
            "message": "I'm a petroleum engineer with 15 years experience who wants to transition to renewable energy, but I'm worried about taking a salary cut with two kids in college. How should I strategically approach this career transition?",
            "capabilities": {
                "Strategic Thinking": ["strategy", "approach", "plan", "step", "transition"],
                "Risk Assessment": ["risk", "consider", "challenge", "concern", "manage"],
                "Financial Awareness": ["salary", "financial", "income", "cost", "budget"],
                "Empathy": ["understand", "worry", "concern", "help", "support"],
                "Practical Advice": ["experience", "skill", "transfer", "leverage", "build"]
            }
        },
        {
            "name": "Systems Thinking",
            "message": "How does the growth of electric vehicles create ripple effects across different climate career sectors - from battery manufacturing to grid infrastructure to policy development?",
            "capabilities": {
                "Interconnected Thinking": ["ripple", "effect", "impact", "influence", "connect"],
                "Multiple Sectors": ["manufacturing", "grid", "policy", "infrastructure", "sector"],
                "Career Applications": ["career", "job", "opportunity", "role", "position"],
                "Technology Understanding": ["electric vehicle", "battery", "technology", "innovation"],
                "Comprehensive View": ["across", "different", "various", "multiple", "range"]
            }
        },
        {
            "name": "Emotional Intelligence",
            "message": "I'm feeling overwhelmed by climate change and sometimes think nothing I do in my career will make a difference. I want to work in sustainability but I'm losing motivation. How do you handle climate anxiety while building a meaningful career?",
            "capabilities": {
                "Emotional Recognition": ["overwhelmed", "feeling", "anxiety", "motivation", "meaningful"],
                "Supportive Response": ["understand", "help", "support", "valid", "normal"],
                "Hope Building": ["difference", "impact", "meaningful", "positive", "change"],
                "Practical Guidance": ["handle", "manage", "approach", "strategy", "focus"],
                "Validation": ["feeling", "common", "many people", "not alone", "valid"]
            }
        },
        {
            "name": "Future-Focused Reasoning",
            "message": "What emerging technologies in climate tech will create the most new job opportunities in the next 5-10 years, and what skills should someone start developing now to be ready?",
            "capabilities": {
                "Future Thinking": ["emerging", "next", "future", "upcoming", "trend"],
                "Technology Awareness": ["technology", "innovation", "development", "advancement"],
                "Job Market Insight": ["opportunity", "job", "career", "demand", "growth"],
                "Skill Guidance": ["skill", "develop", "learn", "prepare", "ready"],
                "Time Horizon": ["5-10 years", "now", "start", "prepare", "future"]
            }
        },
        {
            "name": "Human-in-the-Loop",
            "message": "I'm torn between two job offers: 1) ESG analyst at a consulting firm with higher pay but lots of travel, or 2) sustainability manager at a local tech company with lower pay but better work-life balance. What factors should I consider?",
            "capabilities": {
                "Decision Support": ["consider", "factor", "decision", "choose", "evaluate"],
                "Option Analysis": ["esg analyst", "sustainability manager", "consulting", "tech company"],
                "Trade-off Recognition": ["higher pay", "travel", "lower pay", "work-life balance"],
                "Guidance Framework": ["factor", "important", "priority", "value", "consider"],
                "Personalized Approach": ["you", "your", "personal", "individual", "depends"]
            }
        }
    ]
    
    total_score = 0
    results = []
    
    for scenario in scenarios:
        score, content, detected = test_scenario(
            scenario["message"], 
            scenario["name"], 
            scenario["capabilities"]
        )
        
        results.append({
            "name": scenario["name"],
            "score": score,
            "content": content[:300],
            "detected_capabilities": detected
        })
        
        total_score += score
        time.sleep(1)  # Brief pause between tests
    
    # Final Analysis
    print(f"\n📊 COMPREHENSIVE AI EVALUATION RESULTS")
    print("=" * 70)
    
    avg_score = total_score / len(scenarios)
    
    print(f"🎯 Overall Performance:")
    print(f"   Average Score: {avg_score:.1f}%")
    print(f"   Total Scenarios: {len(scenarios)}")
    
    print(f"\n📈 Scenario Breakdown:")
    for result in results:
        grade = "🟢" if result["score"] >= 80 else "🟡" if result["score"] >= 60 else "🟠" if result["score"] >= 40 else "🔴"
        print(f"   {grade} {result['name']}: {result['score']:.1f}%")
    
    # Advanced Capabilities Summary
    all_capabilities = {}
    for result in results:
        for capability, detected in result["detected_capabilities"].items():
            if capability not in all_capabilities:
                all_capabilities[capability] = 0
            if detected:
                all_capabilities[capability] += 1
    
    print(f"\n🧠 Advanced Capabilities Summary:")
    for capability, count in sorted(all_capabilities.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / len(scenarios)) * 100
        print(f"   {capability}: {count}/{len(scenarios)} tests ({percentage:.1f}%)")
    
    # Final Assessment
    print(f"\n🎖️ OVERALL ASSESSMENT:")
    if avg_score >= 80:
        print("   🏆 EXCEPTIONAL: AI demonstrates excellent advanced capabilities across all areas!")
        print("   The system shows strong domain knowledge, emotional intelligence, and complex reasoning.")
    elif avg_score >= 70:
        print("   🥉 EXCELLENT: AI shows strong performance with advanced capabilities!")
        print("   Minor improvements could enhance some specific areas.")
    elif avg_score >= 60:
        print("   👍 GOOD: AI demonstrates solid capabilities with room for growth.")
        print("   Focus on enhancing weaker areas identified above.")
    elif avg_score >= 40:
        print("   ⚠️ MODERATE: AI has basic functionality but needs enhancement.")
        print("   Significant improvements needed in advanced reasoning and domain knowledge.")
    else:
        print("   🔧 NEEDS WORK: AI requires substantial improvements.")
        print("   Focus on fundamental capabilities before advanced features.")
    
    # Save detailed results
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    with open(f"ai_evaluation_results_{timestamp}.json", "w") as f:
        json.dump({
            "timestamp": timestamp,
            "average_score": avg_score,
            "total_scenarios": len(scenarios),
            "scenario_results": results,
            "capability_summary": all_capabilities
        }, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: ai_evaluation_results_{timestamp}.json")
    print("✅ Comprehensive AI evaluation completed!")

if __name__ == "__main__":
    run_comprehensive_evaluation() 