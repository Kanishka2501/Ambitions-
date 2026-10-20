import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Sparkles,
  History,
  Trash2,
  ChevronRight,
  Loader2,
  Edit3,
} from 'lucide-react';
import type { Milestone, PlanVersion } from '../types/index.js';
import { useGoal } from '../context/GoalContext.js';
import { api } from '../lib/api.js';

export const RoadmapView: React.FC = () => {
  const { activeGoal, milestones, toggleMilestoneComplete, createMilestone, deleteMilestone, refreshAllGoalData } = useGoal();

  const [versions, setVersions] = useState<PlanVersion[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // New milestone form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newMetric, setNewMetric] = useState('');

  // Adjustment form
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    if (activeGoal) {
      loadPlanVersions();
    }
  }, [activeGoal]);

  const loadPlanVersions = async () => {
    if (!activeGoal) return;
    try {
      const data = await api.getPlanVersions(activeGoal.id);
      setVersions(data.versions || []);
    } catch (err) {
      console.error('Failed to load plan versions:', err);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createMilestone({
      title: newTitle,
      description: newDescription,
      targetDate: newTargetDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      successMetric: newMetric,
    });
    setNewTitle('');
    setNewDescription('');
    setNewTargetDate('');
    setNewMetric('');
    setShowAddModal(false);
  };

  const handleRequestAdjustment = async () => {
    if (!adjustReason.trim() || !activeGoal || adjusting) return;
    setAdjusting(true);

    try {
      // Create a genuine plan version record reflecting the adjustment
      await api.createPlanVersion({
        goalId: activeGoal.id,
        reason: adjustReason.trim(),
        summary: `Roadmap recalibrated: ${adjustReason.trim().slice(0, 100)}`,
        changes: ['Adjusted milestone targets and recalibrated execution timeline based on operator input.'],
      });

      // Refresh
      await refreshAllGoalData();
      await loadPlanVersions();
      setShowAdjustModal(false);
      setAdjustReason('');
    } catch (err) {
      console.error('Failed to request adjustment:', err);
    } finally {
      setAdjusting(false);
    }
  };

  if (!activeGoal) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4 p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] mx-auto flex items-center justify-center">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[var(--color-text-primary)]">
          No Active Ambition Defined
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
          The roadmap engine structures your life goal into chronological milestones and accountability checkpoints. Architect your first goal to activate the timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            Strategic Roadmap
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mt-1">
            {activeGoal.title}
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-2xl">
            {activeGoal.measurableCriteria || 'Chronological milestones to completion.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowAdjustModal(true)}
            className="px-3.5 py-2 text-xs font-medium text-[var(--color-text-primary)] bg-[var(--color-surface-elevated)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)] border border-[var(--color-border)] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
            <span>Recalibrate Plan</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Milestone</span>
          </button>
        </div>
      </div>

      {/* Visual Milestone Pathway */}
      <div className="relative pl-6 md:pl-10 space-y-6 before:absolute before:left-3 md:before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[var(--color-border)]">
        {milestones.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--color-text-muted)]">
            No milestones defined yet. Click &ldquo;Add Milestone&rdquo; to structure your journey.
          </div>
        ) : (
          milestones.map((ms, idx) => (
            <div
              key={ms.id}
              className="relative p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] transition-all hover:border-[var(--color-border-active)] group"
            >
              {/* Node Marker */}
              <div
                onClick={() => toggleMilestoneComplete(ms)}
                className={`absolute -left-9 md:-left-11 top-5 w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer transition-transform group-hover:scale-110 ${
                  ms.completed
                    ? 'bg-emerald-500 border-emerald-400 text-white'
                    : 'bg-[var(--color-surface-elevated)] border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}
              >
                {ms.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-3.5 h-3.5" />}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-[var(--color-accent)]">
                    Phase {idx + 1}
                  </span>
                  <h3
                    className={`text-sm font-bold ${
                      ms.completed ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text-primary)]'
                    }`}
                  >
                    {ms.title}
                  </h3>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="text-[var(--color-text-muted)] flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Target: {ms.targetDate}</span>
                  </span>

                  <button
                    onClick={() => deleteMilestone(ms.id)}
                    className="text-[var(--color-text-muted)] hover:text-red-400 p-1 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Delete milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {ms.description && (
                <p className="mt-2 text-xs text-[var(--color-text-secondary)] leading-relaxed">
                  {ms.description}
                </p>
              )}

              {ms.successMetric && (
                <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-[11px] text-[var(--color-text-muted)] flex items-center gap-2">
                  <span className="font-semibold text-[var(--color-accent)]">Success Metric:</span>
                  <span>{ms.successMetric}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Plan Version History */}
      {versions.length > 0 && (
        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
            <History className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Evolution & Calibration Logs</span>
          </div>

          <div className="space-y-3">
            {versions.map((ver) => (
              <div
                key={ver.id}
                className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="font-semibold text-[var(--color-text-primary)]">{ver.reason}</div>
                  <div className="text-[var(--color-text-muted)] text-[11px] mt-0.5">{ver.summary}</div>
                </div>
                <div className="text-[10px] font-mono text-[var(--color-text-muted)] shrink-0">
                  {new Date(ver.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-4">
              Add Milestone to Roadmap
            </h3>

            <form onSubmit={handleCreateMilestone} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
                  Milestone Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Complete User Validation Prototype"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  placeholder="What must be built or accomplished?"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
                  Success Criteria / Metric
                </label>
                <input
                  type="text"
                  value={newMetric}
                  onChange={(e) => setNewMetric(e.target.value)}
                  placeholder="e.g. 10 user interviews with transcribed feedback"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl cursor-pointer"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Plan Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-text-primary)] mb-2">
              <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Recalibrate Roadmap with AI</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mb-4">
              Explain what changed (e.g. schedule disruptions, newly discovered requirements, or changing constraints).
            </p>

            <textarea
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
              placeholder="e.g. Work commitment spiked for the next 2 weeks, need to adjust Milestone 2 deadline and prioritize only non-negotiable tasks."
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] resize-none mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="px-3.5 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestAdjustment}
                disabled={adjusting || !adjustReason.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                {adjusting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Apply Recalibration</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
