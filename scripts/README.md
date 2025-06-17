# Climate Economy Assistant - Scripts Directory

## 📚 Documentation Overview

### 🔥 Quick Start
- **[QUICK_LOGIN_REFERENCE.md](./QUICK_LOGIN_REFERENCE.md)** - Essential login credentials and demo access
- **[CLIMATE_ECONOMY_SETUP_GUIDE.md](./CLIMATE_ECONOMY_SETUP_GUIDE.md)** - Complete platform documentation

### 📋 Detailed Documentation
- **[SCHEMA_FIXES_SUMMARY.md](./SCHEMA_FIXES_SUMMARY.md)** - Database schema updates and fixes
- **[GEORGE_JOBSEEKER_ADDITION.md](./GEORGE_JOBSEEKER_ADDITION.md)** - Job seeker account implementation
- **[GEORGE_NEKWAYA_SEED_ADDITIONS.md](./GEORGE_NEKWAYA_SEED_ADDITIONS.md)** - Admin account setup details
- **[SEED_SCRIPT_UPDATES.md](./SEED_SCRIPT_UPDATES.md)** - Seed script modification history

## 🛠️ Key Scripts

### Production Scripts
- **`create_seed_partners_updated.py`** - Main seed script (2994 lines) - Creates all users, partners, and content
- **`setup_auth_structure.py`** - Authentication structure setup
- **`create_test_profile.py`** - Test profile creation utilities

### Development & Testing
- **`test-authentication.js`** - Authentication testing suite
- **`check-schema.js`** - Database schema validation
- **`setup-demo-users.js`** - Demo user setup (legacy)
- **`ui-refactor.js`** - UI component refactoring utilities

### Utilities
- **`token_issuer.py`** - JWT token generation utilities
- **`run_updated_seed.py`** - Seed script runner
- **`docker-dev-setup.sh`** - Docker development environment setup

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Seed Script
```bash
python create_seed_partners_updated.py
```

### 3. Access Platform
- **URL**: http://localhost:3000/login
- **Demo Buttons**: Use for quick access
- **Manual Login**: See QUICK_LOGIN_REFERENCE.md

## 📊 What Gets Created

### Users
- **2 Admin Users** (including George's admin account)
- **2 Job Seekers** (including George's personal account)  
- **10 Partner Organizations** (real Massachusetts climate organizations)

### Content
- **13 Role Requirements** for various climate jobs
- **7 Education Programs** from partner institutions
- **4 Job Listings** with real opportunities
- **Comprehensive Knowledge Base** with AI embeddings
- **2 Domain PDFs** processed (NECEC Report, MA Workforce Assessment)

### Special Features
- **George's Triple Access**: Admin + Partner + Job Seeker roles
- **ACT Brand Integration**: Proper colors and styling
- **Supabase Auth**: Direct integration (bypasses backend API)
- **AI-Optimized Content**: Embeddings for intelligent search

## 🔐 Login Credentials Summary

### Demo Access (Recommended)
Use the demo buttons on the login page for instant access to:
- Job Seeker Demo (George's personal account)
- Partner Demo (Buffr Inc.)
- Admin Demo (George's admin account)

### Manual Login
See **[QUICK_LOGIN_REFERENCE.md](./QUICK_LOGIN_REFERENCE.md)** for all credentials.

## 🎯 Key Features

### Authentication Fixed
- ✅ Direct Supabase Auth integration
- ✅ Proper password handling
- ✅ Role-based access control
- ✅ Demo account functionality

### Brand Alignment
- ✅ ACT color scheme implementation
- ✅ Professional typography (SF Pro + Inter)
- ✅ iOS-inspired design elements
- ✅ Consistent component styling

### Data Completeness
- ✅ Real partner organizations
- ✅ Actual job opportunities
- ✅ Comprehensive user profiles
- ✅ AI-ready knowledge base

## 🆘 Troubleshooting

### Common Issues
1. **Login Failures**: Check Supabase environment variables
2. **Missing Data**: Re-run `create_seed_partners_updated.py`
3. **Schema Errors**: Run `check-schema.js` for validation
4. **Styling Issues**: Verify Tailwind and DaisyUI configuration

### Support
- **Technical Lead**: George Nekwaya (gnekwaya@joinact.org)
- **Documentation**: See consolidated guides above
- **Platform**: Climate Economy Assistant

---

**Last Updated**: June 2025  
**Status**: Production Ready  
**Next Steps**: Test all user flows with provided credentials 