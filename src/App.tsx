import React, { useEffect, useRef } from 'react';
import { mountViewer } from './index';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cleanup = mountViewer(containerRef.current);
    return cleanup;
  }, []);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <aside
        style={{
          width: 280,
          padding: 16,
          background: '#111',
          color: '#fff',
          borderRight: '1px solid #2a2a2a',
          boxSizing: 'border-box',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        <h3 style={{ marginTop: 0 }}>Viewer UI</h3>
        <p style={{ margin: '8px 0 16px', opacity: 0.8 }}>
          Left panel for controls and model actions.
        </p>
        <button
          type="button"
          style={{
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid #3a3a3a',
            background: '#1f1f1f',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          Example action
        </button>
      </aside>

      <main style={{ flex: 1, minWidth: 0 }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </main>
    </div>
  );
}
