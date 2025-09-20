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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <ConflictFormEdit
      initialData={formData}
      onDataChange={handleFormDataChange}
      readOnly={false}
      showButtons={true}
      onSave={handleSave}
      onSubmit={handleSubmit}
    />
  );
}