import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { polygonAreaXZ } from './geo.js';

const BBOX = { south: -1.2985, west: 36.8145, north: -1.2785, east: 36.8310 };
const OVERPASS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

function query() {
  const b = `${BBOX.south},${BBOX.west},${BBOX.north},${BBOX.east}`;
  return `[out:json][timeout:22];(way["building"](${b});way["highway"](${b});way["railway"](${b});way["leisure"="park"](${b});way["leisure"="garden"](${b});way["natural"="water"](${b});way["waterway"](${b}););out tags geom;`;
}

async function fetchEndpoint(url, signal) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: `data=${encodeURIComponent(query())}`,
    signal
  });
  if (!response.ok) throw new Error(`Overpass ${response.status}`);
  return response.json();
}

export async function fetchOsm() {
  for (const url of OVERPASS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try { return await fetchEndpoint(url, controller.signal); }
    catch (err) { console.warn('OSM endpoint failed', url, err); }
    finally { clearTimeout(timer); }
  }
  throw new Error('All Overpass endpoints failed');
}

function numberTag(value) {
  if (value == null) return null;
  const n = Number.parseFloat(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function deterministicHeight(el) {
  const direct = numberTag(el.tags?.height);
  if (direct) return Math.min(240, Math.max(3.5, direct));
  const levels = numberTag(el.tags?.['building:levels']);
  if (levels) return Math.min(180, Math.max(3.5, levels * 3.35));
  const hash = Number(el.id) % 11;
  return 8 + hash * 2.2;
}

function lineRibbon(points, width, y = 0.18) {
  const positions = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    const dx = b.x - a.x, dz = b.z - a.z;
    const len = Math.hypot(dx, dz) || 1;
    const nx = -dz / len * width * 0.5, nz = dx / len * width * 0.5;
    positions.push(
      a.x + nx, y, a.z + nz, a.x - nx, y, a.z - nz, b.x + nx, y, b.z + nz,
      b.x + nx, y, b.z + nz, a.x - nx, y, a.z - nz, b.x - nx, y, b.z - nz
    );
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.computeVertexNormals();
  return g;
}

function roadWidth(tags = {}) {
  const v = tags.highway;
  if (['motorway','trunk'].includes(v)) return 18;
  if (['primary'].includes(v)) return 15;
  if (['secondary'].includes(v)) return 11;
  if (['tertiary'].includes(v)) return 9;
  if (['residential','service'].includes(v)) return 6;
  return 4;
}

function toPoints(el, projection) {
  return (el.geometry || []).map(p => projection.project(p.lon, p.lat));
}

function polygonGeometry(points) {
  if (points.length < 3) return null;
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, -points[0].z);
  for (let i = 1; i < points.length; i++) shape.lineTo(points[i].x, -points[i].z);
  return new THREE.ShapeGeometry(shape).rotateX(-Math.PI / 2);
}

export function buildOsmLayers(data, projection) {
  const sourceContext = new THREE.Group(); sourceContext.name = 'osm-source-context';
  const roads = new THREE.Group(); roads.name = 'roads';
  const parks = new THREE.Group(); parks.name = 'parks';
  const rail = new THREE.Group(); rail.name = 'rail';
  const buildings = new THREE.Group(); buildings.name = 'osm-buildings';

  const roadGeos = [], railGeos = [], parkGeos = [], buildingGeos = [];
  let roadCount = 0, buildingCount = 0, parkCount = 0, railCount = 0;

  for (const el of data.elements || []) {
    if (el.type !== 'way' || !el.geometry?.length) continue;
    const pts = toPoints(el, projection);
    const tags = el.tags || {};
    if (tags.building && pts.length >= 4) {
      const area = polygonAreaXZ(pts);
      if (area < 20 || area > 50000) continue;
      const shape = new THREE.Shape();
      shape.moveTo(pts[0].x, -pts[0].z);
      for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i].x, -pts[i].z);
      const h = deterministicHeight(el);
      const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 1, steps: 1 });
      g.rotateX(-Math.PI / 2);
      buildingGeos.push(g);
      buildingCount++;
    } else if (tags.highway && pts.length >= 2) {
      roadGeos.push(lineRibbon(pts, roadWidth(tags), 0.22)); roadCount++;
    } else if (tags.railway && pts.length >= 2) {
      railGeos.push(lineRibbon(pts, 3.2, 0.34)); railCount++;
    } else if ((tags.leisure === 'park' || tags.leisure === 'garden' || tags.natural === 'water') && pts.length >= 3) {
      const g = polygonGeometry(pts); if (g) { parkGeos.push(g); parkCount++; }
    }
  }

  if (buildingGeos.length) {
    const merged = mergeGeometries(buildingGeos, false);
    const wire = new THREE.Mesh(merged, new THREE.MeshBasicMaterial({ color: 0x6f8189, wireframe: true, transparent: true, opacity: 0.16 }));
    sourceContext.add(wire);
    const mesh = new THREE.Mesh(merged, new THREE.MeshStandardMaterial({ color: 0xa5aaab, roughness: 0.92, metalness: 0.02 }));
    mesh.castShadow = true; mesh.receiveShadow = true; buildings.add(mesh);
  }
  if (roadGeos.length) {
    const mesh = new THREE.Mesh(mergeGeometries(roadGeos, false), new THREE.MeshStandardMaterial({ color: 0x45494b, roughness: 0.98 }));
    mesh.receiveShadow = true; roads.add(mesh);
  }
  if (railGeos.length) {
    rail.add(new THREE.Mesh(mergeGeometries(railGeos, false), new THREE.MeshStandardMaterial({ color: 0x6a5845, roughness: 0.9 })));
  }
  if (parkGeos.length) {
    parks.add(new THREE.Mesh(mergeGeometries(parkGeos, false), new THREE.MeshStandardMaterial({ color: 0x657d5c, roughness: 1, side: THREE.DoubleSide })));
  }

  return { sourceContext, roads, parks, rail, buildings, stats: { roadCount, buildingCount, parkCount, railCount } };
}

export function buildFallbackContext(projection) {
  const sourceContext = new THREE.Group(); sourceContext.name = 'osm-source-context';
  const roads = new THREE.Group(); roads.name = 'roads';
  const parks = new THREE.Group(); parks.name = 'parks';
  const rail = new THREE.Group(); rail.name = 'rail';
  const buildings = new THREE.Group(); buildings.name = 'osm-buildings';
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x4b5052, roughness: 1 });
  const contextGrid = new THREE.GridHelper(2200, 22, 0x647780, 0x647780);
  contextGrid.material.transparent = true; contextGrid.material.opacity = 0.16; contextGrid.position.y = 0.12;
  sourceContext.add(contextGrid);

  const routes = [
    [[36.8136,-1.2867],[36.8195,-1.2864],[36.8244,-1.2858],[36.8294,-1.2847]],
    [[36.8180,-1.2928],[36.8207,-1.2895],[36.8232,-1.2868],[36.8254,-1.2837],[36.8268,-1.2808]],
    [[36.8217,-1.2970],[36.8227,-1.2924],[36.8237,-1.2887],[36.8245,-1.2846],[36.8252,-1.2802]],
    [[36.8160,-1.2920],[36.8217,-1.2914],[36.8264,-1.2912],[36.8300,-1.2910]],
    [[36.8173,-1.2812],[36.8210,-1.2837],[36.8240,-1.2860],[36.8276,-1.2887]]
  ];
  for (const route of routes) {
    const pts = route.map(([lon,lat]) => projection.project(lon,lat));
    roads.add(new THREE.Mesh(lineRibbon(pts, 12, 0.25), roadMat));
  }

  const parkPolys = [
    [[36.8137,-1.2928],[36.8160,-1.2863],[36.8192,-1.2872],[36.8183,-1.2929]],
    [[36.8166,-1.2860],[36.8192,-1.2838],[36.8196,-1.2862],[36.8178,-1.2871]]
  ];
  for (const poly of parkPolys) {
    const g = polygonGeometry(poly.map(([lon,lat]) => projection.project(lon,lat)));
    if (g) parks.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x667c5f, roughness: 1, side: THREE.DoubleSide })));
  }

  const railRoute = [[36.817,-1.2962],[36.822,-1.2941],[36.8284,-1.2918],[36.832,-1.2920]];
  rail.add(new THREE.Mesh(lineRibbon(railRoute.map(([lon,lat])=>projection.project(lon,lat)), 3.2, 0.34), new THREE.MeshStandardMaterial({ color: 0x6b5949, roughness: 1 })));

  for (let ix = -5; ix <= 6; ix++) {
    for (let iz = -5; iz <= 5; iz++) {
      const x = ix * 155 + ((iz % 2) * 28);
      const z = iz * 155 + ((ix % 3) * 24);
      if (Math.hypot(x,z) < 110 || (x < -220 && z > 0)) continue;
      const h = 18 + ((Math.abs(ix*7 + iz*11) % 8) * 8);
      const m = new THREE.Mesh(new THREE.BoxGeometry(72, h, 58), new THREE.MeshStandardMaterial({ color: 0xa3a7a8, roughness: 0.95 }));
      m.position.set(x, h/2, z); m.castShadow = true; m.receiveShadow = true; buildings.add(m);
    }
  }
  return { sourceContext, roads, parks, rail, buildings, stats: { roadCount: routes.length, buildingCount: buildings.children.length, parkCount: parkPolys.length, railCount: 1 }, fallback: true };
}
