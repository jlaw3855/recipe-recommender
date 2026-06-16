import path from 'path';
import { fileURLToPath } from 'url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));

// * server/src and server/dist both sit one level below the server package root.
export const SERVER_ROOT = path.resolve(moduleDir, '..');
export const PROJECT_ROOT = path.resolve(SERVER_ROOT, '..');
export const ENV_FILE_PATH = path.join(PROJECT_ROOT, '.env');
export const ENV_EXAMPLE_FILE_PATH = path.join(PROJECT_ROOT, '.env.example');
