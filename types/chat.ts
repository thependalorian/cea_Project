export interface ChatUser {
  id: string;
  name: string;
}

export interface Feedback {
  id?: string;
  messageId: string;
  userId: string;
  feedbackType: 'thumbs_up' | 'thumbs_down' | 'correction' | 'flag';
  rating?: number;
  correction?: string;
  flagReason?: string;
  createdAt?: string;
  metadata?: Record<string, any>;
}

export interface Interrupt {
  id?: string;
  conversationId: string;
  type: string; // e.g. 'pause', 'review', 'correction', etc.
  status: 'pending' | 'resolved' | 'rejected';
  priority?: 'low' | 'medium' | 'high';
  resolution?: string;
  createdAt?: string;
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  user: ChatUser;
  sources?: string[] | null;
  error?: boolean;
  specialist_type?: string;
  is_human?: boolean;
  status?: 'pending' | 'pending_human' | 'completed' | 'interrupted' | 'corrected' | 'error';
  metadata?: Record<string, any>;
  feedback?: Feedback[];
  interrupt?: Interrupt;
}

export interface ResumeData {
  fileId?: string;
  userId?: string;
  fileName?: string;
  content?: string;
  url?: string;
  id?: string;
  file_name?: string;
  user_id?: string;
}

export interface ChatResponse {
  content: string;
  sources?: string[] | null;
  specialist_type?: string;
  is_human?: boolean;
  status?: string;
  metadata?: Record<string, any>;
  feedback?: Feedback[];
  interrupt?: Interrupt;
}

export interface ChatContext {
  type?: string;
  resume?: any;
  enhanced_search?: boolean;
} 