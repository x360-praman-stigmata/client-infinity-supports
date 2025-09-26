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
      // Map field keys to user-friendly labels and sections
  const fieldLabels: { [key: string]: string } = {
        driver: 'Driver Name (Driver Information)',
        licenceNumber: 'Licence Number (Driver Information)',
        plantIdNo: 'Plant ID No. (Driver Information)',
        vehicleRegistration: 'Vehicle Registration (Driver Information)',
        insurancePolicy: 'Insurance Policy (Driver Information)',
        dateOfInspection: 'Date of Inspection (Driver Information)',
        headlights: 'Headlights (Lights)',
        headlightsAction: 'Headlights Action (Lights)',
        parkingLights: 'Parking Lights (Lights)',
        parkingLightsAction: 'Parking Lights Action (Lights)',
        hazardLights: 'Indicators/Blinker (Lights)',
        hazardLightsAction: 'Indicators/Blinker Action (Lights)',
        brakeLights: 'Brake Lights (Lights)',
        brakeLightsAction: 'Brake Lights Action (Lights)',
        reverseLights: 'Reverse Lights (Lights)',
        reverseLightsAction: 'Reverse Lights Action (Lights)',
        trailerParkingLights: 'Trailer/Parking Lights (Lights)',
        trailerParkingLightsAction: 'Trailer/Parking Lights Action (Lights)',
        hazardLights2: 'Indicators/Blinker 2 (Lights)',
        hazardLights2Action: 'Indicators/Blinker 2 Action (Lights)',
        brakeLights2: 'Brake Lights 2 (Lights)',
        brakeLights2Action: 'Brake Lights 2 Action (Lights)',
        reverseLights2: 'Reverse Lights 2 (Lights)',
        reverseLights2Action: 'Reverse Lights 2 Action (Lights)',
        handbrake: 'Handbrake (Brakes and Warnings)',
        handbrakeAction: 'Handbrake Action (Brakes and Warnings)',
        brakePedal: 'Brake Pedal (Brakes and Warnings)',
        brakePedalAction: 'Brake Pedal Action (Brakes and Warnings)',
        horn: 'Horn (Brakes and Warnings)',
        hornAction: 'Horn Action (Brakes and Warnings)',
        noSmokingSigns: 'No Smoking Signs (Interior)',
        noSmokingSignsAction: 'No Smoking Signs Action (Interior)',
        internalCleanliness: 'Internal Cleanliness (Interior)',
        internalCleanlinessAction: 'Internal Cleanliness Action (Interior)',
        cargoBarrier: 'Cargo Barrier (Interior)',
        cargoBarrierAction: 'Cargo Barrier Action (Interior)',
        safetyBelts: 'Safety Belts (Interior)',
        safetyBeltsAction: 'Safety Belts Action (Interior)',
        bodyDamage: 'Body Damage (Exterior)',
        bodyDamageAction: 'Body Damage Action (Exterior)',
        windscreen: 'Windscreen (Exterior)',
        windscreenAction: 'Windscreen Action (Exterior)',
        wipers: 'Wipers (Exterior)',
        wipersAction: 'Wipers Action (Exterior)',
        washerReservoir: 'Washer Reservoir (Exterior)',
        washerReservoirAction: 'Washer Reservoir Action (Exterior)',
        tyreTread: 'Tyre Tread (Exterior)',
        tyreTreadAction: 'Tyre Tread Action (Exterior)',
        tyreMatching: 'Tyre Matching (Exterior)',
        tyreMatchingAction: 'Tyre Matching Action (Exterior)',
        tyrePressure: 'Tyre Pressure (Exterior)',
        tyrePressureAction: 'Tyre Pressure Action (Exterior)',
        reportingSystem: 'Reporting System (General Safety)',
        reportingSystemAction: 'Reporting System Action (General Safety)',
        servicing: 'Servicing (General Safety)',
        servicingAction: 'Servicing Action (General Safety)',
  // Registration (General Safety)
  vehicleRegistration: 'Registration (General Safety)',
  // First Aid Kit Section (actual fields)
  firstAidCompliance: 'First Aid Kit: Contents compliance (First Aid Kit)',
  firstAidCleanliness: 'First Aid Kit: Container clean/orderly (First Aid Kit)',
  firstAidReplenish: 'First Aid Kit: Replenish system (First Aid Kit)',
  expiryDates: 'First Aid Kit: Expiry dates checked (First Aid Kit)',
  outdatedItems: 'First Aid Kit: Out of date items disposed (First Aid Kit)',
  // fireExtinguisher: 'Fire Extinguisher (General Safety)', // Remove if not in formData
        fireExtinguisherAction: 'Fire Extinguisher Action (General Safety)',
        wheelchairLift: 'Wheelchair Lift (General Safety)',
        wheelchairLiftAction: 'Wheelchair Lift Action (General Safety)',
        spareWheel: 'Spare Wheel (General Safety)',
        spareWheelAction: 'Spare Wheel Action (General Safety)',
        jack: 'Jack (General Safety)',
        jackAction: 'Jack Action (General Safety)',
        tools: 'Tools (General Safety)',
        toolsAction: 'Tools Action (General Safety)',
        reflectiveTriangles: 'Reflective Triangles (General Safety)',
        reflectiveTrianglesAction: 'Reflective Triangles Action (General Safety)',
        appropriateTransport: 'Appropriate for Transport (Client Transport)',
        appropriateTransportAction: 'Appropriate for Transport Action (Client Transport)',
        secureClients: 'Facility to Secure Clients (Client Transport)',
        secureClientsAction: 'Facility to Secure Clients Action (Client Transport)',
        clientBehavior: 'Client Behaviour Known (Client Behaviour)',
        clientBehaviorAction: 'Client Behaviour Action (Client Behaviour)',
        otherIssue1: 'Other Issue 1 (Other Issues)',
        otherIssue1Response: 'Other Issue 1 Response (Other Issues)',
        otherIssue1Action: 'Other Issue 1 Action (Other Issues)',
        otherIssue2: 'Other Issue 2 (Other Issues)',
        otherIssue2Response: 'Other Issue 2 Response (Other Issues)',
        otherIssue2Action: 'Other Issue 2 Action (Other Issues)',
        otherIssue3: 'Other Issue 3 (Other Issues)',
        otherIssue3Response: 'Other Issue 3 Response (Other Issues)',
        otherIssue3Action: 'Other Issue 3 Action (Other Issues)',
        otherIssue4: 'Other Issue 4 (Other Issues)',
        otherIssue4Response: 'Other Issue 4 Response (Other Issues)',
        otherIssue4Action: 'Other Issue 4 Action (Other Issues)',
        otherIssue5: 'Other Issue 5 (Other Issues)',
        otherIssue5Response: 'Other Issue 5 Response (Other Issues)',
        otherIssue5Action: 'Other Issue 5 Action (Other Issues)',
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
        'firstAidCompliance', 'firstAidCleanliness', 'firstAidReplenish', 'expiryDates', 'outdatedItems', 'wheelchairHoist',
        // add other radio fields as needed
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
