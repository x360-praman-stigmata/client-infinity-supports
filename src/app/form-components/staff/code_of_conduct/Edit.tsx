"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import SignatureCanvas from "@/components/ui/SignatureCanvas";
import { useToast } from "@/components/ui/Toast";
import FormPage from "@/components/ui/FormPage";

interface NDISCodeOfConductEditProps {
  token: string;
  staff?: { firstName: string; surname: string };
  onSubmitted?: () => void;
}

export interface NDISCodeOfConductEditRef {
  save: () => Promise<void>;
}

const NDISCodeOfConductEdit = forwardRef<NDISCodeOfConductEditRef, NDISCodeOfConductEditProps>(
  ({ token, staff, onSubmitted }, ref) => {
    const { showToast } = useToast();
    const [signature, setSignature] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [position, setPosition] = useState('');
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    // Load existing data
    useEffect(() => {
      const loadData = async () => {
        try {
          setLoading(true);
          const res = await fetch(`/api/staff/onboard/${token}`);
          const responseData = await res.json();
          
          if (!res.ok) {
            const errorMessage = responseData.message || 'Failed to load form data';
            console.error('Error Loading Form:', errorMessage);
            return;
          }
          
          if (responseData.submissions?.ndis_code_of_conduct) {
            const formData = responseData.submissions.ndis_code_of_conduct;
            setSignature(formData.staffSignature || '');
            setDate(formData.date || new Date().toISOString().split('T')[0]);
            setPosition(formData.position || '');
          }
          
          console.log('Form Loaded: NDIS Code of Conduct form loaded successfully');
        } catch (error) {
          console.error('Error loading form data:', error);
          console.error('Connection Error: Failed to connect to server');
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }, [token]);

    const isValidDateString = (value: string): boolean => {
      if (!value) return false;
      const t = Date.parse(value);
      if (Number.isNaN(t)) return false;
      const d = new Date(value);
      const today = new Date();
      const iso = (dt: Date) => dt.toISOString().slice(0,10);
      return iso(d) <= iso(today) && iso(d) >= '1900-01-01';
    };

    const validateForm = () => {
      const missing: string[] = [];
      if (!signature) missing.push('Signature');
      if (!date) missing.push('Date');
      if (!position) missing.push('Position');
      if (missing.length) {
        showToast({
          type: 'error',
          title: 'Please fill the required fields',
          message: `Missing: ${missing.join(', ')}`,
          duration: 6000
        });
        return false;
      }
      if (!isValidDateString(date)) {
        showToast({ type: 'error', title: 'Invalid Date', message: 'Date must be a valid past or today date.' });
        return false;
      }
      return true;
    };

    const save = async (isSubmit = false) => {
      if (isSubmit && !validateForm()) {
        return;
      }

      setSaving(true);
      try {
        const formData = {
          signature,
          date,
          position,
          staffName: staff ? `${staff.firstName} ${staff.surname}` : '',
          submittedAt: new Date().toISOString()
        };

        const res = await fetch(`/api/staff/onboard/${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            formKey: 'ndis_code_of_conduct', 
            data: formData, 
            submit: isSubmit 
          }),
        });

        const result = await res.json();
        
        if (!res.ok) {
          const errorMessage = result.message || result.error || 'Failed to save form';
          showToast({ type: 'error', title: 'Save Error', message: errorMessage });
          return;
        }

        const action = isSubmit ? 'Submitted' : 'Draft Saved';
        showToast({ type: 'success', title: action, message: 'NDIS Code of Conduct form updated successfully.' });

        if (isSubmit && onSubmitted) {
          setTimeout(() => {
            onSubmitted();
          }, 1000);
        }
      } catch (error) {
        console.error('Error saving form:', error);
        showToast({ type: 'error', title: 'Connection Error', message: 'Failed to connect to server.' });
      } finally {
        setSaving(false);
      }
    };

    useImperativeHandle(ref, () => ({
      save: () => save(false)
    }));

    if (loading) {
      return (
        <FormPage title="NDIS Code of Conduct">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your form data...</p>
            </div>
          </div>
        </FormPage>
      );
    }

    return (
      <FormPage 
        title="NDIS Code of Conduct"
      >
        <div className="max-w-4xl mx-auto">
          {/* Page 1 */}
          <div className="bg-white shadow-lg border border-gray-300 mb-6" style={{ minHeight: '1056px' }}>
            {/* Header */}
            <div className="flex border-b-2 border-black">
            <div className="w-1/2 border-r-2 border-black flex items-center justify-center p-6">
              <img
                src="/client_full_logo-bg-removed.png"
                alt="Infinity Supports WA logo"
                className="max-h-[160px] object-contain"
              />
            </div>
              <div className="w-1/2 bg-purple-600 flex items-center justify-center p-6">
              <h1 className="text-white font-bold text-3xl text-center leading-tight">
                NDIS Code of Conduct
              </h1>
              </div>
            </div>

            {/* Meta Information */}
            <div className="flex border-b border-gray-400 text-sm">
              <div className="w-1/2 border-r border-gray-400 p-3 text-gray-600">
                <strong>Doc No:</strong> NDIS Manual
              </div>
              <div className="w-1/4 border-r border-gray-400 p-3 text-gray-600">
                <strong>Version No:</strong> 01
              </div>
              <div className="w-1/4 p-3 text-gray-600">
                <strong>Version Date:</strong> 10/01/2024
              </div>
            </div>

            {/* Content - All NDIS Content */}
            <div className="px-8 py-6 text-sm leading-relaxed">
              <div className="mb-4">
                <p className="text-base">
                  <span className="text-green-600 text-lg mr-2">✓</span>
                  <span className="font-semibold text-red-600">Infinity Supports WA</span> and their workers are committed to following the NDIS Code of Conduct which is as per below:
                </p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex">
                  <span className="font-bold text-gray-700 mr-3 min-w-[20px]">1.</span>
                  <p>Act with respect for individual rights for the freedom of expression, self-determination and decision-making with applicable laws and conventions.</p>
                </div>
                
                <div className="flex">
                  <span className="font-bold text-gray-700 mr-3 min-w-[20px]">2.</span>
                  <p>Respect the privacy of people with <span className="underline font-semibold">disability</span>.</p>
                </div>
                
                <div className="flex">
                  <span className="font-bold text-gray-700 mr-3 min-w-[20px]">3.</span>
                  <p>Provide <span className="underline font-semibold">supports</span> and services in a manner that is safely and competently, with care and skill.</p>
                </div>
                
                <div className="flex">
                  <span className="font-bold text-gray-700 mr-3 min-w-[20px]">4.</span>
                  <p>Act with integrity, honesty and transparency.</p>
                </div>
                
                <div className="flex">
                  <span className="font-bold text-gray-700 mr-3 min-w-[20px]">5.</span>
                  <p>Promptly take steps to raise and act on concerns about matters that may impact the quality and safety of supports and services provided to people with disability.</p>
                </div>
                
                <div className="flex">
                  <span className="font-bold text-gray-700 mr-3 min-w-[20px]">6.</span>
                  <p>Take all reasonable steps to prevent and respond to all forms of violence against exploitation, neglect, and abuse of people with disability.</p>
                </div>
                
                <div className="flex">
                  <span className="font-bold text-gray-700 mr-3 min-w-[20px]">7.</span>
                  <p>Take all reasonable steps to prevent and respond to sexual misconduct.</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm leading-relaxed">
                  The NDIS Commission requires <span className="font-semibold text-red-600">Infinity Supports WA</span> to demonstrate honesty, integrity, and transparency in all their dealings. This extends to how they determine pricing for products and services offered to NDIS scheme participants, along with providing clear justifications for their pricing decisions. Additionally, providers are bound by the Australian Consumer Law (ACL), which prohibits misleading or deceptive conduct, false statements, and unfair contract terms, including those related to the pricing of goods and services, thus ensuring fair treatment of NDIS participants and plan managers.
                </p>
              </div>

              <div className="mb-6">
                
                <p className="mb-4">
                  Price differentiation occurs when a provider charges NDIS participants a higher price for identical products, supports, or services compared to other customers. The recently updated NDIS Code of Conduct Provider and Worker Guidance (Guidance) (April 22nd, 2024) recognises price differentiation as a potential form of 'sharp practice'. The Commission expects NDIS providers to refrain from engaging in or endorsing such practices. This entails:
                </p>
                
                <ul className="list-disc list-inside space-y-3 ml-4">
                  <li>
                    Avoiding charging participants more than others for essentially the same product, support, or service without valid justification.
                  </li>
                  <li>
                    Abstaining from promoting, advertising, or publicizing higher prices for essentially the same products, supports, or services for participants compared to others without valid justification.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Page 2 - Header and Signature Only */}
          <div className="bg-white shadow-lg border border-gray-300 mb-8" style={{ minHeight: '1056px' }}>
            {/* Header - Same as Page 1 */}
            <div className="flex border-b-2 border-black">
              <div className="w-1/2 border-r-2 border-black flex items-center justify-center p-6">
                <img
                  src="/client_full_logo-bg-removed.png"
                  alt="Infinity Supports WA logo"
                  className="max-h-[160px] object-contain"
                />
              </div>
              <div className="w-1/2 bg-purple-600 flex items-center justify-center p-6">
              <h1 className="text-white font-bold text-3xl text-center leading-tight">
                NDIS Code of Conduct
              </h1>
              </div>
            </div>

            {/* Meta Information - Same as Page 1 */}
            <div className="flex border-b border-gray-400 text-sm">
              <div className="w-1/2 border-r border-gray-400 p-3 text-gray-600">
                <strong>Doc No:</strong> NDIS Manual
              </div>
              <div className="w-1/4 border-r border-gray-400 p-3 text-gray-600">
                <strong>Version No:</strong> 01
              </div>
              <div className="w-1/4 p-3 text-gray-600">
                <strong>Version Date:</strong> 10/01/2024
              </div>
            </div>

            {/* Interactive Signature Section - Direct on Page */}
            <div className="px-8 py-6">
              <div className="mt-16">
                {/* Signature Fields - Direct on Page */}
                <div className="flex justify-between items-start gap-8">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Signature <span className="text-red-500">*</span></label>
                    <div className="border-b-2 border-gray-400 bg-transparent">
                      <SignatureCanvas
                        onSignatureEnd={setSignature}
                        existingSignature={signature}
                        width={250}
                        height={60}
                        penColor="#000000"
                        backgroundColor="transparent"
                        className="w-full"
                        placeholder="Please sign here"
                      />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full border-b-2 border-gray-400 bg-transparent h-12 px-0 text-sm focus:outline-none focus:border-blue-500"
                      max={new Date().toISOString().slice(0,10)}
                      min="1900-01-01"
                      required
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Position <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Enter your position/title"
                      className="w-full border-b-2 border-gray-400 bg-transparent h-12 px-0 text-sm focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pb-8">
            <button
              onClick={() => save(false)}
              disabled={saving}
              className={`px-8 py-3 text-white rounded-lg shadow disabled:cursor-not-allowed transition-colors ${
                saving 
                  ? 'bg-rose-500 hover:bg-rose-600' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => save(true)}
              disabled={saving}
              className={`px-8 py-3 text-white rounded-lg shadow disabled:cursor-not-allowed transition-colors ${
                saving 
                  ? 'bg-rose-500 hover:bg-rose-600' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {saving ? 'Submitting...' : 'Submit & Continue'}
            </button>
          </div>
        </div>
      </FormPage>
    );
  }
);

NDISCodeOfConductEdit.displayName = 'NDISCodeOfConductEdit';

export default NDISCodeOfConductEdit;
