"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import SuperChoiceForm from "./page"; // Import the existing view component

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

export default function SuperChoiceFormEdit({
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

  const [localFormData, setLocalFormData] = useState({
    fullName: formData.fullName || "",
    employeeNumber: formData.employeeNumber || "",
    tfn: formData.tfn || "",
    fundChoice: formData.fundChoice || "",
    superFundName: formData.superFundName || "",
    superFundABN: formData.superFundABN || "",
    superFundUSI: formData.superFundUSI || "",
    memberAccountNumber: formData.memberAccountNumber || "",
    accountName: formData.accountName || "",
    hasComplianceLetter: formData.hasComplianceLetter || false,
    sectionBSignature: formData.sectionBSignature || "",
    sectionBDate: formData.sectionBDate || { day: "", month: "", year: "" },
    businessName: formData.businessName || "",
    businessABN: formData.businessABN || "",
    defaultSuperFundName: formData.defaultSuperFundName || "",
    defaultSuperFundABN: formData.defaultSuperFundABN || "",
    defaultSuperFundUSI: formData.defaultSuperFundUSI || "",
    chooseDefaultFund: formData.chooseDefaultFund || false,
    sectionCSignature: formData.sectionCSignature || "",
    sectionCDate: formData.sectionCDate || { day: "", month: "", year: "" },
    smsfName: formData.smsfName || "",
    smsfABN: formData.smsfABN || "",
    smsfESA: formData.smsfESA || "",
    smsfAccountName: formData.smsfAccountName || "",
    bankAccountName: formData.bankAccountName || "",
    bsbCode: formData.bsbCode || "",
    accountNumber: formData.accountNumber || "",
    hasSMSFEvidence: formData.hasSMSFEvidence || false,
    sectionDSignature: formData.sectionDSignature || "",
    sectionDDate: formData.sectionDDate || { day: "", month: "", year: "" }
  });

  useEffect(() => {
    setLocalFormData(prev => ({
      ...prev,
      ...formData
    }));
  }, [formData]);

  const handleDataChange = (data: any) => {
    setLocalFormData(data);
    if (onChange) {
      onChange(data);
    }
  };

  const handleSaveProgressInternal = async () => {
    if (handleSaveProgress && typeof handleSaveProgress === 'function') {
      setIsSaving(true);
      try {
        await handleSaveProgress();
        showToast("Progress saved successfully", "success");
      } catch (error) {
        console.error("Error saving progress:", error);
        showToast("Failed to save progress", "error");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleSubmitFormInternal = async () => {
    // Validate required fields based on fund choice
    const requiredFields = ['fullName', 'tfn'];
    let missingFields = requiredFields.filter(field => !(localFormData as any)[field]);

    // Add conditional required fields based on fund choice
    if (localFormData.fundChoice === 'existing') {
      const existingFundFields = ['superFundName', 'superFundABN', 'superFundUSI', 'memberAccountNumber', 'accountName'];
      missingFields = missingFields.concat(existingFundFields.filter(field => !(localFormData as any)[field]));
    } else if (localFormData.fundChoice === 'default') {
      const defaultFundFields = ['businessName', 'businessABN', 'defaultSuperFundName', 'defaultSuperFundABN', 'defaultSuperFundUSI'];
      missingFields = missingFields.concat(defaultFundFields.filter(field => !(localFormData as any)[field]));
    } else if (localFormData.fundChoice === 'smsf') {
      const smsfFields = ['smsfName', 'smsfABN', 'smsfESA', 'smsfAccountName', 'bankAccountName', 'bsbCode', 'accountNumber'];
      missingFields = missingFields.concat(smsfFields.filter(field => !(localFormData as any)[field]));
    }

    if (missingFields.length > 0) {
      showToast(`Please fill in all required fields: ${missingFields.join(', ')}`, "error");
      return;
    }

    if (handleSubmitForm && typeof handleSubmitForm === 'function') {
      setIsSubmitting(true);
      try {
        await handleSubmitForm();
        showToast("Form submitted successfully", "success");
      } catch (error) {
        console.error("Error submitting form:", error);
        showToast("Failed to submit form", "error");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="relative">
      <SuperChoiceForm
        initialData={localFormData}
        onDataChange={handleDataChange}
        readOnly={false}
        showButtons={false}
      />
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
