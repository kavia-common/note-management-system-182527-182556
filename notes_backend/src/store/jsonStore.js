import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import fs from 'fs';
import path from 'path';
import { nanoid } from 'nanoid';
import { NotFoundError } from '../utils/errorHandler.js';

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// PUBLIC_INTERFACE
export async function createJsonStore(dbPath) {
  /**
   * Initialize lowdb JSON store at provided path. Ensures file and structure exist.
   * Returns an object exposing CRUD methods for notes.
   */
  ensureDir(dbPath);
  const adapter = new JSONFile(dbPath);
  const db = new Low(adapter, { notes: [] });
  await db.read();

  // Initialize structure if missing
  if (!db.data || typeof db.data !== 'object') db.data = { notes: [] };
  if (!Array.isArray(db.data.notes)) db.data.notes = [];

  const nowIso = () => new Date().toISOString();

  // Internal helpers
  function sortNotes(list) {
    return [...list].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  function splitPinned(list) {
    const pinned = list.filter(n => n.pinned);
    const others = list.filter(n => !n.pinned);
    return [...sortNotes(pinned), ...sortNotes(others)];
  }

  return {
    // PUBLIC_INTERFACE
    async getAll({ q, page = 1, pageSize = 100, pinned } = {}) {
      /**
       * List all notes with optional search query, pagination, and pinned filter.
       * Returns { items, total, page, pageSize }
       */
      await db.read();
      let items = db.data.notes || [];

      if (typeof pinned === 'boolean') {
        items = items.filter(n => n.pinned === pinned);
      }

      if (q && q.trim()) {
        const query = q.trim().toLowerCase();
        items = items.filter(
          n =>
            (n.title || '').toLowerCase().includes(query) ||
            (n.content || '').toLowerCase().includes(query)
        );
      }

      // Pinned first and updatedAt desc within groups
      const ordered = splitPinned(items);
      const total = ordered.length;

      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const pageItems = ordered.slice(start, end);

      return { items: pageItems, total, page, pageSize };
    },

    // PUBLIC_INTERFACE
    async getById(id) {
      /** Fetch a note by ID or throw NotFoundError */
      await db.read();
      const n = (db.data.notes || []).find(n => n.id === id);
      if (!n) throw new NotFoundError(`Note not found: ${id}`);
      return n;
    },

    // PUBLIC_INTERFACE
    async create({ title = '', content = '', pinned = false }) {
      /** Create a note and persist it to the JSON store */
      await db.read();
      const id = `n_${Date.now()}_${nanoid(4)}`;
      const note = {
        id,
        title,
        content,
        pinned: Boolean(pinned),
        updatedAt: nowIso()
      };
      db.data.notes.push(note);
      await db.write();
      return note;
    },

    // PUBLIC_INTERFACE
    async update(id, patch) {
      /** Update fields for a note by id and persist */
      await db.read();
      const idx = (db.data.notes || []).findIndex(n => n.id === id);
      if (idx === -1) throw new NotFoundError(`Note not found: ${id}`);

      const prev = db.data.notes[idx];
      const next = {
        ...prev,
        ...(patch || {}),
        updatedAt: patch?.updatedAt || nowIso()
      };
      db.data.notes[idx] = next;
      await db.write();
      return next;
    },

    // PUBLIC_INTERFACE
    async remove(id) {
      /** Delete a note by id. No error if not found? We choose strict: NotFoundError. */
      await db.read();
      const before = db.data.notes.length;
      db.data.notes = db.data.notes.filter(n => n.id !== id);
      if (db.data.notes.length === before) {
        throw new NotFoundError(`Note not found: ${id}`);
      }
      await db.write();
    },

    // PUBLIC_INTERFACE
    async togglePin(id) {
      /** Toggle the pinned flag and update updatedAt */
      await db.read();
      const idx = (db.data.notes || []).findIndex(n => n.id === id);
      if (idx === -1) throw new NotFoundError(`Note not found: ${id}`);
      const current = db.data.notes[idx];
      const next = { ...current, pinned: !current.pinned, updatedAt: nowIso() };
      db.data.notes[idx] = next;
      await db.write();
      return next;
    }
  };
}
