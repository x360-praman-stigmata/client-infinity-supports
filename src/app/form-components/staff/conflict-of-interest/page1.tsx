"use client";
import React from "react";

interface ConflictFormPage1Props {
  formData: Record<string, any>;
  readOnly?: boolean;
  onDataChange?: (data: any) => void;
  validationErrors?: Record<string, string>;
}

export default function ConflictFormPage1({ formData, readOnly = false, onDataChange, validationErrors = {} }: ConflictFormPage1Props) {
  const handleInputChange = (field: string, value: any) => {
    if (onDataChange) {
      onDataChange({ [field]: value });
    }
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

      <p className="font-bold mb-2">Employee Information:</p>
      <div className="mb-6 space-y-3">
        <div className="flex items-center">
          <span className="font-normal w-32">Name: <span className="text-red-500">*</span></span>
          {readOnly ? (
            <span className="font-normal border-b border-gray-400 px-2 py-1 min-w-[300px]">
              {formData.name || "____________________________"}
            </span>
          ) : (
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`font-normal border-b px-2 py-1 min-w-[300px] focus:outline-none ${
                validationErrors.name 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-400 focus:border-blue-500'
              }`}
              placeholder="Enter full name"
              data-error={validationErrors.name ? 'true' : undefined}
            />
          )}
        </div>
        <div className="flex items-center">
          <span className="font-normal w-32">Position: <span className="text-red-500">*</span></span>
          {readOnly ? (
            <span className="font-normal border-b border-gray-400 px-2 py-1 min-w-[300px]">
              {formData.position || "____________________________"}
            </span>
          ) : (
            <input
              type="text"
              value={formData.position || ""}
              onChange={(e) => handleInputChange('position', e.target.value)}
              className={`font-normal border-b px-2 py-1 min-w-[300px] focus:outline-none ${
                validationErrors.position 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-400 focus:border-blue-500'
              }`}
              placeholder="Enter position"
              data-error={validationErrors.position ? 'true' : undefined}
            />
          )}
        </div>
        <div className="flex items-center">
          <span className="font-normal w-32">Department: <span className="text-red-500">*</span></span>
          {readOnly ? (
            <span className="font-normal border-b border-gray-400 px-2 py-1 min-w-[300px]">
              {formData.department || "____________________________"}
            </span>
          ) : (
            <input
              type="text"
              value={formData.department || ""}
              onChange={(e) => handleInputChange('department', e.target.value)}
              className={`font-normal border-b px-2 py-1 min-w-[300px] focus:outline-none ${
                validationErrors.department 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-400 focus:border-blue-500'
              }`}
              placeholder="Enter department"
              data-error={validationErrors.department ? 'true' : undefined}
            />
          )}
        </div>
        <div className="flex items-center">
          <span className="font-normal w-32">Date: <span className="text-red-500">*</span></span>
          {readOnly ? (
            <span className="font-normal border-b border-gray-400 px-2 py-1 min-w-[300px]">
              {formData.date || "____________________________"}
            </span>
          ) : (
            <input
              type="date"
              value={formData.date || ""}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`font-normal border-b px-2 py-1 min-w-[300px] focus:outline-none ${
                validationErrors.date 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-gray-400 focus:border-blue-500'
              }`}
              data-error={validationErrors.date ? 'true' : undefined}
            />
          )}
        </div>
      </div>

      <hr className="border-t border-gray-400 mb-6" />

      <p className="font-bold mb-2">
        Section 1: Disclosure of Potential Conflict of Interest <span className="text-red-500">*</span>
      </p>
      <p className="mb-4 text-sm">
        Do you have any financial, personal, or professional interests that may
        conflict, or appear to conflict, with your duties at Infinity Supports
        WA Pty Ltd?
      </p>

      <div className="mb-6 text-sm space-y-3">
        <div className="flex items-start">
          {readOnly ? (
            <input
              className="mt-1 mr-3 w-4 h-4"
              type="checkbox"
              checked={!!formData.noConflict}
              readOnly
            />
          ) : (
            <input
              className="mt-1 mr-3 w-4 h-4 cursor-pointer"
              type="checkbox"
              checked={!!formData.noConflict}
              onChange={(e) => {
                handleInputChange('noConflict', e.target.checked);
                if (e.target.checked) {
                  handleInputChange('yesConflict', false);
                  handleInputChange('conflictDescription', '');
                }
              }}
            />
          )}
          <label className="cursor-pointer flex-1">
            No, I do not have any conflicts to disclose.
          </label>
        </div>
        <div className="flex items-start">
          {readOnly ? (
            <input
              className="mt-1 mr-3 w-4 h-4"
              type="checkbox"
              checked={!!formData.yesConflict}
              readOnly
            />
          ) : (
            <input
              className="mt-1 mr-3 w-4 h-4 cursor-pointer"
              type="checkbox"
              checked={!!formData.yesConflict}
              onChange={(e) => {
                handleInputChange('yesConflict', e.target.checked);
                if (e.target.checked) {
                  handleInputChange('noConflict', false);
                }
              }}
            />
          )}
          <label className="cursor-pointer flex-1">
            Yes, I have a potential conflict to disclose. (Please provide
            details below.)
          </label>
        </div>
      </div>

      {formData.yesConflict && (
        <>
          <p className="font-bold mb-2">
            Description of the potential conflict of interest:
          </p>
          <div className="mb-6">
            {readOnly ? (
              <div className="space-y-2">
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className="border-b border-gray-400 h-6"></div>
                ))}
              </div>
            ) : (
              <textarea
                value={formData.conflictDescription || ""}
                onChange={(e) => handleInputChange('conflictDescription', e.target.value)}
                className={`w-full border p-2 focus:outline-none ${
                  validationErrors.conflictDescription 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-400 focus:border-blue-500'
                }`}
                rows={7}
                placeholder="Describe any potential conflicts of interest..."
                required={formData.yesConflict}
                data-error={validationErrors.conflictDescription ? 'true' : undefined}
              />
            )}
            {formData.yesConflict && !formData.conflictDescription?.trim() && (
              <p className="text-red-500 text-sm mt-1">
                Please provide details about the potential conflict of interest.
              </p>
            )}
          </div>
        </>
      )}

    </div>
  );
}
