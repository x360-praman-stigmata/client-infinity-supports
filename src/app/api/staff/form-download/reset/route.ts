import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const staffId = searchParams.get('staffId');
    const formKey = searchParams.get('formKey');

    if (!staffId || !formKey) {
      return NextResponse.json({ error: 'Missing staffId or formKey' }, { status: 400 });
    }

    // Delete download record
    const deletedRecord = await prisma.staffFormDownload.deleteMany({
      where: {
        staffId: parseInt(staffId),
        formKey: formKey,
      },
    });

    return NextResponse.json({ 
      success: true, 
      deletedCount: deletedRecord.count,
      message: `Reset download status for staff ${staffId}, form ${formKey}`
    });
  } catch (error: any) {
    console.error('Error resetting download status:', error);
    return NextResponse.json({ error: 'Failed to reset download status', details: error.message }, { status: 500 });
  }
}
