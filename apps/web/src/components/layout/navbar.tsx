'use client';

import React from 'react';
import { useAuth } from '../../context/auth.context';
import { LogOut, UserPlus, Menu } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-gray-800 bg-[#161820]/60 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        {/* Hamburger Menu Trigger */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800/60 rounded-xl transition duration-200"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>

        {/* Small screen brand name */}
        <div className="flex items-center space-x-2 lg:hidden">
          <span className="font-bold text-white text-sm tracking-tight">Salary Management</span>
        </div>

        {/* Desktop title */}
        <div className="hidden lg:block">
          <h2 className="text-sm font-semibold text-gray-400">Portal Control Panel</h2>
        </div>
      </div>

      <div className="flex items-center space-x-3.5">
        {user && user.role === 'admin' && (
          <Link
            href="/register"
            className="hidden md:flex items-center text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-xl transition duration-200 font-semibold"
          >
            <UserPlus size={14} className="mr-1.5" />
            Add HR
          </Link>
        )}

        {user && (
          <div className="flex items-center space-x-3 border-l border-gray-800 pl-3.5">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-medium text-white">{user.full_name}</span>
              <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                {user.role}
              </span>
            </div>
            <div
              className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-md"
              title={user.full_name}
            >
              {user.full_name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition duration-200"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
