/**
 * Edge API Integration Utilities
 * Provides TypeScript interfaces and functions for all deployed edge functions
 */

const EDGE_FUNCTION_BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL + '/functions/v1';

export interface AgentRoutingRequest {
  message: string;
  user_id?: string;
  context?: {
    veteran_status?: boolean;
    international_status?: boolean;
    resume_context?: boolean;
    [key: string]: any;
  };
  location?: string;
}

export interface AgentMatch {
  agent_id: string;
  agent_name: string;
  confidence: number;
  specialization: string[];
  reasoning: string;
}

export interface ResumeProcessingRequest {
  resume_id: string;
  user_id: string;
  file_content?: string;
  file_type: 'pdf' | 'docx' | 'txt';
  processing_priority?: 'low' | 'medium' | 'high';
}

export interface RecommendationRequest {
  user_id: string;
  context: {
    current_skills?: string[];
    target_roles?: string[];
    location?: string;
    experience_level?: 'entry' | 'mid' | 'senior';
    veteran_status?: boolean;
    international_status?: boolean;
    climate_interests?: string[];
  };
  recommendation_type: 'jobs' | 'skills' | 'training' | 'networking' | 'all';
  limit?: number;
}

export interface AnalyticsEvent {
  event_type: 'user_interaction' | 'agent_routing' | 'resume_upload' | 'job_search' | 'recommendation_click';
  user_id?: string;
  session_id: string;
  agent_id?: string;
  metadata: Record<string, any>;
  timestamp?: string;
  location?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface CacheRequest {
  cache_key: string;
  data?: any;
  operation: 'get' | 'set' | 'invalidate' | 'stats';
  ttl?: number;
  tags?: string[];
  user_context?: {
    user_id?: string;
    location?: string;
    experience_level?: string;
    preferences?: Record<string, any>;
  };
}

/**
 * Edge API class for all edge function interactions
 */
export class EdgeAPI {
  private static async makeRequest(endpoint: string, data: any) {
    const response = await fetch(`${EDGE_FUNCTION_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Edge function ${endpoint} failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Route user messages to appropriate specialist agents
   * Ultra-fast semantic analysis with confidence scoring
   */
  static async routeToAgent(request: AgentRoutingRequest): Promise<{
    success: boolean;
    agent_match: AgentMatch;
    processing_time_ms: number;
    edge_processed: boolean;
  }> {
    return this.makeRequest('agent-router', request);
  }

  /**
   * Process resumes with climate career analysis
   * Real-time skills extraction and job matching
   */
  static async processResume(request: ResumeProcessingRequest): Promise<{
    success: boolean;
    analysis: {
      resume_id: string;
      climate_relevance_score: number;
      skills_extracted: string[];
      experience_level: string;
      recommendations: Array<{
        category: string;
        suggestion: string;
        priority: 'low' | 'medium' | 'high';
      }>;
      job_matches: Array<{
        job_title: string;
        match_score: number;
        reasoning: string;
      }>;
      processing_metadata: Record<string, any>;
    };
    edge_processed: boolean;
    next_steps: string[];
  }> {
    return this.makeRequest('resume-processor', request);
  }

  /**
   * Generate personalized recommendations
   * Multi-type recommendations with context awareness
   */
  static async getRecommendations(request: RecommendationRequest): Promise<{
    success: boolean;
    recommendations: Array<{
      id: string;
      type: 'job' | 'skill' | 'training' | 'network';
      title: string;
      description: string;
      relevance_score: number;
      reasoning: string;
      actionable_steps: string[];
      urgency: 'low' | 'medium' | 'high';
      estimated_time_investment?: string;
      cost_estimate?: string;
      metadata: Record<string, any>;
    }>;
    personalized_message: string;
    processing_metadata: Record<string, any>;
    next_steps: string[];
  }> {
    return this.makeRequest('recommendation-engine', request);
  }

  /**
   * Track analytics events with real-time insights
   * Engagement scoring and trend detection
   */
  static async trackAnalytics(event: AnalyticsEvent): Promise<{
    success: boolean;
    event_id: string;
    processed: boolean;
    insights: {
      user_engagement_score: number;
      agent_performance_metrics: Record<string, any>;
      trending_topics: string[];
      geographical_insights: Record<string, any>;
    };
    real_time_recommendations: string[];
    processing_metadata: Record<string, any>;
  }> {
    return this.makeRequest('realtime-analytics', event);
  }

  /**
   * Intelligent caching operations
   * Predictive warming and smart invalidation
   */
  static async cacheOperation(request: CacheRequest): Promise<{
    success: boolean;
    operation: string;
    cache_hit?: boolean;
    data?: any;
    source?: string;
    cached?: boolean;
    invalidated?: boolean;
    processing_metadata: Record<string, any>;
  }> {
    return this.makeRequest('intelligent-caching', request);
  }

  /**
   * Helper method to get cached data with fallback
   */
  static async getCachedData(key: string, userContext?: any, fallbackFn?: () => Promise<any>) {
    try {
      const cacheResult = await this.cacheOperation({
        cache_key: key,
        operation: 'get',
        user_context: userContext
      });

      if (cacheResult.cache_hit) {
        return {
          data: cacheResult.data,
          source: 'cache',
          hit: true
        };
      }

      // Cache miss - get fresh data if fallback provided
      if (fallbackFn) {
        const freshData = await fallbackFn();
        
        // Cache the fresh data
        await this.cacheOperation({
          cache_key: key,
          operation: 'set',
          data: freshData,
          ttl: 3600, // 1 hour
          tags: ['api_data'],
          user_context: userContext
        });

        return {
          data: freshData,
          source: 'api',
          hit: false
        };
      }

      return {
        data: null,
        source: 'miss',
        hit: false
      };
    } catch (error) {
      console.error('Cache operation failed:', error);
      
      // Fallback to direct API call
      if (fallbackFn) {
        return {
          data: await fallbackFn(),
          source: 'fallback',
          hit: false
        };
      }
      
      throw error;
    }
  }

  /**
   * Invalidate related cache entries by tags
   */
  static async invalidateCache(tags: string[]) {
    return this.cacheOperation({
      cache_key: '',
      operation: 'invalidate',
      tags
    });
  }

  /**
   * Get cache performance statistics
   */
  static async getCacheStats() {
    return this.cacheOperation({
      cache_key: 'stats',
      operation: 'stats'
    });
  }
}

/**
 * React hooks for edge function integration
 */
export const useEdgeAPI = () => {
  return {
    routeToAgent: EdgeAPI.routeToAgent,
    processResume: EdgeAPI.processResume,
    getRecommendations: EdgeAPI.getRecommendations,
    trackAnalytics: EdgeAPI.trackAnalytics,
    getCachedData: EdgeAPI.getCachedData,
    invalidateCache: EdgeAPI.invalidateCache,
    getCacheStats: EdgeAPI.getCacheStats
  };
};

/**
 * Utility function to generate session IDs for analytics
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Utility function to detect user location for geographical insights
 */
export const getUserLocation = async (): Promise<{ country?: string; region?: string; city?: string }> => {
  try {
    // Use IP geolocation service (you can replace with your preferred service)
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return {
      country: data.country_name,
      region: data.region,
      city: data.city
    };
  } catch (error) {
    console.warn('Could not detect user location:', error);
    return {};
  }
};

/**
 * Type guards for edge function responses
 */
export const isAgentRoutingResponse = (response: any): response is { agent_match: AgentMatch } => {
  return response && response.agent_match && typeof response.agent_match.agent_id === 'string';
};

export const isResumeProcessingResponse = (response: any): response is { analysis: any } => {
  return response && response.analysis && typeof response.analysis.climate_relevance_score === 'number';
};

export const isRecommendationResponse = (response: any): response is { recommendations: any[] } => {
  return response && Array.isArray(response.recommendations);
};

/**
 * Error handling utilities
 */
export class EdgeAPIError extends Error {
  constructor(
    message: string,
    public endpoint: string,
    public status?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'EdgeAPIError';
  }
}

/**
 * Development utilities for testing edge functions
 */
export const EdgeDevTools = {
  /**
   * Test all edge functions with sample data
   */
  async testAllFunctions() {
    console.log('🧪 Testing Edge Functions...');

    try {
      // Test agent routing
      const agentResult = await EdgeAPI.routeToAgent({
        message: "I need help with renewable energy career opportunities",
        user_id: "test_user",
        context: { veteran_status: true }
      });
      console.log('✅ Agent Router:', agentResult.agent_match.agent_id);

      // Test resume processing
      const resumeResult = await EdgeAPI.processResume({
        resume_id: "test_resume",
        user_id: "test_user",
        file_type: "pdf"
      });
      console.log('✅ Resume Processor:', resumeResult.analysis.climate_relevance_score);

      // Test recommendations
      const recsResult = await EdgeAPI.getRecommendations({
        user_id: "test_user",
        context: {
          experience_level: "mid",
          location: "Massachusetts",
          current_skills: ["python", "sustainability"]
        },
        recommendation_type: "all"
      });
      console.log('✅ Recommendations:', recsResult.recommendations.length);

      // Test analytics
      const analyticsResult = await EdgeAPI.trackAnalytics({
        event_type: "job_search",
        session_id: generateSessionId(),
        metadata: { query: "climate jobs" }
      });
      console.log('✅ Analytics:', analyticsResult.insights.user_engagement_score);

      // Test caching
      const cacheResult = await EdgeAPI.getCacheStats();
      console.log('✅ Cache Stats:', cacheResult);

      console.log('🎉 All edge functions working correctly!');
    } catch (error) {
      console.error('❌ Edge function test failed:', error);
    }
  }
}; 