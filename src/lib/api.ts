import type {
  User,
  Goal,
  Milestone,
  Task,
  WeeklyReview,
  ResourceItem,
  CoachMessage,
  PlanVersion,
  SystemMetrics,
  AdminSettings,
  CoachingStyle,
} from '../types/index.js';

let authToken: string = '';

export function setApiAuthToken(token: string) {
  authToken = token;
  if (token) {
    localStorage.setItem('northstar_auth_token', token);
  } else {
    localStorage.removeItem('northstar_auth_token');
  }
}

export function getApiAuthToken(): string {
  if (!authToken) {
    authToken = localStorage.getItem('northstar_auth_token') || '';
  }
  return authToken;
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getApiAuthToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin', // sends httpOnly session cookie
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status} ${response.statusText}`;
    try {
      const errData = await response.json();
      errorMsg = errData.error || errData.message || errorMsg;
    } catch {}

    if (response.status === 401) {
      setApiAuthToken('');
    }

    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async getCurrentUser(): Promise<{ user: User }> {
    return fetchJson('/api/auth/me');
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await fetchJson<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setApiAuthToken(data.token);
    }
    return data;
  },

  async register(params: {
    email: string;
    password: string;
    name: string;
    coachingStyle?: CoachingStyle;
    themePalette?: string;
  }): Promise<{ user: User; token: string }> {
    const data = await fetchJson<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    if (data.token) {
      setApiAuthToken(data.token);
    }
    return data;
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      const res = await fetchJson<{ success: boolean }>('/api/auth/logout', {
        method: 'POST',
      });
      setApiAuthToken('');
      return res;
    } catch {
      setApiAuthToken('');
      return { success: true };
    }
  },

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    return fetchJson('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteAccount(): Promise<{ success: boolean }> {
    const res = await fetchJson<{ success: boolean }>('/api/auth/delete-account', {
      method: 'DELETE',
    });
    setApiAuthToken('');
    return res;
  },

  async getDemoUsers(): Promise<{ users: Array<Pick<User, 'id' | 'name' | 'email' | 'role' | 'tier'>> }> {
    return fetchJson('/api/auth/demo-users');
  },

  // Goals
  async getGoals(): Promise<{ goals: Goal[]; activeGoal: Goal | null }> {
    return fetchJson('/api/goals');
  },

  async createGoal(goal: Partial<Goal>): Promise<{ goal: Goal }> {
    return fetchJson('/api/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    });
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<{ goal: Goal }> {
    return fetchJson(`/api/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async setActiveGoal(id: string): Promise<{ goal: Goal }> {
    return fetchJson(`/api/goals/${id}/active`, {
      method: 'PUT',
    });
  },

  async deleteGoal(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/goals/${id}`, {
      method: 'DELETE',
    });
  },

  // AI Plan Generation
  async generatePlan(params: {
    primaryGoal: string;
    whyItMatters?: string;
    measurableCriteria?: string;
    currentBaseline?: string;
    targetDeadline?: string;
    weeklyCommitmentHours: number;
    resourcesBudget?: string;
    knownObstacles?: string;
    constraints?: string;
    coachingStyle?: CoachingStyle;
    saveDirectlyToAccount?: boolean;
  }): Promise<{ plan: any; savedGoal?: Goal }> {
    return fetchJson('/api/plan/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  // Milestones
  async getMilestones(goalId: string): Promise<{ milestones: Milestone[] }> {
    return fetchJson(`/api/milestones?goalId=${encodeURIComponent(goalId)}`);
  },

  async createMilestone(data: Partial<Milestone>): Promise<{ milestone: Milestone }> {
    return fetchJson('/api/milestones', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateMilestone(id: string, updates: Partial<Milestone>): Promise<{ milestone: Milestone }> {
    return fetchJson(`/api/milestones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteMilestone(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/milestones/${id}`, {
      method: 'DELETE',
    });
  },

  // Tasks
  async getTasks(goalId?: string): Promise<{ tasks: Task[] }> {
    const query = goalId ? `?goalId=${encodeURIComponent(goalId)}` : '';
    return fetchJson(`/api/tasks${query}`);
  },

  async createTask(data: Partial<Task>): Promise<{ task: Task }> {
    return fetchJson('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<{ task: Task }> {
    return fetchJson(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteTask(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  async getRecommendedNextTask(goalId: string, availableMinutes?: number): Promise<{
    recommendedTaskId: string | null;
    rationale: string;
    urgencyLevel: 'high' | 'medium' | 'normal';
  }> {
    return fetchJson('/api/tasks/recommend-next', {
      method: 'POST',
      body: JSON.stringify({ goalId, availableMinutes }),
    });
  },

  // Coach
  async getCoachMessages(goalId: string): Promise<{ messages: CoachMessage[] }> {
    return fetchJson(`/api/coach/messages?goalId=${encodeURIComponent(goalId)}`);
  },

  async sendCoachMessage(goalId: string, message: string, coachingStyle?: CoachingStyle): Promise<{
    userMessage: CoachMessage;
    coachMessage: CoachMessage;
    engine: string;
  }> {
    return fetchJson('/api/coach/chat', {
      method: 'POST',
      body: JSON.stringify({ goalId, message, coachingStyle }),
    });
  },

  // Reviews
  async getReviews(goalId: string): Promise<{ reviews: WeeklyReview[] }> {
    return fetchJson(`/api/reviews?goalId=${encodeURIComponent(goalId)}`);
  },

  async synthesizeReview(data: {
    goalId: string;
    accomplishedText: string;
    struggledText: string;
    learnedText: string;
    wastedTimeText: string;
    needsToChangeText: string;
    saveReview: boolean;
  }): Promise<{ synthesis: any; savedReview?: WeeklyReview }> {
    return fetchJson('/api/reviews/synthesize', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Resources
  async getResources(goalId: string): Promise<{ resources: ResourceItem[] }> {
    return fetchJson(`/api/resources?goalId=${encodeURIComponent(goalId)}`);
  },

  async createResource(data: Partial<ResourceItem>): Promise<{ resource: ResourceItem }> {
    return fetchJson('/api/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteResource(id: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/resources/${id}`, {
      method: 'DELETE',
    });
  },

  // Plan Versions
  async getPlanVersions(goalId: string): Promise<{ versions: PlanVersion[] }> {
    return fetchJson(`/api/plan-versions?goalId=${encodeURIComponent(goalId)}`);
  },

  async createPlanVersion(data: {
    goalId: string;
    reason: string;
    summary?: string;
    changes?: string[];
  }): Promise<{ version: PlanVersion }> {
    return fetchJson('/api/plan-versions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Admin
  async getAdminMetrics(): Promise<{ metrics: SystemMetrics; settings: AdminSettings }> {
    return fetchJson('/api/admin/metrics');
  },

  async updateAdminSettings(settings: Partial<AdminSettings>): Promise<{ settings: AdminSettings }> {
    return fetchJson('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    });
  },

  // Health
  async getHealth(): Promise<{ status: string; geminiConfigured: boolean }> {
    return fetchJson('/api/health');
  },
};
