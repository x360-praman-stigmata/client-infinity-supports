"use client";

import React, { useState } from 'react';
import { FaDownload, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

interface PDFDownloadButtonProps {
  formData: any;
  formTitle: string;
  staffName?: string;
  disabled?: boolean;
  className?: string;
}

export default function PDFDownloadButton({
  formData,
  formTitle,
  staffName,
  disabled = false,
  className = ""
}: PDFDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!formData || Object.keys(formData).length === 0) {
      toast.error('Form must be filled before downloading PDF');
      return;
    }

    try {
      setIsDownloading(true);
      
      // Create HTML content that matches the form exactly
      const htmlContent = createFormHTML(formData, formTitle, staffName);
      
      // Open new window for PDF
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked. Please allow popups for PDF generation.');
      }
      
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      };
      
      toast.success('PDF generation started');
      
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.error(error.message || 'Failed to generate PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownloadPDF}
      disabled={disabled || isDownloading}
      className={`flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isDownloading ? (
        <>
          <FaSpinner className="animate-spin" />
          <span>Generating...</span>
        </>
      ) : (
        <>
          <FaDownload />
          <span className="hidden sm:inline">Download PDF</span>
          <span className="sm:hidden">PDF</span>
        </>
      )}
    </button>
  );
}

// Helper function to calculate textarea height based on content
function getTextareaClass(content: string): string {
  if (!content) return 'textarea-field';
  const lineCount = content.split('\n').length;
  const charCount = content.length;
  
  // If content is long (more than 3 lines or 200 characters), use expandable class
  if (lineCount > 3 || charCount > 200) {
    return 'textarea-field long-text';
  }
  return 'textarea-field';
}

function createFormHTML(formData: any, formTitle: string, staffName?: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${formTitle}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            font-family: 'Open Sans', Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
            background: white;
          }
          
          @page {
            size: A4;
            margin: 20mm;
          }
          
          .page {
            width: 210mm;
            min-height: 297mm;
            padding: 20mm;
            margin: 0 auto;
            background: white;
            page-break-after: always;
          }
          
          .page:last-child {
            page-break-after: avoid;
          }
          
          .logo {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #c53030;
            margin-bottom: 5px;
          }
          
          .logo-subtitle {
            font-size: 14px;
            color: #666;
          }
          
          .form-title {
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            margin: 20px 0;
          }
          
          .section-title {
            font-weight: bold;
            margin: 15px 0 8px 0;
            font-size: 13px;
          }
          
          .field-row {
            display: flex;
            align-items: center;
            margin: 8px 0;
          }
          
          .field-label {
            width: 120px;
            font-weight: normal;
          }
          
          .field-value {
            flex: 1;
            border-bottom: 1px solid #666;
            padding: 2px 8px;
            min-height: 20px;
          }
          
          .checkbox-row {
            display: flex;
            align-items: flex-start;
            margin: 8px 0;
          }
          
          .checkbox {
            width: 12px;
            height: 12px;
            border: 1px solid #000;
            margin-right: 8px;
            margin-top: 2px;
            flex-shrink: 0;
            position: relative;
          }
          
          .checkbox.checked::after {
            content: '✓';
            position: absolute;
            left: 1px;
            top: -2px;
            font-size: 10px;
            font-weight: bold;
          }
          
          .textarea-field {
            border: 1px solid #666;
            padding: 8px;
            min-height: 80px;
            margin: 8px 0;
            width: 100%;
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow-wrap: break-word;
            line-height: 1.5;
            page-break-inside: avoid;
          }
          
          .textarea-field.long-text {
            min-height: auto;
            height: auto;
            page-break-inside: auto;
          }
          
          .section-with-textarea {
            page-break-inside: avoid;
          }
          
          .section-with-textarea.long-content {
            page-break-inside: auto;
          }
          
          .signature-box {
            border: 1px solid #666;
            height: 60px;
            margin: 8px 0;
            padding: 8px;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f9f9f9;
          }
          
          .signature-image {
            max-height: 50px;
            max-width: 200px;
          }
          
          .hr-line {
            border-top: 1px solid #666;
            margin: 20px 0;
          }
          
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .page { margin: 0; padding: 15mm; }
          }
        </style>
      </head>
      <body>
        <!-- Page 1 -->
        <div class="page">
          <div class="logo">
            <div class="logo-text">INFINITY SUPPORTS WA</div>
            <div class="logo-subtitle">Supporting Independence, Empowering Lives</div>
          </div>
          
          <div class="form-title">Conflict of Interest Disclosure Form</div>
          
          <div class="section-title">Employee Information:</div>
          <div class="field-row">
            <span class="field-label">Name:</span>
            <div class="field-value">${formData.name || staffName || ''}</div>
          </div>
          <div class="field-row">
            <span class="field-label">Position:</span>
            <div class="field-value">${formData.position || ''}</div>
          </div>
          <div class="field-row">
            <span class="field-label">Department:</span>
            <div class="field-value">${formData.department || ''}</div>
          </div>
          <div class="field-row">
            <span class="field-label">Date:</span>
            <div class="field-value">${formData.date || ''}</div>
          </div>
          
          <div class="section-title">Section 1: Disclosure of Potential Conflict of Interest</div>
          <p style="margin: 8px 0; font-size: 11px;">
            Do you have any financial, personal, or professional interests that may conflict, 
            or appear to conflict, with your duties at Infinity Supports WA Pty Ltd?
          </p>
          
          <div class="checkbox-row">
            <div class="checkbox ${formData.noConflict ? 'checked' : ''}"></div>
            <span>No, I do not have any conflicts to disclose.</span>
          </div>
          <div class="checkbox-row">
            <div class="checkbox ${formData.yesConflict ? 'checked' : ''}"></div>
            <span>Yes, I have a potential conflict to disclose. (Please provide details below.)</span>
          </div>
          
          ${formData.yesConflict && formData.conflictDescription ? `
            <div class="section-with-textarea ${formData.conflictDescription.length > 200 ? 'long-content' : ''}">
              <div class="section-title">Description of the potential conflict of interest:</div>
              <div class="${getTextareaClass(formData.conflictDescription)}">${formData.conflictDescription}</div>
            </div>
          ` : ''}
        </div>
        
        <!-- Page 2 -->
        <div class="page">
          <div class="logo">
            <div class="logo-text">INFINITY SUPPORTS WA</div>
            <div class="logo-subtitle">Supporting Independence, Empowering Lives</div>
          </div>
          
          <div class="form-title">Conflict of Interest Disclosure Form</div>
          
          <div class="section-title">Section 2: Relationships with Vendors, Clients, or Competitors</div>
          <p style="margin: 8px 0; font-size: 11px;">
            Do you or any immediate family members have any financial interest, employment, 
            or any other relationship with any vendors, clients, or competitors of Infinity Supports WA?
          </p>
          
          <div class="checkbox-row">
            <div class="checkbox ${formData.vendorNo ? 'checked' : ''}"></div>
            <span>No</span>
          </div>
          <div class="checkbox-row">
            <div class="checkbox ${formData.vendorYes ? 'checked' : ''}"></div>
            <span>Yes (Please provide details below.)</span>
          </div>
          
          ${formData.vendorYes && formData.vendorDetails ? `
            <div class="section-with-textarea ${formData.vendorDetails.length > 200 ? 'long-content' : ''}">
              <div class="section-title">Description of vendor/client/competitor relationships:</div>
              <div class="${getTextareaClass(formData.vendorDetails)}">${formData.vendorDetails}</div>
            </div>
          ` : ''}
          
          <div class="section-title">Section 3: Outside Employment or Business Activities</div>
          <p style="margin: 8px 0; font-size: 11px;">
            Are you engaged in any outside employment, consulting, or business activities 
            that may impact your role at Infinity Supports WA?
          </p>
          
          <div class="checkbox-row">
            <div class="checkbox ${formData.employmentNo ? 'checked' : ''}"></div>
            <span>No</span>
          </div>
          <div class="checkbox-row">
            <div class="checkbox ${formData.employmentYes ? 'checked' : ''}"></div>
            <span>Yes (Please provide details below.)</span>
          </div>
          
          ${formData.employmentYes && formData.employmentDetails ? `
            <div class="section-with-textarea ${formData.employmentDetails.length > 200 ? 'long-content' : ''}">
              <div class="section-title">Description of outside employment or business activities:</div>
              <div class="${getTextareaClass(formData.employmentDetails)}">${formData.employmentDetails}</div>
            </div>
          ` : ''}
        </div>
        
        <!-- Page 3 -->
        <div class="page">
          <div class="logo">
            <div class="logo-text">INFINITY SUPPORTS WA</div>
            <div class="logo-subtitle">Supporting Independence, Empowering Lives</div>
          </div>
          
          <div class="form-title">Conflict of Interest Disclosure Form</div>
          
          <div class="section-title">Section 4: Acknowledgment and Certification</div>
          <p style="margin: 8px 0; font-size: 11px;">
            I certify that the information provided above is complete and accurate to the best of my knowledge. 
            I understand that failure to disclose a potential conflict of interest may result in disciplinary 
            action, up to and including termination of employment. If a potential conflict arises after signing 
            this form, I will promptly notify Infinity Supports WA in writing.
          </p>
          
          <div class="section-title">Employee Signature:</div>
          <div class="signature-box">
            ${formData.employeeSignature ? 
              `<img src="${formData.employeeSignature}" alt="Employee Signature" class="signature-image" />` : 
              'No signature provided'
            }
          </div>
          
          <div class="field-row">
            <span class="field-label">Employee Date:</span>
            <div class="field-value">${formData.employeeDate || ''}</div>
          </div>
          
          <div class="hr-line"></div>
          
          <div class="section-title">For HR/Management Use Only:</div>
          <div class="field-row">
            <span class="field-label">Reviewed by:</span>
            <div class="field-value">${formData.reviewedBy || ''}</div>
          </div>
          <div class="field-row">
            <span class="field-label">Title:</span>
            <div class="field-value">${formData.reviewerTitle || ''}</div>
          </div>
          <div class="field-row">
            <span class="field-label">Date:</span>
            <div class="field-value">${formData.reviewDate || ''}</div>
          </div>
          
          <div class="section-with-textarea ${(formData.actionTaken || '').length > 200 ? 'long-content' : ''}">
            <div class="section-title">Action Taken (if applicable):</div>
            <div class="${getTextareaClass(formData.actionTaken || '')}">${formData.actionTaken || ''}</div>
          </div>
          
          <div class="section-title">Signature of Reviewer:</div>
          <div class="signature-box">
            ${formData.reviewerSignature ? 
              `<img src="${formData.reviewerSignature}" alt="Reviewer Signature" class="signature-image" />` : 
              'No signature provided'
            }
          </div>
          
          <div class="field-row">
            <span class="field-label">Date:</span>
            <div class="field-value">${formData.reviewerDate || ''}</div>
          </div>
          
          <div class="section-title">Decision:</div>
          <div class="checkbox-row">
            <div class="checkbox ${formData.decisionNoAction ? 'checked' : ''}"></div>
            <span>No action required</span>
          </div>
          <div class="checkbox-row">
            <div class="checkbox ${formData.decisionMitigation ? 'checked' : ''}"></div>
            <span>Mitigation measures implemented</span>
          </div>
          <div class="checkbox-row">
            <div class="checkbox ${formData.decisionFurtherReview ? 'checked' : ''}"></div>
            <span>Further review required</span>
          </div>
        </div>
      </body>
    </html>
  `;
}
