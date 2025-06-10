# Architecture Overview

## 🏗️ System Architecture

The Climate Economy Assistant is built using a modern, scalable architecture designed for performance, security, and maintainability.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Apps   │    │   API Gateway    │    │   Database      │
│                 │    │                  │    │                 │
│  Next.js App    │◄──►│  Vercel Edge     │◄──►│   Supabase      │
│  Mobile Apps    │    │  Functions       │    │   PostgreSQL    │
│  Browser        │    │  Middleware      │    │   + RLS         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CDN/Storage   │    │   Auth Service   │    │  External APIs  │
│                 │    │                  │    │                 │
│  Vercel Static  │    │  Supabase Auth   │    │  OpenAI GPT     │
│  Supabase       │    │  OAuth Providers │    │  Email Service  │
│  Storage        │    │  JWT Tokens      │    │  Analytics      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📱 Frontend Architecture

### Next.js 15 App Router Structure
```
app/
├── (auth)/                 # Authentication routes
│   ├── login/
│   ├── sign-up/
│   └── sign-up-success/
├── (protected)/            # Authenticated routes
│   ├── dashboard/
│   ├── profile/
│   └── chat/
├── admin/                  # Admin interface
├── jobs/                   # Job listings
├── education/              # Training resources
├── help/                   # Documentation
├── api/                    # API routes
│   ├── v1/                # Version 1 API
│   ├── auth/              # Auth endpoints
│   └── webhooks/          # External webhooks
├── globals.css            # Global styles
├── layout.tsx             # Root layout
└── page.tsx               # Homepage
```

### Component Architecture
```
components/
├── ui/                    # Base UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── alert.tsx
│   └── tooltip.tsx
├── layout/                # Layout components
│   ├── navigation.tsx
│   ├── footer.tsx
│   └── hero.tsx
├── auth/                  # Authentication
│   ├── login-form.tsx
│   └── sign-up-form.tsx
├── jobs/                  # Job-related components
├── partners/              # Partner components
├── admin/                 # Admin components
├── chat/                  # AI chat interface
├── resume/                # Resume processing
└── tutorial/              # Help & tutorials
```

## 🔧 Backend Architecture

### Supabase Infrastructure
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Built-in auth with social providers
- **Storage**: File uploads for resumes and documents
- **Real-time**: WebSocket connections for live updates
- **Edge Functions**: Serverless compute for complex operations

### Database Schema
```sql
-- Core user management
users (via auth.users)
profiles
job_seekers
partners
admins

-- Job ecosystem
jobs
applications
job_categories
skills
job_skills

-- Education & training
education_resources
certifications
training_programs

-- AI & matching
user_interests
skill_assessments
job_matches
chat_sessions

-- Analytics & tracking
user_analytics
job_analytics
platform_metrics
```

### API Architecture
```
/api/v1/
├── auth/                  # Authentication
├── users/                 # User management
├── jobs/                  # Job operations
├── applications/          # Application tracking
├── education/             # Training resources
├── search/                # Search & matching
├── analytics/             # Metrics & insights
├── chat/                  # AI chat endpoints
└── admin/                 # Administrative functions
```

## 🚀 Deployment Architecture

### Vercel Deployment
```yaml
# vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "regions": ["bos1", "nyc1"],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Environment Configuration
```bash
# Production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
OPENAI_API_KEY=your-openai-key
RESEND_API_KEY=your-email-key

# Analytics
VERCEL_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_GA_ID=your-google-analytics

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_RESUME_ANALYSIS=true
```

## 🔐 Security Architecture

### Authentication Flow
```
1. User initiates login/signup
2. Supabase Auth handles verification
3. JWT tokens issued with user metadata
4. Row Level Security enforces data access
5. Middleware validates routes and permissions
```

### Data Protection
- **Encryption**: All data encrypted at rest and in transit
- **RLS Policies**: Database-level access controls
- **API Security**: Rate limiting and request validation
- **File Security**: Signed URLs for document access
- **Privacy Controls**: GDPR-compliant data handling

### Permission System
```typescript
// User roles and permissions
enum UserRole {
  JOB_SEEKER = 'job_seeker',
  PARTNER = 'partner',
  ADMIN = 'admin'
}

// RLS Policy examples
job_seekers: Users can only access their own data
partners: Can access their jobs and applicants
jobs: Public read, partner write
applications: Applicant and job poster only
```

## 🧠 AI & Machine Learning Architecture

### AI Services Integration
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Input    │    │   AI Processing  │    │   Results       │
│                 │    │                  │    │                 │
│  Resume Upload  │───►│  OpenAI GPT-4    │───►│  Skills Extract │
│  Chat Messages  │    │  Vector Search   │    │  Job Matches    │
│  Profile Data   │    │  Embeddings      │    │  Career Advice  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Matching Algorithm
```typescript
interface MatchingCriteria {
  skills: SkillMatch[];
  location: LocationPreference;
  salary: SalaryRange;
  experience: ExperienceLevel;
  interests: ClimateInterest[];
  availability: AvailabilityType;
}

interface JobMatch {
  job: Job;
  score: number; // 0-100 compatibility
  reasons: MatchReason[];
  skillGaps: SkillGap[];
  recommendations: Recommendation[];
}
```

## 📊 Analytics Architecture

### Data Collection
```typescript
// User analytics
interface UserEvent {
  userId: string;
  event: 'page_view' | 'job_search' | 'application_submit';
  properties: Record<string, any>;
  timestamp: Date;
  sessionId: string;
}

// Platform metrics
interface PlatformMetric {
  metric: 'user_growth' | 'job_matches' | 'application_rate';
  value: number;
  period: 'daily' | 'weekly' | 'monthly';
  segment?: string;
}
```

### Real-time Dashboards
- User engagement metrics
- Job posting and application rates
- Matching algorithm performance
- Revenue and business metrics
- System health and performance

## 🔄 Data Flow Architecture

### User Registration Flow
```
1. User submits registration form
2. Supabase Auth creates user account
3. Profile record created in database
4. Role-specific record (job_seeker/partner)
5. Welcome email sent via Resend
6. User redirected to onboarding
```

### Job Matching Flow
```
1. User completes profile/preferences
2. Background job analyzes user data
3. Vector embeddings generated for skills
4. Similarity search against job database
5. Ranking algorithm applies weights
6. Top matches returned to user
7. User interactions tracked for ML
```

### Resume Processing Flow
```
1. User uploads resume file
2. File stored in Supabase Storage
3. Text extraction (PDF/DOCX parsing)
4. OpenAI GPT analyzes content
5. Skills and experience extracted
6. Profile automatically updated
7. New job matches triggered
```

## 🔧 Development Architecture

### Code Organization
```typescript
// Consistent file structure
src/
├── app/                   # Next.js app directory
├── components/            # React components
├── lib/                   # Utility functions
│   ├── supabase/         # Database client
│   ├── auth/             # Authentication helpers
│   ├── ai/               # AI service integrations
│   └── utils/            # General utilities
├── types/                # TypeScript definitions
├── hooks/                # Custom React hooks
├── styles/               # CSS and styling
└── middleware.ts         # Route protection
```

### State Management
```typescript
// Client-side state with hooks
const useAuth = () => { /* Supabase auth */ };
const useJobs = () => { /* Job data fetching */ };
const useProfile = () => { /* User profile */ };
const useChat = () => { /* AI chat state */ };

// Server state with React Query
const { data: jobs } = useQuery({
  queryKey: ['jobs', filters],
  queryFn: () => fetchJobs(filters)
});
```

## 📈 Performance Architecture

### Optimization Strategies
- **Code Splitting**: Route-based and component-based
- **Image Optimization**: Next.js Image component
- **Caching**: Browser, CDN, and database query caching
- **Database Indexing**: Optimized queries for search
- **Edge Computing**: Vercel Edge Functions for low latency

### Monitoring & Observability
```typescript
// Performance monitoring
const metrics = {
  pageLoadTime: number;
  apiResponseTime: number;
  databaseQueryTime: number;
  userEngagement: AnalyticsEvent[];
  errorRate: number;
  availability: number;
};
```

### Scalability Considerations
- Horizontal scaling with Vercel's edge network
- Database read replicas for global access
- CDN for static asset delivery
- Microservices architecture for future growth
- Queue systems for background processing

## 🔍 Testing Architecture

### Testing Strategy
```typescript
// Unit tests
describe('JobMatching', () => {
  test('calculates match score correctly', () => {
    // Test logic
  });
});

// Integration tests
describe('API Routes', () => {
  test('GET /api/v1/jobs returns jobs', async () => {
    // Test API endpoints
  });
});

// E2E tests
describe('User Journey', () => {
  test('user can complete profile and find jobs', () => {
    // Test full workflows
  });
});
```

This architecture ensures the Climate Economy Assistant is built for scale, security, and maintainability while providing an excellent user experience for all stakeholders in the climate economy ecosystem. 