import React, { useEffect, useRef } from 'react';
import * as BUI from '@thatopen/ui';
import * as OBC from '@thatopen/components';
import { setupIfcLoader } from '../loaders/setupIfcLoader';
import { getViewerComponents } from '../thatopen/components';

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
    });

    input.click();
  };

  return BUI.html`<bim-button
    icon="solar:bookmark-square-minimalistic-bold"
    label="Load IFC"
    @click=${onLoadIfc}
  ></bim-button>`;
};

export default function LoadIfcButton() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const componentsRef = useRef<OBC.Components | null>(null);

  if (!componentsRef.current) {
    const components = getViewerComponents();
    setupIfcLoader(components);
    componentsRef.current = components;
  }

  useEffect(() => {
    if (!hostRef.current) return;

    const [button] = BUI.Component.create<HTMLElement, LoadModelBtnState>(
      loadModelBtnTemplate,
      { components: componentsRef.current as OBC.Components }
    );

    hostRef.current.innerHTML = '';
    hostRef.current.appendChild(button);

    return () => {
      button.remove();
    };
  }, []);

  return <div ref={hostRef} style={{ width: '100%', marginTop: 8 }} />;
}
