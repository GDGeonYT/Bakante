import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

/** Root folder of the Bakante project (c:\...\hackathon) */
export const PROJECT_ROOT = path.resolve(currentDir, '..', '..');
export const BASELINE_DIR = path.join(PROJECT_ROOT, 'baseline');
export const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');
export const DATA_DB_PATH = path.join(PROJECT_ROOT, 'server', 'bakante.sqlite');
