# OAuth Provider Setup Guide

This guide explains how to set up OAuth providers (Google and LinkedIn) for the Climate Economy Assistant application.

## Prerequisites

Before you begin, make sure you have:

1. Access to the Supabase project dashboard
2. A Google Cloud Platform account
3. A LinkedIn Developer account
4. The application domain (e.g., `cea.georgenekwaya.com`)

## Automated Setup

We provide a script to help you set up OAuth providers automatically:

```bash
# Run the setup script
node scripts/setup-oauth-providers.js
```

The script will guide you through the process and ask for the necessary information.

## Manual Setup

If you prefer to set up the providers manually, follow these steps:

### 1. Get Callback URL

First, you need to get the OAuth callback URL from your Supabase project:

```bash
# Run the check script to get the callback URL
node scripts/check-oauth-providers.js
```

The callback URL should look like: `https://zugdojmdktxalqflxbbh.supabase.co/auth/v1/callback`

### 2. Set Up Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Set application type to "Web application"
6. Add your application domain to "Authorized JavaScript origins":
   - Production: `https://cea.georgenekwaya.com`
   - Development: `http://localhost:3000`
7. Add the Supabase callback URL to "Authorized redirect URIs"
8. Click "Create" to get your Client ID and Client Secret

### 3. Set Up LinkedIn OAuth

1. Go to the [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps)
2. Click "Create app"
3. Fill in the required information:
   - App name: "Climate Economy Assistant"
   - Company: Your company name
   - Privacy policy URL: Your privacy policy URL
   - Business email: Your business email
4. Click "Create app"
5. Go to the "Auth" tab
6. Add the Supabase callback URL to "Authorized redirect URLs"
7. Request the necessary OAuth 2.0 scopes:
   - `r_emailaddress`
   - `r_liteprofile`
8. Note your Client ID and Client Secret

### 4. Configure Supabase Auth Settings

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to "Authentication" > "Providers"
4. Enable and configure Google:
   - Toggle the switch to enable
   - Enter your Client ID and Client Secret
5. Enable and configure LinkedIn:
   - Toggle the switch to enable
   - Enter your Client ID and Client Secret
6. Go to "Authentication" > "URL Configuration"
7. Set your Site URL to your application domain (e.g., `https://cea.georgenekwaya.com`)
8. Add redirect URLs:
   - Production: `https://cea.georgenekwaya.com/api/auth/callback`
   - Development: `http://localhost:3000/api/auth/callback`
9. Click "Save"

## Testing

To test your OAuth configuration:

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Visit the OAuth test page:
   - Local: http://localhost:3000/auth/oauth-test
   - Production: https://cea.georgenekwaya.com/auth/oauth-test

3. Try signing in with Google and LinkedIn

## Troubleshooting

If you encounter issues:

1. Check the provider configuration in the Supabase dashboard
2. Verify that the callback URL is correctly configured in both Google and LinkedIn
3. Make sure the redirect URLs are correctly set in Supabase
4. Check the browser console for any errors
5. Run the check script to verify the configuration:
   ```bash
   node scripts/check-oauth-providers.js
   ```

## Common Errors

### "Unsupported provider: provider is not enabled"

This error occurs when:
1. The provider is not enabled in the Supabase dashboard
2. The Client ID or Client Secret is incorrect
3. The redirect URL is not properly configured

### "Invalid redirect URI"

This error occurs when:
1. The redirect URL in your OAuth provider doesn't match the Supabase callback URL
2. The Site URL in Supabase is not correctly set

### "Consent error"

This error occurs when:
1. The required scopes are not configured in the OAuth provider
2. The OAuth application is not properly verified or published 