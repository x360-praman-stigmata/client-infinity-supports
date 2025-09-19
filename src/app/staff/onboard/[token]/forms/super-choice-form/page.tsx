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

  const handleSave = async (isSubmit: boolean) => {
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
              disabled={saving}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 w-full sm:w-auto"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button 
              onClick={() => handleSave(true)}
              disabled={saving}
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
