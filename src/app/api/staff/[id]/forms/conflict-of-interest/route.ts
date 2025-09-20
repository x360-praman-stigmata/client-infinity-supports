import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const staffId = parseInt(params.id);
    
    const db: any = prisma as any;
    const staff = await db.staff.findUnique({
      where: { id: staffId },
      select: { id: true, firstName: true, surname: true, email: true }
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    const conflictOfInterest = await db.staffConflictOfInterest.findUnique({
      where: { staffId }
    });

    if (!conflictOfInterest) {
      return NextResponse.json({ error: 'Conflict of interest form not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...conflictOfInterest,
      staff
    });
  } catch (error: any) {
    console.error('Error fetching conflict of interest form:', error);
    return NextResponse.json({ error: 'Failed to fetch conflict of interest form' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const staffId = parseInt(params.id);
    const body = await req.json();
    
    const db: any = prisma as any;
    
    // Validate staff exists
    const staff = await db.staff.findUnique({
      where: { id: staffId },
      select: { id: true, firstName: true, surname: true, email: true }
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Get form data
    const { data, staffSignature } = body;
    
    if (!data) {
      return NextResponse.json({ error: 'Form data is required' }, { status: 400 });
    }

    // Upsert the conflict of interest form
    const conflictOfInterest = await db.staffConflictOfInterest.upsert({
      where: { staffId },
      update: {
        data,
        staffSignature: staffSignature || null,
        staffSignedAt: staffSignature ? new Date() : null,
        updatedAt: new Date()
      },
      create: {
        staffId,
        data,
        staffSignature: staffSignature || null,
        staffSignedAt: staffSignature ? new Date() : null
      }
    });

    return NextResponse.json({
      success: true,
      conflictOfInterest,
      staff
    });
  } catch (error: any) {
    console.error('Error saving conflict of interest form:', error);
    return NextResponse.json({ error: 'Failed to save conflict of interest form' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const staffId = parseInt(params.id);
    const body = await req.json();
    
    const db: any = prisma as any;
    
    // Validate staff exists
    const staff = await db.staff.findUnique({
      where: { id: staffId },
      select: { id: true, firstName: true, surname: true, email: true }
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Get form data
    const { data, staffSignature } = body;
    
    if (!data) {
      return NextResponse.json({ error: 'Form data is required' }, { status: 400 });
    }

    // Update the conflict of interest form
    const conflictOfInterest = await db.staffConflictOfInterest.update({
      where: { staffId },
      data: {
        data,
        staffSignature: staffSignature || null,
        staffSignedAt: staffSignature ? new Date() : null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      conflictOfInterest,
      staff
    });
  } catch (error: any) {
    console.error('Error updating conflict of interest form:', error);
    return NextResponse.json({ error: 'Failed to update conflict of interest form' }, { status: 500 });
  }
}