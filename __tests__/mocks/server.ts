/**
 * MSW Server Setup for Testing
 * Climate Economy Assistant - API Mocking
 */

import { setupServer } from 'msw/node';
import { rest } from 'msw';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// Default handlers for common endpoints
export const handlers = [
  // Health check endpoint
  rest.get(`${BACKEND_URL}/health`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      })
    );
  }),

  // Interactive chat endpoint - default success response
  rest.post(`${BACKEND_URL}/api/v1/interactive-chat`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        content: "Hello! I'm here to help you explore climate career opportunities.",
        agent_used: 'general_assistant',
        tools_called: [],
        reasoning_trace: ['Processed user query', 'Generated response'],
        metadata: {
          response_time: 1.2,
          confidence_score: 0.9
        }
      })
    );
  }),

  // Resume analysis endpoint
  rest.post(`${BACKEND_URL}/api/v1/resume`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        content: "I've analyzed your resume and found several transferable skills for climate careers.",
        agent_used: 'jasmine_resume_specialist',
        tools_called: ['resume_parser', 'skills_extractor'],
        analysis: {
          skills_identified: ['project management', 'data analysis', 'communication'],
          climate_relevance_score: 0.78,
          recommendations: [
            'Consider renewable energy project management roles',
            'Explore sustainability consulting opportunities'
          ]
        }
      })
    );
  }),

  // Chat streaming endpoint
  rest.post(`${BACKEND_URL}/api/v1/chat`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: "Chat response from backend",
        conversation_id: "test-conversation-123",
        timestamp: new Date().toISOString()
      })
    );
  })
];

// Create the server instance
export const server = setupServer(...handlers); 