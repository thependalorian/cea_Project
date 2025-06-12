const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...\n');
    
    // Check job_seeker_profiles
    try {
      const { data: jobSeekerData } = await supabase
        .from('job_seeker_profiles')
        .select('*')
        .limit(1);
      console.log('📋 job_seeker_profiles columns:');
      console.log(Object.keys(jobSeekerData?.[0] || {}));
      console.log('Sample data:', jobSeekerData?.[0] || 'No data');
    } catch (error) {
      console.log('❌ job_seeker_profiles error:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Check partner_profiles  
    try {
      const { data: partnerData } = await supabase
        .from('partner_profiles')
        .select('*')
        .limit(1);
      console.log('📋 partner_profiles columns:');
      console.log(Object.keys(partnerData?.[0] || {}));
      console.log('Sample data:', partnerData?.[0] || 'No data');
    } catch (error) {
      console.log('❌ partner_profiles error:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Check admin_profiles
    try {
      const { data: adminData } = await supabase
        .from('admin_profiles')
        .select('*')
        .limit(1);
      console.log('📋 admin_profiles columns:');
      console.log(Object.keys(adminData?.[0] || {}));
      console.log('Sample data:', adminData?.[0] || 'No data');
    } catch (error) {
      console.log('❌ admin_profiles error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
  }
}

checkSchema(); 