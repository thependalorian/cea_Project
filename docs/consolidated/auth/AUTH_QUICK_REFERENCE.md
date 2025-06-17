# Authentication Quick Reference - CEA Platform

## ✅ Current Status: FULLY FUNCTIONAL
**Last Updated:** December 12, 2025  
**Platform:** https://cea.georgenekwaya.com  
**Local Development:** http://localhost:3000

---

## 🔐 Demo Account Credentials

All demo accounts are **ACTIVE** and **TESTED** ✅

### Job Seeker Account
- **Email:** `jobseeker@cea.georgenekwaya.com`
- **Password:** `Demo123!`
- **Redirects to:** `/job-seekers`
- **User Type:** `job_seeker`

### Partner Account  
- **Email:** `partner@cea.georgenekwaya.com`
- **Password:** `Demo123!`
- **Redirects to:** `/partners`
- **User Type:** `partner`

### Admin Account
- **Email:** `admin@cea.georgenekwaya.com`
- **Password:** `Demo123!`
- **Redirects to:** `/admin`
- **User Type:** `admin`

---

## 🚀 Quick Testing

### Web Interface
1. Visit: http://localhost:3000/auth/login
2. Use any demo account above
3. Verify automatic redirect to role-specific dashboard

### API Testing
```bash
# Test Job Seeker Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jobseeker@cea.georgenekwaya.com", "password": "Demo123!"}'

# Test Partner Login  
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "partner@cea.georgenekwaya.com", "password": "Demo123!"}'

# Test Admin Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@cea.georgenekwaya.com", "password": "Demo123!"}'
```

### Expected API Response
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": {
      "id": "user-uuid",
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

## 🔧 Technical Implementation

### Database Structure
Each user has entries in:
- ✅ **Main `profiles` table** - Contains `user_type` and `role` fields
- ✅ **Role-specific table** - `job_seeker_profiles`, `partner_profiles`, or `admin_profiles`

### Authentication Flow
1. **Login API** (`/api/auth/login`) authenticates user with Supabase
2. **Profile Detection** uses service role key to query profile tables
3. **User Type Detection** checks in order: admin → partner → job_seeker
4. **Redirect Logic** returns appropriate dashboard URL

### Row Level Security (RLS)
- Profile detection uses **service role key** to bypass RLS restrictions
- Ensures reliable user type detection regardless of authentication state

---

## 🛠️ Maintenance Commands

### Recreate Demo Users
```bash
node scripts/setup-demo-users.js
```

### Verify Authentication
```bash
node scripts/test-authentication.js
```

### Check Profile Data
```bash
# Quick verification script
node -e "
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
  const emails = ['jobseeker@cea.georgenekwaya.com', 'partner@cea.georgenekwaya.com', 'admin@cea.georgenekwaya.com'];
  for (const email of emails) {
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users.users.find(u => u.email === email);
    const { data: profile } = await supabase.from('profiles').select('user_type').eq('id', user.id).single();
    console.log(\`\${email}: \${profile?.user_type || 'NOT_FOUND'}\`);
  }
}
check();
"
```

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** User type detected as "job_seeker" for all accounts  
**Solution:** Ensure service role key is used for profile detection in login API

**Issue:** "JSON object requested, multiple (or no) rows returned"  
**Solution:** Use `.maybeSingle()` instead of `.single()` for profile queries

**Issue:** Profile not found  
**Solution:** Run `node scripts/setup-demo-users.js` to recreate profiles

### Debug Commands
```bash
# Check if profiles exist
curl -s http://localhost:3000/api/auth/status | jq

# Test specific user type detection
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "partner@cea.georgenekwaya.com", "password": "Demo123!"}' | jq '.data.user_type'
```

---

## 📋 Integration Checklist

- [x] Demo users created in all required tables
- [x] Login API properly detects user types  
- [x] Role-based redirects working
- [x] Service role key configured for profile access
- [x] RLS policies properly configured
- [x] Frontend login form integration
- [x] API authentication endpoints
- [x] Error handling and logging

---

**✅ Status:** All authentication flows tested and working correctly  
**🔗 Related:** See `docs/AUTHENTICATION.md` for detailed implementation guide 