# Nairobi Digital Twin

A geographically credible, real-time 3D reconstruction of Nairobi CBD and its near skyline context.

## Current status

- **Phase 0 — Research & Ground Truth:** ✅ complete
- **Phase 1 — Geospatial Greybox:** 🚧 viewer implemented; live OSM ingestion + deterministic fallback, hero proxies, rail context, camera presets and milestone inspection are available. DEM terrain remains a scaffold until a redistributable terrain asset is committed.

## View the Phase 1 build

### Zero-install static mode

Serve the repository root with any static HTTP server. `index.html` contains a pinned import map for Three.js 0.185.1 and Proj4 2.22.0.

```bash
python -m http.server 8000
```

Open `http://localhost:8000`.

### Vite mode

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run check
npm run build
```

## What you can inspect right now

The viewer exposes **P1.1 through P1.10 as clickable implementation milestones**. Each button hides/shows the cumulative layers for that point in the build, and a bottom card explains exactly what should be visible.

See [`docs/VIEWABLE_MILESTONES.md`](docs/VIEWABLE_MILESTONES.md) for the visual acceptance outcome for every implementation step and every later phase.

## Live OSM behavior

On load, the viewer attempts to request CBD building/road/rail/park geometry from public Overpass endpoints. If those endpoints are unavailable or rate-limited, the viewer explicitly switches to a deterministic fallback context rather than silently pretending fallback geometry is sourced OSM data.

Public outputs using OSM must retain **© OpenStreetMap contributors** attribution and comply with ODbL.

## Coordinate system

- Ingest: EPSG:4326 (WGS84)
- Working CRS: EPSG:32737 (WGS84 / UTM zone 37S)
- Local origin: KICC
- Runtime: 1 unit = 1 metre
- East = +X, North = -Z, Up = +Y

## Technology baseline

- Three.js `0.185.1`
- Proj4 `2.22.0`
- Vite `8.2.2`
- ES modules
- WebGLRenderer baseline

Three.js 0.185.1 is the current npm release baseline used by this project as of the Phase 1 implementation date.

## Accuracy statement

This project targets **visually faithful, source-auditable geographic reconstruction**. It is not cadastral, engineering, navigation or survey-grade.

## Phase gate

Phase 2 detailed hero architecture should begin only after Phase 1 landmark ordering, skyline clusters, road/open-space relationships and camera views are reviewed.
