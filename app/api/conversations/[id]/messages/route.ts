import createClient from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/supabase'

type Message = Database['public']['Tables']['conversation_messages']['Row']
type MessageInsert = Database['public']['Tables']['conversation_messages']['Insert']

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // First, verify the conversation belongs to the user
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (convError || !conversation || conversation.user_id !== user.id) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Get messages for the conversation
    const { data: messages, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('conversation_id', params.id)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { role, content, agent_id } = body

    if (!role || !content) {
      return NextResponse.json(
        { error: 'Role and content are required' },
        { status: 400 }
      )
    }

    // Verify the conversation belongs to the user
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('user_id')
      .eq('id', params.id)
      .single()

    if (convError || !conversation || conversation.user_id !== user.id) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const messageData: MessageInsert = {
      id: crypto.randomUUID(),
      conversation_id: params.id,
      role,
      content,
      agent_id: agent_id || null,
      created_at: new Date().toISOString(),
      metadata: {}
    }

    const { data: message, error } = await supabase
      .from('conversation_messages')
      .insert(messageData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 