import React, { useEffect, useRef, useState } from 'react';
import * as BUI from '@thatopen/ui';
import * as OBC from '@thatopen/components';
import { mountCubeViewer } from './viewers/cubeViewer';
import { mountIfcViewer } from './viewers/ifcViewer';
import LoadIfcButton from './components/LoadIfcButton';
import IfcDataPanel from './components/IfcDataPanel';

BUI.Manager.init();

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeViewer, setActiveViewer] = useState<'cube' | 'ifc'>('cube');
  const ifcHandleRef = useRef<ReturnType<typeof mountIfcViewer> | null>(null);
  const [ifcComponents, setIfcComponents] = useState<OBC.Components | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    container.innerHTML = '';

    if (activeViewer === 'cube') {
      ifcHandleRef.current?.dispose();
      ifcHandleRef.current = null;
      setIfcComponents(null);
      const cleanup = mountCubeViewer(container);
      return cleanup;
    }

    const handle = mountIfcViewer(container);
    ifcHandleRef.current = handle;
    setIfcComponents(handle.components);
    return () => handle.dispose();
  }, [activeViewer]);

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
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            onClick={() => setActiveViewer('cube')}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #2a2a2a',
              background: activeViewer === 'cube' ? '#2a2a2a' : '#171717',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Cube viewer
          </button>
          <button
            onClick={() => setActiveViewer('ifc')}
            style={{
              flex: 1,
              padding: '8px 10px',
              borderRadius: 8,
              border: '1px solid #2a2a2a',
              background: activeViewer === 'ifc' ? '#2a2a2a' : '#171717',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            IFC viewer
          </button>
        </div>

        {activeViewer === 'ifc' && ifcComponents && (
          <>
            <LoadIfcButton components={ifcComponents} />
            <IfcDataPanel components={ifcComponents} />
          </>
        )}
      </aside>

      <main style={{ flex: 1, minWidth: 0 }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </main>
    </div>
  );
}
