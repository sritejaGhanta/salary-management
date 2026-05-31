'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/auth.context';
import { useRouter } from 'next/navigation';
import { User, Mail, Shield, ShieldCheck, Key, Lock, Eye, EyeOff, Loader2, Save } from 'lucide-react';
import api from '../../lib/axios';

const profileSchema = z.object({
  full_name: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Current password is required' }),
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Confirm password must be at least 6 characters' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else {
        setProfileValue('full_name', user.full_name);
      }
    }
  }, [user, loading, router, setProfileValue]);

  const onUpdateProfile = async (data: ProfileFormValues) => {
    setProfileSuccess(null);
    setProfileError(null);
    setIsUpdatingProfile(true);
    try {
      await api.patch('/auth/profile', data);
      setProfileSuccess('Profile updated successfully!');
      await refreshUser();
    } catch (err: unknown) {
      console.error(err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setProfileError(axiosError.response?.data?.message || 'Failed to update profile.');
      } else {
        setProfileError('Failed to update profile.');
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data: PasswordFormValues) => {
    setPasswordSuccess(null);
    setPasswordError(null);
    setIsChangingPassword(true);
    try {
      await api.patch('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      resetPasswordForm();
    } catch (err: unknown) {
      console.error(err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setPasswordError(axiosError.response?.data?.message || 'Failed to change password.');
      } else {
        setPasswordError('Failed to change password.');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0d0e12] text-white">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <span>Loading Profile...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">My Profile</h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your HR credentials, change password, and view account privileges.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Account Overview Card */}
        <div className="bg-[#161820]/80 border border-gray-800 backdrop-blur-xl rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-violet-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-blue-500/20">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">{user.full_name}</h2>
                <div className="flex items-center space-x-1.5 mt-1">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span className="text-xs text-gray-400 font-medium capitalize">{user.role} Account</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800/80 pt-6 space-y-4">
              <div>
                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Email Address</span>
                <span className="text-sm font-medium text-white flex items-center mt-1">
                  <Mail size={14} className="text-gray-500 mr-2" />
                  {user.email}
                </span>
              </div>

              <div>
                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">System Authorization</span>
                <span className="text-sm font-medium text-white flex items-center mt-1">
                  <Shield size={14} className="text-gray-500 mr-2" />
                  {user.role === 'admin' ? 'Super Admin Privileges' : 'HR Manager Privileges'}
                </span>
              </div>

              <div>
                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Account Status</span>
                <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  Active
                </span>
              </div>

              <div>
                <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Created At</span>
                <span className="text-sm font-medium text-gray-300 block mt-1">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-gray-600 font-medium border-t border-gray-800/80 pt-4 text-center">
            Authorized System Session
          </div>
        </div>

        {/* Right columns: Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Edit Profile Form Card */}
          <div className="bg-[#161820]/80 border border-gray-800 backdrop-blur-xl rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center">
                <User size={16} className="text-blue-500 mr-2" />
                Personal Profile Details
              </h3>
              <p className="text-xs text-gray-400 mt-1">Update your display name registered in the monorepo database.</p>
            </div>

            {profileSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs">
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-400 text-xs">
                {profileError}
              </div>
            )}

            <form onSubmit={handleSubmitProfile(onUpdateProfile)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2" htmlFor="full_name">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <User size={16} />
                  </span>
                  <input
                    id="full_name"
                    type="text"
                    placeholder="HR Manager"
                    className={`w-full bg-[#0d0e12]/60 border ${
                      profileErrors.full_name ? 'border-red-500 focus:border-red-500' : 'border-gray-800 focus:border-blue-500'
                    } rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-600 focus:outline-none transition text-sm`}
                    {...registerProfile('full_name')}
                  />
                </div>
                {profileErrors.full_name && (
                  <span className="text-xs text-red-500 mt-1 block">{profileErrors.full_name.message}</span>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="flex items-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} className="mr-1.5" />
                      Save Details
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form Card */}
          <div className="bg-[#161820]/80 border border-gray-800 backdrop-blur-xl rounded-2xl p-6 shadow-xl space-y-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center">
                <Key size={16} className="text-violet-500 mr-2" />
                Change Account Password
              </h3>
              <p className="text-xs text-gray-400 mt-1">Ensure your account uses a complex, secure password to protect portal access.</p>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-xs">
                {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-400 text-xs">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleSubmitPassword(onChangePassword)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2" htmlFor="currentPassword">
                  Current Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <Lock size={16} />
                  </span>
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`w-full bg-[#0d0e12]/60 border ${
                      passwordErrors.currentPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-800 focus:border-blue-500'
                    } rounded-xl py-2.5 pl-10 pr-10 text-white placeholder-gray-600 focus:outline-none transition text-sm`}
                    {...registerPassword('currentPassword')}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <span className="text-xs text-red-500 mt-1 block">{passwordErrors.currentPassword.message}</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2" htmlFor="newPassword">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Lock size={16} />
                    </span>
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full bg-[#0d0e12]/60 border ${
                        passwordErrors.newPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-800 focus:border-blue-500'
                      } rounded-xl py-2.5 pl-10 pr-10 text-white placeholder-gray-600 focus:outline-none transition text-sm`}
                      {...registerPassword('newPassword')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordErrors.newPassword && (
                    <span className="text-xs text-red-500 mt-1 block">{passwordErrors.newPassword.message}</span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Lock size={16} />
                    </span>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className={`w-full bg-[#0d0e12]/60 border ${
                        passwordErrors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'border-gray-800 focus:border-blue-500'
                      } rounded-xl py-2.5 pl-10 pr-10 text-white placeholder-gray-600 focus:outline-none transition text-sm`}
                      {...registerPassword('confirmPassword')}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordErrors.confirmPassword && (
                    <span className="text-xs text-red-500 mt-1 block">{passwordErrors.confirmPassword.message}</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex items-center text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 px-4 py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-1.5" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Key size={14} className="mr-1.5" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
