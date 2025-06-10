import { NextResponse } from 'next/server';
import { AnalyticsService } from '../../../act-brand-demo/lib/database';
import { supabase } from '../../../act-brand-demo/lib/database';

export async function GET() {
  try {
    console.log('🔗 Testing database connections...');
    
    // Test database connection
    const { data: testConnection, error: connectionError } = await supabase
      .from('climate_professionals')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('❌ Database connection failed:', connectionError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError.message
      }, { status: 500 });
    }
    
    console.log('✅ Database connection successful');
    
    return NextResponse.json({
      success: true,
      message: 'All database connections working properly',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 