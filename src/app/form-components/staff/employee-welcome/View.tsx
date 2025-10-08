"use client";

import React, { useEffect, useRef, useState } from 'react';
import EmployeeWelcomeAckView from './lastPageOnlyView';
import FormDownloadButton from '@/components/ui/FormDownloadButton';

export default function EmployeeWelcomeView({ excludeLastPage = true, children, data = {} }: { excludeLastPage?: boolean; children?: React.ReactNode; data?: any }) {
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const hasRenderedRef = useRef(false);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if form is complete (has all required fields and is submitted)
  const isFormComplete = data.readAcknowledgement && 
                        data.fullName && 
                        data.signature && 
                        data.date &&
                        data.submit === true;

  useEffect(() => {
    // Render the PDF into canvases without the built-in viewer
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

        const url = '/stafForms/Employee%20Welcome%20Pack.pdf';
        const loadingTask = w['pdfjsLib'].getDocument(url);
        const pdf = await loadingTask.promise;

        const container = pdfContainerRef.current;
        if (!container) return;
        container.innerHTML = '';

        const containerWidth = container.clientWidth || 794;
        const devicePixelRatioValue = Math.max(window.devicePixelRatio || 1, 1);
        const displayWidth = Math.min(containerWidth, 794);
        const qualityMultiplier = 2; // render sharper, then downscale for crispness

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

        // Append all pages at once to avoid progressive layout shifts/scroll jumps
        container.appendChild(fragment);
      } catch (e: any) {
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

  // If form is complete, show only the acknowledgement form with download button
  if (isFormComplete) {
    return (
      <div className="bg-slate-50 py-8">
        <div className="bg-white w-full max-w-[900px] mx-auto rounded-xl shadow border p-4">
          {/* Download Button for Completed Form */}
          <FormDownloadButton
            pdfUrl="/stafForms/Employee%20Welcome%20Pack.pdf"
            fileName="Employee Welcome Pack.pdf"
            formName="Employee Welcome Pack"
            description="Download the complete document for your records"
          />
          
          <EmployeeWelcomeAckView data={data} />
          {error && (
            <div className="text-sm text-red-600 mt-2">{error}</div>
          )}
        </div>
      </div>
    );
  }

  // If form is not complete, show PDF only (no acknowledgement form)
  return (
    <div className="bg-slate-50 py-8">
      <div className="bg-white w-full max-w-[900px] mx-auto rounded-xl shadow border p-4">
        <div ref={pdfContainerRef} className="w-full" />
        {children}
        {error && (
          <div className="text-sm text-red-600 mt-2">{error}</div>
        )}
      </div>
    </div>
  );
}


