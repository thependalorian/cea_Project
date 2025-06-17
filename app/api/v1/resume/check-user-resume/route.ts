import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    hasResume: true,
    resumeData: {
      id: 'placeholder-id',
      fileName: 'resume.pdf',
      uploadedAt: new Date().toISOString(),
    }
  });
}
