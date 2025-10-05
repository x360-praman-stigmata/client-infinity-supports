"use client";

import React from 'react';
import FormPage from '@/components/ui/FormPage';

interface BullyingTrainingViewProps {
  data?: any;
  adminView?: boolean;
  readOnly?: boolean;
}

export default function BullyingTrainingView({ 
  data = {},
  adminView = false,
  readOnly = true
}: BullyingTrainingViewProps) {
  
  const getValue = (fieldName: string) => {
    return data[fieldName] || data.data?.[fieldName] || '';
  };

  const meta = {
    website: 'infinitysupportswa.org',
    formId: 'SF015',
    reviewDate: '01/03/2025'
  };

  const staffName = getValue('staffName') || 
    (data?.staff?.firstName && data?.staff?.surname ? 
      `${data.staff.firstName} ${data.staff.surname}` : 
      '');

  return (
    <div className={adminView ? "" : "bg-gray-100 py-8"}>
      <FormPage title="Bullying Training Acknowledgment" meta={meta} showTitle={!adminView}>
        <div className="space-y-6 text-sm w-full">
          <div className="w-full">
            <div className="p-8 w-full bg-white">
              
              {/* Acknowledgment Text with blank underlines */}
              <div className="mb-8 text-black leading-relaxed text-left">
                <p className="mb-3">
                  I, <span className="inline-block border-b border-black min-w-[200px] px-2"></span>, acknowledge that I completed <strong className="text-red-600">Bullying and harassment training</strong> conducted by Infinity Supports WA and HR Focus on <span className="inline-block border-b border-black min-w-[120px] px-2"></span>. I also acknowledge that I have received training/study materials for the above-mentioned training.
                </p>
              </div>

              {/* Form Fields - Desktop */}
              <div className="hidden sm:block space-y-6 mt-8">
                
                {/* Staff Name (as label with underline) */}
                <div className="flex items-end gap-4">
                  <span className="text-black whitespace-nowrap">Staff Name:</span>
                  <div className="flex-1 relative">
                    <div className="border-b border-black pb-1 min-h-[32px] flex items-end">
                      <span className="text-black">
                        {staffName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Staff Signature */}
                <div className="flex items-end gap-4">
                  <span className="text-black whitespace-nowrap">Staff Signature:</span>
                  <div className="flex-1 relative">
                    <div className="border-b border-black pb-2 min-h-[70px] flex items-end">
                      {data.staffSignature ? (
                        <img 
                          src={data.staffSignature} 
                          alt="Staff Signature" 
                          className="max-h-14 object-contain"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-end gap-4">
                  <span className="text-black whitespace-nowrap">Date:</span>
                  <div className="flex-1 relative">
                    <div className="border-b border-black pb-1 min-h-[32px] flex items-end">
                      <span className="text-black">
                        {getValue('date') || data.staffSignedAt ? 
                          new Date(getValue('date') || data.staffSignedAt).toLocaleDateString() : 
                          ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Manager Name */}
                <div className="flex items-end gap-4">
                  <span className="text-black whitespace-nowrap">Manager's Name:</span>
                  <div className="flex-1 relative">
                    <div className="border-b border-black pb-1 min-h-[32px] flex items-end">
                      <span className="text-black">
                        {getValue('managerName')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Manager Signature */}
                <div className="flex items-end gap-4">
                  <span className="text-black whitespace-nowrap">Manager's Signature:</span>
                  <div className="flex-1 relative">
                    <div className="border-b border-black pb-2 min-h-[70px] flex items-end">
                      {getValue('managerSignature') ? (
                        <img 
                          src={getValue('managerSignature')} 
                          alt="Manager Signature" 
                          className="max-h-14 object-contain"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>

              </div>

              {/* Form Fields - Mobile */}
              <div className="block sm:hidden space-y-6">
                
                <div>
                  <span className="text-black font-medium block mb-2">Staff Name:</span>
                  <div className="border-b border-black pb-1 min-h-[32px] flex items-end">
                    <span className="text-black text-sm">
                      {staffName}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-black font-medium block mb-2">Staff Signature:</span>
                  <div className="border-b border-black pb-2 min-h-[60px] flex items-end justify-center">
                    {data.staffSignature ? (
                      <img 
                        src={data.staffSignature} 
                        alt="Staff Signature" 
                        className="max-h-12 object-contain"
                      />
                    ) : null}
                  </div>
                </div>

                <div>
                  <span className="text-black font-medium block mb-2">Date:</span>
                  <div className="border-b border-black pb-1 min-h-[32px] flex items-end">
                    <span className="text-black text-sm">
                      {getValue('date') || data.staffSignedAt ? 
                        new Date(getValue('date') || data.staffSignedAt).toLocaleDateString() : 
                        ''}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-black font-medium block mb-2">Manager's Name:</span>
                  <div className="border-b border-black pb-1 min-h-[32px] flex items-end">
                    <span className="text-black text-sm">
                      {getValue('managerName')}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-black font-medium block mb-2">Manager's Signature:</span>
                  <div className="border-b border-black pb-2 min-h-[60px] flex items-end justify-center">
                    {getValue('managerSignature') ? (
                      <img 
                        src={getValue('managerSignature')} 
                        alt="Manager Signature" 
                        className="max-h-12 object-contain"
                      />
                    ) : null}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="mt-10 text-center">
                <p className="text-xs text-black italic">
                  This acknowledgment confirms completion of the Bullying Training program.
                </p>
              </div>

            </div>
          </div>
        </div>
      </FormPage>
    </div>
  );
}
