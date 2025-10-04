"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getStaffById, generateStaffLink } from '@/lib/api';
import StaffLinkModal from '@/app/components/components/staff/StaffLinkModal';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { FaSyncAlt, FaLink, FaCheckCircle, FaRegCircle } from 'react-icons/fa';

export default function StaffFormsPage() {
  const { id } = useParams<{ id: string }>();
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ url: string; expiresAt: string } | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalId, setModalId] = useState<number>(0);
  const [generatingLink, setGeneratingLink] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { showToast } = useToast();
  const [completedCount, setCompletedCount] = useState<number>(0);
  const TOTAL_FORMS = 16;

  const loadInfo = async () => {
    setLoading(true);
    try {
      const result = await getStaffById(Number(id));
      if (result?.staff) setStaff(result.staff);
    } catch (e) {
      console.error('Error loading staff info:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) loadInfo(); }, [id]);

  // Load forms status for conditional display (no drafts shown)
  const loadForms = async () => {
    try {
      const res = await fetch(`/api/staff/${id}/forms`);
      if (!res.ok) return;
      const data = await res.json();
      setForms(Array.isArray(data.forms) ? data.forms : []);
      if (!staff && data.staff) setStaff(data.staff);
      const count = (data.forms || []).filter((f: any) => f.status === 'completed').length;
      setCompletedCount(count);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => { if (id) loadForms(); }, [id]);

  const handleGenerateLink = async () => {
    if (!staff) return;
    setGeneratingLink(true);
    try {
      const res = await generateStaffLink(Number(id));
      setModalData({ url: res.link, expiresAt: res.expiresAt });
      setModalName(`${staff.firstName} ${staff.surname}`);
      setModalId(Number(id));
      setModalOpen(true);
    } finally {
      setGeneratingLink(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetch(`/api/staff/${id}/recalculate-status`, { method: 'POST' }).catch(()=>{}),
        loadInfo(),
        loadForms(),
      ]);
      showToast({ type: 'success', title: 'Refreshed', message: 'Latest staff info and forms loaded' });
    } catch (e: any) {
      showToast({ type: 'error', title: 'Refresh failed', message: e?.message || 'Could not refresh data' });
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-t-rose-500 border-rose-200 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Loading Staff Info</h3>
          <p className="text-slate-600 font-medium">Please wait while we fetch staff information...</p>
        </div>
      </div>
    );
  }

  if (!staff) return <div className="p-8">Staff not found</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-6 sm:mb-8 hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
          <div className="flex items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-400 text-white shadow-lg flex items-center justify-center text-2xl font-bold">
              {(staff.firstName || '?').charAt(0)}
            </div>
          <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{staff.firstName} {staff.surname}</h1>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  ID: {id}
                </span>
                <span className="hidden sm:inline">•</span>
                <span>Created: {staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : '—'}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600 transition-all duration-200 px-4 py-3 border border-gray-200 rounded-xl hover:border-rose-200 hover:bg-rose-50 justify-center shadow-md hover:shadow-lg transform hover:scale-105">
              Back to Dashboard
            </Link>
            <Link href="/admin/staff" className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 transition-all duration-200 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold justify-center">
              Back to Staff
            </Link>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white">
                {completedCount === TOTAL_FORMS ? (
                  <FaCheckCircle className="text-green-600" />
                ) : (
                  <FaRegCircle className="text-gray-400" />
                )}
                <span className="font-semibold text-gray-700">{completedCount}/{TOTAL_FORMS}</span>
              </span>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                title="Refresh"
                aria-label="Refresh"
                className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-all duration-200 px-3 py-3 rounded-xl shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <FaSyncAlt className={refreshing ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={handleGenerateLink}
                disabled={generatingLink}
                title="Generate Forms Link"
                aria-label="Generate Forms Link"
                className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 px-3 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FaLink />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Info */}
          <div className="col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-600 text-white font-bold">👤</span>
                <h3 className="font-semibold text-slate-800">Basic Information</h3>
              </div>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-slate-500">Full Name</div>
                <div className="font-semibold text-slate-800">{staff.firstName} {staff.surname}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-slate-500">Email Address</div>
                <div className="font-semibold text-slate-800 break-all">{staff.email}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-slate-500">Phone Number</div>
                <div className="font-semibold text-slate-800">{staff.phone || '—'}</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="text-slate-500">Account Created</div>
                <div className="font-semibold text-slate-800">{staff.createdAt ? new Date(staff.createdAt).toLocaleDateString() : '—'}</div>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div className="col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-green-50 to-white border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white font-bold">🧾</span>
                <h3 className="font-semibold text-slate-800">Employment Details</h3>
              </div>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-slate-500">Role</div>
                <div className="font-semibold text-slate-800">{staff.role || 'Staff'}</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-slate-500">Status</div>
                <div className="font-semibold text-slate-800 capitalize">{staff.status}</div>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <div className="text-slate-500">Start Date</div>
                <div className="font-semibold text-slate-800">{staff.startDate ? new Date(staff.startDate).toLocaleDateString() : '—'}</div>
              </div>
                    </div>
                  </div>
                  
          {/* Contact/Meta */}
          <div className="col-span-1 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-white border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white font-bold">📇</span>
                <h3 className="font-semibold text-slate-800">Other Information</h3>
              </div>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="text-slate-500">Updated At</div>
                <div className="font-semibold text-slate-800">{staff.updatedAt ? new Date(staff.updatedAt).toLocaleDateString() : '—'}</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="text-slate-500">Onboarding Link</div>
                <div className="font-semibold text-slate-800">{staff.status === 'success' ? 'Completed' : 'Pending'}</div>
              </div>
                </div>
            </div>
        </div>

        {/* Forms card: show only statuses until all completed; then show view links */}
        <div className="mt-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-600 text-white font-bold">🗂️</span>
                <h3 className="font-semibold text-slate-800">Forms</h3>
              </div>
            </div>
            <div className="p-5">
              {forms.length === 0 ? (
                <div className="text-sm text-gray-500">No forms yet.</div>
              ) : (
                <div className="space-y-2">
                  {(forms.every((f: any) => f.status === 'completed') ? forms : forms).map((form: any) => (
                    <div key={form.formType} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${form.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div>
                          <div className="font-medium">{form.formName}</div>
                          <div className="text-xs text-gray-500">{form.status === 'completed' ? `Completed ${form.completedAt || ''}` : 'Not completed'}</div>
                        </div>
                      </div>
                      {forms.every((f: any) => f.status === 'completed') && form.status === 'completed' ? (
                        <Link href={`/admin/staff/${id}/forms/${form.formType}`} className="px-3 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600">View</Link>
                      ) : (
                        <span className="text-xs text-gray-400">Status: {form.status}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <StaffLinkModal isOpen={modalOpen} onClose={()=>setModalOpen(false)} staffName={modalName} staffId={modalId} link={modalData} />
    </div>
  );
}
