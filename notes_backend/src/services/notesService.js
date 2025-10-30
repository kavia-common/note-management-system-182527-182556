import { getConfig } from '../utils/config.js';
import { createJsonStore } from '../store/jsonStore.js';

let storePromise = null;
async function getStore() {
  if (!storePromise) {
    const cfg = getConfig();
    storePromise = createJsonStore(cfg.notesDbJsonPath);
  }
  return storePromise;
}

// PUBLIC_INTERFACE
export async function listNotes(params) {
  /** List notes with optional filters/pagination. */
  const store = await getStore();
  return store.getAll(params);
}

// PUBLIC_INTERFACE
export async function searchNotes(q) {
  /** Search notes by query string q. */
  const store = await getStore();
  const { items } = await store.getAll({ q });
  return items;
}

// PUBLIC_INTERFACE
export async function getNote(id) {
  /** Get a single note by id. */
  const store = await getStore();
  return store.getById(id);
}

// PUBLIC_INTERFACE
export async function createNote(input) {
  /** Create a new note. */
  const store = await getStore();
  return store.create(input);
}

// PUBLIC_INTERFACE
export async function updateNote(id, patch) {
  /** Update an existing note by id. */
  const store = await getStore();
  return store.update(id, patch);
}

// PUBLIC_INTERFACE
export async function deleteNote(id) {
  /** Remove note by id. */
  const store = await getStore();
  return store.remove(id);
}

// PUBLIC_INTERFACE
export async function togglePin(id) {
  /** Toggle pin flag for a note by id. */
  const store = await getStore();
  return store.togglePin(id);
}
