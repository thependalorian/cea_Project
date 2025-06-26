import createClient from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

type Conversation = Database['public']['Tables']['conversations']['Row']
type ConversationInsert = Database['public']['Tables']['conversations']['Insert']

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get conversations for the current user
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(conversations)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, conversation_type } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    // Generate conversation ID (in a real app, this could be handled by the backend)
    const conversationId = crypto.randomUUID()
    const timestamp = new Date().toISOString()

    const conversationData: ConversationInsert = {
      id: conversationId,
      user_id: user.id,
      title,
      description: description || null,
      conversation_type: conversation_type || 'general',
      created_at: timestamp,
      updated_at: timestamp,
      last_activity: timestamp
    }

    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert(conversationData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(conversation, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 