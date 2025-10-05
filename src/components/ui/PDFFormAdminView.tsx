"use client";

import React from 'react';

interface PDFFormAdminViewProps {
  title: string;
  description?: string;
  pdfUrl: string;
  data?: any;
  formType?: string;
}

export default function PDFFormAdminView({ 
  title, 
  description = "PDF Document - Read & Submit Form",
  pdfUrl,
  data = {}
}: PDFFormAdminViewProps) {
  return (
    <div className="bg-gray-50 min-h-screen py-4 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm sm:ml-auto">
              <span className="text-green-600 font-medium">✅ Completed</span>
              {data?.staffSignedAt && (
                <span className="text-gray-500">
                  {new Date(data.staffSignedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Instant PDF Display */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <embed
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            type="application/pdf"
            className="w-full h-[800px] sm:h-[900px]"
            title={title}
          />
        </div>
      </div>
    </div>
  );
}
