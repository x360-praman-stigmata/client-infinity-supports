"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getStaffFormComponent } from '@/app/forms/staff-registry';

export default function SuperChoiceFormPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [staff, setStaff] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/staff/onboard/${token}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);
        
        setStaff(data.staff);
        setFormData(data.submissions['super_choice_form'] || {});
      } catch (error: any) {
        console.error('Error loading data:', error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadData();
  }, [token]);

  useEffect(() => {
    console.log("formData: ", formData);
  }, [formData]);

  const validateForm = () => {
    const errors: string[] = [];
    
    // Required fields for all forms
    if (!formData.fullName?.trim()) {
      errors.push('Full name is required');
    }
    if (!formData.tfn?.trim()) {
      errors.push('Tax File Number is required');
    }
    if (!formData.fundChoice) {
      errors.push('Please select a fund choice');
    }
    
    // Conditional validation based on fund choice
    if (formData.fundChoice === 'existing') {
      if (!formData.superFundName?.trim()) errors.push('Super fund name is required');
      if (!formData.superFundABN?.trim()) errors.push('Super fund ABN is required');
      if (!formData.superFundUSI?.trim()) errors.push('Super fund USI is required');
      if (!formData.memberAccountNumber?.trim()) errors.push('Member account number is required');
      if (!formData.accountName?.trim()) errors.push('Account name is required');
    } else if (formData.fundChoice === 'default') {
      if (!formData.businessName?.trim()) errors.push('Business name is required');
      if (!formData.businessABN?.trim()) errors.push('Business ABN is required');
      if (!formData.defaultSuperFundName?.trim()) errors.push('Default super fund name is required');
      if (!formData.defaultSuperFundABN?.trim()) errors.push('Default super fund ABN is required');
      if (!formData.defaultSuperFundUSI?.trim()) errors.push('Default super fund USI is required');
    } else if (formData.fundChoice === 'smsf') {
      if (!formData.smsfName?.trim()) errors.push('SMSF name is required');
      if (!formData.smsfABN?.trim()) errors.push('SMSF ABN is required');
      if (!formData.smsfESA?.trim()) errors.push('SMSF ESA is required');
      if (!formData.smsfAccountName?.trim()) errors.push('SMSF account name is required');
      if (!formData.bankAccountName?.trim()) errors.push('Bank account name is required');
      if (!formData.bsbCode?.trim()) errors.push('BSB code is required');
      if (!formData.accountNumber?.trim()) errors.push('Account number is required');
    }
    
    return errors;
  };

  const handleSave = async (isSubmit: boolean) => {
    // Validate form if submitting
    if (isSubmit) {
      const errors = validateForm();
      if (errors.length > 0) {
        alert('Please fix the following errors:\n• ' + errors.join('\n• '));
        return;
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
        alert('Form submitted successfully!');
        router.push(`/staff/onboard/${token}`);
      } else {
        alert('Draft saved successfully!');
      }
    } catch (error: any) {
      console.error('Error saving:', error);
      alert(error.message);
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
      
      alert('PDF downloaded successfully!');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF: ' + error.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
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
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-8 pt-4 md:pt-6 border-t">
            <button 
              onClick={() => handleSave(false)}
              disabled={saving || downloading}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 w-full sm:w-auto"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
              onClick={handleDownload}
              disabled={saving || downloading}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 w-full sm:w-auto"
            >
              {downloading ? 'Generating...' : '📥 Download PDF'}
            </button>
            <button 
              onClick={() => handleSave(true)}
              disabled={saving || downloading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 w-full sm:w-auto"
            >
              {saving ? 'Submitting...' : 'Submit & Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
