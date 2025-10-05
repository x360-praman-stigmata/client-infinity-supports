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

  return (
    <div className="bg-gray-100 py-8">
      <FormPage title="Bullying Training Acknowledgment" meta={meta}>
        <div className="space-y-6 text-sm w-full">
          <div className="w-full">
            <div className="border border-gray-300 rounded-lg p-6 w-full">
              
              {/* Training Acknowledgment Text */}
              <div className="mb-6">
                <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                  <h3 className="text-xl font-semibold">Training Acknowledgment</h3>
                </div>
                <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                  <div className="text-center space-y-4">
                    <p className="text-gray-900 leading-relaxed">
                      I acknowledge that I completed <strong className="text-red-600">Bullying training</strong> conducted by Infinity Supports WA.
                    </p>
                    <p className="text-gray-900 leading-relaxed">
                      I also acknowledge that I have received training/study materials for the above-mentioned training.
                    </p>
                  </div>
                </div>
              </div>

              {/* Staff Information */}
              <div className="mb-6">
                <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                  <h3 className="text-xl font-semibold">Staff Information</h3>
                </div>
                <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                  <div className="space-y-6">
                    
                    {/* Staff Name */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="font-medium text-gray-700 w-32 shrink-0">Staff Name:</label>
                      <div className="flex-1 border-b-2 border-gray-300 bg-gray-50 p-2 rounded">
                        <span className="text-gray-900">
                          {getValue('staffName') || 
                           (data?.staff?.firstName && data?.staff?.surname ? 
                            `${data.staff.firstName} ${data.staff.surname}` : 
                            'Not provided')}
                        </span>
                      </div>
                    </div>

                    {/* Staff Signature */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                      <label className="font-medium text-gray-700 w-32 shrink-0 sm:mt-2">Staff Signature:</label>
                      <div className="flex-1">
                        <div className="border-2 border-gray-300 bg-gray-50 p-4 rounded min-h-[80px] flex items-center justify-center">
                          {data.staffSignature ? (
                            <img 
                              src={data.staffSignature} 
                              alt="Staff Signature" 
                              className="max-h-16 max-w-full object-contain"
                            />
                          ) : (
                            <span className="text-gray-400 italic">No signature provided</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="font-medium text-gray-700 w-32 shrink-0">Date:</label>
                      <div className="flex-1 border-b-2 border-gray-300 bg-gray-50 p-2 rounded">
                        <span className="text-gray-900">
                          {getValue('date') || data.staffSignedAt ? 
                            new Date(getValue('date') || data.staffSignedAt).toLocaleDateString() : 
                            'Not provided'}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Manager Information */}
              <div>
                <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                  <h3 className="text-xl font-semibold">Manager Information</h3>
                </div>
                <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                  <div className="space-y-6">
                    
                    {/* Manager Name */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <label className="font-medium text-gray-700 w-32 shrink-0">Manager's Name:</label>
                      <div className="flex-1 border-b-2 border-gray-300 bg-gray-50 p-2 rounded">
                        <span className="text-gray-900">
                          {getValue('managerName') || 'Not provided'}
                        </span>
                      </div>
                    </div>

                    {/* Manager Signature */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                      <label className="font-medium text-gray-700 w-32 shrink-0 sm:mt-2">Manager's Signature:</label>
                      <div className="flex-1">
                        <div className="border-2 border-gray-300 bg-gray-50 p-4 rounded min-h-[80px] flex items-center justify-center">
                          {getValue('managerSignature') ? (
                            <img 
                              src={getValue('managerSignature')} 
                              alt="Manager Signature" 
                              className="max-h-16 max-w-full object-contain"
                            />
                          ) : (
                            <span className="text-gray-400 italic">No signature provided</span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 italic">
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
