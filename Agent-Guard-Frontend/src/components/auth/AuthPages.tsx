import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Mail, User, Eye, EyeOff, CheckCircle, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { StarBackground } from '../landing/StarBackground';
import {
  UserProfile,
  getStoredUsers,
  setActiveUser,
  registerUser,
} from '../../services/userManager';

interface AuthPagesProps {
  initialMode?: 'login' | 'signup';
  onSuccess: (user: UserProfile) => void;
  onCancel: () => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  initialMode = 'login',
  onSuccess,
  onCancel,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const availableUsers = getStoredUsers();

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserProfile['role']>('Consumer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup') {
      if (!fullName) {
        setError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (mode === 'signup') {
        const newUser = registerUser(fullName, email, role);
        onSuccess(newUser);
      } else {
        // Find user by email or create dynamic profile for custom email
        const matched = availableUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (matched) {
          setActiveUser(matched);
          onSuccess(matched);
        } else {
          const autoName = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || 'User';
          const newUser = registerUser(autoName, email, 'Consumer');
          onSuccess(newUser);
        }
      }
    }, 400);
  };

  const handleSelectPersona = (u: UserProfile) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setActiveUser(u);
      onSuccess(u);
    }, 250);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#070B14]">
      {/* Background */}
      <StarBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827]/95 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-black/80">
          {/* Header */}
          <div className="text-center mb-6">
            <button
              onClick={onCancel}
              className="inline-flex items-center gap-2 p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-cyan-400 mb-3 hover:scale-105 transition-transform cursor-pointer"
            >
              <Shield className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-extrabold text-white tracking-tight font-sans">
              {mode === 'login' ? 'AgentGuard Authentication' : 'Create AgentGuard Account'}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {mode === 'login'
                ? 'Sign in to access AI Sentinel screening & Fraud-Ops Console'
                : 'Pre-transaction scam defense for your digital payments'}
            </p>
          </div>

          {/* Quick Persona Switcher Cards */}
          <div className="mb-6 rounded-xl border border-slate-800 bg-[#0B101D] p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                Select Demo Account ({availableUsers.length} Profiles Available)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleSelectPersona(u)}
                  disabled={loading}
                  className="p-2.5 rounded-lg border border-slate-800/90 bg-[#0F172A]/80 hover:bg-slate-800 hover:border-blue-500/50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[10px] font-mono font-bold text-blue-300 group-hover:scale-105 transition-transform">
                      {u.initials || u.name.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                      {u.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px] font-mono text-slate-400">
                    <span className="truncate">{u.role}</span>
                    <span className="text-blue-400 font-medium group-hover:underline">Login →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <Input
                  label="Full Name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  leftIcon={<User className="w-4 h-4" />}
                  required
                />

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Account Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Consumer', 'Fraud Analyst', 'Merchant'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                          role === r
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. user@agentguard.ai"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-slate-400 hover:text-slate-200 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {mode === 'signup' && (
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
            )}

            <Button
              type="submit"
              isLoading={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 mt-2 cursor-pointer font-bold tracking-wide"
            >
              {mode === 'login' ? 'SIGN IN WITH CREDENTIALS' : 'CREATE ACCOUNT'}
            </Button>
          </form>

          {/* Switch Mode */}
          <div className="mt-5 text-center text-xs text-slate-400">
            {mode === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setError('');
                    setMode('signup');
                  }}
                  className="text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  Create account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setError('');
                    setMode('login');
                  }}
                  className="text-blue-400 font-semibold hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>

          {/* Back to landing */}
          <div className="mt-3 text-center">
            <button
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-slate-400 transition-colors cursor-pointer"
            >
              ← Back to homepage
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
