"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import OverlaySignatureBox from "../tax/OverlaySignaturePad";
import { toast } from "react-hot-toast";

// Validation Utilities
const validateString = (value: string, fieldName: string): string | null => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required - please fill this field`;
  }
  if (value.trim().length < 2) {
    return `${fieldName} must be at least 2 characters`;
  }
  return null;
};

const validateNumber = (value: string, fieldName: string, requiredLength?: number): string | null => {
  if (!value || value.trim().length === 0) {
    return `${fieldName} is required`;
  }
  if (!/^\d+$/.test(value)) {
    return `${fieldName} must contain only numbers`;
  }
  if (requiredLength && value.length !== requiredLength) {
    return `${fieldName} must be exactly ${requiredLength} digits - all boxes must be filled`;
  }
  // Check for empty spaces in the middle (incomplete filling)
  if (value.includes(' ')) {
    return `${fieldName} must be completely filled - no empty boxes allowed`;
  }
  return null;
};

const validateDate = (date: { day: string; month: string; year: string }, fieldName: string): string | null => {
  if (!date.day || !date.month || !date.year) {
    return `${fieldName} is required`;
  }
  
  // Check if all date boxes are filled (no empty spaces)
  if (date.day.length !== 2 || date.month.length !== 2 || date.year.length !== 4) {
    return `${fieldName} must be completely filled - all date boxes must be filled`;
  }
  
  const day = parseInt(date.day);
  const month = parseInt(date.month);
  const year = parseInt(date.year);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return `${fieldName} must contain only numbers`;
  }
  
  if (day < 1 || day > 31) {
    return `${fieldName} day must be between 01 and 31`;
  }
  
  if (month < 1 || month > 12) {
    return `${fieldName} month must be between 01 and 12`;
  }
  
  if (year < 1900 || year > 2100) {
    return `${fieldName} year must be between 1900 and 2100`;
  }
  
  // Check if date is valid
  const dateObj = new Date(year, month - 1, day);
  if (dateObj.getDate() !== day || dateObj.getMonth() !== month - 1 || dateObj.getFullYear() !== year) {
    return `${fieldName} is not a valid date`;
  }
  
  return null;
};

const validateCheckbox = (checked: boolean, fieldName: string): string | null => {
  if (!checked) {
    return `${fieldName} must be checked - please tick the checkbox`;
  }
  return null;
};

const validateSignature = (signature: string | null, fieldName: string): string | null => {
  if (!signature || signature.trim().length === 0) {
    return `${fieldName} is required - please sign this field`;
  }
  return null;
};

// Overlay Components
const CharacterInput = ({ 
  value, 
  onChange, 
  length, 
  top, 
  left, 
  gap = 2, 
  boxWidth = 20, 
  boxHeight = 25,
  readOnly = false,
  onUpArrow,
  onDownArrow,
  inputRefs,
  numbersOnly = true
}: {
  value: string;
  onChange: (value: string) => void;
  length: number;
  top: number;
  left: number;
  gap?: number;
  boxWidth?: number;
  boxHeight?: number;
  readOnly?: boolean;
  onUpArrow?: () => void;
  onDownArrow?: () => void;
  inputRefs?: React.MutableRefObject<(HTMLInputElement | null)[]>;
  numbersOnly?: boolean;
}) => {
  const localRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const refs = inputRefs || localRefs;

  const handleChange = (index: number, char: string) => {
    if (readOnly) return;
    
    // Filter input based on numbersOnly flag
    let filteredChar = char;
    if (numbersOnly) {
      filteredChar = char.replace(/[^0-9]/g, '');
    } else {
      filteredChar = char.replace(/[^a-zA-Z0-9\s]/g, '');
    }
    
    const newValue = value.padEnd(length, ' ').split('');
    newValue[index] = filteredChar;
    onChange(newValue.join('').trimEnd());
    
    // Auto-focus next input if character is entered
    if (filteredChar && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (readOnly) return;
    
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // If current box is empty, move to previous box
        refs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      refs.current[index + 1]?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onUpArrow?.();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onDownArrow?.();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (readOnly) return;
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').slice(0, length);
    const newValue = pastedText.padEnd(length, ' ').split('');
    onChange(newValue.join('').trimEnd());
    
    // Focus the next empty box or the last box
    const nextEmptyIndex = Math.min(pastedText.length, length - 1);
    refs.current[nextEmptyIndex]?.focus();
  };

  return (
    <div className="absolute" style={{ top, left }}>
      {Array.from({ length }, (_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="border border-black text-center bg-white text-black"
          style={{
            width: boxWidth,
            height: boxHeight,
            marginRight: i < length - 1 ? (
              length === 9 ? (i === 2 ? 20 : i === 5 ? 24 : gap) : // TFN: 3-3-3 grouping
              length === 11 ? (i === 1 ? 21 : i === 4 ? 21 : i === 7 ? 22 : gap) : // ABN: 2-3-3-3 grouping with custom spacing
              gap // All other fields (including employee number) use normal gap
            ) : 0,
            fontSize: '12px',
            padding: 0,
            color: 'black'
          }}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
};


const TextInput = ({ 
  value, 
  onChange, 
  top, 
  left, 
  width, 
  height = 25,
  readOnly = false,
  onUpArrow,
  onDownArrow,
  stringsOnly = true
}: {
  value: string;
  onChange: (value: string) => void;
  top: number;
  left: number;
  width: number;
  height?: number;
  readOnly?: boolean;
  onUpArrow?: () => void;
  onDownArrow?: () => void;
  stringsOnly?: boolean;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let filteredValue = e.target.value;
    
    if (stringsOnly) {
      // Allow letters, spaces, hyphens, apostrophes, and periods
      filteredValue = filteredValue.replace(/[^a-zA-Z\s\-'\.]/g, '');
    }
    
    onChange(filteredValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onUpArrow?.();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onDownArrow?.();
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className="absolute border border-black bg-white px-1 text-black"
      style={{ 
        top, 
        left, 
        width, 
        height, 
        fontSize: '15px',
        color: 'black'
      }}
      readOnly={readOnly}
    />
  );
};

const Checkbox = ({ 
  checked, 
  onChange, 
  top, 
  left, 
  width = 15, 
  height = 15,
  readOnly = false 
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  top: number;
  left: number;
  width?: number;
  height?: number;
  readOnly?: boolean;
}) => (
  <input
    type="checkbox"
    checked={checked}
    onChange={(e) => onChange(e.target.checked)}
    className="absolute"
    style={{ top, left, width, height }}
    readOnly={readOnly}
  />
);

// Removed ABNInput component - using CharacterInput with proper margin logic instead


// Removed SignaturePad component - now using OverlaySignatureBox from government tax form

const DateInput = ({ 
  value, 
  onChange, 
  dayTop,
  dayLeft,
  monthTop,
  monthLeft,
  yearTop,
  yearLeft,
  separator1Top,
  separator1Left,
  separator2Top,
  separator2Left,
  readOnly = false 
}: {
  value: { day: string; month: string; year: string };
  onChange: (value: { day: string; month: string; year: string }) => void;
  dayTop: number;
  dayLeft: number;
  monthTop: number;
  monthLeft: number;
  yearTop: number;
  yearLeft: number;
  separator1Top?: number;
  separator1Left?: number;
  separator2Top?: number;
  separator2Left?: number;
  readOnly?: boolean;
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (field: 'day' | 'month' | 'year', val: string, index: number) => {
    // Filter to numbers only
    const numericValue = val.replace(/[^0-9]/g, '');
    
    const newValue = value[field].split('');
    newValue[index] = numericValue;
    onChange({ ...value, [field]: newValue.join('') });
    
    // Auto-advance to next input
    if (numericValue && index < (field === 'year' ? 3 : 1)) {
      const nextIndex = getNextInputIndex(field, index);
      if (nextIndex !== -1) {
        inputRefs.current[nextIndex]?.focus();
      }
    }
  };

  const getNextInputIndex = (field: 'day' | 'month' | 'year', currentIndex: number): number => {
    if (field === 'day') {
      if (currentIndex === 0) return 1; // day[1]
      if (currentIndex === 1) return 2; // month[0]
    } else if (field === 'month') {
      if (currentIndex === 0) return 3; // month[1]
      if (currentIndex === 1) return 4; // year[0]
    } else if (field === 'year') {
      if (currentIndex < 3) return 4 + currentIndex + 1; // year[next]
    }
    return -1;
  };

  const getPrevInputIndex = (field: 'day' | 'month' | 'year', currentIndex: number): number => {
    if (field === 'day') {
      if (currentIndex === 1) return 0; // day[0]
    } else if (field === 'month') {
      if (currentIndex === 0) return 1; // day[1]
      if (currentIndex === 1) return 2; // month[0]
    } else if (field === 'year') {
      if (currentIndex === 0) return 3; // month[1]
      if (currentIndex > 0) return 4 + currentIndex - 1; // year[prev]
    }
    return -1;
  };

  const handleKeyDown = (field: 'day' | 'month' | 'year', index: number, e: React.KeyboardEvent) => {
    if (readOnly) return;
    
    switch (e.key) {
      case 'Backspace':
        e.preventDefault();
        const newValue = value[field].split('');
        if (newValue[index]) {
          newValue[index] = '';
        } else {
          // Move to previous input and clear it
          const prevIndex = getPrevInputIndex(field, index);
          if (prevIndex !== -1) {
            inputRefs.current[prevIndex]?.focus();
            // Clear the previous input
            if (prevIndex < 2) {
              const newDay = value.day.split('');
              newDay[prevIndex] = '';
              onChange({ ...value, day: newDay.join('') });
            } else if (prevIndex < 4) {
              const newMonth = value.month.split('');
              newMonth[prevIndex - 2] = '';
              onChange({ ...value, month: newMonth.join('') });
            } else {
              const newYear = value.year.split('');
              newYear[prevIndex - 4] = '';
              onChange({ ...value, year: newYear.join('') });
            }
          }
        }
        onChange({ ...value, [field]: newValue.join('') });
        break;
        
      case 'ArrowLeft':
        e.preventDefault();
        const leftIndex = getPrevInputIndex(field, index);
        if (leftIndex !== -1) {
          inputRefs.current[leftIndex]?.focus();
        }
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        const rightIndex = getNextInputIndex(field, index);
        if (rightIndex !== -1) {
          inputRefs.current[rightIndex]?.focus();
        }
        break;
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const numericText = pastedText.replace(/[^0-9]/g, '');
    
    if (numericText.length >= 8) {
      // Format as DDMMYYYY
      const day = numericText.slice(0, 2);
      const month = numericText.slice(2, 4);
      const year = numericText.slice(4, 8);
      
      onChange({ day, month, year });
      
      // Focus the last input
      inputRefs.current[7]?.focus();
    }
  };

  return (
    <>
      {/* Day - 2 boxes */}
      <div className="absolute" style={{ top: dayTop, left: dayLeft }}>
        <div className="flex">
          {Array.from({ length: 2 }, (_, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              maxLength={1}
              value={value.day[i] || ''}
              onChange={(e) => handleChange('day', e.target.value, i)}
              onKeyDown={(e) => handleKeyDown('day', i, e)}
              onPaste={handlePaste}
              className="border border-black text-center bg-white text-black"
              style={{
                width: 20,
                height: 25,
                marginRight: i < 1 ? 2 : 0,
                fontSize: '12px',
                padding: 0,
                color: 'black'
              }}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
      
      {/* First Separator - only if provided */}
      {separator1Top !== undefined && separator1Left !== undefined && (
        <span 
          className="absolute text-sm text-black" 
          style={{ top: separator1Top, left: separator1Left }}
        >
          /
        </span>
      )}
      
      {/* Month - 2 boxes */}
      <div className="absolute" style={{ top: monthTop, left: monthLeft }}>
        <div className="flex">
          {Array.from({ length: 2 }, (_, i) => (
            <input
              key={i + 2}
              ref={(el) => (inputRefs.current[i + 2] = el)}
              type="text"
              maxLength={1}
              value={value.month[i] || ''}
              onChange={(e) => handleChange('month', e.target.value, i)}
              onKeyDown={(e) => handleKeyDown('month', i, e)}
              onPaste={handlePaste}
              className="border border-black text-center bg-white text-black"
              style={{
                width: 20,
                height: 25,
                marginRight: i < 1 ? 2 : 0,
                fontSize: '12px',
                padding: 0,
                color: 'black'
              }}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
      
      {/* Second Separator - only if provided */}
      {separator2Top !== undefined && separator2Left !== undefined && (
        <span 
          className="absolute text-sm text-black" 
          style={{ top: separator2Top, left: separator2Left }}
        >
          /
        </span>
      )}
      
      {/* Year - 4 boxes */}
      <div className="absolute" style={{ top: yearTop, left: yearLeft }}>
        <div className="flex">
          {Array.from({ length: 4 }, (_, i) => (
            <input
              key={i + 4}
              ref={(el) => (inputRefs.current[i + 4] = el)}
              type="text"
              maxLength={1}
              value={value.year[i] || ''}
              onChange={(e) => handleChange('year', e.target.value, i)}
              onKeyDown={(e) => handleKeyDown('year', i, e)}
              onPaste={handlePaste}
              className="border border-black text-center bg-white text-black"
              style={{
                width: 20,
                height: 25,
                marginRight: i < 3 ? 2 : 0,
                fontSize: '12px',
                padding: 0,
                color: 'black'
              }}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
    </>
  );
};

interface SuperChoiceFormProps {
  initialData?: any;
  onDataChange?: (data: any) => void;
  readOnly?: boolean;
  showButtons?: boolean;
  onValidationChange?: (validationFn: () => { isValid: boolean; errors: string[] }) => void;
}

// Define the complete form data structure
export interface SuperChoiceFormData {
  // Section A - Your Details
  fullName: string;
  employeeNumber: string;
  tfn: string;
  fundChoice: 'existing' | 'default' | 'smsf' | '';
  
  // Section B - Existing Super Fund
  superFundName: string;
  superFundABN: string;
  superFundUSI: string;
  memberAccountNumber: string;
  accountName: string;
  hasComplianceLetter: boolean;
  sectionBSignature: string | null;
  sectionBDate: { day: string; month: string; year: string };
  
  // Section C - Default Super Fund
  businessName: string;
  businessABN: string;
  defaultSuperFundName: string;
  defaultSuperFundABN: string;
  defaultSuperFundUSI: string;
  chooseDefaultFund: boolean;
  sectionCSignature: string | null;
  sectionCDate: { day: string; month: string; year: string };
  
  // Section D - SMSF
  smsfName: string;
  smsfABN: string;
  smsfESA: string;
  smsfAccountName: string;
  bankAccountName: string;
  bsbCode: string;
  accountNumber: string;
  hasSMSFEvidence: boolean;
  sectionDSignature: string | null;
  sectionDDate: { day: string; month: string; year: string };
}

export default function SuperChoiceForm({
  initialData = {},
  onDataChange,
  readOnly = false,
  showButtons = true,
  onValidationChange
}: SuperChoiceFormProps = {}) {
  // Refs for all form fields to enable up/down navigation
  const fullNameRef = React.useRef<HTMLInputElement>(null);
  const employeeNumberRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const tfnRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  // Page 1 - Section A: Your details
  const [fullName, setFullName] = useState(initialData.fullName || "");
  const [employeeNumber, setEmployeeNumber] = useState(initialData.employeeNumber || "");
  const [tfn, setTfn] = useState(initialData.tfn || "");
  
  // Fund choice selection
  const [fundChoice, setFundChoice] = useState(initialData.fundChoice || "");
  
  // Page 2 - Section B: My existing super fund
  const [superFundName, setSuperFundName] = useState(initialData.superFundName || "");
  const [superFundABN, setSuperFundABN] = useState(initialData.superFundABN || "");
  const [superFundUSI, setSuperFundUSI] = useState(initialData.superFundUSI || "");
  const [memberAccountNumber, setMemberAccountNumber] = useState(initialData.memberAccountNumber || "");
  const [accountName, setAccountName] = useState(initialData.accountName || "");
  const [hasComplianceLetter, setHasComplianceLetter] = useState(initialData.hasComplianceLetter || false);
  const [sectionBSignature, setSectionBSignature] = useState<string | null>(initialData.sectionBSignature || null);
  const [sectionBDate, setSectionBDate] = useState(initialData.sectionBDate || { day: "", month: "", year: "" });
  
  // Page 3 - Section C: My employer's default super fund
  const [businessName, setBusinessName] = useState(initialData.businessName || "");
  const [businessABN, setBusinessABN] = useState(initialData.businessABN || "");
  const [defaultSuperFundName, setDefaultSuperFundName] = useState(initialData.defaultSuperFundName || "");
  const [defaultSuperFundABN, setDefaultSuperFundABN] = useState(initialData.defaultSuperFundABN || "");
  const [defaultSuperFundUSI, setDefaultSuperFundUSI] = useState(initialData.defaultSuperFundUSI || "");
  const [chooseDefaultFund, setChooseDefaultFund] = useState(initialData.chooseDefaultFund || false);
  const [sectionCSignature, setSectionCSignature] = useState<string | null>(initialData.sectionCSignature || null);
  const [sectionCDate, setSectionCDate] = useState(initialData.sectionCDate || { day: "", month: "", year: "" });
  
  // Page 4 - Section D: My private self-managed super fund (SMSF)
  const [smsfName, setSmsfName] = useState(initialData.smsfName || "");
  const [smsfABN, setSmsfABN] = useState(initialData.smsfABN || "");
  const [smsfESA, setSmsfESA] = useState(initialData.smsfESA || "");
  const [smsfAccountName, setSmsfAccountName] = useState(initialData.smsfAccountName || "");
  const [bankAccountName, setBankAccountName] = useState(initialData.bankAccountName || "");
  const [bsbCode, setBsbCode] = useState(initialData.bsbCode || "");
  const [accountNumber, setAccountNumber] = useState(initialData.accountNumber || "");
  const [hasSMSFEvidence, setHasSMSFEvidence] = useState(initialData.hasSMSFEvidence || false);
  const [sectionDSignature, setSectionDSignature] = useState<string | null>(initialData.sectionDSignature || null);
  const [sectionDDate, setSectionDDate] = useState(initialData.sectionDDate || { day: "", month: "", year: "" });

  // Remove page navigation - we'll show all pages in a scrollable view

  // Create comprehensive form data object with proper typing
  const getFormData = (): SuperChoiceFormData => ({
    // Section A - Your Details
    fullName,
    employeeNumber,
    tfn,
    fundChoice,
    
    // Section B - Existing Super Fund
    superFundName,
    superFundABN,
    superFundUSI,
    memberAccountNumber,
    accountName,
    hasComplianceLetter,
    sectionBSignature,
    sectionBDate,
    
    // Section C - Default Super Fund
    businessName,
    businessABN,
    defaultSuperFundName,
    defaultSuperFundABN,
    defaultSuperFundUSI,
    chooseDefaultFund,
    sectionCSignature,
    sectionCDate,
    
    // Section D - SMSF
    smsfName,
    smsfABN,
    smsfESA,
    smsfAccountName,
    bankAccountName,
    bsbCode,
    accountNumber,
    hasSMSFEvidence,
    sectionDSignature,
    sectionDDate
  });

  // Comprehensive validation function
  const validateForm = React.useCallback((): { isValid: boolean; errors: string[] } => {
    console.log('Form component: validateForm called with data:', { fullName, employeeNumber, tfn, fundChoice }); // Debug log
    const errors: string[] = [];

    // Section A - Your Details (Always required)
    const fullNameError = validateString(fullName, "Full Name");
    if (fullNameError) errors.push(fullNameError);

    const employeeNumberError = validateNumber(employeeNumber, "Employee Number", 16);
    if (employeeNumberError) errors.push(employeeNumberError);

    const tfnError = validateNumber(tfn, "Tax File Number (TFN)", 9);
    if (tfnError) errors.push(tfnError);

    if (!fundChoice) {
      errors.push("Please select a fund choice option - you must choose one of the three options");
    }

    // Section B - My existing super fund (Required if fundChoice === 'existing')
    if (fundChoice === 'existing') {
      const superFundNameError = validateString(superFundName, "Super Fund Name");
      if (superFundNameError) errors.push(superFundNameError);

      const superFundABNError = validateNumber(superFundABN, "Super Fund ABN", 11);
      if (superFundABNError) errors.push(superFundABNError);

      const superFundUSIError = validateNumber(superFundUSI, "Super Fund USI", 14);
      if (superFundUSIError) errors.push(superFundUSIError);

      const memberAccountNumberError = validateNumber(memberAccountNumber, "Member Account Number", 16);
      if (memberAccountNumberError) errors.push(memberAccountNumberError);

      const accountNameError = validateString(accountName, "Account Name");
      if (accountNameError) errors.push(accountNameError);

      const complianceLetterError = validateCheckbox(hasComplianceLetter, "Compliance Letter checkbox");
      if (complianceLetterError) errors.push(complianceLetterError);

      const sectionBSignatureError = validateSignature(sectionBSignature, "Section B Signature");
      if (sectionBSignatureError) errors.push(sectionBSignatureError);

      const sectionBDateError = validateDate(sectionBDate, "Section B Date");
      if (sectionBDateError) errors.push(sectionBDateError);
    }

    // Section C - My employer's default super fund (Required if fundChoice === 'default')
    if (fundChoice === 'default') {
      const businessNameError = validateString(businessName, "Business Name");
      if (businessNameError) errors.push(businessNameError);

      const businessABNError = validateNumber(businessABN, "Business ABN", 11);
      if (businessABNError) errors.push(businessABNError);

      const defaultSuperFundNameError = validateString(defaultSuperFundName, "Default Super Fund Name");
      if (defaultSuperFundNameError) errors.push(defaultSuperFundNameError);

      const defaultSuperFundABNError = validateNumber(defaultSuperFundABN, "Default Super Fund ABN", 11);
      if (defaultSuperFundABNError) errors.push(defaultSuperFundABNError);

      const defaultSuperFundUSIError = validateNumber(defaultSuperFundUSI, "Default Super Fund USI", 14);
      if (defaultSuperFundUSIError) errors.push(defaultSuperFundUSIError);

      const chooseDefaultFundError = validateCheckbox(chooseDefaultFund, "Choose Default Fund checkbox");
      if (chooseDefaultFundError) errors.push(chooseDefaultFundError);

      const sectionCSignatureError = validateSignature(sectionCSignature, "Section C Signature");
      if (sectionCSignatureError) errors.push(sectionCSignatureError);

      const sectionCDateError = validateDate(sectionCDate, "Section C Date");
      if (sectionCDateError) errors.push(sectionCDateError);
    }

    // Section D - My private self-managed super fund (SMSF) (Required if fundChoice === 'smsf')
    if (fundChoice === 'smsf') {
      const smsfNameError = validateString(smsfName, "SMSF Name");
      if (smsfNameError) errors.push(smsfNameError);

      const smsfABNError = validateNumber(smsfABN, "SMSF ABN", 11);
      if (smsfABNError) errors.push(smsfABNError);

      const smsfESAError = validateString(smsfESA, "SMSF Electronic Service Address");
      if (smsfESAError) errors.push(smsfESAError);

      const smsfAccountNameError = validateString(smsfAccountName, "SMSF Account Name");
      if (smsfAccountNameError) errors.push(smsfAccountNameError);

      const bankAccountNameError = validateString(bankAccountName, "Bank Account Name");
      if (bankAccountNameError) errors.push(bankAccountNameError);

      const bsbCodeError = validateNumber(bsbCode, "BSB Code", 6);
      if (bsbCodeError) errors.push(bsbCodeError);

      const accountNumberError = validateNumber(accountNumber, "Account Number", 10);
      if (accountNumberError) errors.push(accountNumberError);

      const smsfEvidenceError = validateCheckbox(hasSMSFEvidence, "SMSF Evidence checkbox");
      if (smsfEvidenceError) errors.push(smsfEvidenceError);

      const sectionDSignatureError = validateSignature(sectionDSignature, "Section D Signature");
      if (sectionDSignatureError) errors.push(sectionDSignatureError);

      const sectionDDateError = validateDate(sectionDDate, "Section D Date");
      if (sectionDDateError) errors.push(sectionDDateError);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [
    fullName, employeeNumber, tfn, fundChoice,
    superFundName, superFundABN, superFundUSI, memberAccountNumber, accountName, hasComplianceLetter, sectionBSignature, sectionBDate,
    businessName, businessABN, defaultSuperFundName, defaultSuperFundABN, defaultSuperFundUSI, chooseDefaultFund, sectionCSignature, sectionCDate,
    smsfName, smsfABN, smsfESA, smsfAccountName, bankAccountName, bsbCode, accountNumber, hasSMSFEvidence, sectionDSignature, sectionDDate
  ]);

  // Function to show validation errors as toast messages
  const showValidationErrors = (errors: string[]) => {
    errors.forEach((error, index) => {
      setTimeout(() => {
        toast.error(error, {
          duration: 4000,
          position: 'top-center',
        });
      }, index * 100); // Stagger the toasts
    });
  };

  // Expose validation function to parent component
  React.useEffect(() => {
    console.log('Form component: Exposing validation function to parent'); // Debug log
    console.log('Form component: Current form data:', { fullName, employeeNumber, tfn, fundChoice }); // Debug log
    onValidationChange?.(validateForm);
  }, [onValidationChange, validateForm]);

  // Notify parent component when any data changes
  React.useEffect(() => {
    const formData = getFormData();
    onDataChange?.(formData);
  }, [
    fullName, employeeNumber, tfn, fundChoice,
    superFundName, superFundABN, superFundUSI, memberAccountNumber, accountName, hasComplianceLetter, sectionBSignature, sectionBDate,
    businessName, businessABN, defaultSuperFundName, defaultSuperFundABN, defaultSuperFundUSI, chooseDefaultFund, sectionCSignature, sectionCDate,
    smsfName, smsfABN, smsfESA, smsfAccountName, bankAccountName, bsbCode, accountNumber, hasSMSFEvidence, sectionDSignature, sectionDDate
  ]);


  const renderPage1 = () => (
    <div className="relative">
      <Image
        src="/stafForms/super choice form-page1.jpg"
        alt="Superannuation Standard Choice Form - Page 1"
        width={800}
        height={1000}
        className="w-full h-auto"
      />
      
      {/* Section A: Your details */}
      <TextInput
        value={fullName}
        onChange={setFullName}
        top={598}
        left={462}
        width={398}
        readOnly={readOnly}
        stringsOnly={true}
        onDownArrow={() => employeeNumberRefs.current[0]?.focus()}
      />
      
      <CharacterInput
        value={employeeNumber}
        onChange={setEmployeeNumber}
        length={16}
        top={657}
        left={460}
        readOnly={readOnly}
        numbersOnly={true}
        onUpArrow={() => fullNameRef.current?.focus()}
        onDownArrow={() => tfnRefs.current[0]?.focus()}
        inputRefs={employeeNumberRefs}
      />
      
      <CharacterInput
        value={tfn}
        onChange={setTfn}
        length={9}
        top={715}
        left={462}
        gap={2}
        boxWidth={20}
        readOnly={readOnly}
        numbersOnly={true}
        onUpArrow={() => employeeNumberRefs.current[0]?.focus()}
        inputRefs={tfnRefs}
      />
      
      {/* Fund choice selection */}
      <div className="absolute" style={{ top: 892, left: 471 }}>
        <Checkbox
          checked={fundChoice === "existing"}
          onChange={(checked) => setFundChoice(checked ? "existing" : "")}
          top={0}
          left={5}
          width={25}
          height={29}
          readOnly={readOnly}
        />
        <Checkbox
          checked={fundChoice === "default"}
          onChange={(checked) => setFundChoice(checked ? "default" : "")}
          top={109}
          left={5}
          width={25}
          height={29}
          readOnly={readOnly}
        />
        <Checkbox
          checked={fundChoice === "smsf"}
          onChange={(checked) => setFundChoice(checked ? "smsf" : "")}
          top={219}
          left={5}
          width={25}
          height={29}
          readOnly={readOnly}
        />
      </div>
    </div>
  );

  const renderPage2 = () => (
    <div className="relative">
      <Image
        src="/stafForms/super choice form-page2.jpg"
        alt="Superannuation Standard Choice Form - Page 2"
        width={800}
        height={1000}
        className="w-full h-auto"
      />
      
      {/* Section B: My existing super fund */}
      <TextInput
        value={superFundName}
        onChange={setSuperFundName}
        top={248}
        left={40}
        width={814}
        height={25}
        readOnly={readOnly}
      />
      
      <CharacterInput
        value={superFundABN}
        onChange={setSuperFundABN}
        length={11}
        top={306}
        left={44}
        gap={2}
        boxWidth={20}
        boxHeight={25}
        readOnly={readOnly}
      />
      
      <CharacterInput
        value={superFundUSI}
        onChange={setSuperFundUSI}
        length={14}
        top={364}
        left={41}
        gap={2}
        boxWidth={20}
        boxHeight={25}
        readOnly={readOnly}
      />
      
      <CharacterInput
        value={memberAccountNumber}
        onChange={setMemberAccountNumber}
        length={16}
        top={472}
        left={42}
        readOnly={readOnly}
      />
      
      <TextInput
        value={accountName}
        onChange={setAccountName}
        top={579}
        left={44}
        width={810}
        height={25}
        readOnly={readOnly}
      />
      
      <Checkbox
        checked={hasComplianceLetter}
        onChange={setHasComplianceLetter}
        top={769}
        left={38}
        width={26}
        height={29}
        readOnly={readOnly}
      />
      
      <OverlaySignatureBox
        value={sectionBSignature}
        onChange={setSectionBSignature}
        top={913}
        left={45}
        width={544}
        height={76}
        label=""
      />
      
      <DateInput
        value={sectionBDate}
        onChange={setSectionBDate}
        dayTop={965}
        dayLeft={640}
        monthTop={965}
        monthLeft={708}
        yearTop={965}
        yearLeft={771}
        readOnly={readOnly}
      />
    </div>
  );

  const renderPage3 = () => (
    <div className="relative">
      <Image
        src="/stafForms/super choice form-page3.jpg"
        alt="Superannuation Standard Choice Form - Page 3"
        width={800}
        height={1000}
        className="w-full h-auto"
      />
      
      {/* Section C: My employer's default super fund */}
      <TextInput
        value={businessName}
        onChange={setBusinessName}
        top={246}
        left={70}
        width={756}
        readOnly={readOnly}
      />
      
      <CharacterInput
        value={businessABN}
        onChange={setBusinessABN}
        length={11}
        top={303}
        left={71}
        readOnly={readOnly}
      />
      
      <TextInput
        value={defaultSuperFundName}
        onChange={setDefaultSuperFundName}
        top={362}
        left={71}
        width={756}
        readOnly={readOnly}
      />
      
      <CharacterInput
        value={defaultSuperFundABN}
        onChange={setDefaultSuperFundABN}
        length={11}
        top={419}
        left={71}
        readOnly={readOnly}
      />
      
      <CharacterInput
        value={defaultSuperFundUSI}
        onChange={setDefaultSuperFundUSI}
        length={14}
        top={477}
        left={71}
        readOnly={readOnly}
      />
      
      <Checkbox
        checked={chooseDefaultFund}
        onChange={setChooseDefaultFund}
        top={679}
        left={40}
        width={26}
        height={29}
        readOnly={readOnly}
      />
      
      <OverlaySignatureBox
        value={sectionCSignature}
        onChange={setSectionCSignature}
        top={737}
        left={40}
        width={550}
        height={80}
        label=""
      />
      
      <DateInput
        value={sectionCDate}
        onChange={setSectionCDate}
        dayTop={792}
        dayLeft={639}
        monthTop={792}
        monthLeft={706}
        yearTop={792}
        yearLeft={770}
        readOnly={readOnly}
      />
    </div>
  );

  const renderPage4 = () => (
    <div className="relative">
      <Image
        src="/stafForms/super choice form-page4.jpg"
        alt="Superannuation Standard Choice Form - Page 4"
        width={800}
        height={1000}
        className="w-full h-auto"
      />
      
      {/* Section D: My private self-managed super fund (SMSF) */}
      <TextInput
        value={smsfName}
        onChange={setSmsfName}
        top={145}
        left={42}
        width={812}
        readOnly={readOnly}
      />
      
      <CharacterInput
        value={smsfABN}
        onChange={setSmsfABN}
        length={11}
        top={202}
        left={42}
        readOnly={readOnly}
      />
      
      <TextInput
        value={smsfESA}
        onChange={setSmsfESA}
        top={260}
        left={42}
        width={812}
        readOnly={readOnly}
      />
      
      <TextInput
        value={smsfAccountName}
        onChange={setSmsfAccountName}
        top={365}
        left={42}
        width={812}
        readOnly={readOnly}
      />
      
      <TextInput
        value={bankAccountName}
        onChange={setBankAccountName}
        top={485}
        left={42}
        width={812}
        readOnly={readOnly}
      />
      
      <CharacterInput
        value={bsbCode}
        onChange={setBsbCode}
        length={6}
        top={543}
        left={42}
        readOnly={readOnly}
      />
      
      <CharacterInput
        value={accountNumber}
        onChange={setAccountNumber}
        length={10}
        top={601}
        left={42}
        readOnly={readOnly}
      />
      
      <Checkbox
        checked={hasSMSFEvidence}
        onChange={setHasSMSFEvidence}
        top={688}
        left={40}
         width={24}
        height={80}
        readOnly={readOnly}
      />
      
      <OverlaySignatureBox
        value={sectionDSignature}
        onChange={setSectionDSignature}
        top={820}
        left={40}
        width={550}
        height={80}
        label=""
      />
      
      <DateInput
        value={sectionDDate}
        onChange={setSectionDDate}
        dayTop={873}
        dayLeft={640}
        monthTop={873}
        monthLeft={708}
        yearTop={873}
        yearLeft={770}
        readOnly={readOnly}
      />
    </div>
  );

  const renderPage5 = () => (
    <div className="relative">
      <Image
        src="/stafForms/super choice form-page5.jpg"
        alt="Superannuation Standard Choice Form - Page 5"
        width={800}
        height={1000}
        className="w-full h-auto"
      />
    </div>
  );

  // Removed renderCurrentPage - now showing all pages in scrollable view

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Scrollable Form Container */}
      <div className="space-y-8">
        {/* Page 1 - Section A: Your details */}
        <div className="border-b pb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">Page 1 - Section A: Your details</h2>
          {renderPage1()}
        </div>

        {/* Page 2 - Section B: My existing super fund */}
        <div className="border-b pb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">Page 2 - Section B: My existing super fund</h2>
          {renderPage2()}
        </div>

        {/* Page 3 - Section C: My employer's default super fund */}
        <div className="border-b pb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">Page 3 - Section C: My employer's default super fund</h2>
          {renderPage3()}
        </div>

        {/* Page 4 - Section D: My private self-managed super fund (SMSF) */}
        <div className="border-b pb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">Page 4 - Section D: My private self-managed super fund (SMSF)</h2>
          {renderPage4()}
        </div>

        {/* Page 5 - Final page */}
        <div className="pb-8">
          <h2 className="text-xl font-semibold mb-4 text-center">Page 5 - Final</h2>
          {renderPage5()}
        </div>
      </div>

      {/* Action Buttons */}
      {showButtons && (
        <div className="flex gap-4 mt-8 justify-center sticky bottom-4 bg-white p-4 rounded-lg shadow-lg">
          <button className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
            Save Draft
          </button>
          <button className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Submit Form
          </button>
        </div>
      )}
    </div>
  );
}
