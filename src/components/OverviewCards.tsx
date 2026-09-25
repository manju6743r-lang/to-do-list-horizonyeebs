import React from 'react';
import { Target, Clock, CheckCircle2, Zap, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Goal } from '../types';

interface OverviewCardsProps {
  goals: Goal[];
  onFilterStatus?: (status: 'all' | 'in-progress' | 'completed') => void;
  activeFilter?: 'all' | 'in-progress' | 'completed';
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  goals,
  onFilterStatus,
  activeFilter = 'all',
}) => {
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.progress === 100).length;
  const inProgressGoals = goals.filter((g) => g.progress < 100).length;

  // Calculate dynamic average focus score based on progress and completeness
  const avgProgress = totalGoals > 0 
    ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / totalGoals) 
    : 0;
  
  // Focus score calculation (weighted between progress rate and completed milestones)
  const focusScore = Math.min(99, Math.max(75, 78 + Math.round(avgProgress * 0.2)));

  const cards = [
    {
      id: 'total',
      title: 'Total Goals',
      value: `${totalGoals}`,
      change: '+2 this month',
      changePositive: true,
      subtext: 'across 4 categories',
      icon: Target,
      filter: 'all' as const,
      bgVar: 'var(--card-pastel-1)',
      textVar: 'var(--card-pastel-1-text)',
      subVar: 'var(--card-pastel-1-sub)',
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      value: `${inProgressGoals}`,
      change: '4 high priority',
      changePositive: true,
      subtext: 'active daily focus',
      icon: Clock,
      filter: 'in-progress' as const,
      bgVar: 'var(--card-pastel-2)',
      textVar: 'var(--card-pastel-2-text)',
      subVar: 'var(--card-pastel-2-sub)',
    },
    {
      id: 'completed',
      title: 'Completed',
      value: `${completedGoals}`,
      change: '+1 this week',
      changePositive: true,
      subtext: `${totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}% completion rate`,
      icon: CheckCircle2,
      filter: 'completed' as const,
      bgVar: 'var(--card-pastel-3)',
      textVar: 'var(--card-pastel-3-text)',
      subVar: 'var(--card-pastel-3-sub)',
    },
    {
      id: 'focus-score',
      title: 'Focus Score',
      value: `${focusScore}%`,
      change: '+4.2% velocity',
      changePositive: true,
      subtext: 'top quadrant flow',
      icon: Zap,
      filter: undefined,
      bgVar: 'var(--card-pastel-4)',
      textVar: 'var(--card-pastel-4-text)',
      subVar: 'var(--card-pastel-4-sub)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isClickable = Boolean(card.filter);
        const isSelected = card.filter && activeFilter === card.filter;

        return (
          <div
            key={card.id}
            onClick={() => {
              if (card.filter && onFilterStatus) {
                onFilterStatus(card.filter);
              }
            }}
            className={`p-5 rounded-[20px] transition-all duration-300 relative overflow-hidden flex flex-col justify-between theme-transition ${
              isClickable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-lg' : ''
            } ${isSelected ? 'ring-2 ring-current' : ''}`}
            style={{
              backgroundColor: card.bgVar,
              color: card.textVar,
              boxShadow: 'var(--shadow-card)',
            }}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onKeyDown={(e) => {
              if (isClickable && onFilterStatus && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onFilterStatus(card.filter!);
              }
            }}
          >
            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold tracking-wide uppercase opacity-80">
                {card.title}
              </span>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/10"
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>

            {/* Middle: Big Stat */}
            <div className="my-1">
              <span className="text-3xl lg:text-4xl font-bold tabular-data tracking-tight">
                {card.value}
              </span>
            </div>

            {/* Bottom: Context & Change */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5 dark:border-white/10 text-xs">
              <span
                className="flex items-center gap-1 font-semibold"
                style={{ color: card.subVar }}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{card.change}</span>
              </span>
              <span className="opacity-70 truncate ml-2">
                {card.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
