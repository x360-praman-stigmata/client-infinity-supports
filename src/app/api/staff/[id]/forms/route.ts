import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const staffId = parseInt(id);
    
    const db: any = prisma as any;
    const staff = await db.staff.findUnique({
      where: { id: staffId },
      include: {
        employmentDetails: true,
        employmentWelcomeAck: true,
        supportWorker: true,
        preEmploymentMedical: true,
        ndisWorkforceCapability: true,
        bullyingHarassmentTraining: true,
      }
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    const forms = [
      {
        formType: 'employment-details',
        formName: 'Employment Details',
        status: staff.employmentDetails ? 'completed' : 'pending',
        completedAt: staff.employmentDetails?.createdAt?.toLocaleDateString(),
        hasSignature: !!staff.employmentDetails?.staffSignature
      },
      {
        formType: 'employment-welcome',
        formName: 'Employment Welcome Acknowledgment',
        status: staff.employmentWelcomeAck ? 'completed' : 'pending',
        completedAt: staff.employmentWelcomeAck?.createdAt?.toLocaleDateString(),
        hasSignature: !!staff.employmentWelcomeAck?.staffSignature
      },
      {
        formType: 'support-worker',
        formName: 'Support Worker Form',
        status: staff.supportWorker ? 'completed' : 'pending',
        completedAt: staff.supportWorker?.createdAt?.toLocaleDateString(),
        hasSignature: !!staff.supportWorker?.staffSignature
      },
      {
        formType: 'pre-employment-medical',
        formName: 'Pre-Employment Medical',
        status: staff.preEmploymentMedical ? 'completed' : 'pending',
        completedAt: staff.preEmploymentMedical?.createdAt?.toLocaleDateString(),
        hasSignature: !!staff.preEmploymentMedical?.staffSignature
      },
      {
        formType: 'ndis-workforce',
        formName: 'NDIS Workforce Capability',
        status: staff.ndisWorkforceCapability ? 'completed' : 'pending',
        completedAt: staff.ndisWorkforceCapability?.createdAt?.toLocaleDateString(),
        hasSignature: !!staff.ndisWorkforceCapability?.staffSignature
      },
      {
        formType: 'bullying-harassment',
        formName: 'Bullying & Harassment Training',
        status: staff.bullyingHarassmentTraining ? 'completed' : 'pending',
        completedAt: staff.bullyingHarassmentTraining?.createdAt?.toLocaleDateString(),
        hasSignature: !!staff.bullyingHarassmentTraining?.staffSignature
      }
    ];

    return NextResponse.json({ staff, forms });
  } catch (error: any) {
    console.error('Error fetching staff forms:', error);
    return NextResponse.json({ error: 'Failed to fetch staff forms' }, { status: 500 });
  }
}
