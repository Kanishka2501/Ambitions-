export type ThemeMode = 'dark' | 'light';

export type ThemePalette =
  | 'lavender-purple'
  | 'midnight-dark'
  | 'clean-silver'
  | 'soft-pink'
  | 'ocean-blue'
  | 'cream-gold'
  | 'forest-green';

export type CoachingStyle = 'gentle' | 'strategic' | 'direct';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'postponed';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'founder_admin';
  tier: 'free' | 'pro' | 'founder_circle';
  coachingStyle: CoachingStyle;
  themePalette: ThemePalette;
  themeMode: ThemeMode;
  createdAt: string;
}

export interface ServerUser extends User {
  passwordHash?: string;
  passwordSalt?: string;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  ip?: string;
  userAgent?: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  goalId: string;
  milestoneId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedMinutes: number;
  actualMinutesSpent: number;
  dueDate: string; // YYYY-MM-DD
  completedAt?: string;
  subtasks: Subtask[];
  notes?: string;
  blocker?: string;
  createdAt: string;
  order: number;
}

export interface Milestone {
  id: string;
  userId: string;
  goalId: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  completedAt?: string;
  order: number;
  successMetric: string;
}

export interface PlanVersion {
  id: string;
  goalId: string;
  timestamp: string;
  reason: string;
  summary: string;
  changes: string[];
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  whyItMatters: string;
  measurableCriteria: string;
  currentBaseline: string;
  targetDeadline: string;
  weeklyCommitmentHours: number;
  resourcesBudget: string;
  knownObstacles: string;
  constraints: string;
  coachingStyle: CoachingStyle;
  status: 'active' | 'completed' | 'paused' | 'archived';
  immediateNextAction: string;
  createdAt: string;
  updatedAt: string;
  progressPercent: number;
}

export interface CoachMessage {
  id: string;
  userId: string;
  goalId: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  coachingStyle: CoachingStyle;
  recommendedAction?: string;
}

export interface WeeklyReview {
  id: string;
  userId: string;
  goalId: string;
  weekEndingDate: string;
  accomplishedText: string;
  struggledText: string;
  learnedText: string;
  wastedTimeText: string;
  needsToChangeText: string;
  prioritiesNextWeek: string[];
  tasksCompletedCount: number;
  tasksMissedCount: number;
  aiFeedbackSummary?: string;
  proposedNextWeekTasks?: Array<{
    title: string;
    priority: TaskPriority;
    estimatedMinutes: number;
  }>;
  createdAt: string;
}

export interface ResourceItem {
  id: string;
  userId: string;
  goalId: string;
  title: string;
  type: 'article' | 'tutorial' | 'tool' | 'note' | 'book';
  url?: string;
  notes: string;
  keyTakeaways: string[];
  aiActionSteps: string[];
  createdAt: string;
}

export interface SystemMetrics {
  totalUsers: number;
  activeGoals: number;
  completedTasksTotal: number;
  totalFocusMinutes: number;
  weeklyReviewsCompleted: number;
  aiCallsCount: number;
  systemStatus: 'healthy' | 'degraded';
  geminiModel: string;
  hasCustomApiKey: boolean;
  uptimeSeconds: number;
}

export interface AdminSettings {
  allowNewRegistrations: boolean;
  dailyAiCallLimitPerUser: number;
  maintenanceMode: boolean;
  defaultCoachingStyle: CoachingStyle;
}
