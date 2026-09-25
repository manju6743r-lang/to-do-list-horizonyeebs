/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { SyllabusTracker } from './components/SyllabusTracker';
import { TodoList } from './components/TodoList';
import { ActiveGoalsList } from './components/ActiveGoalsList';
import { GoalModal } from './components/GoalModal';
import { PomodoroFocus } from './components/PomodoroFocus';
import { MiniTimerWidget } from './components/MiniTimerWidget';
import { SettingsView } from './components/SettingsView';
import { ActivityChart } from './components/ActivityChart';
import { GeminiMentorChat } from './components/GeminiMentorChat';
import { FocusScoreHistoryView } from './components/FocusScoreHistoryView';
import { CommandPalette } from './components/CommandPalette';
import { QuickAddModal, QuickAddTab } from './components/QuickAddModal';
import { QuickAddFAB } from './components/QuickAddFAB';
import { DailyDigest } from './components/DailyDigest';
import { PlanTomorrowModal } from './components/PlanTomorrowModal';
import { SyncCalendarModal } from './components/SyncCalendarModal';
import { ambientSound, FocusSoundType } from './utils/ambientSound';
import {
  ThemeId,
  TabId,
  AppMode,
  Subject,
  Topic,
  Task,
  Goal,
  Milestone,
  FocusSession,
  WorkspaceData,
  TopicDifficulty,
} from './types';
import {
  MOCK_SUBJECTS,
  MOCK_TASKS,
  MOCK_GOALS,
  MOCK_MILESTONES,
  MOCK_FOCUS_SESSIONS,
} from './data/mockData';
import {
  loadWorkspaceData,
  saveWorkspaceData,
  resetWorkspaceData,
  loadSavedTheme,
  saveTheme,
  loadSavedMode,
  saveMode,
} from './utils/storage';
import {
  BookOpen,
  ListTodo,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  Database,
  Eye,
  Plus,
  ArrowUpRight,
  Timer,
  CheckSquare,
  Square,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { playChime } from './utils/audio';

export default function App() {
  // Mode: Preview vs Main Workspace (LocalStorage)
  const [appMode, setAppMode] = useState<AppMode>(() => loadSavedMode());

  // Visual Theme (Black base with accent styles)
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => loadSavedTheme());

  // Active Tab
  const [currentTab, setCurrentTab] = useState<TabId>('dashboard');
  const [navigationHistory, setNavigationHistory] = useState<TabId[]>([]);

  // Real Persistent User Data (LocalStorage)
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>(() => loadWorkspaceData());

  // Preview Mode In-Memory Data (Does not save to localStorage, resets on reload)
  const [previewSubjects, setPreviewSubjects] = useState<Subject[]>(MOCK_SUBJECTS);
  const [previewTasks, setPreviewTasks] = useState<Task[]>(MOCK_TASKS);
  const [previewGoals, setPreviewGoals] = useState<Goal[]>(MOCK_GOALS);
  const [previewMilestones, setPreviewMilestones] = useState<Milestone[]>(MOCK_MILESTONES);
  const [previewFocusSessions, setPreviewFocusSessions] = useState<FocusSession[]>(MOCK_FOCUS_SESSIONS);

  // Common UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isFocusScoreModalOpen, setIsFocusScoreModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isPlanTomorrowModalOpen, setIsPlanTomorrowModalOpen] = useState(false);
  const [isSyncCalendarModalOpen, setIsSyncCalendarModalOpen] = useState(false);
  const [quickAddInitialTab, setQuickAddInitialTab] = useState<QuickAddTab>('task');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenQuickAdd = (tab: QuickAddTab = 'task') => {
    setQuickAddInitialTab(tab);
    setIsQuickAddOpen(true);
  };

  // Global Keyboard Shortcut: CMD+K or Ctrl+K for Command Palette, and 'Q' for Quick Add
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Command Palette on Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Check if user is typing in an input or textarea
      const target = e.target as HTMLElement | null;
      const isInputActive =
        target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
          target.isContentEditable);

      // 'Q' or 'q' hotkey to open Quick Add when not in input
      if (
        (e.key === 'q' || e.key === 'Q') &&
        !isInputActive &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !isCommandPaletteOpen &&
        !isQuickAddOpen &&
        !isGoalModalOpen &&
        !isFocusScoreModalOpen
      ) {
        e.preventDefault();
        handleOpenQuickAdd('task');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, isQuickAddOpen, isGoalModalOpen, isFocusScoreModalOpen]);

  // Pomodoro Timer State
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(25 * 60);
  const [timerTotalDuration, setTimerTotalDuration] = useState<number>(25 * 60);
  const [timerIsRunning, setTimerIsRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'focus' | 'short-break' | 'long-break'>('focus');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Focus Sound State (Ambient noise: rain, cafe, pink-noise, breeze)
  const [focusSoundEnabled, setFocusSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('horizon_focus_sound_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [focusSoundType, setFocusSoundType] = useState<FocusSoundType>(() => {
    try {
      return (localStorage.getItem('horizon_focus_sound_type') as FocusSoundType) || 'rain';
    } catch {
      return 'rain';
    }
  });

  const [focusSoundVolume, setFocusSoundVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('horizon_focus_sound_volume');
      return saved ? parseFloat(saved) : 0.6;
    } catch {
      return 0.6;
    }
  });

  const [isPreviewingSound, setIsPreviewingSound] = useState<boolean>(false);

  // Ambient sound playback sync: plays while timer is running (or during manual preview)
  useEffect(() => {
    if (focusSoundEnabled && timerIsRunning) {
      ambientSound.play(focusSoundType, focusSoundVolume);
    } else if (isPreviewingSound && !timerIsRunning) {
      ambientSound.play(focusSoundType, focusSoundVolume);
    } else {
      ambientSound.stop(true);
    }
  }, [focusSoundEnabled, timerIsRunning, focusSoundType, focusSoundVolume, isPreviewingSound]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      ambientSound.stop(false);
    };
  }, []);

  const handleToggleFocusSound = () => {
    const next = !focusSoundEnabled;
    setFocusSoundEnabled(next);
    try {
      localStorage.setItem('horizon_focus_sound_enabled', String(next));
    } catch {}
    if (!next && isPreviewingSound) {
      setIsPreviewingSound(false);
    }
    showToast(next ? '🎧 Focus sound armed for timer sprints' : 'Focus sound turned off');
  };

  const handleChangeFocusSoundType = (type: FocusSoundType) => {
    setFocusSoundType(type);
    try {
      localStorage.setItem('horizon_focus_sound_type', type);
    } catch {}
    if ((focusSoundEnabled && timerIsRunning) || isPreviewingSound) {
      ambientSound.setType(type);
    }
    showToast(`Switched ambient sound to ${type === 'rain' ? 'Gentle Rain 🌧️' : type === 'cafe' ? 'Cozy Cafe ☕' : type === 'pink-noise' ? 'Pink Noise 🌊' : 'Forest Breeze 🍃'}`);
  };

  const handleChangeFocusSoundVolume = (volume: number) => {
    setFocusSoundVolume(volume);
    try {
      localStorage.setItem('horizon_focus_sound_volume', String(volume));
    } catch {}
    ambientSound.setVolume(volume);
  };

  const handleTogglePreviewSound = () => {
    setIsPreviewingSound((prev) => {
      const next = !prev;
      if (next && !focusSoundEnabled) {
        setFocusSoundEnabled(true);
      }
      return next;
    });
  };

  // Sync body theme class
  useEffect(() => {
    document.body.className = `theme-${currentTheme}`;
    saveTheme(currentTheme);
  }, [currentTheme]);

  // Sync mode changes to storage
  const handleToggleMode = (newMode: AppMode) => {
    setAppMode(newMode);
    saveMode(newMode);
    showToast(
      newMode === 'workspace'
        ? '⚡ Main Workspace Active: All changes are saved to LocalStorage'
        : '👁️ Preview Mode: Viewing rich sample data (in-memory only)'
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Tab navigation with history
  const handleSelectTab = (newTab: TabId) => {
    if (newTab !== currentTab) {
      setNavigationHistory((prev) => [...prev, currentTab]);
      setCurrentTab(newTab);
    }
  };

  const handleGoBack = () => {
    if (navigationHistory.length > 0) {
      const prevTab = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory((prev) => prev.slice(0, -1));
      setCurrentTab(prevTab);
    } else if (currentTab !== 'dashboard') {
      setCurrentTab('dashboard');
    } else {
      window.history.back();
    }
  };

  // Determine active dataset based on mode
  const activeSubjects = appMode === 'workspace' ? workspaceData.subjects : previewSubjects;
  const activeTasks = appMode === 'workspace' ? workspaceData.tasks : previewTasks;
  const activeGoals = appMode === 'workspace' ? workspaceData.goals : previewGoals;
  const activeMilestones = appMode === 'workspace' ? workspaceData.milestones : previewMilestones;
  const activeFocusSessions = appMode === 'workspace' ? workspaceData.focusSessions : previewFocusSessions;
  const activeUserName = appMode === 'workspace' ? workspaceData.userName : 'Alex Rivera';

  // Helper to commit updates to workspace (localStorage) or preview (in-memory)
  const updateSubjects = (newSubjects: Subject[]) => {
    if (appMode === 'workspace') {
      const updated = { ...workspaceData, subjects: newSubjects };
      setWorkspaceData(updated);
      saveWorkspaceData(updated);
    } else {
      setPreviewSubjects(newSubjects);
    }
  };

  const updateTasks = (newTasks: Task[]) => {
    if (appMode === 'workspace') {
      const updated = { ...workspaceData, tasks: newTasks };
      setWorkspaceData(updated);
      saveWorkspaceData(updated);
    } else {
      setPreviewTasks(newTasks);
    }
  };

  const updateGoals = (newGoals: Goal[]) => {
    if (appMode === 'workspace') {
      const updated = { ...workspaceData, goals: newGoals };
      setWorkspaceData(updated);
      saveWorkspaceData(updated);
    } else {
      setPreviewGoals(newGoals);
    }
  };

  // Syllabus: Toggle "I am prepared" checkbox
  const handleToggleTopicPrepared = (subjectId: string, topicId: string) => {
    const updated = activeSubjects.map((subj) => {
      if (subj.id === subjectId) {
        return {
          ...subj,
          topics: subj.topics.map((top) => {
            if (top.id === topicId) {
              const nextPrepared = !top.isPrepared;
              return {
                ...top,
                isPrepared: nextPrepared,
                lastRevised: nextPrepared ? 'Just now' : top.lastRevised,
              };
            }
            return top;
          }),
        };
      }
      return subj;
    });

    updateSubjects(updated);
    if (soundEnabled) playChime('break');
  };

  // Syllabus: Add Subject
  const handleAddSubject = (
    subjectData: Omit<Subject, 'id' | 'topics'>,
    initialTopicTitles?: string[]
  ) => {
    const newSubjectId = `subj-${Date.now()}`;
    const topics: Topic[] = (initialTopicTitles || []).map((t, i) => ({
      id: `top-${Date.now()}-${i}`,
      subjectId: newSubjectId,
      title: t,
      isPrepared: false,
      difficulty: 'Medium',
    }));

    const newSubject: Subject = {
      ...subjectData,
      id: newSubjectId,
      topics,
    };

    updateSubjects([newSubject, ...activeSubjects]);
    showToast(`Added subject: "${newSubject.name}"`);
  };

  // Syllabus: Delete Subject
  const handleDeleteSubject = (subjectId: string) => {
    updateSubjects(activeSubjects.filter((s) => s.id !== subjectId));
    showToast('Subject deleted');
  };

  // Syllabus: Add Topic under Subject
  const handleAddTopic = (subjectId: string, title: string, difficulty: TopicDifficulty) => {
    const updated = activeSubjects.map((subj) => {
      if (subj.id === subjectId) {
        const newTopic: Topic = {
          id: `top-${Date.now()}`,
          subjectId,
          title,
          isPrepared: false,
          difficulty,
        };
        return {
          ...subj,
          topics: [...subj.topics, newTopic],
        };
      }
      return subj;
    });

    updateSubjects(updated);
  };

  // Syllabus: Delete Topic
  const handleDeleteTopic = (subjectId: string, topicId: string) => {
    const updated = activeSubjects.map((subj) => {
      if (subj.id === subjectId) {
        return {
          ...subj,
          topics: subj.topics.filter((t) => t.id !== topicId),
        };
      }
      return subj;
    });

    updateSubjects(updated);
  };

  // Tasks: Toggle completed
  const handleToggleTask = (taskId: string) => {
    const updated = activeTasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    updateTasks(updated);
  };

  // Tasks: Add Task
  const handleAddTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    updateTasks([newTask, ...activeTasks]);
    showToast(`Added task: "${newTask.title}"`);
  };

  // Tasks: Delete Task
  const handleDeleteTask = (taskId: string) => {
    updateTasks(activeTasks.filter((t) => t.id !== taskId));
  };

  // Goal Progress handler
  const handleUpdateGoalProgress = (goalId: string, newProgress: number) => {
    const updated = activeGoals.map((g) => {
      if (g.id === goalId) {
        const clamped = Math.max(0, Math.min(100, newProgress));
        const updatedDone = Math.round((clamped / 100) * g.milestonesTotal);
        return { ...g, progress: clamped, milestonesDone: updatedDone };
      }
      return g;
    });
    updateGoals(updated);
  };

  const handleDeleteGoal = (goalId: string) => {
    updateGoals(activeGoals.filter((g) => g.id !== goalId));
  };

  const handleSaveNewGoal = (goalData: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
    };
    updateGoals([newGoal, ...activeGoals]);
    showToast(`Created goal: "${newGoal.title}"`);
  };

  // Pomodoro countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerIsRunning) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerIsRunning, timerMode, selectedGoalId, timerTotalDuration, soundEnabled]);

  const handleToggleTimer = () => {
    setTimerIsRunning((prev) => !prev);
  };

  const handleTimerComplete = () => {
    setTimerIsRunning(false);
    if (soundEnabled) playChime(timerMode === 'focus' ? 'complete' : 'break');

    if (timerMode === 'focus') {
      const dur = Math.round(timerTotalDuration / 60);
      handleSessionComplete({
        goalId: selectedGoalId || activeGoals[0]?.id || 'general',
        goalTitle: activeGoals.find((g) => g.id === selectedGoalId)?.title || 'Academic Sprint',
        category: 'Focus',
        durationMinutes: dur,
        timestamp: 'Just now',
        mode: 'focus',
        completed: true,
        notes: 'Completed sprint session',
      });
      setTimerMode('short-break');
      setTimerTotalDuration(5 * 60);
      setTimerSecondsLeft(5 * 60);
      showToast('🎉 Focus sprint finished! 5 min break started.');
    } else {
      setTimerMode('focus');
      setTimerTotalDuration(25 * 60);
      setTimerSecondsLeft(25 * 60);
      showToast('☕ Break completed! Ready for the next sprint?');
    }
  };

  const handleSessionComplete = (
    sessionData: Omit<FocusSession, 'id'>,
    boostProgress: boolean = true
  ) => {
    const newSession: FocusSession = {
      ...sessionData,
      id: `sess-${Date.now()}`,
    };

    if (appMode === 'workspace') {
      const updatedGoals = workspaceData.goals.map((g) => {
        if (g.id === sessionData.goalId) {
          const updatedMins = (g.focusMinutesLogged || 0) + sessionData.durationMinutes;
          const newProg = boostProgress ? Math.min(100, g.progress + 5) : g.progress;
          return { ...g, focusMinutesLogged: updatedMins, progress: newProg };
        }
        return g;
      });

      const updated = {
        ...workspaceData,
        focusSessions: [newSession, ...workspaceData.focusSessions],
        goals: updatedGoals,
      };
      setWorkspaceData(updated);
      saveWorkspaceData(updated);
    } else {
      setPreviewFocusSessions((prev) => [newSession, ...prev]);
    }

    showToast(`Logged +${sessionData.durationMinutes}m focus session`);
  };

  const handleResetTimer = (dur: number = 25 * 60, mode: 'focus' | 'short-break' | 'long-break' = 'focus') => {
    setTimerIsRunning(false);
    setTimerMode(mode);
    setTimerTotalDuration(dur);
    setTimerSecondsLeft(dur);
  };

  const handleStartFocusSessionForGoal = (goalId: string) => {
    setSelectedGoalId(goalId);
    handleSelectTab('focus');
    handleResetTimer(25 * 60, 'focus');
    setTimerIsRunning(true);
    if (soundEnabled) playChime('start');
  };

  // Gemini AI Mentor - Autonomous App Control Handlers
  const handleMentorChangeTheme = (theme: ThemeId) => {
    setCurrentTheme(theme);
    saveTheme(theme);
    showToast(`🎨 AI Mentor switched theme to ${theme.toUpperCase()}`);
  };

  const handleMentorCompleteTopic = (subjectQuery: string, topicQuery: string): boolean => {
    const sQuery = (subjectQuery || '').toLowerCase().trim();
    const tQuery = (topicQuery || '').toLowerCase().trim();

    let matched = false;
    let foundSubjName = '';
    let foundTopicTitle = '';

    const updated = activeSubjects.map((subj) => {
      const subjectMatches =
        !sQuery ||
        subj.name.toLowerCase().includes(sQuery) ||
        sQuery.includes(subj.name.toLowerCase());

      if (subjectMatches && !matched) {
        let topicFoundInSubj = false;
        const newTopics = subj.topics.map((top, idx) => {
          if (matched) return top;

          const titleLower = top.title.toLowerCase();
          const matchesQuery = tQuery && (titleLower.includes(tQuery) || tQuery.includes(titleLower));
          const matchesChap1 =
            (tQuery.includes('chapter 1') || tQuery.includes('ch 1') || tQuery.includes('1st chapter')) &&
            idx === 0;
          const matchesChap2 =
            (tQuery.includes('chapter 2') || tQuery.includes('ch 2') || tQuery.includes('2nd chapter')) &&
            idx === 1;

          if (matchesQuery || matchesChap1 || matchesChap2) {
            matched = true;
            topicFoundInSubj = true;
            foundSubjName = subj.name;
            foundTopicTitle = top.title;
            return {
              ...top,
              isPrepared: true,
              lastRevised: 'Just now (AI Verified)',
            };
          }
          return top;
        });

        if (topicFoundInSubj) {
          return { ...subj, topics: newTopics };
        }
      }
      return subj;
    });

    // Fallback: if not found by subject, search across all subjects for the topic
    if (!matched && tQuery) {
      for (const subj of activeSubjects) {
        for (let idx = 0; idx < subj.topics.length; idx++) {
          const top = subj.topics[idx];
          if (top.title.toLowerCase().includes(tQuery)) {
            return handleMentorCompleteTopic(subj.name, top.title);
          }
        }
      }
    }

    if (matched) {
      updateSubjects(updated);
      if (soundEnabled) playChime('complete');
      showToast(`🏆 AI Mentor marked "${foundTopicTitle}" in ${foundSubjName} as prepared!`);
      return true;
    }

    return false;
  };

  const handleMentorAddTask = (
    title: string,
    priority: 'High' | 'Medium' | 'Low' = 'High',
    dueDate: string = 'Today'
  ) => {
    handleAddTask({
      title,
      subjectId: activeSubjects[0]?.id,
      subjectName: activeSubjects[0]?.name || 'General Study',
      category: activeSubjects[0]?.category || 'Academics',
      dueDate,
      priority,
      completed: false,
    });
    showToast(`📋 AI Mentor created task: "${title}"`);
  };

  const handleMentorAddTopic = (
    subjectQuery: string,
    title: string,
    difficulty: TopicDifficulty = 'Medium'
  ): boolean => {
    const sQuery = (subjectQuery || '').toLowerCase().trim();
    const targetSubj =
      activeSubjects.find(
        (s) => s.name.toLowerCase().includes(sQuery) || sQuery.includes(s.name.toLowerCase())
      ) || activeSubjects[0];

    if (targetSubj) {
      handleAddTopic(targetSubj.id, title, difficulty);
      showToast(`📚 AI Mentor added topic "${title}" to ${targetSubj.name}`);
      return true;
    }
    return false;
  };

  const handleMentorStartFocus = (minutes: number = 25, subjectQuery?: string) => {
    if (subjectQuery) {
      const matchedGoal = activeGoals.find((g) =>
        g.title.toLowerCase().includes(subjectQuery.toLowerCase())
      );
      if (matchedGoal) {
        setSelectedGoalId(matchedGoal.id);
      }
    }
    handleSelectTab('focus');
    handleResetTimer(minutes * 60, 'focus');
    setTimerIsRunning(true);
    if (soundEnabled) playChime('start');
    showToast(`⚡ AI Mentor launched ${minutes}m Pomodoro Sprint!`);
  };

  const handleMentorSwitchTab = (tab: any) => {
    handleSelectTab(tab);
  };

  const handleMentorSwitchMode = (mode: AppMode) => {
    setAppMode(mode);
    saveMode(mode);
    showToast(`Switched to ${mode === 'workspace' ? 'Main Workspace (LocalStorage)' : 'Preview Mode'}`);
  };

  // LocalStorage Reset & Backup Handlers
  const handleResetWorkspace = () => {
    const fresh = resetWorkspaceData();
    setWorkspaceData(fresh);
    showToast('LocalStorage has been reset to clean template');
  };

  const handleExportWorkspace = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(workspaceData, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `horizon_syllabus_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Exported workspace JSON backup file');
  };

  const handleImportWorkspace = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.subjects) {
        setWorkspaceData(parsed);
        saveWorkspaceData(parsed);
        setAppMode('workspace');
        showToast('Successfully imported and restored workspace data!');
      } else {
        alert('Invalid workspace JSON schema.');
      }
    } catch (e) {
      alert('Failed to parse JSON file.');
    }
  };

  // Formatted date string
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  // Aggregate metrics
  const totalTopics = activeSubjects.reduce((acc, s) => acc + s.topics.length, 0);
  const preparedTopics = activeSubjects.reduce(
    (acc, s) => acc + s.topics.filter((t) => t.isPrepared).length,
    0
  );
  const syllabusPreparedPercent = totalTopics > 0 ? Math.round((preparedTopics / totalTopics) * 100) : 0;
  const pendingTasks = activeTasks.filter((t) => !t.completed);

  const timerMins = Math.floor(Math.max(0, timerSecondsLeft) / 60);
  const timerSecs = Math.max(0, timerSecondsLeft) % 60;
  const timerFormatted = `${timerMins.toString().padStart(2, '0')}:${timerSecs.toString().padStart(2, '0')}`;
  const currentAttachedGoal = activeGoals.find((g) => g.id === selectedGoalId);

  return (
    <div className="min-h-screen flex flex-row theme-transition relative bg-[#080808]">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        subjectsCount={activeSubjects.length}
        tasksCount={pendingTasks.length}
        syllabusPreparedPercent={syllabusPreparedPercent}
        appMode={appMode}
        timerIsRunning={timerIsRunning}
        timerFormatted={timerFormatted}
        onGoBack={handleGoBack}
        focusSoundEnabled={focusSoundEnabled}
        onToggleFocusSound={handleToggleFocusSound}
        focusSoundType={focusSoundType}
        onChangeFocusSoundType={handleChangeFocusSoundType}
        focusSoundVolume={focusSoundVolume}
        onChangeFocusSoundVolume={handleChangeFocusSoundVolume}
        isSoundActuallyPlaying={(focusSoundEnabled && timerIsRunning) || isPreviewingSound}
        onPreviewSound={handleTogglePreviewSound}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar with Mode Toggle & Theme Switcher */}
        <Navbar
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
          appMode={appMode}
          onToggleMode={handleToggleMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenNewGoalModal={() => setIsGoalModalOpen(true)}
          onToggleMobileMenu={() => setMobileSidebarOpen(true)}
          onOpenFocusTab={() => handleSelectTab('focus')}
          onGoBack={handleGoBack}
          timerIsRunning={timerIsRunning}
          timerFormatted={timerFormatted}
          userName={activeUserName}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
            <div
              className="p-3.5 px-4 rounded-2xl border shadow-2xl flex items-center gap-2.5 max-w-md theme-transition"
              style={{
                backgroundColor: 'rgba(16, 16, 16, 0.95)',
                borderColor: 'var(--accent-primary)',
                boxShadow: 'var(--accent-glow)',
                color: '#ffffff',
              }}
            >
              <Sparkles className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-primary)' }} />
              <p className="text-xs font-semibold leading-snug">{toastMessage}</p>
            </div>
          </div>
        )}

        {/* Dynamic Tab Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* TAB 1: DASHBOARD */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Hero Greeting Section */}
              <div
                className="p-6 sm:p-7 rounded-[20px] border theme-transition relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      <Calendar className="w-3.5 h-3.5 opacity-70" />
                      <span>{todayFormatted}</span>
                      <span>·</span>
                      <span
                        className="px-2 py-0.5 rounded-full font-bold uppercase text-[10px]"
                        style={{
                          backgroundColor: appMode === 'workspace' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                          color: appMode === 'workspace' ? '#10b981' : '#38bdf8',
                        }}
                      >
                        {appMode === 'workspace' ? 'LocalStorage Active' : 'Preview Mode'}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      Welcome back, {activeUserName}
                    </h1>

                    <p className="text-xs sm:text-sm mt-1 max-w-2xl text-white/70">
                      Overall syllabus readiness is at{' '}
                      <span className="font-bold text-white" style={{ color: 'var(--accent-primary)' }}>
                        {syllabusPreparedPercent}%
                      </span>
                      . You have{' '}
                      <span className="font-semibold text-white">
                        {pendingTasks.length} pending tasks
                      </span>{' '}
                      and{' '}
                      <span className="font-semibold text-white">
                        {totalTopics - preparedTopics} chapters
                      </span>{' '}
                      remaining before upcoming exams.
                    </p>
                  </div>

                  {/* Quick CTAs */}
                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                    <button
                      onClick={() => setIsFocusScoreModalOpen(true)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border shadow-sm transition-all hover:scale-105 cursor-pointer"
                      style={{
                        backgroundColor: 'var(--accent-subtle)',
                        borderColor: 'var(--accent-primary)',
                        color: 'var(--accent-primary)',
                      }}
                      title="Open 30-Day Focus Score Trajectory Line Chart"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>Focus Score (30d)</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => handleSelectTab('syllabus')}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all hover:scale-105 cursor-pointer"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: 'var(--accent-contrast)',
                      }}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Syllabus Tracker</span>
                    </button>

                    <button
                      onClick={() => handleSelectTab('todos')}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium border hover:opacity-80 transition-all cursor-pointer"
                      style={{
                        borderColor: 'var(--border-subtle)',
                        backgroundColor: 'var(--bg-canvas)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      <ListTodo className="w-3.5 h-3.5 opacity-70" />
                      <span>To-Do List</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Overview Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => handleSelectTab('syllabus')}
                  className="p-5 rounded-[20px] border theme-transition cursor-pointer hover:border-white/20 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: 'var(--card-pastel-1)',
                    borderColor: 'var(--border-subtle)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div className="flex items-center justify-between text-xs font-semibold uppercase opacity-80 mb-2">
                    <span style={{ color: 'var(--card-pastel-1-text)' }}>Syllabus Prepared</span>
                    <BookOpen className="w-4 h-4" style={{ color: 'var(--card-pastel-1-sub)' }} />
                  </div>
                  <span className="text-3xl font-extrabold tabular-data tracking-tight" style={{ color: 'var(--card-pastel-1-text)' }}>
                    {syllabusPreparedPercent}%
                  </span>
                  <div className="w-full h-1.5 rounded-full overflow-hidden mt-3 bg-black/20">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${syllabusPreparedPercent}%`, backgroundColor: 'var(--card-pastel-1-text)' }}
                    />
                  </div>
                </div>

                <div
                  onClick={() => handleSelectTab('syllabus')}
                  className="p-5 rounded-[20px] border theme-transition cursor-pointer hover:border-white/20 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: 'var(--card-pastel-2)',
                    borderColor: 'var(--border-subtle)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div className="flex items-center justify-between text-xs font-semibold uppercase opacity-80 mb-2">
                    <span style={{ color: 'var(--card-pastel-2-text)' }}>Prepared Topics</span>
                    <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--card-pastel-2-sub)' }} />
                  </div>
                  <span className="text-3xl font-extrabold tabular-data tracking-tight" style={{ color: 'var(--card-pastel-2-text)' }}>
                    {preparedTopics} / {totalTopics}
                  </span>
                  <p className="text-[11px] mt-2 opacity-70" style={{ color: 'var(--card-pastel-2-sub)' }}>
                    Marked "I am prepared"
                  </p>
                </div>

                <div
                  onClick={() => handleSelectTab('todos')}
                  className="p-5 rounded-[20px] border theme-transition cursor-pointer hover:border-white/20 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: 'var(--card-pastel-3)',
                    borderColor: 'var(--border-subtle)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div className="flex items-center justify-between text-xs font-semibold uppercase opacity-80 mb-2">
                    <span style={{ color: 'var(--card-pastel-3-text)' }}>Pending Tasks</span>
                    <ListTodo className="w-4 h-4" style={{ color: 'var(--card-pastel-3-sub)' }} />
                  </div>
                  <span className="text-3xl font-extrabold tabular-data tracking-tight" style={{ color: 'var(--card-pastel-3-text)' }}>
                    {pendingTasks.length}
                  </span>
                  <p className="text-[11px] mt-2 opacity-70" style={{ color: 'var(--card-pastel-3-sub)' }}>
                    High priority items due today
                  </p>
                </div>

                <div
                  onClick={() => setIsFocusScoreModalOpen(true)}
                  className="p-5 rounded-[20px] border theme-transition cursor-pointer hover:border-white/30 hover:-translate-y-0.5 group relative"
                  style={{
                    backgroundColor: 'var(--card-pastel-4)',
                    borderColor: 'var(--border-subtle)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                  title="Click to view 30-Day Focus Score Trajectory Line Chart"
                >
                  <div className="flex items-center justify-between text-xs font-semibold uppercase opacity-80 mb-2">
                    <span style={{ color: 'var(--card-pastel-4-text)' }}>Focus Score (30d)</span>
                    <Zap className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" style={{ color: 'var(--card-pastel-4-sub)' }} />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-extrabold tabular-data tracking-tight" style={{ color: 'var(--card-pastel-4-text)' }}>
                      {Math.min(99, Math.max(76, 82 + Math.round((activeFocusSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0) / 60) * 3)))}%
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10"
                      style={{ backgroundColor: 'rgba(0,0,0,0.25)', color: 'var(--card-pastel-4-text)' }}
                    >
                      <span>30-Day Chart</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </span>
                  </div>
                  <p className="text-[11px] mt-2 opacity-70" style={{ color: 'var(--card-pastel-4-sub)' }}>
                    {activeFocusSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0)}m logged across {activeFocusSessions.length} sessions · Click to inspect
                  </p>
                </div>
              </div>

              {/* Daily Digest Component (Today's Achievements, Missed Tasks, Upcoming Deadlines, Plan Tomorrow) */}
              <DailyDigest
                tasks={activeTasks}
                subjects={activeSubjects}
                goals={activeGoals}
                focusSessions={activeFocusSessions}
                onToggleTask={handleToggleTask}
                onUpdateTasks={updateTasks}
                onNavigateTab={handleSelectTab}
                onOpenPlanTomorrow={() => setIsPlanTomorrowModalOpen(true)}
                onOpenSyncCalendar={() => setIsSyncCalendarModalOpen(true)}
                showToast={showToast}
              />

              {/* Middle Section: Subject Readiness Progress + Priority Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Quick Subject Progress Cards (7 cols) */}
                <div
                  className="lg:col-span-7 p-6 rounded-[20px] border theme-transition flex flex-col justify-between"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                        <h3 className="text-base font-bold text-white">
                          Subject Syllabus Progress
                        </h3>
                      </div>
                      <button
                        onClick={() => handleSelectTab('syllabus')}
                        className="text-xs font-semibold flex items-center gap-1 hover:underline"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        <span>View All Chapters</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {activeSubjects.map((subj) => {
                        const total = subj.topics.length;
                        const prepared = subj.topics.filter((t) => t.isPrepared).length;
                        const pct = total > 0 ? Math.round((prepared / total) * 100) : 0;

                        return (
                          <div
                            key={subj.id}
                            className="p-4 rounded-xl border transition-all hover:border-white/20"
                            style={{
                              backgroundColor: 'var(--bg-canvas)',
                              borderColor: 'var(--border-subtle)',
                            }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="text-xs font-bold text-white block">
                                  {subj.name}
                                </span>
                                <span className="text-[11px] opacity-60 text-white/70">
                                  Exam: {subj.targetExamDate} · {subj.category}
                                </span>
                              </div>

                              <div className="text-right">
                                <span className="text-sm font-extrabold tabular-data text-white">
                                  {pct}%
                                </span>
                                <span className="text-[11px] opacity-60 block text-white/70">
                                  {prepared}/{total} chapters
                                </span>
                              </div>
                            </div>

                            <div
                              className="w-full h-2 rounded-full overflow-hidden"
                              style={{ backgroundColor: 'var(--progress-track)' }}
                            >
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: 'var(--accent-primary)',
                                  boxShadow: 'var(--accent-glow)',
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: Quick To-Do List Widget (5 cols) */}
                <div
                  className="lg:col-span-5 p-6 rounded-[20px] border theme-transition flex flex-col justify-between"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    boxShadow: 'var(--shadow-card)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <ListTodo className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                        <h3 className="text-base font-bold text-white">
                          Immediate Tasks
                        </h3>
                      </div>
                      <button
                        onClick={() => handleSelectTab('todos')}
                        className="text-xs font-semibold flex items-center gap-1 hover:underline"
                        style={{ color: 'var(--accent-primary)' }}
                      >
                        <span>Full Checklist</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {activeTasks.slice(0, 4).map((task) => (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(task.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition-all ${
                            task.completed ? 'opacity-50' : 'hover:border-white/20'
                          }`}
                          style={{
                            backgroundColor: 'var(--bg-canvas)',
                            borderColor: 'var(--border-subtle)',
                          }}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              type="button"
                              className="shrink-0 p-0.5"
                              aria-label="Toggle task"
                            >
                              {task.completed ? (
                                <CheckSquare className="w-4 h-4 fill-current" style={{ color: 'var(--accent-primary)' }} />
                              ) : (
                                <Square className="w-4 h-4 opacity-40 text-white" />
                              )}
                            </button>
                            <span className={`text-xs font-medium truncate ${task.completed ? 'line-through text-white/50' : 'text-white'}`}>
                              {task.title}
                            </span>
                          </div>

                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase shrink-0 ${
                              task.priority === 'High' ? 'text-red-400 bg-red-500/10' : 'text-amber-400 bg-amber-500/10'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/60">
                    <span>{pendingTasks.length} active tasks remaining</span>
                    <button
                      onClick={() => handleSelectTab('todos')}
                      className="font-semibold text-white/80 hover:text-white"
                    >
                      + Add Task
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Section: Weekly Focus Sprint Activity */}
              <ActivityChart onOpenFocusScoreHistory={() => setIsFocusScoreModalOpen(true)} />

              {/* Persistent Quick Add Floating Action Button on Main Dashboard */}
              <QuickAddFAB
                onOpen={handleOpenQuickAdd}
                pendingTasksCount={pendingTasks.length}
                subjectsCount={activeSubjects.length}
              />
            </div>
          )}

          {/* TAB 2: SYLLABUS TRACKER */}
          {currentTab === 'syllabus' && (
            <SyllabusTracker
              subjects={activeSubjects}
              mode={appMode}
              onToggleTopicPrepared={handleToggleTopicPrepared}
              onAddSubject={handleAddSubject}
              onDeleteSubject={handleDeleteSubject}
              onAddTopic={handleAddTopic}
              onDeleteTopic={handleDeleteTopic}
              searchQuery={searchQuery}
            />
          )}

          {/* TAB 3: TO-DO LIST */}
          {currentTab === 'todos' && (
            <TodoList
              tasks={activeTasks}
              subjects={activeSubjects}
              mode={appMode}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              searchQuery={searchQuery}
            />
          )}

          {/* TAB 4: GOAL MILESTONES */}
          {currentTab === 'goals' && (
            <ActiveGoalsList
              goals={activeGoals}
              onUpdateProgress={handleUpdateGoalProgress}
              onDeleteGoal={handleDeleteGoal}
              onOpenNewGoalModal={() => setIsGoalModalOpen(true)}
              onOpenSyncCalendar={() => setIsSyncCalendarModalOpen(true)}
              onStartFocusSession={handleStartFocusSessionForGoal}
              searchQuery={searchQuery}
            />
          )}

          {/* TAB 5: POMODORO FOCUS TIMER */}
          {currentTab === 'focus' && (
            <PomodoroFocus
              goals={activeGoals}
              selectedGoalId={selectedGoalId}
              onSelectGoalId={setSelectedGoalId}
              onSessionComplete={handleSessionComplete}
              sessions={activeFocusSessions}
              timerSecondsLeft={timerSecondsLeft}
              timerTotalDuration={timerTotalDuration}
              timerIsRunning={timerIsRunning}
              timerMode={timerMode}
              onToggleTimer={handleToggleTimer}
              onResetTimer={handleResetTimer}
              onAdjustTime={(delta) => setTimerSecondsLeft((p) => Math.max(10, p + delta))}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
            />
          )}

          {/* TAB 6: SETTINGS */}
          {currentTab === 'settings' && (
            <SettingsView
              currentTheme={currentTheme}
              onThemeChange={setCurrentTheme}
              userName={activeUserName}
              onUpdateUserName={(name) => {
                if (appMode === 'workspace') {
                  const updated = { ...workspaceData, userName: name };
                  setWorkspaceData(updated);
                  saveWorkspaceData(updated);
                }
              }}
              appMode={appMode}
              onResetWorkspace={handleResetWorkspace}
              onExportWorkspace={handleExportWorkspace}
              onImportWorkspace={handleImportWorkspace}
            />
          )}
        </main>
      </div>

      {/* Floating Mini Timer Widget when away from Focus tab */}
      {currentTab !== 'focus' && (
        <MiniTimerWidget
          timerSecondsLeft={timerSecondsLeft}
          timerTotalDuration={timerTotalDuration}
          timerIsRunning={timerIsRunning}
          timerMode={timerMode}
          attachedGoal={currentAttachedGoal}
          onToggleTimer={() => setTimerIsRunning(!timerIsRunning)}
          onOpenFocusTab={() => handleSelectTab('focus')}
          onResetTimer={() => handleResetTimer(25 * 60, 'focus')}
        />
      )}

      {/* New Goal Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        onSaveGoal={handleSaveNewGoal}
      />

      {/* 30-Day Focus Score Trajectory Line Chart Modal / Side-Drawer View */}
      <FocusScoreHistoryView
        isOpen={isFocusScoreModalOpen}
        onClose={() => setIsFocusScoreModalOpen(false)}
        focusSessions={activeFocusSessions}
        workspaceData={workspaceData}
        onStartFocusSession={(goalId) => {
          if (goalId) setSelectedGoalId(goalId);
          handleSelectTab('focus');
          handleResetTimer(25 * 60, 'focus');
          setTimerIsRunning(true);
        }}
        currentTheme={currentTheme}
      />

      {/* Floating Gemini AI Mentor Chat Widget (Deep Black Glassmorphism) */}
      <GeminiMentorChat
        userName={activeUserName}
        currentTheme={currentTheme}
        appMode={appMode}
        subjects={activeSubjects}
        pendingTasksCount={pendingTasks.length}
        onChangeTheme={handleMentorChangeTheme}
        onCompleteTopic={handleMentorCompleteTopic}
        onAddTask={handleMentorAddTask}
        onAddTopic={handleMentorAddTopic}
        onStartFocus={handleMentorStartFocus}
        onSwitchTab={handleMentorSwitchTab}
        onSwitchMode={handleMentorSwitchMode}
        onOpenFocusScoreHistory={() => setIsFocusScoreModalOpen(true)}
        onToggleFocusSound={(enabled, soundType) => {
          if (typeof enabled === 'boolean') {
            setFocusSoundEnabled(enabled);
            try { localStorage.setItem('horizon_focus_sound_enabled', String(enabled)); } catch {}
          }
          if (soundType) {
            handleChangeFocusSoundType(soundType);
          }
        }}
      />

      {/* Global Command Palette (CMD+K / Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateTab={handleSelectTab}
        currentTab={currentTab}
        onStartFocusSession={(minutes = 25, goalId) => {
          if (goalId) setSelectedGoalId(goalId);
          handleSelectTab('focus');
          handleResetTimer(minutes * 60, 'focus');
          setTimerIsRunning(true);
          if (soundEnabled) playChime('start');
        }}
        onToggleTimer={handleToggleTimer}
        onResetTimer={() => handleResetTimer(25 * 60, 'focus')}
        timerIsRunning={timerIsRunning}
        timerFormatted={timerFormatted}
        onOpenNewGoalModal={() => setIsGoalModalOpen(true)}
        onOpenFocusScore={() => setIsFocusScoreModalOpen(true)}
        onOpenQuickAdd={handleOpenQuickAdd}
        onOpenPlanTomorrow={() => setIsPlanTomorrowModalOpen(true)}
        onOpenSyncCalendar={() => setIsSyncCalendarModalOpen(true)}
        focusSoundEnabled={focusSoundEnabled}
        onToggleFocusSound={handleToggleFocusSound}
        focusSoundType={focusSoundType}
        onChangeFocusSoundType={handleChangeFocusSoundType}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
        appMode={appMode}
        onToggleMode={handleToggleMode}
        subjects={activeSubjects}
        goals={activeGoals}
        tasks={activeTasks}
        onSelectGoalForFocus={(goalId) => setSelectedGoalId(goalId)}
      />

      {/* Quick Add Modal (Task, Subject, Goal) */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        initialTab={quickAddInitialTab}
        subjects={activeSubjects}
        onAddTask={handleAddTask}
        onAddSubject={handleAddSubject}
        onAddGoal={handleSaveNewGoal}
      />

      {/* Plan Tomorrow Study Session Modal */}
      <PlanTomorrowModal
        isOpen={isPlanTomorrowModalOpen}
        onClose={() => setIsPlanTomorrowModalOpen(false)}
        tasks={activeTasks}
        subjects={activeSubjects}
        goals={activeGoals}
        onUpdateTasks={updateTasks}
        onAddTask={handleAddTask}
        showToast={showToast}
      />

      {/* Sync to Google Calendar Modal */}
      <SyncCalendarModal
        isOpen={isSyncCalendarModalOpen}
        onClose={() => setIsSyncCalendarModalOpen(false)}
        milestones={activeMilestones}
        goals={activeGoals}
        showToast={showToast}
      />
    </div>
  );
}
