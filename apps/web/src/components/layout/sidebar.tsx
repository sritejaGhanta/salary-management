'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BarChart3, Download, ClipboardList, UserPlus, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/auth.context';

export default function Sidebar() {
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
    links.push({ name: 'Register HR', href: '/register', icon: UserPlus });
  }

  return (
    <aside className="w-64 bg-[#161820] border-r border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="h-16 flex items-center px-6 border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-blue-500/20">
            S
          </div>
          <span className="font-bold text-white text-base tracking-tight">Salary Management</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
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
          onClick={logout}
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
  );
}
