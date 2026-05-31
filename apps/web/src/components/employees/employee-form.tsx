'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '../../lib/axios';
import { Loader2, Save, Briefcase, MapPin, User, DollarSign } from 'lucide-react';
import Link from 'next/link';

const employeeSchema = z.object({
  full_name: z.string()
    .min(2, { message: 'Full name must be at least 2 characters' })
    .max(150, { message: 'Full name cannot exceed 150 characters' })
    .regex(/^[a-zA-Z\s.-]+$/, { message: 'Full name can only contain letters, spaces, dots, and hyphens' }),
  email: z.string()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address' })
    .max(100, { message: 'Email cannot exceed 100 characters' }),
  phone: z.string().max(20, { message: 'Phone number cannot exceed 20 characters' }).optional().or(z.literal('')),
  job_title_id: z.coerce.number().min(1, { message: 'Job title is required' }),
  department_id: z.coerce.number().min(1, { message: 'Department is required' }),
  country_id: z.coerce.number().min(1, { message: 'Country is required' }),
  state_id: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined || Number(val) === 0 || isNaN(Number(val))) {
        return undefined;
      }
      return Number(val);
    },
    z.number().optional()
  ),
  salary: z.coerce.number({ message: 'Salary must be a number' })
    .min(0.01, { message: 'Salary must be greater than 0' })
    .max(9999999999.99, { message: 'Salary cannot exceed 9,999,999,999.99' }),
  currency: z.string()
    .length(3, { message: 'Currency must be exactly 3 characters' })
    .regex(/^[A-Za-z]{3}$/, { message: 'Currency must contain only letters' })
    .transform((val) => val.toUpperCase()),
  joining_date: z.string()
    .min(1, { message: 'Joining date is required' })
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, { message: 'Invalid date format' })
    .refine((val) => {
      const date = new Date(val);
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 5);
      return date <= maxDate;
    }, { message: 'Joining date cannot be more than 5 years in the future' }),
  status: z.enum(['active', 'inactive']),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface CountryItem {
  id: number;
  country: string;
  currency?: string;
}

interface StateItem {
  id: number;
  state: string;
}

interface MetaItem {
  id: number;
  name?: string;
  title?: string;
}

interface EmployeeFormProps {
  mode: 'create' | 'edit';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData?: any;
  onSubmit: (data: EmployeeFormValues) => Promise<void>;
}

export default function EmployeeForm({ mode, initialData, onSubmit }: EmployeeFormProps) {
  const [countries, setCountries] = useState<CountryItem[]>([]);
  const [states, setStates] = useState<StateItem[]>([]);
  const [departments, setDepartments] = useState<MetaItem[]>([]);
  const [jobTitles, setJobTitles] = useState<MetaItem[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingStates, setLoadingStates] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      job_title_id: 0,
      department_id: 0,
      country_id: 0,
      state_id: undefined,
      salary: 0,
      currency: 'USD',
      joining_date: new Date().toISOString().split('T')[0],
      status: 'active',
    },
  });

  const selectedCountryId = watch('country_id');

  // Load initial dropdowns
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [countriesRes, deptsRes, jobsRes] = await Promise.all([
          api.get('/employees/meta/countries'),
          api.get('/employees/meta/departments'),
          api.get('/employees/meta/job-titles'),
        ]);
        setCountries(countriesRes.data);
        setDepartments(deptsRes.data);
        setJobTitles(jobsRes.data);

        // Pre-populate if editing
        if (mode === 'edit' && initialData) {
          setValue('full_name', initialData.full_name || '');
          setValue('email', initialData.email || '');
          setValue('phone', initialData.phone || '');
          setValue('job_title_id', initialData.job_title_id || initialData.jobTitle?.id || 0);
          setValue('department_id', initialData.department_id || initialData.department?.id || 0);
          setValue('country_id', initialData.country_id || initialData.country?.id || 0);
          setValue('salary', initialData.salary || 0);
          setValue('currency', initialData.currency || 'USD');
          
          if (initialData.joining_date) {
            setValue('joining_date', new Date(initialData.joining_date).toISOString().split('T')[0]);
          }
          setValue('status', initialData.status === 'active' ? 'active' : 'inactive');
        }
      } catch (err) {
        console.error('Failed to load form metadata:', err);
        setErrorMsg('Failed to load setup parameters from the API.');
      } finally {
        setLoadingMeta(false);
      }
    };
    fetchMetadata();
  }, [mode, initialData, setValue]);

  // Handle Country -> State cascade and currency defaults
  useEffect(() => {
    if (!selectedCountryId) {
      setStates([]);
      return;
    }

    const loadStates = async () => {
      setLoadingStates(true);
      try {
        const res = await api.get(`/employees/meta/states?countryId=${selectedCountryId}`);
        setStates(res.data);

        // Set default state if editing and state belongs to this country
        if (mode === 'edit' && initialData && initialData.country_id === Number(selectedCountryId)) {
          setValue('state_id', initialData.state_id || initialData.state?.id || undefined);
        } else {
          setValue('state_id', undefined);
        }

        // Set currency based on selected country
        const match = countries.find((c) => c.id === Number(selectedCountryId));
        if (match && match.currency) {
          setValue('currency', match.currency);
        }
      } catch (err) {
        console.error('Failed to load states:', err);
      } finally {
        setLoadingStates(false);
      }
    };

    if (countries.length > 0) {
      loadStates();
    }
  }, [selectedCountryId, countries, mode, initialData, setValue]);

  const handleFormSubmit = async (data: EmployeeFormValues) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (err: unknown) {
      console.error(err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string | string[] } } };
        const msg = axiosError.response?.data?.message;
        setErrorMsg(
          Array.isArray(msg) ? msg.join(', ') : msg || 'Failed to submit form. Please check validations.'
        );
      } else {
        setErrorMsg('Failed to submit form. Please check validations.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingMeta) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-500">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <span>Loading metadata configuration...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-400 text-sm">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Personal Details */}
        <div className="bg-[#161820] border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold text-sm flex items-center border-b border-gray-800 pb-3">
            <User className="text-blue-500 mr-2" size={16} />
            Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                className={`w-full bg-[#0d0e12]/60 border ${
                  errors.full_name ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
                } rounded-xl py-2.5 px-4 text-white placeholder-gray-600 focus:outline-none transition text-sm`}
                {...register('full_name')}
              />
              {errors.full_name && (
                <span className="text-xs text-red-500 mt-1 block">{errors.full_name.message}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="jane.doe@company.com"
                className={`w-full bg-[#0d0e12]/60 border ${
                  errors.email ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
                } rounded-xl py-2.5 px-4 text-white placeholder-gray-600 focus:outline-none transition text-sm`}
                {...register('email')}
              />
              {errors.email && (
                <span className="text-xs text-red-500 mt-1 block">{errors.email.message}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+1 555-123-4567"
                className="w-full bg-[#0d0e12]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-2.5 px-4 text-white placeholder-gray-600 focus:outline-none transition text-sm"
                {...register('phone')}
              />
            </div>
          </div>
        </div>

        {/* Job Assignment */}
        <div className="bg-[#161820] border border-gray-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-white font-bold text-sm flex items-center border-b border-gray-800 pb-3">
            <Briefcase className="text-violet-500 mr-2" size={16} />
            Job Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full bg-[#0d0e12]/60 border ${
                  errors.job_title_id ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
                } rounded-xl py-2.5 px-3 text-white focus:outline-none transition text-sm appearance-none`}
                {...register('job_title_id')}
              >
                <option value="0">Select Title</option>
                {jobTitles.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
              {errors.job_title_id && (
                <span className="text-xs text-red-500 mt-1 block">{errors.job_title_id.message}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                className={`w-full bg-[#0d0e12]/60 border ${
                  errors.department_id ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
                } rounded-xl py-2.5 px-3 text-white focus:outline-none transition text-sm appearance-none`}
                {...register('department_id')}
              >
                <option value="0">Select Department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {errors.department_id && (
                <span className="text-xs text-red-500 mt-1 block">{errors.department_id.message}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Joining Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={`w-full bg-[#0d0e12]/60 border ${
                  errors.joining_date ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
                } rounded-xl py-2.5 px-4 text-white focus:outline-none transition text-sm`}
                {...register('joining_date')}
              />
              {errors.joining_date && (
                <span className="text-xs text-red-500 mt-1 block">{errors.joining_date.message}</span>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full bg-[#0d0e12]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-2.5 px-3 text-white focus:outline-none transition text-sm appearance-none"
                {...register('status')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location & Compensation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div className="bg-[#161820] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-bold text-sm flex items-center border-b border-gray-800 pb-3">
              <MapPin className="text-emerald-500 mr-2" size={16} />
              Geographic Region
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full bg-[#0d0e12]/60 border ${
                    errors.country_id ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
                  } rounded-xl py-2.5 px-3 text-white focus:outline-none transition text-sm appearance-none`}
                  {...register('country_id')}
                >
                  <option value="0">Select Country</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.country}
                    </option>
                  ))}
                </select>
                {errors.country_id && (
                  <span className="text-xs text-red-500 mt-1 block">{errors.country_id.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  State / Province
                </label>
                <select
                  className="w-full bg-[#0d0e12]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-2.5 px-3 text-white focus:outline-none transition text-sm appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loadingStates || states.length === 0}
                  {...register('state_id')}
                >
                  <option value="">Select State</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.state}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Compensation */}
          <div className="bg-[#161820] border border-gray-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-bold text-sm flex items-center border-b border-gray-800 pb-3">
              <DollarSign className="text-amber-500 mr-2" size={16} />
              Compensation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Base Salary <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  className={`w-full bg-[#0d0e12]/60 border ${
                    errors.salary ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
                  } rounded-xl py-2.5 px-4 text-white placeholder-gray-600 focus:outline-none transition text-sm`}
                  {...register('salary')}
                />
                {errors.salary && (
                  <span className="text-xs text-red-500 mt-1 block">{errors.salary.message}</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Currency <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="USD"
                  className={`w-full bg-[#0d0e12]/60 border ${
                    errors.currency ? 'border-red-500' : 'border-gray-800 focus:border-blue-500'
                  } rounded-xl py-2.5 px-4 text-white placeholder-gray-600 focus:outline-none transition text-sm`}
                  {...register('currency')}
                />
                {errors.currency && (
                  <span className="text-xs text-red-500 mt-1 block">{errors.currency.message}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end space-x-4 border-t border-gray-850 pt-6">
          <Link
            href="/employees"
            className="px-6 py-2.5 text-xs font-semibold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition flex items-center shadow-lg shadow-blue-600/25 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} className="mr-2" />
                Save Employee
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
