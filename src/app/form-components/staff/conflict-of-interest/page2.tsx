"use client";
import React from "react";

interface ConflictFormPage2Props {
  formData: Record<string, any>;
  readOnly?: boolean;
  onDataChange?: (data: any) => void;
  validationErrors?: Record<string, string>;
}

export default function ConflictFormPage2({ formData, readOnly = false, onDataChange, validationErrors = {} }: ConflictFormPage2Props) {
  const handleInputChange = (field: string, value: any) => {
    if (onDataChange) {
      onDataChange({ [field]: value });
    }
  };

  return (
    <div className="bg-white text-black px-4 sm:px-8 py-6 sm:py-8 max-w-full sm:max-w-[210mm] mx-auto font-['Open_Sans'] shadow-lg min-h-[297mm]">
      <div className="flex justify-center mb-4">
        <img
          src="/infinity_logo.png"
          alt="Infinity Supports WA logo with stylized infinity symbol in muted red above text"
          className="w-[250px] sm:w-[350px] h-[120px] sm:h-[160px] object-contain"
          width={350}
          height={160}
        />
      </div>

      <p className="text-center text-[18px] sm:text-[20px] font-bold mb-6 sm:mb-8">
        Conflict of Interest Disclosure Form
      </p>

      <p className="font-bold mb-2">
        Section 2: Relationships with Vendors, Clients, or Competitors <span className="text-red-500">*</span>
      </p>
      <p className="mb-4 text-sm">
        Do you or any immediate family members have any financial interest,
        employment, or any other relationship with any vendors, clients, or
        competitors of Infinity Supports WA?
      </p>

      <div className="mb-6 text-sm space-y-3">
        <div className="flex items-start">
          {readOnly ? (
            <input
              className="mt-1 mr-3 w-4 h-4"
              type="checkbox"
              checked={!!formData.vendorNo}
              readOnly
            />
          ) : (
            <input
              className="mt-1 mr-3 w-4 h-4 cursor-pointer"
              type="checkbox"
              checked={!!formData.vendorNo}
              onChange={(e) => {
                handleInputChange('vendorNo', e.target.checked);
                if (e.target.checked) {
                  handleInputChange('vendorYes', false);
                  handleInputChange('vendorDetails', '');
                }
              }}
            />
          )}
          <label className="cursor-pointer flex-1">
            No
          </label>
        </div>
        <div className="flex items-start">
          {readOnly ? (
            <input
              className="mt-1 mr-3 w-4 h-4"
              type="checkbox"
              checked={!!formData.vendorYes}
              readOnly
            />
          ) : (
            <input
              className="mt-1 mr-3 w-4 h-4 cursor-pointer"
              type="checkbox"
              checked={!!formData.vendorYes}
              onChange={(e) => {
                handleInputChange('vendorYes', e.target.checked);
                if (e.target.checked) {
                  handleInputChange('vendorNo', false);
                }
              }}
            />
          )}
          <label className="cursor-pointer flex-1">
            Yes (If yes, please describe the relationship below.)
          </label>
        </div>
      </div>

      {formData.vendorYes && (
        <>
          <p className="font-bold mb-2">
            Description of vendor relationships:
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
                className={`w-full border p-2 focus:outline-none ${
                  validationErrors.vendorDetails 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-400 focus:border-blue-500'
                }`}
            rows={6}
            placeholder="Describe any vendor relationships..."
                data-error={validationErrors.vendorDetails ? 'true' : undefined}
          />
        )}
      </div>
        </>
      )}

      <hr className="border-t border-gray-400 mb-6" />

      <p className="font-bold mb-2">
        Section 3: Outside Employment or Business Activities <span className="text-red-500">*</span>
      </p>
      <p className="mb-4 text-sm">
        Are you engaged in any outside employment, consulting, or business
        activities that may impact your role at Infinity Supports WA?
      </p>

      <div className="mb-6 text-sm space-y-3">
        <div className="flex items-start">
          {readOnly ? (
            <input
              className="mt-1 mr-3 w-4 h-4"
              type="checkbox"
              checked={!!formData.employmentNo}
              readOnly
            />
          ) : (
            <input
              className="mt-1 mr-3 w-4 h-4 cursor-pointer"
              type="checkbox"
              checked={!!formData.employmentNo}
              onChange={(e) => {
                handleInputChange('employmentNo', e.target.checked);
                if (e.target.checked) {
                  handleInputChange('employmentYes', false);
                  handleInputChange('employmentDetails', '');
                }
              }}
            />
          )}
          <label className="cursor-pointer flex-1">
            No
          </label>
        </div>
        <div className="flex items-start">
          {readOnly ? (
            <input
              className="mt-1 mr-3 w-4 h-4"
              type="checkbox"
              checked={!!formData.employmentYes}
              readOnly
            />
          ) : (
            <input
              className="mt-1 mr-3 w-4 h-4 cursor-pointer"
              type="checkbox"
              checked={!!formData.employmentYes}
              onChange={(e) => {
                handleInputChange('employmentYes', e.target.checked);
                if (e.target.checked) {
                  handleInputChange('employmentNo', false);
                }
              }}
            />
          )}
          <label className="cursor-pointer flex-1">
            Yes (If yes, please describe below.)
          </label>
        </div>
      </div>

      {formData.employmentYes && (
        <>
          <p className="font-bold mb-2">
            Description of outside employment or business activities:
          </p>
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
                className={`w-full border p-2 focus:outline-none ${
                  validationErrors.employmentDetails 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-400 focus:border-blue-500'
                }`}
            rows={5}
            placeholder="Describe any outside employment or business activities..."
                data-error={validationErrors.employmentDetails ? 'true' : undefined}
          />
        )}
      </div>
        </>
      )}
    </div>
  );
}
