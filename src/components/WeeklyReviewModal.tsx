import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useGoal } from '../context/GoalContext.js';
import { api } from '../lib/api.js';

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({ isOpen, onClose }) => {
  const { activeGoal, tasks, refreshAllGoalData } = useGoal();

  const [accomplishedText, setAccomplishedText] = useState('');
  const [struggledText, setStruggledText] = useState('');
  const [learnedText, setLearnedText] = useState('');
  const [wastedTimeText, setWastedTimeText] = useState('');
  const [needsToChangeText, setNeedsToChangeText] = useState('');

  const [loading, setLoading] = useState(false);
  const [synthesisResult, setSynthesisResult] = useState<any | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !activeGoal) return null;

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const missedTasks = tasks.filter(
    (t) => t.status === 'postponed' || (t.status === 'todo' && t.dueDate < new Date().toISOString().split('T')[0])
  );

  const handleSynthesizeReview = async () => {
    setLoading(true);
    try {
      const res = await api.synthesizeReview({
        goalId: activeGoal.id,
        accomplishedText,
        struggledText,
        learnedText,
        wastedTimeText,
        needsToChangeText,
        saveReview: true,
      });

      setSynthesisResult(res.synthesis);
      setSavedSuccess(true);
      await refreshAllGoalData();
    } catch (err) {
      console.error('Failed to synthesize review:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-canvas)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
                Weekly Execution Retrospective
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] truncate max-w-sm">
                Goal: {activeGoal.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Real Performance Summary Strip */}
        <div className="px-6 py-3 bg-[var(--color-surface-elevated)]/50 border-b border-[var(--color-border)] flex flex-wrap items-center justify-between text-xs text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{completedTasks.length} Completed</span>
            </span>
            <span className="flex items-center gap-1.5 font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>{missedTasks.length} Overdue / Postponed</span>
            </span>
          </div>
          <span className="text-[11px] text-[var(--color-text-muted)]">
            Week of {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          {savedSuccess && synthesisResult ? (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Weekly review synthesized and saved. Next week’s tasks have been queued into your execution engine.</span>
              </div>

              {/* AI Synthesis Summary */}
              <div className="p-5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] space-y-3">
                <div className="font-bold text-sm text-[var(--color-accent)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Strategic Audit Synthesis</span>
                </div>
                <p className="text-[var(--color-text-primary)] leading-relaxed text-xs">
                  {synthesisResult.summary}
                </p>
              </div>

              {/* Strengths & Blindspots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
                  <div className="font-semibold text-[var(--color-text-primary)] mb-2 text-xs">
                    Strengths Observed
                  </div>
                  <ul className="space-y-1.5 text-[var(--color-text-secondary)]">
                    {(synthesisResult.strengthsObserved || []).map((s: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-400">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
                  <div className="font-semibold text-[var(--color-text-primary)] mb-2 text-xs">
                    Friction & Blindspots
                  </div>
                  <ul className="space-y-1.5 text-[var(--color-text-secondary)]">
                    {(synthesisResult.blindSpotsAndFriction || []).map((b: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400">!</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Priorities */}
              <div className="p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                <div className="font-semibold text-[var(--color-text-primary)] mb-2">
                  Next Week&apos;s 3 Vital Priorities
                </div>
                <div className="space-y-1.5">
                  {(synthesisResult.recommendedPriorities || []).map((p: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                      <span className="w-4 h-4 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center font-mono text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposed Tasks */}
              {synthesisResult.proposedNextWeekTasks?.length > 0 && (
                <div>
                  <div className="font-semibold text-[var(--color-text-primary)] mb-2">
                    Queued Calibrated Tasks
                  </div>
                  <div className="space-y-2">
                    {synthesisResult.proposedNextWeekTasks.map((t: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-center justify-between"
                      >
                        <span className="font-medium text-[var(--color-text-primary)]">{t.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]">
                            {t.priority}
                          </span>
                          <span className="text-[11px] text-[var(--color-text-muted)] font-mono">
                            {t.estimatedMinutes}m
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
                  1. What did you accomplish this week?
                </label>
                <textarea
                  value={accomplishedText}
                  onChange={(e) => setAccomplishedText(e.target.value)}
                  placeholder="e.g. Shipped the core prototype, drafted 3 articles, hit gym 4 times."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
                  2. What did you struggle with or postpone?
                </label>
                <textarea
                  value={struggledText}
                  onChange={(e) => setStruggledText(e.target.value)}
                  placeholder="e.g. Delayed contacting user testers due to hesitation and lack of script."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
                  3. What was your biggest insight or lesson?
                </label>
                <textarea
                  value={learnedText}
                  onChange={(e) => setLearnedText(e.target.value)}
                  placeholder="e.g. Starting the day with the hardest task makes the afternoon effortless."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
                  4. What wasted your time or drained energy?
                </label>
                <textarea
                  value={wastedTimeText}
                  onChange={(e) => setWastedTimeText(e.target.value)}
                  placeholder="e.g. Mindless scrolling, rewriting documentation prematurely."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
                  5. What single operational habit must change next week?
                </label>
                <textarea
                  value={needsToChangeText}
                  onChange={(e) => setNeedsToChangeText(e.target.value)}
                  placeholder="e.g. Hard cutoff at 8pm, protect 9-11am as zero-interruption deep work."
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
          >
            {savedSuccess ? 'Close' : 'Cancel'}
          </button>

          {!savedSuccess ? (
            <button
              onClick={handleSynthesizeReview}
              disabled={loading || (!accomplishedText.trim() && !struggledText.trim())}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl shadow-md disabled:opacity-40 transition-all flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Synthesize & Calibrate Next Week</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Adopt & Return to Execution</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
