"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getStaff, generateStaffLink, deleteStaff } from '@/lib/api';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { FaEllipsisV, FaEye, FaFileAlt, FaTrash } from 'react-icons/fa';
import { useConfirm } from '@/components/ui/Confirm';
import { useToast } from '@/components/ui/Toast';
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
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectAll, setSelectAll] = useState(false);
  const confirm = useConfirm();
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getStaff({ search, page, pageSize });
      setRows(data.staff || []);
      setTotalCount(data.pagination?.totalCount || 0);
      setTotalPages(data.pagination?.totalPages || 1);
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

  useEffect(() => { load(); }, [page, pageSize]);

  const handleSelectAll = () => {
    if (selectAll) {
      const currentIds = rows.map((r) => r.id);
      setSelectedIds(selectedIds.filter((id) => !currentIds.includes(id)));
      setSelectAll(false);
    } else {
      const currentIds = rows.map((r) => r.id);
      const combined = Array.from(new Set([...selectedIds, ...currentIds]));
      setSelectedIds(combined);
      setSelectAll(true);
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
      setSelectAll(false);
    } else {
      setSelectedIds([...selectedIds, id]);
      const pageIds = rows.map((r) => r.id);
      if (pageIds.every((x) => [...selectedIds, id].includes(x))) setSelectAll(true);
    }
  };

  const handleDeleteOne = async (id: number) => {
    const confirmed = await confirm.confirm({
      title: 'Delete Staff',
      message: 'Are you sure you want to delete this staff member? This will remove all related data.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      setIsDeleting(true);
      await deleteStaff(id);
      showToast({ type: 'success', title: 'Deleted', message: 'Staff deleted successfully' });
      await load();
      setSelectedIds((prev) => prev.filter((x) => x !== id));
    } catch (err: any) {
      showToast({ type: 'error', title: 'Delete failed', message: err.message || 'Failed to delete staff' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = await confirm.confirm({
      title: 'Delete Selected',
      message: `Delete ${selectedIds.length} selected staff and all related data?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger',
    });
    if (!confirmed) return;
    try {
      setIsDeleting(true);
      for (const id of selectedIds) {
        await deleteStaff(id);
      }
      showToast({ type: 'success', title: 'Deleted', message: 'Selected staff deleted' });
      setSelectedIds([]);
      setSelectAll(false);
      await load();
    } catch (err: any) {
      showToast({ type: 'error', title: 'Delete failed', message: err.message || 'Failed to delete selected staff' });
    } finally {
      setIsDeleting(false);
    }
  };

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
                <button onClick={() => { setPage(1); load(); }} className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl">Search</button>
            <Link href="/admin/staff/create" className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl">Add New Staff</Link>
                {selectedIds.length > 0 && (
                  <button onClick={handleDeleteSelected} disabled={isDeleting} className="px-6 py-3 border border-rose-300 text-rose-700 rounded-xl">Delete ({selectedIds.length})</button>
                )}
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
                    <th className="px-6 py-3 text-left font-bold text-gray-600">
                      <input type="checkbox" className="accent-rose-500" checked={selectAll} onChange={handleSelectAll} />
                    </th>
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
                      <td className="px-6 py-4">
                        <input type="checkbox" className="accent-rose-500" checked={selectedIds.includes(s.id)} onChange={() => handleSelectOne(s.id)} />
                      </td>
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
                      <td className="px-6 py-4 text-right">
                        <Menu as="div" className="relative inline-block text-left">
                          <MenuButton className="text-slate-500 hover:text-rose-600 transition">
                            <FaEllipsisV className="w-5 h-5" />
                          </MenuButton>
                          <MenuItems className="absolute right-0 mt-2 w-44 origin-top-right bg-white border border-gray-200 rounded-xl shadow-lg focus:outline-none z-50">
                            <div className="py-1 text-sm text-slate-700">
                              <MenuItem>
                                {({ active }: any) => (
                                  <Link href={`/admin/staff/${s.id}`} className={`flex items-center gap-2 px-4 py-2 hover:bg-slate-50 ${active ? 'text-slate-600' : ''}`}>
                                    <FaEye className="w-4 h-4" />
                                    View
                                  </Link>
                                )}
                              </MenuItem>
                              <MenuItem>
                                {({ active }: any) => (
                                  <button onClick={() => handleGenerateLink(s.id, s.firstName, s.surname)} disabled={generatingLink === s.id} className={`flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-green-50 ${active ? 'text-green-600' : ''}`}>
                                    <FaFileAlt className="w-4 h-4" />
                                    {generatingLink === s.id ? 'Generating…' : 'Forms Link'}
                                  </button>
                                )}
                              </MenuItem>
                              <MenuItem>
                                {({ active }: any) => (
                                  <button onClick={() => handleDeleteOne(s.id)} disabled={isDeleting} className={`flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-red-50 ${active ? 'text-red-600' : ''}`}>
                                    <FaTrash className="w-4 h-4" />
                                    Delete
                                  </button>
                                )}
                              </MenuItem>
                            </div>
                          </MenuItems>
                        </Menu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 sm:px-8 py-6 bg-white border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div className="text-sm text-gray-700">Showing {rows.length} of {totalCount} staff</div>
            <div className="flex items-center gap-4">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${page > 1 ? 'bg-white text-rose-600 border border-gray-300 hover:bg-rose-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>‹ Prev</button>
              <span className="text-sm text-gray-700 font-medium">Page <span className="text-rose-600 font-bold">{page}</span> of <span className="text-rose-600 font-bold">{totalPages}</span></span>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${page < totalPages ? 'bg-white text-rose-600 border border-gray-300 hover:bg-rose-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>Next ›</button>
              <div className="relative inline-block">
                <label htmlFor="pageSize" className="text-sm font-medium text-gray-600 mr-2">Show:</label>
                <select id="pageSize" value={pageSize} onChange={(e) => { setPage(1); setPageSize(parseInt(e.target.value)); }} className="cursor-pointer appearance-none border border-rose-300 text-sm text-rose-700 font-medium bg-white py-2 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 hover:shadow-md transition duration-200">
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <StaffLinkModal isOpen={modalOpen} onClose={()=>setModalOpen(false)} staffName={modalName} staffId={modalId} link={modalData} />
    </div>
  );
}
