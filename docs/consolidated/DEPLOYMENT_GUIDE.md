# Deployment Guide

This guide provides detailed instructions for deploying the Climate Economy Assistant application to production environments.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Backend LangGraph Deployment](#backend-langgraph-deployment)
5. [Database Setup (Supabase)](#database-setup-supabase)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

1. A GitHub account with access to the repository
2. A Vercel account for frontend deployment
3. A Supabase account for database hosting
4. An OpenAI API key for AI functionality
5. Python 3.11+ installed for LangGraph server

## Environment Setup

### Required Environment Variables

Create a `.env` file with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# API Keys
OPENAI_API_KEY=your-openai-api-key

# LangGraph Configuration
LANGGRAPH_API_KEY=your-langgraph-api-key
LANGGRAPH_BASE_URL=your-langgraph-url

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
NEXT_PUBLIC_SITE_NAME="Climate Economy Assistant"
```

## Frontend Deployment (Vercel)

### Connecting to Vercel

1. Log in to your Vercel account
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework preset: Next.js
   - Root directory: `./` (or specify if different)
   - Node.js version: 18.x or higher

### Environment Variables

Add all environment variables from your `.env` file to the Vercel project settings.

### Build Settings

Configure the following build settings:

1. Build command: `npm run build`
2. Output directory: `.next`
3. Install command: `npm install`

### Security Headers

Add security headers in your `next.config.js`:

```javascript
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
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}
```

### Deploy

1. Click "Deploy" in the Vercel dashboard
2. Wait for the build to complete
3. Verify deployment at the provided URL

## Backend LangGraph Deployment

### LangGraph Server Setup

1. SSH into your server or use a cloud provider (AWS, GCP, Azure)
2. Clone the repository:
   ```bash
   git clone https://github.com/your-username/climate-economy-assistant.git
   cd climate-economy-assistant
   ```

3. Set up Python environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install "pydantic[email]" scipy scikit-learn
   ```

5. Install LangGraph:
   ```bash
   # Install LangGraph CLI
   pip install langgraph
   ```

6. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

7. Start LangGraph server:
   ```bash
   # For development with tunnel
   langgraph dev --port 2025 --tunnel

   # For production
   langgraph deploy
   ```

8. Note the URL provided by LangGraph and update `LANGGRAPH_BASE_URL` in your frontend environment variables.

## Database Setup (Supabase)

### Create Supabase Project

1. Log in to Supabase dashboard
2. Create a new project
3. Note your project URL and API keys

### Database Migrations

1. Navigate to the SQL editor in Supabase dashboard
2. Run the migration scripts in order:
   ```sql
   -- Run each migration file in the supabase/migrations directory
   ```

3. Verify tables are created correctly

### Row Level Security Policies

1. Navigate to the Authentication > Policies section
2. Review and enable RLS for all tables
3. Add policies for each table to restrict access appropriately

## Post-Deployment Verification

### Frontend Verification

1. Visit your deployed URL
2. Test user registration and login
3. Verify all pages load correctly
4. Test responsive design on mobile devices

### Backend Verification

1. Test API endpoints using Postman or similar tool
2. Verify LangGraph server is responding
3. Check authentication is working correctly
4. Test AI assistant functionality

### Database Verification

1. Verify RLS policies are working as expected
2. Test data persistence across sessions
3. Check performance with sample queries

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **API Connection Issues**
   - Verify environment variables are set correctly
   - Check CORS configuration
   - Test API endpoints independently

3. **LangGraph Server Issues**
   - Check server logs
   - Verify Python dependencies are installed
   - Check network connectivity and firewall settings

4. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check network connectivity
   - Test database connection independently

### Deployment Checklist

Before finalizing deployment, verify:

1. All environment variables are properly set
2. Security headers are configured
3. Authentication is working correctly
4. Database migrations are complete
5. All required Python dependencies are installed for LangGraph functionality
6. API endpoints are accessible and responding correctly
7. Frontend is loading without JavaScript errors
8. Full security review

### Monitoring

Set up monitoring for:

1. Server uptime and performance
2. API response times
3. Database performance
4. Error rates and logs

## Conclusion

Following this deployment guide will ensure your Climate Economy Assistant application is properly set up in a production environment. For additional support, refer to the technical documentation or contact the development team.
