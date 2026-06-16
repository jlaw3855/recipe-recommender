export type DataMode = 'bundled' | 'live' | 'auto';

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

export function getDataMode(): DataMode {
  const configured = (process.env.DATA_MODE ?? 'auto').toLowerCase();
  if (configured === 'bundled') return 'bundled';
  if (configured === 'live') return 'live';
  return hasValidApiKey() ? 'live' : 'bundled';
}

export function getDailyQuotaLimit(): number {
  return parseInt(process.env.DAILY_API_QUOTA ?? '50', 10);
}
