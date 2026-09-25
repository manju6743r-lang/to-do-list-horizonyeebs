import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  Minimize2,
  Key,
  Flame,
  CheckCircle2,
  ArrowRight,
  Zap,
  RotateCcw,
  Palette,
  BookOpen,
  CheckSquare,
  Timer,
  ChevronDown,
} from 'lucide-react';
import {
  ChatMessage,
  MentorAction,
  sendGeminiMentorMessage,
  getStoredApiKey,
  setStoredApiKey,
  DEFAULT_GEMINI_API_KEY,
} from '../utils/geminiMentor';
import { Subject, ThemeId, AppMode } from '../types';
import { FocusSoundType } from '../utils/ambientSound';

interface GeminiMentorChatProps {
  userName: string;
  currentTheme: ThemeId;
  appMode: AppMode;
  subjects: Subject[];
  pendingTasksCount: number;
  // App Control callbacks
  onChangeTheme: (theme: ThemeId) => void;
  onCompleteTopic: (subjectQuery: string, topicQuery: string) => boolean;
  onAddTask: (title: string, priority?: 'High' | 'Medium' | 'Low', dueDate?: string) => void;
  onAddTopic: (subjectQuery: string, title: string, difficulty?: 'Easy' | 'Medium' | 'Hard') => boolean;
  onStartFocus: (minutes: number, subjectQuery?: string) => void;
  onSwitchTab: (tab: 'dashboard' | 'syllabus' | 'todos' | 'goals' | 'focus' | 'settings') => void;
  onSwitchMode: (mode: AppMode) => void;
  onOpenFocusScoreHistory?: () => void;
  onToggleFocusSound?: (enabled?: boolean, soundType?: FocusSoundType) => void;
}

export const GeminiMentorChat: React.FC<GeminiMentorChatProps> = ({
  userName,
  currentTheme,
  appMode,
  subjects,
  pendingTasksCount,
  onChangeTheme,
  onCompleteTopic,
  onAddTask,
  onAddTopic,
  onStartFocus,
  onSwitchTab,
  onSwitchMode,
  onOpenFocusScoreHistory,
  onToggleFocusSound,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getStoredApiKey());
  const [activeApiKey, setActiveApiKey] = useState(() => getStoredApiKey());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial greeting from mentor
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'mentor',
      text: `Hey ${userName}! 🚀 I'm your Gemini AI Study Mentor. I'm here to push your limits, eliminate procrastination, and help you 100% complete your syllabus!\n\nTry telling me: *"Change theme to Cyberpunk"*, *"I completed Science chapter 1"*, or *"Start a 25m focus sprint"*!`,
      timestamp: 'Just now',
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Execute intercepted commands on the app
  const executeMentorAction = (action: MentorAction): string | null => {
    try {
      switch (action.type) {
        case 'change_theme': {
          const theme = action.params.theme as ThemeId;
          if (['neon-mint', 'cyberpunk', 'm-sport', 'sunset', 'monochrome'].includes(theme)) {
            onChangeTheme(theme);
            return `Theme changed to ${theme.toUpperCase()}`;
          }
          break;
        }

        case 'complete_topic': {
          const { subject = '', topic = '' } = action.params;
          const success = onCompleteTopic(subject, topic);
          if (success) {
            return `Checked off "${topic}" in ${subject} & updated LocalStorage!`;
          }
          break;
        }

        case 'add_task': {
          const { title = 'Study sprint task', priority = 'High', dueDate = 'Today' } = action.params;
          onAddTask(title, priority, dueDate);
          return `Added to-do: "${title}"`;
        }

        case 'add_topic': {
          const { subject = '', title = '', difficulty = 'Medium' } = action.params;
          const success = onAddTopic(subject, title, difficulty);
          if (success) {
            return `Added "${title}" under ${subject}`;
          }
          break;
        }

        case 'start_focus': {
          const minutes = Number(action.params.minutes) || 25;
          onStartFocus(minutes, action.params.subject);
          return `Launched ${minutes}m Pomodoro Sprint`;
        }

        case 'switch_tab': {
          const tab = action.params.tab;
          if (tab === 'focus-score' || tab === 'focus_score') {
            if (onOpenFocusScoreHistory) {
              onOpenFocusScoreHistory();
              return 'Opened 30-Day Focus Score Trajectory Chart';
            }
          }
          if (tab) {
            onSwitchTab(tab);
            return `Switched to ${tab} tab`;
          }
          break;
        }

        case 'switch_mode': {
          const mode = action.params.mode as AppMode;
          if (mode === 'workspace' || mode === 'preview') {
            onSwitchMode(mode);
            return `Switched to ${mode === 'workspace' ? 'Main Workspace' : 'Preview Mode'}`;
          }
          break;
        }

        case 'toggle_focus_sound': {
          const { enabled = true, soundType = 'rain' } = action.params;
          if (onToggleFocusSound) {
            onToggleFocusSound(enabled, soundType as FocusSoundType);
            return `Focus Sound: ${soundType === 'rain' ? 'Gentle Rain' : soundType === 'cafe' ? 'Cozy Cafe' : soundType === 'breeze' ? 'Forest Breeze' : 'Pink Noise'}`;
          }
          break;
        }
      }
    } catch (err) {
      console.error('Failed to execute mentor action:', err);
    }
    return null;
  };

  // Send message to Gemini Mentor
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    setInputMessage('');

    // Append user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Build context summary for AI
    const subjectsSummary = subjects
      .map((s) => {
        const prep = s.topics.filter((t) => t.isPrepared).length;
        return `${s.name}: ${prep}/${s.topics.length} prepared`;
      })
      .join('; ');

    const appContext = {
      userName,
      currentTheme,
      mode: appMode,
      subjectsSummary: subjectsSummary || 'No subjects currently loaded',
      pendingTasksCount,
    };

    // Build history
    const conversationHistory = messages.slice(-6).map((m) => ({
      role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
      parts: [{ text: m.text }],
    }));

    try {
      const response = await sendGeminiMentorMessage(
        query,
        conversationHistory,
        appContext,
        activeApiKey
      );

      let executedDescription: string | undefined = undefined;

      // Intercept and execute command if present!
      if (response.action) {
        const feedback = executeMentorAction(response.action);
        executedDescription = feedback || response.action.description;
      }

      const mentorMsg: ChatMessage = {
        id: `mentor-${Date.now()}`,
        sender: 'mentor',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionExecuted: response.action
          ? {
              ...response.action,
              description: executedDescription || response.action.type,
            }
          : undefined,
      };

      setMessages((prev) => [...prev, mentorMsg]);
    } catch (err) {
      console.error('Mentor error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'mentor',
          text: `I'm having a brief connection hitch, but champions never stop! 🔥 Try your prompt again or use the sample action chips below.`,
          timestamp: 'Just now',
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    setStoredApiKey(apiKeyInput.trim());
    setActiveApiKey(apiKeyInput.trim());
    setShowKeyConfig(false);
  };

  // Quick Action Prompts
  const quickActions = [
    { label: '🌧️ Rain Focus Sound', prompt: 'Turn on gentle rain focus sound' },
    { label: '📈 30-Day Focus Score', prompt: 'Show my 30-day focus score chart' },
    { label: '🎨 Switch to Cyberpunk', prompt: 'Change theme to Cyberpunk' },
    { label: '✅ Science Chapter 1 Done', prompt: 'I completed Science chapter 1' },
    { label: '⚡ 25m Focus Sprint', prompt: 'Start a 25 min focus sprint on Science' },
    { label: '📋 Add Math Task', prompt: 'Add task: Solve Math Chapter 2 questions' },
    { label: '🔥 Motivate Me & Study Plan', prompt: 'Give me a motivating study plan for today' },
  ];

  return (
    <>
      {/* 1. Floating Launcher Button (Bottom Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 p-3.5 sm:p-4 rounded-2xl border shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 flex items-center gap-2.5 cursor-pointer group select-none glass-chat-launcher"
          style={{
            borderColor: 'var(--accent-primary)',
            color: '#ffffff',
          }}
          title="Open Gemini AI Study Mentor"
          aria-label="Open Gemini AI Study Mentor"
        >
          <div className="relative">
            <Bot className="w-5 h-5 transition-transform group-hover:rotate-12" style={{ color: 'var(--accent-primary)' }} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div className="flex flex-col text-left pr-1">
            <span className="text-xs font-extrabold tracking-tight leading-tight flex items-center gap-1">
              <span>AI Mentor</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </span>
            <span className="text-[10px] opacity-60 font-mono">Gemini Online</span>
          </div>
        </button>
      )}

      {/* 2. Expanded Floating Chat Window (Glassmorphic Deep Black) */}
      {isOpen && (
        <div
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] h-[540px] max-h-[85vh] rounded-[24px] border shadow-2xl flex flex-col overflow-hidden theme-transition animate-in fade-in zoom-in-95 duration-200 glass-chat"
          style={{
            borderColor: 'var(--border-strong)',
          }}
        >
          {/* Top Header */}
          <div
            className="p-3.5 px-4 border-b flex items-center justify-between shrink-0"
            style={{
              backgroundColor: 'rgba(14, 14, 14, 0.8)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center border shadow-xs"
                style={{
                  backgroundColor: 'var(--accent-subtle)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--accent-primary)',
                }}
              >
                <Bot className="w-4 h-4" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-white tracking-tight">
                    Gemini AI Mentor
                  </h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[10px] text-white/50 leading-tight">
                  Autonomous App Control & Motivation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowKeyConfig(!showKeyConfig)}
                className={`p-1.5 rounded-lg border hover:bg-white/10 transition-colors ${
                  activeApiKey ? 'text-emerald-400' : 'text-white/60'
                }`}
                title="Configure Gemini API Key"
              >
                <Key className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg border hover:bg-white/10 transition-colors text-white/70 hover:text-white"
                title="Minimize chat"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Optional API Key Configuration Drawer */}
          {showKeyConfig && (
            <div
              className="p-3 border-b text-xs space-y-2 animate-in slide-in-from-top-2 duration-150"
              style={{
                backgroundColor: '#121212',
                borderColor: 'var(--border-subtle)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white/90 text-[11px]">
                  Google Gemini API Key
                </span>
                <span className="text-[10px] text-white/50 font-mono">
                  {activeApiKey ? 'Active' : 'Using Local Engine'}
                </span>
              </div>
              <input
                type="password"
                placeholder="AIzaSy... (leave blank for local simulation)"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border bg-black/50 text-white focus:outline-none"
                style={{ borderColor: 'var(--border-subtle)' }}
              />
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-white/50">Stored securely in your browser</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowKeyConfig(false)}
                    className="text-white/60 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveApiKey}
                    className="px-2.5 py-1 rounded bg-white text-black font-bold"
                  >
                    Save Key
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable Message Thread */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto scrollbar-thin">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed transition-all shadow-sm ${
                      isUser
                        ? 'rounded-br-xs text-white'
                        : 'rounded-bl-xs text-white/90 border'
                    }`}
                    style={{
                      backgroundColor: isUser
                        ? 'var(--accent-primary)'
                        : 'rgba(18, 18, 18, 0.9)',
                      color: isUser ? 'var(--accent-contrast)' : '#f8fafc',
                      borderColor: isUser ? 'transparent' : 'var(--border-subtle)',
                    }}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Executed Action Badge */}
                  {msg.actionExecuted && (
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-tight border mt-0.5 animate-in fade-in"
                      style={{
                        backgroundColor: 'var(--accent-subtle)',
                        borderColor: 'var(--accent-primary)',
                        color: 'var(--accent-primary)',
                      }}
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      <span>{msg.actionExecuted.description || msg.actionExecuted.type}</span>
                    </div>
                  )}

                  <span className="text-[9px] px-1 opacity-40 text-white/60">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 rounded-2xl border text-xs text-white/70 max-w-[70%]" style={{ backgroundColor: 'rgba(18, 18, 18, 0.9)', borderColor: 'var(--border-subtle)' }}>
                <Bot className="w-4 h-4 animate-spin text-emerald-400" />
                <span className="animate-pulse">Analyzing syllabus & preparing response...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Action Suggestion Chips */}
          <div
            className="p-2 px-3 border-t overflow-x-auto flex items-center gap-1.5 scrollbar-none shrink-0"
            style={{
              backgroundColor: 'rgba(12, 12, 12, 0.7)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            {quickActions.map((qa, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qa.prompt)}
                disabled={isLoading}
                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border whitespace-nowrap hover:opacity-100 opacity-70 transition-all hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40"
                style={{
                  borderColor: 'var(--border-subtle)',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  color: '#ffffff',
                }}
              >
                {qa.label}
              </button>
            ))}
          </div>

          {/* Bottom Chat Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t flex items-center gap-2 shrink-0"
            style={{
              backgroundColor: 'rgba(10, 10, 10, 0.95)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <input
              type="text"
              placeholder="Ask anything or command app... (e.g. 'Theme to Cyberpunk')"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border bg-transparent focus:outline-none focus:ring-1 focus:ring-current text-white placeholder:text-white/40"
              style={{
                borderColor: 'var(--border-subtle)',
                backgroundColor: 'rgba(18, 18, 18, 0.8)',
              }}
            />

            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="p-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-30 cursor-pointer shadow-sm flex items-center justify-center"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--accent-contrast)',
              }}
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
