"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { getStaffFormComponent } from '@/app/forms/staff-registry';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SuperChoiceFormPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [staff, setStaff] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const validateFormRef = useRef<(() => { isValid: boolean; errors: string[] }) | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/staff/onboard/${token}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);
        
        setStaff(data.staff);
        setFormData(data.submissions['super_choice_form'] || {});
        
        // Wait for the form component to be fully mounted and ready
        setTimeout(() => {
          setFormReady(true);
        }, 800); // Increased delay to ensure form is fully ready
      } catch (error: any) {
        console.error('Error loading data:', error);
        toast.error(error.message || 'An error occurred.', {
          duration: 4000,
          position: 'top-center',
        });
        setFormReady(true); // Show form even on error
      } finally {
        setLoading(false);
      }
    };

    if (token) loadData();
  }, [token]);

  useEffect(() => {
    console.log("formData: ", formData);
  }, [formData]);

  const handleValidationChange = (validationFn: () => { isValid: boolean; errors: string[] }) => {
    console.log('Validation function received:', validationFn); // Debug log
    validateFormRef.current = validationFn;
  };

  const validateForm = () => {
    console.log('validateForm called, ref available:', !!validateFormRef.current); // Debug log
    if (validateFormRef.current) {
      const result = validateFormRef.current();
      console.log('Validation result from form component:', result); // Debug log
      return result;
    }
    console.log('Validation function not available'); // Debug log
    return { isValid: false, errors: ['Validation function not available'] };
  };

  const handleSave = async (isSubmit: boolean) => {
    // Validate form if submitting
    if (isSubmit) {
      const validation = validateForm();
      console.log('Validation result:', validation); // Debug log
      
      if (!validation.isValid) {
        console.log('Form validation failed:', validation.errors); // Debug log
        
        // Show toast messages for each error
        validation.errors.forEach((error, index) => {
          setTimeout(() => {
            toast.error(error, {
              duration: 4000,
              position: 'top-center',
            });
          }, index * 100);
        });
        
        // Show a summary toast
        toast.error(`Please fix ${validation.errors.length} error(s) before submitting`, {
          duration: 5000,
          position: 'top-center',
        });
        
        return; // This should stop the save process
      }
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/staff/onboard/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formKey: 'super_choice_form', data: formData, submit: isSubmit }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed to save');
      
      if (isSubmit) {
        toast.success('Your Super Choice Form was submitted successfully! Thank you.', {
          duration: 4000,
          position: 'top-center',
        });
        router.push(`/staff/onboard/${token}`);
      } else {
        toast.success('Your draft has been saved. You can return and finish it later.', {
          duration: 4000,
          position: 'top-center',
        });
      }
    } catch (error: any) {
      console.error('Error saving:', error);
      toast.error(error.message || 'An error occurred.', {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch('/api/generate-pdf/super-choice-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `super-choice-form-${staff?.firstName || 'form'}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('PDF downloaded successfully!', {
        duration: 4000,
        position: 'top-center',
      });
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF: ' + error.message, {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setDownloading(false);
    }
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

  const SuperChoiceFormView = getStaffFormComponent('super_choice_form', 'view');

  return (
    <div className="min-h-screen bg-gray-100 py-4 md:py-8">
      <style jsx>{`
        .view-component-wrapper {
          min-height: 600px;
        }
        @media (max-width: 768px) {
          .view-component-wrapper {
            min-height: 400px;
          }
        }
      `}</style>
      
      <div className="w-full max-w-7xl mx-auto px-2 md:px-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-4 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Superannuation Standard Choice Form</h1>
              <p className="text-gray-600">{staff?.firstName} {staff?.surname}</p>
            </div>
            <button 
              onClick={() => router.push(`/staff/onboard/${token}`)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 self-start sm:self-auto"
            >
              ← Back to Forms
            </button>
          </div>
        </div>

        {/* View Component */}
        <div className="bg-white rounded-lg shadow-lg p-2 md:p-6">
          <div className="view-component-wrapper w-full">
            <SuperChoiceFormView
              initialData={formData}
              onDataChange={setFormData}
              readOnly={false}
              showButtons={false}
              onValidationChange={handleValidationChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-8 pt-4 md:pt-6 border-t">
            <button 
              onClick={() => handleSave(false)}
              disabled={saving || downloading}
              className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 w-full sm:w-auto ${
                saving 
                  ? 'bg-rose-500 hover:bg-rose-600' 
                  : 'bg-gray-500 hover:bg-gray-600'
              }`}
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
              onClick={handleDownload}
              disabled={saving || downloading}
              className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 w-full sm:w-auto ${
                downloading 
                  ? 'bg-rose-500 hover:bg-rose-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {downloading ? 'Generating...' : '📥 Download PDF'}
            </button>
            <button 
              onClick={() => handleSave(true)}
              disabled={saving || downloading}
              className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 w-full sm:w-auto ${
                saving 
                  ? 'bg-rose-500 hover:bg-rose-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {saving ? 'Submitting...' : 'Submit & Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
