import React, { useState } from 'react';
import {
  X,
  Calendar,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ListTodo,
  Clock,
  Target,
  Plus,
  BookOpen,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Task, Subject, Goal } from '../types';
import { playChime } from '../utils/audio';

interface PlanTomorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  subjects: Subject[];
  goals: Goal[];
  onUpdateTasks: (updatedTasks: Task[]) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  showToast: (msg: string) => void;
}

export const PlanTomorrowModal: React.FC<PlanTomorrowModalProps> = ({
  isOpen,
  onClose,
  tasks,
  subjects,
  goals,
  onUpdateTasks,
  onAddTask,
  showToast,
}) => {
  // Pending tasks eligible to rollover
  const pendingTasks = tasks.filter((t) => !t.completed);
  const missedOrTodayTasks = pendingTasks.filter(
    (t) => t.dueDate === 'Today' || t.dueDate.toLowerCase().includes('today') || t.dueDate === 'Sep 24'
  );

  // Selected tasks to rollover to tomorrow
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(() =>
    missedOrTodayTasks.map((t) => t.id)
  );

  // New task input for tomorrow
  const [newTomorrowTaskTitle, setNewTomorrowTaskTitle] = useState('');
  const [newTomorrowTaskPriority, setNewTomorrowTaskPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newTomorrowSubjectId, setNewTomorrowSubjectId] = useState<string>('');

  // Target Focus Hours for tomorrow
  const [tomorrowTargetHours, setTomorrowTargetHours] = useState<number>(2);

  // Tomorrow's Top Priority Subject
  const [prioritySubjectId, setPrioritySubjectId] = useState<string>(
    subjects[0]?.id || ''
  );

  if (!isOpen) return null;

  const handleToggleTaskSelect = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedTaskIds.length === missedOrTodayTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(missedOrTodayTasks.map((t) => t.id));
    }
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTomorrowTaskTitle.trim()) return;

    const matchedSubj = subjects.find((s) => s.id === newTomorrowSubjectId);

    onAddTask({
      title: newTomorrowTaskTitle.trim(),
      completed: false,
      dueDate: 'Tomorrow',
      priority: newTomorrowTaskPriority,
      category: 'Planned Ahead',
      subjectId: newTomorrowSubjectId || undefined,
      subjectName: matchedSubj?.name,
    });

    setNewTomorrowTaskTitle('');
    showToast(`Added new task for tomorrow`);
  };

  const handleConfirmPlan = () => {
    // 1. Roll over selected tasks to 'Tomorrow'
    if (selectedTaskIds.length > 0) {
      const updated = tasks.map((t) => {
        if (selectedTaskIds.includes(t.id)) {
          return { ...t, dueDate: 'Tomorrow' };
        }
        return t;
      });
      onUpdateTasks(updated);
    }

    // 2. Save tomorrow's study target to storage
    const tomorrowPlanData = {
      targetHours: tomorrowTargetHours,
      prioritySubjectId,
      plannedAt: new Date().toISOString(),
      rolledOverCount: selectedTaskIds.length,
    };

    try {
      localStorage.setItem('horizon_tomorrow_plan', JSON.stringify(tomorrowPlanData));
    } catch {}

    playChime('start');
    showToast(
      `✨ Tomorrow's study plan locked in! (${tomorrowTargetHours}h target, ${selectedTaskIds.length} tasks scheduled)`
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] rounded-3xl border shadow-2xl relative theme-transition overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        style={{
          backgroundColor: '#0c0c0c',
          borderColor: 'var(--accent-primary)',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), var(--accent-glow)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="p-5 px-6 border-b flex items-center justify-between shrink-0"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-2xl flex items-center justify-center border shrink-0"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                borderColor: 'var(--accent-primary)',
                color: 'var(--accent-primary)',
              }}
            >
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Plan Tomorrow's Study Session</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Prep & Ahead
                </span>
              </h3>
              <p className="text-xs text-white/50">
                Close today with clarity. Reschedule missed work and set your focus intentions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border hover:opacity-100 opacity-60 transition-opacity text-white cursor-pointer"
            style={{ borderColor: 'var(--border-subtle)' }}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: Roll Over Missed & Incomplete Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  1. Roll Over Incomplete Tasks ({selectedTaskIds.length}/{missedOrTodayTasks.length})
                </h4>
              </div>
              {missedOrTodayTasks.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-xs font-semibold hover:underline cursor-pointer"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {selectedTaskIds.length === missedOrTodayTasks.length
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              )}
            </div>

            {missedOrTodayTasks.length === 0 ? (
              <div
                className="p-4 rounded-xl border text-center text-xs text-emerald-400/90 bg-emerald-500/5 border-emerald-500/20"
              >
                🎉 No missed tasks today! You can add fresh tasks below for tomorrow.
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {missedOrTodayTasks.map((task) => {
                  const isChecked = selectedTaskIds.includes(task.id);
                  return (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTaskSelect(task.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all cursor-pointer ${
                        isChecked
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-white'
                          : 'border-white/10 bg-white/5 opacity-60 text-white/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            isChecked
                              ? 'bg-emerald-500 border-emerald-500 text-black'
                              : 'border-white/30'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-medium truncate">{task.title}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold ${
                            task.priority === 'High'
                              ? 'bg-red-500/20 text-red-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="opacity-50 font-mono">Roll to Tomorrow</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Quick Add Fresh Tasks for Tomorrow */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-sky-400" />
              <span>2. Add New Task for Tomorrow</span>
            </h4>

            <form onSubmit={handleAddNewTask} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Revise Chemistry chapter 3 notes & solve 5 problems..."
                  value={newTomorrowTaskTitle}
                  onChange={(e) => setNewTomorrowTaskTitle(e.target.value)}
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border bg-black/40 text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-current"
                  style={{ borderColor: 'var(--border-subtle)' }}
                />
                <button
                  type="submit"
                  disabled={!newTomorrowTaskTitle.trim()}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-30 cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--accent-contrast)',
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={newTomorrowSubjectId}
                  onChange={(e) => setNewTomorrowSubjectId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border bg-black/50 text-white text-xs focus:outline-none"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <option value="">General Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1">
                  {(['High', 'Medium', 'Low'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewTomorrowTaskPriority(p)}
                      className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                        newTomorrowTaskPriority === p
                          ? 'bg-white/10 text-white border-white/40'
                          : 'opacity-50 hover:opacity-80 text-white/60 border-white/10'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Section 3: Tomorrow's Focus Sprint & Subject Targets */}
          <div className="space-y-3 pt-2 border-t border-white/5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>3. Target Focus Hours Tomorrow</span>
            </h4>

            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setTomorrowTargetHours(hours)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    tomorrowTargetHours === hours
                      ? 'font-bold shadow-md'
                      : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor:
                      tomorrowTargetHours === hours
                        ? 'var(--accent-subtle)'
                        : 'rgba(255, 255, 255, 0.02)',
                    borderColor:
                      tomorrowTargetHours === hours
                        ? 'var(--accent-primary)'
                        : 'var(--border-subtle)',
                    color:
                      tomorrowTargetHours === hours
                        ? 'var(--accent-primary)'
                        : 'var(--text-secondary)',
                  }}
                >
                  <div className="text-base font-extrabold">{hours}h</div>
                  <div className="text-[10px] opacity-70">{hours * 2} sprints</div>
                </button>
              ))}
            </div>

            {/* Priority Subject of the Day */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-white/80 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Primary Focus Subject for Tomorrow:</span>
              </label>
              <select
                value={prioritySubjectId}
                onChange={(e) => setPrioritySubjectId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border bg-black/50 text-white focus:outline-none"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Exam: {s.targetExamDate})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div
          className="p-4 px-6 border-t flex items-center justify-between shrink-0"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmPlan}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-contrast)',
              boxShadow: 'var(--accent-glow)',
            }}
          >
            <span>Lock In Tomorrow's Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
