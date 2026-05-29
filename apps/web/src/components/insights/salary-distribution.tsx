'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

interface DistributionItem {
  range: string;
  count: number;
  percentage: number;
}

interface SalaryDistributionProps {
  data: DistributionItem[];
}

export default function SalaryDistribution({ data }: SalaryDistributionProps) {
  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('en-US').format(val);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-gray-900 font-bold text-sm tracking-tight">Salary Distribution</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Distribution of active employees across standardized annual salary bands.
        </p>
      </div>

      <div className="h-72 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 24, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis
              dataKey="range"
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatNumber}
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
                typeof value === 'number' ? formatNumber(value) : String(value),
                'Employees',
              ]}
              labelStyle={{ fontWeight: 600, color: '#111827' }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50}>
              <LabelList
                dataKey="percentage"
                position="top"
                formatter={(val: unknown) => `${val}%`}
                style={{ fill: '#4b5563', fontSize: 10, fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
