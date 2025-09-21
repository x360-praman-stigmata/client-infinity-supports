"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getStaffFormComponent } from '@/app/forms/staff-registry';

export default function CasualEmploymentInformationFormPage() {
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
        setFormData(data.submissions['casual_employment_information'] || {});
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
  }, [formData])

  const handleSave = async (isSubmit: boolean) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/staff/onboard/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formKey: 'casual_employment_information', data: {}, submit: isSubmit }),
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

  const CasualEmploymentInformationView = getStaffFormComponent('casual_employment_information', 'view');

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <style jsx>{`
        .view-component-wrapper .text-gray-700 { color: #374151 !important; }
        .view-component-wrapper .text-gray-600 { color: #4b5563 !important; }
        .view-component-wrapper .text-gray-800 { color: #1f2937 !important; }
        .view-component-wrapper .text-xs { font-size: 0.875rem !important; }
        .view-component-wrapper { zoom: 1.1; }
      `}</style>
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Casual Employment Information Statement</h1>
              <p className="text-gray-600">{staff?.firstName} {staff?.surname}</p>
            </div>
            <button
              onClick={() => router.push(`/staff/onboard/${token}`)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Back to Forms
            </button>
          </div>
        </div>

        {/* View Component */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="view-component-wrapper">
            <CasualEmploymentInformationView data={formData} />
          </div>
          
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
              onClick={() => handleSave(true)}
              disabled={saving}
              className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 ${
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
