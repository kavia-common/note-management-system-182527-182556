import React from 'react';
import './App.css';
import { NotesProvider } from './context/NotesContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';

// PUBLIC_INTERFACE
export default function App() {
  /**
   * Root app shell wiring the top Navbar, left Sidebar, and main NoteEditor.
   * Uses NotesProvider for global state and optimistic updates.
   */
  return (
    <NotesProvider>
      <div className="app-shell" data-theme="light">
        <Navbar />
        <Sidebar />
        <main className="main">
          <NoteEditor />
        </main>
      </div>
    </NotesProvider>
  );
}
