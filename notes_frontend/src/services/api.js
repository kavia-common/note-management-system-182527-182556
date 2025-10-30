/**
 * Lightweight REST client for notes service.
 * Base URL is controlled via REACT_APP_API_BASE_URL environment variable.
 * No hardcoding; ensure REACT_APP_API_BASE_URL is set in environment.
 */

const BASE = process.env.REACT_APP_API_BASE_URL || '';

/**
 * The backend routes are expected to be versioned under /api/v1/notes.
 * Build a base path to prefix all resource paths consistently.
 */
const API_NOTES_BASE = '/api/v1/notes';

async function http(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// PUBLIC_INTERFACE
export async function listNotes() {
  /** List notes sorted by backend; frontend will re-sort as safety */
  return http(`${API_NOTES_BASE}`, { method: 'GET' });
}

// PUBLIC_INTERFACE
export async function searchNotes(q) {
  /** Search notes by query string q */
  const query = encodeURIComponent(q || '');
  return http(`${API_NOTES_BASE}/search?q=${query}`, { method: 'GET' });
}

// PUBLIC_INTERFACE
export async function createNote(body) {
  /** Create a note; body = {title, content, pinned?} */
  return http(`${API_NOTES_BASE}`, { method: 'POST', body: JSON.stringify(body) });
}

// PUBLIC_INTERFACE
export async function updateNote(id, body) {
  /** Update note by id; body is partial */
  return http(`${API_NOTES_BASE}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) });
}

// PUBLIC_INTERFACE
export async function deleteNote(id) {
  /** Delete note by id */
  return http(`${API_NOTES_BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

// PUBLIC_INTERFACE
export async function pinNote(id) {
  /** Toggle pin for note by id (idempotent on backend) */
  return http(`${API_NOTES_BASE}/${encodeURIComponent(id)}/pin`, { method: 'POST' });
}
