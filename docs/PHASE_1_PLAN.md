# Phase 1 — Exact Implementation Plan

## Objective

Create a neutral-material geospatial greybox whose silhouette and city-block relationships already read as Nairobi before any detailed façade work begins.

## Work packages

### P1.1 Project bootstrap
- Add Vite + Three.js `0.185.1`.
- Implement modular app/scene structure.
- Add loading/error UI and diagnostic toggle.
- Pin dependency versions.

**Exit:** blank Three.js scene builds locally and as static production output without console errors.

### P1.2 Projection
- Implement EPSG:4326 → local-metre transform using the Phase 0 KICC origin.
- Unit-test known landmark transforms against `data/source_manifest.json`.
- Centralize axis convention.

**Exit:** all landmark local coordinates reproduce the manifest within tolerance.

### P1.3 OSM ingest
- Fetch a bounded Tier A/B extract via Overpass/export workflow.
- Preserve OSM IDs/tags.
- Normalize into build-time GeoJSON for roads, buildings, parks, rail and waterways.
- Store attribution and extraction timestamp.

**Exit:** source layer counts and geometry bounds pass validation.

### P1.4 Terrain
- Ingest legal DEM source.
- Reproject/crop to Tier B.
- Build low-resolution Three.js terrain mesh.
- Fit local base elevation so KICC origin is near Y=0 while retaining broad relief.

**Exit:** no exaggerated CBD terrain and no geometry/ground z-fighting.

### P1.5 Roads and parks
- Generate neutral road surfaces from centerlines/areas.
- Preserve street hierarchy and major medians.
- Add Uhuru Park/Central Park ground zones and water placeholders where source-backed.

**Exit:** major CBD corridors and parks are recognizable in top-down view.

### P1.6 Building massing
- Extrude source-backed footprints.
- Use OSM height/levels when credible.
- Apply conservative rule-based fallbacks with a `proxy_height` flag.
- Do not randomize heights inside the Hero Zone.

**Exit:** block structure is credible and deterministic.

### P1.7 Hero proxy massing
Create silhouette proxies for:
- KICC;
- Times Tower;
- Parliament;
- Bunge Tower;
- City Hall;
- Supreme Court;
- Teleposta;
- KENCOM;
- Nyayo House;
- National Archives;
- Railway Station;
- Holy Family;
- Afya Centre;
- Britam Tower;
- UAP Old Mutual Tower.

These proxies may be simplified, but must preserve source position, approximate height, principal footprint and key silhouette breaks.

**Exit:** Nairobi recognition test passes from at least four Phase 0 viewpoints.

### P1.8 Rail
- Ingest conventional/commuter rail alignments.
- Model Nairobi Railway Station edge and track corridor.
- Explicitly prevent SGR mainline geometry from entering Tier A/B.

**Exit:** railway context is geographically credible.

### P1.9 Cameras
- Implement all Phase 0 camera presets.
- Add orbit/fly controls with safe near/far planes.
- Save deterministic screenshot viewpoints for regression review.

**Exit:** all seven camera presets load without clipping/floating-origin artefacts.

### P1.10 Gate review
Review:
- silhouette;
- landmark ordering;
- Upper Hill/CBD separation;
- road/park relationships;
- station/rail relationship;
- top-down geography.

Do not begin Phase 2 hero detailing until obvious placement errors are resolved.

## Phase 1 automated checks

- `npm run build`
- manifest schema validation
- GeoJSON schema/basic topology validation
- known-coordinate transform tests
- missing target IDs in cameras
- duplicate landmark IDs
- invalid/negative building heights
- scene bootstrap smoke test

## Phase 1 visual acceptance

From the Uhuru Park, City Square, Railway Forecourt and Upper Hill cameras:
- KICC appears in the correct relative cluster;
- Times Tower sits southeast of the civic core;
- Parliament/Bunge remain west/southwest of KICC;
- National Archives/Afya anchor the eastern CBD;
- Britam/UAP remain in Upper Hill rather than the CBD core;
- railway/station geometry is south/east of the CBD core;
- parks remain open space, not filled with generated buildings.
