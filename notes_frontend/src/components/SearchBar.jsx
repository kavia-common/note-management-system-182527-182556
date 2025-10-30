import React, { useState, useEffect } from 'react';

// PUBLIC_INTERFACE
export default function SearchBar({ value, onChange }) {
  /** Search bar with small debounce for UX; leaves fetch to context if needed */
  const [local, setLocal] = useState(value || '');
  useEffect(() => { setLocal(value || ''); }, [value]);

  useEffect(() => {
    const t = setTimeout(() => onChange && onChange(local), 200);
    return () => clearTimeout(t);
  }, [local, onChange]);

  return (
    <div className="searchbar">
      <span role="img" aria-label="search">🔎</span>
      <input
        placeholder="Search notes..."
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        aria-label="Search notes"
      />
    </div>
  );
}
