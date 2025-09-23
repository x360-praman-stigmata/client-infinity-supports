import React from "react";
import FormPage from "@/components/ui/FormPage";

export default function DocumentationAcknowledgementView({ staffName, signature, date }: { staffName: string; signature: string; date: string }) {
  return (
    <FormPage>
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-green-700 mb-2">Documentation Acknowledgement</h2>
          <p className="text-gray-700 text-base mb-2">I confirm I have received copies of the following documents from Infinity Supports WA.</p>
          <ul className="list-disc list-inside text-gray-700 mb-2">
            <li>First aid policy</li>
            <li>Vehicle safety policy</li>
            <li>Vehicle safety inspection checklist</li>
            <li>Training on bullying and harassment</li>
          </ul>
          <p className="text-gray-700 text-sm mb-2">Copies of the same documents are available on <a href="https://www.infinitysupportswa.org" className="text-blue-700 underline" target="_blank" rel="noopener noreferrer">www.infinitysupportswa.org</a> and could also be requested via email. I have read and understood the contents of these documents.</p>
          <p className="text-gray-700 text-sm mb-2">I also confirm that,</p>
          <ul className="list-disc list-inside text-gray-700 mb-2">
            <li>I will conduct vehicle safety inspection as per the checklist provided by Infinity Supports WA at the start of each working day.</li>
            <li>I will ensure that my driving license is valid, vehicle used for work purposes is registered, comprehensively insured and mechanically sound.</li>
            <li>I understand that I will be provided with a first aid kit to be always kept in my vehicle and the onus is on me to inform management should any contents of the first aid kits expire.</li>
            <li>I will work in compliance with NDIS code of conduct.</li>
          </ul>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Staff Name</label>
            <div className="w-full px-3 py-2 border-b-2 border-gray-500 bg-transparent text-black font-semibold text-lg">{staffName}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Signature</label>
            {signature ? (
              <img src={signature} alt="Signature" className="h-20" />
            ) : (
              <div className="text-gray-400">No signature provided</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="w-full px-3 py-2 border-b-2 border-gray-500 bg-transparent text-black font-semibold text-lg">{date}</div>
          </div>
        </div>
      </div>
    </FormPage>
  );
}
