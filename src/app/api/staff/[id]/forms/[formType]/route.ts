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

    // Get form data based on form type
    let formData = null;
    
    // Handle both formats (kebab-case vs snake_case)
    const normalizedFormType = formType === 'employment-details' ? 'employee_details' :
                              formType === 'employment-welcome' ? 'employee_welcome' :
                              formType === 'support-worker' ? 'support_worker' :
                              formType === 'pre-employment-medical' ? 'pre_employment_medical' :
                              formType === 'ndis-workforce' ? 'ndis_workforce_capability' :
                              formType === 'bullying-harassment' ? 'bullying_harassment_training' :
                              formType === 'bullying-training' ? 'bullying_training' :
                              formType === 'ndis-code-of-conduct' ? 'ndis_code_of_conduct' :
                              formType === 'fair-work-information' ? 'fair_work_information' :
                              formType === 'casual-employment-information' ? 'casual_employment_information' :
                              formType === 'govt-tax' ? 'govt_tax' :
                              formType === 'super-choice-form' ? 'super_choice_form' :
                              formType === 'vehicle-safety-inspection' ? 'vehicle_safety_inspection' :
                              formType === 'conflict-of-interest' ? 'conflict_of_interest' :
                              formType === 'documentation-acknowledgement' ? 'documentation_acknowledgement' :
                              formType;

    // Helper function to safely query tables
    const safeQuery = async (tableName: string, queryFn: () => Promise<any>) => {
      try {
        return await queryFn();
      } catch (error: any) {
        if (error?.code === 'P2021') {
          console.log(`Table ${tableName} does not exist, checking generic submissions`);
          return null;
        }
        throw error;
      }
    };

    // First try dedicated tables
    switch (normalizedFormType) {
      case 'employee_details':
        formData = await safeQuery('staffEmploymentDetails', () => 
          (prisma as any).staffEmploymentDetails.findUnique({ where: { staffId } })
        );
        break;
      case 'employee_welcome':
        formData = await safeQuery('staffEmploymentWelcomeAck', () => 
          (prisma as any).staffEmploymentWelcomeAck.findUnique({ where: { staffId } })
        );
        break;
      case 'support_worker':
        formData = await safeQuery('staffSupportWorker', () => 
          (prisma as any).staffSupportWorker.findUnique({ where: { staffId } })
        );
        break;
      case 'pre_employment_medical':
        formData = await safeQuery('staffPreEmploymentMedical', () => 
          (prisma as any).staffPreEmploymentMedical.findUnique({ where: { staffId } })
        );
        break;
      case 'ndis_workforce_capability':
        formData = await safeQuery('staffNdisWorkforceCapability', () => 
          (prisma as any).staffNdisWorkforceCapability.findUnique({ where: { staffId } })
        );
        break;
      case 'bullying_harassment_training':
        formData = await safeQuery('staffBullyingHarassmentTraining', () => 
          (prisma as any).staffBullyingHarassmentTraining.findUnique({ where: { staffId } })
        );
        break;
      case 'bullying_training':
        formData = await safeQuery('staffBullyingTraining', () => 
          (prisma as any).staffBullyingTraining.findUnique({ where: { staffId } })
        );
        break;
      case 'ndis_code_of_conduct':
        formData = await safeQuery('staffNdisCodeOfConduct', () => 
          (prisma as any).staffNdisCodeOfConduct.findUnique({ where: { staffId } })
        );
        break;
      case 'fair_work_information':
        formData = await safeQuery('staffFairWorkInformation', () => 
          (prisma as any).staffFairWorkInformation.findUnique({ where: { staffId } })
        );
        break;
      case 'casual_employment_information':
        formData = await safeQuery('staffCasualEmploymentInformation', () => 
          (prisma as any).staffCasualEmploymentInformation.findUnique({ where: { staffId } })
        );
        break;
      case 'orientation':
        formData = await safeQuery('staffOrientation', () => 
          (prisma as any).staffOrientation.findUnique({ where: { staffId } })
        );
        break;
      case 'vehicle_safety_inspection':
        formData = await safeQuery('staffVehicleSafetyInspection', () => 
          (prisma as any).staffVehicleSafetyInspection.findUnique({ where: { staffId } })
        );
        break;
      case 'conflict_of_interest':
        formData = await safeQuery('staffConflictOfInterest', () => 
          (prisma as any).staffConflictOfInterest.findUnique({ where: { staffId } })
        );
        break;
      case 'documentation_acknowledgement':
        formData = await safeQuery('staffDocumentationAcknowledgement', () => 
          (prisma as any).staffDocumentationAcknowledgement.findUnique({ where: { staffId } })
        );
        break;
      case 'govt_tax':
      case 'super_choice_form':
        // These are always stored in StaffFormSubmission table
        const formSubmission = await (prisma as any).staffFormSubmission.findFirst({
          where: {
            staffId,
            formKey: normalizedFormType,
            isSubmitted: true
          }
        });
        if (formSubmission) {
          formData = formSubmission.data;
        }
        break;
      default:
        return new NextResponse("Invalid form type", { status: 400 });
    }

    // If no data found in dedicated table, check generic submissions
    if (!formData) {
      console.log(`No data found in dedicated table for ${normalizedFormType}, checking generic submissions`);
      const genericSubmission = await (prisma as any).staffFormSubmission.findFirst({
        where: {
          staffId,
          formKey: normalizedFormType,
          isSubmitted: true
        },
        orderBy: { updatedAt: 'desc' }
      });
      
      if (genericSubmission) {
        formData = genericSubmission.data;
        console.log(`Found data in generic submissions for ${normalizedFormType}`);
      }
    }

    if (!formData) {
      return new NextResponse("Form data not found", { status: 404 });
    }

    // Debug logging
    console.log(`[API] Form data for ${normalizedFormType}:`, {
      hasData: !!formData.data,
      dataKeys: formData.data ? Object.keys(formData.data) : 'no data property',
      formDataKeys: Object.keys(formData)
    });

    // Add staff info to form data
    // Match the structure that works in the onboarding API
    const formDataContent = formData.data || formData;
    const dataWithStaff = { 
      ...formData, 
      staff,
      // Spread the actual form data directly (like onboarding API does)
      ...formDataContent,
      // Add signature fields if they exist
      ...(formData.staffSignature && { signature: formData.staffSignature }),
      ...(formData.staffSignedAt && { signatureDate: formData.staffSignedAt?.toISOString().split('T')[0] }),
      // Also provide data.data for components that expect it
      data: formDataContent
    };

    console.log(`[API] Final response for ${normalizedFormType}:`, {
      hasData: !!dataWithStaff.data,
      dataKeys: dataWithStaff.data ? Object.keys(dataWithStaff.data) : 'no data property',
      directKeys: Object.keys(dataWithStaff).filter(key => !['staff', 'data', 'id', 'staffId', 'createdAt', 'updatedAt'].includes(key))
    });

    return NextResponse.json(dataWithStaff);
  } catch (error: any) {
    console.error("Error fetching form data:", error);
    return new NextResponse(`Error: ${error.message}`, { status: 500 });
  }
}
