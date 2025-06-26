import createClient from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and Word documents are allowed.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(`${user.id}/${Date.now()}-${file.name}`, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Resume upload error:', error)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Create resume record in database
    const { error: dbError } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        file_path: data.path,
        file_name: file.name,
        file_type: file.type,
        status: 'pending_analysis'
      })

    if (dbError) {
      console.error('Error creating resume record:', dbError)
      // Delete the uploaded file if database insert fails
      await supabase.storage
        .from('resumes')
        .remove([data.path])
      
      return NextResponse.json(
        { error: 'Failed to process resume' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Resume uploaded successfully',
      file: data
    })
  } catch (error) {
    console.error('Resume upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    )
  }
} 