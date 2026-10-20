import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Activity,
  Cpu,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Settings,
  Save,
  Loader2,
} from 'lucide-react';
import type { SystemMetrics, AdminSettings } from '../types/index.js';
import { api } from '../lib/api.js';

export const AdminView: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminMetrics();
      setMetrics(data.metrics);
      setSettings(data.settings);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      const res = await api.updateAdminSettings(settings);
      setSettings(res.settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update admin settings:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[var(--color-accent)]" />
        <span>Loading Founder & Admin Telemetry...</span>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="py-20 text-center text-xs text-red-400">
        Access Denied. Only user accounts with role &quot;founder_admin&quot; can view system metrics.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
              Founder & Product Administration
            </div>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mt-0.5">
              System Telemetry & Controls
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-text-muted)]">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Status: {metrics.systemStatus}</span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-2">
            <Users className="w-3.5 h-3.5" />
            <span>Total Operators</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--color-text-primary)] mt-2 tabular-nums">
            {metrics.totalUsers}
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">Registered accounts</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Completed Actions</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--color-text-primary)] mt-2 tabular-nums">
            {metrics.completedTasksTotal}
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">Verified task executions</div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Focus Work</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--color-text-primary)] mt-2 tabular-nums">
            {metrics.totalFocusMinutes}m
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">
            {(metrics.totalFocusMinutes / 60).toFixed(1)} deep work hours
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="text-xs text-[var(--color-text-muted)] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Operations</span>
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--color-text-primary)] mt-2 tabular-nums">
            {metrics.aiCallsCount}
          </div>
          <div className="text-[11px] text-[var(--color-text-secondary)] mt-1">Model inferences run</div>
        </div>
      </div>

      {/* Infrastructure & Engine Status */}
      <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[var(--color-accent)]" />
          <span>Engine Infrastructure</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)] block mb-1">Target Model:</span>
            <span className="font-semibold text-[var(--color-text-primary)]">{metrics.geminiModel}</span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)] block mb-1">API Key Configured:</span>
            <span className={metrics.hasCustomApiKey ? 'text-emerald-400' : 'text-amber-400'}>
              {metrics.hasCustomApiKey ? 'Active (User Secret)' : 'Fallback Safe Mode'}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)] block mb-1">Server Uptime:</span>
            <span className="text-[var(--color-text-primary)] tabular-nums">{metrics.uptimeSeconds} seconds</span>
          </div>
        </div>
      </div>

      {/* Admin Settings Form */}
      {settings && (
        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <h3 className="text-sm font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Operational Policies & Limits</span>
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
              <div>
                <div className="font-semibold text-[var(--color-text-primary)]">Allow New Registrations</div>
                <div className="text-[11px] text-[var(--color-text-muted)]">Control invite-only beta access</div>
              </div>
              <input
                type="checkbox"
                checked={settings.allowNewRegistrations}
                onChange={(e) => setSettings({ ...settings, allowNewRegistrations: e.target.checked })}
                className="w-4 h-4 accent-[var(--color-accent)] cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[var(--color-text-primary)]">Daily AI Invocations Per Operator</div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">Cost-capping guardrail for Gemini inference</div>
                </div>
                <span className="font-mono font-bold text-[var(--color-accent)]">
                  {settings.dailyAiCallLimitPerUser} calls / day
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={200}
                step={5}
                value={settings.dailyAiCallLimitPerUser}
                onChange={(e) => setSettings({ ...settings, dailyAiCallLimitPerUser: Number(e.target.value) })}
                className="w-full accent-[var(--color-accent)] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {saveSuccess && (
                <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Policies updated successfully.</span>
                </span>
              )}
              <div className="ml-auto">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Configuration</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
