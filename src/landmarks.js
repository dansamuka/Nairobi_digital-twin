import * as THREE from 'three';

const proxyHeights = {
  kicc: 105, times_tower: 140, parliament: 38, bunge_tower: 125,
  city_hall: 48, supreme_court: 30, teleposta: 120, kencom: 103,
  nyayo_house: 84, national_archives: 26, nairobi_station: 20,
  railway_museum: 16, holy_family: 48, im_bank_tower: 99,
  afya_centre: 70, harambee_house: 62, britam_tower: 200, uap_tower: 163
};

const material = (color, roughness = 0.75, metalness = 0.04) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

function box(w, h, d, color) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material(color));
  m.position.y = h / 2;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function cylinder(r, h, color, sides = 32) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, sides), material(color));
  m.position.y = h / 2;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function labelSprite(text) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 512; canvas.height = 96;
  ctx.fillStyle = 'rgba(11,17,21,.82)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  ctx.fillStyle = '#ffffff'; ctx.font = '600 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 48, 490);
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.scale.set(120, 22.5, 1);
  return sprite;
}

function createKicc() {
  const g = new THREE.Group();
  const tower = cylinder(18, 88, 0x8d7660, 40); tower.position.y = 44; g.add(tower);
  const crown = cylinder(26, 8, 0x535d5d, 40); crown.position.y = 94; g.add(crown);
  const mast = cylinder(2.4, 8, 0x41484b, 16); mast.position.y = 102; g.add(mast);
  const base = cylinder(48, 12, 0xb29a7e, 32); base.scale.z = 0.72; base.position.set(-18, 6, 24); g.add(base);
  return g;
}

function createTimesTower() {
  const g = new THREE.Group();
  const body = box(45, 132, 38, 0x587f82); body.scale.x = 0.82; g.add(body);
  const mast = cylinder(1.4, 22, 0x394448, 10); mast.position.y = 143; g.add(mast);
  return g;
}

function createParliament() {
  const g = new THREE.Group();
  const main = box(105, 23, 58, 0xb59b78); g.add(main);
  const wing = box(62, 18, 50, 0xa68f73); wing.position.x = -70; g.add(wing);
  const clock = box(14, 48, 14, 0xb69b77); clock.position.set(18, 24, -18); g.add(clock);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(10, 10, 4), material(0x6e5a45)); cap.position.set(18, 53, -18); cap.rotation.y = Math.PI / 4; g.add(cap);
  return g;
}

function createBunge() {
  const g = new THREE.Group();
  const body = box(48, 118, 32, 0x73858b); g.add(body);
  const crown = box(54, 8, 36, 0x4a5558); crown.position.y = 122; g.add(crown);
  return g;
}

function createCityHall() {
  const g = new THREE.Group();
  g.add(box(92, 24, 54, 0xc0a684));
  const tower = box(18, 50, 18, 0xae9475); tower.position.set(8, 25, 4); g.add(tower);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(13, 12, 4), material(0x76634e)); cap.position.set(8, 56, 4); cap.rotation.y = Math.PI / 4; g.add(cap);
  return g;
}

function createTeleposta() {
  const g = new THREE.Group();
  const body = cylinder(28, 112, 0x917f72, 6); body.rotation.y = Math.PI / 6; g.add(body);
  g.add(box(80, 10, 62, 0x8e7a69));
  return g;
}

function createChurch() {
  const g = new THREE.Group();
  const main = box(74, 26, 46, 0xc6b79b); g.add(main);
  const nave = new THREE.Mesh(new THREE.CylinderGeometry(28, 28, 30, 24, 1, false, 0, Math.PI), material(0xb5a486));
  nave.rotation.z = Math.PI / 2; nave.rotation.y = Math.PI / 2; nave.position.y = 26; g.add(nave);
  const tower = box(13, 46, 13, 0xc4b393); tower.position.set(-28, 23, -5); g.add(tower);
  return g;
}

function createBritam() {
  const g = new THREE.Group();
  const geo = new THREE.CylinderGeometry(28, 42, 192, 5);
  const m = new THREE.Mesh(geo, material(0x5b7f8a, 0.4, 0.15)); m.position.y = 96; m.rotation.y = 0.34; m.castShadow = true; g.add(m);
  const crown = new THREE.Mesh(new THREE.ConeGeometry(28, 25, 5), material(0x455c65, 0.35, 0.2)); crown.position.y = 204; crown.rotation.y = 0.34; g.add(crown);
  return g;
}

function createUap() {
  const g = new THREE.Group();
  const body = box(44, 158, 36, 0x537c88); body.rotation.y = -0.12; g.add(body);
  const crown = new THREE.Mesh(new THREE.ConeGeometry(24, 18, 4), material(0x465e67)); crown.position.y = 167; crown.rotation.y = Math.PI / 4; g.add(crown);
  return g;
}

function defaultProxy(id) {
  const h = proxyHeights[id] ?? 55;
  const ratio = Math.max(26, Math.min(68, h * 0.36));
  return box(ratio, h, ratio * 0.72, id.includes('station') ? 0x9d866f : 0x77858a);
}

function createProxy(id) {
  if (id === 'kicc') return createKicc();
  if (id === 'times_tower') return createTimesTower();
  if (id === 'parliament') return createParliament();
  if (id === 'bunge_tower') return createBunge();
  if (id === 'city_hall') return createCityHall();
  if (id === 'teleposta') return createTeleposta();
  if (id === 'holy_family') return createChurch();
  if (id === 'britam_tower') return createBritam();
  if (id === 'uap_tower') return createUap();
  return defaultProxy(id);
}

export function createLandmarkLayers(manifest) {
  const pins = new THREE.Group(); pins.name = 'landmark-pins';
  const heroes = new THREE.Group(); heroes.name = 'hero-proxies';
  for (const lm of manifest.landmarks) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 18, 12), new THREE.MeshBasicMaterial({ color: lm.status === 'verified' ? 0xf5d36b : 0xe49968 }));
    pin.position.set(lm.local_x_m, 9, lm.local_z_m); pins.add(pin);
    const proxy = createProxy(lm.id);
    proxy.position.set(lm.local_x_m, 0, lm.local_z_m);
    proxy.userData.landmark = lm;
    const label = labelSprite(lm.canonical_name);
    label.position.y = (proxyHeights[lm.id] ?? 55) + 28;
    proxy.add(label);
    heroes.add(proxy);
  }
  return { pins, heroes };
}
