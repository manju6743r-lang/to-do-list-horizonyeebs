import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  Tag,
  CheckCircle2,
  ListTodo,
  Sparkles,
  Archive,
  RotateCcw,
  Inbox,
  Filter,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Task, Subject, AppMode } from '../types';

interface TodoListProps {
  tasks: Task[];
  subjects: Subject[];
  mode: AppMode;
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onDeleteTask: (taskId: string) => void;
  searchQuery?: string;
}

export const TodoList: React.FC<TodoListProps> = ({
  tasks,
  subjects,
  mode,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  searchQuery = '',
}) => {
  // Tabs: 'active' (decluttered dashboard), 'archive' (completed tasks), 'all' (all tasks)
  const [activeTab, setActiveTab] = useState<'active' | 'archive' | 'all'>('active');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [subjectFilter, setSubjectFilter] = useState<string>('All');

  // New task inputs
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [newDueDate, setNewDueDate] = useState('Today');
  const [newSubjectName, setNewSubjectName] = useState(subjects[0]?.name || 'General');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      completed: false,
      dueDate: newDueDate,
      priority: newPriority,
      subjectName: newSubjectName,
      category: 'Academic Sprint',
    });

    setNewTitle('');
    // Switch to active tab so user sees their new task
    setActiveTab('active');
  };

  const completedTasks = tasks.filter((t) => t.completed);
  const activeTasks = tasks.filter((t) => !t.completed);

  // Filter tasks based on the tab and secondary filters
  const filteredTasks = tasks.filter((task) => {
    // 1. Tab filter
    if (activeTab === 'active' && task.completed) return false;
    if (activeTab === 'archive' && !task.completed) return false;

    // 2. Priority filter
    if (priorityFilter !== 'All' && task.priority !== priorityFilter) return false;

    // 3. Subject filter
    if (subjectFilter !== 'All' && task.subjectName !== subjectFilter) return false;

    // 4. Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchSubj = task.subjectName?.toLowerCase().includes(q);
      const matchCategory = task.category?.toLowerCase().includes(q);
      if (!matchTitle && !matchSubj && !matchCategory) return false;
    }

    return true;
  });

  // Bulk actions for archive
  const handleClearArchive = () => {
    if (window.confirm('Delete all archived tasks permanently?')) {
      completedTasks.forEach((t) => onDeleteTask(t.id));
    }
  };

  const handleRestoreAllArchived = () => {
    completedTasks.forEach((t) => onToggleTask(t.id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2
              className="text-xl sm:text-2xl font-extrabold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              To-Do & Study Task Planner
            </h2>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-semibold border"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                borderColor: 'var(--accent-primary)',
                color: 'var(--accent-primary)',
              }}
            >
              {mode === 'workspace' ? '💾 LocalStorage Mode' : '👁️ Preview Mock Mode'}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Daily homework assignments, numerical problem sets, and revision checklists
          </p>
        </div>

        {/* Status Counts */}
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-3 py-1.5 rounded-xl border tabular-data font-semibold"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
          >
            {activeTasks.length} Active · {completedTasks.length} Archived
          </span>
        </div>
      </div>

      {/* Add Task Box (Only shown or highlighted on Active / All tabs) */}
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-[20px] border theme-transition space-y-3"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <ListTodo className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <h3
            className="text-xs font-bold uppercase tracking-wider"
            style={{ color: 'var(--text-secondary)' }}
          >
            Add Actionable Study Task
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="text"
            required
            placeholder="e.g. Solve exercise 8.4 questions 1-10 or read Chapter 3 summary..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border bg-transparent focus:outline-none focus:ring-1 focus:ring-current"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--bg-canvas)',
            }}
          />

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as 'High' | 'Medium' | 'Low')}
              className="text-xs px-2.5 py-2.5 rounded-xl border bg-transparent focus:outline-none"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-canvas)',
              }}
            >
              <option value="High" style={{ backgroundColor: '#101010' }}>
                High Priority
              </option>
              <option value="Medium" style={{ backgroundColor: '#101010' }}>
                Medium Priority
              </option>
              <option value="Low" style={{ backgroundColor: '#101010' }}>
                Low Priority
              </option>
            </select>

            <select
              value={newSubjectName}
              onChange={(e) => setNewSubjectName(e.target.value)}
              className="text-xs px-2.5 py-2.5 rounded-xl border bg-transparent focus:outline-none max-w-[140px] truncate"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-canvas)',
              }}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.name} style={{ backgroundColor: '#101010' }}>
                  {s.name}
                </option>
              ))}
              <option value="General" style={{ backgroundColor: '#101010' }}>
                General
              </option>
            </select>

            <input
              type="text"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              placeholder="Today"
              className="w-20 text-xs px-2.5 py-2.5 rounded-xl border bg-transparent text-center tabular-data"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-canvas)',
              }}
            />

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-transform hover:scale-105 disabled:opacity-40 cursor-pointer shrink-0 flex items-center gap-1"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--accent-contrast)',
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </form>

      {/* Main Tab Navigation & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Navigation Tabs: Active, Archive, All */}
        <div
          className="inline-flex p-1 rounded-2xl border"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'active' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              backgroundColor:
                activeTab === 'active' ? 'var(--accent-primary)' : 'transparent',
              color:
                activeTab === 'active'
                  ? 'var(--accent-contrast)'
                  : 'var(--text-primary)',
            }}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Active Tasks</span>
            <span
              className="text-[10px] px-1.5 py-0.2 rounded-md font-mono"
              style={{
                backgroundColor:
                  activeTab === 'active' ? 'rgba(0,0,0,0.2)' : 'var(--bg-canvas)',
              }}
            >
              {activeTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'archive' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              backgroundColor:
                activeTab === 'archive' ? 'var(--accent-primary)' : 'transparent',
              color:
                activeTab === 'archive'
                  ? 'var(--accent-contrast)'
                  : 'var(--text-primary)',
            }}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Archive</span>
            <span
              className="text-[10px] px-1.5 py-0.2 rounded-md font-mono"
              style={{
                backgroundColor:
                  activeTab === 'archive' ? 'rgba(0,0,0,0.2)' : 'var(--bg-canvas)',
              }}
            >
              {completedTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              backgroundColor:
                activeTab === 'all' ? 'var(--accent-primary)' : 'transparent',
              color:
                activeTab === 'all'
                  ? 'var(--accent-contrast)'
                  : 'var(--text-primary)',
            }}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All</span>
            <span
              className="text-[10px] px-1.5 py-0.2 rounded-md font-mono"
              style={{
                backgroundColor:
                  activeTab === 'all' ? 'rgba(0,0,0,0.2)' : 'var(--bg-canvas)',
              }}
            >
              {tasks.length}
            </span>
          </button>
        </div>

        {/* Secondary Filters (Priority & Subject) */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="text-xs px-2.5 py-1.5 rounded-xl border bg-transparent focus:outline-none"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <option value="All" style={{ backgroundColor: '#101010' }}>
              All Priorities
            </option>
            <option value="High" style={{ backgroundColor: '#101010' }}>
              High Priority
            </option>
            <option value="Medium" style={{ backgroundColor: '#101010' }}>
              Medium Priority
            </option>
            <option value="Low" style={{ backgroundColor: '#101010' }}>
              Low Priority
            </option>
          </select>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border bg-transparent focus:outline-none max-w-[130px] truncate"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <option value="All" style={{ backgroundColor: '#101010' }}>
              All Subjects
            </option>
            {subjects.map((s) => (
              <option key={s.id} value={s.name} style={{ backgroundColor: '#101010' }}>
                {s.name}
              </option>
            ))}
            <option value="General" style={{ backgroundColor: '#101010' }}>
              General
            </option>
          </select>
        </div>
      </div>

      {/* Archive Context Banner (shown when viewing Archive tab) */}
      {activeTab === 'archive' && (
        <div
          className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border shrink-0"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderColor: 'rgba(16, 185, 129, 0.3)',
                color: '#10b981',
              }}
            >
              <Archive className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Task Archive</span>
                <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {completedTasks.length} Completed
                </span>
              </h4>
              <p className="text-xs text-white/50">
                Completed tasks are moved here to keep your active workspace decluttered. Click{' '}
                <RotateCcw className="w-3 h-3 inline text-emerald-400" /> to restore any task back to
                Active.
              </p>
            </div>
          </div>

          {completedTasks.length > 0 && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRestoreAllArchived}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border text-white/80 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                style={{ borderColor: 'var(--border-subtle)' }}
                title="Restore all archived tasks back to active"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restore All</span>
              </button>

              <button
                onClick={handleClearArchive}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-1.5"
                title="Delete all completed tasks permanently"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear Archive</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active Dashboard Context Hint (shown when on Active tab) */}
      {activeTab === 'active' && (
        <div className="flex items-center justify-between text-[11px] px-1" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active dashboard is decluttered: checking a task moves it automatically to Archive.</span>
          </span>
          {completedTasks.length > 0 && (
            <button
              onClick={() => setActiveTab('archive')}
              className="font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              style={{ color: 'var(--accent-primary)' }}
            >
              <span>View {completedTasks.length} Archived</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Task Items List */}
      <div
        className="p-6 rounded-[20px] border theme-transition space-y-2.5"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {filteredTasks.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-3" style={{ color: 'var(--text-muted)' }}>
            {activeTab === 'archive' ? (
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <Archive className="w-6 h-6 opacity-40" />
                </div>
                <h4 className="text-sm font-semibold text-white">Archive is Empty</h4>
                <p className="text-xs max-w-sm">
                  Tasks marked as completed on your active dashboard will automatically be archived
                  here.
                </p>
                <button
                  onClick={() => setActiveTab('active')}
                  className="text-xs font-semibold hover:underline mt-1"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  Return to Active Tasks
                </button>
              </div>
            ) : activeTab === 'active' ? (
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgba(16, 185, 129, 0.3)',
                    color: '#10b981',
                  }}
                >
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-white">All Caught Up!</h4>
                <p className="text-xs max-w-sm">
                  You have no pending tasks in your active queue. Add a new study task above or check
                  the Archive.
                </p>
                {completedTasks.length > 0 && (
                  <button
                    onClick={() => setActiveTab('archive')}
                    className="text-xs font-semibold hover:underline mt-1"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    Browse {completedTasks.length} Archived Tasks
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs">No tasks match your current filter criteria.</p>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.completed;

            return (
              <div
                key={task.id}
                onClick={() => onToggleTask(task.id)}
                className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all duration-150 group ${
                  isDone
                    ? 'opacity-70 bg-black/30 border-white/5'
                    : 'hover:border-white/20 hover:-translate-y-0.5'
                }`}
                style={{
                  backgroundColor: isDone ? 'rgba(0,0,0,0.3)' : 'var(--bg-canvas)',
                  borderColor: isDone ? 'var(--border-subtle)' : 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleTask(task.id);
                    }}
                    className="shrink-0 p-0.5 cursor-pointer"
                    aria-label={isDone ? 'Restore to active' : 'Complete and archive'}
                    title={isDone ? 'Click to restore to active' : 'Click to complete & archive'}
                  >
                    {isDone ? (
                      <CheckSquare
                        className="w-5 h-5 fill-current"
                        style={{ color: 'var(--accent-primary)' }}
                      />
                    ) : (
                      <Square
                        className="w-5 h-5 opacity-40 group-hover:opacity-80"
                        style={{ color: 'var(--text-muted)' }}
                      />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-semibold leading-snug transition-all ${
                        isDone ? 'line-through opacity-70' : ''
                      }`}
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {task.title}
                    </p>

                    <div
                      className="flex items-center gap-2 mt-1 text-[11px]"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {task.subjectName && (
                        <span className="font-medium text-white/70">
                          {task.subjectName}
                        </span>
                      )}
                      <span>·</span>
                      <span className="flex items-center gap-1 tabular-data">
                        <Calendar className="w-3 h-3 opacity-60" />
                        {task.dueDate}
                      </span>
                      {isDone && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-400 font-medium">Archived</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      task.priority === 'High'
                        ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                        : task.priority === 'Medium'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                    }`}
                  >
                    {task.priority}
                  </span>

                  {isDone ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTask(task.id);
                      }}
                      className="p-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                      title="Restore to Active Tasks"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span className="hidden sm:inline">Restore</span>
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    className="p-1 rounded opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-red-400 transition-opacity cursor-pointer"
                    title="Delete task permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
