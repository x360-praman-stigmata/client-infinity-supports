"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/components/ui/Toast';
import NDISCodeOfConductEdit, { NDISCodeOfConductEditRef } from '@/app/form-components/staff/code_of_conduct/Edit';

export default function NDISCodeOfConductFormPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { showToast } = useToast();
  const formRef = useRef<NDISCodeOfConductEditRef>(null);
  
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`/api/staff/onboard/${token}`);
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.message || 'Failed to load staff data');
          showToast({
            type: 'error',
            title: 'Error Loading Data',
            message: data.message || 'Failed to load staff data',
            duration: 5000
          });
          return;
        }
        
        setStaff(data.staff);
        showToast({
          type: 'success',
          title: 'Data Loaded',
          message: 'Staff data loaded successfully',
          duration: 3000
        });
      } catch (error: any) {
        console.error('Error loading data:', error);
        setError('Failed to connect to server');
        showToast({
          type: 'error',
          title: 'Connection Error',
          message: 'Failed to connect to server. Please check your internet connection.',
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) loadData();
  }, [token, showToast]);

  const handleSave = async () => {
    if (formRef.current) {
      try {
        await formRef.current.save();
      } catch (error) {
        console.error('Error saving form:', error);
        showToast({
          type: 'error',
          title: 'Save Error',
          message: 'Failed to save form. Please try again.',
          duration: 5000
        });
      }
    }
  };

  const handleSubmitted = () => {
    showToast({
      type: 'success',
      title: 'Form Submitted',
      message: 'NDIS Code of Conduct form submitted successfully',
      duration: 3000
    });
    
    setTimeout(() => {
      router.push(`/staff/onboard/${token}`);
    }, 1000);
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Form</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
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
              <h1 className="text-2xl font-bold text-gray-900">NDIS Code of Conduct</h1>
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
        <NDISCodeOfConductEdit
          ref={formRef}
          token={token}
          staff={staff}
          onSubmitted={handleSubmitted}
        />
      </div>
    </div>
  );
}