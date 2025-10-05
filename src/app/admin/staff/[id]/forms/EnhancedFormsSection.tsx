"use client";

import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { getStaffFormConfig } from '@/app/forms/staff-registry';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface EnhancedFormsSectionProps {
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

function EnhancedFormsSection({ staffId }: EnhancedFormsSectionProps) {
  // Optimized: Only store form summaries initially (just if they exist)
  const [formSummaries, setFormSummaries] = useState<Record<string, any>>({});
  const [formDataCache, setFormDataCache] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [expandedForm, setExpandedForm] = useState<string | null>(null);
  const [loadingForm, setLoadingForm] = useState<string | null>(null);

  // Initial load - just get form summaries (fast)
  useEffect(() => {
    const loadFormSummaries = async () => {
      try {
        const res = await fetch(`/api/staff/onboard/admin-view-${staffId}?summary=true`);
        const data = await res.json();
        
        if (res.ok) {
          setFormSummaries(data.submissions || {});
        }
      } catch (error) {
        console.error('Error loading form summaries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFormSummaries();
  }, [staffId]);

  // Lazy load individual form data when expanded
  const loadFormData = useCallback(async (formKey: string) => {
    const apiKey = keyMapping[formKey] || formKey;
    
    // Check if already cached
    if (formDataCache[apiKey]) {
      return;
    }
    
    setLoadingForm(formKey);
    try {
      const res = await fetch(`/api/staff/${staffId}/forms/${apiKey}`);
      const data = await res.json();
      
      if (res.ok && data.formData) {
        setFormDataCache(prev => ({
          ...prev,
          [apiKey]: data.formData
        }));
      }
    } catch (error) {
      console.error(`Error loading form ${formKey}:`, error);
    } finally {
      setLoadingForm(null);
    }
  }, [staffId, formDataCache]);

  // Handle form expansion with lazy loading
  const handleFormToggle = useCallback((formKey: string) => {
    if (expandedForm === formKey) {
      setExpandedForm(null);
    } else {
      setExpandedForm(formKey);
      // Load data if not already loaded
      loadFormData(formKey);
    }
  }, [expandedForm, loadFormData]);

  const renderFormData = useCallback((formKey: string) => {
    const formConfig = getStaffFormConfig(formKey);
    const apiKey = keyMapping[formKey] || formKey;
    const currentFormData = formDataCache[apiKey];

    if (!currentFormData) {
      if (loadingForm === formKey) {
        return (
          <div className="mt-4 p-8 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-3 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
              <span className="text-gray-600">Loading form data...</span>
            </div>
          </div>
        );
      }
      return null;
    }

    // Helper function to find any signature in the data
    const findSignature = (): string | null => {
      // Check root level signature fields
      if (currentFormData.staffSignature) return currentFormData.staffSignature;
      if (currentFormData.signature) return currentFormData.signature;
      if (currentFormData.disclosureSignature) return currentFormData.disclosureSignature;
      if (currentFormData.declarationSignature) return currentFormData.declarationSignature;
      
      // Check data.data level signature fields
      if (currentFormData.data?.staffSignature) return currentFormData.data.staffSignature;
      if (currentFormData.data?.signature) return currentFormData.data.signature;
      if (currentFormData.data?.disclosureSignature) return currentFormData.data.disclosureSignature;
      if (currentFormData.data?.declarationSignature) return currentFormData.data.declarationSignature;
      
      return null;
    };

    // Helper function to find any signature date
    const findSignatureDate = () => {
      // Check root level date fields
      if (currentFormData.staffSignedAt) return new Date(currentFormData.staffSignedAt).toLocaleString();
      if (currentFormData.signatureDate) return new Date(currentFormData.signatureDate).toLocaleString();
      if (currentFormData.disclosureDate) return new Date(currentFormData.disclosureDate).toLocaleString();
      if (currentFormData.declarationDate) return new Date(currentFormData.declarationDate).toLocaleString();
      
      // Check data.data level date fields
      if (currentFormData.data?.staffSignedAt) return new Date(currentFormData.data.staffSignedAt).toLocaleString();
      if (currentFormData.data?.signatureDate) return new Date(currentFormData.data.signatureDate).toLocaleString();
      if (currentFormData.data?.disclosureDate) return new Date(currentFormData.data.disclosureDate).toLocaleString();
      if (currentFormData.data?.declarationDate) return new Date(currentFormData.data.declarationDate).toLocaleString();
      
      return 'Not signed';
    };

    const signatureImage = findSignature();
    const signatureDate = findSignatureDate();

    // Use View Component if available with error boundary
    if (formConfig?.viewComponent) {
      const ViewComponent = formConfig.viewComponent;
      try {
        return (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <ViewComponent 
              data={currentFormData}
              readOnly={true}
              adminView={true}
              isPreview={true}
            />
          </div>
        );
      } catch (error) {
        console.error(`View component failed for ${formKey}:`, error);
        // Fall through to fallback rendering
      }
    }

    // Enhanced fallback: Show structured form data
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="space-y-4">
          <div className="bg-blue-600 text-white px-4 py-2 rounded">
            <h4 className="font-semibold">{formConfig?.name || formKey} - Form Data</h4>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium mb-3 text-gray-900">Form Information</h5>
              <div className="text-sm space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded p-3 bg-white">
                {currentFormData.data && typeof currentFormData.data === 'object' ? (
                  Object.entries(currentFormData.data)
                    .filter(([key]) => key !== 'submit')
                    .map(([key, value]) => (
                    <div key={key} className="flex border-b border-gray-100 pb-2">
                      <span className="font-medium text-gray-600 w-40 capitalize shrink-0">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                      </span>
                      <span className="text-gray-800 flex-1 ml-2">
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                         typeof value === 'string' ? (value || '—') : 
                         JSON.stringify(value)}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No detailed data available</p>
                )}
              </div>
            </div>
            
            <div>
              <h5 className="font-medium mb-3 text-gray-900">Signature & Completion</h5>
              <div className="space-y-4">
                {signatureImage ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Staff Signature ✅
                    </label>
                    <img 
                      src={signatureImage} 
                      alt="Staff Signature" 
                      className="border border-gray-300 rounded max-w-full h-20 object-contain bg-white"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Staff Signature ❌
                    </label>
                    <div className="border border-gray-300 rounded h-20 bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No signature provided</span>
                    </div>
                  </div>
                )}
                
                <div className="bg-white border border-gray-200 rounded p-3 space-y-2">
                  <div className="text-sm">
                    <span className="font-medium text-gray-600">Completed:</span>
                    <span className="ml-2 text-gray-800">{signatureDate}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-600">Created:</span>
                    <span className="ml-2 text-gray-800">
                      {currentFormData.createdAt ? 
                        new Date(currentFormData.createdAt).toLocaleDateString() : 
                        'Unknown'}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-600">Last Updated:</span>
                    <span className="ml-2 text-gray-800">
                      {currentFormData.updatedAt ? 
                        new Date(currentFormData.updatedAt).toLocaleDateString() : 
                        'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }, [formDataCache, loadingForm]);

  if (loading) {
    return <LoadingSpinner title="Loading Forms" message="Please wait while we load the staff forms..." />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-600 text-white font-bold">🗂️</span>
          <h3 className="font-semibold text-slate-800">Forms</h3>
        </div>
      </div>
      
      <div className="p-5">
        {FORM_SEQUENCE.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No forms available yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {FORM_SEQUENCE.map((form) => {
              const apiKey = keyMapping[form.key] || form.key;
              const hasData = !!formSummaries[apiKey];
              const isExpanded = expandedForm === form.key;
              
              return (
                <div key={form.key} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${hasData ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <div className="font-medium">{form.name}</div>
                        <div className="text-xs text-gray-500">
                          {hasData ? (
                            <>
                              <span className="text-green-600 font-medium">✓ Completed</span>
                              {formSummaries[apiKey]?.staffSignedAt && (
                                <span> • Signed {new Date(formSummaries[apiKey].staffSignedAt).toLocaleDateString()}</span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">Not completed</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {hasData && (
                      <button
                        onClick={() => handleFormToggle(form.key)}
                        className="px-3 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      >
                        {isExpanded ? 'Hide' : 'View'}
                      </button>
                    )}
                  </div>
                  
                  {isExpanded && hasData && renderFormData(form.key)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Export memoized version for better performance
export default memo(EnhancedFormsSection);
