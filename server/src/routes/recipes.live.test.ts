import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { spoonacularMocks } from '../test/live/index.js';
import { mockLiveSummary } from '../test/fixtures/spoonacular.js';
import { exhaustQuota } from '../test/live/liveTestHarness.js';

const app = createApp();

describe('live mode recipes API', () => {
  it('POST /api/recipes/search returns live mode status and increments API usage', async () => {
    const res = await request(app)
      .post('/api/recipes/search')
      .send({ ingredients: ['pasta'] });

    expect(res.status).toBe(200);
    expect(res.body.status.mode).toBe('live');
    expect(res.body.status.apiCallsToday).toBeGreaterThanOrEqual(1);
    expect(res.body.recipes).toEqual([mockLiveSummary]);
  });

  it('POST /api/recipes/search returns 500 when quota is exhausted', async () => {
    exhaustQuota();

    const res = await request(app)
      .post('/api/recipes/search')
      .send({ ingredients: ['pasta'] });

    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/Daily API quota/);
  });

  it('GET /api/recipes/autocomplete uses remote suggestions when local matches are sparse', async () => {
    const res = await request(app).get('/api/recipes/autocomplete').query({ q: 'zz' });

    expect(res.status).toBe(200);
    expect(spoonacularMocks.autocompleteLiveIngredients).toHaveBeenCalledWith('zz');
    expect(res.body.results.some((r: { name: string }) => r.name === 'zucchini')).toBe(true);
  });
});
