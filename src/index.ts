import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { createGoldCube } from './objects/cube';
import { loadFA18FModel } from './objects/fa18f';

export function mountViewer(container: HTMLElement): () => void {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    const cube = createGoldCube();
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.25);
    directionalLight.position.set(2, 3, 4);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.22);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.65);
    fillLight.position.set(-3, 2, -2);
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x202020, 0.35);
    scene.add(cube, directionalLight, fillLight, ambientLight, hemiLight);

    const cameraControls = new OrbitControls(camera, renderer.domElement);

    const axes = new THREE.AxesHelper();
    const grid = new THREE.GridHelper();
    grid.material.transparent = true;
    grid.material.opacity = 0.5;
    grid.material.color = new THREE.Color(0x444444);
    scene.add(axes, grid);

    const gui = new GUI();
    let loadedModel: THREE.Object3D | null = null;
    const modelState = { visible: false };
    const cubeControls = gui.addFolder("Gold Cube");
    cubeControls.add(cube.position, "x", -10, 10, 0.01);
    cubeControls.add(cube.position, "y", -10, 10, 0.01);
    cubeControls.add(cube.position, "z", -10, 10, 0.01);
    cubeControls.add(cube, "visible");

    const modelControls = gui.addFolder("FA-18F");
    modelControls.add(modelState, "visible").name("visible").onChange((value: boolean) => {
        if (!loadedModel) return;
        loadedModel.visible = value;
    });

    function frameObject(object: THREE.Object3D): void {
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const maxSize = Math.max(size.x, size.y, size.z);
        const fitHeightDistance = maxSize / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)));
        const fitWidthDistance = fitHeightDistance / camera.aspect;
        const distance = 1.2 * Math.max(fitHeightDistance, fitWidthDistance);

        camera.position.set(center.x, center.y + maxSize * 0.2, center.z + distance);
        camera.near = Math.max(0.01, distance / 100);
        camera.far = distance * 100;
        camera.updateProjectionMatrix();
        cameraControls.target.copy(center);
        cameraControls.update();
    }

    loadFA18FModel(scene, {
        visible: modelState.visible,
        onLoaded: (model) => {
            loadedModel = model;
            frameObject(model);
        },
        onError: (error) => {
            console.error('Failed to load FA-18F model', error);
        }
    });

    const onResize = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    let animationFrameId = 0;
    const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    };
    animate();

    return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener('resize', onResize);
        cameraControls.dispose();
        gui.destroy();
        pmremGenerator.dispose();
        renderer.dispose();
        if (renderer.domElement.parentElement === container) {
            container.removeChild(renderer.domElement);
        }
    };
}
