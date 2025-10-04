"use client";

import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/Toast";
import VehicleSafetyInspectionForm from "./VehicleSafetyInspectionForm";

interface FormProps {
  formData: any;
  commonFieldsData: any;
  onChange: (values: any, field?: string, isCommon?: boolean) => void;
  onSubmit?: (values: any) => void;
  readOnly?: boolean;
  fieldErrors?: Record<string, string>;
  handleSave: (submit: boolean) => void;
  handleSaveProgress?: () => Promise<void>;
  handleSubmitForm?: () => Promise<void>;
  onCommonFieldsUpdated?: () => void;
}

export default function VehicleSafetyInspectionEdit({
  formData = {},
  commonFieldsData = {},
  onChange,
  onSubmit,
  readOnly = false,
  fieldErrors = {},
  handleSave,
  handleSaveProgress,
  handleSubmitForm,
  onCommonFieldsUpdated
}: FormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const [localFormData, setLocalFormData] = useState(formData);

  const handleDataChange = (data: any) => {
    setLocalFormData(data);
    onChange(data);
  };

  const handleSaveProgressInternal = async () => {
    if (handleSaveProgress && typeof handleSaveProgress === 'function') {
      setIsSaving(true);
      try {
        await handleSaveProgress();
        showToast({ type: 'success', title: 'Draft Saved', message: 'Draft saved successfully for staff.' });
      } catch (error) {
        console.error("Error saving progress:", error);
        showToast({ type: 'error', title: 'Error', message: 'Failed to save draft.' });
      } finally {
        setIsSaving(false);
      }
    } else if (handleSave) {
      handleSave(false);
      showToast({ type: 'success', title: 'Draft Saved', message: 'Draft saved successfully for staff.' });
    }
  }

  const handleSubmitFormInternal = async () => {
    // Validation: check all fields are filled
      // Map field keys to user-friendly labels and sections (only fields that actually exist in the form)
  const fieldLabels: { [key: string]: string } = {
        driver: 'Driver Name (Driver Information)',
        licenceNumber: 'Licence Number (Driver Information)',
        plantIdNo: 'Plant ID No. (Driver Information)',
        vehicleRegistration: 'Vehicle Registration (Driver Information)',
        insurancePolicy: 'Insurance Policy (Driver Information)',
        dateOfInspection: 'Date of Inspection (Driver Information)',
        headlights: 'Headlights (Lights)',
        parkingLights: 'Parking Lights (Lights)',
        hazardLights: 'Indicators/Blinker (Lights)',
        brakeLights: 'Brake Lights (Lights)',
        reverseLights: 'Reverse Lights (Lights)',
        trailerParkingLights: 'Trailer/Parking Lights (Lights)',
        hazardLights2: 'Indicators/Blinker 2 (Lights)',
        brakeLights2: 'Brake Lights 2 (Lights)',
        reverseLights2: 'Reverse Lights 2 (Lights)',
        handbrake: 'Handbrake (Brakes and Warnings)',
        brakePedal: 'Brake Pedal (Brakes and Warnings)',
        horn: 'Horn (Brakes and Warnings)',
        noSmokingSigns: 'No Smoking Signs (Interior)',
        internalCleanliness: 'Internal Cleanliness (Interior)',
        cargoBarrier: 'Cargo Barrier (Interior)',
        safetyBelts: 'Safety Belts (Interior)',
        bodyDamage: 'Body Damage (Exterior)',
        windscreen: 'Windscreen (Exterior)',
        wipers: 'Wipers (Exterior)',
        washerReservoir: 'Washer Reservoir (Exterior)',
        tyreTread: 'Tyre Tread (Exterior)',
        tyreMatching: 'Tyre Matching (Exterior)',
        tyrePressure: 'Tyre Pressure (Exterior)',
        reportingSystem: 'Reporting System (General Safety)',
        servicing: 'Servicing (General Safety)',
        firstAidCompliance: 'First Aid Kit: Contents compliance (First Aid Kit)',
        firstAidCleanliness: 'First Aid Kit: Container clean/orderly (First Aid Kit)',
        firstAidReplenish: 'First Aid Kit: Replenish system (First Aid Kit)',
        expiryDates: 'First Aid Kit: Expiry dates checked (First Aid Kit)',
        outdatedItems: 'First Aid Kit: Out of date items disposed (First Aid Kit)',
        wheelchairHoist: 'Wheelchair Hoist (Transportation of Clients)',
        appropriateTransport: 'Appropriate for Transport (Client Transport)',
        secureClients: 'Facility to Secure Clients (Client Transport)',
        clientBehavior: 'Client Behaviour Known (Client Behaviour)',
        otherIssue1: 'Other Issue 1 (Other Issues)',
        otherIssue1Response: 'Other Issue 1 Response (Other Issues)',
        otherIssue2: 'Other Issue 2 (Other Issues)',
        otherIssue2Response: 'Other Issue 2 Response (Other Issues)',
        otherIssue3: 'Other Issue 3 (Other Issues)',
        otherIssue3Response: 'Other Issue 3 Response (Other Issues)',
        otherIssue4: 'Other Issue 4 (Other Issues)',
        otherIssue4Response: 'Other Issue 4 Response (Other Issues)',
        otherIssue5: 'Other Issue 5 (Other Issues)',
        otherIssue5Response: 'Other Issue 5 Response (Other Issues)',
        returnTo: 'Return To (Final Review)',
        reviewedBy: 'Reviewed By (Final Review)',
        reviewerPosition: 'Reviewer Position (Final Review)',
        reviewDate: 'Review Date (Final Review)',
        nextInspectionDate: 'Next Inspection Date (Final Review)'
      };
      // Exclude all 'Action' fields from required validation
      const requiredFields = Object.keys(fieldLabels).filter(
        (key) => !key.toLowerCase().includes('action')
      );
      // For radio fields, require value to be 'yes' or 'no'. For text/date, require non-empty string.
      const radioFields = [
        'headlights', 'parkingLights', 'hazardLights', 'brakeLights', 'reverseLights', 'trailerParkingLights',
        'hazardLights2', 'brakeLights2', 'reverseLights2', 'handbrake', 'brakePedal', 'horn',
        'noSmokingSigns', 'internalCleanliness', 'cargoBarrier', 'safetyBelts', 'bodyDamage', 'windscreen',
        'wipers', 'washerReservoir', 'tyreTread', 'tyreMatching', 'tyrePressure', 'reportingSystem',
        'servicing', 'firstAidCompliance', 'firstAidCleanliness', 'firstAidReplenish', 'expiryDates',
        'outdatedItems', 'wheelchairHoist', 'appropriateTransport', 'secureClients', 'clientBehavior',
        'otherIssue1Response', 'otherIssue2Response', 'otherIssue3Response', 'otherIssue4Response', 'otherIssue5Response'
      ];
      const missingFields = requiredFields.filter(field => {
        if (radioFields.includes(field)) {
          return localFormData[field] !== 'yes' && localFormData[field] !== 'no';
        }
        return !localFormData[field] || localFormData[field] === "";
      });
      if (missingFields.length > 0) {
        let message = '';
        if (missingFields.length === 1) {
          message = `Please fill: ${fieldLabels[missingFields[0]]}`;
        } else if (missingFields.length === 2) {
          message = `Please fill: ${fieldLabels[missingFields[0]]} and ${fieldLabels[missingFields[1]]}`;
        } else {
          message = `Please fill: ${fieldLabels[missingFields[0]]}, ${fieldLabels[missingFields[1]]}, etc.`;
        }
        showToast({
          type: 'error',
          title: 'Missing Required Fields',
          message
        });
        return;
      }

    if (handleSubmitForm && typeof handleSubmitForm === 'function') {
      setIsSubmitting(true);
      try {
        await handleSubmitForm();
        showToast({ type: 'success', title: 'Success', message: 'Form submitted successfully.' });
      } catch (error) {
        console.error("Error submitting form:", error);
        showToast({ type: 'error', title: 'Error', message: 'Failed to submit form.' });
      } finally {
        setIsSubmitting(false);
      }
    } else if (handleSave) {
      handleSave(true);
    }
	};

  return (
    <div className="relative">
      <VehicleSafetyInspectionForm
        initialData={localFormData}
        onDataChange={handleDataChange}
        readOnly={readOnly}
        showButtons={false}
      />
      {!readOnly && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-10">
          <button 
            onClick={handleSaveProgressInternal} 
            disabled={isSaving || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>
          <button 
            onClick={handleSubmitFormInternal} 
            disabled={isSaving || isSubmitting}
            className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Submitting...' : 'Save and Continue'}
          </button>
        </div>
      )}
    </div>
  );
}
