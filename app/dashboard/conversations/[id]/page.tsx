/**
 * Conversation page component with database integration
 * Purpose: Display conversation interface with database hooks
 * Location: /app/dashboard/conversations/[id]/page.tsx
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import createClient from '@/lib/supabase/client'
import { BrandFrame } from '@/components/brand/BrandFrame'
import type { Database } from '@/types/supabase'

type Conversation = Database['public']['Tables']['conversations']['Row']

interface ConversationPageProps {
  params: {
    id: string
  }
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const { id } = params
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Check authentication and fetch user ID
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/auth/signin')
        return
      }
      
      setUserId(session.user.id)
    }
    
    checkAuth()
  }, [router])

  // Fetch conversation data
  useEffect(() => {
    async function fetchConversation() {
      if (!userId) return
      
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .single()

        if (error) throw error
        
        if (!data) {
          router.push('/dashboard/conversations')
          return
        }
        
        setConversation(data)
      } catch (err) {
        console.error('Error fetching conversation:', err)
        setError(err instanceof Error ? err.message : 'Failed to load conversation')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchConversation()
    }
  }, [id, userId, router])

  // Loading state
  if (loading || !userId) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl">
          <div className="h-8 bg-[var(--sand-gray-20)] rounded-lg w-1/2 mx-auto" />
          <div className="h-64 bg-[var(--sand-gray-20)] rounded-lg" />
        </div>
      </div>
    )
  }

  // Error state
  if (error || !conversation) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <BrandFrame size="md" color="moss-green">
          <div className="text-center p-6">
            <h2 className="text-h2 font-title-medium text-[var(--midnight-forest)] mb-2">
              Conversation Not Found
            </h2>
            <p className="text-body text-[var(--moss-green)] mb-6">
              {error || "This conversation doesn't exist or you don't have access to it."}
            </p>
            <button 
              onClick={() => router.push('/dashboard/conversations')}
              className="px-6 py-3 bg-[var(--spring-green)] text-[var(--midnight-forest)] rounded-lg font-body-semibold"
            >
              Back to Conversations
            </button>
          </div>
        </BrandFrame>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-[var(--sand-gray)]">
        <h1 className="text-h2 font-title-medium text-[var(--midnight-forest)]">
          {conversation.title || 'Untitled Conversation'}
        </h1>
        <p className="text-body text-[var(--moss-green)] mt-1">
          Type: {conversation.conversation_type || 'General'} • Created: {new Date(conversation.created_at).toLocaleDateString()}
        </p>
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="p-4">
          <p className="text-center text-gray-500">
            Conversation interface will be implemented here.
          </p>
        </div>
      </div>
    </div>
  )
} 