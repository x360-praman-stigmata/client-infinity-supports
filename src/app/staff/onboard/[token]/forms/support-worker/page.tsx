"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import SupportWorkerForm, { SupportWorkerFormRef } from '../../components/SupportWorkerForm';

export default function SupportWorkerFormPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const formRef = useRef<SupportWorkerFormRef>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/staff/onboard/${token}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);
        
        setStaff(data.staff);
        
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

  const handleSave = async (isSubmit = false) => {
    if (!formRef.current) return;
    
    setSaving(true);
    try {
      const success = await formRef.current.save(isSubmit);
      
      if (success && isSubmit) {
        router.push(`/staff/onboard/${token}`);
      } else if (success) {
        alert('Draft saved successfully!');
      }
    } catch (error: any) {
      console.error('Error saving:', error);
      alert(error.message);
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Support Worker</h1>
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

        <div className="bg-white rounded-lg shadow-lg p-6">
          <SupportWorkerForm 
            ref={formRef}
            token={token}
          />
          
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
