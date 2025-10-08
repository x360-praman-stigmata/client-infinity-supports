"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import EmployeeWelcomeAckForm, { EmployeeWelcomeAckFormRef } from '../../components/EmployeeWelcomeAckForm';
import FormLockWrapper from '@/components/ui/FormLockWrapper';
import { useToast } from '@/components/ui/Toast';
import BackToFormsModal from '@/components/ui/BackToFormsModal-improved';
import OptimizedFormLoader from '@/components/ui/OptimizedFormLoader';
import EnhancedFormWrapper from '@/components/ui/EnhancedFormWrapper';
import FormErrorBoundary from '@/components/ui/FormErrorBoundary';

export default function ImprovedEmployeeWelcomeFormPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [staff, setStaff] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const formRef = useRef<EmployeeWelcomeAckFormRef>(null);

  const formConfig = {
    key: 'employee_welcome',
    name: 'Employee Welcome Pack',
    pdfUrl: '/stafForms/Employee%20Welcome%20Pack.pdf'
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/staff/onboard/${token}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);
        
        setStaff(data.staff);
        const welcomeData = data.submissions['employee_welcome'] || {};
        setFormData(welcomeData);
        
        const isComplete = !!(welcomeData.readAcknowledgement && 
                              welcomeData.fullName && 
                              welcomeData.signature && 
                              welcomeData.date);
        setIsFormComplete(isComplete);
      } catch (error: any) {
        console.error('Error loading data:', error);
        showToast({
          type: 'error',
          title: 'Loading Failed',
          message: error.message,
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) loadData();
  }, [token, showToast]);

  useEffect(() => {
    const hasChanges = Object.keys(formData).some(key => {
      const value = formData[key];
      return value !== undefined && value !== null && value !== '';
    });
    setHasUnsavedChanges(hasChanges);
    
    const isComplete = !!(formData.readAcknowledgement && 
                          formData.fullName && 
                          formData.signature && 
                          formData.date);
    setIsFormComplete(isComplete);
  }, [formData]);

  const handleSave = async (isSubmit = false) => {
    if (!formRef.current) return;
    
    if (isSubmit) {
      try {
        const downloadResponse = await fetch(`/api/staff/form-download?staffId=${staff.id}&formKey=employee_welcome`);
        const downloadData = await downloadResponse.json();
        
        if (!downloadData.hasDownloaded) {
          showToast({
            type: 'error',
            title: 'Download Required',
            message: 'You must download the Employee Welcome Pack PDF before submitting.',
            duration: 5000
          });
          return;
        }
      } catch (error) {
        console.error('Error checking download status:', error);
        showToast({
          type: 'error',
          title: 'Validation Error',
          message: 'Unable to verify download status. Please try again.',
          duration: 5000
        });
        return;
      }
    }
    
    setSaving(true);
    try {
      const success = await formRef.current.save(isSubmit);
      
      if (success && isSubmit) {
        showToast({
          type: 'success',
          title: 'Form Submitted',
          message: 'Your form has been submitted successfully. Redirecting...',
          duration: 3000
        });
        setTimeout(() => {
          router.push(`/staff/onboard/${token}`);
        }, 1000);
      } else if (success) {
        showToast({
          type: 'success',
          title: 'Draft Saved',
          message: 'Your draft has been saved successfully',
          duration: 3000
        });
        setHasUnsavedChanges(false);
      }
    } catch (error: any) {
      console.error('Error saving:', error);
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: error.message || 'Failed to save your form. Please try again.',
        duration: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowBackModal(true);
    } else {
      router.push(`/staff/onboard/${token}`);
    }
  };

  const handleSaveAndExit = async () => {
    await handleSave(false);
    setShowBackModal(false);
    router.push(`/staff/onboard/${token}`);
  };

  const handleDiscardAndExit = () => {
    setShowBackModal(false);
    router.push(`/staff/onboard/${token}`);
  };

  const handleAckFormChange = (newData: any) => {
    setFormData(newData);
  };

  if (loading) {
    return (
      <OptimizedFormLoader 
        loadingText="Loading Employee Welcome Form"
        minLoadTime={300}
      >
        <div />
      </OptimizedFormLoader>
    );
  }

  return (
    <FormErrorBoundary>
      <EnhancedFormWrapper
        onSave={handleSave}
        hasUnsavedChanges={hasUnsavedChanges}
        autoSaveInterval={30000}
        enableKeyboardShortcuts={true}
      >
        <div className="min-h-screen bg-gray-100 py-8">
          <div className="max-w-4xl mx-auto px-4">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Employee Welcome</h1>
                  <p className="text-gray-600">{staff?.firstName} {staff?.surname}</p>
                </div>
                <button
                  onClick={handleBackClick}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  ← Back to Forms
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <FormLockWrapper
                staffId={staff.id}
                formKey={formConfig.key}
                formName={formConfig.name}
                pdfUrl={formConfig.pdfUrl}
                isFormComplete={isFormComplete}
                onCancelDownload={() => router.push(`/staff/onboard/${token}`)}
              >
                <EmployeeWelcomeAckForm 
                  ref={formRef}
                  token={token}
                  onChange={handleAckFormChange}
                />
              </FormLockWrapper>
              
              {/* Action Buttons */}
              <div className="flex gap-4 mt-8 pt-6 border-t">
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 transition-all flex items-center gap-2 ${
                    saving 
                      ? 'bg-gray-500' 
                      : 'bg-gray-500 hover:bg-gray-600'
                  }`}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Draft'
                  )}
                </button>
                
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving || !isFormComplete}
                  className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 transition-all flex items-center gap-2 ${
                    saving 
                      ? 'bg-blue-500' 
                      : isFormComplete 
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-400 cursor-not-allowed'
                  }`}
                  title={!isFormComplete ? 'Complete all required fields to submit' : 'Submit form'}
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit & Continue'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Back to Forms Modal */}
          <BackToFormsModal
            isOpen={showBackModal}
            onClose={() => setShowBackModal(false)}
            onSaveAndExit={handleSaveAndExit}
            onDiscardAndExit={handleDiscardAndExit}
            formName="Employee Welcome Pack"
            hasUnsavedChanges={hasUnsavedChanges}
          />
        </div>
      </EnhancedFormWrapper>
    </FormErrorBoundary>
  );
}
