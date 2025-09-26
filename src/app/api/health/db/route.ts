import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection without modifying data
    await prisma.$connect();
    
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Check if main tables exist
    const tableCheck = await prisma.$queryRaw`
      SELECT COUNT(*) as table_count
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      test_query: result,
      tables: tableCheck
    });

  } catch (error: any) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
    
  } finally {
    await prisma.$disconnect();
  }
}
