# Deployment Guide
## Climate Economy Assistant (CEA)

### 🌐 **Production Environment**
- **Domain**: https://cea.georgenekwaya.com
- **Platform**: Vercel
- **Database**: Supabase (PostgreSQL)
- **CDN**: Vercel Edge Network

---

## 🚀 **Vercel Deployment**

### **1. Repository Setup**
```bash
# Connect your repository to Vercel
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Select "cea_project" directory
5. Configure build settings
```

### **2. Build Configuration**
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### **3. Environment Variables**
Configure in Vercel Dashboard → Settings → Environment Variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://zugdojmdktxalqflxbbh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://cea.georgenekwaya.com
NEXTAUTH_URL=https://cea.georgenekwaya.com
NEXTAUTH_SECRET=your_nextauth_secret_here

# API Configuration
NEXT_PUBLIC_API_URL=https://cea.georgenekwaya.com/api
BACKEND_API_URL=http://localhost:8000

# Optional Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
VERCEL_ANALYTICS_ID=your_vercel_analytics_id
```

### **4. Custom Domain Setup**
```bash
# In Vercel Dashboard
1. Go to Project Settings → Domains
2. Add custom domain: cea.georgenekwaya.com
3. Configure DNS records:
   - Type: CNAME
   - Name: cea
   - Value: cname.vercel-dns.com
4. Wait for SSL certificate provisioning
5. Set as primary domain
```

---

## 🗄️ **Supabase Configuration**

### **1. Authentication Settings**
```bash
# In Supabase Dashboard → Authentication → Settings
Site URL: https://cea.georgenekwaya.com

# Redirect URLs
https://cea.georgenekwaya.com/auth/callback
https://cea.georgenekwaya.com/auth/update-password
https://cea.georgenekwaya.com/auth/reset-password
http://localhost:3000/auth/callback (for development)
```

### **2. Database Setup**
```sql
-- Ensure all required tables exist
-- Run migration scripts if needed
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify demo users exist
SELECT email, created_at FROM auth.users 
WHERE email LIKE '%@demo.com';
```

### **3. Row Level Security (RLS)**
```sql
-- Enable RLS on all profile tables
ALTER TABLE job_seeker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for secure access
CREATE POLICY "Users can view own profile" ON job_seeker_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON job_seeker_profiles
  FOR UPDATE USING (auth.uid() = user_id);
```

---

## 🔧 **Build & Deploy Process**

### **1. Pre-deployment Checklist**
```bash
# Local testing
npm run type-check     # TypeScript validation
npm run lint          # ESLint checks
npm run build         # Production build test
npm run start         # Test production build locally

# Authentication testing
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jobseeker@demo.com", "password": "Demo123!"}'
```

### **2. Deployment Pipeline**
```yaml
# Automatic deployment on push to main
name: Deploy to Production
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### **3. Post-deployment Verification**
```bash
# Health checks
curl https://cea.georgenekwaya.com/api/health
curl https://cea.georgenekwaya.com/api/auth/status

# Authentication test
curl -X POST https://cea.georgenekwaya.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jobseeker@demo.com", "password": "Demo123!"}'

# Database connectivity
curl https://cea.georgenekwaya.com/api/jobs?limit=1
```

---

## 🔒 **Security Configuration**

### **1. HTTPS & SSL**
```bash
# Vercel automatically provides SSL
# Verify certificate
curl -I https://cea.georgenekwaya.com

# Force HTTPS redirect
# Configured in next.config.js
```

### **2. Security Headers**
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

### **3. Rate Limiting**
```typescript
// Implemented in middleware
const rateLimits = {
  '/api/auth/login': { requests: 5, window: '1m' },
  '/api/auth/register': { requests: 3, window: '1h' },
  '/api/auth/reset': { requests: 3, window: '1h' }
};
```

---

## 📊 **Monitoring & Analytics**

### **1. Vercel Analytics**
```bash
# Enable in Vercel Dashboard
1. Go to Project → Analytics
2. Enable Web Analytics
3. Add VERCEL_ANALYTICS_ID to environment variables
```

### **2. Error Monitoring**
```typescript
// Sentry integration (optional)
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### **3. Performance Monitoring**
```bash
# Core Web Vitals tracking
# Automatically enabled with Vercel Analytics
# Custom metrics in _app.tsx
```

---

## 🔄 **Backup & Recovery**

### **1. Database Backups**
```bash
# Supabase automatic backups
# Daily backups retained for 7 days (free tier)
# Weekly backups retained for 4 weeks

# Manual backup
pg_dump "postgresql://user:pass@host:port/db" > backup.sql
```

### **2. Code Repository**
```bash
# GitHub as primary repository
# Vercel deployment from GitHub
# Automatic deployments on push
```

### **3. Environment Recovery**
```bash
# Environment variables backed up in:
# 1. Vercel Dashboard
# 2. Local .env.example file
# 3. Documentation (this file)
```

---

## 🚨 **Troubleshooting**

### **Common Deployment Issues**

#### **Build Failures**
```bash
# TypeScript errors
npm run type-check

# Missing dependencies
npm install

# Environment variables
# Check Vercel Dashboard → Settings → Environment Variables
```

#### **Authentication Issues**
```bash
# Supabase URL mismatch
# Verify NEXT_PUBLIC_SUPABASE_URL in Vercel

# Redirect URL issues
# Check Supabase Dashboard → Authentication → Settings
```

#### **Database Connection**
```bash
# Connection timeout
# Check Supabase project status
# Verify service role key

# RLS policies blocking access
# Review row level security policies
```

### **Debug Commands**
```bash
# Check deployment logs
vercel logs cea.georgenekwaya.com

# Test API endpoints
curl https://cea.georgenekwaya.com/api/health
curl https://cea.georgenekwaya.com/api/auth/status

# Database connectivity test
curl https://cea.georgenekwaya.com/api/test-db
```

---

## 📈 **Performance Optimization**

### **1. Next.js Optimizations**
```javascript
// next.config.js
module.exports = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['cea.georgenekwaya.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  poweredByHeader: false,
};
```

### **2. Database Optimization**
```sql
-- Add indexes for frequently queried columns
CREATE INDEX idx_job_seeker_profiles_user_id ON job_seeker_profiles(user_id);
CREATE INDEX idx_partner_profiles_verified ON partner_profiles(verified);
CREATE INDEX idx_job_listings_active ON job_listings(is_active);
```

### **3. Caching Strategy**
```typescript
// API route caching
export const revalidate = 3600; // 1 hour

// Static generation for public pages
export async function generateStaticParams() {
  // Pre-generate common pages
}
```

---

## 🔧 **Maintenance**

### **Regular Tasks**
```bash
# Weekly
- Review error logs
- Check performance metrics
- Update dependencies (if needed)

# Monthly
- Security audit
- Database cleanup
- Backup verification

# Quarterly
- Full security review
- Performance optimization
- User feedback analysis
```

### **Update Process**
```bash
# 1. Test locally
npm run dev
npm run build
npm run start

# 2. Deploy to staging (if available)
vercel --target staging

# 3. Deploy to production
git push origin main  # Automatic deployment
```

---

## 📞 **Support & Contacts**

### **Platform Access**
- **Production**: https://cea.georgenekwaya.com
- **Admin Panel**: https://cea.georgenekwaya.com/admin
- **API Docs**: https://cea.georgenekwaya.com/api/docs

### **Service Providers**
- **Hosting**: Vercel Dashboard
- **Database**: Supabase Dashboard
- **Domain**: DNS Provider Dashboard
- **Monitoring**: Vercel Analytics

### **Emergency Contacts**
- **Technical Issues**: Check Vercel status page
- **Database Issues**: Check Supabase status page
- **Domain Issues**: Contact DNS provider

---

**Last Updated**: December 2024  
**Domain**: https://cea.georgenekwaya.com  
**Deployment Platform**: Vercel  
**Database**: Supabase 