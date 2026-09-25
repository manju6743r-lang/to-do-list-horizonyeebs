import React from 'react';
import { Calendar, Clock, CheckCircle2, Circle, Plus, Filter } from 'lucide-react';
import { Milestone } from '../types';

interface TimelineViewProps {
  milestones: Milestone[];
  onToggleMilestone: (id: string) => void;
  onAddMilestone: (milestone: Omit<Milestone, 'id'>) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  milestones,
  onToggleMilestone,
  onAddMilestone,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Timeline & Daily Sprint Schedule
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Sequential breakdown of target milestones across the sprint cycle
          </p>
        </div>
      </div>

      <div
        className="p-6 rounded-[20px] border theme-transition"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="space-y-6">
          {['Today', 'Tomorrow'].map((sectionDate) => {
            const sectionItems = milestones.filter((m) => m.date === sectionDate);

            return (
              <div key={sectionDate} className="space-y-3">
                <div className="flex items-center gap-2 pb-1 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <Calendar className="w-4 h-4 opacity-60" style={{ color: 'var(--accent-primary)' }} />
                  <h4 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    {sectionDate === 'Today' ? 'Today · Sep 25' : 'Tomorrow · Sep 26'}
                  </h4>
                  <span className="text-xs tabular-data opacity-60" style={{ color: 'var(--text-muted)' }}>
                    ({sectionItems.length} items)
                  </span>
                </div>

                <div className="space-y-2.5">
                  {sectionItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onToggleMilestone(item.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        item.completed ? 'opacity-60 bg-transparent' : 'hover:shadow-sm'
                      }`}
                      style={{
                        backgroundColor: item.completed ? 'transparent' : 'var(--bg-canvas)',
                        borderColor: 'var(--border-subtle)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleMilestone(item.id);
                          }}
                          className="shrink-0 p-0.5 rounded-full"
                          aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {item.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/10" />
                          ) : (
                            <Circle className="w-5 h-5 opacity-40 hover:opacity-100" style={{ color: 'var(--text-muted)' }} />
                          )}
                        </button>
                        <div>
                          <p
                            className={`text-sm font-semibold leading-tight ${
                              item.completed ? 'line-through' : ''
                            }`}
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span className="flex items-center gap-1 tabular-data">
                              <Clock className="w-3 h-3 opacity-60" />
                              {item.time}
                            </span>
                            <span>·</span>
                            <span>{item.category}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className="text-xs px-2.5 py-1 rounded-lg border font-medium"
                        style={{
                          borderColor: 'var(--border-subtle)',
                          backgroundColor: item.completed ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-surface)',
                          color: item.completed ? '#10b981' : 'var(--text-secondary)',
                        }}
                      >
                        {item.completed ? 'Achieved' : 'Scheduled'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
