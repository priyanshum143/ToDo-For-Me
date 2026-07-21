import { Platform, Share } from 'react-native';
import type { Task } from '../types/task';
import { isTaskCompletedOnDate } from './recurrence';

export function buildDayText(title: string, dateLabel: string, tasks: Task[], dateKey: string): string {
  const lines: string[] = [];
  lines.push(`${title} — ${dateLabel}`);
  lines.push('─'.repeat(32));

  if (tasks.length === 0) {
    lines.push('No tasks');
  } else {
    const done = tasks.filter((t) => isTaskCompletedOnDate(t, dateKey));
    const pending = tasks.filter((t) => !isTaskCompletedOnDate(t, dateKey));

    for (const t of pending) {
      lines.push(`☐  ${t.title}`);
    }
    if (pending.length > 0 && done.length > 0) {
      lines.push('');
    }
    for (const t of done) {
      lines.push(`☑  ${t.title}`);
    }

    lines.push('');
    lines.push(`${done.length}/${tasks.length} completed`);
  }

  return lines.join('\n');
}

export async function shareDayText(text: string, title: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      await window.navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.top = '0';
      el.style.left = '0';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    return;
  }

  await Share.share({ message: text, title });
}
