import React, { useState } from 'react';
import { Plus, ListTodo, BookOpen, Target, Sparkles, ChevronUp } from 'lucide-react';
import { QuickAddTab } from './QuickAddModal';

interface QuickAddFABProps {
  onOpen: (tab?: QuickAddTab) => void;
  pendingTasksCount: number;
  subjectsCount: number;
}

export const QuickAddFAB: React.FC<QuickAddFABProps> = ({
  onOpen,
  pendingTasksCount,
  subjectsCount,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 select-none animate-in fade-in slide-in-from-bottom-5 duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className="flex items-center gap-1.5 p-1.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 group"
        style={{
          backgroundColor: 'rgba(10, 10, 10, 0.88)',
          borderColor: 'var(--accent-primary)',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8), var(--accent-glow)',
        }}
      >
        {/* Main Prominent Quick Add Trigger */}
        <button
          onClick={() => onOpen('task')}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--accent-contrast)',
          }}
          title="Quick Add Task, Subject, or Goal (Press Q)"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Quick Add</span>
          <kbd
            className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono rounded font-normal opacity-80"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              color: 'var(--accent-contrast)',
            }}
          >
            Q
          </kbd>
        </button>

        {/* Rapid Jump Options */}
        <div className="flex items-center gap-1 pl-1 pr-1 border-l border-white/10">
          <button
            onClick={() => onOpen('task')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Rapidly add new study task"
          >
            <ListTodo className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden md:inline">Task</span>
          </button>

          <button
            onClick={() => onOpen('subject')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Rapidly add new subject syllabus"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Subject</span>
          </button>

          <button
            onClick={() => onOpen('goal')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Rapidly add new goal milestone"
          >
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Goal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
