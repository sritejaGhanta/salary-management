'use client';

import React from 'react';
import { Users, UserX, TrendingUp, ArrowUpRight, ArrowDownRight, Globe } from 'lucide-react';

interface DashboardStatsProps {
  data: {
    active_employees_count: number;
    inactive_employees_count: number;
    avg_salary: number;
    min_salary: number;
    max_salary: number;
    total_countries_with_employees: number;
    total_departments_with_employees: number;
  };
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const stats = [
    {
      title: 'Total Active Employees',
      value: formatNumber(data.active_employees_count),
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'Total Inactive Employees',
      value: formatNumber(data.inactive_employees_count),
      icon: UserX,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-100',
    },
    {
      title: 'Average Salary',
      value: formatCurrency(data.avg_salary),
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-100',
    },
    {
      title: 'Highest Salary',
      value: formatCurrency(data.max_salary),
      icon: ArrowUpRight,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-100',
    },
    {
      title: 'Lowest Salary',
      value: formatCurrency(data.min_salary),
      icon: ArrowDownRight,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
    },
    {
      title: 'Countries with Employees',
      value: formatNumber(data.total_countries_with_employees),
      icon: Globe,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className={`bg-white border ${stat.borderColor} rounded-2xl p-4 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 tracking-tight leading-none">
                {stat.title}
              </span>
              <div className={`p-2 rounded-xl ${stat.bgColor} ${stat.color}`}>
                <Icon size={16} />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold text-gray-900 tracking-tight leading-none">
                {stat.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
