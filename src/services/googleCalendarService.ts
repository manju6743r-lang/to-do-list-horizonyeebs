import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Milestone, Goal } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider with Google Calendar scopes
export const CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
];

const provider = new GoogleAuthProvider();
CALENDAR_SCOPES.forEach((scope) => {
  provider.addScope(scope);
});
// Request offline/prompt if needed
provider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory token storage (DO NOT store in localStorage/sessionStorage)
let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;

export const initCalendarAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    cachedUser = user;
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token not cached in memory
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleCalendar = async (): Promise<{
  user: User;
  accessToken: string;
}> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to retrieve access token from Google sign-in');
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Calendar sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signOutGoogleCalendar = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
};

export const getCachedCalendarToken = (): string | null => {
  return cachedAccessToken;
};

export const getCachedCalendarUser = (): User | null => {
  return cachedUser;
};

export interface CalendarEventPayload {
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{ method: 'popup' | 'email'; minutes: number }>;
  };
  colorId?: string;
}

export interface SyncResult {
  success: boolean;
  totalSynced: number;
  createdEvents: Array<{
    id: string;
    summary: string;
    htmlLink?: string;
  }>;
  errors: string[];
}

/**
 * Creates a single event on the user's primary Google Calendar
 */
export const createGoogleCalendarEvent = async (
  accessToken: string,
  event: CalendarEventPayload
): Promise<any> => {
  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message ||
        `Google Calendar API returned status ${response.status}`
    );
  }

  return response.json();
};

/**
 * Parses time string like "08:30 AM" or "04:00 PM" into Date on given date base
 */
function parseTimeToDate(timeStr: string, baseDate: Date): Date {
  const result = new Date(baseDate);
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) {
    result.setHours(9, 0, 0, 0);
    return result;
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const modifier = match[3]?.toUpperCase();

  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;

  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Converts formatted date like "Oct 24, 2026" or "Tomorrow" or "Today" to YYYY-MM-DD
 */
function parseDateToISOString(dateStr: string): string {
  const now = new Date();
  const lower = dateStr.toLowerCase().trim();

  if (lower === 'today') {
    return now.toISOString().split('T')[0];
  }

  if (lower === 'tomorrow') {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  // fallback to today
  return now.toISOString().split('T')[0];
}

/**
 * Pushes selected Upcoming Milestones (and optionally Goal Deadlines) to Google Calendar
 */
export const syncMilestonesToGoogleCalendar = async (
  accessToken: string,
  milestones: Milestone[],
  goals: Goal[] = [],
  includeGoalDeadlines: boolean = true
): Promise<SyncResult> => {
  const createdEvents: Array<{ id: string; summary: string; htmlLink?: string }> = [];
  const errors: string[] = [];

  const timeZone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles';

  // 1. Sync Timed Milestones
  for (const m of milestones) {
    try {
      const now = new Date();
      const isTomorrow = m.date.toLowerCase() === 'tomorrow';
      const eventDate = new Date(now);
      if (isTomorrow) {
        eventDate.setDate(eventDate.getDate() + 1);
      }

      const startDate = parseTimeToDate(m.time, eventDate);
      const endDate = new Date(startDate.getTime() + 45 * 60 * 1000); // 45 min duration

      const payload: CalendarEventPayload = {
        summary: `🎯 [Horizon Study] ${m.title}`,
        description: `Subject Category: ${m.category}\nScheduled Sprint Time: ${m.time}\nPriority: ${m.priority.toUpperCase()}\nStatus: ${m.completed ? 'Completed' : 'Pending'}\n\nSynced directly from Horizon Study Workspace.`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone,
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 15 },
            { method: 'popup', minutes: 60 },
          ],
        },
        // Color 2 = Sage/Green, 11 = Red for urgent
        colorId: m.priority === 'urgent' ? '11' : '2',
      };

      const result = await createGoogleCalendarEvent(accessToken, payload);
      createdEvents.push({
        id: result.id,
        summary: result.summary,
        htmlLink: result.htmlLink,
      });
    } catch (err: any) {
      console.error(`Failed to sync milestone "${m.title}":`, err);
      errors.push(`${m.title}: ${err.message || 'Unknown error'}`);
    }
  }

  // 2. Sync Goal Target Deadlines if selected
  if (includeGoalDeadlines) {
    for (const g of goals) {
      if (g.progress >= 100) continue; // Skip completed goals

      try {
        const isoDate = parseDateToISOString(g.targetDate);
        const payload: CalendarEventPayload = {
          summary: `🏆 [Exam / Goal Deadline] ${g.title}`,
          description: `Category: ${g.category}\nTarget Date: ${g.targetDate}\nCurrent Progress: ${g.progress}%\nMilestones: ${g.milestonesDone}/${g.milestonesTotal}\n${g.description || ''}\n\nManaged by Horizon Study Workspace.`,
          start: {
            date: isoDate,
          },
          end: {
            date: isoDate,
          },
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'popup', minutes: 24 * 60 }, // 1 day before
              { method: 'popup', minutes: 60 },
            ],
          },
          colorId: '9', // Blueberry/Purple
        };

        const result = await createGoogleCalendarEvent(accessToken, payload);
        createdEvents.push({
          id: result.id,
          summary: result.summary,
          htmlLink: result.htmlLink,
        });
      } catch (err: any) {
        console.error(`Failed to sync goal deadline "${g.title}":`, err);
        errors.push(`${g.title}: ${err.message || 'Unknown error'}`);
      }
    }
  }

  return {
    success: errors.length === 0,
    totalSynced: createdEvents.length,
    createdEvents,
    errors,
  };
};
