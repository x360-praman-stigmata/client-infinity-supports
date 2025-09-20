"use client";

import React, { useState, useCallback, useEffect } from 'react';
import ConflictFormPage1 from './page1';
import ConflictFormPage2 from './page2';
import ConflictFormPage3 from './page3';

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

interface ConflictFormEditProps {
  initialData?: Partial<ConflictFormData>;
  onDataChange?: (data: ConflictFormData) => void;
  readOnly?: boolean;
  showButtons?: boolean;
  onSave?: (data: ConflictFormData) => Promise<void>;
  onSubmit?: (data: ConflictFormData) => Promise<void>;
}

export default function ConflictFormEdit({
  initialData = {},
  onDataChange,
  readOnly = false,
  showButtons = true,
  onSave,
  onSubmit
}: ConflictFormEditProps) {
  const [formData, setFormData] = useState<ConflictFormData>({
    // Employee Information
    name: initialData.name || '',
    position: initialData.position || '',
    department: initialData.department || '',
    date: initialData.date || '',
    
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

  const handleDataChange = useCallback((newData: Partial<ConflictFormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
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

  const handleSave = useCallback(async () => {
    if (onSave) {
      await onSave(formData);
    }
  }, [formData, onSave]);

  const handleSubmit = useCallback(async () => {
    if (onSubmit) {
      await onSubmit(formData);
    }
  }, [formData, onSubmit]);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        {showButtons && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back to Forms
              </button>
              
              <div className="flex gap-4">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Draft
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Submit & Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form Pages */}
        <div className="space-y-8">
          <ConflictFormPage1 formData={formData} readOnly={readOnly} onDataChange={handleDataChange} />
          <ConflictFormPage2 formData={formData} readOnly={readOnly} onDataChange={handleDataChange} />
          <ConflictFormPage3 formData={formData} readOnly={readOnly} onDataChange={handleDataChange} />
        </div>
      </div>
    </div>
  );
}
