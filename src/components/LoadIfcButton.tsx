import React, { useEffect, useRef } from 'react';
import * as BUI from '@thatopen/ui';
import * as OBC from '@thatopen/components';

// Based on the That Open "Creating BIM Apps" lesson:
// https://people.thatopen.com/c/creating-bim-apps-0cfd57/sections/342852/lessons/2792030
export interface LoadModelBtnState {
  components: OBC.Components;
}

export const loadModelBtnTemplate: BUI.StatefullComponent<LoadModelBtnState> = (
  state
) => {
  const { components } = state;

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

  return BUI.html`<bim-button
    style="width: 100%;"
    icon="solar:add-circle-bold"
    label="Load model"
  >
    <bim-context-menu>
      <bim-button class="transparent" @click=${onLoadIfc} label="Load IFC"></bim-button>
      <bim-button class="transparent" @click=${onLoadFrag} label="Load FRAG"></bim-button>
    </bim-context-menu>
  </bim-button>`;
};

export default function LoadIfcButton({ components }: { components: OBC.Components }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    const [button] = BUI.Component.create<HTMLElement, LoadModelBtnState>(
      loadModelBtnTemplate,
      { components }
    );

    hostRef.current.innerHTML = '';
    hostRef.current.appendChild(button);

    return () => {
      button.remove();
    };
  }, []);

  return <div ref={hostRef} style={{ width: '100%', marginTop: 8 }} />;
}
