import * as THREE from 'three';
import * as OBC from '@thatopen/components';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Ion } from 'cesium';
import { TilesRenderer } from '3d-tiles-renderer';
import {
  TilesFadePlugin,
  TileCompressionPlugin,
  GLTFExtensionsPlugin,
  ReorientationPlugin
} from '3d-tiles-renderer/plugins';
import { CesiumIonAuthPlugin } from '3d-tiles-renderer/core/plugins';

export class GisLayer3d {
  latitude: number = 51.50282464311485;
  longitude: number = -0.12729679399810487;
  rotation: number = 0;

  private _enabled = false;
  private _resolutionSet = false;
  private _initialized = false;
  private _reorientationPlugin?: ReorientationPlugin;
  private _tilesRenderer?: TilesRenderer;
  private _updateInterval?: ReturnType<typeof setInterval>;
  private _components?: OBC.Components;

  get enabled() {
    return this._enabled;
  }

  set enabled(value: boolean) {
    this._enabled = value;
    if (!this._initialized) return;
    const world = this.getWorld();
    if (value) {
      world.scene.three.add(this._tilesRenderer!.group);
      this.updateTiles();
    } else {
      world.scene.three.remove(this._tilesRenderer!.group);
    }
  }

  constructor(components: OBC.Components) {
    this._components = components;

    this._updateInterval = setInterval(() => {
      this.updateTiles();
    }, 300);

    const world = this.getWorld();
    world.camera.controls.maxDistance = 100000;
    world.camera.controls.addEventListener('control', () => {
      this.updateTiles();
    });
  }

  dispose() {
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
    }
    if (this._tilesRenderer) {
      this._tilesRenderer.dispose();
    }
  }

  updateMapPosition() {
    if (!this._reorientationPlugin) {
      throw new Error('Reorientation plugin not found!');
    }
    this._reorientationPlugin.transformLatLonHeightToOrigin(
      this.latitude * THREE.MathUtils.DEG2RAD,
      this.longitude * THREE.MathUtils.DEG2RAD,
      undefined,
      this.rotation
    );
    this.updateTiles();
  }

  notifyTokenChanged() {
    if (this._tilesRenderer) {
      this._tilesRenderer.dispose();
    }
    this._tilesRenderer = new TilesRenderer();
    this._resolutionSet = false;

    const world = this.getWorld();
    const cesiumIonPlugin = new CesiumIonAuthPlugin({
      apiToken: Ion.defaultAccessToken,
      assetId: '2275207',
      autoRefreshToken: true
    });

    this._reorientationPlugin = new ReorientationPlugin({
      lat: this.latitude * THREE.MathUtils.DEG2RAD,
      lon: this.longitude * THREE.MathUtils.DEG2RAD,
      recenter: true
    });

    // Resource path in this app points to copied assets under thatopen/.
    const dracoLoader = new DRACOLoader().setDecoderPath('/thatopen/resources/draco/');

    this._tilesRenderer.registerPlugin(cesiumIonPlugin);
    this._tilesRenderer.registerPlugin(new TileCompressionPlugin());
    this._tilesRenderer.registerPlugin(new TilesFadePlugin());
    this._tilesRenderer.registerPlugin(this._reorientationPlugin);
    this._tilesRenderer.registerPlugin(new GLTFExtensionsPlugin({ dracoLoader }));

    this._tilesRenderer.setCamera(world.camera.three);
    this._tilesRenderer.setResolutionFromRenderer(world.camera.three, world.renderer!.three);

    this._tilesRenderer.addEventListener('load-tileset', () => {
      const sphere = new THREE.Sphere();
      this._tilesRenderer!.getBoundingSphere(sphere);
      const nextFar = Math.max(world.camera.three.far, sphere.radius * 8);
      world.camera.three.far = nextFar;
      world.camera.three.updateProjectionMatrix();
    });

    if (this._enabled) {
      world.scene.three.add(this._tilesRenderer.group);
    }

    this._initialized = true;
  }

  updateTiles() {
    if (!this._enabled) return;
    if (!this._initialized) return;
    if (!this._resolutionSet) {
      const world = this.getWorld();
      this._tilesRenderer!.setResolutionFromRenderer(world.camera.three, world.renderer!.three);
      this._resolutionSet = true;
    }

    this._tilesRenderer!.update();
  }

  private getWorld() {
    if (!this._components) throw new Error('Components not initialized');
    const worlds = this._components.get(OBC.Worlds);
    return worlds.list.values().next().value as OBC.SimpleWorld<
      OBC.SimpleScene,
      OBC.OrthoPerspectiveCamera,
      OBC.SimpleRenderer
    >;
  }
}
