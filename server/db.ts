import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  ServerUser,
  Session,
  Goal,
  Milestone,
  Task,
  WeeklyReview,
  ResourceItem,
  CoachMessage,
  PlanVersion,
  SystemMetrics,
  AdminSettings,
} from '../src/types/index.js';
import { hashPassword } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'northstar-store.json');
const BACKUP_FILE = path.join(DATA_DIR, 'northstar-store.json.bak');

export interface DatabaseSchema {
  users: ServerUser[];
  sessions: Session[];
  goals: Goal[];
  milestones: Milestone[];
  tasks: Task[];
  reviews: WeeklyReview[];
  resources: ResourceItem[];
  coachMessages: CoachMessage[];
  planVersions: PlanVersion[];
  aiCallsCount: number;
  adminSettings: AdminSettings;
}

const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  allowNewRegistrations: true,
  dailyAiCallLimitPerUser: 50,
  maintenanceMode: false,
  defaultCoachingStyle: 'strategic',
};

const serverStartTime = Date.now();

// Default founder seed credentials (securely hashed)
const FOUNDER_EMAIL = 'kanishkarajput7777@gmail.com';
const { hash: DEFAULT_FOUNDER_HASH, salt: DEFAULT_FOUNDER_SALT } = hashPassword('FounderNorthstar2026!');

function getInitialSeedData(): DatabaseSchema {
  const founderUser: ServerUser = {
    id: 'user-founder-1',
    email: FOUNDER_EMAIL,
    name: 'Kanishka Rajput',
    role: 'founder_admin',
    tier: 'founder_circle',
    coachingStyle: 'strategic',
    themePalette: 'lavender-purple',
    themeMode: 'dark',
    passwordHash: DEFAULT_FOUNDER_HASH,
    passwordSalt: DEFAULT_FOUNDER_SALT,
    createdAt: new Date().toISOString(),
  };

  const sampleGoal: Goal = {
    id: 'goal-seed-1',
    userId: founderUser.id,
    title: 'Launch Northstar AI to 1,000 Active Goal Operators',
    whyItMatters: 'Empower ambitious builders, students, and founders to translate visionary life goals into structured daily momentum and real progress.',
    measurableCriteria: '1,000 weekly active users with at least 3 completed daily actions per week and 85% weekly review completion.',
    currentBaseline: 'Core product architecture ready, verified AI planner, zero paying users yet.',
    targetDeadline: '2026-12-31',
    weeklyCommitmentHours: 25,
    resourcesBudget: 'MacBook Pro, Google AI Studio Gemini API, Cloud Run instance, $2,000 launch budget.',
    knownObstacles: 'Scope creep, perfectionism before public feedback, marketing distribution friction.',
    constraints: 'Maintain 99.9% uptime, strict user data privacy, zero hallucinated progress percentages.',
    coachingStyle: 'strategic',
    status: 'active',
    immediateNextAction: 'Review the high-priority task queue and complete user onboarding test run.',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    progressPercent: 35,
  };

  const sampleMilestones: Milestone[] = [
    {
      id: 'ms-1',
      userId: founderUser.id,
      goalId: sampleGoal.id,
      title: 'Milestone 1: Production Core Architecture & AI Engine',
      description: 'Ship the full-stack system with adaptive coaching, task management, and responsive theme architecture.',
      targetDate: '2026-10-31',
      completed: true,
      completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      order: 1,
      successMetric: 'Full CRUD on tasks, sub-second execution, valid Gemini responses.',
    },
    {
      id: 'ms-2',
      userId: founderUser.id,
      goalId: sampleGoal.id,
      title: 'Milestone 2: Closed Beta with 50 Ambitious Operators',
      description: 'Onboard early founders, engineers, and students to validate daily momentum and weekly reviews.',
      targetDate: '2026-11-20',
      completed: false,
      order: 2,
      successMetric: 'NPS > 60 and 4+ days/week retention among beta cohort.',
    },
    {
      id: 'ms-3',
      userId: founderUser.id,
      goalId: sampleGoal.id,
      title: 'Milestone 3: Public Launch & Scaling to 1,000 Active Operators',
      description: 'Execute launch campaign, public show-and-tell, and organic viral loop through weekly progress shareables.',
      targetDate: '2026-12-31',
      completed: false,
      order: 3,
      successMetric: '1,000 weekly active operators executing daily goals.',
    },
  ];

  const todayStr = new Date().toISOString().split('T')[0];
  const sampleTasks: Task[] = [
    {
      id: 'task-1',
      userId: founderUser.id,
      goalId: sampleGoal.id,
      milestoneId: 'ms-1',
      title: 'Verify Gemini 3.8 Flash structured output schema integration',
      description: 'Ensure plan generator returns validated JSON schemas with zero markdown wrapping errors.',
      status: 'completed',
      priority: 'urgent',
      estimatedMinutes: 45,
      actualMinutesSpent: 40,
      dueDate: todayStr,
      completedAt: new Date().toISOString(),
      subtasks: [
        { id: 'st-1', title: 'Test responseSchema in server-side AI runner', completed: true },
        { id: 'st-2', title: 'Verify fallback resilience when offline', completed: true },
      ],
      notes: 'Structured JSON validation working with fallback mechanism.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      order: 1,
    },
    {
      id: 'task-2',
      userId: founderUser.id,
      goalId: sampleGoal.id,
      milestoneId: 'ms-2',
      title: 'Curate list of 50 high-ambition beta test operators',
      description: 'Identify university students, indie developers, and solo founders with ambitious goals for invite-only access.',
      status: 'todo',
      priority: 'high',
      estimatedMinutes: 60,
      actualMinutesSpent: 15,
      dueDate: todayStr,
      subtasks: [
        { id: 'st-3', title: 'Draft personalised 2-sentence beta invitation', completed: true },
        { id: 'st-4', title: 'Prepare feedback intake questionnaire', completed: false },
      ],
      blocker: '',
      notes: 'Aim for diverse goal domains: startup launch, thesis completion, and marathon training.',
      createdAt: new Date().toISOString(),
      order: 2,
    },
  ];

  return {
    users: [founderUser],
    sessions: [],
    goals: [sampleGoal],
    milestones: sampleMilestones,
    tasks: sampleTasks,
    reviews: [],
    resources: [],
    coachMessages: [],
    planVersions: [],
    aiCallsCount: 0,
    adminSettings: DEFAULT_ADMIN_SETTINGS,
  };
}

class DatabaseManager {
  private data: DatabaseSchema;
  private isWriting = false;

  constructor() {
    this.data = this.loadAndMigrate();
  }

  private loadAndMigrate(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        // Backup before loading/migration
        try {
          fs.copyFileSync(DB_FILE, BACKUP_FILE);
        } catch (backupErr) {
          console.warn('[DB] Backup warning:', backupErr);
        }

        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);

        // Ensure users have password hashes (migrate existing records safely)
        const migratedUsers: ServerUser[] = (parsed.users || []).map((u: any) => {
          if (!u.passwordHash || !u.passwordSalt) {
            const isFounder = u.email?.toLowerCase() === FOUNDER_EMAIL.toLowerCase();
            const defaultPass = isFounder ? 'FounderNorthstar2026!' : 'OperatorNorthstar2026!';
            const { hash, salt } = hashPassword(defaultPass);
            return {
              ...u,
              passwordHash: hash,
              passwordSalt: salt,
            };
          }
          return u;
        });

        // Ensure founder account exists
        if (!migratedUsers.some((u) => u.email.toLowerCase() === FOUNDER_EMAIL.toLowerCase())) {
          migratedUsers.unshift({
            id: 'user-founder-1',
            email: FOUNDER_EMAIL,
            name: 'Kanishka Rajput',
            role: 'founder_admin',
            tier: 'founder_circle',
            coachingStyle: 'strategic',
            themePalette: 'lavender-purple',
            themeMode: 'dark',
            passwordHash: DEFAULT_FOUNDER_HASH,
            passwordSalt: DEFAULT_FOUNDER_SALT,
            createdAt: new Date().toISOString(),
          });
        }

        const migratedSchema: DatabaseSchema = {
          users: migratedUsers,
          sessions: parsed.sessions || [],
          goals: parsed.goals || [],
          milestones: parsed.milestones || [],
          tasks: parsed.tasks || [],
          reviews: parsed.reviews || [],
          resources: parsed.resources || [],
          coachMessages: parsed.coachMessages || [],
          planVersions: parsed.planVersions || [],
          aiCallsCount: parsed.aiCallsCount || 0,
          adminSettings: parsed.adminSettings || DEFAULT_ADMIN_SETTINGS,
        };

        this.atomicWrite(migratedSchema);
        return migratedSchema;
      }
    } catch (err) {
      console.error('[DB] Failed to load/migrate database file, attempting backup recovery:', err);
      if (fs.existsSync(BACKUP_FILE)) {
        try {
          const rawBak = fs.readFileSync(BACKUP_FILE, 'utf-8');
          const parsedBak = JSON.parse(rawBak);
          return parsedBak;
        } catch (recoverErr) {
          console.error('[DB] Backup recovery failed, initializing seed:', recoverErr);
        }
      }
    }

    const seed = getInitialSeedData();
    this.atomicWrite(seed);
    return seed;
  }

  /**
   * Safe atomic file write: writes to temporary file then renames atomically.
   */
  private atomicWrite(dataToSave: DatabaseSchema) {
    if (this.isWriting) {
      // In-memory queue write if busy
      setTimeout(() => this.atomicWrite(dataToSave), 10);
      return;
    }

    this.isWriting = true;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      const tempFile = path.join(DATA_DIR, `northstar-store.json.tmp.${Date.now()}`);
      fs.writeFileSync(tempFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      console.error('[DB] Atomic write failed:', err);
    } finally {
      this.isWriting = false;
    }
  }

  private persist() {
    this.atomicWrite(this.data);
  }

  // --- SESSIONS ---
  createSession(userId: string, token: string, expiresAt: string, ip?: string, userAgent?: string): Session {
    // Purge expired sessions
    const now = new Date().toISOString();
    this.data.sessions = this.data.sessions.filter((s) => s.expiresAt > now);

    const newSession: Session = {
      id: 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId,
      token,
      createdAt: now,
      expiresAt,
      ip,
      userAgent,
    };
    this.data.sessions.push(newSession);
    this.persist();
    return newSession;
  }

  getSessionByToken(token: string): Session | undefined {
    if (!token) return undefined;
    const now = new Date().toISOString();
    const session = this.data.sessions.find((s) => s.token === token);
    if (!session) return undefined;
    if (session.expiresAt <= now) {
      // Session expired
      this.deleteSession(token);
      return undefined;
    }
    return session;
  }

  deleteSession(token: string): boolean {
    const initialLen = this.data.sessions.length;
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    if (this.data.sessions.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  deleteUserSessions(userId: string) {
    this.data.sessions = this.data.sessions.filter((s) => s.userId !== userId);
    this.persist();
  }

  // --- USERS ---
  getUsers(): ServerUser[] {
    return this.data.users;
  }

  getUserById(id: string): ServerUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): ServerUser | undefined {
    if (!email) return undefined;
    return this.data.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  createUser(userData: {
    email: string;
    name: string;
    passwordHash: string;
    passwordSalt: string;
    coachingStyle?: any;
    themePalette?: any;
    themeMode?: any;
  }): ServerUser {
    const cleanEmail = userData.email.trim().toLowerCase();
    const existing = this.getUserByEmail(cleanEmail);
    if (existing) {
      return existing;
    }

    // SECURITY: Public registration CANNOT create administrators.
    // Only pre-seeded founder or explicitly configured admin gets founder_admin.
    const isFounderEmail = cleanEmail === FOUNDER_EMAIL.toLowerCase();

    const newUser: ServerUser = {
      id: 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      email: cleanEmail,
      name: userData.name.trim(),
      role: isFounderEmail ? 'founder_admin' : 'user',
      tier: isFounderEmail ? 'founder_circle' : 'free',
      coachingStyle: userData.coachingStyle || 'strategic',
      themePalette: userData.themePalette || 'lavender-purple',
      themeMode: userData.themeMode || 'dark',
      passwordHash: userData.passwordHash,
      passwordSalt: userData.passwordSalt,
      createdAt: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  updateUser(id: string, updates: Partial<ServerUser>): ServerUser | null {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return null;

    // SECURITY: Prevent ordinary users from escalating their own role or tier via profile updates
    const safeUpdates = { ...updates };
    delete safeUpdates.id;
    delete safeUpdates.role;
    delete safeUpdates.tier;

    this.data.users[idx] = { ...this.data.users[idx], ...safeUpdates };
    this.persist();
    return this.data.users[idx];
  }

  deleteUser(userId: string): boolean {
    const userGoalIds = new Set(this.data.goals.filter((g) => g.userId === userId).map((g) => g.id));
    this.data.users = this.data.users.filter((u) => u.id !== userId);
    this.data.sessions = this.data.sessions.filter((s) => s.userId !== userId);
    this.data.goals = this.data.goals.filter((g) => g.userId !== userId);
    this.data.milestones = this.data.milestones.filter((m) => m.userId !== userId);
    this.data.tasks = this.data.tasks.filter((t) => t.userId !== userId);
    this.data.reviews = this.data.reviews.filter((r) => r.userId !== userId);
    this.data.resources = this.data.resources.filter((res) => res.userId !== userId);
    this.data.coachMessages = this.data.coachMessages.filter((m) => m.userId !== userId);
    this.data.planVersions = this.data.planVersions.filter((v) => !userGoalIds.has(v.goalId));
    this.persist();
    return true;
  }

  // --- GOALS ---
  getGoals(userId: string): Goal[] {
    return this.data.goals.filter((g) => g.userId === userId);
  }

  getGoalById(goalId: string, userId: string): Goal | undefined {
    return this.data.goals.find((g) => g.id === goalId && g.userId === userId);
  }

  getActiveGoal(userId: string): Goal | undefined {
    return this.data.goals.find((g) => g.userId === userId && g.status === 'active') || this.data.goals.find((g) => g.userId === userId);
  }

  isGoalOwnedByUser(goalId: string, userId: string): boolean {
    return this.data.goals.some((g) => g.id === goalId && g.userId === userId);
  }

  createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt' | 'progressPercent'>): Goal {
    if (goal.status === 'active') {
      this.data.goals.forEach((g) => {
        if (g.userId === goal.userId && g.status === 'active') {
          g.status = 'paused';
        }
      });
    }

    const newGoal: Goal = {
      ...goal,
      id: 'goal-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progressPercent: 0,
    };
    this.data.goals.push(newGoal);
    this.persist();
    return newGoal;
  }

  updateGoal(goalId: string, userId: string, updates: Partial<Goal>): Goal | null {
    const idx = this.data.goals.findIndex((g) => g.id === goalId && g.userId === userId);
    if (idx === -1) return null;

    if (updates.status === 'active') {
      this.data.goals.forEach((g) => {
        if (g.userId === userId && g.id !== goalId && g.status === 'active') {
          g.status = 'paused';
        }
      });
    }

    // Never allow reassigning ownership of goal to another user
    const safeUpdates = { ...updates };
    delete safeUpdates.userId;
    delete safeUpdates.id;

    this.data.goals[idx] = {
      ...this.data.goals[idx],
      ...safeUpdates,
      updatedAt: new Date().toISOString(),
    };
    this.recalculateGoalProgress(goalId, userId);
    this.persist();
    return this.data.goals[idx];
  }

  deleteGoal(goalId: string, userId: string): boolean {
    const goal = this.getGoalById(goalId, userId);
    if (!goal) return false;

    this.data.goals = this.data.goals.filter((g) => !(g.id === goalId && g.userId === userId));
    this.data.milestones = this.data.milestones.filter((m) => !(m.goalId === goalId && m.userId === userId));
    this.data.tasks = this.data.tasks.filter((t) => !(t.goalId === goalId && t.userId === userId));
    this.data.reviews = this.data.reviews.filter((r) => !(r.goalId === goalId && r.userId === userId));
    this.data.resources = this.data.resources.filter((res) => !(res.goalId === goalId && res.userId === userId));
    this.data.coachMessages = this.data.coachMessages.filter((m) => !(m.goalId === goalId && m.userId === userId));
    this.data.planVersions = this.data.planVersions.filter((v) => v.goalId !== goalId);
    this.persist();
    return true;
  }

  recalculateGoalProgress(goalId: string, userId: string) {
    const goal = this.data.goals.find((g) => g.id === goalId && g.userId === userId);
    if (!goal) return;

    const tasks = this.data.tasks.filter((t) => t.goalId === goalId && t.userId === userId);
    const milestones = this.data.milestones.filter((m) => m.goalId === goalId && m.userId === userId);

    if (tasks.length === 0 && milestones.length === 0) {
      goal.progressPercent = 0;
      return;
    }

    const taskWeight = tasks.length > 0 ? 0.6 : 0;
    const milestoneWeight = milestones.length > 0 ? (tasks.length > 0 ? 0.4 : 1.0) : 0;

    let taskRatio = 0;
    if (tasks.length > 0) {
      const completedTasks = tasks.filter((t) => t.status === 'completed').length;
      taskRatio = completedTasks / tasks.length;
    }

    let milestoneRatio = 0;
    if (milestones.length > 0) {
      const completedMs = milestones.filter((m) => m.completed).length;
      milestoneRatio = completedMs / milestones.length;
    }

    goal.progressPercent = Math.round((taskRatio * taskWeight + milestoneRatio * milestoneWeight) * 100);
  }

  // --- MILESTONES ---
  getMilestones(goalId: string, userId: string): Milestone[] {
    if (!this.isGoalOwnedByUser(goalId, userId)) return [];
    return this.data.milestones
      .filter((m) => m.goalId === goalId && m.userId === userId)
      .sort((a, b) => a.order - b.order);
  }

  createMilestone(milestone: Omit<Milestone, 'id'>): Milestone | null {
    if (!this.isGoalOwnedByUser(milestone.goalId, milestone.userId)) return null;

    const newMs: Milestone = {
      ...milestone,
      id: 'ms-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    };
    this.data.milestones.push(newMs);
    this.recalculateGoalProgress(milestone.goalId, milestone.userId);
    this.persist();
    return newMs;
  }

  updateMilestone(id: string, userId: string, updates: Partial<Milestone>): Milestone | null {
    const idx = this.data.milestones.findIndex((m) => m.id === id && m.userId === userId);
    if (idx === -1) return null;

    const safeUpdates = { ...updates };
    delete safeUpdates.userId;
    delete safeUpdates.goalId;
    delete safeUpdates.id;

    if (safeUpdates.completed !== undefined && safeUpdates.completed && !this.data.milestones[idx].completed) {
      safeUpdates.completedAt = new Date().toISOString();
    }

    this.data.milestones[idx] = { ...this.data.milestones[idx], ...safeUpdates };
    this.recalculateGoalProgress(this.data.milestones[idx].goalId, userId);
    this.persist();
    return this.data.milestones[idx];
  }

  deleteMilestone(id: string, userId: string): boolean {
    const ms = this.data.milestones.find((m) => m.id === id && m.userId === userId);
    if (!ms) return false;
    const goalId = ms.goalId;
    this.data.milestones = this.data.milestones.filter((m) => m.id !== id);
    this.recalculateGoalProgress(goalId, userId);
    this.persist();
    return true;
  }

  // --- TASKS ---
  getTasks(goalId: string, userId: string): Task[] {
    if (!this.isGoalOwnedByUser(goalId, userId)) return [];
    return this.data.tasks
      .filter((t) => t.goalId === goalId && t.userId === userId)
      .sort((a, b) => a.order - b.order);
  }

  getAllUserTasks(userId: string): Task[] {
    return this.data.tasks.filter((t) => t.userId === userId);
  }

  createTask(task: Omit<Task, 'id' | 'createdAt'>): Task | null {
    if (!this.isGoalOwnedByUser(task.goalId, task.userId)) return null;

    const newTask: Task = {
      ...task,
      id: 'task-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
      order: task.order ?? this.data.tasks.filter((t) => t.goalId === task.goalId).length + 1,
    };
    this.data.tasks.push(newTask);
    this.recalculateGoalProgress(task.goalId, task.userId);
    this.persist();
    return newTask;
  }

  updateTask(id: string, userId: string, updates: Partial<Task>): Task | null {
    const idx = this.data.tasks.findIndex((t) => t.id === id && t.userId === userId);
    if (idx === -1) return null;

    const safeUpdates = { ...updates };
    delete safeUpdates.userId;
    delete safeUpdates.goalId;
    delete safeUpdates.id;

    if (safeUpdates.status === 'completed' && this.data.tasks[idx].status !== 'completed') {
      safeUpdates.completedAt = new Date().toISOString();
    } else if (safeUpdates.status && safeUpdates.status !== 'completed') {
      safeUpdates.completedAt = undefined;
    }

    this.data.tasks[idx] = { ...this.data.tasks[idx], ...safeUpdates };
    this.recalculateGoalProgress(this.data.tasks[idx].goalId, userId);
    this.persist();
    return this.data.tasks[idx];
  }

  deleteTask(id: string, userId: string): boolean {
    const t = this.data.tasks.find((task) => task.id === id && task.userId === userId);
    if (!t) return false;
    const goalId = t.goalId;
    this.data.tasks = this.data.tasks.filter((task) => task.id !== id);
    this.recalculateGoalProgress(goalId, userId);
    this.persist();
    return true;
  }

  // --- REVIEWS ---
  getReviews(goalId: string, userId: string): WeeklyReview[] {
    if (!this.isGoalOwnedByUser(goalId, userId)) return [];
    return this.data.reviews
      .filter((r) => r.goalId === goalId && r.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createReview(review: Omit<WeeklyReview, 'id' | 'createdAt'>): WeeklyReview | null {
    if (!this.isGoalOwnedByUser(review.goalId, review.userId)) return null;

    const newRev: WeeklyReview = {
      ...review,
      id: 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };
    this.data.reviews.push(newRev);
    this.persist();
    return newRev;
  }

  // --- RESOURCES ---
  getResources(goalId: string, userId: string): ResourceItem[] {
    if (!this.isGoalOwnedByUser(goalId, userId)) return [];
    return this.data.resources.filter((res) => res.goalId === goalId && res.userId === userId);
  }

  createResource(item: Omit<ResourceItem, 'id' | 'createdAt'>): ResourceItem | null {
    if (!this.isGoalOwnedByUser(item.goalId, item.userId)) return null;

    const newRes: ResourceItem = {
      ...item,
      id: 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      createdAt: new Date().toISOString(),
    };
    this.data.resources.push(newRes);
    this.persist();
    return newRes;
  }

  deleteResource(id: string, userId: string): boolean {
    const item = this.data.resources.find((r) => r.id === id && r.userId === userId);
    if (!item) return false;
    this.data.resources = this.data.resources.filter((r) => r.id !== id);
    this.persist();
    return true;
  }

  // --- COACH CHATS ---
  getCoachMessages(goalId: string, userId: string): CoachMessage[] {
    if (!this.isGoalOwnedByUser(goalId, userId)) return [];
    return this.data.coachMessages
      .filter((m) => m.goalId === goalId && m.userId === userId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  addCoachMessage(msg: Omit<CoachMessage, 'id' | 'timestamp'>): CoachMessage | null {
    if (!this.isGoalOwnedByUser(msg.goalId, msg.userId)) return null;

    const newMsg: CoachMessage = {
      ...msg,
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
    };
    this.data.coachMessages.push(newMsg);
    this.persist();
    return newMsg;
  }

  // --- PLAN VERSIONS ---
  getPlanVersions(goalId: string, userId: string): PlanVersion[] {
    // SECURITY: Strictly enforce ownership of the goal before exposing plan versions!
    if (!this.isGoalOwnedByUser(goalId, userId)) return [];
    return this.data.planVersions
      .filter((v) => v.goalId === goalId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  addPlanVersion(version: Omit<PlanVersion, 'id' | 'timestamp'>, userId?: string): PlanVersion | null {
    if (userId && !this.isGoalOwnedByUser(version.goalId, userId)) return null;

    const newVersion: PlanVersion = {
      ...version,
      id: 'ver-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    this.data.planVersions.push(newVersion);
    this.persist();
    return newVersion;
  }

  // --- METRICS & ADMIN ---
  incrementAiCalls() {
    this.data.aiCallsCount = (this.data.aiCallsCount || 0) + 1;
    this.persist();
  }

  getMetrics(): SystemMetrics {
    const completedTasks = this.data.tasks.filter((t) => t.status === 'completed');
    const totalMinutes = this.data.tasks.reduce((acc, t) => acc + (t.actualMinutesSpent || 0), 0);

    return {
      totalUsers: this.data.users.length,
      activeGoals: this.data.goals.filter((g) => g.status === 'active').length,
      completedTasksTotal: completedTasks.length,
      totalFocusMinutes: totalMinutes,
      weeklyReviewsCompleted: this.data.reviews.length,
      aiCallsCount: this.data.aiCallsCount || 0,
      systemStatus: 'healthy',
      geminiModel: 'gemini-3.8-flash',
      hasCustomApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      uptimeSeconds: Math.floor((Date.now() - serverStartTime) / 1000),
    };
  }

  getAdminSettings(): AdminSettings {
    return this.data.adminSettings || DEFAULT_ADMIN_SETTINGS;
  }

  updateAdminSettings(settings: Partial<AdminSettings>): AdminSettings {
    this.data.adminSettings = { ...this.data.adminSettings, ...settings };
    this.persist();
    return this.data.adminSettings;
  }
}

export const db = new DatabaseManager();
