"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import OverlaySignatureBox from "../tax/OverlaySignaturePad";

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
  inputRefs
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
}) => {
  const localRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const refs = inputRefs || localRefs;

  const handleChange = (index: number, char: string) => {
    if (readOnly) return;
    const newValue = value.padEnd(length, ' ').split('');
    newValue[index] = char;
    onChange(newValue.join('').trimEnd());
    
    // Auto-focus next input if character is entered
    if (char && index < length - 1) {
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
  onDownArrow
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
}) => {
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
      onChange={(e) => onChange(e.target.value)}
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
  const handleChange = (field: 'day' | 'month' | 'year', val: string) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <>
      {/* Day - 2 boxes */}
      <div className="absolute" style={{ top: dayTop, left: dayLeft }}>
        <div className="flex">
          {Array.from({ length: 2 }, (_, i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              value={value.day[i] || ''}
              onChange={(e) => {
                const newDay = value.day.split('');
                newDay[i] = e.target.value;
                handleChange('day', newDay.join(''));
              }}
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
              key={i}
              type="text"
              maxLength={1}
              value={value.month[i] || ''}
              onChange={(e) => {
                const newMonth = value.month.split('');
                newMonth[i] = e.target.value;
                handleChange('month', newMonth.join(''));
              }}
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
              key={i}
              type="text"
              maxLength={1}
              value={value.year[i] || ''}
              onChange={(e) => {
                const newYear = value.year.split('');
                newYear[i] = e.target.value;
                handleChange('year', newYear.join(''));
              }}
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
}

export default function SuperChoiceForm({
  initialData = {},
  onDataChange,
  readOnly = false,
  showButtons = true
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

  const getFormData = () => ({
    fullName,
    employeeNumber,
    tfn,
    fundChoice,
    superFundName,
    superFundABN,
    superFundUSI,
    memberAccountNumber,
    accountName,
    hasComplianceLetter,
    sectionBSignature,
    sectionBDate,
    businessName,
    businessABN,
    defaultSuperFundName,
    defaultSuperFundABN,
    defaultSuperFundUSI,
    chooseDefaultFund,
    sectionCSignature,
    sectionCDate,
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

  useEffect(() => {
    if (onDataChange) {
      onDataChange(getFormData());
    }
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
        onDownArrow={() => employeeNumberRefs.current[0]?.focus()}
      />
      
      <CharacterInput
        value={employeeNumber}
        onChange={setEmployeeNumber}
        length={16}
        top={657}
        left={460}
        readOnly={readOnly}
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
