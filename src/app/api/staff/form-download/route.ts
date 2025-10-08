import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { staffId, formKey, pdfUrl } = await req.json();

    if (!staffId || !formKey || !pdfUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: staffId, formKey, pdfUrl' },
        { status: 400 }
      );
    }

    // Check if staff exists
    const staff = await prisma.staff.findUnique({
      where: { id: parseInt(staffId) }
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff not found' },
        { status: 404 }
      );
    }

    // Create or update download record
    const downloadRecord = await prisma.staffFormDownload.upsert({
      where: {
        staffId_formKey: {
          staffId: parseInt(staffId),
          formKey: formKey
        }
      },
      update: {
        downloadedAt: new Date()
      },
      create: {
        staffId: parseInt(staffId),
        formKey: formKey,
        downloadedAt: new Date()
      }
    });

    console.log('📥 Download tracked:', {
      staffId: parseInt(staffId),
      staffName: `${staff.firstName} ${staff.surname}`,
      formKey,
      downloadedAt: downloadRecord.downloadedAt
    });

    return NextResponse.json({
      success: true,
      message: 'Download tracked successfully',
      downloadRecord
    });

  } catch (error: any) {
    console.error('❌ Error tracking download:', error);
    return NextResponse.json(
      { error: 'Failed to track download', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get('staffId');
    const formKey = searchParams.get('formKey');

    if (!staffId || !formKey) {
      return NextResponse.json(
        { error: 'Missing required parameters: staffId, formKey' },
        { status: 400 }
      );
    }

    // Check if download exists
    const downloadRecord = await prisma.staffFormDownload.findUnique({
      where: {
        staffId_formKey: {
          staffId: parseInt(staffId),
          formKey: formKey
        }
      }
    });

    return NextResponse.json({
      hasDownloaded: !!downloadRecord,
      downloadedAt: downloadRecord?.downloadedAt || null
    });

  } catch (error: any) {
    console.error('❌ Error checking download status:', error);
    return NextResponse.json(
      { error: 'Failed to check download status', details: error.message },
      { status: 500 }
    );
  }
}

