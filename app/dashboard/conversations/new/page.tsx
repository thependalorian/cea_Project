/**
 * New conversation page - Production ready
 * Purpose: Create new conversations with proper database integration
 * Location: /app/dashboard/conversations/new/page.tsx
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrandFrame } from '@/components/brand/BrandFrame'
import { supabase } from '@/lib/supabase'
import createClient from '@/lib/supabase/client'

export default function NewConversationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    conversation_type: 'general'
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setCreating(true)
    setError(null)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Please sign in to create a conversation')
      }
      
      const conversationId = crypto.randomUUID()
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          id: conversationId,
          user_id: user.id,
          title: formData.title || 'Untitled Conversation',
          description: formData.description,
          conversation_type: formData.conversation_type,
          status: 'active',
          message_count: 0,
          total_tokens_used: 0,
          session_metadata: {},
          last_activity: now,
          created_at: now,
          updated_at: now
        })
        .select()
        .single()
      
      if (error) throw error
      
      router.push(`/dashboard/conversations/${conversationId}`)
    } catch (err) {
      console.error('Conversation creation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create conversation')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-h1 font-title-medium text-[var(--midnight-forest)] mb-6">
        Start a New Conversation
      </h1>
      
      <BrandFrame size="md" color="spring-green">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-body font-body-medium text-[var(--midnight-forest)] mb-2">
              Conversation Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="w-full p-3 border-2 border-[var(--sand-gray)] rounded-lg 
                        focus:border-[var(--spring-green)] focus:outline-none
                        font-body text-body text-[var(--midnight-forest)]"
              placeholder="E.g., Career Transition Discussion"
            />
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/conversations')}
              className="px-6 py-3 border border-[var(--moss-green)] text-[var(--moss-green)] 
                       rounded-lg font-body-medium hover:bg-[var(--sand-gray-10)]
                       transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-[var(--spring-green)] text-[var(--midnight-forest)] 
                       rounded-lg font-body-semibold hover:bg-[var(--spring-green-90)]
                       transition-colors"
            >
              Start Conversation
            </button>
          </div>
        </form>
      </BrandFrame>
    </div>
  )
} 