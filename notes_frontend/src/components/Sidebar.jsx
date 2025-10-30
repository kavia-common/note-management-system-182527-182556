import React, { useMemo } from 'react';
import { useNotes } from '../context/NotesContext';
import SearchBar from './SearchBar';
import NoteItem from './NoteItem';

// PUBLIC_INTERFACE
export default function Sidebar() {
  /** Left sidebar with search, pinned section, all notes and quick create */
  const { notes, rawNotes, selectedId, actions } = useNotes();

  const { pinned, others } = useMemo(() => {
    const pinnedList = notes.filter(n => n.pinned);
    const otherList = notes.filter(n => !n.pinned);
    return { pinned: pinnedList, others: otherList };
  }, [notes]);

  return (
    <aside className="sidebar">
      <SearchBar value={''} onChange={(q) => actions.setQuery(q)} />
      <button className="btn" onClick={() => actions.create()} aria-label="Create note">+ New Note</button>

      <div className="section-title">Pinned</div>
      <div className="note-list" style={{ maxHeight: 180 }}>
        {pinned.length === 0 ? <div className="note-meta" style={{ padding: '8px 6px' }}>No pinned notes</div> : null}
        {pinned.map(n => (
          <NoteItem
            key={n.id}
            note={n}
            active={selectedId === n.id}
            onClick={() => actions.select(n.id)}
            onPin={() => actions.togglePin(n.id)}
          />
        ))}
      </div>

      <div className="section-title">All Notes <span className="note-meta">({rawNotes.length})</span></div>
      <div className="note-list">
        {others.length === 0 ? <div className="note-meta" style={{ padding: '8px 6px' }}>No notes yet</div> : null}
        {others.map(n => (
          <NoteItem
            key={n.id}
            note={n}
            active={selectedId === n.id}
            onClick={() => actions.select(n.id)}
            onPin={() => actions.togglePin(n.id)}
          />
        ))}
      </div>
    </aside>
  );
}
