"use client";

import { useState } from 'react';

interface BackToFormsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAndExit: () => void;
  onDiscardAndExit: () => void;
  formName?: string;
  hasUnsavedChanges?: boolean;
}

export default function BackToFormsModal({
  isOpen,
  onClose,
  onSaveAndExit,
  onDiscardAndExit,
  formName = "form",
  hasUnsavedChanges = true
}: BackToFormsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {hasUnsavedChanges ? 'Unsaved Changes' : 'Leave Form'}
          </h3>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            {hasUnsavedChanges 
              ? `You have unsaved changes in the ${formName}. What would you like to do?`
              : `Are you sure you want to leave the ${formName}?`
            }
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {hasUnsavedChanges && (
            <button
              onClick={onSaveAndExit}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save & Back to Forms
            </button>
          )}
          
          <button
            onClick={onDiscardAndExit}
            className={`w-full px-4 py-2 rounded-lg transition-colors ${
              hasUnsavedChanges 
                ? 'bg-gray-500 text-white hover:bg-gray-600' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {hasUnsavedChanges ? "Don't Save & Back to Forms" : "Back to Forms"}
          </button>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
