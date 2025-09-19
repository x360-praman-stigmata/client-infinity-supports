"use client";

import { useRef, useState } from "react";
import SignatureCanvas, { SignatureCanvasRef } from "@/components/ui/SignatureCanvas";

interface OverlaySignatureBoxProps {
  top: number;
  left: number;
  width?: number;
  height?: number;
  value: string | null;                // base64 signature
  onChange: (val: string | null) => void;
  label?: string;
  readOnly?: boolean;
}

export default function OverlaySignatureBox({
  top,
  left,
  width = 300,
  height = 100,
  value,
  onChange,
  label,
  readOnly = false,
}: OverlaySignatureBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const sigRef = useRef<SignatureCanvasRef | null>(null);

  const handleSave = () => {
    if (sigRef.current && !sigRef.current.isEmpty()) {
      const dataUrl = sigRef.current.toDataURL();
      onChange(dataUrl);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Signature preview box */}
      <div
        className={`absolute border border-gray-400 bg-white flex flex-col items-center justify-center ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        style={{ top, left, width, height }}
        onClick={() => !readOnly && setIsOpen(true)}
      >
        {value ? (
          <img
            src={value}
            alt="Signature"
            className="object-contain w-full h-full"
          />
        ) : (
          <span className="text-xs text-gray-400">Click to sign</span>
        )}
        {label && <span className="text-[10px] text-gray-600">{label}</span>}
      </div>

      {/* Modal for drawing signature */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-4 rounded shadow-lg w-[500px]">
            <h2 className="text-lg font-bold mb-2">Draw Your Signature</h2>

            <SignatureCanvas ref={sigRef} width={450} height={180} />

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-gray-400 text-white rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
