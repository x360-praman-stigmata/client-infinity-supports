"use client";

import React from 'react';

interface FormPageProps {
  children: React.ReactNode;
  title?: string;
  showTitle?: boolean;
  meta?: {
    website?: string;
    version?: string;
    reviewDate?: string;
  };
}

export default function FormPage({ children, title, showTitle = true, meta }: FormPageProps) {
  const finalMeta = {
    website: meta?.website || 'infinitysupportswa.org',
    version: meta?.version || 'S1004',
    reviewDate: meta?.reviewDate || '01/03/2005'
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-AU');
    } catch {
      return date;
    }
  };

  return (
    <div className="bg-white w-full max-w-[794px] mx-auto min-h-[1123px] border shadow p-8 print:p-6 flex flex-col">
      {/* Header with Logo and Company Name */}
      <div className="text-center mb-6">
        <div className="flex justify-center items-center gap-4 mb-4">
          <img src="/infinity_logo.png" alt="Infinity Support WA" className="h-16 w-auto" />
        </div>
        {showTitle && title && (
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        )}
      </div>

      {/* Content - Full width with proper margins from logo/footer */}
      <div className="flex-1 w-full px-6">
        {children}
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="mt-auto pt-4 text-[10px] text-gray-600 grid grid-cols-3">
        <div>Website: {finalMeta.website}</div>
        <div className="text-center">{finalMeta.version}</div>
        <div className="text-right">Review Date: {formatDate(finalMeta.reviewDate)}</div>
      </div>
    </div>
  );
}
