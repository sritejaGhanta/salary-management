'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../../lib/axios';
import { ArrowLeft, Loader2, History } from 'lucide-react';
import Link from 'next/link';
import EmployeeForm from '../../../../components/employees/employee-form';

interface EmployeeDetail {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  salary: number;
  currency?: string;
  joining_date: string;
  status: string;
  job_title_id?: number;
  department_id?: number;
  country_id?: number;
  state_id?: number;
}

interface SalaryHistoryItem {
  id: number;
  old_salary: number;
  new_salary: number;
  changed_at: string;
  changedBy?: {
    id: number;
    full_name: string;
  };
}

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [history, setHistory] = useState<SalaryHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const [empRes, histRes] = await Promise.all([
          api.get(`/employees/${id}`),
          api.get(`/employees/${id}/salary-history`),
        ]);
        setEmployee(empRes.data);
        setHistory(histRes.data);
      } catch (err) {
        console.error('Failed to load employee details:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    await api.put(`/employees/${id}`, data);
    setSuccess('Employee record updated successfully! Redirecting...');
    setTimeout(() => {
      router.push('/employees');
    }, 1500);
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
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-gray-500">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <span>Fetching employee record from registry...</span>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-8 text-center text-red-400 bg-red-950/20 border border-red-800/40 rounded-2xl max-w-md mx-auto mt-12">
        Employee record not found.
        <div className="mt-4">
          <Link href="/employees" className="text-sm text-blue-400 hover:text-blue-300">
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-5">
        <div className="flex items-center space-x-3">
          <Link
            href="/employees"
            className="p-2 bg-[#161820] border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white rounded-xl transition"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Edit Employee Profile</h1>
            <p className="text-gray-400 text-xs mt-1">Modify account details, roles, or adjustment rates.</p>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-sm">
          {success}
        </div>
      )}

      {/* Edit Form */}
      <EmployeeForm mode="edit" initialData={employee} onSubmit={handleSubmit} />

      {/* Salary history table if changed before */}
      {history.length > 0 && (
        <div className="bg-[#161820] border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold text-sm flex items-center border-b border-gray-800 pb-3">
            <History className="text-amber-500 mr-2" size={16} />
            Salary Adjustments History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-800 text-gray-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Previous Salary</th>
                  <th className="py-2.5 px-3">Adjusted Salary</th>
                  <th className="py-2.5 px-3">Increase Amount</th>
                  <th className="py-2.5 px-3">Approved By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40 text-gray-300">
                {history.map((h) => {
                  const diff = h.new_salary - h.old_salary;
                  return (
                    <tr key={h.id} className="hover:bg-[#1f222e]/20 transition">
                      <td className="py-3 px-3 text-gray-400">{formatDate(h.changed_at)}</td>
                      <td className="py-3 px-3 font-mono">{formatCurrency(h.old_salary, employee.currency)}</td>
                      <td className="py-3 px-3 font-mono text-white font-semibold">{formatCurrency(h.new_salary, employee.currency)}</td>
                      <td className={`py-3 px-3 font-mono font-medium ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {diff >= 0 ? '+' : ''}{formatCurrency(diff, employee.currency)}
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-400">{h.changedBy?.full_name || 'System / Admin'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
