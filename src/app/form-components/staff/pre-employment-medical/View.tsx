"use client";

import { useEffect, useState } from 'react';
import FormPage from '@/components/ui/FormPage';
// import { fetchFormSpecificSettings } from '@/lib/settings'; // Commented out due to API issues

interface PreEmploymentMedicalViewProps {
  data?: any;
  staffInfo?: any;
}

export default function PreEmploymentMedicalView({ data = {}, staffInfo = {} }: PreEmploymentMedicalViewProps) {
  // Debug: Log the data structure
  console.log('PreEmploymentMedicalView received data:', data);
  console.log('PreEmploymentMedicalView data keys:', Object.keys(data));
  if (data.data) {
    console.log('PreEmploymentMedicalView data.data keys:', Object.keys(data.data));
  }

  const [meta, setMeta] = useState<{ website: string; formId: string; reviewDate: string }>({
    website: 'infinitysupportswa.org',
    formId: 'SF014',
    reviewDate: '01/03/2025'
  });

  useEffect(() => {
    // Use default values for now due to settings API issues
    // This ensures the form works reliably without depending on external APIs
    setMeta({
      website: 'infinitysupportswa.org',
      formId: 'SF014',
      reviewDate: '01/03/2025',
    });
  }, []);

  // Helper function to get field value from multiple possible locations
  const getValue = (fieldName: string) => {
    const value = data[fieldName] || data.data?.[fieldName] || '';
    
    // Debug signature fields
    if (fieldName.includes('signature') || fieldName.includes('Date')) {
      console.log(`🔍 View Component - ${fieldName}:`, {
        hasValue: !!value,
        valueLength: value?.length || 0,
        valueType: typeof value,
        dataKeys: Object.keys(data),
        dataDataKeys: data.data ? Object.keys(data.data) : []
      });
    }
    
    return value;
  };

  const getBoolValue = (fieldName: string) => {
    const val = data[fieldName] || data.data?.[fieldName];
    return val === true || val === 'yes' ? true : val === false || val === 'no' ? false : null;
  };

  return (
    <div className="bg-gray-100 py-8">
      {/* Page 1 - Consent Form */}
      <FormPage title="Pre-Employment Medical Examination Consent Form" meta={meta}>
        <div className="space-y-4 text-sm w-full">
          <div className="w-full">
            <div className="border border-gray-300 rounded-lg p-6 w-full">
              <div className="space-y-6">
                {/* Applicant Details */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Applicant Details</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-400">
                        <tbody>
                          <tr>
                            <td className="border border-gray-400 px-3 py-2 text-sm font-medium text-gray-700 w-1/2">Full Name</td>
                            <td className="border border-gray-400 px-3 py-2 text-sm text-gray-900 w-1/2">
                              {getValue('fullName') || `${data.staff?.firstName || ''} ${data.staff?.surname || ''}`.trim()}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-3 py-2 text-sm font-medium text-gray-700 w-1/2">Address</td>
                            <td className="border border-gray-400 px-3 py-2 text-sm text-gray-900 w-1/2">
                              {getValue('address')}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-3 py-2 text-sm font-medium text-gray-700 w-1/2">Date of Birth</td>
                            <td className="border border-gray-400 px-3 py-2 text-sm text-gray-900 w-1/2">
                              {getValue('dateOfBirth')}
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-3 py-2 text-sm font-medium text-gray-700 w-1/2">Position Applied For</td>
                            <td className="border border-gray-400 px-3 py-2 text-sm text-gray-900 w-1/2">
                              {getValue('positionApplied')}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Informed Consent */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Informed Consent (to be completed by the applicant)</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <div className="space-y-3 text-gray-900 text-sm leading-relaxed mb-6">
                      <p>
                        All applicants for positions at Infinity Supports WA are asked to sign that they have read and understand the content of the following statement and that they give their consent to use and disclose their personal information for the purposes of recruitment and selection.
                      </p>
                      <p>
                        In accordance with the Privacy legislation, Infinity Supports WA is committed to ensuring the confidentiality and security of your personal information. The information you supply during the recruitment and selection process will be used solely for the purposes of assessing your suitability for employment in the specified position.
                      </p>
                      <p>
                        In order to assist Infinity Supports WA and the assessment of your application, it may be necessary for us to disclose your personal information to certain third parties such as internal managers, your referees etc. and as may be required by law. We will only disclose your personal information to third parties for this purpose.
                      </p>
                      <p>
                        Infinity Supports WA has a policy of retaining information relating to all applicants for a period of 6 months after the selection process for the position has been completed. During this period if another position for which you may be suitable arises, we may use your information in considering your suitability for such a position.
                      </p>
                      <p>
                        In addition, Infinity Supports WA will, in accordance with the Corporations Act, seek information in relation to past performance and employment history of all candidates prior to appointment to any position. Therefore, reference checks with previous employers, police checks, WWCC and educational qualifications checks may be carried out prior to any offer of employment.
                      </p>
                    </div>
                    
                    {/* Consent Questions Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-400">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-400 px-3 py-2 text-left text-sm font-medium text-gray-700 w-3/4">Consent Statement</th>
                            <th className="border border-gray-400 px-3 py-2 text-center text-sm font-medium text-gray-700 w-1/8">Yes</th>
                            <th className="border border-gray-400 px-3 py-2 text-center text-sm font-medium text-gray-700 w-1/8">No</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-gray-400 px-3 py-2 text-sm text-gray-700">
                              I consent to Infinity Supports WA using and disclosing my personal information for the purposes of recruitment and selection for the position stated above.
                            </td>
                            <td className="border border-gray-400 px-3 py-2 text-center">
                              <div className={`w-5 h-5 rounded-full border-2 mx-auto ${getBoolValue('consentRecruitment') === true ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                            </td>
                            <td className="border border-gray-400 px-3 py-2 text-center">
                              <div className={`w-5 h-5 rounded-full border-2 mx-auto ${getBoolValue('consentRecruitment') === false ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-3 py-2 text-sm text-gray-700">
                              I consent Infinity Supports WA using and disclosing my personal information for the purposes of recruitment and selection for ANY OTHER suitable positions that may arise in the future.
                            </td>
                            <td className="border border-gray-400 px-3 py-2 text-center">
                              <div className={`w-5 h-5 rounded-full border-2 mx-auto ${getBoolValue('consentFuturePositions') === true ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                            </td>
                            <td className="border border-gray-400 px-3 py-2 text-center">
                              <div className={`w-5 h-5 rounded-full border-2 mx-auto ${getBoolValue('consentFuturePositions') === false ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-3 py-2 text-sm text-gray-700">
                              I consent to Infinity Supports WA making inquiries about me from my referees and any other person including colleagues on Linkedin.
                            </td>
                            <td className="border border-gray-400 px-3 py-2 text-center">
                              <div className={`w-5 h-5 rounded-full border-2 mx-auto ${getBoolValue('consentRefereeInquiries') === true ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                            </td>
                            <td className="border border-gray-400 px-3 py-2 text-center">
                              <div className={`w-5 h-5 rounded-full border-2 mx-auto ${getBoolValue('consentRefereeInquiries') === false ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                            </td>
                          </tr>
                          <tr>
                            <td className="border border-gray-400 px-3 py-2 text-sm text-gray-700">
                              I consent to Infinity Supports WA carrying out a police check.
                            </td>
                            <td className="border border-gray-400 px-3 py-2 text-center">
                              <div className={`w-5 h-5 rounded-full border-2 mx-auto ${getBoolValue('consentPoliceCheck') === true ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                            </td>
                            <td className="border border-gray-400 px-3 py-2 text-center">
                              <div className={`w-5 h-5 rounded-full border-2 mx-auto ${getBoolValue('consentPoliceCheck') === false ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FormPage>

      {/* Page 2 - Educational Check and Pre-Existing Disclosure */}
      <FormPage showTitle={false} meta={meta}>
        <div className="space-y-4 text-sm w-full">
          <div className="w-full">
            <div className="border border-gray-300 rounded-lg p-6 w-full">
              <div className="space-y-6">

                {/* Educational Qualifications Check */}
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-gray-900">• I consent to Infinity Supports WA carrying out an educational qualifications check.</span>
                    <div className="flex gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 ${getBoolValue('consentEducationalCheck') === true ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                      <span className="text-sm">Yes</span>
                      <div className={`w-5 h-5 rounded-full border-2 ${getBoolValue('consentEducationalCheck') === false ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                      <span className="text-sm">No</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Applicant's Signature:</label>
                      <div className="border-2 border-gray-300 h-24 bg-gray-50 flex items-center justify-center">
                        {getValue('signature') ? (
                          <img 
                            src={getValue('signature')} 
                            alt="Signature" 
                            className="max-h-20 max-w-full object-contain"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">No signature</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date:</label>
                      <div className="border-2 border-gray-300 h-12 bg-gray-50 flex items-center px-3">
                        <span className="text-sm text-gray-900">
                          {getValue('signatureDate') || 'No date'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pre-Existing Injury or Disease Disclosure Statement */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Pre-Existing Injury or Disease Disclosure Statement (to be completed by the applicant)</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <div className="space-y-3 text-gray-900 text-sm leading-relaxed mb-4">
                      <p>
                        Infinity Supports WA is committed to providing a safe working environment for all employees. As part of this it is our objective to ensure potential employees are not required to work in duties that they are not able to perform safely. As part of the application process for employment with Infinity Supports WA, we request you to disclose any pre-existing injury or disease which may be adversely affected by the performance of the inherent requirements of the position you have applied for – as described in the attached Position Description.
                      </p>
                      <p>
                        You are required to disclose to Infinity Supports WA any pre-existing injury or disease that you have suffered of which you are aware, and could reasonably be expected to foresee, could be affected by the nature of this proposed employment.
                      </p>
                      <p>
                        Should any alteration, change or rearrangement be necessary to enable you to effectively carry out the inherent requirements of the position, we also request that you disclose these requirements.
                      </p>
                      <p>
                        Please disclose in the space below any pre-existing injuries or diseases that you suffer from, or have suffered from, which could be affected by the nature of your proposed employment with Infinity Supports WA (attach a separate page if necessary).
                      </p>
                    </div>
                    <div>
                      <div className="border-2 border-gray-300 bg-gray-50 p-4 w-full rounded">
                        <div className="text-sm text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
                          {getValue('preExistingConditions') || 'No pre-existing conditions reported.'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disclosure Advice */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Disclosure Advice (to be completed by the applicant)</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <div className="space-y-4">
                      <p className="text-gray-900 text-sm leading-relaxed">
                        I confirm that I have read and understood the contents of the above information and state that I have disclosed all relevant information in relation to my health and physical ability to carry out the inherent requirements of this position.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Applicant's Signature:</label>
                          <div className="border-2 border-gray-300 h-24 bg-gray-50 flex items-center justify-center">
                            {getValue('disclosureSignature') ? (
                              <img 
                                src={getValue('disclosureSignature')} 
                                alt="Disclosure Signature" 
                                className="max-h-20 max-w-full object-contain"
                              />
                            ) : (
                              <span className="text-gray-400 text-sm">No signature</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date:</label>
                          <div className="border-2 border-gray-300 h-12 bg-gray-50 flex items-center px-3">
                            <span className="text-sm text-gray-900">
                              {getValue('disclosureDate') || 'No date'}
                            </span>
                          </div>
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

      {/* Page 3 - General Health Questionnaire */}
      <FormPage showTitle={false} meta={meta}>
        <div className="space-y-4 text-sm w-full">
          <div className="w-full">
            <div className="border border-gray-300 rounded-lg p-6 w-full">
              <div className="space-y-6">

                {/* General Health Questionnaire */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">General Health Questionnaire (to be completed by the applicant)</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-400">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-400 px-3 py-2 text-left text-sm font-medium text-gray-700">Question</th>
                            <th className="border border-gray-400 px-3 py-2 text-center text-sm font-medium text-gray-700">Yes</th>
                            <th className="border border-gray-400 px-3 py-2 text-center text-sm font-medium text-gray-700">No</th>
                            <th className="border border-gray-400 px-3 py-2 text-center text-sm font-medium text-gray-700">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            'Are you being treated by any Doctor for any illness?',
                            'Have you ever broken any bones?',
                            'Are you taking regular medication?',
                            'Have you ever been immunised against tetanus?',
                            'Have you ever had any operations?'
                          ].map((question, index) => {
                            const key = `generalHealth${index}`;
                            return (
                              <tr key={index}>
                                <td className="border border-gray-400 px-3 py-2 text-sm text-gray-900">{question}</td>
                                <td className="border border-gray-400 px-3 py-2 text-center">
                                  <div className={`w-5 h-5 rounded-full border-2 mx-auto ${getBoolValue(key) === true ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                                </td>
                                <td className="border border-gray-400 px-3 py-2 text-center">
                                  <div className={`w-5 h-5 rounded-full border-2 mx-auto ${getBoolValue(key) === false ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                                </td>
                                <td className="border border-gray-400 px-3 py-2">
                                  {getBoolValue(key) === true && getValue(`${key}Details`) && (
                                    <div className="text-sm text-gray-600 italic">
                                      {getValue(`${key}Details`)}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Medical Conditions */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Do you, or have you ever, suffered from:</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-400">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-400 px-3 py-2 text-left text-sm font-medium text-gray-700">Condition</th>
                            <th className="border border-gray-400 px-3 py-2 text-center text-sm font-medium text-gray-700">Yes</th>
                            <th className="border border-gray-400 px-3 py-2 text-center text-sm font-medium text-gray-700">No</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            'Tuberculosis',
                            'Wheezing/Bronchitis/Asthma',
                            'Diabetes',
                            'Blood pressure or heart disease',
                            'Stomach pains or ulcers',
                            'Excessive noise exposure or loss of hearing',
                            'Skin disorders or dermatitis',
                            'Chronic ear infections',
                            'Fits, black-outs or dizziness',
                            'Head injury or concussion',
                            'Hernia',
                            'Allergies',
                            'Anxieties or depressive illness',
                            'Hepatitis B',
                            'Severe headaches',
                            'Colour blindness'
                          ].map((condition, index) => {
                            const key = condition.toLowerCase().replace(/[^a-z0-9]/g, '') + 'Condition';
                            return (
                              <tr key={index}>
                                <td className="border border-gray-400 px-3 py-2 text-sm text-gray-700">{condition}</td>
                                <td className="border border-gray-400 px-3 py-2 text-center">
                                  <div className={`w-5 h-5 rounded-full border-2 mx-auto ${getBoolValue(key) === true ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                                </td>
                                <td className="border border-gray-400 px-3 py-2 text-center">
                                  <div className={`w-5 h-5 rounded-full border-2 mx-auto ${getBoolValue(key) === false ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </FormPage>

      {/* Page 4 - Body Parts and Workplace Medical History */}
      <FormPage showTitle={false} meta={meta}>
        <div className="space-y-4 text-sm w-full">
          <div className="w-full">
            <div className="border border-gray-300 rounded-lg p-6 w-full">
              <div className="space-y-6">

                {/* Body Part Questions */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Do you, or have you ever, had trouble with your</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-400">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-400 px-3 py-2 text-left text-sm font-medium text-gray-700">Body Part</th>
                            <th className="border border-gray-400 px-3 py-2 text-center text-sm font-medium text-gray-700">Yes</th>
                            <th className="border border-gray-400 px-3 py-2 text-center text-sm font-medium text-gray-700">No</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: 'backneck', label: 'Back or neck' },
                            { key: 'wristelbow', label: 'Wrist or elbow' },
                            { key: 'anklesknees', label: 'Ankles or knees' }
                          ].map((bodyPart, index) => (
                            <tr key={index}>
                              <td className="border border-gray-400 px-3 py-2 text-sm text-gray-900">{bodyPart.label}</td>
                              <td className="border border-gray-400 px-3 py-2 text-center">
                                <div className={`w-5 h-5 rounded-full border-2 mx-auto ${getBoolValue(bodyPart.key) === true ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                              </td>
                              <td className="border border-gray-400 px-3 py-2 text-center">
                                <div className={`w-5 h-5 rounded-full border-2 mx-auto ${getBoolValue(bodyPart.key) === false ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Medical History - Workplace */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Medical History - Workplace (to be completed by the applicant)</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <div className="space-y-4">
                      {[
                        { key: 'workInjury', label: 'Have you ever injured yourself at work or suffered an industrial disease?' },
                        { key: 'ppeDifficulties', label: 'Have you ever had difficulties wearing PPE?' },
                        { key: 'hazardousMaterials', label: 'Have you ever worked with hazardous materials?' }
                      ].map((question, index) => (
                        <div key={index} className="border border-gray-200 rounded p-4">
                          <div className="flex items-start gap-4 mb-3">
                            <span className="text-gray-900 text-sm flex-1">{question.label}</span>
                            <div className="flex gap-4">
                              <div className={`w-5 h-5 rounded-full border-2 ${getBoolValue(question.key) === true ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                              <span className="text-sm">Yes</span>
                              <div className={`w-5 h-5 rounded-full border-2 ${getBoolValue(question.key) === false ? 'bg-green-500 border-green-500' : 'bg-white border-gray-400'}`}></div>
                              <span className="text-sm">No</span>
                            </div>
                          </div>
                          {getBoolValue(question.key) === true && getValue(`${question.key}Details`) && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                If yes, please provide details below:
                              </label>
                              <div className="border-2 border-gray-300 bg-gray-50 p-3 rounded">
                                <div className="text-sm text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
                                  {getValue(`${question.key}Details`)}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Declaration */}
                <div>
                  <div className="bg-blue-600 text-white px-6 py-3 rounded-t-lg">
                    <h3 className="text-xl font-semibold">Declaration (to be completed by the applicant)</h3>
                  </div>
                  <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                    <div className="space-y-4">
                      <p className="text-gray-900 text-sm leading-relaxed">
                        I have not knowingly withheld any information relevant to the pre-employment medical examination. I declare that the information provided in this form is true and correct.
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Applicant's Signature:</label>
                          <div className="border-2 border-gray-300 h-24 bg-gray-50 flex items-center justify-center">
                            {getValue('declarationSignature') ? (
                              <img 
                                src={getValue('declarationSignature')} 
                                alt="Declaration Signature" 
                                className="max-h-20 max-w-full object-contain"
                              />
                            ) : (
                              <span className="text-gray-400 text-sm">No signature provided</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date:</label>
                          <div className="border-2 border-gray-300 h-12 bg-gray-50 flex items-center px-4">
                            <span className="text-sm text-gray-900 font-medium">
                              {getValue('declarationDate') ? new Date(getValue('declarationDate')).toLocaleDateString() : 'No date provided'}
                            </span>
                          </div>
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
}