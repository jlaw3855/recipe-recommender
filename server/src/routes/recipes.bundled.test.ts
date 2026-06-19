import { afterEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { clearAutocompleteCache, clearSearchCache } from '../services/cache.js';

const app = createApp();

afterEach(() => {
  clearSearchCache();
  clearAutocompleteCache();
});

describe('bundled mode API', () => {
  it('GET /api/status returns bundled mode with zero API calls', async () => {
    const res = await request(app).get('/api/status');

    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('bundled');
    expect(res.body.apiCallsToday).toBe(0);
    expect(res.body.bundledRecipeCount).toBe(150);
  });

  it('POST /api/recipes/search returns results for pasta', async () => {
    const res = await request(app)
      .post('/api/recipes/search')
      .send({ ingredients: ['pasta'] });

    expect(res.status).toBe(200);
    expect(res.body.recipes.length).toBeGreaterThan(0);
    expect(res.body.status.mode).toBe('bundled');
    expect(res.body.status.apiCallsToday).toBe(0);
  });

  it('POST /api/recipes/search rejects empty ingredients', async () => {
    const res = await request(app).post('/api/recipes/search').send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/ingredient/i);
  });

  it('GET /api/recipes/autocomplete returns local suggestions', async () => {
    const res = await request(app).get('/api/recipes/autocomplete').query({ q: 'gar' });

    expect(res.status).toBe(200);
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body.results.some((r: { name: string }) => r.name.includes('gar'))).toBe(true);
  });

  it('GET /api/recipes/1001 returns full detail', async () => {
    const res = await request(app)
      .get('/api/recipes/1001')
      .query({ ingredients: 'pasta,garlic' });

    expect(res.status).toBe(200);
    expect(res.body.recipe.id).toBe(1001);
    expect(res.body.recipe.title).toBe('Spaghetti Aglio e Olio');
    expect(res.body.recipe.instructions.length).toBeGreaterThan(0);
    expect(res.body.status.mode).toBe('bundled');
  });

  it('GET /api/recipes/99999 returns 404', async () => {
    const res = await request(app).get('/api/recipes/99999');

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/not found/i);
  });

  it('POST /api/recipes/search rejects invalid maxReadyTime', async () => {
    const res = await request(app)
      .post('/api/recipes/search')
      .send({ ingredients: ['pasta'], maxReadyTime: 'bad' });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/maxReadyTime/i);
  });

  it('GET /api/recipes/not-a-number returns 400', async () => {
    const res = await request(app).get('/api/recipes/not-a-number');

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/invalid recipe id/i);
  });

  it('GET /api/recipes/autocomplete returns empty for short query', async () => {
    const res = await request(app).get('/api/recipes/autocomplete').query({ q: 'a' });

    expect(res.status).toBe(200);
    expect(res.body.results).toEqual([]);
  });

  it('POST /api/recipes/search applies complexity and maxReadyTime filters', async () => {
    const res = await request(app)
      .post('/api/recipes/search')
      .send({ ingredients: ['pasta'], complexity: 'easy', maxReadyTime: 30 });

    expect(res.status).toBe(200);
    for (const recipe of res.body.recipes) {
      expect(recipe.complexity).toBe('easy');
      expect(recipe.readyInMinutes).toBeLessThanOrEqual(30);
    }
  });

  it('POST /api/recipes/search returns cached results on repeat', async () => {
    const payload = { ingredients: ['pasta', 'garlic'] };
    const first = await request(app).post('/api/recipes/search').send(payload);
    const second = await request(app).post('/api/recipes/search').send(payload);

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(second.body.recipes).toEqual(first.body.recipes);
    expect(second.body.status.apiCallsToday).toBe(0);
  });

  it('GET /api/health returns ok status', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
