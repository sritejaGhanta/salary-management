'use client';

import React, { useState } from 'react';
import { Eye, Edit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { employeeColumns } from './employee-columns';

interface Employee {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  salary: number;
  currency?: string;
  joining_date: string;
  status: string;
  jobTitle?: { id: number; title: string };
  country?: { id: number; country: string };
  department?: { id: number; name: string };
}

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
  sortBy: string;
  order: 'ASC' | 'DESC';
  onSort: (field: string) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function EmployeeTable({
  employees,
  loading,
  sortBy,
  order,
  onSort,
  onDelete,
}: EmployeeTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    try {
      const code = (currency && currency.trim().length === 3) ? currency.trim().toUpperCase() : 'USD';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(amount);
      } catch {
        return `$${amount.toLocaleString('en-US')}`;
      }
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

  return (
    <div className="bg-[#161820] border border-gray-800 rounded-2xl overflow-hidden relative">
      <div className="overflow-x-auto w-full scrollbar-thin">
        <table className="w-full text-left border-collapse min-w-[600px] md:min-w-full">
          <thead>
            <tr className="border-b border-gray-800 bg-[#12131a] text-gray-400">
              {employeeColumns.map((col) => (
                <th
                  key={col.key}
                  className={`py-4 px-5 text-[11px] font-semibold uppercase tracking-wider ${col.className || ''} ${
                    col.sortable ? 'cursor-pointer select-none group hover:text-white' : ''
                  }`}
                  onClick={() => col.sortable && onSort(col.key)}
                >
                  <div className="flex items-center">
                    {col.label}
                    {col.sortable && renderSortIcon(col.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/60">
            {loading ? (
              <tr>
                <td colSpan={employeeColumns.length} className="py-12 text-center text-gray-500 text-sm">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="animate-spin text-blue-500" size={20} />
                    <span>Loading employee directory...</span>
                  </div>
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={employeeColumns.length} className="py-12 text-center text-gray-500 text-sm">
                  No records found matching search filters.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#1f222e]/40 transition text-gray-300 text-xs">
                  <td className="py-3.5 px-5 font-medium text-white">{emp.full_name}</td>
                  <td className="py-3.5 px-5 text-gray-400 hidden md:table-cell">{emp.email}</td>
                  <td className="py-3.5 px-5">{emp.jobTitle?.title || '-'}</td>
                  <td className="py-3.5 px-5 hidden md:table-cell">{emp.department?.name || '-'}</td>
                  <td className="py-3.5 px-5 hidden md:table-cell">{emp.country?.country || '-'}</td>
                  <td className="py-3.5 px-5 font-mono text-emerald-400 font-semibold">
                    {formatCurrency(emp.salary, emp.currency)}
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        emp.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-gray-400 hidden lg:table-cell">{formatDate(emp.joining_date)}</td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center space-x-2.5">
                      <Link
                        href={`/employees/${emp.id}`}
                        className="p-1.5 bg-gray-800 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </Link>
                      <Link
                        href={`/employees/${emp.id}/edit`}
                        className="p-1.5 bg-gray-800 hover:bg-violet-500/20 text-gray-400 hover:text-violet-400 rounded-lg transition"
                        title="Edit Record"
                      >
                        <Edit size={14} />
                      </Link>
                      <button
                        onClick={() => setDeleteId(emp.id)}
                        className="p-1.5 bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition"
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#161820] border border-gray-800 rounded-2xl p-6 max-w-sm w-full space-y-6 shadow-2xl animate-fade-in">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-white font-bold text-base">Confirm Deactivation</h3>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Are you sure you want to delete this employee? This will change their status to <strong>inactive</strong> in the repository.
                </p>
              </div>
            </div>

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
                    Deactivating...
                  </>
                ) : (
                  'Deactivate'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
