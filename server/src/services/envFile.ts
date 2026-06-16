import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.resolve(__dirname, '../../.env');
const ENV_EXAMPLE_PATH = path.resolve(__dirname, '../../.env.example');

export function getEnvFilePath(): string {
  return ENV_PATH;
}

/** Parse key/value pairs from .env (comments and blank lines are skipped for reads). */
export function readEnvFile(): Record<string, string> {
  if (!fs.existsSync(ENV_PATH)) {
    return {};
  }

  const env: Record<string, string> = {};
  const content = fs.readFileSync(ENV_PATH, 'utf-8');

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

/** Update keys in .env in place, preserving comments and blank lines. */
export function upsertEnvVars(updates: Record<string, string>): void {
  let content: string;

  if (fs.existsSync(ENV_PATH)) {
    content = fs.readFileSync(ENV_PATH, 'utf-8');
  } else if (fs.existsSync(ENV_EXAMPLE_PATH)) {
    content = fs.readFileSync(ENV_EXAMPLE_PATH, 'utf-8');
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
      return `${key}=${updates[key]}`;
    }

    return line;
  });

  for (const [key, value] of Object.entries(updates)) {
    if (!replacedKeys.has(key)) {
      newLines.push(`${key}=${value}`);
    }
  }

  const output = newLines.join('\n');
  fs.writeFileSync(ENV_PATH, output.endsWith('\n') ? output : `${output}\n`);
}
