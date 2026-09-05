import fs from 'node:fs';

const read = p => JSON.parse(fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const manifest = read('data/source_manifest.json');
const cameras = read('data/camera_presets.json');
const geojson = read('data/landmarks.geojson');

const ids = new Set();
for (const lm of manifest.landmarks) {
  if (!lm.id || ids.has(lm.id)) throw new Error(`Invalid/duplicate landmark id: ${lm.id}`);
  ids.add(lm.id);
  for (const key of ['local_x_m','local_z_m','lat','lon']) if (!Number.isFinite(lm[key])) throw new Error(`${lm.id}: invalid ${key}`);
}
for (const c of cameras.presets) {
  for (const id of c.target_ids) if (!ids.has(id)) throw new Error(`Camera ${c.id}: missing target ${id}`);
}
if (geojson.type !== 'FeatureCollection' || geojson.features.length !== manifest.landmarks.length) throw new Error('GeoJSON landmark count mismatch');
console.log(`OK: ${ids.size} landmarks, ${cameras.presets.length} cameras, ${geojson.features.length} GeoJSON features`);
