# Technical Architecture

## Baseline stack

- Three.js `0.185.1`
- ES modules
- Vite for development/build
- Static deployment target
- WebGLRenderer production baseline
- GLB/glTF 2.0 asset format
- KTX2/Basis textures
- Meshopt preferred; Draco supported where beneficial
- Proj4-compatible preprocessing or precomputed EPSG:32737 coordinates
- GeoJSON/JSON source data

## Architectural principles

1. **Geography is data, not scene code.**
2. **One projection boundary.** WGS84 is converted to EPSG:32737/local metres by one module.
3. **One metre = one Three.js unit.**
4. **Sector loading from the start.**
5. **All repeated objects are candidates for batching/instancing.**
6. **Quality settings are centralized.**
7. **No monolithic `main.js`.**
8. **Hero assets carry fidelity/source metadata at runtime.**
9. **Every expensive visual feature can be disabled independently.**
10. **The production build must remain static-hostable.**

## Proposed source modules

```text
src/
  main.js
  app/App.js
  scene/
    createRenderer.js
    createScene.js
    createCamera.js
    lighting.js
    atmosphere.js
    postprocessing.js
  geo/
    projection.js
    loadGeoJSON.js
    terrain.js
    roads.js
    buildings.js
    parks.js
    rail.js
  landmarks/
    landmarkRegistry.js
    createProxyLandmark.js
  data/
    loaders.js
    validateManifest.js
  ui/
    controls.js
    inspector.js
    loading.js
  perf/
    qualityManager.js
    diagnostics.js
    sectorManager.js
  utils/
    dispose.js
    math.js
```

## Coordinate contract

Runtime scene code receives:

```js
{
  x: eastMetresFromKICC,
  y: metresAboveLocalGround,
  z: -northMetresFromKICC
}
```

Raw WGS84 coordinates must not leak into rendering modules.

## Scene sectors

Phase 1 divides Tier A/B into square sectors, initially 400–500 m wide. Each sector owns:

- secondary building massing;
- street furniture placeholders;
- vegetation placeholders;
- local road meshes;
- optional higher-detail data.

Hero landmarks remain separately addressable so they are not accidentally unloaded when they dominate a view from an adjacent sector.

## Quality-manager contract

Quality settings control, at minimum:

- render pixel ratio;
- shadow map size/distance;
- post-processing;
- vegetation density/LOD;
- traffic/pedestrian density;
- reflection quality;
- far-building LOD thresholds;
- sector preload radius.

`Auto` uses a moving frame-time average with hysteresis; it must not oscillate settings continuously.

## Loading contract

Progressive order:

1. renderer + UI shell;
2. ground/terrain;
3. major roads/parks/rail;
4. Tier A building massing;
5. hero proxies;
6. Tier B massing;
7. vegetation/streetscape;
8. authored hero assets;
9. dynamic systems.

## Testing approach

Phase 1 should include deterministic checks for:

- valid JSON/GeoJSON;
- all required landmark IDs;
- coordinate conversion consistency;
- no NaN geometry;
- non-zero road/building counts;
- camera preset targets existing;
- stable scene bootstrap with missing optional assets.
