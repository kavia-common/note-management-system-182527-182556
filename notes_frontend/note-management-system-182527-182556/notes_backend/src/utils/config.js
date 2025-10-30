import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PUBLIC_INTERFACE
export function getConfig() {
  /**
   * Read configuration from environment variables.
   * - PORT: number (default 4000)
   * - CORS_ORIGIN: allowed origin (default http://localhost:3000)
   * - NOTES_DB_JSON_PATH: JSON db path; default to ../notes_database/seed.notes.json (seed file default)
   */
  const port = Number(process.env.PORT || 4000);
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

  // Default JSON path: ../notes_database/seed.notes.json relative to backend src folder
  const defaultJsonPath = path.resolve(
    __dirname,
    '../../notes_database/seed.notes.json'
  );

  const notesDbJsonPath =
    process.env.NOTES_DB_JSON_PATH
      ? path.resolve(process.cwd(), process.env.NOTES_DB_JSON_PATH)
      : defaultJsonPath;

  return {
    port,
    corsOrigin,
    notesDbJsonPath
  };
}
