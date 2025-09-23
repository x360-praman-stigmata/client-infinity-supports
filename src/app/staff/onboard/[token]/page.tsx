"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface FormStatus {
  key: string;
  name: string;
  route: string;
  completed: boolean;
  enabled: boolean;
}

const FORM_SEQUENCE = [
  { key: 'employeeDetails', name: 'Employee Details', route: 'employee-details' },
  { key: 'employee_welcome', name: 'Employee Welcome', route: 'employee-welcome' },
  { key: 'support_worker', name: 'Support Worker', route: 'support-worker' },
  { key: 'pre_employment_medical', name: 'Pre-Employment Medical', route: 'pre-employment-medical' },
  { key: 'ndis_workforce_capability', name: 'NDIS Workforce Capability', route: 'ndis-workforce' },
  { key: 'bullying_harassment_training', name: 'Bullying & Harassment Training', route: 'bullying-harassment' },
  { key: 'bullying_training', name: 'Bullying Training', route: 'bullying-training' },
  { key: 'documentation_acknowledgement', name: 'Documentation Acknowledgement', route: 'acknowledgement-edit' },
  { key: 'ndis_code_of_conduct', name: 'NDIS Code of Conduct', route: 'ndis-code-of-conduct' },
  { key: 'fair_work_information', name: 'Fair Work Information Statement', route: 'fair-work-information' },
  { key: 'casual_employment_information', name: 'Casual Employment Information Statement', route: 'casual-employment-information' },
  { key: 'orientation', name: 'Staff Orientation', route: 'orientation' },
  { key: 'govt_tax', name: 'Government Tax', route: 'govt-tax' },
  { key: 'super_choice_form', name: 'Superannuation Standard Choice Form', route: 'super-choice-form' },
  { key: 'vehicle_safety_inspection', name: 'Vehicle Safety Inspection Checklist', route: 'vehicle-safety-inspection' },
  { key: 'conflict_of_interest', name: 'Conflict of Interest Disclosure', route: 'conflict-of-interest' }
];

export default function StaffOnboardingPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [staff, setStaff] = useState<any>(null);
  const [forms, setForms] = useState<FormStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigatingToForm, setNavigatingToForm] = useState<string | null>(null);
  const [copiedFormKey, setCopiedFormKey] = useState<string | null>(null);

  useEffect(() => {
    const loadStaffData = async () => {
      try {
        const res = await fetch(`/api/staff/onboard/${token}`);
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load staff data');
        }

        setStaff(data.staff);
        
        // Calculate form completion status and enable next form
        const formStatuses = FORM_SEQUENCE.map((form, index) => {
          const isCompleted = !!data.submissions[form.key];
          const isEnabled = index === 0 || forms[index - 1]?.completed || 
                           FORM_SEQUENCE.slice(0, index).every(f => !!data.submissions[f.key]);
          
          return {
            key: form.key,
            name: form.name,
            route: form.route,
            completed: isCompleted,
            enabled: isEnabled
          };
        });

        // Enable first form if none completed, or next form after last completed
        const lastCompletedIndex = formStatuses.findLastIndex(f => f.completed);
        formStatuses.forEach((form, index) => {
          form.enabled = index <= lastCompletedIndex + 1;
        });

        setForms(formStatuses);
      } catch (error: any) {
        console.error('Error loading staff data:', error);
        alert(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadStaffData();
  }, [token]);

  // Refresh data when page becomes visible (user returns from form)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && token) {
        const loadStaffData = async () => {
          try {
            const res = await fetch(`/api/staff/onboard/${token}`);
            const data = await res.json();
            
            if (res.ok) {
              const formStatuses = FORM_SEQUENCE.map((form, index) => {
                const isCompleted = !!data.submissions[form.key];
                return {
                  key: form.key,
                  name: form.name,
                  route: form.route,
                  completed: isCompleted,
                  enabled: false // Will be set below
                };
              });
              
              // Enable forms based on completion status
              const lastCompletedIndex = formStatuses.findLastIndex(f => f.completed);
              formStatuses.forEach((form, index) => {
                form.enabled = index <= lastCompletedIndex + 1;
              });
              
              setForms(formStatuses);
            }
          } catch (error) {
            console.error('Error refreshing staff data:', error);
          }
        };
        loadStaffData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-t-rose-500 border-rose-200 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Loading Staff Data</h3>
          <p className="text-slate-600 font-medium">Please wait while we prepare your onboarding forms...</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Token</h1>
          <p className="text-gray-600">The onboarding link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome, {staff.firstName} {staff.surname}!
          </h1>
          <p className="text-gray-600">
            Please complete the following onboarding forms to get started.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Complete all forms in order to finish your onboarding process.
          </p>
        </div>

        {/* Forms List */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-6">Onboarding Forms</h2>
          
          <div className="space-y-4">
            {forms.map((form, index) => (
              <div 
                key={form.key}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  form.completed 
                    ? 'bg-green-50 border-green-200' 
                    : form.enabled 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    form.completed 
                      ? 'bg-green-500 text-white' 
                      : form.enabled 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                  }`}>
                    {form.completed ? '✓' : index + 1}
                  </div>
                  
                  <div>
                    <h3 className={`font-medium ${
                      form.enabled ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {form.name}
                    </h3>
                    <p className={`text-sm ${
                      form.completed 
                        ? 'text-green-600' 
                        : form.enabled 
                          ? 'text-blue-600' 
                          : 'text-gray-400'
                    }`}>
                      {form.completed ? 'Completed' : form.enabled ? 'Available' : 'Locked'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  {form.enabled ? (
                    <>
                      <button
                        onClick={() => {
                          setNavigatingToForm(form.route);
                          router.push(`/staff/onboard/${token}/forms/${form.route}`);
                        }}
                        disabled={navigatingToForm !== null}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                          navigatingToForm === form.route
                            ? 'bg-rose-500 text-white hover:bg-rose-600'
                            : form.completed
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {navigatingToForm === form.route ? 'Loading...' : (form.completed ? 'View' : 'Start')}
                      </button>
                      <button
                        onClick={async () => {
                          const link = `${window.location.origin}/staff/onboard/${token}/forms/${form.route}`;
                          console.log('Copy button clicked for', form.key, link);
                          try {
                            await navigator.clipboard.writeText(link);
                            setCopiedFormKey(form.key);
                            console.log('Copied to clipboard, updating state and showing toast');
                            toast.success(`Link copied for ${form.name}`);
                          } catch (err) {
                            console.error('Failed to copy link', err);
                            toast.error('Failed to copy link');
                          }
                          setTimeout(() => {
                            setCopiedFormKey(null);
                            console.log('Reset copiedFormKey state');
                          }, 1500);
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all duration-200 focus:outline-none ${
                          copiedFormKey === form.key
                            ? 'bg-emerald-500 text-white scale-105 shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-blue-100 active:scale-95'
                        }`}
                        aria-label={`Copy link for ${form.name}`}
                      >
                        {copiedFormKey === form.key ? (
                          <>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="#fff" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" stroke="#6366f1" strokeWidth="2"/><rect x="2" y="2" width="13" height="13" rx="2" stroke="#6366f1" strokeWidth="2"/></svg>
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <span className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-400">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
