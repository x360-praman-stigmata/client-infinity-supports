import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';
import { jsPDF } from 'jspdf';

export async function POST(request: NextRequest) {
  try {
    const { formData } = await request.json();

    if (!formData) {
      return NextResponse.json({ error: 'Form data is required' }, { status: 400 });
    }

    console.log('PDF Generation Request:', {
      hasFormData: !!formData,
      formDataKeys: Object.keys(formData),
      fullName: formData.fullName,
      fundChoice: formData.fundChoice,
      employeeNumber: formData.employeeNumber,
      tfn: formData.tfn
    });

    // Launch browser
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Set viewport size to match form component dimensions
    await page.setViewportSize({ width: 800, height: 1000 });

    // Get the base URL for images
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Create HTML content for the form with manual alignment
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Superannuation Standard Choice Form</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: white;
              width: 800px;
              height: 1000px;
            }
            .form-page {
              width: 800px;
              height: 1000px;
              position: relative;
              background: white;
            }
            .form-image {
              width: 800px;
              height: 1000px;
              position: absolute;
              top: 0;
              left: 0;
              z-index: 1;
            }
            .field-overlay {
              position: absolute;
              background: rgba(255, 0, 0, 0.3); /* RED DEBUG BACKGROUND */
              border: 2px solid red; /* RED DEBUG BORDER */
              color: black;
              font-size: 12px;
              font-weight: normal;
              z-index: 2;
              padding: 2px;
              margin: 0;
              line-height: 1;
            }
            .checkbox-overlay {
              position: absolute;
              border: 2px solid blue; /* BLUE DEBUG BORDER */
              background: rgba(0, 0, 255, 0.3); /* BLUE DEBUG BACKGROUND */
              z-index: 2;
            }
            .checkbox-overlay.checked {
              background: black;
            }
            .signature-overlay {
              position: absolute;
              background: transparent;
              border: none;
              z-index: 2;
            }
            .date-field {
              position: absolute;
              color: black;
              font-size: 12px;
              z-index: 2;
            }
          </style>
        </head>
        <body>
          <!-- Page 1 -->
          <div class="form-page">
            <img src="${baseUrl}/stafForms/super choice form-page1.jpg" class="form-image" />
            
            <!-- Section A Fields - Moved more to the right -->
            <div class="field-overlay" style="top: 460px; left: 420px; width: 400px; height: 20px;">
              ${formData.fullName || ''}
            </div>
            
            <!-- Employee Number - Individual digit boxes (16 boxes) -->
            <div style="position: absolute; top: 520px; left: 420px; z-index: 10;">
              ${Array.from({length: 16}, (_, i) => {
                const digit = (formData.employeeNumber || '').charAt(i) || '';
                return `<div style="display: inline-block; width: 12px; height: 18px; border: 1px solid #000; text-align: center; margin-right: 1px; background: white; line-height: 18px; font-size: 10px; vertical-align: top;">${digit}</div>`;
              }).join('')}
            </div>
            
            <!-- TFN - Individual digit boxes (9 boxes with 3-3-3 grouping) -->
            <div style="position: absolute; top: 580px; left: 420px; z-index: 10;">
              ${Array.from({length: 9}, (_, i) => {
                const digit = (formData.tfn || '').charAt(i) || '';
                const marginRight = (i === 2 || i === 5) ? '6px' : '1px';
                return `<div style="display: inline-block; width: 12px; height: 18px; border: 1px solid #000; text-align: center; margin-right: ${marginRight}; background: white; line-height: 18px; font-size: 10px; vertical-align: top;">${digit}</div>`;
              }).join('')}
            </div>
            
            <!-- Fund Choice Checkboxes - Exact positions from form -->
            <div class="checkbox-overlay ${formData.fundChoice === 'existing' ? 'checked' : ''}" 
                 style="top: 700px; left: 100px; width: 15px; height: 15px;"></div>
            <div class="checkbox-overlay ${formData.fundChoice === 'default' ? 'checked' : ''}" 
                 style="top: 770px; left: 100px; width: 15px; height: 15px;"></div>
            <div class="checkbox-overlay ${formData.fundChoice === 'smsf' ? 'checked' : ''}" 
                 style="top: 840px; left: 100px; width: 15px; height: 15px;"></div>
          </div>

          <!-- Page 2 -->
          <div class="form-page">
            <img src="${baseUrl}/stafForms/super choice form-page2.jpg" class="form-image" />
            
            <!-- Section B Fields - Pixel perfect alignment from actual form -->
            <div class="field-overlay" style="top: 280px; left: 180px; width: 450px; height: 18px;">
              ${formData.superFundName || ''}
            </div>
            
            <div class="field-overlay" style="top: 360px; left: 180px; width: 300px; height: 18px;">
              ${formData.superFundABN || ''}
            </div>
            
            <div class="field-overlay" style="top: 440px; left: 180px; width: 300px; height: 18px;">
              ${formData.superFundUSI || ''}
            </div>
            
            <div class="field-overlay" style="top: 520px; left: 180px; width: 300px; height: 18px;">
              ${formData.memberAccountNumber || ''}
            </div>
            
            <div class="field-overlay" style="top: 600px; left: 180px; width: 450px; height: 18px;">
              ${formData.accountName || ''}
            </div>
            
            <div class="checkbox-overlay ${formData.hasComplianceLetter ? 'checked' : ''}" 
                 style="top: 720px; left: 60px; width: 12px; height: 12px;"></div>
            
            <div class="signature-overlay" style="top: 820px; left: 180px; width: 350px; height: 40px;">
              ${formData.sectionBSignature ? '<img src="' + formData.sectionBSignature + '" style="width: 100%; height: 100%; object-fit: contain;" />' : ''}
            </div>
            
            <div class="date-field" style="top: 820px; left: 650px;">
              ${formData.sectionBDate?.day || ''}/${formData.sectionBDate?.month || ''}/${formData.sectionBDate?.year || ''}
            </div>
          </div>

          <!-- Page 3 -->
          <div class="form-page">
            <img src="${baseUrl}/stafForms/super choice form-page3.jpg" class="form-image" />
            
            <!-- Section C Fields - Pixel perfect alignment from actual form -->
            <div class="field-overlay" style="top: 280px; left: 180px; width: 400px; height: 18px;">
              ${formData.businessName || ''}
            </div>
            
            <div class="field-overlay" style="top: 360px; left: 180px; width: 300px; height: 18px;">
              ${formData.businessABN || ''}
            </div>
            
            <div class="field-overlay" style="top: 440px; left: 180px; width: 400px; height: 18px;">
              ${formData.defaultSuperFundName || ''}
            </div>
            
            <div class="field-overlay" style="top: 520px; left: 180px; width: 300px; height: 18px;">
              ${formData.defaultSuperFundABN || ''}
            </div>
            
            <div class="field-overlay" style="top: 600px; left: 180px; width: 300px; height: 18px;">
              ${formData.defaultSuperFundUSI || ''}
            </div>
            
            <div class="checkbox-overlay ${formData.chooseDefaultFund ? 'checked' : ''}" 
                 style="top: 720px; left: 60px; width: 12px; height: 12px;"></div>
            
            <div class="signature-overlay" style="top: 820px; left: 180px; width: 350px; height: 40px;">
              ${formData.sectionCSignature ? '<img src="' + formData.sectionCSignature + '" style="width: 100%; height: 100%; object-fit: contain;" />' : ''}
            </div>
            
            <div class="date-field" style="top: 820px; left: 650px;">
              ${formData.sectionCDate?.day || ''}/${formData.sectionCDate?.month || ''}/${formData.sectionCDate?.year || ''}
            </div>
          </div>

          <!-- Page 4 -->
          <div class="form-page">
            <img src="${baseUrl}/stafForms/super choice form-page4.jpg" class="form-image" />
            
            <!-- Section D Fields - Pixel perfect alignment from actual form -->
            <div class="field-overlay" style="top: 240px; left: 180px; width: 400px; height: 18px;">
              ${formData.smsfName || ''}
            </div>
            
            <div class="field-overlay" style="top: 320px; left: 180px; width: 300px; height: 18px;">
              ${formData.smsfABN || ''}
            </div>
            
            <div class="field-overlay" style="top: 400px; left: 180px; width: 400px; height: 18px;">
              ${formData.smsfESA || ''}
            </div>
            
            <div class="field-overlay" style="top: 480px; left: 180px; width: 400px; height: 18px;">
              ${formData.smsfAccountName || ''}
            </div>
            
            <div class="field-overlay" style="top: 560px; left: 180px; width: 400px; height: 18px;">
              ${formData.bankAccountName || ''}
            </div>
            
            <div class="field-overlay" style="top: 640px; left: 180px; width: 100px; height: 18px;">
              ${formData.bsbCode || ''}
            </div>
            
            <div class="field-overlay" style="top: 720px; left: 180px; width: 200px; height: 18px;">
              ${formData.accountNumber || ''}
            </div>
            
            <div class="checkbox-overlay ${formData.hasSMSFEvidence ? 'checked' : ''}" 
                 style="top: 800px; left: 60px; width: 12px; height: 12px;"></div>
            
            <div class="signature-overlay" style="top: 900px; left: 180px; width: 350px; height: 40px;">
              ${formData.sectionDSignature ? '<img src="' + formData.sectionDSignature + '" style="width: 100%; height: 100%; object-fit: contain;" />' : ''}
            </div>
            
            <div class="date-field" style="top: 900px; left: 650px;">
              ${formData.sectionDDate?.day || ''}/${formData.sectionDDate?.month || ''}/${formData.sectionDDate?.year || ''}
            </div>
          </div>

          <!-- Page 5 -->
          <div class="form-page">
            <img src="${baseUrl}/stafForms/super choice form-page5.jpg" class="form-image" />
          </div>
        </body>
      </html>
    `;

    // Set content and wait for images to load
    await page.setContent(htmlContent);
    
    // Wait for all images to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Additional wait for images
    
    // Check if images loaded properly
    const imageElements = await page.locator('img').all();
    for (const img of imageElements) {
      const isLoaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalHeight !== 0);
      if (!isLoaded) {
        console.warn('Image failed to load:', await img.getAttribute('src'));
      }
    }

    // Take screenshots of each page
    const screenshots = [];
    const pages = await page.locator('.form-page').all();
    
    console.log(`Found ${pages.length} form pages to screenshot`);
    
    for (let i = 0; i < pages.length; i++) {
      try {
        const screenshot = await pages[i].screenshot({ 
          type: 'png',
          fullPage: false // Only screenshot the visible area
        });
        screenshots.push(screenshot);
        console.log(`Screenshot taken for page ${i + 1}`);
      } catch (error) {
        console.error(`Failed to screenshot page ${i + 1}:`, error);
        // Create a blank screenshot as fallback
        const blankScreenshot = Buffer.alloc(0);
        screenshots.push(blankScreenshot);
      }
    }

    await browser.close();

    // Create PDF from screenshots
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    console.log(`Creating PDF with ${screenshots.length} screenshots`);

    for (let i = 0; i < screenshots.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      
      if (screenshots[i] && screenshots[i].length > 0) {
        try {
          const imgData = `data:image/png;base64,${screenshots[i].toString('base64')}`;
          // Use exact dimensions: 800px width = 210mm, 1000px height = 262.5mm
          pdf.addImage(imgData, 'PNG', 0, 0, 210, 262.5);
          console.log(`Added page ${i + 1} to PDF`);
        } catch (error) {
          console.error(`Failed to add page ${i + 1} to PDF:`, error);
          // Add a blank page with text
          pdf.setFontSize(16);
          pdf.text(`Page ${i + 1} - Superannuation Standard Choice Form`, 20, 20);
          pdf.setFontSize(12);
          pdf.text('Form data:', 20, 40);
          pdf.text(`Full Name: ${formData.fullName || 'Not provided'}`, 20, 50);
          pdf.text(`Fund Choice: ${formData.fundChoice || 'Not selected'}`, 20, 60);
        }
      } else {
        console.warn(`Screenshot ${i + 1} is empty, adding blank page`);
        // Add a blank page with text
        pdf.setFontSize(16);
        pdf.text(`Page ${i + 1} - Superannuation Standard Choice Form`, 20, 20);
        pdf.setFontSize(12);
        pdf.text('Form data:', 20, 40);
        pdf.text(`Full Name: ${formData.fullName || 'Not provided'}`, 20, 50);
        pdf.text(`Fund Choice: ${formData.fundChoice || 'Not selected'}`, 20, 60);
      }
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    console.log(`PDF generated successfully, size: ${pdfBuffer.length} bytes`);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="superannuation-standard-choice-form.pdf"',
      },
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
