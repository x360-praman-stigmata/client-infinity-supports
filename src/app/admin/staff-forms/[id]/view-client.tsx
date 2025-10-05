"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getStaffFormComponent } from '@/app/forms/staff-registry';
import { fetchFormSpecificSettings } from '@/lib/settings';
import { FaArrowLeft, FaEye } from 'react-icons/fa';

export default function StaffFormViewClient({ formKey }: { formKey: string }) {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const s = await fetchFormSpecificSettings();
        setSettings(s || {});
        setSettingsError(null);
      } catch (error) {
        console.error('Failed to fetch form settings:', error);
        // Set empty settings as fallback
        setSettings({});
        setSettingsError(error instanceof Error ? error.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getSettingValue = (key: string): string | null => {
    const groups = Object.values(settings || {});
    for (const group of groups) {
      // If group is an array of settings
      if (Array.isArray(group)) {
        const s = group.find((it: any) => it && it.key === key);
        if (s) return s.value || s.defaultValue || null;
      } else if (group && typeof group === 'object') {
        // Sometimes returned as an object keyed by setting keys
        const values = Object.values(group);
        const s: any = values.find((it: any) => it && it.key === key);
        if (s) return s.value || s.defaultValue || null;
      }
    }
    return null;
  };

  const Component = getStaffFormComponent(formKey, 'view');
  const meta = {
    website: getSettingValue('company_website') || 'infinitysupportswa.org',
    version: getSettingValue('employee_details_form_id') || 'SF004',
    reviewDate: getSettingValue('review_date') || '2025-03-01',
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8 hover:shadow-xl transition">
          <div className="flex items-center gap-6 mb-6">
            <Link href="/admin/staff-forms" className="p-3 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600 hover:from-rose-200 hover:to-rose-300 shadow-md hover:shadow-lg transform hover:scale-105 transition">
              <FaArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg">
                <FaEye className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Staff Form</h1>
                <p className="text-sm text-slate-500">Form preview and metadata</p>
                {settingsError && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Settings not loaded: {settingsError}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
          <div className="bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300 px-8 py-5">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-md">
                <FaEye className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Form Preview</h2>
                <p className="text-sm text-slate-600">Interactive form view</p>
              </div>
            </div>
          </div>
          <div className="p-8">
            <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50">
              <Component meta={meta} adminView={true} readOnly={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


