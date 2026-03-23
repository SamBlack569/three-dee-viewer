import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';


const scene = new THREE.Scene();
//scene.background = new THREE.Color(0x1a1a1a);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

/*
    alpha: false,
    antialias: true
    - When alpha is set to false, the renderer will not clear the background of the canvas.
    - When antialias is set to true, the renderer will use anti-aliasing to smooth the edges of the objects.
*/
const renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;
document.body.appendChild(renderer.domElement);

// Give metallic materials stable reflections so they remain visible.
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;


const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 1,
    roughness: 0.28,
    envMapIntensity: 0.9
});
const cube = new THREE.Mesh(geometry, material);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.25);
directionalLight.position.set(2, 3, 4);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.22);
const fillLight = new THREE.DirectionalLight(0xffffff, 0.65);
fillLight.position.set(-3, 2, -2);
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x202020, 0.35);


scene.add(cube, directionalLight, fillLight, ambientLight, hemiLight);


camera.position.z = 5;

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

const cameraControls = new OrbitControls(camera, renderer.domElement);

const axes = new THREE.AxesHelper();
const grid = new THREE.GridHelper();
grid.material.transparent = true;
grid.material.opacity = 0.5;
grid.material.color = new THREE.Color(0x444444);
scene.add(axes, grid);

const gui = new GUI();

const cubeControls = gui.addFolder("Gold Cube");

cubeControls.add(cube.position, "x", -10, 10, 0.01);
cubeControls.add(cube.position, "y", -10, 10, 0.01);
cubeControls.add(cube.position, "z", -10, 10, 0.01);
cubeControls.add(cube, "visible");

animate();
