"use client";

import React, { useEffect, useRef, useState } from 'react';
import PDFFormAdminView from '@/components/ui/PDFFormAdminView';

export default function BullyingHarassmentTrainingView({ 
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
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const hasRenderedRef = useRef(false);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fast admin view - no PDF rendering
  if (adminView) {
    return (
      <PDFFormAdminView
        title="Bullying and Harassment Training"
        description="PDF Training Document - Read & Submit Form"
        pdfUrl="/stafForms/Bullying and Harassment Training 2023.pdf"
        data={data}
        formType="Training Document"
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

        const url = '/stafForms/Bullying and Harassment Training 2023.pdf';
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
            <p className="text-gray-600">Loading Bullying and Harassment Training...</p>
          </div>
        )}
        <div ref={pdfContainerRef} className="w-full" />
        
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
