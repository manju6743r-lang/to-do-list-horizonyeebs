import React, { useState } from 'react';
import { Settings, User, Palette, Database, Trash2, Download, Upload, Check, AlertTriangle, Sparkles, Clock, Volume2 } from 'lucide-react';
import { ThemeId, AppMode } from '../types';
import { THEME_OPTIONS } from '../data/mockData';
import { playTimerTick, playStopwatchSound, TickSoundStyle } from '../utils/audio';

interface SettingsViewProps {
  currentTheme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
  userName: string;
  onUpdateUserName: (name: string) => void;
  appMode: AppMode;
  onResetWorkspace: () => void;
  onExportWorkspace: () => void;
  onImportWorkspace: (jsonStr: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentTheme,
  onThemeChange,
  userName,
  onUpdateUserName,
  appMode,
  onResetWorkspace,
  onExportWorkspace,
  onImportWorkspace,
}) => {
  const [nameInput, setNameInput] = useState(userName);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [importText, setImportText] = useState('');
  const [showImportBox, setShowImportBox] = useState(false);

  // Tick sound settings
  const [tickSoundEnabled, setTickSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('horizon_tick_sound_enabled') === 'true';
    } catch {
      return false;
    }
  });

  const [tickStyle, setTickStyle] = useState<TickSoundStyle>(() => {
    try {
      return (localStorage.getItem('horizon_tick_sound_style') as TickSoundStyle) || 'clock';
    } catch {
      return 'clock';
    }
  });

  const [tickVolume, setTickVolume] = useState<number>(() => {
    try {
      const v = localStorage.getItem('horizon_tick_sound_volume');
      return v ? parseFloat(v) : 0.3;
    } catch {
      return 0.3;
    }
  });

  const handleToggleTick = () => {
    const next = !tickSoundEnabled;
    setTickSoundEnabled(next);
    try {
      localStorage.setItem('horizon_tick_sound_enabled', String(next));
    } catch {}
    if (next) {
      playTimerTick(tickStyle, tickVolume);
    }
  };

  const handleStyleChange = (s: TickSoundStyle) => {
    setTickStyle(s);
    try {
      localStorage.setItem('horizon_tick_sound_style', s);
    } catch {}
    playTimerTick(s, tickVolume);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onUpdateUserName(nameInput.trim());
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const handleExecuteImport = () => {
    if (importText.trim()) {
      onImportWorkspace(importText.trim());
      setImportText('');
      setShowImportBox(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Workspace Settings & Storage Management
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Manage your LocalStorage persistence, export backup JSON, and select Black-Base themes
        </p>
      </div>

      <div
        className="p-6 rounded-[20px] border theme-transition space-y-6"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        {/* Profile Identity */}
        <form onSubmit={handleSave} className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/90">
            Student Profile Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                Display Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-transparent focus:outline-none focus:ring-1 focus:ring-current"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-canvas)',
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                Active Operating Mode
              </label>
              <div
                className="text-xs px-3.5 py-2.5 rounded-xl border flex items-center justify-between"
                style={{
                  borderColor: 'var(--border-subtle)',
                  backgroundColor: 'var(--bg-canvas)',
                  color: 'var(--text-primary)',
                }}
              >
                <span>{appMode === 'workspace' ? 'Main Workspace (LocalStorage Active)' : 'Preview Mode (Mock Data)'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase" style={{ backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)' }}>
                  {appMode}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-transform hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--accent-contrast)',
              }}
            >
              Save Profile
            </button>
            {savedSuccess && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Updated successfully
              </span>
            )}
          </div>
        </form>

        <hr style={{ borderColor: 'var(--border-subtle)' }} />

        {/* Timer & Stopwatch Audio Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/90">
                Timer & Stopwatch Audio
              </h3>
            </div>
            <button
              onClick={handleToggleTick}
              type="button"
              role="switch"
              aria-checked={tickSoundEnabled}
              className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              style={{
                backgroundColor: tickSoundEnabled ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.15)',
              }}
              title="Toggle Timer & Stopwatch Ticking Sound"
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-md ring-0 transition duration-200 ease-in-out ${
                  tickSoundEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
                style={{
                  backgroundColor: tickSoundEnabled ? 'var(--accent-contrast)' : '#ffffff',
                }}
              />
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Play rhythmic subtle ticks every second while the focus timer or stopwatch is running to establish mental cadence and prevent distractions.
          </p>

          {/* Sound Profile Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/70">Tick Style:</span>
              <div className="flex items-center gap-1.5">
                {(
                  [
                    { id: 'clock', label: '🕰️ Swiss Clock' },
                    { id: 'wood', label: '🪵 Woodblock' },
                    { id: 'subtle', label: '⚡ Pulse' },
                  ] as { id: TickSoundStyle; label: string }[]
                ).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStyleChange(s.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      tickStyle === s.id ? 'font-bold' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor:
                        tickStyle === s.id ? 'var(--accent-subtle)' : 'var(--bg-canvas)',
                      borderColor:
                        tickStyle === s.id ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      color:
                        tickStyle === s.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => playTimerTick(tickStyle, tickVolume)}
                className="px-3 py-1.5 rounded-xl border text-xs font-medium hover:border-white/40 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                Test Tick Sound
              </button>
              <button
                onClick={() => playStopwatchSound('lap', tickVolume)}
                className="px-3 py-1.5 rounded-xl border text-xs font-medium hover:border-white/40 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                Test Lap Sound
              </button>
            </div>
          </div>
        </div>

        <hr style={{ borderColor: 'var(--border-subtle)' }} />

        {/* LocalStorage Data Controls */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/90">
              LocalStorage Data & Backups
            </h3>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            All subjects, chapters, "I am prepared" checkboxes, and tasks in Main Workspace are preserved in your browser's persistent <code className="text-white/80 font-mono">localStorage</code>.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={onExportWorkspace}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-medium hover:opacity-80 transition-all cursor-pointer"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
              }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Workspace JSON</span>
            </button>

            <button
              onClick={() => setShowImportBox(!showImportBox)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-medium hover:opacity-80 transition-all cursor-pointer"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'var(--bg-canvas)',
                color: 'var(--text-primary)',
              }}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Workspace JSON</span>
            </button>

            {!confirmReset ? (
              <button
                onClick={() => setConfirmReset(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-medium hover:text-red-400 hover:border-red-400/40 transition-all cursor-pointer ml-auto"
                style={{
                  borderColor: 'var(--border-subtle)',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  color: '#f87171',
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset LocalStorage</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-red-400">Are you sure?</span>
                <button
                  onClick={() => {
                    onResetWorkspace();
                    setConfirmReset(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white cursor-pointer"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1.5 rounded-lg text-xs border border-white/20 text-white/70 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Import JSON Box */}
          {showImportBox && (
            <div className="p-3.5 rounded-xl border space-y-2 mt-2" style={{ backgroundColor: 'var(--bg-canvas)', borderColor: 'var(--border-subtle)' }}>
              <label className="block text-[11px] font-semibold text-white/80">
                Paste valid Workspace JSON to restore:
              </label>
              <textarea
                rows={3}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{"subjects": [...], "tasks": [...]}'
                className="w-full text-xs font-mono p-2 rounded-lg border bg-black/40 text-white/90 focus:outline-none"
                style={{ borderColor: 'var(--border-subtle)' }}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowImportBox(false)}
                  className="px-3 py-1 text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteImport}
                  disabled={!importText.trim()}
                  className="px-3.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500 text-black disabled:opacity-40 cursor-pointer"
                >
                  Load Data
                </button>
              </div>
            </div>
          )}
        </div>

        <hr style={{ borderColor: 'var(--border-subtle)' }} />

        {/* Black-Base Theme Selector */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/90">
              Black-Base Theme Aesthetics
            </h3>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Deep black background (#080808) with customized high-contrast accent glows.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = theme.id === currentTheme;

              return (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme.id)}
                  className={`p-3.5 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                    isSelected ? 'ring-2 ring-current shadow-lg' : 'hover:border-white/20'
                  }`}
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold block">{theme.name}</span>
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold" style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--accent-contrast)' }}>
                          Active
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] opacity-60 block mt-1 line-clamp-1">{theme.tagline}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                    <span className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: theme.dotColors[1] }} />
                    <span className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: theme.dotColors[2] || theme.dotColors[1] }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
