'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Briefcase, Loader2 } from 'lucide-react';

interface DepartmentStats {
  department: string;
  avg_salary: number;
  min_salary: number;
  max_salary: number;
  employee_count: number;
}

export default function SalaryByDepartment() {
  const [stats, setStats] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/insights/salary-by-department');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load department stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col h-[400px]">
      <div className="border-b border-gray-100 pb-4 mb-4">
        <h3 className="text-gray-900 font-bold text-sm tracking-tight flex items-center">
          <Briefcase className="text-violet-500 mr-2" size={16} />
          Salary by Department
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">Average salary benchmarks across departments.</p>
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Loader2 className="animate-spin text-blue-500 mr-2" size={18} />
            <span className="text-xs">Generating chart logs...</span>
          </div>
        ) : stats.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-xs">
            No statistics recorded for departments.
          </div>
        ) : (
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={stats}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                <XAxis
                  type="number"
                  stroke="#9ca3af"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <YAxis
                  type="category"
                  dataKey="department"
                  stroke="#4b5563"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  width={90}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #f3f4f6',
                    borderRadius: '12px',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: unknown) => [
                    typeof value === 'number' ? formatCurrency(value) : String(value),
                    'Average Salary',
                  ]}
                  labelStyle={{ fontWeight: 600, color: '#111827' }}
                />
                <Bar dataKey="avg_salary" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={25} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
