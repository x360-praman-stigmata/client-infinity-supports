import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; formType: string }> }
) {
  try {
    const { id, formType } = await params;
    const staffId = parseInt(id);

    if (!staffId || !formType) {
      return new NextResponse("Missing staffId or formType", { status: 400 });
    }

    // Get staff info
    const staff = await (prisma as any).staff.findUnique({
      where: { id: staffId },
      select: { id: true, firstName: true, surname: true, email: true }
    });

    if (!staff) {
      return new NextResponse("Staff not found", { status: 404 });
    }

    // For now, return a simple message that PDF generation is not yet implemented
    // In a full implementation, you would:
    // 1. Fetch the form data (similar to the GET route)
    // 2. Generate PDF using puppeteer or similar
    // 3. Return the PDF as a blob

    return new NextResponse("PDF generation not yet implemented for individual forms", { 
      status: 501,
      headers: { 'Content-Type': 'text/plain' }
    });

  } catch (error: any) {
    console.error("Error generating PDF:", error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
