"use client";
import React from "react";
import FormPage from '@/components/ui/FormPage';

interface DocumentationAcknowledgementProps {
  formData?: Record<string, any>;
  data?: any;
  adminView?: boolean;
}

export default function DocumentationAcknowledgement({
  formData = {},
  data = {},
  adminView = false
}: DocumentationAcknowledgementProps) {
  
  const getValue = (fieldName: string) => {
    return data[fieldName] || data.data?.[fieldName] || formData?.[fieldName] || '';
  };

  const meta = {
    website: 'infinitysupportswa.org',
    formId: 'SF016',
    reviewDate: '01/03/2025'
  };

  return (
    <div className={adminView ? "" : "bg-gray-100 py-8"}>
      <FormPage title="Documentation Acknowledgement" meta={meta} showTitle={true}>
        <div className="space-y-6 text-sm w-full">
          <div className="w-full">
            <div className="p-8 w-full bg-white">
              
              {/* Content Text */}
              <div className="mb-6">
                <p className="text-black mb-4">
                  I confirm I have received copies of the following documents from Infinity Supports WA.
                </p>
              </div>

              {/* Document List */}
              <div className="mb-6">
                <ul className="list-disc list-inside mb-4 space-y-2 text-black">
                  <li>First aid policy</li>
                  <li>Vehicle safety policy</li>
                  <li>Vehicle safety inspection checklist</li>
                  <li>Training on bullying and harassment</li>
                </ul>
              </div>

              {/* Additional Information */}
              <div className="mb-6">
                <p className="mb-4 text-black">
                  Copies of the same documents are available on{" "}
                  <a
                    className="text-blue-600 underline"
                    href="http://www.infinitysupportswa.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    www.infinitysupportswa.org
                  </a>{" "}
                  and could also be requested via email. I have read and understood the contents of these documents.
                </p>
                <p className="mb-4 text-black">I also confirm that,</p>
              </div>

              {/* Confirmation List */}
              <div className="mb-10">
                <ul className="list-disc list-inside space-y-3 text-black">
                  <li>
                    I will conduct vehicle safety inspection as per the checklist provided by Infinity Supports WA at the start of each working day.
                  </li>
                  <li>
                    I will ensure that my driving license is valid, vehicle used for work purposes is registered, comprehensively insured and mechanically sound.
                  </li>
                  <li>
                    I understand that I will be provided with a first aid kit to be always kept in my vehicle and the onus is on me to inform management should any contents of the first aid kits expire.
                  </li>
                  <li>
                    I will work in compliance with{" "}
                    <a
                      className="text-blue-600 underline"
                      href="https://www.ndiscommission.gov.au/workers/worker-responsibilities/ndis-code-conduct"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      NDIS
                    </a>{" "}
                    code of conduct.
                  </li>
                </ul>
              </div>

              {/* Signature Section - Desktop */}
              <div className="hidden sm:block space-y-6">
                
                {/* Staff Name */}
                <div className="flex items-end gap-4">
                  <span className="text-black whitespace-nowrap">Staff Name:</span>
                  <div className="flex-1 relative">
                    <div className="border-b border-black pb-1 min-h-[32px] flex items-end">
                      <span className="text-black">
                        {getValue('staffName') || 
                         (data?.staff?.firstName && data?.staff?.surname ? 
                          `${data.staff.firstName} ${data.staff.surname}` : 
                          '')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Signature */}
                <div className="flex items-end gap-4">
                  <span className="text-black whitespace-nowrap">Signature:</span>
                  <div className="flex-1 relative">
                    <div className="border-b border-black pb-2 min-h-[70px] flex items-end">
                      {(data.staffSignature || getValue('signature')) ? (
                        <img 
                          src={data.staffSignature || getValue('signature')} 
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

              </div>

              {/* Signature Section - Mobile */}
              <div className="block sm:hidden space-y-6">
                
                <div>
                  <span className="text-black block mb-2">Staff Name:</span>
                  <div className="border-b border-black pb-1 min-h-[32px] flex items-end">
                    <span className="text-black text-sm">
                      {getValue('staffName') || 
                       (data?.staff?.firstName && data?.staff?.surname ? 
                        `${data.staff.firstName} ${data.staff.surname}` : 
                        '')}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-black block mb-2">Signature:</span>
                  <div className="border-b border-black pb-2 min-h-[60px] flex items-end justify-center">
                    {(data.staffSignature || getValue('signature')) ? (
                      <img 
                        src={data.staffSignature || getValue('signature')} 
                        alt="Staff Signature" 
                        className="max-h-12 object-contain"
                      />
                    ) : null}
                  </div>
                </div>

                <div>
                  <span className="text-black block mb-2">Date:</span>
                  <div className="border-b border-black pb-1 min-h-[32px] flex items-end">
                    <span className="text-black text-sm">
                      {getValue('date') || data.staffSignedAt ? 
                        new Date(getValue('date') || data.staffSignedAt).toLocaleDateString() : 
                        ''}
                    </span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </FormPage>
    </div>
  );
}
