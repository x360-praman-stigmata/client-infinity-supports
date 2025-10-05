"use client";

import React, { useEffect, useRef, useState } from 'react';
import PDFFormAdminView from '@/components/ui/PDFFormAdminView';

interface NdisWorkforceCapabilityViewProps {
  excludeLastPage?: boolean;
  children?: React.ReactNode;
  data?: any;
  onDataChange?: (data: any) => void;
  readOnly?: boolean;
  showOverlay?: boolean;
  overlayFields?: Record<string, {
    label: string;
    type: string;
    value: any;
    onChange: (value: any) => void;
    placeholder?: string;
    required?: boolean;
  }>;
  adminView?: boolean;
}

export default function NdisWorkforceCapabilityView({ 
  excludeLastPage = false, 
  children, 
  data = {},
  onDataChange,
  readOnly = false,
  showOverlay = false,
  overlayFields = {},
  adminView = false
}: NdisWorkforceCapabilityViewProps) {
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const hasRenderedRef = useRef(false);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fast admin view - no PDF rendering
  if (adminView) {
    return (
      <PDFFormAdminView
        title="NDIS Workforce Capability Framework"
        description="PDF Document - Read & Submit Form"
        pdfUrl="/stafForms/NDIS WORKFORCE CAPABILITY FRAMEWORK.pdf"
        data={data}
        formType="NDIS Capability Framework"
      />
    );
  }

  useEffect(() => {
    const renderPdf = async () => {
      if (hasRenderedRef.current) return;
      hasRenderedRef.current = true;
      setIsRendering(true);
      try {
        await injectScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
        await injectScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js');
        const w: any = window as any;
        if (!w['pdfjsLib']) throw new Error('pdfjsLib not available');
        w['pdfjsLib'].GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const url = '/stafForms/NDIS WORKFORCE CAPABILITY FRAMEWORK.pdf';
        const loadingTask = w['pdfjsLib'].getDocument(url);
        const pdf = await loadingTask.promise;

        const container = pdfContainerRef.current;
        if (!container) return;
        container.innerHTML = '';

        const containerWidth = container.clientWidth || 794;
        const devicePixelRatioValue = Math.max(window.devicePixelRatio || 1, 1);
        const displayWidth = Math.min(containerWidth, 794);
        const qualityMultiplier = 2;

        const fragment = document.createDocumentFragment();
        const lastPage = excludeLastPage ? (pdf.numPages - 1) : pdf.numPages;
        
        for (let pageIndex = 1; pageIndex <= lastPage; pageIndex++) {
          const page = await pdf.getPage(pageIndex);
          const viewport = page.getViewport({ scale: 1 });
          const scale = displayWidth / viewport.width;
          const displayViewport = page.getViewport({ scale });

          const pageWrapper = document.createElement('div');
          pageWrapper.className = 'bg-white mx-auto border shadow p-0 print:p-0 mb-4';
          pageWrapper.style.width = displayWidth + 'px';

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;

          canvas.width = Math.floor(displayViewport.width * devicePixelRatioValue * qualityMultiplier);
          canvas.height = Math.floor(displayViewport.height * devicePixelRatioValue * qualityMultiplier);
          canvas.style.width = displayViewport.width + 'px';
          canvas.style.height = displayViewport.height + 'px';
          canvas.style.display = 'block';

          context.scale(devicePixelRatioValue * qualityMultiplier, devicePixelRatioValue * qualityMultiplier);
          await page.render({ canvasContext: context, viewport: displayViewport }).promise;

          pageWrapper.appendChild(canvas);
          fragment.appendChild(pageWrapper);
        }

        container.appendChild(fragment);
      } catch (e: any) {
        console.error('Error rendering PDF:', e);
        setError(e?.message || 'Failed to render PDF');
      } finally {
        setIsRendering(false);
      }
    };

    renderPdf();
  }, []);

  function injectScript(src: string) {
    return new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.body.appendChild(s);
    });
  }

  return (
    <div className="bg-slate-50 py-8">
      <div className="bg-white w-full max-w-[900px] mx-auto rounded-xl shadow border p-4 relative">
        {isRendering && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading NDIS Workforce Capability Framework...</p>
          </div>
        )}
        <div ref={pdfContainerRef} className="w-full" />
        
        {showOverlay && overlayFields && Object.keys(overlayFields).length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {overlayFields.name && (
              <div 
                className="absolute pointer-events-auto"
                style={{ top: '75%', left: '15%', width: '35%', transform: 'translateY(-50%)' }}
              >
                <input
                  type="text"
                  value={overlayFields.name.value || ''}
                  onChange={(e) => overlayFields.name.onChange(e.target.value)}
                  placeholder={overlayFields.name.placeholder || 'Enter your name'}
                  className="w-full px-2 py-1 text-sm bg-white border border-blue-500 rounded shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required={overlayFields.name.required}
                />
              </div>
            )}
            
            {overlayFields.signature && (
              <div 
                className="absolute pointer-events-auto"
                style={{ top: '85%', left: '15%', width: '35%', transform: 'translateY(-50%)' }}
              >
                <input
                  type="text"
                  value={overlayFields.signature.value || ''}
                  onChange={(e) => overlayFields.signature.onChange(e.target.value)}
                  placeholder={overlayFields.signature.placeholder || 'Enter your signature'}
                  className="w-full px-2 py-1 text-sm bg-white border border-blue-500 rounded shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required={overlayFields.signature.required}
                />
              </div>
            )}
            
            {overlayFields.date && (
              <div 
                className="absolute pointer-events-auto"
                style={{ top: '85%', left: '55%', width: '25%', transform: 'translateY(-50%)' }}
              >
                <input
                  type="date"
                  value={overlayFields.date.value || ''}
                  onChange={(e) => overlayFields.date.onChange(e.target.value)}
                  className="w-full px-2 py-1 text-sm bg-white border border-blue-500 rounded shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required={overlayFields.date.required}
                />
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}
        
        {children}
      </div>
    </div>
  );
}
