import type { Category, ParsedTask, Priority, Task } from '@/types';

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  'Health': ['medicine', 'doctor', 'appointment', 'pill', 'exercise', 'gym', 'workout', 'health', 'dentist', 'pharmacy', 'hospital', 'checkup', 'vitamin', 'walk', 'jog'],
  'Grocery': ['grocery', 'groceries', 'shopping', 'milk', 'bread', 'eggs', 'fruit', 'vegetable', 'store', 'supermarket', 'buy', 'shop', 'soup', 'ingredients', 'chicken', 'recipe'],
  'Utility Bills': ['bill', 'bills', 'electric', 'electricity', 'water', 'gas', 'internet', 'phone', 'rent', 'mortgage', 'insurance', 'utility', 'utilities', 'payment', 'pay'],
  'General': [],
};

const PRIORITY_KEYWORDS: Record<Priority, string[]> = {
  high: ['urgent', 'important', 'asap', 'critical', 'immediately', 'high priority', 'must'],
  low: ['low priority', 'whenever', 'no rush', 'someday', 'optional'],
  medium: [],
};

const DAY_OFFSETS: Record<string, number> = {
  'today': 0,
  'tomorrow': 1,
  'day after tomorrow': 2,
  'next week': 7,
  'next month': 30,
};

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export const TIME_PARSE_SYSTEM_INSTRUCTION = 'Time must always be normalized to 24-hour HH:mm format. Rules: 12:01 PM -> 12:01, 12:00 PM -> 12:00, 12:00 AM -> 00:00, 1:05 PM -> 13:05, 9:30 AM -> 09:30. Preserve the exact minutes and never round 12-hour times to the next hour.';

function formatDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

function getNextWeekday(weekday: string): string {
  const target = WEEKDAYS.indexOf(weekday.toLowerCase());
  if (target === -1) return formatDate(0);
  const now = new Date().getDay();
  let diff = target - now;
  if (diff <= 0) diff += 7;
  return formatDate(diff);
}

function parseDate(input: string): string | null {
  const lower = input.toLowerCase();

  for (const [key, offset] of Object.entries(DAY_OFFSETS)) {
    if (lower.includes(key)) return formatDate(offset);
  }

  for (const day of WEEKDAYS) {
    if (lower.includes(`next ${day}`)) return getNextWeekday(day);
    if (lower.includes(`on ${day}`)) return getNextWeekday(day);
    if (lower.includes(`this ${day}`)) return getNextWeekday(day);
  }

  const inMatch = lower.match(/in (\d+) day/);
  if (inMatch) return formatDate(parseInt(inMatch[1], 10));

  const inWeeksMatch = lower.match(/in (\d+) week/);
  if (inWeeksMatch) return formatDate(parseInt(inWeeksMatch[1], 10) * 7);

  const dateMatch = lower.match(/(?:on |by )?(\d{1,2})(?:st|nd|rd|th)? (january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const monthMap: Record<string, number> = {
      january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2, april: 3, apr: 3,
      may: 4, june: 5, jun: 5, july: 6, jul: 6, august: 7, aug: 7,
      september: 8, sep: 8, sept: 8, october: 9, oct: 9, november: 10, nov: 10, december: 11, dec: 11,
    };
    const month = monthMap[dateMatch[2]];
    const year = new Date().getFullYear();
    const d = new Date(year, month, day);
    if (d < new Date()) d.setFullYear(year + 1);
    return d.toISOString().split('T')[0];
  }

  return null;
}

function normalizeTime(hour: number, minute: number, meridiem?: 'am' | 'pm'): string {
  let normalizedHour = hour;

  if (meridiem === 'pm' && normalizedHour !== 12) {
    normalizedHour += 12;
  }

  if (meridiem === 'am' && normalizedHour === 12) {
    normalizedHour = 0;
  }

  if (normalizedHour > 23 || minute > 59) {
    throw new Error(`Invalid time value: ${hour}:${minute} ${meridiem ?? ''}`.trim());
  }

  return `${String(normalizedHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function parseTime(input: string): string | null {
  const lower = input.toLowerCase();

  const timeMatch = lower.match(/(\d{1,2})(?::(\d{1,2}))?\s*(am|pm)/);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const period = timeMatch[3] as 'am' | 'pm';

    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    if (hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;

    return normalizeTime(hour, minute, period);
  }

  const hourOnly = lower.match(/\bat (\d{1,2})\b/);
  if (hourOnly) {
    let hour = parseInt(hourOnly[1], 10);
    if (hour < 1 || hour > 23) return null;
    if (hour < 12 && lower.includes('evening')) hour += 12;
    if (hour === 24) hour = 0;
    return `${String(hour).padStart(2, '0')}:00`;
  }

  const morningMatch = lower.match(/(\d{1,2}) (?:in the )?morning/);
  if (morningMatch) {
    const hour = parseInt(morningMatch[1], 10);
    if (hour < 1 || hour > 12) return null;
    return normalizeTime(hour, 0, 'am');
  }

  const eveningMatch = lower.match(/(\d{1,2}) (?:in the )?evening/);
  if (eveningMatch) {
    const hour = parseInt(eveningMatch[1], 10);
    if (hour < 1 || hour > 12) return null;
    return normalizeTime(hour, 0, 'pm');
  }

  if (lower.includes('noon')) return '12:00';
  if (lower.includes('midnight')) return '00:00';

  return null;
}

function detectCategory(input: string): Category {
  const lower = input.toLowerCase();
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (cat === 'General') continue;
    for (const kw of keywords) {
      if (lower.includes(kw)) return cat as Category;
    }
  }
  return 'General';
}

function detectPriority(input: string): Priority {
  const lower = input.toLowerCase();
  for (const [pri, keywords] of Object.entries(PRIORITY_KEYWORDS)) {
    if (pri === 'medium') continue;
    for (const kw of keywords) {
      if (lower.includes(kw)) return pri as Priority;
    }
  }
  return 'medium';
}

function extractTitle(input: string): string {
  let title = input;

  title = title.replace(/^(remind me to|remind me about|remind me|add a (?:task|reminder) to|add (?:a )?(?:task|reminder)|create a (?:task|reminder) to|create a (?:task|reminder)|create (?:a )?(?:task|reminder)|add|create|set a reminder to|set a reminder)\s+/i, '');
  title = title.replace(/\b(tomorrow|today|day after tomorrow|next week|next month)\b/gi, '');
  title = title.replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '');
  title = title.replace(/\b(at|on|by)\s+\d{1,2}(?::\d{2})?\s*(am|pm)?\b/gi, '');
  title = title.replace(/\b\d{1,2}(?::\d{2})?\s*(am|pm)\b/gi, '');
  title = title.replace(/\b(in the morning|in the evening|at noon|at midnight)\b/gi, '');
  title = title.replace(/\b(urgent|high priority|low priority|asap|important)\b/gi, '');
  title = title.replace(/\b(in \d+ days?|in \d+ weeks?)\b/gi, '');
  title = title.replace(/\b(\d{1,2}(?:st|nd|rd|th)? (january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec))\b/gi, '');

  title = title.replace(/\s+/g, ' ').trim();
  title = title.replace(/^[-,]+|[-,]+$/g, '').trim();

  if (!title) title = input.replace(/^(remind me to|add|create)\s+/i, '').trim() || 'New Task';

  return title.charAt(0).toUpperCase() + title.slice(1);
}

export function parseNaturalLanguage(input: string): ParsedTask {
  return {
    title: extractTitle(input),
    description: null,
    category: detectCategory(input),
    due_date: parseDate(input),
    due_time: parseTime(input),
    priority: detectPriority(input),
  };
}

export function generateChecklistItems(input: string): ParsedTask[] {
  const lower = input.toLowerCase();

  const soupMatch = lower.match(/(?:chicken|vegetable|tomato|minestrone|noodle)\s*soup/);
  if (soupMatch) {
    const soupType = soupMatch[1] || 'chicken';
    const items: Record<string, string[]> = {
      chicken: ['Buy whole chicken', 'Get carrots', 'Get celery', 'Get onions', 'Get garlic', 'Get chicken broth', 'Get egg noodles', 'Get bay leaves', 'Get fresh parsley'],
      vegetable: ['Get mixed vegetables', 'Get vegetable broth', 'Get potatoes', 'Get carrots', 'Get onions', 'Get garlic', 'Get canned tomatoes', 'Get fresh herbs'],
      tomato: ['Get canned tomatoes', 'Get fresh tomatoes', 'Get basil', 'Get garlic', 'Get onions', 'Get olive oil', 'Get vegetable broth', 'Get heavy cream'],
      minestrone: ['Get canned beans', 'Get carrots', 'Get celery', 'Get onions', 'Get garlic', 'Get canned tomatoes', 'Get pasta', 'Get vegetable broth', 'Get spinach'],
      noodle: ['Get egg noodles', 'Get chicken broth', 'Get carrots', 'Get celery', 'Get garlic', 'Get ginger', 'Get soy sauce', 'Get green onions'],
    };
    const type = soupType.includes('vegetable') ? 'vegetable' : soupType.includes('tomato') ? 'tomato' : soupType.includes('minestrone') ? 'minestrone' : soupType.includes('noodle') ? 'noodle' : 'chicken';
    const ingredients = items[type] || items.chicken;
    return ingredients.map((item) => ({
      title: item,
      description: `Ingredient for ${type} soup`,
      category: 'Grocery' as Category,
      due_date: formatDate(0),
      due_time: null,
      priority: 'medium' as Priority,
    }));
  }

  const generalMatch = lower.match(/(?:shopping )?(?:checklist|list) for (.+)/);
  if (generalMatch) {
    const subject = generalMatch[1].trim();
    return [
      { title: `Research ${subject}`, description: null, category: 'General' as Category, due_date: formatDate(0), due_time: null, priority: 'medium' as Priority },
      { title: `Get supplies for ${subject}`, description: null, category: 'Grocery' as Category, due_date: formatDate(0), due_time: null, priority: 'medium' as Priority },
      { title: `Prepare ${subject}`, description: null, category: 'General' as Category, due_date: formatDate(0), due_time: null, priority: 'medium' as Priority },
    ];
  }

  return [parseNaturalLanguage(input)];
}

export function generateAssistantResponse(input: string, parsedTasks: ParsedTask[]): string {
  if (parsedTasks.length > 1) {
    return `I've parsed your request into ${parsedTasks.length} tasks. Review the checklist below and confirm to save them all.`;
  }

  const task = parsedTasks[0];
  const parts: string[] = [`I've parsed your request. Here's what I understood:`];
  parts.push(`• Task: ${task.title}`);
  if (task.category !== 'General') parts.push(`• Category: ${task.category}`);
  if (task.due_date) parts.push(`• Date: ${task.due_date}`);
  if (task.due_time) parts.push(`• Time: ${task.due_time}`);
  if (task.priority !== 'medium') parts.push(`• Priority: ${task.priority}`);
  parts.push(`Review the preview card and confirm to save, or edit any field first.`);
  return parts.join('\n');
}

export function filterTasksResponse(tasks: Task[], input: string): { response: string; tasks: Task[] } {
  const lower = input.toLowerCase();

  let filtered = tasks;
  let filterDesc = '';

  if (lower.includes('pending') || lower.includes('incomplete') || lower.includes('not done')) {
    filtered = tasks.filter((t) => !t.completed);
    filterDesc = 'pending';
  } else if (lower.includes('completed') || lower.includes('done')) {
    filtered = tasks.filter((t) => t.completed);
    filterDesc = 'completed';
  }

  if (lower.includes('utility') || lower.includes('bill')) {
    filtered = filtered.filter((t) => t.category === 'Utility Bills');
    filterDesc = (filterDesc ? filterDesc + ' ' : '') + 'utility bill';
  } else if (lower.includes('grocery') || lower.includes('shopping')) {
    filtered = filtered.filter((t) => t.category === 'Grocery');
    filterDesc = (filterDesc ? filterDesc + ' ' : '') + 'grocery';
  } else if (lower.includes('health') || lower.includes('medicine')) {
    filtered = filtered.filter((t) => t.category === 'Health');
    filterDesc = (filterDesc ? filterDesc + ' ' : '') + 'health';
  }

  if (lower.includes('this week')) {
    const now = new Date();
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    filtered = filtered.filter((t) => {
      if (!t.due_date) return false;
      const d = new Date(t.due_date);
      return d >= now && d <= weekEnd;
    });
    filterDesc = (filterDesc ? filterDesc + ' ' : '') + 'this week';
  }

  if (lower.includes('today')) {
    const today = formatDate(0);
    filtered = filtered.filter((t) => t.due_date === today);
    filterDesc = 'today';
  }

  if (lower.includes('high') && lower.includes('priority')) {
    filtered = filtered.filter((t) => t.priority === 'high');
    filterDesc = (filterDesc ? filterDesc + ' ' : '') + 'high priority';
  }

  if (filtered.length === 0) {
    return { response: `I couldn't find any ${filterDesc || 'matching'} tasks. Try a different filter or add a new task.`, tasks: [] };
  }

  return {
    response: `I found ${filtered.length} ${filterDesc || ''} task${filtered.length !== 1 ? 's' : ''}. Here they are:`,
    tasks: filtered,
  };
}

export function isFilterQuery(input: string): boolean {
  const lower = input.toLowerCase();
  return lower.includes('show') || lower.includes('what') || lower.includes('list') || lower.includes('find') || lower.includes('which') || lower.includes('how many');
}

export function isCreateQuery(input: string): boolean {
  const lower = input.toLowerCase();
  return lower.includes('remind') || lower.includes('add') || lower.includes('create') || lower.includes('set') || lower.includes('make') || lower.includes('checklist') || lower.includes('shopping list');
}
