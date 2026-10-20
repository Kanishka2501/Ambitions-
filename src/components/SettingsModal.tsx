import React, { useState } from 'react';
import {
  X,
  Palette,
  Sun,
  Moon,
  Trash2,
  Download,
  Users,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Compass,
} from 'lucide-react';
import { useTheme, THEME_OPTIONS } from '../context/ThemeContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useGoal } from '../context/GoalContext.js';
import type { CoachingStyle } from '../types/index.js';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { themePalette, setThemePalette, themeMode, toggleThemeMode } = useTheme();
  const { user, updateUserPreferences, deleteAccount, demoUsers, logout } = useAuth();
  const { activeGoal, goals, tasks, milestones, reviews } = useGoal();

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePending, setDeletePending] = useState(false);

  if (!isOpen) return null;

  const handleExportData = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      user,
      activeGoal,
      goals,
      milestones,
      tasks,
      reviews,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `northstar-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    setDeletePending(true);
    try {
      await deleteAccount();
      onClose();
    } catch (err) {
      console.error('Delete account failed:', err);
    } finally {
      setDeletePending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-canvas)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)]">
              <Palette className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              System Settings & Identity
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {/* Theme Palette Customizer */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>Signature Theme Palette</span>
              </label>

              <button
                type="button"
                onClick={toggleThemeMode}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-elevated)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
              >
                {themeMode === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                <span className="capitalize">{themeMode} Mode</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEME_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setThemePalette(t.id);
                    if (user) updateUserPreferences({ themePalette: t.id });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    themePalette === t.id
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] shadow-xs'
                      : 'border-[var(--color-border)] bg-[var(--color-canvas)] hover:border-[var(--color-border-active)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full border border-black/20 shrink-0 shadow-xs"
                      style={{ backgroundColor: t.primaryColor }}
                    />
                    <div>
                      <div className="font-semibold text-[var(--color-text-primary)]">{t.name}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)] truncate max-w-[150px]">
                        {t.description}
                      </div>
                    </div>
                  </div>

                  {themePalette === t.id && (
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Coaching Style Preference */}
          <div>
            <label className="font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5 mb-2">
              <Bot className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>Default Coaching Persona</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              {(['gentle', 'strategic', 'direct'] as CoachingStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => {
                    if (user) updateUserPreferences({ coachingStyle: style });
                  }}
                  className={`p-2.5 rounded-xl border text-center capitalize font-semibold transition-all cursor-pointer ${
                    user?.coachingStyle === style
                      ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]'
                      : 'bg-[var(--color-canvas)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* User Account & Demo Switcher */}
          <div className="p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-[var(--color-text-primary)]">{user?.name}</div>
                <div className="text-[11px] text-[var(--color-text-muted)] font-mono">{user?.email}</div>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--color-canvas)] text-[var(--color-accent)] border border-[var(--color-border)]">
                {user?.role === 'founder_admin' ? 'Founder Admin' : 'Operator'}
              </span>
            </div>

            <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
              <span className="text-[11px] text-[var(--color-text-muted)]">
                Active Session: <span className="font-mono text-[var(--color-text-primary)]">{user?.email}</span>
              </span>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-canvas)] hover:bg-red-500/10 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Data Export & Privacy Erasure */}
          <div className="space-y-3 pt-2 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={handleExportData}
              className="w-full py-2.5 px-4 rounded-xl bg-[var(--color-canvas)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>Export All Goal Data (JSON)</span>
            </button>

            {confirmDelete ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 space-y-3">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Permanent Data Erasure</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  This will permanently delete your account, goals, tasks, reviews, and logs from the database. This action is irreversible.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-lg bg-[var(--color-surface)] text-[var(--color-text-secondary)] text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deletePending}
                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    {deletePending ? 'Deleting...' : 'Yes, Delete Permanently'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="w-full py-2.5 px-4 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account & Personal Data</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
