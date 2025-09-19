"use client";

import { set } from "date-fns";
import React from "react";
import { useEffect, useRef, useState, useCallback } from "react";
import OverlaySignatureBox from "./OverlaySignaturePad";

// ✅ Character-box overlay input
interface OverlayCharInputProps {
  top: number;
  left: number;
  length: number; // number of boxes
  gap?: number; // spacing between boxes
  boxWidth?: number; // fixed width per box
  boxHeight?: number; // fixed height per box
  totalWidth?: number; // auto-fit width for all boxes combined
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

function OverlayCharInput({
  top,
  left,
  length,
  gap = 8,
  boxWidth,
  boxHeight = 40,
  totalWidth,
  value,
  onChange,
  readOnly = false,
}: OverlayCharInputProps) {
  const [values, setValues] = useState<string[]>(() =>
    Array.from({ length }, (_, i) => value[i] || "")
  );
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    setValues(Array.from({ length }, (_, i) => value[i] || ""));
  }, [value, length]);

  const effectiveBoxWidth = totalWidth
    ? Math.floor(totalWidth / length)
    : boxWidth || 32;

  const handleChange = (val: string, idx: number) => {
    const newValues = [...values];
    newValues[idx] = val.slice(-1);
    setValues(newValues);
    onChange(newValues.join("")); // Call onChange directly when user changes input
    if (val && idx < length - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !values[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  return (
    <div className="absolute flex" style={{ top, left, gap: totalWidth ? 0 : gap }}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          type="text"
          maxLength={1}
          value={values[i]}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="char-input border border-gray-400 text-center text-sm"
          style={{ width: effectiveBoxWidth, height: boxHeight }}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}

// ✅ Checkbox overlay
interface OverlayCheckboxProps {
  top: number;
  left: number;
  label?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  boxWidth?: number;
  boxHeight?: number;
  readOnly?: boolean;
}

function OverlayCheckbox({
  top,
  left,
  label,
  checked,
  onChange,
  boxWidth = 16,
  boxHeight = 16,
  readOnly = false,
}: OverlayCheckboxProps) {
  return (
    <label className="absolute flex items-center space-x-2 text-sm" style={{ top, left }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="border border-gray-400"
        style={{
          transform: `scale(${boxWidth / 16})`, // scales relative to default
          transformOrigin: "top left",
        }}
        readOnly={readOnly}
        disabled={readOnly}
      />
      {label && <span>{label}</span>}
    </label>
  );
}




interface OverlayDateCharInputProps {
  dayTop: number;
  dayLeft: number;
  monthTop: number;
  monthLeft: number;
  yearTop: number;
  yearLeft: number;
  boxWidth?: number;
  boxHeight?: number;
  value: string; // format: DD/MM/YYYY
  onChange: (val: string) => void;
  readOnly?: boolean;
}

function OverlayDateCharInput({
  dayTop,
  dayLeft,
  monthTop,
  monthLeft,
  yearTop,
  yearLeft,
  boxWidth = 28,
  boxHeight = 28,
  value,
  onChange,
  readOnly = false,
}: OverlayDateCharInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.replace(/\D/g, "").padEnd(8, "");
  const [day, month, year] = [
    digits.slice(0, 2),
    digits.slice(2, 4),
    digits.slice(4, 8),
  ];
  const [values, setValues] = useState([day, month, year]);

  useEffect(() => {
    const d = value.replace(/\D/g, "").padEnd(8, "");
    setValues([d.slice(0, 2), d.slice(2, 4), d.slice(4, 8)]);
  }, [value]);

  const handleChange = (val: string, section: number, idx: number) => {
    const updated = [...values];
    const sectionLen = section === 2 ? 4 : 2;
    let chars = updated[section].split("");
    chars[idx] = val.slice(-1);
    updated[section] = chars.join("").slice(0, sectionLen);
    setValues(updated);
    onChange(`${updated[0]}/${updated[1]}/${updated[2]}`);

    // auto focus next box
    const globalIndex = section === 0 ? idx : section === 1 ? 2 + idx : 4 + idx;
    if (val && inputsRef.current[globalIndex + 1]) {
      inputsRef.current[globalIndex + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    section: number,
    idx: number
  ) => {
    if (e.key === "Backspace") {
      const globalIndex =
        section === 0 ? idx : section === 1 ? 2 + idx : 4 + idx;
      if (!values[section][idx] && globalIndex > 0) {
        inputsRef.current[globalIndex - 1]?.focus();
      }
    }
  };

  const renderBoxes = (count: number, section: number, prefill: string, startIndex: number) =>
    Array.from({ length: count }).map((_, i) => {
      const globalIndex = startIndex + i;
      return (
        <input
          key={`${section}-${i}`}
          ref={(el) => (inputsRef.current[globalIndex] = el)}
          type="text"
          maxLength={1}
          value={prefill[i] || ""}
          onChange={(e) => handleChange(e.target.value, section, i)}
          onKeyDown={(e) => handleKeyDown(e, section, i)}
          className="border border-gray-400 text-center text-sm"
          style={{ width: boxWidth, height: boxHeight }}
          readOnly={readOnly}
        />
      );
    });

  return (
    <>
      {/* Day */}
      <div className="absolute flex" style={{ top: dayTop, left: dayLeft }}>
        {renderBoxes(2, 0, values[0], 0)}
      </div>

      {/* Month */}
      <div className="absolute flex" style={{ top: monthTop, left: monthLeft }}>
        {renderBoxes(2, 1, values[1], 2)}
      </div>

      {/* Year */}
      <div className="absolute flex" style={{ top: yearTop, left: yearLeft }}>
        {renderBoxes(4, 2, values[2], 4)}
      </div>
    </>
  );
}



interface OverlayMultiRowCharInputProps {
  top: number;
  left: number;
  rows: number;         // number of rows (e.g., 2)
  cols: number;         // max characters per row (e.g., 19)
  gap?: number;         // gap between boxes in a row
  rowGap?: number;      // gap between rows
  boxWidth?: number;
  boxHeight?: number;
  value: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
}

function OverlayMultiRowCharInput({
  top,
  left,
  rows,
  cols,
  gap = 1,
  rowGap = 2,
  boxWidth = 28,
  boxHeight = 28,
  value,
  onChange,
  readOnly = false,
}: OverlayMultiRowCharInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const maxChars = rows * cols;

  const normalize = (str: string) => {
    const arr = str.slice(0, maxChars).split("");
    while (arr.length < maxChars) arr.push(""); // ensure each slot is ""
    return arr;
  };

  const [chars, setChars] = useState<string[]>(normalize(value));

  useEffect(() => {
    setChars(normalize(value));
  }, [value]);

  const handleChange = (val: string, index: number) => {
    const newChars = [...chars];
    newChars[index] = val.slice(-1);
    setChars(newChars);
    onChange(newChars.join("").trimEnd());

    if (val && index < maxChars - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !chars[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div className="absolute" style={{ top, left }}>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex"
          style={{ marginBottom: rowIdx < rows - 1 ? rowGap : 0 }}
        >
          {Array.from({ length: cols }).map((_, colIdx) => {
            const idx = rowIdx * cols + colIdx;
            return (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                type="text"
                maxLength={1}
                value={chars[idx]}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className="border border-gray-400 text-center text-sm"
                style={{ width: boxWidth, height: boxHeight, marginRight: gap }}
                readOnly={readOnly}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}




function OverlayGroupedCharInput({
  groups,
  boxWidth = 28,
  boxHeight = 28,
  value,
  onChange,
  readOnly = false,
}: any) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const totalLength = groups.reduce((acc, g) => acc + g.length, 0);

  const normalize = (str: string) => {
    const arr = str.slice(0, totalLength).split("");
    while (arr.length < totalLength) arr.push("");
    return arr;
  };

  const [chars, setChars] = useState<string[]>(normalize(value));

  useEffect(() => {
    setChars(normalize(value));
  }, [value]);

  const handleChange = (val: string, index: number) => {
    const newChars = [...chars];
    newChars[index] = val.slice(-1);
    setChars(newChars);
    onChange(newChars.join("").trimEnd());

    if (val && index < totalLength - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !chars[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  let currentIndex = 0;

  return (
    <>
      {groups.map((group, gIdx) => {
        const boxes = Array.from({ length: group.length }).map((_, i) => {
          const idx = currentIndex + i;
          return (
            <input
              key={`${gIdx}-${i}`}
              ref={(el) => (inputsRef.current[idx] = el)}
              type="text"
              maxLength={1}
              value={chars[idx]}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="border border-gray-400 text-center text-sm absolute"
              style={{
                top: group.top,
                left: group.left + i * (boxWidth + 2), // offset horizontally
                width: boxWidth,
                height: boxHeight,
              }}
              readOnly={readOnly}
            />
          );
        });
        currentIndex += group.length;
        return <React.Fragment key={gIdx}>{boxes}</React.Fragment>;
      })}
    </>
  );
}

interface OverlaySquareRadioGroupProps {
  options: { label: string; value: string; top: number; left: number }[];
  name: string; // radio group name
  value: string;
  onChange: (val: string) => void;
  boxSize?: number;
  readOnly?: boolean;
}

function OverlaySquareRadioGroup({
  options,
  name,
  value,
  onChange,
  boxSize = 18,
  readOnly = false,
}: OverlaySquareRadioGroupProps) {
  return (
    <>
      {options.map((opt, idx) => (
        <label
          key={idx}
          className="absolute flex items-center space-x-1 text-sm"
          style={{ top: opt.top, left: opt.left }}
        >
          <div
            className={`flex items-center justify-center border border-gray-600 cursor-pointer`}
            style={{
              width: boxSize,
              height: boxSize,
              backgroundColor: value === opt.value ? "#2563eb20" : "white", // light blue background if selected
            }}
            onClick={() => !readOnly && onChange(opt.value)}
          >
            {value === opt.value && (
              <span className="text-black text-xs font-bold">✔</span>
            )}
          </div>
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="hidden"
            readOnly={readOnly}
            disabled={readOnly}
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </>
  );
}


interface OverlaySquareRadioGroupProps {
  options: { label: string; value: string; top: number; left: number }[];
  name: string; // radio group name
  value: string;
  onChange: (val: string) => void;
  boxSize?: number;
  tickColor?: string;
  readOnly?: boolean;
}

function OverlaySquareRadioGroupFour({
  options,
  name,
  value,
  onChange,
  boxSize = 18,
  tickColor = "black",
  readOnly = false,
}: OverlaySquareRadioGroupProps) {
  return (
    <>
      {options.map((opt, idx) => (
        <label
          key={idx}
          className="absolute flex items-center space-x-1 text-sm cursor-pointer"
          style={{ top: opt.top, left: opt.left }}
          onClick={() => onChange(opt.value)}
        >
          <div
            className="flex items-center justify-center border border-gray-600"
            style={{
              width: boxSize,
              height: boxSize,
              backgroundColor: value === opt.value ? "#2563eb20" : "white", // light blue bg when selected
            }}
          >
            {value === opt.value && (
              <span
                className="text-xs font-bold"
                style={{ color: tickColor }}
              >
                ✔
              </span>
            )}
          </div>
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
            className="hidden"
            readOnly={readOnly}
            disabled={readOnly}
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </>
  );
}







// ✅ Main Form
interface TFNOverlayFormProps {
  initialData?: any;
  onDataChange?: (data: any) => void;
  readOnly?: boolean;
  showButtons?: boolean;
}

export default function TFNOverlayForm({ 
  initialData = {}, 
  onDataChange, 
  readOnly = false, 
  showButtons = true 
}: TFNOverlayFormProps = {}) {
  const [tfn, setTfn] = useState(initialData.tfn || "");
  const [surname, setSurname] = useState(initialData.surname || "");
  const [firstName, setFirstName] = useState(initialData.firstName || "");
  const [otherName, setOtherName] = useState(initialData.otherName || "");
  const [anotherName, setAnotherName] = useState(initialData.anotherName || "");

  const [town, setTown] = useState(initialData.town || "");
  const [state, setState] = useState(initialData.state || "");
  const [postcode, setPostcode] = useState(initialData.postcode || "");

  const [check1, setCheck1] = useState(initialData.check1 || false);
  const [check2, setCheck2] = useState(initialData.check2 || false);
  const [check3, setCheck3] = useState(initialData.check3 || false);
  const [check4, setCheck4] = useState(initialData.check4 || false);
  const [check5, setCheck5] = useState(initialData.check5 || false);
  const [check6, setCheck6] = useState(initialData.check6 || false);
  const [check7, setCheck7] = useState(initialData.check7 || false);
  const [check8, setCheck8] = useState(initialData.check8 || false);
  const [subscribe, setSubscribe] = useState(initialData.subscribe || false);

  const [dob, setDob] = useState(initialData.dob || "");
  const [address, setAddress] = useState(initialData.address || "");

  const [abnno, setAbnNo] = useState(initialData.abnno || "");
  const [branchNo, setBranchNo] = useState(initialData.branchNo || "");
  const [haveAbn, setHaveAbn] = useState(initialData.haveAbn || "");
  const [legalName, setLegalName] = useState(initialData.legalName || "");

  const [payerSignatureAt, setPayerSignatureAt] = useState(initialData.payerSignatureAt || "");
  const [payeeSignatureAt, setPayeeSignatureAt] = useState(initialData.payeeSignatureAt || "");

  const [austrailanResident, setAustrailanResident] = useState(initialData.austrailanResident || "");
  const [claimTaxFree, setClaimTaxFree] = useState(initialData.claimTaxFree || "");
  const [seniorPensioner, setSeniorPensioner] = useState(initialData.seniorPensioner || "");
  const [overseasForces, setOverseasForces] = useState(initialData.overseasForces || "");
  const [tsldebt, setTsldebt] = useState(initialData.tsldebt || "");
  const [financialDebt, setFinancialDebt] = useState(initialData.financialDebt || "");

  const [bussinessAddress, setBussinessAddress] = useState(initialData.bussinessAddress || "");
  const [bussinessTown, setBussinessTown] = useState(initialData.bussinessTown || "");
  const [bussinessState, setBussinessState] = useState(initialData.bussinessState || "");
  const [bussinessPostcode, setBussinessPostcode] = useState(initialData.bussinessPostcode || "");
  const [contactPerson, setContactPerson] = useState(initialData.contactPerson || "");
  const [bussinessPhoneNo, setBussinessPhoneNo] = useState(initialData.bussinessPhoneNo || "");
  const [selectedOption, setSelectedOption] = useState(initialData.selectedOption || "");

  const [payerSignature, setPayerSignature] = useState<string | null>(initialData.payerSignature || null);
  const [payeeSignature, setPayeeSignature] = useState<string | null>(initialData.payeeSignature || null);

  // Function to get current form data
  const getFormData = useCallback(() => ({
    tfn, surname, firstName, otherName, anotherName, town, state, postcode,
    check1, check2, check3, check4, check5, check6, check7, check8, subscribe,
    dob, address, abnno, branchNo, haveAbn, legalName, payerSignatureAt, payeeSignatureAt,
    austrailanResident, claimTaxFree, seniorPensioner, overseasForces, tsldebt,
    financialDebt, bussinessAddress, bussinessTown, bussinessState, bussinessPostcode,
    contactPerson, bussinessPhoneNo, selectedOption, payerSignature, payeeSignature
  }), [tfn, surname, firstName, otherName, anotherName, town, state, postcode,
      check1, check2, check3, check4, check5, check6, check7, check8, subscribe,
      dob, address, abnno, branchNo, haveAbn, legalName, payerSignatureAt, payeeSignatureAt,
      austrailanResident, claimTaxFree, seniorPensioner, overseasForces, tsldebt,
      financialDebt, bussinessAddress, bussinessTown, bussinessState, bussinessPostcode,
      contactPerson, bussinessPhoneNo, selectedOption, payerSignature, payeeSignature]);

  // Notify parent component when data changes
  useEffect(() => {
    if (onDataChange) {
      onDataChange(getFormData());
    }
  }, [onDataChange, getFormData]);

  const handleSave = () => {
    const formData = {
      tfn,
      surname,
      firstName,
      otherName,
      anotherName,
      town,
      state,
      postcode,
      check1,
      check2,
      check3,
      check4,
      check5,
      check6,
      check7,
      check8,
      subscribe,
      dob,
      address,
      abnno,
      branchNo,
      haveAbn,
      legalName,
      payerSignatureAt,
      payeeSignatureAt,
      austrailanResident,
      claimTaxFree,
      seniorPensioner,
      overseasForces,
      tsldebt,
      financialDebt,
      bussinessAddress,
      bussinessTown,
      bussinessState,
      bussinessPostcode,
      contactPerson,
      bussinessPhoneNo,
      selectedOption,
      payerSignature,
      payeeSignature,
    };

    console.log("✅ Saved Form Data:", formData);
    alert("Form data logged in console ✅");

  }

  const handleClear = () => {
  setTfn("");
  setSurname("");
  setFirstName("");
  setOtherName("");
  setAnotherName("");
  setTown("");
  setState("");
  setPostcode("");
  setCheck1(false);
  setCheck2(false);
  setCheck3(false);
  setCheck4(false);
  setCheck5(false);
  setCheck6(false);
  setCheck7(false);
  setCheck8(false);
  setSubscribe(false);
  setDob("");
  setAddress("");
  setAbnNo("");
  setBranchNo("");
  setHaveAbn("");
  setLegalName("");
  setPayerSignatureAt("");
  setPayeeSignatureAt("");
  setAustrailanResident("");
  setClaimTaxFree("");
  setSeniorPensioner("");
  setOverseasForces("");
  setTsldebt("");
  setFinancialDebt("");
  setBussinessAddress("");
  setBussinessTown("");
  setBussinessState("");
  setBussinessPostcode("");
  setContactPerson("");
  setBussinessPhoneNo("");
  setSelectedOption("");
  setPayerSignature(null);
  setPayeeSignature(null);

  alert("Form cleared ✅");
};
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const formData = {
        tfn, surname, firstName, otherName, anotherName, town, state, postcode,
        check1, check2, check3, check4, check5, check6, check7, check8,
        subscribe, dob, address, abnno, branchNo, haveAbn, legalName,
        payerSignatureAt, payeeSignatureAt, austrailanResident, claimTaxFree,
        seniorPensioner, overseasForces, tsldebt, financialDebt,
        bussinessAddress, bussinessTown, bussinessState, bussinessPostcode,
        contactPerson, bussinessPhoneNo, selectedOption,
        payerSignature, payeeSignature
      };

      const response = await fetch('/api/generate-pdf/tax-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('PDF generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax-form-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="relative w-[800px] h-[1100px] mx-auto border shadow">
      <img src="/tax-3img.jpg" className="absolute inset-0 w-full h-full" alt="Form" />

      {/* 🔹 TFN */}
      <OverlayCharInput top={120} left={147} length={9} totalWidth={250} boxHeight={25} value={tfn} onChange={setTfn} readOnly={readOnly} />

      <OverlayCheckbox top={153} left={372} checked={check1} onChange={setCheck1} boxWidth={30} boxHeight={30} readOnly={readOnly} />
      <OverlayCheckbox top={185} left={372} checked={check2} onChange={setCheck2} boxWidth={30} boxHeight={30} readOnly={readOnly} />
      <OverlayCheckbox top={216} left={372} checked={check3} onChange={setCheck3} boxWidth={30} boxHeight={30} readOnly={readOnly} />


      <OverlayCheckbox top={250} left={200} checked={check4} onChange={setCheck4}  boxWidth={30} boxHeight={30} readOnly={readOnly} />
      <OverlayCheckbox top={250} left={255} checked={check5} onChange={setCheck5}  boxWidth={30} boxHeight={30} readOnly={readOnly} />
      <OverlayCheckbox top={250} left={315} checked={check6} onChange={setCheck6} boxWidth={30} boxHeight={30} readOnly={readOnly} />
      <OverlayCheckbox top={250} left={372} checked={check7} onChange={setCheck7} boxWidth={30} boxHeight={30} readOnly={readOnly} />

      
      <OverlayCharInput top={283} left={30} length={19} totalWidth={370} boxHeight={25} value={surname} onChange={setSurname} readOnly={readOnly} />

      <OverlayCharInput top={320} left={30} length={19} totalWidth={370} boxHeight={25} value={firstName} onChange={setFirstName} readOnly={readOnly} />
      <OverlayCharInput top={355} left={30} length={19} totalWidth={370} boxHeight={25} value={otherName} onChange={setOtherName} readOnly={readOnly} />
      <OverlayCharInput top={415} left={30} length={19} totalWidth={370} boxHeight={25} value={anotherName} onChange={setAnotherName} readOnly={readOnly} />

    {/* DOB */}
    <OverlayDateCharInput
  dayTop={455}
  dayLeft={215}
  monthTop={455}
  monthLeft={265}
  yearTop={455}
  yearLeft={315}
  boxWidth={20}
  boxHeight={28}
  value={dob}
  onChange={setDob}
  readOnly={readOnly}
/>

<OverlayMultiRowCharInput
  top={503}
  left={30}
  rows={2}
  cols={19}
  boxWidth={18}
  boxHeight={28}
  value={address}
  onChange={setAddress}
  readOnly={readOnly}
/>


      <OverlayCharInput top={570} left={30} length={19} totalWidth={370} boxHeight={25} value={town} onChange={setTown} readOnly={readOnly} />
      <OverlayCharInput top={605} left={30} length={3} totalWidth={70} boxHeight={25} value={state} onChange={setState} readOnly={readOnly} />
      <OverlayCharInput top={605} left={125} length={4} totalWidth={77} boxHeight={25} value={postcode} onChange={setPostcode} readOnly={readOnly} />


            <OverlayCharInput top={708} left={320} length={3} totalWidth={70} boxHeight={25} value={branchNo} onChange={setBranchNo} readOnly={readOnly} />

          <OverlayGroupedCharInput
  groups={[
    { top: 708, left: 30, length: 2 },   // 2 boxes
    { top: 708, left: 80, length: 3 },  // 3 boxes
    { top: 708, left: 155, length: 3 },  // 3 boxes
    { top: 708, left: 230, length: 3 },  // 3 boxes
  ]}
  boxWidth={23}
  boxHeight={28}
  value={abnno}
  onChange={setAbnNo}
  readOnly={readOnly}
/>

<OverlaySquareRadioGroup
  name="yesNoChoice"
  value={haveAbn}
  onChange={setHaveAbn}
  options={[
    { label: "", value: "yes", top: 768, left: 50 },
    { label: "", value: "no", top: 768, left: 100 },
  ]}
  boxSize={20}
  readOnly={readOnly}
/>


<OverlayMultiRowCharInput
  top={828}
  left={30}
  rows={3}
  cols={19}
  boxWidth={18}
  boxHeight={28}
  value={legalName}
  onChange={setLegalName}
  readOnly={readOnly}
/>


 <OverlayDateCharInput
  dayTop={970}
  dayLeft={215}
  monthTop={970}
  monthLeft={265}
  yearTop={970}
  yearLeft={315}
  boxWidth={20}
  boxHeight={28}
  value={payerSignatureAt}
  onChange={setPayerSignatureAt}

/>


<OverlaySquareRadioGroup
  name="yesNoChoice"
  value={austrailanResident}
  onChange={setAustrailanResident}
  options={[
    { label: "", value: "yes", top: 165, left: 717 },
    { label: "", value: "no", top: 165, left: 765 },
  ]}
  boxSize={20}
/>


<OverlaySquareRadioGroup
  name="yesNoChoice"
  value={claimTaxFree}
  onChange={setClaimTaxFree}
  options={[
    { label: "", value: "yes", top: 255, left: 440 },
    { label: "", value: "no", top: 255, left: 493 },
  ]}
  boxSize={21}
/>

<OverlaySquareRadioGroup
  name="yesNoChoice"
  value={seniorPensioner}
  onChange={setSeniorPensioner}
  options={[
    { label: "", value: "yes", top: 321, left: 442 },
    { label: "", value: "no", top: 321, left: 765 },
  ]}
  boxSize={22}
/>

<OverlaySquareRadioGroup
  name="yesNoChoice"
  value={overseasForces}
  onChange={setOverseasForces}
  options={[
    { label: "", value: "yes", top: 390, left: 442 },
    { label: "", value: "no", top: 390, left: 765 },
  ]}
  boxSize={22}
/>

<OverlaySquareRadioGroup
  name="yesNoChoice"
  value={tsldebt}
  onChange={setTsldebt}
  options={[
    { label: "", value: "yes", top: 451, left: 442 },
    { label: "", value: "no", top: 451, left: 765 },
  ]}
  boxSize={22}
/>

<OverlaySquareRadioGroup
  name="yesNoChoice"
  value={tsldebt}
  onChange={setTsldebt}
  options={[
    { label: "", value: "yes", top: 451, left: 442 },
    { label: "", value: "no", top: 451, left: 765 },
  ]}
  boxSize={22}
/>

<OverlaySquareRadioGroup
  name="yesNoChoice"
  value={financialDebt}
  onChange={setFinancialDebt}
  options={[
    { label: "", value: "yes", top: 495, left: 442 },
    { label: "", value: "no", top: 495, left: 765 },
  ]}
  boxSize={22}
/>

 <OverlayDateCharInput
  dayTop={570}
  dayLeft={610}
  monthTop={570}
  monthLeft={660}
  yearTop={570}
  yearLeft={710}
  boxWidth={20}
  boxHeight={28}
  value={payeeSignatureAt}
  onChange={setPayeeSignatureAt}

/>

<OverlayMultiRowCharInput
  top={695}
  left={425}
  rows={2}
  cols={19}
  boxWidth={18}
  boxHeight={28}
  value={bussinessAddress}
  onChange={setBussinessAddress}
  readOnly={readOnly}
/>

<OverlayMultiRowCharInput
  top={760}
  left={425}
  rows={1}
  cols={19}
  boxWidth={18}
  boxHeight={25}
  value={bussinessTown}
  onChange={setBussinessTown}
  readOnly={readOnly}
/>

<OverlayMultiRowCharInput
  top={797}
  left={425}
  rows={1}
  cols={3}
  boxWidth={18}
  boxHeight={25}
  value={bussinessState}
  onChange={setBussinessState}
  readOnly={readOnly}
/>

<OverlayMultiRowCharInput
  top={797}
  left={520}
  rows={1}
  cols={4}
  boxWidth={18}
  boxHeight={25}
  value={bussinessPostcode}
  onChange={setBussinessPostcode}
  readOnly={readOnly}
/>


<OverlayMultiRowCharInput
  top={840}
  left={425}
  rows={1}
  cols={19}
  boxWidth={18}
  boxHeight={25}
  value={contactPerson}
  onChange={setContactPerson}
  readOnly={readOnly}
/>

<OverlayMultiRowCharInput
  top={872}
  left={537}
  rows={1}
  cols={10}
  boxWidth={18}
  boxHeight={25}
  value={bussinessPhoneNo}
  onChange={setBussinessPhoneNo}
  readOnly={readOnly}
/>

      <OverlayCheckbox top={905} left={745} checked={check8} onChange={setCheck8} boxWidth={30} boxHeight={30} readOnly={readOnly} />


      <OverlaySquareRadioGroupFour
  name="fourOptions"
  value={selectedOption}
  onChange={setSelectedOption}
  options={[
    { label: "", value: "opt1", top: 125, left: 476 },
    { label: "", value: "opt2", top: 125, left: 550 },
    { label: "", value: "opt3", top: 125, left: 603 },
    { label: "", value: "opt4", top: 125, left: 690 },
    { label: "", value: "opt5", top: 125, left: 765 },
  ]}
  boxSize={19}
  tickColor="black"
  readOnly={readOnly}
/>




      {/* <OverlayCheckbox top={640} left={140} label="Subscribe to newsletter" checked={subscribe} onChange={setSubscribe} /> */}

      {/* Debug */}


      <OverlaySignatureBox
        top={952}
        left={10}
        width={200}
        height={40}
        value={payerSignature}
        onChange={setPayerSignature}
        label=""
        readOnly={readOnly}
      />

      {/* Payee signature positioned on form */}
      <OverlaySignatureBox
        top={555}
        left={410}
        width={200}
        height={40}
        value={payeeSignature}
        onChange={setPayeeSignature}
        label=""
        readOnly={readOnly}
      />
      
       {showButtons && (
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
  <button
    onClick={handleSave}
    className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
  >
    Save
  </button>
  <button
    onClick={handleDownloadPDF}
    disabled={isGeneratingPDF}
    className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 disabled:bg-gray-400"
  >
    {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
           </button>
           <button
    onClick={handleClear}
    className="px-4 py-2 bg-gray-500 text-white rounded shadow hover:bg-gray-600"
  >
    Clear
  </button>
</div>
       )}

    </div>
  );
}
