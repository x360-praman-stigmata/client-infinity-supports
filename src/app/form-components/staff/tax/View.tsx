"use client";

import React from "react";
import TFNOverlayForm from "./page";

interface GovtTaxViewProps {
  initialData?: any;
  onDataChange?: (data: any) => void;
  readOnly?: boolean;
  showButtons?: boolean;
}

export default function GovtTaxView({
  initialData = {},
  onDataChange,
  readOnly = true, // Default to read-only for admin view
  showButtons = false
}: GovtTaxViewProps) {
  return (
    <TFNOverlayForm
      initialData={initialData}
      onDataChange={onDataChange}
      readOnly={true}  // Force read-only for admin view - always true
      showButtons={false}  // No buttons for admin view - always false
    />
  );
}
