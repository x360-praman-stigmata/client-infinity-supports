"use client";

import React from "react";
import SuperChoiceForm from "./page";

interface SuperChoiceFormViewProps {
  initialData?: any;
  onDataChange?: (data: any) => void;
  readOnly?: boolean;
  showButtons?: boolean;
  onValidationChange?: (validationFn: () => { isValid: boolean; errors: string[] }) => void;
}

export default function SuperChoiceFormView({
  initialData = {},
  onDataChange,
  readOnly = true,
  showButtons = false,
  onValidationChange
}: SuperChoiceFormViewProps) {
  return (
    <SuperChoiceForm
      initialData={initialData}
      onDataChange={onDataChange}
      readOnly={readOnly}  // Use the passed readOnly prop
      showButtons={showButtons}  // Use the passed showButtons prop
      onValidationChange={onValidationChange}
    />
  );
}
