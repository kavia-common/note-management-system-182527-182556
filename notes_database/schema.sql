-- SQLite schema for the Notes backend (optional alternative to JSON store)

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  pinned INTEGER NOT NULL DEFAULT 0,            -- 0 = false, 1 = true
  updated_at TEXT NOT NULL                      -- ISO8601 string
);

-- Indexes to optimize list/sort and search
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes (pinned);
-- Optional naive search support (title LIKE ... OR content LIKE ...). For advanced usage, consider FTS5.

-- Seed data (dev only) - comment out in production
-- INSERT INTO notes (id, title, content, pinned, updated_at) VALUES
-- ('seed_1', 'Welcome to Ocean Notes', 'This is your first note! Edit me to get started.', 1, '2025-01-01T12:00:00.000Z'),
-- ('seed_2', 'Keyboard Tips', '- Start typing to autosave\n- Use search to filter notes', 0, '2025-01-01T12:05:00.000Z');
