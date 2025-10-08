"use client";

interface FormDownloadButtonProps {
  pdfUrl: string;
  fileName: string;
  formName: string;
  description?: string;
}

export default function FormDownloadButton({
  pdfUrl,
  fileName,
  formName,
  description = "Download the complete document for your records"
}: FormDownloadButtonProps) {
  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">{formName}</h3>
            <p className="text-xs text-blue-700">{description}</p>
          </div>
        </div>
        <a
          href={pdfUrl}
          download={fileName}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3" />
          </svg>
          Download PDF
        </a>
      </div>
    </div>
  );
}
