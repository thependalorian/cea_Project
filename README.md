# Climate Economy Assistant (CEA)

A comprehensive platform connecting job seekers with climate economy opportunities, featuring AI-powered matching, partner organizations, and administrative oversight.

## 🌐 **Live Application**
- **Production URL**: https://cea.georgenekwaya.com
- **Development URL**: http://localhost:3000

## 🏗️ **Architecture Overview**

### **Technology Stack**
- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS, DaisyUI
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Deployment**: Vercel
- **AI Integration**: OpenAI GPT-4, FastAPI backend (localhost:8000)

### **Database Schema**
- **28 Tables** with comprehensive relationships
- **38,100+ Clean Energy Jobs** in Massachusetts
- **7 AI Agents** for specialized assistance

## 🔐 **Authentication System**

### **User Roles & Access**
The platform supports three distinct user types with role-based access control:

#### **1. Job Seekers** (`/job-seekers`)
- **Profile Management**: Complete career profiles with climate focus areas
- **Job Search**: AI-powered job matching and recommendations
- **Application Tracking**: Monitor application status and progress
- **Skill Development**: Access to training programs and resources
- **Career Analytics**: Track profile completion and activity

#### **2. Partners** (`/partners`)
- **Organization Profiles**: Comprehensive company information and verification
- **Job Posting**: Create and manage job listings
- **Resource Management**: Share training programs and educational content
- **Candidate Matching**: AI-powered candidate recommendations
- **Analytics Dashboard**: Track engagement and hiring metrics

#### **3. Administrators** (`/admin`)
- **User Management**: Oversee all platform users and permissions
- **Content Moderation**: Review and approve partner content
- **System Analytics**: Platform-wide metrics and insights
- **Partner Verification**: Approve and manage partner organizations
- **Audit Logs**: Track all administrative actions

### **Authentication Features**

#### **Secure Login System**
- **Email/Password Authentication** with Supabase Auth
- **Password Reset** with email verification
- **Session Management** with automatic token refresh
- **Role-based Redirects** to appropriate dashboards

#### **Demo Accounts**
For testing and demonstration purposes:

```bash
# Job Seeker Demo Account
Email: jobseeker@demo.com
Password: Demo123!

# Partner Demo Account  
Email: partner@demo.com
Password: Demo123!

# Admin Demo Account
Email: admin@demo.com
Password: Demo123!
```

#### **Security Features**
- **Password Requirements**: 8+ characters, uppercase, lowercase, number, special character
- **Email Verification** for new accounts
- **Rate Limiting** on authentication endpoints
- **Secure Session Storage** with httpOnly cookies
- **CSRF Protection** with Supabase Auth

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ and npm
- Supabase account and project
- Environment variables configured

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd cea_project
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=https://cea.georgenekwaya.com
```

4. **Setup Demo Users** (Optional)
```bash
node scripts/setup-demo-users.js
```

5. **Run Development Server**
```bash
npm run dev
```

### **Deployment**

#### **Vercel Deployment**
1. **Connect Repository** to Vercel
2. **Configure Environment Variables** in Vercel dashboard
3. **Set Custom Domain**: cea.georgenekwaya.com
4. **Deploy** - automatic deployments on main branch push

#### **Supabase Configuration**
Update Supabase Auth settings:
- **Site URL**: https://cea.georgenekwaya.com
- **Redirect URLs**: 
  - https://cea.georgenekwaya.com/auth/callback
  - https://cea.georgenekwaya.com/auth/update-password
  - http://localhost:3000/auth/callback (for development)

## 📊 **Database Schema**

### **Core Tables**
- **`job_seeker_profiles`**: User career information and preferences
- **`partner_profiles`**: Organization details and verification status
- **`admin_profiles`**: Administrator permissions and activity
- **`job_listings`**: Available positions with climate focus
- **`user_interests`**: Preferences and notification settings

### **Supporting Tables**
- **`conversations`**: AI chat sessions and analytics
- **`audit_logs`**: System activity tracking
- **`knowledge_resources`**: Educational content and materials
- **`skills_mapping`**: Climate-relevant skill categorization

## 🤖 **AI Integration**

### **FastAPI Backend** (localhost:8000)
- **7 Specialized AI Agents** for different use cases
- **Job Matching Algorithm** with climate relevance scoring
- **Resume Analysis** and skill extraction
- **Conversation Analytics** and insights

### **AI Features**
- **Smart Job Recommendations** based on profile and preferences
- **Skill Gap Analysis** with development suggestions
- **Career Path Guidance** for climate economy transitions
- **Automated Content Moderation** for partner submissions

## 🔧 **Development Guidelines**

### **Code Standards**
- **TypeScript** for all development
- **DaisyUI Components** for consistent UI
- **Server-Side Rendering** with Next.js App Router
- **Error Handling** and logging throughout
- **Responsive Design** for all screen sizes

### **Authentication Flow**
1. **User Login** → API validation → Session creation
2. **Role Detection** → Profile lookup → Dashboard redirect
3. **Permission Check** → Route protection → Content access
4. **Session Refresh** → Token validation → Continued access

### **Testing**
```bash
# Run type checking
npm run type-check

# Build for production
npm run build

# Test authentication
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jobseeker@demo.com", "password": "Demo123!"}'
```

## 📈 **Platform Statistics**
- **38,100+ Jobs** in Massachusetts clean energy sector
- **28 Database Tables** with comprehensive relationships
- **3 User Roles** with distinct interfaces and permissions
- **7 AI Agents** providing specialized assistance
- **100% TypeScript** codebase for reliability

## 🌱 **Climate Focus Areas**
- Renewable Energy
- Carbon Management
- Sustainability Consulting
- Clean Technology
- Environmental Policy
- Green Finance
- Climate Adaptation

## 📞 **Support & Contact**
- **Platform**: https://cea.georgenekwaya.com
- **Documentation**: Available in `/docs` directory
- **Demo Access**: Use provided demo accounts for testing

---

**Built with ❤️ for the Climate Economy**  
*Empowering careers that matter for our planet's future*