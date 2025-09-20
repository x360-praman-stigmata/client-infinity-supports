"use client";

import React from 'react';
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

interface ConflictFormViewProps {
  data?: ConflictFormData;
}

export default function ConflictFormView({ data = {} }: ConflictFormViewProps) {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-[210mm] mx-auto">
        {/* Form Pages - Read Only */}
        <div className="space-y-8">
          <ConflictFormPage1 formData={data} readOnly={true} />
          <ConflictFormPage2 formData={data} readOnly={true} />
          <ConflictFormPage3 formData={data} readOnly={true} />
        </div>
      </div>
    </div>
  );
}
