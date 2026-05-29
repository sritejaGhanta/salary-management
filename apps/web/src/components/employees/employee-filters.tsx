'use client';

import React, { useEffect, useState } from 'react';
import api from '../../lib/axios';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface EmployeeFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  countryId: string;
  onCountryChange: (v: string) => void;
  departmentId: string;
  onDepartmentChange: (v: string) => void;
  jobTitleId: string;
  onJobTitleChange: (v: string) => void;
  minSalary: string;
  onMinSalaryChange: (v: string) => void;
  maxSalary: string;
  onMaxSalaryChange: (v: string) => void;
  onClearFilters: () => void;
}

interface MetadataItem {
  id: number;
  country?: string;
  name?: string;
  title?: string;
}

export default function EmployeeFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  countryId,
  onCountryChange,
  departmentId,
  onDepartmentChange,
  jobTitleId,
  onJobTitleChange,
  minSalary,
  onMinSalaryChange,
  maxSalary,
  onMaxSalaryChange,
  onClearFilters,
}: EmployeeFiltersProps) {
  const [countries, setCountries] = useState<MetadataItem[]>([]);
  const [departments, setDepartments] = useState<MetadataItem[]>([]);
  const [jobTitles, setJobTitles] = useState<MetadataItem[]>([]);

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
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  return (
    <div className="bg-[#161820] border border-gray-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
        <div className="flex items-center space-x-2 text-white">
          <SlidersHorizontal size={18} className="text-blue-500" />
          <h3 className="font-semibold text-sm">Search & Filters</h3>
        </div>
        <button
          onClick={onClearFilters}
          className="text-xs text-gray-400 hover:text-white flex items-center bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-lg transition"
        >
          <X size={12} className="mr-1" />
          Clear Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Search Name/Email</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-[#0d0e12]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-2 pl-9 pr-4 text-white text-xs placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-opacity-50 transition"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full bg-[#0d0e12]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-2 px-3 text-white text-xs focus:outline-none transition appearance-none"
          >
            <option value="" className="bg-[#161820]">All Statuses</option>
            <option value="active" className="bg-[#161820]">Active</option>
            <option value="inactive" className="bg-[#161820]">Inactive</option>
          </select>
        </div>

        {/* Country */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Country</label>
          <select
            value={countryId}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full bg-[#0d0e12]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-2 px-3 text-white text-xs focus:outline-none transition appearance-none"
          >
            <option value="" className="bg-[#161820]">All Countries</option>
            {countries.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#161820]">
                {c.country}
              </option>
            ))}
          </select>
        </div>

        {/* Department */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Department</label>
          <select
            value={departmentId}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full bg-[#0d0e12]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-2 px-3 text-white text-xs focus:outline-none transition appearance-none"
          >
            <option value="" className="bg-[#161820]">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id} className="bg-[#161820]">
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {/* Job Title */}
        <div className="space-y-1 md:col-span-1">
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Job Title</label>
          <select
            value={jobTitleId}
            onChange={(e) => onJobTitleChange(e.target.value)}
            className="w-full bg-[#0d0e12]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-2 px-3 text-white text-xs focus:outline-none transition appearance-none"
          >
            <option value="" className="bg-[#161820]">All Job Titles</option>
            {jobTitles.map((j) => (
              <option key={j.id} value={j.id} className="bg-[#161820]">
                {j.title}
              </option>
            ))}
          </select>
        </div>

        {/* Min Salary */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Min Salary</label>
          <input
            type="number"
            placeholder="Min Salary (e.g. 30000)"
            value={minSalary}
            onChange={(e) => onMinSalaryChange(e.target.value)}
            className="w-full bg-[#0d0e12]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-2 px-3 text-white text-xs focus:outline-none transition"
          />
        </div>

        {/* Max Salary */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Max Salary</label>
          <input
            type="number"
            placeholder="Max Salary (e.g. 150000)"
            value={maxSalary}
            onChange={(e) => onMaxSalaryChange(e.target.value)}
            className="w-full bg-[#0d0e12]/60 border border-gray-800 focus:border-blue-500 rounded-xl py-2 px-3 text-white text-xs focus:outline-none transition"
          />
        </div>
      </div>
    </div>
  );
}
