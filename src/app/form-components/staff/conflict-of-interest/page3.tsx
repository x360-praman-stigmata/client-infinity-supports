"use client";
import React, { useRef } from "react";
import SignatureCanvas, { SignatureCanvasRef } from "@/components/ui/SignatureCanvas";

interface ConflictFormPage3Props {
  formData: Record<string, any>;
  readOnly?: boolean;
  onDataChange?: (data: any) => void;
  validationErrors?: Record<string, string>;
}

export default function ConflictFormPage3({ formData, readOnly = false, onDataChange, validationErrors = {} }: ConflictFormPage3Props) {
  const employeeSigRef = useRef<SignatureCanvasRef>(null);
  const reviewerSigRef = useRef<SignatureCanvasRef>(null);

  const handleInputChange = (field: string, value: any) => {
    if (onDataChange) {
      onDataChange({ [field]: value });
    }
  };

  const handleSignatureEnd = (field: string, signature: string) => {
    handleInputChange(field, signature);
  };

  const handleSignatureClear = (field: string) => {
    handleInputChange(field, "");
  };

  return (
    <div className="bg-white text-black px-8 py-8 max-w-[210mm] mx-auto font-['Open_Sans'] shadow-lg min-h-[297mm]">
      <div className="flex justify-center mb-4">
        <img
          src="/infinity_logo.png"
          alt="Infinity Supports WA logo with stylized infinity symbol in muted red above text"
          className="w-[350px] h-[160px] object-contain"
          width={350}
          height={160}
        />
      </div>

      <p className="text-center text-[20px] font-bold mb-8">
        Conflict of Interest Disclosure Form
      </p>

      <p className="font-bold mb-3">
        Section 4: Acknowledgment and Certification <span className="text-red-500">*</span>
      </p>
      <p className="mb-6 text-sm">
        I certify that the information provided above is complete and accurate
        to the best of my knowledge. I understand that failure to disclose a
        potential conflict of interest may result in disciplinary action, up
        to and including termination of employment. If a potential conflict
        arises after signing this form, I will promptly notify Infinity
        Supports WA in writing.
      </p>

      <div className="mb-6 space-y-4">
        <div className="flex items-center">
          <span className="font-bold w-48">Employee Signature: <span className="text-red-500">*</span></span>
          <div className="flex-1">
            {readOnly ? (
              <div className="border border-gray-400 p-2 min-h-[80px] flex items-center justify-center">
                {formData.employeeSignature ? (
                  <img 
                    src={formData.employeeSignature} 
                    alt="Employee Signature" 
                    className="max-h-[60px] max-w-[200px]"
                  />
                ) : (
                  <span className="text-gray-500">No signature provided</span>
                )}
              </div>
            ) : (
              <SignatureCanvas
                ref={employeeSigRef}
                onSignatureEnd={(signature) => handleSignatureEnd('employeeSignature', signature)}
                onSignatureClear={() => handleSignatureClear('employeeSignature')}
                existingSignature={formData.employeeSignature || ""}
                width={300}
                height={80}
                disabled={readOnly}
                placeholder="Draw employee signature"
              />
            )}
          </div>
        </div>
        <div className="flex items-center">
          <span className="font-bold w-48">Employee Date: <span className="text-red-500">*</span></span>
          {readOnly ? (
            <span className="font-normal border-b border-gray-400 px-2 py-1 min-w-[300px]">
              {formData.employeeDate || "_______________"}
            </span>
          ) : (
            <input
              type="date"
              value={formData.employeeDate || ""}
              onChange={(e) => handleInputChange('employeeDate', e.target.value)}
              className={`font-normal border-b px-2 py-1 min-w-[300px] focus:outline-none ${
                validationErrors.employeeDate 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-400 focus:border-blue-500'
              }`}
              data-error={validationErrors.employeeDate ? 'true' : undefined}
            />
          )}
        </div>
      </div>

      <hr className="border-t border-gray-400 mb-6" />

      <p className="font-bold mb-3">For HR/Management Use Only:</p>
      <div className="mb-6 space-y-3">
        <div className="flex items-center">
          <span className="font-normal w-32">Reviewed by:</span>
          {readOnly ? (
            <span className="font-normal border-b border-gray-400 px-2 py-1 min-w-[300px]">
              {formData.reviewedBy || "____________________________"}
            </span>
          ) : (
            <input
              type="text"
              value={formData.reviewedBy || ""}
              onChange={(e) => handleInputChange('reviewedBy', e.target.value)}
              className="font-normal border-b border-gray-400 px-2 py-1 min-w-[300px] focus:outline-none focus:border-blue-500"
              placeholder="Enter reviewer name"
            />
          )}
        </div>
        <div className="flex items-center">
          <span className="font-normal w-32">Title:</span>
          {readOnly ? (
            <span className="font-normal border-b border-gray-400 px-2 py-1 min-w-[300px]">
              {formData.reviewerTitle || "____________________________"}
            </span>
          ) : (
            <input
              type="text"
              value={formData.reviewerTitle || ""}
              onChange={(e) => handleInputChange('reviewerTitle', e.target.value)}
              className="font-normal border-b border-gray-400 px-2 py-1 min-w-[300px] focus:outline-none focus:border-blue-500"
              placeholder="Enter reviewer title"
            />
          )}
        </div>
        <div className="flex items-center">
          <span className="font-normal w-32">Date:</span>
          {readOnly ? (
            <span className="font-normal border-b border-gray-400 px-2 py-1 min-w-[300px]">
              {formData.reviewDate || "____________________________"}
            </span>
          ) : (
            <input
              type="date"
              value={formData.reviewDate || ""}
              onChange={(e) => handleInputChange('reviewDate', e.target.value)}
              className="font-normal border-b border-gray-400 px-2 py-1 min-w-[300px] focus:outline-none focus:border-blue-500"
            />
          )}
        </div>
      </div>

      <p className="mb-2">Action Taken (if applicable):</p>
      <div className="mb-6">
        {readOnly ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border-b border-gray-400 h-6"></div>
            ))}
          </div>
        ) : (
          <textarea
            value={formData.actionTaken || ""}
            onChange={(e) => handleInputChange('actionTaken', e.target.value)}
            className="w-full border border-gray-400 p-2 focus:outline-none focus:border-blue-500"
            rows={3}
            placeholder="Describe any action taken..."
          />
        )}
      </div>

      <div className="mb-6 space-y-2 text-sm">
        <div className="flex items-center">
          {readOnly ? (
            <input
              className="align-middle"
              type="checkbox"
              checked={!!formData.decisionNoConflict}
              readOnly
            />
          ) : (
            <input
              className="align-middle"
              type="checkbox"
              checked={!!formData.decisionNoConflict}
              onChange={(e) => handleInputChange('decisionNoConflict', e.target.checked)}
            />
          )}
          <label className="align-middle ml-2">
            No conflict found
          </label>
        </div>
        <div className="flex items-center">
          {readOnly ? (
            <input
              className="align-middle"
              type="checkbox"
              checked={!!formData.decisionMitigation}
              readOnly
            />
          ) : (
            <input
              className="align-middle"
              type="checkbox"
              checked={!!formData.decisionMitigation}
              onChange={(e) => handleInputChange('decisionMitigation', e.target.checked)}
            />
          )}
          <label className="align-middle ml-2">
            Conflict identified and mitigation plan implemented
          </label>
        </div>
        <div className="flex items-center">
          {readOnly ? (
            <input
              className="align-middle"
              type="checkbox"
              checked={!!formData.decisionFurtherReview}
              readOnly
            />
          ) : (
            <input
              className="align-middle"
              type="checkbox"
              checked={!!formData.decisionFurtherReview}
              onChange={(e) => handleInputChange('decisionFurtherReview', e.target.checked)}
            />
          )}
          <label className="align-middle ml-2">
            Further review required
          </label>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex items-center">
          <span className="font-bold w-48">Signature of Reviewer:</span>
          <div className="flex-1">
            {readOnly ? (
              <div className="border border-gray-400 p-2 min-h-[80px] flex items-center justify-center">
                {formData.reviewerSignature ? (
                  <img 
                    src={formData.reviewerSignature} 
                    alt="Reviewer Signature" 
                    className="max-h-[60px] max-w-[200px]"
                  />
                ) : (
                  <span className="text-gray-500">No signature provided</span>
                )}
              </div>
            ) : (
              <SignatureCanvas
                ref={reviewerSigRef}
                onSignatureEnd={(signature) => handleSignatureEnd('reviewerSignature', signature)}
                onSignatureClear={() => handleSignatureClear('reviewerSignature')}
                existingSignature={formData.reviewerSignature || ""}
                width={300}
                height={80}
                disabled={readOnly}
                placeholder="Draw reviewer signature"
              />
            )}
          </div>
        </div>
        <div className="flex items-center">
          <span className="font-bold w-48">Date:</span>
          {readOnly ? (
            <span className="font-normal border-b border-gray-400 px-2 py-1 min-w-[300px]">
              {formData.reviewerDate || "_______________"}
            </span>
          ) : (
            <input
              type="date"
              value={formData.reviewerDate || ""}
              onChange={(e) => handleInputChange('reviewerDate', e.target.value)}
              className="font-normal border-b border-gray-400 px-2 py-1 min-w-[300px] focus:outline-none focus:border-blue-500"
            />
          )}
        </div>
      </div>
    </div>
  );
}
