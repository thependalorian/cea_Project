# Deployment Guide

## 🚀 Overview

This guide covers deploying the Climate Economy Assistant from development to production, including environment setup, database configuration, and monitoring.

## 📋 Prerequisites

### Required Accounts & Services
- **Vercel Account** - For hosting and deployment
- **Supabase Account** - For database and authentication
- **OpenAI Account** - For AI features
- **Resend Account** - For email notifications
- **GitHub Account** - For version control and CI/CD

### Local Development Tools
```bash
# Required tools
node >= 18.17.0
npm >= 9.0.0
git >= 2.20.0

# Verify versions
node --version
npm --version
git --version
```

## 🛠️ Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/climate-economy-assistant.git
cd climate-economy-assistant
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Configuration

#### Development Environment (`.env.local`)
```bash
# Copy template
cp .env.example .env.local

# Edit with your values
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key

# Email Configuration
RESEND_API_KEY=re_your-resend-key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VERCEL_ANALYTICS_ID=your-vercel-analytics-id

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_RESUME_ANALYSIS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

#### Production Environment Variables
```bash
# Production-specific variables
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1

# Security
NEXTAUTH_SECRET=your-secure-random-string
SUPABASE_JWT_SECRET=your-jwt-secret

# External APIs
OPENAI_API_KEY=sk-prod-your-openai-key
RESEND_API_KEY=re_prod-your-resend-key

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
POSTHOG_API_KEY=phc_your-posthog-key
```

## 🗄️ Database Setup

### 1. Supabase Project Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init

# Link to your project
supabase link --project-ref your-project-id
```

### 2. Database Schema Migration
```sql
-- Run in Supabase SQL editor or via CLI

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create custom types
CREATE TYPE user_role AS ENUM ('job_seeker', 'partner', 'admin');
CREATE TYPE employment_type AS ENUM ('full_time', 'part_time', 'contract', 'internship');
CREATE TYPE experience_level AS ENUM ('entry', 'mid', 'senior', 'executive');
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'interviewing', 'accepted', 'rejected');

-- Core tables
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  account_type user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job seekers table
CREATE TABLE job_seekers (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  skills JSONB DEFAULT '[]',
  experience_level experience_level,
  location JSONB,
  salary_range JSONB,
  interests JSONB DEFAULT '[]',
  resume_url TEXT,
  profile_summary TEXT,
  availability TEXT
);

-- Partners table
CREATE TABLE partners (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  organization_name TEXT NOT NULL,
  organization_type TEXT,
  website_url TEXT,
  description TEXT,
  location JSONB,
  company_size TEXT,
  founded_year INTEGER
);

-- Jobs table
CREATE TABLE jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location JSONB NOT NULL,
  employment_type employment_type NOT NULL,
  experience_level experience_level NOT NULL,
  salary_range JSONB,
  skills_required JSONB DEFAULT '[]',
  climate_focus JSONB DEFAULT '[]',
  remote_allowed BOOLEAN DEFAULT FALSE,
  application_deadline TIMESTAMP WITH TIME ZONE,
  benefits JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job_listings(id),
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'pending',
  applied_date TIMESTAMP DEFAULT NOW(),
  resume_url TEXT,
  additional_info TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Row Level Security (RLS) Policies
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_seekers ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Job seekers policies
CREATE POLICY "Job seekers can view own data" ON job_seekers
  FOR ALL USING (auth.uid() = id);

-- Partners policies
CREATE POLICY "Partners can view own data" ON partners
  FOR ALL USING (auth.uid() = id);

-- Jobs policies
CREATE POLICY "Anyone can view active jobs" ON jobs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Partners can manage own jobs" ON jobs
  FOR ALL USING (partner_id = auth.uid());

-- Applications policies
CREATE POLICY "Applicants can view own applications" ON applications
  FOR SELECT USING (applicant_id = auth.uid());

CREATE POLICY "Partners can view applications for their jobs" ON applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.partner_id = auth.uid()
    )
  );
```

### 4. Database Indexes
```sql
-- Performance indexes
CREATE INDEX idx_jobs_location ON jobs USING GIN (location);
CREATE INDEX idx_jobs_skills ON jobs USING GIN (skills_required);
CREATE INDEX idx_jobs_climate_focus ON jobs USING GIN (climate_focus);
CREATE INDEX idx_jobs_partner_active ON jobs (partner_id, is_active);
CREATE INDEX idx_applications_job_id ON applications (job_id);
CREATE INDEX idx_applications_applicant_id ON applications (applicant_id);
CREATE INDEX idx_job_seekers_skills ON job_seekers USING GIN (skills);

-- Full-text search indexes
CREATE INDEX idx_jobs_search ON jobs USING GIN (to_tsvector('english', title || ' ' || description));
```

## 🚀 Vercel Deployment

### 1. Vercel Project Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### 2. Vercel Configuration (`vercel.json`)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["bos1", "nyc1", "sfo1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/signup",
      "destination": "/auth/sign-up",
      "permanent": true
    },
    {
      "source": "/login",
      "destination": "/auth/login",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/docs/:path*",
      "destination": "/help"
    }
  ]
}
```

### 3. Environment Variables in Vercel
```bash
# Add via Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production

# Or via Vercel Dashboard:
# 1. Go to Project Settings > Environment Variables
# 2. Add all required variables for each environment
```

### 4. Build Optimization
```json
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', 'lucide-react'],
  },
  images: {
    domains: ['your-supabase-url.supabase.co'],
    formats: ['image/webp', 'image/avif'],
  },
  typescript: {
    // Only in production, not during development
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // Only run ESLint on these directories during builds
    dirs: ['app', 'components', 'lib'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

## 🔒 Security Configuration

### 1. Supabase Security
```sql
-- Enable additional security features
ALTER DATABASE postgres SET log_statement = 'all';
ALTER DATABASE postgres SET log_duration = on;

-- Create security policies for sensitive operations
CREATE OR REPLACE FUNCTION auth.check_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND account_type = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. API Rate Limiting
```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimit = new Map();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? 'anonymous';
  const limit = 100; // requests per hour
  const windowMs = 60 * 60 * 1000; // 1 hour
  
  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 0, resetTime: Date.now() + windowMs });
  }
  
  const userLimit = rateLimit.get(ip);
  
  if (Date.now() > userLimit.resetTime) {
    userLimit.count = 0;
    userLimit.resetTime = Date.now() + windowMs;
  }
  
  if (userLimit.count >= limit) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }
  
  userLimit.count++;
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### 3. Content Security Policy
```typescript
// app/layout.tsx
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.vercel-insights.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="Content-Security-Policy" content={cspHeader.replace(/\s{2,}/g, ' ').trim()} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## 📊 Monitoring & Analytics

### 1. Error Tracking with Sentry
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure Sentry
npx @sentry/wizard@latest -i nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: false,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ["localhost", /^https:\/\/your-domain\.com\/api/],
    }),
  ],
});
```

### 2. Performance Monitoring
```typescript
// lib/analytics.ts
export const trackEvent = async (event: string, properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    // Vercel Analytics
    if (window.va) {
      window.va('track', event, properties);
    }
    
    // Google Analytics
    if (window.gtag) {
      window.gtag('event', event, properties);
    }
  }
};

export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    if (window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
        page_location: url,
      });
    }
  }
};
```

### 3. Database Monitoring
```sql
-- Create monitoring views
CREATE VIEW job_analytics AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as jobs_posted,
  COUNT(*) FILTER (WHERE is_active = true) as active_jobs,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400) as avg_duration_days
FROM jobs
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

CREATE VIEW application_analytics AS
SELECT 
  DATE_TRUNC('day', applied_date) as date,
  COUNT(*) as total_applications,
  COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
  AVG(match_score) as avg_match_score
FROM applications
GROUP BY DATE_TRUNC('day', applied_date)
ORDER BY date DESC;
```

## 🔄 CI/CD Pipeline

### 1. GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run linting
        run: npm run lint
      
      - name: Run tests
        run: npm run test
        env:
          NODE_ENV: test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 2. Database Migrations
```bash
# Create migration script
#!/bin/bash
# scripts/migrate.sh

echo "Running database migrations..."

# Apply schema changes
supabase db push

# Seed initial data if needed
if [ "$ENVIRONMENT" = "production" ]; then
  echo "Seeding production data..."
  psql $DATABASE_URL -f scripts/seed-production.sql
else
  echo "Seeding development data..."
  psql $DATABASE_URL -f scripts/seed-development.sql
fi

echo "Migration complete!"
```

## 🌐 Custom Domain Setup

### 1. Domain Configuration
```bash
# Add domain to Vercel project
vercel domains add yourdomain.com

# Add environment variable for domain
vercel env add NEXT_PUBLIC_APP_URL https://yourdomain.com production
```

### 2. DNS Configuration
```
# DNS Records for yourdomain.com
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

## 🔧 Troubleshooting

### Common Deployment Issues

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Database Connection Issues
```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'climate-economy-assistant',
    },
  },
});
```

#### Performance Issues
```typescript
// app/layout.tsx
import { Suspense } from 'react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}
```

## 📈 Post-Deployment Checklist

### Production Verification
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificate active
- [ ] Error tracking functional
- [ ] Analytics tracking working
- [ ] Email notifications working
- [ ] File uploads functional
- [ ] Search functionality working
- [ ] User registration/login working
- [ ] Payment processing (if applicable)

### Performance Optimization
- [ ] Core Web Vitals scores
- [ ] Lighthouse audit passed
- [ ] Database query optimization
- [ ] CDN configuration
- [ ] Image optimization
- [ ] Bundle size optimization

### Security Verification
- [ ] HTTPS enforcement
- [ ] Security headers configured
- [ ] Content Security Policy active
- [ ] Rate limiting functional
- [ ] SQL injection protection
- [ ] XSS protection enabled

This deployment guide ensures your Climate Economy Assistant platform is production-ready, secure, and scalable for Massachusetts's growing climate economy ecosystem. 