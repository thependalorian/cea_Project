# Admin Schema Migration Documentation

## Overview
This document outlines the migration from `admin_level` field-based access control to granular permission-based access control in the Climate Economy Assistant admin system.

## Database Schema Changes

### Original Schema (Deprecated)
```sql
-- OLD: admin_level field approach
admin_profiles.admin_level TEXT NOT NULL -- 'standard', 'super', 'system'
```

### New Schema (Current)
```sql
-- NEW: Permission-based approach
admin_profiles.can_manage_users BOOLEAN DEFAULT false
admin_profiles.can_manage_partners BOOLEAN DEFAULT false  
admin_profiles.can_manage_content BOOLEAN DEFAULT false
admin_profiles.can_view_analytics BOOLEAN DEFAULT false
admin_profiles.can_manage_system BOOLEAN DEFAULT false
```

## Permission Mapping

### Access Level Computation
The frontend now computes access levels from permissions:

```typescript
// Determine access level based on permissions
let access_level: 'standard' | 'super' | 'system' = 'standard';
if (adminProfile.can_manage_system) {
  access_level = 'system';
} else if (adminProfile.can_manage_users && adminProfile.can_manage_partners) {
  access_level = 'super';
}
```

### Permission Matrix

| Permission | Description | Pages Affected |
|------------|-------------|----------------|
| `can_manage_system` | Full system administration | Settings, Database, System Analytics, Debug |
| `can_manage_users` | User account management | Users, Reviews, User moderation |
| `can_manage_partners` | Partner organization management | Partners, Partner verification, Partner resources |
| `can_manage_content` | Content and resource management | Jobs, Resources, Education programs |
| `can_view_analytics` | Analytics and reporting access | Reports, Analytics dashboard |

## Code Changes Summary

### 1. API Endpoints Updated
- **`/api/v1/admin/route.ts`**: Removed `admin_level` field, uses permission checks
- **Database queries**: Updated to use `user_id` field correctly
- **Access validation**: Changed from level-based to permission-based

### 2. Admin Layout Updated
- **`app/admin/layout.tsx`**: Computes access level from permissions
- **Authentication**: Uses correct `user_id` field for admin profile lookup
- **Profile creation**: Maps permissions to computed access levels

### 3. Admin Pages Updated
All admin pages now use permission-based access:

#### System-Level Pages (require `can_manage_system`)
- **Database Management** (`/admin/database`)
- **System Analytics** (`/admin/system-analytics`) 
- **Settings** (`/admin/settings`)
- **Debug Tools** (`/admin/debug`)

#### Partner Management Pages (require `can_manage_partners`)
- **Partner Resources** (`/admin/partner-resources`)
- **Partner Verification** (`/admin/partner-verification`)

#### Content Management Pages (require `can_manage_content`)  
- **Admin Resources** (`/admin/admin-resources`)
- **Job Moderation** (`/admin/job-moderation`)

### 4. Navigation Updated
- **AdminSidebar**: Uses computed access levels for navigation visibility
- **Conditional rendering**: Shows/hides menu items based on permissions
- **Access indicators**: Displays current permission level

## Database Schema Validation

### Expected Schema Structure
```sql
📁 TABLE: admin_profiles
   ├─ id | TYPE: uuid | NULLABLE: NO | DEFAULT: gen_random_uuid()
   ├─ user_id | TYPE: uuid | NULLABLE: NO | DEFAULT: NULL
   ├─ full_name | TYPE: character varying(200) | NULLABLE: NO | DEFAULT: NULL
   ├─ email | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ phone | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ department | TYPE: character varying(100) | NULLABLE: YES | DEFAULT: NULL
   ├─ permissions | TYPE: jsonb | NULLABLE: YES | DEFAULT: '{}'::jsonb
   ├─ can_manage_users | TYPE: boolean | NULLABLE: YES | DEFAULT: false
   ├─ can_manage_partners | TYPE: boolean | NULLABLE: YES | DEFAULT: false
   ├─ can_manage_content | TYPE: boolean | NULLABLE: YES | DEFAULT: false
   ├─ can_view_analytics | TYPE: boolean | NULLABLE: YES | DEFAULT: false
   ├─ can_manage_system | TYPE: boolean | NULLABLE: YES | DEFAULT: false
   ├─ admin_notes | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ direct_phone | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ emergency_contact | TYPE: jsonb | NULLABLE: YES | DEFAULT: '{}'::jsonb
   ├─ last_admin_action | TYPE: timestamp with time zone | NULLABLE: YES | DEFAULT: NULL
   ├─ last_login | TYPE: timestamp with time zone | NULLABLE: YES | DEFAULT: NULL
   ├─ profile_completed | TYPE: boolean | NULLABLE: YES | DEFAULT: false
   ├─ total_admin_actions | TYPE: integer | NULLABLE: YES | DEFAULT: 0
   ├─ created_at | TYPE: timestamp with time zone | NULLABLE: NO | DEFAULT: now()
   └─ updated_at | TYPE: timestamp with time zone | NULLABLE: NO | DEFAULT: now()
```

## Implementation Benefits

### 1. Granular Access Control
- Fine-grained permissions instead of broad levels
- Specific access to different system areas
- Easier to manage complex admin roles

### 2. Flexible Role Management
- Mix and match permissions as needed
- Custom roles for specific use cases
- Easy to extend with new permissions

### 3. Better Security
- Principle of least privilege
- Clearer audit trail for permissions
- Reduced blast radius for compromised accounts

### 4. Scalability
- Easy to add new permissions
- Support for complex organizational structures
- Future-proof permission system

## Migration Status

### ✅ Completed
- [x] API endpoint updates (`/api/v1/admin/route.ts`)
- [x] Admin layout permission computation
- [x] Database page permission checks
- [x] System analytics permission checks  
- [x] Admin resources permission checks
- [x] Partner resources permission checks
- [x] Settings page permission checks
- [x] AdminSidebar navigation updates
- [x] **Partner management pages permission updates**
- [x] **Partner API endpoints permission updates** (`/api/v1/partners/route.ts`, `/api/v1/partners/[id]/route.ts`)
- [x] **User management pages permission updates** (`/admin/users`, `/admin/reviews`)
- [x] **Main dashboard page permission updates** (`/dashboard/page.tsx`)
- [x] **Content management pages permission updates** (`/admin/jobs`, `/admin/education`, `/admin/resources`, `/admin/job-moderation`, `/admin/education-settings`)
- [x] **Content management API endpoints permission updates** (`/api/v1/jobs/route.ts`, `/api/v1/education/[id]/route.ts`, `/api/v1/partner-resources/route.ts`)
- [x] **Analytics pages permission updates** (`/admin/reports`, `/admin/system-analytics`)
- [x] **Analytics API endpoints permission updates** (`/api/v1/analytics/views/route.ts`, `/api/admin/analytics/route.ts`, `/api/v1/admin/analytics/route.ts`)
- [x] All TypeScript errors resolved
- [x] Build verification successful

### 🎉 Migration Complete!
**All admin system components have been successfully migrated from `admin_level` field-based access control to granular permission-based access control.**

🔒 **Security Enhanced**: Fine-grained permissions provide better access control  
⚡ **Performance Optimized**: Database queries updated to use correct field references  
🛠️ **Maintainability Improved**: Clear permission matrix and role definitions  
📈 **Scalability Ready**: Easy to extend with new permissions and roles

## Security Considerations

### Permission Validation
All admin pages now include proper permission validation:

```typescript
// Example permission check pattern
const { data: adminProfile } = await supabase
  .from('admin_profiles')
  .select('can_manage_system, can_manage_users, can_manage_partners, can_manage_content, can_view_analytics')
  .eq('user_id', user.id)
  .single();

if (!adminProfile || !adminProfile.can_manage_system) {
  return accessDeniedResponse();
}
```

### RLS Policies
Ensure Row Level Security policies are updated to work with new permission fields:

```sql
-- Example RLS policy for permission-based access
CREATE POLICY "Admins can view based on permissions" ON admin_profiles
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM admin_profiles super_admin 
      WHERE super_admin.user_id = auth.uid() 
      AND super_admin.can_manage_system = true
    )
  );
```

## Testing Checklist

### Functional Testing
- [ ] System admin can access all features
- [ ] Permission-based access works correctly
- [ ] Navigation shows appropriate items
- [ ] Access denied pages display properly
- [ ] API endpoints validate permissions

### Security Testing  
- [ ] Users cannot access restricted pages
- [ ] API endpoints reject unauthorized requests
- [ ] Permission escalation not possible
- [ ] Audit logs capture permission changes

## Partner Management Updates

### Pages Updated
- **`/admin/partners`**: Added permission-based access (requires `can_manage_partners` OR `can_manage_system`)
- **`/admin/partner-verification`**: Added permission-based access (requires `can_manage_partners` OR `can_manage_system`)

### API Endpoints Updated
- **`/api/v1/partners` POST**: Updated admin check to use `can_manage_partners` OR `can_manage_system`
- **`/api/v1/partners/[id]` PUT**: Updated admin check to use `can_manage_partners` OR `can_manage_system`
- **`/api/v1/partners/[id]` DELETE**: Updated admin check to use `can_manage_partners` OR `can_manage_system`

### Access Control Logic
Partner management functionality now requires one of:
- `can_manage_partners: true` (specific partner management permission)
- `can_manage_system: true` (system-wide administrative access)

This ensures that:
1. **Partner Admins** can manage partner-related functionality
2. **System Admins** retain full access to all features
3. **Standard Admins** without partner permissions cannot access partner management
4. **User-owned partner profiles** can still be updated by their owners (for PUT operations)

## User Management Updates

### Pages Updated
- **`/admin/users`**: Added permission-based access (requires `can_manage_users` OR `can_manage_system`)
- **`/admin/reviews`**: Added permission-based access (requires `can_manage_users` OR `can_manage_system`)

### Dashboard Updates
- **`/dashboard/page.tsx`**: Updated admin profile query to use permission fields instead of `admin_level`

### Access Control Logic
User management functionality now requires one of:
- `can_manage_users: true` (specific user management permission)
- `can_manage_system: true` (system-wide administrative access)

This ensures that:
1. **User Admins** can manage user-related functionality (users, reviews, moderation)
2. **System Admins** retain full access to all features
3. **Standard Admins** without user permissions cannot access user management
4. **Partner/Content Admins** without user permissions have no access to user data

### User Management Scope
User management permissions control access to:
- **User Profiles**: View and manage job seeker and partner user accounts
- **User Moderation**: Human-in-the-loop reviews and content moderation
- **User Analytics**: User activity, engagement, and platform usage data
- **Account Management**: User creation, deletion, and role assignments

## Content Management Updates

### Pages Updated
- **`/admin/jobs`**: Added permission-based access (requires `can_manage_content` OR `can_manage_system`)
- **`/admin/education`**: Added permission-based access (requires `can_manage_content` OR `can_manage_system`)
- **`/admin/resources`**: Added permission-based access (requires `can_manage_content` OR `can_manage_system`)
- **`/admin/job-moderation`**: Added permission-based access (requires `can_manage_content` OR `can_manage_system`)
- **`/admin/education-settings`**: Updated from `admin_level` to permission-based access (requires `can_manage_content` OR `can_manage_system`)

### API Endpoints Updated
- **`/api/v1/jobs` POST**: Updated admin check to use `can_manage_content` OR `can_manage_system`
- **`/api/v1/education/[id]` PUT/DELETE**: Updated admin checks to use `can_manage_content` OR `can_manage_system`
- **`/api/v1/partner-resources` GET/POST**: Updated admin checks to use `can_manage_content` OR `can_manage_system`

### Access Control Logic
Content management functionality now requires one of:
- `can_manage_content: true` (specific content management permission)
- `can_manage_system: true` (system-wide administrative access)

This ensures that:
1. **Content Admins** can manage all content-related functionality (jobs, education, resources, moderation)
2. **System Admins** retain full access to all features
3. **Standard Admins** without content permissions cannot access content management
4. **User/Partner Admins** without content permissions have no access to content management features

### Content Management Scope
Content management permissions control access to:
- **Job Listings**: Create, edit, moderate, and manage job postings across all partners
- **Education Programs**: Manage training programs, courses, and educational content
- **Knowledge Resources**: Manage knowledge base articles, guides, and resource libraries
- **Content Moderation**: Review and moderate user-generated content and flagged items
- **Content Settings**: Configure content policies, approval workflows, and publication rules

## Analytics Management Updates

### Pages Updated
- **`/admin/reports`**: Added permission-based access (requires `can_view_analytics` OR `can_manage_system`)
- **`/admin/system-analytics`**: Uses existing permission-based access (requires `can_manage_system`)

### API Endpoints Updated
- **`/api/v1/analytics/views` GET**: Updated admin check to use `can_view_analytics` OR `can_manage_system`
- **`/api/admin/analytics` GET/POST**: Updated admin checks to use `can_view_analytics` OR `can_manage_system`
- **`/api/v1/admin/analytics` POST**: Updated admin check to use `can_view_analytics` OR `can_manage_system`

### Access Control Logic
Analytics functionality now requires one of:
- `can_view_analytics: true` (specific analytics viewing permission)
- `can_manage_system: true` (system-wide administrative access)

This ensures that:
1. **Analytics Admins** can access all reporting and analytics functionality
2. **System Admins** retain full access to all features  
3. **Standard Admins** without analytics permissions cannot access sensitive data
4. **Partner Users** can still access analytics for their own resources (in analytics APIs)

### Analytics Management Scope
Analytics management permissions control access to:
- **Platform Reports**: Generate comprehensive reports on users, partners, jobs, and content
- **System Analytics**: Monitor platform performance, usage metrics, and health statistics
- **User Analytics**: Access user engagement, behavior, and demographic data
- **Partner Analytics**: View partner performance, job posting statistics, and resource usage
- **Content Analytics**: Track content views, downloads, and engagement metrics
- **Data Exports**: Download analytics data in various formats (CSV, PDF, Excel)

---

**Document Version**: 1.0  
**Last Updated**: January 15, 2024  
**Migration Status**: ✅ Schema Aligned - Frontend Updated 