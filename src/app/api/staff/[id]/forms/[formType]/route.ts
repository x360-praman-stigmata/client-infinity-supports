import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; formType: string }> }
) {
  try {
    const { id, formType } = await params;
    const staffId = parseInt(id);

    console.log(`[API] Request: staffId=${staffId}, formType=${formType}`);

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

    // Map form types
    const formKeyMap: Record<string, string> = {
      'employment-details': 'employeeDetails',
      'employment-welcome': 'employee_welcome', 
      'support-worker': 'support_worker',
      'pre-employment-medical': 'pre_employment_medical',
      'ndis-workforce': 'ndis_workforce_capability',
      'bullying-harassment': 'bullying_harassment_training',
      'bullying-training': 'bullying_training',
      'ndis-code-of-conduct': 'ndis_code_of_conduct',
      'fair-work-information': 'fair_work_information',
      'casual-employment-information': 'casual_employment_information',
      'orientation': 'orientation',
      'govt-tax': 'govt_tax',
      'super-choice-form': 'super_choice_form',
      'vehicle-safety-inspection': 'vehicle_safety_inspection',
      'conflict-of-interest': 'conflict_of_interest',
      'documentation-acknowledgement': 'documentation_acknowledgement'
    };

    const formKey = formKeyMap[formType] || formType;
    console.log(`[API] Mapped formType '${formType}' to formKey '${formKey}'`);

    let formData = null;

    // Try specialized tables first
    try {
      switch (formKey) {
        case 'employeeDetails':
          formData = await (prisma as any).staffEmploymentDetails.findUnique({ where: { staffId } });
          break;
        case 'employee_welcome':
          formData = await (prisma as any).staffEmploymentWelcomeAck.findUnique({ where: { staffId } });
          break;
        case 'support_worker':
          formData = await (prisma as any).staffSupportWorker.findUnique({ where: { staffId } });
          break;
        case 'pre_employment_medical':
          formData = await (prisma as any).staffPreEmploymentMedical.findUnique({ where: { staffId } });
          break;
        case 'ndis_workforce_capability':
          formData = await (prisma as any).staffNdisWorkforceCapability.findUnique({ where: { staffId } });
          break;
        case 'bullying_harassment_training':
          formData = await (prisma as any).staffBullyingHarassmentTraining.findUnique({ where: { staffId } });
          break;
        case 'bullying_training':
          formData = await (prisma as any).staffBullyingTraining.findUnique({ where: { staffId } });
          break;
        case 'ndis_code_of_conduct':
          formData = await (prisma as any).staffNdisCodeOfConduct.findUnique({ where: { staffId } });
          break;
        case 'conflict_of_interest':
          formData = await (prisma as any).staffConflictOfInterest.findUnique({ where: { staffId } });
          break;
        case 'documentation_acknowledgement':
          formData = await (prisma as any).staffDocumentationAcknowledgement.findUnique({ where: { staffId } });
          break;
        case 'vehicle_safety_inspection':
          formData = await (prisma as any).staffVehicleSafetyInspection.findUnique({ where: { staffId } });
          break;
      }
    } catch (error: any) {
      console.log(`[API] Specialized table query failed: ${error.message}`);
    }

    // If no specialized table, check generic submissions
    if (!formData) {
      console.log(`[API] No specialized table data, checking generic submissions for ${formKey}`);
      const genericSubmission = await (prisma as any).staffFormSubmission.findFirst({
        where: { staffId, formKey, isSubmitted: true },
        orderBy: { updatedAt: 'desc' }
      });
      if (genericSubmission) {
        formData = { data: genericSubmission.data };
        console.log(`[API] Found generic submission`);
      }
    }

    if (!formData) {
      console.log(`[API] No form data found for ${formKey}`);
      return new NextResponse("Form data not found", { status: 404 });
    }

    console.log(`[API] Raw formData keys:`, Object.keys(formData));

    // Extract actual form fields
    const actualFormFields = formData.data || {};
    
    // Add signature fields if they exist
    if (formData.staffSignature) {
      actualFormFields.employeeSignature = formData.staffSignature;
      actualFormFields.signature = formData.staffSignature;
      actualFormFields.staffSignature = formData.staffSignature;
      actualFormFields.employeeSignatureDate = formData.staffSignedAt?.toISOString().split('T')[0] || '';
      actualFormFields.signatureDate = formData.staffSignedAt?.toISOString().split('T')[0] || '';
      actualFormFields.date = formData.staffSignedAt?.toISOString().split('T')[0] || '';
    }

    // Create response in expected format
    const response = {
      staff,
      submissions: {
        [formKey]: actualFormFields
      }
    };

    console.log(`[API] Final response structure:`, {
      hasStaff: !!response.staff,
      hasSubmissions: !!response.submissions,
      submissionKeys: Object.keys(response.submissions),
      formDataKeys: Object.keys(response.submissions[formKey] || {})
    });

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("[API] Error:", error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
