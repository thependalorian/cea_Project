// Simple API test script for Climate Economy Assistant
// Run with: node test_api.js

const fetch = require('node-fetch');

const FRONTEND_URL = 'http://localhost:3000';
const BACKEND_URL = 'http://localhost:8000';

async function testFrontendAPI() {
  console.log('🧪 Testing Frontend API Endpoints...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${FRONTEND_URL}/api/health`);
    console.log(`Status: ${healthResponse.status}`);
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log('✅ Health check passed:', data);
    } else {
      console.log('❌ Health check failed');
    }
    
    // Test resume endpoints (should require auth)
    console.log('\n2. Testing resume endpoints...');
    const resumeResponse = await fetch(`${FRONTEND_URL}/api/v1/resumes`);
    console.log(`Resume API Status: ${resumeResponse.status}`);
    if (resumeResponse.status === 401) {
      console.log('✅ Resume API properly requires authentication');
    } else {
      console.log('⚠️ Resume API response:', await resumeResponse.text());
    }
    
  } catch (error) {
    console.error('❌ Frontend API test failed:', error.message);
  }
}

async function testBackendAPI() {
  console.log('\n🐍 Testing Python Backend API Endpoints...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing backend health...');
    const healthResponse = await fetch(`${BACKEND_URL}/health`);
    console.log(`Status: ${healthResponse.status}`);
    if (healthResponse.ok) {
      const data = await healthResponse.json();
      console.log('✅ Backend health check passed:', data);
    } else {
      console.log('❌ Backend health check failed');
    }
    
    // Test interactive chat endpoint
    console.log('\n2. Testing interactive chat endpoint...');
    const chatResponse = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'Hello, this is a test message',
        user_id: 'test-user-123',
        context: {},
        stream: false
      })
    });
    console.log(`Chat API Status: ${chatResponse.status}`);
    
    if (chatResponse.ok) {
      const data = await chatResponse.json();
      console.log('✅ Chat API response received:', data.content ? 'Content present' : 'No content');
    } else {
      const errorText = await chatResponse.text();
      console.log('❌ Chat API failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Backend API test failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests for Climate Economy Assistant\n');
  console.log('='.repeat(60));
  
  await testFrontendAPI();
  await testBackendAPI();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 API Tests Complete!');
  console.log('\nNext steps:');
  console.log('1. Ensure both frontend (localhost:3000) and backend (localhost:8000) are running');
  console.log('2. Check authentication setup for protected endpoints');
  console.log('3. Test the assistant interface at http://localhost:3000/assistant');
}

// Run the tests
runTests().catch(console.error); 