# Climate Economy Assistant - Enhanced Seed Script Documentation

## Overview

The enhanced `create_seed_partners_updated.py` script creates a comprehensive climate economy ecosystem with advanced AI-powered features, comprehensive partner data, admin capabilities, and job seeker profiles. This script sets up the complete foundation for the Climate Economy Assistant platform.

## 🚀 Enhanced Features

### **AI-Optimized Content Processing**
- **AIOptimizedChunker**: Advanced semantic content processing with structured/narrative detection
- **Embedding Generation**: OpenAI embeddings with intelligent fallback to dummy embeddings
- **PDF Resource Processing**: Complete PDF ingestion using pypdf with semantic chunking
- **Skills Mapping & Translation**: Enhanced content extraction and topic analysis

### **Comprehensive Data Creation**
- **Admin Users**: Super admin accounts with 19+ platform capabilities
- **Partner Profiles**: 10+ partners with digital presence and resource mapping
- **Job Seeker Profiles**: Complete profiles with resume processing and skills analysis
- **Knowledge Resources**: AI-optimized content with proper embeddings for search
- **Role Requirements**: Career pathway definitions with skill mappings
- **Education Programs**: Training and certification programs
- **Job Listings**: Active opportunities with proper categorization

### **Advanced Admin Capabilities**
- **Platform Configuration**: AI model configuration, embedding management
- **User Management**: Create, delete, modify users with role-based permissions
- **Content Management**: Knowledge base editing, content moderation, translations
- **Analytics Access**: User behavior, platform performance, climate impact metrics
- **System Administration**: Database access, API configuration, security settings

## 📋 Prerequisites

### Required Dependencies
```bash
pip install supabase pypdf requests openai python-dotenv
```

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key  # Optional, will use dummy embeddings if not provided
```

### Database Schema
Ensure your Supabase database has the following tables:
- `profiles` (base user profiles)
- `admin_profiles` (admin-specific data)
- `partner_profiles` (partner organization data)
- `job_seeker_profiles` (job seeker data)
- `user_interests` (job seeker preferences)
- `resumes` (resume data with embeddings)
- `knowledge_resources` (AI-searchable content)
- `role_requirements` (career pathway definitions)
- `job_listings` (active job opportunities)
- `education_programs` (training programs)

## 🎯 Usage

### Basic Execution
```bash
python scripts/create_seed_partners_updated.py
```

### With PDF Resources
Place climate domain PDFs in the configured directory:
```
/Users/georgenekwaya/Downloads/projects_genai/climate_economy_ecosystem/temp_repo_clean/pdfs/
├── NECEC_2023_Annual_Report.pdf
└── Powering_the_Future_A_Massachusetts_Clean_Energy_Workforce_Needs_Assessment_Final.pdf
```

## 📊 Created Data Structure

### **Admin Users (2)**

#### George Nekwaya - Super Admin
- **Email**: `gnekwaya@joinact.org`
- **Role**: Super Admin with 19 platform capabilities
- **Permissions**: Complete platform control including AI configuration
- **Capabilities**:
  - User management (create, delete, modify, impersonate)
  - Content management (knowledge base, embeddings, translations)
  - Analytics access (user behavior, climate impact metrics)
  - System administration (database, API, security)

#### Alliance for Climate Transition (ACT)
- **Email**: `admin@joinact.org`
- **Role**: Platform administrator
- **Permissions**: Standard admin capabilities

### **Job Seekers (1 with dual role)**

#### George Nekwaya - Job Seeker Profile
- **Email**: `george.n.p.nekwaya@gmail.com`
- **Experience Level**: Senior (24+ years)
- **Skills**: 16 technical and business skills
- **Resume**: AI-processed with embeddings
- **Interests**: Climate tech, AI, fintech, workforce development
- **Special**: Dual role as Admin + Job Seeker + Partner

### **Partners (10)**

#### Founding Partners
1. **Buffr Inc.** (`buffr_inc@buffr.ai`)
   - Type: AI/Climate Tech Startup
   - Focus: AI solutions, climate tech, fintech
   - Special: George's company

2. **Massachusetts Clean Energy Center** (`masscec@masscec.com`)
   - Type: Government Agency
   - Focus: Clean energy policy, workforce development
   - Programs: Internship program with 600+ companies

3. **MassHire Career Centers** (`masshire_career_centers@mass.gov`)
   - Type: Government Network
   - Focus: Workforce development, job placement
   - Coverage: 25+ statewide locations

#### Educational Partners
4. **Franklin Cummings Tech** (`franklin_cummings@franklincummings.edu`)
   - Type: Technical College
   - Focus: Renewable energy education
   - Programs: 18-month associate degree program

#### Industry Partners
5. **TPS Energy** (`tps_energy@tps-energy.com`)
   - Type: Solar Installation Company
   - Focus: Solar installation, NABCEP certification
   - Programs: 8-week technician training

#### Community Partners
6. **Urban League of Eastern Massachusetts** (`urban_league_eastern_ma@ulem.org`)
   - Focus: Diversity and inclusion in clean energy

7. **Headlamp** (`headlamp@myheadlamp.com`)
   - Focus: Veteran transition to clean energy careers
   - Programs: DOD SkillBridge program (through May 2027)

8. **African Bridge Network** (`african_bridge_network@africanbn.org`)
   - Focus: Immigrant professionals in clean energy
   - Programs: 6-month fellowship program

#### Workforce Development Partners
9. **MassHireDirect** (`masshiredirect@masshiredirect.com`)
   - Type: Workforce Development Portal
   - Focus: Career coaching, skills development

10. **Commonwealth Corporation** (`commonwealth_corp@commcorp.org`)
    - Type: Workforce Development Intermediary
    - Focus: Employer engagement, career pathways

## 🔐 Access Credentials

### Admin Access
```
Super Admin: gnekwaya@joinact.org
Password: ClimateAdmin2025!George_Nekwaya_Act
Capabilities: 19 platform permissions

Standard Admin: admin@joinact.org  
Password: ClimateAdmin2025!Alliance_Climate_Transition
Capabilities: 8 basic permissions
```

### Job Seeker Access
```
Email: george.n.p.nekwaya@gmail.com
Password: ClimateJobs2025!JobSeeker
Profile: Senior level, 16 skills, complete resume
```

### Partner Access
All partner accounts use the format:
```
Email: {partner_id}@{clean_domain}
Password: ClimateJobs2025!{Partner_Name}
```

## 📚 Knowledge Resources Created

### **Partner Resources (100+ items)**
- Digital presence mapping (websites, LinkedIn, careers pages)
- Program descriptions with AI-optimized content
- Resource libraries (webinars, events, training materials)
- Contact information and application processes

### **Role Requirements (13 items)**
- Career pathway definitions for clean energy roles
- Required and preferred skills mapping
- Experience level requirements
- Salary range guidance

### **Education Programs (7 items)**
- Training programs with duration and format
- Certification offerings and prerequisites
- Application processes and contact information

### **Job Listings (3 items)**
- Active opportunities with detailed descriptions
- Employment types and experience requirements
- Benefits and application processes

### **Domain Knowledge (2 PDF resources)**
- NECEC 2023 Annual Report (policy insights)
- Massachusetts Clean Energy Workforce Assessment (skills gap analysis)

## 🤖 AI Features

### **Embedding Generation**
- OpenAI text-embedding-3-small model for semantic search
- Intelligent fallback to deterministic dummy embeddings
- Optimized chunking for better context preservation

### **Content Processing**
- Structured content detection (sections, chapters)
- Narrative content semantic chunking
- PDF text extraction with artifact cleanup
- Topic extraction and skills mapping

### **Search Optimization**
- Climate sector categorization
- Skills taxonomy alignment
- Target audience classification
- Difficulty level assessment

## 🔧 Troubleshooting

### Common Issues

**Missing Dependencies**
```bash
# Install all required packages
pip install supabase pypdf requests openai python-dotenv
```

**Environment Variables**
```bash
# Check your .env file contains:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_key
OPENAI_API_KEY=your_openai_key  # Optional
```

**PDF Processing Errors**
- PDFs will be skipped if not found (warning logged)
- Large PDFs may hit OpenAI token limits (falls back to dummy embeddings)
- Ensure PDF files are readable and not corrupted

**Database Conflicts**
- Script handles existing users gracefully (updates instead of creating)
- Duplicate key constraints are handled with updates
- Foreign key relationships are maintained

### Logging
The script provides comprehensive logging:
- INFO: Successful operations and progress
- WARNING: Non-critical issues (missing PDFs, existing users)
- ERROR: Critical failures with full stack traces

## 📈 Success Metrics

After successful execution, you should see:
- ✅ **2 Admin Users** with comprehensive capabilities
- ✅ **10+ Partners** with complete digital presence
- ✅ **1 Job Seeker** with AI-processed resume
- ✅ **13 Role Requirements** for career pathways
- ✅ **100+ Knowledge Resources** with embeddings
- ✅ **PDF Domain Resources** processed and searchable
- ✅ **Zero Errors** in the final summary

## 🔄 Maintenance

### Regular Updates
- Partner information can be updated by re-running the script
- New partners can be added to the `PARTNERS_DATA_2025` dictionary
- Admin capabilities can be enhanced in the `ADMIN_USERS_DATA_2025`

### Data Cleanup
The script automatically:
- Removes existing partner resources before recreating
- Updates existing user profiles instead of duplicating
- Maintains referential integrity across tables

### Monitoring
- Check Supabase dashboard for data consistency
- Monitor embedding generation success rates
- Verify AI search functionality with sample queries

## 🎯 Next Steps

1. **Verify Data**: Check Supabase dashboard for all created records
2. **Test Authentication**: Login with provided credentials
3. **Test AI Search**: Query knowledge resources for relevant content
4. **Configure Platform**: Use admin accounts to customize settings
5. **Add Content**: Use admin interface to add more partners/resources

## 📞 Support

For issues or questions:
- Check the comprehensive logging output
- Verify environment variables and dependencies
- Review database schema compatibility
- Contact the development team with specific error messages

---

**Last Updated**: June 2025  
**Script Version**: Enhanced with AI optimization and comprehensive features  
**Compatibility**: Supabase, OpenAI, Next.js 14 with App Router 