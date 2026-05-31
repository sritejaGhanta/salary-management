'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/auth.context';
import api from '../../lib/axios';
import { Download, ChevronLeft, ChevronRight, Loader2, Calendar, ClipboardList, Search, RefreshCw } from 'lucide-react';

interface AuditLogEntry {
  id: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'employee' | 'hr_manager' | 'salary';
  entity_id: number;
  ip_address: string;
  created_at: string;
  hrManager: {
    id: number;
    full_name: string;
    email: string;
  } | null;
}

export default function AuditLogsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Export State
  const [exporting, setExporting] = useState(false);

  // Debounce Search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchLogs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (debouncedSearch) params.append('search', debouncedSearch);
      if (action) params.append('action', action);
      if (entity) params.append('entity', entity);
      if (from) params.append('from', from);
      if (to) params.append('to', to);

      const response = await api.get(`/audit-logs?${params.toString()}`);
      setLogs(response.data.data || []);
      setTotal(response.data.total || 0);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, action, entity, from, to, user]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const response = await api.get('/export/audit-logs?format=excel', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export audit logs:', err);
      alert('Failed to export audit logs.');
    } finally {
      setExporting(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setAction('');
    setEntity('');
    setFrom('');
    setTo('');
    setPage(1);
  };

  const getActionBadgeColor = (act: string) => {
    switch (act) {
      case 'CREATE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'UPDATE':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'DELETE':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getEntityBadgeColor = (ent: string) => {
    switch (ent) {
      case 'employee':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'salary':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'hr_manager':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const showingStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingEnd = Math.min(page * limit, total);

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0d0e12] text-white">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <span>Loading Audit Trail...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
            <ClipboardList className="mr-3 text-blue-500" />
            Audit Logs
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track user creation, updates, and deletion events for full regulatory compliance.
          </p>
        </div>

        <button
          onClick={handleExportExcel}
          disabled={exporting}
          className="flex items-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl transition disabled:opacity-50 shadow-lg shadow-blue-600/20 self-start md:self-auto"
        >
          {exporting ? (
            <Loader2 size={14} className="animate-spin mr-1.5" />
          ) : (
            <Download size={14} className="mr-1.5" />
          )}
          Export Audit Logs
        </button>
      </div>

      {/* Filters Card */}
      <div className="bg-[#161820]/80 border border-gray-800 backdrop-blur-xl rounded-2xl p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search HR Manager..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#0d0e12]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none transition text-sm"
            />
          </div>

          {/* Action Filter */}
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#0d0e12]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-2.5 px-4 text-white focus:outline-none transition text-sm appearance-none"
          >
            <option value="">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>

          {/* Entity Filter */}
          <select
            value={entity}
            onChange={(e) => {
              setEntity(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#0d0e12]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-2.5 px-4 text-white focus:outline-none transition text-sm appearance-none"
          >
            <option value="">All Entities</option>
            <option value="employee">Employee</option>
            <option value="salary">Salary</option>
            <option value="hr_manager">HR Manager</option>
          </select>

          {/* From Date */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <Calendar size={14} />
            </span>
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#0d0e12]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none transition text-sm"
            />
          </div>

          {/* To Date */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <Calendar size={14} />
            </span>
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#0d0e12]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none transition text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-800/80 pt-4">
          <div className="text-xs text-gray-400">
            Showing <strong className="text-white">{showingStart}</strong> to{' '}
            <strong className="text-white">{showingEnd}</strong> of{' '}
            <strong className="text-white">{total.toLocaleString()}</strong> log entries
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleClearFilters}
              className="flex items-center text-xs font-semibold text-gray-400 hover:text-white transition"
            >
              Clear Filters
            </button>
            <button
              onClick={fetchLogs}
              className="flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
            >
              <RefreshCw size={12} className="mr-1.5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#161820]/80 border border-gray-800 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-xs font-semibold text-gray-400 bg-[#0d0e12]/30 uppercase tracking-wider">
                <th className="py-4 px-6">Log ID</th>
                <th className="py-4 px-6">HR Manager</th>
                <th className="py-4 px-6">Action</th>
                <th className="py-4 px-6">Entity Target</th>
                <th className="py-4 px-6">Entity ID</th>
                <th className="py-4 px-6">IP Address</th>
                <th className="py-4 px-6">Created At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60 text-sm text-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 size={16} className="animate-spin text-blue-500" />
                      <span>Fetching log entries...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No audit logs match current filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/20 transition">
                    <td className="py-4 px-6 font-semibold text-white">#{log.id}</td>
                    <td className="py-4 px-6">
                      {log.hrManager ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{log.hrManager.full_name}</span>
                          <span className="text-xs text-gray-500">{log.hrManager.email}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">System / Deleted User</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getEntityBadgeColor(log.entity)}`}>
                        {log.entity}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">ID: {log.entity_id}</td>
                    <td className="py-4 px-6 font-mono text-xs text-gray-400">
                      {log.ip_address || 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-xs">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-gray-800">
            {/* Limit selector */}
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span>Show</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-[#161820] border border-gray-800 text-white rounded-xl py-1.5 px-3 focus:outline-none transition appearance-none"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span>entries per page</span>
            </div>

            {/* Page numbers navigation */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 bg-[#161820] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => {
                  // Only display surrounding pages to keep layout clean
                  if (num === 1 || num === totalPages || Math.abs(num - page) <= 2) {
                    return (
                      <button
                        key={num}
                        onClick={() => setPage(num)}
                        className={`w-8 h-8 rounded-xl text-xs font-semibold transition ${
                          page === num ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  }
                  if (num === 2 || num === totalPages - 1) {
                    return <span key={num} className="text-gray-600 px-1 text-xs">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 bg-[#161820] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
