'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { ArrowUpDown, Globe, Loader2 } from 'lucide-react';

interface CountryItem {
  id: number;
  country: string;
}

interface CountryStats {
  country: string;
  min_salary: number;
  max_salary: number;
  avg_salary: number;
  employee_count: number;
}

export default function SalaryByCountry() {
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [stats, setStats] = useState<CountryStats[]>([]);
  const [loading, setLoading] = useState(true);

  // Sorting state
  const [sortField, setSortField] = useState<keyof CountryStats>('avg_salary');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const res = await api.get('/employees/meta/countries');
        setCountries(res.data);
      } catch (err) {
        console.error('Failed to load countries list:', err);
      }
    };
    loadCountries();
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const url = selectedCountryId
          ? `/insights/salary-by-country?countryId=${selectedCountryId}`
          : '/insights/salary-by-country';
        const res = await api.get(url);
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load country salary stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [selectedCountryId]);

  const handleSort = (field: keyof CountryStats) => {
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
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col h-[480px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
        <div>
          <h3 className="text-gray-900 font-bold text-sm tracking-tight flex items-center">
            <Globe className="text-blue-500 mr-2" size={16} />
            Salary by Country
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Comparative metrics across countries.</p>
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
            <span className="text-xs">Fetching country analytics...</span>
          </div>
        ) : sortedStats.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
            No statistics recorded for this region.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 font-semibold uppercase tracking-wider">
                <th
                  onClick={() => handleSort('country')}
                  className="py-2.5 px-2 cursor-pointer hover:text-gray-900 transition"
                >
                  <div className="flex items-center space-x-1">
                    <span>Country</span>
                    <ArrowUpDown size={12} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('min_salary')}
                  className="py-2.5 px-2 cursor-pointer hover:text-gray-900 transition text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Min</span>
                    <ArrowUpDown size={12} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('max_salary')}
                  className="py-2.5 px-2 cursor-pointer hover:text-gray-900 transition text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Max</span>
                    <ArrowUpDown size={12} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('avg_salary')}
                  className="py-2.5 px-2 cursor-pointer hover:text-gray-900 transition text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Average</span>
                    <ArrowUpDown size={12} className="text-gray-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('employee_count')}
                  className="py-2.5 px-2 cursor-pointer hover:text-gray-900 transition text-right"
                >
                  <div className="flex items-center justify-end space-x-1">
                    <span>Employees</span>
                    <ArrowUpDown size={12} className="text-gray-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {sortedStats.map((s, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition">
                  <td className="py-3 px-2 font-medium text-gray-900">{s.country}</td>
                  <td className="py-3 px-2 font-mono text-right">{formatCurrency(s.min_salary)}</td>
                  <td className="py-3 px-2 font-mono text-right">{formatCurrency(s.max_salary)}</td>
                  <td className="py-3 px-2 font-mono font-semibold text-gray-900 text-right">{formatCurrency(s.avg_salary)}</td>
                  <td className="py-3 px-2 font-medium text-right text-gray-500">{s.employee_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
