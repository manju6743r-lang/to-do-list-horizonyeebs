export type ThemeId = 'neon-mint' | 'cyberpunk' | 'm-sport' | 'sunset' | 'monochrome';

export type AppMode = 'preview' | 'workspace';

export type TabId = 'dashboard' | 'syllabus' | 'todos' | 'goals' | 'focus' | 'settings';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  tagline: string;
  dotColors: string[];
}

export type TopicDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  isPrepared: boolean; // "I am prepared" checkbox
  difficulty: TopicDifficulty;
  revisionNotes?: string;
  lastRevised?: string;
}

export interface Subject {
  id: string;
  name: string; // e.g. "Class 9 Science", "Maths: Algebra & Trigonometry"
  code: string;
  category: string;
  targetExamDate: string;
  topics: Topic[];
  colorTag: string;
  description?: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  subjectId?: string;
  subjectName?: string;
  category: string;
}

export type GoalCategory = 'Engineering' | 'Tech' | 'Health' | 'Creative' | 'Productivity' | 'Academics';

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  progress: number; // 0 - 100
  targetDate: string;
  milestonesTotal: number;
  milestonesDone: number;
  description?: string;
  priority: 'High' | 'Medium' | 'Low';
  colorIndex: 1 | 2 | 3 | 4;
  focusMinutesLogged?: number;
}

export interface Milestone {
  id: string;
  goalId?: string;
  title: string;
  time: string;
  date: string;
  category: string;
  completed: boolean;
  priority: 'urgent' | 'regular';
}

export interface FocusSession {
  id: string;
  goalId: string;
  goalTitle: string;
  category: string;
  durationMinutes: number;
  timestamp: string;
  mode: 'focus' | 'short-break' | 'long-break';
  completed: boolean;
  notes?: string;
}

export interface ActivityDataPoint {
  day: string;
  fullDay: string;
  hours: number;
  score: number;
  goalsUpdated: number;
}

export interface WorkspaceData {
  subjects: Subject[];
  tasks: Task[];
  goals: Goal[];
  milestones: Milestone[];
  focusSessions: FocusSession[];
  userName: string;
  lastUpdated: string;
}
