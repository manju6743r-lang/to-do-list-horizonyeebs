import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  ExternalLink,
  Target,
  AlertCircle,
  LogOut,
  RefreshCw,
  Bell,
  Check,
  CalendarDays,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { Milestone, Goal } from '../types';
import { GoogleSignInButton } from './GoogleSignInButton';
import {
  signInWithGoogleCalendar,
  signOutGoogleCalendar,
  getCachedCalendarToken,
  getCachedCalendarUser,
  syncMilestonesToGoogleCalendar,
  SyncResult,
} from '../services/googleCalendarService';
import { playChime } from '../utils/audio';

interface SyncCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestones: Milestone[];
  goals: Goal[];
  showToast: (msg: string) => void;
}

export const SyncCalendarModal: React.FC<SyncCalendarModalProps> = ({
  isOpen,
  onClose,
  milestones,
  goals,
  showToast,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(getCachedCalendarUser());
  const [token, setToken] = useState<string | null>(getCachedCalendarToken());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Selected milestones to sync (defaults to all)
  const [selectedMilestoneIds, setSelectedMilestoneIds] = useState<string[]>(() =>
    milestones.map((m) => m.id)
  );

  // Include goal deadlines
  const [includeGoalDeadlines, setIncludeGoalDeadlines] = useState(true);

  // Sync state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentUser(getCachedCalendarUser());
      setToken(getCachedCalendarToken());
      setSelectedMilestoneIds(milestones.map((m) => m.id));
      setSyncResult(null);
      setAuthError(null);
    }
  }, [isOpen, milestones]);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const res = await signInWithGoogleCalendar();
      setCurrentUser(res.user);
      setToken(res.accessToken);
      showToast(`Connected as ${res.user.email}`);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err.message || 'Failed to authenticate with Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOutGoogleCalendar();
      setCurrentUser(null);
      setToken(null);
      setSyncResult(null);
      showToast('Signed out from Google Calendar');
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  const handleToggleMilestone = (id: string) => {
    setSelectedMilestoneIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedMilestoneIds.length === milestones.length) {
      setSelectedMilestoneIds([]);
    } else {
      setSelectedMilestoneIds(milestones.map((m) => m.id));
    }
  };

  const handlePushToCalendar = async () => {
    if (!token) {
      setAuthError('Please sign in with Google to grant Calendar access');
      return;
    }

    const itemsToSync = milestones.filter((m) => selectedMilestoneIds.includes(m.id));
    if (itemsToSync.length === 0 && !includeGoalDeadlines) {
      showToast('Please select at least one milestone or goal to sync');
      return;
    }

    setIsSyncing(true);
    setAuthError(null);

    try {
      const result = await syncMilestonesToGoogleCalendar(
        token,
        itemsToSync,
        goals,
        includeGoalDeadlines
      );

      setSyncResult(result);
      if (result.totalSynced > 0) {
        playChime('start');
        showToast(
          `📅 Pushed ${result.totalSynced} items directly to your personal Google Calendar!`
        );
      } else if (result.errors.length > 0) {
        setAuthError(result.errors[0]);
      }
    } catch (err: any) {
      console.error('Calendar sync error:', err);
      setAuthError(err.message || 'Failed to sync with Google Calendar API');
    } finally {
      setIsSyncing(false);
    }
  };

  const totalItemsCount =
    selectedMilestoneIds.length + (includeGoalDeadlines ? goals.filter((g) => g.progress < 100).length : 0);

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
        {/* Top Header */}
        <div
          className="p-5 px-6 border-b flex items-center justify-between shrink-0"
          style={{
            borderColor: 'var(--border-subtle)',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0"
              style={{
                backgroundColor: 'rgba(66, 133, 244, 0.1)',
                borderColor: '#4285F4',
                color: '#4285F4',
              }}
            >
              <Calendar className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Sync to Google Calendar
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                  OAuth 2.0
                </span>
              </div>
              <p className="text-xs text-white/60">
                Push upcoming milestones & exam deadlines directly to your personal calendar
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
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Connection Status Card */}
          <div
            className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderColor: token ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-subtle)',
            }}
          >
            {token && currentUser ? (
              <div className="flex items-center gap-3 min-w-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'Google User'}
                    className="w-9 h-9 rounded-full border border-emerald-500/40 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUser.email?.[0].toUpperCase() || 'G'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">
                      {currentUser.displayName || currentUser.email}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-white/50 truncate font-mono">
                    {currentUser.email} · Calendar Connected
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs font-semibold text-white">Google Account Required</p>
                <p className="text-[11px] text-white/50">
                  Sign in with Google to grant permission to create events on your calendar.
                </p>
              </div>
            )}

            <div className="shrink-0">
              {token && currentUser ? (
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect</span>
                </button>
              ) : (
                <GoogleSignInButton
                  onClick={handleSignIn}
                  isLoading={isLoggingIn}
                  text="Connect Google Calendar"
                />
              )}
            </div>
          </div>

          {/* Auth Error Notification */}
          {authError && (
            <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{authError}</span>
            </div>
          )}

          {/* Success Banner if events synced */}
          {syncResult && (
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Successfully pushed {syncResult.totalSynced} items to Google Calendar!
                  </span>
                </div>
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-300 hover:underline flex items-center gap-1"
                >
                  <span>Open Calendar</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-[11px] text-white/70">
                Your personal Google Calendar now contains scheduled sprint time blocks and
                target exam reminders with pre-configured 15-minute popup alerts.
              </p>
            </div>
          )}

          {/* Milestones Selection Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-sky-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Upcoming Sprint Milestones ({selectedMilestoneIds.length}/{milestones.length})
                </h4>
              </div>
              <button
                onClick={handleSelectAll}
                className="text-xs font-semibold hover:underline cursor-pointer"
                style={{ color: 'var(--accent-primary)' }}
              >
                {selectedMilestoneIds.length === milestones.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {milestones.map((item) => {
                const isChecked = selectedMilestoneIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleMilestone(item.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all cursor-pointer ${
                      isChecked
                        ? 'border-sky-500/40 bg-sky-500/10 text-white'
                        : 'border-white/10 bg-white/5 opacity-60 text-white/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          isChecked ? 'bg-sky-500 border-sky-500 text-black' : 'border-white/30'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <span className="font-semibold block truncate">{item.title}</span>
                        <span className="text-[10px] text-white/50 block">
                          {item.category} · {item.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono text-white/80 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-white/40" />
                        {item.time}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          item.priority === 'urgent'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Goal Deadlines Option */}
          <div
            onClick={() => setIncludeGoalDeadlines(!includeGoalDeadlines)}
            className="p-3.5 rounded-2xl border border-white/10 bg-white/2 hover:border-white/20 transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                  includeGoalDeadlines
                    ? 'bg-purple-500 border-purple-500 text-white'
                    : 'border-white/30'
                }`}
              >
                {includeGoalDeadlines && <Check className="w-3 h-3 stroke-[3]" />}
              </div>

              <div>
                <span className="text-xs font-bold text-white block">
                  Include Active Goal & Target Exam Deadlines
                </span>
                <span className="text-[11px] text-white/50 block">
                  Sync {goals.filter((g) => g.progress < 100).length} active target goals (e.g.{' '}
                  {goals[0]?.targetDate}) as calendar reminders
                </span>
              </div>
            </div>

            <Target className="w-4 h-4 text-purple-400 shrink-0" />
          </div>

          {/* Google Calendar Features Strip */}
          <div className="p-3.5 rounded-2xl border border-white/5 bg-white/2 text-[11px] text-white/60 space-y-1.5">
            <div className="flex items-center gap-2 text-white font-semibold text-xs">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart Calendar Notification Rules</span>
            </div>
            <p>
              • Events include auto-reminders at <strong>15 minutes</strong> and{' '}
              <strong>1 hour</strong> prior to scheduled sprint times.
            </p>
            <p>• Events are prefixed with <strong>[Horizon Study]</strong> for easy search and filtering.</p>
          </div>
        </div>

        {/* Modal Footer */}
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

          {token ? (
            <button
              onClick={handlePushToCalendar}
              disabled={isSyncing || totalItemsCount === 0}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-40 cursor-pointer flex items-center gap-2"
              style={{
                backgroundColor: '#4285F4',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(66, 133, 244, 0.4)',
              }}
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing to Google Calendar...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Push {totalItemsCount} Milestones to Calendar</span>
                </>
              )}
            </button>
          ) : (
            <GoogleSignInButton
              onClick={handleSignIn}
              isLoading={isLoggingIn}
              text="Sign in to Push Milestones"
            />
          )}
        </div>
      </div>
    </div>
  );
};
