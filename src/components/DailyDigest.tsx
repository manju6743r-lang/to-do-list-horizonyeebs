import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Target,
  BookOpen,
  ListTodo,
  Check,
  RotateCcw,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { Task, Subject, Goal, FocusSession } from '../types';

interface DailyDigestProps {
  tasks: Task[];
  subjects: Subject[];
  goals: Goal[];
  focusSessions: FocusSession[];
  onToggleTask: (taskId: string) => void;
  onUpdateTasks: (updatedTasks: Task[]) => void;
  onNavigateTab: (tab: 'dashboard' | 'syllabus' | 'todos' | 'goals' | 'focus') => void;
  onOpenPlanTomorrow: () => void;
  onOpenSyncCalendar?: () => void;
  showToast: (msg: string) => void;
}

export const DailyDigest: React.FC<DailyDigestProps> = ({
  tasks,
  subjects,
  goals,
  focusSessions,
  onToggleTask,
  onUpdateTasks,
  onNavigateTab,
  onOpenPlanTomorrow,
  onOpenSyncCalendar,
  showToast,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 1. Calculate Today's Achievements
  const completedTodayTasks = tasks.filter((t) => t.completed);
  const totalFocusMinutesToday = focusSessions
    .filter((s) => s.completed)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const preparedTopicsCount = subjects.reduce(
    (acc, s) => acc + s.topics.filter((top) => top.isPrepared).length,
    0
  );

  // 2. Calculate Missed & Overdue Tasks
  const missedTasks = tasks.filter(
    (t) =>
      !t.completed &&
      (t.dueDate === 'Today' ||
        t.dueDate.toLowerCase().includes('today') ||
        t.dueDate === 'Sep 24' ||
        t.dueDate.toLowerCase().includes('yesterday'))
  );

  // 3. Upcoming Deadlines (Subjects exams, goals target dates, tasks due tomorrow)
  const tomorrowTasks = tasks.filter(
    (t) => !t.completed && (t.dueDate === 'Tomorrow' || t.dueDate.toLowerCase().includes('tomorrow'))
  );

  const upcomingExamSubjects = [...subjects]
    .filter((s) => s.targetExamDate)
    .slice(0, 2);

  const upcomingGoals = [...goals]
    .filter((g) => g.progress < 100)
    .slice(0, 2);

  // One-click: Reschedule a single missed task to Tomorrow
  const handleMoveTaskToTomorrow = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, dueDate: 'Tomorrow' } : t));
    onUpdateTasks(updated);
    showToast('⏩ Rescheduled task to Tomorrow');
  };

  // One-click: Move all missed tasks to Tomorrow
  const handleMoveAllToTomorrow = () => {
    if (missedTasks.length === 0) return;
    const missedIds = missedTasks.map((t) => t.id);
    const updated = tasks.map((t) => (missedIds.includes(t.id) ? { ...t, dueDate: 'Tomorrow' } : t));
    onUpdateTasks(updated);
    showToast(`⏩ Moved ${missedTasks.length} tasks to Tomorrow`);
  };

  return (
    <div
      className="p-5 sm:p-6 rounded-[22px] border theme-transition relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs shrink-0"
            style={{
              backgroundColor: 'var(--accent-subtle)',
              borderColor: 'var(--accent-primary)',
              color: 'var(--accent-primary)',
            }}
          >
            <Sparkles className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                Daily Digest
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                Today's Briefing
              </span>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              Review what you conquered, address unfinished tasks, and set tomorrow up for success.
            </p>
          </div>
        </div>

        {/* Action Controls: Prominent "Plan Tomorrow" Button & Collapse Toggle */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {onOpenSyncCalendar && (
            <button
              onClick={onOpenSyncCalendar}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
              style={{
                backgroundColor: 'rgba(66, 133, 244, 0.1)',
                borderColor: 'rgba(66, 133, 244, 0.35)',
                color: '#60a5fa',
              }}
              title="Push upcoming milestones directly to your personal Google Calendar"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Sync Calendar</span>
            </button>
          )}

          <button
            onClick={onOpenPlanTomorrow}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer group"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-contrast)',
              boxShadow: 'var(--accent-glow)',
            }}
            title="Open Tomorrow's Planning Suite"
          >
            <Calendar className="w-4 h-4" />
            <span>Plan Tomorrow</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl border hover:opacity-100 opacity-60 transition-opacity text-white cursor-pointer"
            style={{ borderColor: 'var(--border-subtle)' }}
            title={isCollapsed ? 'Expand Daily Digest' : 'Collapse Daily Digest'}
            aria-label="Toggle digest view"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Digest Body (Collapsible) */}
      {!isCollapsed && (
        <div className="pt-5 space-y-5 animate-in fade-in duration-200">
          {/* Quick Stat Badges Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Stat 1: Achievements Badge */}
            <div
              className="p-3.5 rounded-2xl border flex items-center justify-between"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.05)',
                borderColor: 'rgba(16, 185, 129, 0.25)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">Today's Wins</span>
              </div>
              <span className="text-xs font-extrabold text-emerald-400 font-mono">
                {completedTodayTasks.length} tasks · {totalFocusMinutesToday}m focus
              </span>
            </div>

            {/* Stat 2: Missed Tasks Badge */}
            <div
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition-colors ${
                missedTasks.length > 0
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle
                  className={`w-4 h-4 ${missedTasks.length > 0 ? 'text-amber-400' : 'text-white/40'}`}
                />
                <span className="text-xs font-bold text-white">Missed / Due Today</span>
              </div>
              <span
                className={`text-xs font-extrabold font-mono ${
                  missedTasks.length > 0 ? 'text-amber-400' : 'text-white/60'
                }`}
              >
                {missedTasks.length} uncompleted
              </span>
            </div>

            {/* Stat 3: Upcoming Deadlines Badge */}
            <div
              className="p-3.5 rounded-2xl border flex items-center justify-between"
              style={{
                backgroundColor: 'rgba(56, 189, 248, 0.05)',
                borderColor: 'rgba(56, 189, 248, 0.25)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white">Upcoming Horizon</span>
              </div>
              <span className="text-xs font-extrabold text-sky-400 font-mono">
                {tomorrowTasks.length} tomorrow · {upcomingExamSubjects.length} exams
              </span>
            </div>
          </div>

          {/* 3 Detail Columns: Achievements, Missed Tasks, Upcoming Deadlines */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* COLUMN 1: Today's Achievements */}
            <div
              className="p-4 rounded-2xl border space-y-3 flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Achievements Conquered</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    +{totalFocusMinutesToday}m logged
                  </span>
                </div>

                {completedTodayTasks.length === 0 ? (
                  <p className="text-xs text-white/50 italic py-3 text-center">
                    No tasks marked complete yet today. Start a focus sprint to build momentum!
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {completedTodayTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-xl border border-white/5 bg-white/2 flex items-start gap-2 text-xs"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white/90 line-through opacity-70 truncate">
                            {t.title}
                          </p>
                          <span className="text-[10px] text-white/40 block mt-0.5">
                            {t.subjectName || t.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/60">
                <span>{preparedTopicsCount} total chapters mastered</span>
                <button
                  onClick={() => onNavigateTab('focus')}
                  className="font-semibold text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Focus Timer</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* COLUMN 2: Missed & Overdue Tasks */}
            <div
              className="p-4 rounded-2xl border space-y-3 flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: missedTasks.length > 0 ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-subtle)',
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <AlertTriangle
                      className={`w-4 h-4 ${missedTasks.length > 0 ? 'text-amber-400' : 'text-white/40'}`}
                    />
                    <span>Missed Tasks ({missedTasks.length})</span>
                  </div>

                  {missedTasks.length > 0 && (
                    <button
                      onClick={handleMoveAllToTomorrow}
                      className="text-[10px] font-bold text-amber-400 hover:underline cursor-pointer"
                    >
                      Roll All to Tomorrow
                    </button>
                  )}
                </div>

                {missedTasks.length === 0 ? (
                  <div className="py-6 flex flex-col items-center justify-center text-center space-y-1 text-xs">
                    <span className="text-xl">✨</span>
                    <p className="font-bold text-white">All caught up!</p>
                    <p className="text-white/50 text-[11px]">No overdue or missed tasks for today.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {missedTasks.map((t) => (
                      <div
                        key={t.id}
                        className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 flex flex-col gap-1.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-white/95 leading-snug line-clamp-2">
                            {t.title}
                          </span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold shrink-0 ${
                              t.priority === 'High'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5">
                          <span className="text-white/40">{t.subjectName || t.dueDate}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleMoveTaskToTomorrow(t.id, e)}
                              className="font-semibold text-amber-300 hover:text-white transition-colors cursor-pointer"
                              title="Reschedule to Tomorrow"
                            >
                              + Tomorrow
                            </button>
                            <button
                              onClick={() => onToggleTask(t.id)}
                              className="font-semibold text-emerald-400 hover:text-white transition-colors cursor-pointer"
                              title="Mark as Done"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/60">
                <span>Keep your backlog clear</span>
                <button
                  onClick={() => onNavigateTab('todos')}
                  className="font-semibold text-white/80 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>To-Do List</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* COLUMN 3: Upcoming Deadlines */}
            <div
              className="p-4 rounded-2xl border space-y-3 flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span>Upcoming Deadlines</span>
                  </div>
                  <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                    Target Dates
                  </span>
                </div>

                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {/* Subject Target Exams */}
                  {upcomingExamSubjects.map((subj) => (
                    <div
                      key={subj.id}
                      onClick={() => onNavigateTab('syllabus')}
                      className="p-2.5 rounded-xl border border-white/5 bg-white/2 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{subj.name}</p>
                          <span className="text-[10px] text-white/50 block">Target Exam</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-sky-300 shrink-0 ml-2">
                        {subj.targetExamDate}
                      </span>
                    </div>
                  ))}

                  {/* Tasks Due Tomorrow */}
                  {tomorrowTasks.slice(0, 2).map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onNavigateTab('todos')}
                      className="p-2.5 rounded-xl border border-white/5 bg-white/2 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <ListTodo className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{t.title}</p>
                          <span className="text-[10px] text-white/50 block">Task Due Tomorrow</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-amber-400 shrink-0 ml-2">
                        Tomorrow
                      </span>
                    </div>
                  ))}

                  {/* Active Goals */}
                  {upcomingGoals.slice(0, 1).map((goal) => (
                    <div
                      key={goal.id}
                      onClick={() => onNavigateTab('goals')}
                      className="p-2.5 rounded-xl border border-white/5 bg-white/2 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Target className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{goal.title}</p>
                          <span className="text-[10px] text-white/50 block">Goal Milestone</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-purple-300 shrink-0 ml-2">
                        {goal.targetDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-white/60">
                {onOpenSyncCalendar ? (
                  <button
                    onClick={onOpenSyncCalendar}
                    className="font-semibold text-sky-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>Sync to Calendar</span>
                  </button>
                ) : (
                  <span>Plan ahead to avoid cramming</span>
                )}
                <button
                  onClick={onOpenPlanTomorrow}
                  className="font-bold text-white hover:underline flex items-center gap-1 cursor-pointer"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  <span>Plan Tomorrow</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
