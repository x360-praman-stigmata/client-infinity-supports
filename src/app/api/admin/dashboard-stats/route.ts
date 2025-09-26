import { prisma, testConnection } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { startOfMonth } from 'date-fns';

export async function GET(request: Request) {
  try {
    // Test connection first with retry
    console.log('🔄 Testing database connection for dashboard stats...');
    const isConnected = await testConnection(3);
    
    if (!isConnected) {
      console.error('❌ Database connection failed for dashboard stats');
      return NextResponse.json(
        { 
          error: 'Database connection failed. Please check your database server.',
          timestamp: new Date().toISOString(),
          // Return default values when DB is unavailable
          totalClients: 0,
          newClientsThisMonth: 0,
          completedForms: 0,
          notStarted: 0,
          formsInProgress: 0,
          signatureRequests: 0,
          completedSignatures: 0,
          isOffline: true
        },
        { status: 503 }
      );
    }

    console.log('✅ Database connected, fetching dashboard stats...');

    const totalClients = await prisma.client.count();

    const newClientsThisMonth = await prisma.client.count({
      where: {
        createdAt: {
          gte: startOfMonth(new Date())
        }
      }
    });

    const completedForms = await prisma.formAssignment.count({
      where: {
        currentStatus: 'completed'
      }
    });

    const notStarted = await prisma.formAssignment.count({
      where: {
        currentStatus: 'not_started'
      }
    });

    const formsInProgress = await prisma.formAssignment.count({
      where: {
        currentStatus: 'in_progress'
      }
    });

    const signatureRequests = await prisma.formSubmission.count({
      where: {
        OR: [
          { clientSignature: null },
          { clientSignature: "" }
        ],
        form: {
          requiresSignature: true
        }
      }
    });

    const completedSignatures = await prisma.formSubmission.count({
      where: {
        OR: [
          { clientSignature: { not: null } },
          { clientSignature: { not: "" } }
        ],
        form: {
          requiresSignature: true
        }
      }
    });

    console.log('✅ Dashboard stats fetched successfully');

    return NextResponse.json({
      totalClients,
      newClientsThisMonth,
      completedForms,
      notStarted,
      formsInProgress,
      signatureRequests,
      completedSignatures,
      timestamp: new Date().toISOString(),
      isOffline: false
    });

  } catch (error: any) {
    console.error("Dashboard stats fetch error:", error);
    
    // Return graceful error response with default values
    return NextResponse.json({
      error: 'Failed to fetch dashboard stats.',
      message: error.message,
      timestamp: new Date().toISOString(),
      // Provide default values so UI doesn't break
      totalClients: 0,
      newClientsThisMonth: 0,
      completedForms: 0,
      notStarted: 0,
      formsInProgress: 0,
      signatureRequests: 0,
      completedSignatures: 0,
      isOffline: true
    }, { status: 500 });
  }
}
