"use client";

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import FormPage from '@/components/ui/FormPage';
import SignatureCanvas from '@/components/ui/SignatureCanvas';
import { fetchFormSpecificSettings } from '@/lib/settings';

export interface PreEmploymentMedicalFormRef {
  save: (submit?: boolean) => Promise<boolean>;
  validate: () => boolean;
  validateDetailed: () => { isValid: boolean; missing?: string[]; invalid?: string[] } | null;
  getData: () => any;
}

export default forwardRef<PreEmploymentMedicalFormRef, { token: string; onValidityChange?: (v: boolean) => void }>(
  function PreEmploymentMedicalForm({ token, onValidityChange }, ref) {
    const [data, setData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [staffInfo, setStaffInfo] = useState<any>({});
    const [meta, setMeta] = useState<{ website: string; formId: string; reviewDate: string }>({
      website: 'infinitysupportswa.org',
      formId: 'SF014',
      reviewDate: '01/03/2025'
    });

    useEffect(() => {
      // Load saved data if any
      const loadData = async () => {
        try {
          const response = await fetch(`/api/staff/onboard/${token}`);
          if (response.ok) {
            const result = await response.json();
            const s = result.staff || {};
            const saved = (result.submissions && result.submissions['pre_employment_medical']) || {};
            
            console.log('📋 PreEmploymentMedicalForm - Data loaded:', {
              staffId: s.id,
              staffName: `${s.firstName} ${s.surname}`,
              hasExistingData: Object.keys(saved).length > 0,
              existingFields: Object.keys(saved),
              signatureFields: {
                hasSignature: !!saved.signature,
                hasDisclosureSignature: !!saved.disclosureSignature,
                hasDeclarationSignature: !!saved.declarationSignature,
                hasSignatureDate: !!saved.signatureDate,
                hasDisclosureDate: !!saved.disclosureDate,
                hasDeclarationDate: !!saved.declarationDate
              },
              token: token.substring(0, 10) + '...'
            });
            
            setStaffInfo(s);
            setData((d: any) => ({
              ...d,
              ...saved,
              // Handle signature data from new fields
              signature: saved.signature || '',
              signatureDate: saved.signatureDate || '',
              // Set name from staff info if not already set
              fullName: saved.fullName || `${s.firstName || ''} ${s.surname || ''}`.trim()
            }));
          }
        } catch (e) {
          console.error('❌ PreEmploymentMedicalForm - Error loading data:', e);
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

    useEffect(() => {
      // Load form-specific settings
      const loadSettings = async () => {
        try {
          const settings = await fetchFormSpecificSettings();
          const getSettingValue = (key: string): string | null => {
            const groups = Object.values(settings || {});
            for (const group of groups) {
              if (Array.isArray(group)) {
                const s = group.find((it: any) => it && it.key === key);
                if (s) return s.value || s.defaultValue || null;
              }
            }
            return null;
          };
          setMeta({
            website: getSettingValue('company_website') || 'infinitysupportswa.org',
            formId: getSettingValue('pre_employment_medical_form_id') || 'SF014',
            reviewDate: getSettingValue('review_date') || '01/03/2025',
          });
        } catch {}
      };
      loadSettings();
    }, []);

    const validate = (): boolean => {
      // Check if required fields are filled
      return !!(
        data.fullName &&
        data.consentRecruitment &&
        data.consentFuturePositions &&
        data.consentRefereeInquiries &&
        data.consentPoliceCheck &&
        data.consentEducationalCheck &&
        data.signature &&
        data.signatureDate &&
        data.disclosureSignature &&
        data.disclosureDate &&
        data.declarationSignature &&
        data.declarationDate
      );
    };

    const validateDetailed = () => {
      const missing: string[] = [];
      const invalid: string[] = [];

      if (!data.fullName) missing.push('Full Name');
      if (!data.consentRecruitment) missing.push('Recruitment Consent');
      if (!data.consentFuturePositions) missing.push('Future Positions Consent');
      if (!data.consentRefereeInquiries) missing.push('Referee Inquiries Consent');
      if (!data.consentPoliceCheck) missing.push('Police Check Consent');
      if (!data.consentEducationalCheck) missing.push('Educational Check Consent');
      if (!data.signature) missing.push('Educational Check Signature');
      if (!data.signatureDate) missing.push('Educational Check Date');
      if (!data.disclosureSignature) missing.push('Disclosure Signature');
      if (!data.disclosureDate) missing.push('Disclosure Date');
      if (!data.declarationSignature) missing.push('Declaration Signature');
      if (!data.declarationDate) missing.push('Declaration Date');

      // Check if dates are valid
      if (data.signatureDate && isNaN(Date.parse(data.signatureDate))) {
        invalid.push('Educational Check Date (invalid format)');
      }
      if (data.disclosureDate && isNaN(Date.parse(data.disclosureDate))) {
        invalid.push('Disclosure Date (invalid format)');
      }
      if (data.declarationDate && isNaN(Date.parse(data.declarationDate))) {
        invalid.push('Declaration Date (invalid format)');
      }

      return {
        isValid: missing.length === 0 && invalid.length === 0,
        missing: missing.length > 0 ? missing : undefined,
        invalid: invalid.length > 0 ? invalid : undefined
      };
    };

    const save = async (submit: boolean = false): Promise<boolean> => {
      setLoading(true);
      try {
        const payload = {
          formKey: 'pre_employment_medical',
          data: { ...data, submit }
        };
        
        console.log('💾 PreEmploymentMedicalForm - Saving:', {
          submit,
          hasSignature: !!data.signature,
          hasDeclarationSignature: !!data.declarationSignature,
          hasDisclosureSignature: !!data.disclosureSignature,
          formFields: Object.keys(data).length,
          token: token.substring(0, 10) + '...'
        });
        
        const response = await fetch(`/api/staff/onboard/${token}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          console.log('✅ PreEmploymentMedicalForm - Save successful:', { submit, formKey: 'pre_employment_medical' });
          return true;
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('❌ PreEmploymentMedicalForm - Save failed:', {
            status: response.status,
            error: errorData.error || 'Unknown error',
            submit
          });
          return false;
        }
      } catch (e) {
        console.error('Save failed:', e);
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

    const handleChange = (key: string, value: any) => {
      setData((prev: any) => ({ ...prev, [key]: value }));
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
                      <h3 className="text-xl font-semibold">Pre-Employment Medical Examination Consent Form

</h3>
                    </div>
                    <div className="border border-gray-300 rounded-b-lg p-4 w-full mt-3">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-400">
                          <tbody>
                            <tr>
                              <td className="border border-gray-400 px-3 py-2 text-sm font-medium text-gray-700 w-1/2">Full Name</td>
                              <td className="border border-gray-400 px-3 py-2 text-sm text-gray-900 w-1/2">
                                <input
                                  id="fullName"
                                  title="Full Name"
                                  type="text"
                                  value={data.fullName || ''}
                                  onChange={(e) => handleChange('fullName', e.target.value)}
                                  className="w-full border border-gray-400 h-8 rounded-sm px-2 text-gray-900 bg-white"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 px-3 py-2 text-sm font-medium text-gray-700 w-1/2">Address</td>
                              <td className="border border-gray-400 px-3 py-2 text-sm text-gray-900 w-1/2">
                                <input
                                  id="address"
                                  title="Address"
                                  type="text"
                                  value={data.address || ''}
                                  onChange={(e) => handleChange('address', e.target.value)}
                                  className="w-full border border-gray-400 h-8 rounded-sm px-2 text-gray-900 bg-white"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 px-3 py-2 text-sm font-medium text-gray-700 w-1/2">Date of Birth</td>
                              <td className="border border-gray-400 px-3 py-2 text-sm text-gray-900 w-1/2">
                                <input
                                  id="dateOfBirth"
                                  title="Date of Birth"
                                  type="date"
                                  value={data.dateOfBirth || ''}
                                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                                  className="w-full border border-gray-400 h-8 rounded-sm px-2 text-gray-900 bg-white"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 px-3 py-2 text-sm font-medium text-gray-700 w-1/2">Position Applied For</td>
                              <td className="border border-gray-400 px-3 py-2 text-sm text-gray-900 w-1/2">
                                <input
                                  id="positionApplied"
                                  title="Position Applied For"
                                  type="text"
                                  value={data.positionApplied || ''}
                                  onChange={(e) => handleChange('positionApplied', e.target.value)}
                                  className="w-full border border-gray-400 h-8 rounded-sm px-2 text-gray-900 bg-white"
                                />
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
                                    <input
                                      type="checkbox"
                                  checked={data.consentRecruitment === true}
                                  onChange={() => handleChange('consentRecruitment', true)}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="border border-gray-400 px-3 py-2 text-center">
                                    <input
                                      type="checkbox"
                                  checked={data.consentRecruitment === false}
                                  onChange={() => handleChange('consentRecruitment', false)}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                  </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 px-3 py-2 text-sm text-gray-700">
                                I consent Infinity Supports WA using and disclosing my personal information for the purposes of recruitment and selection for ANY OTHER suitable positions that may arise in the future.
                              </td>
                              <td className="border border-gray-400 px-3 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={data.consentFuturePositions === true}
                                  onChange={() => handleChange('consentFuturePositions', true)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                              </td>
                              <td className="border border-gray-400 px-3 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={data.consentFuturePositions === false}
                                  onChange={() => handleChange('consentFuturePositions', false)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 px-3 py-2 text-sm text-gray-700">
                                I consent to Infinity Supports WA making inquiries about me from my referees and any other person including colleagues on Linkedin.
                              </td>
                              <td className="border border-gray-400 px-3 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={data.consentRefereeInquiries === true}
                                  onChange={() => handleChange('consentRefereeInquiries', true)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                              </td>
                              <td className="border border-gray-400 px-3 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={data.consentRefereeInquiries === false}
                                  onChange={() => handleChange('consentRefereeInquiries', false)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 px-3 py-2 text-sm text-gray-700">
                                I consent to Infinity Supports WA carrying out a police check.
                              </td>
                              <td className="border border-gray-400 px-3 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={data.consentPoliceCheck === true}
                                  onChange={() => handleChange('consentPoliceCheck', true)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                              </td>
                              <td className="border border-gray-400 px-3 py-2 text-center">
                                <input
                                  type="checkbox"
                                  checked={data.consentPoliceCheck === false}
                                  onChange={() => handleChange('consentPoliceCheck', false)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
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
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={data.consentEducationalCheck === true}
                                onChange={() => handleChange('consentEducationalCheck', true)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              Yes
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={data.consentEducationalCheck === false}
                                onChange={() => handleChange('consentEducationalCheck', false)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              No
                            </label>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Applicant's Signature:</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date:</label>
                            <input
                              id="signatureDate"
                              title="Signature Date"
                              type="date"
                              value={data.signatureDate || ''}
                              onChange={(e) => handleChange('signatureDate', e.target.value)}
                              className="w-full border border-gray-400 h-8 rounded-sm px-2 text-gray-900 bg-white"
                            />
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
                        <textarea
                          id="preExistingConditions"
                          title="Pre-existing conditions disclosure"
                          value={data.preExistingConditions || ''}
                          onChange={(e) => handleChange('preExistingConditions', e.target.value)}
                          rows={10}
                          className="w-full border border-gray-400 rounded-sm px-3 py-2 text-gray-900 bg-white"
                          placeholder="Please provide details of any pre-existing conditions..."
                        />
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
                            <SignatureCanvas
                              existingSignature={data.disclosureSignature}
                              onSignatureEnd={(sig) => handleChange('disclosureSignature', sig)}
                              onSignatureClear={() => handleChange('disclosureSignature', '')}
                              width={400}
                              height={120}
                              className="bg-white border border-gray-400 rounded-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date:</label>
                            <input
                              id="disclosureDate"
                              title="Disclosure Date"
                              type="date"
                              value={data.disclosureDate || ''}
                              onChange={(e) => handleChange('disclosureDate', e.target.value)}
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
                                    <input
                                      type="checkbox"
                                      checked={data[key] === true}
                                      onChange={() => handleChange(key, true)}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      title={`${question} - Yes`}
                                    />
                                  </td>
                                  <td className="border border-gray-400 px-3 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={data[key] === false}
                                      onChange={() => handleChange(key, false)}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      title={`${question} - No`}
                                    />
                                  </td>
                                  <td className="border border-gray-400 px-3 py-2">
                                    {data[key] === true && (
                                      <textarea
                                        value={data[`${key}Details`] || ''}
                                        onChange={(e) => handleChange(`${key}Details`, e.target.value)}
                                        rows={2}
                                        className="w-full border border-gray-400 rounded-sm px-2 py-1 text-gray-900 bg-white text-xs"
                                        placeholder="Details..."
                                      />
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
                              const key = condition.toLowerCase().replace(/[^a-z0-9]/g, '');
                              return (
                                <tr key={index}>
                                  <td className="border border-gray-400 px-3 py-2 text-sm text-gray-900">{condition}</td>
                                  <td className="border border-gray-400 px-3 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={data[`${key}Condition`] === true}
                                      onChange={() => handleChange(`${key}Condition`, true)}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      title={`${condition} - Yes`}
                                    />
                                  </td>
                                  <td className="border border-gray-400 px-3 py-2 text-center">
                                    <input
                                      type="checkbox"
                                      checked={data[`${key}Condition`] === false}
                                      onChange={() => handleChange(`${key}Condition`, false)}
                                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                      title={`${condition} - No`}
                                    />
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
                                  <input
                                    type="checkbox"
                                    checked={data[bodyPart.key] === true}
                                    onChange={() => handleChange(bodyPart.key, true)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    title={`${bodyPart.label} - Yes`}
                                  />
                                </td>
                                <td className="border border-gray-400 px-3 py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={data[bodyPart.key] === false}
                                    onChange={() => handleChange(bodyPart.key, false)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    title={`${bodyPart.label} - No`}
                                  />
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
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={data[question.key] === true}
                                    onChange={() => handleChange(question.key, true)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  Yes
                                </label>
                                <label className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={data[question.key] === false}
                                    onChange={() => handleChange(question.key, false)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  No
                                </label>
                              </div>
                            </div>
                            {data[question.key] === true && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  If yes, please provide details below:
                                </label>
                                <textarea
                                  value={data[`${question.key}Details`] || ''}
                                  onChange={(e) => handleChange(`${question.key}Details`, e.target.value)}
                                  rows={3}
                                  className="w-full border border-gray-400 rounded-sm px-3 py-2 text-gray-900 bg-white"
                                  placeholder="Please provide details..."
                                />
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
                            <SignatureCanvas
                              existingSignature={data.declarationSignature}
                              onSignatureEnd={(sig) => handleChange('declarationSignature', sig)}
                              onSignatureClear={() => handleChange('declarationSignature', '')}
                              width={400}
                              height={120}
                              className="bg-white border border-gray-400 rounded-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date:</label>
                            <input
                              id="declarationDate"
                              title="Declaration Date"
                              type="date"
                              value={data.declarationDate || ''}
                              onChange={(e) => handleChange('declarationDate', e.target.value)}
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
  }
);

function Field({ label, value, onChange, type = 'text' }: { label: string; value: any; onChange: (v: any) => void; type?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}:</label>
      <input
        id={`field-${label.toLowerCase().replace(/\s+/g, '-')}`}
        title={label}
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-400 h-8 rounded-sm px-2 text-gray-900 bg-white"
      />
    </div>
  );
}

function ConsentCheckbox({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean | null) => void }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex gap-4 mt-1">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value === true}
            onChange={() => onChange(true)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          Yes
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value === false}
            onChange={() => onChange(false)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          No
        </label>
      </div>
      <span className="text-sm text-gray-900 flex-1">{label}</span>
    </div>
  );
}
