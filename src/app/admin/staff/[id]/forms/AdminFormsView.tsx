"use client";

import React, { useState, useEffect } from 'react';
import { getStaffFormConfig } from '@/app/forms/staff-registry';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface AdminFormsViewProps {
  staffId: string;
}

const FORM_SEQUENCE = [
  { key: 'employee_details', name: 'Employee Details' },
  { key: 'employee_welcome', name: 'Employee Welcome' },
  { key: 'support_worker', name: 'Support Worker' },
  { key: 'pre_employment_medical', name: 'Pre-Employment Medical' },
  { key: 'ndis_workforce_capability', name: 'NDIS Workforce Capability' },
  { key: 'bullying_harassment_training', name: 'Bullying & Harassment Training' },
  { key: 'bullying_training', name: 'Bullying Training' },
  { key: 'documentation_acknowledgement', name: 'Documentation Acknowledgement' },
  { key: 'ndis_code_of_conduct', name: 'NDIS Code of Conduct' },
  { key: 'fair_work_information', name: 'Fair Work Information' },
  { key: 'casual_employment_information', name: 'Casual Employment Information' },
  { key: 'orientation', name: 'Staff Orientation' },
  { key: 'govt_tax', name: 'Government Tax' },
  { key: 'super_choice_form', name: 'Superannuation Choice Form' },
  { key: 'vehicle_safety_inspection', name: 'Vehicle Safety Inspection' },
  { key: 'conflict_of_interest', name: 'Conflict of Interest' }
];

export default function AdminFormsView({ staffId }: AdminFormsViewProps) {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [staff, setStaff] = useState<any>(null);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const res = await fetch(`/api/staff/onboard/admin-view-${staffId}`);
        const data = await res.json();
        
        console.log('🔍 API Response:', data);
        console.log('📋 Submissions:', data.submissions);
        console.log('📊 Form Keys:', Object.keys(data.submissions || {}));
        
        if (res.ok) {
          setStaff(data.staff);
          setFormData(data.submissions);
        }
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [staffId]);

  const renderFormComponent = (formKey: string) => {
    const formConfig = getStaffFormConfig(formKey);
    
    // Fix key mismatch: API returns camelCase, UI expects snake_case
    const keyMapping: Record<string, string> = {
      'employee_details': 'employeeDetails',
      'employee_welcome': 'employee_welcome',
      'support_worker': 'support_worker',
      'pre_employment_medical': 'pre_employment_medical',
      'ndis_workforce_capability': 'ndis_workforce_capability',
      'bullying_harassment_training': 'bullying_harassment_training',
      'bullying_training': 'bullying_training',
      'documentation_acknowledgement': 'documentation_acknowledgement',
      'ndis_code_of_conduct': 'ndis_code_of_conduct',
      'fair_work_information': 'fair_work_information',
      'casual_employment_information': 'casual_employment_information',
      'orientation': 'orientation',
      'govt_tax': 'govt_tax',
      'super_choice_form': 'super_choice_form',
      'vehicle_safety_inspection': 'vehicle_safety_inspection',
      'conflict_of_interest': 'conflict_of_interest'
    };
    
    const apiKey = keyMapping[formKey] || formKey;
    const currentFormData = formData[apiKey];

    console.log(`🔍 Rendering ${formKey}:`, {
      formConfig: !!formConfig,
      hasEditComponent: !!formConfig?.editComponent,
      hasViewComponent: !!formConfig?.viewComponent,
      apiKey,
      currentFormData: !!currentFormData,
      dataKeys: currentFormData ? Object.keys(currentFormData) : 'No data'
    });

    if (!currentFormData) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No data available for this form</p>
          <p className="text-xs text-gray-400 mt-2">Form key: {formKey} (API key: {apiKey})</p>
        </div>
      );
    }

    // Use View Component to avoid edit component state issues
    if (formConfig?.viewComponent) {
      const ViewComponent = formConfig.viewComponent;
      return (
        <div className="view-form">
          <ViewComponent 
            data={currentFormData}
            adminView={true}
          />
        </div>
      );
    }

    // Fallback: Show raw data
    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Form Data</h4>
        <pre className="text-sm text-gray-700 whitespace-pre-wrap">
          {JSON.stringify(currentFormData.data || currentFormData, null, 2)}
        </pre>
        {currentFormData.staffSignature && (
          <div className="mt-4">
            <h5 className="font-medium mb-2">Signature</h5>
            <img 
              src={currentFormData.staffSignature} 
              alt="Staff Signature" 
              className="border border-gray-300 rounded max-w-xs"
            />
            {currentFormData.staffSignedAt && (
              <p className="text-sm text-gray-500 mt-1">
                Signed: {new Date(currentFormData.staffSignedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner title="Loading Forms" message="Loading staff form data..." />;
  }

  const keyMapping: Record<string, string> = {
    'employee_details': 'employeeDetails',
    'employee_welcome': 'employee_welcome',
    'support_worker': 'support_worker',
    'pre_employment_medical': 'pre_employment_medical',
    'ndis_workforce_capability': 'ndis_workforce_capability',
    'bullying_harassment_training': 'bullying_harassment_training',
    'bullying_training': 'bullying_training',
    'documentation_acknowledgement': 'documentation_acknowledgement',
    'ndis_code_of_conduct': 'ndis_code_of_conduct',
    'fair_work_information': 'fair_work_information',
    'casual_employment_information': 'casual_employment_information',
    'orientation': 'orientation',
    'govt_tax': 'govt_tax',
    'super_choice_form': 'super_choice_form',
    'vehicle_safety_inspection': 'vehicle_safety_inspection',
    'conflict_of_interest': 'conflict_of_interest'
  };

  const completedForms = FORM_SEQUENCE.filter(form => {
    const apiKey = keyMapping[form.key] || form.key;
    return formData[apiKey];
  });
  const currentForm = FORM_SEQUENCE[activeTab];

  console.log('📊 Form Data Summary:', {
    totalForms: FORM_SEQUENCE.length,
    completedForms: completedForms.length,
    completedFormKeys: completedForms.map(f => f.key),
    allFormDataKeys: Object.keys(formData),
    currentFormKey: currentForm.key,
    currentFormHasData: !!formData[currentForm.key]
  });

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-white border-b">
        <h3 className="text-lg font-semibold text-gray-900">
          Staff Forms Data ({completedForms.length}/{FORM_SEQUENCE.length} completed)
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {staff?.firstName} {staff?.surname} - Form submissions
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {FORM_SEQUENCE.map((form, index) => {
            const apiKey = keyMapping[form.key] || form.key;
            const hasData = !!formData[apiKey];
            return (
              <button
                key={form.key}
                onClick={() => setActiveTab(index)}
                className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === index
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : hasData
                      ? 'border-transparent text-gray-700 hover:text-gray-900 hover:border-gray-300'
                      : 'border-transparent text-gray-400 cursor-not-allowed'
                }`}
                disabled={!hasData}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${hasData ? 'bg-green-500' : 'bg-gray-300'}`} />
                  {form.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {(() => {
          const apiKey = keyMapping[currentForm.key] || currentForm.key;
          const hasCurrentFormData = !!formData[apiKey];
          
          return hasCurrentFormData ? (
            <div>
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-900">{currentForm.name}</h4>
                <p className="text-sm text-gray-500">Read-only view of submitted data</p>
              </div>
              
              <div className="form-content">
                {renderFormComponent(currentForm.key)}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-500">This form has not been completed by the staff member yet.</p>
            </div>
          );
        })()}
      </div>

      {/* Navigation */}
      <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
        <button
          onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
          disabled={activeTab === 0}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <span className="text-sm text-gray-500">
          {activeTab + 1} of {FORM_SEQUENCE.length}
        </span>
        
        <button
          onClick={() => setActiveTab(Math.min(FORM_SEQUENCE.length - 1, activeTab + 1))}
          disabled={activeTab === FORM_SEQUENCE.length - 1}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>

      {/* Read-only form styles */}
      <style jsx>{`
        .read-only-form input,
        .read-only-form textarea,
        .read-only-form select {
          background-color: #f9fafb !important;
          border-color: #e5e7eb !important;
          cursor: default !important;
        }
        
        .read-only-form button {
          display: none !important;
        }
        
        .read-only-form .signature-pad {
          pointer-events: none !important;
        }
      `}</style>
    </div>
  );
}
