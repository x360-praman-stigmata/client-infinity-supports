import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const staffId = parseInt(id);
    
    if (!staffId) {
      return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 });
    }

    // Check if summary mode is requested (for faster initial load)
    const { searchParams } = new URL(req.url);
    const summaryMode = searchParams.get('summary') === 'true';

    // Get basic staff info
    const staff = await prisma.staff.findUnique({
      where: { id: staffId }
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Safe helper for optional tables
    const safe = async (fn: () => Promise<any>) => {
      try { 
        return await fn(); 
      } catch (e: any) { 
        if (e?.code === 'P2021') return null; 
        throw e; 
      }
    };

    // Helper to get only summary fields (metadata only, no full data)
    const getSummary = (data: any) => {
      if (!data) return null;
      return {
        id: data.id,
        staffId: data.staffId,
        staffSignedAt: data.staffSignedAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        isSubmitted: data.isSubmitted !== false // Default to true for specialized tables
      };
    };

    // Load all form data from specialized tables
    const [
      employmentDetails,
      employmentWelcomeAck,
      supportWorker,
      preEmploymentMedical,
      ndisWorkforceCapability,
      bullyingHarassmentTraining,
      bullyingTraining,
      ndisCodeOfConduct,
      conflictOfInterest,
      documentationAcknowledgement,
      vehicleSafetyInspection,
    ] = await Promise.all([
      safe(() => (prisma as any).staffEmploymentDetails.findUnique({ where: { staffId } })),
      safe(() => (prisma as any).staffEmploymentWelcomeAck.findUnique({ where: { staffId } })),
      safe(() => (prisma as any).staffSupportWorker.findUnique({ where: { staffId } })),
      safe(() => (prisma as any).staffPreEmploymentMedical.findUnique({ where: { staffId } })),
      safe(() => (prisma as any).staffNdisWorkforceCapability.findUnique({ where: { staffId } })),
      safe(() => (prisma as any).staffBullyingHarassmentTraining.findUnique({ where: { staffId } })),
      safe(() => (prisma as any).staffBullyingTraining?.findUnique({ where: { staffId } })),
      safe(() => (prisma as any).staffNdisCodeOfConduct?.findUnique({ where: { staffId } })),
      safe(() => (prisma as any).staffConflictOfInterest?.findUnique({ where: { staffId } })),
      safe(() => (prisma as any).staffDocumentationAcknowledgement?.findUnique({ where: { staffId } })),
      safe(() => (prisma as any).staffVehicleSafetyInspection?.findUnique({ where: { staffId } })),
    ]);

    // Load generic submissions for forms that use StaffFormSubmission
    const genericSubmissions = await (prisma as any).staffFormSubmission.findMany({
      where: { 
        staffId,
        isSubmitted: true 
      }
    });

    // Build submissions object matching the expected format
    const submissions: any = {};

    if (summaryMode) {
      // Return only metadata for fast initial load
      if (employmentDetails) submissions.employee_details = getSummary(employmentDetails);
      if (employmentWelcomeAck) submissions.employee_welcome = getSummary(employmentWelcomeAck);
      if (supportWorker) submissions.support_worker = getSummary(supportWorker);
      if (preEmploymentMedical) submissions.pre_employment_medical = getSummary(preEmploymentMedical);
      if (ndisWorkforceCapability) submissions.ndis_workforce_capability = getSummary(ndisWorkforceCapability);
      if (bullyingHarassmentTraining) submissions.bullying_harassment_training = getSummary(bullyingHarassmentTraining);
      if (bullyingTraining) submissions.bullying_training = getSummary(bullyingTraining);
      if (ndisCodeOfConduct) submissions.ndis_code_of_conduct = getSummary(ndisCodeOfConduct);
      if (conflictOfInterest) submissions.conflict_of_interest = getSummary(conflictOfInterest);
      if (documentationAcknowledgement) submissions.documentation_acknowledgement = getSummary(documentationAcknowledgement);
      if (vehicleSafetyInspection) submissions.vehicle_safety_inspection = getSummary(vehicleSafetyInspection);
      
      // Map generic submissions (summary only)
      genericSubmissions.forEach((submission: any) => {
        submissions[submission.formKey] = getSummary(submission);
      });
    } else {
      // Return full data (legacy behavior)
      if (employmentDetails) submissions.employee_details = employmentDetails;
      if (employmentWelcomeAck) submissions.employee_welcome = employmentWelcomeAck;
      if (supportWorker) submissions.support_worker = supportWorker;
      if (preEmploymentMedical) submissions.pre_employment_medical = preEmploymentMedical;
      if (ndisWorkforceCapability) submissions.ndis_workforce_capability = ndisWorkforceCapability;
      if (bullyingHarassmentTraining) submissions.bullying_harassment_training = bullyingHarassmentTraining;
      if (bullyingTraining) submissions.bullying_training = bullyingTraining;
      if (ndisCodeOfConduct) submissions.ndis_code_of_conduct = ndisCodeOfConduct;
      if (conflictOfInterest) submissions.conflict_of_interest = conflictOfInterest;
      if (documentationAcknowledgement) submissions.documentation_acknowledgement = documentationAcknowledgement;
      if (vehicleSafetyInspection) submissions.vehicle_safety_inspection = vehicleSafetyInspection;
      
      // Map generic submissions
      genericSubmissions.forEach((submission: any) => {
        submissions[submission.formKey] = submission;
      });
    }

    return NextResponse.json({
      staff,
      submissions
    });

  } catch (error: any) {
    console.error('Error loading admin view data:', error);
    return NextResponse.json({ 
      error: 'Failed to load staff data',
      details: error.message 
    }, { status: 500 });
  }
}
