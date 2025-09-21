"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getStaffFormComponent } from '@/app/forms/staff-registry';

export default function VehicleSafetyInspectionFormPage() {
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
        setFormData(data.submissions['vehicle_safety_inspection'] || {});
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
        body: JSON.stringify({ formKey: 'vehicle_safety_inspection', data: {}, submit: isSubmit }),
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

  const VehicleSafetyInspectionView = getStaffFormComponent('vehicle_safety_inspection', 'view');

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <style jsx>{`
        .view-component-wrapper .text-gray-700 { color: #374151 !important; }
        .view-component-wrapper .text-gray-600 { color: #4b5563 !important; }
        .view-component-wrapper .text-gray-800 { color: #1f2937 !important; }
        .view-component-wrapper .text-xs { font-size: 0.875rem !important; }
        .view-component-wrapper { 
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
      `}</style>
      <div className="w-full max-w-7xl mx-auto px-2 md:px-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-4 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Vehicle Safety Inspection Checklist</h1>
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
            <VehicleSafetyInspectionView data={formData} />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-8 pt-4 md:pt-6 border-t">
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 w-full sm:w-auto ${
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
              className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 w-full sm:w-auto ${
                saving 
                  ? 'bg-rose-500 hover:bg-rose-600' 
                  : 'bg-green-600 hover:bg-green-700'
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
