"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import DownloadUnlockModal from './DownloadUnlockModal';

interface FormLockWrapperProps {
  children: React.ReactNode;
  staffId: number;
  formKey: string;
  formName: string;
  pdfUrl: string;
  isFormComplete?: boolean;
  onCancelDownload?: () => void; // Callback when user cancels download
}

export default function FormLockWrapper({
  children,
  staffId,
  formKey,
  formName,
  pdfUrl,
  isFormComplete = false,
  onCancelDownload
}: FormLockWrapperProps) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Check download status on mount
  useEffect(() => {
    const checkDownloadStatus = async () => {
      try {
        const response = await fetch(`/api/staff/form-download?staffId=${staffId}&formKey=${formKey}`);
        const data = await response.json();
        
        if (response.ok) {
          setIsDownloaded(data.hasDownloaded);
          console.log('Download status check:', {
            staffId,
            formKey,
            hasDownloaded: data.hasDownloaded,
            isFormComplete,
            willShowModal: !data.hasDownloaded && !isFormComplete
          });
        }
      } catch (error) {
        console.error('Error checking download status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkDownloadStatus();
  }, [staffId, formKey]);

  // Show modal if form is not downloaded and not complete
  useEffect(() => {
    console.log('Modal show logic:', {
      loading,
      isDownloaded,
      isFormComplete,
      shouldShowModal: !loading && !isDownloaded && !isFormComplete
    });
    
    if (!loading && !isDownloaded && !isFormComplete) {
      console.log('Showing download modal');
      setShowModal(true);
    } else {
      console.log('Not showing modal - form unlocked');
      setShowModal(false);
    }
  }, [loading, isDownloaded, isFormComplete]);

  const handleDownloadComplete = () => {
    setIsDownloaded(true);
    setShowModal(false);
  };

  const handleCancelDownload = () => {
    setShowModal(false);
    if (onCancelDownload) {
      onCancelDownload();
    }
  };

  const handleFormInteraction = (e: React.MouseEvent) => {
    if (!isDownloaded && !isFormComplete) {
      e.preventDefault();
      e.stopPropagation();
      setShowModal(true);
      showToast({
        type: 'warning',
        title: 'Form Locked',
        message: `Please download ${formName} first to unlock the form.`,
        duration: 3000
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <DownloadUnlockModal
        isOpen={showModal}
        onClose={handleCancelDownload}
        onDownloadComplete={handleDownloadComplete}
        formName={formName}
        pdfUrl={pdfUrl}
        formKey={formKey}
        staffId={staffId}
      />
      
      <div 
        className={`relative ${!isDownloaded && !isFormComplete ? 'pointer-events-none opacity-50' : ''}`}
        onClick={handleFormInteraction}
      >
        {children}
        
        {/* Lock overlay */}
        {!isDownloaded && !isFormComplete && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Form Locked</h3>
              <p className="text-gray-600 mb-4">
                Download {formName} to unlock this form
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Download Now
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
