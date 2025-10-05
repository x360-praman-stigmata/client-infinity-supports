"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getStaffFormComponent } from '@/app/forms/staff-registry';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function StaffFormEdit() {
  const { id, formType } = useParams<{ id: string; formType: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const res = await fetch(`/api/staff/${id}/forms/${formType}`);
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id && formType) loadFormData();
  }, [id, formType]);

  if (loading) {
    return (
      <LoadingSpinner 
        title="Loading Form" 
        message="Please wait while we load the form data..."
      />
    );
  }
  
  if (!data) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Form Not Found</h3>
          <p className="text-gray-600">The form data could not be found.</p>
        </div>
      </div>
    );
  }

  // Get the form component from registry - try edit first, fallback to view
  let FormEditComponent;
  try {
    FormEditComponent = getStaffFormComponent(formType, 'edit');
  } catch (error) {
    try {
      // Try alternative format (kebab-case -> snake_case)
      const alternativeFormType = formType === 'employment-details' ? 'employee_details' :
                                 formType === 'employment-welcome' ? 'employee_welcome' :
                                 formType === 'support-worker' ? 'support_worker' :
                                 formType === 'pre-employment-medical' ? 'pre_employment_medical' :
                                 formType === 'ndis-workforce' ? 'ndis_workforce_capability' :
                                 formType === 'bullying-harassment' ? 'bullying_harassment_training' :
                                 formType === 'bullying-training' ? 'bullying_training' :
                                 formType === 'ndis-code-of-conduct' ? 'ndis_code_of_conduct' :
                                 formType === 'fair-work-information' ? 'fair_work_information' :
                                 formType === 'casual-employment-information' ? 'casual_employment_information' :
                                 formType === 'govt-tax' ? 'govt_tax' :
                                 formType === 'super-choice-form' ? 'super_choice_form' :
                                 formType === 'vehicle-safety-inspection' ? 'vehicle_safety_inspection' :
                                 formType === 'conflict-of-interest' ? 'conflict_of_interest' :
                                 formType === 'documentation-acknowledgement' ? 'documentation_acknowledgement' :
                                 formType;
      FormEditComponent = getStaffFormComponent(alternativeFormType, 'edit');
    } catch (editError) {
      // Fallback to view component if edit doesn't exist
      FormEditComponent = getStaffFormComponent(formType, 'view');
    }
  }
  
  // Get form name from registry or use formType as fallback
  const getAllStaffForms = () => {
    const registry = {
      'employment-details': 'Employee Details',
      'employment-welcome': 'Employee Welcome',
      'support-worker': 'Support Worker',
      'pre-employment-medical': 'Pre-Employment Medical',
      'ndis-workforce': 'NDIS Workforce Capability Framework',
      'bullying-harassment': 'Bullying & Harassment Training',
      'bullying-training': 'Bullying Training',
      'ndis-code-of-conduct': 'NDIS Code of Conduct',
      'fair-work-information': 'Fair Work Information Statement',
      'casual-employment-information': 'Casual Employment Information Statement',
      'orientation': 'Staff Orientation',
      'govt-tax': 'Government Tax',
      'super-choice-form': 'Superannuation Standard Choice Form',
      'vehicle-safety-inspection': 'Vehicle Safety Inspection Checklist',
      'conflict-of-interest': 'Conflict of Interest Disclosure Form',
      'documentation-acknowledgement': 'Documentation Acknowledgement'
    };
    return registry[formType as keyof typeof registry] || formType;
  };

  const formName = getAllStaffForms();

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Edit {formName}</h1>
            <p className="text-gray-600 mt-1">{data.staff?.firstName} {data.staff?.surname}</p>
          </div>
          <Link href={`/admin/staff/${id}/forms/${formType}`} className="text-sm text-rose-600 hover:underline">Back to View</Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          
          {/* Warning Notice */}
          <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg mb-6">
            <div className="w-6 h-6 text-yellow-600">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-yellow-800">Read-Only Mode</p>
              <p className="text-sm text-yellow-600">
                Form editing is currently in read-only mode. Changes cannot be saved at this time.
              </p>
            </div>
          </div>

          {/* Render the actual form component with data */}
          <div className="edit-component-wrapper flex justify-center">
            <FormEditComponent 
              data={data} 
              readOnly={true}
              showButtons={false}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 mt-6 border-t">
            <button 
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              Save Changes (Disabled)
            </button>
            <Link 
              href={`/admin/staff/${id}/forms/${formType}`}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Back to View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
