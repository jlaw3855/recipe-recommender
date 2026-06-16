import fs from 'fs';
import { ENV_EXAMPLE_FILE_PATH, ENV_FILE_PATH } from '../paths.js';

/** Escape and wrap a value for safe .env storage. */
function formatEnvValue(value: string): string {
  if (/[\s#="'\\]/.test(value)) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return value;
}

/** Update keys in .env in place, preserving comments and blank lines. */
export function upsertEnvVars(updates: Record<string, string>): void {
  let content: string;

  if (fs.existsSync(ENV_FILE_PATH)) {
    content = fs.readFileSync(ENV_FILE_PATH, 'utf-8');
  } else if (fs.existsSync(ENV_EXAMPLE_FILE_PATH)) {
    content = fs.readFileSync(ENV_EXAMPLE_FILE_PATH, 'utf-8');
  } else {
    content = '';
  }

  const lines = content.split('\n');
  const replacedKeys = new Set<string>();

  const newLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return line;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) return line;

    const key = trimmed.slice(0, eqIndex).trim();
    if (key in updates) {
      replacedKeys.add(key);
      return `${key}=${formatEnvValue(updates[key])}`;
    }

    return line;
  });

  for (const [key, value] of Object.entries(updates)) {
    if (!replacedKeys.has(key)) {
      newLines.push(`${key}=${formatEnvValue(value)}`);
    }
  }

  const output = newLines.join('\n');
  fs.writeFileSync(ENV_FILE_PATH, output.endsWith('\n') ? output : `${output}\n`);
}
