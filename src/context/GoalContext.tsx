import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Goal, Milestone, Task, WeeklyReview, ResourceItem, TaskPriority } from '../types/index.js';
import { api } from '../lib/api.js';
import { useAuth } from './AuthContext.js';

interface RecommendedAction {
  recommendedTaskId: string | null;
  rationale: string;
  urgencyLevel: 'high' | 'medium' | 'normal';
}

interface GoalContextType {
  goals: Goal[];
  activeGoal: Goal | null;
  milestones: Milestone[];
  tasks: Task[];
  reviews: WeeklyReview[];
  resources: ResourceItem[];
  loading: boolean;
  recommendation: RecommendedAction | null;
  focusTask: Task | null;
  isFocusRunning: boolean;
  focusSecondsRemaining: number;
  totalFocusSessionMinutes: number;

  selectActiveGoal: (goalId: string) => Promise<void>;
  refreshAllGoalData: () => Promise<void>;
  createTask: (taskData: {
    title: string;
    description?: string;
    milestoneId?: string;
    priority: TaskPriority;
    estimatedMinutes: number;
    dueDate?: string;
    subtasks?: Array<{ id: string; title: string; completed: boolean }>;
  }) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  toggleTaskComplete: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  createMilestone: (data: Partial<Milestone>) => Promise<Milestone>;
  updateMilestone: (id: string, updates: Partial<Milestone>) => Promise<Milestone>;
  toggleMilestoneComplete: (milestone: Milestone) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  createResource: (data: Partial<ResourceItem>) => Promise<ResourceItem>;
  deleteResource: (id: string) => Promise<void>;
  requestNextRecommendation: (availableMinutes?: number) => Promise<RecommendedAction>;
  startFocusSession: (task: Task, minutes?: number) => void;
  pauseFocusSession: () => void;
  resumeFocusSession: () => void;
  finishFocusSession: () => Promise<void>;
  cancelFocusSession: () => void;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const GoalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [reviews, setReviews] = useState<WeeklyReview[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [recommendation, setRecommendation] = useState<RecommendedAction | null>(null);
  const [loading, setLoading] = useState(false);

  // Focus mode / Pomodoro state
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [isFocusRunning, setIsFocusRunning] = useState(false);
  const [focusSecondsRemaining, setFocusSecondsRemaining] = useState(25 * 60);
  const [totalFocusSessionMinutes, setTotalFocusSessionMinutes] = useState(25);

  const refreshAllGoalData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { goals: loadedGoals, activeGoal: currentActive } = await api.getGoals();
      setGoals(loadedGoals);
      const chosenGoal = currentActive || loadedGoals[0] || null;
      setActiveGoal(chosenGoal);

      if (chosenGoal) {
        const [msData, taskData, revData, resData] = await Promise.all([
          api.getMilestones(chosenGoal.id),
          api.getTasks(chosenGoal.id),
          api.getReviews(chosenGoal.id),
          api.getResources(chosenGoal.id),
        ]);
        setMilestones(msData.milestones || []);
        setTasks(taskData.tasks || []);
        setReviews(revData.reviews || []);
        setResources(resData.resources || []);

        // Load next recommended action
        try {
          const rec = await api.getRecommendedNextTask(chosenGoal.id);
          setRecommendation(rec);
        } catch {
          // ignore error for recommendation
        }
      } else {
        setMilestones([]);
        setTasks([]);
        setReviews([]);
        setResources([]);
        setRecommendation(null);
      }
    } catch (err) {
      console.error('[GoalContext] Failed to load goal data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshAllGoalData();
    } else {
      setGoals([]);
      setActiveGoal(null);
      setMilestones([]);
      setTasks([]);
      setReviews([]);
      setResources([]);
      setRecommendation(null);
      setFocusTask(null);
      setIsFocusRunning(false);
      setFocusSecondsRemaining(25 * 60);
    }
  }, [user, refreshAllGoalData]);

  // Focus timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isFocusRunning && focusSecondsRemaining > 0) {
      interval = setInterval(() => {
        setFocusSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsFocusRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFocusRunning, focusSecondsRemaining]);

  const selectActiveGoal = async (goalId: string) => {
    try {
      const { goal } = await api.setActiveGoal(goalId);
      setActiveGoal(goal);
      await refreshAllGoalData();
    } catch (err) {
      console.error('Failed to set active goal:', err);
    }
  };

  const createTask = async (taskData: {
    title: string;
    description?: string;
    milestoneId?: string;
    priority: TaskPriority;
    estimatedMinutes: number;
    dueDate?: string;
    subtasks?: Array<{ id: string; title: string; completed: boolean }>;
  }): Promise<Task> => {
    if (!activeGoal) throw new Error('No active goal selected');
    const { task } = await api.createTask({
      ...taskData,
      goalId: activeGoal.id,
    });
    setTasks((prev) => [...prev, task]);
    await refreshAllGoalData();
    return task;
  };

  const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
    const { task } = await api.updateTask(id, updates);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    await refreshAllGoalData();
    return task;
  };

  const toggleTaskComplete = async (task: Task) => {
    const isCompleted = task.status === 'completed';
    const newStatus = isCompleted ? 'todo' : 'completed';
    const minutesToAdd = isCompleted ? 0 : task.estimatedMinutes;
    const currentActual = task.actualMinutesSpent || 0;
    await updateTask(task.id, {
      status: newStatus,
      actualMinutesSpent: isCompleted ? Math.max(0, currentActual - task.estimatedMinutes) : currentActual + minutesToAdd,
    });
  };

  const deleteTask = async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (focusTask?.id === id) {
      cancelFocusSession();
    }
    await refreshAllGoalData();
  };

  const createMilestone = async (data: Partial<Milestone>): Promise<Milestone> => {
    if (!activeGoal) throw new Error('No active goal');
    const { milestone } = await api.createMilestone({
      ...data,
      goalId: activeGoal.id,
      order: milestones.length + 1,
    });
    setMilestones((prev) => [...prev, milestone]);
    await refreshAllGoalData();
    return milestone;
  };

  const updateMilestone = async (id: string, updates: Partial<Milestone>): Promise<Milestone> => {
    const { milestone } = await api.updateMilestone(id, updates);
    setMilestones((prev) => prev.map((m) => (m.id === id ? milestone : m)));
    await refreshAllGoalData();
    return milestone;
  };

  const toggleMilestoneComplete = async (milestone: Milestone) => {
    await updateMilestone(milestone.id, {
      completed: !milestone.completed,
    });
  };

  const deleteMilestone = async (id: string) => {
    await api.deleteMilestone(id);
    setMilestones((prev) => prev.filter((m) => m.id !== id));
    await refreshAllGoalData();
  };

  const createResource = async (data: Partial<ResourceItem>): Promise<ResourceItem> => {
    if (!activeGoal) throw new Error('No active goal');
    const { resource } = await api.createResource({
      ...data,
      goalId: activeGoal.id,
    });
    setResources((prev) => [...prev, resource]);
    return resource;
  };

  const deleteResource = async (id: string) => {
    await api.deleteResource(id);
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const requestNextRecommendation = async (availableMinutes?: number): Promise<RecommendedAction> => {
    if (!activeGoal) throw new Error('No active goal');
    const rec = await api.getRecommendedNextTask(activeGoal.id, availableMinutes);
    setRecommendation(rec);
    return rec;
  };

  const startFocusSession = (task: Task, minutes: number = 25) => {
    setFocusTask(task);
    setTotalFocusSessionMinutes(minutes);
    setFocusSecondsRemaining(minutes * 60);
    setIsFocusRunning(true);
  };

  const pauseFocusSession = () => setIsFocusRunning(false);
  const resumeFocusSession = () => setIsFocusRunning(true);

  const finishFocusSession = async () => {
    if (focusTask) {
      const elapsedMinutes = Math.max(1, Math.round((totalFocusSessionMinutes * 60 - focusSecondsRemaining) / 60));
      await updateTask(focusTask.id, {
        actualMinutesSpent: (focusTask.actualMinutesSpent || 0) + elapsedMinutes,
        status: 'completed',
      });
    }
    cancelFocusSession();
  };

  const cancelFocusSession = () => {
    setIsFocusRunning(false);
    setFocusTask(null);
    setFocusSecondsRemaining(25 * 60);
  };

  return (
    <GoalContext.Provider
      value={{
        goals,
        activeGoal,
        milestones,
        tasks,
        reviews,
        resources,
        loading,
        recommendation,
        focusTask,
        isFocusRunning,
        focusSecondsRemaining,
        totalFocusSessionMinutes,
        selectActiveGoal,
        refreshAllGoalData,
        createTask,
        updateTask,
        toggleTaskComplete,
        deleteTask,
        createMilestone,
        updateMilestone,
        toggleMilestoneComplete,
        deleteMilestone,
        createResource,
        deleteResource,
        requestNextRecommendation,
        startFocusSession,
        pauseFocusSession,
        resumeFocusSession,
        finishFocusSession,
        cancelFocusSession,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
};

export function useGoal() {
  const context = useContext(GoalContext);
  if (!context) throw new Error('useGoal must be used within a GoalProvider');
  return context;
}
