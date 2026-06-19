import express from 'express';
import cors from 'cors';
import configRouter from './routes/config.js';
import recipesRouter from './routes/recipes.js';
import { getAppStatus } from './services/recipeService.js';

export function createApp(): express.Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/status', (_req, res) => {
    res.json(getAppStatus());
  });

  app.use('/api/config', configRouter);
  app.use('/api/recipes', recipesRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
