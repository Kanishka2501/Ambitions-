import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  Layers,
  Bot,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  CheckCircle2,
  ArrowRight,
  Eye,
} from 'lucide-react';
import heroPreviewImg from '../assets/images/hero_northstar_preview_1792165738307.jpg';
import visionMilestoneImg from '../assets/images/vision_milestone_path_1792165738879.jpg';
import coachMentorImg from '../assets/images/coach_avatar_mentor_1792165739140.jpg';

interface SamplePicturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartOnboarding?: () => void;
}

export const SamplePicturesModal: React.FC<SamplePicturesModalProps> = ({
  isOpen,
  onClose,
  onStartOnboarding,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const samplePictures = [
    {
      id: 'dashboard',
      tabLabel: 'Focus Dashboard',
      title: 'Daily Focus & High-Leverage Tasks',
      subtitle: 'Dynamic priority ranking & Pomodoro execution engine',
      kicker: 'Production Sample 01',
      description:
        'Eliminate daily decision fatigue. Algorithmic ranking evaluates your active milestone, available minutes, and overdue tasks to hand you the single highest-leverage move with an integrated Pomodoro timer.',
      image: heroPreviewImg,
      alt: 'Northstar AI Daily Execution Dashboard with High-Leverage Task Ranker',
      highlights: [
        'Algorithmic priority ranking weighted by urgency and available minutes',
        'Built-in 25m & 50m Pomodoro deep work blocks with auto time logs',
        'Granular subtask breakdowns for zero-friction start initiation',
      ],
    },
    {
      id: 'roadmap',
      tabLabel: 'Milestone Roadmap',
      title: 'Strategic Vision & Milestone Path',
      subtitle: 'Decomposed sequential milestones & objective criteria',
      kicker: 'Production Sample 02',
      description:
        'Transform an intimidating multi-month ambition into 3 to 5 realistic, sequential milestones. Every milestone features verifiable success metrics, target completion dates, and adaptive version history diffs.',
      image: visionMilestoneImg,
      alt: 'Northstar AI Strategic Vision & Milestone Roadmap Path',
      highlights: [
        'Hierarchical roadmap decomposition from starting baseline to end goal',
        'Objective success metrics that eliminate vague, hallucinated progress',
        'Transparent version history logging when real-life constraints require adjustments',
      ],
    },
    {
      id: 'coach',
      tabLabel: 'Adaptive Coach',
      title: 'Adaptive AI Coach & Strategic Mentor',
      subtitle: 'Database-grounded intelligence across 3 coaching personas',
      kicker: 'Production Sample 03',
      description:
        'Context-aware mentoring that inspects your live database state: active milestone deadlines, completed tasks, and documented obstacles. Provides proactive recalibration without generic cheerleading.',
      image: coachMentorImg,
      alt: 'Northstar AI Adaptive Coach Mentor Intelligence',
      highlights: [
        'Direct context injection of your live goals, tasks, and bottlenecks',
        'Three selectable styles: Gentle Guidance, Strategic Advisor, Direct Accountability',
        'Instantly converts coaching breakthroughs into actionable daily tasks',
      ],
    },
  ];

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setActiveIndex((prev) => (prev + 1) % samplePictures.length);
      if (e.key === 'ArrowLeft') setActiveIndex((prev) => (prev - 1 + samplePictures.length) % samplePictures.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, samplePictures.length]);

  if (!isOpen) return null;

  const current = samplePictures[activeIndex];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[var(--color-canvas)] border-b border-[var(--color-border)] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center font-bold text-xs">
              0{activeIndex + 1}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--color-text-primary)]">
                System Interface Sample Pictures
              </h2>
              <div className="text-[11px] text-[var(--color-text-muted)]">
                Sample {activeIndex + 1} of {samplePictures.length}: {current.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab switchers */}
            <div className="hidden sm:flex items-center gap-1 bg-[var(--color-surface-elevated)] p-1 rounded-xl border border-[var(--color-border)] text-xs">
              {samplePictures.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                    activeIndex === idx
                      ? 'bg-[var(--color-accent)] text-white shadow-xs'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                  }`}
                >
                  {item.tabLabel}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
          {/* Main Picture Frame */}
          <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-canvas)] shadow-lg relative group">
            <div className="px-4 py-2.5 bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-[11px]">northstar.preview/{current.id}</span>
              </div>
              <span className="font-mono text-[10px] text-[var(--color-accent)]">{current.kicker}</span>
            </div>

            {/* Navigation Arrows on image */}
            <div className="relative">
              <button
                onClick={() => setActiveIndex((prev) => (prev - 1 + samplePictures.length) % samplePictures.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer"
                title="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <img
                src={current.image}
                alt={current.alt}
                className="w-full h-auto aspect-[16/9] object-contain sm:object-cover bg-[var(--color-surface)]"
              />

              <button
                onClick={() => setActiveIndex((prev) => (prev + 1) % samplePictures.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer"
                title="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Picture Info Strip */}
          <div className="p-5 rounded-2xl bg-[var(--color-surface-elevated)]/60 border border-[var(--color-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="max-w-2xl">
              <div className="text-[11px] font-mono text-[var(--color-accent)] font-semibold uppercase">
                {current.subtitle}
              </div>
              <h3 className="text-base font-bold text-[var(--color-text-primary)] mt-0.5">
                {current.title}
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed">
                {current.description}
              </p>
            </div>

            {onStartOnboarding && (
              <button
                onClick={() => {
                  onClose();
                  onStartOnboarding();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Architect My Goal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Key Capabilities */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {current.highlights.map((h, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex items-start gap-2.5 text-xs text-[var(--color-text-secondary)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                <span className="leading-snug">{h}</span>
              </div>
            ))}
          </div>

          {/* Thumbnail switcher buttons */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {samplePictures.map((pic, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <button
                  key={pic.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--color-surface-elevated)] border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
                      : 'bg-[var(--color-canvas)] border-[var(--color-border)] hover:border-[var(--color-border-active)]'
                  }`}
                >
                  <div className="aspect-[16/9] rounded-lg overflow-hidden mb-2 bg-[var(--color-surface)] border border-[var(--color-border)]">
                    <img src={pic.image} alt={pic.alt} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-[11px] font-bold text-[var(--color-text-primary)] truncate">
                    0{idx + 1}. {pic.tabLabel}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-[var(--color-canvas)] border-t border-[var(--color-border)] flex items-center justify-between text-xs text-[var(--color-text-muted)] shrink-0">
          <span>Use arrow keys to browse sample pictures · Esc to exit</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
