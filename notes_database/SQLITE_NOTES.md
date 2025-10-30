# SQLite Option (Alternative to JSON)

While the MVP uses a JSON file store, you may choose SQLite for improved consistency and scaling.

## Environment

- NOTES_DB_SQLITE_PATH: absolute or relative path to the SQLite file (e.g., `./data/notes.sqlite`)

Do not hardcode this path in code. Read from environment.

## Initialization

1) Ensure the data directory exists (e.g., `./data`).
2) Create the database file and run the schema:
   - Load the SQL from `schema.sql`
   - Execute it against the SQLite file
3) (Dev only) Optionally seed data by uncommenting seed inserts in `schema.sql`.

## Backend Adapter Interface

Implement methods:
- listNotes()
- searchNotes(query)
- createNote({ title, content, pinned? })
- updateNote(id, patch)
- deleteNote(id)
- togglePin(id)

These map to REST routes consumed by the frontend.

## Notes

- Store booleans as integers (0/1).
- Store timestamps as ISO 8601 text (UTC recommended).
- Add FTS5 if advanced search is required.
