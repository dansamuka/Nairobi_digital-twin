import * as THREE from 'three';
import { createUI } from './ui.js';
import { createProjection } from './geo.js';
import { createScene, createTerrainScaffold, animate } from './scene.js';
import { createLandmarkLayers } from './landmarks.js';
import { fetchOsm, buildOsmLayers, buildFallbackContext } from './osm.js';

const app = document.querySelector('#app');
let currentStep = 10;
let sceneKit, projection, manifest, cameraPresets, landmarkLayers, contextLayers, terrain;

const ui = createUI(app, {
  onStep(step) { currentStep = step; applyStep(); },
  onCamera(index) { goToCamera(index); }
});

async function loadJson(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(`${path}: ${r.status}`);
  return r.json();
}

async function init() {
  [manifest, cameraPresets] = await Promise.all([
    loadJson('./data/source_manifest.json'),
    loadJson('./data/camera_presets.json')
  ]);
  projection = createProjection(manifest.coordinate_convention.origin);
  sceneKit = createScene(ui.viewport);

  terrain = createTerrainScaffold();
  sceneKit.scene.add(terrain);

  landmarkLayers = createLandmarkLayers(manifest);
  sceneKit.scene.add(landmarkLayers.pins, landmarkLayers.heroes);

  ui.setCameras(cameraPresets.presets);
  ui.setStats({ osm: 'Loading live…', buildings: '—', roads: '—', rail: '—', landmarks: manifest.landmarks.length });
  ui.setStep(currentStep);
  applyStep();

  try {
    const osm = await fetchOsm();
    contextLayers = buildOsmLayers(osm, projection);
    addContextLayers(contextLayers);
    ui.setStats({ osm: 'LIVE · OSM/Overpass', buildings: contextLayers.stats.buildingCount, roads: contextLayers.stats.roadCount, rail: contextLayers.stats.railCount, landmarks: manifest.landmarks.length });
  } catch (err) {
    console.warn('Using fallback context', err);
    contextLayers = buildFallbackContext(projection);
    addContextLayers(contextLayers);
    ui.setStats({ osm: 'FALLBACK · retry on reload', buildings: contextLayers.stats.buildingCount, roads: contextLayers.stats.roadCount, rail: contextLayers.stats.railCount, landmarks: manifest.landmarks.length });
  }
  applyStep();
  goToCamera(1);
  animate(sceneKit, fps => ui.setFps(fps));
}

function addContextLayers(layers) {
  sceneKit.scene.add(layers.sourceContext, layers.roads, layers.parks, layers.rail, layers.buildings);
}

function applyStep() {
  if (!sceneKit) return;
  sceneKit.grid.visible = currentStep >= 1;
  sceneKit.origin.visible = currentStep >= 1;
  if (terrain) terrain.visible = currentStep >= 4;
  if (landmarkLayers) {
    landmarkLayers.pins.visible = currentStep >= 2 && currentStep < 7;
    landmarkLayers.heroes.visible = currentStep >= 7;
  }
  if (contextLayers) {
    contextLayers.sourceContext.visible = currentStep >= 3 && currentStep < 6;
    contextLayers.roads.visible = currentStep >= 5;
    contextLayers.parks.visible = currentStep >= 5;
    contextLayers.buildings.visible = currentStep >= 6;
    contextLayers.rail.visible = currentStep >= 8;
  }
  ui.setStep(currentStep);
}

function targetForPreset(preset) {
  const targets = preset.target_ids
    .map(id => manifest.landmarks.find(l => l.id === id))
    .filter(Boolean);
  if (!targets.length) return new THREE.Vector3(0, 25, 0);
  const x = targets.reduce((s,l)=>s+l.local_x_m,0)/targets.length;
  const z = targets.reduce((s,l)=>s+l.local_z_m,0)/targets.length;
  return new THREE.Vector3(x, 32, z);
}

function goToCamera(index) {
  if (!sceneKit || !cameraPresets) return;
  const p = cameraPresets.presets[index];
  const [lon, lat] = p.anchor_wgs84;
  const a = projection.project(lon, lat);
  const target = targetForPreset(p);
  const eyeY = Math.max(p.eye_height_m, index === 2 ? 110 : 7);
  const anchor = new THREE.Vector3(a.x, eyeY, a.z);
  const toward = target.clone().sub(anchor);
  if (toward.length() < 80) toward.set(0, -0.1, -1);
  toward.normalize();
  const backoff = index === 2 ? 0 : 55;
  sceneKit.camera.position.copy(anchor).addScaledVector(toward, -backoff);
  sceneKit.controls.target.copy(target);
  sceneKit.controls.update();
}

init().catch(err => {
  console.error(err);
  ui.setStats({ osm: 'INIT ERROR', buildings: '—', roads: '—', rail: '—', landmarks: '—' });
});
