import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  ListTodo,
  Target,
  Timer,
  Settings,
  Flame,
  ArrowLeft,
  X,
  Database,
  Eye,
  CheckCircle2,
  Headphones,
  Volume2,
  VolumeX,
  Command,
} from 'lucide-react';
import { TabId, AppMode } from '../types';
import { FocusSoundType, FOCUS_SOUND_OPTIONS } from '../utils/ambientSound';

interface SidebarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  subjectsCount: number;
  tasksCount: number;
  syllabusPreparedPercent: number;
  appMode: AppMode;
  timerIsRunning?: boolean;
  timerFormatted?: string;
  onGoBack?: () => void;
  onOpenCommandPalette?: () => void;
  // Ambient Focus Sound props
  focusSoundEnabled?: boolean;
  onToggleFocusSound?: () => void;
  focusSoundType?: FocusSoundType;
  onChangeFocusSoundType?: (type: FocusSoundType) => void;
  focusSoundVolume?: number;
  onChangeFocusSoundVolume?: (volume: number) => void;
  isSoundActuallyPlaying?: boolean;
  onPreviewSound?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  mobileOpen,
  onCloseMobile,
  subjectsCount,
  tasksCount,
  syllabusPreparedPercent,
  appMode,
  timerIsRunning = false,
  timerFormatted = '',
  onGoBack,
  onOpenCommandPalette,
  focusSoundEnabled = false,
  onToggleFocusSound,
  focusSoundType = 'rain',
  onChangeFocusSoundType,
  focusSoundVolume = 0.6,
  onChangeFocusSoundVolume,
  isSoundActuallyPlaying = false,
  onPreviewSound,
}) => {
  const currentSoundOption = FOCUS_SOUND_OPTIONS.find((s) => s.id === focusSoundType) || FOCUS_SOUND_OPTIONS[0];
  const navItems: { id: TabId; label: string; icon: React.ElementType; badge?: string; isLive?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'syllabus', label: 'Syllabus Tracker', icon: BookOpen, badge: `${subjectsCount}` },
    { id: 'todos', label: 'To-Do List', icon: ListTodo, badge: `${tasksCount}` },
    { id: 'goals', label: 'Goal Milestones', icon: Target },
    {
      id: 'focus',
      label: 'Focus Timer',
      icon: Timer,
      badge: timerIsRunning ? timerFormatted : '25m',
      isLive: timerIsRunning,
    },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 flex flex-col justify-between p-5 sm:p-6 transition-all duration-300 ease-in-out border-r shrink-0 glass-sidebar ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderColor: 'var(--sidebar-border)',
          color: 'var(--sidebar-text)',
        }}
      >
        {/* Top: Header & Nav links */}
        <div className="flex flex-col gap-7">
          {/* Brand header with top-left back button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {onGoBack && (
                <button
                  onClick={onGoBack}
                  className="p-1.5 rounded-lg border hover:bg-white/10 transition-all hover:scale-105 shrink-0 flex items-center justify-center cursor-pointer shadow-xs group"
                  style={{
                    borderColor: 'var(--sidebar-border)',
                    color: 'var(--sidebar-text)',
                  }}
                  title="Go Back"
                  aria-label="Go back"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                </button>
              )}

              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-md shrink-0"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-contrast)',
                  boxShadow: 'var(--accent-glow)',
                }}
              >
                <div className="w-3 h-3 border-2 border-current rounded-xs rotate-45 transform" />
              </div>

              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight leading-tight">
                  Horizon
                </span>
                <span className="text-[10px] font-mono tracking-wider uppercase opacity-60" style={{ color: 'var(--sidebar-text-muted)' }}>
                  Syllabus OS
                </span>
              </div>
            </div>

            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Mode Badge */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-medium"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderColor: 'var(--sidebar-border)',
            }}
          >
            {appMode === 'workspace' ? (
              <>
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-white/80">LocalStorage Active</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-white/80">Preview Mode (Mock)</span>
              </>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                    isActive ? 'shadow-sm border' : 'hover:bg-white/5'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                    borderColor: isActive ? 'var(--accent-primary)' : 'transparent',
                    color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text-muted)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                      }`}
                    />
                    <span className={isActive ? 'font-bold' : 'font-medium'}>
                      {item.label}
                    </span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md tabular-data font-bold flex items-center gap-1 ${
                        item.isLive ? 'animate-pulse' : ''
                      }`}
                      style={{
                        backgroundColor: item.isLive
                          ? '#10b981'
                          : isActive
                          ? 'var(--accent-primary)'
                          : 'rgba(255,255,255,0.08)',
                        color: item.isLive
                          ? '#ffffff'
                          : isActive
                          ? 'var(--accent-contrast)'
                          : 'var(--sidebar-text-muted)',
                      }}
                    >
                      {item.isLive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Command Palette Button */}
          {onOpenCommandPalette && (
            <button
              onClick={() => {
                onOpenCommandPalette();
                onCloseMobile();
              }}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer group hover:border-white/20"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                borderColor: 'var(--sidebar-border)',
                color: 'var(--sidebar-text-muted)',
              }}
              title="Open Command Palette (⌘K or Ctrl+K)"
            >
              <div className="flex items-center gap-2.5">
                <Command className="w-3.5 h-3.5 text-white/50 group-hover:text-white transition-colors" />
                <span className="text-white/70 group-hover:text-white transition-colors">Commands</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-mono text-white/50">
                ⌘K
              </kbd>
            </button>
          )}
        </div>

        {/* Ambient Focus Sound Toggle & Soundscape Card */}
        <div
          className="p-3.5 rounded-2xl flex flex-col gap-2.5 border transition-all duration-300"
          style={{
            backgroundColor: focusSoundEnabled ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.015)',
            borderColor: focusSoundEnabled ? 'var(--accent-primary)' : 'var(--sidebar-border)',
            boxShadow: isSoundActuallyPlaying ? 'var(--accent-glow)' : 'none',
          }}
        >
          {/* Header Row: Icon, Title, Sound State, and Switch Toggle */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center border text-xs shrink-0 transition-all"
                style={{
                  backgroundColor: isSoundActuallyPlaying
                    ? 'var(--accent-subtle)'
                    : 'rgba(255, 255, 255, 0.04)',
                  borderColor: isSoundActuallyPlaying ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                  color: isSoundActuallyPlaying ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.7)',
                }}
              >
                <Headphones className={`w-4 h-4 ${isSoundActuallyPlaying ? 'animate-pulse' : ''}`} />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-tight truncate">
                    Focus Sound
                  </span>
                  {isSoundActuallyPlaying && (
                    <span className="flex items-center gap-0.5 h-2.5 shrink-0" title="Audio streaming">
                      <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-0.5 h-3.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/50 truncate">
                  {isSoundActuallyPlaying
                    ? `${currentSoundOption.emoji} Playing now`
                    : focusSoundEnabled
                    ? (timerIsRunning ? 'Starting audio...' : 'Plays when timer runs')
                    : 'Ambient noise off'}
                </span>
              </div>
            </div>

            {/* Custom Toggle Switch */}
            <button
              onClick={onToggleFocusSound}
              type="button"
              role="switch"
              aria-checked={focusSoundEnabled}
              className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              style={{
                backgroundColor: focusSoundEnabled ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.15)',
              }}
              title={focusSoundEnabled ? 'Disable Ambient Focus Sound' : 'Enable Ambient Focus Sound'}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-md ring-0 transition duration-200 ease-in-out ${
                  focusSoundEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
                style={{
                  backgroundColor: focusSoundEnabled ? 'var(--accent-contrast)' : '#ffffff',
                }}
              />
            </button>
          </div>

          {/* Sound Profile Selectors & Volume (visible when enabled) */}
          {focusSoundEnabled && (
            <div className="pt-2 border-t border-white/5 flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="grid grid-cols-2 gap-1.5">
                {FOCUS_SOUND_OPTIONS.map((opt) => {
                  const isSelected = focusSoundType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onChangeFocusSoundType && onChangeFocusSoundType(opt.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 border transition-all cursor-pointer truncate ${
                        isSelected ? 'font-bold' : 'opacity-65 hover:opacity-100'
                      }`}
                      style={{
                        backgroundColor: isSelected ? 'var(--accent-subtle)' : 'rgba(255, 255, 255, 0.03)',
                        borderColor: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)',
                        color: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.8)',
                      }}
                      title={opt.description}
                    >
                      <span className="shrink-0">{opt.emoji}</span>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Volume Slider & Test Button */}
              <div className="flex items-center justify-between gap-2 pt-1 text-[10px]">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <Volume2 className="w-3 h-3 text-white/40 shrink-0" />
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={focusSoundVolume}
                    onChange={(e) =>
                      onChangeFocusSoundVolume && onChangeFocusSoundVolume(parseFloat(e.target.value))
                    }
                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                    title={`Volume: ${Math.round(focusSoundVolume * 100)}%`}
                  />
                  <span className="font-mono text-white/50 w-6 text-right tabular-data shrink-0">
                    {Math.round(focusSoundVolume * 100)}%
                  </span>
                </div>

                {/* Instant Test / Preview button when timer is stopped */}
                {!timerIsRunning && onPreviewSound && (
                  <button
                    onClick={onPreviewSound}
                    className="px-2 py-0.5 rounded text-[10px] border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-colors cursor-pointer shrink-0"
                    title="Preview ambient sound before starting timer"
                  >
                    {isSoundActuallyPlaying ? 'Stop' : 'Test'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom card: Syllabus readiness & streak */}
        <div className="flex flex-col gap-3.5">
          <div
            className="p-3.5 rounded-2xl flex flex-col gap-2.5 border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderColor: 'var(--sidebar-border)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-semibold text-white/90">Syllabus Prep</span>
              </div>
              <span className="text-xs tabular-data font-bold" style={{ color: 'var(--accent-primary)' }}>
                {syllabusPreparedPercent}%
              </span>
            </div>

            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${syllabusPreparedPercent}%`,
                  backgroundColor: 'var(--accent-primary)',
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] px-1 opacity-60 text-white/70">
            <span>Deep Black Edition</span>
            <span className="font-mono">v3.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};
