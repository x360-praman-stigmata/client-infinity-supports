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
    // Check if form has required data
    if (!formData || Object.keys(formData).length === 0) {
      toast.error('Form must be filled before downloading PDF');
      return;
    }

    try {
      setIsDownloading(true);
      
      // Create a temporary form submission for PDF generation
      const response = await fetch('/api/staff/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          formTitle,
          staffName
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Generate filename
      const sanitizedTitle = formTitle.replace(/[^a-zA-Z0-9]/g, '_');
      const sanitizedName = staffName?.replace(/[^a-zA-Z0-9]/g, '_') || 'staff';
      a.download = `${sanitizedTitle}_${sanitizedName}.pdf`;
      
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('PDF downloaded successfully');
      
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error(error.message || 'Failed to download PDF');
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
          <span>Downloading...</span>
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
