# Database Schema Fixes Summary

## Overview
Updated the seed script (`create_seed_partners_updated.py`) to match the exact database schema provided, fixing field names, data types, and adding proper file paths for all resources.

## 🔧 **Schema Fixes Applied**

### **1. Job Seeker Profiles Table**
**Fixed Fields:**
- ✅ Added `user_id` field (foreign key to auth.users.id)
- ✅ Changed field names to match schema:
  - `preferred_locations` (jsonb) instead of `location_preferences`
  - `employment_types` (jsonb) instead of `employment_type_preferences`
  - `climate_focus_areas` (jsonb) - additional field
  - `current_title` - added field
  - `remote_work_preference` - added field
  - `salary_range_min` and `salary_range_max` (integers) instead of `salary_expectation`
  - `resume_filename` and `resume_storage_path` - added fields
  - `resume_uploaded_at` - added timestamp
- ✅ Removed non-existent fields: `years_experience`, `skills`, `professional_summary`

### **2. Resumes Table**
**Fixed Fields:**
- ✅ Changed `job_seeker_id` to `user_id` (matches schema)
- ✅ Added required fields:
  - `content` instead of `original_text` and `processed_content`
  - `content_type` (application/pdf)
  - `file_size` (calculated from content)
  - `content_embedding` (additional embedding field)
  - `experience_years` instead of `experience_summary`
  - `education_level` instead of `education_summary`
  - `climate_relevance_score` (numeric)
  - `industry_background` (array)
  - `linkedin_url` and `personal_website`
  - `processed` (boolean) instead of `is_active`
  - `processing_metadata` (jsonb)
- ✅ **Full directory path**: `/storage/resumes/{user_id}/George_Nekwaya_Resume_2025.pdf`

### **3. User Interests Table**
**Fixed Fields:**
- ✅ Changed from multiple individual records to single comprehensive record
- ✅ Added all schema fields:
  - `climate_focus` (array) instead of `interest_category`
  - `target_roles` (array)
  - `skills_to_develop` (array)
  - `preferred_location` (text)
  - `employment_preferences` (jsonb)
  - `email_notifications`, `job_alerts_enabled`, etc. (boolean flags)
  - `language_preference`, `timezone`, `theme_preference`
- ✅ Removed non-existent fields: `proficiency_level`, `notes`

### **4. Knowledge Resources Table**
**Fixed Fields:**
- ✅ Added schema-compliant fields:
  - `climate_sectors` (array) instead of derived from climate_focus
  - `skill_categories` (array) for categorizing skills
  - `content_difficulty` (text: intermediate/advanced)
  - `is_published` (boolean)
- ✅ **Full directory paths**:
  - Partners: `/storage/knowledge_resources/partners/{user_id}/{program_title}.pdf`
  - Admin: `/storage/knowledge_resources/admin/{user_id}/{program_title}.pdf`

### **5. Partner Profiles Table**
**Verified Compliance:**
- ✅ `climate_focus` (array) - correct type
- ✅ `industries` (jsonb) - correct type
- ✅ `services_offered` (jsonb) - correct type
- ✅ `training_programs` (jsonb) - correct type
- ✅ All other fields match schema exactly

### **6. Admin Profiles Table**
**Verified Compliance:**
- ✅ All boolean permission fields (can_manage_users, can_manage_partners, etc.)
- ✅ `permissions` (jsonb) field
- ✅ `emergency_contact` (jsonb) field
- ✅ All text and timestamp fields match schema

## 📁 **File Path Structure**

### **Complete Directory Paths Added:**

**Resumes:**
```
/storage/resumes/{user_id}/George_Nekwaya_Resume_2025.pdf
```

**Partner Knowledge Resources:**
```
/storage/knowledge_resources/partners/{partner_id}/{program_title}.pdf
```

**Admin Knowledge Resources:**
```
/storage/knowledge_resources/admin/{admin_id}/{program_title}.pdf
```

## 🎯 **Data Type Corrections**

### **JSONB Fields:**
- `job_seeker_profiles.climate_interests` ✅
- `job_seeker_profiles.desired_roles` ✅
- `job_seeker_profiles.preferred_locations` ✅
- `job_seeker_profiles.employment_types` ✅
- `user_interests.employment_preferences` ✅
- `resumes.skills_extracted` ✅
- `resumes.processing_metadata` ✅

### **Array Fields:**
- `partner_profiles.climate_focus` ✅
- `job_listings.climate_focus` ✅
- `job_listings.skills_required` ✅
- `education_programs.climate_focus` ✅
- `education_programs.skills_taught` ✅
- `knowledge_resources.categories` ✅
- `knowledge_resources.climate_sectors` ✅
- `knowledge_resources.skill_categories` ✅
- `knowledge_resources.tags` ✅
- `knowledge_resources.topics` ✅
- `knowledge_resources.target_audience` ✅
- `user_interests.climate_focus` ✅
- `user_interests.target_roles` ✅
- `user_interests.skills_to_develop` ✅

### **Numeric Fields:**
- `job_seeker_profiles.salary_range_min` (integer) ✅
- `job_seeker_profiles.salary_range_max` (integer) ✅
- `resumes.climate_relevance_score` (numeric) ✅
- `resumes.experience_years` (integer) ✅
- `resumes.file_size` (bigint) ✅

## 🚀 **Impact on Seed Script**

### **George Nekwaya's Triple Profile:**
1. **Job Seeker Profile** - Complete schema compliance with 18+ years experience
2. **Partner Profile (Buffr)** - Founding partner with AI/climate focus
3. **Admin Profile (ACT)** - Super admin with comprehensive permissions

### **Database Integration:**
- **5 partners** with complete knowledge resources and file paths
- **2 admin users** with platform administration capabilities
- **1 job seeker** with comprehensive profile and resume
- **All embeddings** generated for AI matching and search
- **Full file path structure** for PDF storage and retrieval

## ✅ **Verification Steps**

The updated seed script now:
1. **Matches exact field names** from the provided schema
2. **Uses correct data types** (JSONB, arrays, numeric, etc.)
3. **Includes all required fields** for each table
4. **Provides full directory paths** for all file resources
5. **Maintains referential integrity** with proper foreign keys
6. **Supports the complete platform functionality** with real data

Run the script to create a fully schema-compliant database with George's triple access setup! 🎯 