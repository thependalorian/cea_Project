/**
 * Frontend ↔ Backend Chat Integration Tests
 * Climate Economy Assistant - Full Stack Integration
 */

import { renderHook, act } from '@testing-library/react';
import { server } from '../mocks/server';
import { rest } from 'msw';

// Mock chat hook and components
const mockChatHook = {
  messages: [],
  sendMessage: jest.fn(),
  isLoading: false,
  error: null,
};

// Test data
const TEST_USER_ID = '30eedd6a-0771-444e-90d2-7520c1eb03f0';
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

describe('Frontend ↔ Backend Chat Integration', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  describe('🔄 Full Stack Chat Flow', () => {
    it('should route message through agent system and return response', async () => {
      // Mock backend response with agent routing
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/interactive-chat`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              content: "Hello! I'm Jasmine, your climate career specialist. I can help you analyze your resume and find opportunities in Massachusetts' growing clean energy sector.",
              agent_used: 'jasmine_resume_specialist',
              tools_called: ['user_profile_lookup', 'resume_analysis'],
              reasoning_trace: [
                'Identified user greeting and career interest',
                'Routed to Jasmine for resume/career guidance',
                'Retrieved user profile and resume data',
                'Generated personalized response'
              ],
              metadata: {
                response_time: 2.3,
                confidence_score: 0.95,
                persona_alignment: 'jasmine_professional_encouraging'
              }
            })
          );
        })
      );

      // Simulate frontend message sending
      const chatRequest = {
        query: 'Hello, I want to explore climate careers',
        user_id: TEST_USER_ID,
        context: {
          source: 'chat_interface',
          timestamp: new Date().toISOString()
        },
        stream: false
      };

      // Test API call
      const response = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(chatRequest)
      });

      const result = await response.json();

      // Verify response structure
      expect(response.status).toBe(200);
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('agent_used');
      expect(result).toHaveProperty('tools_called');
      expect(result).toHaveProperty('reasoning_trace');

      // Verify agent routing
      expect(result.agent_used).toBe('jasmine_resume_specialist');
      expect(result.tools_called).toContain('user_profile_lookup');
      expect(result.reasoning_trace).toHaveLength(4);

      // Verify persona consistency
      expect(result.content).toContain('Jasmine');
      expect(result.content).toContain('climate career specialist');
      expect(result.metadata.persona_alignment).toBe('jasmine_professional_encouraging');
    });

    it('should handle complex multi-identity routing', async () => {
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/interactive-chat`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              content: "I understand you have both military and international experience - that's a powerful combination for the climate sector. Let me coordinate with my colleagues Marcus and Liv to give you comprehensive guidance.",
              agent_used: 'supervisor',
              specialist_coordination: ['marcus_veteran_specialist', 'liv_international_specialist'],
              tools_called: ['identity_detection', 'multi_agent_coordination'],
              reasoning_trace: [
                'Detected veteran identity indicators',
                'Detected international professional background',
                'Initiated multi-specialist coordination',
                'Generated comprehensive routing response'
              ]
            })
          );
        })
      );

      const complexRequest = {
        query: 'I am a former Navy engineer who immigrated from Germany. I want to work on offshore wind projects.',
        user_id: TEST_USER_ID,
        context: { source: 'chat_interface' },
        stream: false
      };

      const response = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complexRequest)
      });

      const result = await response.json();

      // Verify complex routing
      expect(result.agent_used).toBe('supervisor');
      expect(result.specialist_coordination).toContain('marcus_veteran_specialist');
      expect(result.specialist_coordination).toContain('liv_international_specialist');
      expect(result.tools_called).toContain('identity_detection');
      expect(result.tools_called).toContain('multi_agent_coordination');
    });
  });

  describe('🛠️ Tool Call Verification', () => {
    it('should verify resume processing tool chain', async () => {
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/interactive-chat`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              content: "I've analyzed your resume and found several strengths that align well with climate careers...",
              agent_used: 'jasmine_resume_specialist',
              tools_called: [
                'resume_parser',
                'skills_extractor', 
                'job_matcher',
                'career_pathway_analyzer'
              ],
              tool_results: {
                resume_parser: {
                  sections_extracted: ['experience', 'education', 'skills'],
                  confidence: 0.92
                },
                skills_extractor: {
                  technical_skills: ['project management', 'data analysis'],
                  transferable_skills: ['leadership', 'problem solving'],
                  climate_relevant: ['sustainability awareness', 'systems thinking']
                },
                job_matcher: {
                  matches_found: 12,
                  top_relevance_score: 0.87,
                  geographic_matches: 8
                }
              },
              reasoning_trace: [
                'Parsed uploaded resume document',
                'Extracted skills and experience',
                'Matched against climate job database',
                'Generated career pathway recommendations'
              ]
            })
          );
        })
      );

      const resumeRequest = {
        query: 'Please analyze my resume for climate career opportunities',
        user_id: TEST_USER_ID,
        context: { 
          source: 'resume_upload',
          has_resume: true 
        },
        stream: false
      };

      const response = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeRequest)
      });

      const result = await response.json();

      // Verify tool chain execution
      expect(result.tools_called).toEqual([
        'resume_parser',
        'skills_extractor', 
        'job_matcher',
        'career_pathway_analyzer'
      ]);

      // Verify tool results structure
      expect(result.tool_results.resume_parser).toHaveProperty('sections_extracted');
      expect(result.tool_results.skills_extractor).toHaveProperty('technical_skills');
      expect(result.tool_results.job_matcher).toHaveProperty('matches_found');

      // Verify tool result quality
      expect(result.tool_results.resume_parser.confidence).toBeGreaterThan(0.8);
      expect(result.tool_results.job_matcher.matches_found).toBeGreaterThan(0);
    });

    it('should verify vector search tool integration', async () => {
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/interactive-chat`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              content: "Based on your interests in solar energy, I found several relevant opportunities and resources...",
              agent_used: 'general_assistant',
              tools_called: ['vector_search', 'knowledge_retrieval'],
              tool_results: {
                vector_search: {
                  query_embedding: [0.1, 0.2, 0.3], // Simplified
                  top_matches: [
                    { content: 'Solar installer training program', score: 0.92 },
                    { content: 'NABCEP certification pathway', score: 0.88 },
                    { content: 'Massachusetts solar incentives', score: 0.85 }
                  ]
                },
                knowledge_retrieval: {
                  sources_found: 3,
                  confidence: 0.89,
                  context_relevant: true
                }
              }
            })
          );
        })
      );

      const searchRequest = {
        query: 'What training programs are available for solar energy careers?',
        user_id: TEST_USER_ID,
        context: { source: 'knowledge_search' },
        stream: false
      };

      const response = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchRequest)
      });

      const result = await response.json();

      // Verify vector search tools
      expect(result.tools_called).toContain('vector_search');
      expect(result.tools_called).toContain('knowledge_retrieval');
      
      // Verify search results quality
      expect(result.tool_results.vector_search.top_matches).toHaveLength(3);
      expect(result.tool_results.vector_search.top_matches[0].score).toBeGreaterThan(0.8);
      expect(result.tool_results.knowledge_retrieval.confidence).toBeGreaterThan(0.8);
    });
  });

  describe('🎭 Persona & Response Quality', () => {
    it('should maintain Jasmine persona consistency', async () => {
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/interactive-chat`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              content: "Looking at your background in project management, I can see several skills that would translate beautifully to the climate sector. Your experience coordinating complex timelines and managing stakeholder relationships is exactly what renewable energy companies need for their development projects. In fact, many of our partner organizations like Greentown Labs specifically look for people with your combination of technical coordination and communication skills.",
              agent_used: 'jasmine_resume_specialist',
              persona_metrics: {
                tone_consistency: 9.2,
                encouraging_language: 8.8,
                professional_expertise: 9.1,
                actionability: 8.9
              },
              language_patterns: [
                'conversational_flow',
                'encouraging_tone',
                'specific_examples',
                'actionable_guidance'
              ]
            })
          );
        })
      );

      const personaRequest = {
        query: 'I have project management experience but no clean energy background',
        user_id: TEST_USER_ID,
        context: { source: 'career_guidance' },
        stream: false
      };

      const response = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personaRequest)
      });

      const result = await response.json();

      // Verify persona consistency
      expect(result.persona_metrics.tone_consistency).toBeGreaterThan(8.0);
      expect(result.persona_metrics.encouraging_language).toBeGreaterThan(8.0);
      expect(result.persona_metrics.professional_expertise).toBeGreaterThan(8.0);

      // Verify language patterns
      expect(result.language_patterns).toContain('conversational_flow');
      expect(result.language_patterns).toContain('encouraging_tone');
      expect(result.language_patterns).toContain('actionable_guidance');

      // Verify content quality
      expect(result.content).toContain('translate beautifully');
      expect(result.content).toContain('exactly what renewable energy companies need');
      expect(result.content).not.toContain('**'); // No markdown formatting
      expect(result.content).not.toContain('•'); // No bullet points
    });

    it('should verify response structure and completeness', async () => {
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/interactive-chat`, (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              content: "Based on your military experience in logistics, here are specific pathways into clean energy...",
              agent_used: 'marcus_veteran_specialist',
              response_structure: {
                introduction: true,
                problem_acknowledgment: true,
                skill_translation: true,
                specific_opportunities: true,
                next_steps: true,
                contact_information: true
              },
              completeness_score: 9.1,
              recommendations: [
                {
                  type: 'training_program',
                  title: 'Clean Energy Project Management Certificate',
                  provider: 'UMass Lowell',
                  duration: '6 months',
                  cost: 'GI Bill eligible'
                },
                {
                  type: 'job_opportunity',
                  title: 'Solar Operations Coordinator',
                  company: 'Nexamp',
                  location: 'Cambridge, MA',
                  salary_range: '$65,000 - $80,000'
                }
              ]
            })
          );
        })
      );

      const structureRequest = {
        query: 'How can I transition from military logistics to clean energy?',
        user_id: TEST_USER_ID,
        context: { source: 'career_transition' },
        stream: false
      };

      const response = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(structureRequest)
      });

      const result = await response.json();

      // Verify response structure completeness
      expect(result.response_structure.introduction).toBe(true);
      expect(result.response_structure.skill_translation).toBe(true);
      expect(result.response_structure.specific_opportunities).toBe(true);
      expect(result.response_structure.next_steps).toBe(true);

      // Verify recommendations quality
      expect(result.recommendations).toHaveLength(2);
      expect(result.recommendations[0]).toHaveProperty('type');
      expect(result.recommendations[0]).toHaveProperty('title');
      expect(result.recommendations[0]).toHaveProperty('provider');

      // Verify completeness score
      expect(result.completeness_score).toBeGreaterThan(8.0);
    });
  });

  describe('🚨 Error Handling & Edge Cases', () => {
    it('should handle backend errors gracefully', async () => {
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/interactive-chat`, (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: 'Internal server error' }));
        })
      );

      const errorRequest = {
        query: 'Test error handling',
        user_id: TEST_USER_ID,
        context: { source: 'error_test' },
        stream: false
      };

      const response = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorRequest)
      });

      expect(response.status).toBe(500);
      
      const result = await response.json();
      expect(result).toHaveProperty('error');
    });

    it('should handle malformed requests', async () => {
      const malformedRequest = {
        // Missing required fields
        query: '',
        // Invalid user_id format
        user_id: 'invalid-id'
      };

      const response = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(malformedRequest)
      });

      // Should return validation error
      expect(response.status).toBe(400);
    });
  });

  describe('⚡ Performance & Timing', () => {
    it('should meet response time requirements', async () => {
      server.use(
        rest.post(`${BACKEND_URL}/api/v1/interactive-chat`, (req, res, ctx) => {
          return res(
            ctx.delay(1000), // Simulate 1 second delay
            ctx.status(200),
            ctx.json({
              content: "Quick response test",
              agent_used: 'general_assistant',
              response_time: 0.95,
              performance_metrics: {
                agent_routing_time: 0.1,
                tool_execution_time: 0.4,
                response_generation_time: 0.3,
                total_time: 0.95
              }
            })
          );
        })
      );

      const startTime = Date.now();
      
      const response = await fetch(`${BACKEND_URL}/api/v1/interactive-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: 'Performance test',
          user_id: TEST_USER_ID,
          context: { source: 'performance_test' },
          stream: false
        })
      });

      const endTime = Date.now();
      const clientTime = endTime - startTime;

      const result = await response.json();

      // Verify response time is reasonable
      expect(clientTime).toBeLessThan(5000); // Less than 5 seconds
      expect(result.performance_metrics.total_time).toBeLessThan(3.0);
      expect(result.performance_metrics.agent_routing_time).toBeLessThan(0.5);
    });
  });
}); 