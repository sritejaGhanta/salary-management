'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/axios';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import EmployeeForm from '../../../components/employees/employee-form';

export default function NewEmployeePage() {
  const router = useRouter();
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (data: Record<string, unknown>) => {
    // Send request to API
    await api.post('/employees', data);
    setSuccess('Employee record created successfully! Redirecting...');
    setTimeout(() => {
      router.push('/employees');
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
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
            <h1 className="text-2xl font-bold text-white tracking-tight">Add New Employee</h1>
            <p className="text-gray-400 text-xs mt-1">Register a new profile in the organization workforce database.</p>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-sm">
          {success}
        </div>
      )}

      {/* Form wrap */}
      <EmployeeForm mode="create" onSubmit={handleSubmit} />
    </div>
  );
}
