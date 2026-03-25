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

    const headerRow = document.createElement('div');
    headerRow.style.display = 'flex';
    headerRow.style.gap = '0.5rem';

    const searchInput = document.createElement('bim-text-input') as unknown as BUI.TextInput;
    (searchInput as any).setAttribute?.('placeholder', 'Search...');
    (searchInput as any).setAttribute?.('debounce', '200');
    (searchInput as any).style.flex = '1';

    const onSearch = (e: Event) => {
      const input = e.target as BUI.TextInput;
      modelsTable.queryString = input.value;
    };
    (searchInput as unknown as EventTarget).addEventListener('input', onSearch);

    headerRow.appendChild(searchInput as unknown as Node);
    section.appendChild(headerRow);
    section.appendChild(modelsTable as unknown as Node);

    host.appendChild(section as unknown as Node);

    return () => {
      (searchInput as unknown as EventTarget).removeEventListener('input', onSearch);
      section.remove();
    };
  }, [components]);

  return <div ref={hostRef} style={{ width: '100%', marginTop: 12 }} />;
}

