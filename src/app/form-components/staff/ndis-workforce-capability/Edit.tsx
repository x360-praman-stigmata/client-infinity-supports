"use client";

import React, { useState, useEffect, useCallback } from "react";
import NdisWorkforceCapabilityView from "./View";

interface FormProps {
  formData: any;
  commonFieldsData: any;
  onChange: (values: any, field?: string, isCommon?: boolean) => void;
  onSubmit?: (values: any) => void;
  readOnly?: boolean;
  fieldErrors?: Record<string, string>;
  handleSave: (submit: boolean) => void;
  handleSaveProgress?: () => Promise<void>;
  handleSubmitForm?: () => Promise<void>;
  onCommonFieldsUpdated?: () => void;
}

export default function NdisWorkforceCapabilityEdit({
  formData = {},
  commonFieldsData = {},
  onChange,
  onSubmit,
  readOnly = false,
  fieldErrors = {},
  handleSave,
  handleSaveProgress,
  handleSubmitForm,
  onCommonFieldsUpdated
}: FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data with existing values
  const [localFormData, setLocalFormData] = useState({
    name: formData.name || "",
    signature: formData.signature || "",
    date: formData.date || "",
    ...formData // Include any other existing data
  });

  // Update local data when formData prop changes
  useEffect(() => {
    setLocalFormData(prev => ({
      ...prev,
      ...formData
    }));
  }, [formData]);

  // Handle form field changes
  const handleFieldChange = (field: string, value: any) => {
    const updatedData = { ...localFormData, [field]: value };
    setLocalFormData(updatedData);
    
    // Notify parent component of changes
    if (onChange) {
      onChange({ [field]: value });
    }
  };

  // Save progress function
  const handleSaveProgressInternal = async () => {
    if (handleSaveProgress && typeof handleSaveProgress === 'function') {
      setIsSaving(true);
      try {
        await handleSaveProgress();
      } catch (error) {
        console.error('Error saving progress:', error);
        alert('Failed to save form progress. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else {
      handleSave(false); // Fallback to legacy
    }
  };

  // Submit form function
  const handleSubmitFormInternal = async () => {
    // Validate required fields
    const requiredFields = ['name', 'signature', 'date'];
    const missingFields = requiredFields.filter(field => !(localFormData as any)[field]);
    
    if (missingFields.length > 0) {
      alert(`Please fill in required fields: ${missingFields.join(', ')}`);
      return;
    }

    if (handleSubmitForm && typeof handleSubmitForm === 'function') {
      setIsSubmitting(true);
      try {
        await handleSubmitForm();
      } catch (error) {
        console.error('Error submitting form:', error);
        alert('Failed to submit form. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      handleSave(true); // Fallback to legacy
    }
  };

  // Handle data changes from the form
  const handleDataChange = useCallback((data: any) => {
    setLocalFormData(data);
    if (onChange) {
      onChange(data);
    }
  }, [onChange]);

  return (
    <div className="relative">
      {/* Use the existing view component with edit capabilities */}
      <NdisWorkforceCapabilityView 
        data={localFormData}
        onDataChange={handleDataChange}
        readOnly={readOnly}
        showOverlay={!readOnly}
        overlayFields={{
          name: {
            label: "Name",
            type: "text",
            value: localFormData.name,
            onChange: (value: string) => handleFieldChange('name', value),
            placeholder: "Enter your full name",
            required: true
          },
          signature: {
            label: "Signature",
            type: "text",
            value: localFormData.signature,
            onChange: (value: string) => handleFieldChange('signature', value),
            placeholder: "Enter your signature",
            required: true
          },
          date: {
            label: "Date",
            type: "date",
            value: localFormData.date,
            onChange: (value: string) => handleFieldChange('date', value),
            required: true
          }
        }}
      />
      
      {/* Edit controls */}
      {!readOnly && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-10">
          <button
            onClick={handleSaveProgressInternal}
            disabled={isSaving || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSaving ? 'Saving...' : 'Save Progress'}
          </button>
          <button
            onClick={handleSubmitFormInternal}
            disabled={isSaving || isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      )}
    </div>
  );
}

