import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { fetchConfigSettings, updateConfigSettings } from '../api/config';
import type { ConfigSettings } from '../types/recipe';

interface DataModeSettingsProps {
  onConfigSaved: () => void;
}

export default function DataModeSettings({ onConfigSaved }: DataModeSettingsProps) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<ConfigSettings | null>(null);
  const [dataMode, setDataMode] = useState<'bundled' | 'live'>('bundled');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await fetchConfigSettings();
      setSettings(config);
      setDataMode(config.dataMode);
      setApiKey('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open, loadSettings]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await updateConfigSettings({
        dataMode,
        spoonacularApiKey: apiKey.trim() || undefined,
      });
      setSettings(updated);
      setDataMode(updated.dataMode);
      setApiKey('');
      setSuccess(true);
      onConfigSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sage-100 text-sage-700 hover:bg-sage-200 transition-colors"
        aria-expanded={open}
        aria-label="Data mode settings"
      >
        <span aria-hidden="true">⚙️</span>
        Settings
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/20 sm:bg-transparent"
            aria-label="Close settings"
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute right-0 z-50 mt-2 w-80 sm:w-96 rounded-xl border border-sage-200 bg-white shadow-lg p-4"
            role="dialog"
            aria-label="Data mode settings"
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h2 className="text-sm font-semibold text-sage-900">Data mode</h2>
                <p className="text-xs text-sage-600 mt-0.5">
                  Choose offline bundled data or live Spoonacular API.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sage-400 hover:text-sage-600 text-lg leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {loading && !settings ? (
              <p className="text-sm text-sage-500">Loading settings…</p>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <fieldset className="space-y-2">
                  <legend className="sr-only">Data mode</legend>
                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      dataMode === 'bundled'
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-sage-200 hover:border-sage-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dataMode"
                      value="bundled"
                      checked={dataMode === 'bundled'}
                      onChange={() => setDataMode('bundled')}
                      className="mt-0.5 text-brand-500 focus:ring-brand-400"
                    />
                    <span>
                      <span className="block text-sm font-medium text-sage-900">
                        📦 Bundled
                      </span>
                      <span className="block text-xs text-sage-600 mt-0.5">
                        Offline curated dataset · 0 API calls
                      </span>
                    </span>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      dataMode === 'live'
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-sage-200 hover:border-sage-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dataMode"
                      value="live"
                      checked={dataMode === 'live'}
                      onChange={() => setDataMode('live')}
                      className="mt-0.5 text-brand-500 focus:ring-brand-400"
                    />
                    <span>
                      <span className="block text-sm font-medium text-sage-900">
                        🌐 Live
                      </span>
                      <span className="block text-xs text-sage-600 mt-0.5">
                        Spoonacular API · richer search & autocomplete
                      </span>
                    </span>
                  </label>
                </fieldset>

                {dataMode === 'live' && (
                  <div>
                    <label
                      htmlFor="spoonacular-api-key"
                      className="block text-sm font-medium text-sage-700 mb-1"
                    >
                      Spoonacular API key
                    </label>
                    <input
                      id="spoonacular-api-key"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={
                        settings?.hasApiKey
                          ? `Saved key ends with …${settings.apiKeyHint}`
                          : 'Paste your API key'
                      }
                      className="w-full px-3 py-2 text-sm border border-sage-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400"
                      autoComplete="off"
                    />
                    <p className="mt-1 text-xs text-sage-500">
                      Get a free key at{' '}
                      <a
                        href="https://spoonacular.com/food-api"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:text-brand-700 underline"
                      >
                        spoonacular.com/food-api
                      </a>
                    </p>
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                {success && (
                  <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                    Settings saved. Active mode: {settings?.resolvedMode}.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? 'Saving…' : 'Save settings'}
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
