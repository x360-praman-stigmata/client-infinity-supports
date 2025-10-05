import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    
    // Handle admin view tokens
    if (token.startsWith('admin-view-')) {
      const staffId = token.replace('admin-view-', '');
      
      // Only include relations that exist in the database
      const staff = await prisma.staff.findFirst({
        where: { id: parseInt(staffId) },
        include: {
          submissions: true,
          employmentDetails: true,
          employmentWelcomeAck: true,
          supportWorker: true,
          preEmploymentMedical: true,
          ndisWorkforceCapability: true,
          bullyingHarassmentTraining: true,
          bullyingTraining: true,
          ndisCodeOfConduct: true,
          conflictOfInterest: true,
          documentationAcknowledgement: true,
          // vehicleSafetyInspection: true, // This table doesn't exist yet
        }
      });

      if (!staff) {
        return NextResponse.json({ 
          error: 'Staff not found',
          message: 'Staff member not found.',
          code: 'STAFF_NOT_FOUND'
        }, { status: 404 });
      }

      // Format submissions for compatibility - include both dedicated tables and generic submissions
      const submissions: any = {};
      if (staff.employmentDetails) submissions.employeeDetails = staff.employmentDetails;
      if (staff.employmentWelcomeAck) submissions.employee_welcome = staff.employmentWelcomeAck;
      if (staff.supportWorker) submissions.support_worker = staff.supportWorker;
      if (staff.preEmploymentMedical) submissions.pre_employment_medical = staff.preEmploymentMedical;
      if (staff.ndisWorkforceCapability) submissions.ndis_workforce_capability = staff.ndisWorkforceCapability;
      if (staff.bullyingHarassmentTraining) submissions.bullying_harassment_training = staff.bullyingHarassmentTraining;
      if (staff.bullyingTraining) submissions.bullying_training = staff.bullyingTraining;
      if (staff.ndisCodeOfConduct) submissions.ndis_code_of_conduct = staff.ndisCodeOfConduct;
      if (staff.conflictOfInterest) submissions.conflict_of_interest = staff.conflictOfInterest;
      if (staff.documentationAcknowledgement) submissions.documentation_acknowledgement = staff.documentationAcknowledgement;
      
      // Include generic form submissions (forms stored in staffFormSubmission table)
      if (staff.submissions && Array.isArray(staff.submissions)) {
        staff.submissions.forEach((submission: any) => {
          submissions[submission.formKey] = submission.data;
        });
      }

      return NextResponse.json({
        staff: {
          id: staff.id,
          firstName: staff.firstName,
          surname: staff.surname,
          email: staff.email,
          phone: staff.phone,
          status: staff.status
        },
        submissions,
        token
      });
    }
    
    // Validate token format for regular tokens
    if (!token || typeof token !== 'string' || token.length < 10) {
      return NextResponse.json({ 
        error: 'Invalid access link',
        message: 'The access link you provided is not valid. Please check the link and try again.',
        code: 'INVALID_TOKEN'
      }, { status: 400 });
    }
    
    // 🚀 OPTIMIZED: Single query with all includes instead of 8+ separate queries
    let staff;
    try {
      staff = await prisma.staff.findFirst({
        where: { linkToken: token },
        include: {
          // Generic form submissions
          submissions: true,
          // Individual form tables
          employmentDetails: true,
          employmentWelcomeAck: true,
          supportWorker: true,
          preEmploymentMedical: true,
          ndisWorkforceCapability: true,
          bullyingHarassmentTraining: true,
          bullyingTraining: true,
          ndisCodeOfConduct: true,
          conflictOfInterest: true,
        }
      });
    } catch (error: any) {
      if (error.code === 'P2021' && error.message.includes('StaffNdisCodeOfConduct')) {
        // Table doesn't exist, create it and retry
        console.log('Creating missing StaffNdisCodeOfConduct table...');
        
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "StaffNdisCodeOfConduct" (
            "id" SERIAL NOT NULL,
            "staffId" INTEGER NOT NULL,
            "data" JSONB NOT NULL,
            "staffSignature" TEXT,
            "staffSignedAt" TIMESTAMP(3),
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "StaffNdisCodeOfConduct_pkey" PRIMARY KEY ("id")
          )
        `);
        
        await prisma.$executeRawUnsafe(`
          CREATE UNIQUE INDEX IF NOT EXISTS "StaffNdisCodeOfConduct_staffId_key" 
          ON "StaffNdisCodeOfConduct"("staffId")
        `);
        
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "StaffNdisCodeOfConduct" 
          ADD CONSTRAINT IF NOT EXISTS "StaffNdisCodeOfConduct_staffId_fkey" 
          FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        `);
        
        // Retry the query
        staff = await prisma.staff.findFirst({
          where: { linkToken: token },
          include: {
            // Generic form submissions
            submissions: true,
            // Individual form tables
            employmentDetails: true,
            employmentWelcomeAck: true,
            supportWorker: true,
            preEmploymentMedical: true,
            ndisWorkforceCapability: true,
            bullyingHarassmentTraining: true,
            bullyingTraining: true,
            ndisCodeOfConduct: true,
            conflictOfInterest: true,
          }
        });
      } else {
        throw error;
      }
    }
    
    if (!staff) {
      return NextResponse.json({ 
        error: 'Access link not found',
        message: 'This access link is not valid or has been removed. Please contact your administrator for a new link.',
        code: 'LINK_NOT_FOUND'
      }, { status: 404 });
    }
    
    if (staff.linkExpiresAt && new Date(staff.linkExpiresAt) < new Date()) {
      return NextResponse.json({ 
        error: 'Access link expired',
        message: 'This access link has expired. Please contact your administrator for a new link.',
        code: 'LINK_EXPIRED',
        expiredAt: staff.linkExpiresAt
      }, { status: 410 });
    }
    
    if (staff.status === 'deleted') {
      return NextResponse.json({ 
        error: 'Account deactivated',
        message: 'Your staff account has been deactivated. Please contact your administrator.',
        code: 'ACCOUNT_DEACTIVATED'
      }, { status: 403 });
    }
    
    // 🚀 OPTIMIZED: Process data from single query result
    const dataByForm = Object.fromEntries(staff.submissions.map((s: any) => [s.formKey, s.data]));
    
    // Handle Employee Details form with signature
    if (staff.employmentDetails) {
      dataByForm['employeeDetails'] = {
        ...(staff.employmentDetails.data as any || {}),
        employeeSignature: staff.employmentDetails.staffSignature || '',
        employeeSignatureDate: staff.employmentDetails.staffSignedAt?.toISOString().split('T')[0] || ''
      };
    }
    
    // Handle Employee Welcome form with signature
    if (staff.employmentWelcomeAck) {
      dataByForm['employee_welcome'] = {
        ...(staff.employmentWelcomeAck.data as any || {}),
        signature: staff.employmentWelcomeAck.staffSignature || '',
        date: staff.employmentWelcomeAck.staffSignedAt?.toISOString().split('T')[0] || ''
      };
    }
    
    // Handle Support Worker form with signature
    if (staff.supportWorker) {
      dataByForm['support_worker'] = {
        ...(staff.supportWorker.data as any || {}),
        signature: staff.supportWorker.staffSignature || '',
        signatureDate: staff.supportWorker.staffSignedAt?.toISOString().split('T')[0] || ''
      };
    }
    
    // Handle Pre-Employment Medical form with all signature fields
    if (staff.preEmploymentMedical) {
      const formData = staff.preEmploymentMedical.data as any || {};
      
      dataByForm['pre_employment_medical'] = {
        ...formData,
        // Educational Check signature (from main signature field)
        signature: staff.preEmploymentMedical.staffSignature || '',
        signatureDate: staff.preEmploymentMedical.staffSignedAt?.toISOString().split('T')[0] || '',
        // Include all signature fields from form data
        disclosureSignature: formData.disclosureSignature || '',
        disclosureDate: formData.disclosureDate || '',
        declarationSignature: formData.declarationSignature || '',
        declarationDate: formData.declarationDate || ''
      };
      
      console.log('🔍 Pre-Employment Medical Signature Fields:', {
        hasMainSignature: !!staff.preEmploymentMedical.staffSignature,
        hasDisclosureSignature: !!formData.disclosureSignature,
        hasDeclarationSignature: !!formData.declarationSignature,
        hasDisclosureDate: !!formData.disclosureDate,
        hasDeclarationDate: !!formData.declarationDate,
        formDataKeys: Object.keys(formData).filter(key => key.includes('signature') || key.includes('Date'))
      });
    }
    
    // Handle NDIS Workforce Capability Framework form with signature
    if (staff.ndisWorkforceCapability) {
      dataByForm['ndis_workforce_capability'] = {
        ...(staff.ndisWorkforceCapability.data as any || {}),
        signature: staff.ndisWorkforceCapability.staffSignature || '',
        signatureDate: staff.ndisWorkforceCapability.staffSignedAt?.toISOString().split('T')[0] || ''
      };
    }
    
    // Handle Bullying and Harassment Training form with signature
    if (staff.bullyingHarassmentTraining) {
      dataByForm['bullying_harassment_training'] = {
        ...(staff.bullyingHarassmentTraining.data as any || {}),
        signature: staff.bullyingHarassmentTraining.staffSignature || '',
        signatureDate: staff.bullyingHarassmentTraining.staffSignedAt?.toISOString().split('T')[0] || ''
      };
    }
    
    // Handle Bullying Training form with signature
    if (staff.bullyingTraining) {
      dataByForm['bullying_training'] = {
        ...(staff.bullyingTraining.data as any || {}),
        staffSignature: staff.bullyingTraining.staffSignature || '',
        staffSignedAt: staff.bullyingTraining.staffSignedAt?.toISOString() || ''
      };
    }

    // Handle NDIS Code of Conduct form with signature
    if (staff.ndisCodeOfConduct) {
      dataByForm['ndis_code_of_conduct'] = {
        ...(staff.ndisCodeOfConduct.data as any || {}),
        signature: staff.ndisCodeOfConduct.staffSignature || '',
        date: staff.ndisCodeOfConduct.staffSignedAt?.toISOString().split('T')[0] || '',
        staffSignature: staff.ndisCodeOfConduct.staffSignature || '',
        staffSignedAt: staff.ndisCodeOfConduct.staffSignedAt?.toISOString() || ''
      };
    }

    // Handle Conflict of Interest form with signature
    if (staff.conflictOfInterest) {
      dataByForm['conflict_of_interest'] = {
        ...(staff.conflictOfInterest.data as any || {}),
        employeeSignature: staff.conflictOfInterest.staffSignature || '',
        employeeDate: staff.conflictOfInterest.staffSignedAt?.toISOString().split('T')[0] || '',
        staffSignature: staff.conflictOfInterest.staffSignature || '',
        staffSignedAt: staff.conflictOfInterest.staffSignedAt?.toISOString() || ''
      };
    }
    
    console.log('📊 Admin View - Staff data loaded:', {
      staffId: staff.id,
      staffName: `${staff.firstName} ${staff.surname}`,
      availableForms: Object.keys(dataByForm),
      totalForms: Object.keys(dataByForm).length,
      hasPreEmploymentMedical: !!dataByForm.pre_employment_medical,
      preEmploymentKeys: dataByForm.pre_employment_medical ? Object.keys(dataByForm.pre_employment_medical) : []
    });
    
    // Debug Pre-Employment Medical data specifically
    if (dataByForm.pre_employment_medical) {
      console.log('🔍 Pre-Employment Medical Data Debug:', {
        hasSignature: !!dataByForm.pre_employment_medical.signature,
        hasDisclosureSignature: !!dataByForm.pre_employment_medical.disclosureSignature,
        hasDeclarationSignature: !!dataByForm.pre_employment_medical.declarationSignature,
        hasSignatureDate: !!dataByForm.pre_employment_medical.signatureDate,
        hasDisclosureDate: !!dataByForm.pre_employment_medical.disclosureDate,
        hasDeclarationDate: !!dataByForm.pre_employment_medical.declarationDate,
        allKeys: Object.keys(dataByForm.pre_employment_medical),
        signatureLength: dataByForm.pre_employment_medical.signature?.length || 0,
        disclosureSignatureLength: dataByForm.pre_employment_medical.disclosureSignature?.length || 0,
        declarationSignatureLength: dataByForm.pre_employment_medical.declarationSignature?.length || 0
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Staff data loaded successfully',
      staff: {
        id: staff.id,
        firstName: staff.firstName,
        surname: staff.surname,
        email: staff.email,
        phone: staff.phone,
        status: staff.status,
      },
      submissions: dataByForm
    });
  } catch (e: any) {
    console.error('Error loading staff data:', e);
    
    // Handle specific database errors
    if (e.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Database constraint violation',
        message: 'There was a conflict with the data. Please try again.',
        code: 'CONSTRAINT_VIOLATION'
      }, { status: 409 });
    }
    
    if (e.code === 'P2025') {
      return NextResponse.json({ 
        error: 'Record not found',
        message: 'The requested data could not be found.',
        code: 'RECORD_NOT_FOUND'
      }, { status: 404 });
    }
    
    // Handle connection errors
    if (e.code === 'P1001') {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please try again later.',
        code: 'DATABASE_CONNECTION_ERROR'
      }, { status: 503 });
    }
    
    // Generic error fallback
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'An unexpected error occurred while loading your data. Please try again.',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    
    // Validate token format
    if (!token || typeof token !== 'string' || token.length < 10) {
      return NextResponse.json({ 
        error: 'Invalid access link',
        message: 'The access link you provided is not valid. Please check the link and try again.',
        code: 'INVALID_TOKEN'
      }, { status: 400 });
    }
    
    // Parse and validate request body
    let payload;
    try {
      payload = await req.json();
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        message: 'The data you sent is not valid. Please check your form and try again.',
        code: 'INVALID_JSON'
      }, { status: 400 });
    }
    
    const { formKey, data, submit } = payload || {};
    
    // Validate required fields
    if (!formKey) {
      return NextResponse.json({ 
        error: 'Missing form type',
        message: 'Please specify which form you are submitting.',
        code: 'MISSING_FORM_KEY'
      }, { status: 400 });
    }
    
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ 
        error: 'Missing form data',
        message: 'Please fill out the form before submitting.',
        code: 'MISSING_FORM_DATA'
      }, { status: 400 });
    }
    
    // 🚀 OPTIMIZED: Single staff lookup instead of separate query
    const staff = await prisma.staff.findFirst({ where: { linkToken: token } });
    
    if (!staff) {
      return NextResponse.json({ 
        error: 'Access link not found',
        message: 'This access link is not valid or has been removed. Please contact your administrator for a new link.',
        code: 'LINK_NOT_FOUND'
      }, { status: 404 });
    }
    
    if (staff.linkExpiresAt && new Date(staff.linkExpiresAt) < new Date()) {
      return NextResponse.json({ 
        error: 'Access link expired',
        message: 'This access link has expired. Please contact your administrator for a new link.',
        code: 'LINK_EXPIRED',
        expiredAt: staff.linkExpiresAt
      }, { status: 410 });
    }
    
    if (staff.status === 'deleted') {
      return NextResponse.json({ 
        error: 'Account deactivated',
        message: 'Your staff account has been deactivated. Please contact your administrator.',
        code: 'ACCOUNT_DEACTIVATED'
      }, { status: 403 });
    }
    // 🚀 OPTIMIZED: Use proper Prisma calls instead of dynamic access
    let saved: any;
    
    if (formKey === 'employeeDetails') {
      // Extract signature data if present
      const { employeeSignature, employeeSignatureDate, ...formData } = data;
      const signatureData = employeeSignature ? {
        staffSignature: employeeSignature,
        staffSignedAt: employeeSignatureDate ? new Date(employeeSignatureDate) : new Date()
      } : {};
      
      saved = await prisma.staffEmploymentDetails.upsert({
        where: { staffId: staff.id },
        update: { 
          data: formData,
          ...signatureData
        },
        create: { 
          staffId: staff.id, 
          data: formData,
          ...signatureData
        },
      });
    } else if (formKey === 'employee_welcome') {
      // Extract signature data if present
      const { signature, date, ...formData } = data;
      const signatureData = signature ? {
        staffSignature: signature,
        staffSignedAt: date ? new Date(date) : new Date()
      } : {};
      
      saved = await prisma.staffEmploymentWelcomeAck.upsert({
        where: { staffId: staff.id },
        update: { 
          data: formData,
          ...signatureData
        },
        create: { 
          staffId: staff.id, 
          data: formData,
          ...signatureData
        },
      });
    } else if (formKey === 'support_worker') {
      // Extract signature data if present
      const { signature, signatureDate, ...formData } = data;
      const signatureData = signature ? {
        staffSignature: signature,
        staffSignedAt: signatureDate ? new Date(signatureDate) : new Date()
      } : {};
      
      saved = await prisma.staffSupportWorker.upsert({
        where: { staffId: staff.id },
        update: { 
          data: formData,
          ...signatureData
        },
        create: { 
          staffId: staff.id, 
          data: formData,
          ...signatureData
        },
      });
    } else if (formKey === 'pre_employment_medical') {
      // Extract signature data if present
      const { signature, signatureDate, declarationSignature, declarationDate, disclosureSignature, disclosureDate, ...otherData } = data;
      const signatureData = signature ? {
        staffSignature: signature,
        staffSignedAt: signatureDate ? new Date(signatureDate) : new Date()
      } : {};
      
      // Include all signature fields in the formData so they're saved to the database
      const formData = {
        ...otherData,
        declarationSignature,
        declarationDate,
        disclosureSignature,
        disclosureDate
      };
      
      console.log('💾 PreEmploymentMedical - Processing submission:', {
        staffId: staff.id,
        staffName: `${staff.firstName} ${staff.surname}`,
        submit,
        hasSignature: !!signature,
        hasDeclarationSignature: !!declarationSignature,
        hasDisclosureSignature: !!disclosureSignature,
        formFields: Object.keys(formData).length,
        totalDataFields: Object.keys(data).length
      });
      
      saved = await prisma.staffPreEmploymentMedical.upsert({
        where: { staffId: staff.id },
        update: { 
          data: formData,
          ...signatureData
        },
        create: { 
          staffId: staff.id, 
          data: formData,
          ...signatureData
        },
      });
    } else if (formKey === 'ndis_workforce_capability') {
      // Extract signature data if present
      const { signature, signatureDate, ...formData } = data;
      const signatureData = signature ? {
        staffSignature: signature,
        staffSignedAt: signatureDate ? new Date(signatureDate) : new Date()
      } : {};
      
      saved = await prisma.staffNdisWorkforceCapability.upsert({
        where: { staffId: staff.id },
        update: { 
          data: formData,
          ...signatureData
        },
        create: { 
          staffId: staff.id, 
          data: formData,
          ...signatureData
        },
      });
    } else if (formKey === 'bullying_harassment_training') {
      // Extract signature data if present
      const { signature, signatureDate, ...formData } = data;
      const signatureData = signature ? {
        staffSignature: signature,
        staffSignedAt: signatureDate ? new Date(signatureDate) : new Date()
      } : {};
      
      saved = await prisma.staffBullyingHarassmentTraining.upsert({
        where: { staffId: staff.id },
        update: { 
          data: formData,
          ...signatureData
        },
        create: { 
          staffId: staff.id, 
          data: formData,
          ...signatureData
        },
      });
    } else if (formKey === 'bullying_training') {
      try {
        // Extract signature data if present
        const { staffSignature, staffSignedAt, ...formData } = data;
        const signatureData = staffSignature ? {
          staffSignature: staffSignature,
          staffSignedAt: staffSignedAt ? new Date(staffSignedAt) : new Date()
        } : {};
        
        saved = await prisma.staffBullyingTraining.upsert({
          where: { staffId: staff.id },
          update: { 
            data: formData,
            ...signatureData
          },
          create: { 
            staffId: staff.id, 
            data: formData,
            ...signatureData
          },
        });
      } catch (error: any) {
        if (error.code === 'P2021') {
          // Table doesn't exist - create it and retry
          console.log('Creating missing StaffBullyingTraining table...');
          
          await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "StaffBullyingTraining" (
              "id" SERIAL NOT NULL,
              "staffId" INTEGER NOT NULL,
              "data" JSONB NOT NULL,
              "staffSignature" TEXT,
              "staffSignedAt" TIMESTAMP(3),
              "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
              "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT "StaffBullyingTraining_pkey" PRIMARY KEY ("id")
            )
          `);
          
          await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "StaffBullyingTraining_staffId_key" 
            ON "StaffBullyingTraining"("staffId")
          `);
          
          // Retry the operation
          const { staffSignature, staffSignedAt, ...formData } = data;
          const signatureData = staffSignature ? {
            staffSignature: staffSignature,
            staffSignedAt: staffSignedAt ? new Date(staffSignedAt) : new Date()
          } : {};
          
          saved = await prisma.staffBullyingTraining.upsert({
            where: { staffId: staff.id },
            update: { 
              data: formData,
              ...signatureData
            },
            create: { 
              staffId: staff.id, 
              data: formData,
              ...signatureData
            },
          });
        } else {
          throw error;
        }
      }
    } else if (formKey === 'ndis_code_of_conduct') {
      // Extract signature data if present
      const { signature, date, position, ...formData } = data;
      const signatureData = signature ? {
        staffSignature: signature,
        staffSignedAt: date ? new Date(date) : new Date()
      } : {};
      
      try {
        saved = await prisma.staffNdisCodeOfConduct.upsert({
          where: { staffId: staff.id },
          update: { 
            data: { ...formData, position },
            ...signatureData
          },
          create: { 
            staffId: staff.id, 
            data: { ...formData, position },
            ...signatureData
          },
        });
      } catch (error: any) {
        if (error.code === 'P2021') {
          // Table doesn't exist, create it and retry
          console.log('Creating missing StaffNdisCodeOfConduct table...');
          
          await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "StaffNdisCodeOfConduct" (
              "id" SERIAL NOT NULL,
              "staffId" INTEGER NOT NULL,
              "data" JSONB NOT NULL,
              "staffSignature" TEXT,
              "staffSignedAt" TIMESTAMP(3),
              "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
              "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
              CONSTRAINT "StaffNdisCodeOfConduct_pkey" PRIMARY KEY ("id")
            )
          `);
          
          await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "StaffNdisCodeOfConduct_staffId_key" 
            ON "StaffNdisCodeOfConduct"("staffId")
          `);
          
          await prisma.$executeRawUnsafe(`
            ALTER TABLE "StaffNdisCodeOfConduct" 
            ADD CONSTRAINT IF NOT EXISTS "StaffNdisCodeOfConduct_staffId_fkey" 
            FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE
          `);
          
          // Retry the operation
          saved = await prisma.staffNdisCodeOfConduct.upsert({
            where: { staffId: staff.id },
            update: { 
              data: { ...formData, position },
              ...signatureData
            },
            create: { 
              staffId: staff.id, 
              data: { ...formData, position },
              ...signatureData
            },
          });
        } else {
          throw error;
        }
      }
    } else if (formKey === 'vehicle_safety_inspection') {
      // Extract signature data if present
      const { signature, signatureDate, ...formData } = data;
      const signatureData = signature ? {
        staffSignature: signature,
        staffSignedAt: signatureDate ? new Date(signatureDate) : new Date()
      } : {};
      
      try {
        saved = await prisma.staffVehicleSafetyInspection.upsert({
          where: { staffId: staff.id },
          update: { 
            data: formData,
            ...signatureData
          },
          create: { 
            staffId: staff.id, 
            data: formData,
            ...signatureData
          },
        });
      } catch (error: any) {
        if (error.code === 'P2021' && error.message.includes('StaffVehicleSafetyInspection')) {
          // Table doesn't exist, use generic form submission
          saved = await prisma.staffFormSubmission.upsert({
            where: { staffId_formKey: { staffId: staff.id, formKey } },
            update: { data, isSubmitted: !!submit, submittedAt: submit ? new Date() : null },
            create: { staffId: staff.id, formKey, data, isSubmitted: !!submit, submittedAt: submit ? new Date() : null },
          });
        } else {
          throw error;
        }
      }
    } else if (formKey === 'conflict_of_interest') {
      // Extract employee signature data if present
      const { employeeSignature, employeeDate, ...allFormData } = data;
      const signatureData = employeeSignature ? {
        staffSignature: employeeSignature,
        staffSignedAt: employeeDate ? new Date(employeeDate) : new Date()
      } : {};
      
      try {
        saved = await prisma.staffConflictOfInterest.upsert({
          where: { staffId: staff.id },
          update: { 
            data: allFormData, // Store all form data including reviewer signature
            ...signatureData
          },
          create: { 
            staffId: staff.id, 
            data: allFormData, // Store all form data including reviewer signature
            ...signatureData
          },
        });
      } catch (error: any) {
        if (error.code === 'P2021' && error.message.includes('StaffConflictOfInterest')) {
          // Table doesn't exist, use generic form submission
          saved = await prisma.staffFormSubmission.upsert({
            where: { staffId_formKey: { staffId: staff.id, formKey } },
            update: { data, isSubmitted: !!submit, submittedAt: submit ? new Date() : null },
            create: { staffId: staff.id, formKey, data, isSubmitted: !!submit, submittedAt: submit ? new Date() : null },
          });
        } else {
          throw error;
        }
      }
    } else {
      // Generic form submission
      saved = await prisma.staffFormSubmission.upsert({
        where: { staffId_formKey: { staffId: staff.id, formKey } },
        update: { data, isSubmitted: !!submit, submittedAt: submit ? new Date() : null },
        create: { staffId: staff.id, formKey, data, isSubmitted: !!submit, submittedAt: submit ? new Date() : null },
      });
    }
    
    // Note: Individual form completion is tracked by the presence of data in submissions
    // If submitted, check if all required forms are completed and promote status
    if (submit) {
      try {
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
        ];

        const full = await prisma.staff.findUnique({
          where: { id: staff.id },
          include: {
            employmentDetails: true,
            employmentWelcomeAck: true,
            supportWorker: true,
            preEmploymentMedical: true,
            ndisWorkforceCapability: true,
            bullyingHarassmentTraining: true,
            bullyingTraining: true,
            ndisCodeOfConduct: true,
            conflictOfInterest: true,
            documentationAcknowledgement: true,
            vehicleSafetyInspection: true,
            submissions: { where: { isSubmitted: true } },
          }
        });

        const submittedKeys = new Set<string>([
          ...(full?.submissions?.map((s: any) => s.formKey) || []),
        ]);

        const allComplete = REQUIRED_KEYS.every((key) => {
          switch (key) {
            case 'employeeDetails': return !!full?.employmentDetails;
            case 'employee_welcome': return !!full?.employmentWelcomeAck;
            case 'support_worker': return !!full?.supportWorker;
            case 'pre_employment_medical': return !!full?.preEmploymentMedical;
            case 'ndis_workforce_capability': return !!full?.ndisWorkforceCapability;
            case 'bullying_harassment_training': return !!full?.bullyingHarassmentTraining;
            case 'bullying_training': return !!full?.bullyingTraining;
            case 'ndis_code_of_conduct': return !!full?.ndisCodeOfConduct || submittedKeys.has('ndis_code_of_conduct');
            case 'conflict_of_interest': return !!full?.conflictOfInterest || submittedKeys.has('conflict_of_interest');
            case 'documentation_acknowledgement': return !!full?.documentationAcknowledgement || submittedKeys.has('documentation_acknowledgement');
            case 'vehicle_safety_inspection': return !!full?.vehicleSafetyInspection || submittedKeys.has('vehicle_safety_inspection');
            default:
              return submittedKeys.has(key);
          }
        });

        if (allComplete && staff.status !== 'success') {
          await prisma.staff.update({ where: { id: staff.id }, data: { status: 'success' } });
          if (process.env.NODE_ENV !== 'production') {
            console.log(`[onboard] Marked staff ${staff.id} success (all forms completed)`);
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') console.warn('Completion check failed:', err);
      }
    }

    // Return success response with appropriate message
    const action = submit ? 'submitted' : 'saved';
    return NextResponse.json({ 
      success: true,
      message: `Form ${action} successfully`,
      id: saved.id ?? 0, 
      isSubmitted: !!submit,
      action: action
    });
    
  } catch (e: any) {
    console.error('Error saving staff form:', e);
    
    // Handle specific database errors
    if (e.code === 'P2002') {
      return NextResponse.json({ 
        error: 'Duplicate entry',
        message: 'This form has already been submitted. Please refresh the page to see the current status.',
        code: 'DUPLICATE_ENTRY'
      }, { status: 409 });
    }
    
    if (e.code === 'P2025') {
      return NextResponse.json({ 
        error: 'Record not found',
        message: 'The form data could not be found. Please try again.',
        code: 'RECORD_NOT_FOUND'
      }, { status: 404 });
    }
    
    if (e.code === 'P2003') {
      return NextResponse.json({ 
        error: 'Invalid reference',
        message: 'There was an issue with the form data. Please check your inputs and try again.',
        code: 'INVALID_REFERENCE'
      }, { status: 400 });
    }
    
    // Handle connection errors
    if (e.code === 'P1001') {
      return NextResponse.json({ 
        error: 'Database connection failed',
        message: 'Unable to save your form. Please check your internet connection and try again.',
        code: 'DATABASE_CONNECTION_ERROR'
      }, { status: 503 });
    }
    
    // Handle validation errors
    if (e.code === 'P2000') {
      return NextResponse.json({ 
        error: 'Data too long',
        message: 'Some of your form data is too long. Please shorten your inputs and try again.',
        code: 'DATA_TOO_LONG'
      }, { status: 400 });
    }
    
    // Handle timeout errors
    if (e.code === 'P1008') {
      return NextResponse.json({ 
        error: 'Operation timeout',
        message: 'The operation took too long to complete. Please try again.',
        code: 'OPERATION_TIMEOUT'
      }, { status: 408 });
    }
    
    // Generic error fallback
    return NextResponse.json({ 
      error: 'Failed to save form',
      message: 'An unexpected error occurred while saving your form. Please try again.',
      code: 'SAVE_ERROR',
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    }, { status: 500 });
  }
}


