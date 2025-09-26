"use client";

import React, { useState, useEffect } from "react";
import FormPage from '@/components/ui/FormPage';

interface VehicleSafetyInspectionFormProps {
  initialData?: any;
  onDataChange?: (data: any) => void;
  readOnly?: boolean;
  showButtons?: boolean;
}

export default function VehicleSafetyInspectionForm({
  initialData = {},
  onDataChange,
  readOnly = false,
  showButtons = true
}: VehicleSafetyInspectionFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    if (field === 'driver' && !value.trim()) {
      newErrors[field] = 'Driver name is required';
    } else if (field === 'dateOfInspection' && !value) {
      newErrors[field] = 'Inspection date is required';
    } else if (field === 'licenceNumber' && value && !/^[A-Z0-9]+$/.test(value)) {
      newErrors[field] = 'License number should contain only letters and numbers';
    } else {
      delete newErrors[field];
    }
    
    setErrors(newErrors);
  };

  const handleNumberInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter
    if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
        // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (e.keyCode === 65 && e.ctrlKey) ||
        (e.keyCode === 67 && e.ctrlKey) ||
        (e.keyCode === 86 && e.ctrlKey) ||
        (e.keyCode === 88 && e.ctrlKey)) {
      return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  };
  const [formData, setFormData] = useState({
    driver: initialData.driver || "",
    licenceNumber: initialData.licenceNumber || "",
    plantIdNo: initialData.plantIdNo || "",
    vehicleRegistration: initialData.vehicleRegistration || "",
    insurancePolicy: initialData.insurancePolicy || "",
    dateOfInspection: initialData.dateOfInspection || "",
    
    // Lights
    headlights: initialData.headlights || "",
    headlightsAction: initialData.headlightsAction || "",
    parkingLights: initialData.parkingLights || "",
    parkingLightsAction: initialData.parkingLightsAction || "",
    
    // Indicators/Blinker
    hazardLights: initialData.hazardLights || "",
    hazardLightsAction: initialData.hazardLightsAction || "",
    brakeLights: initialData.brakeLights || "",
    brakeLightsAction: initialData.brakeLightsAction || "",
    reverseLights: initialData.reverseLights || "",
    reverseLightsAction: initialData.reverseLightsAction || "",
    trailerParkingLights: initialData.trailerParkingLights || "",
    trailerParkingLightsAction: initialData.trailerParkingLightsAction || "",
    // Second Indicators/Blinker section (PDF requirement)
    hazardLights2: initialData.hazardLights2 || "",
    hazardLights2Action: initialData.hazardLights2Action || "",
    brakeLights2: initialData.brakeLights2 || "",
    brakeLights2Action: initialData.brakeLights2Action || "",
    reverseLights2: initialData.reverseLights2 || "",
    reverseLights2Action: initialData.reverseLights2Action || "",
    
    // Brakes and Warnings
    handbrake: initialData.handbrake || "",
    handbrakeAction: initialData.handbrakeAction || "",
    brakePedal: initialData.brakePedal || "",
    brakePedalAction: initialData.brakePedalAction || "",
    horn: initialData.horn || "",
    hornAction: initialData.hornAction || "",
    
    // Interior
    noSmokingSigns: initialData.noSmokingSigns || "",
    noSmokingSignsAction: initialData.noSmokingSignsAction || "",
    internalCleanliness: initialData.internalCleanliness || "",
    internalCleanlinessAction: initialData.internalCleanlinessAction || "",
    cargoBarrier: initialData.cargoBarrier || "",
    cargoBarrierAction: initialData.cargoBarrierAction || "",
    safetyBelts: initialData.safetyBelts || "",
    safetyBeltsAction: initialData.safetyBeltsAction || "",
    
    // Exterior
    bodyDamage: initialData.bodyDamage || "",
    bodyDamageAction: initialData.bodyDamageAction || "",
    windscreen: initialData.windscreen || "",
    windscreenAction: initialData.windscreenAction || "",
    wipers: initialData.wipers || "",
    wipersAction: initialData.wipersAction || "",
    washerReservoir: initialData.washerReservoir || "",
    washerReservoirAction: initialData.washerReservoirAction || "",
    tyreTread: initialData.tyreTread || "",
    tyreTreadAction: initialData.tyreTreadAction || "",
    tyreMatching: initialData.tyreMatching || "",
    tyreMatchingAction: initialData.tyreMatchingAction || "",
    tyrePressure: initialData.tyrePressure || "",
    tyrePressureAction: initialData.tyrePressureAction || "",
    
    // General Safety
    reportingSystem: initialData.reportingSystem || "",
    reportingSystemAction: initialData.reportingSystemAction || "",
    servicing: initialData.servicing || "",
    servicingAction: initialData.servicingAction || "",
    
    // First Aid Kit
    firstAidCompliance: initialData.firstAidCompliance || "",
    firstAidComplianceAction: initialData.firstAidComplianceAction || "",
    firstAidCleanliness: initialData.firstAidCleanliness || "",
    firstAidCleanlinessAction: initialData.firstAidCleanlinessAction || "",
    firstAidReplenish: initialData.firstAidReplenish || "",
    firstAidReplenishAction: initialData.firstAidReplenishAction || "",
    expiryDates: initialData.expiryDates || "",
    expiryDatesAction: initialData.expiryDatesAction || "",
    outdatedItems: initialData.outdatedItems || "",
    outdatedItemsAction: initialData.outdatedItemsAction || "",
    
    // Transportation of Clients
    wheelchairHoist: initialData.wheelchairHoist || "",
    wheelchairHoistAction: initialData.wheelchairHoistAction || "",
    appropriateTransport: initialData.appropriateTransport || "",
    appropriateTransportAction: initialData.appropriateTransportAction || "",
    secureClients: initialData.secureClients || "",
    secureClientsAction: initialData.secureClientsAction || "",
    
    // Client Behavior Assessment
    clientBehavior: initialData.clientBehavior || "",
    clientBehaviorAction: initialData.clientBehaviorAction || "",
    
    // Other Issues (5 rows)
    otherIssue1: initialData.otherIssue1 || "",
    otherIssue1Response: initialData.otherIssue1Response || "",
    otherIssue1Action: initialData.otherIssue1Action || "",
    otherIssue2: initialData.otherIssue2 || "",
    otherIssue2Response: initialData.otherIssue2Response || "",
    otherIssue2Action: initialData.otherIssue2Action || "",
    otherIssue3: initialData.otherIssue3 || "",
    otherIssue3Response: initialData.otherIssue3Response || "",
    otherIssue3Action: initialData.otherIssue3Action || "",
    otherIssue4: initialData.otherIssue4 || "",
    otherIssue4Response: initialData.otherIssue4Response || "",
    otherIssue4Action: initialData.otherIssue4Action || "",
    otherIssue5: initialData.otherIssue5 || "",
    otherIssue5Response: initialData.otherIssue5Response || "",
    otherIssue5Action: initialData.otherIssue5Action || "",
    
    // Review Section
    returnTo: initialData.returnTo || "",
    reviewedBy: initialData.reviewedBy || "",
    reviewerPosition: initialData.reviewerPosition || "",
    reviewDate: initialData.reviewDate || "",
    nextInspectionDate: initialData.nextInspectionDate || "",
  });

  useEffect(() => {
    if (onDataChange) {
      onDataChange(formData);
    }
  }, [formData, onDataChange]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const CheckboxField = ({ name, checked, onChange, disabled = false }: { 
    name: string; 
    checked: string; 
    onChange: (value: string) => void;
    disabled?: boolean;
  }) => (
    <>
      <div className="p-3 border-r border-gray-300 text-center">
        <label className="flex items-center justify-center">
          <input
            type="radio"
            name={name}
            checked={checked === "yes"}
            onChange={() => onChange("yes")}
            disabled={disabled || readOnly}
            className="w-4 h-4 mr-1"
          />
          Yes
        </label>
      </div>
      <div className="p-3 border-r border-gray-300 text-center">
        <label className="flex items-center justify-center">
          <input
            type="radio"
            name={name}
            checked={checked === "no"}
            onChange={() => onChange("no")}
            disabled={disabled || readOnly}
            className="w-4 h-4 mr-1"
          />
          No
        </label>
      </div>
    </>
  );

  return (
    <div className="bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Page 1 - Driver Information and Inspection Checklist */}
        <FormPage 
          title="Vehicle Safety Inspection Checklist"
          meta={{
            website: 'infinitysupportswa.org',
            version: 'VEH-SAFETY-001',
            reviewDate: '01/01/2025'
          }}
        >
          {/* Driver Information Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Driver Information</h2>
            <div className="border border-gray-300">
              <div className="grid grid-cols-2">
                <div className="bg-gray-100 border-r border-gray-300 flex flex-col">
                  <div className="p-3 border-b border-gray-300 font-semibold text-gray-800 flex items-center h-12">Driver</div>
                  <div className="p-3 border-b border-gray-300 font-semibold text-gray-800 flex items-center h-12">Licence number</div>
                  <div className="p-3 border-b border-gray-300 font-semibold text-gray-800 flex items-center h-12">Plant ID No</div>
                  <div className="p-3 border-b border-gray-300 font-semibold text-gray-800 flex items-center h-12">Vehicle registration</div>
                  <div className="p-3 border-b border-gray-300 font-semibold text-gray-800 flex items-center h-12">Insurance policy</div>
                  <div className="p-3 font-semibold text-gray-800 flex items-center h-12">Date of inspection</div>
                </div>
                <div className="flex flex-col">
                  <div className="p-3 border-b border-gray-300 flex items-center h-12">
                    <input
                      type="text"
                      value={formData.driver}
                      onChange={(e) => handleInputChange('driver', e.target.value)}
                      disabled={readOnly}
                      className={`w-full min-w-0 h-8 border px-2 disabled:bg-gray-100 ${errors.driver ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter driver name"
                    />
                    {errors.driver && <p className="text-red-500 text-xs mt-1">{errors.driver}</p>}
                  </div>
                  <div className="p-3 border-b border-gray-300 flex items-center h-12">
                    <input
                      type="text"
                      value={formData.licenceNumber}
                      onChange={(e) => handleInputChange('licenceNumber', e.target.value.toUpperCase())}
                      disabled={readOnly}
                      className={`w-full min-w-0 h-8 border px-2 disabled:bg-gray-100 ${errors.licenceNumber ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="e.g. ABC123"
                    />
                    {errors.licenceNumber && <p className="text-red-500 text-xs mt-1">{errors.licenceNumber}</p>}
                  </div>
                  <div className="p-3 border-b border-gray-300 flex items-center h-12">
                    <input
                      type="text"
                      value={formData.plantIdNo}
                      onChange={(e) => handleInputChange('plantIdNo', e.target.value)}
                      onKeyDown={handleNumberInput}
                      disabled={readOnly}
                      className="w-full min-w-0 h-8 border border-gray-300 px-2 disabled:bg-gray-100"
                      placeholder="Numbers only"
                    />
                  </div>
                  <div className="p-3 border-b border-gray-300 flex items-center h-12">
                    <input
                      type="text"
                      value={formData.vehicleRegistration}
                      onChange={(e) => handleInputChange('vehicleRegistration', e.target.value.toUpperCase())}
                      disabled={readOnly}
                      className="w-full min-w-0 h-8 border border-gray-300 px-2 disabled:bg-gray-100"
                      placeholder="e.g. ABC123"
                    />
                  </div>
                  <div className="p-3 border-b border-gray-300 flex items-center h-12">
                    <input
                      type="text"
                      value={formData.insurancePolicy}
                      onChange={(e) => handleInputChange('insurancePolicy', e.target.value)}
                      disabled={readOnly}
                      className="w-full min-w-0 h-8 border border-gray-300 px-2 disabled:bg-gray-100"
                      placeholder="Policy number"
                    />
                  </div>
                  <div className="p-3 flex items-center h-12">
                    <input
                      type="date"
                      value={formData.dateOfInspection}
                      onChange={(e) => handleInputChange('dateOfInspection', e.target.value)}
                      disabled={readOnly}
                      className={`w-full min-w-0 h-8 border px-2 disabled:bg-gray-100 ${errors.dateOfInspection ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="dd-mm-yyyy"
                    />
                    {errors.dateOfInspection && <p className="text-red-500 text-xs mt-1">{errors.dateOfInspection}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inspection Checklist Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Vehicle Safety Inspection Checklist</h2>
            <div className="border border-gray-300">
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 bg-gray-100 border-r border-gray-300 font-semibold text-gray-800">Item</div>
                <div className="p-3 bg-gray-100 border-r border-gray-300 font-semibold text-gray-800 text-center">Yes</div>
                <div className="p-3 bg-gray-100 border-r border-gray-300 font-semibold text-gray-800 text-center">No</div>
                <div className="p-3 bg-gray-100 font-semibold text-gray-800">Action To Be Taken</div>
              </div>

              {/* Lights Section */}
              <div className="border-b border-gray-300">
                <div className="bg-gray-100 p-3 border-b border-gray-300">
                  <h4 className="font-semibold text-gray-800">Lights</h4>
                  <p className="text-sm text-gray-600 mt-1">Check operation and visibility of:</p>
                </div>
                <div className="grid grid-cols-4 border-b border-gray-300">
                  <div className="p-3 border-r border-gray-300">Headlights</div>
                  <CheckboxField 
                    name="headlights" 
                    checked={formData.headlights} 
                    onChange={(value) => handleInputChange('headlights', value)} 
                  />
                  <div className="p-3">
                    <textarea
                      value={formData.headlightsAction}
                      onChange={(e) => handleInputChange('headlightsAction', e.target.value)}
                      disabled={readOnly}
                      className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                      placeholder="Action to be taken"
                      title="Action to be taken for headlights"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4">
                  <div className="p-3 border-r border-gray-300">Parking lights</div>
                  <CheckboxField 
                    name="parkingLights" 
                    checked={formData.parkingLights} 
                    onChange={(value) => handleInputChange('parkingLights', value)} 
                  />
                  <div className="p-3">
                    <textarea
                      value={formData.parkingLightsAction}
                      onChange={(e) => handleInputChange('parkingLightsAction', e.target.value)}
                      disabled={readOnly}
                      className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                      placeholder="Action to be taken"
                      title="Action to be taken for parking lights"
                    />
                  </div>
                </div>
              </div>

              {/* Indicators/Blinker Section - PDF style */}
              <div className="border-b border-gray-300">
                <div className="bg-gray-200 p-3 border-b border-gray-300">
                  <h4 className="font-semibold text-gray-800 uppercase tracking-wide">Indicators/blinker</h4>
                </div>
                <div className="grid grid-cols-4 border-b border-gray-300">
                  <div className="p-3 border-r border-gray-300">Hazard lights</div>
                  <CheckboxField name="hazardLights" checked={formData.hazardLights} onChange={(value) => handleInputChange('hazardLights', value)} />
                  <div className="p-3">
                    <textarea
                      value={formData.hazardLightsAction}
                      onChange={(e) => handleInputChange('hazardLightsAction', e.target.value)}
                      disabled={readOnly}
                      className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                      placeholder="Action to be taken"
                      title="Action to be taken for hazard lights"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 border-b border-gray-300">
                  <div className="p-3 border-r border-gray-300">Brake lights</div>
                  <CheckboxField name="brakeLights" checked={formData.brakeLights} onChange={(value) => handleInputChange('brakeLights', value)} />
                  <div className="p-3">
                    <textarea
                      value={formData.brakeLightsAction}
                      onChange={(e) => handleInputChange('brakeLightsAction', e.target.value)}
                      disabled={readOnly}
                      className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                      placeholder="Action to be taken"
                      title="Action to be taken for brake lights"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 border-b border-gray-300">
                  <div className="p-3 border-r border-gray-300">Reverse lights</div>
                  <CheckboxField name="reverseLights" checked={formData.reverseLights} onChange={(value) => handleInputChange('reverseLights', value)} />
                  <div className="p-3">
                    <textarea
                      value={formData.reverseLightsAction}
                      onChange={(e) => handleInputChange('reverseLightsAction', e.target.value)}
                      disabled={readOnly}
                      className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                      placeholder="Action to be taken"
                      title="Action to be taken for reverse lights"
                    />
                  </div>
                </div>

                {/* If trailer attached: Parking lights */}
                <div className="grid grid-cols-4 border-b border-gray-300">
                  <div className="p-3 border-r border-gray-300 font-semibold">If trailer attached:</div>
                  <div className="col-span-3"></div>
                </div>
                <div className="grid grid-cols-4 border-b border-gray-300">
                  <div className="p-3 border-r border-gray-300">Parking lights</div>
                  <CheckboxField name="trailerParkingLights" checked={formData.trailerParkingLights} onChange={(value) => handleInputChange('trailerParkingLights', value)} />
                  <div className="p-3">
                    <textarea
                      value={formData.trailerParkingLightsAction}
                      onChange={(e) => handleInputChange('trailerParkingLightsAction', e.target.value)}
                      disabled={readOnly}
                      className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                      placeholder="Action to be taken"
                      title="Action to be taken for trailer parking lights"
                    />
                  </div>
                </div>

                {/* Second Indicators/blinker section (as in PDF) */}
                <div className="bg-gray-200 p-3 border-b border-gray-300 mt-2">
                  <h4 className="font-semibold text-gray-800 uppercase tracking-wide">Indicators/blinkers</h4>
                </div>
                <div className="grid grid-cols-4 border-b border-gray-300">
                  <div className="p-3 border-r border-gray-300">Hazard lights</div>
                  <CheckboxField name="hazardLights2" checked={formData.hazardLights2} onChange={(value) => handleInputChange('hazardLights2', value)} />
                  <div className="p-3">
                    <textarea
                      value={formData.hazardLights2Action}
                      onChange={(e) => handleInputChange('hazardLights2Action', e.target.value)}
                      disabled={readOnly}
                      className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                      placeholder="Action to be taken"
                      title="Action to be taken for hazard lights (2)"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 border-b border-gray-300">
                  <div className="p-3 border-r border-gray-300">Brake lights</div>
                  <CheckboxField name="brakeLights2" checked={formData.brakeLights2} onChange={(value) => handleInputChange('brakeLights2', value)} />
                  <div className="p-3">
                    <textarea
                      value={formData.brakeLights2Action}
                      onChange={(e) => handleInputChange('brakeLights2Action', e.target.value)}
                      disabled={readOnly}
                      className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                      placeholder="Action to be taken"
                      title="Action to be taken for brake lights (2)"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 border-b border-gray-300">
                  <div className="p-3 border-r border-gray-300">Reverse lights</div>
                  <CheckboxField name="reverseLights2" checked={formData.reverseLights2} onChange={(value) => handleInputChange('reverseLights2', value)} />
                  <div className="p-3">
                    <textarea
                      value={formData.reverseLights2Action}
                      onChange={(e) => handleInputChange('reverseLights2Action', e.target.value)}
                      disabled={readOnly}
                      className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                      placeholder="Action to be taken"
                      title="Action to be taken for reverse lights (2)"
                    />
                  </div>
                </div>
              </div> {/* <-- Close the Inspection Checklist Section's border container */}

                {/* Brakes and Warnings Section */}
              <div className="border-b border-gray-300">
                <div className="bg-gray-100 p-3 border-b border-gray-300">
                  <h4 className="font-semibold text-gray-800">Brakes and Warnings</h4>
                </div>
                <div className="grid grid-cols-4 border-b border-gray-300">
                  <div className="p-3 border-r border-gray-300">Check operation of handbrake</div>
                  <CheckboxField name="handbrake" checked={formData.handbrake} onChange={(value) => handleInputChange('handbrake', value)} />
                  <div className="p-3">
                 <textarea
                      value={formData.brakeLights2Action}
                      onChange={(e) => handleInputChange('brakeLights2Action', e.target.value)}
                      disabled={readOnly}
                      className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                      placeholder="Action to be taken"
                      title="Action to be taken for brake lights (2)"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 border-b border-gray-300">
                  <div className="p-3 border-r border-gray-300">Check for firm brake pedal</div>
                  <CheckboxField name="brakePedal" checked={formData.brakePedal} onChange={(value) => handleInputChange('brakePedal', value)} />
                  <div className="p-3">
                     <textarea
                      value={formData.brakeLights2Action}
                      onChange={(e) => handleInputChange('brakeLights2Action', e.target.value)}
                      disabled={readOnly}
                      className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                      placeholder="Action to be taken"
                      title="Action to be taken for brake lights (2)"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4">
                  <div className="p-3 border-r border-gray-300">Check operation of horn</div>
                  <CheckboxField name="horn" checked={formData.horn} onChange={(value) => handleInputChange('horn', value)} />
                  <div className="p-3">
                   <textarea
                      value={formData.brakeLights2Action}
                      onChange={(e) => handleInputChange('brakeLights2Action', e.target.value)}
                      disabled={readOnly}
                      className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                      placeholder="Action to be taken"
                      title="Action to be taken for brake lights (2)"
                    />
                  </div>
                </div>
              </div>

              {/* Interior Section */}
              <div>
                <div className="bg-gray-100 p-3 border-b border-gray-300">
                  <h4 className="font-semibold text-gray-800">Interior</h4>
                </div>
                <div className="grid grid-cols-4">
                  <div className="p-3 border-r border-gray-300">'No Smoking' signs displayed prominently</div>
                  <CheckboxField name="noSmokingSigns" checked={formData.noSmokingSigns} onChange={(value) => handleInputChange('noSmokingSigns', value)} />
                  <div className="p-3">
                  <textarea
                      value={formData.brakeLights2Action}
                      onChange={(e) => handleInputChange('brakeLights2Action', e.target.value)}
                      disabled={readOnly}
                      className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                      placeholder="Action to be taken"
                      title="Action to be taken for brake lights (2)"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8">
                {/* Removed 'Reviewed by', 'Position', and 'Date' fields as per request */}
              </div>
            </div>
          </div>
        </FormPage>

        {/* Page 2 - Additional Inspection Items */}
        <FormPage 
          title="Vehicle Safety Inspection Checklist"
          meta={{
            website: 'infinitysupportswa.org',
            version: 'VEH-SAFETY-001',
            reviewDate: '01/01/2025'
          }}
        >
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Vehicle Safety Inspection Checklist (Continued)</h2>
            <div className="border border-gray-300">
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 bg-gray-100 border-r border-gray-300 font-semibold text-gray-800">Item</div>
                <div className="p-3 bg-gray-100 border-r border-gray-300 font-semibold text-gray-800 text-center">Yes</div>
                <div className="p-3 bg-gray-100 border-r border-gray-300 font-semibold text-gray-800 text-center">No</div>
                <div className="p-3 bg-gray-100 font-semibold text-gray-800">Action To Be Taken</div>
              </div>

              {/* Interior Continued */}
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Internal cleanliness maintained, including upholstery</div>
                <CheckboxField name="internalCleanliness" checked={formData.internalCleanliness} onChange={(value) => handleInputChange('internalCleanliness', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.internalCleanlinessAction}
                    onChange={(e) => handleInputChange('internalCleanlinessAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for internal cleanliness"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Cargo barrier in place, where appropriate</div>
                <CheckboxField name="cargoBarrier" checked={formData.cargoBarrier} onChange={(value) => handleInputChange('cargoBarrier', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.cargoBarrierAction}
                    onChange={(e) => handleInputChange('cargoBarrierAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for cargo barrier"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Safety belts in good order</div>
                <CheckboxField name="safetyBelts" checked={formData.safetyBelts} onChange={(value) => handleInputChange('safetyBelts', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.safetyBeltsAction}
                    onChange={(e) => handleInputChange('safetyBeltsAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for safety belts"
                  />
                </div>
              </div>

              {/* Exterior Section */}
              <div className="bg-gray-100 p-3 border-b border-gray-300">
                <h4 className="font-semibold text-gray-800">Exterior</h4>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Any damage to body work noted</div>
                <CheckboxField name="bodyDamage" checked={formData.bodyDamage} onChange={(value) => handleInputChange('bodyDamage', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.bodyDamageAction}
                    onChange={(e) => handleInputChange('bodyDamageAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for body damage"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Windscreen in good order and clean</div>
                <CheckboxField name="windscreen" checked={formData.windscreen} onChange={(value) => handleInputChange('windscreen', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.windscreenAction}
                    onChange={(e) => handleInputChange('windscreenAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for windscreen"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Windscreen wipers and washers operating</div>
                <CheckboxField name="wipers" checked={formData.wipers} onChange={(value) => handleInputChange('wipers', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.wipersAction}
                    onChange={(e) => handleInputChange('wipersAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for wipers"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Water in windscreen washer reservoir</div>
                <CheckboxField name="washerReservoir" checked={formData.washerReservoir} onChange={(value) => handleInputChange('washerReservoir', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.washerReservoirAction}
                    onChange={(e) => handleInputChange('washerReservoirAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for washer reservoir"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Tyre tread checked for wear</div>
                <CheckboxField name="tyreTread" checked={formData.tyreTread} onChange={(value) => handleInputChange('tyreTread', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.tyreTreadAction}
                    onChange={(e) => handleInputChange('tyreTreadAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for tyre tread"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Treads matching for front and rear tyres</div>
                <CheckboxField name="tyreMatching" checked={formData.tyreMatching} onChange={(value) => handleInputChange('tyreMatching', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.tyreMatchingAction}
                    onChange={(e) => handleInputChange('tyreMatchingAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for tyre matching"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Tyre pressure checked</div>
                <CheckboxField name="tyrePressure" checked={formData.tyrePressure} onChange={(value) => handleInputChange('tyrePressure', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.tyrePressureAction}
                    onChange={(e) => handleInputChange('tyrePressureAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for tyre pressure"
                  />
                </div>
              </div>

              {/* General Safety Section */}
              <div className="bg-gray-100 p-3 border-b border-gray-300">
                <h4 className="font-semibold text-gray-800">General Safety</h4>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">System in place for reporting problems</div>
                <CheckboxField name="reportingSystem" checked={formData.reportingSystem} onChange={(value) => handleInputChange('reportingSystem', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.reportingSystemAction}
                    onChange={(e) => handleInputChange('reportingSystemAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for reporting system"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Servicing as required</div>
                <CheckboxField name="servicing" checked={formData.servicing} onChange={(value) => handleInputChange('servicing', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.servicingAction}
                    onChange={(e) => handleInputChange('servicingAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for servicing"
                  />
                </div>
              </div>

              {/* First Aid Kit Section */}
              <div className="bg-gray-100 p-3 border-b border-gray-300">
                <h4 className="font-semibold text-gray-800">First Aid Kit, Sunscreen, Insect Repellent</h4>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Contents assessed in compliance with first aid requirements</div>
                <CheckboxField name="firstAidCompliance" checked={formData.firstAidCompliance} onChange={(value) => handleInputChange('firstAidCompliance', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.firstAidComplianceAction}
                    onChange={(e) => handleInputChange('firstAidComplianceAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for first aid compliance"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Container and contents clean and orderly</div>
                <CheckboxField name="firstAidCleanliness" checked={formData.firstAidCleanliness} onChange={(value) => handleInputChange('firstAidCleanliness', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.firstAidCleanlinessAction}
                    onChange={(e) => handleInputChange('firstAidCleanlinessAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for first aid cleanliness"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">System in place to replenish kit items</div>
                <CheckboxField name="firstAidReplenish" checked={formData.firstAidReplenish} onChange={(value) => handleInputChange('firstAidReplenish', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.firstAidReplenishAction}
                    onChange={(e) => handleInputChange('firstAidReplenishAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for first aid replenish"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Expiry dates checked</div>
                <CheckboxField name="expiryDates" checked={formData.expiryDates} onChange={(value) => handleInputChange('expiryDates', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.expiryDatesAction}
                    onChange={(e) => handleInputChange('expiryDatesAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for expiry dates"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Out of date items disposed of</div>
                <CheckboxField name="outdatedItems" checked={formData.outdatedItems} onChange={(value) => handleInputChange('outdatedItems', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.outdatedItemsAction}
                    onChange={(e) => handleInputChange('outdatedItemsAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for outdated items"
                  />
                </div>
              </div>

              {/* Transportation of Clients Section */}
              <div className="bg-gray-100 p-3 border-b border-gray-300">
                <h4 className="font-semibold text-gray-800">Transportation of Clients</h4>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Wheelchair hoist fitted, if required</div>
                <CheckboxField name="wheelchairHoist" checked={formData.wheelchairHoist} onChange={(value) => handleInputChange('wheelchairHoist', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.wheelchairHoistAction}
                    onChange={(e) => handleInputChange('wheelchairHoistAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for wheelchair hoist"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Appropriate for the transport of clients</div>
                <CheckboxField name="appropriateTransport" checked={formData.appropriateTransport} onChange={(value) => handleInputChange('appropriateTransport', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.appropriateTransportAction}
                    onChange={(e) => handleInputChange('appropriateTransportAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for appropriate transport"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4">
                <div className="p-3 border-r border-gray-300">Facility to secure clients appropriately</div>
                <CheckboxField name="secureClients" checked={formData.secureClients} onChange={(value) => handleInputChange('secureClients', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.secureClientsAction}
                    onChange={(e) => handleInputChange('secureClientsAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for secure clients"
                  />
                </div>
              </div>
            </div>
          </div>
        </FormPage>

        {/* Page 3 - Client Behavior Assessment and Review */}
        <FormPage 
          title="Vehicle Safety Inspection Checklist"
          meta={{
            website: 'infinitysupportswa.org',
            version: 'VEH-SAFETY-001',
            reviewDate: '01/01/2025'
          }}
        >
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Client Behavior Assessment</h2>
            <div className="border border-gray-300">
              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 bg-gray-100 border-r border-gray-300 font-semibold text-gray-800">Item</div>
                <div className="p-3 bg-gray-100 border-r border-gray-300 font-semibold text-gray-800 text-center">Yes</div>
                <div className="p-3 bg-gray-100 border-r border-gray-300 font-semibold text-gray-800 text-center">No</div>
                <div className="p-3 bg-gray-100 font-semibold text-gray-800">Action To Be Taken</div>
              </div>

              <div className="grid grid-cols-4 border-b border-gray-300">
                <div className="p-3 border-r border-gray-300">Client behaviour while travelling in a vehicle is known</div>
                <CheckboxField name="clientBehavior" checked={formData.clientBehavior} onChange={(value) => handleInputChange('clientBehavior', value)} />
                <div className="p-3">
                  <textarea
                    value={formData.clientBehaviorAction}
                    onChange={(e) => handleInputChange('clientBehaviorAction', e.target.value)}
                    disabled={readOnly}
                    className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                    placeholder="Action to be taken"
                    title="Action to be taken for client behavior"
                  />
                </div>
              </div>

              {/* Other Issues Section */}
              <div className="bg-gray-100 p-3 border-b border-gray-300">
                <h4 className="font-semibold text-gray-800">Other Issues</h4>
              </div>
              {[1, 2, 3, 4, 5].map(num => (
                <div key={num} className="grid grid-cols-4 border-b border-gray-300">
                  <div className="p-3 border-r border-gray-300">
                    <textarea
                      value={formData[`otherIssue${num}` as keyof typeof formData] as string}
                      onChange={(e) => handleInputChange(`otherIssue${num}`, e.target.value)}
                      disabled={readOnly}
                      className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                      placeholder="Describe issue"
                      title={`Other issue ${num}`}
                    />
                  </div>
                  <div className="p-3 border-r border-gray-300 text-center">
                    <input type="radio" name={`otherIssue${num}Response`} checked={formData[`otherIssue${num}Response` as keyof typeof formData] === "yes"} onChange={() => handleInputChange(`otherIssue${num}Response`, "yes")} disabled={readOnly} className="w-4 h-4" />
                  </div>
                  <div className="p-3 border-r border-gray-300 text-center">
                    <input type="radio" name={`otherIssue${num}Response`} checked={formData[`otherIssue${num}Response` as keyof typeof formData] === "no"} onChange={() => handleInputChange(`otherIssue${num}Response`, "no")} disabled={readOnly} className="w-4 h-4" />
                  </div>
                  <div className="p-3">
                    <textarea
                      value={formData[`otherIssue${num}Action` as keyof typeof formData] as string}
                      onChange={(e) => handleInputChange(`otherIssue${num}Action`, e.target.value)}
                      disabled={readOnly}
                      className="w-full min-h-[2.5rem] border border-gray-300 px-2 py-1 resize-y disabled:bg-gray-100"
                      placeholder="Action to be taken"
                      title={`Action to be taken for other issue ${num}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Return Form and Final Review Section */}
          <div className="space-y-6">
            <div>
              <p className="text-gray-800 mb-2">Return completed form to:</p>
              <input type="text" value={formData.returnTo} onChange={(e) => handleInputChange('returnTo', e.target.value)} disabled={readOnly} className="w-full border-b border-gray-400 border-dotted h-8 bg-transparent disabled:bg-gray-100" placeholder="Return to" />
            </div>

            <div className="border border-gray-300">
              <div className="grid grid-cols-2 border-b border-gray-300">
                <div className="p-3 bg-gray-100 border-r border-gray-300 font-semibold text-gray-800">Reviewed by [name]:</div>
                <div className="p-3">
                  <input type="text" value={formData.reviewedBy} onChange={(e) => handleInputChange('reviewedBy', e.target.value)} disabled={readOnly} className="w-full h-8 border border-gray-300 px-2 disabled:bg-gray-100" placeholder="Name of reviewer" />
                </div>
              </div>
              <div className="grid grid-cols-2 border-b border-gray-300">
                <div className="p-3 bg-gray-100 border-r border-gray-300 font-semibold text-gray-800">Position:</div>
                <div className="p-3">
                  <input type="text" value={formData.reviewerPosition} onChange={(e) => handleInputChange('reviewerPosition', e.target.value)} disabled={readOnly} className="w-full h-8 border border-gray-300 px-2 disabled:bg-gray-100" placeholder="Reviewer position" />
                </div>
              </div>
              <div className="grid grid-cols-2">
                <div className="p-3 bg-gray-100 border-r border-gray-300 font-semibold text-gray-800">Date:</div>
                <div className="p-3">
                  <input type="date" value={formData.reviewDate} onChange={(e) => handleInputChange('reviewDate', e.target.value)} disabled={readOnly} className="w-full h-8 border border-gray-300 px-2 disabled:bg-gray-100" />
                </div>
              </div>
            </div>


            <div className="flex items-center gap-2">
              <span className="text-gray-800">Date for next inspection:</span>
              <input type="date" value={formData.nextInspectionDate} onChange={(e) => handleInputChange('nextInspectionDate', e.target.value)} disabled={readOnly} className="flex-1 border-b border-gray-400 border-dotted h-8 bg-transparent disabled:bg-gray-100" />
            </div>
          </div>
        </FormPage>
      </div>
    </div>
  );
}
