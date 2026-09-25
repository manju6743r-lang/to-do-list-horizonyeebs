import React from 'react';
import { Play, Pause, Brain, Coffee, ChevronRight, X, RotateCcw } from 'lucide-react';
import { Goal } from '../types';

interface MiniTimerWidgetProps {
  timerSecondsLeft: number;
  timerTotalDuration: number;
  timerIsRunning: boolean;
  timerMode: 'focus' | 'short-break' | 'long-break';
  attachedGoal?: Goal;
  onToggleTimer: () => void;
  onOpenFocusTab: () => void;
  onResetTimer: () => void;
}

export const MiniTimerWidget: React.FC<MiniTimerWidgetProps> = ({
  timerSecondsLeft,
  timerTotalDuration,
  timerIsRunning,
  timerMode,
  attachedGoal,
  onToggleTimer,
  onOpenFocusTab,
  onResetTimer,
}) => {
  // Only display if running or timer has been started (< totalDuration)
  const isStarted = timerSecondsLeft < timerTotalDuration;
  if (!isStarted && !timerIsRunning) return null;

  const mins = Math.floor(Math.max(0, timerSecondsLeft) / 60);
  const secs = Math.max(0, timerSecondsLeft) % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const progressPercent = timerTotalDuration > 0
    ? ((timerTotalDuration - timerSecondsLeft) / timerTotalDuration) * 100
    : 0;

  return (
    <div className="fixed bottom-5 left-5 sm:left-6 md:left-[270px] z-30 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className="glass-panel p-3 pl-4 rounded-2xl border shadow-2xl flex items-center gap-3.5 max-w-md theme-transition"
        style={{
          backgroundColor: 'var(--bg-glass)',
          borderColor: 'var(--border-strong)',
          boxShadow: 'var(--shadow-dropdown)',
        }}
      >
        {/* Pulsing mode indicator */}
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            color: timerMode === 'focus' ? 'var(--accent-primary)' : '#10b981',
          }}
        >
          {timerMode === 'focus' ? (
            <Brain className="w-4 h-4 animate-pulse" />
          ) : (
            <Coffee className="w-4 h-4" />
          )}
        </div>

        {/* Time and Goal context */}
        <div className="flex flex-col cursor-pointer min-w-[130px]" onClick={onOpenFocusTab}>
          <div className="flex items-center gap-2">
            <span
              className="text-base font-extrabold tabular-data tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              {timeFormatted}
            </span>
            <span
              className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-primary)',
              }}
            >
              {timerMode === 'focus' ? 'Focus' : 'Break'}
            </span>
          </div>

          <span
            className="text-[11px] truncate max-w-[150px] opacity-70"
            style={{ color: 'var(--text-secondary)' }}
            title={attachedGoal ? attachedGoal.title : 'General Focus'}
          >
            {attachedGoal ? attachedGoal.title : 'Productivity Sprint'}
          </span>

          {/* Tiny progress line */}
          <div
            className="w-full h-1 rounded-full overflow-hidden mt-1"
            style={{ backgroundColor: 'var(--progress-track)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: 'var(--accent-primary)',
              }}
            />
          </div>
        </div>

        {/* Controls: Play/Pause, Open View */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            onClick={onToggleTimer}
            className="p-2 rounded-xl transition-transform hover:scale-105"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-contrast)',
            }}
            aria-label={timerIsRunning ? 'Pause' : 'Resume'}
          >
            {timerIsRunning ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={onOpenFocusTab}
            className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
            title="Expand Focus Dashboard"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
