import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  Shield,
  Loader2,
} from 'lucide-react';
import type { CoachingStyle } from '../types/index.js';
import { api } from '../lib/api.js';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanGenerated: (savedGoal: any) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onPlanGenerated,
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Form State
  const [primaryGoal, setPrimaryGoal] = useState('');
  const [whyItMatters, setWhyItMatters] = useState('');
  const [measurableCriteria, setMeasurableCriteria] = useState('');
  const [currentBaseline, setCurrentBaseline] = useState('');
  const [targetDeadline, setTargetDeadline] = useState('');
  const [weeklyCommitmentHours, setWeeklyCommitmentHours] = useState(15);
  const [resourcesBudget, setResourcesBudget] = useState('');
  const [knownObstacles, setKnownObstacles] = useState('');
  const [constraints, setConstraints] = useState('');
  const [coachingStyle, setCoachingStyle] = useState<CoachingStyle>('strategic');

  // Loading & generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepText, setGenerationStepText] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && !primaryGoal.trim()) {
      setError('Please define your primary destination.');
      return;
    }
    setError(null);
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setError(null);

    const steps = [
      'Decomposing primary goal into sequential milestones...',
      'Auditing constraints and weekly time budget...',
      'Isolating initial daily high-leverage tasks...',
      'Formulating smallest 5-minute immediate action...',
      'Synthesizing Northstar execution operating system...',
    ];

    let stepIdx = 0;
    setGenerationStepText(steps[0]);
    const stepInterval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setGenerationStepText(steps[stepIdx]);
      }
    }, 900);

    try {
      const response = await api.generatePlan({
        primaryGoal,
        whyItMatters,
        measurableCriteria,
        currentBaseline,
        targetDeadline,
        weeklyCommitmentHours,
        resourcesBudget,
        knownObstacles,
        constraints,
        coachingStyle,
        saveDirectlyToAccount: true,
      });

      clearInterval(stepInterval);
      if (response.savedGoal) {
        onPlanGenerated(response.savedGoal);
      } else {
        onClose();
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('[Onboarding] Generation failed:', err);
      setError(err?.message || 'Failed to generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const quickGoalPresets = [
    'Build a profitable AI startup from scratch',
    'Get into my dream university degree',
    'Learn software engineering and become employable',
    'Achieve peak physical discipline and run a marathon',
    'Write and publish a high-impact technical book',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)]">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold text-[var(--color-text-primary)]">
              Northstar Path Architect
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[var(--color-text-muted)]">
              Step {step} of {totalSteps}
            </span>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-1 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Line */}
        <div className="w-full bg-[var(--color-surface-elevated)] h-1">
          <div
            className="bg-[var(--color-accent)] h-1 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isGenerating ? (
            <div className="py-16 text-center space-y-6">
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[var(--color-accent)] animate-spin" />
                <Sparkles className="w-5 h-5 text-[var(--color-accent)] absolute inset-0 m-auto animate-pulse" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                  Architecting Your Operating System
                </h3>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)] font-mono">
                  {generationStepText}
                </p>
              </div>

              <div className="max-w-md mx-auto text-xs text-[var(--color-text-muted)]">
                Calibrating milestones, realistic weekly work capacities, and the immediate next step.
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: The Destination */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                      What is your primary destination?
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      Be as bold and specific as you want. Northstar handles the decomposition.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-2">
                      Primary Goal
                    </label>
                    <input
                      type="text"
                      value={primaryGoal}
                      onChange={(e) => setPrimaryGoal(e.target.value)}
                      placeholder="e.g. Build a profitable AI startup from scratch"
                      className="w-full px-4 py-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors"
                      autoFocus
                    />
                  </div>

                  <div>
                    <span className="text-xs text-[var(--color-text-muted)] mb-2 block">
                      Or select an inspiration archetype:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {quickGoalPresets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setPrimaryGoal(preset)}
                          className="px-3 py-1.5 text-xs text-[var(--color-text-secondary)] bg-[var(--color-surface-elevated)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)] border border-[var(--color-border)] rounded-lg transition-colors cursor-pointer text-left"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-2">
                      Why does this goal matter deeply to you? (Optional)
                    </label>
                    <textarea
                      value={whyItMatters}
                      onChange={(e) => setWhyItMatters(e.target.value)}
                      rows={3}
                      placeholder="e.g. To attain creative freedom, prove what I am capable of, and build something meaningful."
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 2: Current Situation & Measurability */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                      The Starting Line & Criteria
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      A good path connects where you are now to where you want to be.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-2">
                      What is your current level or baseline?
                    </label>
                    <input
                      type="text"
                      value={currentBaseline}
                      onChange={(e) => setCurrentBaseline(e.target.value)}
                      placeholder="e.g. Complete beginner; or have prototype but zero users"
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-2">
                      What does success look like in measurable terms?
                    </label>
                    <input
                      type="text"
                      value={measurableCriteria}
                      onChange={(e) => setMeasurableCriteria(e.target.value)}
                      placeholder="e.g. $5,000 monthly recurring revenue with 100 paying customers"
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-2">
                      What obstacles repeatedly hold you back?
                    </label>
                    <input
                      type="text"
                      value={knownObstacles}
                      onChange={(e) => setKnownObstacles(e.target.value)}
                      placeholder="e.g. Perfectionism, scope creep, getting stuck in tutorial hell"
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Timeline & Cadence */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                      Timeline & Weekly Bandwidth
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      Plans fail when they assume infinite time. We calculate based on real constraints.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-2">
                      Target Completion Deadline (Optional)
                    </label>
                    <input
                      type="date"
                      value={targetDeadline}
                      onChange={(e) => setTargetDeadline(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-[var(--color-text-primary)]">
                        Realistic Weekly Commitment
                      </label>
                      <span className="text-xs font-mono font-bold text-[var(--color-accent)]">
                        {weeklyCommitmentHours} hours / week
                      </span>
                    </div>

                    <input
                      type="range"
                      min={3}
                      max={60}
                      step={1}
                      value={weeklyCommitmentHours}
                      onChange={(e) => setWeeklyCommitmentHours(Number(e.target.value))}
                      className="w-full accent-[var(--color-accent)] cursor-pointer"
                    />

                    <div className="flex justify-between text-[11px] text-[var(--color-text-muted)] mt-1">
                      <span>5h (Side project)</span>
                      <span>15h (Moderate)</span>
                      <span>30h (High focus)</span>
                      <span>50h+ (Full time)</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[var(--color-accent)] shrink-0" />
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      At <strong className="text-[var(--color-text-primary)]">{weeklyCommitmentHours} hours/week</strong>, that is approximately <strong className="text-[var(--color-text-primary)]">{(weeklyCommitmentHours / 5).toFixed(1)} hours/day</strong> on weekdays.
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Guardrails & Resources */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                      Resources & Guardrails
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      Define what tools you have and what lines the plan must not cross.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-2">
                      Available Resources, Tools, or Budget
                    </label>
                    <input
                      type="text"
                      value={resourcesBudget}
                      onChange={(e) => setResourcesBudget(e.target.value)}
                      placeholder="e.g. Laptop, internet, $500 monthly budget, basic Figma skills"
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-primary)] mb-2">
                      Non-Negotiable Constraints
                    </label>
                    <textarea
                      value={constraints}
                      onChange={(e) => setConstraints(e.target.value)}
                      rows={3}
                      placeholder="e.g. No weekend burnout; must not interfere with 9-5 job; preserve 8 hours of sleep"
                      className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: Coaching Style & Confirmation */}
              {step === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)]">
                      Operating Style & Final Review
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                      Choose how you want your AI coach to challenge and support you.
                    </p>
                  </div>

                  {/* Coaching Style Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setCoachingStyle('gentle')}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        coachingStyle === 'gentle'
                          ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)]'
                          : 'bg-[var(--color-canvas)] border-[var(--color-border)] hover:border-[var(--color-border-active)]'
                      }`}
                    >
                      <div className="font-semibold text-xs text-[var(--color-text-primary)]">
                        Gentle
                      </div>
                      <div className="text-[11px] text-[var(--color-text-muted)] mt-1 leading-snug">
                        Encouraging, patient, and psychologically safe.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCoachingStyle('strategic')}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        coachingStyle === 'strategic'
                          ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)]'
                          : 'bg-[var(--color-canvas)] border-[var(--color-border)] hover:border-[var(--color-border-active)]'
                      }`}
                    >
                      <div className="font-semibold text-xs text-[var(--color-text-primary)]">
                        Strategic
                      </div>
                      <div className="text-[11px] text-[var(--color-text-muted)] mt-1 leading-snug">
                        Analytical, pragmatic, and focused on trade-offs.
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCoachingStyle('direct')}
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        coachingStyle === 'direct'
                          ? 'bg-[var(--color-accent-soft)] border-[var(--color-accent)]'
                          : 'bg-[var(--color-canvas)] border-[var(--color-border)] hover:border-[var(--color-border-active)]'
                      }`}
                    >
                      <div className="font-semibold text-xs text-[var(--color-text-primary)]">
                        Direct
                      </div>
                      <div className="text-[11px] text-[var(--color-text-muted)] mt-1 leading-snug">
                        Candid, concise, and accountability-driven.
                      </div>
                    </button>
                  </div>

                  {/* Summary Card */}
                  <div className="p-4 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[var(--color-text-muted)]">
                      <span>Destination:</span>
                      <span className="font-semibold text-[var(--color-text-primary)] truncate max-w-[280px]">
                        {primaryGoal || 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[var(--color-text-muted)]">
                      <span>Commitment:</span>
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        {weeklyCommitmentHours} hours / week
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[var(--color-text-muted)]">
                      <span>Coaching Persona:</span>
                      <span className="font-semibold text-[var(--color-accent)] capitalize">
                        {coachingStyle}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {!isGenerating && (
          <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGeneratePlan}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl shadow-lg shadow-[var(--color-accent)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Operating System</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
