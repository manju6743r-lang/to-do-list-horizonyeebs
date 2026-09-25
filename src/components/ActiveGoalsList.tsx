import React, { useState, useEffect } from 'react';
import {
  Target,
  Calendar,
  CheckCircle2,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  Timer,
  Flame,
} from 'lucide-react';
import { Goal, GoalCategory } from '../types';

interface ActiveGoalsListProps {
  goals: Goal[];
  onUpdateProgress: (id: string, newProgress: number) => void;
  onDeleteGoal: (id: string) => void;
  onOpenNewGoalModal: () => void;
  onOpenSyncCalendar?: () => void;
  onStartFocusSession?: (goalId: string) => void;
  searchQuery?: string;
  statusFilter?: 'all' | 'in-progress' | 'completed';
}

export const ActiveGoalsList: React.FC<ActiveGoalsListProps> = ({
  goals,
  onUpdateProgress,
  onDeleteGoal,
  onOpenNewGoalModal,
  onOpenSyncCalendar,
  onStartFocusSession,
  searchQuery = '',
  statusFilter = 'all',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [hasLoaded, setHasLoaded] = useState(false);

  // Trigger progress bar load animation
  useEffect(() => {
    const timer = setTimeout(() => setHasLoaded(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const categories = ['All', 'Tech', 'Engineering', 'Health', 'Creative', 'Productivity'];

  // Filter goals by search query, status filter, and category
  const filteredGoals = goals.filter((goal) => {
    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = goal.title.toLowerCase().includes(q);
      const matchCat = goal.category.toLowerCase().includes(q);
      const matchDesc = goal.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchCat && !matchDesc) return false;
    }

    // Status filter
    if (statusFilter === 'in-progress' && goal.progress === 100) return false;
    if (statusFilter === 'completed' && goal.progress < 100) return false;

    // Category filter
    if (selectedCategory !== 'All' && goal.category !== selectedCategory) return false;

    return true;
  });

  const getProgressColor = (colorIndex: number) => {
    switch (colorIndex) {
      case 1:
        return 'var(--progress-fill-1)';
      case 2:
        return 'var(--progress-fill-2)';
      case 3:
        return 'var(--progress-fill-3)';
      case 4:
        return 'var(--progress-fill-4)';
      default:
        return 'var(--accent-primary)';
    }
  };

  return (
    <div
      className="p-6 rounded-[20px] border theme-transition"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3
              className="text-lg font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Active Goals & Trackers
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-md font-semibold tabular-data"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-primary)',
              }}
            >
              {filteredGoals.length} {filteredGoals.length === 1 ? 'Goal' : 'Goals'}
            </span>
          </div>
          <p
            className="text-xs mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Monitor real-time execution, adjust milestones, and celebrate completions
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenSyncCalendar && (
            <button
              onClick={onOpenSyncCalendar}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              style={{
                backgroundColor: 'rgba(66, 133, 244, 0.1)',
                borderColor: 'rgba(66, 133, 244, 0.4)',
                color: '#60a5fa',
              }}
              title="Push upcoming milestones directly to Google Calendar via OAuth"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Sync to Google Calendar</span>
            </button>
          )}

          {/* Filter categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'font-semibold shadow-sm'
                    : 'hover:opacity-80'
                }`}
                style={{
                  backgroundColor:
                    selectedCategory === cat ? 'var(--accent-primary)' : 'var(--bg-canvas)',
                  color:
                    selectedCategory === cat ? 'var(--accent-contrast)' : 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Goals List Grid */}
      {filteredGoals.length === 0 ? (
        <div
          className="p-12 text-center rounded-2xl border border-dashed flex flex-col items-center gap-3 my-4"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent-primary)',
            }}
          >
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              No goals match your criteria
            </h4>
            <p className="text-xs max-w-sm mx-auto mt-1" style={{ color: 'var(--text-muted)' }}>
              Try clearing your search query or create a fresh milestone to kick off this objective.
            </p>
          </div>
          <button
            onClick={onOpenNewGoalModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold mt-2 shadow-sm transition-transform hover:scale-105"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-contrast)',
            }}
          >
            Create New Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const isFinished = goal.progress >= 100;
            const fillColor = getProgressColor(goal.colorIndex);

            return (
              <div
                key={goal.id}
                className="p-5 rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between group"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div>
                  {/* Top line: Category, Priority, Delete */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.05)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {goal.category}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                          goal.priority === 'High'
                            ? 'text-amber-500'
                            : 'text-slate-400'
                        }`}
                      >
                        {goal.priority} Priority
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1 rounded opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity hover:text-red-500"
                      aria-label="Delete goal"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Goal Title & Target */}
                  <h4
                    className="text-sm sm:text-base font-bold tracking-tight mb-1"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {goal.title}
                  </h4>

                  {goal.description && (
                    <p
                      className="text-xs line-clamp-2 mb-3"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {goal.description}
                    </p>
                  )}
                </div>

                  {/* Progress Bar & Percentage */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex items-center gap-1 font-medium"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <Calendar className="w-3.5 h-3.5 opacity-60" />
                        <span>Due {goal.targetDate}</span>
                      </span>

                      {goal.focusMinutesLogged ? (
                        <>
                          <span className="opacity-30">·</span>
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            <Flame className="w-3 h-3 text-amber-500" />
                            <span className="tabular-data">{goal.focusMinutesLogged}m</span>
                          </span>
                        </>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className="font-bold tabular-data text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {goal.progress}%
                      </span>
                      {isFinished && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                  </div>

                  {/* Progress bar container */}
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{ backgroundColor: 'var(--progress-track)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: hasLoaded ? `${goal.progress}%` : '0%',
                        backgroundColor: fillColor,
                      }}
                    />
                  </div>

                  {/* Quick Controls: -5%, +5%, Focus Timer, Complete */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 text-xs">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateProgress(goal.id, Math.max(0, goal.progress - 5))}
                        disabled={goal.progress <= 0}
                        className="p-1 rounded-md border hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
                        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                        title="Decrease 5%"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => onUpdateProgress(goal.id, Math.min(100, goal.progress + 5))}
                        disabled={goal.progress >= 100}
                        className="p-1 rounded-md border hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
                        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
                        title="Increase 5%"
                      >
                        <Plus className="w-3 h-3" />
                      </button>

                      <span className="text-[11px] ml-1 tabular-data opacity-70" style={{ color: 'var(--text-muted)' }}>
                        {goal.milestonesDone}/{goal.milestonesTotal} steps
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {onStartFocusSession && (
                        <button
                          onClick={() => onStartFocusSession(goal.id)}
                          className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border transition-all hover:scale-105 cursor-pointer shadow-xs"
                          style={{
                            backgroundColor: 'var(--accent-subtle)',
                            borderColor: 'var(--border-subtle)',
                            color: 'var(--accent-primary)',
                          }}
                          title="Start Pomodoro focus session for this goal"
                        >
                          <Timer className="w-3 h-3" />
                          <span>Focus</span>
                        </button>
                      )}

                      <button
                        onClick={() => onUpdateProgress(goal.id, isFinished ? 0 : 100)}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-lg border transition-all cursor-pointer"
                        style={{
                          borderColor: isFinished ? 'transparent' : 'var(--border-subtle)',
                          backgroundColor: isFinished ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                          color: isFinished ? '#10b981' : 'var(--text-secondary)',
                        }}
                      >
                        {isFinished ? 'Completed 🎉' : 'Mark Done'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
