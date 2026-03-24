import * as OBC from '@thatopen/components';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export const setupFragmentsManager = (
  components: OBC.Components,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
  controls: OrbitControls
) => {
  const fragments = components.get(OBC.FragmentsManager);
  if (!fragments.initialized) {
    // For local development we can point to the worker in node_modules.
    // For production builds, move the worker to /public and reference it as "/worker.mjs".
    fragments.init('/node_modules/@thatopen/fragments/dist/Worker/worker.mjs');
  }

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
    model.useCamera(camera);

    // The model is added to the current Three.js scene.
    scene.add(model.object);

    // This is extremely important, as it instructs the Fragments Manager
    // the model must be updated because the configuration changed.
    await fragments.core.update(true);
  })

  controls.addEventListener('change', async () => {
    await fragments.core.update(true);
  });
};
