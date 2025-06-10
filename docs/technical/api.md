# API Documentation

## 🚀 Overview

The Climate Economy Assistant API provides comprehensive access to climate job data, user management, and AI-powered matching services. Built on Next.js 15 with Supabase backend, our API is designed for scale, security, and ease of integration.

### Base URL
```
Production: https://climate-economy-assistant.vercel.app/api/v1
Development: http://localhost:3000/api/v1
```

### Authentication
All API requests require authentication via JWT tokens provided by Supabase Auth.

```bash
# Include in request headers
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

## 📊 Core Endpoints

### Authentication

#### POST /auth/login
User authentication with email and password.

```typescript
// Request
interface LoginRequest {
  email: string;
  password: string;
}

// Response
interface LoginResponse {
  user: User;
  session: Session;
  access_token: string;
  refresh_token: string;
}
```

```bash
curl -X POST https://api.cea.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

#### POST /auth/signup
Create new user account with role assignment.

```typescript
interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
  account_type: 'job_seeker' | 'partner';
  organization_name?: string; // Required for partners
}

interface SignupResponse {
  user: User;
  profile: Profile;
  success: boolean;
  message: string;
}
```

### User Management

#### GET /users/profile
Retrieve current user's profile information.

```typescript
interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  account_type: 'job_seeker' | 'partner' | 'admin';
  created_at: string;
  updated_at: string;
  
  // Job seeker specific
  job_seeker?: {
    skills: Skill[];
    experience_level: ExperienceLevel;
    location: Location;
    salary_range: SalaryRange;
    interests: ClimateInterest[];
    resume_url?: string;
  };
  
  // Partner specific
  partner?: {
    organization_name: string;
    organization_type: string;
    website_url?: string;
    description?: string;
    location: Location;
  };
}
```

#### PUT /users/profile
Update user profile information.

```bash
curl -X PUT https://api.cea.com/v1/users/profile \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Jane Climate",
    "location": {
      "city": "Boston",
      "state": "MA",
      "country": "US"
    }
  }'
```

### Jobs API

#### GET /jobs
Search and filter climate jobs with advanced criteria.

```typescript
interface JobSearchParams {
  query?: string;           // Search term
  location?: string;        // City, state, or region
  experience_level?: string; // entry, mid, senior, executive
  employment_type?: string;  // full_time, part_time, contract, internship
  salary_min?: number;      // Minimum salary
  salary_max?: number;      // Maximum salary
  skills?: string[];        // Required skills
  categories?: string[];    // Job categories
  page?: number;           // Page number (default: 1)
  limit?: number;          // Results per page (default: 20, max: 100)
  sort?: 'relevance' | 'date' | 'salary'; // Sort order
}

interface JobSearchResponse {
  jobs: Job[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
  filters: ActiveFilters;
}

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  location: Location;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  salary_range?: SalaryRange;
  skills_required: Skill[];
  climate_focus: ClimateCategory[];
  posted_date: string;
  application_deadline?: string;
  remote_allowed: boolean;
  match_score?: number; // 0-100, only for authenticated users
}
```

```bash
# Search for solar engineer jobs in Massachusetts
curl "https://api.cea.com/v1/jobs?query=solar+engineer&location=Massachusetts&experience_level=mid&limit=10" \
  -H "Authorization: Bearer <token>"
```

#### GET /jobs/{id}
Get detailed information about a specific job.

```typescript
interface JobDetails extends Job {
  company_details: {
    name: string;
    description: string;
    size: string;
    website_url?: string;
    logo_url?: string;
  };
  application_process: {
    method: 'internal' | 'external';
    external_url?: string;
    requirements: string[];
  };
  benefits: string[];
  related_jobs: Job[];
  application_count: number;
}
```

#### POST /jobs
Create a new job posting (partners only).

```typescript
interface CreateJobRequest {
  title: string;
  description: string;
  location: Location;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  salary_range?: SalaryRange;
  skills_required: string[];
  climate_focus: string[];
  remote_allowed: boolean;
  application_deadline?: string;
  benefits?: string[];
}
```

### Applications API

#### GET /applications
Get user's job applications or applications for partner's jobs.

```typescript
interface ApplicationListParams {
  status?: 'pending' | 'reviewed' | 'interviewing' | 'accepted' | 'rejected';
  job_id?: string;
  page?: number;
  limit?: number;
}

interface Application {
  id: string;
  job_id: string;
  user_id: string;
  applicant_name: string;
  status: ApplicationStatus;
  applied_date: string;
  resume_url?: string;
  match_score: number;
  notes?: string; // Partner notes
}
```

#### POST /applications
Submit application for a job.

```typescript
interface ApplicationRequest {
  job_id: string;
  custom_resume?: File; // Optional custom resume
  additional_info?: string;
}

interface ApplicationResponse {
  application: Application;
  success: boolean;
  message: string;
}
```

### Search & Matching API

#### POST /search/jobs
AI-powered job search with natural language queries.

```typescript
interface IntelligentSearchRequest {
  query: string; // Natural language query
  context?: {
    location?: string;
    experience_level?: string;
    salary_expectations?: string;
  };
  limit?: number;
}

interface IntelligentSearchResponse {
  jobs: Job[];
  search_interpretation: {
    understood_intent: string;
    extracted_criteria: SearchCriteria;
    suggestions: string[];
  };
  total_matches: number;
}
```

```bash
curl -X POST https://api.cea.com/v1/search/jobs \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I want to work on offshore wind projects in Massachusetts with competitive salary",
    "limit": 10
  }'
```

#### GET /search/candidates
Find qualified candidates for jobs (partners only).

```typescript
interface CandidateSearchParams {
  job_id: string;
  skills?: string[];
  experience_level?: string;
  location_radius?: number; // Miles from job location
  availability?: string;
  limit?: number;
}

interface CandidateMatch {
  candidate: {
    id: string;
    name: string;
    location: Location;
    experience_level: ExperienceLevel;
    skills: Skill[];
    availability: string;
    profile_summary: string;
  };
  match_score: number;
  matching_skills: Skill[];
  skill_gaps: Skill[];
  recommendations: string[];
}
```

### Education API

#### GET /education/resources
Get training programs and educational resources.

```typescript
interface EducationResource {
  id: string;
  title: string;
  provider: string;
  type: 'course' | 'certification' | 'bootcamp' | 'degree';
  description: string;
  duration: string;
  cost: 'free' | 'paid' | 'sponsored';
  format: 'online' | 'in_person' | 'hybrid';
  skills_taught: Skill[];
  climate_focus: ClimateCategory[];
  prerequisites?: string[];
  certification_offered: boolean;
  job_placement_rate?: number;
  url: string;
}
```

#### GET /education/pathways
Get recommended learning pathways for career goals.

```typescript
interface CareerPathwayRequest {
  target_role: string;
  current_skills: string[];
  experience_level: string;
  time_commitment: 'part_time' | 'full_time';
}

interface LearningPathway {
  pathway_id: string;
  title: string;
  description: string;
  estimated_duration: string;
  total_cost: CostRange;
  steps: LearningStep[];
  career_outcomes: {
    job_titles: string[];
    salary_range: SalaryRange;
    job_growth_rate: number;
  };
}
```

### Analytics API

#### GET /analytics/dashboard
Get user-specific analytics dashboard (authenticated users).

```typescript
interface UserAnalytics {
  profile_completion: number; // Percentage
  applications: {
    total: number;
    this_month: number;
    response_rate: number;
    status_breakdown: Record<ApplicationStatus, number>;
  };
  job_matches: {
    total_matches: number;
    avg_match_score: number;
    top_matching_categories: ClimateCategory[];
  };
  skills: {
    total_skills: number;
    in_demand_skills: Skill[];
    skill_gaps: SkillGap[];
  };
  market_insights: {
    trending_jobs: Job[];
    salary_benchmarks: SalaryBenchmark[];
    growth_sectors: string[];
  };
}
```

#### GET /analytics/jobs/{job_id}
Get analytics for a specific job posting (job poster only).

```typescript
interface JobAnalytics {
  job_id: string;
  performance: {
    views: number;
    applications: number;
    application_rate: number;
    avg_match_score: number;
  };
  applicant_insights: {
    top_skills: Skill[];
    experience_distribution: Record<ExperienceLevel, number>;
    location_distribution: Record<string, number>;
  };
  recommendations: {
    optimization_tips: string[];
    similar_successful_jobs: Job[];
  };
}
```

### AI Chat API

#### POST /chat/sessions
Start new AI chat session for career guidance.

```typescript
interface ChatSessionRequest {
  context?: {
    topic: 'career_advice' | 'job_search' | 'skills_development' | 'interview_prep';
    user_profile?: Partial<UserProfile>;
  };
}

interface ChatSession {
  session_id: string;
  created_at: string;
  context: ChatContext;
  message_count: number;
}
```

#### POST /chat/sessions/{session_id}/messages
Send message to AI career coach.

```typescript
interface ChatMessageRequest {
  message: string;
  message_type?: 'question' | 'follow_up' | 'clarification';
}

interface ChatResponse {
  message_id: string;
  response: string;
  suggestions?: string[];
  resources?: EducationResource[];
  job_recommendations?: Job[];
  timestamp: string;
}
```

## 🔒 Security & Rate Limiting

### Authentication Requirements
- All endpoints require valid JWT token except public job search
- Tokens expire after 24 hours, refresh tokens valid for 30 days
- Role-based access control enforced at database level

### Rate Limiting
```typescript
interface RateLimits {
  anonymous: '100 requests/hour';
  authenticated: '1000 requests/hour';
  partner: '5000 requests/hour';
  admin: 'unlimited';
}
```

### API Keys (for integrations)
```bash
# For external integrations
curl -H "X-API-Key: your-api-key" \
     -H "Authorization: Bearer <token>" \
     https://api.cea.com/v1/jobs
```

## 📝 Data Types

### Common Types

```typescript
interface Location {
  city: string;
  state: string;
  country: string;
  postal_code?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface SalaryRange {
  min: number;
  max: number;
  currency: 'USD';
  period: 'hourly' | 'annual';
}

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_experience?: number;
}

type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';
type EmploymentType = 'full_time' | 'part_time' | 'contract' | 'internship';
type ApplicationStatus = 'pending' | 'reviewed' | 'interviewing' | 'accepted' | 'rejected';

interface ClimateCategory {
  id: string;
  name: string;
  description: string;
  parent_category?: string;
}
```

## 🚨 Error Handling

### Error Response Format
```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    request_id: string;
  };
}
```

### Common Error Codes
```typescript
const ErrorCodes = {
  // Authentication
  UNAUTHORIZED: 'auth/unauthorized',
  TOKEN_EXPIRED: 'auth/token-expired',
  INVALID_CREDENTIALS: 'auth/invalid-credentials',
  
  // Validation
  VALIDATION_ERROR: 'validation/invalid-input',
  REQUIRED_FIELD: 'validation/required-field',
  INVALID_FORMAT: 'validation/invalid-format',
  
  // Resources
  NOT_FOUND: 'resource/not-found',
  ALREADY_EXISTS: 'resource/already-exists',
  ACCESS_DENIED: 'resource/access-denied',
  
  // System
  RATE_LIMITED: 'system/rate-limited',
  SERVER_ERROR: 'system/internal-error',
  SERVICE_UNAVAILABLE: 'system/service-unavailable'
};
```

## 📊 Response Pagination

### Pagination Format
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}
```

### Pagination Parameters
```bash
# Standard pagination
?page=1&limit=20

# Cursor-based pagination (for real-time data)
?cursor=eyJpZCI6MTIzfQ&limit=20
```

## 🔧 SDKs & Integration

### JavaScript/TypeScript SDK
```bash
npm install @cea/sdk
```

```typescript
import { CEAClient } from '@cea/sdk';

const client = new CEAClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.cea.com/v1'
});

// Search jobs
const jobs = await client.jobs.search({
  query: 'solar engineer',
  location: 'Massachusetts'
});

// Get user profile
const profile = await client.users.getProfile();
```

### Webhook Support
```typescript
interface WebhookEvent {
  event_type: 'job.applied' | 'job.matched' | 'user.profile_updated';
  data: any;
  timestamp: string;
  signature: string; // HMAC signature for verification
}
```

The Climate Economy Assistant API is designed to empower developers to build powerful climate career applications and integrations. For additional support or feature requests, please contact our developer relations team. 

interface ResumeData {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  upload_date: string;
  parsed_data: {
    personal_info: PersonalInfo;
    experience: Experience[];
    education: Education[];
    skills: string[];
    achievements: string[];
  };
  processed: boolean;
  analysis?: ResumeAnalysis;
  created_at: string;
  updated_at: string;
} 