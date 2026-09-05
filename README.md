# Nairobi Digital Twin

A geographically credible, real-time 3D reconstruction of Nairobi CBD and its near skyline context.

## Current status

**Phase 0 — Research and ground truth: complete.**

The repository is intentionally phase-gated. Detailed Three.js modeling starts only after the geospatial basis is internally consistent.

Start here:

- `MASTER_IMPLEMENTATION_PROMPT.md` — full build specification
- `docs/PHASE_0_GROUND_TRUTH.md` — completed Phase 0 decisions
- `data/source_manifest.json` — landmark source of truth
- `data/landmarks.geojson` — WGS84 landmark points
- `data/scene_config.json` — projection and scene extents
- `data/camera_presets.json` — visual validation viewpoints
- `docs/PHASE_1_PLAN.md` — exact next implementation plan
- `LICENSES_AND_ATTRIBUTION.md` — source/licence rules

## Coordinate system

- Ingest: EPSG:4326 (WGS84)
- Working CRS: EPSG:32737 (WGS84 / UTM zone 37S)
- Local origin: KICC
- Runtime: 1 unit = 1 metre
- East = +X, North = -Z, Up = +Y

## Planned renderer baseline

Three.js `0.185.1` (r185 series), WebGLRenderer baseline, static deployment.

## Accuracy statement

This project targets **visually faithful, source-auditable geographic reconstruction**. It is not a cadastral, engineering, navigation or survey-grade digital twin.

## Phase gate

Next: **Phase 1 — geospatial greybox**.

Do not begin detailed hero façades until Phase 1 passes skyline, block-layout and camera-view validation.
