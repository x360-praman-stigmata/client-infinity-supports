"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { getStaffFormComponent } from '@/app/forms/staff-registry';

// Import the actual working form components from staff onboarding
import SupportWorkerForm from '@/app/staff/onboard/[token]/components/SupportWorkerForm';
import PreEmploymentMedicalForm from '@/app/staff/onboard/[token]/components/PreEmploymentMedicalForm';
import EmployeeDetailsStep from '@/app/staff/onboard/[token]/components/EmployeeDetailsStep';
import EmployeeWelcomeAckForm from '@/app/staff/onboard/[token]/components/EmployeeWelcomeAckForm';
import BullyingTrainingAckForm from '@/app/staff/onboard/[token]/components/BullyingTrainingAckForm';

export default function StaffFormView() {
  const { id, formType } = useParams<{ id: string; formType: string }>();
  const [staff, setStaff] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStaffData = async () => {
      try {
        const res = await fetch(`/api/staff/onboard/admin-view-${id}`);
        const result = await res.json();
        setStaff(result.staff);
        setFormData(result.submissions);
      } catch (error) {
        console.error('Error loading staff data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) loadStaffData();
  }, [id]);

  if (loading) {
    return <LoadingSpinner title="Loading Form" message="Please wait while we load the form data..." />;
  }
  
  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Staff Not Found</h3>
          <p className="text-gray-600">The staff member could not be found.</p>
        </div>
      </div>
    );
  }

  // Form name mapping
  const formNames: Record<string, string> = {
    'employment-details': 'Employee Details',
    'employee-welcome': 'Employee Welcome',
    'support-worker': 'Support Worker',
    'pre-employment-medical': 'Pre-Employment Medical',
    'ndis-workforce': 'NDIS Workforce Capability Framework',
    'bullying-harassment': 'Bullying & Harassment Training',
    'bullying-training': 'Bullying Training',
    'acknowledgement-edit': 'Documentation Acknowledgement',
    'ndis-code-of-conduct': 'NDIS Code of Conduct',
    'fair-work-information': 'Fair Work Information Statement',
    'casual-employment-information': 'Casual Employment Information Statement',
    'orientation': 'Staff Orientation',
    'govt-tax': 'Government Tax',
    'super-choice-form': 'Superannuation Standard Choice Form',
    'vehicle-safety-inspection': 'Vehicle Safety Inspection Checklist',
    'conflict-of-interest': 'Conflict of Interest Disclosure Form'
  };

  const formName = formNames[formType] || formType;

  // Map form types to registry keys
  const formKeyMap: Record<string, string> = {
    'employment-details': 'employee_details',
    'employee-welcome': 'employee_welcome', 
    'support-worker': 'support_worker',
    'pre-employment-medical': 'pre_employment_medical',
    'ndis-workforce': 'ndis_workforce_capability',
    'bullying-harassment': 'bullying_harassment_training',
    'bullying-training': 'bullying_training',
    'acknowledgement-edit': 'documentation_acknowledgement',
    'ndis-code-of-conduct': 'ndis_code_of_conduct',
    'fair-work-information': 'fair_work_information',
    'casual-employment-information': 'casual_employment_information',
    'orientation': 'orientation',
    'govt-tax': 'govt_tax',
    'super-choice-form': 'super_choice_form',
    'vehicle-safety-inspection': 'vehicle_safety_inspection',
    'conflict-of-interest': 'conflict_of_interest'
  };

  // Render the appropriate form component in read-only mode
  const renderFormComponent = () => {
    const readOnlyStyle = { pointerEvents: 'none' as const, opacity: 0.9 };
    
    switch (formType) {
      case 'employment-details':
        return (
          <div style={readOnlyStyle}>
            <EmployeeDetailsStep token={`admin-view-${id}`} onValidityChange={() => {}} />
          </div>
        );
      case 'employee-welcome':
        return (
          <div style={readOnlyStyle}>
            <EmployeeWelcomeAckForm token={`admin-view-${id}`} onValidityChange={() => {}} />
          </div>
        );
      case 'support-worker':
        return (
          <div style={readOnlyStyle}>
            <SupportWorkerForm token={`admin-view-${id}`} onValidityChange={() => {}} />
          </div>
        );
      case 'pre-employment-medical':
        return (
          <div style={readOnlyStyle}>
            <PreEmploymentMedicalForm token={`admin-view-${id}`} onValidityChange={() => {}} />
          </div>
        );
      case 'bullying-training':
        return (
          <div style={readOnlyStyle}>
            <BullyingTrainingAckForm token={`admin-view-${id}`} onValidityChange={() => {}} />
          </div>
        );
      default:
        // Use registry components for other forms
        try {
          const registryKey = formKeyMap[formType];
          const FormComponent = getStaffFormComponent(registryKey, 'view');
          const formKey = formKeyMap[formType] || formType;
          const currentFormData = formData?.[formKey];
          
          if (!currentFormData) {
            return (
              <div className="text-center py-8">
                <p className="text-gray-600">No data found for this form.</p>
              </div>
            );
          }

          // Special handling for tax and super choice forms
          const isSpecialForm = formKey === 'govt_tax' || formKey === 'super_choice_form';
          
          return (
            <div style={readOnlyStyle}>
              {isSpecialForm ? (
                <FormComponent 
                  initialData={currentFormData}
                  readOnly={true}
                  showButtons={false}
                />
              ) : (
                <FormComponent 
                  data={{ data: currentFormData }}
                  readOnly={true}
                  showButtons={false}
                />
              )}
            </div>
          );
        } catch (error) {
          return (
            <div className="text-center py-8">
              <p className="text-gray-600">Form component not available.</p>
              <p className="text-sm text-gray-500 mt-2">Form type: {formType}</p>
            </div>
          );
        }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{formName}</h1>
              <p className="text-gray-600 mt-1">{staff?.firstName} {staff?.surname}</p>
            </div>
            <Link 
              href={`/admin/staff/${id}`} 
              className="text-sm text-rose-600 hover:underline self-start sm:self-auto"
            >
              ← Back to Staff Forms
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            {renderFormComponent()}
          </div>
        </div>
      </div>
    </div>
  );
}
