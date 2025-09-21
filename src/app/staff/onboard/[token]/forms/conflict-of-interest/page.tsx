"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import ConflictFormEdit from '@/app/form-components/staff/conflict-of-interest/Edit';

export default function ConflictOfInterestFormPage() {
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
        setFormData(data.submissions['conflict_of_interest'] || {});
      } catch (error: any) {
        console.error('Error loading data:', error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadData();
  }, [token]);

  const handleFormDataChange = useCallback((newData: any) => {
    setFormData(newData);
  }, []);

  const handleSave = useCallback(async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/staff/onboard/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formKey: 'conflict_of_interest',
          data: data,
          isSubmit: false
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      alert('Draft saved successfully!');
    } catch (error: any) {
      console.error('Error saving:', error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }, [token]);

  const handleSubmit = useCallback(async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/staff/onboard/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formKey: 'conflict_of_interest',
          data: data,
          isSubmit: true
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      alert('Form submitted successfully!');
      router.push(`/staff/onboard/${token}`);
    } catch (error: any) {
      console.error('Error submitting:', error);
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }, [token, router]);

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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Conflict of Interest Disclosure</h1>
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

        {/* Form Component */}
        <ConflictFormEdit
          initialData={formData}
          onDataChange={handleFormDataChange}
          readOnly={false}
          showButtons={true}
          onSave={handleSave}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}