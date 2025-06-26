/**
 * Conversations listing page with database integration
 * Purpose: Display list of user conversations from database
 * Location: /app/dashboard/conversations/page.tsx
 */
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ConversationList } from '@/components/conversation/ConversationList'
import { BrandFrame } from '@/components/brand/BrandFrame'
import type { SimpleConversation } from '@/hooks/useDatabase'

export default function ConversationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check authentication and fetch user ID
  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setUserId(user?.id || '')
      setLoading(false)
    }
    getUser()
  }, [])

  const handleSelectConversation = (conversation: SimpleConversation) => {
    router.push(`/dashboard/conversations/${conversation.id}`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--sand-gray-20)] rounded-lg w-1/4" />
          <div className="h-64 bg-[var(--sand-gray-20)] rounded-lg" />
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <BrandFrame size="md" color="moss-green">
          <div className="text-center p-6">
            <h2 className="text-h2 font-title-medium text-[var(--midnight-forest)] mb-2">
              Error Loading Conversations
            </h2>
            <p className="text-body text-[var(--moss-green)] mb-6">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[var(--spring-green)] text-[var(--midnight-forest)] rounded-lg font-body-semibold"
            >
              Try Again
            </button>
          </div>
        </BrandFrame>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-h1 font-title-medium text-[var(--midnight-forest)] mb-6">
        Your Conversations
      </h1>
      
      {userId && (
        <ConversationList 
          userId={userId} 
          onSelectConversation={handleSelectConversation} 
        />
      )}
    </div>
  )
} 