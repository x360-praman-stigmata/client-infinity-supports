"use client";
import React from "react";

interface ConflictFormPage2Props {
  formData: Record<string, any>;
  readOnly?: boolean;
  onDataChange?: (data: any) => void;
}

export default function ConflictFormPage2({ formData, readOnly = false, onDataChange }: ConflictFormPage2Props) {
  const handleInputChange = (field: string, value: any) => {
    if (onDataChange) {
      onDataChange({ ...formData, [field]: value });
    }
  };

  return (
    <div className="bg-white text-black px-8 py-8 max-w-[210mm] mx-auto font-['Open_Sans'] shadow-lg" style={{ minHeight: '297mm' }}>
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

      <p className="font-bold mb-2">
        Section 2: Description of Vendor Relationships
      </p>
      <div className="mb-6">
        {readOnly ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="border-b border-gray-400 h-6"></div>
            ))}
          </div>
        ) : (
          <textarea
            value={formData.vendorDetails || ""}
            onChange={(e) => handleInputChange('vendorDetails', e.target.value)}
            className="w-full border border-gray-400 p-2 focus:outline-none focus:border-blue-500"
            rows={6}
            placeholder="Describe any vendor relationships..."
          />
        )}
      </div>

      <hr className="border-t border-gray-400 mb-6" />

      <p className="font-bold mb-2">
        Section 3: Outside Employment or Business Activities
      </p>
      <p className="mb-4 text-sm">
        Are you engaged in any outside employment, consulting, or business
        activities that may impact your role at Infinity Supports WA?
      </p>

      <div className="mb-6 text-sm space-y-2">
        <div className="flex items-center">
          {readOnly ? (
            <input
              className="align-middle"
              type="checkbox"
              checked={!!formData.employmentNo}
              readOnly
            />
          ) : (
            <input
              className="align-middle"
              type="checkbox"
              checked={!!formData.employmentNo}
              onChange={(e) => handleInputChange('employmentNo', e.target.checked)}
            />
          )}
          <label className="align-middle ml-2">
            No
          </label>
        </div>
        <div className="flex items-center">
          {readOnly ? (
            <input
              className="align-middle"
              type="checkbox"
              checked={!!formData.employmentYes}
              readOnly
            />
          ) : (
            <input
              className="align-middle"
              type="checkbox"
              checked={!!formData.employmentYes}
              onChange={(e) => handleInputChange('employmentYes', e.target.checked)}
            />
          )}
          <label className="align-middle ml-2">
            Yes (If yes, please describe below.)
          </label>
        </div>
      </div>

      <div className="mb-6">
        {readOnly ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="border-b border-gray-400 h-6"></div>
            ))}
          </div>
        ) : (
          <textarea
            value={formData.employmentDetails || ""}
            onChange={(e) => handleInputChange('employmentDetails', e.target.value)}
            className="w-full border border-gray-400 p-2 focus:outline-none focus:border-blue-500"
            rows={5}
            placeholder="Describe any outside employment or business activities..."
          />
        )}
      </div>
    </div>
  );
}
