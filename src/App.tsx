import React, { useEffect, useRef } from 'react';
import { mountViewer } from './index';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const cleanup = mountViewer(containerRef.current);
    return cleanup;
  }, []);

  return <div ref={containerRef} style={{ width: '100vw', height: '100vh' }} />;
}
