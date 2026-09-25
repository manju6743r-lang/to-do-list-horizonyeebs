/**
 * Gemini AI Study Mentor API Integration & Command Parser
 */

export interface MentorAction {
  type:
    | 'change_theme'
    | 'complete_topic'
    | 'add_task'
    | 'add_topic'
    | 'start_focus'
    | 'switch_tab'
    | 'switch_mode'
    | 'toggle_focus_sound';
  params: Record<string, any>;
  description?: string;
}

export interface MentorResponse {
  reply: string;
  action?: MentorAction;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor' | 'system';
  text: string;
  timestamp: string;
  actionExecuted?: MentorAction;
  isError?: boolean;
}

// Default constant as requested by user
export const DEFAULT_GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY';
const API_KEY_STORAGE_KEY = 'horizon_gemini_api_key_v1';

export const getStoredApiKey = (): string => {
  try {
    const saved = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch (e) {}

  // Check environment variables if available
  const envKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? (process.env as any)?.GEMINI_API_KEY : '');
  if (envKey && envKey !== 'YOUR_GEMINI_API_KEY' && envKey !== 'MY_GEMINI_API_KEY') {
    return envKey;
  }

  return '';
};

export const setStoredApiKey = (key: string): void => {
  try {
    if (key.trim()) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  } catch (e) {}
};

/**
 * System prompt defining the AI Mentor persona and JSON command schema
 */
export const buildSystemInstruction = (appContext: {
  userName: string;
  currentTheme: string;
  mode: string;
  subjectsSummary: string;
  pendingTasksCount: number;
}): string => {
  return `
You are "Horizon Mentor", an energetic, inspiring, and relentless academic study buddy & personal productivity coach for ${appContext.userName}.
Your mission is to motivate the student, push them to finish their syllabus, celebrate completed chapters, eliminate procrastination, and help them achieve top grades.

TONE & STYLE:
- Energetic, friendly, encouraging, and sharp ("Let's crush this syllabus!", "Focus mode engaged!", "Champion work!").
- Keep explanations concise, clear, and actionable.
- Always include an energetic emoji.

APP CONTROL & COMMAND CAPABILITY:
You do NOT just chat with text. You have direct control over the user's web app!
Whenever the user's message implies an action on the app, you MUST return a valid JSON object with both your motivational "reply" and an "action" command.

COMMANDS AVAILABLE:
1. Change Theme:
   User: "Change theme to Cyberpunk" / "Make it M-Sport"
   Action: { "type": "change_theme", "params": { "theme": "cyberpunk" | "neon-mint" | "m-sport" | "sunset" | "monochrome" } }

2. Complete Syllabus Topic ("I am prepared"):
   User: "I completed Science chapter 1" / "Mark matter in surroundings prepared"
   Action: { "type": "complete_topic", "params": { "subject": "Science", "topic": "Matter" } }

3. Add To-Do Task:
   User: "Add a task to solve 10 physics numericals tonight"
   Action: { "type": "add_task", "params": { "title": "Solve 10 physics numericals", "priority": "High" | "Medium" | "Low", "dueDate": "Today" | "Tomorrow" } }

4. Add Syllabus Chapter / Topic:
   User: "Add a new chapter Thermodynamics to Physics"
   Action: { "type": "add_topic", "params": { "subject": "Science", "title": "Thermodynamics", "difficulty": "Medium" } }

5. Start Pomodoro Focus Sprint:
   User: "Start a 25 min focus sprint on Math"
   Action: { "type": "start_focus", "params": { "minutes": 25, "subject": "Math" } }

6. Switch Navigation Tab:
   User: "Show me my syllabus" / "Open my tasks" / "Go to dashboard"
   Action: { "type": "switch_tab", "params": { "tab": "syllabus" | "todos" | "dashboard" | "focus" | "settings" } }

7. Switch Mode:
   User: "Switch to Main Workspace" / "Turn on Preview Mode"
   Action: { "type": "switch_mode", "params": { "mode": "workspace" | "preview" } }

RESPONSE FORMAT:
You MUST ALWAYS respond with a JSON object in this format (no markdown backticks surrounding it, or standard JSON string):
{
  "reply": "Your energetic, motivational response to the student here...",
  "action": {
    "type": "command_type",
    "params": { ... }
  }
}

If no action is needed (just a general question or study advice), set "action": null.

CURRENT APP STATE FOR CONTEXT:
- Student Name: ${appContext.userName}
- Current Theme: ${appContext.currentTheme}
- Current Mode: ${appContext.mode}
- Subjects & Progress: ${appContext.subjectsSummary}
- Pending Tasks: ${appContext.pendingTasksCount}
`.trim();
};

/**
 * Call Google Gemini API with system instructions and user chat prompt
 */
export async function sendGeminiMentorMessage(
  userMessage: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  appContext: {
    userName: string;
    currentTheme: string;
    mode: string;
    subjectsSummary: string;
    pendingTasksCount: number;
  },
  customApiKey?: string
): Promise<MentorResponse> {
  const apiKey = (customApiKey || getStoredApiKey() || DEFAULT_GEMINI_API_KEY).trim();

  // If no real API key is configured yet, use the intelligent local fallback
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    return simulateLocalMentor(userMessage, appContext);
  }

  // Model selection per instructions: gemini-3.5-flash for general tasks, or gemini-2.5-flash
  const modelName = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const systemInstructionText = buildSystemInstruction(appContext);

  const contents = [
    ...history.slice(-8), // Keep recent conversation turns for multi-turn context
    {
      role: 'user',
      parts: [{ text: userMessage }],
    },
  ];

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstructionText }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => null);
      const errMsg = errorJson?.error?.message || `API error (${response.status})`;
      console.warn('Gemini API call failed, falling back to local mentor engine:', errMsg);
      // If error is invalid API key or quota, provide helpful message with local simulation
      const fallback = simulateLocalMentor(userMessage, appContext);
      fallback.reply = `(Gemini Note: ${errMsg})\n\n` + fallback.reply;
      return fallback;
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return simulateLocalMentor(userMessage, appContext);
    }

    return parseMentorResponse(candidateText, userMessage, appContext);
  } catch (err: any) {
    console.error('Fetch error calling Gemini API:', err);
    return simulateLocalMentor(userMessage, appContext);
  }
}

/**
 * Parse JSON or extracted text from Gemini output
 */
export function parseMentorResponse(
  rawText: string,
  userQuery: string,
  appContext: any
): MentorResponse {
  try {
    // Strip markdown code fences if present (e.g. ```json ... ```)
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleaned);

    if (parsed && typeof parsed.reply === 'string') {
      return {
        reply: parsed.reply,
        action: parsed.action || undefined,
      };
    }
  } catch (e) {
    // If not strict JSON, treat rawText as reply and attempt to extract action from intent
    console.debug('Raw response was not strict JSON, extracting intent:', rawText);
  }

  // Fallback intent extractor if Gemini returned conversational text without JSON wrapper
  const detectedAction = extractActionFromText(userQuery);
  return {
    reply: rawText,
    action: detectedAction || undefined,
  };
}

/**
 * Intelligent local intent parser when no API key is provided
 * Allows the user to test all DOM actions & motivating replies immediately out of the box!
 */
export function simulateLocalMentor(
  query: string,
  appContext: {
    userName: string;
    currentTheme: string;
    mode: string;
    subjectsSummary: string;
    pendingTasksCount: number;
  }
): MentorResponse {
  const q = query.toLowerCase();

  // 1. Theme Change
  if (q.includes('theme') || q.includes('cyberpunk') || q.includes('neon') || q.includes('sport') || q.includes('sunset') || q.includes('monochrome')) {
    let theme: string = 'neon-mint';
    let themeName = 'Neon Mint';

    if (q.includes('cyberpunk') || q.includes('pink') || q.includes('cyan')) {
      theme = 'cyberpunk';
      themeName = 'Cyberpunk Neon';
    } else if (q.includes('sport') || q.includes('bmw') || q.includes('m-sport') || q.includes('blue')) {
      theme = 'm-sport';
      themeName = 'M-Sport Precision';
    } else if (q.includes('sunset') || q.includes('orange') || q.includes('yellow')) {
      theme = 'sunset';
      themeName = 'Sunset Amber';
    } else if (q.includes('monochrome') || q.includes('white') || q.includes('mono')) {
      theme = 'monochrome';
      themeName = 'Monochrome Minimal';
    }

    return {
      reply: `Boom! Switched your aesthetic to **${themeName}**! High contrast on deep black so your eyes stay locked on the target. Let's get to work! 🚀`,
      action: {
        type: 'change_theme',
        params: { theme },
        description: `Switched theme to ${themeName}`,
      },
    };
  }

  // 2. Syllabus / Chapter Completed ("I completed Science chapter 1")
  if (
    (q.includes('completed') || q.includes('finished') || q.includes('prepared') || q.includes('done with')) &&
    (q.includes('chapter') || q.includes('science') || q.includes('math') || q.includes('topic') || q.includes('matter'))
  ) {
    let subject = 'Science';
    let topic = 'Matter';

    if (q.includes('math')) {
      subject = 'Mathematics';
      topic = 'Polynomials';
    } else if (q.includes('cs') || q.includes('python') || q.includes('algorithm')) {
      subject = 'Computer Science';
      topic = 'Binary';
    } else if (q.includes('force') || q.includes('motion')) {
      subject = 'Science';
      topic = 'Force';
    } else if (q.includes('gravitation')) {
      subject = 'Science';
      topic = 'Gravitation';
    }

    return {
      reply: `YES! That's what I'm talking about, ${appContext.userName}! 🎉 I've checked off "${topic}" under ${subject} in your syllabus tracker and updated your progress bar in LocalStorage. Keep this winning streak alive!`,
      action: {
        type: 'complete_topic',
        params: { subject, topic },
        description: `Marked ${topic} (${subject}) as Prepared`,
      },
    };
  }

  // 3. Start Focus / Pomodoro Sprint
  if (q.includes('focus') || q.includes('pomodoro') || q.includes('timer') || q.includes('sprint')) {
    let minutes = 25;
    const match = q.match(/(\d+)\s*(?:min|minute)/);
    if (match) minutes = parseInt(match[1], 10);

    return {
      reply: `Locked and loaded! ⏱️ Starting a ${minutes}-minute deep focus sprint right now. Put your phone away, silence all tabs, and enter the flow state! Let's conquer this! 🔥`,
      action: {
        type: 'start_focus',
        params: { minutes },
        description: `Started ${minutes}m Pomodoro Sprint`,
      },
    };
  }

  // 4. Add Task to To-Do List
  if (q.includes('add task') || q.includes('todo') || q.includes('to-do') || q.includes('remind me to') || q.includes('homework')) {
    const cleanTitle = query
      .replace(/add\s+(?:a\s+)?task\s+(?:to\s+)?/i, '')
      .replace(/remind\s+me\s+to\s+/i, '')
      .replace(/create\s+(?:a\s+)?todo\s+(?:for\s+)?/i, '')
      .trim();

    return {
      reply: `Got it! Added "${cleanTitle || 'Solve 10 practice numericals'}" to your high-priority To-Do List! Step by step, you're eliminating procrastination. 🎯`,
      action: {
        type: 'add_task',
        params: {
          title: cleanTitle || 'Solve practice numericals',
          priority: 'High',
          dueDate: 'Today',
        },
        description: `Added task: "${cleanTitle || 'Solve practice numericals'}"`,
      },
    };
  }

  // 5. Open / Switch Tab or Focus Score Chart
  if (q.includes('focus score') || q.includes('score chart') || q.includes('30 day') || q.includes('score trajectory')) {
    return {
      reply: `Opening your **30-Day Focus Score Trajectory Line Chart** right now! 📈 Notice how your daily study duration and session completions actively drive your Flow State score! Keep crushing your sprint goals! 🔥`,
      action: { type: 'switch_tab', params: { tab: 'focus-score' }, description: 'Opened 30-Day Focus Score Chart' },
    };
  }

  // 6. Ambient Focus Sound Toggle
  if (
    q.includes('sound') ||
    q.includes('rain') ||
    q.includes('white noise') ||
    q.includes('cafe sound') ||
    q.includes('ambient') ||
    q.includes('breeze')
  ) {
    const isRain = q.includes('rain');
    const isCafe = q.includes('cafe');
    const isBreeze = q.includes('breeze') || q.includes('wind');
    const isPink = q.includes('pink') || q.includes('white');
    const soundType = isRain ? 'rain' : isCafe ? 'cafe' : isBreeze ? 'breeze' : isPink ? 'pink-noise' : 'rain';
    const soundName = isRain ? 'Gentle Rain 🌧️' : isCafe ? 'Cozy Cafe ☕' : isBreeze ? 'Forest Breeze 🍃' : 'Pink Noise 🌊';
    return {
      reply: `Activated **Focus Ambient Sound** with **${soundName}**! 🎧 It will play automatically whenever your timer is running to help you enter deep flow state.`,
      action: {
        type: 'toggle_focus_sound',
        params: { enabled: true, soundType },
        description: `Armed Focus Sound: ${soundName}`,
      },
    };
  }

  if (q.includes('show') || q.includes('open') || q.includes('go to') || q.includes('view')) {
    if (q.includes('syllabus')) {
      return {
        reply: `Navigating to your **Syllabus Tracker**! Look at those progress bars—let's turn every single one to 100%! 📚`,
        action: { type: 'switch_tab', params: { tab: 'syllabus' } },
      };
    }
    if (q.includes('todo') || q.includes('task') || q.includes('list')) {
      return {
        reply: `Opening your **To-Do List**! Knock these out one by one! 📋`,
        action: { type: 'switch_tab', params: { tab: 'todos' } },
      };
    }
    if (q.includes('dashboard') || q.includes('home')) {
      return {
        reply: `Taking you back to the **Master Dashboard** overview! 🚀`,
        action: { type: 'switch_tab', params: { tab: 'dashboard' } },
      };
    }
    if (q.includes('setting')) {
      return {
        reply: `Opening your **Workspace Settings**! ⚙️`,
        action: { type: 'switch_tab', params: { tab: 'settings' } },
      };
    }
  }

  // 6. Motivation & Study Plan
  if (q.includes('motivate') || q.includes('tired') || q.includes('lazy') || q.includes('plan') || q.includes('help')) {
    return {
      reply: `Listen to me, ${appContext.userName}: Champions don't wait for motivation—they build discipline! 🔥 You have exams on the horizon, but you also have the grit to ace them. 

Here is your 3-Step Battle Plan right now:
1. **Pick 1 unfinished chapter** from Science or Math.
2. **Hit a 25-minute Pomodoro Sprint** with zero distractions.
3. **Tick the "I am prepared" checkbox** and watch that syllabus progress bar climb!

Are you ready to show up for your future self? Tell me "Start focus" and let's roll! ⚡`,
    };
  }

  // General default friendly energetic response
  return {
    reply: `I'm with you, ${appContext.userName}! 🚀 You can ask me to change themes ("Change theme to Cyberpunk"), check off completed chapters ("I completed Science chapter 1"), add tasks ("Add task: Solve Math Ex 7.2"), or launch a Pomodoro focus sprint! What are we conquering next?`,
  };
}

function extractActionFromText(text: string): MentorAction | null {
  const q = text.toLowerCase();
  if (q.includes('cyberpunk')) return { type: 'change_theme', params: { theme: 'cyberpunk' } };
  if (q.includes('m-sport') || q.includes('sport')) return { type: 'change_theme', params: { theme: 'm-sport' } };
  if (q.includes('sunset')) return { type: 'change_theme', params: { theme: 'sunset' } };
  if (q.includes('monochrome')) return { type: 'change_theme', params: { theme: 'monochrome' } };
  if (q.includes('neon') || q.includes('mint')) return { type: 'change_theme', params: { theme: 'neon-mint' } };
  return null;
}
