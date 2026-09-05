import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { createEnvironment } from './environment.js';

export function createScene(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance', alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xb9c8d1); scene.fog = new THREE.FogExp2(0xb9c8d1, 0.00018);
  const camera = new THREE.PerspectiveCamera(48, Math.max(1, host.clientWidth) / Math.max(1, host.clientHeight), 0.4, 30000); camera.position.set(-900, 680, 1200);
  const controls = new OrbitControls(camera, renderer.domElement); controls.enableDamping = true; controls.dampingFactor = 0.06; controls.target.set(0, 35, 0); controls.maxDistance = 9000; controls.minDistance = 8; controls.maxPolarAngle = Math.PI * 0.495;
  const environment = createEnvironment(scene, renderer);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x7e8774, roughness: 0.96, metalness: 0.0 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), groundMat); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.5; ground.receiveShadow = true; scene.add(ground);
  const grid = new THREE.GridHelper(5000, 50, 0x3f5662, 0x6f7f86); grid.position.y = 0.08; grid.material.opacity = 0.18; grid.material.transparent = true; scene.add(grid);
  const origin = new THREE.Group(); const ring = new THREE.Mesh(new THREE.RingGeometry(10, 14, 48), new THREE.MeshBasicMaterial({ color: 0xf5d36b, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.3; origin.add(ring); scene.add(origin);
  const composer = new EffectComposer(renderer); const renderPass = new RenderPass(scene, camera); const bloom = new UnrealBloomPass(new THREE.Vector2(host.clientWidth, host.clientHeight), 0.36, 0.55, 0.88); composer.addPass(renderPass); composer.addPass(bloom); bloom.enabled = false;
  function resize() { const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight); camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false); composer.setSize(w, h); }
  window.addEventListener('resize', resize);
  return { renderer, composer, bloom, scene, camera, controls, grid, ground, groundMat, origin, environment, resize };
}

export function createTerrainScaffold() {
  const group = new THREE.Group(); group.name = 'terrain-scaffold'; const geometry = new THREE.PlaneGeometry(7600, 7600, 96, 96); geometry.rotateX(-Math.PI / 2); const p = geometry.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), broadSlope = -0.010 * z + 0.004 * x, softRelief = 8 * Math.sin(x / 1700) * Math.cos(z / 1500) + 3 * Math.sin((x + z) / 900); p.setY(i, broadSlope + softRelief - 13); }
  geometry.computeVertexNormals(); const mat = new THREE.MeshStandardMaterial({ color: 0x7f8975, roughness: 1.0, metalness: 0.0 }); const mesh = new THREE.Mesh(geometry, mat); mesh.receiveShadow = true; group.add(mesh); group.userData.material = mat; group.userData.isScaffold = true; return group;
}

export function createRainSystem(count = 7000) {
  const geometry = new THREE.BufferGeometry(), positions = new Float32Array(count * 3), seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) { positions[i * 3] = (Math.random() - 0.5) * 3200; positions[i * 3 + 1] = Math.random() * 850 + 20; positions[i * 3 + 2] = (Math.random() - 0.5) * 3200; seeds[i] = 0.75 + Math.random() * 1.6; }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3)); const material = new THREE.PointsMaterial({ color: 0xd6e2ea, size: 1.2, transparent: true, opacity: 0.58, depthWrite: false }); const points = new THREE.Points(geometry, material); points.visible = false; points.frustumCulled = false; points.userData.seeds = seeds; return points;
}

export function updateRain(points, dt, camera) { if (!points.visible) return; points.position.x = camera.position.x; points.position.z = camera.position.z; const pos = points.geometry.attributes.position, seeds = points.userData.seeds; for (let i = 0; i < pos.count; i++) { let y = pos.getY(i) - dt * 190 * seeds[i]; if (y < 0) y += 850; pos.setY(i, y); } pos.needsUpdate = true; }

export function animate(sceneKit, handlers = {}) {
  const { renderer, composer, scene, camera, controls, bloom } = sceneKit; let last = performance.now(), smoothed = 60;
  renderer.setAnimationLoop((now) => { const dtMs = Math.min(80, Math.max(1, now - last)); last = now; const dt = dtMs / 1000; controls.update(); handlers.update?.(dt, now / 1000); const fps = 1000 / dtMs; smoothed = smoothed * 0.93 + fps * 0.07; handlers.onFrame?.(smoothed, renderer.info); if (bloom.enabled) composer.render(); else renderer.render(scene, camera); });
}
