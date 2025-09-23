"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { getStaffFormComponent } from '@/app/forms/staff-registry';

export default function GovtTaxFormPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { showToast } = useToast();
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
        setFormData(data.submissions['govt_tax'] || {});
      } catch (error: any) {
        console.error('Error loading data:', error);
        showToast({ type: 'error', title: 'Load failed', message: error.message || 'Failed to load' });
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
      // Validate ALL fields before submit (allow draft anytime)
      if (isSubmit) {
        const entries = Object.entries(formData || {});
        const isValidDate = (value: any) => {
          if (typeof value !== 'string') return false;
          let d: Date | null = null;
          if (value.includes('/')) {
            // dd/mm/yyyy
            const [dd, mm, yyyy] = value.split('/');
            const day = parseInt(dd, 10);
            const month = parseInt(mm, 10) - 1;
            const year = parseInt(yyyy, 10);
            const tmp = new Date(year, month, day);
            if (tmp.getFullYear() === year && tmp.getMonth() === month && tmp.getDate() === day) {
              d = tmp;
            }
          } else {
            const t = Date.parse(value);
            if (!Number.isNaN(t)) d = new Date(value);
          }
          if (!d) return false;
          const today = new Date();
          const iso = (dt: Date) => dt.toISOString().slice(0,10);
          return iso(d) <= iso(today) && iso(d) >= '1900-01-01';
        };
        const missing = entries
          .filter(([_, v]) => {
            if (typeof v === 'boolean') return false; // booleans are fine either way
            if (v === null || v === undefined) return true;
            if (typeof v === 'string') return v.trim() === '';
            return false;
          })
          .map(([k]) => k);
        // Validate dates specifically (dob, payerSignatureAt, payeeSignatureAt) if present
        const dateFields = ['dob', 'payerSignatureAt', 'payeeSignatureAt'];
        const invalidDates = dateFields.filter((k) => formData?.[k] && !isValidDate(formData[k]));
        // Age check: 18+
        let ageInvalid: string[] = [];
        if (formData?.dob) {
          const parts = String(formData.dob).includes('/')
            ? String(formData.dob).split('/')
            : String(formData.dob).split('-').reverse(); // support yyyy-mm-dd
          if (parts.length === 3) {
            const [dd, mm, yyyy] = parts;
            const birth = new Date(parseInt(yyyy,10), parseInt(mm,10)-1, parseInt(dd,10));
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
            if (isNaN(age) || age < 18) ageInvalid.push('dob');
          }
        }
        if (missing.length) {
          const preview = missing.slice(0, 2);
          const extra = missing.length - preview.length;
          const suffix = extra > 0 ? ` (+${extra} more)` : '';
          showToast({ type: 'error', title: 'Please complete required fields', message: `${preview.join(', ')}${suffix}` });
          setSaving(false);
          return;
        }
        if (invalidDates.length) {
          const preview = invalidDates.slice(0, 2);
          const extra = invalidDates.length - preview.length;
          const suffix = extra > 0 ? ` (+${extra} more)` : '';
          showToast({ type: 'error', title: 'Invalid Date', message: `${preview.join(', ')}${suffix}` });
          setSaving(false);
          return;
        }
        if (ageInvalid.length) {
          showToast({ type: 'error', title: 'Age requirement', message: 'You must be at least 18 years old – please check Date of Birth.' });
          setSaving(false);
          return;
        }
      }
      const res = await fetch(`/api/staff/onboard/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formKey: 'govt_tax', data: formData, submit: isSubmit }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || 'Failed to save');
      
      if (isSubmit) {
        showToast({ type: 'success', title: 'Submitted', message: 'Government Tax form submitted.' });
        router.push(`/staff/onboard/${token}`);
      } else {
        showToast({ type: 'success', title: 'Draft Saved', message: 'Your draft was saved successfully.' });
      }
    } catch (error: any) {
      console.error('Error saving:', error);
      showToast({ type: 'error', title: 'Save failed', message: error.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  const handleFormDataChange = useCallback((values: any) => {
    setFormData((prev: any) => ({ ...prev, ...values }));
  }, []);

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

  const GovtTaxEdit = getStaffFormComponent('govt_tax', 'edit');

  return (
    <div className="min-h-screen bg-gray-100 py-4 md:py-8">
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
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Government Tax Form</h1>
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

        {/* Edit Component - Staff can type and edit */}
        <div className="bg-white rounded-lg shadow-lg p-2 md:p-6">
          <div className="view-component-wrapper w-full">
            <GovtTaxEdit 
              formData={formData}
              commonFieldsData={{}}
              onChange={handleFormDataChange}
              readOnly={false}
              handleSave={handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
