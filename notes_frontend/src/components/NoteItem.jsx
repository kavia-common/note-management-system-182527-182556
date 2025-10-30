import React from 'react';

// PUBLIC_INTERFACE
export default function NoteItem({ note, active, onClick, onPin }) {
  /** Single note list item with title, updatedAt, and pin toggle */
  const updated = new Date(note.updatedAt);
  const subtitle = isNaN(updated.getTime()) ? '' : updated.toLocaleString();

  return (
    <div
      className={`note-item ${active ? 'active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick && onClick()}
      aria-pressed={active}
    >
      <div style={{ display: 'grid' }}>
        <span className="note-title">{note.title || 'Untitled'}</span>
        <span className="note-meta">{subtitle}</span>
      </div>
      {note.pinned ? <span className="pin" title="Pinned">📌</span> : null}
      <button
        className="btn secondary"
        style={{ marginLeft: 'auto' }}
        onClick={(e) => { e.stopPropagation(); onPin && onPin(); }}
        aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
      >
        {note.pinned ? 'Unpin' : 'Pin'}
      </button>
    </div>
  );
}
