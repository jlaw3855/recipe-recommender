import dotenv from 'dotenv';
import { ENV_FILE_PATH } from './paths.js';

dotenv.config({ path: ENV_FILE_PATH });

import { createApp } from './app.js';

const app = createApp();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
