import {
  clearAutocompleteCache,
  clearSearchCache,
} from './cache.js';
import { upsertEnvVars } from './envFile.js';

export type DataMode = 'bundled' | 'live' | 'auto';
export type ConfiguredDataMode = 'bundled' | 'live';

export interface ConfigSettings {
  dataMode: ConfiguredDataMode;
  resolvedMode: ConfiguredDataMode;
  hasApiKey: boolean;
  apiKeyHint?: string;
}

let apiCallsToday = 0;
let quotaResetDate = new Date().toDateString();

function resetQuotaIfNewDay(): void {
  const today = new Date().toDateString();
  if (today !== quotaResetDate) {
    apiCallsToday = 0;
    quotaResetDate = today;
  }
}

export function trackApiCall(): void {
  resetQuotaIfNewDay();
  apiCallsToday++;
}

export function getApiUsage(): { callsToday: number; resetDate: string } {
  resetQuotaIfNewDay();
  return { callsToday: apiCallsToday, resetDate: quotaResetDate };
}

export function hasValidApiKey(): boolean {
  const key = process.env.SPOONACULAR_API_KEY;
  return Boolean(key && key !== 'your_api_key_here');
}

export function getConfiguredDataMode(): ConfiguredDataMode {
  const configured = (process.env.DATA_MODE ?? 'auto').toLowerCase();
  if (configured === 'bundled') return 'bundled';
  if (configured === 'live') return 'live';
  return hasValidApiKey() ? 'live' : 'bundled';
}

export function getDataMode(): DataMode {
  const configured = (process.env.DATA_MODE ?? 'auto').toLowerCase();
  if (configured === 'bundled') return 'bundled';
  if (configured === 'live') return 'live';
  return hasValidApiKey() ? 'live' : 'bundled';
}

export function getDailyQuotaLimit(): number {
  return parseInt(process.env.DAILY_API_QUOTA ?? '50', 10);
}

function buildApiKeyHint(): string | undefined {
  const key = process.env.SPOONACULAR_API_KEY;
  if (!hasValidApiKey() || !key || key.length < 4) return undefined;
  return key.slice(-4);
}

export function getConfigSettings(): ConfigSettings {
  const resolvedMode = getDataMode() as ConfiguredDataMode;

  return {
    dataMode: getConfiguredDataMode(),
    resolvedMode,
    hasApiKey: hasValidApiKey(),
    apiKeyHint: buildApiKeyHint(),
  };
}

export function updateConfigSettings(input: {
  dataMode: string;
  spoonacularApiKey?: string;
}): ConfigSettings {
  const dataMode = input.dataMode?.toLowerCase();
  if (dataMode !== 'bundled' && dataMode !== 'live') {
    throw new Error('dataMode must be "bundled" or "live".');
  }

  const updates: Record<string, string> = { DATA_MODE: dataMode };
  const trimmedKey = input.spoonacularApiKey?.trim();

  if (dataMode === 'live') {
    const key = trimmedKey ?? process.env.SPOONACULAR_API_KEY ?? '';
    if (!key || key === 'your_api_key_here') {
      throw new Error('A valid Spoonacular API key is required for live mode.');
    }
    updates.SPOONACULAR_API_KEY = key;
    process.env.SPOONACULAR_API_KEY = key;
  } else if (trimmedKey) {
    updates.SPOONACULAR_API_KEY = trimmedKey;
    process.env.SPOONACULAR_API_KEY = trimmedKey;
  }

  process.env.DATA_MODE = dataMode;
  upsertEnvVars(updates);
  clearSearchCache();
  clearAutocompleteCache();

  return getConfigSettings();
}
