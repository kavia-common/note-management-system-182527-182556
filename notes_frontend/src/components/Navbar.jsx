import React from 'react';
import { useNotes } from '../context/NotesContext';

// PUBLIC_INTERFACE
export default function Navbar() {
  /** Top navigation bar with brand and create note action */
  const { actions } = useNotes();

  return (
    <nav className="navbar">
      <div className="brand">
        <span className="dot" aria-hidden="true" />
        <span>Ocean Notes</span>
        <span className="badge">Professional</span>
      </div>
      <div className="nav-actions">
        <button className="btn secondary" onClick={() => actions.create()} aria-label="Create note">New Note</button>
      </div>
    </nav>
  );
}
