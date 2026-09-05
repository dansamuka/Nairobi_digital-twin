import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createScene(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb9c8d1);
  scene.fog = new THREE.FogExp2(0xb9c8d1, 0.00022);

  const camera = new THREE.PerspectiveCamera(48, host.clientWidth / host.clientHeight, 0.5, 30000);
  camera.position.set(-900, 680, 1200);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 35, 0);
  controls.maxDistance = 9000;
  controls.minDistance = 20;
  controls.maxPolarAngle = Math.PI * 0.495;

  const hemi = new THREE.HemisphereLight(0xe6f2ff, 0x7b6b54, 1.8);
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff3d8, 3.0);
  sun.position.set(-1200, 1800, 700);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -1800;
  sun.shadow.camera.right = 1800;
  sun.shadow.camera.top = 1800;
  sun.shadow.camera.bottom = -1800;
  sun.shadow.camera.near = 100;
  sun.shadow.camera.far = 5000;
  scene.add(sun);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(9000, 9000),
    new THREE.MeshStandardMaterial({ color: 0x8d947f, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.35;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(5000, 50, 0x3f5662, 0x6f7f86);
  grid.position.y = 0.05;
  grid.material.opacity = 0.23;
  grid.material.transparent = true;
  scene.add(grid);

  const origin = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(10, 14, 48),
    new THREE.MeshBasicMaterial({ color: 0xf5d36b, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.3;
  origin.add(ring);
  scene.add(origin);

  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', resize);

  return { renderer, scene, camera, controls, grid, ground, origin, resize };
}

export function createTerrainScaffold() {
  const group = new THREE.Group();
  group.name = 'terrain-scaffold';
  const geometry = new THREE.PlaneGeometry(7000, 7000, 80, 80);
  geometry.rotateX(-Math.PI / 2);
  const p = geometry.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    const broadSlope = -0.010 * z + 0.004 * x;
    const softRelief = 9 * Math.sin(x / 1700) * Math.cos(z / 1500);
    p.setY(i, broadSlope + softRelief - 12);
  }
  geometry.computeVertexNormals();
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x87917a, roughness: 1, wireframe: false }));
  mesh.receiveShadow = true;
  group.add(mesh);
  return group;
}

export function animate({ renderer, scene, camera, controls }, onFrame) {
  let last = performance.now();
  let smoothed = 60;
  renderer.setAnimationLoop((now) => {
    controls.update();
    const dt = Math.max(1, now - last);
    last = now;
    const fps = 1000 / dt;
    smoothed = smoothed * 0.94 + fps * 0.06;
    onFrame?.(smoothed);
    renderer.render(scene, camera);
  });
}
