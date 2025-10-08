"use client";

import { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

interface DownloadUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadComplete: () => void;
  formName: string;
  pdfUrl: string;
  formKey: string;
  staffId: number;
}

export default function DownloadUnlockModal({
  isOpen,
  onClose,
  onDownloadComplete,
  formName,
  pdfUrl,
  formKey,
  staffId
}: DownloadUnlockModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const { showToast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Trigger actual download first
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${formName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Wait a moment for download to start, then track it
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Track download in database AFTER download is triggered
      const response = await fetch('/api/staff/form-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId,
          formKey,
          pdfUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to track download');
      }

      // Mark download as complete
      onDownloadComplete();
      onClose();

      showToast({
        type: 'success',
        title: 'Download Complete',
        message: `${formName} has been downloaded. You can now fill the form.`,
        duration: 3000
      });

    } catch (error: any) {
      console.error('Download error:', error);
      showToast({
        type: 'error',
        title: 'Download Failed',
        message: error.message || 'Failed to download the form',
        duration: 3000
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Download Required
          </h3>

          {/* Message */}
          <p className="text-gray-600 mb-6">
            To unlock the <strong>{formName}</strong> form, you must first download and read the complete document. 
            This ensures you have a copy for reference and have reviewed all the information.
          </p>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDownloading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download {formName}
              </>
            )}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="mt-3 text-gray-500 hover:text-gray-700 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
