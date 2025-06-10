/**
 * Resume Download API - Generate signed URLs for resume files
 * Location: app/api/v1/resumes/[id]/download/route.ts
 */

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get the resume record to verify ownership and get file path
    const { data: resume, error: fetchError } = await supabase
      .from('resumes')
      .select('file_path, file_name, content_type')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }
      console.error('Resume fetch error:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch resume' }, { status: 500 });
    }

    if (!resume.file_path) {
      return NextResponse.json({ error: 'Resume file not found' }, { status: 404 });
    }

    // Generate signed URL for download (expires in 1 hour)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('resumes')
      .createSignedUrl(resume.file_path, 3600); // 1 hour expiry

    if (urlError) {
      console.error('Signed URL generation error:', urlError);
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
    }

    return NextResponse.json({
      download_url: signedUrlData.signedUrl,
      file_name: resume.file_name,
      content_type: resume.content_type,
      expires_in: 3600 // seconds
    });

  } catch (error) {
    console.error('Resume download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 