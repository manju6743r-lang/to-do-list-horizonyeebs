import { WorkspaceData, ThemeId, AppMode, Subject, Task, Goal, Milestone, FocusSession } from '../types';

export const WORKSPACE_STORAGE_KEY = 'horizon_syllabus_workspace_v2';
export const THEME_STORAGE_KEY = 'horizon_black_theme_v2';
export const MODE_STORAGE_KEY = 'horizon_app_mode_v2';

export const DEFAULT_WORKSPACE_DATA: WorkspaceData = {
  userName: 'Alex Rivera',
  lastUpdated: new Date().toISOString(),
  subjects: [
    {
      id: 'ws-subj-1',
      name: 'Class 9 Science',
      code: 'SCI-09',
      category: 'Core Science',
      targetExamDate: 'Oct 28, 2026',
      colorTag: 'mint',
      description: 'Physics, Chemistry, and Living World foundations.',
      topics: [
        { id: 'ws-t-1', subjectId: 'ws-subj-1', title: 'Matter in Our Surroundings', isPrepared: true, difficulty: 'Easy', lastRevised: 'Yesterday' },
        { id: 'ws-t-2', subjectId: 'ws-subj-1', title: 'Motion: Speed, Velocity & Equations', isPrepared: true, difficulty: 'Medium', lastRevised: 'Today' },
        { id: 'ws-t-3', subjectId: 'ws-subj-1', title: 'Force and Laws of Motion (Inertia & Momentum)', isPrepared: false, difficulty: 'Hard' },
        { id: 'ws-t-4', subjectId: 'ws-subj-1', title: 'Gravitation & Floatation', isPrepared: false, difficulty: 'Medium' },
      ],
    },
    {
      id: 'ws-subj-2',
      name: 'Mathematics',
      code: 'MATH-09',
      category: 'Mathematics',
      targetExamDate: 'Nov 05, 2026',
      colorTag: 'cyan',
      description: 'Algebra, geometry proofs, and statistics.',
      topics: [
        { id: 'ws-t-5', subjectId: 'ws-subj-2', title: 'Number Systems & Rational Numbers', isPrepared: true, difficulty: 'Easy', lastRevised: '2 days ago' },
        { id: 'ws-t-6', subjectId: 'ws-subj-2', title: 'Polynomials & Algebraic Identities', isPrepared: true, difficulty: 'Medium', lastRevised: 'Yesterday' },
        { id: 'ws-t-7', subjectId: 'ws-subj-2', title: 'Lines and Angles Theorems', isPrepared: false, difficulty: 'Hard' },
        { id: 'ws-t-8', subjectId: 'ws-subj-2', title: 'Triangles: SAS, ASA, SSS Proofs', isPrepared: false, difficulty: 'Hard' },
      ],
    },
  ],
  tasks: [
    {
      id: 'ws-task-1',
      title: 'Revise Newton 2nd Law derivation and solve 4 numericals',
      completed: false,
      dueDate: 'Today',
      priority: 'High',
      subjectName: 'Class 9 Science',
      category: 'Numericals',
    },
    {
      id: 'ws-task-2',
      title: 'Complete Polynomials exercise 2.4 questions 1-5',
      completed: true,
      dueDate: 'Today',
      priority: 'High',
      subjectName: 'Mathematics',
      category: 'Algebra',
    },
    {
      id: 'ws-task-3',
      title: 'Make flashcards for SI Units and equations of motion',
      completed: false,
      dueDate: 'Tomorrow',
      priority: 'Medium',
      subjectName: 'Class 9 Science',
      category: 'Revision',
    },
  ],
  goals: [
    {
      id: 'ws-goal-1',
      title: 'Master Science Term-1 Syllabus',
      category: 'Academics',
      progress: 50,
      targetDate: 'Oct 28, 2026',
      milestonesTotal: 4,
      milestonesDone: 2,
      description: 'Prepare all 4 chapters with 100% prepared status and self-tests.',
      priority: 'High',
      colorIndex: 1,
      focusMinutesLogged: 75,
    },
    {
      id: 'ws-goal-2',
      title: 'Score 90%+ in Math Unit Tests',
      category: 'Academics',
      progress: 50,
      targetDate: 'Nov 05, 2026',
      milestonesTotal: 4,
      milestonesDone: 2,
      description: 'Practice geometric theorem proofs and algebraic identity problems.',
      priority: 'High',
      colorIndex: 2,
      focusMinutesLogged: 120,
    },
  ],
  milestones: [
    {
      id: 'ws-ms-1',
      title: 'Derive v = u + at and s = ut + 0.5at^2',
      time: '09:00 AM',
      date: 'Today',
      category: 'Science',
      completed: true,
      priority: 'urgent',
    },
    {
      id: 'ws-ms-2',
      title: 'Solve exercise 7.1 Congruent Triangles',
      time: '04:00 PM',
      date: 'Today',
      category: 'Math',
      completed: false,
      priority: 'urgent',
    },
  ],
  focusSessions: [
    {
      id: 'ws-sess-1',
      goalId: 'ws-goal-1',
      goalTitle: 'Master Science Term-1 Syllabus',
      category: 'Science',
      durationMinutes: 25,
      timestamp: 'Today, 09:30 AM',
      mode: 'focus',
      completed: true,
      notes: 'Reviewed velocity-time graph representations',
    },
  ],
};

// Check if window.localStorage is usable
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

// Load user data from localStorage
export const loadWorkspaceData = (): WorkspaceData => {
  if (!isLocalStorageAvailable()) return DEFAULT_WORKSPACE_DATA;
  try {
    const raw = window.localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (!raw) {
      // First run: save and return default workspace data
      saveWorkspaceData(DEFAULT_WORKSPACE_DATA);
      return DEFAULT_WORKSPACE_DATA;
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_WORKSPACE_DATA,
      ...parsed,
    };
  } catch (err) {
    console.error('Failed to load workspace data from localStorage:', err);
    return DEFAULT_WORKSPACE_DATA;
  }
};

// Save user data to localStorage
export const saveWorkspaceData = (data: WorkspaceData): void => {
  if (!isLocalStorageAvailable()) return;
  try {
    const payload = {
      ...data,
      lastUpdated: new Date().toISOString(),
    };
    window.localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save workspace data to localStorage:', err);
  }
};

// Reset workspace data in localStorage
export const resetWorkspaceData = (): WorkspaceData => {
  if (isLocalStorageAvailable()) {
    try {
      window.localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    } catch (e) {
      // ignore
    }
  }
  return DEFAULT_WORKSPACE_DATA;
};

// Theme persistence
export const loadSavedTheme = (): ThemeId => {
  if (!isLocalStorageAvailable()) return 'neon-mint';
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeId;
    if (saved && ['neon-mint', 'cyberpunk', 'm-sport', 'sunset', 'monochrome'].includes(saved)) {
      return saved;
    }
  } catch (e) {}
  return 'neon-mint';
};

export const saveTheme = (theme: ThemeId): void => {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {}
};

// Mode persistence
export const loadSavedMode = (): AppMode => {
  if (!isLocalStorageAvailable()) return 'preview';
  try {
    const saved = window.localStorage.getItem(MODE_STORAGE_KEY) as AppMode;
    if (saved === 'preview' || saved === 'workspace') return saved;
  } catch (e) {}
  return 'preview'; // Default to preview mode so user sees rich layout on first visit
};

export const saveMode = (mode: AppMode): void => {
  if (!isLocalStorageAvailable()) return;
  try {
    window.localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch (e) {}
};
