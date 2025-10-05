"use client";
import React, { useRef, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import SignatureCanvas, { SignatureCanvasRef } from "@/components/ui/SignatureCanvas";
import FormPage from "@/components/ui/FormPage";
import { useToast } from "@/components/ui/Toast";

export default function AcknowledgementEditPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [staff, setStaff] = useState<any>(null);
  const [staffName, setStaffName] = useState("");
  const [signature, setSignature] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const sigPadRef = useRef<SignatureCanvasRef | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/staff/onboard/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setStaff(data.staff);
        if (data?.staff?.firstName && data?.staff?.surname) {
          setStaffName(`${data.staff.firstName} ${data.staff.surname}`);
        }
        const saved = data.submissions?.documentation_acknowledgement || {};
        if (saved.signature) setSignature(saved.signature);
        if (saved.date) setDate(saved.date);

        setTimeout(() => setFormReady(true), 800);
      } catch (error: any) {
        console.error("Error loading data:", error);
        alert(error.message);
        setFormReady(true);
      } finally {
        setLoading(false);
      }
    };
    if (token) loadData();
  }, [token]);

  const handleSignatureEnd = (signatureDataUrl: string) => {
    setSignature(signatureDataUrl);
  };
  const handleSignatureClear = () => {
    setSignature("");
    if (sigPadRef.current) sigPadRef.current.clear();
  };

  const isValidDateString = (value: string): boolean => {
    if (!value) return false;
    const t = Date.parse(value);
    if (Number.isNaN(t)) return false;
    const d = new Date(value);
    const today = new Date();
    // Strip time for comparison
    const iso = (dt: Date) => dt.toISOString().slice(0,10);
    return iso(d) <= iso(today) && iso(d) >= '1900-01-01';
  };

  const getMissingFields = (): string[] => {
    const missing: string[] = [];
    if (!staffName) missing.push('Staff Name');
    if (!signature) missing.push('Signature');
    if (!date) missing.push('Date');
    return missing;
  };

  const handleSave = async (isSubmit = false) => {
    if (!token) return;
    if (isSubmit) {
      const missing = getMissingFields();
      if (missing.length > 0) {
        showToast({
          type: 'error',
          title: 'Please fill the required fields',
          message: `Missing: ${missing.join(', ')}`,
          duration: 6000
        });
        return;
      }
      // Validate date value
      if (!isValidDateString(date)) {
        showToast({ type: 'error', title: 'Invalid Date', message: 'Date must be a valid past or today date.' });
        return;
      }
    }
    setSaving(true);
    try {
      const payload = {
        formKey: "documentation_acknowledgement",
        data: { staffName, signature, date },
        submit: isSubmit,
      };
      const res = await fetch(`/api/staff/onboard/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to save");
      if (isSubmit) {
        showToast({ type: 'success', title: 'Submitted', message: 'Documentation Acknowledgement submitted successfully.' });
        router.push(`/staff/onboard/${token}`);
      } else {
        showToast({ type: 'success', title: 'Draft Saved', message: 'Your draft was saved successfully.' });
      }
    } catch (error: any) {
      console.error("Error saving:", error);
      showToast({ type: 'error', title: 'Save failed', message: error.message || 'Failed to save' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formReady) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-t-rose-500 border-rose-200 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Loading Form</h3>
          <p className="text-slate-600 font-medium">Please wait while we load your form...</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">

            <button
              onClick={() => router.push(`/staff/onboard/${token}`)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              ← Back to Forms
            </button>
          </div>
        </div>

        {/* A4-styled FormPage */}
        <div className="bg-transparent">
          <FormPage title="Documentation Acknowledgement" showTitle={true}>
            <div className="mb-6">
            <p className="text-gray-700 text-base mb-2">I confirm I have received copies of the following documents from Infinity Supports WA.</p>
            <ul className="list-disc list-outside text-gray-700 mb-2 pl-6">
              <li>First aid policy</li>
              <li>Vehicle safety policy</li>
              <li>Vehicle safety inspection checklist</li>
              <li>Training on bullying and harassment</li>
            </ul>
            <p className="text-gray-700 text-sm mb-2">Copies of the same documents are available on <a href="https://www.infinitysupportswa.org" className="text-blue-700 underline" target="_blank" rel="noopener noreferrer">www.infinitysupportswa.org</a> and could also be requested via email. I have read and understood the contents of these documents.</p>
            <ul className="list-disc list-outside text-gray-700 mb-2 pl-6">
              <li>I will conduct vehicle safety inspection as per the checklist provided by Infinity Supports WA at the start of each working day.</li>
              <li>I will ensure that my driving license is valid, Vehicle used for work purposes is registered, comprehensively insured and mechanically sound.</li>
              <li>I understand that I will be provided with a first aid kit to be always kept in my vehicle and the onus is on me to inform management should any contents of the first aid kits expire.</li>
              <li>I will work in compliance with <a href="https://www.ndis.gov.au/about-ndis/what-ndis" className="text-blue-700 underline" target="_blank" rel="noopener noreferrer">NDIS</a> code of conduct.</li>
            </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name</label>
                <input
                  type="text"
                  value={staffName}
                  readOnly
                  className="w-full px-3 py-2 border-b-2 border-gray-500 bg-transparent text-black font-semibold text-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signature</label>
                <div className="border border-gray-300 rounded-md p-2 bg-white">
                  <SignatureCanvas
                    ref={sigPadRef}
                    onSignatureEnd={handleSignatureEnd}
                    existingSignature={signature}
                    height={100}
                  />

                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-gray-500 bg-transparent text-black font-semibold text-lg focus:outline-none"
                max={new Date().toISOString().slice(0,10)}
                min="1900-01-01"
                />
              </div>
            </div>
          </FormPage>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t">
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 ${
              saving ? 'bg-rose-500 hover:bg-rose-600' : 'bg-gray-500 hover:bg-gray-600'
            }`}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className={`px-6 py-2 text-white rounded-lg disabled:opacity-50 ${
              saving ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {saving ? 'Submitting...' : 'Submit & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
