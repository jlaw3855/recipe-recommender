import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import * as envFile from '../services/envFile.js';
import { createApp } from '../app.js';

const app = createApp();

describe('live mode config API', () => {
  beforeEach(() => {
    vi.spyOn(envFile, 'upsertEnvVars').mockImplementation(() => undefined);
  });

  it('GET /api/config returns live mode without exposing full API key', async () => {
    const res = await request(app).get('/api/config');

    expect(res.status).toBe(200);
    expect(res.body.resolvedMode).toBe('live');
    expect(res.body.dataMode).toBe('live');
    expect(res.body.hasApiKey).toBe(true);
    expect(JSON.stringify(res.body)).not.toContain('test-key-for-unit-tests');
  });

  it('PATCH /api/config updates live mode and persists via upsertEnvVars', async () => {
    const res = await request(app)
      .patch('/api/config')
      .send({ dataMode: 'live', spoonacularApiKey: 'new-live-test-key' });

    expect(res.status).toBe(200);
    expect(res.body.resolvedMode).toBe('live');
    expect(envFile.upsertEnvVars).toHaveBeenCalledWith(
      expect.objectContaining({
        DATA_MODE: 'live',
        SPOONACULAR_API_KEY: 'new-live-test-key',
      })
    );
  });
});
