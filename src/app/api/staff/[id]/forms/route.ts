import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const staffId = parseInt(id);
    
    const db: any = prisma as any;

    // Fetch basic staff record first (no includes to avoid table-missing errors)
    const staff = await db.staff.findUnique({
      where: { id: staffId },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    // Safely fetch each specialized form table (ignore if table doesn't exist)
    const isDev = process.env.NODE_ENV !== 'production';
    const safe = async (label: string, fn: () => Promise<any>) => {
      try {
        const v = await fn();
        if (isDev) console.log(`[staff/forms] Table ok: ${label} → ${!!v}`);
        return v;
      } catch (e: any) {
        if (e?.code === 'P2021') {
          if (isDev) console.warn(`[staff/forms] Missing table for ${label}:`, e?.message);
          return null;
        }
        throw e;
      }
    };

    const employmentDetails = await safe('employmentDetails', () => db.staffEmploymentDetails.findUnique({ where: { staffId } }));
    const employmentWelcomeAck = await safe('employmentWelcomeAck', () => db.staffEmploymentWelcomeAck.findUnique({ where: { staffId } }));
    const supportWorker = await safe('supportWorker', () => db.staffSupportWorker.findUnique({ where: { staffId } }));
    const preEmploymentMedical = await safe('preEmploymentMedical', () => db.staffPreEmploymentMedical.findUnique({ where: { staffId } }));
    const ndisWorkforceCapability = await safe('ndisWorkforceCapability', () => db.staffNdisWorkforceCapability.findUnique({ where: { staffId } }));
    const bullyingHarassmentTraining = await safe('bullyingHarassmentTraining', () => db.staffBullyingHarassmentTraining.findUnique({ where: { staffId } }));
    const bullyingTraining = await safe('bullyingTraining', () => db.staffBullyingTraining?.findUnique({ where: { staffId } }));
    const ndisCodeOfConduct = await safe('ndisCodeOfConduct', () => db.staffNdisCodeOfConduct?.findUnique({ where: { staffId } }));
    const conflictOfInterest = await safe('conflictOfInterest', () => db.staffConflictOfInterest?.findUnique({ where: { staffId } }));
    const documentationAcknowledgement = await safe('documentationAcknowledgement', () => db.staffDocumentationAcknowledgement?.findUnique({ where: { staffId } }));
    const vehicleSafetyInspection = await safe('vehicleSafetyInspection', () => db.staffVehicleSafetyInspection?.findUnique({ where: { staffId } }));

    // Fetch generic submissions for keys that may not have dedicated tables
    const genericKeys = [
      'fair_work_information',
      'casual_employment_information',
      'orientation',
      'govt_tax',
      'super_choice_form',
      // Keep ndis_code_of_conduct & conflict_of_interest here only as fallback if tables are absent
      'ndis_code_of_conduct',
      'conflict_of_interest',
      'documentation_acknowledgement',
      // Vehicle safety may be stored as generic when table is missing
      'vehicle_safety_inspection',
    ];

    const genericSubs = await db.staffFormSubmission.findMany({
      where: { staffId, formKey: { in: genericKeys } },
      select: { formKey: true, isSubmitted: true, updatedAt: true }
    });

    const getGeneric = (key: string) => {
      const found = genericSubs.find((g: any) => g.formKey === key);
      // Return the form if it exists (regardless of isSubmitted status)
      return found;
    };
    
    console.log('📊 Generic Forms Check:', {
      staffId,
      genericKeys,
      foundGenericForms: genericSubs.map(g => ({ key: g.formKey, isSubmitted: g.isSubmitted })),
      submittedGenericForms: genericSubs.filter((g:any)=>g.isSubmitted).map((g:any)=>g.formKey)
    });

    const forms = [
      {
        formType: 'employment-details',
        formName: 'Employment Details',
        status: employmentDetails ? 'completed' : 'pending',
        completedAt: employmentDetails?.createdAt?.toLocaleDateString(),
        hasSignature: !!employmentDetails?.staffSignature
      },
      {
        formType: 'employment-welcome',
        formName: 'Employment Welcome Acknowledgment',
        status: employmentWelcomeAck ? 'completed' : 'pending',
        completedAt: employmentWelcomeAck?.createdAt?.toLocaleDateString(),
        hasSignature: !!employmentWelcomeAck?.staffSignature
      },
      {
        formType: 'support-worker',
        formName: 'Support Worker Form',
        status: supportWorker ? 'completed' : 'pending',
        completedAt: supportWorker?.createdAt?.toLocaleDateString(),
        hasSignature: !!supportWorker?.staffSignature
      },
      {
        formType: 'pre-employment-medical',
        formName: 'Pre-Employment Medical',
        status: preEmploymentMedical ? 'completed' : 'pending',
        completedAt: preEmploymentMedical?.createdAt?.toLocaleDateString(),
        hasSignature: !!preEmploymentMedical?.staffSignature
      },
      {
        formType: 'ndis-workforce',
        formName: 'NDIS Workforce Capability',
        status: ndisWorkforceCapability ? 'completed' : 'pending',
        completedAt: ndisWorkforceCapability?.createdAt?.toLocaleDateString(),
        hasSignature: !!ndisWorkforceCapability?.staffSignature
      },
      {
        formType: 'bullying-harassment',
        formName: 'Bullying & Harassment Training',
        status: bullyingHarassmentTraining ? 'completed' : 'pending',
        completedAt: bullyingHarassmentTraining?.createdAt?.toLocaleDateString(),
        hasSignature: !!bullyingHarassmentTraining?.staffSignature
      },
      {
        formType: 'bullying-training',
        formName: 'Bullying Training',
        status: bullyingTraining ? 'completed' : 'pending',
        completedAt: bullyingTraining?.createdAt?.toLocaleDateString(),
        hasSignature: !!bullyingTraining?.staffSignature
      },
      {
        formType: 'ndis-code-of-conduct',
        formName: 'NDIS Code of Conduct',
        status: ndisCodeOfConduct ? 'completed' : (getGeneric('ndis_code_of_conduct') ? 'completed' : 'pending'),
        completedAt: ndisCodeOfConduct?.createdAt?.toLocaleDateString(),
        hasSignature: !!ndisCodeOfConduct?.staffSignature
      },
      {
        formType: 'fair-work-information',
        formName: 'Fair Work Information Statement',
        status: getGeneric('fair_work_information') ? 'completed' : 'pending',
        completedAt: getGeneric('fair_work_information')?.updatedAt?.toLocaleDateString(),
        hasSignature: false
      },
      {
        formType: 'casual-employment-information',
        formName: 'Casual Employment Information Statement',
        status: getGeneric('casual_employment_information') ? 'completed' : 'pending',
        completedAt: getGeneric('casual_employment_information')?.updatedAt?.toLocaleDateString(),
        hasSignature: false
      },
      {
        formType: 'orientation',
        formName: 'Staff Orientation',
        status: getGeneric('orientation') ? 'completed' : 'pending',
        completedAt: getGeneric('orientation')?.updatedAt?.toLocaleDateString(),
        hasSignature: false
      },
      {
        formType: 'govt-tax',
        formName: 'Government Tax',
        status: getGeneric('govt_tax') ? 'completed' : 'pending',
        completedAt: getGeneric('govt_tax')?.updatedAt?.toLocaleDateString(),
        hasSignature: false
      },
      {
        formType: 'super-choice-form',
        formName: 'Superannuation Standard Choice Form',
        status: getGeneric('super_choice_form') ? 'completed' : 'pending',
        completedAt: getGeneric('super_choice_form')?.updatedAt?.toLocaleDateString(),
        hasSignature: false
      },
      {
        formType: 'vehicle-safety-inspection',
        formName: 'Vehicle Safety Inspection Checklist',
        status: vehicleSafetyInspection ? 'completed' : (getGeneric('vehicle_safety_inspection') ? 'completed' : 'pending'),
        completedAt: vehicleSafetyInspection?.createdAt?.toLocaleDateString() || getGeneric('vehicle_safety_inspection')?.updatedAt?.toLocaleDateString(),
        hasSignature: !!vehicleSafetyInspection?.staffSignature
      },
      {
        formType: 'conflict-of-interest',
        formName: 'Conflict of Interest Disclosure',
        status: conflictOfInterest ? 'completed' : (getGeneric('conflict_of_interest') ? 'completed' : 'pending'),
        completedAt: conflictOfInterest?.createdAt?.toLocaleDateString(),
        hasSignature: !!conflictOfInterest?.staffSignature
      },
      {
        formType: 'documentation-acknowledgement',
        formName: 'Documentation Acknowledgement',
        status: documentationAcknowledgement ? 'completed' : (getGeneric('documentation_acknowledgement') ? 'completed' : 'pending'),
        completedAt: documentationAcknowledgement?.createdAt?.toLocaleDateString(),
        hasSignature: !!documentationAcknowledgement?.staffSignature
      }
    ];

    const completedCount = forms.filter(f => f.status === 'completed').length;
    
    // Enhanced debugging for form completion
    console.log('📊 Staff Forms API - Completion Summary:', {
      staffId,
      totalForms: forms.length,
      completedCount,
      completedForms: forms.filter(f => f.status === 'completed').map(f => f.formName),
      pendingForms: forms.filter(f => f.status === 'pending').map(f => f.formName),
      staffStatus: staff.status,
      hasSignature: forms.filter(f => f.hasSignature).length
    });
    
    return NextResponse.json({ staff, forms, completedCount });
  } catch (error: any) {
    console.error('Error fetching staff forms:', error);
    return NextResponse.json({ error: 'Failed to fetch staff forms' }, { status: 500 });
  }
}
