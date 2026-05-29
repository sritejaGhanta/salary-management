'use client';

import React, { useState } from 'react';
import api from '../../lib/axios';
import { Download, FileText, Loader2, Database, ShieldAlert, Users } from 'lucide-react';

export default function ExportPage() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const handleExport = async (dataset: 'employees' | 'hr-managers' | 'audit-logs', format: 'csv' | 'excel') => {
    const key = `${dataset}-${format}`;
    setLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const response = await api.get(`/export/${dataset}?format=${format}`, {
        responseType: 'blob',
      });

      const fileType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const fileExt = format === 'csv' ? 'csv' : 'xlsx';
      
      const blob = new Blob([response.data], { type: fileType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${dataset}_${new Date().toISOString().split('T')[0]}.${fileExt}`);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Failed to export ${dataset}:`, err);
      alert(`Failed to export ${dataset} records.`);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const exportCards = [
    {
      id: 'employees' as const,
      title: 'Employee Database',
      description: 'Download the comprehensive organization employee directory, including active and inactive records, salaries, departments, job titles, and location metadata.',
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      id: 'hr-managers' as const,
      title: 'HR Administrators Registry',
      description: 'Export registered HR administrators, supervisors, and user profiles who manage system adjustments, organization assignments, and employee listings.',
      icon: Database,
      color: 'text-violet-500',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-100',
    },
    {
      id: 'audit-logs' as const,
      title: 'Security Audit logs',
      description: 'Audit trails and historical event logs detailing user access sessions, password modifications, profile creation tasks, and record deletion changes.',
      icon: ShieldAlert,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="border-b border-gray-800 pb-5">
        <h1 className="text-3xl font-bold text-white tracking-tight">Export Data Portal</h1>
        <p className="text-gray-400 text-sm mt-1">
          Export organization registry tables in standard comma-separated values (CSV) or spreadsheet sheet formats.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {exportCards.map((card) => {
          const Icon = card.icon;
          const csvLoading = loading[`${card.id}-csv`];
          const excelLoading = loading[`${card.id}-excel`];

          return (
            <div
              key={card.id}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-2xl ${card.bgColor} ${card.color}`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="text-gray-900 font-bold text-sm tracking-tight">{card.title}</h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{card.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                {/* Export CSV */}
                <button
                  onClick={() => handleExport(card.id, 'csv')}
                  disabled={csvLoading || excelLoading}
                  className="flex items-center justify-center text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {csvLoading ? (
                    <Loader2 size={13} className="animate-spin mr-1.5" />
                  ) : (
                    <FileText size={13} className="mr-1.5 text-gray-400" />
                  )}
                  Export CSV
                </button>

                {/* Export Excel */}
                <button
                  onClick={() => handleExport(card.id, 'excel')}
                  disabled={csvLoading || excelLoading}
                  className="flex items-center justify-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 py-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-600/10"
                >
                  {excelLoading ? (
                    <Loader2 size={13} className="animate-spin mr-1.5" />
                  ) : (
                    <Download size={13} className="mr-1.5" />
                  )}
                  Export Excel
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
