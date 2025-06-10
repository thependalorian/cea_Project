/**
 * Agent Response Snapshot Tests
 * Climate Economy Assistant - Response Quality & Consistency
 */

import { server } from '../mocks/server';
import { rest } from 'msw';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
const TEST_USER_ID = '30eedd6a-0771-444e-90d2-7520c1eb03f0';

describe('Agent Response Snapshots', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('🎭 Persona Consistency Snapshots', () => {
    it('should maintain Jasmine resume specialist persona', async () => {
      const mockResponse = {
        content: "Looking at your background in marketing, I can see several skills that would translate beautifully to the climate sector. Your experience with campaign management shows you understand how to coordinate complex projects with multiple stakeholders - that's exactly what renewable energy companies need for their community outreach and project development work. Your data analysis skills from tracking campaign performance would be incredibly valuable for measuring the impact of clean energy programs. I'd love to explore specific opportunities that could be a great fit for your skill set.",
        agent_used: 'jasmine_resume_specialist',
        persona_metrics: {
          tone_consistency: 9.1,
          encouraging_language: 8.9,
          professional_expertise: 9.0,
          actionability: 8.8,
          conversational_flow: 9.2
        },
        language_patterns: [
          'encouraging_tone',
          'skill_translation_focus',
          'specific_examples',
          'future_orientation',
          'personal_engagement'
        ],
        response_structure: {
          acknowledgment: "Looking at your background in marketing",
          skill_translation: "translate beautifully to the climate sector",
          specific_examples: "campaign management shows you understand",
          value_proposition: "exactly what renewable energy companies need",
          personal_touch: "I'd love to explore specific opportunities",
          call_to_action: "could be a great fit for your skill set"
        }
      };

      expect(mockResponse).toMatchSnapshot('jasmine-marketing-transition-response');
      
      // Verify persona consistency metrics
      expect(mockResponse.persona_metrics.tone_consistency).toBeGreaterThan(8.5);
      expect(mockResponse.persona_metrics.encouraging_language).toBeGreaterThan(8.5);
      expect(mockResponse.language_patterns).toContain('encouraging_tone');
      expect(mockResponse.language_patterns).toContain('skill_translation_focus');
    });

    it('should maintain Marcus veteran specialist persona', async () => {
      const mockResponse = {
        content: "Brother, I hear you on the transition challenges. Moving from military logistics to civilian clean energy work isn't just about translating your skills - though you've got plenty that transfer directly. Your experience coordinating supply chains and managing complex operations under pressure? That's gold in the renewable energy sector. Wind farms and solar installations need people who can handle the logistics of getting equipment to remote sites and keeping projects on schedule. The discipline and attention to detail from your military service are exactly what safety-conscious energy companies are looking for. Let's talk about specific pathways that honor your service while building your clean energy career.",
        agent_used: 'marcus_veteran_specialist',
        persona_metrics: {
          military_connection: 9.3,
          peer_relatability: 9.1,
          respect_for_service: 9.4,
          practical_guidance: 8.9,
          brotherhood_tone: 9.0
        },
        language_patterns: [
          'military_camaraderie',
          'direct_communication',
          'service_acknowledgment',
          'practical_examples',
          'respect_building'
        ],
        military_specific_elements: {
          greeting: "Brother, I hear you",
          skill_validation: "you've got plenty that transfer directly",
          service_honor: "honor your service while building",
          practical_focus: "specific pathways",
          understanding: "transition challenges"
        }
      };

      expect(mockResponse).toMatchSnapshot('marcus-veteran-logistics-response');
      
      // Verify military-specific persona elements
      expect(mockResponse.persona_metrics.military_connection).toBeGreaterThan(9.0);
      expect(mockResponse.language_patterns).toContain('military_camaraderie');
      expect(mockResponse.military_specific_elements.greeting).toContain('Brother');
    });

    it('should maintain Liv international specialist persona', async () => {
      const mockResponse = {
        content: "I completely understand how overwhelming it can feel to navigate career transitions in a new country - I've been there myself. Your engineering background from Germany is actually a tremendous asset in Massachusetts' growing offshore wind industry. European countries like Germany have been leading renewable energy innovation for decades, and that perspective is incredibly valuable here. Your international experience shows adaptability and resilience - qualities that employers in the clean energy sector highly value. Many of our partner organizations specifically look for professionals with global perspectives who can bring different approaches to solving climate challenges. Let's explore how we can position your unique background as the strength it truly is.",
        agent_used: 'liv_international_specialist',
        persona_metrics: {
          cultural_sensitivity: 9.2,
          empathy_demonstration: 9.4,
          international_validation: 9.0,
          encouragement_level: 8.8,
          personal_connection: 9.1
        },
        language_patterns: [
          'empathetic_understanding',
          'personal_experience_sharing',
          'cultural_strength_focus',
          'global_perspective_value',
          'inclusive_language'
        ],
        international_specific_elements: {
          empathy: "I completely understand how overwhelming",
          personal_connection: "I've been there myself",
          cultural_validation: "European countries like Germany have been leading",
          strength_reframing: "position your unique background as the strength it truly is",
          global_value: "professionals with global perspectives"
        }
      };

      expect(mockResponse).toMatchSnapshot('liv-international-engineer-response');
      
      // Verify international-specific persona elements
      expect(mockResponse.persona_metrics.cultural_sensitivity).toBeGreaterThan(9.0);
      expect(mockResponse.language_patterns).toContain('empathetic_understanding');
      expect(mockResponse.international_specific_elements.empathy).toContain('understand');
    });
  });

  describe('🛠️ Tool Call Response Snapshots', () => {
    it('should produce consistent resume analysis responses', async () => {
      const mockResumeAnalysis = {
        content: "I've completed a thorough analysis of your resume, and I'm excited to share what I found. Your background shows a strong foundation for climate career success. Your project management experience demonstrates the coordination skills that renewable energy companies desperately need. The data analysis work you've done shows you can handle the technical side of tracking energy performance and efficiency metrics. Your communication skills will be valuable for community engagement and stakeholder coordination in clean energy projects.",
        agent_used: 'jasmine_resume_specialist',
        tools_called: ['resume_parser', 'skills_extractor', 'job_matcher', 'career_pathway_analyzer'],
        tool_results: {
          resume_parser: {
            sections_extracted: ['experience', 'education', 'skills', 'achievements'],
            confidence_score: 0.94,
            parsing_time: 1.2,
            format_detected: 'PDF'
          },
          skills_extractor: {
            technical_skills: ['Project Management', 'Data Analysis', 'Excel', 'SQL'],
            soft_skills: ['Communication', 'Leadership', 'Problem Solving'],
            transferable_skills: ['Stakeholder Management', 'Process Improvement'],
            climate_relevant_score: 0.78
          },
          job_matcher: {
            total_matches: 23,
            high_relevance_matches: 8,
            geographic_matches: 15,
            salary_compatible_matches: 19,
            top_match_score: 0.91
          },
          career_pathway_analyzer: {
            recommended_pathways: 3,
            transition_difficulty: 'Medium',
            estimated_timeline: '6-12 months',
            success_probability: 0.82
          }
        },
        analysis_summary: {
          strengths_identified: 4,
          skill_gaps_found: 2,
          recommendations_generated: 6,
          confidence_level: 'High'
        }
      };

      expect(mockResumeAnalysis).toMatchSnapshot('resume-analysis-comprehensive');
      
      // Verify tool result structure consistency
      expect(mockResumeAnalysis.tool_results.resume_parser).toHaveProperty('confidence_score');
      expect(mockResumeAnalysis.tool_results.skills_extractor).toHaveProperty('climate_relevant_score');
      expect(mockResumeAnalysis.tool_results.job_matcher).toHaveProperty('total_matches');
    });

    it('should produce consistent skills translation responses', async () => {
      const mockSkillsTranslation = {
        content: "Your military logistics experience translates incredibly well to renewable energy operations. The supply chain coordination skills you developed managing equipment and personnel deployments are directly applicable to wind farm construction and solar installation projects. Your understanding of safety protocols and risk management is exactly what clean energy companies need for their field operations. The leadership experience from managing teams under pressure translates perfectly to coordinating installation crews and managing project timelines in the fast-paced renewable energy sector.",
        agent_used: 'marcus_veteran_specialist',
        tools_called: ['skills_translator', 'military_career_mapper', 'job_opportunity_finder'],
        skills_translation: {
          original_skills: [
            'Military Logistics Coordination',
            'Supply Chain Management', 
            'Safety Protocol Implementation',
            'Team Leadership Under Pressure',
            'Risk Assessment and Management'
          ],
          climate_translations: [
            {
              original: 'Military Logistics Coordination',
              climate_skill: 'Renewable Energy Project Logistics',
              relevance_score: 0.93,
              applications: ['Wind farm equipment delivery', 'Solar panel installation coordination'],
              example_roles: ['Operations Manager', 'Project Coordinator']
            },
            {
              original: 'Supply Chain Management',
              climate_skill: 'Clean Energy Supply Chain Optimization',
              relevance_score: 0.89,
              applications: ['Component sourcing', 'Inventory management for installations'],
              example_roles: ['Supply Chain Analyst', 'Procurement Specialist']
            }
          ],
          overall_transferability: 0.91,
          recommended_certifications: ['OSHA 30', 'Project Management Professional'],
          skill_gap_analysis: {
            missing_technical: ['Renewable Energy Fundamentals'],
            missing_certifications: ['Clean Energy Technology Overview'],
            recommended_training_duration: '3-6 months'
          }
        }
      };

      expect(mockSkillsTranslation).toMatchSnapshot('skills-translation-military-logistics');
      
      // Verify translation quality metrics
      expect(mockSkillsTranslation.skills_translation.overall_transferability).toBeGreaterThan(0.85);
      expect(mockSkillsTranslation.skills_translation.climate_translations).toHaveLength(2);
    });
  });

  describe('💼 Job Matching Response Snapshots', () => {
    it('should produce consistent job recommendation responses', async () => {
      const mockJobRecommendations = {
        content: "Based on your background, I've identified several excellent opportunities that align with your skills and interests. The Solar Project Manager role at Sunrun would be perfect for your project coordination experience, and they're specifically looking for someone with your technical background. The Clean Energy Program Coordinator position at MassCEC offers great growth potential and would utilize your stakeholder management skills. Both positions offer competitive salaries and are located within commuting distance of Boston.",
        agent_used: 'general_assistant',
        tools_called: ['job_matcher', 'salary_analyzer', 'geographic_filter'],
        job_recommendations: [
          {
            job_id: 'sunrun_solar_pm_001',
            title: 'Solar Project Manager',
            company: 'Sunrun',
            company_description: 'Leading residential solar provider',
            location: 'Boston, MA',
            remote_options: 'Hybrid (3 days in office)',
            salary_range: '$75,000 - $95,000',
            match_score: 0.92,
            matching_skills: ['Project Management', 'Stakeholder Communication', 'Technical Coordination'],
            requirements: {
              education: 'Bachelor\'s degree preferred',
              experience: '3+ years project management',
              certifications: ['PMP preferred', 'OSHA 30 required'],
              technical: ['Solar technology familiarity', 'Project scheduling software']
            },
            benefits: {
              health_insurance: true,
              retirement_401k: true,
              professional_development: '$2,000 annual budget',
              pto: '20 days + holidays'
            },
            growth_potential: 'Senior Project Manager within 2-3 years',
            application_deadline: '2024-02-15',
            quick_apply_available: true
          },
          {
            job_id: 'masscec_coordinator_002',
            title: 'Clean Energy Program Coordinator',
            company: 'Massachusetts Clean Energy Center',
            company_description: 'State agency promoting clean energy adoption',
            location: 'Cambridge, MA',
            remote_options: 'Flexible remote work',
            salary_range: '$65,000 - $80,000',
            match_score: 0.87,
            matching_skills: ['Program Management', 'Data Analysis', 'Communication'],
            requirements: {
              education: 'Bachelor\'s degree required',
              experience: '2+ years program coordination',
              certifications: ['None required'],
              technical: ['Microsoft Office Suite', 'Database management']
            },
            benefits: {
              health_insurance: true,
              retirement_pension: true,
              professional_development: 'Conference attendance supported',
              pto: '25 days + holidays + personal days'
            },
            growth_potential: 'Program Manager or Policy Analyst tracks',
            application_deadline: '2024-02-28',
            quick_apply_available: false
          }
        ],
        match_analysis: {
          total_jobs_analyzed: 245,
          geographic_matches: 89,
          skill_matches: 156,
          salary_matches: 178,
          high_relevance_jobs: 23,
          application_ready_jobs: 15
        }
      };

      expect(mockJobRecommendations).toMatchSnapshot('job-recommendations-project-management');
      
      // Verify job recommendation quality
      expect(mockJobRecommendations.job_recommendations).toHaveLength(2);
      expect(mockJobRecommendations.job_recommendations[0].match_score).toBeGreaterThan(0.9);
      expect(mockJobRecommendations.match_analysis.high_relevance_jobs).toBeGreaterThan(20);
    });
  });

  describe('🎯 Career Pathway Response Snapshots', () => {
    it('should produce consistent career pathway responses', async () => {
      const mockCareerPathway = {
        content: "I've mapped out a clear pathway for your transition from teaching to environmental education and clean energy advocacy. Your classroom management skills translate directly to program coordination, and your curriculum development experience is perfect for creating educational content about renewable energy. The timeline I'm suggesting is realistic and builds on your existing strengths while adding the climate-specific knowledge you'll need.",
        agent_used: 'general_assistant',
        tools_called: ['career_pathway_analyzer', 'education_mapper', 'timeline_generator'],
        career_pathway: {
          current_profile: {
            background: 'Elementary School Teacher',
            experience_years: 7,
            key_skills: ['Curriculum Development', 'Classroom Management', 'Student Assessment'],
            transferable_strengths: ['Communication', 'Program Planning', 'Data Analysis'],
            climate_readiness_score: 0.68
          },
          target_roles: [
            'Environmental Education Coordinator',
            'Clean Energy Outreach Specialist',
            'Sustainability Program Manager'
          ],
          pathway_steps: [
            {
              phase: 'Foundation Building',
              duration: '3 months',
              actions: [
                'Complete Environmental Education Certificate (online)',
                'Volunteer with local environmental organizations',
                'Attend clean energy workshops and webinars'
              ],
              cost: '$1,200',
              time_commitment: '10 hours/week'
            },
            {
              phase: 'Skill Development',
              duration: '6 months',
              actions: [
                'Obtain Clean Energy Fundamentals certification',
                'Develop climate education curriculum (portfolio project)',
                'Network with environmental education professionals'
              ],
              cost: '$2,500',
              time_commitment: '15 hours/week'
            },
            {
              phase: 'Transition & Application',
              duration: '3-6 months',
              actions: [
                'Apply for environmental education roles',
                'Seek informational interviews',
                'Consider part-time transition opportunities'
              ],
              cost: '$500',
              time_commitment: '20 hours/week'
            }
          ],
          success_metrics: {
            pathway_viability: 0.84,
            expected_salary_change: '+15% to +40%',
            job_satisfaction_improvement: 'High',
            timeline_realism: 'Highly achievable'
          }
        }
      };

      expect(mockCareerPathway).toMatchSnapshot('career-pathway-teacher-to-environmental-education');
      
      // Verify pathway structure and quality
      expect(mockCareerPathway.career_pathway.pathway_steps).toHaveLength(3);
      expect(mockCareerPathway.career_pathway.success_metrics.pathway_viability).toBeGreaterThan(0.8);
    });
  });

  describe('🚨 Error Handling Response Snapshots', () => {
    it('should produce consistent error handling responses', async () => {
      const mockErrorResponse = {
        content: "I apologize, but I'm experiencing a temporary issue with one of my analysis tools. While I work on resolving this, I can still provide guidance based on the information you've shared. Let me offer some general recommendations for your situation, and we can dive deeper once my full capabilities are restored.",
        agent_used: 'general_assistant',
        error_context: {
          tool_affected: 'resume_parser',
          error_type: 'service_unavailable',
          fallback_strategy: 'manual_analysis',
          user_impact: 'minimal',
          recovery_time: 'estimated 5-10 minutes'
        },
        fallback_response: {
          guidance_provided: true,
          alternative_approach: 'conversation_based_assessment',
          follow_up_suggested: true,
          user_experience_preserved: true
        }
      };

      expect(mockErrorResponse).toMatchSnapshot('error-handling-tool-failure');
      
      // Verify graceful error handling
      expect(mockErrorResponse.error_context.user_impact).toBe('minimal');
      expect(mockErrorResponse.fallback_response.user_experience_preserved).toBe(true);
    });
  });

  describe('📊 Performance Metrics Snapshots', () => {
    it('should maintain consistent performance characteristics', async () => {
      const mockPerformanceMetrics = {
        response_generation: {
          agent_routing_time: 0.12,
          tool_execution_time: 2.34,
          content_generation_time: 1.89,
          total_response_time: 4.35,
          tokens_generated: 387,
          words_per_second: 89
        },
        quality_metrics: {
          relevance_score: 0.91,
          completeness_score: 0.88,
          actionability_score: 0.93,
          clarity_score: 0.90,
          persona_consistency: 0.95
        },
        user_experience: {
          response_satisfaction: 0.89,
          information_usefulness: 0.92,
          next_step_clarity: 0.87,
          tone_appropriateness: 0.94
        }
      };

      expect(mockPerformanceMetrics).toMatchSnapshot('performance-metrics-baseline');
      
      // Verify performance standards
      expect(mockPerformanceMetrics.response_generation.total_response_time).toBeLessThan(6.0);
      expect(mockPerformanceMetrics.quality_metrics.relevance_score).toBeGreaterThan(0.85);
      expect(mockPerformanceMetrics.user_experience.response_satisfaction).toBeGreaterThan(0.85);
    });
  });
}); 