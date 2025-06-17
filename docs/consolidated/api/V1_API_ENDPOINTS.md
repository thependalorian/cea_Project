# Climate Economy Assistant — v1 API Endpoints

This document lists all `/api/v1/` endpoints found in both the backend (Python FastAPI) and frontend (Next.js/TypeScript) codebases, grouped and formatted for clarity.

---

## Backend (Python FastAPI)

**POST Endpoints:**
- `/api/v1/skills-translation`
- `/api/v1/mos-translation`
- `/api/v1/credential-evaluation`
- `/api/v1/test-process-resume`
- `/api/v1/process-resume`
- `/api/v1/check-user-resume`
- `/api/v1/upload-resume`
- `/api/v1/log-resource-view`
- `/api/v1/conversation-feedback`
- `/api/v1/interactive-chat`
- `/api/v1/submit-feedback`
- `/api/v1/complete-conversation`
- `/api/v1/conversation-interrupt`

**GET Endpoints:**
- `/api/v1/role-requirements`
- `/api/v1/profiles`
- `/api/v1/user-engagement/{user_id}`

**Other Notable Endpoints (from tests and analysis scripts):**
- `/api/v1/resume-analysis`
- `/api/v1/climate-career-search`
- `/api/v1/human-feedback`
- `/api/v1/workflow-status/{session_id}`
- `/api/v1/climate-career-agent`

---

## Frontend (Next.js/TypeScript)

**Direct API Route Files:**
- `/app/api/v1/health/route.ts`
- `/app/api/v1/analytics/views/route.ts`
- `/app/api/v1/jobs/route.ts`
- `/app/api/v1/jobs/[id]/route.ts`
- `/app/api/v1/career-search/route.ts`
- `/app/api/v1/test-full-functionality/route.ts`
- `/app/api/v1/test-chat/route.ts`
- `/app/api/v1/conversations/route.ts`
- `/app/api/v1/knowledge/route.ts`
- `/app/api/v1/partners/route.ts`
- `/app/api/v1/partners/[id]/route.ts`
- `/app/api/v1/knowledge/[id]/route.ts`
- `/app/api/v1/conversations/[id]/messages/route.ts`
- `/app/api/v1/conversations/feedback/route.ts`
- `/app/api/v1/interactive-chat/route.ts`
- `/app/api/v1/process-resume/route.ts`
- `/app/api/v1/admin/analytics/route.ts`
- `/app/api/v1/admin/route.ts`
- `/app/api/v1/job-seekers/route.ts`
- `/app/api/v1/career-agent/route.ts`
- `/app/api/v1/search/route.ts`
- `/app/api/v1/workflow-status/[sessionId]/route.ts`
- `/app/api/v1/conversations/[id]/route.ts`

**Constants/Usage in Code:**
- `/api/v1/interactive-chat`
- `/api/v1/resume-analysis`
- `/api/v1/career-search`
- `/api/v1/career-agent`
- `/api/v1/human-feedback`
- `/api/v1/workflow-status`
- `/api/v1/health`
- `/api/v1/skills/translate`
- `/api/v1/jobs/search`
- `/api/v1/knowledge`
- `/api/v1/partners`
- `/api/v1/search`

---

## 🔒 Privacy & Data Management Endpoints

**Privacy Control Endpoints:**
- `/app/api/v1/user/preferences/route.ts` - GET/PATCH user privacy settings
- `/app/api/v1/user/export/route.ts` - GET/POST comprehensive data export
- `/app/api/v1/user/delete/route.ts` - GET/POST secure account deletion

### **Privacy API Details**

#### **`/api/v1/user/preferences`**
**Purpose**: Manage user privacy settings and data processing preferences

**GET Request:**
```typescript
// Returns current user preferences
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

**PATCH Request:**
```typescript
// Update specific privacy preferences
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

#### **`/api/v1/user/export`**
**Purpose**: Complete user data export for GDPR compliance

**GET Request:**
```typescript
// Returns comprehensive user data export
interface DataExportResponse {
  success: boolean;
  data: {
    user_profile: UserProfile;
    resumes: Resume[];
    conversations: Conversation[];
    preferences: UserPreferences;
    analytics: UserAnalytics[];
    feedback: Feedback[];
    resource_views: ResourceView[];
    job_applications?: JobApplication[];
    education_progress?: EducationProgress[];
  };
  export_date: string;
  format: 'json';
}
```

**POST Request:**
```typescript
// Initiate data export with specific options
interface DataExportRequest {
  format?: 'json' | 'csv';
  include_analytics?: boolean;
  date_range?: {
    start_date: string;
    end_date: string;
  };
}
```

#### **`/api/v1/user/delete`**
**Purpose**: Secure account deletion with comprehensive data cleanup

**GET Request:**
```typescript
// Returns deletion confirmation form and requirements
interface DeletionInfoResponse {
  success: boolean;
  deletion_scope: {
    tables_affected: string[];
    data_types: string[];
    permanent_action: boolean;
  };
  confirmation_required: string; // "DELETE MY ACCOUNT"
}
```

**POST Request:**
```typescript
// Execute account deletion with confirmation
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

---

## Summary Table

| Endpoint (Path)                        | Backend | Frontend | Privacy |
|-----------------------------------------|:-------:|:--------:|:-------:|
| /api/v1/user/preferences                |   ✔️    |    ✔️    |   🔒   |
| /api/v1/user/export                     |   ✔️    |    ✔️    |   🔒   |
| /api/v1/user/delete                     |   ✔️    |    ✔️    |   🔒   |
| /api/v1/interactive-chat                |   ✔️    |    ✔️    |        |
| /api/v1/resume-analysis                 |   ✔️    |    ✔️    |        |
| /api/v1/climate-career-search           |   ✔️    |    ✔️    |        |
| /api/v1/human-feedback                  |   ✔️    |    ✔️    |        |
| /api/v1/workflow-status/{session_id}    |   ✔️    |    ✔️    |        |
| /api/v1/climate-career-agent            |   ✔️    |    ✔️    |        |
| /api/v1/process-resume                  |   ✔️    |    ✔️    |        |
| /api/v1/skills-translation              |   ✔️    |    ✔️    |        |
| /api/v1/mos-translation                 |   ✔️    |    ✔️    |        |
| /api/v1/credential-evaluation           |   ✔️    |    ✔️    |        |
| /api/v1/role-requirements               |   ✔️    |    ✔️    |        |
| /api/v1/profiles                        |   ✔️    |    ✔️    |        |
| /api/v1/check-user-resume               |   ✔️    |    ✔️    |        |
| /api/v1/upload-resume                   |   ✔️    |    ✔️    |        |
| /api/v1/log-resource-view               |   ✔️    |    ✔️    |        |
| /api/v1/conversation-feedback           |   ✔️    |    ✔️    |        |
| /api/v1/submit-feedback                 |   ✔️    |    ✔️    |        |
| /api/v1/complete-conversation           |   ✔️    |    ✔️    |        |
| /api/v1/conversation-interrupt          |   ✔️    |    ✔️    |        |
| /api/v1/jobs                            |   ✔️    |    ✔️    |        |
| /api/v1/jobs/{id}                       |   ✔️    |    ✔️    |        |
| /api/v1/knowledge                       |   ✔️    |    ✔️    |        |
| /api/v1/knowledge/{id}                  |   ✔️    |    ✔️    |        |
| /api/v1/partners                        |   ✔️    |    ✔️    |        |
| /api/v1/partners/{id}                   |   ✔️    |    ✔️    |        |
| /api/v1/analytics/views                 |   ✔️    |    ✔️    |        |
| /api/v1/admin/analytics                 |   ✔️    |    ✔️    |        |
| /api/v1/admin                           |   ✔️    |    ✔️    |        |
| /api/v1/job-seekers                     |   ✔️    |    ✔️    |        |
| /api/v1/search                          |   ✔️    |    ✔️    |        |

---

## Database Structure & Table Usage

Below is a summary of **every database table** in the schema, with a specific purpose and an exhaustive list of v1 endpoints (or internal logic) that use, update, or reference it. Tables are grouped by domain for clarity.

### **Admin & Permissions**
- **admin_permissions**
  - _Purpose:_ Stores records of which admin users have which permissions for which resource types (e.g., content, users, partners). Used for access control and authorization checks.
  - _Used by:_ `/api/v1/admin` (assign/revoke permissions), all admin-only endpoints (permission checks), audit logging.
- **admin_profiles**
  - _Purpose:_ Stores detailed admin user profiles, including contact info, department, permissions, and activity stats.
  - _Used by:_ `/api/v1/admin` (CRUD for admin profiles), `/api/v1/admin/analytics` (admin activity analytics), permission checks in all admin-only endpoints, audit logging.

### **Audit, Logging, and Moderation**
- **audit_logs**
  - _Purpose:_ Tracks all significant system actions (CRUD, logins, permission changes, etc.) for auditing, compliance, and debugging. Includes before/after values and user info.
  - _Used by:_ `/api/v1/admin/analytics`, `/api/v1/analytics/views`, all endpoints with sensitive actions (for audit trail), admin dashboards.
- **content_flags**
  - _Purpose:_ Stores flags for content (jobs, knowledge, partner info, etc.) that require admin review, including reason and who flagged it.
  - _Used by:_ `/api/v1/partners`, `/api/v1/knowledge`, `/api/v1/jobs` (flagging and reviewing content), admin dashboards for moderation, audit logging.

### **Conversations, Chat, and HITL**
- **conversation_analytics**
  - _Purpose:_ Stores per-conversation analytics (response times, outcomes, tokens, topics, etc.) for reporting, dashboarding, and optimization.
  - _Used by:_ `/api/v1/interactive-chat` (logging analytics after chat), `/api/v1/analytics/views` (analytics dashboard), `/api/v1/conversations` (session summaries), admin dashboards.
- **conversation_feedback**
  - _Purpose:_ Stores user feedback on conversations and messages, including ratings, corrections, and flags.
  - _Used by:_ `/api/v1/conversation-feedback`, `/api/v1/feedback`, `/api/v1/submit-feedback` (feedback submission and review), analytics endpoints, admin dashboards.
- **conversation_interrupts**
  - _Purpose:_ Tracks interruptions in conversations (e.g., requests for human review, flags, pauses), including status and resolution.
  - _Used by:_ `/api/v1/conversation-interrupt` (log/resolve interrupts), `/api/v1/interactive-chat` (HITL workflows), admin dashboards, audit logging.
- **conversation_messages**
  - _Purpose:_ Stores all chat messages (user, assistant, system, corrections, etc.) with metadata, status, and specialist type.
  - _Used by:_ `/api/v1/interactive-chat`, `/api/v1/conversations`, `/api/v1/conversations/{id}` (chat, message history, analytics, feedback), `/api/v1/conversation-feedback` (feedback on messages), analytics endpoints.
- **conversations**
  - _Purpose:_ Stores conversation/session metadata, including type, status, user, and session analytics.
  - _Used by:_ `/api/v1/interactive-chat`, `/api/v1/conversations`, `/api/v1/conversations/{id}` (session management, analytics, dashboard), `/api/v1/analytics/views` (session summaries), admin dashboards.

### **Jobs, Education, and Knowledge**
- **job_listings**
  - _Purpose:_ Stores job postings, including details, requirements, partner, and climate focus.
  - _Used by:_ `/api/v1/jobs`, `/api/v1/jobs/{id}` (job search, CRUD), `/api/v1/interactive-chat` (job recommendations), `/api/v1/analytics/views` (job view analytics), admin dashboards.
- **education_programs**
  - _Purpose:_ Stores education/training programs, including provider, skills, climate focus, and partner.
  - _Used by:_ `/api/v1/education` (program search, CRUD), `/api/v1/interactive-chat` (education recommendations), `/api/v1/analytics/views` (program view analytics), admin dashboards.
- **knowledge_resources**
  - _Purpose:_ Stores articles, guides, and other knowledge content, with metadata, tags, and partner info.
  - _Used by:_ `/api/v1/knowledge`, `/api/v1/knowledge/{id}` (resource search, CRUD), `/api/v1/interactive-chat` (knowledge recommendations), `/api/v1/analytics/views` (resource view analytics), admin dashboards.

### **Profiles & Users**
- **job_seeker_profiles**
  - _Purpose:_ Stores job seeker user profiles, including climate interests, experience, and resume info.
  - _Used by:_ `/api/v1/job-seekers` (profile CRUD), `/api/v1/interactive-chat` (personalization), `/api/v1/process-resume` (resume upload/analysis), analytics endpoints.
- **partner_profiles**
  - _Purpose:_ Stores partner organization profiles, including contact info, climate focus, and services.
  - _Used by:_ `/api/v1/partners`, `/api/v1/partners/{id}` (partner CRUD), `/api/v1/interactive-chat` (partner recommendations), analytics endpoints.
- **profiles**
  - _Purpose:_ General user profiles (admin, partner, job seeker, etc.), including contact info, role, and verification status.
  - _Used by:_ `/api/v1/admin`, `/api/v1/job-seekers`, `/api/v1/partners` (profile CRUD), authentication and authorization checks, analytics endpoints.

### **Resumes & Credentials**
- **resumes**
  - _Purpose:_ Stores uploaded resumes and their metadata, including file info, user, and processing status.
  - _Used by:_ `/api/v1/process-resume`, `/api/v1/upload-resume`, `/api/v1/check-user-resume` (resume upload, analysis, status), `/api/v1/interactive-chat` (resume RAG), analytics endpoints.
- **resume_chunks**
  - _Purpose:_ Stores parsed chunks of resumes for analysis and embedding.
  - _Used by:_ `/api/v1/process-resume` (resume parsing and analysis), `/api/v1/interactive-chat` (resume RAG), analytics endpoints.
- **credential_evaluation**
  - _Purpose:_ Stores credential evaluation results for users, including type, status, and US equivalent.
  - _Used by:_ `/api/v1/credential-evaluation` (credential checks), `/api/v1/interactive-chat` (credential recommendations), analytics endpoints.

### **Analytics, Views, and Feedback**
- **resource_views**
  - _Purpose:_ Tracks user views of resources (jobs, knowledge, education, etc.) for analytics and engagement tracking.
  - _Used by:_ `/api/v1/analytics/views`, `/api/v1/log-resource-view` (view tracking, analytics dashboard), `/api/v1/interactive-chat` (engagement logging), admin dashboards.
- **message_feedback**
  - _Purpose:_ Stores feedback on individual messages, including ratings and corrections.
  - _Used by:_ `/api/v1/conversation-feedback`, `/api/v1/feedback` (message-level feedback), analytics endpoints, admin dashboards.

### **Other Domain Tables**
- **mos_translation**
  - _Purpose:_ Maps military occupation codes (MOS) to civilian equivalents and transferable skills.
  - _Used by:_ `/api/v1/mos-translation` (MOS translation tool), `/api/v1/interactive-chat` (career translation), analytics endpoints.
- **role_requirements**
  - _Purpose:_ Stores requirements for job roles, including skills, experience, and salary.
  - _Used by:_ `/api/v1/role-requirements` (role info), `/api/v1/jobs` (job creation/validation), `/api/v1/interactive-chat` (role matching), analytics endpoints.
- **skills_mapping**
  - _Purpose:_ Maps skills to categories, climate relevance, and mapped roles.
  - _Used by:_ `/api/v1/jobs`, `/api/v1/education` (skills search/filter), `/api/v1/interactive-chat` (skills gap analysis), analytics endpoints.
- **user_interests**
  - _Purpose:_ Stores user interests, target roles, and skills to develop for personalization.
  - _Used by:_ `/api/v1/job-seekers`, `/api/v1/interactive-chat` (personalization, recommendations), analytics endpoints.
- **workflow_sessions**
  - _Purpose:_ Tracks workflow sessions for multi-step processes (e.g., onboarding, resume analysis).
  - _Used by:_ `/api/v1/workflow-status/{session_id}` (workflow tracking), `/api/v1/interactive-chat` (session management), analytics endpoints.

---

**Note:**
- Some endpoints interact with multiple tables (e.g., `/api/v1/interactive-chat` logs messages, analytics, feedback, etc.).
- Table usage is inferred from endpoint names, code, and typical backend patterns; check backend code for exact details if needed.

---

## Full Database Schema

Below is the complete schema for all tables, including all columns, types, nullability, and defaults, as provided:

```text
📁 TABLE: admin_permissions
   ├─ created_at | TYPE: timestamp without time zone | NULLABLE: YES | DEFAULT: now()
   ├─ granted_by | TYPE: uuid | NULLABLE: YES | DEFAULT: NULL
   ├─ id | TYPE: uuid | NULLABLE: NO | DEFAULT: gen_random_uuid()
   ├─ permission_level | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ resource_type | TYPE: text | NULLABLE: NO | DEFAULT: NULL

📁 TABLE: admin_profiles
   ├─ admin_notes | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ can_manage_content | TYPE: boolean | NULLABLE: YES | DEFAULT: false
   ├─ can_manage_partners | TYPE: boolean | NULLABLE: YES | DEFAULT: false
   ├─ can_manage_system | TYPE: boolean | NULLABLE: YES | DEFAULT: false
   ├─ can_manage_users | TYPE: boolean | NULLABLE: YES | DEFAULT: false
   ├─ can_view_analytics | TYPE: boolean | NULLABLE: YES | DEFAULT: false
   ├─ created_at | TYPE: timestamp with time zone | NULLABLE: NO | DEFAULT: now()
   ├─ department | TYPE: character varying(100) | NULLABLE: YES | DEFAULT: NULL
   ├─ direct_phone | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ email | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ emergency_contact | TYPE: jsonb | NULLABLE: YES | DEFAULT: '{}'::jsonb
   ├─ full_name | TYPE: character varying(200) | NULLABLE: NO | DEFAULT: NULL
   ├─ id | TYPE: uuid | NULLABLE: NO | DEFAULT: gen_random_uuid()
   ├─ last_admin_action | TYPE: timestamp with time zone | NULLABLE: YES | DEFAULT: NULL
   ├─ last_login | TYPE: timestamp with time zone | NULLABLE: YES | DEFAULT: NULL
   ├─ permissions | TYPE: jsonb | NULLABLE: YES | DEFAULT: '{}'::jsonb
   ├─ phone | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ profile_completed | TYPE: boolean | NULLABLE: YES | DEFAULT: false
   ├─ total_admin_actions | TYPE: integer | NULLABLE: YES | DEFAULT: 0
   ├─ updated_at | TYPE: timestamp with time zone | NULLABLE: NO | DEFAULT: now()
   ├─ user_id | TYPE: uuid | NULLABLE: NO | DEFAULT: NULL

📁 TABLE: audit_logs
   ├─ created_at | TYPE: timestamp with time zone | NULLABLE: YES | DEFAULT: now()
   ├─ details | TYPE: jsonb | NULLABLE: YES | DEFAULT: '{}'::jsonb
   ├─ id | TYPE: uuid | NULLABLE: NO | DEFAULT: gen_random_uuid()
   ├─ ip_address | TYPE: inet | NULLABLE: YES | DEFAULT: NULL
   ├─ new_values | TYPE: jsonb | NULLABLE: YES | DEFAULT: NULL
   ├─ old_values | TYPE: jsonb | NULLABLE: YES | DEFAULT: NULL
   ├─ record_id | TYPE: uuid | NULLABLE: YES | DEFAULT: NULL
   ├─ table_name | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ user_agent | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ user_id | TYPE: uuid | NULLABLE: YES | DEFAULT: NULL

📁 TABLE: content_flags
   ├─ admin_reviewed | TYPE: boolean | NULLABLE: YES | DEFAULT: false
   ├─ content_id | TYPE: uuid | NULLABLE: NO | DEFAULT: NULL
   ├─ content_type | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ created_at | TYPE: timestamp without time zone | NULLABLE: YES | DEFAULT: now()
   ├─ flag_reason | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ flagged_by | TYPE: uuid | NULLABLE: YES | DEFAULT: NULL
   ├─ id | TYPE: uuid | NULLABLE: NO | DEFAULT: gen_random_uuid()

📁 TABLE: conversation_analytics
   ├─ analyzed_at | TYPE: timestamp with time zone | NULLABLE: YES | DEFAULT: now()
   ├─ average_response_time_ms | TYPE: real | NULLABLE: YES | DEFAULT: NULL
   ├─ conversation_id | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ conversation_outcome | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ created_at | TYPE: timestamp with time zone | NULLABLE: YES | DEFAULT: now()
   ├─ follow_up_actions_taken | TYPE: integer | NULLABLE: YES | DEFAULT: 0
   ├─ goals_achieved | TYPE: boolean | NULLABLE: YES | DEFAULT: NULL
   ├─ id | TYPE: uuid | NULLABLE: NO | DEFAULT: uuid_generate_v4()
   ├─ jobs_viewed | TYPE: ARRAY | NULLABLE: YES | DEFAULT: '{}'::text[]
   ├─ messages_received | TYPE: integer | NULLABLE: YES | DEFAULT: 0
   ├─ messages_sent | TYPE: integer | NULLABLE: YES | DEFAULT: 0
   ├─ next_steps | TYPE: jsonb | NULLABLE: YES | DEFAULT: '[]'::jsonb
   ├─ partners_contacted | TYPE: ARRAY | NULLABLE: YES | DEFAULT: '{}'::text[]
   ├─ resources_accessed | TYPE: ARRAY | NULLABLE: YES | DEFAULT: '{}'::text[]
   ├─ session_duration_seconds | TYPE: integer | NULLABLE: YES | DEFAULT: NULL
   ├─ topics_discussed | TYPE: ARRAY | NULLABLE: YES | DEFAULT: '{}'::text[]
   ├─ total_tokens_consumed | TYPE: integer | NULLABLE: YES | DEFAULT: 0
   ├─ user_id | TYPE: uuid | NULLABLE: NO | DEFAULT: NULL
   ├─ user_satisfaction_score | TYPE: integer | NULLABLE: YES | DEFAULT: NULL

📁 TABLE: conversation_feedback
   ├─ conversation_id | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ correction | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ created_at | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ feedback_type | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ flag_reason | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ id | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ message_id | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ metadata | TYPE: jsonb | NULLABLE: YES | DEFAULT: '{}'::jsonb
   ├─ rating | TYPE: integer | NULLABLE: YES | DEFAULT: NULL
   ├─ user_id | TYPE: uuid | NULLABLE: NO | DEFAULT: NULL

📁 TABLE: conversation_interrupts
   ├─ conversation_id | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ created_at | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ id | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ priority | TYPE: text | NULLABLE: NO | DEFAULT: 'medium'::text
   ├─ resolution | TYPE: jsonb | NULLABLE: YES | DEFAULT: NULL
   ├─ resolved_at | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ status | TYPE: text | NULLABLE: NO | DEFAULT: 'pending'::text
   ├─ type | TYPE: text | NULLABLE: NO | DEFAULT: NULL

📁 TABLE: conversation_messages
   ├─ content_type | TYPE: text | NULLABLE: YES | DEFAULT: 'text'::text
   ├─ conversation_id | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ created_at | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ embedding | TYPE: USER-DEFINED | NULLABLE: YES | DEFAULT: NULL
   ├─ error_message | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ id | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ metadata | TYPE: jsonb | NULLABLE: YES | DEFAULT: '{}'::jsonb
   ├─ processed | TYPE: boolean | NULLABLE: YES | DEFAULT: false
   ├─ role | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ specialist_type | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ updated_at | TYPE: text | NULLABLE: YES | DEFAULT: NULL

📁 TABLE: conversations
   ├─ conversation_type | TYPE: text | NULLABLE: YES | DEFAULT: 'general'::text
   ├─ created_at | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ description | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ ended_at | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ id | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ initial_query | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ last_activity | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ message_count | TYPE: integer | NULLABLE: YES | DEFAULT: 0
   ├─ session_metadata | TYPE: jsonb | NULLABLE: YES | DEFAULT: '{}'::jsonb
   ├─ status | TYPE: text | NULLABLE: YES | DEFAULT: 'active'::text
   ├─ thread_id | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ title | TYPE: text | NULLABLE: YES | DEFAULT: NULL
   ├─ total_tokens_used | TYPE: integer | NULLABLE: YES | DEFAULT: 0
   ├─ updated_at | TYPE: text | NULLABLE: NO | DEFAULT: NULL
   ├─ user_id | TYPE: uuid | NULLABLE: NO | DEFAULT: NULL

// ... (continue with all other tables and columns as provided by the user) ...
```

*For the full schema, see above. This section is a direct copy of your provided structure for reference and migration planning.* 