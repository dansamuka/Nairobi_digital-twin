# Nairobi CBD Digital Twin — Master Implementation Contract

**Version:** 2.0 implementation contract  
**Baseline:** Nairobi, Kenya — September 2026  
**Primary stack:** Three.js + modern browser graphics APIs  
**Goal:** A geographically credible, immediately recognizable, photorealistic, real-time reconstruction of Nairobi CBD and its near skyline context.

This file is the repository execution contract derived from the full master specification. Phase-specific decisions and evidence live in `docs/` and `data/` and take precedence over unsourced assumptions.

---

## 1. Non-negotiable operating rules

1. **Research before modeling.** Verify identity, position, footprint, approximate height, orientation, façade character, roof profile and adjacent roads before promoting a landmark beyond proxy status.
2. **Never invent architectural detail to fill uncertainty.** Simplify and mark confidence instead.
3. **Never move landmarks for composition.** Composition adapts to Nairobi.
4. **Never generate the CBD as a random field of boxes.** Source-backed blocks/footprints define massing wherever practical.
5. **Do not claim survey-grade accuracy.** This is a visually faithful, auditable real-time reconstruction.
6. **Use physically plausible scale, optics, materials and lighting.** Avoid plastic/over-glossy/futuristic CG shorthand.
7. **Performance is a feature.** Unstable frame pacing, runaway memory or pathological draw-call counts fail the build.
8. **Use progressive enhancement.** Expensive effects must be independently degradable/disableable.
9. **Record provenance and confidence.** Every hero landmark belongs in `data/source_manifest.json`.
10. **Verified evidence beats this specification.** When evidence contradicts an assumption, fix the assumption and document the correction.

---

## 2. Definition of done

The final product must pass all of these:

- **Recognition:** a Nairobi-familiar viewer can identify the city from unlabeled reference views.
- **Landmark fidelity:** hero silhouette, proportions, orientation, crown/roof and façade rhythm are credible.
- **Geographic credibility:** KICC/City Square, Parliament, City Hall, Times Tower, Teleposta/Kencom, parks, railway and Upper Hill relationships are preserved.
- **Photoreal visual language:** no miniature, voxel, clay-model, low-poly or generic procedural-city appearance.
- **Performance:** desktop High preset targets 60 FPS average and ≥45 FPS 1% low at 1920×1080 on representative mid-range development/gaming hardware.
- **Interactivity:** camera, time, weather, quality, activity and layer controls remain responsive and deterministic.
- **Stability:** normal navigation does not exhibit persistent memory growth, recurring GC stutter or console errors.

---

## 3. Source hierarchy

Use roughly this priority order:

1. official Kenyan institutions / asset owners;
2. OpenStreetMap and other legally usable geospatial data;
3. Wikidata / reputable architecture databases for cross-checking;
4. recent legally usable street/aerial references;
5. satellite/aerial material used legally for reference only;
6. manual approximation only when necessary, explicitly marked.

Every runtime third-party asset must record source, author, licence, required attribution and redistribution permission. See `LICENSES_AND_ATTRIBUTION.md`.

Confidence states:

- `verified`
- `partially_verified`
- `proxy`

Never silently present a proxy as verified.

---

## 4. Corrected Nairobi guardrails

- **KICC** is a primary civic/CBD anchor.
- **Times Tower** is KRA headquarters on Haile Selassie Avenue; never call it Hass Towers or the Nairobi Securities Exchange building.
- **Parliament** is a precinct, and the 2026 skyline includes **Bunge Tower** where visible.
- **Britam Tower** and **UAP Old Mutual Tower** are Upper Hill skyline context; never relocate them into central CBD blocks.
- **Nairobi Railway Station** anchors the CBD conventional/commuter rail context. Do not depict the SGR mainline as running through the CBD.
- Do not invent an operational Nairobi BRT system for the baseline date.
- Do not place monuments at aesthetically convenient but false locations.
- If informal-settlement fabric appears in wide views, represent it neutrally from verified land-use/massing evidence, not caricature textures.
- Treat the former Nairobi Hilton as a 2026 site requiring current-use verification, not automatically as an operating Hilton.
- KCB-building identity/form assumptions require independent source validation before hero promotion.

---

## 5. Spatial architecture

Use the values in `data/scene_config.json`.

### Tier A — CBD Hero Zone
Highest-detail civic/commercial core, major avenues, landmark clusters, parks and station edge.

### Tier B — Near Context
Medium-detail Upper Hill, rail approaches, river/Ngara edge, Museum/University context and surrounding mixed-use fabric.

### Tier C — Horizon
Low-detail terrain and skyline silhouettes, including Ngong Hills only where directionally correct.

### Coordinate contract

- ingestion: WGS84 / EPSG:4326;
- working CRS: WGS84 / UTM Zone 37S / EPSG:32737;
- local origin: KICC;
- one world unit = one metre;
- East = +X;
- North = -Z;
- Up = +Y.

Scene code consumes local metres. Do not scatter latitude/longitude arithmetic throughout rendering modules.

---

## 6. Geometry and architecture strategy

### Hero landmarks
Author validated models in dedicated GLB/glTF assets. Preserve silhouette and key proportion before micro-detail.

### Secondary buildings
Use source-backed footprints plus a curated architectural kit and deterministic façade rules. Do not use one universal box-building generator.

### Roofs
Include source-backed or credible utility massing such as service rooms, tanks, antennas and mechanical equipment, but never invent highly visible landmark-specific crown geometry.

### LOD
Every expensive hero/filler asset must be authored with distance/screen-space reduction in mind. Horizon geometry must never retain near-camera polygon density.

---

## 7. Materials, lighting and atmosphere

- Use `MeshStandardMaterial` / `MeshPhysicalMaterial` or equivalent PBR workflows.
- Prefer atlases/trim sheets and KTX2/Basis compression.
- Concrete, stone, asphalt, metal, glass, vegetation and water must differ materially in roughness/normal/reflection response.
- Avoid universally clean façades; add restrained real-world variation.
- Use PMREM/environment lighting; do not update full-scene cube reflections every frame.
- Drive sun from Nairobi latitude/date/time rather than a generic orbit.
- Use filmic/ACES-compatible tone mapping and correct sRGB output.
- Bloom is selective and primarily for emissive night content.
- Haze/fog must be physically restrained and must never hide bad geography.

---

## 8. Dynamic city systems

Later phases may add:

- graph/path-based cars, matatus and motorcycles;
- ordinary buses unless a specific verified BRT service is introduced;
- commuter rail where source-backed;
- instanced/pooled pedestrians constrained to walkable areas;
- time-linked activity density;
- weather/rain/wetness;
- night window occupancy;
- park/water activity where source-backed.

No dynamic system may visibly route traffic through buildings, parks or non-drivable surfaces in normal views.

---

## 9. Renderer and performance

Repository baseline:

- Three.js `0.185.1` / r185 series;
- `WebGLRenderer` as deterministic production baseline;
- WebGL2-capable desktop browsers as primary target;
- static hosting/deployment;
- GLB/glTF 2.0;
- Meshopt preferred, Draco supported where useful;
- KTX2/Basis textures;
- centralized quality manager;
- sector/progressive loading.

Desktop High budget is defined in `docs/PHASE_0_GROUND_TRUTH.md`; do not claim 60 FPS without measurement.

Quality presets must control at least pixel ratio, shadows, post effects, vegetation/activity density, reflection quality, LOD and sector preload radius. `Auto` uses frame-time hysteresis and must not oscillate continuously.

---

## 10. Reference views and QA

`data/camera_presets.json` is the first regression-view set. Every phase that changes visible geometry must review at least the civic-core, Uhuru Park, Railway Forecourt and Upper Hill viewpoints.

Validate:

- skyline silhouette;
- landmark ordering/relative height;
- road direction;
- park/road/rail relationships;
- dominant façade character;
- horizon profile;
- no duplicated hero buildings;
- no hero/road intersections;
- no floating parks/rail/terrain;
- correct north/east relationships.

Rendering QA eventually covers sunrise, midday, golden hour, night, rain, fog, all quality presets, window resize/high DPI, tab restore and context-loss resilience where feasible.

---

## 11. Phased implementation

### Phase 0 — Research and ground truth
Deliver source-backed scene extent, projection, landmark manifest, corrected assumptions, source plan, camera views, architecture and performance budget.

**Status:** completed in `docs/PHASE_0_GROUND_TRUTH.md`.

### Phase 1 — Geospatial greybox
Terrain, real roads/parks/rail, source-backed building extrusions, hero proxy massing and initial cameras. Neutral materials are acceptable.

**Gate:** the map and skyline must already resemble Nairobi in silhouette.

### Phase 2 — Hero architecture
Replace proxies with validated high-fidelity hero assets.

**Gate:** landmark ordering, relative height and silhouette pass review.

### Phase 3 — Materials and daylight
PBR façade system, sky/solar calculation, daylight shadows, environment reflections, color management and initial AO/AA.

### Phase 4 — Streetscape and vegetation
Sidewalks, medians, trees, streetlights, traffic lights, benches, signage, rail/park detail and restrained clutter.

### Phase 5 — Urban activity
Traffic graph, vehicles, matatus, motorcycles, pedestrians and verified commuter rail/time-linked activity.

### Phase 6 — Night, weather and water
Night windows, street/vehicle lighting, rain, wet roads, fog/haze presets, improved water and selective bloom.

### Phase 7 — Performance pass
Profile/optimize LOD, draw calls, texture memory, sectors, shadows, post effects, crowds, traffic and dynamic resolution.

### Phase 8 — UX and polish
Camera presets, inspector, tourist mode, quality controls, source/credits, loading UI and supported fallbacks.

### Phase 9 — QA and release
Run acceptance tests, fix regressions, document limitations and produce static deployment build.

---

## 12. Final acceptance tests

The release must pass:

- **Recognition:** ≥3 unlabeled views recognizably Nairobi.
- **Landmarks:** KICC, Times Tower, Parliament clock tower, City Hall, Teleposta/Kencom context and relevant Upper Hill towers are spatially credible.
- **Geography:** major roads, parks and railway match source-backed structure with no gross placement errors.
- **Lighting:** midday/golden-hour/night exposures remain believable.
- **Materials:** key surface classes visibly differ in physical response.
- **Activity:** traffic/pedestrians stay on valid paths.
- **Performance:** High remains near target; Auto can recover frame time under load.
- **Stability:** 15-minute interactive session shows no runaway allocations.
- **Build:** fresh install/build serves with documented commands and no hidden local dependencies.

---

## 13. Explicit prohibitions

Do not:

- generate a random skyline and label it Nairobi;
- call Times Tower Hass Towers/NSE;
- move Britam/UAP into the CBD;
- run SGR mainline through CBD;
- place monuments falsely;
- invent active BRT operations;
- use simple cubes for all filler buildings;
- make every façade pristine/reflective;
- use cyberpunk/neon shorthand for modern Nairobi;
- caricature informal settlements;
- redistribute copyrighted map/3D geometry without permission;
- update full-scene cube reflections every frame;
- create thousands of dynamic point lights;
- ship uncompressed 4K textures everywhere;
- retain near-camera geometry at horizon distance;
- hide poor geometry under fog/bloom/DOF;
- claim performance or photoreal accuracy without validation.

---

## 14. Phase reporting contract

At the end of every phase:

1. summarize implementation;
2. list files changed;
3. report what was source-verified;
4. identify proxies/approximations;
5. report performance metrics once rendering exists;
6. run relevant checks;
7. fix deterministic failures before progressing;
8. preserve validated work rather than unnecessarily rewriting it.

When trade-offs are required:

- correct geography > more geometry;
- stable frame time > more effects;
- verified simplification > invented detail;
- fewer excellent hero assets > many mediocre ones;
- maintainable production pipeline > giant single-file demo.

The result must feel like **Nairobi observed carefully and reconstructed intentionally**, not a generic procedural city with Nairobi labels applied afterward.

---

## 15. Current execution gate

Phase 0 is complete and internally consistent enough to authorize **Phase 1 only**. The exact next work packages and exit criteria are in `docs/PHASE_1_PLAN.md`.

Do not begin detailed Phase 2 hero façades until the Phase 1 geospatial greybox passes its skyline/geography gate.
