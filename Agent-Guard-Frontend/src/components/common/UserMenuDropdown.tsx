import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Users,
  ChevronDown,
  LogOut,
  Shield,
  Check,
  UserPlus,
  Sliders,
} from 'lucide-react';
import {
  UserProfile,
  getStoredUsers,
  setActiveUser,
} from '../../services/userManager';

interface UserMenuDropdownProps {
  currentUser: UserProfile;
  onUserChanged: (user: UserProfile) => void;
  onLogout?: () => void;
  onNavigateOps?: () => void;
  showOpsLink?: boolean;
}

export const UserMenuDropdown: React.FC<UserMenuDropdownProps> = ({
  currentUser,
  onUserChanged,
  onLogout,
  onNavigateOps,
  showOpsLink = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const users = getStoredUsers();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectUser = (u: UserProfile) => {
    setActiveUser(u);
    onUserChanged(u);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-blue-500/40 text-xs transition-all cursor-pointer group"
      >
        <div className="w-6 h-6 rounded-lg bg-blue-600/25 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold font-mono text-[11px] group-hover:scale-105 transition-transform">
          {currentUser.initials || currentUser.name.charAt(0)}
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-slate-200 font-medium leading-none">{currentUser.name}</span>
          <span className="text-[10px] text-blue-400 font-mono leading-tight mt-0.5">{currentUser.role}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#0F172A] border border-slate-700/90 shadow-2xl shadow-black/80 p-3 z-50 text-slate-100 font-sans"
          >
            {/* Current Active Account Header */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold font-mono text-xs">
                  {currentUser.initials || currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-white block truncate">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono block truncate">{currentUser.email}</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30">
                  {currentUser.role}
                </span>
                <span className="text-[10px] font-mono text-slate-400">· {currentUser.badge}</span>
              </div>
            </div>

            {/* Profile Switcher List */}
            <div className="mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 px-1 block mb-1.5 flex items-center gap-1">
                <Users className="w-3 h-3 text-cyan-400" />
                Switch User Profile
              </span>
              <div className="space-y-1 max-h-48 overflow-y-auto pr-0.5">
                {users.map((u) => {
                  const isCurrent = u.id === currentUser.id || u.email.toLowerCase() === currentUser.email.toLowerCase();
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleSelectUser(u)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                          : 'hover:bg-slate-800/80 text-slate-300 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300">
                          {u.initials || u.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium truncate block leading-tight">{u.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono block leading-tight">{u.role}</span>
                        </div>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Links */}
            <div className="pt-2 border-t border-slate-800 space-y-1">
              {showOpsLink && onNavigateOps && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateOps();
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-blue-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Fraud-Ops Console</span>
                </button>
              )}

              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out & Switch User</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
