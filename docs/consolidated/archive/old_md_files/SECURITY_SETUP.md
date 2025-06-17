# 🔐 Security Setup Guide

## ⚠️ IMPORTANT: JWT Token Security

This repository had JWT tokens accidentally committed and **has been cleaned**. If you received a GitGuardian alert, the tokens have been:

1. ✅ **Removed from git history** 
2. ✅ **Removed from GitHub remote repository**
3. ✅ **Added to .gitignore** to prevent future commits

## 🛡️ Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# API Keys
OPENAI_API_KEY=your_openai_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# Development
NODE_ENV=development
```

## 🚨 Next Steps Required

### 1. **Regenerate Supabase Keys**
- Go to your Supabase project dashboard
- Navigate to Settings > API
- **Regenerate** both the anon key and service role key
- Update your `.env.local` file with the new keys

### 2. **Update Production Environment**
- If deployed on Vercel, update environment variables there
- If using other hosting, update environment variables accordingly

### 3. **Security Best Practices**
- Never commit `.env`, `.env.local`, or any files containing tokens
- Use environment variables for all sensitive data
- Regularly rotate API keys and tokens
- Enable GitGuardian or similar tools to catch future accidents

## 🔍 Files That Were Cleaned

The following files contained JWT tokens and were removed from git history:
- `act-brand-demo/lib/database.ts` (recreated without tokens)
- `act-brand-demo/test-database.js` (recreated without tokens)
- `server.log` (contained service role keys)
- `enhanced_server.log` (contained service role keys)
- `langgraph_output.log` (contained service role keys)

## ✅ Current Status

- ✅ Git history cleaned
- ✅ Remote repository updated
- ✅ Files recreated securely
- ✅ .gitignore updated
- ⚠️ **YOU MUST**: Regenerate Supabase keys
- ⚠️ **YOU MUST**: Update production environment variables 