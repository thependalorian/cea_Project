import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    data: {
      platformMetrics: {
        totalUsers: 1250,
        totalConversations: 3450,
        activeJobs: 85,
        totalPartners: 42,
        userGrowthRate: 12,
        conversationGrowthRate: 18,
        jobGrowthRate: 8,
        partnerGrowthRate: 5,
        avgResponseTime: 1.2,
        userSatisfactionScore: 4.8,
        platformUptime: 99.9
      },
      conversationAnalytics: {
        topTopics: [
          { topic: 'Solar Energy Jobs', count: 450, percentage: 18 },
          { topic: 'Wind Power Careers', count: 380, percentage: 15 },
          { topic: 'EV Manufacturing', count: 320, percentage: 13 },
          { topic: 'Energy Storage', count: 290, percentage: 12 },
          { topic: 'Green Building', count: 260, percentage: 10 }
        ]
      }
    }
  });
}
