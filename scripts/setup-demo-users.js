/**
 * Setup Demo Users Script - Climate Economy Assistant (CEA)
 * Creates demo accounts for testing authentication
 * Production URL: https://cea.georgenekwaya.com
 * 
 * Usage: node scripts/setup-demo-users.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cea.georgenekwaya.com';

// Validation
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.log('\n📋 Required variables:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  console.log('\n💡 Check your .env.local file or Vercel environment variables');
  process.exit(1);
}

// Initialize Supabase client with service role
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Demo user configurations
const demoUsers = [
  {
    email: 'jobseeker@cea.georgenekwaya.com',
    password: 'Demo123!',
    role: 'job_seeker',
    profile: {
      full_name: 'Demo Job Seeker',
      email: 'jobseeker@cea.georgenekwaya.com',
      location: 'Boston, MA',
      current_title: 'Environmental Analyst',
      experience_level: 'mid',
      climate_interests: ['renewable_energy', 'sustainability', 'carbon_management'],
      desired_roles: ['Climate Data Analyst', 'Sustainability Coordinator', 'Environmental Consultant'],
      preferred_locations: ['Boston, MA', 'Cambridge, MA', 'Remote'],
      employment_types: ['full_time', 'remote', 'hybrid'],
      climate_focus_areas: ['renewable_energy', 'carbon_management', 'sustainability'],
      salary_range_min: 60000,
      salary_range_max: 80000,
      remote_work_preference: 'hybrid',
      profile_completed: true,
      career_goals: 'Transition to a leadership role in climate technology and help organizations achieve their sustainability goals.'
    }
  },
  {
    email: 'partner@cea.georgenekwaya.com',
    password: 'Demo123!',
    role: 'partner',
    profile: {
      organization_name: 'Demo Climate Solutions',
      organization_type: 'employer',
      website: 'https://demo-climate.com',
      email: 'partner@cea.georgenekwaya.com',
      phone: '617-555-0123',
      full_name: 'Demo Partner Manager',
      partnership_level: 'standard',
      verified: true,
      description: 'A demo organization focused on climate solutions and green technology. We specialize in renewable energy systems, carbon management, and sustainability consulting for businesses transitioning to clean energy.',
      profile_completed: true,
      organization_size: 'medium',
      headquarters_location: 'Boston, MA',
      partnership_start_date: new Date().toISOString().split('T')[0],
      verification_date: new Date().toISOString(),
      services_offered: ['consulting', 'training', 'technology_development'],
      industries: ['renewable_energy', 'sustainability', 'clean_technology'],
      mission_statement: 'Advancing climate solutions through innovation, partnership, and sustainable technology development.',
      employee_count: 50,
      founded_year: 2020,
      hiring_actively: true,
      training_programs: ['Climate Tech Fundamentals', 'Green Energy Systems', 'Carbon Accounting'],
      internship_programs: true,
      climate_focus: ['renewable_energy', 'carbon_management', 'clean_technology'],
      offers_webinars: true,
      has_resource_library: true,
      offers_certification: true
    }
  },
  {
    email: 'admin@cea.georgenekwaya.com',
    password: 'Demo123!',
    role: 'admin',
    profile: {
      full_name: 'Demo Administrator',
      admin_level: 'standard',
      permissions: ['manage_users', 'manage_partners', 'manage_content', 'view_analytics'],
      department: 'Platform Administration',
      admin_notes: 'Demo administrator account for testing CEA platform functionality',
      direct_phone: '617-555-0199',
      emergency_contact: {
        email: 'admin@cea.georgenekwaya.com',
        phone: '617-555-0199',
        organization: 'Climate Economy Assistant Platform'
      },
      can_manage_users: true,
      can_manage_partners: true,
      can_manage_content: true,
      can_view_analytics: true,
      can_manage_system: false,
      profile_completed: true,
      email: 'admin@cea.georgenekwaya.com',
      phone: '617-555-0199'
    }
  }
];

/**
 * Main function to create demo users
 */
async function createDemoUsers() {
  console.log('🚀 Climate Economy Assistant - Demo User Setup');
  console.log(`🌐 Target Domain: ${siteUrl}`);
  console.log(`🗄️  Database: ${supabaseUrl}`);
  console.log('=' .repeat(60));

  let successCount = 0;
  let errorCount = 0;

  for (const user of demoUsers) {
    try {
      console.log(`\n📝 Creating ${user.role}: ${user.email}`);
      
      // Check if user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existingUser = existingUsers.users.find(u => u.email === user.email);
      
      if (existingUser) {
        console.log(`   ⚠️  User already exists, updating profile...`);
        await updateUserProfile(existingUser.id, user.role, user.profile);
        console.log(`   ✅ Profile updated successfully`);
        successCount++;
        continue;
      }

      // Create new auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          role: user.role,
          full_name: user.profile.full_name || user.profile.organization_name,
          created_by: 'demo_setup_script'
        }
      });

      if (authError) {
        throw new Error(`Auth creation failed: ${authError.message}`);
      }

      const userId = authData.user.id;
      console.log(`   ✅ Auth user created: ${userId}`);

      // Create role-specific profile
      await updateUserProfile(userId, user.role, user.profile);
      
      console.log(`   ✅ ${user.role} profile created successfully`);
      successCount++;

    } catch (error) {
      console.error(`   ❌ Error creating ${user.email}:`, error.message);
      errorCount++;
    }
  }

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('🎉 Demo User Setup Complete!');
  console.log(`✅ Successfully created/updated: ${successCount} users`);
  if (errorCount > 0) {
    console.log(`❌ Errors encountered: ${errorCount} users`);
  }

  // Demo account information
  console.log('\n📋 Demo Account Credentials:');
  console.log('=' .repeat(40));
  demoUsers.forEach(user => {
    const roleLabel = user.role.replace('_', ' ').toUpperCase();
    console.log(`${roleLabel}:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${user.password}`);
    console.log(`  Access: /${user.role.replace('_', '-')}/*`);
    console.log('');
  });

  // Testing instructions
  console.log('🧪 Testing Instructions:');
  console.log('=' .repeat(40));
  console.log('1. Start development server: npm run dev');
  console.log('2. Visit: http://localhost:3000/auth/login');
  console.log('3. Use any demo account above to test authentication');
  console.log('');
  console.log('🌐 Production Testing:');
  console.log(`Visit: ${siteUrl}/auth/login`);
  console.log('');
  console.log('🔧 API Testing:');
  console.log(`curl -X POST ${siteUrl}/api/auth/login \\`);
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"email": "jobseeker@cea.georgenekwaya.com", "password": "Demo123!"}\'');
}

/**
 * Update user profile based on role
 */
async function updateUserProfile(userId, role, profileData) {
  try {
    // First, create/update the main profiles table entry
    const mainProfileData = {
      id: userId,
      email: profileData.email,
      user_type: role,
      role: role,
      first_name: profileData.full_name?.split(' ')[0] || profileData.organization_name?.split(' ')[0] || 'Demo',
      last_name: profileData.full_name?.split(' ').slice(1).join(' ') || 'User',
      updated_at: new Date().toISOString()
    };

    const { error: mainProfileError } = await supabase
      .from('profiles')
      .upsert(mainProfileData);
    
    if (mainProfileError) {
      console.log(`   ⚠️  Main profile error: ${mainProfileError.message}`);
    } else {
      console.log(`   ✅ Main profile created/updated`);
    }

    // Then create/update the role-specific profile
    switch (role) {
      case 'job_seeker':
        const { error: jsError } = await supabase
          .from('job_seeker_profiles')
          .upsert({ 
            id: userId,
            user_id: userId,
            ...profileData,
            updated_at: new Date().toISOString()
          });
        if (jsError) {
          console.log(`   ❌ Job seeker profile error: ${jsError.message}`);
          throw jsError;
        }
        
        // Create user interests for job seekers
        await createUserInterests(userId, profileData);
        break;

      case 'partner':
        const { error: partnerError } = await supabase
          .from('partner_profiles')
          .upsert({ 
            id: userId,
            ...profileData,
            updated_at: new Date().toISOString()
          });
        if (partnerError) {
          console.log(`   ❌ Partner profile error: ${partnerError.message}`);
          throw partnerError;
        }
        break;

      case 'admin':
        const { error: adminError } = await supabase
          .from('admin_profiles')
          .upsert({ 
            id: userId,
            user_id: userId,
            ...profileData,
            updated_at: new Date().toISOString()
          });
        if (adminError) {
          console.log(`   ❌ Admin profile error: ${adminError.message}`);
          throw adminError;
        }
        break;

      default:
        throw new Error(`Unknown role: ${role}`);
    }
    
    console.log(`   ✅ ${role} profile updated`);
  } catch (error) {
    console.error(`   ❌ Profile error: ${error.message}`);
    throw error;
  }
}

/**
 * Create user interests for job seekers
 */
async function createUserInterests(userId, profileData) {
  try {
    const userInterestsData = {
      user_id: userId,
      climate_focus: profileData.climate_interests || [],
      target_roles: profileData.desired_roles || [],
      preferred_location: profileData.location || null,
      employment_preferences: {
        types: profileData.employment_types || [],
        remote_preference: profileData.remote_work_preference || 'hybrid',
        salary_range: {
          min: profileData.salary_range_min,
          max: profileData.salary_range_max
        }
      },
      social_profile_analysis_enabled: true,
      data_sharing_enabled: false,
      marketing_emails_enabled: true,
      newsletter_enabled: true,
      email_notifications: true,
      job_alerts_enabled: true,
      partner_updates_enabled: true,
      theme_preference: 'system',
      language_preference: 'en',
      timezone: 'America/New_York',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('user_interests')
      .upsert(userInterestsData);

    if (error) {
      console.log(`   ⚠️  Could not create user interests: ${error.message}`);
    } else {
      console.log(`   ✅ User interests created`);
    }
  } catch (error) {
    console.log(`   ⚠️  User interests error: ${error.message}`);
  }
}

/**
 * Verify demo users can authenticate
 */
async function verifyDemoUsers() {
  console.log('\n🔍 Verifying demo user authentication...');
  
  for (const user of demoUsers) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (error) {
        console.log(`   ❌ ${user.email}: ${error.message}`);
      } else {
        console.log(`   ✅ ${user.email}: Authentication successful`);
        // Sign out immediately
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.log(`   ❌ ${user.email}: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  try {
    await createDemoUsers();
    await verifyDemoUsers();
    
    console.log('\n🎯 Setup completed successfully!');
    console.log(`📍 Platform: ${siteUrl}`);
    console.log('📚 Documentation: /docs/AUTH_QUICK_REFERENCE.md');
    
  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { createDemoUsers, verifyDemoUsers }; 