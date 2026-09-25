import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Layers,
  Sparkles,
  Trash2,
  Search,
  Filter,
  CheckSquare,
  Square,
  AlertCircle,
  Clock,
  Tag,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Subject, Topic, TopicDifficulty, AppMode } from '../types';

interface SyllabusTrackerProps {
  subjects: Subject[];
  mode: AppMode;
  onToggleTopicPrepared: (subjectId: string, topicId: string) => void;
  onAddSubject: (subject: Omit<Subject, 'id' | 'topics'>, initialTopics?: string[]) => void;
  onDeleteSubject: (subjectId: string) => void;
  onAddTopic: (subjectId: string, title: string, difficulty: TopicDifficulty) => void;
  onDeleteTopic: (subjectId: string, topicId: string) => void;
  searchQuery?: string;
}

export const SyllabusTracker: React.FC<SyllabusTrackerProps> = ({
  subjects,
  mode,
  onToggleTopicPrepared,
  onAddSubject,
  onDeleteSubject,
  onAddTopic,
  onDeleteTopic,
  searchQuery = '',
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'prepared' | 'unprepared'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<Record<string, boolean>>(() => {
    // Expand all by default
    const init: Record<string, boolean> = {};
    subjects.forEach((s) => (init[s.id] = true));
    return init;
  });

  // Inline topic inputs per subject
  const [newTopicTitles, setNewTopicTitles] = useState<Record<string, string>>({});
  const [newTopicDifficulties, setNewTopicDifficulties] = useState<Record<string, TopicDifficulty>>({});

  // New Subject Form state
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectCategory, setNewSubjectCategory] = useState('Core Science');
  const [newSubjectTargetDate, setNewSubjectTargetDate] = useState('Nov 15, 2026');
  const [newSubjectInitialTopics, setNewSubjectInitialTopics] = useState('');

  const toggleSubjectExpanded = (id: string) => {
    setExpandedSubjectIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAddTopicSubmit = (subjectId: string, e: React.FormEvent) => {
    e.preventDefault();
    const title = newTopicTitles[subjectId]?.trim();
    if (!title) return;

    const diff = newTopicDifficulties[subjectId] || 'Medium';
    onAddTopic(subjectId, title, diff);

    setNewTopicTitles((prev) => ({ ...prev, [subjectId]: '' }));
  };

  const handleCreateSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    const parsedTopics = newSubjectInitialTopics
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    onAddSubject(
      {
        name: newSubjectName.trim(),
        code: newSubjectCode.trim() || newSubjectName.slice(0, 4).toUpperCase(),
        category: newSubjectCategory,
        targetExamDate: newSubjectTargetDate,
        colorTag: 'mint',
      },
      parsedTopics.length > 0 ? parsedTopics : undefined
    );

    // Reset form
    setNewSubjectName('');
    setNewSubjectCode('');
    setNewSubjectInitialTopics('');
    setIsAddSubjectOpen(false);
  };

  // Aggregated calculations
  const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
  const totalPreparedTopics = subjects.reduce(
    (acc, s) => acc + s.topics.filter((t) => t.isPrepared).length,
    0
  );
  const overallPercentage = totalTopics > 0 ? Math.round((totalPreparedTopics / totalTopics) * 100) : 0;

  // Filter subjects and topics
  const filteredSubjects = subjects
    .filter((subj) => {
      if (selectedCategory !== 'All' && subj.category !== selectedCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchSubj = subj.name.toLowerCase().includes(q) || subj.code.toLowerCase().includes(q);
        const matchTopic = subj.topics.some((t) => t.title.toLowerCase().includes(q));
        if (!matchSubj && !matchTopic) return false;
      }
      return true;
    })
    .map((subj) => {
      let topics = subj.topics;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        topics = topics.filter((t) => t.title.toLowerCase().includes(q) || subj.name.toLowerCase().includes(q));
      }
      if (filterStatus === 'prepared') {
        topics = topics.filter((t) => t.isPrepared);
      } else if (filterStatus === 'unprepared') {
        topics = topics.filter((t) => !t.isPrepared);
      }
      return { ...subj, topics };
    });

  const categories = ['All', ...Array.from(new Set(subjects.map((s) => s.category)))];

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Syllabus & Chapter Tracker
            </h2>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-semibold border"
              style={{
                backgroundColor: 'var(--accent-subtle)',
                borderColor: 'var(--accent-primary)',
                color: 'var(--accent-primary)',
              }}
            >
              {mode === 'workspace' ? '💾 LocalStorage Mode' : '👁️ Preview Mock Mode'}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Track academic syllabus chapters, mark "I am prepared", and monitor dynamic completion percentages
          </p>
        </div>

        {/* Action Button: Add Subject */}
        <button
          onClick={() => setIsAddSubjectOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap self-start sm:self-auto"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--accent-contrast)',
          }}
        >
          <Plus className="w-4 h-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-5 rounded-[20px] border theme-transition"
          style={{
            backgroundColor: 'var(--card-pastel-1)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase opacity-80 mb-2">
            <span style={{ color: 'var(--card-pastel-1-text)' }}>Total Subjects</span>
            <BookOpen className="w-4 h-4" style={{ color: 'var(--card-pastel-1-sub)' }} />
          </div>
          <span className="text-3xl font-extrabold tabular-data tracking-tight" style={{ color: 'var(--card-pastel-1-text)' }}>
            {subjects.length}
          </span>
          <p className="text-[11px] mt-2 opacity-70" style={{ color: 'var(--card-pastel-1-sub)' }}>
            Across {categories.length - 1} academic domains
          </p>
        </div>

        <div
          className="p-5 rounded-[20px] border theme-transition"
          style={{
            backgroundColor: 'var(--card-pastel-2)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase opacity-80 mb-2">
            <span style={{ color: 'var(--card-pastel-2-text)' }}>Prepared Topics</span>
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--card-pastel-2-sub)' }} />
          </div>
          <span className="text-3xl font-extrabold tabular-data tracking-tight" style={{ color: 'var(--card-pastel-2-text)' }}>
            {totalPreparedTopics} / {totalTopics}
          </span>
          <p className="text-[11px] mt-2 opacity-70" style={{ color: 'var(--card-pastel-2-sub)' }}>
            Chapters marked "I am prepared"
          </p>
        </div>

        <div
          className="p-5 rounded-[20px] border theme-transition"
          style={{
            backgroundColor: 'var(--card-pastel-3)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase opacity-80 mb-2">
            <span style={{ color: 'var(--card-pastel-3-text)' }}>Syllabus Readiness</span>
            <Sparkles className="w-4 h-4" style={{ color: 'var(--card-pastel-3-sub)' }} />
          </div>
          <span className="text-3xl font-extrabold tabular-data tracking-tight" style={{ color: 'var(--card-pastel-3-text)' }}>
            {overallPercentage}%
          </span>
          <div className="w-full h-1.5 rounded-full overflow-hidden mt-3 bg-black/20">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${overallPercentage}%`,
                backgroundColor: 'var(--card-pastel-3-text)',
              }}
            />
          </div>
        </div>

        <div
          className="p-5 rounded-[20px] border theme-transition"
          style={{
            backgroundColor: 'var(--card-pastel-4)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div className="flex items-center justify-between text-xs font-semibold uppercase opacity-80 mb-2">
            <span style={{ color: 'var(--card-pastel-4-text)' }}>Pending Revision</span>
            <AlertCircle className="w-4 h-4" style={{ color: 'var(--card-pastel-4-sub)' }} />
          </div>
          <span className="text-3xl font-extrabold tabular-data tracking-tight" style={{ color: 'var(--card-pastel-4-text)' }}>
            {totalTopics - totalPreparedTopics}
          </span>
          <p className="text-[11px] mt-2 opacity-70" style={{ color: 'var(--card-pastel-4-sub)' }}>
            Topics remaining before exam
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="p-4 rounded-2xl border theme-transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        {/* Status buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterStatus('all')}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterStatus === 'all'
                ? 'font-bold shadow-sm'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: filterStatus === 'all' ? 'var(--accent-primary)' : 'transparent',
              color: filterStatus === 'all' ? 'var(--accent-contrast)' : 'var(--text-secondary)',
            }}
          >
            All Topics ({totalTopics})
          </button>
          <button
            onClick={() => setFilterStatus('prepared')}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterStatus === 'prepared'
                ? 'font-bold shadow-sm'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: filterStatus === 'prepared' ? 'var(--accent-primary)' : 'transparent',
              color: filterStatus === 'prepared' ? 'var(--accent-contrast)' : 'var(--text-secondary)',
            }}
          >
            Prepared ({totalPreparedTopics})
          </button>
          <button
            onClick={() => setFilterStatus('unprepared')}
            className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
              filterStatus === 'unprepared'
                ? 'font-bold shadow-sm'
                : 'opacity-70 hover:opacity-100'
            }`}
            style={{
              backgroundColor: filterStatus === 'unprepared' ? 'var(--accent-primary)' : 'transparent',
              color: filterStatus === 'unprepared' ? 'var(--accent-contrast)' : 'var(--text-secondary)',
            }}
          >
            Needs Prep ({totalTopics - totalPreparedTopics})
          </button>
        </div>

        {/* Category tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all ${
                selectedCategory === cat ? 'font-semibold' : 'opacity-60 hover:opacity-100'
              }`}
              style={{
                borderColor: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--border-subtle)',
                backgroundColor: selectedCategory === cat ? 'var(--accent-subtle)' : 'var(--bg-canvas)',
                color: selectedCategory === cat ? 'var(--accent-primary)' : 'var(--text-muted)',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects List */}
      {filteredSubjects.length === 0 ? (
        <div
          className="p-12 text-center rounded-[20px] border border-dashed flex flex-col items-center gap-3"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-surface)' }}
        >
          <BookOpen className="w-8 h-8 opacity-40" style={{ color: 'var(--text-muted)' }} />
          <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            No subjects match your current filter
          </h4>
          <p className="text-xs max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>
            Try changing the filter options above or click "Add New Subject" to create your syllabus structure.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSubjects.map((subject) => {
            const originalSubj = subjects.find((s) => s.id === subject.id) || subject;
            const subjTotal = originalSubj.topics.length;
            const subjPrepared = originalSubj.topics.filter((t) => t.isPrepared).length;
            const subjPercent = subjTotal > 0 ? Math.round((subjPrepared / subjTotal) * 100) : 0;
            const isExpanded = expandedSubjectIds[subject.id] !== false;

            return (
              <div
                key={subject.id}
                className="p-6 rounded-[20px] border theme-transition relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderColor: 'var(--border-subtle)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                {/* Subject Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSubjectExpanded(subject.id)}
                      className="p-1 rounded-lg hover:bg-white/5 transition-colors"
                      title={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 opacity-70" />
                      ) : (
                        <ChevronDown className="w-4 h-4 opacity-70" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border"
                          style={{
                            backgroundColor: 'var(--accent-subtle)',
                            borderColor: 'var(--border-subtle)',
                            color: 'var(--accent-primary)',
                          }}
                        >
                          {subject.code}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                          {subject.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-3 text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        <span>{subject.category}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 opacity-60" />
                          Exam: {subject.targetExamDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Stats & Delete Action */}
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="text-base font-extrabold tabular-data" style={{ color: 'var(--text-primary)' }}>
                          {subjPercent}%
                        </span>
                        <span className="text-xs opacity-70 tabular-data" style={{ color: 'var(--text-muted)' }}>
                          ({subjPrepared}/{subjTotal} prepared)
                        </span>
                      </div>
                      <span className="text-[11px] font-medium" style={{ color: subjPercent === 100 ? '#10b981' : 'var(--accent-primary)' }}>
                        {subjPercent === 100 ? 'Fully Mastered 🎉' : 'In Progress'}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteSubject(subject.id)}
                      className="p-2 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors opacity-60 hover:opacity-100"
                      title="Delete this subject"
                      aria-label="Delete subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Dynamic Progress Bar */}
                <div
                  className="w-full h-2 rounded-full overflow-hidden mb-5"
                  style={{ backgroundColor: 'var(--progress-track)' }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${subjPercent}%`,
                      backgroundColor: 'var(--accent-primary)',
                      boxShadow: 'var(--accent-glow)',
                    }}
                  />
                </div>

                {/* Topics / Chapters Section */}
                {isExpanded && (
                  <div className="space-y-4 pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                    {/* Topics Checklist */}
                    <div className="space-y-2">
                      {subject.topics.length === 0 ? (
                        <p className="text-xs py-3 text-center opacity-60" style={{ color: 'var(--text-muted)' }}>
                          No topics found. Add your first topic below!
                        </p>
                      ) : (
                        subject.topics.map((topic) => {
                          const isPrepared = topic.isPrepared;

                          return (
                            <div
                              key={topic.id}
                              onClick={() => onToggleTopicPrepared(subject.id, topic.id)}
                              className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 group ${
                                isPrepared
                                  ? 'bg-black/20 opacity-80'
                                  : 'hover:border-white/20 hover:bg-white/[0.02]'
                              }`}
                              style={{
                                backgroundColor: isPrepared ? 'rgba(0,0,0,0.3)' : 'var(--bg-canvas)',
                                borderColor: isPrepared ? 'var(--border-subtle)' : 'var(--border-subtle)',
                              }}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {/* Dedicated "I am prepared" checkbox button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleTopicPrepared(subject.id, topic.id);
                                  }}
                                  className="shrink-0 p-0.5 rounded transition-transform group-hover:scale-110"
                                  title={isPrepared ? 'Mark as not prepared' : 'Mark: I am prepared'}
                                  aria-label={isPrepared ? 'Mark as not prepared' : 'Mark: I am prepared'}
                                >
                                  {isPrepared ? (
                                    <CheckSquare
                                      className="w-5 h-5 fill-current"
                                      style={{ color: 'var(--accent-primary)' }}
                                    />
                                  ) : (
                                    <Square
                                      className="w-5 h-5 opacity-40 group-hover:opacity-80"
                                      style={{ color: 'var(--text-muted)' }}
                                    />
                                  )}
                                </button>

                                <div className="min-w-0">
                                  <p
                                    className={`text-xs sm:text-sm font-semibold leading-snug transition-all ${
                                      isPrepared ? 'line-through opacity-70' : ''
                                    }`}
                                    style={{ color: 'var(--text-primary)' }}
                                  >
                                    {topic.title}
                                  </p>
                                  {topic.lastRevised && (
                                    <span className="text-[10px] opacity-60 flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                      <Clock className="w-2.5 h-2.5" />
                                      Revised {topic.lastRevised}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Right side: Prepared badge, Difficulty, Delete */}
                              <div className="flex items-center gap-2 shrink-0">
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                    isPrepared
                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  }`}
                                >
                                  {isPrepared ? 'Prepared ✓' : 'Pending'}
                                </span>

                                <span
                                  className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded font-mono opacity-60"
                                  style={{ color: 'var(--text-muted)', backgroundColor: 'rgba(255,255,255,0.05)' }}
                                >
                                  {topic.difficulty}
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteTopic(subject.id, topic.id);
                                  }}
                                  className="p-1 rounded opacity-0 group-hover:opacity-60 hover:!opacity-100 hover:text-red-400 transition-opacity"
                                  title="Delete topic"
                                  aria-label="Delete topic"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Inline Add Topic / Chapter Form */}
                    <form
                      onSubmit={(e) => handleAddTopicSubmit(subject.id, e)}
                      className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2"
                    >
                      <input
                        type="text"
                        placeholder={`Add new chapter/topic to ${subject.name}...`}
                        value={newTopicTitles[subject.id] || ''}
                        onChange={(e) =>
                          setNewTopicTitles((prev) => ({
                            ...prev,
                            [subject.id]: e.target.value,
                          }))
                        }
                        className="flex-1 text-xs px-3.5 py-2 rounded-xl border bg-transparent focus:outline-none focus:ring-1 focus:ring-current"
                        style={{
                          borderColor: 'var(--border-subtle)',
                          color: 'var(--text-primary)',
                          backgroundColor: 'var(--bg-canvas)',
                        }}
                      />

                      <div className="flex items-center gap-2">
                        <select
                          value={newTopicDifficulties[subject.id] || 'Medium'}
                          onChange={(e) =>
                            setNewTopicDifficulties((prev) => ({
                              ...prev,
                              [subject.id]: e.target.value as TopicDifficulty,
                            }))
                          }
                          className="text-xs px-2.5 py-2 rounded-xl border bg-transparent focus:outline-none"
                          style={{
                            borderColor: 'var(--border-subtle)',
                            color: 'var(--text-secondary)',
                            backgroundColor: 'var(--bg-canvas)',
                          }}
                        >
                          <option value="Easy" style={{ backgroundColor: '#101010' }}>Easy</option>
                          <option value="Medium" style={{ backgroundColor: '#101010' }}>Medium</option>
                          <option value="Hard" style={{ backgroundColor: '#101010' }}>Hard</option>
                        </select>

                        <button
                          type="submit"
                          disabled={!newTopicTitles[subject.id]?.trim()}
                          className="px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-30 cursor-pointer flex items-center gap-1 shrink-0"
                          style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: 'var(--accent-contrast)',
                          }}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Topic</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create New Subject */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg rounded-[20px] p-6 border shadow-2xl relative theme-transition"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-strong)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--accent-subtle)',
                    color: 'var(--accent-primary)',
                  }}
                >
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Add New Academic Subject</h3>
                  <p className="text-xs opacity-70" style={{ color: 'var(--text-muted)' }}>
                    Set up your course, exam schedule, and chapter syllabus
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddSubjectOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubjectSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 9 Science, Pure Mathematics, Physics..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border bg-transparent focus:outline-none focus:ring-1 focus:ring-current"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-canvas)',
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Subject Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SCI-09"
                    value={newSubjectCode}
                    onChange={(e) => setNewSubjectCode(e.target.value)}
                    className="w-full text-sm px-3.5 py-2 rounded-xl border bg-transparent focus:outline-none"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-canvas)',
                    }}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Domain Category
                  </label>
                  <select
                    value={newSubjectCategory}
                    onChange={(e) => setNewSubjectCategory(e.target.value)}
                    className="w-full text-sm px-3.5 py-2 rounded-xl border bg-transparent focus:outline-none"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-canvas)',
                    }}
                  >
                    <option value="Core Science" style={{ backgroundColor: '#101010' }}>Core Science</option>
                    <option value="Mathematics" style={{ backgroundColor: '#101010' }}>Mathematics</option>
                    <option value="Computer Science" style={{ backgroundColor: '#101010' }}>Computer Science</option>
                    <option value="Social Studies" style={{ backgroundColor: '#101010' }}>Social Studies</option>
                    <option value="Languages" style={{ backgroundColor: '#101010' }}>Languages</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Target Exam Date
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nov 20, 2026"
                  value={newSubjectTargetDate}
                  onChange={(e) => setNewSubjectTargetDate(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border bg-transparent tabular-data"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-canvas)',
                  }}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Initial Chapters / Topics (One per line)
                </label>
                <textarea
                  rows={3}
                  placeholder={`Chapter 1: Matter in Surroundings\nChapter 2: Motion & Velocity\nChapter 3: Laws of Force`}
                  value={newSubjectInitialTopics}
                  onChange={(e) => setNewSubjectInitialTopics(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-transparent focus:outline-none focus:ring-1 focus:ring-current resize-none"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-canvas)',
                  }}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border hover:opacity-80 transition-opacity"
                  style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold shadow-md transition-transform hover:scale-105"
                  style={{
                    backgroundColor: 'var(--accent-primary)',
                    color: 'var(--accent-contrast)',
                  }}
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
