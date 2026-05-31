'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { Award, Loader2 } from 'lucide-react';

interface CountryItem {
  id: number;
  country: string;
}

interface TopEmployee {
  id: number;
  full_name: string;
  salary: number;
  currency: string;
  job_title: string | null;
  country: string | null;
}

export default function TopPaidEmployees() {
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [employees, setEmployees] = useState<TopEmployee[]>([]);
  const [loading, setLoading] = useState(true);

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
    const loadEmployees = async () => {
      setLoading(true);
      try {
        const url = selectedCountryId
          ? `/insights/top-paid?countryId=${selectedCountryId}&limit=10`
          : '/insights/top-paid?limit=10';
        const res = await api.get(url);
        setEmployees(res.data);
      } catch (err) {
        console.error('Failed to load top paid employees:', err);
      } finally {
        setLoading(false);
      }
    };
    loadEmployees();
  }, [selectedCountryId]);

  const formatCurrency = (val: number, currency = 'USD') => {
    try {
      const code = (currency && currency.trim().length === 3) ? currency.trim().toUpperCase() : 'USD';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        maximumFractionDigits: 0,
      }).format(val);
    } catch {
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        }).format(val);
      } catch {
        return `$${val.toLocaleString('en-US')}`;
      }
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col h-[480px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
        <div>
          <h3 className="text-gray-900 font-bold text-sm tracking-tight flex items-center">
            <Award className="text-amber-500 mr-2" size={16} />
            Top 10 Paid Employees
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Highest earners within the organization.</p>
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
            <span className="text-xs">Loading leaderboards...</span>
          </div>
        ) : employees.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
            No employees registered in this region.
          </div>
        ) : (
          <div className="space-y-3.5 pr-1">
            {employees.map((emp, idx) => (
              <div
                key={emp.id}
                className="flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl transition"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-500 font-semibold text-xs flex items-center justify-center flex-shrink-0">
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{emp.full_name}</h4>
                    <p className="text-[10px] text-gray-500 truncate">
                      {emp.job_title || 'Unassigned'} • {emp.country || 'Unknown'}
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1 font-mono">
                    {formatCurrency(emp.salary, emp.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
