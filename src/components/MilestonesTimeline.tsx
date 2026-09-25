import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Plus, Tag, ArrowRight } from 'lucide-react';
import { Milestone, GoalCategory } from '../types';

interface MilestonesTimelineProps {
  milestones: Milestone[];
  onToggleMilestone: (id: string) => void;
  onAddMilestone: (milestone: Omit<Milestone, 'id'>) => void;
}

export const MilestonesTimeline: React.FC<MilestonesTimelineProps> = ({
  milestones,
  onToggleMilestone,
  onAddMilestone,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('04:00 PM');
  const [newCategory, setNewCategory] = useState<GoalCategory>('Tech');
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddMilestone({
      title: newTitle.trim(),
      time: newTime,
      date: 'Today',
      category: newCategory,
      completed: false,
      priority: 'regular',
    });

    setNewTitle('');
    setIsAdding(false);
  };

  const completedCount = milestones.filter((m) => m.completed).length;

  return (
    <div
      className="p-6 rounded-[20px] border theme-transition flex flex-col justify-between"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3
              className="text-base font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Daily Timeline & Milestones
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-md font-semibold tabular-data"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-primary)',
              }}
            >
              {completedCount}/{milestones.length} Done
            </span>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-xl transition-all hover:opacity-80 border"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: isAdding ? 'var(--accent-primary)' : 'var(--bg-canvas)',
              color: isAdding ? 'var(--accent-contrast)' : 'var(--text-primary)',
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? 'Cancel' : 'Add Task'}</span>
          </button>
        </div>

        <p
          className="text-xs mb-4"
          style={{ color: 'var(--text-muted)' }}
        >
          Key objectives and focus sessions scheduled for today
        </p>

        {/* Inline Add Task Form */}
        {isAdding && (
          <form
            onSubmit={handleSubmit}
            className="p-3 mb-4 rounded-xl border flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-150"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <input
              type="text"
              placeholder="Milestone title (e.g. Wireframe settings view)..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              className="w-full text-xs px-3 py-2 rounded-lg border bg-transparent focus:outline-none focus:ring-1 focus:ring-current"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="04:00 PM"
                  className="w-24 text-[11px] px-2 py-1 rounded-md border bg-transparent tabular-data"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as GoalCategory)}
                  className="text-[11px] px-2 py-1 rounded-md border bg-transparent"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <option value="Tech">Tech</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Health">Health</option>
                  <option value="Creative">Creative</option>
                  <option value="Productivity">Productivity</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!newTitle.trim()}
                className="px-3 py-1 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-contrast)',
                }}
              >
                Save
              </button>
            </div>
          </form>
        )}

        {/* Vertical Timeline List */}
        <div className="relative pl-6 space-y-4">
          {/* Vertical connecting line */}
          <div
            className="absolute top-2 bottom-2 left-2.5 w-0.5"
            style={{ backgroundColor: 'var(--border-subtle)' }}
          />

          {milestones.map((item, index) => {
            const isCompleted = item.completed;

            return (
              <div key={item.id} className="relative group">
                {/* Timeline node icon */}
                <button
                  onClick={() => onToggleMilestone(item.id)}
                  className="absolute -left-6 top-0.5 p-0.5 rounded-full transition-transform hover:scale-110"
                  aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                >
                  {isCompleted ? (
                    <CheckCircle2
                      className="w-4 h-4 fill-emerald-500/20 text-emerald-500"
                    />
                  ) : (
                    <Circle
                      className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity"
                      style={{ color: 'var(--text-muted)' }}
                    />
                  )}
                </button>

                {/* Content card */}
                <div
                  onClick={() => onToggleMilestone(item.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isCompleted ? 'opacity-60 bg-transparent' : 'hover:shadow-sm'
                  }`}
                  style={{
                    backgroundColor: isCompleted ? 'transparent' : 'var(--bg-canvas)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-xs font-semibold leading-snug transition-all ${
                        isCompleted ? 'line-through' : ''
                      }`}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {item.title}
                    </p>

                    <span
                      className="text-[10px] px-2 py-0.5 rounded font-medium shrink-0 tabular-data"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.04)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {item.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    <div className="flex items-center gap-1 tabular-data">
                      <Clock className="w-3 h-3 opacity-60" />
                      <span>{item.time}</span>
                    </div>
                    <span>·</span>
                    <span>{item.date}</span>
                    {item.priority === 'urgent' && (
                      <>
                        <span>·</span>
                        <span className="text-amber-500 font-medium">Urgent</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer info */}
      <div
        className="mt-4 pt-3 border-t flex items-center justify-between text-xs"
        style={{
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-muted)',
        }}
      >
        <span>Next up: Evening run</span>
        <span className="font-semibold" style={{ color: 'var(--accent-primary)' }}>
          Syncing with Calendar
        </span>
      </div>
    </div>
  );
};
