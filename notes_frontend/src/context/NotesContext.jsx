import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import * as api from '../services/api';

// Types
/**
 * Note shape
 * {
 *   id: string,
 *   title: string,
 *   content: string,
 *   pinned: boolean,
 *   updatedAt: string
 * }
 */

const NotesContext = createContext(null);

// Actions
const ACTIONS = {
  SET_NOTES: 'SET_NOTES',
  SELECT: 'SELECT',
  CREATE_OPTIMISTIC: 'CREATE_OPTIMISTIC',
  UPDATE_OPTIMISTIC: 'UPDATE_OPTIMISTIC',
  DELETE_OPTIMISTIC: 'DELETE_OPTIMISTIC',
  PIN_TOGGLE_OPTIMISTIC: 'PIN_TOGGLE_OPTIMISTIC',
  MERGE_SERVER: 'MERGE_SERVER',
  SET_QUERY: 'SET_QUERY',
};

function sortNotes(list) {
  return [...list].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

function splitPinned(list) {
  const pinned = list.filter(n => n.pinned);
  const others = list.filter(n => !n.pinned);
  return [...sortNotes(pinned), ...sortNotes(others)];
}

const initialState = {
  notes: [],
  selectedId: null,
  query: '',
};

function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_NOTES: {
      const notes = splitPinned(action.payload || []);
      return { ...state, notes, selectedId: notes[0]?.id ?? null };
    }
    case ACTIONS.SELECT:
      return { ...state, selectedId: action.id };
    case ACTIONS.SET_QUERY:
      return { ...state, query: action.query };
    case ACTIONS.CREATE_OPTIMISTIC: {
      const notes = splitPinned([action.note, ...state.notes]);
      return { ...state, notes, selectedId: action.note.id };
    }
    case ACTIONS.UPDATE_OPTIMISTIC: {
      const notes = splitPinned(state.notes.map(n => n.id === action.note.id ? { ...n, ...action.note } : n));
      return { ...state, notes };
    }
    case ACTIONS.DELETE_OPTIMISTIC: {
      const notes = state.notes.filter(n => n.id !== action.id);
      return { ...state, notes, selectedId: notes[0]?.id ?? null };
    }
    case ACTIONS.PIN_TOGGLE_OPTIMISTIC: {
      const notes = splitPinned(state.notes.map(n => n.id === action.id ? { ...n, pinned: !n.pinned, updatedAt: new Date().toISOString() } : n));
      return { ...state, notes };
    }
    case ACTIONS.MERGE_SERVER: {
      // Merge authoritative server payload for one note (e.g., id assignment)
      const { tempId, note } = action;
      const notes = state.notes.map(n => (n.id === tempId ? note : n));
      return { ...state, notes: splitPinned(notes), selectedId: note.id };
    }
    default:
      return state;
  }
}

// Debounce helper
function useDebouncedCallback(callback, delay) {
  const timer = useRef(null);
  return (args) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => callback(args), delay);
  };
}

// PUBLIC_INTERFACE
export function useNotes() {
  /** Access Notes context */
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within NotesProvider');
  return ctx;
}

// PUBLIC_INTERFACE
export function NotesProvider({ children }) {
  /**
   * Provides notes state with optimistic CRUD and debounced autosave to API.
   * Reads base URL from process.env.REACT_APP_API_BASE_URL via services/api.
   */
  const [state, dispatch] = useReducer(reducer, initialState);

  // Initial load
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.listNotes();
        if (active) dispatch({ type: ACTIONS.SET_NOTES, payload: data });
      } catch (e) {
        // In a real app consider showing a toast
        // eslint-disable-next-line no-console
        console.error('Failed to load notes', e);
      }
    })();
    return () => { active = false; };
  }, []);

  // Derived lists: filtered by query, with pinned first and sorted by updatedAt desc
  const filteredNotes = useMemo(() => {
    const q = state.query.trim().toLowerCase();
    const base = q
      ? state.notes.filter(n => (n.title || '').toLowerCase().includes(q) || (n.content || '').toLowerCase().includes(q))
      : state.notes;
    return base;
  }, [state.notes, state.query]);

  const selectedNote = useMemo(
    () => filteredNotes.find(n => n.id === state.selectedId) || filteredNotes[0] || null,
    [filteredNotes, state.selectedId]
  );

  const debouncedSave = useDebouncedCallback(async ({ id, patch }) => {
    try {
      await api.updateNote(id, patch);
    } catch (e) {
      console.error('Autosave failed', e);
    }
  }, 500);

  // Actions exposed to UI
  const actions = {
    // PUBLIC_INTERFACE
    setQuery(query) {
      /** Update search query string for notes list filtering */
      dispatch({ type: ACTIONS.SET_QUERY, query });
    },
    // PUBLIC_INTERFACE
    select(id) {
      /** Select a note by id to edit */
      dispatch({ type: ACTIONS.SELECT, id });
    },
    // PUBLIC_INTERFACE
    async create() {
      /**
       * Create a new note with optimistic temp id and merge back server id.
       */
      const tempId = `tmp_${Date.now()}`;
      const now = new Date().toISOString();
      const temp = { id: tempId, title: 'Untitled', content: '', pinned: false, updatedAt: now };
      dispatch({ type: ACTIONS.CREATE_OPTIMISTIC, note: temp });
      try {
        const created = await api.createNote({ title: temp.title, content: temp.content, pinned: temp.pinned });
        dispatch({ type: ACTIONS.MERGE_SERVER, tempId, note: { ...created } });
      } catch (e) {
        console.error('Create failed', e);
      }
    },
    // PUBLIC_INTERFACE
    async remove(id) {
      /** Delete a note optimistically */
      const targetId = id ?? state.selectedId;
      if (!targetId) return;
      dispatch({ type: ACTIONS.DELETE_OPTIMISTIC, id: targetId });
      try {
        await api.deleteNote(targetId);
      } catch (e) {
        console.error('Delete failed', e);
      }
    },
    // PUBLIC_INTERFACE
    togglePin(id) {
      /** Toggle pinned flag with optimistic update and server persistence */
      const targetId = id ?? state.selectedId;
      if (!targetId) return;
      dispatch({ type: ACTIONS.PIN_TOGGLE_OPTIMISTIC, id: targetId });
      api.pinNote(targetId).catch(e => console.error('Pin toggle failed', e));
    },
    // PUBLIC_INTERFACE
    edit(id, patch) {
      /**
       * Update title/content optimistically; debounced autosave to server.
       */
      const updatedAt = new Date().toISOString();
      const noteId = id ?? state.selectedId;
      if (!noteId) return;
      dispatch({ type: ACTIONS.UPDATE_OPTIMISTIC, note: { id: noteId, ...patch, updatedAt } });
      debouncedSave({ id: noteId, patch: { ...patch, updatedAt } });
    }
  };

  const value = useMemo(() => ({
    notes: filteredNotes,
    rawNotes: state.notes,
    selectedId: state.selectedId,
    selectedNote,
    actions
  }), [filteredNotes, state.selectedId, selectedNote]);

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}
