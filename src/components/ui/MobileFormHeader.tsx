"use client";

import React from 'react';

interface MobileFormHeaderProps {
  title: string;
  staffName?: string;
  onBack?: () => void;
}

export default function MobileFormHeader({
  title,
  staffName,
  onBack
}: MobileFormHeaderProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg mb-4 sm:mb-6 overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold truncate">{title}</h1>
            {staffName && (
              <p className="text-rose-100 text-sm mt-1 truncate">{staffName}</p>
            )}
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="ml-3 p-2 text-white hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
