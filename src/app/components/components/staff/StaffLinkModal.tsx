"use client";

import { FaTimes, FaCopy, FaLink, FaCheck } from 'react-icons/fa';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface StaffGeneratedLink {
  url: string;
  expiresAt: string;
}

interface StaffLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
  staffId: number;
  link: StaffGeneratedLink | null;
}

export default function StaffLinkModal({ isOpen, onClose, staffName, staffId, link }: StaffLinkModalProps) {
  const [copied, setCopied] = useState(false);
  if (!isOpen || !link) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link.url);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="min-w-0 flex-1 mr-4">
            <h3 className="text-lg font-semibold text-gray-900">Onboarding Link Generated</h3>
            <p className="text-sm text-gray-600 mt-1 truncate">Share this link with {staffName} to collect employment details</p>
          </div>
          <button onClick={onClose} aria-label="Close" title="Close" className="p-2 hover:bg-gray-100 rounded-lg">
            <FaTimes className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Onboarding Link</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 bg-white p-3 rounded border break-all">{link.url}</p>
              </div>
              <button
                onClick={copy}
                className={`px-3 py-2 rounded-lg flex items-center font-medium transition-all duration-150 focus:outline-none ${
                  copied ? 'bg-emerald-500 text-white scale-105' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
                aria-label="Copy onboarding link"
              >
                {copied ? (
                  <>
                    <FaCheck className="inline mr-2 h-4 w-4" /> Copied!
                  </>
                ) : (
                  <>
                    <FaCopy className="inline mr-2 h-4 w-4" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">Staff ID</p>
              <p className="text-2xl font-bold text-blue-600">{staffId}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm font-medium text-orange-900">Expires</p>
              <p className="text-sm font-semibold text-orange-600">{new Date(link.expiresAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <a href={`/admin/staff`} className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={onClose}>
            <FaLink className="mr-2 h-4 w-4" /> Manage Staff
          </a>
          <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Done</button>
        </div>
      </div>
    </div>
  );
}


