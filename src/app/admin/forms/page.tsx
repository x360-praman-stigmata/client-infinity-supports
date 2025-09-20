"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaPlus,
  FaEye,
  FaFileAlt,
  FaArrowLeft,
  FaSearch,
} from "react-icons/fa";
import useRequireAuth from "../../hooks/useRequireAuth";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// Enhanced skeleton loader row
function SkeletonRow() {
  return (
    <tr className="animate-pulse bg-white hover:bg-gray-50 transition-colors duration-200">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-8 py-6 border-b border-gray-100">
          <div className="h-4 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg" />
        </td>
      ))}
    </tr>
  );
}

export default function FormsManagement() {
  // Call auth hook first
  const { session, status } = useRequireAuth();
  // Now call other hooks
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/forms");
        if (!response.ok) throw new Error("Failed to fetch forms");

        const data = await response.json();
        setForms(data);
      } catch (err) {
        console.error("Error fetching forms:", err);
        setError("Failed to load forms. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const handleViewForm = (formId: string) => {
    router.push(`/admin/forms/${formId}`);
  };

  const filteredForms = forms.filter(
    (form: any) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.formKey.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (status === "loading" || !session) return null;

  if (loading) {
    return (
      <LoadingSpinner 
        title="Loading All Forms" 
        message="Please wait while we load all forms..."
        size="md"
      />
    );
  }

  return (
    <div className="bg-gradient-to-br from-white-50 to-white-100 min-h-screen">
       <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-6 sm:mb-8 hover:shadow-xl transition-shadow duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-400 text-white shadow-lg">
                    <FaFileAlt className="text-2xl sm:text-3xl" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      Form Management
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                      View list of all forms
                    </p>
                  </div>
                </div>
                
              </div>
            </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
       


        {/* Enhanced Search and filters */}
      <div className="bg-gradient-to-r from-slate-50 to-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8 mb-6 sm:mb-8 hover:shadow-xl transition-shadow duration-300">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
    {/* Search Input */}
    <div className="relative flex-grow max-w-md">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <FaSearch className="text-slate-400 h-5 w-5" />
      </div>
      <input
        type="text"
        placeholder="Search forms by title or key..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-12 pr-4 py-4 w-full border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm sm:text-base shadow-sm hover:shadow-md transition-shadow duration-200 bg-white text-slate-800"
      />
    </div>

    {/* Form Count Info */}
    <div className="flex items-center gap-4">
      <div className="text-sm font-medium text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
        {!loading && (
          <span>
            Showing{" "}
            <span className="font-bold text-rose-600">{filteredForms.length}</span>{" "}
            of{" "}
            <span className="font-bold text-rose-600">{forms.length}</span>{" "}
            forms
          </span>
        )}
      </div>
    </div>
  </div>
</div>


        {/* Enhanced Error state */}
        {error && (
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-6 mb-6 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-red-500 text-white shadow-md">
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-800 mb-2">
                    Error Loading Forms
                  </h3>
                  <p className="text-red-700 font-medium mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Table layout */}
       <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
  <div className="overflow-x-auto">
    <table className="min-w-full table-auto text-sm">
      <thead className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <tr>
          {["Title", "Signature", "Actions"].map((header) => (
            <th
              key={header}
              className="px-4 py-4 text-left text-slate-600 uppercase tracking-wider text-xs font-bold"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-100">
        {!loading &&
          !error &&
          filteredForms.map((form: any, index: number) => (
            <tr
              key={form.id}
              onClick={() => handleViewForm(form.id)}
              className="hover:bg-gradient-to-r hover:from-rose-50 hover:to-slate-50 transition-all duration-200 cursor-pointer"
              style={{
                animationDelay: `${index * 50}ms`,
                animation: "fadeInUp 0.6s ease-out forwards",
              }}
            >
              {/* Title */}
              <td className="px-4 py-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-500 flex items-center justify-center shadow-md">
                    <FaFileAlt className="text-white h-5 w-5" />
                  </div>
                  <div className="font-semibold text-slate-800 text-sm sm:text-base">
                    {form.title}
                  </div>
                </div>
              </td>

              {/* Signature Requirement */}
              <td className="px-4 py-4">
                {form.requiresSignature && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="hidden sm:inline">Requires Signature</span>
                  </span>
                )}
              </td>

              {/* Actions */}
              <td className="px-4 py-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewForm(form.id);
                  }}
                  className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-4 py-2 rounded-xl text-sm shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
                  aria-label={`View ${form.title}`}
                >
                  <FaEye className="h-4 w-4" />
                  <span className="hidden sm:inline">View</span>
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
</div>

      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
