import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/staff/[id] - fetch single staff with basic fields
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const staffId = parseInt(id || '0', 10)
    if (!staffId) return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 })

    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      select: {
        id: true,
        firstName: true,
        surname: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        startDate: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!staff) return NextResponse.json({ error: 'Staff not found' }, { status: 404 })

    return NextResponse.json({ staff })
  } catch (error: any) {
    console.error('Error fetching staff:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch staff' }, { status: 500 })
  }
}

// DELETE /api/staff/[id] - remove staff and all related data
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const staffId = parseInt(id || '0', 10)
    if (!staffId) return NextResponse.json({ error: 'Invalid staff ID' }, { status: 400 })

    const existing = await prisma.staff.findUnique({ where: { id: staffId } })
    if (!existing) return NextResponse.json({ error: 'Staff not found' }, { status: 404 })

    await prisma.$transaction(async (tx: any) => {
      // Delete generic submissions
      await tx.staffFormSubmission.deleteMany({ where: { staffId } })

      // Delete specialized per-form tables (guarded; use deleteMany)
      await tx.staffEmploymentDetails.deleteMany({ where: { staffId } })
      await tx.staffEmploymentWelcomeAck.deleteMany({ where: { staffId } })
      await tx.staffSupportWorker.deleteMany({ where: { staffId } })
      await tx.staffPreEmploymentMedical.deleteMany({ where: { staffId } })
      await tx.staffNdisWorkforceCapability.deleteMany({ where: { staffId } })
      await tx.staffBullyingHarassmentTraining.deleteMany({ where: { staffId } })
      await tx.staffBullyingTraining.deleteMany({ where: { staffId } })
      // Optional tables referenced in schema
      try { await tx.staffNdisCodeOfConduct.deleteMany({ where: { staffId } }) } catch (_) {}
      try { await tx.staffConflictOfInterest.deleteMany({ where: { staffId } }) } catch (_) {}
      try { await tx.staffDocumentationAcknowledgement.deleteMany({ where: { staffId } }) } catch (_) {}
      try { await tx.staffVehicleSafetyInspection.deleteMany({ where: { staffId } }) } catch (_) {}

      // Finally delete staff
      await tx.staff.delete({ where: { id: staffId } })
    })

    return NextResponse.json({ success: true, message: 'Staff and related data deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting staff:', error)
    if (error.code === 'P2025') return NextResponse.json({ error: 'Staff not found' }, { status: 404 })
    return NextResponse.json({ error: 'Failed to delete staff', details: error.message }, { status: 500 })
  }
}


