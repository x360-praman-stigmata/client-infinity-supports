"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface StaffForm {
  formType: string;
  formName: string;
  status: 'completed' | 'pending';
  completedAt?: string;
  hasSignature: boolean;
}

export default function StaffFormsPage() {
  const { id } = useParams<{ id: string }>();
  const [staff, setStaff] = useState<any>(null);
  const [forms, setForms] = useState<StaffForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStaffForms = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/staff/${id}/forms`);
        const data = await res.json();
        setStaff(data.staff);
        setForms(data.forms);
      } catch (error) {
        console.error('Error loading staff forms:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadStaffForms();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-t-rose-500 border-rose-200 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Loading Staff Forms</h3>
          <p className="text-slate-600 font-medium">Please wait while we fetch form data...</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!staff) return <div className="p-8">Staff not found</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Staff Forms - {staff.firstName} {staff.surname}</h1>
            <p className="text-gray-600 mt-1">{staff.email}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/dashboard" className="text-sm text-gray-600 hover:text-rose-600 px-4 py-2 border border-gray-200 rounded-lg hover:border-rose-200">
              Back to Dashboard
            </Link>
            <Link href="/admin/staff" className="text-sm text-rose-600 hover:underline px-4 py-2">
              Back to Staff
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-lg font-semibold mb-4">Onboarding Forms</h2>
          
          {forms.length === 0 ? (
            <div className="text-gray-500 text-sm">No forms submitted yet.</div>
          ) : (
            <div className="space-y-3">
              {forms.map((form) => (
                <div key={form.formType} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${form.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <h3 className="font-medium">{form.formName}</h3>
                      <p className="text-sm text-gray-500">
                        {form.status === 'completed' ? `Completed ${form.completedAt}` : 'Not completed'}
                        {form.hasSignature && ' • Signed'}
                      </p>
                    </div>
                  </div>
                  
                  {form.status === 'completed' && (
                    <Link 
                      href={`/admin/staff/${id}/forms/${form.formType}`}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      View Details
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
