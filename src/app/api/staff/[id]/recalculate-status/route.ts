import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const staffId = parseInt(id || '0', 10)
    if (!staffId) return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 })

    const REQUIRED_KEYS = [
      'employeeDetails',
      'employee_welcome',
      'support_worker',
      'pre_employment_medical',
      'ndis_workforce_capability',
      'bullying_harassment_training',
      'bullying_training',
      'documentation_acknowledgement',
      'ndis_code_of_conduct',
      'fair_work_information',
      'casual_employment_information',
      'orientation',
      'govt_tax',
      'super_choice_form',
      'vehicle_safety_inspection',
      'conflict_of_interest',
    ]

    // Basic staff fetch without includes to avoid P2021 when tables are missing
    const basic = await prisma.staff.findUnique({ where: { id: staffId } })
    if (!basic) return NextResponse.json({ error: 'Staff not found' }, { status: 404 })

    // Safe helpers for optional tables
    const safe = async (fn: () => Promise<any>) => {
      try { return await fn() } catch (e: any) { if (e?.code === 'P2021') return null; throw e }
    }

    // Load table-backed forms if tables exist
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
    ])

    // Generic submissions (submitted only)
    const genericSubmitted = await (prisma as any).staffFormSubmission.findMany({
      where: { staffId, isSubmitted: true },
      select: { formKey: true }
    })
    const submittedKeys = new Set<string>(genericSubmitted.map((g: any) => g.formKey))

    const allComplete = REQUIRED_KEYS.every((key) => {
      switch (key) {
        case 'employeeDetails': return !!employmentDetails
        case 'employee_welcome': return !!employmentWelcomeAck
        case 'support_worker': return !!supportWorker
        case 'pre_employment_medical': return !!preEmploymentMedical
        case 'ndis_workforce_capability': return !!ndisWorkforceCapability
        case 'bullying_harassment_training': return !!bullyingHarassmentTraining
        case 'bullying_training': return !!bullyingTraining
        case 'ndis_code_of_conduct': return !!ndisCodeOfConduct || submittedKeys.has('ndis_code_of_conduct')
        case 'conflict_of_interest': return !!conflictOfInterest || submittedKeys.has('conflict_of_interest')
        case 'documentation_acknowledgement': return !!documentationAcknowledgement || submittedKeys.has('documentation_acknowledgement')
        case 'vehicle_safety_inspection': return !!vehicleSafetyInspection || submittedKeys.has('vehicle_safety_inspection')
        default:
          return submittedKeys.has(key)
      }
    })

    if (allComplete && basic.status !== 'success') {
      await prisma.staff.update({ where: { id: staffId }, data: { status: 'success' } })
    }

    return NextResponse.json({ success: true, allComplete, status: allComplete ? 'success' : basic.status })
  } catch (error: any) {
    console.error('Error recalculating staff status:', error)
    return NextResponse.json({ error: 'Failed to recalculate' }, { status: 500 })
  }
}


