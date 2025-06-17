import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      total_users: 1250,
      active_jobs: 85,
      partner_organizations: 42,
      pending_approvals: 7,
      system_health: 98,
      monthly_growth: 12,
      conversation_analytics: 3450,
      audit_logs: 1245,
      content_flags: 3,
      knowledge_resources: 156
    }
  });
}
