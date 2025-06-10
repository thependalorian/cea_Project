# Deployment Guide - Climate Economy Assistant

This guide covers deploying the Climate Economy Assistant with full privacy compliance features.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase project with auth enabled
- Vercel account (for deployment)

### Environment Variables
```bash
# Core Application
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
OPENAI_API_KEY=your_openai_key

# Privacy Compliance
NEXT_PUBLIC_PRIVACY_POLICY_URL=/privacy
NEXT_PUBLIC_TERMS_URL=/terms
NEXT_PUBLIC_SUPPORT_EMAIL=privacy@climateeconomy.org
```

## 🔒 Privacy Compliance Setup

### 1. Database Migration
Run the privacy settings migration:
```sql
-- Add privacy columns to user_interests table
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS social_profile_analysis_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS data_sharing_enabled BOOLEAN DEFAULT false;
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS marketing_emails_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS newsletter_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS job_alerts_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS partner_updates_enabled BOOLEAN DEFAULT true;
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system';
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en';
ALTER TABLE user_interests ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';
```

### 2. Privacy API Endpoints
The following privacy endpoints are automatically deployed:
- `/api/v1/user/preferences` - Privacy settings management
- `/api/v1/user/export` - Data export functionality  
- `/api/v1/user/delete` - Account deletion

### 3. Legal Pages Setup
Ensure these pages are accessible:
- `/terms` - Terms of Service
- `/privacy` - Privacy Policy
- `/settings` - Privacy control center

## 📦 Vercel Deployment

### 1. Connect Repository
```bash
vercel --prod
```

### 2. Configure Environment Variables
In Vercel dashboard, add all environment variables from the list above.

### 3. Deploy Privacy Features
The privacy components are automatically included:
- Privacy settings UI at `/settings`
- Legal compliance pages
- GDPR-compliant data export/deletion

## 🛡️ Security Checklist

### Database Security
- [x] Row Level Security (RLS) enabled
- [x] User data isolated by user_id
- [x] Privacy settings in user_interests table
- [x] Secure deletion across all tables

### API Security
- [x] JWT authentication for all endpoints
- [x] Input validation and sanitization
- [x] Rate limiting on privacy endpoints
- [x] CORS properly configured

### Privacy Compliance
- [x] Social profile analysis toggle
- [x] Data export functionality
- [x] Account deletion with confirmation
- [x] Privacy policy and terms pages
- [x] User consent management

## 🔧 Configuration

### Privacy Settings Defaults
Default privacy settings are defined in the migration:
```sql
social_profile_analysis_enabled: true  -- With clear opt-out
data_sharing_enabled: false           -- Conservative default
marketing_emails_enabled: true        -- With unsubscribe option
newsletter_enabled: true              -- User can disable
email_notifications: true             -- Essential notifications
job_alerts_enabled: true              -- Core feature
partner_updates_enabled: true         -- Relevant opportunities
```

### Email Configuration
Set up email templates for:
- Privacy setting confirmations
- Data export notifications
- Account deletion confirmations

## 🚨 Monitoring & Maintenance

### Privacy Compliance Monitoring
- Monitor data export requests
- Track account deletion requests
- Audit privacy setting changes
- Review user consent patterns

### Performance Monitoring
- API response times for privacy endpoints
- Database query performance for exports
- User interface responsiveness

### Security Updates
- Regular dependency updates
- Security audit schedule
- Privacy regulation compliance reviews

## 🔄 Updates & Maintenance

### Regular Tasks
1. **Monthly**: Review privacy settings usage analytics
2. **Quarterly**: Audit data retention policies
3. **Annually**: Complete privacy compliance audit

### User Support
- Privacy questions: privacy@climateeconomy.org
- Technical support: support@climateeconomy.org
- Documentation: Available at `/terms` and `/privacy`

## 📊 Analytics & Reporting

### Privacy Metrics
Track these compliance metrics:
- Privacy settings adoption rates
- Data export request frequency
- Account deletion patterns
- User consent withdrawal rates

### Performance Metrics
- Privacy endpoint response times
- Data export completion rates
- User satisfaction with privacy controls

## 🆘 Troubleshooting

### Common Issues

**Privacy Settings Not Saving**
- Check user authentication
- Verify database connection
- Review RLS policies

**Data Export Failing**
- Check user data permissions
- Verify JSON serialization
- Review file size limits

**Account Deletion Issues**
- Confirm user authentication
- Check foreign key constraints
- Verify cascade deletion setup

### Support Contacts
- **Technical Issues**: support@climateeconomy.org
- **Privacy Questions**: privacy@climateeconomy.org
- **Documentation**: See `/terms` and `/privacy` pages

The Climate Economy Assistant deployment includes comprehensive privacy compliance features that ensure GDPR compliance and user data rights protection out of the box. 