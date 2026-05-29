'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/auth.context';
import api from '../../lib/axios';
import { Users, DollarSign, Globe, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  active_employees_count: number;
  inactive_employees_count: number;
  avg_salary: number;
  min_salary: number;
  max_salary: number;
  total_countries_with_employees: number;
  total_departments_with_employees: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/insights/dashboard');
        setStats(response.data);
      } catch (error) {
        console.error('Failed to load dashboard statistics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalEmployees = stats
    ? stats.active_employees_count + stats.inactive_employees_count
    : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Welcome back, {user?.full_name}!
        </h1>
        <p className="text-gray-400 mt-1">
          Here is a summary of the organizational workforce database statistics.
        </p>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Employees */}
        <div className="bg-[#161820] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/30 transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm font-medium">Total Directory Size</span>
            <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Users size={20} />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">
              {loading ? '...' : totalEmployees.toLocaleString()}
            </h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <span className="text-emerald-400 font-semibold mr-1">
                {stats ? stats.active_employees_count.toLocaleString() : 0}
              </span>
              active,{' '}
              <span className="text-gray-400 font-semibold ml-1">
                {stats ? stats.inactive_employees_count.toLocaleString() : 0}
              </span>{' '}
              inactive
            </p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 opacity-0 group-hover:opacity-100 transition duration-250" />
        </div>

        {/* Avg Salary */}
        <div className="bg-[#161820] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-violet-500/30 transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm font-medium">Average Salary</span>
            <span className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400">
              <DollarSign size={20} />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">
              {loading ? '...' : formatCurrency(stats?.avg_salary || 0)}
            </h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <TrendingUp size={12} className="text-violet-400 mr-1" />
              Annual average base rate
            </p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-violet-600 opacity-0 group-hover:opacity-100 transition duration-250" />
        </div>

        {/* Min/Max Range */}
        <div className="bg-[#161820] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/30 transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm font-medium">Salary Limits</span>
            <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp size={20} />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-bold text-white flex items-baseline space-x-1">
              <span>{loading ? '...' : formatCurrency(stats?.max_salary || 0)}</span>
              <span className="text-xs text-gray-400 font-normal">max</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <TrendingDown size={12} className="text-red-400 mr-1" />
              {loading ? '...' : formatCurrency(stats?.min_salary || 0)} min salary boundary
            </p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-emerald-600 opacity-0 group-hover:opacity-100 transition duration-250" />
        </div>

        {/* Global footprints */}
        <div className="bg-[#161820] border border-gray-800 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/30 transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm font-medium">Departments & Countries</span>
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Globe size={20} />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-white">
              {loading ? '...' : stats?.total_countries_with_employees.toLocaleString()}
            </h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              Across{' '}
              <span className="text-amber-400 font-semibold mx-1">
                {stats?.total_departments_with_employees}
              </span>{' '}
              functional divisions
            </p>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-[3px] bg-amber-600 opacity-0 group-hover:opacity-100 transition duration-250" />
        </div>
      </div>

      {/* Quick Links Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#161820]/50 border border-gray-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-gray-700 transition">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Workforce Directory</h3>
            <p className="text-gray-400 text-sm">
              Manage existing records, register new employees, update salary, and track change history records.
            </p>
          </div>
          <Link
            href="/employees"
            className="inline-flex items-center text-sm font-medium text-blue-400 hover:text-blue-300 mt-6 self-start group"
          >
            Manage Employees
            <ArrowRight size={16} className="ml-1.5 transform group-hover:translate-x-1 transition duration-200" />
          </Link>
        </div>

        <div className="bg-[#161820]/50 border border-gray-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-gray-700 transition">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Salary Analytics & Export</h3>
            <p className="text-gray-400 text-sm">
              Analyze salary distribution, check high paid structures, download CSV/Excel reports.
            </p>
          </div>
          <div className="flex space-x-4 mt-6">
            <Link
              href="/insights"
              className="inline-flex items-center text-sm font-medium text-violet-400 hover:text-violet-300 group"
            >
              Analytics
              <ArrowRight size={16} className="ml-1.5 transform group-hover:translate-x-1 transition duration-200" />
            </Link>
            <span className="text-gray-600">|</span>
            <Link
              href="/export"
              className="inline-flex items-center text-sm font-medium text-amber-400 hover:text-amber-300 group"
            >
              Export
              <ArrowRight size={16} className="ml-1.5 transform group-hover:translate-x-1 transition duration-200" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
