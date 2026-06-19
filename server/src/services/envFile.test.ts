import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { envPath, examplePath, fs } = vi.hoisted(() => {
  const nodeFs = require('node:fs') as typeof import('node:fs');
  const nodeOs = require('node:os') as typeof import('node:os');
  const nodePath = require('node:path') as typeof import('node:path');
  const dir = nodeFs.mkdtempSync(nodePath.join(nodeOs.tmpdir(), 'recipe-env-test-'));
  return {
    fs: nodeFs,
    envPath: nodePath.join(dir, '.env'),
    examplePath: nodePath.join(dir, '.env.example'),
  };
});

vi.mock('../paths.js', () => ({
  ENV_FILE_PATH: envPath,
  ENV_EXAMPLE_FILE_PATH: examplePath,
}));

import { upsertEnvVars } from './envFile.js';

beforeEach(() => {
  if (fs.existsSync(envPath)) fs.unlinkSync(envPath);
  if (fs.existsSync(examplePath)) fs.unlinkSync(examplePath);
});

afterEach(() => {
  if (fs.existsSync(envPath)) fs.unlinkSync(envPath);
  if (fs.existsSync(examplePath)) fs.unlinkSync(examplePath);
});

describe('upsertEnvVars', () => {
  it('creates a new env file when none exists', () => {
    upsertEnvVars({ DATA_MODE: 'bundled' });
    const content = fs.readFileSync(envPath, 'utf-8');
    expect(content).toContain('DATA_MODE=bundled');
  });

  it('updates existing keys in place and preserves comments', () => {
    fs.writeFileSync(envPath, '# App config\nDATA_MODE=bundled\nPORT=3001\n', 'utf-8');
    upsertEnvVars({ DATA_MODE: 'live' });
    const content = fs.readFileSync(envPath, 'utf-8');
    expect(content).toContain('# App config');
    expect(content).toContain('DATA_MODE=live');
    expect(content).toContain('PORT=3001');
  });

  it('quotes values that contain special characters', () => {
    upsertEnvVars({ SPOONACULAR_API_KEY: 'key with spaces' });
    const content = fs.readFileSync(envPath, 'utf-8');
    expect(content).toContain('SPOONACULAR_API_KEY="key with spaces"');
  });
});
