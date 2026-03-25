import * as OBC from '@thatopen/components';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type SimpleWorld = OBC.SimpleWorld<
  OBC.SimpleScene,
  OBC.OrthoPerspectiveCamera,
  OBC.SimpleRenderer
>;

export function setupFragmentsManager(
  components: OBC.Components,
  world: SimpleWorld
): void;
export function setupFragmentsManager(
  components: OBC.Components,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
  controls: OrbitControls
): void;
export function setupFragmentsManager(
  components: OBC.Components,
  arg1: SimpleWorld | THREE.Scene,
  arg2?: THREE.PerspectiveCamera | THREE.OrthographicCamera,
  arg3?: OrbitControls
): void {
  const fragments = components.get(OBC.FragmentsManager);
  // The worker is set from the node_modules for simplicity purposes.
  // To build the app, the worker file should be set inside the public folder
  // at the root of the project and be referenced as "worker.mjs"
  if (!fragments.initialized) fragments.init('/node_modules/@thatopen/fragments/dist/Worker/worker.mjs');

  const isWorld = (value: SimpleWorld | THREE.Scene): value is SimpleWorld =>
    typeof (value as SimpleWorld)?.camera?.three !== 'undefined' &&
    typeof (value as SimpleWorld)?.scene?.three !== 'undefined';

  const getThreeCamera = () => (isWorld(arg1) ? arg1.camera.three : arg2!);
  const getThreeScene = () => (isWorld(arg1) ? arg1.scene.three : arg1);

  fragments.list.onItemSet.add(async ({ value: model }) => {
    // Clears the ItemsFinder cache, so the next time a query
    // is run, it does the search again to include the results from the 
    // new model
    const finder = components.get(OBC.ItemsFinder)
    for (const [, query] of finder.list) {
      query.clearCache()
    }
    
    // useCamera is used to tell the model loaded the camera it must use in order to 
    // update its culling and LOD state.
    // Culling is the process of not rendering what the camera doesn't see.
    // LOD stands from Level of Detail in 3D graphics (not BIM) and is used
    // to decrease the geometry detail as the camera goes further from the element.
    model.useCamera(getThreeCamera());

    // The model is added to the world scene.
    getThreeScene().add(model.object);

    // This is extremely important, as it instructs the Fragments Manager
    // the model must be updated because the configuration changed.
    await fragments.core.update(true);
  })

  const controls = isWorld(arg1) ? (arg1.camera.controls as unknown as EventTarget) : (arg3 as unknown as EventTarget);
  const eventName = isWorld(arg1) ? 'rest' : 'change';

  controls.addEventListener(eventName, async () => {
    await fragments.core.update(true);
  });
}
