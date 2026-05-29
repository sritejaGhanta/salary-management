'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { ArrowUpDown, Shield, Loader2 } from 'lucide-react';

interface CountryItem {
  id: number;
  country: string;
}

interface JobTitleStats {
  job_title: string;
  country: string;
  avg_salary: number;
  employee_count: number;
}

export default function SalaryByJobTitle() {
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [stats, setStats] = useState<JobTitleStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Sorting state
  const [sortField, setSortField] = useState<keyof JobTitleStats>('avg_salary');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await api.get('/employees/meta/countries');
        setCountries(res.data);
      } catch (err) {
        console.error('Failed to load countries:', err);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const url = selectedCountryId
          ? `/insights/salary-by-job-title?countryId=${selectedCountryId}`
          : '/insights/salary-by-job-title';
        const res = await api.get(url);
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load job title stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [selectedCountryId]);

  const handleSort = (field: keyof JobTitleStats) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedStats = [...stats].sort((a, b) => {
    const valA = a[sortField];
    const valB = b[sortField];

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    }
    return 0;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col h-[400px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
        <div>
          <h3 className="text-gray-900 font-bold text-sm tracking-tight flex items-center">
            <Shield className="text-blue-500 mr-2" size={16} />
            Salary by Job Title
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Average salary benchmarks by job position.</p>
        </div>
        <select
          value={selectedCountryId}
          onChange={(e) => setSelectedCountryId(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-xl py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500/50 appearance-none"
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c.id} value={c.id}>
              {c.country}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Loader2 className="animate-spin text-blue-500 mr-2" size={18} />
            <span className="text-xs">Fetching job position metrics...</span>
          </div>
        ) : sortedStats.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
            No statistics recorded for job positions.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <th
                  onClick={() => handleSort('job_title')}
                  className="py-2 px-2 cursor-pointer hover:text-gray-900 transition"
                >
                  <div className="flex items-center space-x-1">
                    <span>Job Title</span>
                    <ArrowUpDown size={11} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('country')}
                  className="py-2 px-2 cursor-pointer hover:text-gray-900 transition"
                >
                  <div className="flex items-center space-x-1">
                    <span>Country</span>
                    <ArrowUpDown size={11} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avg_salary')}
                  className="py-2 px-2 cursor-pointer hover:text-gray-900 transition text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Avg Salary</span>
                    <ArrowUpDown size={11} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('employee_count')}
                  className="py-2 px-2 cursor-pointer hover:text-gray-900 transition text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Employees</span>
                    <ArrowUpDown size={11} className="text-gray-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {sortedStats.map((s, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition">
                  <td className="py-2.5 px-2 font-medium text-gray-900">{s.job_title}</td>
                  <td className="py-2.5 px-2 text-gray-500">{s.country}</td>
                  <td className="py-2.5 px-2 font-mono font-semibold text-gray-900 text-right">{formatCurrency(s.avg_salary)}</td>
                  <td className="py-2.5 px-2 font-medium text-right text-gray-500">{s.employee_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
