import dotenv from 'dotenv';
import { ENV_FILE_PATH } from './paths.js';

dotenv.config({ path: ENV_FILE_PATH });

import express from 'express';
import cors from 'cors';
import configRouter from './routes/config.js';
import recipesRouter from './routes/recipes.js';
import { getAppStatus } from './services/recipeService.js';

const app = express();
const PORT = process.env.PORT || 3001;

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
