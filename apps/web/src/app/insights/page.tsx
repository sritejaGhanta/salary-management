'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { Loader2, RefreshCw } from 'lucide-react';
import DashboardStats from '../../components/insights/dashboard-stats';
import SalaryDistribution from '../../components/insights/salary-distribution';
import SalaryByCountry from '../../components/insights/salary-by-country';
import TopPaidEmployees from '../../components/insights/top-paid-employees';
import SalaryByDepartment from '../../components/insights/salary-by-department';
import SalaryByJobTitle from '../../components/insights/salary-by-job-title';

interface DashboardStatsData {
  active_employees_count: number;
  inactive_employees_count: number;
  avg_salary: number;
  min_salary: number;
  max_salary: number;
  total_countries_with_employees: number;
  total_departments_with_employees: number;
}

interface DistributionItem {
  range: string;
  count: number;
  percentage: number;
}

export default function InsightsPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsData | null>(null);
  const [distributionData, setDistributionData] = useState<DistributionItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, distRes] = await Promise.all([
        api.get('/insights/dashboard'),
        api.get('/insights/salary-distribution'),
      ]);
      setDashboardStats(statsRes.data);
      setDistributionData(distRes.data);
    } catch (err) {
      console.error('Failed to load insights datasets:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-gray-500">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <span>Fetching insights and compiling statistics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Insights Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time salary distribution charts, department averages, country comparisons, and compensation analytics.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center text-xs font-semibold text-gray-300 hover:text-white bg-[#161820] border border-gray-800 hover:border-gray-700 px-4 py-2.5 rounded-xl transition disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={`mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Section 1: Dashboard Stats Cards */}
      {dashboardStats && <DashboardStats data={dashboardStats} />}

      {/* Section 2: Salary Distribution Bar Chart */}
      {distributionData && <SalaryDistribution data={distributionData} />}

      {/* Section 3: Two Column Layout - Country Table & Top Paid List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalaryByCountry />
        <TopPaidEmployees />
      </div>

      {/* Section 4: Two Column Layout - Department Chart & Job Title Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalaryByDepartment />
        <SalaryByJobTitle />
      </div>
    </div>
  );
}
