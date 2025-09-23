"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";
import TFNOverlayForm from "./page"; // Import the existing view component

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

export default function GovtTaxEdit({
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
  const { showToast } = useToast();

  // Initialize form data with existing values
  const [localFormData, setLocalFormData] = useState({
    tfn: formData.tfn || "",
    surname: formData.surname || "",
    firstName: formData.firstName || "",
    otherName: formData.otherName || "",
    anotherName: formData.anotherName || "",
    town: formData.town || "",
    state: formData.state || "",
    postcode: formData.postcode || "",
    check1: formData.check1 || false,
    check2: formData.check2 || false,
    check3: formData.check3 || false,
    check4: formData.check4 || false,
    check5: formData.check5 || false,
    check6: formData.check6 || false,
    check7: formData.check7 || false,
    check8: formData.check8 || false,
    subscribe: formData.subscribe || true,
    dob: formData.dob || "",
    address: formData.address || "",
    abnno: formData.abnno || "",
    branchNo: formData.branchNo || "",
    haveAbn: formData.haveAbn || "",
    legalName: formData.legalName || "",
    payerSignatureAt: formData.payerSignatureAt || "",
    payeeSignatureAt: formData.payeeSignatureAt || "",
    austrailanResident: formData.austrailanResident || "",
    claimTaxFree: formData.claimTaxFree || "",
    seniorPensioner: formData.seniorPensioner || "",
    overseasForces: formData.overseasForces || "",
    tsldebt: formData.tsldebt || "",
    financialDebt: formData.financialDebt || "",
    bussinessAddress: formData.bussinessAddress || "",
    bussinessTown: formData.bussinessTown || "",
    bussinessState: formData.bussinessState || "",
    bussinessPostcode: formData.bussinessPostcode || "",
    contactPerson: formData.contactPerson || "",
    bussinessPhoneNo: formData.bussinessPhoneNo || "",
    selectedOption: formData.selectedOption || "",
    payerSignature: formData.payerSignature || null,
    payeeSignature: formData.payeeSignature || null,
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
        showToast({
          type: 'success',
          title: 'Progress Saved',
          message: 'Your form progress has been saved successfully.',
          duration: 3000,
        });
      } catch (error) {
        console.error('Error saving progress:', error);
        showToast({
          type: 'error',
          title: 'Save Failed',
          message: 'Failed to save form progress. Please try again.',
          duration: 3000,
        });
      } finally {
        setIsSaving(false);
      }
    } else {
      handleSave(false); // Fallback to legacy
    }
  };

  // Submit form function
  const handleSubmitFormInternal = async () => {
    // Validate fields; allow optional ones like branchNo to be empty
    const optionalFields = new Set<string>(['branchNo']);
    const missingFields = Object.entries(localFormData)
      .filter(([key, value]) => {
        if (optionalFields.has(key)) return false;
        if (typeof value === 'boolean') return false; // booleans are fine
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        return false;
      })
      .map(([key]) => key);

    if (missingFields.length > 0) {
      const preview = missingFields.slice(0, 2);
      const extra = missingFields.length - preview.length;
      const suffix = extra > 0 ? ` (+${extra} more)` : '';
      showToast({
        type: 'error',
        title: 'Please complete all fields',
        message: `${preview.join(', ')}${suffix}`,
        duration: 6000,
      });
      return;
    }

    if (handleSubmitForm && typeof handleSubmitForm === 'function') {
      setIsSubmitting(true);
      try {
        await handleSubmitForm();
        showToast({
          type: 'success',
          title: 'Form Submitted',
          message: 'Your government tax form has been submitted successfully.',
          duration: 3000,
        });
      } catch (error) {
        console.error('Error submitting form:', error);
        showToast({
          type: 'error',
          title: 'Submission Failed',
          message: 'Failed to submit form. Please try again.',
          duration: 3000,
        });
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
      <TFNOverlayForm 
        initialData={localFormData}
        onDataChange={handleDataChange}
        readOnly={readOnly}
        showButtons={false} // Hide original buttons, we'll add our own
      />
      
      {/* Edit controls */}
      {!readOnly && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-10">
          <button
            onClick={handleSaveProgressInternal}
            disabled={isSaving || isSubmitting}
            className={`px-4 py-2 text-white rounded shadow ${
              isSaving 
                ? 'bg-rose-500 hover:bg-rose-600' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Progress'}
          </button>
          <button
            onClick={handleSubmitFormInternal}
            disabled={isSaving || isSubmitting}
            className={`px-4 py-2 text-white rounded shadow ${
              isSubmitting 
                ? 'bg-rose-500 hover:bg-rose-600' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </button>
        </div>
      )}
    </div>
  );
}
