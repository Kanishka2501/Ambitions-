import React, { useState, useEffect } from 'react';
import {
  Compass,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Clock,
  Target,
  Zap,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';
import heroPreviewImg from '../assets/images/hero_northstar_preview_1792165738307.jpg';
import visionMilestoneImg from '../assets/images/vision_milestone_path_1792165738879.jpg';
import coachMentorImg from '../assets/images/coach_avatar_mentor_1792165739140.jpg';

interface LandingPageProps {
  onStartOnboarding: () => void;
  onEnterApp: () => void;
  onOpenLogin: () => void;
  user?: import('../types/index.js').User | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartOnboarding,
  onEnterApp,
  onOpenLogin,
  user,
}) => {
  const { themePalette, setThemePalette, themeMode, toggleThemeMode } = useTheme();

  // Sample Pictures & Gallery State
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Coach Persona interactive preview in section 5
  const [activePersona, setActivePersona] = useState<'gentle' | 'strategic' | 'direct'>('strategic');

  const samplePictures = [
    {
      id: 'dashboard',
      tabLabel: 'Focus Dashboard',
      title: 'Daily Focus & High-Leverage Tasks',
      subtitle: 'Dynamic priority ranking & Pomodoro execution engine',
      kicker: 'Production Screenshot 01',
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
      kicker: 'Production Screenshot 02',
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
      kicker: 'Production Screenshot 03',
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

  // Keyboard navigation for Lightbox modal
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % samplePictures.length);
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + samplePictures.length) % samplePictures.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, samplePictures.length]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const coachPersonaMessages = {
    gentle: {
      title: 'Gentle Guidance',
      tagline: 'Psychologically safe, supportive & steady',
      quote:
        '“You logged 90 minutes of deep work yesterday, which is solid momentum. If the marketing setup feels daunting this morning, let’s shrink it down: just draft the first 3 bullet points for 15 minutes. No pressure for perfection.”',
      recommendation: 'Start 15m Low-Stress Micro Block',
    },
    strategic: {
      title: 'Strategic Advisor',
      tagline: 'Analytical, pragmatic & leverage-focused',
      quote:
        '“Your target is 1,000 operators by December. You finished 3 administrative items today, but deferred the primary distribution pipeline. If you protect 45 minutes for that right now, your bottleneck for the week dissolves.”',
      recommendation: 'Start 45m Distribution Focus Block',
    },
    direct: {
      title: 'Direct Accountability',
      tagline: 'Candid, concise & uncompromising on standards',
      quote:
        '“The launch milestone deadline is in 12 days. Minor polish tasks are consuming your morning while the payment integration remains incomplete. Shift focus to checkout testing now; everything else is secondary.”',
      recommendation: 'Switch Immediately to High-Urgency Task',
    },
  };

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] selection:bg-[var(--color-accent-soft)] selection:text-[var(--color-accent)]">
      {/* ---------------- 1. TOP BAR (Strict 3-zone contract) ---------------- */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--color-canvas)]/85 border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element Brand */}
          <a
            href="/"
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[var(--color-text-primary)] whitespace-nowrap shrink-0 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] shadow-sm group-hover:scale-105 transition-transform">
              <Compass className="w-4 h-4" />
            </div>
            <span>Northstar AI</span>
          </a>

          {/* Zone 2: 4-5 single-line clean nav links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[var(--color-text-secondary)]">
            <a href="#how-it-works" className="hover:text-[var(--color-text-primary)] transition-colors whitespace-nowrap shrink-0">
              How It Works
            </a>
            <a href="#previews" className="hover:text-[var(--color-text-primary)] transition-colors whitespace-nowrap shrink-0">
              Sample Previews
            </a>
            <a href="#architecture" className="hover:text-[var(--color-text-primary)] transition-colors whitespace-nowrap shrink-0">
              System Pillars
            </a>
            <a href="#coaching" className="hover:text-[var(--color-text-primary)] transition-colors whitespace-nowrap shrink-0">
              Adaptive Coach
            </a>
            <a href="#pricing" className="hover:text-[var(--color-text-primary)] transition-colors whitespace-nowrap shrink-0">
              Pricing
            </a>
          </nav>

          {/* Zone 3: 1 primary action + Auth Link */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <button
                onClick={onEnterApp}
                className="text-xs font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-accent)] px-3 py-1.5 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{user.name.split(' ')[0]}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-surface-elevated)] text-[var(--color-accent)] border border-[var(--color-border)]">
                  Dashboard &rarr;
                </span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-3 py-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign In
              </button>
            )}
            <button
              onClick={onStartOnboarding}
              className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-lg shadow-sm hover:shadow transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <span>Build My Path</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- 2. HERO SECTION ---------------- */}
      <section className="relative pt-16 pb-14 md:pt-24 md:pb-20 border-b border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-accent)] font-medium mb-7">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Personal Goal Operating System</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--color-text-primary)] leading-[1.08] max-w-4xl mx-auto [text-wrap:balance]">
            Your biggest goal deserves a better system.
          </h1>

          <p className="mt-6 text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed [text-wrap:balance]">
            Northstar turns ambitious destinations into verified milestones, daily high-leverage execution, an adaptive AI coach, and self-improving weekly reviews.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartOnboarding}
              className="w-full sm:w-auto px-7 py-3.5 text-sm font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl shadow-lg shadow-[var(--color-accent)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Build My Personalized Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-medium text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Launch Live Dashboard</span>
            </button>
          </div>

          {/* Clean Proof Bar without Pills */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--color-text-muted)]">
            <span>Powered by Server-Side Gemini 3.8</span>
            <span aria-hidden="true">·</span>
            <span>Zero Hallucinated Metrics</span>
            <span aria-hidden="true">·</span>
            <span>Private & Encrypted Storage</span>
            <span aria-hidden="true">·</span>
            <span>Full Task Execution Engine</span>
          </div>
        </div>

        {/* Visual Hero Dashboard Preview (Desktop Window Frame with Zero Cropping) */}
        <div className="max-w-6xl mx-auto px-6 mt-12">
          <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-2xl bg-[var(--color-surface)]">
            {/* Window Chrome Header */}
            <div className="px-4 py-3 bg-[var(--color-canvas)] border-b border-[var(--color-border)] flex items-center justify-between gap-4 select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-xs font-mono text-[var(--color-text-muted)] hidden sm:inline">
                  northstar.os / active-workspace / sprint-01
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-[var(--color-accent)] bg-[var(--color-accent-soft)] px-2 py-0.5 rounded">
                  Live System View
                </span>
                <button
                  onClick={() => openLightbox(0)}
                  title="Inspect Fullscreen"
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 rounded transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Expand</span>
                </button>
              </div>
            </div>

            {/* Pristine Image Display without dark obscuring gradients */}
            <div
              onClick={() => openLightbox(0)}
              className="relative group cursor-pointer overflow-hidden bg-[var(--color-surface)]"
            >
              <img
                src={heroPreviewImg}
                alt="Northstar AI Operating System Interface Preview"
                className="w-full h-auto aspect-[16/9] object-contain sm:object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center pointer-events-none">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-surface)]/95 backdrop-blur px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)] flex items-center gap-1.5 shadow-lg">
                  <Eye className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span>Click to inspect high-resolution capture</span>
                </div>
              </div>
            </div>

            {/* Clean Integrated Status Footer (Not covering the picture) */}
            <div className="p-4 sm:p-5 bg-[var(--color-surface-elevated)]/70 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                  Live System Calibration
                </div>
                <div className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5">
                  Sample Goal: Launch Startup & Reach First 1,000 Active Operators
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1 flex flex-wrap items-center gap-2.5">
                  <span>Milestone 1 in progress</span>
                  <span aria-hidden="true">·</span>
                  <span>4 tasks scheduled for today</span>
                  <span aria-hidden="true">·</span>
                  <span>Strategic Coach active</span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href="#previews"
                  className="px-3.5 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-canvas)] border border-[var(--color-border)] rounded-lg transition-colors whitespace-nowrap"
                >
                  View All Previews ↓
                </a>
                <button
                  onClick={onEnterApp}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-lg transition-colors whitespace-nowrap cursor-pointer shadow-sm"
                >
                  Explore Live Demo &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 3. DEDICATED SAMPLE PICTURES & SYSTEM TOUR SECTION ---------------- */}
      <section id="previews" className="py-20 md:py-28 max-w-6xl mx-auto px-6 border-b border-[var(--color-border)]">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-3">
            System Interface & Sample Pictures
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--color-text-primary)] [text-wrap:balance]">
            Explore Northstar in full high-resolution clarity
          </h2>
          <p className="mt-4 text-base text-[var(--color-text-secondary)] leading-relaxed [text-wrap:balance]">
            Inspect authentic production captures across all core subsystems. From high-level roadmap architecture to daily Pomodoro focus blocks and adaptive coach diagnostics.
          </p>

          {/* Interactive Segmented Tabs */}
          <div className="mt-9 inline-flex p-1.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] max-w-full overflow-x-auto">
            {samplePictures.map((item, idx) => {
              const isActive = activePreviewIndex === idx;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePreviewIndex(idx)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-[var(--color-accent)] text-white shadow-sm'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]'
                  }`}
                >
                  {idx === 0 && <Target className="w-3.5 h-3.5" />}
                  {idx === 1 && <Layers className="w-3.5 h-3.5" />}
                  {idx === 2 && <Bot className="w-3.5 h-3.5" />}
                  <span>{item.tabLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Sample Picture Showcase Frame */}
        {(() => {
          const current = samplePictures[activePreviewIndex];
          return (
            <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl transition-all">
              {/* Window Header */}
              <div className="px-5 py-3.5 bg-[var(--color-canvas)] border-b border-[var(--color-border)] flex items-center justify-between gap-4 select-none">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="ml-2 text-xs font-mono text-[var(--color-text-muted)]">
                    northstar / views / {current.id}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-[var(--color-accent)] bg-[var(--color-accent-soft)] px-2.5 py-0.5 rounded">
                    {current.kicker}
                  </span>
                  <button
                    onClick={() => openLightbox(activePreviewIndex)}
                    className="p-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] rounded hover:bg-[var(--color-surface-elevated)] transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Open Fullscreen Lightbox"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span className="text-xs hidden sm:inline font-medium">Fullscreen</span>
                  </button>
                </div>
              </div>

              {/* Sample Picture Container with uncropped aspect ratio */}
              <div
                onClick={() => openLightbox(activePreviewIndex)}
                className="relative group cursor-pointer overflow-hidden bg-[var(--color-surface)]"
              >
                <img
                  src={current.image}
                  alt={current.alt}
                  className="w-full h-auto aspect-[16/9] object-contain sm:object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center pointer-events-none">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--color-surface)]/95 backdrop-blur px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-2 shadow-xl">
                    <Eye className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Click for full-screen inspection ({current.title})</span>
                  </div>
                </div>
              </div>

              {/* Details & Structure Strip */}
              <div className="p-6 md:p-8 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="text-xs font-mono font-semibold text-[var(--color-accent)] uppercase tracking-wider">
                      {current.subtitle}
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-[var(--color-text-primary)] mt-1">
                      {current.title}
                    </h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-2.5 leading-relaxed">
                      {current.description}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                    <button
                      onClick={() => openLightbox(activePreviewIndex)}
                      className="px-5 py-2.5 text-xs font-semibold text-[var(--color-text-primary)] bg-[var(--color-canvas)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Maximize2 className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                      <span>Inspect Fullscreen</span>
                    </button>
                    <button
                      onClick={onEnterApp}
                      className="px-5 py-2.5 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Try In Live App</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subsystem Key Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--color-border)]">
                  {current.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-[var(--color-text-secondary)]">
                      <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)] shrink-0 mt-0.5" />
                      <span className="leading-snug">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 3-Card Interactive Thumbnail Grid for Quick Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {samplePictures.map((pic, idx) => {
            const isSelected = activePreviewIndex === idx;
            return (
              <div
                key={pic.id}
                onClick={() => setActivePreviewIndex(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[var(--color-surface-elevated)] border-[var(--color-accent)] shadow-lg shadow-[var(--color-accent)]/10 ring-2 ring-[var(--color-accent)]/30'
                    : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-accent)]/40 hover:bg-[var(--color-surface-elevated)]'
                }`}
              >
                <div>
                  <div className="relative rounded-xl overflow-hidden aspect-[16/9] border border-[var(--color-border)] mb-3 bg-[var(--color-canvas)]">
                    <img
                      src={pic.image}
                      alt={pic.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-black/70 text-white backdrop-blur">
                      Sample 0{idx + 1}
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-accent)] text-white shadow">
                        Active View
                      </div>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                    {pic.title}
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-1.5 leading-relaxed line-clamp-2">
                    {pic.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[var(--color-accent)]">
                    {isSelected ? 'Currently Viewing' : 'Click to View'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openLightbox(idx);
                    }}
                    className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors rounded"
                    title="Zoom in lightbox"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------------- 4. HOW IT WORKS (Methodology) ---------------- */}
      <section id="how-it-works" className="py-20 md:py-28 max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-3">
            Execution Methodology
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] [text-wrap:balance]">
            From visionary ambition to daily momentum
          </h3>
          <p className="mt-4 text-base text-[var(--color-text-secondary)]">
            Northstar does not merely give you an aspirational checklist. It engineers an active feedback loop that evolves when your reality changes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="text-xs font-mono text-[var(--color-accent)] font-semibold mb-3">01</div>
            <h4 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
              Context & Reality Audit
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              We capture your starting baseline, weekly hours, known friction points, and constraints so the roadmap fits your actual life.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="text-xs font-mono text-[var(--color-accent)] font-semibold mb-3">02</div>
            <h4 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
              AI Strategic Decomposition
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Gemini decomposes your goal into sequential milestones, risk mitigations, and the smallest immediate 5-minute action.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="text-xs font-mono text-[var(--color-accent)] font-semibold mb-3">03</div>
            <h4 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
              Daily Focus Engine
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Execute with integrated Pomodoro timer, subtask tracking, and the &ldquo;What should I do right now?&rdquo; priority engine.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
            <div className="text-xs font-mono text-[var(--color-accent)] font-semibold mb-3">04</div>
            <h4 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
              Self-Improving Retrospectives
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Conduct honest weekly reviews that synthesize actual performance data and calibrate next week’s targets automatically.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- 5. CORE SYSTEM PILLARS ---------------- */}
      <section id="architecture" className="py-20 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-3">
              Engineered For Results
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] [text-wrap:balance]">
              Every tool an ambitious operator needs
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center mb-6">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
                &ldquo;What should I do right now?&rdquo;
              </h4>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                Decision paralysis ends here. Our algorithmic ranker analyzes your active milestone, available minutes, and overdue tasks to hand you the single highest-leverage move.
              </p>
              <div className="text-xs text-[var(--color-text-muted)] font-mono">
                Context-aware · Priority weighted · Duration calibrated
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center mb-6">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
                Deep Work Focus Engine
              </h4>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                Launch focused 25 or 50-minute execution blocks directly connected to your active task. Log real invested minutes to build authentic momentum.
              </p>
              <div className="text-xs text-[var(--color-text-muted)] font-mono">
                Integrated Pomodoro · Auto time logging · Zero distraction
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center mb-6">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
                Adaptive Roadmap Evolution
              </h4>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
                When life interrupts your plan, Northstar does not let you fail in silence. Propose calibrated adjustments with transparent version history and rationale.
              </p>
              <div className="text-xs text-[var(--color-text-muted)] font-mono">
                Plan version logs · Friction audit · Realistic pivot advice
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 6. ADAPTIVE COACH SPOTLIGHT (Revamped Layout) ---------------- */}
      <section id="coaching" className="py-20 md:py-28 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs text-[var(--color-accent)] font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Three Distinct Coaching Personas</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] leading-tight [text-wrap:balance]">
              An AI coach that understands your goal, pace, and blockers.
            </h3>
            <p className="mt-4 text-base text-[var(--color-text-secondary)] leading-relaxed">
              Unlike generic chatbots, the Northstar Coach is fed your real-time database state: your active goal criteria, completed tasks, missed deadlines, and known obstacles.
            </p>

            {/* Persona Switchers */}
            <div className="mt-8 space-y-3">
              {(['gentle', 'strategic', 'direct'] as const).map((key) => {
                const info = coachPersonaMessages[key];
                const isSelected = activePersona === key;
                return (
                  <button
                    key={key}
                    onClick={() => setActivePersona(key)}
                    className={`w-full p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--color-surface-elevated)] border-[var(--color-accent)] ring-1 ring-[var(--color-accent)] shadow-sm'
                        : 'bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-border)]/80 hover:bg-[var(--color-surface-elevated)]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-[var(--color-text-primary)]">
                        {info.title}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono text-[var(--color-accent)] bg-[var(--color-accent-soft)] px-2 py-0.5 rounded font-medium">
                          Active Persona
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                      {info.tagline}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coach Mentor Picture & Interactive Transcript Card */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-xl bg-[var(--color-surface)]">
              {/* Card Window Top */}
              <div className="px-5 py-3 bg-[var(--color-canvas)] border-b border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-xs font-mono text-[var(--color-text-muted)]">
                    coach_advisory_intelligence.active
                  </span>
                </div>
                <button
                  onClick={() => openLightbox(2)}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] flex items-center gap-1 cursor-pointer"
                  title="Expand Mentor Picture"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Inspect Avatar</span>
                </button>
              </div>

              {/* Mentor Avatar Banner (Proper Aspect Ratio) */}
              <div
                onClick={() => openLightbox(2)}
                className="relative group cursor-pointer overflow-hidden bg-black/40"
              >
                <img
                  src={coachMentorImg}
                  alt="Northstar AI Coach Advisor Mentor"
                  className="w-full h-64 sm:h-72 object-cover object-top transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-transparent to-black/20 pointer-events-none" />
                <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-white">
                  <div>
                    <div className="text-xs font-bold tracking-wide uppercase opacity-90">
                      Northstar Adaptive Intelligence
                    </div>
                    <div className="text-base font-bold drop-shadow">
                      {coachPersonaMessages[activePersona].title}
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-black/60 backdrop-blur border border-white/20">
                    Gemini 3.8 Live
                  </span>
                </div>
              </div>

              {/* Simulated Live Coach Dialogue */}
              <div className="p-6">
                <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] mb-3">
                  <span className="font-medium text-[var(--color-accent)]">Live Coach Output</span>
                  <span className="font-mono text-[11px]">Selected: {coachPersonaMessages[activePersona].title}</span>
                </div>

                <div className="p-4 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)]">
                  <p className="text-sm text-[var(--color-text-primary)] italic leading-relaxed">
                    {coachPersonaMessages[activePersona].quote}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-[var(--color-text-secondary)]">
                    Action: {coachPersonaMessages[activePersona].recommendation}
                  </span>
                  <button
                    onClick={onEnterApp}
                    className="text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    Test with Coach &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 7. PRICING SECTION (Honest & Transparent) ---------------- */}
      <section id="pricing" className="py-20 bg-[var(--color-surface)] border-t border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-3">
              Investment Architecture
            </h2>
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--color-text-primary)] [text-wrap:balance]">
              Transparent plans designed to scale with your ambition
            </h3>
            <p className="mt-4 text-base text-[var(--color-text-secondary)]">
              No hidden fees, no artificial paywalls on core task management. Test the full system immediately.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="p-8 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-[var(--color-text-primary)]">Solo Operator</h4>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">For focused individuals building one key habit or project</div>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[var(--color-text-primary)]">$0</span>
                  <span className="text-xs text-[var(--color-text-muted)]">/ forever</span>
                </div>

                <ul className="mt-8 space-y-3 text-sm text-[var(--color-text-secondary)]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>1 Active Primary Goal</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Unlimited tasks & milestones</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Standard AI goal decomposition</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Focus timer & time logging</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onStartOnboarding}
                className="mt-8 w-full py-2.5 px-4 text-xs font-semibold text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl transition-colors cursor-pointer"
              >
                Get Started Free
              </button>
            </div>

            {/* Pro */}
            <div className="p-8 rounded-2xl bg-[var(--color-canvas)] border-2 border-[var(--color-accent)] relative flex flex-col justify-between shadow-xl shadow-[var(--color-accent)]/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[var(--color-accent)] text-white text-[11px] font-semibold tracking-wide uppercase">
                Most Popular
              </div>

              <div>
                <h4 className="text-lg font-bold text-[var(--color-text-primary)]">Ambitious Pro</h4>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">For multi-hyphenate builders, founders, and students</div>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[var(--color-text-primary)]">$19</span>
                  <span className="text-xs text-[var(--color-text-muted)]">/ month</span>
                </div>

                <ul className="mt-8 space-y-3 text-sm text-[var(--color-text-secondary)]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Unlimited active goals</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>All 3 Adaptive AI Coach Personas</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Automated weekly review audits</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Deep research resource extractor</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>All 7 custom aesthetic themes</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onStartOnboarding}
                className="mt-8 w-full py-2.5 px-4 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl transition-all shadow-md cursor-pointer"
              >
                Start Pro Experience
              </button>
            </div>

            {/* Founder's Circle */}
            <div className="p-8 rounded-2xl bg-[var(--color-canvas)] border border-[var(--color-border)] flex flex-col justify-between">
              <div>
                <h4 className="text-lg font-bold text-[var(--color-text-primary)]">Founder&apos;s Circle</h4>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">For high-stakes execution with dedicated advisory support</div>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[var(--color-text-primary)]">$39</span>
                  <span className="text-xs text-[var(--color-text-muted)]">/ month</span>
                </div>

                <ul className="mt-8 space-y-3 text-sm text-[var(--color-text-secondary)]">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Highest model rate limits & context</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Priority roadmap versioning & diffs</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Founder admin console access</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Direct quarterly strategy blueprint review</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onEnterApp}
                className="mt-8 w-full py-2.5 px-4 text-xs font-semibold text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl transition-colors cursor-pointer"
              >
                Join Founder&apos;s Circle
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 8. PRIVACY & SECURITY ---------------- */}
      <section id="security" className="py-20 max-w-6xl mx-auto px-6">
        <div className="p-10 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)]">
          <div className="flex items-center gap-3 text-[var(--color-accent)] mb-4">
            <Lock className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Privacy Constitution</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-4">
            Your personal ambition belongs strictly to you.
          </h3>
          <p className="text-sm md:text-base text-[var(--color-text-secondary)] max-w-3xl leading-relaxed">
            We treat your goals, personal reflections, and weekly reviews as confidential. Secrets remain strictly on the backend, data is isolated per account, and you have instant single-click account erasure rights anytime.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-8 border-t border-[var(--color-border)]">
            <div>
              <div className="text-sm font-semibold text-[var(--color-text-primary)]">Zero Training on Notes</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1">Your private journal entries and blockers are never used to train public foundation models.</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--color-text-primary)]">Data Isolation & RBAC</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1">Strict server-side validation enforces that users can only access their authenticated records.</div>
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--color-text-primary)]">Instant Permanent Deletion</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1">One-click complete purge removes goals, tasks, reviews, and logs permanently from the database.</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- 9. FINAL CTA ---------------- */}
      <section className="py-20 text-center max-w-4xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] [text-wrap:balance]">
          Start building your personalized execution path today.
        </h2>
        <p className="mt-4 text-base text-[var(--color-text-secondary)] max-w-xl mx-auto">
          No credit card required. Decompose your ambition in under two minutes.
        </p>
        <div className="mt-8 flex justify-center">
          <button
            onClick={onStartOnboarding}
            className="px-8 py-4 text-sm font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl shadow-xl shadow-[var(--color-accent)]/25 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Launch Smart Onboarding</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ---------------- 10. FOOTER ---------------- */}
      <footer className="border-t border-[var(--color-border)] py-12 bg-[var(--color-canvas)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[var(--color-text-muted)]">
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-[var(--color-accent)]" />
            <span className="font-semibold text-[var(--color-text-primary)]">Northstar AI</span>
            <span>·</span>
            <span>Personal Goal Operating System</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#how-it-works" className="hover:text-[var(--color-text-primary)] transition-colors">Methodology</a>
            <a href="#previews" className="hover:text-[var(--color-text-primary)] transition-colors">Sample Previews</a>
            <a href="#architecture" className="hover:text-[var(--color-text-primary)] transition-colors">System</a>
            <a href="#pricing" className="hover:text-[var(--color-text-primary)] transition-colors">Pricing</a>
            <a href="#security" className="hover:text-[var(--color-text-primary)] transition-colors">Privacy</a>
            <button
              onClick={toggleThemeMode}
              className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
            >
              Mode: {themeMode === 'dark' ? 'Dark' : 'Light'}
            </button>
          </div>

          <div>
            &copy; {new Date().getFullYear()} Northstar AI. All rights reserved.
          </div>
        </div>
      </footer>

      {/* ---------------- 11. FULLSCREEN LIGHTBOX MODAL ---------------- */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Lightbox Top Bar */}
          <div
            className="flex items-center justify-between text-white shrink-0 pb-3 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[var(--color-accent)] bg-white/10 px-2.5 py-1 rounded">
                Sample Picture {lightboxIndex + 1} of {samplePictures.length}
              </span>
              <span className="text-sm font-semibold hidden sm:inline">
                {samplePictures[lightboxIndex].title}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-white/60 hidden md:inline">
                Use &larr; &rarr; arrow keys to navigate · Esc to close
              </span>
              <button
                onClick={() => setLightboxOpen(false)}
                className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Main Image Canvas with Navigation Arrows */}
          <div
            className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Prev Button */}
            <button
              onClick={() =>
                setLightboxIndex(
                  (prev) => (prev - 1 + samplePictures.length) % samplePictures.length
                )
              }
              className="absolute left-2 sm:left-4 z-10 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 hover:scale-110 transition-all cursor-pointer shadow-lg"
              title="Previous Picture"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Current Image */}
            <img
              src={samplePictures[lightboxIndex].image}
              alt={samplePictures[lightboxIndex].alt}
              className="max-h-[72vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 duration-200"
            />

            {/* Next Button */}
            <button
              onClick={() =>
                setLightboxIndex((prev) => (prev + 1) % samplePictures.length)
              }
              className="absolute right-2 sm:right-4 z-10 p-3 rounded-full bg-black/70 hover:bg-black/90 text-white border border-white/20 hover:scale-110 transition-all cursor-pointer shadow-lg"
              title="Next Picture"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Bottom Caption Bar */}
          <div
            className="bg-white/10 backdrop-blur rounded-xl p-4 text-white shrink-0 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-5xl mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="text-xs font-mono text-[var(--color-accent)] font-semibold">
                {samplePictures[lightboxIndex].kicker} — {samplePictures[lightboxIndex].subtitle}
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                {samplePictures[lightboxIndex].title}
              </div>
              <div className="text-xs text-white/70 mt-1 max-w-2xl line-clamp-1 sm:line-clamp-none">
                {samplePictures[lightboxIndex].description}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => {
                  setLightboxOpen(false);
                  onEnterApp();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-lg transition-colors cursor-pointer"
              >
                Launch Workspace Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
