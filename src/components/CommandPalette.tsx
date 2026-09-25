import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  Command,
  Zap,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Target,
  BookOpen,
  ListTodo,
  LayoutDashboard,
  Settings,
  Headphones,
  Palette,
  Eye,
  Database,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  CornerDownLeft,
  X,
  Coffee,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { TabId, ThemeId, AppMode, Subject, Goal, Task } from '../types';
import { THEME_OPTIONS } from '../data/mockData';
import { FocusSoundType, FOCUS_SOUND_OPTIONS } from '../utils/ambientSound';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  // Navigation
  onNavigateTab: (tab: TabId) => void;
  currentTab: TabId;
  // Timer Actions
  onStartFocusSession: (minutes?: number, goalId?: string) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  timerIsRunning: boolean;
  timerFormatted: string;
  // Modals & Views
  onOpenNewGoalModal: () => void;
  onOpenFocusScore: () => void;
  onOpenQuickAdd?: (tab?: 'task' | 'subject' | 'goal') => void;
  onOpenPlanTomorrow?: () => void;
  onOpenSyncCalendar?: () => void;
  // Ambient Sound
  focusSoundEnabled: boolean;
  onToggleFocusSound: () => void;
  focusSoundType: FocusSoundType;
  onChangeFocusSoundType: (type: FocusSoundType) => void;
  // Themes
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  // Mode
  appMode: AppMode;
  onToggleMode: (mode: AppMode) => void;
  // Content data
  subjects: Subject[];
  goals: Goal[];
  tasks: Task[];
  onSelectGoalForFocus?: (goalId: string) => void;
}

interface PaletteItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'Quick Actions' | 'Navigation' | 'Focus & Timer' | 'Themes' | 'Syllabus & Goals';
  icon: React.ElementType;
  badge?: string;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  currentTab,
  onStartFocusSession,
  onToggleTimer,
  onResetTimer,
  timerIsRunning,
  timerFormatted,
  onOpenNewGoalModal,
  onOpenFocusScore,
  onOpenQuickAdd,
  onOpenPlanTomorrow,
  onOpenSyncCalendar,
  focusSoundEnabled,
  onToggleFocusSound,
  focusSoundType,
  onChangeFocusSoundType,
  currentTheme,
  onThemeChange,
  appMode,
  onToggleMode,
  subjects,
  goals,
  tasks,
  onSelectGoalForFocus,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setActiveCategoryFilter('All');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Construct master command list
  const allCommands = useMemo<PaletteItem[]>(() => {
    const list: PaletteItem[] = [
      // 1. Quick Actions
      {
        id: 'action-start-focus',
        title: 'Start Focus Session (25 min)',
        subtitle: 'Launch a 25-minute Pomodoro sprint with ambient audio',
        category: 'Quick Actions',
        icon: Zap,
        badge: 'Recommended',
        shortcut: '↵',
        action: () => {
          onStartFocusSession(25);
          onClose();
        },
      },
      {
        id: 'action-start-deep-work',
        title: 'Deep Work Sprint (50 min)',
        subtitle: 'Extended uninterrupted concentration block',
        category: 'Quick Actions',
        icon: Timer,
        badge: '50m',
        action: () => {
          onStartFocusSession(50);
          onClose();
        },
      },
      {
        id: 'action-quick-add',
        title: 'Quick Add: Task, Subject, or Goal',
        subtitle: 'Fast creation dialog for new study tasks, subjects, or goals',
        category: 'Quick Actions',
        icon: Plus,
        shortcut: 'Q',
        badge: 'Quick Add',
        action: () => {
          if (onOpenQuickAdd) onOpenQuickAdd('task');
          onClose();
        },
      },
      {
        id: 'action-quick-add-task',
        title: 'Quick Add Task',
        subtitle: 'Create a new homework, revision, or study task',
        category: 'Quick Actions',
        icon: ListTodo,
        action: () => {
          if (onOpenQuickAdd) onOpenQuickAdd('task');
          onClose();
        },
      },
      {
        id: 'action-quick-add-subject',
        title: 'Quick Add Subject Syllabus',
        subtitle: 'Create a new subject with chapters and target exam date',
        category: 'Quick Actions',
        icon: BookOpen,
        action: () => {
          if (onOpenQuickAdd) onOpenQuickAdd('subject');
          onClose();
        },
      },
      {
        id: 'action-create-goal',
        title: 'Create New Goal Milestone',
        subtitle: 'Add a new target exam, project, or personal objective',
        category: 'Quick Actions',
        icon: Target,
        shortcut: 'G',
        action: () => {
          if (onOpenQuickAdd) {
            onOpenQuickAdd('goal');
          } else {
            onOpenNewGoalModal();
          }
          onClose();
        },
      },
      {
        id: 'action-plan-tomorrow',
        title: 'Plan Tomorrow Study Session',
        subtitle: 'Review daily digest, roll over missed tasks, and schedule focus targets',
        category: 'Quick Actions',
        icon: Calendar,
        badge: 'Daily Digest',
        action: () => {
          if (onOpenPlanTomorrow) onOpenPlanTomorrow();
          onClose();
        },
      },
      {
        id: 'action-sync-google-calendar',
        title: 'Sync Milestones to Google Calendar',
        subtitle: 'Push upcoming sprint milestones & exam deadlines via OAuth',
        category: 'Quick Actions',
        icon: Calendar,
        badge: 'Google OAuth',
        action: () => {
          if (onOpenSyncCalendar) onOpenSyncCalendar();
          onClose();
        },
      },
      {
        id: 'action-view-score',
        title: 'View 30-Day Focus Score Trajectory',
        subtitle: 'Interactive line chart of daily study consistency & flow',
        category: 'Quick Actions',
        icon: TrendingUp,
        badge: '30-Day Chart',
        action: () => {
          onOpenFocusScore();
          onClose();
        },
      },
      {
        id: 'action-toggle-timer',
        title: timerIsRunning ? `Pause Timer (${timerFormatted})` : 'Resume Focus Timer',
        subtitle: timerIsRunning ? 'Pause current sprint' : 'Continue your active timer',
        category: 'Focus & Timer',
        icon: timerIsRunning ? Pause : Play,
        badge: timerIsRunning ? 'Running' : 'Paused',
        shortcut: 'Space',
        action: () => {
          onToggleTimer();
          onClose();
        },
      },
      {
        id: 'action-reset-timer',
        title: 'Reset Timer to 25m',
        subtitle: 'Restore timer back to default focus interval',
        category: 'Focus & Timer',
        icon: RotateCcw,
        action: () => {
          onResetTimer();
          onClose();
        },
      },
      {
        id: 'action-short-break',
        title: 'Start Short Break (5 min)',
        subtitle: 'Take a quick breather before the next focus block',
        category: 'Focus & Timer',
        icon: Coffee,
        action: () => {
          onStartFocusSession(5);
          onClose();
        },
      },
      {
        id: 'nav-stopwatch',
        title: 'Open Stopwatch with Lap Timer & Audio',
        subtitle: 'Precision split timer with mechanical sound effects and goal logging',
        category: 'Focus & Timer',
        icon: Clock,
        badge: 'Stopwatch',
        action: () => {
          onNavigateTab('focus');
          onClose();
        },
      },
      {
        id: 'action-toggle-focus-sound',
        title: focusSoundEnabled ? 'Turn Off Focus Ambient Sound' : 'Enable Focus Ambient Sound',
        subtitle: `Auto-plays gentle noise (${focusSoundType}) while timer runs`,
        category: 'Focus & Timer',
        icon: Headphones,
        badge: focusSoundEnabled ? 'Active' : 'Off',
        action: () => {
          onToggleFocusSound();
          onClose();
        },
      },
      {
        id: 'action-sound-rain',
        title: 'Ambient Sound: Gentle Rain 🌧️',
        subtitle: 'Calming raindrop patter with acoustic filtering',
        category: 'Focus & Timer',
        icon: Headphones,
        badge: focusSoundType === 'rain' ? 'Selected' : undefined,
        action: () => {
          onChangeFocusSoundType('rain');
          if (!focusSoundEnabled) onToggleFocusSound();
          onClose();
        },
      },
      {
        id: 'action-sound-cafe',
        title: 'Ambient Sound: Cozy Cafe ☕',
        subtitle: 'Warm ambient room acoustics for creative focus',
        category: 'Focus & Timer',
        icon: Headphones,
        badge: focusSoundType === 'cafe' ? 'Selected' : undefined,
        action: () => {
          onChangeFocusSoundType('cafe');
          if (!focusSoundEnabled) onToggleFocusSound();
          onClose();
        },
      },
      {
        id: 'action-sound-pink',
        title: 'Ambient Sound: Pink Noise 🌊',
        subtitle: '1/f frequency balance for deep flow state',
        category: 'Focus & Timer',
        icon: Headphones,
        badge: focusSoundType === 'pink-noise' ? 'Selected' : undefined,
        action: () => {
          onChangeFocusSoundType('pink-noise');
          if (!focusSoundEnabled) onToggleFocusSound();
          onClose();
        },
      },
      {
        id: 'action-sound-breeze',
        title: 'Ambient Sound: Forest Breeze 🍃',
        subtitle: 'Gentle wind through pines with dynamic LFO filter',
        category: 'Focus & Timer',
        icon: Headphones,
        badge: focusSoundType === 'breeze' ? 'Selected' : undefined,
        action: () => {
          onChangeFocusSoundType('breeze');
          if (!focusSoundEnabled) onToggleFocusSound();
          onClose();
        },
      },

      // 2. Navigation
      {
        id: 'nav-dashboard',
        title: 'Go to Dashboard Overview',
        subtitle: 'High-level stats, sprint progress, and daily velocity',
        category: 'Navigation',
        icon: LayoutDashboard,
        badge: currentTab === 'dashboard' ? 'Current' : undefined,
        action: () => {
          onNavigateTab('dashboard');
          onClose();
        },
      },
      {
        id: 'nav-syllabus',
        title: 'Go to Syllabus Tracker',
        subtitle: 'Manage subjects, topics, and "I am prepared" progress',
        category: 'Navigation',
        icon: BookOpen,
        badge: `${subjects.length} Subjects`,
        action: () => {
          onNavigateTab('syllabus');
          onClose();
        },
      },
      {
        id: 'nav-todos',
        title: 'Go to To-Do List',
        subtitle: 'Daily study tasks, priority checklists, and due dates',
        category: 'Navigation',
        icon: ListTodo,
        badge: `${tasks.filter((t) => !t.completed).length} Pending`,
        action: () => {
          onNavigateTab('todos');
          onClose();
        },
      },
      {
        id: 'nav-goals',
        title: 'Go to Goal Milestones',
        subtitle: 'Milestone progress, target exam dates, and completion metrics',
        category: 'Navigation',
        icon: Target,
        badge: `${goals.length} Goals`,
        action: () => {
          onNavigateTab('goals');
          onClose();
        },
      },
      {
        id: 'nav-focus',
        title: 'Go to Focus Timer',
        subtitle: 'Full-screen Pomodoro sprint timer with target goal binding',
        category: 'Navigation',
        icon: Timer,
        badge: timerIsRunning ? timerFormatted : '25m',
        action: () => {
          onNavigateTab('focus');
          onClose();
        },
      },
      {
        id: 'nav-settings',
        title: 'Go to Settings & Data Management',
        subtitle: 'Theme customization, JSON backup/restore, and reset',
        category: 'Navigation',
        icon: Settings,
        action: () => {
          onNavigateTab('settings');
          onClose();
        },
      },

      // 3. Workspace Mode Toggle
      {
        id: 'action-switch-mode',
        title: appMode === 'workspace' ? 'Switch to Preview Mode (Mock Data)' : 'Switch to Main Workspace (LocalStorage)',
        subtitle: appMode === 'workspace' ? 'View sample pre-populated subjects and goals' : 'Return to your saved personal study data',
        category: 'Quick Actions',
        icon: appMode === 'workspace' ? Eye : Database,
        badge: appMode === 'workspace' ? 'Main' : 'Preview',
        action: () => {
          onToggleMode(appMode === 'workspace' ? 'preview' : 'workspace');
          onClose();
        },
      },
    ];

    // 4. Themes
    THEME_OPTIONS.forEach((t) => {
      list.push({
        id: `theme-${t.id}`,
        title: `Switch Theme to ${t.name}`,
        subtitle: t.tagline,
        category: 'Themes',
        icon: Palette,
        badge: currentTheme === t.id ? 'Active' : undefined,
        action: () => {
          onThemeChange(t.id);
          onClose();
        },
      });
    });

    // 5. Dynamic Syllabus Subjects & Topics
    subjects.forEach((subj) => {
      const preparedCount = subj.topics.filter((top) => top.isPrepared).length;
      const totalCount = subj.topics.length;
      const pct = totalCount > 0 ? Math.round((preparedCount / totalCount) * 100) : 0;

      list.push({
        id: `subject-${subj.id}`,
        title: subj.name,
        subtitle: `${pct}% prepared (${preparedCount}/${totalCount} topics) · ${subj.category}`,
        category: 'Syllabus & Goals',
        icon: BookOpen,
        badge: `${pct}%`,
        action: () => {
          onNavigateTab('syllabus');
          onClose();
        },
      });
    });

    // 6. Dynamic Goals
    goals.forEach((goal) => {
      list.push({
        id: `goal-${goal.id}`,
        title: `Goal: ${goal.title}`,
        subtitle: `${goal.progress}% progress · Due ${goal.targetDate} · ${goal.category}`,
        category: 'Syllabus & Goals',
        icon: Target,
        badge: `${goal.progress}%`,
        action: () => {
          if (onSelectGoalForFocus) {
            onSelectGoalForFocus(goal.id);
          }
          onNavigateTab('focus');
          onClose();
        },
      });
    });

    return list;
  }, [
    currentTab,
    timerIsRunning,
    timerFormatted,
    focusSoundEnabled,
    focusSoundType,
    currentTheme,
    appMode,
    subjects,
    goals,
    tasks,
    onStartFocusSession,
    onClose,
    onOpenNewGoalModal,
    onOpenFocusScore,
    onToggleTimer,
    onResetTimer,
    onToggleFocusSound,
    onChangeFocusSoundType,
    onNavigateTab,
    onToggleMode,
    onThemeChange,
    onSelectGoalForFocus,
  ]);

  // Filter items based on query & category
  const filteredItems = useMemo(() => {
    let result = allCommands;

    if (activeCategoryFilter !== 'All') {
      result = result.filter((item) => item.category === activeCategoryFilter);
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
          item.category.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allCommands, query, activeCategoryFilter]);

  // Reset index when filtered list changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems.length, query, activeCategoryFilter]);

  // Keyboard navigation inside command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const categories = ['All', 'Quick Actions', 'Navigation', 'Focus & Timer', 'Themes', 'Syllabus & Goals'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col theme-transition animate-in zoom-in-95 duration-150"
        style={{
          backgroundColor: '#0a0a0a',
          borderColor: 'var(--accent-primary)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), var(--accent-glow)',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div
          className="flex items-center px-4 py-3.5 border-b gap-3 select-none"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(255,255,255,0.02)' }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center border text-xs shrink-0"
            style={{
              backgroundColor: 'var(--accent-subtle)',
              borderColor: 'var(--accent-primary)',
              color: 'var(--accent-primary)',
            }}
          >
            <Command className="w-4 h-4" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search tab, subject, or trigger action..."
            className="flex-1 bg-transparent text-sm sm:text-base text-white focus:outline-none placeholder:text-white/40"
          />

          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-white/40 hover:text-white/80 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5 text-[11px] font-mono opacity-50 shrink-0 text-white hidden sm:flex">
            <kbd className="px-1.5 py-0.5 rounded border border-white/20 bg-white/5">ESC</kbd>
            <span>to close</span>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div
          className="flex items-center gap-1.5 px-4 py-2 border-b overflow-x-auto no-scrollbar text-xs select-none"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          {categories.map((cat) => {
            const isCatActive = activeCategoryFilter === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                  isCatActive ? 'font-bold' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: isCatActive ? 'var(--accent-subtle)' : 'transparent',
                  color: isCatActive ? 'var(--accent-primary)' : 'rgba(255,255,255,0.7)',
                  border: isCatActive ? '1px solid var(--accent-primary)' : '1px solid transparent',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-96 overflow-y-auto p-2 flex flex-col gap-1 focus:outline-none select-none"
        >
          {filteredItems.length === 0 ? (
            <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
              <Search className="w-8 h-8 opacity-30 text-white" />
              <p className="text-sm font-medium text-white/70">
                No commands matching &ldquo;<span className="text-white font-bold">{query}</span>&rdquo;
              </p>
              <p className="text-xs text-white/40">Try searching for &quot;focus&quot;, &quot;science&quot;, &quot;timer&quot;, or &quot;theme&quot;</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-100 ${
                    isSelected ? 'translate-x-1 shadow-sm' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--accent-subtle)' : 'transparent',
                    border: isSelected ? '1px solid var(--accent-primary)' : '1px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform"
                      style={{
                        backgroundColor: isSelected ? 'rgba(0,0,0,0.4)' : 'rgba(255, 255, 255, 0.04)',
                        color: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.6)',
                      }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            isSelected ? 'text-white' : 'text-white/90'
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0"
                            style={{
                              backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              borderColor: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                              color: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.7)',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.subtitle && (
                        <span className="text-[11px] text-white/50 truncate max-w-md">
                          {item.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-white/40 hidden sm:inline">
                      {item.category}
                    </span>
                    {isSelected ? (
                      <div
                        className="flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded border font-bold"
                        style={{
                          backgroundColor: 'var(--accent-primary)',
                          color: 'var(--accent-contrast)',
                          borderColor: 'var(--accent-primary)',
                        }}
                      >
                        <span>Select</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </div>
                    ) : item.shortcut ? (
                      <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-mono text-white/50">
                        {item.shortcut}
                      </kbd>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div
          className="flex items-center justify-between px-4 py-2.5 border-t text-[11px] opacity-70 select-none text-white font-mono"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-white/20 bg-white/5">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-white/20 bg-white/5">↓</kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-white/20 bg-white/5">↵</kbd>
              <span>execute</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Horizon Command Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
