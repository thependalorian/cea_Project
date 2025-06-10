/**
 * Full Functionality Test API v1 - Climate Economy Assistant
 * Comprehensive test of all v1 endpoints without authentication
 * Location: app/api/v1/test-full-functionality/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';

// Python backend URL
const BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://localhost:8000';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  responseTime: number;
  statusCode?: number;
  error?: string;
  data?: Record<string, unknown>;
  note?: string;
}

export async function GET() {
  const results: TestResult[] = [];
  const testUserId = `test-user-${Date.now()}`;
  
  // Helper function to test endpoints
  const testEndpoint = async (
    name: string, 
    endpoint: string, 
    method: 'GET' | 'POST' = 'POST', 
    body?: Record<string, unknown>
  ): Promise<TestResult> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      const responseTime = Date.now() - startTime;
      const data: Record<string, unknown> = await response.json().catch(() => ({}));
      
      // Determine if this is a successful test based on response content
      let isSuccess = response.ok;
      let statusNote = '';
      
      if (response.ok && data) {
        // Handle specific success scenarios with no data
        if (data.status === 'no_resume' || data.status === 'no_data') {
          isSuccess = true;
          statusNote = 'Expected: No resume data found';
        } else if (data.status === 'no_results') {
          isSuccess = true;
          statusNote = 'Expected: No search results (empty database)';
        } else if (data.status === 'limited_context' || data.status === 'low_confidence') {
          isSuccess = true;
          statusNote = 'Expected: Limited context/confidence';
        } else if (data.error && typeof data.error === 'string' && data.error.includes('No resume found')) {
          isSuccess = true;
          statusNote = 'Expected: User has no resume uploaded';
        } else if (data.analyze_user_resume && typeof data.analyze_user_resume === 'object' && 'success' in data.analyze_user_resume && !data.analyze_user_resume.success) {
          isSuccess = true;
          statusNote = 'Expected: Resume analysis unavailable for test user';
        }
      }
      
      return {
        endpoint: name,
        method,
        status: isSuccess ? 'PASS' : 'FAIL',
        responseTime,
        statusCode: response.status,
        data: response.ok ? data : undefined,
        error: !isSuccess ? `HTTP ${response.status}` : undefined,
        note: statusNote || undefined
      };
    } catch (error: unknown) {
      return {
        endpoint: name,
        method,
        status: 'FAIL',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  };

  console.log('🧪 Starting comprehensive v1 functionality test...');

  // Test 1: Health Check
  results.push(await testEndpoint('Health Check', '/health', 'GET'));

  // Test 2: Interactive Chat
  results.push(await testEndpoint(
    'Interactive Chat', 
    '/api/v1/interactive-chat',
    'POST',
    {
      query: 'What are the best climate careers for someone with a tech background?',
      user_id: testUserId,
      context: { test: true }
    }
  ));

  // Test 3: Climate Career Agent
  results.push(await testEndpoint(
    'Climate Career Agent',
    '/api/v1/climate-career-agent',
    'POST',
    {
      query: 'I want to transition from software engineering to renewable energy',
      user_id: testUserId
    }
  ));

  // Test 4: Climate Career Search
  results.push(await testEndpoint(
    'Climate Career Search',
    '/api/v1/climate-career-search',
    'POST',
    {
      query: 'solar energy jobs',
      user_id: testUserId,
      search_scope: 'jobs'
    }
  ));

  // Test 5: Resume Analysis
  results.push(await testEndpoint(
    'Resume Analysis',
    '/api/v1/resume-analysis',
    'POST',
    {
      user_id: testUserId,
      analysis_type: 'comprehensive'
    }
  ));

  // Test 6: Legacy Chat (backward compatibility)
  results.push(await testEndpoint(
    'Legacy Chat',
    '/api/chat',
    'POST',
    {
      content: 'What climate organizations should I consider?',
      role: 'user',
      metadata: { user_id: testUserId }
    }
  ));

  // Test 7: Workflow Status
  results.push(await testEndpoint(
    'Workflow Status',
    `/api/v1/workflow-status/${testUserId}-session`,
    'GET'
  ));

  // Test 8: Human Feedback
  results.push(await testEndpoint(
    'Human Feedback',
    '/api/v1/human-feedback',
    'POST',
    {
      session_id: `${testUserId}-session`,
      response: 'This is helpful, continue',
      action: 'continue'
    }
  ));

  // Calculate summary statistics
  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === 'PASS').length;
  const failedTests = results.filter(r => r.status === 'FAIL').length;
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalTests;
  
  const summary = {
    total_tests: totalTests,
    passed: passedTests,
    failed: failedTests,
    success_rate: `${Math.round((passedTests / totalTests) * 100)}%`,
    average_response_time: `${Math.round(avgResponseTime)}ms`,
    backend_url: BACKEND_URL,
    test_user_id: testUserId,
    timestamp: new Date().toISOString()
  };

  console.log('🎯 Test Summary:', summary);

  return NextResponse.json({
    summary,
    detailed_results: results,
    recommendations: {
      backend_functionality: passedTests >= 6 ? 'EXCELLENT' : passedTests >= 4 ? 'GOOD' : 'NEEDS_WORK',
      frontend_integration: 'TESTED_VIA_PROXY',
      authentication: 'BYPASSED_FOR_TESTING',
      next_steps: [
        'Set up proper authentication for production use',
        'Implement user session management',
        'Add rate limiting and security headers',
        'Create integration tests with real user flows'
      ]
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: Record<string, unknown> = await request.json();
    const { test_specific_endpoint, custom_payload } = body as { test_specific_endpoint?: string; custom_payload?: Record<string, unknown> };
    
    if (test_specific_endpoint) {
      const result = await fetch(`${BACKEND_URL}${test_specific_endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(custom_payload || { test: true }),
        signal: AbortSignal.timeout(30000)
      });
      
      const data: Record<string, unknown> = await result.json().catch(() => ({}));
      
      return NextResponse.json({
        endpoint: test_specific_endpoint,
        status: result.ok ? 'PASS' : 'FAIL',
        status_code: result.status,
        data: result.ok ? data : undefined,
        error: !result.ok ? await result.text() : undefined
      });
    }
    
    return NextResponse.json({
      error: 'Please provide test_specific_endpoint in request body',
      example: {
        test_specific_endpoint: '/api/v1/interactive-chat',
        custom_payload: { query: 'test query', user_id: 'test-123' }
      }
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: 'Failed to process test request' },
      { status: 500 }
    );
  }
} 