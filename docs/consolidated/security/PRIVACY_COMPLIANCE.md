# Privacy Compliance & Data Rights Framework

This document outlines the comprehensive privacy compliance features implemented in the Climate Economy Assistant platform, ensuring GDPR compliance and user data rights protection.

## 🔒 Overview

The Climate Economy Assistant prioritizes user privacy and data rights through a comprehensive privacy-by-design approach. Our system provides granular user control over data processing, transparent data handling practices, and full compliance with GDPR and other privacy regulations.

## 🎯 Privacy Features Summary

### ✅ Implemented Privacy Controls
- **Social Profile Analysis Toggle**: Users can enable/disable enhanced career analysis using LinkedIn, GitHub, and website data
- **Granular Email Preferences**: Individual controls for job alerts, newsletter, partner updates
- **Complete Data Export**: One-click download of all user data in JSON format
- **Secure Account Deletion**: Comprehensive data cleanup with confirmation requirements
- **Privacy Settings Dashboard**: Centralized control center at `/settings`
- **Legal Compliance Pages**: Terms of Service (`/terms`) and Privacy Policy (`/privacy`)

### 🛡️ User Data Rights (GDPR Compliant)
- **Right to Access**: Complete transparency about data collection and usage
- **Right to Export**: Download all personal data in portable JSON format
- **Right to Rectification**: Update or correct personal information
- **Right to Erasure**: Permanent account and data deletion
- **Right to Opt-Out**: Granular control over data processing activities

## 📋 Database Schema Updates

### Enhanced `user_interests` Table
The privacy settings are stored in the existing `user_interests` table with new columns:

```sql
-- Privacy and preference columns added to user_interests table
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

### Data Cleanup for Account Deletion
Account deletion removes data from all related tables:

- `user_interests` - User preferences and privacy settings
- `resumes` - Resume files and processed data
- `resume_chunks` - Resume text chunks and embeddings
- `conversations` - Chat conversations and messages
- `conversation_messages` - Individual chat messages
- `conversation_feedback` - User feedback on conversations
- `resource_views` - Analytics on resource usage
- `conversation_analytics` - Conversation performance data
- `message_feedback` - Feedback on individual messages

## 🔌 Privacy API Endpoints

### `/api/v1/user/preferences` - Privacy Settings Management

**GET Request** - Retrieve current privacy settings:
```typescript
interface UserPreferencesResponse {
  success: boolean;
  preferences: {
    social_profile_analysis_enabled: boolean;
    data_sharing_enabled: boolean;
    marketing_emails_enabled: boolean;
    newsletter_enabled: boolean;
    email_notifications: boolean;
    job_alerts_enabled: boolean;
    partner_updates_enabled: boolean;
    theme_preference: string;
    language_preference: string;
    timezone: string;
  };
}
```

**PATCH Request** - Update privacy settings:
```typescript
interface UpdatePreferencesRequest {
  social_profile_analysis_enabled?: boolean;
  data_sharing_enabled?: boolean;
  marketing_emails_enabled?: boolean;
  newsletter_enabled?: boolean;
  email_notifications?: boolean;
  job_alerts_enabled?: boolean;
  partner_updates_enabled?: boolean;
  theme_preference?: string;
  language_preference?: string;
  timezone?: string;
}
```

### `/api/v1/user/export` - Data Export

**GET Request** - Complete data export:
```typescript
interface DataExportResponse {
  success: boolean;
  data: {
    user_profile: {
      id: string;
      email: string;
      created_at: string;
      updated_at: string;
    };
    preferences: UserPreferences;
    resumes: Resume[];
    conversations: Conversation[];
    analytics: UserAnalytics[];
    feedback: Feedback[];
    resource_views: ResourceView[];
  };
  export_date: string;
  format: 'json';
}
```

### `/api/v1/user/delete` - Account Deletion

**POST Request** - Secure account deletion:
```typescript
interface AccountDeletionRequest {
  confirmation_text: string; // Must be "DELETE MY ACCOUNT"
  reason?: string;
  feedback?: string;
}

interface AccountDeletionResponse {
  success: boolean;
  deletion_completed: boolean;
  tables_cleaned: string[];
  deletion_date: string;
}
```

## 🎛️ Privacy Control Interface

### Privacy Settings Component (`/components/settings/PrivacySettings.tsx`)

The privacy settings interface provides:

#### Social Profile Analysis Control
- **Toggle Switch**: Enable/disable enhanced career analysis
- **Real-time Updates**: Changes apply immediately to future analysis
- **Clear Explanations**: Transparent description of data usage
- **Opt-out Messaging**: Clear feedback when analysis is disabled

#### Email Preference Controls
- **Job Alerts**: Control notifications about relevant opportunities
- **Newsletter**: Weekly climate economy insights and updates
- **Partner Updates**: Communications from climate economy partners
- **Marketing**: Promotional content and feature announcements

#### Data Management Actions
- **Export Data**: One-click download with automatic filename generation
- **Delete Account**: Secure deletion with "DELETE MY ACCOUNT" confirmation
- **Toast Notifications**: Real-time feedback for all preference changes

## 📄 Legal Compliance Pages

### Terms of Service (`/app/terms/page.tsx`)
- **Social Profile Usage**: Clear explanation of enhanced analysis features
- **User Rights**: Comprehensive outline of data rights and opt-out mechanisms
- **Data Processing**: Transparent description of AI analysis and career matching
- **Contact Information**: Direct support channels for privacy questions

### Privacy Policy (`/app/privacy/page.tsx`)
- **Data Collection**: Detailed breakdown of information types collected
- **Usage Purpose**: Clear explanation of how data improves career recommendations
- **Third-Party Sharing**: Transparent disclosure of partner data sharing (with consent)
- **Security Measures**: Industry-standard encryption and data protection practices
- **User Controls**: Step-by-step instructions for managing privacy settings

## 🔒 Technical Security Measures

### Data Protection
- **Encryption in Transit**: TLS encryption for all API communications
- **Encryption at Rest**: AES-256 encryption for stored data
- **Authentication**: Secure user authentication via Supabase Auth
- **Access Control**: Row-level security policies for data access
- **Audit Logging**: Comprehensive logging of privacy setting changes

### Privacy by Design
- **Data Minimization**: Only collect data necessary for service functionality
- **Purpose Limitation**: Data used only for stated career assistance purposes
- **Storage Limitation**: Regular review and deletion of unnecessary data
- **Transparency**: Clear communication about all data practices

### User Empowerment
- **Real-Time Controls**: Instant privacy setting updates
- **Data Visibility**: Complete transparency about stored information
- **Export Standards**: JSON format for easy data portability
- **Deletion Guarantees**: Secure and complete data removal upon request

## 🔄 Consent Management

### Signup Process
- **Initial Consent**: Users agree to terms and privacy policy during account creation
- **Clear Disclosure**: Transparent explanation of data processing during onboarding
- **Opt-in Default**: Social profile analysis enabled by default with clear opt-out instructions

### Ongoing Consent
- **Granular Controls**: Individual toggles for different data processing types
- **Revocable Consent**: Users can withdraw consent at any time
- **Audit Trail**: Privacy setting changes logged for compliance documentation

## 📊 Compliance Monitoring

### Regular Audits
- **Privacy Practice Reviews**: Systematic evaluation of data handling procedures
- **Security Assessments**: Regular security audits and vulnerability testing
- **Compliance Updates**: Proactive adaptation to new privacy regulations

### User Feedback Integration
- **Privacy Concerns**: Continuous improvement based on user privacy feedback
- **Feature Requests**: Implementation of additional privacy controls as requested
- **Transparency Reports**: Regular communication about privacy practices and updates

## 🚀 Implementation Status

### ✅ Completed Features
- [x] Privacy settings UI component with real-time updates
- [x] API endpoints for preferences, export, and deletion
- [x] Database schema updates for privacy columns
- [x] Legal compliance pages (Terms & Privacy)
- [x] Secure account deletion with comprehensive cleanup
- [x] Data export functionality with JSON download
- [x] Social profile analysis toggle with immediate effect

### 🔄 Ongoing Monitoring
- [ ] Regular privacy audit schedule
- [ ] User feedback integration system
- [ ] Compliance documentation updates
- [ ] Additional privacy controls based on user requests

## 📞 Support & Contact

For privacy-related questions or concerns:
- **Email**: privacy@climateeconomy.org
- **Settings Page**: Direct links to privacy controls at `/settings`
- **Legal Pages**: Comprehensive information at `/terms` and `/privacy`

The Climate Economy Assistant is committed to maintaining the highest standards of user privacy and data protection while providing valuable career assistance services to underrepresented communities in the climate economy. 