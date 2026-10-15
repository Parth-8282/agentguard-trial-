import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Smartphone,
  Sliders,
  LogOut,
  Save,
  CheckCircle2,
  Users,
  Check,
  Trash2,
} from 'lucide-react';
import { ProtectionMode } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import {
  UserProfile,
  getStoredUsers,
  setActiveUser,
  deleteStoredUser,
} from '../../services/userManager';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  protectionMode: ProtectionMode;
  onUpdateProtectionMode: (mode: ProtectionMode) => void;
  recipientsCount: number;
  devicesCount: number;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  protectionMode,
  onUpdateProtectionMode,
  recipientsCount,
  devicesCount,
  onLogout,
}) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '+91 98765 43210');
  const [role, setRole] = useState(user.role);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '+91 98765 43210');
    setRole(user.role);
    setAllUsers(getStoredUsers());
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name,
      email,
      phone,
      role,
    };
    setActiveUser(updated);
    onUpdateUser(updated);
    setAllUsers(getStoredUsers());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleSwitchAccount = (target: UserProfile) => {
    setActiveUser(target);
    onUpdateUser(target);
  };

  const handleDeleteAccount = (targetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteStoredUser(targetId);
    setAllUsers(getStoredUsers());
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
          Account Profile & Security Settings
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your identity details, user roles, and protection settings
        </p>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">
            Connected Devices
          </span>
          <div className="mt-2 text-2xl font-extrabold text-white">{devicesCount} Active</div>
        </div>

        <div className="p-4 rounded-xl bg-[#111827] border border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">
            Trusted Payees
          </span>
          <div className="mt-2 text-2xl font-extrabold text-white">{recipientsCount} Verified</div>
        </div>
      </div>

      {/* Personal Information Form */}
      <div className="rounded-xl border border-slate-800 bg-[#111827] p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Active Identity Details</h3>
          </div>
          <span className="text-xs font-mono text-blue-400 font-semibold">{user.role}</span>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">User Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full bg-[#0B101D] text-white border border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="Consumer">Consumer</option>
                <option value="Fraud Analyst">Fraud Analyst</option>
                <option value="Merchant">Merchant</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Profile updated successfully
              </span>
            ) : <span />}

            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-3.5 h-3.5" />}
              className="bg-blue-600 hover:bg-blue-500 cursor-pointer"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>

      {/* Multi-Account Profile Switcher */}
      <div className="rounded-xl border border-slate-800 bg-[#111827] p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Available User Profiles</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{allUsers.length} accounts configured</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {allUsers.map((u) => {
            const isCurrent = u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase();
            return (
              <div
                key={u.id}
                onClick={() => handleSwitchAccount(u)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  isCurrent
                    ? 'bg-blue-600/15 border-blue-500 text-white'
                    : 'bg-[#0B101D] border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold font-mono text-xs text-blue-300">
                    {u.initials || u.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block truncate">{u.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">{u.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                    {u.role}
                  </span>
                  {isCurrent && <Check className="w-4 h-4 text-emerald-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Preferences */}
      <div className="rounded-xl border border-slate-800 bg-[#111827] p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Security Preferences</h3>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          {/* Protection Mode selection */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#0B1120] border border-slate-800">
            <div className="flex items-start gap-3">
              <Sliders className="w-4 h-4 text-cyan-400 mt-0.5" />
              <div>
                <div className="font-bold text-white">Active Protection Mode</div>
                <p className="text-slate-400 text-[11px]">
                  Currently set to <span className="text-cyan-300 font-semibold">{protectionMode}</span>
                </p>
              </div>
            </div>
            <select
              value={protectionMode}
              onChange={(e) => onUpdateProtectionMode(e.target.value as ProtectionMode)}
              className="bg-[#111827] text-white border border-slate-700 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="STANDARD">Standard</option>
              <option value="STRICT">Strict</option>
              <option value="MAXIMUM">Maximum</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logout Row */}
      <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-rose-400">Sign Out</h4>
          <p className="text-xs text-slate-400">Terminate current session and return to login</p>
        </div>
        <Button
          variant="danger"
          size="sm"
          onClick={onLogout}
          leftIcon={<LogOut className="w-3.5 h-3.5" />}
          className="cursor-pointer"
        >
          Logout
        </Button>
      </div>
    </div>
  );
};
