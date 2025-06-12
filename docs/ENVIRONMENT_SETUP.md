# Environment Setup Guide
## Climate Economy Assistant (CEA)

### 🌐 **Domain Configuration**
**Production URL**: https://cea.georgenekwaya.com

---

## 🔧 **Environment Variables**

### **Required Variables**
Create a `.env.local` file in your project root with these variables:

```env
# =============================================================================
# SUPABASE CONFIGURATION
# =============================================================================
# Get these from your Supabase project dashboard
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# =============================================================================
# SITE CONFIGURATION
# =============================================================================
# Production domain
NEXT_PUBLIC_SITE_URL=https://cea.georgenekwaya.com

# API endpoints
NEXT_PUBLIC_API_URL=https://cea.georgenekwaya.com/api
BACKEND_API_URL=http://localhost:8000

# =============================================================================
# AUTHENTICATION
# =============================================================================
# Auth redirect URLs
AUTH_REDIRECT_URL=https://cea.georgenekwaya.com/auth/callback
PASSWORD_RESET_URL=https://cea.georgenekwaya.com/auth/update-password

# =============================================================================
# OPTIONAL SERVICES
# =============================================================================
# Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
VERCEL_ANALYTICS_ID=your_vercel_analytics_id

# Error monitoring
SENTRY_DSN=your_sentry_dsn_here

# =============================================================================
# DEVELOPMENT ONLY
# =============================================================================
NODE_ENV=development
PYTHON_BACKEND_URL=http://localhost:8000
```

---

## 🚀 **Vercel Deployment Setup**

### **1. Environment Variables in Vercel**
Configure these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | All |
| `NEXT_PUBLIC_SITE_URL` | `https://cea.georgenekwaya.com` | Production |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Development |
| `NEXT_PUBLIC_API_URL` | `https://cea.georgenekwaya.com/api` | Production |
| `BACKEND_API_URL` | `http://localhost:8000` | All |

### **2. Custom Domain Configuration**
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
In Supabase Dashboard → Authentication → Settings:

```bash
# Site URL
https://cea.georgenekwaya.com

# Redirect URLs (add all of these)
https://cea.georgenekwaya.com/auth/callback
https://cea.georgenekwaya.com/auth/update-password
https://cea.georgenekwaya.com/auth/reset-password
http://localhost:3000/auth/callback
```

### **2. Email Templates**
Configure custom email templates with your branding:

```html
<!-- Confirmation Email Template -->
<h2>Welcome to Climate Economy Assistant</h2>
<p>Please confirm your email address by clicking the link below:</p>
<a href="{{ .ConfirmationURL }}">Confirm Email</a>

<!-- Password Reset Template -->
<h2>Reset Your Password</h2>
<p>Click the link below to reset your password:</p>
<a href="{{ .RedirectTo }}">Reset Password</a>
```

---

## 🔒 **Security Configuration**

### **1. CORS Settings**
```typescript
// In your API routes
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://cea.georgenekwaya.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

### **2. Content Security Policy**
```javascript
// In next.config.js
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' *.vercel-analytics.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;
```

---

## 🧪 **Testing Configuration**

### **1. Demo Account Setup**
```bash
# Run the demo user setup script
node scripts/setup-demo-users.js

# Verify demo accounts work
curl -X POST https://cea.georgenekwaya.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jobseeker@demo.com", "password": "Demo123!"}'
```

### **2. Health Check Endpoints**
```bash
# Test API connectivity
curl https://cea.georgenekwaya.com/api/health

# Test authentication
curl https://cea.georgenekwaya.com/api/auth/status

# Test database connection
curl https://cea.georgenekwaya.com/api/test-db
```

---

## 📊 **Analytics Setup**

### **1. Vercel Analytics**
```bash
# Enable in Vercel Dashboard
1. Go to Project → Analytics
2. Enable Web Analytics
3. Add VERCEL_ANALYTICS_ID to environment variables
```

### **2. Google Analytics (Optional)**
```javascript
// In _app.tsx or layout.tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
    </html>
  )
}
```

---

## 🔧 **Development Setup**

### **1. Local Development**
```bash
# Clone repository
git clone <repository-url>
cd cea_project

# Install dependencies
npm install

# Copy environment template
cp docs/ENVIRONMENT_SETUP.md .env.local
# Edit .env.local with your values

# Setup demo users
node scripts/setup-demo-users.js

# Start development server
npm run dev
```

### **2. Local Testing**
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build

# Start production build locally
npm run start
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Environment Variable Not Found**
```bash
# Check if variable is properly set
echo $NEXT_PUBLIC_SUPABASE_URL

# Restart development server after adding variables
npm run dev
```

#### **CORS Errors**
```bash
# Verify domain in Supabase settings
# Check NEXT_PUBLIC_SITE_URL matches actual domain
# Ensure API routes include proper CORS headers
```

#### **Authentication Redirect Issues**
```bash
# Verify redirect URLs in Supabase dashboard
# Check NEXT_PUBLIC_SITE_URL environment variable
# Ensure middleware is properly configured
```

### **Debug Commands**
```bash
# Check environment variables
npm run env-check

# Test Supabase connection
npm run test-supabase

# Verify authentication flow
npm run test-auth
```

---

## 📋 **Deployment Checklist**

### **Pre-deployment**
- [ ] All environment variables configured in Vercel
- [ ] Supabase authentication settings updated
- [ ] Custom domain configured and SSL active
- [ ] Demo accounts created and tested
- [ ] Build passes locally (`npm run build`)
- [ ] Type checking passes (`npm run type-check`)

### **Post-deployment**
- [ ] Health check endpoints respond correctly
- [ ] Authentication flow works end-to-end
- [ ] Demo accounts can log in successfully
- [ ] All three user roles redirect properly
- [ ] Password reset flow functional
- [ ] Analytics tracking active

---

**Domain**: https://cea.georgenekwaya.com  
**Last Updated**: December 2024  
**Platform**: Vercel + Supabase 