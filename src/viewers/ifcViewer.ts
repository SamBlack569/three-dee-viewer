import * as OBC from '@thatopen/components';
import * as BUI from '@thatopen/ui';
import * as THREE from 'three';
import * as OBF from '@thatopen/components-front';
import { getViewerComponents } from '../thatopen/components';
import { setupIfcLoader } from '../loaders/setupIfcLoader';
import { setupFragmentsManager } from '../loaders/setupFragmentsManager';
import { setupHighlighter } from '../loaders/setupHighlighter';

export type IfcViewerHandle = {
  components: OBC.Components;
  dispose: () => void;
};

export function mountIfcViewer(container: HTMLElement): IfcViewerHandle {
  const components: OBC.Components = getViewerComponents();
  setupIfcLoader(components);

  const worlds = components.get(OBC.Worlds);
  const world = worlds.create<
    OBC.SimpleScene,
    OBC.OrthoPerspectiveCamera,
    OBC.SimpleRenderer
  >();

  world.scene = new OBC.SimpleScene(components);
  world.scene.setup();
  world.scene.three.background = new THREE.Color(0x0b0d12);

  const viewport = BUI.Component.create<BUI.Viewport>(() => {
    return BUI.html`<bim-viewport style="width: 100%; height: 100%; display: block;"></bim-viewport>`;
  });
  container.appendChild(viewport);

  world.renderer = new OBC.SimpleRenderer(components, viewport);
  world.camera = new OBC.OrthoPerspectiveCamera(components);
  world.camera.updateAspect();
  world.camera.controls.setLookAt(8, 8, 8, 0, 0, 0, true);

  components.get(OBC.Raycasters).get(world);
  components.get(OBC.Grids).create(world);

  setupFragmentsManager(components, world);
  setupHighlighter(components, world);

  components.init();

  const highlighter = components.get(OBF.Highlighter);
  const hider = components.get(OBC.Hider);

  const onShowAll = async () => {
    await hider.set(true);
  };

  const onHide = async () => {
    const selection = highlighter.selection.select;
    if (OBC.ModelIdMapUtils.isEmpty(selection)) return;
    await Promise.all([hider.set(false, selection), highlighter.clear('select')]);
  };

  const onIsolate = async () => {
    const selection = highlighter.selection.select;
    if (OBC.ModelIdMapUtils.isEmpty(selection)) return;
    await hider.isolate(selection);
  };

  const onFocus = async () => {
    const selection = highlighter.selection.select;
    await world.camera.fitToItems(OBC.ModelIdMapUtils.isEmpty(selection) ? undefined : selection);
  };

  const toolbarWrap = document.createElement('div');
  toolbarWrap.style.position = 'absolute';
  toolbarWrap.style.left = '12px';
  toolbarWrap.style.top = '12px';
  toolbarWrap.style.zIndex = '5';
  toolbarWrap.style.pointerEvents = 'auto';

  const toolbar = BUI.Component.create(() => BUI.html`
    <bim-toolbar>
      <bim-toolbar-section label="Visibility" icon="mdi:eye">
        <bim-button icon="mdi:eye" label="Show All" @click=${onShowAll}></bim-button>
      </bim-toolbar-section>
      <bim-toolbar-section label="Selection" icon="solar:cursor-bold">
        <bim-button icon="ri:focus-mode" label="Focus" @click=${onFocus}></bim-button>
        <bim-button icon="mdi:eye-off" label="Hide" @click=${onHide}></bim-button>
        <bim-button icon="mdi:selection-ellipse" label="Isolate" @click=${onIsolate}></bim-button>
      </bim-toolbar-section>
    </bim-toolbar>
  `);
  toolbarWrap.appendChild(toolbar);
  container.style.position = 'relative';
  container.appendChild(toolbarWrap);

  const onResize = () => {
    world.renderer?.resize();
    world.camera.updateAspect();
  };
  window.addEventListener('resize', onResize);

  return {
    components,
    dispose: () => {
      window.removeEventListener('resize', onResize);
      world.renderer?.three.dispose();
      toolbarWrap.remove();
      if (viewport.parentElement === container) container.removeChild(viewport);
    }
  };
}

