import type { ConfigSettings, ConfigUpdateRequest } from '../types/recipe';

export async function fetchConfigSettings(): Promise<ConfigSettings> {
  const response = await fetch('/api/config', { cache: 'no-store' });
  if (!response.ok) throw new Error('Failed to fetch config settings');
  return response.json();
}

export async function updateConfigSettings(
  update: ConfigUpdateRequest
): Promise<ConfigSettings> {
  const response = await fetch('/api/config', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
    cache: 'no-store',
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? 'Failed to update config settings');
  }

  return data;
}
