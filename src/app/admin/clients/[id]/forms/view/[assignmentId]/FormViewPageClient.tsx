"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaEdit, FaSignature, FaDownload, FaUser, FaCalendarAlt, FaSpinner } from 'react-icons/fa';
import { useToast } from '@/components/ui/Toast';
import { getFormComponent } from '@/app/forms/registry';
import { fetchFormSpecificSettings } from '@/lib/settings';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Types
interface FormAssignmentData {
  id: number;
  clientId: number;
  formId: number;
  formVersion: number;
  form: {
    id: number; // Add form ID for PDF generation
    formKey: string;
    title: string;
    schema: any;
  };
  client: {
    name: string;
    email: string;
  };
  submissionData?: any; // FormSubmission data
  submissionId?: number; // Add submission ID for PDF generation
  clientSignature?: string;
  clientSignedAt?: string;
}

export default function FormViewPageClient() {
  const params = useParams();
  const { showToast } = useToast();
  
  const clientId = parseInt(params.id as string);
  const assignmentId = parseInt(params.assignmentId as string);
  
  const [assignment, setAssignment] = useState<FormAssignmentData | null>(null);
  const [commonFields, setCommonFields] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const [settings, setSettings] = useState({});


  // Load assignment and submission data
  useEffect(() => {
    loadAssignmentData();
  }, [assignmentId]);

  const loadAssignmentData = async () => {
  try {
    setLoading(true);

    // 📦 Fetch both assignment and settings in parallel
    const [assignmentRes, fetchedSettings] = await Promise.all([
      fetch(`/api/form-assignments/${assignmentId}`),
      fetchFormSpecificSettings()
    ]);

    if (!assignmentRes.ok) throw new Error('Failed to load assignment data');
    
    const data = await assignmentRes.json();
    console.log('Loaded assignment data:', data.commonFields);

    setAssignment(data.assignment);
    setCommonFields(data.commonFields || {});
    setSettings(fetchedSettings); // ✅ store settings

  } catch (error) {
    console.error('Error loading assignment or settings:', error);
    showToast({
      type: 'error',
      title: 'Error',
      message: 'Failed to load form data or settings',
      duration: 3000,
    });
  } finally {
    setLoading(false);
  }
};


  // Download PDF function
  const handleDownloadPDF = async () => {
    if (!assignment || !assignment.submissionId) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Cannot download PDF: Form submission not found',
        duration: 3000,
      });
      return;
    }

    try {
      setDownloadingPDF(true);
      
      const response = await fetch(`/api/generate-pdf/${assignment.submissionId}/${assignment.form.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${assignment.form.title.replace(/[^a-zA-Z0-9]/g, '_')}_${assignment.client.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showToast({
        type: 'success',
        title: 'Success',
        message: 'PDF downloaded successfully',
        duration: 3000,
      });
      
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      showToast({
        type: 'error',
        title: 'Download Failed',
        message: error.message || 'Failed to download PDF. Please try again.',
        duration: 5000,
      });
    } finally {
      setDownloadingPDF(false);
    }
  };

 if (loading) {
    return (
      <LoadingSpinner 
        title="Loading View Form" 
        message="Please wait..."
        size="md"
      />
    );
  }

  if (!assignment || !assignment.submissionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center bg-white rounded-xl shadow-sm p-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaUser className="h-8 w-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {!assignment ? 'Form Not Found' : 'Form Not Filled Yet'}
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {!assignment 
                ? 'The requested form assignment could not be found.'
                : 'This form has not been filled by admin yet.'
              }
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link 
                href={`/admin/clients/${clientId}/forms`}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FaArrowLeft className="mr-2 h-4 w-4" />
                Back to Forms List
              </Link>
              {assignment && (
                <Link 
                  href={`/admin/clients/${clientId}/forms/edit/${assignmentId}`}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FaEdit className="mr-2 h-4 w-4" />
                  Fill This Form
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get the appropriate form component from registry
  let FormViewComponent;
  try {
    FormViewComponent = getFormComponent(assignment.form.formKey, 'view');
  } catch (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center bg-white rounded-xl shadow-sm p-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaUser className="h-8 w-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Form Component Not Found</h1>
            <p className="text-gray-600 mb-8">
              No view component found for form: {assignment.form.formKey}
            </p>
            <Link 
              href={`/admin/clients/${clientId}/forms`}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FaArrowLeft className="mr-2 h-4 w-4" />
              Back to Forms List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      {/* Enhanced Header */}
   <div className="bg-white shadow-sm border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
    {/* Back Button */}
    <div className="flex items-center mb-4">
      <Link 
        href={`/admin/clients/${clientId}/forms`}
        className="flex items-center px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 group"
      >
        <FaArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
        Back to Forms
      </Link>
    </div>

    {/* Main Header */}
    <div className="flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-rose-600 rounded-full flex items-center justify-center shadow-lg">
          <FaUser className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold text-slate-900 truncate">
            {assignment.form.title}
          </h1>
          <div className="flex items-center text-sm text-slate-600 space-x-4 mt-1">
            <span className="font-medium">{assignment.client.name}</span>
            <span className="text-slate-400">•</span>
            <span className="truncate">{assignment.client.email}</span>
            <span className="text-slate-400">•</span>
            <span className="flex items-center whitespace-nowrap">
              <FaCalendarAlt className="h-3 w-3 mr-1" />
              Version {assignment.formVersion}
            </span>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-3 flex-shrink-0">
        {/* Signature Status */}
        {assignment.clientSignature && (
          <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200 text-emerald-700 min-w-[130px]">
            <FaSignature className="h-4 w-4" />
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm">Signed</span>
              <span className="text-xs text-emerald-600">
                {new Date(assignment.clientSignedAt!).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Download PDF Button */}
        <button
          onClick={handleDownloadPDF}
          disabled={downloadingPDF}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-medium rounded-lg hover:from-rose-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          title="Download PDF"
        >
          {downloadingPDF ? (
            <>
              <FaSpinner className="mr-2 h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Generating...</span>
            </>
          ) : (
            <>
              <FaDownload className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Download</span>
            </>
          )}
        </button>

        {/* Edit Button (Optional - currently commented) */}
        {/* <Link
          href={`/admin/clients/${clientId}/forms/edit/${assignmentId}`}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-700 to-slate-900 text-white font-medium rounded-lg hover:from-slate-800 hover:to-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <FaEdit className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Edit</span>
        </Link> */}
      </div>
    </div>
  </div>
</div>


      {/* Form Content with Enhanced Styling */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
          <FormViewComponent
            formSchemas={assignment?.form?.schema}
            formData={assignment?.submissionData}
            showSignature={!!assignment?.clientSignature}
            existingSignature={assignment?.clientSignature}
            isAdminView={true}
            commonFieldsData={commonFields}
            settings={settings}
          />
        </div>
      </div>
    </div>
  );
}
