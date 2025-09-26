"use client";

import React, { useState, useCallback, useEffect } from 'react';
import ConflictFormPage1 from './page1';
import ConflictFormPage2 from './page2';
import ConflictFormPage3 from './page3';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PDFDownloadButton from '@/components/ui/PDFDownloadButton';

interface ConflictFormData {
  // Employee Information
  name: string;
  position: string;
  department: string;
  date: string;
  
  // Section 1: Conflict of Interest
  noConflict: boolean;
  yesConflict: boolean;
  conflictDescription: string;
  
  // Section 2: Vendor Relationships
  vendorNo: boolean;
  vendorYes: boolean;
  vendorDetails: string;
  
  // Section 3: Outside Employment
  employmentNo: boolean;
  employmentYes: boolean;
  employmentDetails: string;
  
  // Section 4: Acknowledgment
  employeeSignature: string;
  employeeDate: string;
  
  // HR/Management
  reviewedBy: string;
  reviewerTitle: string;
  reviewDate: string;
  actionTaken: string;
  decisionNoConflict: boolean;
  decisionMitigation: boolean;
  decisionFurtherReview: boolean;
  reviewerSignature: string;
  reviewerDate: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface ConflictFormEditProps {
  initialData?: Partial<ConflictFormData>;
  staffData?: { firstName: string; surname: string; };
  onDataChange?: (data: ConflictFormData) => void;
  readOnly?: boolean;
  showButtons?: boolean;
  onSave?: (data: ConflictFormData) => Promise<void>;
  onSubmit?: (data: ConflictFormData) => Promise<void>;
}

export default function ConflictFormEdit({
  initialData = {},
  staffData,
  onDataChange,
  readOnly = false,
  showButtons = true,
  onSave,
  onSubmit
}: ConflictFormEditProps) {
  const [formData, setFormData] = useState<ConflictFormData>({
    // Employee Information - pre-populate name from staff data
    name: initialData.name || (staffData ? `${staffData.firstName} ${staffData.surname}` : ''),
    position: initialData.position || '',
    department: initialData.department || '',
    date: initialData.date || new Date().toISOString().split('T')[0],
    
    // Section 1: Conflict of Interest
    noConflict: initialData.noConflict || false,
    yesConflict: initialData.yesConflict || false,
    conflictDescription: initialData.conflictDescription || '',
    
    // Section 2: Vendor Relationships
    vendorNo: initialData.vendorNo || false,
    vendorYes: initialData.vendorYes || false,
    vendorDetails: initialData.vendorDetails || '',
    
    // Section 3: Outside Employment
    employmentNo: initialData.employmentNo || false,
    employmentYes: initialData.employmentYes || false,
    employmentDetails: initialData.employmentDetails || '',
    
    // Section 4: Acknowledgment
    employeeSignature: initialData.employeeSignature || '',
    employeeDate: initialData.employeeDate || '',
    
    // HR/Management
    reviewedBy: initialData.reviewedBy || '',
    reviewerTitle: initialData.reviewerTitle || '',
    reviewDate: initialData.reviewDate || '',
    actionTaken: initialData.actionTaken || '',
    decisionNoConflict: initialData.decisionNoConflict || false,
    decisionMitigation: initialData.decisionMitigation || false,
    decisionFurtherReview: initialData.decisionFurtherReview || false,
    reviewerSignature: initialData.reviewerSignature || '',
    reviewerDate: initialData.reviewerDate || '',
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleDataChange = useCallback((newData: Partial<ConflictFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
    // Clear validation errors when user makes changes
    setValidationErrors(prev => Object.keys(prev).length > 0 ? {} : prev);
  }, []);

  // Use useEffect to call onDataChange when formData changes (but not on initial render)
  useEffect(() => {
    if (isInitialized && onDataChange) {
      onDataChange(formData);
    }
  }, [formData, onDataChange, isInitialized]);

  // Mark as initialized after first render
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: ValidationErrors = {};

    // Validate Employee Information
    if (!formData.name?.trim()) {
      errors.name = 'Employee name is required';
    }
    if (!formData.position?.trim()) {
      errors.position = 'Employee position is required';
    }
    if (!formData.department?.trim()) {
      errors.department = 'Employee department is required';
    }
    if (!formData.date) {
      errors.date = 'Date is required';
    }

    // Validate Section 1: Conflict of Interest
    if (!formData.noConflict && !formData.yesConflict) {
      errors.conflictOfInterest = 'Please select either "No conflict" or "Yes conflict"';
    }
    if (formData.yesConflict && (!formData.conflictDescription?.trim())) {
      errors.conflictDescription = 'Conflict description is required when "Yes conflict" is selected';
    }

    // Validate Section 2: Vendor Relationships
    if (!formData.vendorNo && !formData.vendorYes) {
      errors.vendorRelationship = 'Please select either "No" or "Yes" for vendor relationships';
    }
    if (formData.vendorYes && (!formData.vendorDetails?.trim())) {
      errors.vendorDetails = 'Vendor relationship details are required when "Yes" is selected';
    }

    // Validate Section 3: Outside Employment
    if (!formData.employmentNo && !formData.employmentYes) {
      errors.employmentRelationship = 'Please select either "No" or "Yes" for outside employment';
    }
    if (formData.employmentYes && (!formData.employmentDetails?.trim())) {
      errors.employmentDetails = 'Employment details are required when "Yes" is selected';
    }

    // Validate Section 4: Acknowledgment
    if (!formData.employeeSignature?.trim()) {
      errors.employeeSignature = 'Employee signature is required';
    }
    if (!formData.employeeDate) {
      errors.employeeDate = 'Employee signature date is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(formData);
      }
    } finally {
      setIsSaving(false);
    }
  }, [formData, onSave, isSaving]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const isValid = validateForm();
      
      if (!isValid) {
        // Scroll to first error
        const firstErrorElement = document.querySelector('[data-error]');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      if (onSubmit) {
        await onSubmit(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSubmit, validateForm, isSubmitting]);

  // Show loading spinner when saving or submitting
  if (isSaving) {
    return (
      <LoadingSpinner 
        title="Saving Draft" 
        message="Please wait while we save your form..."
        size="md"
      />
    );
  }

  if (isSubmitting) {
    return (
      <LoadingSpinner 
        title="Submitting Form" 
        message="Please wait while we process your submission..."
        size="md"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-4 px-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Form Pages */}
        <div className="space-y-6 sm:space-y-8">
          <ConflictFormPage1 
            formData={formData} 
            readOnly={readOnly} 
            onDataChange={handleDataChange}
            validationErrors={validationErrors}
            staffData={staffData}
          />
          <ConflictFormPage2 
            formData={formData} 
            readOnly={readOnly} 
            onDataChange={handleDataChange}
            validationErrors={validationErrors}
          />
          <ConflictFormPage3 
            formData={formData} 
            readOnly={readOnly} 
            onDataChange={handleDataChange}
            validationErrors={validationErrors}
          />
        </div>

        {/* Error Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
            <h3 className="text-red-800 font-semibold mb-2">Please fix the following errors:</h3>
            <ul className="text-red-700 space-y-1">
              {Object.entries(validationErrors).map(([field, error]) => (
                <li key={field} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span className="text-sm">{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Bottom Action Buttons */}
        {showButtons && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back to Forms
              </button>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <PDFDownloadButton
                  formData={formData}
                  formTitle="Conflict of Interest Disclosure"
                  staffName={staffData ? `${staffData.firstName} ${staffData.surname}` : undefined}
                  className="w-full sm:w-auto"
                />
                <button
                  onClick={handleSave}
                  disabled={isSaving || isSubmitting}
                  className="w-full sm:w-auto px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSaving || isSubmitting}
                  className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit & Continue'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
