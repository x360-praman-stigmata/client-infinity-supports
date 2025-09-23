"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import FormPage from '@/components/ui/FormPage';
import SignatureCanvas from '@/components/ui/SignatureCanvas';
import { useToast } from '@/components/ui/Toast';

export interface SupportWorkerFormRef {
  save: (final: boolean) => Promise<boolean>;
  validate: () => boolean;
  validateDetailed: () => { isValid: boolean; missing?: string[]; invalid?: string[] } | null;
  getData: () => any;
}

interface SupportWorkerFormProps {
  token: string;
  onValidityChange?: (valid: boolean) => void;
}

const SupportWorkerForm = forwardRef<SupportWorkerFormRef, SupportWorkerFormProps>(({ token, onValidityChange }, ref) => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState<any>({});
  const [staffInfo, setStaffInfo] = useState<any>({});
  const { showToast } = useToast();

  useEffect(() => {
    // Load saved data if any
    const loadData = async () => {
      try {
        const response = await fetch(`/api/staff/onboard/${token}`);
        if (response.ok) {
          const result = await response.json();
          const s = result.staff || {};
          const saved = (result.submissions && result.submissions['support_worker']) || {};
          setStaffInfo(s);
          setData((d: any) => ({
            ...d,
            ...saved,
            // Handle signature data from new fields
            signature: saved.signature || '',
            signatureDate: saved.signatureDate || '',
						// Editable position fields defaults
						positionTitle: saved.positionTitle || 'Support Worker',
						businessUnit: saved.businessUnit || '',
						reportsTo: saved.reportsTo || '',
            // Set name from staff info if not already set
            name: saved.name || `${s.firstName || ''} ${s.surname || ''}`.trim()
          }));
        }
      } catch (e) {
        // ignore prefill errors
      }
    };
    loadData();
  }, [token]);

  useEffect(() => {
    // Check validity whenever data changes
    if (onValidityChange) {
      const isValid = validate();
      onValidityChange(isValid);
    }
  }, [data, onValidityChange]);

  const validate = (): boolean => {
    // Required fields: name, signature, date, positionTitle, businessUnit, reportsTo
    return !!(
      data.name &&
      data.signature &&
      data.signatureDate &&
      data.positionTitle &&
      data.businessUnit &&
      data.reportsTo
    );
  };

  const validateDetailed = () => {
    const missing: string[] = [];
    const invalid: string[] = [];
    
    if (!data.name) missing.push('Name');
    if (!data.signature) missing.push('Signature');
    if (!data.signatureDate) missing.push('Date');
    if (!data.positionTitle) missing.push('Position Title');
    if (!data.businessUnit) missing.push('Business Unit');
    if (!data.reportsTo) missing.push('Reports To');
    
    return {
      isValid: missing.length === 0 && invalid.length === 0,
      missing,
      invalid
    };
  };

  const save = async (final: boolean): Promise<boolean> => {
    setLoading(true);
    try {
      if (final) {
        const details = validateDetailed();
        if (!details?.isValid) {
          showToast({
            type: 'error',
            title: 'Please fill the required fields',
            message: `Missing: ${(details?.missing || []).join(', ')}`,
            duration: 6000
          });
          return false;
        }
      }
      const response = await fetch(`/api/staff/onboard/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formKey: 'support_worker',
          data: { ...data, final }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        if (final) {
          setSaved(data);
        }
        showToast({ type: 'success', title: final ? 'Submitted' : 'Draft Saved', message: 'Support Worker form updated successfully.' });
        return true;
      }
      showToast({ type: 'error', title: 'Save failed', message: 'Unable to save the Support Worker form.' });
      return false;
    } catch (e) {
      console.error('Save failed:', e);
      showToast({ type: 'error', title: 'Save failed', message: 'Network or server error.' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getData = () => data;

  useImperativeHandle(ref, () => ({
    save,
    validate,
    validateDetailed,
    getData
  }));

  const meta = { website: 'infinitysupportswa.org', version: 'PD- Support Worker Form', reviewDate: '01/03/2025' };

  const handleChange = (key: string, value: any) => {
    setData((prev: any) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-gray-100 py-8">
      {/* Page 1 - Position Description, Purpose, Responsibilities */}
      <FormPage title="Position Description" meta={meta}>
        <div className="space-y-4 text-sm w-full">
          {/* Single Container for All Page 1 Content */}
          <div className="w-full">
            <div className="border border-gray-300 rounded-lg p-6 w-full">
              <div className="space-y-4">
                {/* Position Description Section */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Position Description</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
						<div className="space-y-3">
							<div>
								<div className="text-xs font-medium text-gray-700 mb-1">Position Title:</div>
								<input
									type="text"
									value={data.positionTitle || 'Support Worker'}
									onChange={(e) => handleChange('positionTitle', e.target.value)}
									className="w-full border border-gray-400 h-8 rounded-sm px-2 text-gray-900 bg-white"
								/>
							</div>
							<div>
								<div className="text-xs font-medium text-gray-700 mb-1">Business Unit:</div>
								<input
									type="text"
									value={data.businessUnit || ''}
									onChange={(e) => handleChange('businessUnit', e.target.value)}
									className="w-full border border-gray-400 h-8 rounded-sm px-2 text-gray-900 bg-white"
								/>
							</div>
							<div>
								<div className="text-xs font-medium text-gray-700 mb-1">Reports To:</div>
								<input
									type="text"
									value={data.reportsTo || ''}
									onChange={(e) => handleChange('reportsTo', e.target.value)}
									className="w-full border border-gray-400 h-8 rounded-sm px-2 text-gray-900 bg-white"
								/>
							</div>
						</div>
                  </div>
                </div>

                {/* Purpose Section */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Purpose</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <p className="text-gray-900">
                      The purpose of a Support Worker is to support clients to live their lives more independently and help them to reach their potential by providing both physical and emotional support.
                    </p>
                  </div>
                </div>

                {/* Responsibilities for Workplace */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Responsibilities and Accountabilities – for the Workplace</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <ul className="list-disc list-inside space-y-2 text-gray-900">
                      <li>Follow company policies including Code of Conduct, Anti-Discrimination, Harassment/Victimisation policies.</li>
                      <li>Adhere to Workplace Health and Safety.</li>
                      <li>Ensure all Company Standard Operating Procedures are adhered too.</li>
                      <li>Display a positive attitude and be an active, dependable member of the team.</li>
                      <li>Lead by example in everything you do.</li>
                      <li>Support and treat others with respect.</li>
                      <li>Always provide constructive feedback in a way that does not blame.</li>
                      <li>Be accountable for your actions and results.</li>
                      <li>Be consistent and speak the truth.</li>
                    </ul>
                  </div>
                </div>

                {/* Responsibilities for Position */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Responsibilities and Accountabilities – for the Position</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <div className="space-y-4 text-gray-900">
                      <p>The specific duties that you will undertake as a Support Worker will be set and agreed by the person you support or their family. Please refer to the "Support Plan" section of each person's profile for an overview of the duties required by each person you support.</p>
                      <p>You are invited to reach out to people seeking support where the job description, as detailed in the "Support Plan" section, appeals to you.</p>
                      <p>Further verbal and/or written instructions will be provided by the person seeking support or their family at the time of meeting. It is the responsibility of the person seeking support or their family to explain to you exactly what tasks need to be performed daily.</p>
                      <p>As a rule, Infinity Supports WA requires Support Workers to perform all tasks within the following guidelines:</p>
                      <ul className="list-disc list-inside space-y-2 ml-4">
                        <li>Perform all duties with professionalism and care.</li>
                        <li>You must only work with one individual at a time unless agreed with your Line Manager and you are working in a 'Group Setting'.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FormPage>

      {/* Page 2 - General Responsibilities and Specific Areas (NO HEADERS) */}
      <FormPage showTitle={false} meta={meta}>
        <div className="space-y-4 text-sm w-full">
          {/* Single Container for All Page 2 Content */}
          <div className="w-full">
            <div className="border border-gray-300 rounded-lg p-6 w-full">
              <div className="space-y-4">
                {/* General Responsibilities - NO HEADER */}
                <div>
                  <div className="border border-gray-300 rounded-lg p-4 w-full">
                    <ul className="list-disc list-inside space-y-2 text-gray-900">
                      <li>At all times, work under general guidance from the person seeking support or their family, within clearly defined guidelines. This means that the tasks you undertake should be clearly explained to you, with guidance given should you need it as you go.</li>
                      <li>You are responsible for managing your time, and for planning and organising activities on support.</li>
                      <li>You may be asked to work with limited supervision. This is appropriate if instructions on how to perform the task have been given in advance.</li>
                      <li>Perform activities requiring the exercise of sound judgment, initiative, confidentiality, and sensitivity in the performance of work. However, guidance is available to you should you need it.</li>
                      <li>Follow all Infinity Supports WA guidelines regarding incident reporting, mandatory reporting, providing feedback and flagging risks.</li>
                    </ul>
                  </div>
                </div>

                {/* Specific Areas of Support - NO HEADER */}
                <div>
                  <div className="border border-gray-300 rounded-lg p-4 w-full">
                    <p className="text-gray-900 mb-4">Infinity Supports WA Support Workers may be asked to provide support in the following areas:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-900">
                      <li>Support Worker provides one on one support to client in their home or in a community setting.</li>
                      <li>Provide support to a client to meet emotional and psychological needs.</li>
                      <li>Provide care support which is responsive to the client's individual needs.</li>
                      <li>Support Worker is required to conduct all manual handling tasks when required during provision of transport of client. Individual care plan provides information and levels of assistance, equipment/aids used to maintain client and support worker safety.</li>
                      <li>Always maintain the dignity and respect of the client.</li>
                      <li>Always maintain the rights of the client during service provision.</li>
                      <li>Incident reporting as identified.</li>
                      <li>The Support Worker ensures the clients safety and supervision during service provision.</li>
                      <li>Individualised care plan and documentation provides strategies to engage and communicate effectively with the client to enhance service delivery.</li>
                      <li>Support Worker is required to maintain regular communication with the Service Delivery Manager.</li>
                      <li>Maintain Workplace Health and Safety by adhering to the client's care plan.</li>
                      <li>Identification and reporting of hazards environmental, mechanical, and other potential hazards noted during service provision.</li>
                      <li>Use of PPE as identified on care plan and when extraordinary event occurs.</li>
                      <li>Comply with all policies and procedures relevant to performing tasks within a client's home.</li>
                      <li>Required to perform and complete other duties as required keeping within a support workers scope of practice.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FormPage>

      {/* Page 3 - Workplace Health & Safety, Quality & Environmental */}
      <FormPage showTitle={false} meta={meta}>
        <div className="space-y-4 text-sm w-full">
          {/* Single Container for All Page 3 Content */}
          <div className="w-full">
            <div className="border border-gray-300 rounded-lg p-6 w-full">
              <div className="space-y-4">
                {/* Workplace Health & Safety */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Workplace Health & Safety</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <p className="text-gray-900 mb-4">As an employee you are required to:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-900">
                      <li>Conduct own work and ensure direct reports work in a safe manner and in accordance with WHS Policies and Procedures.</li>
                      <li>Identify and raise hazards and WHS issues on an on-going basis in relation to area of responsibility to ensure that risks are known to management and are controlled.</li>
                      <li>Adhere to all safe working procedures in accordance with instructions/operating procedures.</li>
                      <li>WHS issues are identified and addressed in a timely manner.</li>
                      <li>Take reasonable care of yourself and others who may be affected by your actions.</li>
                      <li>Abide by all Company Policies.</li>
                      <li>Where appropriate PPE as required.</li>
                      <li>Follow all Safety Instructions from your manager or the business.</li>
                    </ul>
                    
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Assessing risk:</h4>
                      <p className="text-gray-900 mb-3">Support Workers must assess risk in determining whether tasks, activities or duties are beyond the scope that could reasonably be expected from someone in the role of a Support Worker.</p>
                      <p className="text-gray-900 mb-2">Examples of tasks, duties, or activities outside the remit of a Support Worker include:</p>
                      <ul className="list-disc list-inside space-y-2 text-gray-900 ml-4">
                        <li>Any activity involving specialist knowledge, skill, or abilities that you do not possess.</li>
                        <li>Performing any sort of medical procedure or intervention without clear instruction, and which are beyond your skills, experience, and qualifications.</li>
                        <li>Operating heavy machinery</li>
                        <li>Using substances, tools, or equipment (e.g., hoists) not fit for purpose or without adequate training and guidelines from the person you support or their family.</li>
                        <li>Performing any activity that has the potential to affect health and safety tools without first assessing risks and ensuring effective controls are in place.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Quality & Environmental Aspects */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Quality & Environmental Aspects</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <p className="text-gray-900 mb-4">As an employee you are required to:</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-900">
                      <li>Understand customer expectations from service and products.</li>
                      <li>Maintain company quality standards.</li>
                      <li>Follow company quality control processes.</li>
                      <li>Report any customer complaints with management.</li>
                      <li>Recycle and use appropriate waste storage bins.</li>
                      <li>Minimise paper and electricity use where it is possible and practical.</li>
                      <li>Report ideas and opportunities to your manager.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FormPage>

      {/* Page 4 - Experience, Qualifications, Skills, Requirements, Acknowledgement */}
      <FormPage showTitle={false} meta={meta}>
        <div className="space-y-4 text-sm w-full">
          {/* Single Container for All Page 4 Content */}
          <div className="w-full">
            <div className="border border-gray-300 rounded-lg p-6 w-full">
              <div className="space-y-4">
                {/* Experience, Qualifications and Skills */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Experience, Qualifications and Skills</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <ul className="list-disc list-inside space-y-2 text-gray-900">
                      <li>Maintain current Australian driver's license.</li>
                      <li>A current first aid and CPR certification</li>
                      <li>Medication Competency (Desirable)</li>
                      <li>Manual Handling Training (Desirable)</li>
                      <li>NDIS workers screening</li>
                      <li>Working with children check</li>
                      <li>Australian citizenship or visa with legal right to work in Australia.</li>
                      <li>Car with current registration and comprehensive insurance</li>
                      <li>NDIS Online Trainings:
                        <ul className="list-circle list-inside space-y-1 ml-6 mt-2">
                          <li>NDIS worker orientation module</li>
                          <li>NDIS worker induction modules</li>
                          <li>NDIS <strong>supporting</strong> effective communication training.</li>
                          <li>NDIS <strong>supporting</strong> safe and enjoyable meal training.</li>
                        </ul>
                      </li>
                      <li>Safe waste management training</li>
                      <li>Infection control training</li>
                      <li>COVID Vaccination including third/booster dose.</li>
                      <li>Behaviour support training</li>
                      <li>Seizure training</li>
                    </ul>
                  </div>
                </div>

                {/* Key Requirements & Attributes */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Key Requirements & Attributes</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <ul className="list-disc list-inside space-y-2 text-gray-900">
                      <li>Ability to adapt to different environments and cultures, demonstrating flexibility and a passion for providing a high level of care to the client.</li>
                      <li>Understanding of services offered and systems to follow.</li>
                      <li>Ability to make sound decisions under pressure and de-escalate crises.</li>
                      <li>Excellent interpersonal and listening skills with evidence of empathy, tact and patience towards others.</li>
                      <li>Critical thinking and complex problem-solving skills</li>
                      <li>Emerging knowledge of the local area and its health services and other community services.</li>
                    </ul>
                  </div>
                </div>

                {/* Employee Acknowledgement */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Employee Acknowledgement</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name:</label>
                        <div className="border border-gray-400 h-8 rounded-sm px-2 flex items-center text-gray-900 bg-white">
                          {staffInfo.firstName} {staffInfo.surname}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Signature:</label>
                          <SignatureCanvas
                            existingSignature={data.signature}
                            onSignatureEnd={(sig) => handleChange('signature', sig)}
                            onSignatureClear={() => handleChange('signature', '')}
                            width={400}
                            height={120}
                            className="bg-white border border-gray-400 rounded-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3" htmlFor="signatureDate">Date:</label>
                          <input
                            id="signatureDate"
                            type="date"
                            value={data.signatureDate || ''}
                            onChange={(e) => handleChange('signatureDate', e.target.value)}
                            className="w-full border border-gray-400 h-8 rounded-sm px-2 text-gray-900 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FormPage>
    </div>
  );
});

SupportWorkerForm.displayName = 'SupportWorkerForm';

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-gray-700 mb-1">{label}:</div>
      <div className="border border-gray-400 h-8 rounded-sm px-2 flex items-center text-gray-900 bg-white">
        {value || ''}
      </div>
    </div>
  );
}

export default SupportWorkerForm;
