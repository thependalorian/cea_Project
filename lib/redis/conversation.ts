/**
 * Simplified Redis Conversation Manager - Climate Economy Assistant
 * Handles conversation storage with Redis + Supabase dual architecture
 * Focused on RLHF and basic analytics for admin
 * Location: lib/redis/conversation.ts
 */

import redisClient from './client';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

// ========================================
// INTERFACES
// ========================================

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  conversation_type: 'general' | 'career_guidance' | 'job_search' | 'resume_analysis' | 'skill_development' | 'recommendations';
  status: 'active' | 'completed';
  messages: ConversationMessage[];
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface MessageFeedback {
  id: string;
  conversation_id: string;
  message_id: string;
  user_id: string;
  feedback_type: 'helpful' | 'not_helpful' | 'correction' | 'flag';
  rating?: number;
  comment?: string;
  correction?: string;
  created_at: string;
}

// ========================================
// CONVERSATION MANAGER
// ========================================

export class ConversationManager {
  private readonly CONVERSATION_PREFIX = 'conv:';
  private readonly MESSAGE_PREFIX = 'msg:';
  private readonly FEEDBACK_PREFIX = 'fb:';
  private readonly TTL = 60 * 60 * 24 * 7; // 7 days Redis TTL

  // ========================================
  // CONVERSATION MANAGEMENT
  // ========================================

  async createConversation(
    userId: string,
    conversationType: Conversation['conversation_type'] = 'general',
    title?: string
  ): Promise<string> {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const conversation: Conversation = {
      id: conversationId,
      user_id: userId,
      title,
      conversation_type: conversationType,
      status: 'active',
      messages: [],
      message_count: 0,
      created_at: now,
      updated_at: now
    };

    // Store in Redis
    await redisClient.setex(
      `${this.CONVERSATION_PREFIX}${conversationId}`,
      this.TTL,
      JSON.stringify(conversation)
    );

    // Store in Supabase for long-term persistence
    await supabase.from('conversations').insert({
      id: conversationId,
      user_id: userId,
      title,
      conversation_type: conversationType,
      status: 'active',
      message_count: 0,
      created_at: now,
      updated_at: now
    });

    return conversationId;
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    try {
      // Try Redis first
      const redisData = await redisClient.get(`${this.CONVERSATION_PREFIX}${conversationId}`);
      
      if (redisData) {
        return JSON.parse(redisData);
      }

      // Fallback to Supabase
      const { data: conversation } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (!conversation) return null;

      // Get messages from Supabase
      const { data: messages } = await supabase
        .from('conversation_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      const fullConversation: Conversation = {
        ...conversation,
        messages: messages || []
      };

      // Cache in Redis
      await redisClient.setex(
        `${this.CONVERSATION_PREFIX}${conversationId}`,
        this.TTL,
        JSON.stringify(fullConversation)
      );

      return fullConversation;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  async getUserConversations(userId: string, limit: number = 20): Promise<Conversation[]> {
    try {
      const { data: conversations } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(limit);

      return conversations || [];
    } catch (error) {
      console.error('Error getting user conversations:', error);
      return [];
    }
  }

  // ========================================
  // MESSAGE MANAGEMENT
  // ========================================

  async addMessage(
    conversationId: string,
    role: ConversationMessage['role'],
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<string> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const message: ConversationMessage = {
      id: messageId,
      role,
      content,
      metadata,
      created_at: now
    };

    // Get conversation from Redis/Supabase
    const conversation = await this.getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Add message to conversation
    conversation.messages.push(message);
    conversation.message_count = conversation.messages.length;
    conversation.updated_at = now;

    // Update Redis
    await redisClient.setex(
      `${this.CONVERSATION_PREFIX}${conversationId}`,
      this.TTL,
      JSON.stringify(conversation)
    );

    // Store message in Supabase
    await supabase.from('conversation_messages').insert({
      id: messageId,
      conversation_id: conversationId,
      role,
      content,
      metadata,
      created_at: now
    });

    return messageId;
  }

  async getConversationMessages(conversationId: string): Promise<ConversationMessage[]> {
    const conversation = await this.getConversation(conversationId);
    return conversation?.messages || [];
  }

  // ========================================
  // FEEDBACK MANAGEMENT (RLHF)
  // ========================================

  async addFeedback(
    conversationId: string,
    messageId: string,
    userId: string,
    feedback: Omit<MessageFeedback, 'id' | 'conversation_id' | 'message_id' | 'user_id' | 'created_at'>
  ): Promise<string> {
    const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const feedbackRecord: MessageFeedback = {
      id: feedbackId,
      conversation_id: conversationId,
      message_id: messageId,
      user_id: userId,
      ...feedback,
      created_at: now
    };

    // Store in Redis with short TTL
    await redisClient.setex(
      `${this.FEEDBACK_PREFIX}${feedbackId}`,
      60 * 60 * 24, // 1 day
      JSON.stringify(feedbackRecord)
    );

    // Store in Supabase for RLHF training
    await supabase.from('message_feedback').insert({
      id: feedbackId,
      conversation_id: conversationId,
      message_id: messageId,
      user_id: userId,
      feedback_type: feedback.feedback_type,
      rating: feedback.rating,
      comment: feedback.comment,
      correction: feedback.correction,
      created_at: now
    });

    return feedbackId;
  }

  async getMessageFeedback(messageId: string): Promise<MessageFeedback[]> {
    try {
      const { data: feedback } = await supabase
        .from('message_feedback')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: false });

      return feedback || [];
    } catch (error) {
      console.error('Error getting message feedback:', error);
      return [];
    }
  }

  // ========================================
  // ADMIN ANALYTICS
  // ========================================

  async getFeedbackAnalytics(): Promise<Record<string, unknown> | null> {
    try {
      const { data, error } = await supabase.rpc('get_feedback_analytics');
      
      if (error) {
        console.error('Error getting feedback analytics:', error);
        return null;
      }

      return (data?.[0] as Record<string, unknown>) || null;
    } catch (error) {
      console.error('Error calling feedback analytics function:', error);
      return null;
    }
  }

  async getConversationTypeAnalytics(): Promise<Record<string, unknown>[]> {
    try {
      const { data, error } = await supabase.rpc('get_conversation_type_analytics');
      
      if (error) {
        console.error('Error getting conversation type analytics:', error);
        return [];
      }

      return (data as Record<string, unknown>[]) || [];
    } catch (error) {
      console.error('Error calling conversation type analytics function:', error);
      return [];
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  async syncConversationToSupabase(conversationId: string): Promise<void> {
    try {
      const conversation = await this.getConversation(conversationId);
      if (!conversation) return;

      // Update conversation metadata
      await supabase
        .from('conversations')
        .update({
          title: conversation.title,
          status: conversation.status,
          message_count: conversation.message_count,
          updated_at: conversation.updated_at
        })
        .eq('id', conversationId);

      // Sync any new messages
      for (const message of conversation.messages) {
        await supabase
          .from('conversation_messages')
          .upsert({
            id: message.id,
            conversation_id: conversationId,
            role: message.role,
            content: message.content,
            metadata: message.metadata,
            created_at: message.created_at
          }, { onConflict: 'id' });
      }
    } catch (error) {
      console.error('Error syncing conversation to Supabase:', error);
    }
  }

  async completeConversation(conversationId: string): Promise<void> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) return;

    conversation.status = 'completed';
    conversation.updated_at = new Date().toISOString();

    // Update Redis
    await redisClient.setex(
      `${this.CONVERSATION_PREFIX}${conversationId}`,
      this.TTL,
      JSON.stringify(conversation)
    );

    // Update Supabase
    await supabase
      .from('conversations')
      .update({ 
        status: 'completed',
        updated_at: conversation.updated_at
      })
      .eq('id', conversationId);
  }

  // ========================================
  // SESSION CLEANUP
  // ========================================

  async cleanupExpiredSessions(): Promise<number> {
    let cleaned = 0;
    try {
      const keys = await redisClient.keys(`${this.CONVERSATION_PREFIX}*`);
      
      for (const key of keys) {
        const ttl = await redisClient.ttl(key);
        if (ttl === -1 || ttl < 3600) { // Less than 1 hour TTL
          await redisClient.del(key);
          cleaned++;
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
    
    return cleaned;
  }
}

// Export singleton instance
export const conversationManager = new ConversationManager(); 