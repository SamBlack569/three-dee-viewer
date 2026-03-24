import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

type LoadFA18FParams = {
    visible?: boolean;
    onLoaded?: (model: THREE.Object3D) => void;
    onError?: (error: unknown) => void;
};

export function loadFA18FModel(scene: THREE.Scene, params: LoadFA18FParams = {}): void {
    const { visible = false, onLoaded, onError } = params;
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();

    mtlLoader.setPath('/assets/FA-18F/');
    mtlLoader.setResourcePath('/assets/FA-18F/textures/');
    mtlLoader.load(
        'FA-18F.mtl',
        (materials) => {
            materials.preload();
            objLoader.setMaterials(materials);
            objLoader.setPath('/assets/FA-18F/');
            objLoader.load(
                'FA-18F.obj',
                (model) => {
                    model.scale.setScalar(0.2);
                    model.visible = visible;

                    model.traverse((child) => {
                        if (!(child instanceof THREE.Mesh)) return;
                        const material = child.material;
                        if (!material || Array.isArray(material)) return;
                        if ('map' in material && material.map) {
                            material.map.colorSpace = THREE.SRGBColorSpace;
                        }
                        if ('opacity' in material) {
                            material.opacity = 1;
                        }
                        if ('transparent' in material) {
                            material.transparent = false;
                        }
                        material.needsUpdate = true;
                    });

                    scene.add(model);
                    onLoaded?.(model);
                },
                undefined,
                (error) => {
                    onError?.(error);
                }
            );
        },
        undefined,
        (error) => {
            onError?.(error);
        }
    );
}
