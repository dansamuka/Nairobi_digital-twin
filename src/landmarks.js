import * as THREE from 'three';

const H = {
  kicc: 105, times_tower: 140, parliament: 38, bunge_tower: 125,
  city_hall: 50, supreme_court: 30, teleposta: 120, kencom: 103,
  nyayo_house: 84, national_archives: 26, nairobi_station: 20,
  railway_museum: 16, holy_family: 68, im_bank_tower: 99,
  afya_centre: 70, harambee_house: 62, britam_tower: 200, uap_tower: 163,
  kenya_re_towers: 105, cic_pension_towers: 120
};

const COLORS = {
  concrete: 0xa99a86, pale: 0xc8bca9, stone: 0xb8a88f, dark: 0x343b3e,
  glass: 0x4c7580, blueGlass: 0x416b78, bronzeGlass: 0x786e61,
  roof: 0x555c5d, green: 0x78867c, warm: 0x9c8068
};

function std(color, roughness = 0.72, metalness = 0.04, emissive = 0x000000, emissiveIntensity = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity });
}
function glass(color = COLORS.glass) {
  return new THREE.MeshPhysicalMaterial({ color, roughness: 0.19, metalness: 0.12, reflectivity: 0.82, clearcoat: 0.22, clearcoatRoughness: 0.22, opacity: 0.92, transparent: true });
}
function box(w, h, d, mat, y = h / 2) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.y = y; m.castShadow = true; m.receiveShadow = true; return m;
}
function cyl(r, h, mat, sides = 32, y = h / 2) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, sides), mat);
  m.position.y = y; m.castShadow = true; m.receiveShadow = true; return m;
}
function cone(r, h, mat, sides = 6, y = h / 2) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, sides), mat);
  m.position.y = y; m.castShadow = true; return m;
}
function addVerticalFins(group, w, h, d, count, material, frontZ) {
  for (let i = 0; i < count; i++) {
    const x = -w / 2 + (i + 0.5) * w / count;
    const fin = box(Math.max(0.45, w / count * 0.08), h, d, material);
    fin.position.x = x; fin.position.z = frontZ; group.add(fin);
  }
}
function addRoofDetails(group, footprint = 30, y = 60) {
  const tankMat = std(0x6f7470, 0.62, 0.08);
  const tank = cyl(Math.max(2.5, footprint * 0.08), 4, tankMat, 16, y + 2); tank.position.x = -footprint * 0.18; group.add(tank);
  const mech = box(footprint * 0.22, 4, footprint * 0.18, std(0x5d6362, 0.84), y + 2); mech.position.x = footprint * 0.18; group.add(mech);
  const mast = cyl(0.45, 9, std(0x484d4d, 0.4, 0.45), 10, y + 4.5); mast.position.z = footprint * 0.1; group.add(mast);
}
function windowBands(group, w, h, d, rows, mat, y0 = 0) {
  const bandH = Math.max(0.6, h / rows * 0.35);
  for (let i = 0; i < rows; i++) {
    const y = y0 + (i + 0.55) * h / rows;
    const f = box(w * 0.91, bandH, 0.35, mat, y); f.position.z = d / 2 + 0.22; group.add(f);
    const b = f.clone(); b.position.z = -d / 2 - 0.22; group.add(b);
  }
}
function emissiveWindows(group, w, h, d, cols, rows, y0 = 0) {
  const g = new THREE.Group();
  const mat = std(0x393c3d, 0.48, 0.06, 0xffcc78, 0);
  mat.userData.windowLightMaterial = true;
  const ww = w / cols * 0.48, wh = h / rows * 0.22;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if ((r * 5 + c * 3) % 7 === 0) continue;
    const x = -w / 2 + (c + 0.5) * w / cols;
    const y = y0 + (r + 0.55) * h / rows;
    const f = box(ww, wh, 0.15, mat, y); f.position.x = x; f.position.z = d / 2 + 0.25; g.add(f);
  }
  group.add(g); return g;
}
function labelSprite(text) {
  const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d');
  canvas.width = 640; canvas.height = 104;
  ctx.fillStyle = 'rgba(9,14,18,.82)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,.16)'; ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
  ctx.fillStyle = '#fff'; ctx.font = '600 28px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 320, 52, 610);
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
  sprite.scale.set(138, 22.5, 1); sprite.userData.isLabel = true; return sprite;
}

function createKicc() {
  const g = new THREE.Group();
  const concrete = std(0x9a826b, 0.88); const dark = std(0x4a5152, 0.52, 0.12); const win = glass(0x516f72);
  const body = cyl(18.5, 86, concrete, 48, 45); g.add(body);
  for (let i = 0; i < 24; i++) {
    const a = i / 24 * Math.PI * 2; const rib = box(1.05, 82, 1.8, std(0x7e6b5a, 0.85), 44);
    rib.position.set(Math.cos(a) * 18.3, 44, Math.sin(a) * 18.3); rib.rotation.y = -a; g.add(rib);
  }
  const obs = cyl(19.5, 8, win, 48, 90); g.add(obs);
  // Helipad: a wide disc cantilevering out from the tower on a cone-frustum flare — KICC's signature silhouette.
  const padGeo = new THREE.CylinderGeometry(27, 19.5, 6, 48); const pad = new THREE.Mesh(padGeo, dark); pad.position.y = 97; pad.castShadow = true; g.add(pad);
  const rim = cyl(27.3, 0.6, std(0xd9d3c4, 0.55), 48, 100.3); g.add(rim);
  const mast = cyl(1.6, 10, dark, 12, 105); g.add(mast);
  // Plenary Hall: stacked cuboid massing (per source, the hall itself is boxy, not conical) beside the tower base.
  const hallLower = box(46, 9, 34, std(0xb19a80, 0.9), 4.5); hallLower.position.set(-24, 4.5, 26); g.add(hallLower);
  const hallUpper = box(33, 8, 25, std(0xa88a68, 0.9), 12.5); hallUpper.position.set(-24, 12.5, 26); g.add(hallUpper);
  // Conference Centre: a round drum topped by a cable-supported tented dome — KICC's other signature volume.
  const domeGroup = new THREE.Group(); domeGroup.position.set(34, 0, 22);
  const domeWallMat = std(0xc9bda0, 0.85); const domeRoofMat = std(0xb3a488, 0.55, 0.1);
  domeGroup.add(cyl(28, 8, domeWallMat, 40, 4));
  const domeRoof = cone(30, 12, domeRoofMat, 40, 14); domeGroup.add(domeRoof);
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * Math.PI * 2; const rib = box(0.5, 12.5, 1, std(0x54493c, 0.5, 0.3), 0);
    rib.position.set(Math.cos(a) * 15, 8.5, Math.sin(a) * 15); rib.rotation.y = -a; rib.rotation.x = -0.55; domeGroup.add(rib);
  }
  const finial = cyl(0.5, 5, std(0x4a4136, 0.4, 0.4), 8, 22.5); domeGroup.add(finial);
  g.add(domeGroup);
  addRoofDetails(g, 18, 102); return g;
}
function createTimesTower() {
  const g = new THREE.Group(); const frame = std(0x526469, 0.42, 0.19); const glazing = glass(0x4b7b83);
  const body = box(41, 126, 35, glazing, 63); g.add(body);
  addVerticalFins(g, 41, 126, 1.1, 11, frame, 17.9);
  windowBands(g, 41, 126, 35, 24, frame);
  const cap = box(45, 7, 38, frame, 129.5); g.add(cap);
  const mast = cyl(1.1, 23, std(0x343c3e, 0.35, 0.55), 10, 144); g.add(mast);
  emissiveWindows(g, 39, 116, 35, 9, 22, 4); addRoofDetails(g, 25, 133); return g;
}
function createParliament() {
  const g = new THREE.Group(); const stone = std(0xb69a78, 0.91); const trim = std(0xd0bd9b, 0.9); const roof = std(0x61594d, 0.82);
  const main = box(110, 24, 59, stone, 12); g.add(main);
  const portico = box(38, 17, 8, trim, 8.5); portico.position.z = 33; g.add(portico);
  for (let i = 0; i < 6; i++) { const c = cyl(1.5, 14, trim, 16, 7); c.position.set(-15 + i * 6, 7, 37.5); g.add(c); }
  const wing = box(66, 18, 50, stone, 9); wing.position.x = -76; g.add(wing);
  const clock = box(15, 48, 15, stone, 24); clock.position.set(20, 24, -19); g.add(clock);
  const cap = cone(11.5, 12, roof, 4, 54); cap.position.set(20, 54, -19); cap.rotation.y = Math.PI / 4; g.add(cap);
  addRoofDetails(g, 22, 24); return g;
}
function createBunge() {
  const g = new THREE.Group(); const glassM = glass(0x66818a); const fin = std(0xa6a39a, 0.72, 0.08);
  const body = box(49, 116, 34, glassM, 58); g.add(body); addVerticalFins(g, 49, 116, 0.9, 10, fin, 17.4);
  const podium = box(72, 12, 48, std(0xaaa091, 0.89), 6); g.add(podium);
  const crown = box(54, 8, 38, std(0x4d585b, 0.48, 0.18), 120); g.add(crown); emissiveWindows(g, 46, 106, 34, 8, 19, 5); return g;
}
function createCityHall() {
  // Neo-classical: smooth dressed stone in white lime plaster, Mangalore clay-tile roof, English clock tower ~165 ft (50 m).
  const g = new THREE.Group(); const stone = std(0xd9d2bb, 0.85); const trim = std(0xf1e9d6, 0.9); const roof = std(0x8a4a3a, 0.85);
  g.add(box(96, 24, 56, stone, 12)); const tower = box(17, 50, 17, stone, 25); tower.position.set(8, 25, 3); g.add(tower);
  const clockFace = std(0xf4ecd8, 0.4, 0.05); const face = box(8, 8, 0.6, clockFace, 42); face.position.set(8, 42, 12); g.add(face);
  const cap = cone(12, 13, roof, 4, 57); cap.position.set(8, 57, 3); cap.rotation.y = Math.PI / 4; g.add(cap);
  for (let i = 0; i < 8; i++) { const c = cyl(1.1, 11, trim, 12, 5.5); c.position.set(-30 + i * 8, 5.5, 30); g.add(c); }
  emissiveWindows(g, 82, 16, 56, 10, 4, 4); return g;
}
function createSupremeCourt() {
  // Same neo-classical civic-quadrangle palette as City Hall opposite it on City Hall Way.
  const g = new THREE.Group(); const stone = std(0xd7cfb7, 0.87); g.add(box(70, 22, 43, stone, 11));
  const portico = box(34, 15, 7, std(0xf1e9d4, 0.9), 7.5); portico.position.z = 25; g.add(portico);
  for (let i = 0; i < 5; i++) { const c = cyl(1.25, 13, std(0xf6eed9, 0.9), 14, 6.5); c.position.set(-12 + i * 6, 6.5, 29); g.add(c); }
  return g;
}
function createTeleposta() {
  const g = new THREE.Group(); const concrete = std(0x8d7d71, 0.84); const win = glass(0x516a6f);
  const body = cyl(29, 111, concrete, 6, 55.5); body.rotation.y = Math.PI / 6; g.add(body);
  const inner = cyl(24.5, 103, win, 6, 54); inner.rotation.y = Math.PI / 6; g.add(inner);
  g.add(box(86, 10, 64, std(0x88776a, 0.9), 5)); addRoofDetails(g, 28, 111); emissiveWindows(g, 45, 92, 42, 7, 16, 8); return g;
}
function createHolyFamily() {
  const g = new THREE.Group(); const stone = std(0xc2b59c, 0.93); const roof = std(0x6e6d68, 0.78, 0.06);
  g.add(box(76, 25, 48, stone, 12.5)); const nave = box(40, 34, 40, stone, 17); nave.position.z = -8; g.add(nave);
  const roof1 = cone(35, 19, roof, 4, 39); roof1.scale.z = 0.72; roof1.rotation.y = Math.PI / 4; roof1.position.z = -8; g.add(roof1);
  const tower = box(14, 48, 14, stone, 24); tower.position.set(-28, 24, 0); g.add(tower); const spire = cone(10, 20, roof, 4, 58); spire.position.set(-28, 58, 0); spire.rotation.y = Math.PI / 4; g.add(spire); return g;
}
function createBritam() {
  // Britam Tower: a square-plan prism tapering from a wide base to a narrow two-sided ridge roof,
  // topped by a 60 m mast carrying three helical wind turbines — its documented, distinctive silhouette.
  const g = new THREE.Group(); const glassM = glass(0x2c3033); const frame = std(0x32373a, 0.4, 0.25);
  const bodyH = 122;
  const bodyGeo = new THREE.CylinderGeometry(14, 30, bodyH, 4, 1, false);
  const body = new THREE.Mesh(bodyGeo, glassM); body.position.y = bodyH / 2; body.rotation.y = Math.PI / 4; body.castShadow = true; g.add(body);
  const roofGeo = new THREE.CylinderGeometry(0.4, 14, 16, 4, 1, false);
  const roof = new THREE.Mesh(roofGeo, frame); roof.position.y = bodyH + 8; roof.rotation.y = Math.PI / 4; g.add(roof);
  for (let i = 0; i < 4; i++) {
    const a = i / 4 * Math.PI * 2 + Math.PI / 4; const fin = box(1.3, bodyH, 1.3, frame, bodyH / 2);
    fin.position.x = Math.cos(a) * 21.5; fin.position.z = Math.sin(a) * 21.5; g.add(fin);
  }
  const mastBase = bodyH + 16;
  const mast = cyl(0.9, 60, std(0x2b2e2f, 0.4, 0.5), 10, mastBase + 30); g.add(mast);
  for (let i = 0; i < 3; i++) {
    const turbine = cyl(0.32, 8, std(0xd9dcdd, 0.5, 0.3), 10, mastBase + 38 + i * 7);
    turbine.rotation.z = i * 0.7; g.add(turbine);
  }
  return g;
}
function createUap() {
  // UAP Tower: explicitly modeled on the Empire State Building — stepped setback massing,
  // a central vertical glass spine, and a slender crowning spire (Kenya's first rooftop helipad).
  const g = new THREE.Group(); const glassM = glass(0x537985); const fin = std(0x8f9999, 0.54, 0.12); const frame = std(0x445055, 0.4, 0.2);
  const tiers = [
    { w: 44, d: 34, h: 58 }, { w: 36, d: 28, h: 34 }, { w: 28, d: 22, h: 26 },
    { w: 20, d: 16, h: 15 }, { w: 12, d: 11, h: 9 }
  ];
  let y = 0;
  for (const t of tiers) {
    const cy = y + t.h / 2;
    g.add(box(t.w, t.h, t.d, glassM, cy));
    const count = Math.max(4, Math.round(t.w / 4.5));
    for (let i = 0; i < count; i++) {
      const fx = -t.w / 2 + (i + 0.5) * t.w / count;
      const finMesh = box(0.5, t.h, 0.55, fin, cy); finMesh.position.x = fx; finMesh.position.z = t.d / 2 + 0.25; g.add(finMesh);
    }
    y += t.h;
  }
  const spine = box(4.5, y - 6, 1.2, frame, (y - 6) / 2); spine.position.z = tiers[0].d / 2 + 0.7; g.add(spine);
  const helipad = cyl(6, 0.6, std(0xd9d3c4, 0.55), 32, y + 0.3); g.add(helipad);
  const mast = cyl(1.1, 12, frame, 10, y + 6); g.add(mast);
  emissiveWindows(g, 40, y - 10, 34, 8, 26, 4);
  addRoofDetails(g, 20, y); return g;
}
function createKenyaRe() {
  // Kenya Re Towers: round modernist/brutalist tower, vertical glazing fins, layered flared crown.
  const g = new THREE.Group(); const concrete = std(0x9a8f7c, 0.8); const win = glass(0x4d6b72); const fin = std(0x7d7263, 0.75, 0.06);
  const bodyH = H.kenya_re_towers - 14;
  g.add(cyl(17, bodyH, win, 40, bodyH / 2));
  const count = 28;
  for (let i = 0; i < count; i++) {
    const a = i / count * Math.PI * 2; const rib = box(0.7, bodyH, 1.1, fin, bodyH / 2);
    rib.position.set(Math.cos(a) * 17.1, bodyH / 2, Math.sin(a) * 17.1); rib.rotation.y = -a; g.add(rib);
  }
  const crown1 = new THREE.Mesh(new THREE.CylinderGeometry(21, 17, 6, 40), concrete); crown1.position.y = bodyH + 3; crown1.castShadow = true; g.add(crown1);
  const crown2 = new THREE.Mesh(new THREE.CylinderGeometry(15, 21, 5, 40), concrete); crown2.position.y = bodyH + 8.5; crown2.castShadow = true; g.add(crown2);
  const mast = cyl(0.6, 6, std(0x4a4a44, 0.4, 0.4), 8, bodyH + 14); g.add(mast);
  addRoofDetails(g, 18, bodyH + 11); return g;
}
function createCicPensionTowers() {
  // CIC Pension Towers: podium base, central glass core, twin tapering sculpted "wing" stacks, angular crystalline spire.
  const g = new THREE.Group(); const glassM = glass(0x3f5b66); const wingMat = std(0xcfd6d3, 0.42, 0.18);
  const podiumH = 20; const coreH = H.cic_pension_towers - podiumH - 14;
  g.add(box(60, podiumH, 50, std(0xb9c0bb, 0.7, 0.05), podiumH / 2));
  g.add(box(20, coreH, 16, glassM, podiumH + coreH / 2));
  for (const side of [-1, 1]) {
    const segs = 6; let wy = podiumH;
    for (let i = 0; i < segs; i++) {
      const t = i / segs; const segH = coreH / segs;
      const w = 9 * (1 - t * 0.8); const d = 15 * (1 - t * 0.55);
      const seg = box(w, segH, d, wingMat, wy + segH / 2); seg.position.x = side * (10 + w / 2); g.add(seg);
      wy += segH;
    }
  }
  const spireH = 14; const spire = cone(6, spireH, std(0x9fb0ac, 0.35, 0.25), 4, podiumH + coreH + spireH / 2);
  spire.rotation.y = Math.PI / 4; g.add(spire);
  emissiveWindows(g, 18, coreH * 0.9, 16, 5, Math.max(6, Math.round(coreH / 6)), podiumH + 2);
  addRoofDetails(g, 20, podiumH + coreH); return g;
}
function createNationalArchives() {
  // Former National Bank of India HQ (1931): neo-classical, ground + 2 upper floors, grand columned entrance.
  const g = new THREE.Group(); const stone = std(0xcfc3a3, 0.88); const trim = std(0xe9dfc1, 0.9);
  g.add(box(58, 22, 38, stone, 11));
  const cornice = box(26, 2, 8, trim, 20.5); cornice.position.z = 19.5; g.add(cornice);
  for (let i = 0; i < 6; i++) { const c = cyl(1.05, 12, trim, 14, 6); c.position.set(-9 + i * 3.6, 6, 22); g.add(c); }
  return g;
}
function createStation() {
  // Colonial rectilinear stone station: post-beam-pediment facade with six front columns, Roman-arch openings.
  const g = new THREE.Group(); const warm = std(0xa88e70, 0.93); g.add(box(105, 14, 28, warm, 7));
  const center = box(38, 21, 32, std(0xb49b7d, 0.92), 10.5); g.add(center); const roof = cone(24, 10, std(0x5d5b54, 0.8), 4, 25); roof.scale.z = 0.72; roof.rotation.y = Math.PI / 4; g.add(roof);
  const trim = std(0xd6c6a8, 0.88);
  for (let i = 0; i < 6; i++) { const c = cyl(0.85, 8, trim, 12, 4); c.position.set(-40 + i * 16, 4, 14.6); g.add(c); }
  return g;
}
function createNyayoHouse() {
  // Nyayo House: brutalist "doubled-H" plan — three rounded-corner slab towers linked by short corridors,
  // the two outer towers dull orange, the core tower a darker brown.
  const g = new THREE.Group(); const h = H.nyayo_house; const w = 15, d = 12.5;
  const orange = std(0xa8592d, 0.8, 0.05); const core = std(0x5e5044, 0.84, 0.05);
  function slab(mat, x) {
    const grp = new THREE.Group();
    grp.add(box(w, h, d, mat, h / 2));
    const cap1 = cyl(d / 2, h, mat, 16, h / 2); cap1.position.set(-w / 2, 0, 0); grp.add(cap1);
    const cap2 = cap1.clone(); cap2.position.set(w / 2, 0, 0); grp.add(cap2);
    grp.position.x = x; g.add(grp); emissiveWindows(grp, w * 0.82, h * 0.86, d, 4, Math.max(6, Math.round(h / 6)), 4); return grp;
  }
  slab(core, 0); slab(orange, -27); slab(orange, 27);
  const link1 = box(27, 7, 5.5, core, 3.5); link1.position.x = -13.5; g.add(link1);
  const link2 = box(27, 7, 5.5, core, 3.5); link2.position.x = 13.5; g.add(link2);
  addRoofDetails(g, w, h); return g;
}
function defaultTower(id) {
  const h = H[id] ?? 55; const w = Math.max(24, Math.min(56, h * 0.35)); const g = new THREE.Group();
  const mat = id === 'afya_centre' ? std(0x8c7e70, 0.84) : glass(id === 'im_bank_tower' ? 0x5f6d75 : 0x667a80);
  g.add(box(w, h, w * 0.72, mat, h / 2)); emissiveWindows(g, w * 0.9, h * 0.86, w * 0.72, 7, Math.max(4, Math.round(h / 7)), 4); addRoofDetails(g, w, h); return g;
}
function createDetailed(id) {
  if (id === 'kicc') return createKicc(); if (id === 'times_tower') return createTimesTower(); if (id === 'parliament') return createParliament();
  if (id === 'bunge_tower') return createBunge(); if (id === 'city_hall') return createCityHall(); if (id === 'supreme_court') return createSupremeCourt();
  if (id === 'teleposta') return createTeleposta(); if (id === 'holy_family') return createHolyFamily(); if (id === 'britam_tower') return createBritam();
  if (id === 'uap_tower') return createUap(); if (id === 'national_archives') return createNationalArchives(); if (id === 'nairobi_station') return createStation();
  if (id === 'nyayo_house') return createNyayoHouse();
  if (id === 'kenya_re_towers') return createKenyaRe(); if (id === 'cic_pension_towers') return createCicPensionTowers();
  return defaultTower(id);
}
function createGreyProxy(id) {
  const h = H[id] ?? 55; const w = Math.max(22, Math.min(58, h * 0.36)); const g = new THREE.Group();
  g.add(box(w, h, w * 0.72, std(0x8d989b, 0.94), h / 2)); return g;
}

export function createLandmarkLayers(manifest) {
  const pins = new THREE.Group(); pins.name = 'landmark-pins';
  const grey = new THREE.Group(); grey.name = 'hero-proxies';
  const detailed = new THREE.Group(); detailed.name = 'hero-detailed';
  const selectable = [];
  for (const lm of manifest.landmarks) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 18, 12), new THREE.MeshBasicMaterial({ color: lm.status === 'verified' ? 0xf5d36b : 0xe49968 }));
    pin.position.set(lm.local_x_m, 9, lm.local_z_m); pins.add(pin);
    const proxy = createGreyProxy(lm.id); proxy.position.set(lm.local_x_m, 0, lm.local_z_m); proxy.userData.landmark = lm;
    const pLabel = labelSprite(lm.canonical_name); pLabel.position.y = (H[lm.id] ?? 55) + 25; proxy.add(pLabel); grey.add(proxy);
    const model = createDetailed(lm.id); model.position.set(lm.local_x_m, 0, lm.local_z_m); model.userData.landmark = lm; model.name = lm.id;
    const label = labelSprite(lm.canonical_name); label.position.y = (H[lm.id] ?? 55) + 25; model.add(label); detailed.add(model); selectable.push(model);
  }
  detailed.visible = false;
  function setNight(night) {
    detailed.traverse(obj => { if (obj.material?.userData?.windowLightMaterial) obj.material.emissiveIntensity = night ? 2.6 : 0; });
  }
  function setPhaseLook(phase) {
    detailed.traverse(obj => {
      const m = obj.material; if (!m || !m.color) return;
      if (m.userData.baseColor == null) { m.userData.baseColor = m.color.getHex(); m.userData.baseRoughness = m.roughness; m.userData.baseMetalness = m.metalness; }
      if (phase < 3) { m.color.set(0x929b9d); if ('roughness' in m) m.roughness = 0.9; if ('metalness' in m) m.metalness = 0.02; if (m.userData.windowLightMaterial) m.emissiveIntensity = 0; }
      else { m.color.setHex(m.userData.baseColor); if ('roughness' in m && m.userData.baseRoughness != null) m.roughness = m.userData.baseRoughness; if ('metalness' in m && m.userData.baseMetalness != null) m.metalness = m.userData.baseMetalness; }
    });
  }
  function setLabels(visible) { for (const group of [grey, detailed]) group.traverse(obj => { if (obj.userData?.isLabel) obj.visible = visible; }); }
  return { pins, grey, detailed, selectable, setNight, setPhaseLook, setLabels, heights: H };
}
