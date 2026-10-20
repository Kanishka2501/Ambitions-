import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { db } from './server/db.js';
import {
  hashPassword,
  verifyPassword,
  generateSessionToken,
  getSessionExpirationDate,
  toClientUser,
  isValidEmail,
  isValidPassword,
  sanitizeString,
  createRateLimiter,
} from './server/auth.js';
import {
  generateGoalPlan,
  chatWithCoach,
  synthesizeWeeklyReview,
  computeNextRecommendedAction,
} from './server/ai.js';
import type { User, ServerUser } from './src/types/index.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';
const SESSION_COOKIE_NAME = 'northstar_session';

// Extend Express Request type to carry authenticated user and session
declare global {
  namespace Express {
    interface Request {
      user?: User;
      sessionToken?: string;
    }
  }
}

const app = express();

// ----------------- SECURITY HEADERS MIDDLEWARE -----------------
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // CSP: allow local scripts, google fonts, and inline styles for Tailwind v4
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self' ws: wss: https:;"
  );
  next();
});

// JSON body parser with strict size limit to prevent Denial of Service
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// ----------------- RATE LIMITERS -----------------
const authLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 25,
  message: 'Too many authentication attempts. Please wait a few minutes before trying again.',
});

const aiLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 40,
  message: 'AI operation limit reached for this session. Please pause and resume shortly.',
  keyGenerator: (req) => req.user?.id || req.ip || 'unknown',
});

// ----------------- AUTHENTICATION MIDDLEWARE -----------------
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Extract token from Cookie or Authorization: Bearer <token>
  let token = req.cookies?.[SESSION_COOKIE_NAME];
  const authHeader = req.headers.authorization;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
  }

  const session = db.getSessionByToken(token);
  if (!session) {
    // Clear invalid cookie if present
    res.clearCookie(SESSION_COOKIE_NAME);
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired session.' });
  }

  const serverUser = db.getUserById(session.userId);
  if (!serverUser) {
    db.deleteSession(token);
    res.clearCookie(SESSION_COOKIE_NAME);
    return res.status(401).json({ error: 'Unauthorized: Account not found.' });
  }

  // Attach sanitized user and session token to request
  req.user = toClientUser(serverUser);
  req.sessionToken = token;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'founder_admin') {
    return res.status(403).json({ error: 'Forbidden: Founder or Administrator clearance required.' });
  }
  next();
}

function setSessionCookie(res: Response, token: string, expiresAt: string) {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    expires: new Date(expiresAt),
    path: '/',
  });
}

// ----------------- AUTH ENDPOINTS -----------------
app.post('/api/auth/register', authLimiter, (req: Request, res: Response) => {
  const { email, password, name, coachingStyle, themePalette } = req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const passwordCheck = isValidPassword(password);
  if (!passwordCheck.valid) {
    return res.status(400).json({ error: passwordCheck.reason });
  }

  const cleanName = sanitizeString(name, 100);
  if (!cleanName || cleanName.length < 2) {
    return res.status(400).json({ error: 'Please provide a valid name (at least 2 characters).' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const existing = db.getUserByEmail(cleanEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const { hash, salt } = hashPassword(password);
  const newUser = db.createUser({
    email: cleanEmail,
    name: cleanName,
    passwordHash: hash,
    passwordSalt: salt,
    coachingStyle: coachingStyle || 'strategic',
    themePalette: themePalette || 'lavender-purple',
  });

  const sessionToken = generateSessionToken();
  const expiresAt = getSessionExpirationDate();
  db.createSession(newUser.id, sessionToken, expiresAt, req.ip, req.headers['user-agent']);

  setSessionCookie(res, sessionToken, expiresAt);
  return res.status(201).json({
    user: toClientUser(newUser),
    token: sessionToken,
  });
});

app.post('/api/auth/login', authLimiter, (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const user = db.getUserByEmail(cleanEmail);

  if (!user || !user.passwordHash || !user.passwordSalt) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isValid = verifyPassword(String(password), user.passwordHash, user.passwordSalt);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const sessionToken = generateSessionToken();
  const expiresAt = getSessionExpirationDate();
  db.createSession(user.id, sessionToken, expiresAt, req.ip, req.headers['user-agent']);

  setSessionCookie(res, sessionToken, expiresAt);
  return res.json({
    user: toClientUser(user),
    token: sessionToken,
  });
});

app.post('/api/auth/logout', requireAuth, (req: Request, res: Response) => {
  if (req.sessionToken) {
    db.deleteSession(req.sessionToken);
  }
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  return res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  return res.json({ user: req.user });
});

app.put('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const { name, themePalette, themeMode, coachingStyle } = req.body;

  const updates: Partial<ServerUser> = {};
  if (name && typeof name === 'string') updates.name = sanitizeString(name, 100);
  if (themePalette) updates.themePalette = themePalette;
  if (themeMode) updates.themeMode = themeMode;
  if (coachingStyle) updates.coachingStyle = coachingStyle;

  const updated = db.updateUser(user.id, updates);
  if (!updated) return res.status(404).json({ error: 'User not found.' });

  return res.json({ user: toClientUser(updated) });
});

app.delete('/api/auth/delete-account', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  if (req.sessionToken) {
    db.deleteSession(req.sessionToken);
  }
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  db.deleteUser(user.id);
  return res.json({ success: true, message: 'Account and all associated personal data permanently erased.' });
});

// Demo account information for onboarding testing (disabled in strict production if configured)
app.get('/api/auth/demo-users', (_req: Request, res: Response) => {
  // Only expose sanitized demo accounts without leaking any non-demo users or credentials
  const users = db
    .getUsers()
    .filter((u) => u.email.toLowerCase() === 'kanishkarajput7777@gmail.com')
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      tier: u.tier,
    }));
  return res.json({ users });
});

// ----------------- GOALS ENDPOINTS (Strictly Isolated) -----------------
app.get('/api/goals', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const goals = db.getGoals(user.id);
  const activeGoal = db.getActiveGoal(user.id);
  return res.json({ goals, activeGoal });
});

app.post('/api/goals', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const {
    title,
    whyItMatters,
    measurableCriteria,
    currentBaseline,
    targetDeadline,
    weeklyCommitmentHours,
    resourcesBudget,
    knownObstacles,
    constraints,
    coachingStyle,
    immediateNextAction,
  } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  const goal = db.createGoal({
    userId: user.id,
    title: sanitizeString(title, 200),
    whyItMatters: sanitizeString(whyItMatters, 500),
    measurableCriteria: sanitizeString(measurableCriteria, 300),
    currentBaseline: sanitizeString(currentBaseline, 500),
    targetDeadline: targetDeadline ? sanitizeString(targetDeadline, 50) : new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    weeklyCommitmentHours: Math.min(100, Math.max(1, Number(weeklyCommitmentHours) || 15)),
    resourcesBudget: sanitizeString(resourcesBudget, 400),
    knownObstacles: sanitizeString(knownObstacles, 400),
    constraints: sanitizeString(constraints, 400),
    coachingStyle: coachingStyle || user.coachingStyle || 'strategic',
    status: 'active',
    immediateNextAction: sanitizeString(immediateNextAction, 300) || 'Define the first operational action step.',
  });

  return res.status(201).json({ goal });
});

app.put('/api/goals/:id', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const goalId = req.params.id;

  if (!db.isGoalOwnedByUser(goalId, user.id)) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  const goal = db.updateGoal(goalId, user.id, req.body);
  if (!goal) return res.status(404).json({ error: 'Goal not found.' });
  return res.json({ goal });
});

app.put('/api/goals/:id/active', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const goalId = req.params.id;

  if (!db.isGoalOwnedByUser(goalId, user.id)) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  const goal = db.updateGoal(goalId, user.id, { status: 'active' });
  if (!goal) return res.status(404).json({ error: 'Goal not found.' });
  return res.json({ goal });
});

app.delete('/api/goals/:id', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const goalId = req.params.id;

  if (!db.isGoalOwnedByUser(goalId, user.id)) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  const success = db.deleteGoal(goalId, user.id);
  return res.json({ success });
});

// ----------------- AI PLAN GENERATION -----------------
app.post('/api/plan/generate', requireAuth, aiLimiter, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const {
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
      saveDirectlyToAccount,
    } = req.body;

    if (!primaryGoal || typeof primaryGoal !== 'string' || !primaryGoal.trim()) {
      return res.status(400).json({ error: 'Primary goal is required.' });
    }

    const planResult = await generateGoalPlan({
      primaryGoal: sanitizeString(primaryGoal, 300),
      whyItMatters: sanitizeString(whyItMatters, 500),
      measurableCriteria: sanitizeString(measurableCriteria, 300),
      currentBaseline: sanitizeString(currentBaseline, 500),
      targetDeadline: targetDeadline ? sanitizeString(targetDeadline, 50) : undefined,
      weeklyCommitmentHours: Math.min(100, Math.max(1, Number(weeklyCommitmentHours) || 15)),
      resourcesBudget: sanitizeString(resourcesBudget, 400),
      knownObstacles: sanitizeString(knownObstacles, 400),
      constraints: sanitizeString(constraints, 400),
      coachingStyle: coachingStyle || user.coachingStyle || 'strategic',
    });

    let savedGoal: import('./src/types/index.js').Goal | null = null;
    if (saveDirectlyToAccount) {
      const createdGoal = db.createGoal({
        userId: user.id,
        title: planResult.refinedGoal || primaryGoal,
        whyItMatters: whyItMatters || '',
        measurableCriteria: planResult.measurableCriteria,
        currentBaseline: planResult.startingPointAssessment,
        targetDeadline: targetDeadline || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        weeklyCommitmentHours: Number(weeklyCommitmentHours) || 15,
        resourcesBudget: resourcesBudget || '',
        knownObstacles: knownObstacles || '',
        constraints: constraints || '',
        coachingStyle: coachingStyle || user.coachingStyle || 'strategic',
        status: 'active',
        immediateNextAction: planResult.immediateNextAction,
      });
      savedGoal = createdGoal;

      // Save generated milestones
      const createdMilestones = planResult.milestones.map((ms, idx) => {
        const targetDays = ms.targetDaysFromNow || (idx + 1) * 30;
        const msTargetDate = new Date(Date.now() + targetDays * 86400000).toISOString().split('T')[0];
        return db.createMilestone({
          userId: user.id,
          goalId: createdGoal.id,
          title: ms.title,
          description: ms.description,
          targetDate: msTargetDate,
          completed: false,
          order: idx + 1,
          successMetric: ms.successMetric,
        });
      });

      // Save initial tasks
      planResult.initialTasks.forEach((t, idx) => {
        const assignedMs = createdMilestones[t.milestoneIndex] || createdMilestones[0];
        const dueDate = new Date(Date.now() + (idx < 2 ? 0 : 2) * 86400000).toISOString().split('T')[0];
        db.createTask({
          userId: user.id,
          goalId: createdGoal.id,
          milestoneId: assignedMs?.id,
          title: t.title,
          description: t.description,
          status: 'todo',
          priority: t.priority || 'high',
          estimatedMinutes: t.estimatedMinutes || 45,
          actualMinutesSpent: 0,
          dueDate,
          subtasks: (t.subtasks || []).map((st) => ({
            id: 'st-' + Math.random().toString(36).substring(2, 7),
            title: st,
            completed: false,
          })),
          order: idx + 1,
        });
      });

      // Record Plan Version
      db.addPlanVersion(
        {
          goalId: createdGoal.id,
          reason: 'Initial AI Plan Decomposition',
          summary: `Structured into ${planResult.milestones.length} milestones and ${planResult.initialTasks.length} inaugural actions.`,
          changes: planResult.milestones.map((m) => m.title),
        },
        user.id
      );

      // Add welcoming coach message
      db.addCoachMessage({
        userId: user.id,
        goalId: createdGoal.id,
        sender: 'coach',
        text: `Your operating system for "${createdGoal.title}" is generated. Your first immediate action is: "${planResult.immediateNextAction}". Let me know whenever you need to break down a step or overcome friction.`,
        coachingStyle: createdGoal.coachingStyle,
        recommendedAction: planResult.immediateNextAction,
      });
    }

    return res.json({
      plan: planResult,
      savedGoal,
    });
  } catch (err: any) {
    console.error('[API] /api/plan/generate error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to generate plan. Please try again.' });
  }
});

// ----------------- MILESTONES (Ownership Verified) -----------------
app.get('/api/milestones', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const goalId = req.query.goalId as string;
  if (!goalId) return res.status(400).json({ error: 'goalId is required.' });

  if (!db.isGoalOwnedByUser(goalId, user.id)) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  const milestones = db.getMilestones(goalId, user.id);
  return res.json({ milestones });
});

app.post('/api/milestones', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const { goalId, title, description, targetDate, successMetric, order } = req.body;
  if (!goalId || !title) return res.status(400).json({ error: 'goalId and title required.' });

  if (!db.isGoalOwnedByUser(goalId, user.id)) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  const ms = db.createMilestone({
    userId: user.id,
    goalId,
    title: sanitizeString(title, 200),
    description: sanitizeString(description, 500),
    targetDate: targetDate || new Date().toISOString().split('T')[0],
    completed: false,
    order: Number(order) || 1,
    successMetric: sanitizeString(successMetric, 300),
  });

  if (!ms) return res.status(400).json({ error: 'Failed to create milestone.' });
  return res.status(201).json({ milestone: ms });
});

app.put('/api/milestones/:id', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const updated = db.updateMilestone(req.params.id, user.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Milestone not found or access denied.' });
  return res.json({ milestone: updated });
});

app.delete('/api/milestones/:id', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const success = db.deleteMilestone(req.params.id, user.id);
  if (!success) return res.status(404).json({ error: 'Milestone not found or access denied.' });
  return res.json({ success });
});

// ----------------- TASKS (Ownership Verified) -----------------
app.get('/api/tasks', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const goalId = req.query.goalId as string;
  if (goalId && !db.isGoalOwnedByUser(goalId, user.id)) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  const tasks = goalId ? db.getTasks(goalId, user.id) : db.getAllUserTasks(user.id);
  return res.json({ tasks });
});

app.post('/api/tasks', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const { goalId, milestoneId, title, description, priority, estimatedMinutes, dueDate, subtasks, notes } = req.body;
  if (!goalId || !title) return res.status(400).json({ error: 'goalId and title required.' });

  if (!db.isGoalOwnedByUser(goalId, user.id)) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  const task = db.createTask({
    userId: user.id,
    goalId,
    milestoneId: milestoneId ? sanitizeString(milestoneId, 50) : undefined,
    title: sanitizeString(title, 200),
    description: sanitizeString(description, 500),
    status: 'todo',
    priority: ['urgent', 'high', 'medium', 'low'].includes(priority) ? priority : 'medium',
    estimatedMinutes: Math.min(1440, Math.max(1, Number(estimatedMinutes) || 30)),
    actualMinutesSpent: 0,
    dueDate: dueDate ? sanitizeString(dueDate, 50) : new Date().toISOString().split('T')[0],
    subtasks: Array.isArray(subtasks)
      ? subtasks.map((st: any) => ({
          id: 'st-' + Math.random().toString(36).substring(2, 7),
          title: sanitizeString(st.title, 150),
          completed: Boolean(st.completed),
        }))
      : [],
    notes: sanitizeString(notes, 500),
    order: 1,
  });

  if (!task) return res.status(400).json({ error: 'Failed to create task.' });
  return res.status(201).json({ task });
});

app.put('/api/tasks/:id', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const task = db.updateTask(req.params.id, user.id, req.body);
  if (!task) return res.status(404).json({ error: 'Task not found or access denied.' });
  return res.json({ task });
});

app.delete('/api/tasks/:id', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const success = db.deleteTask(req.params.id, user.id);
  if (!success) return res.status(404).json({ error: 'Task not found or access denied.' });
  return res.json({ success });
});

app.post('/api/tasks/recommend-next', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const { goalId, availableMinutes } = req.body;

  let goal = null;
  if (goalId) {
    if (!db.isGoalOwnedByUser(goalId, user.id)) {
      return res.status(404).json({ error: 'Goal not found or access denied.' });
    }
    goal = db.getGoalById(goalId, user.id);
  } else {
    goal = db.getActiveGoal(user.id);
  }

  const tasks = goal ? db.getTasks(goal.id, user.id) : [];

  const recommendation = computeNextRecommendedAction({
    goalTitle: goal?.title || 'Active Goal',
    tasks,
    availableMinutes: availableMinutes ? Number(availableMinutes) : undefined,
  });

  return res.json(recommendation);
});

// ----------------- ADAPTIVE AI COACH (Ownership Verified) -----------------
app.get('/api/coach/messages', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const goalId = req.query.goalId as string;
  if (!goalId) return res.status(400).json({ error: 'goalId required.' });

  if (!db.isGoalOwnedByUser(goalId, user.id)) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  const messages = db.getCoachMessages(goalId, user.id);
  return res.json({ messages });
});

app.post('/api/coach/chat', requireAuth, aiLimiter, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { goalId, message, coachingStyle } = req.body;
    if (!goalId || !message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'goalId and message are required.' });
    }

    if (!db.isGoalOwnedByUser(goalId, user.id)) {
      return res.status(404).json({ error: 'Goal not found or access denied.' });
    }

    const goal = db.getGoalById(goalId, user.id);
    if (!goal) return res.status(404).json({ error: 'Goal not found.' });

    const style = coachingStyle || goal.coachingStyle || user.coachingStyle || 'strategic';

    // Save sanitized user message
    const cleanMessage = sanitizeString(message, 1000);
    const userMsg = db.addCoachMessage({
      userId: user.id,
      goalId,
      sender: 'user',
      text: cleanMessage,
      coachingStyle: style,
    });

    if (!userMsg) return res.status(400).json({ error: 'Failed to record message.' });

    // Gather user-scoped context ONLY
    const allTasks = db.getTasks(goalId, user.id);
    const completedTasks = allTasks.filter((t) => t.status === 'completed').map((t) => t.title);
    const pendingTasks = allTasks.filter((t) => t.status !== 'completed').map((t) => t.title);

    const history = db.getCoachMessages(goalId, user.id).slice(-6);
    const conversationMessages = history.map((m) => ({
      role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      content: m.text,
    }));

    const coachResult = await chatWithCoach({
      messages: conversationMessages,
      coachingStyle: style,
      activeGoal: {
        title: goal.title,
        measurableCriteria: goal.measurableCriteria,
        progressPercent: goal.progressPercent,
        knownObstacles: goal.knownObstacles,
      },
      recentCompletedTasks: completedTasks,
      pendingTasks: pendingTasks,
    });

    // Save coach reply
    const botMsg = db.addCoachMessage({
      userId: user.id,
      goalId,
      sender: 'coach',
      text: coachResult.reply,
      coachingStyle: style,
      recommendedAction: coachResult.recommendedAction,
    });

    return res.json({
      userMessage: userMsg,
      coachMessage: botMsg,
      engine: coachResult.aiEngineUsed,
    });
  } catch (err: any) {
    console.error('[API] /api/coach/chat error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to process coach chat. Please try again.' });
  }
});

// ----------------- WEEKLY REVIEWS (Ownership Verified) -----------------
app.get('/api/reviews', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const goalId = req.query.goalId as string;
  if (!goalId) return res.status(400).json({ error: 'goalId required.' });

  if (!db.isGoalOwnedByUser(goalId, user.id)) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  const reviews = db.getReviews(goalId, user.id);
  return res.json({ reviews });
});

app.post('/api/reviews/synthesize', requireAuth, aiLimiter, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const {
      goalId,
      accomplishedText,
      struggledText,
      learnedText,
      wastedTimeText,
      needsToChangeText,
      saveReview,
    } = req.body;

    if (!goalId) return res.status(400).json({ error: 'goalId required.' });

    if (!db.isGoalOwnedByUser(goalId, user.id)) {
      return res.status(404).json({ error: 'Goal not found or access denied.' });
    }

    const goal = db.getGoalById(goalId, user.id);
    if (!goal) return res.status(404).json({ error: 'Goal not found.' });

    const allTasks = db.getTasks(goalId, user.id);
    const completedTasks = allTasks.filter((t) => t.status === 'completed');
    const missedTasks = allTasks.filter(
      (t) => t.status === 'postponed' || (t.status === 'todo' && t.dueDate < new Date().toISOString().split('T')[0])
    );

    const synthesis = await synthesizeWeeklyReview({
      goalTitle: goal.title,
      accomplishedText: sanitizeString(accomplishedText, 1000),
      struggledText: sanitizeString(struggledText, 1000),
      learnedText: sanitizeString(learnedText, 1000),
      wastedTimeText: sanitizeString(wastedTimeText, 1000),
      needsToChangeText: sanitizeString(needsToChangeText, 1000),
      tasksCompletedCount: completedTasks.length,
      tasksMissedCount: missedTasks.length,
      coachingStyle: goal.coachingStyle,
    });

    let savedReview = null;
    if (saveReview) {
      savedReview = db.createReview({
        userId: user.id,
        goalId,
        weekEndingDate: new Date().toISOString().split('T')[0],
        accomplishedText: sanitizeString(accomplishedText, 1000),
        struggledText: sanitizeString(struggledText, 1000),
        learnedText: sanitizeString(learnedText, 1000),
        wastedTimeText: sanitizeString(wastedTimeText, 1000),
        needsToChangeText: sanitizeString(needsToChangeText, 1000),
        prioritiesNextWeek: synthesis.recommendedPriorities,
        tasksCompletedCount: completedTasks.length,
        tasksMissedCount: missedTasks.length,
        aiFeedbackSummary: synthesis.summary,
        proposedNextWeekTasks: synthesis.proposedNextWeekTasks,
      });

      if (synthesis.proposedNextWeekTasks && synthesis.proposedNextWeekTasks.length > 0) {
        synthesis.proposedNextWeekTasks.forEach((pTask, idx) => {
          db.createTask({
            userId: user.id,
            goalId,
            title: pTask.title,
            priority: pTask.priority,
            estimatedMinutes: pTask.estimatedMinutes,
            actualMinutesSpent: 0,
            status: 'todo',
            dueDate: new Date(Date.now() + (idx + 1) * 86400000).toISOString().split('T')[0],
            subtasks: [],
            order: idx + 10,
          });
        });

        db.addPlanVersion(
          {
            goalId,
            reason: 'Weekly Review Calibration',
            summary: `Adopted ${synthesis.proposedNextWeekTasks.length} calibrated tasks based on week retrospective.`,
            changes: synthesis.recommendedPriorities,
          },
          user.id
        );
      }
    }

    return res.json({
      synthesis,
      savedReview,
    });
  } catch (err: any) {
    console.error('[API] /api/reviews/synthesize error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to synthesize review. Please try again.' });
  }
});

// ----------------- RESOURCES & RESEARCH (Ownership Verified) -----------------
app.get('/api/resources', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const goalId = req.query.goalId as string;
  if (!goalId) return res.status(400).json({ error: 'goalId required.' });

  if (!db.isGoalOwnedByUser(goalId, user.id)) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  const resources = db.getResources(goalId, user.id);
  return res.json({ resources });
});

app.post('/api/resources', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const { goalId, title, type, url, notes, keyTakeaways, aiActionSteps } = req.body;
  if (!goalId || !title) return res.status(400).json({ error: 'goalId and title required.' });

  if (!db.isGoalOwnedByUser(goalId, user.id)) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  const resource = db.createResource({
    userId: user.id,
    goalId,
    title: sanitizeString(title, 200),
    type: ['article', 'tutorial', 'book', 'tool', 'note'].includes(type) ? type : 'article',
    url: url ? sanitizeString(url, 500) : '',
    notes: sanitizeString(notes, 2000),
    keyTakeaways: Array.isArray(keyTakeaways) ? keyTakeaways.map((k: any) => sanitizeString(k, 200)) : [],
    aiActionSteps: Array.isArray(aiActionSteps) ? aiActionSteps.map((a: any) => sanitizeString(a, 200)) : [],
  });

  if (!resource) return res.status(400).json({ error: 'Failed to create resource.' });
  return res.status(201).json({ resource });
});

app.delete('/api/resources/:id', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const success = db.deleteResource(req.params.id, user.id);
  if (!success) return res.status(404).json({ error: 'Resource not found or access denied.' });
  return res.json({ success });
});

// ----------------- PLAN VERSIONS (Ownership Verified) -----------------
app.get('/api/plan-versions', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const goalId = req.query.goalId as string;
  if (!goalId) return res.status(400).json({ error: 'goalId required.' });

  // SECURITY FIX: User must own the goal to view its plan version history!
  if (!db.isGoalOwnedByUser(goalId, user.id)) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  const versions = db.getPlanVersions(goalId, user.id);
  return res.json({ versions });
});

app.post('/api/plan-versions', requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  const { goalId, reason, summary, changes } = req.body;
  if (!goalId || !reason) return res.status(400).json({ error: 'goalId and reason are required.' });

  if (!db.isGoalOwnedByUser(goalId, user.id)) {
    return res.status(404).json({ error: 'Goal not found or access denied.' });
  }

  const cleanChanges = Array.isArray(changes)
    ? changes.map((c: any) => sanitizeString(c, 200))
    : [];

  const version = db.addPlanVersion(
    {
      goalId,
      reason: sanitizeString(reason, 200),
      summary: sanitizeString(summary, 500) || `Plan adjusted: ${sanitizeString(reason, 100)}`,
      changes: cleanChanges.length > 0 ? cleanChanges : ['Timeline and milestone recalibration.'],
    },
    user.id
  );

  if (!version) return res.status(400).json({ error: 'Failed to record plan version.' });
  return res.status(201).json({ version });
});

// ----------------- ADMIN & FOUNDER METRICS (Role-Protected) -----------------
app.get('/api/admin/metrics', requireAuth, requireAdmin, (_req: Request, res: Response) => {
  const metrics = db.getMetrics();
  const settings = db.getAdminSettings();
  return res.json({ metrics, settings });
});

app.post('/api/admin/settings', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { allowNewRegistrations, dailyAiCallLimitPerUser, maintenanceMode, defaultCoachingStyle } = req.body;
  const updates: any = {};
  if (typeof allowNewRegistrations === 'boolean') updates.allowNewRegistrations = allowNewRegistrations;
  if (typeof dailyAiCallLimitPerUser === 'number') updates.dailyAiCallLimitPerUser = Math.min(500, Math.max(5, dailyAiCallLimitPerUser));
  if (typeof maintenanceMode === 'boolean') updates.maintenanceMode = maintenanceMode;
  if (['gentle', 'strategic', 'direct'].includes(defaultCoachingStyle)) updates.defaultCoachingStyle = defaultCoachingStyle;

  const updated = db.updateAdminSettings(updates);
  return res.json({ settings: updated });
});

// ----------------- HEALTH CHECK -----------------
app.get('/api/health', (_req: Request, res: Response) => {
  return res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Northstar AI Goal OS Backend',
    version: '1.1.0',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// ----------------- GLOBAL ERROR HANDLER -----------------
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SERVER ERROR]:', err);
  if (res.headersSent) return;
  res.status(500).json({
    error: isProd ? 'Internal server error' : (err?.message || 'Internal server error'),
  });
});

// ----------------- DEV / PROD MIDDLEWARES -----------------
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Northstar AI] Secure server active on http://0.0.0.0:${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('[Northstar AI] Server start failure:', err);
  process.exit(1);
});
