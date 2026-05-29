'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '../../lib/axios';
import { Plus, Download, FileText, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import EmployeeFilters from '../../components/employees/employee-filters';
import EmployeeTable from '../../components/employees/employee-table';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('');
  const [countryId, setCountryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [jobTitleId, setJobTitleId] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');

  // Sorting state
  const [sortBy, setSortBy] = useState('created_at');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Export loading state
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Search debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        order,
      });

      if (debouncedSearch) params.append('search', debouncedSearch);
      if (status) params.append('status', status);
      if (countryId) params.append('country_id', countryId);
      if (departmentId) params.append('department_id', departmentId);
      if (jobTitleId) params.append('job_title_id', jobTitleId);
      if (minSalary) params.append('min_salary', minSalary);
      if (maxSalary) params.append('max_salary', maxSalary);

      const response = await api.get(`/employees?${params.toString()}`);
      setEmployees(response.data.data);
      setTotal(response.data.total);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, status, countryId, departmentId, jobTitleId, minSalary, maxSalary, sortBy, order]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setOrder('DESC');
    }
    setPage(1);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/employees/${id}`);
      fetchEmployees();
    } catch (err) {
      console.error('Failed to delete employee:', err);
      alert('Failed to deactivate employee record.');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setCountryId('');
    setDepartmentId('');
    setJobTitleId('');
    setMinSalary('');
    setMaxSalary('');
    setPage(1);
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    if (format === 'csv') setExportingCsv(true);
    else setExportingExcel(true);

    try {
      const response = await api.get(`/export/employees?format=${format}`, {
        responseType: 'blob',
      });
      const fileType = format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const fileExt = format === 'csv' ? 'csv' : 'xlsx';
      const blob = new Blob([response.data], { type: fileType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.${fileExt}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export:', err);
      alert('Failed to export employee database.');
    } finally {
      if (format === 'csv') setExportingCsv(false);
      else setExportingExcel(false);
    }
  };

  const renderPaginationNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => setPage(1)}
          className={`w-8 h-8 rounded-xl text-xs font-semibold transition ${
            page === 1 ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          1
        </button>
      );
      if (start > 2) {
        pages.push(<span key="ellipsis-start" className="text-gray-600 px-1 text-xs">...</span>);
      }
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          className={`w-8 h-8 rounded-xl text-xs font-semibold transition ${
            page === i ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          {i}
        </button>
      );
    }

    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push(<span key="ellipsis-end" className="text-gray-600 px-1 text-xs">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => setPage(totalPages)}
          className={`w-8 h-8 rounded-xl text-xs font-semibold transition ${
            page === totalPages ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  const showingStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const showingEnd = Math.min(page * limit, total);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Workforce Directory</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage employee databases, assign job positions, adjust base salaries, and run reports.
          </p>
        </div>
        <div className="flex items-center space-x-3 self-start md:self-auto">
          {/* Export CSV */}
          <button
            onClick={() => handleExport('csv')}
            disabled={exportingCsv}
            className="flex items-center text-xs font-semibold text-gray-300 hover:text-white bg-[#161820] border border-gray-800 hover:border-gray-700 px-4 py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {exportingCsv ? (
              <Loader2 size={14} className="animate-spin mr-1.5" />
            ) : (
              <FileText size={14} className="mr-1.5 text-gray-500" />
            )}
            CSV
          </button>
          
          {/* Export Excel */}
          <button
            onClick={() => handleExport('excel')}
            disabled={exportingExcel}
            className="flex items-center text-xs font-semibold text-gray-300 hover:text-white bg-[#161820] border border-gray-800 hover:border-gray-700 px-4 py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {exportingExcel ? (
              <Loader2 size={14} className="animate-spin mr-1.5" />
            ) : (
              <Download size={14} className="mr-1.5 text-gray-500" />
            )}
            Excel
          </button>

          {/* Add Employee */}
          <Link
            href="/employees/new"
            className="flex items-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            <Plus size={14} className="mr-1.5" />
            Add Employee
          </Link>
        </div>
      </div>

      {/* Filter Component */}
      <EmployeeFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        countryId={countryId}
        onCountryChange={setCountryId}
        departmentId={departmentId}
        onDepartmentChange={setDepartmentId}
        jobTitleId={jobTitleId}
        onJobTitleChange={setJobTitleId}
        minSalary={minSalary}
        onMinSalaryChange={setMinSalary}
        maxSalary={maxSalary}
        onMaxSalaryChange={setMaxSalary}
        onClearFilters={handleClearFilters}
      />

      {/* Showing counts */}
      <div className="flex items-center justify-between text-gray-400 text-xs px-1">
        <span>
          Showing <strong className="text-white">{showingStart}</strong> to{' '}
          <strong className="text-white">{showingEnd}</strong> of{' '}
          <strong className="text-white">{total.toLocaleString()}</strong> employees
        </span>
      </div>

      {/* Data Table */}
      <EmployeeTable
        employees={employees}
        loading={loading}
        sortBy={sortBy}
        order={order}
        onSort={handleSort}
        onDelete={handleDelete}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Limit selector */}
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <span>Show</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-[#161820] border border-gray-800 text-white rounded-xl py-1.5 px-3 focus:outline-none transition appearance-none"
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>entries per page</span>
          </div>

          {/* Page numbers */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-2 bg-[#161820] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center space-x-1">
              {renderPaginationNumbers()}
            </div>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-2 bg-[#161820] border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
