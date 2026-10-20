import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  FileText,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import { useGoal } from '../context/GoalContext.js';
import type { ResourceItem } from '../types/index.js';

export const ResourcesView: React.FC = () => {
  const { activeGoal, resources, createResource, deleteResource } = useGoal();

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ResourceItem['type']>('article');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeGoal) return;

    // Simulate smart key takeaway extraction
    const takeaways = notes
      ? notes.split('\n').filter((l) => l.trim().length > 5).slice(0, 3)
      : ['Reference material captured for active roadmap execution.'];

    await createResource({
      title,
      type,
      url,
      notes,
      keyTakeaways: takeaways,
      aiActionSteps: [`Review ${title} before advancing next milestone block.`],
    });

    setTitle('');
    setUrl('');
    setNotes('');
    setShowAddModal(false);
  };

  const filtered = filterType === 'all' ? resources : resources.filter((r) => r.type === filterType);

  if (!activeGoal) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4 p-8 rounded-3xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] mx-auto flex items-center justify-center">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[var(--color-text-primary)]">
          Research Vault Inactive
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] max-w-md mx-auto leading-relaxed">
          The research vault stores documentation, high-impact articles, and AI action steps aligned with your destination. Select or architect a goal to start saving knowledge.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            Research & Knowledge Vault
          </div>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mt-1">
            Curated Assets & Notes
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Store essential tutorials, documentation, and playbooks tied to your destination.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Save Resource</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['all', 'article', 'tutorial', 'book', 'tool', 'note'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer whitespace-nowrap ${
              filterType === t
                ? 'bg-[var(--color-accent)] text-white font-medium'
                : 'text-[var(--color-text-secondary)] bg-[var(--color-surface)] hover:text-[var(--color-text-primary)] border border-[var(--color-border)]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Resources List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] p-6">
            <Bookmark className="w-8 h-8 mx-auto mb-2 text-[var(--color-text-muted)] opacity-50" />
            <span>No resources saved under this category yet.</span>
          </div>
        ) : (
          filtered.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-border-active)] transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[var(--color-surface-elevated)] text-[var(--color-accent)] border border-[var(--color-border)]">
                      {res.type}
                    </span>
                    {res.url && (
                      <a
                        href={res.url.startsWith('http://') || res.url.startsWith('https://') ? res.url : `https://${res.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                        title={res.url}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => deleteResource(res.id)}
                    className="text-[var(--color-text-muted)] hover:text-red-400 p-1 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-[var(--color-text-primary)] mt-2">
                  {res.title}
                </h3>

                {res.notes && (
                  <p className="mt-2 text-xs text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
                    {res.notes}
                  </p>
                )}

                {res.keyTakeaways && res.keyTakeaways.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-border)] space-y-1">
                    <div className="text-[11px] font-semibold text-[var(--color-accent)] flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Takeaways</span>
                    </div>
                    {res.keyTakeaways.map((takeaway, idx) => (
                      <div key={idx} className="text-[11px] text-[var(--color-text-muted)] flex items-start gap-1.5">
                        <span className="text-[var(--color-accent)]">·</span>
                        <span>{takeaway}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[var(--color-border)] text-[10px] text-[var(--color-text-muted)] font-mono">
                Saved {new Date(res.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] p-6 shadow-2xl">
            <h3 className="text-base font-bold text-[var(--color-text-primary)] mb-4">
              Save Resource or Note
            </h3>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Stripe Billing Architecture Docs"
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                  >
                    <option value="article">Article</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="book">Book</option>
                    <option value="tool">Tool</option>
                    <option value="note">Note</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
                    URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--color-text-primary)] mb-1">
                  Notes & Key Concepts
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Key takeaways, syntax snippets, or core ideas..."
                  className="w-full px-3 py-2 rounded-xl bg-[var(--color-canvas)] border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] rounded-xl cursor-pointer"
                >
                  Save Resource
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
