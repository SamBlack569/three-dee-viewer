import * as BUI from '@thatopen/ui';
import * as OBC from '@thatopen/components';
import * as THREE from 'three';
import { getViewerComponents } from '../thatopen/components';
import { GisLayers } from '../bim-components';

export type GisViewerHandle = {
  components: OBC.Components;
  gisLayers: GisLayers;
  dispose: () => void;
};

export function mountGisViewer(container: HTMLElement): GisViewerHandle {
  const components = getViewerComponents();
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
  world.camera.three.near = 0.1;
  world.camera.three.far = 200000;
  world.camera.three.updateProjectionMatrix();
  world.camera.updateAspect();
  world.camera.controls.setLookAt(300, 200, 300, 0, 0, 0, true);

  components.get(OBC.Raycasters).get(world);
  components.get(OBC.Grids).create(world);

  const gisLayers = components.get(GisLayers);
  components.init();

  const onResize = () => {
    world.renderer?.resize();
    world.camera.updateAspect();
    gisLayers.layer3d.updateTiles();
  };
  window.addEventListener('resize', onResize);

  return {
    components,
    gisLayers,
    dispose: () => {
      window.removeEventListener('resize', onResize);
      gisLayers.layer2d.dispose();
      gisLayers.layer3d.dispose();
      world.renderer?.three.dispose();
      if (viewport.parentElement === container) container.removeChild(viewport);
    }
  };
}
