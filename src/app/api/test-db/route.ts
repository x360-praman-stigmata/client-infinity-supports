import { NextResponse } from 'next/server';
import { prisma, testConnection } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Test connection with retry
    const isConnected = await testConnection(3);
    
    if (!isConnected) {
      return NextResponse.json({
        status: 'failed',
        message: 'Could not connect to database',
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }

    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test, NOW() as current_time`;
    
    // Test if tables exist
    const tableCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    console.log('✅ Database connection successful');

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      test_query: result,
      table_count: tableCount,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Database test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error.message,
      error_code: error.code,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
