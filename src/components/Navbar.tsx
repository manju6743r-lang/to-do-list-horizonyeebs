import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Palette,
  Check,
  ChevronDown,
  Menu,
  Clock as ClockIcon,
  X,
  Timer,
  ArrowLeft,
  Database,
  Eye,
  Sparkles,
  Zap,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { ThemeId, AppMode } from '../types';
import { THEME_OPTIONS } from '../data/mockData';

interface NavbarProps {
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  appMode: AppMode;
  onToggleMode: (mode: AppMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenNewGoalModal: () => void;
  onToggleMobileMenu: () => void;
  onOpenFocusTab?: () => void;
  onGoBack?: () => void;
  timerIsRunning?: boolean;
  timerFormatted?: string;
  userName?: string;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTheme,
  onThemeChange,
  appMode,
  onToggleMode,
  searchQuery,
  onSearchChange,
  onOpenNewGoalModal,
  onToggleMobileMenu,
  onOpenFocusTab,
  onGoBack,
  timerIsRunning = false,
  timerFormatted = '',
  userName = 'Alex Rivera',
  onOpenCommandPalette,
}) => {
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDateString, setCurrentDateString] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update mock clock and date every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const dateStr = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      setCurrentTime(timeStr);
      setCurrentDateString(dateStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeThemeMeta = THEME_OPTIONS.find((t) => t.id === currentTheme) || THEME_OPTIONS[0];

  return (
    <header
      className="sticky top-0 z-30 w-full px-4 sm:px-6 py-3.5 glass-panel border-b theme-transition"
      style={{
        backgroundColor: 'var(--bg-glass)',
        borderColor: 'var(--border-subtle)',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Back Button + Mobile Menu + Search Bar */}
        <div className="flex items-center gap-2.5 flex-1 max-w-sm sm:max-w-md">
          {onGoBack && (
            <button
              onClick={onGoBack}
              className="p-2 rounded-xl border hover:opacity-80 transition-all hover:scale-105 shrink-0 flex items-center justify-center cursor-pointer shadow-xs group"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
              title="Go Back"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </button>
          )}

          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl border hover:opacity-80 transition-opacity shrink-0"
            style={{
              borderColor: 'var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
            }}
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Search bar with Command Palette Quick Trigger */}
          <div
            onClick={() => onOpenCommandPalette && onOpenCommandPalette()}
            className="relative flex items-center w-full rounded-xl border px-3 py-1.5 transition-all cursor-pointer hover:border-white/30 group"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
            title="Open Command Palette (⌘K or Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 shrink-0 opacity-50 mr-2 group-hover:opacity-90 transition-opacity" />
            <span className="w-full bg-transparent text-xs opacity-60 truncate select-none">
              {searchQuery ? `Searching: "${searchQuery}"` : 'Search or type a command...'}
            </span>
            <div className="flex items-center gap-1 shrink-0 ml-1">
              <kbd
                className="px-1.5 py-0.5 text-[10px] font-mono rounded border transition-colors select-none font-bold"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'var(--text-muted)',
                }}
              >
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Center: Prominent Toggle Switch: "Preview Mode" vs "Main Workspace" */}
        <div className="flex items-center">
          <div
            className="flex items-center p-1 rounded-2xl border text-xs font-semibold select-none shadow-inner"
            style={{
              backgroundColor: '#050505',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <button
              onClick={() => onToggleMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                appMode === 'preview'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'opacity-50 hover:opacity-80 text-white'
              }`}
              title="Preview Mode: Loads sample mock syllabus & goals (resets on reload)"
            >
              <Eye className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Preview Mode</span>
              <span className="sm:hidden">Preview</span>
            </button>

            <button
              onClick={() => onToggleMode('workspace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                appMode === 'workspace'
                  ? 'shadow-sm'
                  : 'opacity-50 hover:opacity-80'
              }`}
              style={{
                backgroundColor: appMode === 'workspace' ? 'var(--accent-primary)' : 'transparent',
                color: appMode === 'workspace' ? 'var(--accent-contrast)' : '#ffffff',
                boxShadow: appMode === 'workspace' ? 'var(--accent-glow)' : 'none',
              }}
              title="Main Workspace: Saves all subjects, tasks, and 'I am prepared' ticks in LocalStorage"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Main Workspace</span>
              <span className="sm:hidden">Workspace</span>
              {appMode === 'workspace' && (
                <span className="hidden md:inline text-[10px] font-mono opacity-80 pl-0.5">
                  (LocalStorage)
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right Section: Focus timer status, Theme Switcher & Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Live mock clock */}
          <div
            className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs tabular-data font-medium select-none"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
            title="System Time"
          >
            <ClockIcon className="w-3.5 h-3.5 opacity-60" />
            <span className="font-semibold text-current">{currentTime || '10:48 AM'}</span>
          </div>

          {/* Quick Focus Timer Button */}
          {onOpenFocusTab && (
            <button
              onClick={onOpenFocusTab}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:scale-105 cursor-pointer ${
                timerIsRunning ? 'animate-pulse' : 'hover:opacity-90'
              }`}
              style={{
                backgroundColor: timerIsRunning ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                borderColor: timerIsRunning ? 'var(--accent-primary)' : 'var(--border-subtle)',
                color: 'var(--accent-primary)',
              }}
              title="Open Pomodoro Focus Timer"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Focus</span>
              {timerFormatted && <span className="tabular-data font-mono">({timerFormatted})</span>}
            </button>
          )}

          {/* Black Base Theme Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-all hover:border-white/20 cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
              aria-label="Switch visual theme"
              aria-expanded={themeDropdownOpen}
            >
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1 items-center">
                  {activeThemeMeta.dotColors.slice(1).map((color, i) => (
                    <span
                      key={i}
                      className="w-2.5 h-2.5 rounded-full border border-black/40"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="hidden md:inline-block font-bold ml-1 text-xs">
                  {activeThemeMeta.name}
                </span>
              </div>
              <ChevronDown
                className={`w-3 h-3 opacity-60 transition-transform duration-200 ${
                  themeDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {themeDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 rounded-2xl border p-2 z-50 transition-all shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                style={{
                  backgroundColor: '#0d0d0d',
                  borderColor: 'var(--border-strong)',
                  boxShadow: 'var(--shadow-dropdown)',
                }}
              >
                <div className="px-3 py-2 border-b mb-1 flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                  <div>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-white/90 block">
                      Black Base Themes
                    </span>
                    <span className="text-[10px] text-white/50">
                      Constant #080808 background with custom accents
                    </span>
                  </div>
                  <Palette className="w-3.5 h-3.5 opacity-50 text-white" />
                </div>

                <div className="flex flex-col gap-1">
                  {THEME_OPTIONS.map((option) => {
                    const isSelected = option.id === currentTheme;

                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          onThemeChange(option.id);
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                          isSelected ? 'font-semibold border' : 'hover:bg-white/5'
                        }`}
                        style={{
                          backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                          borderColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                          color: 'var(--text-primary)',
                        }}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border mt-0.5"
                          style={{
                            backgroundColor: '#050505',
                            borderColor: 'var(--border-subtle)',
                          }}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full"
                            style={{ backgroundColor: option.dotColors[1] }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold leading-tight">
                              {option.name}
                            </span>
                            {isSelected && (
                              <Check
                                className="w-3.5 h-3.5"
                                style={{ color: 'var(--accent-primary)' }}
                              />
                            )}
                          </div>
                          <p className="text-[10px] leading-snug line-clamp-1 opacity-60 mt-0.5">
                            {option.tagline}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border cursor-pointer shrink-0"
            style={{
              backgroundColor: 'var(--bg-surface-elevated)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--accent-primary)',
            }}
            title={`${userName} (Active Session)`}
          >
            AR
          </div>
        </div>
      </div>
    </header>
  );
};
