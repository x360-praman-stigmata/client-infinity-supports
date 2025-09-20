"use client";
import React from "react";

interface ConflictFormPage2Props {
  formData: Record<string, any>;
}

export default function ConflictFormPage2({ formData }: ConflictFormPage2Props) {
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

      
      <div className="mb-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="border-b border-gray-400 h-6 mb-2"></div>
        ))}
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
        <div>
          <input
            className="align-middle"
            type="checkbox"
            checked={!!formData.employmentNo}
            readOnly
          />
          <label className="align-middle ml-2">
            No
          </label>
        </div>
        <div>
          <input
            className="align-middle"
            type="checkbox"
            checked={!!formData.employmentYes}
            readOnly
          />
          <label className="align-middle ml-2">
            Yes (If yes, please describe below.)
          </label>
        </div>
      </div>

      <div className="mb-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="border-b border-gray-400 h-6 mb-2"></div>
        ))}
      </div>
    </div>
  );
}
