# Nairobi Digital Twin

A source-auditable, real-time 3D reconstruction of Nairobi CBD and its near skyline context, built with Three.js.

## Status

**v1.0 implementation complete through Phase 9.**

The viewer is cumulative and phase-switchable: choose P1–P9 in the left panel to see exactly what each phase adds.

| Phase | Status | What becomes viewable |
|---|---|---|
| P0 | ✅ | Ground-truth registry, projection, source confidence, camera plan and technical architecture. |
| P1 | ✅ | Geospatial greybox: OSM context, roads, parks, rail, terrain scaffold and source-positioned landmark proxies. |
| P2 | ✅ | Architecture-specific neutral landmark models for the principal Nairobi anchors. |
| P3 | ✅ | PBR materials, Nairobi daylight/solar path, atmospheric sky, shadows and environment lighting. |
| P4 | ✅ | Trees, streetlights, benches, civic flags, park detail and Uhuru Park water. |
| P5 | ✅ | Moving cars, matatus, boda-bodas, pedestrians and commuter rail. |
| P6 | ✅ | Night lighting, emissive windows, rain, haze, wet-road response and bloom. |
| P7 | ✅ | Low/Medium/High/Ultra/Auto quality controls and live renderer diagnostics. |
| P8 | ✅ | Landmark inspector, guided camera tour, camera presets and full product controls. |
| P9 | ✅ | Release/QA state, documented caveats, source attribution and reproducible build pipeline. |

## Run

### Zero-install static mode

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

### Vite

```bash
npm install
npm run dev
```

Validation:

```bash
npm run check
npm run build
```

## Viewer controls

- **P1–P9** — inspect the project cumulatively by implementation phase.
- **Time** — 0–24 h solar/day-night control from P3 onward.
- **Weather** — Clear / Haze / Rain from P6 onward.
- **Activity** — traffic and pedestrian density from P5 onward.
- **Quality** — Auto / Low / Medium / High / Ultra from P7 onward.
- **Landmark labels** — toggle source-labelled anchors.
- **Camera validation** — seven fixed geographic views.
- **Tour** — guided camera cycle from P8 onward.
- **Landmark inspector** — in P8/P9 click a detailed landmark to inspect source-confidence metadata.

## Geographic contract

- Ingest: **EPSG:4326** (WGS84)
- Working CRS: **EPSG:32737** (WGS84 / UTM zone 37S)
- Local origin: **KICC**
- Runtime: **1 Three.js unit = 1 metre**
- East = +X, North = -Z, Up = +Y

The app attempts live OpenStreetMap/Overpass geometry first. If public Overpass endpoints are rate-limited or unreachable, it visibly switches to a deterministic fallback rather than presenting fallback geometry as sourced OSM data.

## Technology

- Three.js `0.185.1`
- Proj4 `2.22.0`
- Vite `8.2.2`
- WebGLRenderer + EffectComposer/UnrealBloomPass
- Sky.js atmospheric sky
- InstancedMesh for repeated trees, lamps, vehicles and pedestrians

## Important accuracy note

This is a **visual/geographic digital-twin baseline**, not a cadastral, engineering, survey, traffic-engineering, or photogrammetry product. Landmark placement is source-auditable, but several façade details, secondary-building heights, activity patterns and the current broad terrain surface are controlled visual approximations where authoritative open data is unavailable.

See:

- [`docs/VIEWABLE_MILESTONES.md`](docs/VIEWABLE_MILESTONES.md)
- [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md)
- [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md)
- [`LICENSES_AND_ATTRIBUTION.md`](LICENSES_AND_ATTRIBUTION.md)
