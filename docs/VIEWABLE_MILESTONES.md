# Viewable Milestones — What You Can See at the End of Every Step

This document is a product-facing acceptance guide. A phase/step is not considered complete merely because code exists: there must be something concrete to inspect in the viewer.

## Phase 0 — Research & Ground Truth

**At the end you can view:** the audited landmark registry, map coordinates, camera viewpoints, source confidence, scene extents, technical architecture and explicit geographic guardrails. There is not yet a finished 3D city.

## Phase 1 — Geospatial Greybox

The Phase 1 viewer exposes each sub-step as a button so you can inspect cumulative progress.

| Step | Implementation | What you will be able to view |
|---|---|---|
| P1.1 | Project shell | A working full-screen Three.js viewer, Nairobi-toned horizon, metric grid and the KICC origin. |
| P1.2 | Projection | Landmark pins distributed around KICC in the correct metric coordinate relationships. |
| P1.3 | OSM context | Live OpenStreetMap-derived ways/buildings when Overpass responds; otherwise a clearly labelled fallback context. |
| P1.4 | Terrain | A broad relief scaffold underneath the city. **Not yet survey/DEM-grade** until the DEM dataset is committed. |
| P1.5 | Roads & parks | Major road surfaces and green/open areas so the CBD block structure becomes legible. |
| P1.6 | Building massing | The CBD as a dense 3D urban volume, using OSM height/levels where available and deterministic proxy heights otherwise. |
| P1.7 | Hero proxies | Recognizable greybox silhouettes for the main Nairobi anchors—especially KICC, Times Tower, Parliament, Bunge, City Hall, Teleposta, Holy Family, Britam and UAP. |
| P1.8 | Rail | Nairobi Railway Station context and the conventional/commuter rail corridor. You should **not** see an invented SGR mainline through CBD. |
| P1.9 | Cameras | Seven named viewpoints for civic core, Uhuru Park, KICC roof, railway edge, Times Tower, Upper Hill and Kenyatta Avenue checks. |
| P1.10 | Gate review | All Phase 1 layers together, with data counts and FPS readout. This is the exact view used to approve geography/silhouette before Phase 2. |

## Phase 2 — Hero Architecture

**At the end you will be able to view:** the principal landmarks no longer as generic proxies, but as architecture-specific models with the correct major façade divisions, roof/crown shapes, footprint orientation and recognizable proportions. From the validation cameras, KICC, Times Tower, Parliament/Bunge, City Hall, Teleposta and other priority buildings should be identifiable without labels.

## Phase 3 — Materials & Daylight

**At the end you will be able to view:** a convincing daytime Nairobi scene with PBR concrete/glass/metal, Nairobi daylight, accurate solar direction, proper shadows, sky/environment reflections and physically plausible tonal response. Screenshots should begin to feel photographic rather than like a CAD model.

## Phase 4 — Streetscape & Vegetation

**At the end you will be able to view:** sidewalks, medians, trees, streetlights, traffic lights, signage, park detail and street furniture at useful street/medium distances. Street-level cameras should no longer feel empty.

## Phase 5 — Urban Activity

**At the end you will be able to view:** moving cars, matatus, boda-bodas, pedestrians and commuter-rail activity. Density changes should be visible and the city should feel occupied rather than static.

## Phase 6 — Night, Weather & Water

**At the end you will be able to view:** day/night states, illuminated buildings and streets, vehicle lights, rain/wet-road response, atmospheric haze and improved water surfaces. You should be able to compare daylight, golden-hour, night and rain moods from the same camera.

## Phase 7 — Performance Pass

**At the end you will be able to view:** essentially the same visual richness as Phase 6, but with a diagnostics panel showing the optimized result—stable frame rate, reduced draw calls, LOD transitions, sector loading and quality presets. Performance gains should be observable rather than claimed.

## Phase 8 — UX & Polish

**At the end you will be able to view/use:** a product-quality interface with camera presets, landmark inspector, time/weather/activity controls, quality presets, source/credits panel, loading state and a guided tourist mode.

## Phase 9 — QA & Release

**At the end you will be able to view:** the final deployable Nairobi Digital Twin release, its acceptance checklist, known limitations, source/attribution information and reproducible release build. This is the version suitable for public sharing.
