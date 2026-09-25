import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Coffee,
  Brain,
  Volume2,
  VolumeX,
  Target,
  Sparkles,
  ChevronRight,
  Clock,
  Flame,
  Plus,
  ArrowRight,
  TrendingUp,
  Flag,
  Volume1,
  Sliders,
  Check,
} from 'lucide-react';
import { Goal, FocusSession } from '../types';
import {
  playChime,
  playTimerTick,
  playStopwatchSound,
  playCountdownBeep,
  TickSoundStyle,
} from '../utils/audio';

interface PomodoroFocusProps {
  goals: Goal[];
  selectedGoalId: string;
  onSelectGoalId: (goalId: string) => void;
  onSessionComplete: (session: Omit<FocusSession, 'id'>, boostProgress?: boolean) => void;
  sessions: FocusSession[];
  // For shared background timer state
  timerSecondsLeft: number;
  timerTotalDuration: number;
  timerIsRunning: boolean;
  timerMode: 'focus' | 'short-break' | 'long-break';
  onToggleTimer: () => void;
  onResetTimer: (newDuration?: number, newMode?: 'focus' | 'short-break' | 'long-break') => void;
  onAdjustTime: (secondsDelta: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

interface StopwatchLap {
  id: number;
  lapTimeMs: number;
  overallTimeMs: number;
}

export const PomodoroFocus: React.FC<PomodoroFocusProps> = ({
  goals,
  selectedGoalId,
  onSelectGoalId,
  onSessionComplete,
  sessions,
  timerSecondsLeft,
  timerTotalDuration,
  timerIsRunning,
  timerMode,
  onToggleTimer,
  onResetTimer,
  onAdjustTime,
  soundEnabled,
  onToggleSound,
}) => {
  // Mode switcher: Countdown Timer vs Stopwatch
  const [activeEngine, setActiveEngine] = useState<'timer' | 'stopwatch'>('timer');
  const [sessionNotes, setSessionNotes] = useState('');
  const [autoBoostProgress, setAutoBoostProgress] = useState(true);
  const [selectedFocusPreset, setSelectedFocusPreset] = useState<number>(25);
  const [isSoundDrawerOpen, setIsSoundDrawerOpen] = useState(false);

  // Ticking Sound Settings (persisted in localStorage)
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

  // Stopwatch State
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchElapsedMs, setStopwatchElapsedMs] = useState(0);
  const [stopwatchLaps, setStopwatchLaps] = useState<StopwatchLap[]>([]);
  const stopwatchStartTimeRef = useRef<number>(0);
  const stopwatchAccumulatedRef = useRef<number>(0);
  const stopwatchIntervalRef = useRef<any>(null);
  const lastStopwatchSecRef = useRef<number>(0);

  const selectedGoal = goals.find((g) => g.id === selectedGoalId) || goals[0];

  // Calculate SVG circular stroke progress for countdown
  const progressRatio =
    timerTotalDuration > 0
      ? (timerTotalDuration - timerSecondsLeft) / timerTotalDuration
      : 0;

  // Format MM:SS for countdown timer
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format stopwatch milliseconds
  const formatStopwatch = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const hundredths = Math.floor((ms % 1000) / 10);
    if (hours > 0) {
      return {
        main: `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
        ms: hundredths.toString().padStart(2, '0'),
      };
    }
    return {
      main: `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      ms: hundredths.toString().padStart(2, '0'),
    };
  };

  // Switch timer presets
  const handleSelectMode = (mode: 'focus' | 'short-break' | 'long-break', minutes: number) => {
    onResetTimer(minutes * 60, mode);
  };

  // Handle manual countdown session completion & logging
  const handleLogManualSession = () => {
    if (!selectedGoal) return;
    const completedMinutes = Math.max(
      1,
      Math.round((timerTotalDuration - timerSecondsLeft) / 60) || Math.round(timerTotalDuration / 60)
    );

    if (soundEnabled) playChime(timerMode === 'focus' ? 'complete' : 'break');

    onSessionComplete(
      {
        goalId: selectedGoal.id,
        goalTitle: selectedGoal.title,
        category: selectedGoal.category,
        durationMinutes: completedMinutes,
        timestamp: 'Just now',
        mode: timerMode,
        completed: true,
        notes: sessionNotes.trim() || undefined,
      },
      timerMode === 'focus' ? autoBoostProgress : false
    );

    setSessionNotes('');
    onResetTimer(selectedFocusPreset * 60, 'focus');
  };

  // Stopwatch controls with sounds
  const handleStartStopwatch = () => {
    if (!stopwatchRunning) {
      playStopwatchSound('start', tickVolume);
      setStopwatchRunning(true);
      stopwatchStartTimeRef.current = Date.now();
      stopwatchIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const currentElapsed = stopwatchAccumulatedRef.current + (now - stopwatchStartTimeRef.current);
        setStopwatchElapsedMs(currentElapsed);
      }, 30);
    }
  };

  const handlePauseStopwatch = () => {
    if (stopwatchRunning) {
      playStopwatchSound('pause', tickVolume);
      setStopwatchRunning(false);
      stopwatchAccumulatedRef.current += Date.now() - stopwatchStartTimeRef.current;
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    }
  };

  const handleResetStopwatch = () => {
    playStopwatchSound('reset', tickVolume);
    setStopwatchRunning(false);
    if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    stopwatchAccumulatedRef.current = 0;
    setStopwatchElapsedMs(0);
    setStopwatchLaps([]);
  };

  const handleRecordLap = () => {
    if (stopwatchElapsedMs === 0) return;
    playStopwatchSound('lap', tickVolume);
    const lastLapOverall = stopwatchLaps.length > 0 ? stopwatchLaps[0].overallTimeMs : 0;
    const lapDuration = stopwatchElapsedMs - lastLapOverall;
    const newLap: StopwatchLap = {
      id: stopwatchLaps.length + 1,
      lapTimeMs: lapDuration,
      overallTimeMs: stopwatchElapsedMs,
    };
    setStopwatchLaps((prev) => [newLap, ...prev]);
  };

  const handleLogStopwatchSession = () => {
    if (!selectedGoal || stopwatchElapsedMs < 1000) return;
    const completedMinutes = Math.max(1, Math.round(stopwatchElapsedMs / 60000));
    if (soundEnabled) playChime('complete');
    const timeFormatted = formatStopwatch(stopwatchElapsedMs);
    onSessionComplete(
      {
        goalId: selectedGoal.id,
        goalTitle: selectedGoal.title,
        category: selectedGoal.category,
        durationMinutes: completedMinutes,
        timestamp: 'Just now',
        mode: 'focus',
        completed: true,
        notes: `Stopwatch session (${timeFormatted.main}.${timeFormatted.ms}) ${
          sessionNotes.trim() ? '· ' + sessionNotes.trim() : ''
        }`,
      },
      autoBoostProgress
    );
    handleResetStopwatch();
  };

  // Keyboard shortcut: Space toggles active timer or stopwatch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (activeEngine === 'timer') {
          onToggleTimer();
        } else {
          if (stopwatchRunning) {
            handlePauseStopwatch();
          } else {
            handleStartStopwatch();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeEngine, onToggleTimer, stopwatchRunning]);

  // Audio: Countdown Timer Ticking effect
  useEffect(() => {
    if (!timerIsRunning || !tickSoundEnabled || activeEngine !== 'timer') return;
    playTimerTick(tickStyle, tickVolume);
  }, [timerSecondsLeft, timerIsRunning, tickSoundEnabled, tickStyle, tickVolume, activeEngine]);

  // Audio: Countdown Warning Beeps (3, 2, 1)
  useEffect(() => {
    if (timerIsRunning && soundEnabled && activeEngine === 'timer') {
      if (timerSecondsLeft === 3 || timerSecondsLeft === 2 || timerSecondsLeft === 1) {
        playCountdownBeep(false, tickVolume);
      }
    }
  }, [timerSecondsLeft, timerIsRunning, soundEnabled, activeEngine, tickVolume]);

  // Audio: Stopwatch Ticking effect (once every second)
  useEffect(() => {
    if (!stopwatchRunning || !tickSoundEnabled || activeEngine !== 'stopwatch') return;
    const currentSec = Math.floor(stopwatchElapsedMs / 1000);
    if (currentSec !== lastStopwatchSecRef.current && currentSec > 0) {
      lastStopwatchSecRef.current = currentSec;
      playTimerTick(tickStyle, tickVolume);
    }
  }, [stopwatchElapsedMs, stopwatchRunning, tickSoundEnabled, tickStyle, tickVolume, activeEngine]);

  // Cleanup stopwatch interval on unmount
  useEffect(() => {
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    };
  }, []);

  const handleToggleTickSound = () => {
    const next = !tickSoundEnabled;
    setTickSoundEnabled(next);
    try {
      localStorage.setItem('horizon_tick_sound_enabled', String(next));
    } catch {}
    if (next) {
      playTimerTick(tickStyle, tickVolume);
    }
  };

  const handleChangeTickStyle = (style: TickSoundStyle) => {
    setTickStyle(style);
    try {
      localStorage.setItem('horizon_tick_sound_style', style);
    } catch {}
    playTimerTick(style, tickVolume);
  };

  const handleChangeTickVolume = (vol: number) => {
    setTickVolume(vol);
    try {
      localStorage.setItem('horizon_tick_sound_volume', String(vol));
    } catch {}
  };

  // Best & slowest lap calculations
  const minLapTime =
    stopwatchLaps.length > 1 ? Math.min(...stopwatchLaps.map((l) => l.lapTimeMs)) : -1;
  const maxLapTime =
    stopwatchLaps.length > 1 ? Math.max(...stopwatchLaps.map((l) => l.lapTimeMs)) : -1;

  // SVG dimensions for Countdown
  const size = 260;
  const strokeWidth = 10;
  const center = size / 2;
  const radius = center - strokeWidth - 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Filter sessions for selected goal vs all
  const goalSessions = sessions.filter((s) => s.goalId === selectedGoal?.id);
  const totalMinutesThisGoal =
    goalSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0) +
    (selectedGoal?.focusMinutesLogged || 0);

  const swFormatted = formatStopwatch(stopwatchElapsedMs);

  return (
    <div className="space-y-6">
      {/* Top Banner: Engine Switcher (Countdown Timer vs Stopwatch) & Sound Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Focus Time Engine
            </h2>
            <div
              className="flex items-center p-1 rounded-xl border text-xs font-semibold select-none"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <button
                onClick={() => setActiveEngine('timer')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeEngine === 'timer'
                    ? 'shadow-sm font-bold'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: activeEngine === 'timer' ? 'var(--accent-primary)' : 'transparent',
                  color: activeEngine === 'timer' ? 'var(--accent-contrast)' : 'var(--text-secondary)',
                }}
              >
                <Timer className="w-3.5 h-3.5" />
                <span>Timer</span>
              </button>

              <button
                onClick={() => setActiveEngine('stopwatch')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeEngine === 'stopwatch'
                    ? 'shadow-sm font-bold'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor:
                    activeEngine === 'stopwatch' ? 'var(--accent-primary)' : 'transparent',
                  color:
                    activeEngine === 'stopwatch'
                      ? 'var(--accent-contrast)'
                      : 'var(--text-secondary)',
                }}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Stopwatch</span>
                {stopwatchRunning && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            </div>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {activeEngine === 'timer'
              ? 'Pomodoro sprints with goal attribution and completion chime alarms'
              : 'Precision millisecond stopwatch with split lap recording and stopwatch sound effects'}
          </p>
        </div>

        {/* Sound Controls Header Bar */}
        <div className="flex items-center gap-2">
          {/* Ticking Sound Quick Toggle */}
          <button
            onClick={handleToggleTickSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
              tickSoundEnabled ? 'font-bold' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: tickSoundEnabled ? 'var(--accent-subtle)' : 'var(--bg-surface)',
              borderColor: tickSoundEnabled ? 'var(--accent-primary)' : 'var(--border-subtle)',
              color: tickSoundEnabled ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
            title={tickSoundEnabled ? 'Ticking sound active' : 'Enable ticking sound'}
          >
            <Clock className={`w-3.5 h-3.5 ${tickSoundEnabled && (timerIsRunning || stopwatchRunning) ? 'animate-spin' : ''}`} />
            <span>Tick: {tickSoundEnabled ? 'ON' : 'OFF'}</span>
          </button>

          {/* Chime Alarm Toggle */}
          <button
            onClick={onToggleSound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium hover:opacity-80 transition-all cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              color: soundEnabled ? 'var(--accent-primary)' : 'var(--text-muted)',
            }}
            title={soundEnabled ? 'Chimes enabled' : 'Chimes muted'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
          </button>

          {/* Expand Sound Settings Drawer Button */}
          <button
            onClick={() => setIsSoundDrawerOpen(!isSoundDrawerOpen)}
            className="p-1.5 rounded-xl border hover:opacity-80 transition-all cursor-pointer"
            style={{
              backgroundColor: isSoundDrawerOpen ? 'var(--accent-subtle)' : 'var(--bg-surface)',
              borderColor: isSoundDrawerOpen ? 'var(--accent-primary)' : 'var(--border-subtle)',
              color: isSoundDrawerOpen ? 'var(--accent-primary)' : 'var(--text-secondary)',
            }}
            title="Configure Ticking & Stopwatch Sounds"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Sound Customizer Bar */}
      {isSoundDrawerOpen && (
        <div
          className="p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <span className="text-xs font-semibold text-white/80 flex items-center gap-1.5">
              <span>Sound Style:</span>
            </span>

            {/* Sound Style Pills */}
            <div className="flex items-center gap-1.5">
              {(
                [
                  { id: 'clock', label: '🕰️ Clock Tick' },
                  { id: 'wood', label: '🪵 Woodblock' },
                  { id: 'subtle', label: '⚡ Subtle Pulse' },
                ] as { id: TickSoundStyle; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleChangeTickStyle(opt.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    tickStyle === opt.id ? 'font-bold' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor:
                      tickStyle === opt.id ? 'var(--accent-subtle)' : 'rgba(255, 255, 255, 0.02)',
                    borderColor:
                      tickStyle === opt.id ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    color:
                      tickStyle === opt.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Volume Slider & Test Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2">
              <Volume1 className="w-3.5 h-3.5 text-white/50" />
              <input
                type="range"
                min="0.05"
                max="1"
                step="0.05"
                value={tickVolume}
                onChange={(e) => handleChangeTickVolume(parseFloat(e.target.value))}
                className="w-24 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white"
                title={`Tick Volume: ${Math.round(tickVolume * 100)}%`}
              />
              <span className="text-xs font-mono text-white/50 tabular-data w-8">
                {Math.round(tickVolume * 100)}%
              </span>
            </div>

            <button
              onClick={() => playTimerTick(tickStyle, tickVolume)}
              className="px-2.5 py-1 rounded-lg border text-xs font-medium hover:border-white/40 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="Test current tick sound"
            >
              Test Tick
            </button>
          </div>
        </div>
      )}

      {/* Main Focus Layout: Left Column (Timer or Stopwatch), Right Column (Goal Attacher) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 7 cols */}
        <div
          className="lg:col-span-7 p-6 sm:p-8 rounded-[20px] border theme-transition flex flex-col items-center justify-between relative overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* ==================================================== */}
          {/* 1. COUNTDOWN TIMER VIEW */}
          {/* ==================================================== */}
          {activeEngine === 'timer' && (
            <div className="w-full flex flex-col items-center">
              {/* Mode Pill Switcher */}
              <div
                className="flex items-center p-1 rounded-2xl border text-xs mb-6 w-full max-w-sm justify-between select-none"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <button
                  onClick={() => {
                    setSelectedFocusPreset(25);
                    handleSelectMode('focus', 25);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-xl font-semibold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    timerMode === 'focus' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: timerMode === 'focus' ? 'var(--bg-surface)' : 'transparent',
                    color: timerMode === 'focus' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  }}
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Focus (25m)</span>
                </button>

                <button
                  onClick={() => handleSelectMode('short-break', 5)}
                  className={`flex-1 py-1.5 px-3 rounded-xl font-semibold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    timerMode === 'short-break' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: timerMode === 'short-break' ? 'var(--bg-surface)' : 'transparent',
                    color: timerMode === 'short-break' ? '#10b981' : 'var(--text-secondary)',
                  }}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Short (5m)</span>
                </button>

                <button
                  onClick={() => handleSelectMode('long-break', 15)}
                  className={`flex-1 py-1.5 px-3 rounded-xl font-semibold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                    timerMode === 'long-break' ? 'shadow-sm' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: timerMode === 'long-break' ? 'var(--bg-surface)' : 'transparent',
                    color: timerMode === 'long-break' ? '#3b82f6' : 'var(--text-secondary)',
                  }}
                >
                  <Coffee className="w-3.5 h-3.5" />
                  <span>Long (15m)</span>
                </button>
              </div>

              {/* Quick Focus duration presets */}
              {timerMode === 'focus' && (
                <div className="flex items-center gap-2 mb-4 select-none">
                  <span className="text-[11px] opacity-60" style={{ color: 'var(--text-muted)' }}>
                    Presets:
                  </span>
                  {[15, 25, 45, 50].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => {
                        setSelectedFocusPreset(mins);
                        handleSelectMode('focus', mins);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-lg border tabular-data font-medium transition-all cursor-pointer ${
                        selectedFocusPreset === mins &&
                        Math.round(timerTotalDuration / 60) === mins
                          ? 'font-bold shadow-sm'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{
                        borderColor: 'var(--border-subtle)',
                        backgroundColor:
                          selectedFocusPreset === mins &&
                          Math.round(timerTotalDuration / 60) === mins
                            ? 'var(--accent-primary)'
                            : 'var(--bg-canvas)',
                        color:
                          selectedFocusPreset === mins &&
                          Math.round(timerTotalDuration / 60) === mins
                            ? 'var(--accent-contrast)'
                            : 'var(--text-secondary)',
                      }}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              )}

              {/* Radial Circular SVG Timer */}
              <div className="relative my-4 flex items-center justify-center select-none">
                <svg width={size} height={size} className="transform -rotate-90">
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="opacity-15"
                    style={{ color: 'var(--progress-track)' }}
                  />
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-linear"
                    style={{
                      color:
                        timerMode === 'focus'
                          ? 'var(--accent-primary)'
                          : timerMode === 'short-break'
                          ? '#10b981'
                          : '#3b82f6',
                      filter: timerIsRunning ? 'drop-shadow(0 0 12px currentColor)' : 'none',
                    }}
                  />
                </svg>

                {/* Inner Time Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span
                    className="text-5xl sm:text-6xl font-extrabold tracking-tight tabular-data"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatTime(timerSecondsLeft)}
                  </span>
                  <span
                    className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-70 flex items-center gap-1.5"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span>{timerMode === 'focus' ? 'Focus Sprint' : 'Break Time'}</span>
                    {tickSoundEnabled && timerIsRunning && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </span>

                  {selectedGoal && timerMode === 'focus' && (
                    <div
                      className="mt-2 text-[11px] font-medium px-2.5 py-0.5 rounded-full border max-w-[160px] truncate"
                      style={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-muted)',
                      }}
                      title={selectedGoal.title}
                    >
                      🎯 {selectedGoal.title}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Fine-Tuning (+/- 1m, 5m) */}
              <div className="flex items-center gap-2 my-2 text-xs select-none">
                <button
                  onClick={() => onAdjustTime(-60)}
                  className="px-2 py-1 rounded-lg border hover:opacity-80 transition-opacity tabular-data cursor-pointer"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                  title="Subtract 1 minute"
                >
                  -1m
                </button>
                <button
                  onClick={() => onAdjustTime(60)}
                  className="px-2 py-1 rounded-lg border hover:opacity-80 transition-opacity tabular-data cursor-pointer"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                  title="Add 1 minute"
                >
                  +1m
                </button>
                <button
                  onClick={() => onAdjustTime(300)}
                  className="px-2 py-1 rounded-lg border hover:opacity-80 transition-opacity tabular-data cursor-pointer"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                  title="Add 5 minutes"
                >
                  +5m
                </button>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex items-center gap-4 mt-4 w-full max-w-xs justify-center">
                {/* Reset Button */}
                <button
                  onClick={() => onResetTimer(selectedFocusPreset * 60, timerMode)}
                  className="p-3 rounded-2xl border hover:opacity-80 transition-all hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                  title="Reset Timer"
                  aria-label="Reset timer"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* Play/Pause Button */}
                <button
                  onClick={onToggleTimer}
                  className="flex-1 py-3 px-6 rounded-2xl font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--accent-contrast)',
                  }}
                  aria-label={timerIsRunning ? 'Pause timer' : 'Start timer'}
                >
                  {timerIsRunning ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                      <span>{timerSecondsLeft < timerTotalDuration ? 'Resume' : 'Start Focus'}</span>
                    </>
                  )}
                </button>

                {/* Log / Finish Session Button */}
                <button
                  onClick={handleLogManualSession}
                  className="p-3 rounded-2xl border hover:opacity-80 transition-all hover:scale-105 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                  title="Complete & Log Session to Goal"
                  aria-label="Complete and log session"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </button>
              </div>

              <p className="text-[11px] opacity-60 mt-4 tabular-data" style={{ color: 'var(--text-muted)' }}>
                Press <kbd className="px-1.5 py-0.5 rounded border text-[10px]">Space</kbd> to pause or resume
              </p>
            </div>
          )}

          {/* ==================================================== */}
          {/* 2. PRECISION STOPWATCH VIEW */}
          {/* ==================================================== */}
          {activeEngine === 'stopwatch' && (
            <div className="w-full flex flex-col items-center">
              {/* Large Digital Stopwatch Display */}
              <div
                className="my-6 p-6 sm:p-8 rounded-3xl border w-full max-w-md flex flex-col items-center justify-center relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: stopwatchRunning ? 'var(--accent-primary)' : 'var(--border-subtle)',
                  boxShadow: stopwatchRunning ? 'var(--accent-glow)' : 'none',
                }}
              >
                <div className="flex items-baseline justify-center font-mono tracking-tight select-none">
                  <span
                    className="text-5xl sm:text-6xl font-black tabular-data"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {swFormatted.main}
                  </span>
                  <span
                    className="text-2xl sm:text-3xl font-bold ml-1.5 tabular-data opacity-70"
                    style={{ color: 'var(--accent-primary)' }}
                  >
                    .{swFormatted.ms}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border flex items-center gap-1.5"
                    style={{
                      backgroundColor: stopwatchRunning ? 'var(--accent-subtle)' : 'transparent',
                      borderColor: stopwatchRunning ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      color: stopwatchRunning ? 'var(--accent-primary)' : 'var(--text-muted)',
                    }}
                  >
                    <Clock className="w-3 h-3" />
                    <span>{stopwatchRunning ? 'Stopwatch Running' : stopwatchElapsedMs > 0 ? 'Paused' : 'Ready'}</span>
                  </span>

                  {tickSoundEnabled && (
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{tickStyle} tick active</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Stopwatch Action Controls */}
              <div className="flex items-center gap-3 w-full max-w-sm justify-center mb-6">
                {/* Reset Button */}
                <button
                  onClick={handleResetStopwatch}
                  disabled={stopwatchElapsedMs === 0 && !stopwatchRunning}
                  className="p-3 rounded-2xl border transition-all hover:scale-105 cursor-pointer disabled:opacity-30 disabled:hover:scale-100"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                  title="Reset Stopwatch"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* Start / Pause Button */}
                <button
                  onClick={stopwatchRunning ? handlePauseStopwatch : handleStartStopwatch}
                  className="flex-1 py-3 px-6 rounded-2xl font-bold text-sm shadow-md transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--accent-contrast)',
                  }}
                >
                  {stopwatchRunning ? (
                    <>
                      <Pause className="w-5 h-5 fill-current" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                      <span>{stopwatchElapsedMs > 0 ? 'Resume' : 'Start'}</span>
                    </>
                  )}
                </button>

                {/* Lap / Split Button */}
                <button
                  onClick={handleRecordLap}
                  disabled={stopwatchElapsedMs === 0}
                  className="p-3 rounded-2xl border transition-all hover:scale-105 cursor-pointer disabled:opacity-30 disabled:hover:scale-100"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--accent-primary)',
                  }}
                  title="Record Lap / Split (Click Sound)"
                >
                  <Flag className="w-5 h-5" />
                </button>

                {/* Log to Goal Button */}
                {stopwatchElapsedMs >= 1000 && (
                  <button
                    onClick={handleLogStopwatchSession}
                    className="p-3 rounded-2xl border transition-all hover:scale-105 cursor-pointer bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20"
                    title="Log elapsed time to goal"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Recorded Laps Table */}
              {stopwatchLaps.length > 0 && (
                <div
                  className="w-full max-w-md rounded-2xl border p-3 flex flex-col gap-2 max-h-48 overflow-y-auto"
                  style={{
                    backgroundColor: 'var(--bg-canvas)',
                    borderColor: 'var(--border-subtle)',
                  }}
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold opacity-60 px-2 pb-1 border-b border-white/5 text-white">
                    <span>Lap #</span>
                    <span>Split Time</span>
                    <span>Total Time</span>
                  </div>

                  {stopwatchLaps.map((lap) => {
                    const isBest = lap.lapTimeMs === minLapTime && stopwatchLaps.length > 1;
                    const isSlowest = lap.lapTimeMs === maxLapTime && stopwatchLaps.length > 1;
                    const lapFormatted = formatStopwatch(lap.lapTimeMs);
                    const overallFormatted = formatStopwatch(lap.overallTimeMs);

                    return (
                      <div
                        key={lap.id}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono tabular-data transition-colors ${
                          isBest
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : isSlowest
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'hover:bg-white/5 text-white/90'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold">Lap {lap.id}</span>
                          {isBest && <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">Fastest</span>}
                          {isSlowest && <span className="text-[10px] font-sans px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">Slowest</span>}
                        </div>
                        <span className="font-semibold">
                          +{lapFormatted.main}.{lapFormatted.ms}
                        </span>
                        <span className="opacity-70">
                          {overallFormatted.main}.{overallFormatted.ms}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-[11px] opacity-60 mt-4 tabular-data" style={{ color: 'var(--text-muted)' }}>
                Press <kbd className="px-1.5 py-0.5 rounded border text-[10px]">Space</kbd> to start or pause stopwatch
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Goal Attacher & Live Reflection (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Target Goal Selector Card */}
          <div
            className="p-6 rounded-[20px] border theme-transition"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-semibold uppercase tracking-wider opacity-70"
                style={{ color: 'var(--text-muted)' }}
              >
                Target Goal Attribution
              </span>
              <Target className="w-4 h-4 opacity-70" style={{ color: 'var(--accent-primary)' }} />
            </div>

            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Attach this session to:
            </label>

            {/* Goal Dropdown Select */}
            <select
              value={selectedGoalId}
              onChange={(e) => onSelectGoalId(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2.5 rounded-xl border bg-transparent focus:outline-none focus:ring-1 focus:ring-current mb-4"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-canvas)',
              }}
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.progress}%)
                </option>
              ))}
            </select>

            {/* Selected Goal Details Preview */}
            {selectedGoal && (
              <div
                className="p-4 rounded-xl border space-y-3"
                style={{
                  backgroundColor: 'var(--bg-canvas)',
                  borderColor: 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {selectedGoal.category}
                  </span>
                  <span className="text-xs tabular-data font-bold" style={{ color: 'var(--text-primary)' }}>
                    {selectedGoal.progress}% Complete
                  </span>
                </div>

                <h4 className="text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                  {selectedGoal.title}
                </h4>

                {selectedGoal.description && (
                  <p className="text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                    {selectedGoal.description}
                  </p>
                )}

                {/* Progress bar */}
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--progress-track)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${selectedGoal.progress}%`,
                      backgroundColor: 'var(--accent-primary)',
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{totalMinutesThisGoal}m logged</span>
                  </span>
                  <span>Due {selectedGoal.targetDate}</span>
                </div>
              </div>
            )}
          </div>

          {/* Session Intent & Reflection Notes Card */}
          <div
            className="p-6 rounded-[20px] border theme-transition"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span
                className="text-xs font-semibold uppercase tracking-wider opacity-70"
                style={{ color: 'var(--text-muted)' }}
              >
                Session Intent & Notes
              </span>
              <Sparkles className="w-4 h-4 opacity-70 text-amber-400" />
            </div>

            <textarea
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              placeholder="What specifically are you revising or solving in this block? (e.g., Physics numericals Ch. 2, Math quadratic equations)..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border bg-transparent focus:outline-none focus:ring-1 focus:ring-current resize-none mb-3"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--bg-canvas)',
              }}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs" style={{ color: 'var(--text-secondary)' }}>
                <input
                  type="checkbox"
                  checked={autoBoostProgress}
                  onChange={(e) => setAutoBoostProgress(e.target.checked)}
                  className="rounded border accent-current cursor-pointer"
                />
                <span>Auto-boost goal progress (+5%)</span>
              </label>

              {activeEngine === 'stopwatch' && stopwatchElapsedMs >= 1000 && (
                <button
                  onClick={handleLogStopwatchSession}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                >
                  Log Stopwatch Time
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
