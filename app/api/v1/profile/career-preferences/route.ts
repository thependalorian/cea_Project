import { NextRequest, NextResponse } from 'next/server';

// GET endpoint to retrieve career preferences
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok', data: {} });
}

// PUT endpoint to update career preferences
export async function PUT(request: NextRequest) {
  return NextResponse.json({ status: 'ok', message: 'Preferences updated' });
}
