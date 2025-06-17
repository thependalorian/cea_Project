# Authentication System - Climate Economy Assistant

## ✅ Current Status: FULLY FUNCTIONAL
**Last Updated:** December 12, 2025  
**All authentication flows tested and working correctly**

---

## 🏗️ System Architecture

### Authentication Flow
```
User Login → Supabase Auth → Profile Detection → Role-based Redirect
```

### Database Structure
Each authenticated user has:
1. **Auth User** - Supabase `auth.users` table
2. **Main Profile** - `profiles` table with `user_type` and `role`
3. **Role-specific Profile** - `job_seeker_profiles`, `partner_profiles`, or `admin_profiles`

### Key Components
- **Login API** (`/app/api/auth/login/route.ts`) - Handles authentication and user type detection
- **Supabase Client** (`/lib/supabase/server.ts`) - Server-side database access
- **Demo Setup** (`/scripts/setup-demo-users.js`) - Creates test accounts
- **Middleware** (`/middleware.ts`) - Route protection and redirects

---

## 🔐 Demo Accounts (ACTIVE)

All demo accounts are fully functional and tested:

| Role | Email | Password | Redirect | User Type |
|------|-------|----------|----------|-----------|
| **Job Seeker** | `jobseeker@cea.georgenekwaya.com` | `Demo123!` | `/job-seekers` | `job_seeker` |
| **Partner** | `partner@cea.georgenekwaya.com` | `Demo123!` | `/partners` | `partner` |
| **Admin** | `admin@cea.georgenekwaya.com` | `Demo123!` | `/admin` | `admin` |

---

## 🔧 Technical Implementation

### Login API Route (`/app/api/auth/login/route.ts`)

**Key Features:**
- Authenticates users with Supabase `signInWithPassword`
- Uses **service role key** for profile detection (bypasses RLS)
- Implements fallback user type detection logic
- Returns user data, session, and redirect URL

**Profile Detection Logic:**
```typescript
// Check in order: admin → partner → job_seeker
1. Check admin_profiles (by user_id)
2. Check partner_profiles (by id) 
3. Check job_seeker_profiles (by user_id)
4. Default to job_seeker if none found
```

**Critical Fix Applied:**
- **Issue:** RLS policies blocked profile access with anon key
- **Solution:** Use service role key for profile queries after authentication
- **Result:** Reliable user type detection for all roles

### Database Schema

#### Main Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  user_type TEXT DEFAULT 'user',
  role TEXT DEFAULT 'user',
  first_name TEXT,
  last_name TEXT,
  -- Additional fields...
);
```

#### Role-specific Tables
- `admin_profiles` - Admin permissions and metadata
- `partner_profiles` - Organization details and partnership info  
- `job_seeker_profiles` - Career preferences and profile data

### Row Level Security (RLS)

**Current Configuration:**
- Profile tables have RLS enabled
- Service role key bypasses RLS for reliable profile detection
- Anon key respects RLS policies for security

**Policy Examples:**
```sql
-- Users can view all profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);

-- Users can manage their own profile  
CREATE POLICY "Users can manage their own profile" ON profiles FOR ALL USING (id = auth.uid());
```

---

## 🚀 Setup and Testing

### Initial Setup
```bash
# 1. Create demo users
node scripts/setup-demo-users.js

# 2. Verify authentication
node scripts/test-authentication.js

# 3. Start development server
npm run dev
```

### Testing Authentication

#### Web Interface Testing
1. Visit: http://localhost:3000/auth/login
2. Use any demo account credentials
3. Verify automatic redirect to role-specific dashboard

#### API Testing
```bash
# Test all three user types
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jobseeker@cea.georgenekwaya.com", "password": "Demo123!"}'

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "partner@cea.georgenekwaya.com", "password": "Demo123!"}'

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@cea.georgenekwaya.com", "password": "Demo123!"}'
```

#### Expected Response Format
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@cea.georgenekwaya.com",
      "user_metadata": {...}
    },
    "session": {
      "access_token": "jwt-token",
      "expires_at": 1234567890
    },
    "user_type": "job_seeker|partner|admin",
    "redirect_url": "/job-seekers|/partners|/admin"
  }
}
```

---

## 🛠️ Maintenance and Troubleshooting

### Common Issues and Solutions

#### Issue: User Type Always "job_seeker"
**Cause:** Profile detection using anon key instead of service role key  
**Solution:** Ensure login API uses service role key for profile queries

#### Issue: "JSON object requested, multiple (or no) rows returned"
**Cause:** Using `.single()` on queries that may return no results  
**Solution:** Use `.maybeSingle()` for optional profile lookups

#### Issue: Profile Not Found
**Cause:** Demo users not properly created in all required tables  
**Solution:** Run `node scripts/setup-demo-users.js` to recreate profiles

### Debug Commands

```bash
# Check profile existence
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
  const emails = ['jobseeker@cea.georgenekwaya.com', 'partner@cea.georgenekwaya.com', 'admin@cea.georgenekwaya.com'];
  for (const email of emails) {
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users.users.find(u => u.email === email);
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('user_type').eq('id', user.id).single();
      console.log(\`\${email}: \${profile?.user_type || 'NOT_FOUND'}\`);
    } else {
      console.log(\`\${email}: USER_NOT_FOUND\`);
    }
  }
}
check();
"

# Test specific user type detection
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "partner@cea.georgenekwaya.com", "password": "Demo123!"}' | jq '.data.user_type'

# Check authentication status
curl -s http://localhost:3000/api/auth/status | jq
```

### Recreating Demo Users

If profiles are corrupted or missing:

```bash
# Full recreation
node scripts/setup-demo-users.js

# Verify creation
node scripts/test-authentication.js
```

---

## 🔒 Security Considerations

### Current Security Measures
- ✅ **Password Requirements**: 8+ characters, mixed case, numbers, symbols
- ✅ **Email Verification**: Required for new accounts  
- ✅ **Session Security**: HttpOnly cookies, secure transmission
- ✅ **Role-based Access**: Automatic redirects prevent unauthorized access
- ✅ **RLS Policies**: Database-level security for profile access
- ✅ **Service Role Protection**: Limited to server-side profile detection only

### Best Practices Implemented
- Service role key used only for essential profile detection
- Anon key used for regular user operations
- Profile queries use `.maybeSingle()` to handle missing data gracefully
- Comprehensive error handling and logging
- Fallback user type assignment for edge cases

---

## 📋 Integration Checklist

### ✅ Completed Items
- [x] Demo users created in all required tables (`profiles`, role-specific tables)
- [x] Login API properly detects user types using service role key
- [x] Role-based redirects working for all three user types
- [x] RLS policies configured and tested
- [x] Frontend login form integration
- [x] API authentication endpoints functional
- [x] Error handling and logging implemented
- [x] Documentation updated with current state

### 🔄 Ongoing Maintenance
- [ ] Monitor authentication logs for issues
- [ ] Regular testing of demo accounts
- [ ] Update documentation as system evolves
- [ ] Performance monitoring of profile detection queries

---

## 📚 Related Documentation

- **Quick Reference**: `docs/AUTH_QUICK_REFERENCE.md`
- **Environment Setup**: `docs/ENVIRONMENT_SETUP.md`
- **API Documentation**: `docs/API_REFERENCE.md`
- **Deployment Guide**: `docs/DEPLOYMENT_GUIDE.md`

---

**✅ Status:** All authentication flows tested and working correctly  
**🔗 Platform:** https://cea.georgenekwaya.com  
**🛠️ Local Development:** http://localhost:3000 