import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Loader2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import type { CoachingStyle, CoachMessage } from '../types/index.js';
import { useGoal } from '../context/GoalContext.js';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../lib/api.js';

interface AICoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AICoachDrawer: React.FC<AICoachDrawerProps> = ({ isOpen, onClose }) => {
  const { activeGoal, tasks, milestones } = useGoal();
  const { user } = useAuth();

  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<CoachingStyle>(
    activeGoal?.coachingStyle || user?.coachingStyle || 'strategic'
  );
  const [engineUsed, setEngineUsed] = useState<string>('gemini-3.8-flash');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeGoal) {
      setSelectedStyle(activeGoal.coachingStyle);
      loadMessages();
    }
  }, [activeGoal]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadMessages = async () => {
    if (!activeGoal) return;
    try {
      const data = await api.getCoachMessages(activeGoal.id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load coach messages:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !activeGoal || loading) return;

    setInputText('');
    setLoading(true);

    try {
      const result = await api.sendCoachMessage(activeGoal.id, text, selectedStyle);
      setMessages((prev) => [...prev, result.userMessage, result.coachMessage]);
      setEngineUsed(result.engine || 'gemini-3.8-flash');
    } catch (err: any) {
      console.error('Coach message failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const quickPrompts = [
    'What should I prioritize next to gain momentum?',
    'I feel overwhelmed by my current milestone.',
    'Help me break down my next big task.',
    'I am procrastinating on a difficult item.',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-[var(--color-surface)] border-l border-[var(--color-border)] h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-canvas)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center border border-[var(--color-border)]">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <span>Northstar Coach</span>
                <span className="text-[10px] font-mono text-[var(--color-accent)] px-1.5 py-0.5 rounded bg-[var(--color-surface-elevated)] border border-[var(--color-border)]">
                  {engineUsed.includes('gemini') ? 'Gemini 3.8' : 'Deterministic'}
                </span>
              </div>
              <div className="text-[11px] text-[var(--color-text-muted)] truncate max-w-[220px]">
                {activeGoal?.title || 'Personal Goal System'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] p-1 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Style Selector Tabs */}
        <div className="px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface-elevated)]/40 flex items-center justify-between text-xs">
          <span className="text-[var(--color-text-muted)] font-medium">Coaching Persona:</span>
          <div className="flex items-center gap-1">
            {(['gentle', 'strategic', 'direct'] as CoachingStyle[]).map((style) => (
              <button
                key={style}
                onClick={() => setSelectedStyle(style)}
                className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors cursor-pointer text-xs ${
                  selectedStyle === style
                    ? 'bg-[var(--color-accent)] text-white shadow-xs'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!activeGoal ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-accent)] mx-auto flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                No Active Ambition Selected
              </h4>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-xs mx-auto">
                The AI Coach adapts strictly to your active goal&apos;s measurable criteria, constraints, and daily execution logs. Architect or select a goal to begin.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-[var(--color-accent)] mx-auto flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                Your Strategic Execution Coach
              </h4>
              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-xs mx-auto">
                Ask how to break down complex tasks, troubleshoot blockers, or calibrate your daily workload.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'coach' && (
                  <div className="w-6 h-6 rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0 mt-0.5 border border-[var(--color-border)]">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`p-3.5 rounded-2xl max-w-[85%] ${
                    msg.sender === 'user'
                      ? 'bg-[var(--color-accent)] text-white rounded-tr-none shadow-sm'
                      : 'bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border)] rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {msg.recommendedAction && (
                    <div className="mt-2.5 pt-2 border-t border-[var(--color-border)] flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-accent)]">
                      <ArrowRight className="w-3 h-3" />
                      <span>{msg.recommendedAction}</span>
                    </div>
                  )}

                  <div className="mt-1 text-[9px] text-[var(--color-text-muted)] text-right font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-6 h-6 rounded-md bg-[var(--color-surface-elevated)] text-[var(--color-text-primary)] flex items-center justify-center shrink-0 mt-0.5 border border-[var(--color-border)]">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))
          )}

          {loading && (
            <div className="flex gap-3 text-xs justify-start">
              <div className="w-6 h-6 rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0 border border-[var(--color-border)]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 rounded-xl bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                Synthesizing strategic feedback...
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 border-t border-[var(--color-border)] bg-[var(--color-canvas)] overflow-x-auto flex gap-1.5">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-elevated)] border border-[var(--color-border)] px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={activeGoal ? 'Ask your coach anything about your goal...' : 'Architect or select an active goal first...'}
              disabled={!activeGoal || loading}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!activeGoal || !inputText.trim() || loading}
              className="p-2.5 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-2 text-[10px] text-[var(--color-text-muted)] flex items-center justify-between">
            <span>Context: Goal criteria, tasks, and friction points.</span>
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-[var(--color-text-muted)]" />
              <span>Not clinical advice</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
