"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import EmployeeWelcomeAckForm, { EmployeeWelcomeAckFormRef } from '../../components/EmployeeWelcomeAckForm';
import FormLockWrapper from '@/components/ui/FormLockWrapper';
import { useToast } from '@/components/ui/Toast';
import BackToFormsModal from '@/components/ui/BackToFormsModal';

export default function EmployeeWelcomeFormPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [staff, setStaff] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [showBackModal, setShowBackModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const formRef = useRef<EmployeeWelcomeAckFormRef>(null);

  // Form configuration
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
        
        // Check if form is complete (has all required fields filled)
        const isComplete = !!(welcomeData.readAcknowledgement && 
                              welcomeData.fullName && 
                              welcomeData.signature && 
                              welcomeData.date);
        setIsFormComplete(isComplete);
        
        // Wait for the form component to be fully mounted and ready
        setTimeout(() => {
          setFormReady(true);
        }, 800); // Increased delay to ensure form is fully ready
      } catch (error: any) {
        console.error('Error loading data:', error);
        alert(error.message);
        setFormReady(true); // Show form even on error
      } finally {
        setLoading(false);
      }
    };


    if (token) loadData();
  }, [token]);


  useEffect(() => {
    console.log("formData: ", formData);
    
    // Check if form has unsaved changes
    const hasChanges = Object.keys(formData).some(key => {
      const value = formData[key];
      return value !== undefined && value !== null && value !== '';
    });
    setHasUnsavedChanges(hasChanges);
    
    // Update form completion status in real-time
    const isComplete = !!(formData.readAcknowledgement && 
                          formData.fullName && 
                          formData.signature && 
                          formData.date);
    setIsFormComplete(isComplete);
    
    // Debug logging
    console.log('Form completion check:', {
      readAcknowledgement: formData.readAcknowledgement,
      fullName: formData.fullName,
      signature: formData.signature,
      date: formData.date,
      isComplete: isComplete
    });
  }, [formData])

  const handleSave = async (isSubmit = false) => {
    if (!formRef.current) return;
    
    // Check download status before submitting
    if (isSubmit) {
      try {
        const downloadResponse = await fetch(`/api/staff/form-download?staffId=${staff.id}&formKey=employee_welcome`);
        const downloadData = await downloadResponse.json();
        
        if (!downloadData.hasDownloaded) {
          showToast({
            type: 'error',
            title: 'Download Required',
            message: 'You must download the Employee Welcome Pack PDF before submitting. Please download it first.',
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
        // Small delay to show the success message
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
    console.log('Form data updated from child:', newData);
    setFormData(newData);
  };

  if (loading || !formReady) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-t-rose-500 border-rose-200 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Loading Form</h3>
          <p className="text-slate-600 font-medium">Please wait while we load your form...</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
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
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Back to Forms
            </button>
          </div>
        </div>

        {/* Acknowledgement Form Only - No PDF View */}
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
              className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 ${
                saving 
                  ? 'bg-rose-500 hover:bg-rose-600' 
                  : 'bg-gray-500 hover:bg-gray-600'
              }`}
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => {
                console.log('Submit button clicked. Current state:', {
                  saving,
                  isFormComplete,
                  disabled: saving || !isFormComplete
                });
                handleSave(true);
              }}
              disabled={saving || !isFormComplete}
              className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 ${
                saving 
                  ? 'bg-rose-500 hover:bg-rose-600' 
                  : isFormComplete 
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-400 cursor-not-allowed'
              }`}
              title={!isFormComplete ? `Form incomplete. Missing: ${!formData.readAcknowledgement ? 'Acknowledgement ' : ''}${!formData.fullName ? 'Name ' : ''}${!formData.signature ? 'Signature ' : ''}${!formData.date ? 'Date' : ''}` : 'Submit form'}
            >
              {saving ? 'Submitting...' : 'Submit & Continue'}
            </button>
          </div>
        </div>
      </div>

      {/* Back to Forms Confirmation Modal */}
      <BackToFormsModal
        isOpen={showBackModal}
        onClose={() => setShowBackModal(false)}
        onSaveAndExit={handleSaveAndExit}
        onDiscardAndExit={handleDiscardAndExit}
        formName="Employee Welcome Pack"
        hasUnsavedChanges={hasUnsavedChanges}
      />
    </div>
  );
}
