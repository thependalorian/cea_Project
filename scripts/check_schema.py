#!/usr/bin/env python3

import os
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv(dotenv_path="../.env")

# Get credentials
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

print("🔍 CHECKING DATABASE SCHEMA")
print("=" * 50)

try:
    # Create client
    supabase = create_client(supabase_url, supabase_key)
    
    # Check if profiles table exists and what columns it has
    print("📋 Checking profiles table structure...")
    
    # Query information schema to see table structure
    result = supabase.rpc('exec_sql', {
        'sql': """
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        ORDER BY ordinal_position;
        """
    }).execute()
    
    if result.data:
        print("✅ Profiles table columns:")
        for row in result.data:
            print(f"   - {row['column_name']}: {row['data_type']} ({'NULL' if row['is_nullable'] == 'YES' else 'NOT NULL'})")
    else:
        print("❌ Could not get table structure or table doesn't exist")
    
    # Check for climate_focus column specifically
    climate_focus_check = supabase.rpc('exec_sql', {
        'sql': """
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'climate_focus'
        ) as climate_focus_exists;
        """
    }).execute()
    
    if climate_focus_check.data:
        exists = climate_focus_check.data[0]['climate_focus_exists']
        print(f"\n🎯 climate_focus column exists: {'✅ YES' if exists else '❌ NO'}")
        
        if not exists:
            print("\n📝 MIGRATION NEEDED:")
            print("   Run the updated migration file in Supabase SQL Editor:")
            print("   supabase/migrations/20240708000000_climate_economy_ecosystem.sql")
    
except Exception as e:
    print(f"❌ Error checking schema: {e}")
    print("\n💡 This might be because the exec_sql function doesn't exist.")
    print("   Please run the migration file manually in Supabase SQL Editor.") 