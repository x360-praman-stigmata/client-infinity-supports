"use client";
import React from "react";

interface ConflictFormPage3Props {
  formData: Record<string, any>;
}

export default function ConflictFormPage3({ formData }: ConflictFormPage3Props) {
  return (
    <div className="bg-white text-black px-6 py-6 max-w-3xl mx-auto font-['Open_Sans']">
      <div className="flex justify-center mb-2">
          <img
            src="/infinity_logo.png"
            alt="Infinity Supports WA logo with stylized infinity symbol in muted red above text"
            className="w-[350px] h-[160px] object-contain"
            width={350}
            height={160}
          />
        </div>

        <p className="text-center text-[20px] font-bold mb-6">
          Conflict of Interest Disclosure Form
        </p>

      <p className="font-bold mb-3">
        Section 4: Acknowledgment and Certification
      </p>
      <p className="mb-6 text-sm">
        I certify that the information provided above is complete and accurate
        to the best of my knowledge. I understand that failure to disclose a
        potential conflict of interest may result in disciplinary action, up
        to and including termination of employment. If a potential conflict
        arises after signing this form, I will promptly notify Infinity
        Supports WA in writing.
      </p>

      <p className="font-bold mb-1">
        Employee Signature: {formData.employeeSignature || "____________________________"}
      </p>
      <p className="font-bold mb-6">
        Date: {formData.employeeDate || "_______________"}
      </p>

      <hr className="border-t border-gray-400 mb-6" />

      <p className="font-bold mb-3">For HR/Management Use Only:</p>
      <p className="mb-1">
        Reviewed by: {formData.reviewedBy || "____________________________"}
      </p>
      <p className="mb-1">
        Title: {formData.reviewerTitle || "____________________________"}
      </p>
      <p className="mb-6">
        Date: {formData.reviewDate || "____________________________"}
      </p>

      <p className="mb-2">Action Taken (if applicable):</p>
      <div className="mb-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="border-b border-gray-400 h-6 mb-2"></div>
        ))}
      </div>

      <div className="mb-6 space-y-2 text-sm">
        <div>
          <input
            className="align-middle"
            type="checkbox"
            checked={!!formData.decisionNoConflict}
            readOnly
          />
          <label className="align-middle ml-2">
            No conflict found
          </label>
        </div>
        <div>
          <input
            className="align-middle"
            type="checkbox"
            checked={!!formData.decisionMitigation}
            readOnly
          />
          <label className="align-middle ml-2">
            Conflict identified and mitigation plan implemented
          </label>
        </div>
        <div>
          <input
            className="align-middle"
            type="checkbox"
            checked={!!formData.decisionFurtherReview}
            readOnly
          />
          <label className="align-middle ml-2">
            Further review required
          </label>
        </div>
      </div>

      <p className="font-bold mb-1">
        Signature of Reviewer: {formData.reviewerSignature || "____________________________"}
      </p>
      <p className="font-bold">
        Date: {formData.reviewerDate || "_______________"}
      </p>
    </div>
  );
}
