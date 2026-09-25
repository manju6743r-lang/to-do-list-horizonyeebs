import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  X,
  Zap,
  TrendingUp,
  Clock,
  Calendar,
  Flame,
  CheckCircle2,
  ChevronRight,
  Filter,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  ArrowUpRight,
  Target,
  BookOpen,
} from 'lucide-react';
import { FocusSession, WorkspaceData, ThemeId } from '../types';
import { calculate30DayFocusScores, FocusScoreDayData } from '../utils/focusScoreAnalytics';

interface FocusScoreHistoryViewProps {
  isOpen: boolean;
  onClose: () => void;
  focusSessions: FocusSession[];
  workspaceData?: WorkspaceData;
  onStartFocusSession?: (goalId?: string) => void;
  currentTheme?: ThemeId;
}

export const FocusScoreHistoryView: React.FC<FocusScoreHistoryViewProps> = ({
  isOpen,
  onClose,
  focusSessions,
  workspaceData,
  onStartFocusSession,
}) => {
  // Presentation style: 'modal' (center stage) or 'drawer' (slide-over from right)
  const [layoutMode, setLayoutMode] = useState<'modal' | 'drawer'>('modal');
  const [timeRange, setTimeRange] = useState<30 | 14 | 7>(30);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [curveType, setCurveType] = useState<'spline' | 'linear'>('spline');

  // Compute 30-day analytics data
  const summary = useMemo(() => {
    return calculate30DayFocusScores(focusSessions, workspaceData);
  }, [focusSessions, workspaceData]);

  // Sliced days based on timeframe filter
  const visibleDays = useMemo(() => {
    const sliceCount = timeRange;
    const all = summary.days;
    return all.slice(all.length - sliceCount);
  }, [summary.days, timeRange]);

  // Selected Day for deep-dive inspection (defaults to today/last day)
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(29);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Keyboard navigation & close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setSelectedDayIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setSelectedDayIndex((prev) => Math.min(29, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeDay = summary.days.find((d) => d.dayIndex === (hoveredIndex !== null ? hoveredIndex : selectedDayIndex)) || summary.days[summary.days.length - 1];

  // SVG Chart Geometry
  const chartWidth = 760;
  const chartHeight = 220;
  const padLeft = 46;
  const padRight = 32;
  const padTop = 28;
  const padBottom = 38;

  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const minScore = 50;
  const maxScore = 100;

  const coords = visibleDays.map((d, idx) => {
    const x = padLeft + (idx / Math.max(1, visibleDays.length - 1)) * plotW;
    const y = padTop + plotH - ((d.score - minScore) / (maxScore - minScore)) * plotH;
    return { x, y, day: d, idx };
  });

  // Build SVG Paths
  const buildPath = () => {
    if (coords.length === 0) return '';
    if (curveType === 'linear') {
      return coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
    }

    // Cubic Bezier Spline
    let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? 0 : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const linePath = buildPath();
  const areaPath = coords.length > 0
    ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${chartHeight - padBottom} L ${coords[0].x.toFixed(1)} ${chartHeight - padBottom} Z`
    : '';

  // Active hover/selected point
  const currentActiveCoord = coords.find((c) => c.day.dayIndex === activeDay.dayIndex) || coords[coords.length - 1];

  // Benchmark guide lines (90% Peak Flow, 75% Target)
  const y90 = padTop + plotH - ((90 - minScore) / (maxScore - minScore)) * plotH;
  const y75 = padTop + plotH - ((75 - minScore) / (maxScore - minScore)) * plotH;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden animate-in fade-in duration-200"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.78)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Container - handles both Modal and Side-Drawer modes */}
      <div
        className={`bg-[#080808] border text-white flex flex-col overflow-hidden theme-transition ${
          layoutMode === 'drawer'
            ? 'fixed top-0 right-0 h-full w-full max-w-2xl border-l border-white/10 shadow-2xl rounded-l-[28px] animate-in slide-in-from-right duration-300'
            : 'relative w-full max-w-4xl max-h-[92vh] rounded-[24px] sm:rounded-[28px] border-white/10 shadow-2xl animate-in zoom-in-95 duration-200'
        }`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9), var(--accent-glow)',
        }}
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#0c0c0c]/80">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                borderColor: 'var(--accent-primary)',
                color: 'var(--accent-primary)',
              }}
            >
              <Zap className="w-5 h-5 fill-current" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Focus Score Analytics
                </h2>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border"
                  style={{
                    backgroundColor: 'var(--accent-subtle)',
                    borderColor: 'var(--accent-primary)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  30-Day Trajectory
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5">
                Aggregated from {focusSessions.length} recorded sessions in your workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View layout switch */}
            <button
              onClick={() => setLayoutMode(layoutMode === 'modal' ? 'drawer' : 'modal')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 text-xs text-white/70 hover:text-white transition-all cursor-pointer"
              title={layoutMode === 'modal' ? 'Switch to Side-Drawer View' : 'Switch to Center Modal'}
            >
              {layoutMode === 'modal' ? (
                <>
                  <PanelRightOpen className="w-3.5 h-3.5" />
                  <span>Drawer View</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Modal View</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-white/10 hover:border-white/25 bg-white/5 text-white/70 hover:text-white transition-all cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-thin">
          {/* Key Metric Highlights (4 Cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 1. Current Score */}
            <div
              className="p-4 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between"
              style={{ backgroundColor: 'rgba(18, 18, 18, 0.7)' }}
            >
              <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                <span>Current Score</span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                  +{summary.thirtyDayTrendPct}%
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span
                  className="text-2xl sm:text-3xl font-extrabold tabular-data tracking-tight"
                  style={{ color: 'var(--accent-primary)' }}
                >
                  {summary.currentScore}%
                </span>
                <span className="text-[11px] text-white/40">Today</span>
              </div>
              <div className="text-[11px] text-white/60 mt-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{summary.days[summary.days.length - 1].flowState}</span>
              </div>
            </div>

            {/* 2. 30-Day Average */}
            <div
              className="p-4 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between"
              style={{ backgroundColor: 'rgba(18, 18, 18, 0.7)' }}
            >
              <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                <span>30-Day Average</span>
                <TrendingUp className="w-3.5 h-3.5 text-white/40" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold tabular-data tracking-tight text-white">
                  {summary.averageScore}%
                </span>
                <span className="text-[11px] text-white/40">mean</span>
              </div>
              <div className="text-[11px] text-white/60 mt-1">
                Range: {summary.lowestScore}% – {summary.highestScore}%
              </div>
            </div>

            {/* 3. Total Focus Time */}
            <div
              className="p-4 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between"
              style={{ backgroundColor: 'rgba(18, 18, 18, 0.7)' }}
            >
              <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                <span>Total Focus Logged</span>
                <Clock className="w-3.5 h-3.5 text-white/40" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold tabular-data tracking-tight text-white">
                  {summary.totalFocusHours}
                </span>
                <span className="text-xs text-white/50">hours</span>
              </div>
              <div className="text-[11px] text-white/60 mt-1">
                Across {summary.totalSessions} study sprints
              </div>
            </div>

            {/* 4. Peak Day */}
            <div
              className="p-4 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between"
              style={{ backgroundColor: 'rgba(18, 18, 18, 0.7)' }}
            >
              <div className="flex items-center justify-between text-xs text-white/50 mb-1">
                <span>Peak Record</span>
                <Flame className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold tabular-data tracking-tight text-amber-400">
                  {summary.highestScore}%
                </span>
                <span className="text-[11px] text-white/40">high mark</span>
              </div>
              <div className="text-[11px] text-white/60 mt-1 truncate">
                {summary.highestDay.label} · {summary.highestDay.focusMinutes}m logged
              </div>
            </div>
          </div>

          {/* Line Chart Container with Controls Bar */}
          <div
            className="p-4 sm:p-5 rounded-3xl border border-white/10 relative"
            style={{
              backgroundColor: 'rgba(12, 12, 12, 0.85)',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
            }}
          >
            {/* Control Bar: Timeframe & Curve Switchers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white/80">View Range:</span>
                <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10 text-xs">
                  {([30, 14, 7] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setTimeRange(r)}
                      className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        timeRange === r
                          ? 'bg-white text-black shadow-xs'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {r} Days
                    </button>
                  ))}
                </div>
              </div>

              {/* Curve spline toggle */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px]">Flow ($\ge 90\%$)</span>
                  <span className="mx-1 text-white/30">·</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span className="text-[11px]">Velocity ($\ge 80\%$)</span>
                </div>

                <button
                  onClick={() => setCurveType(curveType === 'spline' ? 'linear' : 'spline')}
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-white/10 hover:border-white/20 bg-white/5 text-white/70 hover:text-white transition-colors cursor-pointer"
                  title="Toggle curved spline vs sharp linear vertices"
                >
                  {curveType === 'spline' ? 'Curved' : 'Linear'}
                </button>
              </div>
            </div>

            {/* Responsive SVG Line Chart */}
            <div className="relative w-full overflow-hidden select-none">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto overflow-visible"
                style={{ maxHeight: '280px' }}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <defs>
                  {/* Neon Accent Area Gradient */}
                  <linearGradient id="scoreAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.35" />
                    <stop offset="70%" stopColor="var(--accent-primary)" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Drop Shadow for the main line */}
                  <filter id="scoreLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="var(--accent-primary)" floodOpacity="0.5" />
                  </filter>
                </defs>

                {/* Horizontal Guide Lines */}
                {[
                  { val: 100, label: '100%' },
                  { val: 90, label: '90%' },
                  { val: 75, label: '75%' },
                  { val: 60, label: '60%' },
                ].map((guide) => {
                  const y = padTop + plotH - ((guide.val - minScore) / (maxScore - minScore)) * plotH;
                  return (
                    <g key={guide.val}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={chartWidth - padRight}
                        y2={y}
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeDasharray={guide.val === 90 ? '4 4' : 'none'}
                        strokeWidth="1"
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 3.5}
                        textAnchor="end"
                        fontSize="9.5"
                        fill="rgba(255, 255, 255, 0.4)"
                        fontFamily="monospace"
                      >
                        {guide.label}
                      </text>
                    </g>
                  );
                })}

                {/* Benchmark Flow Threshold Label */}
                <line
                  x1={padLeft}
                  y1={y90}
                  x2={chartWidth - padRight}
                  y2={y90}
                  stroke="rgba(16, 185, 129, 0.3)"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
                <text
                  x={chartWidth - padRight - 4}
                  y={y90 - 5}
                  textAnchor="end"
                  fontSize="8.5"
                  fill="#10b981"
                  fontWeight="600"
                >
                  Peak Flow Target (90%)
                </text>

                {/* Area Gradient Fill */}
                {areaPath && (
                  <path d={areaPath} fill="url(#scoreAreaGradient)" />
                )}

                {/* Main Stroke Path */}
                {linePath && (
                  <path
                    d={linePath}
                    fill="none"
                    stroke="var(--accent-primary)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#scoreLineGlow)"
                  />
                )}

                {/* Vertical Scrubber Cursor on Hover/Select */}
                {currentActiveCoord && (
                  <g>
                    <line
                      x1={currentActiveCoord.x}
                      y1={padTop}
                      x2={currentActiveCoord.x}
                      y2={chartHeight - padBottom}
                      stroke="rgba(255, 255, 255, 0.25)"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                  </g>
                )}

                {/* Data Points on Line */}
                {coords.map((c) => {
                  const isSelected = c.day.dayIndex === activeDay.dayIndex;
                  const isPeak = c.day.score === summary.highestScore;

                  return (
                    <g
                      key={c.day.dayIndex}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredIndex(c.day.dayIndex)}
                      onClick={() => setSelectedDayIndex(c.day.dayIndex)}
                    >
                      {/* Transparent wider hit zone */}
                      <circle cx={c.x} cy={c.y} r="10" fill="transparent" />

                      {/* Outer pulse if selected */}
                      {isSelected && (
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r="8"
                          fill="none"
                          stroke="var(--accent-primary)"
                          strokeWidth="2"
                          className="animate-ping opacity-60"
                        />
                      )}

                      {/* Point dot */}
                      <circle
                        cx={c.x}
                        cy={c.y}
                        r={isSelected ? 5.5 : isPeak ? 4.5 : 3}
                        fill={isSelected ? '#ffffff' : isPeak ? '#fbbf24' : 'var(--accent-primary)'}
                        stroke="#080808"
                        strokeWidth="2"
                        className="transition-all duration-150"
                      />
                    </g>
                  );
                })}

                {/* Bottom X-Axis Date Labels */}
                {coords.map((c, i) => {
                  // Only show labels every few items to avoid overlap based on count
                  const step = timeRange === 30 ? 5 : timeRange === 14 ? 2 : 1;
                  const shouldRender = i % step === 0 || i === coords.length - 1;
                  if (!shouldRender) return null;

                  return (
                    <text
                      key={c.day.dayIndex}
                      x={c.x}
                      y={chartHeight - 12}
                      textAnchor="middle"
                      fontSize="9"
                      fill={c.day.isToday ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.45)'}
                      fontWeight={c.day.isToday ? 'bold' : 'normal'}
                    >
                      {c.day.isToday ? 'Today' : c.day.label}
                    </text>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Deep-Dive Inspection Panel for the Selected/Hovered Day */}
          <div
            className="p-5 rounded-2xl border border-white/10 space-y-4"
            style={{ backgroundColor: 'rgba(16, 16, 16, 0.85)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg border tabular-data shadow-xs"
                  style={{
                    backgroundColor: 'var(--accent-subtle)',
                    borderColor: 'var(--accent-primary)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  {activeDay.score}%
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      {activeDay.fullDate}
                    </h3>
                    {activeDay.isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        Current Day
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/60 mt-0.5">
                    <span>Flow State: <strong className="text-white">{activeDay.flowState}</strong></span>
                    <span>·</span>
                    <span>Focus Logged: <strong className="text-white">{activeDay.focusMinutes} min</strong></span>
                    <span>·</span>
                    <span>Category: <strong className="text-white">{activeDay.topCategory}</strong></span>
                  </div>
                </div>
              </div>

              {/* Quick Action Button */}
              {onStartFocusSession && (
                <button
                  onClick={() => {
                    onClose();
                    onStartFocusSession();
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 cursor-pointer shadow-sm self-start sm:self-auto"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--accent-contrast)',
                  }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Launch Sprint Now</span>
                </button>
              )}
            </div>

            {/* Sessions Breakdown for this day */}
            <div>
              <h4 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <span>Sessions & Milestones</span>
                <span className="text-[10px] text-white/40 lowercase font-normal">
                  ({activeDay.sessions.length} recorded)
                </span>
              </h4>

              {activeDay.sessions.length > 0 ? (
                <div className="space-y-2">
                  {activeDay.sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3 rounded-xl border border-white/10 flex items-center justify-between gap-3 text-xs"
                      style={{ backgroundColor: 'rgba(25, 25, 25, 0.7)' }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-semibold text-white block truncate">
                            {sess.goalTitle || 'General Focus Session'}
                          </span>
                          <span className="text-[11px] text-white/50 block">
                            {sess.category} · {sess.timestamp} {sess.notes ? `· "${sess.notes}"` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-white text-xs block">
                          +{sess.durationMinutes}m
                        </span>
                        <span className="text-[10px] text-emerald-400 block font-medium">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="p-4 rounded-xl border border-white/10 text-xs text-white/60 flex items-center justify-between"
                  style={{ backgroundColor: 'rgba(20, 20, 20, 0.5)' }}
                >
                  <p>
                    {activeDay.isToday
                      ? 'No new Pomodoro sprints logged yet today. Complete a 25m sprint to boost today\'s Focus Score!'
                      : `Estimated baseline focus performance of ${activeDay.focusMinutes} minutes was computed for ${activeDay.label}.`}
                  </p>
                  {activeDay.isToday && onStartFocusSession && (
                    <button
                      onClick={() => {
                        onClose();
                        onStartFocusSession();
                      }}
                      className="px-3 py-1.5 rounded-lg border border-white/20 hover:border-white text-white font-semibold text-xs whitespace-nowrap ml-3"
                    >
                      Start +25m
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="p-3.5 px-6 border-t border-white/10 flex items-center justify-between text-xs text-white/50 bg-[#0c0c0c] shrink-0">
          <span>Use Arrow keys ← → to scrub dates</span>
          <span>Press ESC or click backdrop to close</span>
        </div>
      </div>
    </div>
  );
};
