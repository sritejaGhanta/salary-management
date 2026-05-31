'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/auth.context';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Lock, Mail, User, Shield } from 'lucide-react';
import Link from 'next/link';
import api from '../../lib/axios';

const registerSchema = z.object({
  full_name: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['admin', 'manager']),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        setErrorMsg('Access denied: You must be logged in as an admin to register new accounts.');
      }
    }
  }, [user, loading, router]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      role: 'manager',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    if (!user || user.role !== 'admin') {
      setErrorMsg('Access denied: Admin role required');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);
    try {
      await api.post('/auth/register', data);
      setSuccessMsg(`HR Manager account for ${data.full_name} created successfully! Redirecting...`);
      reset();
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: unknown) {
      console.error(err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setErrorMsg(axiosError.response?.data?.message || 'Failed to create account. Please check details.');
      } else {
        setErrorMsg('Failed to create account. Please check details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0d0e12] text-white">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <span>Loading...</span>
      </div>
    );
  }

  // If user is not an admin, we show a restricted screen with a back option
  const isNotAdmin = !user || user.role !== 'admin';

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#0d0e12] relative overflow-hidden px-4">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-blue-500/10 blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[150px]" />

      <div className="w-full max-w-md bg-[#161820]/80 border border-gray-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl z-10 transition-all duration-300 hover:border-blue-500/30">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 text-white mb-4 shadow-lg shadow-blue-500/20">
            <span className="font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create HR Account</h1>
          <p className="text-gray-400 text-sm mt-1">Admin access required</p>
        </div>

        {isNotAdmin ? (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-400 text-sm text-center">
              You must be logged in as an <strong>admin</strong> to register new HR accounts.
            </div>
            <Link
              href="/dashboard"
              className="w-full flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-xl transition duration-250 text-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <>
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-400 text-sm">
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-sm">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2" htmlFor="full_name">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <User size={18} />
                  </span>
                  <input
                    id="full_name"
                    type="text"
                    placeholder="HR Manager"
                    className={`w-full bg-[#0d0e12]/60 border ${
                      errors.full_name ? 'border-red-500 focus:border-red-500' : 'border-gray-800 focus:border-blue-500'
                    } rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition duration-250 text-sm`}
                    {...register('full_name')}
                  />
                </div>
                {errors.full_name && (
                  <span className="text-xs text-red-500 mt-1 block">{errors.full_name.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Mail size={18} />
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="hr1@salary.com"
                    className={`w-full bg-[#0d0e12]/60 border ${
                      errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-800 focus:border-blue-500'
                    } rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition duration-250 text-sm`}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Lock size={18} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full bg-[#0d0e12]/60 border ${
                      errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-800 focus:border-blue-500'
                    } rounded-xl py-3 pl-10 pr-10 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition duration-250 text-sm`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-xs text-red-500 mt-1 block">{errors.password.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2" htmlFor="role">
                  Role
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Shield size={18} />
                  </span>
                  <select
                    id="role"
                    className="w-full bg-[#0d0e12]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition duration-250 text-sm appearance-none"
                    {...register('role')}
                  >
                    <option value="manager" className="bg-[#161820]">HR Manager</option>
                    <option value="admin" className="bg-[#161820]">Super Admin</option>
                  </select>
                </div>
                {errors.role && (
                  <span className="text-xs text-red-500 mt-1 block">{errors.role.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-xl transition duration-250 shadow-lg shadow-blue-600/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-sm mt-8"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>

              <div className="text-center mt-4">
                <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition duration-200">
                  Back to Dashboard
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
