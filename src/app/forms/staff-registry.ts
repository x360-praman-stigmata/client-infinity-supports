import type React from 'react';

import EmployeeDetailsView from '@/app/form-components/staff/employee-details/View';
import EmployeeWelcomeView from '@/app/form-components/staff/employee-welcome/View';
import SupportWorkerView from '@/app/form-components/staff/support-worker/View';
import SupportWorkerEdit from '@/app/form-components/staff/support-worker/Edit';
import PreEmploymentMedicalView from '@/app/form-components/staff/pre-employment-medical/View';
import NdisWorkforceCapabilityView from '@/app/form-components/staff/ndis-workforce-capability/View';
import BullyingHarassmentTrainingView from '@/app/form-components/staff/bullying-harassment-training/View';
import BullyingTrainingView from '@/app/form-components/staff/bullying-training/View';

import NDISCodeOfConductView from '../form-components/staff/code_of_conduct/View';
import NDISCodeOfConductEdit from '../form-components/staff/code_of_conduct/Edit';
import FairWorkInformationView from '../form-components/staff/fair-work-information/View';
import FairWorkInformationEdit from '../form-components/staff/fair-work-information/Edit';
import CasualEmploymentInformationView from '../form-components/staff/casual-employment-information/View';
import CasualEmploymentInformationEdit from '../form-components/staff/casual-employment-information/Edit';
import OrientationView from '../form-components/staff/orientation/View';
import OrientationEdit from '../form-components/staff/orientation/Edit';
import VehicleSafetyInspectionView from '../form-components/staff/vehicle-safety-inspection/View';
import VehicleSafetyInspectionEdit from '../form-components/staff/vehicle-safety-inspection/Edit';
import GovtTax from '@/app/form-components/staff/tax/page'
import GovtTaxEdit from '@/app/form-components/staff/tax/Edit'
import SuperChoiceForm from '@/app/form-components/staff/super-choice-form/page'
import SuperChoiceFormView from '@/app/form-components/staff/super-choice-form/View'
import SuperChoiceFormEdit from '@/app/form-components/staff/super-choice-form/Edit'

import ConflictFormMain from '../form-components/staff/conflict-of-interest/page';
import DocumentationAcknowledgement from '../form-components/staff/acknowledgement/page';

export interface StaffFormRegistryItem {
  key: string;
  name: string;
  viewComponent: React.ComponentType<any>;
  editComponent?: React.ComponentType<any>;
}

const staffFormRegistry: Record<string, StaffFormRegistryItem> = {
  employee_details: {
    key: 'employee_details',
    name: 'Employee Details',
    viewComponent: EmployeeDetailsView,
  },
  employee_welcome: {
    key: 'employee_welcome',
    name: 'Employee Welcome',
    viewComponent: EmployeeWelcomeView,
  },
  support_worker: {
    key: 'support_worker',
    name: 'Support Worker',
    viewComponent: SupportWorkerView,
    editComponent: SupportWorkerEdit,
  },
  pre_employment_medical: {
    key: 'pre_employment_medical',
    name: 'Pre-Employment Medical',
    viewComponent: PreEmploymentMedicalView,
  },
  ndis_workforce_capability: {
    key: 'ndis_workforce_capability',
    name: 'NDIS Workforce Capability Framework',
    viewComponent: NdisWorkforceCapabilityView,
  },
  bullying_harassment_training: {
    key: 'bullying_harassment_training',
    name: 'Bullying and Harassment Training',
    viewComponent: BullyingHarassmentTrainingView,
  },
  bullying_training: {
    key: 'bullying_training',
    name: 'Bullying Training',
    viewComponent: BullyingTrainingView,
  },
  ndis_code_of_conduct: {
    key: 'ndis_code_of_conduct',
    name: 'NDIS Code of Conduct',
    viewComponent: NDISCodeOfConductView,
    editComponent: NDISCodeOfConductEdit,
  },
  fair_work_information: {
    key: 'fair_work_information',
    name: 'Fair Work Information Statement',
    viewComponent: FairWorkInformationView,
    editComponent: FairWorkInformationEdit,
  },
  casual_employment_information: {
    key: 'casual_employment_information',
    name: 'Casual Employment Information Statement',
    viewComponent: CasualEmploymentInformationView,
    editComponent: CasualEmploymentInformationEdit,
  },
  orientation: {
    key: 'orientation',
    name: 'Staff Orientation',
    viewComponent: OrientationView,
    editComponent: OrientationEdit,
  },
  govt_tax: {
    key: 'govt_tax',
    name: 'Government Tax',
    viewComponent: GovtTax,
    editComponent: GovtTaxEdit,
  },
  super_choice_form: {
    key: 'super_choice_form',
    name: 'Superannuation Standard Choice Form',
    viewComponent: SuperChoiceFormView,
    editComponent: SuperChoiceFormEdit,
  },
  vehicle_safety_inspection: {
    key: 'vehicle_safety_inspection',
    name: 'Vehicle Safety Inspection Checklist',
    viewComponent: VehicleSafetyInspectionView,
    editComponent: VehicleSafetyInspectionEdit,
  },
  conflict_of_interest: {
    key: 'conflict_of_interest',
    name: 'Conflict of Interest Disclosure Form',
    viewComponent: ConflictFormMain,
  },
  documentation_acknowledgement: {
    key: 'documentation_acknowledgement',
    name: 'Documentation Acknowledgement',
    viewComponent: DocumentationAcknowledgement,
  }
};

export const getAllStaffForms = (): StaffFormRegistryItem[] => Object.values(staffFormRegistry);

export const getStaffFormComponent = (formKey: string, mode: 'view' | 'edit' = 'view') => {
  const item = staffFormRegistry[formKey];
  if (!item) throw new Error(`Staff form not found: ${formKey}`);
  return mode === 'view' ? item.viewComponent : (item.editComponent || item.viewComponent);
};

export const getStaffFormConfig = (formKey: string): StaffFormRegistryItem | undefined => staffFormRegistry[formKey];

export default staffFormRegistry;


