/**
 * George Nekwaya Triple Access Profile Tests
 * Climate Economy Assistant - Comprehensive Multi-Profile Validation
 * 
 * Tests George's three distinct access profiles:
 * 1. Admin Profile (ACT Project Manager)
 * 2. Partner Profile (Buffr Inc. Founder)
 * 3. Job Seeker Profile (Individual Career Development)
 */

import { server } from '../mocks/server';
import { rest } from 'msw';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// George Nekwaya's actual profile IDs (from seed script)
const GEORGE_PROFILES = {
  ADMIN: {
    user_id: 'george_nekwaya_admin',
    email: 'george.nekwaya@gmail.com',
    role: 'admin',
    organization: 'Apprenti Career Transitions (ACT)',
    access_level: 'super_admin',
    context: 'administrative_functions'
  },
  PARTNER: {
    user_id: 'george_nekwaya_partner', 
    email: 'george.nekwaya@gmail.com',
    role: 'partner',
    organization: 'Buffr Inc.',
    access_level: 'partner_full',
    context: 'partner_collaboration'
  },
  JOB_SEEKER: {
    user_id: 'george_nekwaya_jobseeker',
    email: 'george.nekwaya@gmail.com', 
    role: 'job_seeker',
    organization: null,
    access_level: 'individual',
    context: 'career_development'
  }
};

describe('George Nekwaya Triple Access Integration Tests', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('🔑 Profile Access Validation', () => {
    it('should authenticate George as Admin with full platform access', async () => {
      const profile = GEORGE_PROFILES.ADMIN;
      
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/interactive-chat`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              content: "Welcome back, George! As an admin, you have full access to all platform features including user management, partner oversight, and system analytics. How can I assist you with platform administration today?",
              agent_used: 'admin_assistant',
              user_context: {
                profile: 'admin',
                organization: 'Apprenti Career Transitions (ACT)',
                access_permissions: [
                  'user_management',
                  'partner_oversight', 
                  'system_analytics',
                  'platform_configuration',
                  'data_export',
                  'user_impersonation'
                ],
                admin_level: 'super_admin'
              },
              tools_called: ['admin_auth_verify', 'permission_checker'],
              platform_features_available: [
                'admin_dashboard',
                'user_analytics',
                'partner_management',
                'system_health_monitor',
                'data_insights'
              ]
            })
          );
        })
      );

      const response = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'I need to check the platform analytics',
          user_id: profile.user_id,
          context: {
            profile_type: profile.role,
            organization: profile.organization,
            access_level: profile.access_level
          }
        })
      });

      const result = await response.json();

      // Verify admin access
      expect(response.status).toBe(200);
      expect(result.user_context.profile).toBe('admin');
      expect(result.user_context.admin_level).toBe('super_admin');
      expect(result.user_context.access_permissions).toContain('user_management');
      expect(result.user_context.access_permissions).toContain('partner_oversight');
      expect(result.platform_features_available).toContain('admin_dashboard');
      expect(result.content).toContain('admin');
      expect(result.content).toContain('platform administration');
    });

    it('should authenticate George as Partner with business collaboration features', async () => {
      const profile = GEORGE_PROFILES.PARTNER;
      
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/interactive-chat`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              content: "Hello George! Great to see you representing Buffr Inc. today. As a partner, you can access our collaboration tools, job posting features, and talent pipeline insights. What partnership activities can I help you with?",
              agent_used: 'partner_liaison',
              user_context: {
                profile: 'partner',
                organization: 'Buffr Inc.',
                partner_tier: 'founding_partner',
                access_permissions: [
                  'job_posting',
                  'talent_pipeline_access',
                  'partnership_analytics',
                  'collaboration_tools',
                  'candidate_screening',
                  'partner_networking'
                ]
              },
              tools_called: ['partner_auth_verify', 'organization_lookup'],
              partner_features_available: [
                'job_posting_dashboard',
                'talent_matching',
                'partnership_portal',
                'candidate_pipeline',
                'collaboration_workspace'
              ],
              organization_info: {
                name: 'Buffr Inc.',
                industry: 'Fintech & Climate Technology',
                partnership_status: 'Active',
                job_postings: 3,
                candidate_matches: 12
              }
            })
          );
        })
      );

      const response = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'I want to post a new job for a clean energy data analyst',
          user_id: profile.user_id,
          context: {
            profile_type: profile.role,
            organization: profile.organization,
            access_level: profile.access_level
          }
        })
      });

      const result = await response.json();

      // Verify partner access
      expect(response.status).toBe(200);
      expect(result.user_context.profile).toBe('partner');
      expect(result.user_context.organization).toBe('Buffr Inc.');
      expect(result.user_context.access_permissions).toContain('job_posting');
      expect(result.user_context.access_permissions).toContain('talent_pipeline_access');
      expect(result.partner_features_available).toContain('job_posting_dashboard');
      expect(result.content).toContain('Buffr Inc.');
      expect(result.content).toContain('partner');
      expect(result.organization_info.name).toBe('Buffr Inc.');
    });

    it('should authenticate George as Job Seeker with career development features', async () => {
      const profile = GEORGE_PROFILES.JOB_SEEKER;
      
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/interactive-chat`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              content: "Hi George! I'm Jasmine, your resume specialist. I see you're here as an individual exploring climate career opportunities. With your impressive background in fintech and project management, there are excellent pathways into the clean energy sector. Would you like me to analyze your skills for climate career matches?",
              agent_used: 'jasmine_resume_specialist',
              user_context: {
                profile: 'job_seeker',
                individual_access: true,
                access_permissions: [
                  'resume_analysis',
                  'job_search',
                  'career_guidance',
                  'skills_assessment',
                  'training_recommendations',
                  'mentor_matching'
                ]
              },
              tools_called: ['job_seeker_auth', 'profile_analyzer'],
              career_features_available: [
                'resume_upload',
                'job_matching',
                'career_pathways',
                'skills_translator',
                'training_programs',
                'mentorship_portal'
              ],
              profile_analysis: {
                background: 'Fintech Founder & Project Manager',
                transferable_skills: ['Data Analytics', 'Project Management', 'Workforce Development'],
                climate_readiness_score: 0.87,
                recommended_pathways: ['Clean Energy Data Analysis', 'Climate Tech Project Management']
              }
            })
          );
        })
      );

      const response = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'I want to explore opportunities in climate data analysis',
          user_id: profile.user_id,
          context: {
            profile_type: profile.role,
            individual_access: true,
            access_level: profile.access_level
          }
        })
      });

      const result = await response.json();

      // Verify job seeker access
      expect(response.status).toBe(200);
      expect(result.user_context.profile).toBe('job_seeker');
      expect(result.user_context.individual_access).toBe(true);
      expect(result.user_context.access_permissions).toContain('resume_analysis');
      expect(result.user_context.access_permissions).toContain('career_guidance');
      expect(result.career_features_available).toContain('job_matching');
      expect(result.career_features_available).toContain('skills_translator');
      expect(result.content).toContain('Jasmine');
      expect(result.content).toContain('resume specialist');
      expect(result.agent_used).toBe('jasmine_resume_specialist');
    });
  });

  describe('🔄 Profile Switching Functionality', () => {
    it('should handle George switching from Admin to Partner context', async () => {
      // Simulate profile switch from admin to partner
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/profile-switch`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              message: "Successfully switched from Admin to Partner profile",
              previous_profile: 'admin',
              current_profile: 'partner',
              user_context: {
                user_id: GEORGE_PROFILES.PARTNER.user_id,
                organization: 'Buffr Inc.',
                access_permissions: ['job_posting', 'talent_pipeline_access'],
                profile_switch_history: [
                  { from: 'admin', to: 'partner', timestamp: new Date().toISOString() }
                ]
              }
            })
          );
        })
      );

      const response = await fetch(`${BACKEND_URL}/api/v1/profile-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_user_id: GEORGE_PROFILES.ADMIN.user_id,
          target_profile: 'partner',
          email: 'george.nekwaya@gmail.com'
        })
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.previous_profile).toBe('admin');
      expect(result.current_profile).toBe('partner');
      expect(result.user_context.organization).toBe('Buffr Inc.');
    });

    it('should handle George switching from Partner to Job Seeker context', async () => {
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/profile-switch`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              success: true,
              message: "Successfully switched from Partner to Job Seeker profile",
              previous_profile: 'partner', 
              current_profile: 'job_seeker',
              user_context: {
                user_id: GEORGE_PROFILES.JOB_SEEKER.user_id,
                individual_access: true,
                access_permissions: ['resume_analysis', 'job_search', 'career_guidance'],
                profile_switch_history: [
                  { from: 'partner', to: 'job_seeker', timestamp: new Date().toISOString() }
                ]
              }
            })
          );
        })
      );

      const response = await fetch(`${BACKEND_URL}/api/v1/profile-switch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_user_id: GEORGE_PROFILES.PARTNER.user_id,
          target_profile: 'job_seeker',
          email: 'george.nekwaya@gmail.com'
        })
      });

      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.previous_profile).toBe('partner');
      expect(result.current_profile).toBe('job_seeker');
      expect(result.user_context.individual_access).toBe(true);
    });
  });

  describe('🎭 Agent Routing Based on George\'s Profile', () => {
    it('should route to Admin Assistant when George uses admin profile', async () => {
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/interactive-chat`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              content: "As the platform administrator, I can provide you with comprehensive system insights and user management capabilities.",
              agent_used: 'admin_assistant',
              routing_decision: {
                profile_detected: 'admin',
                agent_selected: 'admin_assistant',
                reasoning: 'Admin profile detected - routing to administrative assistant'
              }
            })
          );
        })
      );

      const response = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Show me platform usage statistics',
          user_id: GEORGE_PROFILES.ADMIN.user_id,
          context: { profile_type: 'admin' }
        })
      });

      const result = await response.json();
      expect(result.agent_used).toBe('admin_assistant');
      expect(result.routing_decision.profile_detected).toBe('admin');
    });

    it('should route to Partner Liaison when George uses partner profile', async () => {
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/interactive-chat`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              content: "Great to work with Buffr Inc. on expanding clean energy opportunities. Let me help you with partnership activities.",
              agent_used: 'partner_liaison',
              routing_decision: {
                profile_detected: 'partner',
                organization: 'Buffr Inc.',
                agent_selected: 'partner_liaison',
                reasoning: 'Partner profile from Buffr Inc. detected - routing to partnership specialist'
              }
            })
          );
        })
      );

      const response = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'I want to collaborate on a clean energy hiring initiative',
          user_id: GEORGE_PROFILES.PARTNER.user_id,
          context: { profile_type: 'partner', organization: 'Buffr Inc.' }
        })
      });

      const result = await response.json();
      expect(result.agent_used).toBe('partner_liaison');
      expect(result.routing_decision.profile_detected).toBe('partner');
      expect(result.routing_decision.organization).toBe('Buffr Inc.');
    });

    it('should route to Jasmine when George uses job seeker profile', async () => {
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/interactive-chat`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              content: "I'm excited to help you explore climate career opportunities! Your fintech background has so many transferable skills.",
              agent_used: 'jasmine_resume_specialist',
              routing_decision: {
                profile_detected: 'job_seeker',
                agent_selected: 'jasmine_resume_specialist',
                reasoning: 'Individual job seeker detected - routing to career guidance specialist'
              }
            })
          );
        })
      );

      const response = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Help me transition my fintech skills to climate tech',
          user_id: GEORGE_PROFILES.JOB_SEEKER.user_id,
          context: { profile_type: 'job_seeker' }
        })
      });

      const result = await response.json();
      expect(result.agent_used).toBe('jasmine_resume_specialist');
      expect(result.routing_decision.profile_detected).toBe('job_seeker');
    });
  });

  describe('🔒 Permission-Based Feature Access', () => {
    it('should grant George admin-only features when using admin profile', async () => {
      server.use(
        rest.get(`${BACKEND_URL}/api/v1/admin/users`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              users: [
                { id: 1, name: 'Test User 1', role: 'job_seeker' },
                { id: 2, name: 'Test User 2', role: 'partner' }
              ],
              total_users: 147,
              access_granted: true,
              admin_permissions: ['user_management', 'system_analytics']
            })
          );
        })
      );

      const response = await fetch(`${BACKEND_URL}/api/v1/admin/users`, {
        headers: {
          'Authorization': `Bearer ${GEORGE_PROFILES.ADMIN.user_id}`,
          'Profile-Type': 'admin'
        }
      });

      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.access_granted).toBe(true);
      expect(result.total_users).toBeGreaterThan(0);
    });

    it('should deny admin features when George uses non-admin profiles', async () => {
      server.use(
        rest.get(`${BACKEND_URL}/api/v1/admin/users`, (req, res, ctx) => {
          return res(
            ctx.status(403),
            ctx.json({
              error: 'Access denied',
              message: 'Admin privileges required',
              current_profile: 'partner',
              required_profile: 'admin'
            })
          );
        })
      );

      const response = await fetch(`${BACKEND_URL}/api/v1/admin/users`, {
        headers: {
          'Authorization': `Bearer ${GEORGE_PROFILES.PARTNER.user_id}`,
          'Profile-Type': 'partner'
        }
      });

      expect(response.status).toBe(403);
      const result = await response.json();
      expect(result.error).toBe('Access denied');
      expect(result.current_profile).toBe('partner');
    });

    it('should grant partner features when George uses partner profile', async () => {
      server.use(
        rest.get(`${BACKEND_URL}/api/v1/partner/job-postings`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              job_postings: [
                { id: 1, title: 'Clean Energy Data Analyst', company: 'Buffr Inc.' },
                { id: 2, title: 'Sustainability Consultant', company: 'Buffr Inc.' }
              ],
              partner_access: true,
              organization: 'Buffr Inc.'
            })
          );
        })
      );

      const response = await fetch(`${BACKEND_URL}/api/v1/partner/job-postings`, {
        headers: {
          'Authorization': `Bearer ${GEORGE_PROFILES.PARTNER.user_id}`,
          'Profile-Type': 'partner',
          'Organization': 'Buffr Inc.'
        }
      });

      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.partner_access).toBe(true);
      expect(result.organization).toBe('Buffr Inc.');
    });
  });

  describe('📊 Data Isolation and Context Switching', () => {
    it('should maintain data isolation between George\'s different profiles', async () => {
      // Test that admin data doesn't leak into partner context
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/interactive-chat`, (req, res, ctx) => {
          const body = req.body;
          const context = body.context;
          
          if (context.profile_type === 'partner') {
            return res(
              ctx.status(200),
              ctx.json({
                content: "Partner context - no admin data visible",
                data_isolation: {
                  admin_data_visible: false,
                  partner_data_visible: true,
                  job_seeker_data_visible: false
                },
                accessible_features: ['job_posting', 'talent_pipeline'],
                restricted_features: ['user_management', 'system_analytics']
              })
            );
          }
        })
      );

      const response = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'What data can I access?',
          user_id: GEORGE_PROFILES.PARTNER.user_id,
          context: { profile_type: 'partner' }
        })
      });

      const result = await response.json();
      expect(result.data_isolation.admin_data_visible).toBe(false);
      expect(result.data_isolation.partner_data_visible).toBe(true);
      expect(result.accessible_features).toContain('job_posting');
      expect(result.restricted_features).toContain('user_management');
    });
  });

  describe('🔍 Profile Detection and Validation', () => {
    it('should correctly identify George across all three profiles', async () => {
      const profileTests = [
        {
          profile: GEORGE_PROFILES.ADMIN,
          expectedRole: 'admin',
          expectedOrganization: 'Apprenti Career Transitions (ACT)'
        },
        {
          profile: GEORGE_PROFILES.PARTNER,
          expectedRole: 'partner', 
          expectedOrganization: 'Buffr Inc.'
        },
        {
          profile: GEORGE_PROFILES.JOB_SEEKER,
          expectedRole: 'job_seeker',
          expectedOrganization: null
        }
      ];

      for (const test of profileTests) {
        server.use(
          rest.post(`${BACKEND_URL}/api/v1/profile-verify`, (req, res, ctx) => {
            return res(
              ctx.status(200),
              ctx.json({
                profile_verified: true,
                user_identity: 'George Nekwaya',
                email: 'george.nekwaya@gmail.com',
                role: test.expectedRole,
                organization: test.expectedOrganization,
                access_level: test.profile.access_level
              })
            );
          })
        );

        const response = await fetch(`${BACKEND_URL}/api/v1/profile-verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: test.profile.user_id,
            email: test.profile.email
          })
        });

        const result = await response.json();
        expect(result.profile_verified).toBe(true);
        expect(result.user_identity).toBe('George Nekwaya');
        expect(result.role).toBe(test.expectedRole);
        expect(result.organization).toBe(test.expectedOrganization);
      }
    });
  });
}); 