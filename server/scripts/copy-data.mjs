import { cpSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcData = path.join(__dirname, '../src/data');
const distData = path.join(__dirname, '../dist/data');

mkdirSync(distData, { recursive: true });
cpSync(srcData, distData, { recursive: true });
console.log('Copied server data files to dist/data');
