import * as THREE from 'three';

export function createGoldCube(): THREE.Mesh {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 1,
        roughness: 0.28,
        envMapIntensity: 0.9
    });

    return new THREE.Mesh(geometry, material);
}
