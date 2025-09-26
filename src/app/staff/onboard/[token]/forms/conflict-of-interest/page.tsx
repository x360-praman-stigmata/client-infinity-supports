"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
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
        const conflictData = data.submissions['conflict_of_interest'] || {};
        console.log('Loaded conflict form data:', conflictData); // Debug log
        setFormData(conflictData);
      } catch (error: any) {
        console.error('Error loading data:', error);
        toast.error(error.message || 'Failed to load form data');
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
          submit: false
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success('Draft saved successfully!');
    } catch (error: any) {
      console.error('Error saving:', error);
      toast.error(error.message || 'Failed to save draft');
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
          submit: true
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error);
      }

      toast.success('Form submitted successfully!');
      router.push(`/staff/onboard/${token}`);
    } catch (error: any) {
      console.error('Error submitting:', error);
      toast.error(error.message || 'Failed to submit form');
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
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold truncate">Conflict of Interest Disclosure</h1>
              <p className="text-rose-100 text-sm sm:text-base mt-1 truncate">{staff?.firstName} {staff?.surname}</p>
            </div>
            <button
              onClick={() => router.push(`/staff/onboard/${token}`)}
              className="ml-3 px-3 py-2 text-white hover:bg-white/20 rounded-lg transition-colors flex-shrink-0 text-sm sm:text-base"
            >
              ← Back to Forms
            </button>
          </div>
        </div>

        {/* Form Component */}
        <ConflictFormEdit
          initialData={formData}
          staffData={staff}
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