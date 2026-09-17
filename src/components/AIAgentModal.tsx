import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, X, Send, Mic, Bot, User } from 'lucide-react';
import type { ChatMessage, ParsedTask, Task } from '@/types';
import { parseNaturalLanguage, generateChecklistItems, generateAssistantResponse, filterTasksResponse, isFilterQuery, isCreateQuery } from '@/lib/aiParser';
import { TaskPreviewCard } from './TaskPreviewCard';

interface AIAgentModalProps {
  open: boolean;
  onClose: () => void;
  tasks: Task[];
  onConfirmTask: (task: ParsedTask) => void;
  onConfirmMultiple: (tasks: ParsedTask[]) => void;
}

const SUGGESTIONS = [
  'Remind me to take medicine tomorrow at 8 AM',
  'Create a shopping checklist for making chicken soup',
  'Show me my pending utility bill reminders for this week',
  'Add a high priority task to pay rent on the 1st',
];

export function AIAgentModal({ open, onClose, tasks, onConfirmTask, onConfirmMultiple }: AIAgentModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your AI assistant. Tell me what you need — I can create tasks, set reminders, generate checklists, and filter your existing tasks. Try something like:\n\n• \"Remind me to take medicine tomorrow at 8 AM\"\n• \"Create a shopping checklist for making chicken soup\"\n• \"Show me my pending utility bill reminders for this week\"",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));

    let parsedTasks: ParsedTask[] = [];
    let responseContent = '';
    let previewTask: ParsedTask | undefined;
    let isMultiPreview = false;

    if (isFilterQuery(text) && !isCreateQuery(text)) {
      const result = filterTasksResponse(tasks, text);
      responseContent = result.response;
      if (result.tasks.length > 0) {
        const taskList = result.tasks.map((t) => `• ${t.title}${t.due_date ? ` — ${t.due_date}` : ''}${t.due_time ? ` at ${t.due_time}` : ''}${t.completed ? ' (completed)' : ''}`).join('\n');
        responseContent += '\n\n' + taskList;
      }
    } else if (isCreateQuery(text)) {
      const lower = text.toLowerCase();
      if (lower.includes('checklist') || lower.includes('shopping list')) {
        parsedTasks = generateChecklistItems(text);
      } else {
        parsedTasks = [parseNaturalLanguage(text)];
      }

      if (parsedTasks.length > 1) {
        isMultiPreview = true;
        previewTask = parsedTasks[0];
        responseContent = generateAssistantResponse(text, parsedTasks);
      } else {
        previewTask = parsedTasks[0];
        responseContent = generateAssistantResponse(text, parsedTasks);
      }
    } else {
      parsedTasks = [parseNaturalLanguage(text)];
      previewTask = parsedTasks[0];
      responseContent = generateAssistantResponse(text, parsedTasks);
    }

    const assistantMsg: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: responseContent,
      timestamp: Date.now(),
      previewTask: isMultiPreview ? undefined : previewTask,
    };

    if (isMultiPreview) {
      assistantMsg.previewTask = parsedTasks;
    }

    setMessages((prev) => [...prev, assistantMsg]);
    setIsThinking(false);
  }, [isThinking, tasks]);

  const handleConfirmPreview = (task: ParsedTask, msgId: string) => {
    onConfirmTask(task);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, content: m.content + '\n\n✓ Task saved successfully!', previewTask: undefined }
          : m
      )
    );
  };

  const handleConfirmMultiPreview = (tasks: ParsedTask[], msgId: string) => {
    onConfirmMultiple(tasks);
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, content: m.content + '\n\n✓ All tasks saved successfully!', previewTask: undefined }
          : m
      )
    );
  };

  const handleDismissPreview = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? { ...m, content: m.content + '\n\n✗ Task discarded.', previewTask: undefined }
          : m
      )
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-slide-in-right h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-primary-600 to-accent-600">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">AI Assistant</h2>
              <p className="text-xs text-white/70">Natural language task manager</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50 dark:bg-slate-950">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                msg.role === 'user'
                  ? 'bg-slate-200 dark:bg-slate-700'
                  : 'bg-gradient-to-br from-primary-500 to-accent-500'
              }`}>
                {msg.role === 'user'
                  ? <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  : <Bot className="w-4 h-4 text-white" />
                }
              </div>

              <div className={`flex-1 min-w-0 ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                <div className={`inline-block rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-primary-600 text-white rounded-tr-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700'
                }`}>
                  {msg.content}
                </div>

                {/* Single task preview */}
                {msg.previewTask && !Array.isArray(msg.previewTask) && (
                  <TaskPreviewCard
                    task={msg.previewTask}
                    onConfirm={(task) => handleConfirmPreview(task, msg.id)}
                    onDismiss={() => handleDismissPreview(msg.id)}
                  />
                )}

                {/* Multi task preview */}
                {msg.previewTask && Array.isArray(msg.previewTask) && (
                  <div className="mt-3 space-y-2">
                    <div className="rounded-xl border-2 border-dashed border-primary-300 dark:border-primary-700 bg-primary-50/50 dark:bg-primary-950/20 p-3">
                      <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 uppercase tracking-wide mb-2">
                        Checklist Preview ({msg.previewTask.length} tasks)
                      </p>
                      <div className="space-y-1.5 mb-3 max-h-40 overflow-y-auto">
                        {msg.previewTask.map((t, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <span className="w-5 h-5 rounded-md bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">
                              {i + 1}
                            </span>
                            {t.title}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmMultiPreview(msg.previewTask as ParsedTask[], msg.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-success-500 text-white text-sm font-medium hover:bg-success-600 transition-colors"
                        >
                          Save All ({msg.previewTask.length})
                        </button>
                        <button
                          onClick={() => handleDismissPreview(msg.id)}
                          className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          Discard
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Thinking indicator */}
          {isThinking && (
            <div className="flex gap-2.5">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-700 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 hover:text-primary-600 dark:hover:text-primary-400 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <button
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors flex items-center justify-center"
              title="Voice command (simulated)"
            >
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              placeholder="Ask AI to create or find tasks..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-slate-700 outline-none transition-all"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isThinking}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
