import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

vi.mock('../services/envFile.js', () => ({
  upsertEnvVars: vi.fn(),
}));

const app = createApp();

describe('bundled mode config API', () => {
  it('GET /api/config returns bundled mode without exposing full API key', async () => {
    const res = await request(app).get('/api/config');

    expect(res.status).toBe(200);
    expect(res.body.resolvedMode).toBe('bundled');
    expect(res.body.dataMode).toBe('bundled');
    expect(JSON.stringify(res.body)).not.toMatch(/test-key-for-unit-tests/);
  });

  it('PATCH /api/config rejects missing dataMode', async () => {
    const res = await request(app).patch('/api/config').send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/dataMode is required/i);
  });

  it('PATCH /api/config rejects invalid dataMode', async () => {
    const res = await request(app).patch('/api/config').send({ dataMode: 'invalid' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/dataMode must be/i);
  });
});
