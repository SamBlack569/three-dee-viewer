import React, { useEffect, useRef } from 'react';
import * as OBC from '@thatopen/components';
import * as BUI from '@thatopen/ui';
import * as CUI from '@thatopen/ui-obc';

export default function IfcModelsPanel({ components }: { components: OBC.Components }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    host.innerHTML = '';

    const [modelsTable] = CUI.tables.modelsList(
      {
        components,
        actions: {
          visibility: true,
          dispose: true,
        },
      },
      true
    );

    const section = document.createElement('bim-panel-section');
    section.setAttribute('fixed', '');
    section.setAttribute('label', 'Models');
    section.appendChild(modelsTable as unknown as Node);

    host.appendChild(section as unknown as Node);

    return () => {
      section.remove();
    };
  }, [components]);

  return <div ref={hostRef} style={{ width: '100%', marginTop: 12 }} />;
}

