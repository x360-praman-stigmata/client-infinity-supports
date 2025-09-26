import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

export async function POST(request: NextRequest) {
  try {
    const { formData, formTitle, staffName } = await request.json();

    if (!formData) {
      return NextResponse.json({ error: 'Form data is required' }, { status: 400 });
    }

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set font
    pdf.setFont('helvetica');
    
    // Add header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(formTitle || 'Staff Form', 105, 20, { align: 'center' });
    
    if (staffName) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Staff: ${staffName}`, 105, 30, { align: 'center' });
    }

    // Add form data
    let yPosition = 50;
    const lineHeight = 8;
    const pageHeight = 297; // A4 height in mm
    const margin = 20;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    // Helper function to add text with word wrapping
    const addText = (label: string, value: any, isBold = false) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      if (isBold) {
        pdf.setFont('helvetica', 'bold');
      }
      
      const text = `${label}: ${value || 'Not provided'}`;
      const splitText = pdf.splitTextToSize(text, 170);
      
      pdf.text(splitText, margin, yPosition);
      yPosition += splitText.length * lineHeight + 2;
      
      if (isBold) {
        pdf.setFont('helvetica', 'normal');
      }
    };

    // Add form fields based on form type
    if (formTitle?.toLowerCase().includes('conflict')) {
      // Conflict of Interest specific fields
      addText('Employee Name', formData.name, true);
      addText('Position', formData.position);
      addText('Department', formData.department);
      addText('Date', formData.date);
      
      yPosition += 5;
      addText('Has Conflict of Interest', formData.yesConflict ? 'Yes' : 'No', true);
      
      if (formData.yesConflict && formData.conflictDescription) {
        addText('Conflict Description', formData.conflictDescription);
      }
      
      if (formData.employeeDate) {
        yPosition += 5;
        addText('Employee Signature Date', formData.employeeDate, true);
      }
      
      // HR Section
      if (formData.reviewedBy || formData.reviewerTitle || formData.reviewDate) {
        yPosition += 10;
        pdf.setFont('helvetica', 'bold');
        pdf.text('HR/Management Section:', margin, yPosition);
        yPosition += lineHeight;
        pdf.setFont('helvetica', 'normal');
        
        if (formData.reviewedBy) addText('Reviewed By', formData.reviewedBy);
        if (formData.reviewerTitle) addText('Title', formData.reviewerTitle);
        if (formData.reviewDate) addText('Review Date', formData.reviewDate);
        if (formData.actionTaken) addText('Action Taken', formData.actionTaken);
        if (formData.reviewerDate) addText('Reviewer Signature Date', formData.reviewerDate);
      }
    } else {
      // Generic form field handling
      Object.entries(formData).forEach(([key, value]) => {
        if (key.includes('Signature')) return; // Skip signature fields
        
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        addText(label, value);
      });
    }

    // Add signature placeholders
    yPosition += 10;
    if (formData.employeeSignature) {
      pdf.text('Employee Signature: [Signed Electronically]', margin, yPosition);
      yPosition += lineHeight;
    }
    
    if (formData.reviewerSignature) {
      pdf.text('Reviewer Signature: [Signed Electronically]', margin, yPosition);
      yPosition += lineHeight;
    }

    // Add footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text(`Generated on ${new Date().toLocaleDateString()} - Page ${i} of ${pageCount}`, 105, pageHeight - 10, { align: 'center' });
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${formTitle?.replace(/[^a-zA-Z0-9]/g, '_') || 'form'}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
