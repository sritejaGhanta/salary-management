'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '../../lib/axios';
import { Plus, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, Loader2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/auth.context';
import { useRouter } from 'next/navigation';

interface HRManager {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function HRManagersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [managers, setManagers] = useState<HRManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Delete modal
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchManagers = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        order,
      });

      if (debouncedSearch) params.append('search', debouncedSearch);
      if (role) params.append('role', role);
      if (status) params.append('is_active', status);

      const response = await api.get(`/hr-managers?${params.toString()}`);
      setManagers(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Failed to load HR managers:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, role, status, sortBy, order, user]);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setOrder('DESC');
    }
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await api.delete(`/hr-managers/${deleteId}`);
      setDeleteId(null);
      fetchManagers();
    } catch (err) {
      console.error(err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setDeleteError((err as any).response?.data?.message || 'Failed to delete HR Manager.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ArrowUpDown size={14} className="ml-1.5 text-gray-500 opacity-0 group-hover:opacity-100 transition" />;
    }
    return order === 'ASC' ? (
      <ArrowUp size={14} className="ml-1.5 text-blue-500" />
    ) : (
      <ArrowDown size={14} className="ml-1.5 text-blue-500" />
    );
  };

  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => setPage(1)}
          className={`w-8 h-8 rounded-xl text-xs font-semibold transition ${
            page === 1 ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          1
        </button>
      );
      if (start > 2) {
        pages.push(<span key="ellipsis-start" className="text-gray-600 px-1 text-xs">...</span>);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-8 h-8 rounded-xl text-xs font-semibold transition ${
            page === i ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(<span key="ellipsis-end" className="text-gray-600 px-1 text-xs">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setPage(totalPages)}
          className={`w-8 h-8 rounded-xl text-xs font-semibold transition ${
            page === totalPages ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0d0e12] text-white">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <span>Checking authorization...</span>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <AlertTriangle className="text-red-500" size={48} />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-gray-400">You do not have permission to access this page.</p>
      </div>
    );
  }

  const showingStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingEnd = Math.min(page * limit, total);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">HR Managers</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage administrative credentials, system roles, and portal access permissions.
          </p>
        </div>
        <div className="flex items-center space-x-3 self-start md:self-auto">
          {/* Add HR Manager */}
          <Link
            href="/register"
            className="flex items-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            <Plus size={14} className="mr-1.5" />
            Add HR Manager
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#161820] border border-gray-800 rounded-2xl p-5 gap-4 grid grid-cols-1 sm:grid-cols-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0d0e12] border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Role Select */}
        <div>
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#0d0e12] border border-gray-800 rounded-xl py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none transition appearance-none cursor-pointer"
          >
            <option value="">All Roles</option>
            <option value="admin">Super Admin</option>
            <option value="manager">HR Manager</option>
          </select>
        </div>

        {/* Status Select */}
        <div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full bg-[#0d0e12] border border-gray-800 rounded-xl py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none transition appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Showing counts */}
      <div className="flex items-center justify-between text-gray-400 text-xs px-1">
        <span>
          Showing <strong className="text-white">{showingStart}</strong> to{' '}
          <strong className="text-white">{showingEnd}</strong> of{' '}
          <strong className="text-white">{total.toLocaleString()}</strong> HR managers
        </span>
      </div>

      {/* Data Table */}
      <div className="bg-[#161820] border border-gray-800 rounded-2xl overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-[#12131a] text-gray-400">
                <th
                  className="py-4 px-5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none group hover:text-white"
                  onClick={() => handleSort('full_name')}
                >
                  <div className="flex items-center">
                    Full Name
                    {renderSortIcon('full_name')}
                  </div>
                </th>
                <th
                  className="py-4 px-5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none group hover:text-white"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center">
                    Email
                    {renderSortIcon('email')}
                  </div>
                </th>
                <th
                  className="py-4 px-5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none group hover:text-white"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center">
                    Role
                    {renderSortIcon('role')}
                  </div>
                </th>
                <th
                  className="py-4 px-5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none group hover:text-white"
                  onClick={() => handleSort('is_active')}
                >
                  <div className="flex items-center">
                    Status
                    {renderSortIcon('is_active')}
                  </div>
                </th>
                <th
                  className="py-4 px-5 text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none group hover:text-white"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center">
                    Created At
                    {renderSortIcon('created_at')}
                  </div>
                </th>
                <th className="py-4 px-5 text-[11px] font-semibold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="animate-spin text-blue-500" size={20} />
                      <span>Loading HR directory...</span>
                    </div>
                  </td>
                </tr>
              ) : managers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                    No HR Managers found matching search filters.
                  </td>
                </tr>
              ) : (
                managers.map((mgr) => (
                  <tr key={mgr.id} className="hover:bg-[#1f222e]/40 transition text-gray-300 text-xs">
                    <td className="py-3.5 px-5 font-medium text-white">{mgr.full_name}</td>
                    <td className="py-3.5 px-5 text-gray-400">{mgr.email}</td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                          mgr.role === 'admin'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}
                      >
                        {mgr.role === 'admin' ? 'Super Admin' : 'HR Manager'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                          mgr.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {mgr.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-gray-400">{formatDate(mgr.created_at)}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center space-x-2.5">
                        <Link
                          href={`/hr-managers/${mgr.id}/edit`}
                          className="p-1.5 bg-gray-800 hover:bg-violet-500/20 text-gray-400 hover:text-violet-400 rounded-lg transition"
                          title="Edit Record"
                        >
                          <Edit size={14} />
                        </Link>
                        {mgr.id !== user.id && (
                          <button
                            onClick={() => {
                              setDeleteId(mgr.id);
                              setDeleteError(null);
                            }}
                            className="p-1.5 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteId !== null && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-[#161820] border border-gray-800 rounded-2xl p-6 max-w-sm w-full space-y-6 shadow-2xl">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                  <AlertTriangle size={24} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white font-bold text-base">Delete HR Manager</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    Are you sure you want to delete this account? This action is permanent and will completely remove their access.
                  </p>
                </div>
              </div>

              {deleteError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start space-x-2 text-xs text-red-400">
                  <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setDeleteId(null)}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-xl transition flex items-center shadow-lg shadow-red-600/25 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={12} className="animate-spin mr-1.5" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Limit Selector */}
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span>Show</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-[#161820] border border-gray-800 text-white rounded-xl py-1.5 px-3 focus:outline-none transition appearance-none cursor-pointer"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entries per page</span>
          </div>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 bg-[#161820] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center space-x-1">
              {renderPaginationNumbers()}
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
  );
}
