'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../../lib/axios';
import { ArrowLeft, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../../context/auth.context';

export default function EditHRManagerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const { user, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('manager');
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Authorization check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Load initial data
  useEffect(() => {
    if (!id || !user || user.role !== 'admin') return;

    const loadManager = async () => {
      try {
        const response = await api.get(`/hr-managers/${id}`);
        const data = response.data;
        setFullName(data.full_name || '');
        setEmail(data.email || '');
        setRole(data.role || 'manager');
        setIsActive(data.is_active ?? true);
      } catch (err) {
        console.error('Failed to load HR manager:', err);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setError((err as any).response?.data?.message || 'HR manager record not found.');
      } finally {
        setLoading(false);
      }
    };

    loadManager();
  }, [id, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload: Record<string, unknown> = {
        full_name: fullName,
        email,
        is_active: isActive,
      };

      // Disable sending role if editing self (prevent self-demotion on backend side too)
      if (Number(id) !== Number(user?.id)) {
        payload.role = role;
      }

      await api.put(`/hr-managers/${id}`, payload);
      setSuccess('HR Manager details updated successfully! Redirecting...');
      setTimeout(() => {
        router.push('/hr-managers');
      }, 1500);
    } catch (err) {
      console.error(err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setError((err as any).response?.data?.message || 'Failed to update HR Manager.');
    } finally {
      setSaving(false);
    }
  };

  const isSelf = Number(id) === Number(user?.id);

  if (authLoading || (loading && !error)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0d0e12] text-white">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <span>Fetching HR Manager details...</span>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <AlertTriangle className="text-red-500" size={48} />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-gray-400">You do not have permission to access this page.</p>
      </div>
    );
  }

  if (error && !fullName) {
    return (
      <div className="p-8 text-center text-red-400 bg-red-950/20 border border-red-800/40 rounded-2xl max-w-md mx-auto mt-12 space-y-4">
        <AlertTriangle className="mx-auto text-red-500" size={32} />
        <p>{error}</p>
        <div>
          <Link href="/hr-managers" className="text-sm text-blue-400 hover:text-blue-300 flex items-center justify-center">
            <ArrowLeft size={14} className="mr-1" /> Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-5">
        <div className="flex items-center space-x-3">
          <Link
            href="/hr-managers"
            className="p-2 bg-[#161820] border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white rounded-xl transition"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Edit HR Manager</h1>
            <p className="text-gray-400 text-xs mt-1">Modify account details, roles, or portal access status.</p>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-sm flex items-center space-x-2">
          <ShieldCheck size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-400 text-sm flex items-center space-x-2">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-[#161820] border border-gray-800 rounded-2xl p-6 space-y-6">
        <div className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#0d0e12] border border-gray-800 rounded-xl py-2 px-3.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0d0e12] border border-gray-800 rounded-xl py-2 px-3.5 text-xs text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition"
            />
          </div>

          {/* Role selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-400">System Role</label>
              {isSelf && (
                <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                  Cannot modify own role
                </span>
              )}
            </div>
            <select
              value={role}
              disabled={isSelf}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#0d0e12] border border-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none transition appearance-none cursor-pointer"
            >
              <option value="admin">Super Admin</option>
              <option value="manager">HR Manager</option>
            </select>
          </div>

          {/* Account Status Switch */}
          <div className="flex items-center justify-between p-4 bg-[#0d0e12] border border-gray-800 rounded-xl mt-6">
            <div>
              <label className="text-xs font-semibold text-white">Active Status</label>
              <p className="text-gray-500 text-[10px] mt-0.5">Toggle status to disable access without deleting.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isActive ? 'bg-blue-600' : 'bg-gray-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isActive ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-800">
          <Link
            href="/hr-managers"
            className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition flex items-center shadow-lg shadow-blue-600/25 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={12} className="animate-spin mr-1.5" />
                Updating...
              </>
            ) : (
              'Update details'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
