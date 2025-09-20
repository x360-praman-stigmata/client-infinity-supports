"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getStaff, generateStaffLink } from '@/lib/api';
import StaffLinkModal from '@/app/components/components/staff/StaffLinkModal';

export default function StaffListPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ url: string; expiresAt: string } | null>(null);
  const [modalName, setModalName] = useState('');
  const [modalId, setModalId] = useState<number>(0);
  const [generatingLink, setGeneratingLink] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getStaff({ search });
      setRows(data.staff || []);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async (staffId: number, firstName: string, surname: string) => {
    setGeneratingLink(staffId);
    try {
      const res = await generateStaffLink(staffId);
      setModalData({ url: res.link, expiresAt: res.expiresAt });
      setModalName(`${firstName} ${surname}`);
      setModalId(staffId);
      setModalOpen(true);
    } finally {
      setGeneratingLink(null);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="bg-white min-h-screen">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-6 sm:mb-8 hover:shadow-xl transition-shadow duration-300">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-0">
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-400 text-white shadow-lg">
              <span className="text-2xl sm:text-3xl">👥</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Staff Management</h1>
              <p className="text-sm sm:text-base text-gray-600">Manage your staff and their information efficiently</p>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">0 Total Staff</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-sm text-gray-600 hover:text-rose-600 transition-all duration-200 px-4 py-3 border border-gray-200 rounded-xl hover:border-rose-200 hover:bg-rose-50 justify-center shadow-md hover:shadow-lg transform hover:scale-105">
              Back to Dashboard
            </Link>
            <Link href="/admin/staff/create" className="flex items-center gap-2 text-sm text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 transition-all duration-200 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold justify-center">
              Add New Staff
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-6 sm:mb-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search staff by name, email, phone..." className="flex-1 border border-gray-300 rounded-xl px-4 py-3" />
            <button onClick={load} className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl">Search</button>
            <Link href="/admin/staff/create" className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl">Add New Staff</Link>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-t-rose-500 border-rose-200 rounded-full animate-spin mx-auto mb-4"></div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Loading Staff</h3>
                <p className="text-slate-600">Please wait while we fetch staff data...</p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          ) : rows.length === 0 ? (
            <div className="text-gray-500 text-sm">No staff yet. Use "Add New Staff" to create one.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left font-bold text-gray-600">Name</th>
                    <th className="px-6 py-3 text-left font-bold text-gray-600">Email</th>
                    <th className="px-6 py-3 text-left font-bold text-gray-600">Phone</th>
                    <th className="px-6 py-3 text-left font-bold text-gray-600">Status</th>
                    <th className="px-6 py-3 text-left font-bold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((s) => (
                    <tr key={s.id} className="hover:bg-rose-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-900">{s.firstName} {s.surname}</td>
                      <td className="px-6 py-4">{s.email}</td>
                      <td className="px-6 py-4">{s.phone || '—'}</td>
                      <td className="px-6 py-4">
                        {s.status === 'success' ? (
                          <span className="inline-block text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full">Success</span>
                        ) : s.status === 'deleted' ? (
                          <span className="inline-block text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full">Deleted</span>
                        ) : (
                          <span className="inline-block text-xs font-medium bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleGenerateLink(s.id, s.firstName, s.surname)}
                          disabled={generatingLink === s.id}
                          className="px-3 py-2 rounded-lg bg-rose-500 text-white hover:bg-rose-600 text-sm disabled:opacity-50"
                        >
                          {generatingLink === s.id && <div className="w-3 h-3 border-2 border-t-transparent border-white rounded-full animate-spin inline-block mr-2"></div>}
                          {generatingLink === s.id ? 'Generating...' : 'Generate Link'}
                        </button>
                        <Link 
                          href={`/admin/staff/${s.id}`}
                          className="px-3 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 text-sm ml-2"
                        >
                          View More
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <StaffLinkModal isOpen={modalOpen} onClose={()=>setModalOpen(false)} staffName={modalName} staffId={modalId} link={modalData} />
    </div>
  );
}
