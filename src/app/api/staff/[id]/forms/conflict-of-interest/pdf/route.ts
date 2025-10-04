import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import puppeteer from 'puppeteer';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {   
  try {
    const { id } = await params;
    const staffId = parseInt(id);
    
    const db: any = prisma as any;
    const staff = await db.staff.findUnique({
      where: { id: staffId },
      select: { id: true, firstName: true, surname: true, email: true }
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff not found' }, { status: 404 });
    }

    const conflictOfInterest = await db.staffConflictOfInterest.findUnique({
      where: { staffId }
    });

    if (!conflictOfInterest) {
      return NextResponse.json({ error: 'Conflict of interest form not found' }, { status: 404 });
    }

    // Generate PDF using puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set the HTML content for the PDF
    const htmlContent = generateConflictOfInterestHTML(conflictOfInterest.data, staff);
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });

    await browser.close();

    // Return the PDF as a response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="conflict-of-interest-${staff.firstName}-${staff.surname}.pdf"`
      }
    });

  } catch (error: any) {
    console.error('Error generating conflict of interest PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

function generateConflictOfInterestHTML(data: any, staff: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Conflict of Interest Disclosure Form</title>
      <style>
        body {
          font-family: 'Open Sans', Arial, sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          margin: 0;
          padding: 20px;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          width: 350px;
          height: 160px;
          object-fit: contain;
          margin-bottom: 20px;
        }
        .title {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 30px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-weight: bold;
          margin-bottom: 10px;
        }
        .field {
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }
        .field-label {
          width: 120px;
          font-weight: normal;
        }
        .field-value {
          border-bottom: 1px solid #000;
          padding: 2px 5px;
          min-width: 300px;
          flex: 1;
        }
        .checkbox {
          margin-right: 8px;
        }
        .checkbox-label {
          margin-left: 5px;
        }
        .textarea-field {
          border: 1px solid #000;
          padding: 10px;
          min-height: 100px;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .signature-line {
          border-bottom: 1px solid #000;
          width: 200px;
          margin: 20px 0 5px 0;
        }
        .signature-label {
          font-size: 10px;
          color: #666;
        }
        hr {
          border: none;
          border-top: 1px solid #ccc;
          margin: 20px 0;
        }
        .required {
          color: red;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==" class="logo" alt="Infinity Supports WA Logo">
        <div class="title">Conflict of Interest Disclosure Form</div>
      </div>

      <div class="section">
        <div class="section-title">Employee Information:</div>
        <div class="field">
          <span class="field-label">Name:</span>
          <span class="field-value">${data.name || '____________________________'}</span>
        </div>
        <div class="field">
          <span class="field-label">Position:</span>
          <span class="field-value">${data.position || '____________________________'}</span>
        </div>
        <div class="field">
          <span class="field-label">Department:</span>
          <span class="field-value">${data.department || '____________________________'}</span>
        </div>
        <div class="field">
          <span class="field-label">Date:</span>
          <span class="field-value">${data.date || '____________________________'}</span>
        </div>
      </div>

      <hr>

      <div class="section">
        <div class="section-title">Section 1: Disclosure of Potential Conflict of Interest</div>
        <p>Do you have any financial, personal, or professional interests that may conflict, or appear to conflict, with your duties at Infinity Supports WA Pty Ltd?</p>
        
        <div class="field">
          <span class="checkbox">${data.noConflict ? '☑' : '☐'}</span>
          <span class="checkbox-label">No, I do not have any conflicts to disclose.</span>
        </div>
        <div class="field">
          <span class="checkbox">${data.yesConflict ? '☑' : '☐'}</span>
          <span class="checkbox-label">Yes, I have a potential conflict to disclose. (Please provide details below.)</span>
        </div>

        ${data.yesConflict ? `
          <div class="section-title">Description of the potential conflict of interest:</div>
          <div class="textarea-field">${data.conflictDescription || ''}</div>
        ` : ''}
      </div>

      <hr>

      <div class="section">
        <div class="section-title">Section 2: Relationships with Vendors, Clients, or Competitors</div>
        <p>Do you or any immediate family members have any financial interest, employment, or any other relationship with any vendors, clients, or competitors of Infinity Supports WA?</p>
        
        <div class="field">
          <span class="checkbox">${data.vendorNo ? '☑' : '☐'}</span>
          <span class="checkbox-label">No</span>
        </div>
        <div class="field">
          <span class="checkbox">${data.vendorYes ? '☑' : '☐'}</span>
          <span class="checkbox-label">Yes (If yes, please describe the relationship below.)</span>
        </div>

        ${data.vendorYes ? `
          <div class="section-title">Description of vendor relationship:</div>
          <div class="textarea-field">${data.vendorDetails || ''}</div>
        ` : ''}
      </div>

      ${data.staffSignature ? `
        <hr>
        <div class="section">
          <div class="section-title">Employee Signature:</div>
          <div class="signature-line"></div>
          <div class="signature-label">Staff Signature</div>
          <p><strong>Signed:</strong> ${data.staffSignedAt ? new Date(data.staffSignedAt).toLocaleDateString() : ''}</p>
        </div>
      ` : ''}
    </body>
    </html>
  `;
}
