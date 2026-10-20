import React, { useState } from 'react';
import { Compass, X, UserPlus, LogIn, Loader2, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { login, register, demoUsers } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) throw new Error('Please enter both email and password.');
        await login(email, password);
      } else {
        if (!email.trim() || !name.trim() || !password) throw new Error('Please provide name, email, and a password.');
        if (password.length < 8) throw new Error('Password must be at least 8 characters long.');
        await register(name, email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    const pass = demoRole === 'founder_admin' ? 'FounderNorthstar2026!' : 'OperatorNorthstar2026!';
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)] mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)]">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--color-text-primary)]">
                Northstar Identity
              </div>
              <div className="text-[11px] text-[var(--color-text-muted)]">
                {mode === 'login' ? 'Sign in with your verified credentials' : 'Create a secure operator account'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Vance"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                required
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. operator@domain.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
              Password {mode === 'register' && <span className="text-[var(--color-text-muted)] font-normal">(min 8 characters)</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] font-mono"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-3.5 h-3.5" />
                <span>Verify & Enter System</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Verified Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center text-xs text-[var(--color-text-muted)]">
          {mode === 'login' ? (
            <span>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="text-[var(--color-accent)] font-semibold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-[var(--color-accent)] font-semibold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          )}
        </div>

        {/* Quick Demo Credentials Autofill */}
        {demoUsers.length > 0 && (
          <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
            <span className="text-[11px] font-semibold text-[var(--color-text-muted)] block mb-2 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>Autofill Verified Demo Account:</span>
            </span>
            <div className="space-y-1.5">
              {demoUsers.map((du) => (
                <button
                  key={du.id}
                  type="button"
                  onClick={() => handleFillDemo(du.email, du.role)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-canvas)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-left flex items-center justify-between transition-colors cursor-pointer text-xs"
                >
                  <span className="font-medium text-[var(--color-text-primary)]">{du.name}</span>
                  <span className="text-[10px] font-mono text-[var(--color-accent)] uppercase">
                    {du.role === 'founder_admin' ? 'Founder Account' : 'Operator Account'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
