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
    headerRow.style.alignItems = 'center';

    const searchInput = document.createElement('bim-text-input') as unknown as BUI.TextInput;
    (searchInput as any).setAttribute?.('placeholder', 'Search...');
    (searchInput as any).setAttribute?.('debounce', '200');
    (searchInput as any).style.flex = '1';

    const onSearch = (e: Event) => {
      const input = e.target as BUI.TextInput;
      modelsTable.queryString = input.value;
    };
    (searchInput as unknown as EventTarget).addEventListener('input', onSearch);

    const onLoadIfc = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = false;
      input.accept = '.ifc';

      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;

        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const ifcLoader = components.get(OBC.IfcLoader);
        await ifcLoader.load(bytes, true, file.name.replace('.ifc', ''));
        BUI.ContextMenu.removeMenus();
      });

      input.click();
    };

    const onLoadFrag = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = false;
      input.accept = '.frag';

      input.addEventListener('change', async () => {
        const file = input.files?.[0];
        if (!file) return;
        const buffer = await file.arrayBuffer();

        const fragments = components.get(OBC.FragmentsManager);
        fragments.core.load(buffer, {
          modelId: file.name.replace('.frag', '')
        });
        BUI.ContextMenu.removeMenus();
      });

      input.click();
    };

    const addBtn = document.createElement('bim-button');
    // Match ThatOpen default icon (appIcons.ADD)
    addBtn.setAttribute('icon', 'material-symbols:add-rounded');
    addBtn.setAttribute('label', '');
    (addBtn as unknown as HTMLElement).style.flex = '0';

    const menu = document.createElement('bim-context-menu');
    const menuIfc = document.createElement('bim-button');
    menuIfc.className = 'transparent';
    menuIfc.setAttribute('label', 'Load IFC');
    menuIfc.addEventListener('click', onLoadIfc);
    const menuFrag = document.createElement('bim-button');
    menuFrag.className = 'transparent';
    menuFrag.setAttribute('label', 'Load FRAG');
    menuFrag.addEventListener('click', onLoadFrag);
    menu.appendChild(menuIfc);
    menu.appendChild(menuFrag);
    addBtn.appendChild(menu);

    headerRow.appendChild(searchInput as unknown as Node);
    headerRow.appendChild(addBtn as unknown as Node);
    section.appendChild(headerRow);
    section.appendChild(modelsTable as unknown as Node);

    host.appendChild(section as unknown as Node);

    return () => {
      (searchInput as unknown as EventTarget).removeEventListener('input', onSearch);
      menuIfc.removeEventListener('click', onLoadIfc);
      menuFrag.removeEventListener('click', onLoadFrag);
      section.remove();
    };
  }, [components]);

  return <div ref={hostRef} style={{ width: '100%', marginTop: 12 }} />;
}

