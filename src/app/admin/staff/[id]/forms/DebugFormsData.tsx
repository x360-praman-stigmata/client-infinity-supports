"use client";

import React, { useState, useEffect } from 'react';

interface DebugFormsDataProps {
  staffId: string;
}

export default function DebugFormsData({ staffId }: DebugFormsDataProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/staff/onboard/admin-view-${staffId}`);
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [staffId]);

  if (loading) return <div>Loading debug data...</div>;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
      <h3 className="font-bold text-yellow-800 mb-2">🔍 Debug: API Data for Staff {staffId}</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Staff Status:</strong> {data?.staff?.status}
        </div>
        
        <div>
          <strong>Submissions Keys:</strong> {data?.submissions ? Object.keys(data.submissions).join(', ') : 'None'}
        </div>
        
        <div>
          <strong>Total Forms:</strong> {data?.submissions ? Object.keys(data.submissions).length : 0}
        </div>
        
        <details className="mt-4">
          <summary className="cursor-pointer font-medium">View Raw Data</summary>
          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
