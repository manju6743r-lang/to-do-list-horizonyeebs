import React from 'react';
import { BarChart3, TrendingUp, Zap, Clock, Target, Award, ShieldCheck } from 'lucide-react';
import { Goal } from '../types';
import { WEEKLY_ACTIVITY } from '../data/initialData';

interface AnalyticsViewProps {
  goals: Goal[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ goals }) => {
  // Category breakdown
  const categoryCounts = goals.reduce((acc, g) => {
    acc[g.category] = (acc[g.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalHours = WEEKLY_ACTIVITY.reduce((acc, curr) => acc + curr.hours, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Productivity & Focus Analytics
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Detailed performance breakdown, deep work allocation, and consistency score
        </p>
      </div>

      {/* Top 3 Metric Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-5 rounded-[20px] border theme-transition"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase opacity-70" style={{ color: 'var(--text-muted)' }}>
              Total Weekly Focus
            </span>
            <Clock className="w-4 h-4 opacity-70" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <span className="text-3xl font-bold tabular-data" style={{ color: 'var(--text-primary)' }}>
            {totalHours.toFixed(1)} hrs
          </span>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12.4% vs last week</span>
          </div>
        </div>

        <div
          className="p-5 rounded-[20px] border theme-transition"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase opacity-70" style={{ color: 'var(--text-muted)' }}>
              Avg Deep Work Session
            </span>
            <Zap className="w-4 h-4 opacity-70" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <span className="text-3xl font-bold tabular-data" style={{ color: 'var(--text-primary)' }}>
            1 hr 45 min
          </span>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            <span>Target: 2 hrs deep state</span>
          </div>
        </div>

        <div
          className="p-5 rounded-[20px] border theme-transition"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase opacity-70" style={{ color: 'var(--text-muted)' }}>
              Milestone Completion Rate
            </span>
            <Award className="w-4 h-4 opacity-70" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <span className="text-3xl font-bold tabular-data" style={{ color: 'var(--text-primary)' }}>
            91.3%
          </span>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-emerald-600">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Optimal consistency</span>
          </div>
        </div>
      </div>

      {/* Grid: Category distribution & Consistency heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category distribution */}
        <div
          className="p-6 rounded-[20px] border theme-transition"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Goal Allocation by Domain
          </h3>
          <div className="space-y-4">
            {Object.entries(categoryCounts).map(([cat, count]) => {
              const pct = Math.round((count / goals.length) * 100);
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span style={{ color: 'var(--text-primary)' }}>{cat}</span>
                    <span className="tabular-data" style={{ color: 'var(--text-secondary)' }}>
                      {count} {count === 1 ? 'goal' : 'goals'} ({pct}%)
                    </span>
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
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 14-day Habit & Focus Consistency Matrix */}
        <div
          className="p-6 rounded-[20px] border theme-transition"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              14-Day Focus Streak
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
              Active Streak
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 14 }).map((_, idx) => {
              const dayNum = 12 + idx;
              const intensity = idx === 13 ? 0.9 : 0.4 + (idx % 4) * 0.18;
              return (
                <div
                  key={idx}
                  className="aspect-square rounded-xl flex flex-col items-center justify-center p-1 border text-xs font-semibold transition-all hover:scale-105"
                  style={{
                    backgroundColor: 'var(--accent-subtle)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                  title={`Day ${dayNum}: ${Math.round(intensity * 7)} hrs logged`}
                >
                  <span className="text-[10px] opacity-60">Sep</span>
                  <span className="tabular-data font-bold text-xs">{dayNum}</span>
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1"
                    style={{ backgroundColor: 'var(--accent-primary)' }}
                  />
                </div>
              );
            })}
          </div>
          <p className="text-[11px] mt-4 text-center opacity-70" style={{ color: 'var(--text-muted)' }}>
            Each node represents verified focus sprint sessions recorded in your workspace.
          </p>
        </div>
      </div>
    </div>
  );
};
