#!/usr/bin/env python3
"""Quick AI Test - Verify Advanced Capabilities"""

import requests
import json

def test_ai_capabilities():
    print("🧠 Testing AI Capabilities")
    
    # Test the interactive chat endpoint
    url = 'http://localhost:3000/api/v1/interactive-chat'
    data = {
        'message': 'What are the key skills needed for renewable energy careers? Please provide detailed guidance.',
        'conversation_id': 'test_advanced_123'
    }
    
    try:
        response = requests.post(url, json=data, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result.get('success', False)}")
            
            if result.get('data') and result['data'].get('response'):
                content = result['data']['response']
                print(f"Response length: {len(content)} characters")
                print(f"Content preview:\n{content[:400]}...")
                
                # Test for advanced capabilities
                content_lower = content.lower()
                capabilities = {
                    'domain_knowledge': any(word in content_lower for word in ['solar', 'wind', 'renewable', 'energy', 'technical', 'engineering']),
                    'career_advice': any(word in content_lower for word in ['career', 'skill', 'job', 'experience', 'qualification']),
                    'detailed_response': len(content) > 200,
                    'structured_thinking': any(word in content_lower for word in ['first', 'important', 'key', 'essential', 'include']),
                    'empathy': any(word in content_lower for word in ['help', 'understand', 'guide', 'support']),
                    'examples': any(word in content_lower for word in ['example', 'such as', 'like', 'including'])
                }
                
                print(f"\n🎯 Advanced Capabilities Analysis:")
                passed = 0
                for capability, detected in capabilities.items():
                    status = "✅" if detected else "❌"
                    print(f"   {status} {capability.replace('_', ' ').title()}: {detected}")
                    if detected:
                        passed += 1
                
                print(f"\n📊 Overall Score: {passed}/{len(capabilities)} ({(passed/len(capabilities))*100:.1f}%)")
                
                if passed >= 4:
                    print("🎉 EXCELLENT: AI shows strong advanced capabilities!")
                elif passed >= 3:
                    print("👍 GOOD: AI demonstrates solid capabilities")
                else:
                    print("⚠️ MODERATE: AI has basic functionality")
                    
            else:
                print("❌ No response data found")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_ai_capabilities() 