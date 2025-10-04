import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const staffId = parseInt(id);
    
    const db: any = prisma as any;

    // Fetch basic staff record
    const staff = await db.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Fetch the super choice form data from generic submissions
    const formSubmission = await db.staffFormSubmission.findFirst({
      where: { 
        staffId, 
        formKey: 'super_choice_form',
        isSubmitted: true 
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (!formSubmission) {
      return NextResponse.json({ error: 'Super Choice form not found or not submitted' }, { status: 404 });
    }

    // Parse the form data (use 'data' field from schema)
    const formData = formSubmission.data || {};
    

    return NextResponse.json({
      staff,
      ...formData,
      createdAt: formSubmission.createdAt,
      updatedAt: formSubmission.updatedAt,
      submittedAt: formSubmission.updatedAt
    });
  } catch (error: any) {
    console.error('Error fetching super choice form:', error);
    return NextResponse.json({ error: 'Failed to fetch super choice form' }, { status: 500 });
  }
}
