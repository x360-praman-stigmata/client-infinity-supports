"use client";

import React from 'react';
import VehicleSafetyInspectionForm from './VehicleSafetyInspectionForm';

export default function VehicleSafetyInspectionView({ 
  excludeLastPage = false, 
  children, 
  data = {},
  adminView = false 
}: { 
  excludeLastPage?: boolean; 
  children?: React.ReactNode; 
  data?: any;
  adminView?: boolean;
}) {
  
  // Prepare data - merge data and data.data if needed
  const formData = {
    ...data,
    ...(data.data || {})
  };

  return (
                <div>
      <VehicleSafetyInspectionForm
        initialData={formData}
        readOnly={true}
        showButtons={false}
      />
    </div>
  );
}
