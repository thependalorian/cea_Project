import type { ChatMessage, Feedback, Interrupt, ChatResponse } from '@/types/chat'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl
  }

  async post<T>(endpoint: string, data: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'An error occurred')
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'An error occurred')
    }

    return response.json()
  }

  // v1 API methods
  async postV1<T>(endpoint: string, data: Record<string, unknown> | object): Promise<T> {
    return this.post(`/v1${endpoint}`, data as Record<string, unknown>)
  }

  async getV1<T>(endpoint: string): Promise<T> {
    return this.get(`/v1${endpoint}`)
  }

  // Streaming v1 API method
  async streamV1(endpoint: string, data: Record<string, unknown>): Promise<ReadableStream> {
    const response = await fetch(`${this.baseUrl}/v1${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...data, stream: true }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Streaming request failed')
    }

    if (!response.body) {
      throw new Error('Response body is not available for streaming')
    }

    return response.body
  }

  // Specific v1 endpoint methods for type safety
  async interactiveChat(data: {
    query: string;
    user_id?: string;
    conversation_id?: string;
    is_human?: boolean;
    specialist_type?: string;
    status?: string;
    metadata?: Record<string, unknown>;
    context?: unknown;
    stream?: boolean;
  }): Promise<ChatResponse | ReadableStream> {
    if (data.stream) {
      return this.streamV1('/interactive-chat', data);
    }
    return this.postV1('/interactive-chat', data)
  }

  // NEW: Supervisor Chat with enhanced workflow capabilities
  async supervisorChat(data: {
    message: string;
    conversation_id?: string;
    context?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    stream?: boolean;
  }): Promise<ChatResponse | ReadableStream> {
    if (data.stream) {
      return this.streamV1('/supervisor-chat', data);
    }
    return this.postV1('/supervisor-chat', data)
  }

  async resumeAnalysis(data: {
    user_id: string;
    analysis_type?: string;
    include_social_data?: boolean;
    stream?: boolean;
  }) {
    if (data.stream) {
      return this.streamV1('/resume-analysis', data)
    }
    return this.postV1('/resume-analysis', data)
  }

  async careerSearch(data: {
    query: string;
    user_id?: string;
    include_resume_context?: boolean;
    search_scope?: string;
    stream?: boolean;
  }) {
    if (data.stream) {
      return this.streamV1('/career-search', data)
    }
    return this.postV1('/career-search', data)
  }

  async careerAgent(data: {
    query: string;
    user_id?: string;
    session_id?: string;
    include_resume_context?: boolean;
    search_scope?: string;
    stream?: boolean;
  }) {
    if (data.stream) {
      return this.streamV1('/career-agent', data)
    }
    return this.postV1('/career-agent', data)
  }

  async sendFeedback(feedback: Feedback) {
    return this.postV1('/conversation-feedback', feedback)
  }

  async createInterrupt(interrupt: Interrupt) {
    return this.postV1('/conversation-interrupt', interrupt)
  }

  async logResourceView(data: {
    user_id: string;
    resource_id: string;
    resource_type: string;
    session_id?: string;
    referrer?: string;
    interaction_metadata?: Record<string, unknown>;
  }) {
    return this.postV1('/log-resource-view', data)
  }

  async humanFeedback(data: {
    session_id: string;
    response: unknown;
    action?: string;
    user_id?: string;
    message_id?: string;
    feedback_type?: string;
    correction?: string;
    rating?: number;
    metadata?: Record<string, unknown>;
  }) {
    return this.postV1('/human-feedback', data)
  }

  async getWorkflowStatus(sessionId: string) {
    return this.getV1(`/workflow-status/${sessionId}`)
  }

  async healthCheck() {
    return this.getV1('/health')
  }
}

export const apiClient = new ApiClient() 