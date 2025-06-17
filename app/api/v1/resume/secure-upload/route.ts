import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    message: 'Resume upload placeholder',
    resumeId: 'placeholder-id'
  });
}
