import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  Clock,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Sparkles,
  Calendar,
  Layers,
  BookOpen,
  ShieldCheck,
  Settings,
  Bot,
  ArrowRight,
  Trash2,
  ChevronDown,
  ChevronRight,
  Filter,
  AlertTriangle,
  Flame,
  Check,
  CheckSquare,
  Eye,
} from 'lucide-react';
import { useGoal } from '../context/GoalContext.js';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import type { Task, TaskPriority, TaskStatus } from '../types/index.js';
import { AICoachDrawer } from './AICoachDrawer.js';
import { WeeklyReviewModal } from './WeeklyReviewModal.js';
import { RoadmapView } from './RoadmapView.js';
import { ResourcesView } from './ResourcesView.js';
import { AdminView } from './AdminView.js';
import { SettingsModal } from './SettingsModal.js';
import { OnboardingModal } from './OnboardingModal.js';
import { SamplePicturesModal } from './SamplePicturesModal.js';

type ActiveTab = 'execution' | 'roadmap' | 'resources' | 'admin';

export const DashboardView: React.FC = () => {
  const {
    activeGoal,
    goals,
    tasks,
    milestones,
    reviews,
    selectActiveGoal,
    refreshAllGoalData,
    createTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    recommendation,
    requestNextRecommendation,
    focusTask,
    isFocusRunning,
    focusSecondsRemaining,
    startFocusSession,
    pauseFocusSession,
    resumeFocusSession,
    finishFocusSession,
    cancelFocusSession,
  } = useGoal();

  const { user } = useAuth();
  const { themePalette } = useTheme();

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('execution');
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSamplePicturesOpen, setIsSamplePicturesOpen] = useState(false);

  // Task Filter
  const [taskFilter, setTaskFilter] = useState<'all' | 'todo' | 'completed' | 'urgent'>('all');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Quick Task Creation
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('high');
  const [quickMinutes, setQuickMinutes] = useState(30);
  const [quickMilestoneId, setQuickMilestoneId] = useState<string>('');

  // Subtask Input
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Goal Switcher Dropdown
  const [goalDropdownOpen, setGoalDropdownOpen] = useState(false);

  // Quick Task Add Handler
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    if (!activeGoal) {
      setIsOnboardingOpen(true);
      return;
    }

    await createTask({
      title: quickTitle,
      priority: quickPriority,
      estimatedMinutes: Number(quickMinutes) || 30,
      milestoneId: quickMilestoneId || undefined,
      dueDate: new Date().toISOString().split('T')[0],
      subtasks: [],
    });

    setQuickTitle('');
  };

  const handleAddSubtask = async (task: Task) => {
    if (!newSubtaskTitle.trim()) return;
    const currentSubtasks = task.subtasks || [];
    const updated = [
      ...currentSubtasks,
      {
        id: 'st-' + Math.random().toString(36).substring(2, 7),
        title: newSubtaskTitle,
        completed: false,
      },
    ];
    await updateTask(task.id, { subtasks: updated });
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = async (task: Task, subtaskId: string) => {
    const updated = (task.subtasks || []).map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    await updateTask(task.id, { subtasks: updated });
  };

  // Filter Tasks
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'todo') return t.status !== 'completed';
    if (taskFilter === 'completed') return t.status === 'completed';
    if (taskFilter === 'urgent') return t.priority === 'urgent' && t.status !== 'completed';
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalFocusMinutes = tasks.reduce((sum, t) => sum + (t.actualMinutesSpent || 0), 0);

  // Days left
  const daysLeft = activeGoal?.targetDeadline
    ? Math.max(
        0,
        Math.ceil(
          (new Date(activeGoal.targetDeadline).getTime() - new Date().getTime()) / 86400000
        )
      )
    : 0;

  // Format Focus Timer
  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Recommended Task Object
  const recommendedTaskItem = recommendation?.recommendedTaskId
    ? tasks.find((t) => t.id === recommendation.recommendedTaskId)
    : null;

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] flex flex-col selection:bg-[var(--color-accent-soft)] selection:text-[var(--color-accent)]">
      {/* ---------------- 1. TOP HEADER (Strict Navigation Contract) ---------------- */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--color-canvas)]/85 border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          {/* Brand + Goal Dropdown */}
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2 text-base font-bold text-[var(--color-text-primary)] whitespace-nowrap shrink-0 group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] shadow-xs group-hover:scale-105 transition-transform">
                <Compass className="w-4 h-4" />
              </div>
              <span className="hidden sm:inline">Northstar</span>
            </a>

            <span className="text-[var(--color-border-active)]">/</span>

            {/* Goal Switcher */}
            <div className="relative">
              <button
                onClick={() => setGoalDropdownOpen(!goalDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs font-semibold text-[var(--color-text-primary)] transition-colors cursor-pointer max-w-[200px] sm:max-w-xs truncate"
              >
                <span className="truncate">{activeGoal?.title || 'Select Goal'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0" />
              </button>

              {goalDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setGoalDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-1 w-64 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xl p-1.5 z-50 text-xs">
                    <div className="text-[10px] font-semibold text-[var(--color-text-muted)] px-2.5 py-1 uppercase">
                      Your Ambitions
                    </div>
                    {goals.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          selectActiveGoal(g.id);
                          setGoalDropdownOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                          g.id === activeGoal?.id
                            ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)] font-semibold'
                            : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]'
                        }`}
                      >
                        <span className="truncate">{g.title}</span>
                        <span className="text-[10px] font-mono tabular-nums">{g.progressPercent}%</span>
                      </button>
                    ))}
                    <div className="border-t border-[var(--color-border)] my-1" />
                    <button
                      onClick={() => {
                        setGoalDropdownOpen(false);
                        setIsOnboardingOpen(true);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-[var(--color-accent)] hover:bg-[var(--color-surface-elevated)] font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Architect New Goal</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-border)] text-xs">
            <button
              onClick={() => setActiveTab('execution')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'execution'
                  ? 'bg-[var(--color-accent)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Today&apos;s Execution
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'roadmap'
                  ? 'bg-[var(--color-accent)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Roadmap & Milestones
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === 'resources'
                  ? 'bg-[var(--color-accent)] text-white shadow-xs'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Research Vault
            </button>

            {user?.role === 'founder_admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'admin'
                    ? 'bg-[var(--color-accent)] text-white shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                Founder Admin
              </button>
            )}
          </nav>

          {/* Right Action Zone */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* AI Coach Drawer Toggle */}
            <button
              onClick={() => setIsCoachOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] bg-[var(--color-accent-soft)] hover:bg-[var(--color-accent)] hover:text-white rounded-lg border border-[var(--color-border)] transition-all cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask Coach</span>
            </button>

            {/* Weekly Review Shortcut */}
            <button
              onClick={() => setIsReviewOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] rounded-lg border border-[var(--color-border)] transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span className="hidden sm:inline">Review</span>
            </button>

            {/* Sample Pictures & System Tour */}
            <button
              onClick={() => setIsSamplePicturesOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] rounded-lg border border-[var(--color-border)] transition-colors cursor-pointer"
              title="Inspect System Sample Pictures & Architecture"
            >
              <Eye className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span className="hidden lg:inline">Sample Tour</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] rounded-lg transition-colors cursor-pointer"
              title="System Settings & Theme"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- 2. FOCUS TIMER BANNER (When Running) ---------------- */}
      {focusTask && (
        <div className="bg-[var(--color-surface-elevated)] border-b border-[var(--color-border)] py-2.5 px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[var(--color-text-muted)]">Active Focus Block:</span>
              <span className="font-semibold text-[var(--color-text-primary)] truncate max-w-sm">
                {focusTask.title}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="font-mono text-base font-bold text-[var(--color-accent)] tabular-nums">
                {formatTimer(focusSecondsRemaining)}
              </div>

              <div className="flex items-center gap-1.5">
                {isFocusRunning ? (
                  <button
                    onClick={pauseFocusSession}
                    className="p-1.5 rounded-lg bg-[var(--color-surface)] hover:bg-[var(--color-canvas)] text-[var(--color-text-primary)] border border-[var(--color-border)] cursor-pointer"
                    title="Pause"
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={resumeFocusSession}
                    className="p-1.5 rounded-lg bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] cursor-pointer"
                    title="Resume"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={finishFocusSession}
                  className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                >
                  Mark Done
                </button>

                <button
                  onClick={cancelFocusSession}
                  className="p-1.5 text-[var(--color-text-muted)] hover:text-red-400 cursor-pointer"
                  title="Cancel Focus"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- 3. MAIN WORKSPACE ---------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* TAB 1: EXECUTION VIEW */}
        {activeTab === 'execution' && (
          <div className="space-y-8">
            {/* Goal Progress Banner or Empty State */}
            {activeGoal ? (
              <div className="p-6 md:p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-sm">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mb-2 font-mono">
                      <span>Status: {activeGoal.status}</span>
                      <span>·</span>
                      <span>{daysLeft} days remaining</span>
                      <span>·</span>
                      <span>{activeGoal.weeklyCommitmentHours}h weekly cadence</span>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
                      {activeGoal.title}
                    </h1>

                    <p className="mt-2 text-xs md:text-sm text-[var(--color-text-secondary)] max-w-3xl leading-relaxed">
                      {activeGoal.measurableCriteria || activeGoal.whyItMatters}
                    </p>
                  </div>

                  {/* Progress Indicator */}
                  <div className="w-full lg:w-72 bg-[var(--color-canvas)] p-4 rounded-2xl border border-[var(--color-border)] shrink-0">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-semibold text-[var(--color-text-primary)]">Goal Completion</span>
                      <span className="font-mono font-bold text-[var(--color-accent)] tabular-nums">
                        {activeGoal.progressPercent}%
                      </span>
                    </div>

                    <div className="w-full bg-[var(--color-surface-elevated)] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[var(--color-accent)] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, activeGoal.progressPercent))}%` }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--color-text-muted)] font-mono">
                      <span>{completedCount}/{tasks.length} actions</span>
                      <span>{milestones.filter((m) => m.completed).length}/{milestones.length} milestones</span>
                    </div>
                  </div>
                </div>

                {/* "What Should I Do Right Now?" Hero Card */}
                {recommendation && (
                  <div className="mt-6 p-4 rounded-2xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5 border border-[var(--color-border)]">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-accent)]">
                          Recommended Right Now
                        </div>
                        <div className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5">
                          {recommendedTaskItem ? recommendedTaskItem.title : recommendation.rationale}
                        </div>
                        <div className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                          {recommendation.rationale}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {recommendedTaskItem && (
                        <button
                          onClick={() => startFocusSession(recommendedTaskItem, 25)}
                          className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Start 25m Focus</span>
                        </button>
                      )}

                      <button
                        onClick={() => requestNextRecommendation()}
                        className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
                        title="Recalculate recommendation"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 md:p-10 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)] text-center max-w-3xl mx-auto space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] mx-auto flex items-center justify-center">
                  <Compass className="w-7 h-7" />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
                  Welcome to Northstar AI
                </h2>
                <p className="text-xs md:text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-xl mx-auto">
                  Turn your primary ambition into structured milestones, daily high-leverage execution, an adaptive AI coach, and weekly retrospectives.
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => setIsOnboardingOpen(true)}
                    className="px-6 py-3 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Architect Your First Goal</span>
                  </button>
                  <button
                    onClick={() => setIsSamplePicturesOpen(true)}
                    className="px-5 py-3 text-xs font-semibold text-[var(--color-text-primary)] bg-[var(--color-canvas)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-[var(--color-accent)]" />
                    <span>Inspect Sample System Pictures</span>
                  </button>
                </div>
              </div>
            )}

            {/* Split Grid: Today's Tasks & Execution Engine */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols: Task Engine */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Add Bar */}
                <form
                  onSubmit={handleAddTask}
                  className="p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row items-center gap-3"
                >
                  <input
                    type="text"
                    value={quickTitle}
                    onChange={(e) => setQuickTitle(e.target.value)}
                    placeholder="Capture an actionable task for today..."
                    className="flex-1 w-full px-3.5 py-2.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)]"
                  />

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={quickPriority}
                      onChange={(e: any) => setQuickPriority(e.target.value)}
                      className="px-2.5 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>

                    <input
                      type="number"
                      value={quickMinutes}
                      onChange={(e) => setQuickMinutes(Number(e.target.value))}
                      placeholder="Mins"
                      className="w-16 px-2.5 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-mono text-center focus:outline-none focus:border-[var(--color-accent)]"
                    />

                    <button
                      type="submit"
                      disabled={!quickTitle.trim()}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </form>

                {/* Filter Tabs */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-border)]">
                    <button
                      onClick={() => setTaskFilter('all')}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        taskFilter === 'all'
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      All ({tasks.length})
                    </button>
                    <button
                      onClick={() => setTaskFilter('todo')}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        taskFilter === 'todo'
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      Pending ({tasks.filter((t) => t.status !== 'completed').length})
                    </button>
                    <button
                      onClick={() => setTaskFilter('urgent')}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        taskFilter === 'urgent'
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      Urgent
                    </button>
                    <button
                      onClick={() => setTaskFilter('completed')}
                      className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                        taskFilter === 'completed'
                          ? 'bg-[var(--color-accent)] text-white'
                          : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                      }`}
                    >
                      Completed ({completedCount})
                    </button>
                  </div>

                  <span className="text-[11px] text-[var(--color-text-muted)] font-mono tabular-nums">
                    {totalFocusMinutes} mins invested
                  </span>
                </div>

                {/* Task List */}
                <div className="space-y-3">
                  {filteredTasks.length === 0 ? (
                    <div className="py-16 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-8">
                      <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-[var(--color-accent)]" />
                      <span>No tasks in this filter view. Add a new action above to build momentum.</span>
                    </div>
                  ) : (
                    filteredTasks.map((task) => {
                      const isCompleted = task.status === 'completed';
                      const isExpanded = expandedTaskId === task.id;
                      const priorityColor = {
                        urgent: 'text-red-400 bg-red-500/10 border-red-500/20',
                        high: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                        medium: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
                        low: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
                      }[task.priority];

                      return (
                        <div
                          key={task.id}
                          className={`p-4 rounded-2xl bg-[var(--color-surface)] border transition-all ${
                            isCompleted
                              ? 'border-[var(--color-border)] opacity-60'
                              : 'border-[var(--color-border)] hover:border-[var(--color-border-active)] shadow-xs'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Completion Toggle */}
                              <button
                                onClick={() => toggleTaskComplete(task)}
                                className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                                  isCompleted
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'border-[var(--color-border-active)] hover:border-[var(--color-accent)] text-transparent'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span
                                    className={`text-sm font-semibold ${
                                      isCompleted
                                        ? 'line-through text-[var(--color-text-muted)]'
                                        : 'text-[var(--color-text-primary)]'
                                    }`}
                                  >
                                    {task.title}
                                  </span>

                                  <span
                                    className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${priorityColor}`}
                                  >
                                    {task.priority}
                                  </span>

                                  <span className="text-[11px] font-mono text-[var(--color-text-muted)] tabular-nums">
                                    {task.estimatedMinutes}m est.
                                  </span>
                                </div>

                                {task.description && (
                                  <p className="mt-1 text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                    {task.description}
                                  </p>
                                )}

                                {/* Subtasks snippet if any */}
                                {task.subtasks && task.subtasks.length > 0 && (
                                  <div className="mt-2 text-[11px] text-[var(--color-text-muted)] flex items-center gap-1.5 font-mono">
                                    <span>
                                      Subtasks: {task.subtasks.filter((s) => s.completed).length}/
                                      {task.subtasks.length}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 shrink-0">
                              {!isCompleted && (
                                <button
                                  onClick={() => startFocusSession(task, task.estimatedMinutes || 25)}
                                  className="px-2.5 py-1 text-xs font-medium text-[var(--color-text-primary)] hover:text-white hover:bg-[var(--color-accent)] bg-[var(--color-canvas)] border border-[var(--color-border)] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Launch Pomodoro Focus Session"
                                >
                                  <Play className="w-3 h-3 text-[var(--color-accent)]" />
                                  <span className="hidden sm:inline">Focus</span>
                                </button>
                              )}

                              <button
                                onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                                className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                                title="Expand details"
                              >
                                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </button>

                              <button
                                onClick={() => deleteTask(task.id)}
                                className="p-1.5 text-[var(--color-text-muted)] hover:text-red-400 cursor-pointer"
                                title="Delete task"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Subtasks & Details */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-3 text-xs">
                              <div className="space-y-1.5">
                                <span className="font-semibold text-[var(--color-text-primary)] text-[11px] block">
                                  Subtasks
                                </span>
                                {(task.subtasks || []).map((st) => (
                                  <div
                                    key={st.id}
                                    onClick={() => handleToggleSubtask(task, st.id)}
                                    className="flex items-center gap-2 cursor-pointer hover:text-[var(--color-text-primary)] text-[var(--color-text-secondary)]"
                                  >
                                    <div
                                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                                        st.completed
                                          ? 'bg-emerald-500 border-emerald-500 text-white'
                                          : 'border-[var(--color-border)]'
                                      }`}
                                    >
                                      {st.completed && <Check className="w-2.5 h-2.5" />}
                                    </div>
                                    <span className={st.completed ? 'line-through text-[var(--color-text-muted)]' : ''}>
                                      {st.title}
                                    </span>
                                  </div>
                                ))}

                                <div className="flex items-center gap-2 mt-2">
                                  <input
                                    type="text"
                                    value={newSubtaskTitle}
                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                    placeholder="Add subtask..."
                                    className="px-2.5 py-1 rounded-lg bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddSubtask(task)}
                                    className="px-2 py-1 bg-[var(--color-surface-elevated)] hover:bg-[var(--color-accent-soft)] text-[var(--color-text-primary)] rounded-lg text-xs cursor-pointer"
                                  >
                                    Add Subtask
                                  </button>
                                </div>
                              </div>

                              {task.blocker && (
                                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                  <span>Blocker: {task.blocker}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Widgets & Milestones Snapshot */}
              <div className="space-y-6">
                {/* Milestones Snapshot */}
                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                      <Layers className="w-4 h-4 text-[var(--color-accent)]" />
                      <span>Roadmap Milestones</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('roadmap')}
                      className="text-xs text-[var(--color-accent)] hover:underline cursor-pointer"
                    >
                      View All &rarr;
                    </button>
                  </div>

                  <div className="space-y-3">
                    {milestones.slice(0, 3).map((ms, idx) => (
                      <div
                        key={ms.id}
                        className="p-3 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[var(--color-text-primary)] truncate max-w-[180px]">
                            {idx + 1}. {ms.title}
                          </span>
                          {ms.completed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-[var(--color-text-muted)] shrink-0" />
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-[var(--color-text-muted)]">
                          Target: {ms.targetDate}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Weekly Review Callout Card */}
                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
                    <Calendar className="w-4 h-4" />
                    <span>Weekly Accountability</span>
                  </div>
                  <h4 className="text-sm font-bold text-[var(--color-text-primary)]">
                    Calibrate your velocity with AI
                  </h4>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                    Conduct a 3-minute retrospective to synthesize your actual progress, identify blind spots, and queue next week’s priorities.
                  </p>
                  <button
                    onClick={() => setIsReviewOpen(true)}
                    className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Start Weekly Retrospective</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* AI Coach Quick Card */}
                <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-accent)]">
                    <Bot className="w-4 h-4" />
                    <span>Coach Insight</span>
                  </div>
                  <p className="text-xs text-[var(--color-text-secondary)] italic leading-relaxed">
                    &ldquo;Consistency compounds. Even 30 uninterrupted minutes on your primary milestone task protects your momentum.&rdquo;
                  </p>
                  <button
                    onClick={() => setIsCoachOpen(true)}
                    className="text-xs font-semibold text-[var(--color-accent)] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Open Strategic Chat</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROADMAP VIEW */}
        {activeTab === 'roadmap' && <RoadmapView />}

        {/* TAB 3: RESOURCES VIEW */}
        {activeTab === 'resources' && <ResourcesView />}

        {/* TAB 4: FOUNDER ADMIN VIEW */}
        {activeTab === 'admin' && <AdminView />}
      </main>

      {/* ---------------- 4. MODALS & DRAWERS ---------------- */}
      <AICoachDrawer isOpen={isCoachOpen} onClose={() => setIsCoachOpen(false)} />
      <WeeklyReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onPlanGenerated={async (savedGoal) => {
          setIsOnboardingOpen(false);
          await refreshAllGoalData();
          if (savedGoal?.id) {
            await selectActiveGoal(savedGoal.id);
          }
          setActiveTab('execution');
        }}
      />
      <SamplePicturesModal
        isOpen={isSamplePicturesOpen}
        onClose={() => setIsSamplePicturesOpen(false)}
        onStartOnboarding={() => {
          setIsSamplePicturesOpen(false);
          setIsOnboardingOpen(true);
        }}
      />
    </div>
  );
};
