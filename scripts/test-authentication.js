/**
 * Authentication Test Script - Climate Economy Assistant (CEA)
 * Tests authentication functionality for all demo accounts
 * Production URL: https://cea.georgenekwaya.com
 * 
 * Usage: node scripts/test-authentication.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cea.georgenekwaya.com';

// Validation
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required environment variables');
  console.log('\n📋 Required variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client (using anon key like the frontend)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Demo accounts to test
const testAccounts = [
  {
    email: 'jobseeker@cea.georgenekwaya.com',
    password: 'Demo123!',
    role: 'job_seeker',
    expectedTable: 'job_seeker_profiles'
  },
  {
    email: 'partner@cea.georgenekwaya.com',
    password: 'Demo123!',
    role: 'partner',
    expectedTable: 'partner_profiles'
  },
  {
    email: 'admin@cea.georgenekwaya.com',
    password: 'Demo123!',
    role: 'admin',
    expectedTable: 'admin_profiles'
  }
];

/**
 * Test authentication for a single account
 */
async function testAccount(account) {
  console.log(`\n🧪 Testing ${account.role}: ${account.email}`);
  
  try {
    // Test login
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: account.email,
      password: account.password
    });

    if (authError) {
      console.log(`   ❌ Login failed: ${authError.message}`);
      return false;
    }

    console.log(`   ✅ Login successful`);
    console.log(`   👤 User ID: ${authData.user.id}`);

    // Test profile access
    let profileData = null;
    let profileError = null;

    switch (account.role) {
      case 'job_seeker':
        const { data: jsData, error: jsError } = await supabase
          .from('job_seeker_profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();
        profileData = jsData;
        profileError = jsError;
        break;

      case 'partner':
        const { data: partnerData, error: partnerError } = await supabase
          .from('partner_profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        profileData = partnerData;
        profileError = partnerError;
        break;

      case 'admin':
        const { data: adminData, error: adminError } = await supabase
          .from('admin_profiles')
          .select('*')
          .eq('user_id', authData.user.id)
          .single();
        profileData = adminData;
        profileError = adminError;
        break;
    }

    if (profileError) {
      console.log(`   ❌ Profile access failed: ${profileError.message}`);
    } else if (profileData) {
      console.log(`   ✅ Profile found: ${profileData.full_name || profileData.organization_name}`);
      console.log(`   📊 Profile completed: ${profileData.profile_completed ? 'Yes' : 'No'}`);
    } else {
      console.log(`   ⚠️  Profile not found`);
    }

    // Test logout
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) {
      console.log(`   ❌ Logout failed: ${logoutError.message}`);
    } else {
      console.log(`   ✅ Logout successful`);
    }

    return true;

  } catch (error) {
    console.log(`   ❌ Test failed: ${error.message}`);
    return false;
  }
}

/**
 * Test API endpoints
 */
async function testAPIEndpoints() {
  console.log('\n🔧 Testing API Endpoints');
  console.log('=' .repeat(40));

  const endpoints = [
    { path: '/api/health', method: 'GET' },
    { path: '/api/auth/status', method: 'GET' }
  ];

  for (const endpoint of endpoints) {
    try {
      const url = `http://localhost:3000${endpoint.path}`;
      console.log(`\n🌐 Testing: ${endpoint.method} ${endpoint.path}`);
      
      const response = await fetch(url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Status: ${response.status}`);
        console.log(`   📄 Response: ${JSON.stringify(data, null, 2).substring(0, 100)}...`);
      } else {
        console.log(`   ❌ Status: ${response.status}`);
        const text = await response.text();
        console.log(`   📄 Error: ${text.substring(0, 100)}...`);
      }
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
    }
  }
}

/**
 * Test login API endpoint
 */
async function testLoginAPI() {
  console.log('\n🔐 Testing Login API');
  console.log('=' .repeat(40));

  try {
    const url = 'http://localhost:3000/api/auth/login';
    const testCredentials = {
      email: 'jobseeker@cea.georgenekwaya.com',
      password: 'Demo123!'
    };

    console.log(`\n🌐 POST ${url}`);
    console.log(`📤 Payload: ${JSON.stringify(testCredentials)}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCredentials)
    });

    const data = await response.json();

    if (response.ok) {
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   👤 User: ${data.data?.user?.email}`);
      console.log(`   🎯 User Type: ${data.data?.user_type}`);
      console.log(`   🔄 Redirect: ${data.data?.redirect_url}`);
    } else {
      console.log(`   ❌ Status: ${response.status}`);
      console.log(`   📄 Error: ${JSON.stringify(data, null, 2)}`);
    }

  } catch (error) {
    console.log(`   ❌ API test failed: ${error.message}`);
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🧪 Climate Economy Assistant - Authentication Tests');
  console.log(`🌐 Target Domain: ${siteUrl}`);
  console.log(`🗄️  Database: ${supabaseUrl}`);
  console.log('=' .repeat(60));

  let successCount = 0;
  let totalTests = testAccounts.length;

  // Test each demo account
  for (const account of testAccounts) {
    const success = await testAccount(account);
    if (success) successCount++;
  }

  // Test API endpoints
  await testAPIEndpoints();
  await testLoginAPI();

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('🎯 Test Results Summary');
  console.log(`✅ Successful logins: ${successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('🎉 All authentication tests passed!');
  } else {
    console.log('⚠️  Some tests failed - check the output above');
  }

  // Instructions
  console.log('\n📋 Next Steps:');
  console.log('1. Visit: http://localhost:3000/auth/login');
  console.log('2. Test manual login with any demo account');
  console.log('3. Verify role-based redirects work correctly');
  console.log('');
  console.log('🌐 Production Testing:');
  console.log(`Visit: ${siteUrl}/auth/login`);
  console.log('');
  console.log('📚 Documentation:');
  console.log('- /docs/AUTH_QUICK_REFERENCE.md');
  console.log('- /docs/AUTHENTICATION.md');
}

// Run tests if called directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('\n💥 Tests failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runTests, testAccount }; 