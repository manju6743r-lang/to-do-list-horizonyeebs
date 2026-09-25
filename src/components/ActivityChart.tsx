import React, { useState } from 'react';
import { TrendingUp, Clock, Calendar, Info, Zap, ArrowUpRight } from 'lucide-react';
import { ActivityDataPoint } from '../types';
import { WEEKLY_ACTIVITY, LAST_WEEK_ACTIVITY } from '../data/initialData';

interface ActivityChartProps {
  onOpenFocusScoreHistory?: () => void;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ onOpenFocusScoreHistory }) => {
  const [timeframe, setTimeframe] = useState<'this-week' | 'last-week'>('this-week');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(4); // Default to Friday

  const data = timeframe === 'this-week' ? WEEKLY_ACTIVITY : LAST_WEEK_ACTIVITY;

  // Chart Dimensions & Scaling
  const width = 580;
  const height = 200;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 35;

  const maxHours = 9; // y-axis maximum
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingTop - paddingBottom;

  const getCoordinates = (point: ActivityDataPoint, index: number) => {
    const x = paddingX + (index / (data.length - 1)) * plotWidth;
    const y = paddingTop + plotHeight - (point.hours / maxHours) * plotHeight;
    return { x, y };
  };

  const points = data.map((d: ActivityDataPoint, i: number) => getCoordinates(d, i));

  // Generate smooth SVG Catmull-Rom or cubic Bezier path
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const linePath = createSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  // Aggregated metrics
  const totalHours = data.reduce((acc: number, curr: ActivityDataPoint) => acc + curr.hours, 0).toFixed(1);
  const peakDay = [...data].sort((a, b) => b.hours - a.hours)[0];
  const activeHover = hoveredIndex !== null ? data[hoveredIndex] : data[4];
  const activeCoord = hoveredIndex !== null ? points[hoveredIndex] : points[4];

  return (
    <div
      className="p-6 rounded-[20px] border theme-transition flex flex-col justify-between"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3
              className="text-base font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Weekly Focus & Productivity
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-md font-medium"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                color: 'var(--accent-primary)',
              }}
            >
              Simulated Trend
            </span>
          </div>
          <p
            className="text-xs mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            Hours logged across focus sessions and milestone completions
          </p>
        </div>

        {/* Actions & Timeframe selector tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenFocusScoreHistory && (
            <button
              onClick={onOpenFocusScoreHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:scale-105 cursor-pointer shadow-xs"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                borderColor: 'var(--accent-primary)',
                color: 'var(--accent-primary)',
              }}
              title="Open 30-Day Focus Score Trajectory Line Chart"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>30-Day Focus Score</span>
              <ArrowUpRight className="w-3 h-3 opacity-80" />
            </button>
          )}

          <div
            className="flex items-center p-1 rounded-xl border text-xs"
            style={{
              backgroundColor: 'var(--bg-canvas)',
              borderColor: 'var(--border-subtle)',
            }}
          >
          <button
            onClick={() => setTimeframe('this-week')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              timeframe === 'this-week' ? 'shadow-sm font-semibold' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: timeframe === 'this-week' ? 'var(--bg-surface)' : 'transparent',
              color: 'var(--text-primary)',
            }}
          >
            This Week
          </button>
          <button
            onClick={() => setTimeframe('last-week')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              timeframe === 'last-week' ? 'shadow-sm font-semibold' : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: timeframe === 'last-week' ? 'var(--bg-surface)' : 'transparent',
              color: 'var(--text-primary)',
            }}
          >
            Last Week
          </button>
        </div>
      </div>
    </div>

      {/* SVG Interactive Line Chart */}
      <div className="relative w-full overflow-hidden select-none my-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 overflow-visible"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-line)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 3, 6, 9].map((val) => {
            const y = paddingTop + plotHeight - (val / maxHours) * plotHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--text-muted)"
                  className="tabular-data font-mono"
                >
                  {val}h
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill="url(#chartGradient)" />

          {/* Smooth line stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="var(--chart-line)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertical indicator line for hovered point */}
          {activeCoord && (
            <line
              x1={activeCoord.x}
              y1={paddingTop}
              x2={activeCoord.x}
              y2={height - paddingBottom}
              stroke="var(--chart-line)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.6"
            />
          )}

          {/* Points & x-axis labels */}
          {points.map((pt: { x: number; y: number }, i: number) => {
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onClick={() => setHoveredIndex(i)}
              >
                {/* Hit area for easier hover on touch/mouse */}
                <rect
                  x={pt.x - 20}
                  y={paddingTop}
                  width="40"
                  height={plotHeight}
                  fill="transparent"
                />

                {/* Point circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : 4}
                  fill="var(--bg-surface)"
                  stroke="var(--chart-line)"
                  strokeWidth={isHovered ? 3 : 2}
                  className="transition-all duration-150"
                />

                {/* X-axis Day label */}
                <text
                  x={pt.x}
                  y={height - paddingBottom + 20}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isHovered ? '600' : '400'}
                  fill={isHovered ? 'var(--text-primary)' : 'var(--text-muted)'}
                >
                  {data[i].day}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip displaying stats for active day */}
        {activeHover && activeCoord && (
          <div
            className="absolute top-2 right-2 sm:right-6 pointer-events-none p-2.5 rounded-xl border text-xs shadow-md backdrop-blur-md theme-transition"
            style={{
              backgroundColor: 'var(--bg-glass)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center gap-1.5 font-semibold text-xs border-b pb-1 mb-1.5" style={{ borderColor: 'var(--border-subtle)' }}>
              <span>{activeHover.fullDay}</span>
              <span className="opacity-40">·</span>
              <span className="tabular-data" style={{ color: 'var(--chart-line)' }}>
                {activeHover.hours} hrs Focus
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              <span>Focus Efficiency:</span>
              <span className="tabular-data font-semibold">{activeHover.score}%</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
              <span>Goals Advanced:</span>
              <span className="tabular-data font-semibold">{activeHover.goalsUpdated} items</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Summary Bar */}
      <div
        className="grid grid-cols-3 gap-3 pt-3 mt-2 border-t text-xs"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="flex flex-col">
          <span className="text-[11px] opacity-70" style={{ color: 'var(--text-muted)' }}>
            Total Focus
          </span>
          <span className="text-sm font-bold tabular-data" style={{ color: 'var(--text-primary)' }}>
            {totalHours} hrs
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] opacity-70" style={{ color: 'var(--text-muted)' }}>
            Peak Day
          </span>
          <span className="text-sm font-bold tabular-data" style={{ color: 'var(--text-primary)' }}>
            {peakDay.fullDay} ({peakDay.hours}h)
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] opacity-70" style={{ color: 'var(--text-muted)' }}>
            Daily Average
          </span>
          <span className="text-sm font-bold tabular-data" style={{ color: 'var(--text-primary)' }}>
            {(Number(totalHours) / 7).toFixed(1)} hrs/day
          </span>
        </div>
      </div>
    </div>
  );
};
