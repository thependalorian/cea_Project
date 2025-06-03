#!/usr/bin/env python3

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path="../.env")

try:
    print("Testing Supabase connection...")
    
    # Try basic import
    from supabase import create_client
    print("✅ Supabase import successful")
    
    # Get credentials
    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://zugdojmdktxalqflxbbh.supabase.co")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    print(f"URL: {supabase_url}")
    print(f"Key exists: {bool(supabase_key)}")
    
    # Try to create client with minimal setup
    print("Creating Supabase client...")
    supabase = create_client(supabase_url, supabase_key)
    print("✅ Supabase client created successfully!")
    
    # Test a simple query
    print("Testing connection with a simple query...")
    result = supabase.table("profiles").select("count").execute()
    print("✅ Connection test successful!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc() 