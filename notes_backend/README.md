# Notes Backend (Node.js + Express + JSON Store)

A lightweight REST API for the Notes application using Express and a JSON file store via `lowdb`.

## Features

- JSON file persistence (atomic writes via lowdb)
- REST endpoints: list, search, create, update, delete, toggle pin
- Validation with Joi
- Centralized error handling
- CORS (default: allow http://localhost:3000)
- Environment-driven configuration with sensible defaults

## Environment

Copy `.env.example` to `.env` and adjust as needed.

Variables:
- `PORT`: HTTP port (default 4000)
- `CORS_ORIGIN`: Allowed origin for CORS (default http://localhost:3000)
- `NOTES_DB_JSON_PATH`: Path to JSON database file. If not set, defaults to `../notes_database/seed.notes.json` relative to this backend folder.

Note: The default path points to the provided seed file in the workspace. For development where you need write access, set `NOTES_DB_JSON_PATH=./data/notes.json`. The service will initialize the file if missing.

## Install & Run

```bash
# From the backend folder
npm install
npm run dev   # starts with nodemon on http://localhost:4000
# or
npm start     # production mode
```

## API

Base URL: `http://localhost:4000`

- GET `/notes`
  - Query params (optional): 
    - `q`: search query applied to title/content
    - `page`: 1-based page number
    - `pageSize`: items per page (default 100)
    - `pinned`: `true` or `false` to filter by pinned
  - Returns: `{ items: Note[], total: number, page: number, pageSize: number }`

- GET `/notes/search?q=...`
  - Returns: `Note[]` filtered by title/content

- GET `/notes/:id`
  - Returns: `Note`

- POST `/notes`
  - Body: `{ title: string, content: string, pinned?: boolean }`
  - Returns: created `Note`

- PUT `/notes/:id`
  - Body: partial update `{ title?, content?, pinned? }`
  - Returns: updated `Note`

- DELETE `/notes/:id`
  - Returns: `204 No Content`

- POST `/notes/:id/pin`
  - Toggles the `pinned` flag and updates `updatedAt`
  - Returns: updated `Note`

## Data Schema

```ts
type Note = {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  updatedAt: string; // ISO 8601
}
```

## Frontend Integration

The React frontend should set:
- `REACT_APP_API_BASE_URL=http://localhost:4000`

Ensure CORS_ORIGIN matches your frontend URL.

## Migration

If dataset grows, consider switching to SQLite as documented in `notes_database/SQLITE_NOTES.md`.
