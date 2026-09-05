# Implementation Status — v1.0

## Completed

### P0 — Ground truth
- KICC-origin UTM 37S local-metre coordinate contract.
- Source manifest with confidence fields.
- 18 landmark anchors.
- Seven validation cameras.
- OSM/Copernicus/source licensing plan and geographic guardrails.

### P1 — Greybox
- Static WebGL viewer.
- Live Overpass fetch with two endpoints and timeout/fallback behavior.
- OSM building extrusion, road ribbons, parks/water and rail.
- Deterministic fallback city context.
- Terrain relief scaffold.
- Grey landmark proxies.

### P2 — Architecture
- Architecture-specific procedural hero models for KICC, Times Tower, Parliament, Bunge Tower, City Hall, Supreme Court, Teleposta, Holy Family, Britam, UAP, National Archives and Nairobi Railway Station.
- Distinct tower defaults for remaining audited anchors.
- Rooftop service details where appropriate.

### P3 — Daylight/PBR
- MeshStandard/Physical materials.
- Glass roughness/reflectivity response.
- Sky.js atmosphere.
- NOAA-style solar approximation for Nairobi/EAT on the 2026 baseline date.
- ACES filmic tone mapping and sRGB output.
- Directional sun shadows and environment map.

### P4 — Streetscape
- Instanced vegetation.
- Instanced streetlights.
- Park benches and civic flag elements.
- Uhuru Park water surface.

### P5 — Activity
- Moving cars, matatus and boda-bodas.
- Instanced pedestrian movement.
- Moving commuter-rail consist.
- User density control.

### P6 — Weather/night
- Night state from solar elevation.
- Emissive landmark windows and street lamps.
- Clear/haze/rain atmosphere.
- Rain particle system.
- Wet-road material response.
- UnrealBloom post-processing on supported presets.

### P7 — Performance
- Auto/Low/Medium/High/Ultra preset system.
- DPR, shadow size, far plane, crowd/activity and streetscape scaling.
- Auto-quality hysteresis.
- FPS/draw-call/triangle/memory diagnostics API.

### P8 — UX
- Phase switcher.
- Seven geographic cameras with smooth motion.
- Guided tour.
- Landmark source/confidence inspector.
- Time/weather/activity/quality/labels controls.
- Responsive desktop/mobile UI.

### P9 — QA/release
- Version bumped to 1.0.0.
- Data validation + JS syntax validation + Vite production build in CI.
- Explicit accuracy statement and source attribution.
- Viewable milestone acceptance document.

## Deliberately bounded / not misrepresented as authoritative

The following are visually useful approximations rather than authoritative datasets, and remain labelled/documented as such:

- broad terrain relief (not a committed survey-grade DEM mesh);
- secondary-building fallback heights when OSM has no height/level data;
- procedural façade details on hero models where open architectural drawings are unavailable;
- activity routing/density (simulation, not measured traffic counts);
- weather controls (scenario controls, not live meteorology);
- trees/street furniture placement (representative, not a complete municipal asset inventory).

These limitations do **not** break the v1 product; they define the boundary between a public visual digital twin and an engineering/photogrammetry twin.
