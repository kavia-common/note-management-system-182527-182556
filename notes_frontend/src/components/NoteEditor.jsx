import React, { useEffect, useRef } from 'react';
import { useNotes } from '../context/NotesContext';

// PUBLIC_INTERFACE
export default function NoteEditor() {
  /** Main editor for the selected note with debounced autosave via context */
  const { selectedNote, actions } = useNotes();
  const taRef = useRef(null);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = `${taRef.current.scrollHeight}px`;
    }
  }, [selectedNote?.content]);

  if (!selectedNote) {
    return (
      <div className="editor empty">
        <div>
          <div style={{ fontSize: 32, textAlign: 'center' }}>📝</div>
          <p>No note selected. Create a new note to get started.</p>
        </div>
      </div>
    );
  }

  const onTitle = (e) => actions.edit(selectedNote.id, { title: e.target.value });
  const onContent = (e) => {
    actions.edit(selectedNote.id, { content: e.target.value });
    if (taRef.current) {
      taRef.current.style.height = 'auto';
      taRef.current.style.height = `${taRef.current.scrollHeight}px`;
    }
  };

  return (
    <section className="editor">
      <div className="editor-header">
        <input
          className="input-title"
          value={selectedNote.title || ''}
          onChange={onTitle}
          placeholder="Title"
          aria-label="Note title"
        />
        <button className="btn secondary" onClick={() => actions.togglePin(selectedNote.id)}>
          {selectedNote.pinned ? '📌 Unpin' : '📌 Pin'}
        </button>
        <button className="btn" onClick={() => actions.remove(selectedNote.id)}>Delete</button>
      </div>
      <textarea
        ref={taRef}
        className="textarea"
        rows={10}
        value={selectedNote.content || ''}
        onChange={onContent}
        placeholder="Start writing..."
        aria-label="Note content"
      />
      <div className="helper">
        Autosaves in ~0.5s. Updated:{' '}
        <strong>{new Date(selectedNote.updatedAt).toLocaleString()}</strong>
      </div>
    </section>
  );
}
