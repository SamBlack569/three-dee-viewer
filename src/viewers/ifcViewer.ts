import * as OBC from '@thatopen/components';
import * as BUI from '@thatopen/ui';
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
  world.scene.three.background = null;

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
      if (viewport.parentElement === container) container.removeChild(viewport);
    }
  };
}

