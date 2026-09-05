import * as THREE from 'three';

function mat(color, roughness = 0.8, metalness = 0.03, emissive = 0x000000, emissiveIntensity = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity });
}
function projectPath(projection, coords) { return coords.map(([lon, lat]) => projection.project(lon, lat)); }
function samplePath(points, spacing = 40) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1]; const dx = b.x - a.x, dz = b.z - a.z; const len = Math.hypot(dx, dz); const n = Math.max(1, Math.floor(len / spacing));
    for (let j = 0; j <= n; j++) { const t = j / n; out.push({ x: a.x + dx * t, z: a.z + dz * t, angle: Math.atan2(dx, dz) }); }
  }
  return out;
}

export function createStreetscape(projection) {
  const group = new THREE.Group(); group.name = 'streetscape';
  const trees = new THREE.Group(), lights = new THREE.Group(), furniture = new THREE.Group(), water = new THREE.Group(); group.add(trees, lights, furniture, water);
  const trunkGeo = new THREE.CylinderGeometry(0.55, 0.78, 5.2, 8), crownGeo = new THREE.IcosahedronGeometry(3.8, 1);
  const trunkMat = mat(0x5f4934, 0.95), leafMat = mat(0x456247, 0.98);
  const treePoints = [
    ...samplePath(projectPath(projection, [[36.8151,-1.2909],[36.8163,-1.2880],[36.8176,-1.2853]]), 35),
    ...samplePath(projectPath(projection, [[36.8172,-1.2918],[36.8187,-1.2885],[36.8191,-1.2851]]), 38),
    ...samplePath(projectPath(projection, [[36.8200,-1.2872],[36.8222,-1.2866],[36.8244,-1.2858]]), 44)
  ];
  const trunks = new THREE.InstancedMesh(trunkGeo, trunkMat, treePoints.length * 2), crowns = new THREE.InstancedMesh(crownGeo, leafMat, treePoints.length * 2);
  const matrix = new THREE.Matrix4(); let ti = 0;
  for (const p of treePoints) for (const side of [-1, 1]) {
    const offset = 10 * side, nx = Math.cos(p.angle) * offset, nz = -Math.sin(p.angle) * offset, s = 0.82 + ((ti * 13) % 17) / 50;
    matrix.compose(new THREE.Vector3(p.x + nx, 2.6, p.z + nz), new THREE.Quaternion(), new THREE.Vector3(s, s, s)); trunks.setMatrixAt(ti, matrix);
    matrix.compose(new THREE.Vector3(p.x + nx, 7.2 * s, p.z + nz), new THREE.Quaternion(), new THREE.Vector3(s, s * 0.78, s)); crowns.setMatrixAt(ti, matrix); ti++;
  }
  trunks.count = ti; crowns.count = ti; trunks.castShadow = true; crowns.castShadow = true; trees.add(trunks, crowns);

  const poleGeo = new THREE.CylinderGeometry(0.15, 0.22, 8, 8), lampGeo = new THREE.SphereGeometry(0.48, 10, 8);
  const poleMat = mat(0x3d4548, 0.55, 0.38), lampMat = mat(0x52575a, 0.45, 0.2, 0xffd38a, 0); lampMat.userData.streetLampMaterial = true;
  const lightRoutes = [
    [[36.8150,-1.2868],[36.8195,-1.2864],[36.8245,-1.2858],[36.8290,-1.2848]],
    [[36.8182,-1.2928],[36.8208,-1.2894],[36.8233,-1.2867],[36.8258,-1.2828]],
    [[36.8162,-1.2919],[36.8218,-1.2914],[36.8278,-1.2912]]
  ];
  let lp = 0; const lightPts = lightRoutes.flatMap(r => samplePath(projectPath(projection, r), 48));
  const poles = new THREE.InstancedMesh(poleGeo, poleMat, lightPts.length * 2), bulbs = new THREE.InstancedMesh(lampGeo, lampMat, lightPts.length * 2);
  for (const p of lightPts) for (const side of [-1,1]) {
    const off = 8.5 * side, x = p.x + Math.cos(p.angle) * off, z = p.z - Math.sin(p.angle) * off;
    matrix.makeTranslation(x, 4, z); poles.setMatrixAt(lp, matrix); matrix.makeTranslation(x, 8.15, z); bulbs.setMatrixAt(lp, matrix); lp++;
  }
  poles.count = lp; bulbs.count = lp; lights.add(poles, bulbs);

  const benchMat = mat(0x6a533d, 0.9), metal = mat(0x3b4245, 0.55, 0.35), parkCenter = projection.project(36.8162, -1.2894);
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * Math.PI * 2, r = 95 + (i % 3) * 22, bench = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.35, 1.5), benchMat); seat.position.y = 1.1; bench.add(seat);
    const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.1, 1.2), metal); leg1.position.set(-1.6,0.55,0); const leg2 = leg1.clone(); leg2.position.x = 1.6; bench.add(leg1, leg2);
    bench.position.set(parkCenter.x + Math.cos(a) * r, 0, parkCenter.z + Math.sin(a) * r); bench.rotation.y = -a; furniture.add(bench);
  }

  const lakeCenter = projection.project(36.8160, -1.2913), lakeGeo = new THREE.CircleGeometry(92, 64); lakeGeo.scale(1.35, 0.68, 1); lakeGeo.rotateX(-Math.PI / 2);
  const lakeMat = new THREE.MeshPhysicalMaterial({ color: 0x4f7880, roughness: 0.21, metalness: 0.04, transmission: 0.04, clearcoat: 0.42, clearcoatRoughness: 0.18, transparent: true, opacity: 0.88 });
  const lake = new THREE.Mesh(lakeGeo, lakeMat); lake.position.set(lakeCenter.x, 0.35, lakeCenter.z); lake.receiveShadow = true; water.add(lake);

  const flags = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const p = projection.project(36.8211 + i * 0.00018, -1.2892 + (i % 2) * 0.00008);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.12,12,8), metal); pole.position.set(p.x,6,p.z); flags.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(4.2,2.4), mat(i%3===0?0x101010:i%3===1?0xb7282e:0x237246,0.75)); flag.position.set(p.x+2.1,10,p.z); flags.add(flag);
  }
  furniture.add(flags);
  function setNight(night) { lampMat.emissiveIntensity = night ? 5.0 : 0; }
  function setWetness(wet) { lakeMat.roughness = wet ? 0.12 : 0.21; }
  function setDensity(value) { trees.visible = value > 0.18; furniture.visible = value > 0.35; lights.visible = value > 0.05; }
  return { group, trees, lights, furniture, water, setNight, setWetness, setDensity };
}
