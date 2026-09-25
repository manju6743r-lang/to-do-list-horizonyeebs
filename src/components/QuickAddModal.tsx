import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  ListTodo,
  BookOpen,
  Target,
  Calendar,
  Sparkles,
  AlertCircle,
  Tag,
  Clock,
  Check,
  CheckCircle2,
  FolderPlus,
} from 'lucide-react';
import {
  Subject,
  Task,
  Goal,
  GoalCategory,
  TopicDifficulty,
} from '../types';

export type QuickAddTab = 'task' | 'subject' | 'goal';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: QuickAddTab;
  subjects: Subject[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onAddSubject: (
    subject: Omit<Subject, 'id' | 'topics'>,
    initialTopicTitles?: string[]
  ) => void;
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'task',
  subjects,
  onAddTask,
  onAddSubject,
  onAddGoal,
}) => {
  const [activeTab, setActiveTab] = useState<QuickAddTab>(initialTab);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [taskDueDate, setTaskDueDate] = useState('Tomorrow');
  const [taskSubjectId, setTaskSubjectId] = useState<string>('');
  const [taskCategory, setTaskCategory] = useState('Study');

  // Subject form state
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectCategory, setSubjectCategory] = useState('Core Science');
  const [subjectExamDate, setSubjectExamDate] = useState('Nov 15, 2026');
  const [subjectColorTag, setSubjectColorTag] = useState('mint');
  const [subjectChapters, setSubjectChapters] = useState('');

  // Goal form state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalCategory, setGoalCategory] = useState<GoalCategory>('Academics');
  const [goalTargetDate, setGoalTargetDate] = useState('Dec 20, 2026');
  const [goalProgress, setGoalProgress] = useState(10);
  const [goalPriority, setGoalPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [goalDescription, setGoalDescription] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial tab when opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
    }
  }, [isOpen, initialTab]);

  // Handle Tab switch focus
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 60);
    }
  }, [activeTab, isOpen]);

  // Auto-generate subject code when subject name is typed
  const handleSubjectNameChange = (val: string) => {
    setSubjectName(val);
    if (!subjectCode || subjectCode.endsWith('-01')) {
      const initials = val
        .split(' ')
        .map((w) => w[0])
        .filter(Boolean)
        .join('')
        .toUpperCase()
        .slice(0, 4);
      if (initials) {
        setSubjectCode(`${initials}-01`);
      }
    }
  };

  if (!isOpen) return null;

  // Submit handlers
  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const matchedSubject = subjects.find((s) => s.id === taskSubjectId);

    onAddTask({
      title: taskTitle.trim(),
      completed: false,
      dueDate: taskDueDate.trim() || 'Today',
      priority: taskPriority,
      category: taskCategory,
      subjectId: taskSubjectId || undefined,
      subjectName: matchedSubject?.name,
    });

    setTaskTitle('');
    onClose();
  };

  const handleSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    const chapterList = subjectChapters
      .split(/[,;\n]+/)
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    onAddSubject(
      {
        name: subjectName.trim(),
        code: subjectCode.trim() || 'SUB-01',
        category: subjectCategory,
        targetExamDate: subjectExamDate.trim() || 'Dec 2026',
        colorTag: subjectColorTag,
      },
      chapterList.length > 0
        ? chapterList
        : ['Fundamentals & Introduction', 'Core Theory & Concepts', 'Practice Problems & Exercises']
    );

    setSubjectName('');
    setSubjectCode('');
    setSubjectChapters('');
    onClose();
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim()) return;

    onAddGoal({
      title: goalTitle.trim(),
      category: goalCategory,
      progress: goalProgress,
      targetDate: goalTargetDate.trim() || 'Dec 2026',
      milestonesTotal: 5,
      milestonesDone: Math.round((goalProgress / 100) * 5),
      priority: goalPriority,
      colorIndex: (goalCategory === 'Academics' ? 1 : goalCategory === 'Tech' ? 2 : 3) as 1 | 2 | 3 | 4,
      description: goalDescription.trim() || undefined,
    });

    setGoalTitle('');
    setGoalDescription('');
    setGoalProgress(10);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border shadow-2xl relative theme-transition overflow-hidden animate-in zoom-in-95 duration-150"
        style={{
          backgroundColor: '#0a0a0a',
          borderColor: 'var(--accent-primary)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), var(--accent-glow)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div
          className="p-4 px-6 border-b flex items-center justify-between"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center border shrink-0"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                borderColor: 'var(--accent-primary)',
                color: 'var(--accent-primary)',
              }}
            >
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Quick Add to Workspace
              </h3>
              <p className="text-[11px] text-white/50">
                Instantly create and organize your study items
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border hover:opacity-100 opacity-60 transition-opacity text-white cursor-pointer"
            style={{ borderColor: 'var(--border-subtle)' }}
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Entity Switcher Tabs */}
        <div
          className="flex items-center p-1.5 border-b gap-1 select-none"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('task')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'task' ? 'shadow-sm font-bold' : 'opacity-60 hover:opacity-90'
            }`}
            style={{
              backgroundColor: activeTab === 'task' ? 'var(--accent-subtle)' : 'transparent',
              color: activeTab === 'task' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.7)',
              border: activeTab === 'task' ? '1px solid var(--accent-primary)' : '1px solid transparent',
            }}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>New Task</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('subject')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'subject' ? 'shadow-sm font-bold' : 'opacity-60 hover:opacity-90'
            }`}
            style={{
              backgroundColor: activeTab === 'subject' ? 'var(--accent-subtle)' : 'transparent',
              color: activeTab === 'subject' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.7)',
              border: activeTab === 'subject' ? '1px solid var(--accent-primary)' : '1px solid transparent',
            }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>New Subject</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('goal')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'goal' ? 'shadow-sm font-bold' : 'opacity-60 hover:opacity-90'
            }`}
            style={{
              backgroundColor: activeTab === 'goal' ? 'var(--accent-subtle)' : 'transparent',
              color: activeTab === 'goal' ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.7)',
              border: activeTab === 'goal' ? '1px solid var(--accent-primary)' : '1px solid transparent',
            }}
          >
            <Target className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>
        </div>

        {/* Tab 1: Quick Add Task */}
        {activeTab === 'task' && (
          <form onSubmit={handleTaskSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1.5">
                Task Title <span className="text-red-400">*</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                placeholder="e.g. Solve Physics Chapter 2 numericals & diagrams"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-current placeholder:text-white/30"
                style={{ borderColor: 'var(--border-subtle)' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1.5">
                  Priority
                </label>
                <div className="flex gap-1.5">
                  {(['High', 'Medium', 'Low'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTaskPriority(p)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        taskPriority === p ? 'bg-white/10 text-white' : 'opacity-50 hover:opacity-80 text-white/70'
                      }`}
                      style={{
                        borderColor:
                          taskPriority === p
                            ? p === 'High'
                              ? '#ef4444'
                              : p === 'Medium'
                              ? '#f59e0b'
                              : '#10b981'
                            : 'var(--border-subtle)',
                        color:
                          taskPriority === p
                            ? p === 'High'
                              ? '#ef4444'
                              : p === 'Medium'
                              ? '#f59e0b'
                              : '#10b981'
                            : 'inherit',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1.5">
                  Due Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow, Today, Oct 28"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border bg-black/40 text-white focus:outline-none placeholder:text-white/30"
                  style={{ borderColor: 'var(--border-subtle)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1.5">
                  Attach to Subject (Optional)
                </label>
                <select
                  value={taskSubjectId}
                  onChange={(e) => setTaskSubjectId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border bg-black/40 text-white focus:outline-none"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <option value="">General (No specific subject)</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1.5">
                  Category
                </label>
                <select
                  value={taskCategory}
                  onChange={(e) => setTaskCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border bg-black/40 text-white focus:outline-none"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <option value="Study">Study & Revision</option>
                  <option value="Homework">Homework & Assignment</option>
                  <option value="Exam Prep">Exam Preparation</option>
                  <option value="Project">Project & Lab Work</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!taskTitle.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer shadow-md flex items-center gap-1.5"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-contrast)',
                }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Quick Add Subject */}
        {activeTab === 'subject' && (
          <form onSubmit={handleSubjectSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1.5">
                Subject Name <span className="text-red-400">*</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                placeholder="e.g. Advanced Biology & Genetics"
                value={subjectName}
                onChange={(e) => handleSubjectNameChange(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-current placeholder:text-white/30"
                style={{ borderColor: 'var(--border-subtle)' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1.5">
                  Subject Code / Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. BIO-01, MATH-10"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border bg-black/40 text-white focus:outline-none font-mono placeholder:text-white/30"
                  style={{ borderColor: 'var(--border-subtle)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1.5">
                  Category
                </label>
                <select
                  value={subjectCategory}
                  onChange={(e) => setSubjectCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border bg-black/40 text-white focus:outline-none"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <option value="Core Science">Core Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Humanities">Humanities & Social Science</option>
                  <option value="Languages">Languages & Literature</option>
                  <option value="Computer Science">Computer Science & IT</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1.5">
                  Target Exam Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nov 15, 2026"
                  value={subjectExamDate}
                  onChange={(e) => setSubjectExamDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border bg-black/40 text-white focus:outline-none placeholder:text-white/30"
                  style={{ borderColor: 'var(--border-subtle)' }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1.5">
                  Badge Color
                </label>
                <select
                  value={subjectColorTag}
                  onChange={(e) => setSubjectColorTag(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border bg-black/40 text-white focus:outline-none"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <option value="mint">Mint Emerald</option>
                  <option value="cyan">Cyan Neon</option>
                  <option value="amber">Warm Amber</option>
                  <option value="rose">Rose Pink</option>
                  <option value="purple">Electric Violet</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1">
                Chapters / Topics (Comma separated)
              </label>
              <p className="text-[11px] text-white/40 mb-1.5">
                Leave blank to auto-create 3 standard study modules.
              </p>
              <textarea
                placeholder="e.g. Cell Structure, Mendelian Genetics, Molecular DNA, Evolution"
                value={subjectChapters}
                onChange={(e) => setSubjectChapters(e.target.value)}
                rows={2}
                className="w-full text-xs p-3 rounded-xl border bg-black/40 text-white focus:outline-none resize-none placeholder:text-white/30"
                style={{ borderColor: 'var(--border-subtle)' }}
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!subjectName.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer shadow-md flex items-center gap-1.5"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-contrast)',
                }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Create Subject</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Quick Add Goal */}
        {activeTab === 'goal' && (
          <form onSubmit={handleGoalSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1.5">
                Goal Title <span className="text-red-400">*</span>
              </label>
              <input
                ref={inputRef}
                type="text"
                placeholder="e.g. Score 95% in Final Physics & Math Exams"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                required
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border bg-black/40 text-white focus:outline-none focus:ring-1 focus:ring-current placeholder:text-white/30"
                style={{ borderColor: 'var(--border-subtle)' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1.5">
                  Category
                </label>
                <select
                  value={goalCategory}
                  onChange={(e) => setGoalCategory(e.target.value as GoalCategory)}
                  className="w-full text-xs px-3 py-2 rounded-xl border bg-black/40 text-white focus:outline-none"
                  style={{ borderColor: 'var(--border-subtle)' }}
                >
                  <option value="Academics">Academics</option>
                  <option value="Tech">Tech & Coding</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Health">Health & Fitness</option>
                  <option value="Productivity">Productivity</option>
                  <option value="Creative">Creative Arts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1.5">
                  Target Deadline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dec 20, 2026"
                  value={goalTargetDate}
                  onChange={(e) => setGoalTargetDate(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border bg-black/40 text-white focus:outline-none placeholder:text-white/30"
                  style={{ borderColor: 'var(--border-subtle)' }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-white/90">
                    Starting Progress
                  </label>
                  <span className="text-xs font-mono text-white/60">{goalProgress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={goalProgress}
                  onChange={(e) => setGoalProgress(parseInt(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/90 mb-1.5">
                  Priority
                </label>
                <div className="flex gap-1.5">
                  {(['High', 'Medium', 'Low'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setGoalPriority(p)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        goalPriority === p ? 'bg-white/10 text-white' : 'opacity-50 hover:opacity-80 text-white/70'
                      }`}
                      style={{
                        borderColor:
                          goalPriority === p
                            ? p === 'High'
                              ? '#ef4444'
                              : p === 'Medium'
                              ? '#f59e0b'
                              : '#10b981'
                            : 'var(--border-subtle)',
                        color:
                          goalPriority === p
                            ? p === 'High'
                              ? '#ef4444'
                              : p === 'Medium'
                              ? '#f59e0b'
                              : '#10b981'
                            : 'inherit',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1.5">
                Description / Success Criteria (Optional)
              </label>
              <textarea
                placeholder="Key outcomes, required chapter completion, or milestone checkpoints..."
                value={goalDescription}
                onChange={(e) => setGoalDescription(e.target.value)}
                rows={2}
                className="w-full text-xs p-3 rounded-xl border bg-black/40 text-white focus:outline-none resize-none placeholder:text-white/30"
                style={{ borderColor: 'var(--border-subtle)' }}
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!goalTitle.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer shadow-md flex items-center gap-1.5"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-contrast)',
                }}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Goal</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
