import { Router } from 'express';
import { getConfigSettings, updateConfigSettings } from '../services/config.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json(getConfigSettings());
});

router.patch('/', (req, res) => {
  try {
    const { dataMode, spoonacularApiKey } = req.body as {
      dataMode?: string;
      spoonacularApiKey?: string;
    };

    if (!dataMode) {
      res.status(400).json({ error: 'dataMode is required.' });
      return;
    }

    const settings = updateConfigSettings({ dataMode, spoonacularApiKey });
    res.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update config';
    res.status(400).json({ error: message });
  }
});

export default router;
