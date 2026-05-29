'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '../../../lib/axios';
import { ArrowLeft, Edit, Loader2, Mail, Phone, Calendar, Shield, DollarSign, MapPin, Briefcase, History } from 'lucide-react';
import Link from 'next/link';

interface EmployeeDetail {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  salary: number;
  currency?: string;
  joining_date: string;
  status: string;
  jobTitle?: { title: string };
  country?: { country: string };
  state?: { state: string };
  department?: { name: string };
  addedBy?: { full_name: string };
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

export default function ViewEmployeePage() {
  const params = useParams();
  const id = params?.id;

  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [history, setHistory] = useState<SalaryHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
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
        <span>Loading employee profile from database...</span>
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
      {/* Header Navigation */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-5">
        <div className="flex items-center space-x-3">
          <Link
            href="/employees"
            className="p-2 bg-[#161820] border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white rounded-xl transition"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Employee Details</h1>
            <p className="text-gray-400 text-xs mt-1">Detailed employee overview, department, and salary logs.</p>
          </div>
        </div>

        <Link
          href={`/employees/${id}/edit`}
          className="flex items-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/20"
        >
          <Edit size={14} className="mr-1.5" />
          Edit Employee
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <div className="bg-[#161820] border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 md:col-span-1">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 text-white flex items-center justify-center font-bold text-3xl shadow-xl shadow-blue-500/10">
            {employee.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white leading-snug">{employee.full_name}</h2>
            <p className="text-xs text-gray-400">{employee.jobTitle?.title || 'No Job Title Assigned'}</p>
          </div>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${
              employee.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {employee.status}
          </span>
          <div className="w-full border-t border-gray-800/80 pt-4 space-y-3.5 text-left text-xs text-gray-400">
            <div className="flex items-center">
              <Mail size={14} className="text-gray-500 mr-2.5 flex-shrink-0" />
              <span className="truncate text-white">{employee.email}</span>
            </div>
            {employee.phone && (
              <div className="flex items-center">
                <Phone size={14} className="text-gray-500 mr-2.5 flex-shrink-0" />
                <span className="text-white">{employee.phone}</span>
              </div>
            )}
            <div className="flex items-center">
              <Calendar size={14} className="text-gray-500 mr-2.5 flex-shrink-0" />
              <span>Joined: <strong className="text-white">{formatDate(employee.joining_date)}</strong></span>
            </div>
            <div className="flex items-center">
              <Shield size={14} className="text-gray-500 mr-2.5 flex-shrink-0" />
              <span>Added By: <strong className="text-white">{employee.addedBy?.full_name || 'System/Admin'}</strong></span>
            </div>
          </div>
        </div>

        {/* Detailed Info Cards */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#161820] border border-gray-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-white font-bold text-sm border-b border-gray-800 pb-3 flex items-center">
              <Briefcase size={16} className="text-violet-500 mr-2" />
              Employment Info
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-xs text-gray-400">
              <div className="space-y-1">
                <span>Department</span>
                <p className="text-sm font-semibold text-white">{employee.department?.name || '-'}</p>
              </div>
              <div className="space-y-1">
                <span>Job Title</span>
                <p className="text-sm font-semibold text-white">{employee.jobTitle?.title || '-'}</p>
              </div>
              <div className="space-y-1">
                <span>Country Location</span>
                <p className="text-sm font-semibold text-white flex items-center">
                  <MapPin size={12} className="text-emerald-400 mr-1" />
                  {employee.country?.country || '-'}
                </p>
              </div>
              <div className="space-y-1">
                <span>State / Province</span>
                <p className="text-sm font-semibold text-white">{employee.state?.state || '-'}</p>
              </div>
            </div>
          </div>

          {/* Salary details card */}
          <div className="bg-[#161820] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-bold text-sm border-b border-gray-800 pb-3 flex items-center">
              <DollarSign size={16} className="text-amber-500 mr-2" />
              Current Compensation
            </h3>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-white font-mono">
                {formatCurrency(employee.salary, employee.currency)}
              </span>
              <span className="text-sm text-gray-500 uppercase tracking-widest">{employee.currency}</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-normal">
              Annualized base salary rate in local currencies. Changes are recorded in compliance auditing logs.
            </p>
          </div>
        </div>
      </div>

      {/* Salary history table */}
      <div className="bg-[#161820] border border-gray-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-white font-bold text-sm flex items-center border-b border-gray-800 pb-3">
          <History className="text-amber-500 mr-2" size={16} />
          Salary History Log
        </h3>
        {history.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No adjustments recorded for this employee profile.</p>
        ) : (
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
                      <td className="py-3 px-3 text-gray-400">{formatDateTime(h.changed_at)}</td>
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
        )}
      </div>
    </div>
  );
}
