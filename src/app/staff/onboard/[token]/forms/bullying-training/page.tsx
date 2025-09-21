"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import BullyingTrainingAckForm, { BullyingTrainingAckFormRef } from '../../components/BullyingTrainingAckForm';
import { useToast } from '@/components/ui/Toast';

export default function BullyingTrainingFormPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const [staff, setStaff] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<BullyingTrainingAckFormRef>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/staff/onboard/${token}`);
        const data = await res.json();
        
        if (!res.ok) {
          const errorMessage = data.message || data.error || 'Failed to load form data';
          setError(errorMessage);
          showToast({
            type: 'error',
            title: 'Error Loading Form',
            message: errorMessage,
            duration: 5000
          });
          return;
        }
        
        setStaff(data.staff);
        setFormData(data.submissions['bullying_training'] || {});
        
        showToast({
          type: 'success',
          title: 'Form Loaded',
          message: 'Your form data has been loaded successfully',
          duration: 3000
        });
      } catch (error: any) {
        console.error('Error loading data:', error);
        const errorMessage = 'Unable to load form data. Please check your internet connection and try again.';
        setError(errorMessage);
        showToast({
          type: 'error',
          title: 'Connection Error',
          message: errorMessage,
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) loadData();
  }, [token, showToast]);

  useEffect(() => {
    console.log("formData: ", formData);
  }, [formData])

  const handleSave = async (isSubmit: boolean) => {
    if (!formRef.current) return;
    
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Unable to Load Form</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
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
              <h1 className="text-2xl font-bold text-gray-900">Bullying Training</h1>
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
        <BullyingTrainingAckForm 
          ref={formRef}
          token={token as string}
          staff={staff}
          onSubmitted={() => router.push(`/staff/onboard/${token}`)}
        />
        
        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 justify-center">
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
  );
}
