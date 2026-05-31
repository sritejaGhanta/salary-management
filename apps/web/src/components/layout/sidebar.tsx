'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BarChart3, Download, ClipboardList, User, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/auth.context';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Employees', href: '/employees', icon: Users },
    { name: 'Insights', href: '/insights', icon: BarChart3 },
    { name: 'Export Data', href: '/export', icon: Download },
    { name: 'Audit Logs', href: '/audit-logs', icon: ClipboardList },
  ];

  if (user && user.role === 'admin') {
    links.push({ name: 'HR Managers', href: '/hr-managers', icon: Users });
  }

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        />
      )}

      <aside
        className={`w-64 bg-[#161820] border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
          <Link href="/dashboard" onClick={onClose} className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/20">
              S
            </div>
            <span className="font-bold text-white text-base tracking-tight">Salary Management</span>
          </Link>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition"
            title="Close Menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={onClose}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 text-sm font-medium ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Profile and Logout Section */}
        <div className="px-4 py-4 border-t border-gray-800 space-y-1.5">
          <Link
            href="/profile"
            onClick={onClose}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition duration-200 text-sm font-medium ${
              pathname === '/profile'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <User size={18} />
            <span>My Profile</span>
          </Link>
          <button
            onClick={() => {
              if (onClose) onClose();
              logout();
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition duration-200 text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>

        <div className="p-4 border-t border-gray-800 bg-[#0d0e12]/30">
          <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider text-center">
            V1.0.0 Monorepo Admin
          </p>
        </div>
      </aside>
    </>
  );
}
