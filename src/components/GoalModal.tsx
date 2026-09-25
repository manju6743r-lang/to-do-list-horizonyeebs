import React, { useState } from 'react';
import { X, Target, Calendar, Sparkles } from 'lucide-react';
import { Goal, GoalCategory } from '../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveGoal: (goal: Omit<Goal, 'id'>) => void;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSaveGoal,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Tech');
  const [targetDate, setTargetDate] = useState('Nov 30, 2026');
  const [progress, setProgress] = useState(25);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [colorIndex, setColorIndex] = useState<1 | 2 | 3 | 4>(2);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveGoal({
      title: title.trim(),
      category,
      progress,
      targetDate,
      milestonesTotal: 5,
      milestonesDone: Math.round((progress / 100) * 5),
      description: description.trim(),
      priority,
      colorIndex,
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setProgress(25);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-[20px] p-6 border shadow-2xl relative theme-transition"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-strong)',
          color: 'var(--text-primary)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-primary)',
              }}
            >
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Create New Goal</h3>
              <p className="text-xs opacity-70" style={{ color: 'var(--text-muted)' }}>
                Set up a focused objective and initial milestones
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Goal Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Master Rust for Systems Programming"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border bg-transparent focus:outline-none focus:ring-2 focus:ring-current"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="w-full text-sm px-3.5 py-2 rounded-xl border bg-transparent focus:outline-none"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="Tech">Tech</option>
                <option value="Engineering">Engineering</option>
                <option value="Health">Health</option>
                <option value="Creative">Creative</option>
                <option value="Productivity">Productivity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'High' | 'Medium' | 'Low')}
                className="w-full text-sm px-3.5 py-2 rounded-xl border bg-transparent focus:outline-none"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Target Deadline
              </label>
              <input
                type="text"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                placeholder="Dec 15, 2026"
                className="w-full text-sm px-3.5 py-2 rounded-xl border bg-transparent tabular-data"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Initial Progress: <span className="tabular-data font-bold">{progress}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full mt-2 accent-current cursor-pointer"
                style={{ accentColor: 'var(--accent-primary)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Description & Key Deliverables
            </label>
            <textarea
              rows={2}
              placeholder="Outline high-level focus milestones and intended outcomes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-transparent focus:outline-none focus:ring-1 focus:ring-current resize-none"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Accent Style
            </label>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4].map((idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setColorIndex(idx as 1 | 2 | 3 | 4)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    colorIndex === idx ? 'scale-110 ring-2 ring-current' : 'opacity-70'
                  }`}
                  style={{
                    backgroundColor: `var(--progress-fill-${idx})`,
                    borderColor: 'var(--border-strong)',
                  }}
                  title={`Color preset ${idx}`}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium border hover:opacity-80 transition-opacity"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-transform hover:scale-105"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--accent-contrast)',
              }}
            >
              Create Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
